import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

// GET /api/traceability-records?fiscalYearId=...&reportType=ACTIF&lineCode=AB
// Returns first-class TraceabilityRecord rows for drill-down queries
export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  const calculationRunId = searchParams.get('calculationRunId')?.trim();
  const reportType = searchParams.get('reportType')?.trim();
  const lineCode = searchParams.get('lineCode')?.trim();

  if (!fiscalYearId && !calculationRunId) {
    return NextResponse.json({ error: 'fiscalYearId or calculationRunId required' }, { status: 400 });
  }

  const where = {
    ...(fiscalYearId ? { fiscalYearId } : {}),
    ...(calculationRunId ? { calculationRunId } : {}),
    ...(reportType ? { reportType } : {}),
    ...(lineCode ? { lineCode } : {}),
  };

  const records = await prisma.traceabilityRecord.findMany({
    where,
    orderBy: [{ reportType: 'asc' }, { lineCode: 'asc' }],
    take: 500,
  });

  return NextResponse.json({
    records: records.map((r) => ({
      id: r.id,
      calculation_run_id: r.calculationRunId,
      fiscal_year_id: r.fiscalYearId,
      report_type: r.reportType,
      line_code: r.lineCode,
      label_fr: r.labelFr,
      label_en: r.labelEn,
      value_n: r.valueN,
      value_n1: r.valueN1,
      variation_amount: r.variationAmount,
      formula_used: r.formulaUsed,
      source_accounts: r.sourceAccounts,
      dependency_chain: r.dependencyChain,
      mapping_rule_ids: r.mappingRuleIds,
      source_rows: r.sourceRows,
      is_manual_override: r.isManualOverride,
      override_id: r.overrideId,
      override_reason: r.overrideReason,
      calculated_at: r.calculatedAt.toISOString(),
    })),
    total: records.length,
  });
}
