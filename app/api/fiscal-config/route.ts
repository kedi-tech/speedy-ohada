import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { getFiscalConfigForYear, getFiscalManualInputs } from '@/lib/server-notes-fiscal';
import { runAndPersistCalculation } from '@/lib/server-calculations';

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const config = await getFiscalConfigForYear(prisma, fiscalYearId);
  const manualInputs = await getFiscalManualInputs(prisma, fiscalYearId);
  return NextResponse.json({ config, manualInputs });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const fiscalYear = await prisma.fiscalYear.findUnique({ where: { id: fiscalYearId }, include: { company: true } });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) return NextResponse.json({ error: 'Fiscal year is locked' }, { status: 423 });

  const taxRate = Number(body.taxRate ?? 25);
  const vatRate = Number(body.vatRate ?? 18);
  const patenteRate = Number(body.patenteRate ?? 0.5);
  const countryCode = String(body.countryCode ?? fiscalYear.company.country ?? 'GN');
  const fiscalRegime = String(body.fiscalRegime ?? fiscalYear.company.taxRegime ?? 'normal');

  await prisma.fiscalConfig.upsert({
    where: {
      companyId_countryCode_fiscalRegime_fiscalYear: {
        companyId: fiscalYear.companyId,
        countryCode,
        fiscalRegime,
        fiscalYear: fiscalYear.yearN,
      },
    },
    create: {
      companyId: fiscalYear.companyId,
      countryCode,
      fiscalRegime,
      fiscalYear: fiscalYear.yearN,
      taxRate,
      vatRate,
      patenteRate,
      currencyCode: fiscalYear.currency,
    },
    update: { taxRate, vatRate, patenteRate },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'update_fiscal_config',
      entityType: 'fiscal_year',
      entityName: fiscalYear.label,
      newValue: `tax=${taxRate};vat=${vatRate};patente=${patenteRate}`,
      reason: 'Fiscal config updated',
    },
  });

  await runAndPersistCalculation(prisma, { fiscalYearId, session, triggerReason: 'fiscal_config_change' });
  return NextResponse.json({ saved: true });
}
