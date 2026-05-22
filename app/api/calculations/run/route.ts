import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { runAndPersistCalculation } from '@/lib/server-calculations';

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const result = await runAndPersistCalculation(prisma, {
    fiscalYearId,
    session,
    triggerReason: body.triggerReason || 'manual_run',
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    run: result.run,
    snapshot: result.snapshot,
    validation: result.validation,
  }, { status: result.status });
}
