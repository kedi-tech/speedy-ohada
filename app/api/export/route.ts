import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runAndPersistCalculation } from '@/lib/server-calculations';
import {
  buildExportPdfBuffer,
  buildExportWorkbookBuffer,
  buildZipBuffer,
} from '@/lib/server-export-renderers';
import { getServerSessionUser } from '@/lib/server-session';
import {
  buildExportArtifact,
  exportMimeType,
  getLatestCalculationRun,
  getOrCreateReportVersion,
  serializeVersion,
  toReportVersionRecord,
} from '@/lib/server-report-workflow';

function computeChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

const DOCUMENTS = [
  { key: 'statements', fr: 'Etats financiers SYSCOHADA', en: 'SYSCOHADA financial statements', pages: 7 },
  { key: 'actif', fr: 'Bilan actif', en: 'Assets statement', pages: 1 },
  { key: 'passif', fr: 'Bilan passif', en: 'Liabilities and equity statement', pages: 1 },
  { key: 'income_statement', fr: 'Compte de resultat', en: 'Income Statement', pages: 2 },
  { key: 'cash_flow', fr: 'Tableau de flux de tresorerie', en: 'Cash Flow Statement', pages: 1 },
  { key: 'notes', fr: 'Notes annexes', en: 'Annex Notes', pages: 24 },
  { key: 'expense_details', fr: 'Detail des charges', en: 'Expense detail schedules', pages: 8 },
  { key: 'fiscal_forms', fr: 'Liasse fiscale', en: 'Tax schedules', pages: 8 },
  { key: 'dgi', fr: 'Declarations DGI', en: 'DGI declarations', pages: 5 },
  { key: 'patente', fr: 'Patente', en: 'Business license tax', pages: 1 },
  { key: 'honoraires', fr: 'Honoraires', en: 'Fees declaration', pages: 1 },
  { key: 'review_pack', fr: 'Dossier de revue', en: 'Review pack', pages: 4 },
  { key: 'validation', fr: 'Rapport de validation', en: 'Validation Report', pages: 3 },
  { key: 'traceability', fr: 'Traceabilite', en: 'Traceability', pages: 3 },
];

const DOCUMENT_KEYS = new Set(DOCUMENTS.map((document) => document.key));

function readinessItems(params: {
  canExport: boolean;
  totalCritical: number;
  totalWarnings: number;
  reviewApproved: boolean;
}) {
  return DOCUMENTS.map((document) => {
    let status: 'ready' | 'warning' | 'critical' = 'ready';
    let descFr = 'Pret pour export';
    let descEn = 'Ready for export';

    if (!params.reviewApproved) {
      status = 'critical';
      descFr = 'Revision non approuvee';
      descEn = 'Review not approved';
    } else if (!params.canExport || params.totalCritical > 0) {
      status = 'critical';
      descFr = `${params.totalCritical} erreur(s) critique(s)`;
      descEn = `${params.totalCritical} critical error(s)`;
    } else if (document.key === 'validation' && params.totalWarnings > 0) {
      status = 'warning';
      descFr = `${params.totalWarnings} avertissement(s)`;
      descEn = `${params.totalWarnings} warning(s)`;
    }

    return {
      ...document,
      status,
      desc_fr: descFr,
      desc_en: descEn,
    };
  });
}

function selectedDocuments(value: unknown) {
  const selected = Array.isArray(value)
    ? value.map((item) => String(item)).filter((item) => DOCUMENT_KEYS.has(item))
    : [];
  return selected.length > 0 ? selected : DOCUMENTS.map((document) => document.key);
}

function fileExtension(format: string) {
  if (format === 'excel') return 'xlsx';
  if (format === 'zip') return 'zip';
  return 'pdf';
}

