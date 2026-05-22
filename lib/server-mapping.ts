import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { MappingRule } from '@/lib/engine/types';
import { DEFAULT_MAPPING_RULES } from '@/lib/engine/mappingRules';

type DbMappingRule = Awaited<ReturnType<PrismaClient['mappingRule']['findMany']>>[number];
type DbDecision = Awaited<ReturnType<PrismaClient['accountMappingDecision']['findMany']>>[number];

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));
const asStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.map(String);
};

const asRanges = (value: unknown): Array<{ from: string; to: string }> | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const maybe = item as { from?: unknown; to?: unknown };
      return maybe.from && maybe.to ? { from: String(maybe.from), to: String(maybe.to) } : null;
    })
    .filter((item): item is { from: string; to: string } => item !== null);
};

export function dbRuleToEngineRule(rule: DbMappingRule): MappingRule {
  return {
    id: rule.id,
    report_type: rule.reportType as MappingRule['report_type'],
    report_section: rule.reportSection,
    report_line_code: rule.reportLineCode,
    label_fr: rule.labelFr,
    label_en: rule.labelEn,
    account_prefixes: asStringArray(rule.accountPrefixes),
    account_ranges: asRanges(rule.accountRanges),
    included_accounts: asStringArray(rule.includedAccounts),
    excluded_accounts: asStringArray(rule.excludedAccounts),
    source_type: rule.sourceType as MappingRule['source_type'],
    normal_balance_type: rule.normalBalanceType as MappingRule['normal_balance_type'],
    display_sign: rule.displaySign as MappingRule['display_sign'],
    formula_type: rule.formulaType as MappingRule['formula_type'],
    formula_expression: rule.formulaExpression ?? undefined,
    display_order: rule.displayOrder,
    is_required: rule.isRequired,
    is_editable: rule.isEditable,
    allows_manual_override: rule.allowsManualOverride,
    is_active: rule.isActive,
  };
}

function defaultRuleData(rule: MappingRule, organizationId?: string | null) {
  return {
    id: rule.id,
    organizationId: organizationId ?? null,
    reportType: rule.report_type,
    reportSection: rule.report_section,
    reportLineCode: rule.report_line_code,
    labelFr: rule.label_fr,
    labelEn: rule.label_en,
    accountPrefixes: asJson(rule.account_prefixes ?? []),
    accountRanges: asJson(rule.account_ranges ?? []),
    includedAccounts: asJson(rule.included_accounts ?? []),
    excludedAccounts: asJson(rule.excluded_accounts ?? []),
    sourceType: rule.source_type,
    normalBalanceType: rule.normal_balance_type,
    displaySign: rule.display_sign,
    formulaType: rule.formula_type ?? null,
    formulaExpression: rule.formula_expression ?? null,
    displayOrder: rule.display_order,
    isRequired: rule.is_required,
    isEditable: rule.is_editable,
    allowsManualOverride: rule.allows_manual_override,
    isActive: rule.is_active,
  };
}

export async function ensureDefaultMappingRules(prisma: PrismaClient, _organizationId?: string | null) {
  await prisma.mappingRule.createMany({
    data: DEFAULT_MAPPING_RULES.map((rule) => defaultRuleData(rule, null)),
    skipDuplicates: true,
  });
}

export async function getEngineMappingRules(prisma: PrismaClient, organizationId?: string | null) {
  await ensureDefaultMappingRules(prisma, organizationId);
  const rules = await prisma.mappingRule.findMany({
    where: {
      organizationId: null,
      isActive: true,
    },
    orderBy: { displayOrder: 'asc' },
  });
  return rules.map(dbRuleToEngineRule);
}

export function applyMappingDecisionsToRules(rules: MappingRule[], decisions: DbDecision[]): MappingRule[] {
  const manualDecisions = decisions.filter((decision) => decision.status !== 'excluded' && decision.mappingRuleId);
  const excludedAccounts = decisions
    .filter((decision) => decision.status === 'excluded')
    .map((decision) => decision.accountNumber);

  return rules.map((rule) => {
    const included = new Set(rule.included_accounts ?? []);
    const excluded = new Set(rule.excluded_accounts ?? []);

    for (const account of excludedAccounts) {
      excluded.add(account);
      included.delete(account);
    }

    for (const decision of manualDecisions) {
      if (decision.mappingRuleId === rule.id) {
        included.add(decision.accountNumber);
        excluded.delete(decision.accountNumber);
      } else {
        excluded.add(decision.accountNumber);
      }
    }

    return {
      ...rule,
      included_accounts: [...included],
      excluded_accounts: [...excluded],
    };
  });
}

export async function getEffectiveMappingRules(
  prisma: PrismaClient,
  params: { organizationId?: string | null; fiscalYearId: string },
) {
  const [rules, decisions] = await Promise.all([
    getEngineMappingRules(prisma, params.organizationId),
    prisma.accountMappingDecision.findMany({
      where: { fiscalYearId: params.fiscalYearId },
    }),
  ]);

  return applyMappingDecisionsToRules(rules, decisions);
}
