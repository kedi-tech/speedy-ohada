import type { PrismaClient } from '@/lib/generated/prisma/client';
import { prepareExport } from '@/lib/engine/ExportPreparationEngine';
import type { ReportVersionRecord, VersionStatus } from '@/lib/engine/types';
import type { ServerSessionUser } from '@/lib/server-session';

export const REVIEW_SECTION_KEYS = ['balance', 'statements', 'notes', 'tax', 'validation'];

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));

function versionStatus(status: string): VersionStatus {
  if (['draft', 'under_review', 'approved', 'exported', 'locked', 'archived'].includes(status)) {
    return status as VersionStatus;
  }
  return 'draft';
}

function validationSummary(run: {
  validation: unknown;
  totalCritical: number;
  totalWarnings: number;
  canExport: boolean;
}) {
  return {
    total_critical: run.totalCritical,
    total_warnings: run.totalWarnings,
    can_export: run.canExport,
    validation: run.validation,
  };
}

export async function getLatestCalculationRun(prisma: PrismaClient, fiscalYearId: string) {
  return prisma.calculationRun.findFirst({
    where: { fiscalYearId },
    include: { company: true, fiscalYear: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrCreateReportVersion(
  prisma: PrismaClient,
  params: {
    fiscalYearId: string;
    session: ServerSessionUser;
    status?: VersionStatus;
    changeSummary?: string;
  },
) {
  const run = await getLatestCalculationRun(prisma, params.fiscalYearId);
  if (!run) return { error: 'Run calculations before starting review or export' as const, status: 400 as const };

  const existing = await prisma.reportVersion.findFirst({
    where: {
      fiscalYearId: params.fiscalYearId,
      calculationRunId: run.id,
      status: { in: ['draft', 'under_review', 'approved', 'exported', 'locked'] },
    },
    include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
    orderBy: { versionNumber: 'desc' },
  });
  if (existing) return { version: existing, run };

  const latest = await prisma.reportVersion.findFirst({
    where: { fiscalYearId: params.fiscalYearId },
    orderBy: { versionNumber: 'desc' },
  });

  const version = await prisma.reportVersion.create({
    data: {
      organizationId: run.organizationId,
      companyId: run.companyId,
      fiscalYearId: run.fiscalYearId,
      calculationRunId: run.id,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      status: params.status ?? 'draft',
      generatedById: params.session.id,
      validationSummary: asJson(validationSummary(run)),
      changeSummary: params.changeSummary ?? 'Generated from latest calculation run',
    },
    include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
  });

  return { version, run };
}

export function toReportVersionRecord(version: {
  id: string;
  fiscalYearId: string;
  companyId: string;
  organizationId: string | null;
  versionNumber: number;
  status: string;
  generatedById: string | null;
  createdAt: Date;
  calculationRunId: string;
  validationSummary: unknown;
  changeSummary: string;
  isLocked: boolean;
  lockedById: string | null;
  lockedAt: Date | null;
  unlockReason: string | null;
}): ReportVersionRecord {
  return {
    report_version_id: version.id,
    fiscal_year_id: version.fiscalYearId,
    company_id: version.companyId,
    organization_id: version.organizationId ?? '',
    version_number: version.versionNumber,
    status: versionStatus(version.status),
    generated_by: version.generatedById ?? '',
    generated_at: version.createdAt.toISOString(),
    calculation_run_id: version.calculationRunId,
    validation_summary: JSON.stringify(version.validationSummary ?? {}),
    change_summary: version.changeSummary,
    is_locked: version.isLocked,
    locked_by: version.lockedById ?? undefined,
    locked_at: version.lockedAt?.toISOString(),
    unlock_reason: version.unlockReason ?? undefined,
  };
}

export function serializeVersion(version: {
  id: string;
  versionNumber: number;
  status: string;
  isLocked: boolean;
  lockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  calculationRunId: string;
  validationSummary?: unknown;
  changeSummary?: string;
  reviewApprovals?: Array<{ sectionKey: string; status: string; reviewerName: string | null; comment: string | null; approvedAt: Date | null; updatedAt?: Date }>;
  exportRecords?: Array<{ id: string; format: string; fileName: string; status: string; createdAt: Date }>;
}) {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    isLocked: version.isLocked,
    lockedAt: version.lockedAt?.toISOString() ?? null,
    createdAt: version.createdAt.toISOString(),
    updatedAt: version.updatedAt.toISOString(),
    calculationRunId: version.calculationRunId,
    validationSummary: version.validationSummary ?? null,
    changeSummary: version.changeSummary ?? '',
    reviewApprovals: (version.reviewApprovals ?? []).map((approval) => ({
      sectionKey: approval.sectionKey,
      status: approval.status,
      reviewerName: approval.reviewerName,
      comment: approval.comment,
      approvedAt: approval.approvedAt?.toISOString() ?? null,
      updatedAt: approval.updatedAt?.toISOString() ?? null,
    })),
    exportRecords: (version.exportRecords ?? []).map((record) => ({
      id: record.id,
      format: record.format,
      fileName: record.fileName,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
    })),
  };
}

export function compareRuns(current: {
  id: string;
  createdAt: Date;
  totalCritical: number;
  totalWarnings: number;
  canExport: boolean;
  snapshot: unknown;
}, previous?: {
  id: string;
  createdAt: Date;
  totalCritical: number;
  totalWarnings: number;
  canExport: boolean;
  snapshot: unknown;
} | null) {
  const currentSnapshot = current.snapshot as { total_actif_N?: number; total_passif_N?: number; net_result?: number };
  const previousSnapshot = previous?.snapshot as { total_actif_N?: number; total_passif_N?: number; net_result?: number } | undefined;
  return {
    currentRunId: current.id,
    previousRunId: previous?.id ?? null,
    currentCreatedAt: current.createdAt.toISOString(),
    previousCreatedAt: previous?.createdAt.toISOString() ?? null,
    criticalDelta: previous ? current.totalCritical - previous.totalCritical : null,
    warningDelta: previous ? current.totalWarnings - previous.totalWarnings : null,
    canExportChanged: previous ? current.canExport !== previous.canExport : false,
    totalActifDelta: previousSnapshot ? (currentSnapshot.total_actif_N ?? 0) - (previousSnapshot.total_actif_N ?? 0) : null,
    totalPassifDelta: previousSnapshot ? (currentSnapshot.total_passif_N ?? 0) - (previousSnapshot.total_passif_N ?? 0) : null,
    netResultDelta: previousSnapshot ? (currentSnapshot.net_result ?? 0) - (previousSnapshot.net_result ?? 0) : null,
  };
}

export function buildExportArtifact(params: {
  run: Awaited<ReturnType<typeof getLatestCalculationRun>> extends infer T ? NonNullable<T> : never;
  version: ReturnType<typeof toReportVersionRecord>;
  includeTraceability: boolean;
}) {
  const run = params.run;
  return prepareExport({
    validation: run.validation as never,
    version: params.version,
    snapshot: run.snapshot as never,
    actif: run.actif as never,
    passif: run.passif as never,
    incomeStatement: run.incomeStatement as never,
    cashFlow: run.cashFlow as never,
    notes: run.notes as never,
    expenseDetails: run.expenseDetails as never,
    fiscal: run.fiscal as never,
    traceability: run.traceability as never,
    company_name: run.company.name,
    fiscal_year_label: run.fiscalYear.label,
    currency_code: run.fiscalYear.currency,
    include_traceability: params.includeTraceability,
  });
}

export function exportMimeType(format: string) {
  if (format === 'excel') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (format === 'zip') return 'application/zip';
  return 'application/pdf';
}
