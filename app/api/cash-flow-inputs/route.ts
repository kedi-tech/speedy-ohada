import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { getCashFlowManualInputs } from '@/lib/server-notes-fiscal';
import { runAndPersistCalculation } from '@/lib/server-calculations';
import type { CashFlowManualInputs } from '@/lib/engine/types';

const CASH_FLOW_FIELDS: Record<keyof CashFlowManualInputs, { labelFr: string; labelEn: string }> = {
  acquisitions_of_fixed_assets: {
    labelFr: 'Acquisitions d immobilisations',
    labelEn: 'Acquisitions of fixed assets',
  },
  disposals_of_fixed_assets: {
    labelFr: 'Cessions d immobilisations',
    labelEn: 'Disposals of fixed assets',
  },
  acquisitions_of_financial_assets: {
    labelFr: 'Acquisitions d actifs financiers',
    labelEn: 'Acquisitions of financial assets',
  },
  disposals_of_financial_assets: {
    labelFr: 'Cessions d actifs financiers',
    labelEn: 'Disposals of financial assets',
  },
  new_borrowings: {
    labelFr: 'Nouveaux emprunts',
    labelEn: 'New borrowings',
  },
  loan_repayments: {
    labelFr: 'Remboursements d emprunts',
    labelEn: 'Loan repayments',
  },
  dividends_paid: {
    labelFr: 'Dividendes verses',
    labelEn: 'Dividends paid',
  },
  grants_received: {
    labelFr: 'Subventions recues',
    labelEn: 'Grants received',
  },
  capital_increases: {
    labelFr: 'Augmentations de capital',
    labelEn: 'Capital increases',
  },
  gains_on_disposal: {
    labelFr: 'Gains sur cessions',
    labelEn: 'Gains on disposal',
  },
  losses_on_disposal: {
    labelFr: 'Pertes sur cessions',
    labelEn: 'Losses on disposal',
  },
  reversals: {
    labelFr: 'Reprises de provisions',
    labelEn: 'Provision reversals',
  },
};

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const inputs = await getCashFlowManualInputs(prisma, fiscalYearId);
  return NextResponse.json({ inputs });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const inputs = (body.inputs ?? {}) as Record<string, unknown>;
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) return NextResponse.json({ error: 'Fiscal year is locked' }, { status: 423 });

  await prisma.$transaction(async (tx) => {
    for (const [field, config] of Object.entries(CASH_FLOW_FIELDS)) {
      if (!(field in inputs)) continue;
      const value = Number(inputs[field] ?? 0);
      await tx.fiscalManualInput.upsert({
        where: {
          fiscalYearId_inputType_lineCode: {
            fiscalYearId,
            inputType: 'cash_flow',
            lineCode: field,
          },
        },
        create: {
          companyId: fiscalYear.companyId,
          fiscalYearId,
          inputType: 'cash_flow',
          lineCode: field,
          labelFr: config.labelFr,
          labelEn: config.labelEn,
          value: Number.isFinite(value) ? value : 0,
          source: 'manual_cash_flow',
          comment: typeof body.comment === 'string' ? body.comment : null,
          updatedById: session.id,
        },
        update: {
          value: Number.isFinite(value) ? value : 0,
          source: 'manual_cash_flow',
          comment: typeof body.comment === 'string' ? body.comment : null,
          updatedById: session.id,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'update_cash_flow_inputs',
        entityType: 'fiscal_year',
        entityName: `${fiscalYear.company.name} ${fiscalYear.label}`,
        newValue: Object.keys(inputs).join(', '),
        reason: 'Cash flow manual inputs updated',
      },
    });
  });

  const recalculation = await runAndPersistCalculation(prisma, {
    fiscalYearId,
    session,
    triggerReason: 'cash_flow_inputs_change',
  });

  if ('error' in recalculation) {
    return NextResponse.json({ saved: true, recalculated: false, error: recalculation.error });
  }

  return NextResponse.json({ saved: true, recalculated: true, runId: recalculation.run.id });
}
