import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (session.role !== 'super_admin' && session.org !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const org = await prisma.organization.findUnique({
    where: { id },
    include: { _count: { select: { companies: true, users: true } } },
  });
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    organization: {
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
    },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (session.role !== 'super_admin' && session.org !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.organization.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.organization.update({
    where: { id },
    data: {
      name:         body.name         !== undefined ? String(body.name).trim()         : existing.name,
      adminEmail:   body.adminEmail   !== undefined ? String(body.adminEmail).trim()   : existing.adminEmail,
      plan:         body.plan         !== undefined ? String(body.plan)                : existing.plan,
      status:       body.status       !== undefined ? String(body.status)              : existing.status,
      oneccaNumber: body.oneccaNumber !== undefined ? (body.oneccaNumber || null)      : existing.oneccaNumber,
      rccm:         body.rccm         !== undefined ? (body.rccm || null)              : existing.rccm,
      address:      body.address      !== undefined ? (body.address || null)           : existing.address,
      city:         body.city         !== undefined ? (body.city || null)              : existing.city,
      country:      body.country      !== undefined ? (body.country || null)           : existing.country,
      phone:        body.phone        !== undefined ? (body.phone || null)             : existing.phone,
      email:        body.email        !== undefined ? (body.email || null)             : existing.email,
      website:      body.website      !== undefined ? (body.website || null)           : existing.website,
      logoUrl:      body.logoUrl      !== undefined ? (body.logoUrl || null)           : existing.logoUrl,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'update_organization',
      entityType: 'organization',
      entityName: updated.name,
      newValue: updated.id,
      reason: 'Organization updated from UI',
    },
  });

  return NextResponse.json({ organization: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (session.role !== 'super_admin' && session.org !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.organization.findUnique({
    where: { id },
    include: { _count: { select: { companies: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'delete_organization',
      entityType: 'organization',
      entityName: existing.name,
      oldValue: existing.id,
      reason: 'Organization deleted from UI',
    },
  });

  await prisma.organization.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
