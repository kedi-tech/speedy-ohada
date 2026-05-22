import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { getNotesManualOverrides } from '@/lib/server-notes-fiscal';
import { runAndPersistCalculation } from '@/lib/server-calculations';

const asPlainJson = (value: unknown) => JSON.parse(JSON.stringify(value));

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const latestRun = await prisma.calculationRun.findFirst({
    where: { fiscalYearId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    notes: latestRun ? asPlainJson(latestRun.notes) : [],
    values: await getNotesManualOverrides(prisma, fiscalYearId),
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const noteNumber = Number(body.noteNumber);
  const values = body.values && typeof body.values === 'object' ? body.values as Record<string, unknown> : {};

  if (!fiscalYearId || !Number.isInteger(noteNumber)) {
    return NextResponse.json({ error: 'Fiscal year and note number are required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) return NextResponse.json({ error: 'Fiscal year is locked' }, { status: 423 });

  await prisma.$transaction(async (tx) => {
    for (const [fieldKey, value] of Object.entries(values)) {
      await tx.noteValue.upsert({
        where: { fiscalYearId_noteNumber_noteVariant_fieldKey: { fiscalYearId, noteNumber, noteVariant: '', fieldKey } },
        create: {
          companyId: fiscalYear.companyId,
          fiscalYearId,
          noteNumber,
          fieldKey,
          value: asPlainJson(value),
          status: value === null || value === '' ? 'toComplete' : 'completed',
          updatedById: session.id,
        },
        update: {
          value: asPlainJson(value),
          status: value === null || value === '' ? 'toComplete' : 'completed',
          updatedById: session.id,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'update_note_values',
        entityType: 'note',
        entityName: `Note ${noteNumber}`,
        reason: 'Annex note manual fields updated',
      },
    });
  });

  const recalculation = await runAndPersistCalculation(prisma, {
    fiscalYearId,
    session,
    triggerReason: 'note_values_change',
  });

  if ('error' in recalculation) {
    return NextResponse.json({ saved: true, recalculated: false, error: recalculation.error });
  }

  return NextResponse.json({ saved: true, recalculated: true, runId: recalculation.run.id });
}
