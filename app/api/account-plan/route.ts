import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

// GET /api/account-plan?version=SYSCOHADA_2017&class=1&q=immobilisation
export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version') ?? 'SYSCOHADA_2017';
  const accountClass = searchParams.get('class') ? Number(searchParams.get('class')) : undefined;
  const q = searchParams.get('q')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(200, Number(searchParams.get('pageSize') ?? '100'));

  const where = {
    version,
    ...(accountClass !== undefined ? { accountClass } : {}),
    ...(q ? {
      OR: [
        { accountNumber: { contains: q, mode: 'insensitive' as const } },
        { labelFr: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.accountPlanEntry.findMany({
      where,
      orderBy: { accountNumber: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.accountPlanEntry.count({ where }),
  ]);

  return NextResponse.json({
    entries: entries.map((e) => ({
      account_number: e.accountNumber,
      label_fr: e.labelFr,
      label_en: e.labelEn ?? undefined,
      account_class: e.accountClass,
      account_type: e.accountType,
      is_deprecated: e.isDeprecated,
      deprecated_note: e.deprecatedNote ?? undefined,
      normal_balance: e.normalBalance,
      version: e.version,
    })),
    total,
    page,
    page_size: pageSize,
    pages: Math.ceil(total / pageSize),
  });
}

// POST /api/account-plan — seed/import entries from a parsed list
export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['super_admin', 'org_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const version = String(body.version ?? 'SYSCOHADA_2017');
  const entries = Array.isArray(body.entries) ? body.entries : [];

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
  }

  let created = 0;
  let updated = 0;

  for (const entry of entries) {
    const accountNumber = String(entry.account_number ?? entry.accountNumber ?? '').trim();
    if (!accountNumber) continue;

    const data = {
      labelFr: String(entry.label_fr ?? entry.labelFr ?? accountNumber),
      labelEn: entry.label_en ?? entry.labelEn ?? null,
      accountClass: Number(entry.account_class ?? entry.accountClass ?? accountNumber[0]),
      accountType: String(entry.account_type ?? entry.accountType ?? 'detail'),
      isDeprecated: Boolean(entry.is_deprecated ?? entry.isDeprecated ?? false),
      deprecatedNote: entry.deprecated_note ?? entry.deprecatedNote ?? null,
      normalBalance: String(entry.normal_balance ?? entry.normalBalance ?? 'debit'),
    };

    const existing = await prisma.accountPlanEntry.findUnique({
      where: { version_accountNumber: { version, accountNumber } },
    });

    if (existing) {
      await prisma.accountPlanEntry.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.accountPlanEntry.create({
        data: { version, accountNumber, ...data },
      });
      created++;
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: 'import_account_plan',
      entityType: 'account_plan_entry',
      entityName: version,
      newValue: `${created} created, ${updated} updated`,
      reason: `Account plan import for version ${version}`,
    },
  });

  return NextResponse.json({ created, updated, version }, { status: 201 });
}
