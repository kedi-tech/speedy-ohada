import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { getPersistedGroupedBalances, rebuildGroupedBalanceRows, summarizeGroupedBalanceReconciliation } from '@/lib/server-grouped-balance';

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  let rows = await getPersistedGroupedBalances(prisma, fiscalYearId);
  if (rows.length === 0) {
    await rebuildGroupedBalanceRows(prisma, { fiscalYearId });
    rows = await getPersistedGroupedBalances(prisma, fiscalYearId);
  }

  return NextResponse.json({
    rows,
    reconciliation: summarizeGroupedBalanceReconciliation(rows),
  });
}
