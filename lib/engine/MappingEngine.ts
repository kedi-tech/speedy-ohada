import type {
  NormalizedAccount,
  MappingRule,
  ReportLine,
  SourceAccountRef,
  ReportType,
  ManualOverride,
  GroupedBalance,
} from './types';
import { matchesPrefix, matchesRange } from './AccountPrefixEngine';

export function accountMatchesMappingRule(account: NormalizedAccount, rule: MappingRule): boolean {
  const acc = account.account_number;

  if (rule.excluded_accounts?.includes(acc)) return false;
  if (rule.included_accounts?.length) return rule.included_accounts.includes(acc);

  let matched = false;
  if (rule.account_prefixes?.length && matchesPrefix(acc, rule.account_prefixes)) {
    matched = true;
  }
  if (rule.account_ranges?.length) {
    for (const range of rule.account_ranges) {
      if (matchesRange(acc, range.from, range.to)) matched = true;
    }
  }
  if (!matched) return false;

  if (account.net_balance === 0) return true;
  if (rule.normal_balance_type === 'debit') return account.net_balance > 0;
  if (rule.normal_balance_type === 'credit') return account.net_balance < 0;
  return true;
}

function applyDisplaySign(
  netBalance: number,
  displaySign: MappingRule['display_sign'],
): number {
  switch (displaySign) {
    case 'debit_positive':    return netBalance;
    case 'credit_positive':   return -netBalance;
    case 'subtract_from_gross': return Math.abs(netBalance);
    default:                  return netBalance;
  }
}

export interface MappingContext {
  accountsN:   NormalizedAccount[];
  accountsN1?: NormalizedAccount[];
  groupedBalanceN?: GroupedBalance[];
  groupedBalanceN1?: GroupedBalance[];
  overrides?:  ManualOverride[];
}

export interface MappingCoverageAccount {
  account_number: string;
  account_label: string;
  balance_type: NormalizedAccount['balance_type'];
  net_balance: number;
  matched_rule_ids: string[];
  matched_line_codes: string[];
  status: 'mapped' | 'unmapped' | 'conflict';
}

export interface MappingCoverageReport {
  total_accounts: number;
  mapped_accounts: number;
  unmapped_accounts: MappingCoverageAccount[];
  conflicting_accounts: MappingCoverageAccount[];
  coverage_percentage: number;
}

function groupToAccount(group: GroupedBalance): NormalizedAccount {
  const groupPrefix = group.group_code
    .replace(/^P\d_/, '')
    .replace(/^A_/, '')
    .replace(/^C/, '');
  return {
    id: group.group_code,
    account_number: groupPrefix,
    account_label: group.group_label_fr,
    opening_debit: group.opening_debit,
    opening_credit: group.opening_credit,
    movement_debit: group.movement_debit,
    movement_credit: group.movement_credit,
    closing_debit: group.closing_debit,
    closing_credit: group.closing_credit,
    net_balance: group.net_balance,
    balance_type: group.balance_type,
    fiscal_year_id: group.fiscal_year_id,
    company_id: group.company_id,
    organization_id: group.organization_id,
    warnings: [],
    account_class: group.account_class,
    prefix_1: group.prefix_level === 1 ? groupPrefix : undefined,
    prefix_2: group.prefix_level === 2 ? groupPrefix : undefined,
    prefix_3: group.prefix_level === 3 ? groupPrefix : undefined,
    prefix_4: group.prefix_level === 4 ? groupPrefix : undefined,
    prefix_5: group.prefix_level === 5 ? groupPrefix : undefined,
    prefix_6: group.prefix_level === 6 ? groupPrefix : undefined,
  };
}

function groupedSourcesForRule(groups: GroupedBalance[] | undefined, rule: MappingRule): NormalizedAccount[] | undefined {
  if (!groups) return undefined;

  return groups
    .filter((group) => {
      if (rule.included_accounts?.length || rule.excluded_accounts?.length || rule.account_ranges?.length) {
        return group.group_kind === 'account';
      }
      if (rule.account_prefixes?.length) {
        return group.group_kind === 'prefix'
          && rule.account_prefixes.some((prefix) => group.prefix_level === prefix.length);
      }
      return group.group_kind === 'account';
    })
    .map(groupToAccount);
}

