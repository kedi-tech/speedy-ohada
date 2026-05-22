import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { dbRuleToEngineRule, ensureDefaultMappingRules } from '@/lib/server-mapping';
import { runAndPersistCalculation } from '@/lib/server-calculations';
import { accountMatchesMappingRule, analyzeMappingCoverage } from '@/lib/engine/MappingEngine';
import type { BalanceType, MappingRule, NormalizedAccount } from '@/lib/engine/types';

function lineToNormalizedAccount(line: Awaited<ReturnType<typeof prisma.trialBalanceLine.findMany>>[number]): NormalizedAccount {
  const balanceType = line.balanceType as BalanceType;
  const closingDebit = balanceType === 'N-1' ? line.n1Debit : line.debit;
  const closingCredit = balanceType === 'N-1' ? line.n1Credit : line.credit;

  return {
    id: line.id,
    account_number: line.acc,
    account_label: line.label,
    opening_debit: line.openingDebit,
    opening_credit: line.openingCredit,
    movement_debit: line.movementDebit,
    movement_credit: line.movementCredit,
    closing_debit: closingDebit,
    closing_credit: closingCredit,
    net_balance: line.netBalance,
    balance_type: balanceType,
    fiscal_year_id: line.fiscalYearId ?? '',
    company_id: line.companyId ?? '',
    organization_id: line.organizationId ?? '',
    warnings: Array.isArray(line.warnings) ? line.warnings.map(String) : [],
    prefix_1: line.prefix1 ?? undefined,
    prefix_2: line.prefix2 ?? undefined,
    prefix_3: line.prefix3 ?? undefined,
    prefix_4: line.prefix4 ?? undefined,
    prefix_5: line.prefix5 ?? undefined,
    prefix_6: line.prefix6 ?? undefined,
    account_class: line.accountClass ?? undefined,
    account_class_label_fr: line.accountClassLabelFr ?? undefined,
    account_class_label_en: line.accountClassLabelEn ?? undefined,
  };
}

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });

  await ensureDefaultMappingRules(prisma, fiscalYear.company.organizationId);

  const [dbRules, lines, decisions] = await Promise.all([
    prisma.mappingRule.findMany({
      where: { organizationId: null, isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.trialBalanceLine.findMany({
      where: { fiscalYearId, balanceType: 'N' },
      orderBy: { acc: 'asc' },
    }),
    prisma.accountMappingDecision.findMany({
      where: { fiscalYearId, balanceType: 'N' },
    }),
  ]);

  const rules = dbRules.map(dbRuleToEngineRule);
  const decisionsByAccount = new Map(decisions.map((decision) => [decision.accountNumber, decision]));
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
  const normalizedLines = lines.map(lineToNormalizedAccount);
  const coverage = analyzeMappingCoverage(normalizedLines, rules);
  const conflictsByAccount = new Map(coverage.conflicting_accounts.map((account) => [account.account_number, account]));

  const rows = lines.map((line) => {
    const decision = decisionsByAccount.get(line.acc);
    const normalized = normalizedLines.find((account) => account.account_number === line.acc);
    const conflict = conflictsByAccount.get(line.acc);
    const matchedRule = decision?.mappingRuleId
      ? rulesById.get(decision.mappingRuleId)
      : normalized
        ? rules.find((rule) => accountMatchesMappingRule(normalized, rule) && rule.display_sign !== 'formula' && !rule.formula_expression)
        : undefined;
    const status = decision?.status ?? (conflict ? 'conflict' : matchedRule ? 'auto' : 'unmapped');
    const mappedLabel = status === 'excluded'
      ? 'Excluded'
      : conflict && !decision
        ? `Conflict: ${conflict.matched_line_codes.join(', ')}`
      : matchedRule
        ? `${matchedRule.report_type} / ${matchedRule.label_fr}`
        : '';

    return {
      id: line.id,
      acc: line.acc,
      label: line.label,
      debit: line.debit,
      credit: line.credit,
      n1Debit: line.n1Debit,
      n1Credit: line.n1Credit,
      netBalance: line.netBalance,
      accountClass: line.accountClass,
      status,
      mappingRuleId: matchedRule?.id ?? '',
      mappedLabel,
      reason: decision?.reason ?? '',
      matchedRuleIds: conflict?.matched_rule_ids ?? (matchedRule ? [matchedRule.id] : []),
    };
  });

  return NextResponse.json({
    meta: {
      companyName: fiscalYear.company.name,
      fiscalYearLabel: fiscalYear.label,
      currency: fiscalYear.currency,
      mappingCoverage: {
        totalAccounts: coverage.total_accounts,
        mappedAccounts: coverage.mapped_accounts,
        unmappedAccounts: coverage.unmapped_accounts.length,
        conflictingAccounts: coverage.conflicting_accounts.length,
        coveragePercentage: coverage.coverage_percentage,
      },
    },
    rules: rules.map((rule) => ({
      id: rule.id,
      reportType: rule.report_type,
      reportLineCode: rule.report_line_code,
      labelFr: rule.label_fr,
      labelEn: rule.label_en,
      displayOrder: rule.display_order,
    })),
    rows,
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const accountNumber = String(body.accountNumber ?? '').trim();
  const trialBalanceLineId = String(body.trialBalanceLineId ?? '').trim();
  const status = String(body.status ?? 'manual').trim();
  const mappingRuleId = String(body.mappingRuleId ?? '').trim();
  const reason = String(body.reason ?? '').trim();

  if (!fiscalYearId || !accountNumber) {
    return NextResponse.json({ error: 'Fiscal year and account are required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) {
    return NextResponse.json({ error: 'This fiscal year is locked. Unlock it before changing mappings.' }, { status: 423 });
  }

  const rule = mappingRuleId
    ? await prisma.mappingRule.findUnique({ where: { id: mappingRuleId } })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.accountMappingDecision.upsert({
      where: {
        fiscalYearId_accountNumber_balanceType: {
          fiscalYearId,
          accountNumber,
          balanceType: 'N',
        },
      },
      create: {
        organizationId: fiscalYear.company.organizationId,
        companyId: fiscalYear.companyId,
        fiscalYearId,
        trialBalanceLineId: trialBalanceLineId || null,
        accountNumber,
        balanceType: 'N',
        mappingRuleId: status === 'excluded' ? null : mappingRuleId || null,
        reportLineCode: status === 'excluded' ? null : rule?.reportLineCode ?? null,
        status,
        reason: reason || null,
        source: 'manual',
        userId: session.id,
      },
      update: {
        trialBalanceLineId: trialBalanceLineId || null,
        mappingRuleId: status === 'excluded' ? null : mappingRuleId || null,
        reportLineCode: status === 'excluded' ? null : rule?.reportLineCode ?? null,
        status,
        reason: reason || null,
        source: 'manual',
        userId: session.id,
      },
    });

    await tx.trialBalanceLine.updateMany({
      where: { fiscalYearId, acc: accountNumber, balanceType: 'N' },
      data: {
        mapped: status === 'excluded' ? 'Excluded' : rule?.labelFr ?? '',
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'mapping_decision',
        entityType: 'trial_balance_line',
        entityName: accountNumber,
        newValue: status === 'excluded' ? 'excluded' : rule?.reportLineCode ?? mappingRuleId,
        reason: reason || 'Manual account mapping update',
      },
    });
  });

  const recalculation = await runAndPersistCalculation(prisma, {
    fiscalYearId,
    session,
    triggerReason: 'mapping_change',
  });

  if ('error' in recalculation) {
    return NextResponse.json({ saved: true, recalculated: false, error: recalculation.error }, { status: 200 });
  }

  return NextResponse.json({
    saved: true,
    recalculated: true,
    runId: recalculation.run.id,
  });
}
