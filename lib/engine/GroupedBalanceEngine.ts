import type { NormalizedAccount, GroupedBalance, GroupRule, BalanceType } from './types';
import { matchesPrefix, matchesRange } from './AccountPrefixEngine';
import { buildOHADAClassSummaries, OHADA_CLASSES } from './OHADAClassEngine';

function accountMatchesRule(account: NormalizedAccount, rule: GroupRule): boolean {
  const acc = account.account_number;

  // Excluded accounts take priority
  if (rule.excluded_accounts?.includes(acc)) return false;

  // Explicit inclusion list
  if (rule.included_accounts?.length) {
    return rule.included_accounts.includes(acc);
  }

  // Prefix matching
  if (rule.match_prefixes?.length && matchesPrefix(acc, rule.match_prefixes)) {
    return true;
  }

  // Range matching
  if (rule.match_ranges?.length) {
    for (const range of rule.match_ranges) {
      if (matchesRange(acc, range.from, range.to)) return true;
    }
  }

  return false;
}

export function buildGroupedBalance(
  accounts: NormalizedAccount[],
  rules: GroupRule[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance[] {
  return rules.map((rule) => {
    const matched = accounts.filter((a) => accountMatchesRule(a, rule));

    const sum = (fn: (a: NormalizedAccount) => number) =>
      matched.reduce((s, a) => s + fn(a), 0);

    const openingDebit  = sum((a) => a.opening_debit);
    const openingCredit = sum((a) => a.opening_credit);
    const movDebit      = sum((a) => a.movement_debit);
    const movCredit     = sum((a) => a.movement_credit);
    const closingDebit  = sum((a) => a.closing_debit);
    const closingCredit = sum((a) => a.closing_credit);
    const netBalance    = closingDebit - closingCredit;

    return {
      organization_id: organizationId,
      company_id:      companyId,
      fiscal_year_id:  fiscalYearId,
      balance_type:    balanceType,
      group_kind:      'custom',
      group_code:      rule.group_code,
      group_label_fr:  rule.group_label_fr,
      group_label_en:  rule.group_label_en,
      account_class:   rule.account_class,
      prefix_level:    rule.prefix_level,
      account_count:   matched.length,
      opening_debit:   openingDebit,
      opening_credit:  openingCredit,
      movement_debit:  movDebit,
      movement_credit: movCredit,
      closing_debit:   closingDebit,
      closing_credit:  closingCredit,
      net_balance:     netBalance,
      source_accounts: matched.map((a) => a.account_number),
    };
  });
}

export function findGroup(groups: GroupedBalance[], groupCode: string, balanceType: BalanceType): GroupedBalance | undefined {
  return groups.find((g) => g.group_code === groupCode && g.balance_type === balanceType);
}

function sumAccounts(accounts: NormalizedAccount[]) {
  const sum = (fn: (account: NormalizedAccount) => number) =>
    accounts.reduce((total, account) => total + fn(account), 0);

  return {
    opening_debit: sum((account) => account.opening_debit),
    opening_credit: sum((account) => account.opening_credit),
    movement_debit: sum((account) => account.movement_debit),
    movement_credit: sum((account) => account.movement_credit),
    closing_debit: sum((account) => account.closing_debit),
    closing_credit: sum((account) => account.closing_credit),
    net_balance: sum((account) => account.net_balance),
  };
}

function accountLabel(account: NormalizedAccount): string {
  return account.account_label || `Account ${account.account_number}`;
}

function sortedAccounts(accounts: NormalizedAccount[]): NormalizedAccount[] {
  return [...accounts].sort((a, b) => a.account_number.localeCompare(b.account_number));
}

function sourceAccountNumbers(accounts: NormalizedAccount[]): string[] {
  return sortedAccounts(accounts).map((account) => account.account_number);
}

function prefixFor(account: NormalizedAccount, level: number): string | undefined {
  const value = account[`prefix_${level}` as keyof NormalizedAccount];
  return typeof value === 'string' && value ? value : undefined;
}

function buildAccountRows(
  accounts: NormalizedAccount[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance[] {
  return sortedAccounts(accounts).map((account) => ({
    organization_id: organizationId,
    company_id: companyId,
    fiscal_year_id: fiscalYearId,
    balance_type: balanceType,
    group_kind: 'account',
    group_code: `A_${account.account_number}`,
    parent_group_code: prefixFor(account, 6)
      ? `P6_${prefixFor(account, 6)}`
      : account.account_class
        ? `C${account.account_class}`
        : undefined,
    group_label_fr: accountLabel(account),
    group_label_en: accountLabel(account),
    account_class: account.account_class,
    prefix_level: 99,
    account_count: 1,
    opening_debit: account.opening_debit,
    opening_credit: account.opening_credit,
    movement_debit: account.movement_debit,
    movement_credit: account.movement_credit,
    closing_debit: account.closing_debit,
    closing_credit: account.closing_credit,
    net_balance: account.net_balance,
    source_accounts: [account.account_number],
  }));
}

function buildPrefixRows(
  accounts: NormalizedAccount[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance[] {
  const rows: GroupedBalance[] = [];

  for (let level = 1; level <= 6; level += 1) {
    const byPrefix = new Map<string, NormalizedAccount[]>();

    for (const account of accounts) {
      const prefix = prefixFor(account, level);
      if (!prefix) continue;
      const existing = byPrefix.get(prefix) ?? [];
      existing.push(account);
      byPrefix.set(prefix, existing);
    }

    for (const [prefix, prefixAccounts] of [...byPrefix.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const first = sortedAccounts(prefixAccounts)[0];
      const sums = sumAccounts(prefixAccounts);
      const parentPrefix = level === 1 ? undefined : prefix.slice(0, level - 1);

      rows.push({
        organization_id: organizationId,
        company_id: companyId,
        fiscal_year_id: fiscalYearId,
        balance_type: balanceType,
        group_kind: 'prefix',
        group_code: `P${level}_${prefix}`,
        parent_group_code: level === 1
          ? (first?.account_class ? `C${first.account_class}` : undefined)
          : `P${level - 1}_${parentPrefix}`,
        group_label_fr: `Prefixe ${level} - ${prefix}`,
        group_label_en: `Prefix ${level} - ${prefix}`,
        account_class: first?.account_class,
        prefix_level: level,
        account_count: prefixAccounts.length,
        ...sums,
        source_accounts: sourceAccountNumbers(prefixAccounts),
      });
    }
  }

  return rows;
}

function buildClassRows(
  accounts: NormalizedAccount[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance[] {
  return buildOHADAClassSummaries(accounts).map((summary) => ({
    organization_id: organizationId,
    company_id: companyId,
    fiscal_year_id: fiscalYearId,
    balance_type: balanceType,
    group_kind: 'class',
    group_code: `C${summary.class_number}`,
    parent_group_code: 'TB_TOTAL',
    group_label_fr: summary.label_fr,
    group_label_en: summary.label_en,
    account_class: summary.class_number,
    prefix_level: 0,
    account_count: summary.account_count,
    opening_debit: summary.opening_debit,
    opening_credit: summary.opening_credit,
    movement_debit: summary.movement_debit,
    movement_credit: summary.movement_credit,
    closing_debit: summary.closing_debit,
    closing_credit: summary.closing_credit,
    net_balance: summary.net_balance,
    source_accounts: summary.source_accounts,
  }));
}

function buildTotalRow(
  accounts: NormalizedAccount[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance {
  const sums = sumAccounts(accounts);

  return {
    organization_id: organizationId,
    company_id: companyId,
    fiscal_year_id: fiscalYearId,
    balance_type: balanceType,
    group_kind: 'total',
    group_code: 'TB_TOTAL',
    group_label_fr: 'Total balance regroupee',
    group_label_en: 'Grouped balance total',
    account_count: accounts.length,
    ...sums,
    source_accounts: sourceAccountNumbers(accounts),
  };
}

export function buildWorkbookStyleGroupedBalance(
  accounts: NormalizedAccount[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): GroupedBalance[] {
  const statementAccounts = accounts.filter((account) => {
    if (account.account_class === undefined) return false;
    const cls = OHADA_CLASSES[account.account_class];
    return Boolean(cls?.included_in_statements);
  });

  return [
    buildTotalRow(statementAccounts, balanceType, fiscalYearId, companyId, organizationId),
    ...buildClassRows(statementAccounts, balanceType, fiscalYearId, companyId, organizationId),
    ...buildPrefixRows(statementAccounts, balanceType, fiscalYearId, companyId, organizationId),
    ...buildAccountRows(statementAccounts, balanceType, fiscalYearId, companyId, organizationId),
  ];
}