export function applyMappingRule(
  rule: MappingRule,
  ctx: MappingContext,
): ReportLine {
  const sourceN = rule.source_type === 'grouped_balance'
    ? (groupedSourcesForRule(ctx.groupedBalanceN, rule) ?? [])
    : ctx.accountsN;
  const sourceN1 = rule.source_type === 'grouped_balance'
    ? groupedSourcesForRule(ctx.groupedBalanceN1, rule)
    : ctx.accountsN1;

  const matchedN  = sourceN.filter((a) => accountMatchesMappingRule(a, rule));
  const matchedN1 = sourceN1?.filter((a) => accountMatchesMappingRule(a, rule)) ?? [];

  const sumN  = matchedN.reduce((s, a) => s + applyDisplaySign(a.net_balance, rule.display_sign), 0);
  const sumN1 = matchedN1.reduce((s, a) => s + applyDisplaySign(a.net_balance, rule.display_sign), 0);

  const valueN  = sumN;
  const valueN1 = sourceN1 !== undefined ? sumN1 : null;

  const variationAmount = valueN1 !== null ? valueN - valueN1 : null;
  const variationPercentage =
    variationAmount !== null && valueN1 !== null && valueN1 !== 0
      ? (variationAmount / Math.abs(valueN1)) * 100
      : null;

  const sourceAccounts: SourceAccountRef[] = matchedN.map((a) => ({
    account_number: a.account_number,
    account_label:  a.account_label,
    net_balance:    a.net_balance,
    balance_type:   'N',
    mapping_rule_id: rule.id,
  }));

  // Check for override
  const override = ctx.overrides?.find(
    (o) =>
      o.report_type === rule.report_type &&
      o.report_line_code === rule.report_line_code &&
      (o.approval_status === 'approved' || o.approval_status === 'auto_approved'),
  );

  return {
    report_type:   rule.report_type,
    section_code:  rule.report_section,
    line_code:     rule.report_line_code,
    label_fr:      rule.label_fr,
    label_en:      rule.label_en,
    value_N:       override ? override.new_value : valueN,
    value_N_1:     valueN1,
    variation_amount:     variationAmount,
    variation_percentage: variationPercentage,
    source_accounts:  sourceAccounts,
    formula_used:     rule.formula_expression
      ? `${rule.formula_type ?? 'formula'}:${rule.formula_expression}`
      : `${rule.display_sign}(${rule.account_prefixes?.join(', ') ?? rule.account_ranges?.map((range) => `${range.from}-${range.to}`).join(', ') ?? rule.id})`,
    is_manual_override: !!override,
    override_reason:    override?.reason,
    override_id:        override?.id,
    validation_status:  'passed',
    display_order:      rule.display_order,
  };
}

function formulaRefValue(lines: ReportLine[], ref: string, field: 'value_N' | 'value_N_1') {
  const normalizedRef = ref.replace(/^\[|\]$/g, '').trim();
  const line = lines.find((item) => item.line_code === normalizedRef);
  return line?.[field] ?? 0;
}

function tokenizeFormula(expression: string): string[] {
  const tokens: string[] = [];
  const sanitized = expression.replace(/\s+/g, '');
  let index = 0;

  while (index < sanitized.length) {
    const char = sanitized[index];
    if ('+-*/(),'.includes(char)) {
      tokens.push(char);
      index += 1;
      continue;
    }

    const bracket = sanitized.slice(index).match(/^\[[A-Za-z0-9_]+\]/);
    if (bracket) {
      tokens.push(bracket[0]);
      index += bracket[0].length;
      continue;
    }

    const number = sanitized.slice(index).match(/^\d+(?:\.\d+)?/);
    if (number) {
      tokens.push(number[0]);
      index += number[0].length;
      continue;
    }

    const word = sanitized.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word) {
      tokens.push(word[0]);
      index += word[0].length;
      continue;
    }

    throw new Error(`Unsupported formula token near "${sanitized.slice(index)}"`);
  }

  return tokens;
}

function evaluateSimpleExpression(tokens: string[], lineValues: (ref: string) => number): number {
  let index = 0;

  const parseExpression = (): number => {
    let value = parseTerm();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const op = tokens[index++];
      const next = parseTerm();
      value = op === '+' ? value + next : value - next;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parseFactor();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const op = tokens[index++];
      const next = parseFactor();
      value = op === '*' ? value * next : next === 0 ? 0 : value / next;
    }
    return value;
  };

  const parseFactor = (): number => {
    const token = tokens[index++];
    if (token === undefined) return 0;
    if (token === '+') return parseFactor();
    if (token === '-') return -parseFactor();
    if (token === '(') {
      const value = parseExpression();
      if (tokens[index] === ')') index += 1;
      return value;
    }
    if (/^\d/.test(token)) return Number(token);
    if (/^\[[A-Za-z0-9_]+\]$/.test(token)) return lineValues(token);
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) return lineValues(token);
    return 0;
  };

  return parseExpression();
}

function evaluateFormulaExpression(expression: string | undefined, lines: ReportLine[], field: 'value_N' | 'value_N_1'): number | null {
  if (!expression) return null;
  const trimmed = expression.trim();
  if (!trimmed) return null;

  const sumMatch = trimmed.match(/^SUM\((.*)\)$/i);
  if (sumMatch) {
    return sumMatch[1]
      .split(',')
      .map((ref) => formulaRefValue(lines, ref, field))
      .reduce((total, value) => total + value, 0);
  }

  const subtractMatch = trimmed.match(/^SUBTRACT\((.*)\)$/i);
  if (subtractMatch) {
    const refs = subtractMatch[1].split(',').map((ref) => formulaRefValue(lines, ref, field));
    const [first = 0, ...rest] = refs;
    return rest.reduce((total, value) => total - value, first);
  }

  const tokens = tokenizeFormula(trimmed);
  return evaluateSimpleExpression(tokens, (ref) => formulaRefValue(lines, ref, field));
}

