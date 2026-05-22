import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import type { TraceabilitySummary } from '@/lib/engine/TraceabilityEngine';

const asPlainJson = (value: unknown) => JSON.parse(JSON.stringify(value));

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  const runId = searchParams.get('runId')?.trim();
  const reportType = searchParams.get('reportType')?.trim();
  const lineCode = searchParams.get('lineCode')?.trim();

  if (!fiscalYearId && !runId) {
    return NextResponse.json({ error: 'Fiscal year or run id is required' }, { status: 400 });
  }

  const run = await prisma.calculationRun.findFirst({
    where: runId ? { id: runId } : { fiscalYearId },
    include: {
      user: true,
      fiscalYear: { include: { company: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!run) return NextResponse.json({ error: 'No calculation run found' }, { status: 404 });

  const records = (asPlainJson(run.traceability) as TraceabilitySummary[]).filter((record) => {
    if (reportType && record.report_type !== reportType) return false;
    if (lineCode && record.line_code !== lineCode) return false;
    return true;
  });

  return NextResponse.json({
    run: {
      id: run.id,
      status: run.status,
      triggerReason: run.triggerReason,
      createdAt: run.createdAt.toISOString(),
      canExport: run.canExport,
      totalCritical: run.totalCritical,
      totalWarnings: run.totalWarnings,
      user: run.user ? { id: run.user.id, name: run.user.name, email: run.user.email } : null,
    },
    meta: {
      companyName: run.fiscalYear.company.name,
      fiscalYearLabel: run.fiscalYear.label,
      currency: run.fiscalYear.currency,
    },
    traceability: records,
  });
}
