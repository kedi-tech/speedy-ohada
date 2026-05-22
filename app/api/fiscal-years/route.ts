import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const companyId = String(body.companyId ?? '').trim();
  const yearN = Number(body.yearN);
  const yearN1 = Number(body.yearN1);

  if (!companyId || !Number.isInteger(yearN) || !Number.isInteger(yearN1)) {
    return NextResponse.json({ error: 'Company and fiscal years are required' }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const fiscalYear = await prisma.fiscalYear.create({
    data: {
      companyId,
      label: body.label || `${yearN}`,
      yearN,
      yearN1,
      openingDate: new Date(body.openingDate || `${yearN}-01-01`),
      closingDate: new Date(body.closingDate || `${yearN}-12-31`),
      currency: body.currency || company.currency || 'GNF',
      notes: body.notes || null,
      status: 'draft',
      progress: 15,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'create_fiscal_year',
      entityType: 'fiscal_year',
      entityName: `${company.name} ${fiscalYear.label}`,
      newValue: fiscalYear.id,
      reason: 'Fiscal year created from UI',
    },
  });

  return NextResponse.json({ fiscalYear }, { status: 201 });
}