function applyFormulaRule(rule: MappingRule, baseLines: ReportLine[], ctx: MappingContext): ReportLine {
  const base = applyMappingRule(rule, ctx);
  const valueN = evaluateFormulaExpression(rule.formula_expression, baseLines, 'value_N') ?? base.value_N ?? 0;
  const valueN1 = ctx.accountsN1 || ctx.groupedBalanceN1
    ? evaluateFormulaExpression(rule.formula_expression, baseLines, 'value_N_1')
    : null;
  const variationAmount = valueN1 !== null ? valueN - valueN1 : null;
  const variationPercentage =
    variationAmount !== null && valueN1 !== null && valueN1 !== 0
      ? (variationAmount / Math.abs(valueN1)) * 100
      : null;
  const formulaRefs = (rule.formula_expression?.match(/\[?[A-Za-z_][A-Za-z0-9_]*\]?/g) ?? [])
    .map((ref) => ref.replace(/^\[|\]$/g, ''))
    .filter((ref) => !['SUM', 'SUBTRACT'].includes(ref.toUpperCase()));
  const sourceAccounts = baseLines
    .filter((line) => formulaRefs.includes(line.line_code))
    .flatMap((line) => line.source_accounts);
  const override = ctx.overrides?.find(
    (o) =>
      o.report_type === rule.report_type &&
      o.report_line_code === rule.report_line_code &&
      (o.approval_status === 'approved' || o.approval_status === 'auto_approved'),
  );

  return {
    ...base,
    value_N: override ? override.new_value : valueN,
    value_N_1: valueN1,
    variation_amount: variationAmount,
    variation_percentage: variationPercentage,
    source_accounts: sourceAccounts,
    formula_used: `formula:${rule.formula_expression ?? ''}`,
    is_manual_override: Boolean(override),
    override_reason: override?.reason,
    override_id: override?.id,
  };
}

export function applyAllMappingRules(
  rules: MappingRule[],
  ctx: MappingContext,
  reportType?: ReportType,
): ReportLine[] {
  const filtered = reportType ? rules.filter((r) => r.report_type === reportType && r.is_active) : rules.filter((r) => r.is_active);
  const sorted = filtered.sort((a, b) => a.display_order - b.display_order);
  const nonFormulaLines = sorted
    .filter((rule) => rule.display_sign !== 'formula' && !rule.formula_expression)
    .map((rule) => applyMappingRule(rule, ctx));
  const formulaLines: ReportLine[] = [];
  for (const rule of sorted.filter((item) => item.display_sign === 'formula' || item.formula_expression)) {
    formulaLines.push(applyFormulaRule(rule, [...nonFormulaLines, ...formulaLines], ctx));
  }

  return [...nonFormulaLines, ...formulaLines].sort((a, b) => a.display_order - b.display_order);
}

export function findLine(lines: ReportLine[], lineCode: string): ReportLine | undefined {
  return lines.find((l) => l.line_code === lineCode);
}

export function sumLines(lines: ReportLine[], lineCodes: string[], field: 'value_N' | 'value_N_1' = 'value_N'): number {
  return lineCodes.reduce((sum, code) => {
    const l = findLine(lines, code);
    return sum + (l?.[field] ?? 0);
  }, 0);
}

export function analyzeMappingCoverage(accounts: NormalizedAccount[], rules: MappingRule[]): MappingCoverageReport {
  const activeRules = rules.filter((rule) => rule.is_active && rule.display_sign !== 'formula' && !rule.formula_expression);
  const accountReports = accounts.map((account) => {
    const matches = activeRules.filter((rule) => accountMatchesMappingRule(account, rule));
    const status = matches.length === 0 ? 'unmapped' : matches.length > 1 ? 'conflict' : 'mapped';
    return {
      account_number: account.account_number,
      account_label: account.account_label,
      balance_type: account.balance_type,
      net_balance: account.net_balance,
      matched_rule_ids: matches.map((rule) => rule.id),
      matched_line_codes: matches.map((rule) => rule.report_line_code),
      status,
    } satisfies MappingCoverageAccount;
  });

  const mapped = accountReports.filter((account) => account.status === 'mapped');
  const unmapped = accountReports.filter((account) => account.status === 'unmapped');
  const conflicts = accountReports.filter((account) => account.status === 'conflict');

  return {
    total_accounts: accountReports.length,
    mapped_accounts: mapped.length,
    unmapped_accounts: unmapped,
    conflicting_accounts: conflicts,
    coverage_percentage: accountReports.length > 0 ? (mapped.length / accountReports.length) * 100 : 100,
  };
}
