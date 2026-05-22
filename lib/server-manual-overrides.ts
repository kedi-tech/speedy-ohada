import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { ManualOverride, ReportLine, ReportType } from '@/lib/engine/types';

type DbManualOverride = Awaited<ReturnType<PrismaClient['manualOverride']['findMany']>>[number];

export function dbManualOverrideToEngine(override: DbManualOverride): ManualOverride {
  return {
    id: override.id,
    organization_id: override.organizationId ?? '',
    company_id: override.companyId,
    fiscal_year_id: override.fiscalYearId,
    report_type: override.reportType as ReportType,
    report_line_code: override.reportLineCode,
    original_value: override.originalValue ?? null,
    new_value: override.newValue,
    difference: override.difference,
    reason: override.reason,
    created_by: override.createdById ?? 'unknown',
    created_at: override.createdAt.toISOString(),
    approval_status: override.status as ManualOverride['approval_status'],
    approved_by: override.approvedById ?? undefined,
    approved_at: override.approvedAt?.toISOString(),
  };
}

export async function getActiveManualOverrides(prisma: PrismaClient, fiscalYearId: string) {
  const overrides = await prisma.manualOverride.findMany({
    where: {
      fiscalYearId,
      status: { in: ['approved', 'auto_approved'] },
    },
    orderBy: { createdAt: 'asc' },
  });

  return overrides.map(dbManualOverrideToEngine);
}

export function findLineInCalculationPayload(
  payload: unknown,
  reportType: string,
  lineCode: string,
): ReportLine | null {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = payload as { lines?: unknown };
  if (!Array.isArray(candidate.lines)) return null;
  return (candidate.lines as ReportLine[]).find((line) =>
    line.report_type === reportType && line.line_code === lineCode
  ) ?? null;
}
