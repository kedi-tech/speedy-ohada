import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { runAndPersistCalculation } from '@/lib/server-calculations';
import { findLineInCalculationPayload } from '@/lib/server-manual-overrides';

function serializeOverride(override: {
  id: string;
  fiscalYearId: string;
  reportType: string;
  reportLineCode: string;
  lineLabelFr: string | null;
  lineLabelEn: string | null;
  originalValue: number | null;
  newValue: number;
  difference: number;
  reason: string;
  status: string;
  reviewComment: string | null;
  createdAt: Date;
  approvedAt: Date | null;
}) {
  return {
    ...override,
    createdAt: override.createdAt.toISOString(),
    approvedAt: override.approvedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const overrides = await prisma.manualOverride.findMany({
    where: { fiscalYearId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ overrides: overrides.map(serializeOverride) });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const reportType = String(body.reportType ?? '').trim();
  const reportLineCode = String(body.reportLineCode ?? '').trim();
  const newValue = Number(body.newValue);
  const reason = String(body.reason ?? '').trim();
  const requiresApproval = body.requiresApproval !== false;

  if (!fiscalYearId || !reportType || !reportLineCode || !Number.isFinite(newValue) || !reason) {
    return NextResponse.json({ error: 'Fiscal year, report line, value, and reason are required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) return NextResponse.json({ error: 'Fiscal year is locked' }, { status: 423 });

  const latestRun = await prisma.calculationRun.findFirst({
    where: { fiscalYearId },
    orderBy: { createdAt: 'desc' },
  });

  const sourcePayload =
    reportType === 'ACTIF' ? latestRun?.actif :
    reportType === 'PASSIF' ? latestRun?.passif :
    reportType === 'COMPTE_RESULTAT' ? latestRun?.incomeStatement :
    reportType === 'TABLEAU_FLUX_TRESORERIE' ? latestRun?.cashFlow :
    null;
  const line = findLineInCalculationPayload(sourcePayload, reportType, reportLineCode);
  const originalValue = line?.value_N ?? null;

  const override = await prisma.$transaction(async (tx) => {
    const created = await tx.manualOverride.create({
      data: {
        organizationId: fiscalYear.company.organizationId,
        companyId: fiscalYear.companyId,
        fiscalYearId,
        reportType,
        reportLineCode,
        lineLabelFr: line?.label_fr ?? null,
        lineLabelEn: line?.label_en ?? null,
        originalValue,
        newValue,
        difference: newValue - (originalValue ?? 0),
        reason,
        status: requiresApproval ? 'pending' : 'auto_approved',
        createdById: session.id,
        approvedById: requiresApproval ? null : session.id,
        approvedAt: requiresApproval ? null : new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'create_manual_override',
        entityType: 'manual_override',
        entityName: `${reportType}:${reportLineCode}`,
        oldValue: originalValue == null ? null : String(originalValue),
        newValue: String(newValue),
        reason,
      },
    });

    return created;
  });

  if (!requiresApproval) {
    await runAndPersistCalculation(prisma, {
      fiscalYearId,
      session,
      triggerReason: 'manual_override',
    });
  }

  return NextResponse.json({ override: serializeOverride(override) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const id = String(body.id ?? '').trim();
  const action = String(body.action ?? '').trim();
  const reviewComment = String(body.reviewComment ?? '').trim();

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Override id and approve/reject action are required' }, { status: 400 });
  }

  const existing = await prisma.manualOverride.findUnique({
    where: { id },
    include: { fiscalYear: true },
  });
  if (!existing) return NextResponse.json({ error: 'Override not found' }, { status: 404 });
  if (existing.fiscalYear.locked) return NextResponse.json({ error: 'Fiscal year is locked' }, { status: 423 });

  const status = action === 'approve' ? 'approved' : 'rejected';

  const override = await prisma.$transaction(async (tx) => {
    const updated = await tx.manualOverride.update({
      where: { id },
      data: {
        status,
        approvedById: session.id,
        approvedAt: new Date(),
        reviewComment: reviewComment || null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: action === 'approve' ? 'approve_manual_override' : 'reject_manual_override',
        entityType: 'manual_override',
        entityName: `${existing.reportType}:${existing.reportLineCode}`,
        oldValue: existing.status,
        newValue: status,
        reason: reviewComment || null,
      },
    });

    return updated;
  });

  if (status === 'approved') {
    await runAndPersistCalculation(prisma, {
      fiscalYearId: existing.fiscalYearId,
      session,
      triggerReason: 'manual_override_approved',
    });
  }

  return NextResponse.json({ override: serializeOverride(override) });
}