function safeSegment(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function exportSignature(run: {
  totalDebitN: number;
  totalCreditN: number;
  differenceN: number;
  totalCritical: number;
  totalWarnings: number;
  canExport: boolean;
  snapshot: unknown;
}) {
  const snapshot = run.snapshot as {
    total_actif_N?: number;
    total_passif_N?: number;
    net_result?: number;
    total_debit_N?: number;
    total_credit_N?: number;
    difference_N?: number;
  };
  return JSON.stringify({
    totalDebitN: run.totalDebitN,
    totalCreditN: run.totalCreditN,
    differenceN: run.differenceN,
    totalCritical: run.totalCritical,
    totalWarnings: run.totalWarnings,
    canExport: run.canExport,
    totalActifN: snapshot.total_actif_N,
    totalPassifN: snapshot.total_passif_N,
    netResult: snapshot.net_result,
    snapshotDebit: snapshot.total_debit_N,
    snapshotCredit: snapshot.total_credit_N,
    snapshotDifference: snapshot.difference_N,
  });
}

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const [run, latestVersion, exports] = await Promise.all([
    getLatestCalculationRun(prisma, fiscalYearId),
    prisma.reportVersion.findFirst({
      where: { fiscalYearId },
      include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
      orderBy: { versionNumber: 'desc' },
    }),
    prisma.exportRecord.findMany({
      where: { fiscalYearId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!run) {
    return NextResponse.json({
      ready: false,
      readiness: 0,
      totalCritical: 1,
      totalWarnings: 0,
      reviewApproved: false,
      latestVersion: null,
      items: readinessItems({ canExport: false, totalCritical: 1, totalWarnings: 0, reviewApproved: false }),
      exports: [],
      message: 'Run calculations before exporting',
    });
  }

  const reviewApproved = !!latestVersion && ['approved', 'exported', 'locked'].includes(latestVersion.status);
  const ready = run.canExport && reviewApproved;
  const readiness = ready ? 100 : Math.max(0, 100 - (run.totalCritical || 0) * 20 - (reviewApproved ? 0 : 30) - (run.totalWarnings || 0) * 3);

  return NextResponse.json({
    ready,
    readiness,
    totalCritical: run.totalCritical,
    totalWarnings: run.totalWarnings,
    reviewApproved,
    latestVersion: latestVersion ? serializeVersion(latestVersion) : null,
    meta: {
      companyName: run.company.name,
      fiscalYearLabel: run.fiscalYear.label,
      currency: run.fiscalYear.currency,
    },
    items: readinessItems({
      canExport: run.canExport,
      totalCritical: run.totalCritical,
      totalWarnings: run.totalWarnings,
      reviewApproved,
    }),
    exports: exports.map((record) => ({
      id: record.id,
      format: record.format,
      fileName: record.fileName,
      status: record.status,
      fileChecksum: (record as { fileChecksum?: string | null }).fileChecksum ?? null,
      fileSizeBytes: (record as { fileSizeBytes?: number | null }).fileSizeBytes ?? null,
      downloadCount: (record as { downloadCount?: number }).downloadCount ?? 0,
      hasFile: !!(record as { fileData?: unknown }).fileData,
      createdAt: record.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const format = String(body.format ?? 'pdf').trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });
  if (!['pdf', 'excel', 'zip'].includes(format)) return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 });

  const selected = selectedDocuments(body.selected);
  const currentVersion = await prisma.reportVersion.findFirst({
    where: { fiscalYearId },
    include: { calculationRun: true },
    orderBy: { versionNumber: 'desc' },
  });
  const currentVersionApproved = !!currentVersion && ['approved', 'exported', 'locked'].includes(currentVersion.status);
  let recalculatedStatus: 'approved' | 'exported' | 'locked' | undefined;

  if (!currentVersion?.isLocked) {
    const recalculation = await runAndPersistCalculation(prisma, {
      fiscalYearId,
      session,
      triggerReason: 'pre_export_validation',
    });
    if ('error' in recalculation) return NextResponse.json({ error: recalculation.error }, { status: recalculation.status });
    if (currentVersionApproved) {
      if (exportSignature(currentVersion.calculationRun) !== exportSignature(recalculation.run)) {
        return NextResponse.json({
          error: 'Pre-export recalculation changed report totals or validation status. Review and approve the refreshed version before exporting.',
        }, { status: 409 });
      }
      recalculatedStatus = currentVersion.status as 'approved' | 'exported' | 'locked';
    }
  }

  const result = await getOrCreateReportVersion(prisma, {
    fiscalYearId,
    session,
    status: recalculatedStatus,
    changeSummary: 'Export generated from approved review version',
  });
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { version, run } = result;
  if (!['approved', 'exported', 'locked'].includes(version.status)) {
    return NextResponse.json({
      error: version.changeSummary?.includes('latest calculation run')
        ? 'Pre-export recalculation created a new review version. Approve the review before exporting.'
        : 'Approve the report review before exporting',
    }, { status: 409 });
  }
  if (!run.canExport) {
    return NextResponse.json({ error: 'Resolve critical validation errors before exporting' }, { status: 409 });
  }

  const artifact = {
    ...buildExportArtifact({
    run,
    version: toReportVersionRecord(version),
    includeTraceability: body.includeTraceability !== false,
    }),
    selected_documents: selected,
    export_format: format,
    review_version_status: version.status,
    is_locked: version.isLocked,
    lock_state: version.isLocked ? 'locked' : 'unlocked',
  };

  const xlsxBuffer = buildExportWorkbookBuffer(artifact, selected);
  const pdfBuffer = buildExportPdfBuffer(artifact, selected);
  const fileBuffer = format === 'excel'
    ? xlsxBuffer
    : format === 'zip'
      ? buildZipBuffer([
        { name: 'dossier-ohada.xlsx', data: xlsxBuffer },
        { name: 'dossier-ohada.pdf', data: pdfBuffer },
        { name: 'metadata.json', data: Buffer.from(JSON.stringify(artifact, null, 2)) },
      ])
      : pdfBuffer;

  const safeLabel = safeSegment(run.fiscalYear.label);
  const fileName = `${safeSegment(run.company.name)}-${safeLabel}-v${version.versionNumber}.${fileExtension(format)}`;

  const fileChecksum = computeChecksum(fileBuffer);
  const fileSizeBytes = fileBuffer.length;

  const record = await prisma.$transaction(async (tx) => {
    const exportRecord = await tx.exportRecord.create({
      data: {
        organizationId: run.organizationId,
        companyId: run.companyId,
        fiscalYearId: run.fiscalYearId,
        reportVersionId: version.id,
        calculationRunId: run.id,
        format,
        status: 'completed',
        fileName,
        mimeType: exportMimeType(format),
        artifact: JSON.parse(JSON.stringify(artifact)),
        generatedById: session.id,
        fileChecksum,
        fileSizeBytes,
        fileData: fileBuffer as unknown as Uint8Array<ArrayBuffer>,
      },
    });

    if (version.status !== 'locked') {
      await tx.reportVersion.update({
        where: { id: version.id },
        data: { status: 'exported' },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'export_report',
        entityType: 'export_record',
        entityName: fileName,
        newValue: exportRecord.id,
        reason: `Generated ${format} export package`,
      },
    });

    return exportRecord;
  });

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 201,
    headers: {
      'Content-Type': exportMimeType(format),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'X-Export-Id': record.id,
      'X-Export-File-Name': fileName,
    },
  });
}
