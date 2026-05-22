import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function GET() {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const where = session.role === 'super_admin' ? {} : { id: session.org };

  const organizations = await prisma.organization.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { companies: true, users: true } } },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      plan: org.plan,
      status: org.status,
      adminEmail: org.adminEmail,
      oneccaNumber: org.oneccaNumber,
      rccm: org.rccm,
      address: org.address,
      city: org.city,
      country: org.country,
      phone: org.phone,
      email: org.email,
      website: org.website,
      logoUrl: org.logoUrl,
      companies: org._count.companies,
      users: org._count.users,
      createdAt: org.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const name = String(body.name ?? '').trim();
  const adminEmail = String(body.adminEmail ?? '').trim();

  if (!name || !adminEmail) {
    return NextResponse.json({ error: 'Name and admin email are required' }, { status: 400 });
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      adminEmail,
      plan: String(body.plan ?? 'starter'),
      status: 'active',
      oneccaNumber: body.oneccaNumber ? String(body.oneccaNumber).trim() : null,
      rccm: body.rccm ? String(body.rccm).trim() : null,
      address: body.address ? String(body.address).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      country: body.country ? String(body.country).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      email: body.email ? String(body.email).trim() : null,
      website: body.website ? String(body.website).trim() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'create_organization',
      entityType: 'organization',
      entityName: organization.name,
      newValue: organization.id,
      reason: 'Organization created from UI',
    },
  });

  return NextResponse.json({ organization }, { status: 201 });
}
