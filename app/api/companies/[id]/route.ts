import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ company });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const company = await prisma.company.update({
    where: { id },
    data: {
      name:              String(body.name ?? existing.name).trim() || existing.name,
      legalName:         body.legalName         ?? existing.legalName,
      commercialName:    body.commercialName     ?? existing.commercialName,
      rccm:              body.rccm               ?? existing.rccm,
      nif:               body.nif                ?? existing.nif,
      legalForm:         body.legalForm          ?? existing.legalForm,
      sector:            body.sector             ?? existing.sector,
      mainActivity:      body.mainActivity       ?? existing.mainActivity,
      address:           body.address            ?? existing.address,
      city:              body.city               ?? existing.city,
      country:           body.country            ?? existing.country,
      phone:             body.phone              ?? existing.phone,
      email:             body.email              ?? existing.email,
      website:           body.website            ?? existing.website,
      taxCenter:         body.taxCenter          ?? existing.taxCenter,
      taxRegime:         body.taxRegime          ?? existing.taxRegime,
      currency:          body.currency           ?? existing.currency,
      accountingStandard:body.accountingStandard ?? existing.accountingStandard,
      managerName:       body.managerName        ?? existing.managerName,
      managerTitle:      body.managerTitle       ?? existing.managerTitle,
      accountantName:    body.accountantName     ?? existing.accountantName,
      accountantContact: body.accountantContact  ?? existing.accountantContact,
      auditorName:       body.auditorName        ?? existing.auditorName,
      auditorContact:    body.auditorContact     ?? existing.auditorContact,
      notes:             body.notes              ?? existing.notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId:     session.id,
      userName:   session.name,
      userRole:   session.role,
      action:     'update_company',
      entityType: 'company',
      entityName: company.name,
      newValue:   company.id,
      reason:     'Company updated from UI',
    },
  });

  return NextResponse.json({ company });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'delete_company',
      entityType: 'company',
      entityName: existing.name,
      oldValue: existing.id,
      reason: 'Company deleted from UI',
    },
  });

  await prisma.company.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
