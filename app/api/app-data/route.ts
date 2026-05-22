import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const dateFmtFr = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const dateFmtEn = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

function formatDate(date: Date | null | undefined, lang: 'fr' | 'en' = 'fr') {
  if (!date) return '';
  return lang === 'fr' ? dateFmtFr.format(date) : dateFmtEn.format(date);
}

function formatTime(date: Date | null | undefined, lang: 'fr' | 'en' = 'fr') {
  if (!date) return '';
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export async function GET() {
  const [organizations, users, companies, fiscalYears, auditLogs, notifications, trialBalance] =
    await Promise.all([
      prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { companies: true, users: true } } },
      }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, include: { organization: true } }),
      prisma.company.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { fiscalYears: { orderBy: { yearN: 'desc' }, take: 1 } },
      }),
      prisma.fiscalYear.findMany({ orderBy: { updatedAt: 'desc' }, include: { company: true } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.trialBalanceLine.findMany({ orderBy: [{ balanceType: 'asc' }, { acc: 'asc' }] }),
    ]);

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      plan: org.plan,
      companies: org._count.companies,
      users: org._count.users,
      status: org.status,
      created_at: formatDate(org.createdAt),
      admin_email: org.adminEmail,
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization?.name ?? user.org,
      status: user.status,
      last_login: user.lastLogin ? formatTime(user.lastLogin) : undefined,
      created_at: formatDate(user.createdAt),
    })),
    companies: companies.map((company) => ({
      id: company.id,
      name: company.name,
      legal_name: company.legalName ?? undefined,
      commercial_name: company.commercialName ?? undefined,
      rccm: company.rccm ?? undefined,
      nif: company.nif ?? undefined,
      legal_form: company.legalForm ?? undefined,
      sector: company.sector,
      main_activity: company.mainActivity ?? undefined,
      address: company.address ?? undefined,
      city: company.city,
      country: company.country ?? undefined,
      phone: company.phone ?? undefined,
      email: company.email ?? undefined,
      website: company.website ?? undefined,
      tax_center: company.taxCenter ?? undefined,
      tax_regime: company.taxRegime ?? undefined,
      currency: company.currency,
      accounting_standard: company.accountingStandard,
      manager_name: company.managerName ?? undefined,
      manager_title: company.managerTitle ?? undefined,
      accountant_name: company.accountantName ?? undefined,
      accountant_contact: company.accountantContact ?? undefined,
      auditor_name: company.auditorName ?? undefined,
      auditor_contact: company.auditorContact ?? undefined,
      notes: company.notes ?? undefined,
      status: company.status,
      progress: company.progress,
      fy: company.fiscalYears[0]?.label ?? '',
      updated: formatDate(company.updatedAt),
      updated_en: formatDate(company.updatedAt, 'en'),
    })),
    fiscalYears: fiscalYears.map((fy) => ({
      id: fy.id,
      company_id: fy.companyId,
      company_name: fy.company.name,
      label: fy.label,
      opening_date: formatDate(fy.openingDate),
      closing_date: formatDate(fy.closingDate),
      year_n: fy.yearN,
      year_n1: fy.yearN1,
      currency: fy.currency,
      status: fy.status,
      locked: fy.locked,
      created_by: '',
      progress: fy.progress,
      notes: fy.notes ?? undefined,
    })),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      user: log.userName,
      user_role: log.userRole,
      action: log.action,
      entity_type: log.entityType,
      entity_name: log.entityName,
      old_value: log.oldValue ?? undefined,
      new_value: log.newValue ?? undefined,
      reason: log.reason ?? undefined,
      timestamp: formatTime(log.createdAt),
      ip: log.ip ?? undefined,
      device: log.device ?? undefined,
    })),
    notifications: notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title_fr: notif.titleFr,
      title_en: notif.titleEn,
      body_fr: notif.bodyFr,
      body_en: notif.bodyEn,
      timestamp: formatTime(notif.createdAt),
      read: notif.read,
      action_href: notif.actionHref ?? undefined,
    })),
    trialBalance: trialBalance.map((line) => ({
      id: line.id,
      company_id: line.companyId ?? undefined,
      fiscal_year_id: line.fiscalYearId ?? undefined,
      balance_type: line.balanceType,
      acc: line.acc,
      label: line.label,
      debit: line.debit,
      credit: line.credit,
      n1_debit: line.n1Debit,
      n1_credit: line.n1Credit,
      opening_debit: line.openingDebit,
      opening_credit: line.openingCredit,
      movement_debit: line.movementDebit,
      movement_credit: line.movementCredit,
      net_balance: line.netBalance,
      account_class: line.accountClass ?? undefined,
      mapped: line.mapped,
      status: line.status,
    })),
  });
}
