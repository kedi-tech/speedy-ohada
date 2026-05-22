import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { FRNA_ENTRIES, computeFRNASuggestions } from '@/lib/frna';
import type { NoteApplicability } from '@/lib/frna';

// FRNA note applicability is stored as NoteValue rows with:
// noteNumber=0, noteVariant='FRNA', fieldKey=noteId, value='A'|'NA'|'pending'

const FRNA_NOTE_NUMBER = 0;
const FRNA_VARIANT = 'FRNA';

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'fiscalYearId required' }, { status: 400 });

  const fiscalYear = await prisma.fiscalYear.findUnique({ where: { id: fiscalYearId } });
  if (!fiscalYear) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Load saved applicability overrides
  const saved = await prisma.noteValue.findMany({
    where: { fiscalYearId, noteNumber: FRNA_NOTE_NUMBER, noteVariant: FRNA_VARIANT },
  });
  const savedMap = new Map(saved.map((r) => [r.fieldKey, r.value as string]));

  // Build auto-suggestions from the trial balance
  const trialBalanceLines = await prisma.trialBalanceLine.findMany({
    where: { fiscalYearId, balanceType: 'N' },
    select: { acc: true, accountClass: true, netBalance: true },
  });
  const accountNumbers = trialBalanceLines.map((l) => l.acc);
  const accountClasses = new Map(trialBalanceLines.map((l) => [l.acc, l.accountClass ?? 0]));
  const netBalances = new Map(trialBalanceLines.map((l) => [l.acc, l.netBalance]));
  const suggestions = computeFRNASuggestions(accountNumbers, accountClasses, netBalances);

  // Merge: saved override wins, then suggestion, then 'pending'
  const entries = FRNA_ENTRIES.map((entry) => {
    const saved_ = savedMap.get(entry.id) as NoteApplicability | undefined;
    const suggested = suggestions.get(entry.id) ?? 'pending';
    return {
      ...entry,
      applicability: saved_ ?? suggested,
      suggested,
      isOverridden: saved_ !== undefined && saved_ !== suggested,
    };
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const updates = body.updates as Record<string, NoteApplicability> | undefined;

  if (!fiscalYearId || !updates) {
    return NextResponse.json({ error: 'fiscalYearId and updates required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (fiscalYear.locked) return NextResponse.json({ error: 'Locked' }, { status: 423 });

  await prisma.$transaction(async (tx) => {
    for (const [noteId, applicability] of Object.entries(updates)) {
      await tx.noteValue.upsert({
        where: {
          fiscalYearId_noteNumber_noteVariant_fieldKey: {
            fiscalYearId,
            noteNumber: FRNA_NOTE_NUMBER,
            noteVariant: FRNA_VARIANT,
            fieldKey: noteId,
          },
        },
        create: {
          companyId: fiscalYear.companyId,
          fiscalYearId,
          noteNumber: FRNA_NOTE_NUMBER,
          noteVariant: FRNA_VARIANT,
          fieldKey: noteId,
          value: applicability,
          status: 'completed',
          updatedById: session.id,
        },
        update: {
          value: applicability,
          status: 'completed',
          updatedById: session.id,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
