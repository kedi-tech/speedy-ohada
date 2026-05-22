import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';

function initials(firstName: string, lastName: string, email: string) {
  const letters = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.trim();
  return (letters || email.slice(0, 2)).toUpperCase();
}

export async function POST(request: Request) {
  const body = await request.json();
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const organizationName = String(body.organizationName ?? '').trim();
  const password = String(body.password ?? '');

  if (!firstName || !lastName || !email || !organizationName || !password) {
    return NextResponse.json({ error: 'All signup fields are required' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account already exists for this email' }, { status: 409 });
  }

  const name = `${firstName} ${lastName}`.trim();
  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        plan: 'starter',
        status: 'active',
        adminEmail: email,
      },
    });

    const created = await tx.user.create({
      data: {
        email,
        hashedPassword: hashPassword(password),
        name,
        role: 'accountant',
        org: organization.name,
        initials: initials(firstName, lastName, email),
        status: 'active',
        organizationId: organization.id,
        lastLogin: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: created.id,
        userName: created.name,
        userRole: created.role,
        action: 'signup',
        entityType: 'organization',
        entityName: organization.name,
        newValue: created.email,
        reason: 'User self signup',
      },
    });

    return created;
  });

  const responseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    org: user.org,
    initials: user.initials,
  };

  const response = NextResponse.json({ user: responseUser }, { status: 201 });
  response.cookies.set('ohada_user', JSON.stringify(responseUser), {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  });
  return response;
}
