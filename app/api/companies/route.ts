import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const organizationId = user?.organizationId ?? null;

  const company = await prisma.company.create({
    data: {
      name,
      legalName: body.legalName || null,
      commercialName: body.commercialName || null,
      rccm: body.rccm || null,
      nif: body.nif || null,
      legalForm: body.legalForm || null,
      sector: body.sector || '',
      mainActivity: body.mainActivity || null,
      address: body.address || null,
      city: body.city || '',
      country: body.country || null,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      taxCenter: body.taxCenter || null,
      taxRegime: body.taxRegime || null,
      currency: body.currency || 'GNF',
      accountingStandard: body.accountingStandard || 'SYSCOHADA',
      managerName: body.managerName || null,
      managerTitle: body.managerTitle || null,
      accountantName: body.accountantName || null,
      accountantContact: body.accountantContact || null,
      auditorName: body.auditorName || null,
      auditorContact: body.auditorContact || null,
      notes: body.notes || null,
      status: 'draft',
      progress: 10,
      organizationId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'create_company',
      entityType: 'company',
      entityName: company.name,
      newValue: company.id,
      reason: 'Company created from UI',
    },
  });

  return NextResponse.json({ company }, { status: 201 });
}
