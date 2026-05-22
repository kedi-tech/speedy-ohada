import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

// GET /api/fird?fiscalYearId=...
export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'fiscalYearId required' }, { status: 400 });

  const record = await prisma.fIRDMetadata.findUnique({ where: { fiscalYearId } });
  if (!record) return NextResponse.json({ fird: null, completionPct: 0 });

  return NextResponse.json({ fird: serializeFIRD(record) });
}

// PUT /api/fird — upsert FIRD metadata for a fiscal year
export async function PUT(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'fiscalYearId required' }, { status: 400 });

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });

  const data = {
    companyId: fiscalYear.companyId,
    ministryCode: body.ministryCode ?? null,
    taxCenterCode: body.taxCenterCode ?? null,
    depositCenterCode: body.depositCenterCode ?? null,
    legalFormCode: body.legalFormCode ?? null,
    fiscalRegimeCode: body.fiscalRegimeCode ?? null,
    importerCode: body.importerCode ?? null,
    bankDomiciliation: body.bankDomiciliation ?? null,
    socialSecurityNumber: body.socialSecurityNumber ?? null,
    mainActivityCode: body.mainActivityCode ?? null,
    secondaryActivityCode: body.secondaryActivityCode ?? null,
    activityPercentageMain: body.activityPercentageMain != null ? Number(body.activityPercentageMain) : null,
    activityPercentageSecondary: body.activityPercentageSecondary != null ? Number(body.activityPercentageSecondary) : null,
    economicActivityCode: body.economicActivityCode ?? null,
    accountantName: body.accountantName ?? null,
    accountantNumber: body.accountantNumber ?? null,
    auditorName: body.auditorName ?? null,
    auditorNumber: body.auditorNumber ?? null,
    signatoryName: body.signatoryName ?? null,
    signatoryTitle: body.signatoryTitle ?? null,
    signatureDate: body.signatureDate ? new Date(body.signatureDate) : null,
    shareholders: body.shareholders ?? null,
    boardMembers: body.boardMembers ?? null,
    subsidiaries: body.subsidiaries ?? null,
  };

  const completionPct = computeCompletionPct(data);

  const record = await prisma.fIRDMetadata.upsert({
    where: { fiscalYearId },
    create: { fiscalYearId, ...data, completionPct, status: 'draft' },
    update: { ...data, completionPct },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'update_fird_metadata',
      entityType: 'fird_metadata',
      entityName: `${fiscalYear.company.name} ${fiscalYear.label}`,
      newValue: `completion ${completionPct}%`,
      reason: 'FIRD statutory metadata updated',
    },
  });

  return NextResponse.json({ fird: serializeFIRD(record) });
}

type FIRDRecord = Awaited<ReturnType<typeof prisma.fIRDMetadata.findUnique>>;

function serializeFIRD(r: NonNullable<FIRDRecord>) {
  return {
    id: r.id,
    company_id: r.companyId,
    fiscal_year_id: r.fiscalYearId,
    ministry_code: r.ministryCode,
    tax_center_code: r.taxCenterCode,
    deposit_center_code: r.depositCenterCode,
    legal_form_code: r.legalFormCode,
    fiscal_regime_code: r.fiscalRegimeCode,
    importer_code: r.importerCode,
    bank_domiciliation: r.bankDomiciliation,
    social_security_number: r.socialSecurityNumber,
    main_activity_code: r.mainActivityCode,
    secondary_activity_code: r.secondaryActivityCode,
    activity_percentage_main: r.activityPercentageMain,
    activity_percentage_secondary: r.activityPercentageSecondary,
    economic_activity_code: r.economicActivityCode,
    accountant_name: r.accountantName,
    accountant_number: r.accountantNumber,
    auditor_name: r.auditorName,
    auditor_number: r.auditorNumber,
    signatory_name: r.signatoryName,
    signatory_title: r.signatoryTitle,
    signature_date: r.signatureDate?.toISOString() ?? null,
    shareholders: r.shareholders,
    board_members: r.boardMembers,
    subsidiaries: r.subsidiaries,
    status: r.status,
    completion_pct: r.completionPct,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function computeCompletionPct(data: Record<string, unknown>): number {
  const required = [
    'ministryCode', 'taxCenterCode', 'legalFormCode', 'fiscalRegimeCode',
    'mainActivityCode', 'economicActivityCode',
    'accountantName', 'signatoryName', 'signatureDate',
  ];
  const filled = required.filter((k) => data[k] != null && data[k] !== '').length;
  return Math.round((filled / required.length) * 100);
}
