import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { getPersistedGroupedBalances } from '@/lib/server-grouped-balance';

const asPlainJson = (value: unknown) => JSON.parse(JSON.stringify(value));

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();

  const run = await prisma.calculationRun.findFirst({
    where: fiscalYearId ? { fiscalYearId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      fiscalYear: { include: { company: true } },
    },
  });

  if (!run) {
    return NextResponse.json({ error: 'No calculation run found' }, { status: 404 });
  }

  const groupedBalances = await getPersistedGroupedBalances(prisma, run.fiscalYearId);

  return NextResponse.json({
    run: {
      id: run.id,
      fiscalYearId: run.fiscalYearId,
      companyId: run.companyId,
      status: run.status,
      triggerReason: run.triggerReason,
      createdAt: run.createdAt,
      canExport: run.canExport,
      totalCritical: run.totalCritical,
      totalWarnings: run.totalWarnings,
    },
    meta: {
      companyName: run.fiscalYear.company.name,
      fiscalYearLabel: run.fiscalYear.label,
      currency: run.fiscalYear.currency,
    },
    result: {
      accountsN: [],
      groupedBalanceN: groupedBalances.filter((row) => row.balance_type === 'N'),
      groupedBalanceN1: groupedBalances.filter((row) => row.balance_type === 'N-1'),
      actifN: asPlainJson(run.actif),
      passifN: asPlainJson(run.passif),
      incomeStatement: asPlainJson(run.incomeStatement),
      cashFlow: asPlainJson(run.cashFlow),
      conversionDifferences: asPlainJson((run.snapshot as { conversion_differences?: unknown }).conversion_differences ?? null),
      expenseDetails: asPlainJson(run.expenseDetails),
      notes: asPlainJson(run.notes),
      fiscal: asPlainJson(run.fiscal),
      validation: asPlainJson(run.validation),
      traceability: asPlainJson(run.traceability),
      snapshot: asPlainJson(run.snapshot),
    },
  });
}
