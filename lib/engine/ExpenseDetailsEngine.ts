import type { NormalizedAccount, SourceAccountRef } from './types';
import { matchesPrefix } from './AccountPrefixEngine';
import type { IncomeStatementReport } from './IncomeStatementEngine';

export interface ExpenseCategory {
  code: string;
  label_fr: string;
  label_en: string;
  prefixes: string[];
  income_statement_lines: string[];
  note_numbers: number[];
  fiscal_treatment: 'deductible' | 'review' | 'non_deductible' | 'tax';
  display_order: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { code: '601_MARCHANDISES', label_fr: 'Achats de marchandises', label_en: 'Purchases of goods for resale', prefixes: ['601'], income_statement_lines: ['ACHATS'], note_numbers: [15, 34], fiscal_treatment: 'deductible', display_order: 601 },
  { code: '602_MATIERES', label_fr: 'Achats de matieres premieres', label_en: 'Raw material purchases', prefixes: ['602'], income_statement_lines: ['ACHATS'], note_numbers: [15, 34], fiscal_treatment: 'deductible', display_order: 602 },
  { code: '603_VARIATION_STOCKS', label_fr: 'Variations de stocks', label_en: 'Inventory changes', prefixes: ['603'], income_statement_lines: ['ACHATS'], note_numbers: [6, 15, 34], fiscal_treatment: 'deductible', display_order: 603 },
  { code: '604_AUTRES_ACHATS', label_fr: 'Autres achats', label_en: 'Other purchases', prefixes: ['604', '605', '608'], income_statement_lines: ['ACHATS'], note_numbers: [15, 34], fiscal_treatment: 'deductible', display_order: 604 },
  { code: '61_TRANSPORTS', label_fr: 'Transports', label_en: 'Transport', prefixes: ['61'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [15, 34], fiscal_treatment: 'deductible', display_order: 610 },
  { code: '621_LOCATIONS', label_fr: 'Locations et charges locatives', label_en: 'Rentals and lease charges', prefixes: ['621'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [30, 34], fiscal_treatment: 'review', display_order: 621 },
  { code: '622_ENTRETIEN', label_fr: 'Entretien, reparations et maintenance', label_en: 'Repairs and maintenance', prefixes: ['622'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [28, 34], fiscal_treatment: 'review', display_order: 622 },
  { code: '623_PRIMES_ASSURANCE', label_fr: 'Primes d assurance', label_en: 'Insurance premiums', prefixes: ['623'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [28, 34], fiscal_treatment: 'review', display_order: 623 },
  { code: '624_DOCUMENTATION', label_fr: 'Documentation et annonces', label_en: 'Documentation and announcements', prefixes: ['624'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [34], fiscal_treatment: 'deductible', display_order: 624 },
  { code: '625_PUBLICITE', label_fr: 'Publicite, publications et relations publiques', label_en: 'Advertising and public relations', prefixes: ['625'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [34], fiscal_treatment: 'review', display_order: 625 },
  { code: '626_COMMUNICATION', label_fr: 'Frais postaux et telecommunications', label_en: 'Postage and telecommunications', prefixes: ['626'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [34], fiscal_treatment: 'deductible', display_order: 626 },
  { code: '627_SERVICES_BANCAIRES', label_fr: 'Services bancaires', label_en: 'Banking services', prefixes: ['627'], income_statement_lines: ['SERVICES_EXT', 'CHARGES_FIN'], note_numbers: [19, 34], fiscal_treatment: 'deductible', display_order: 627 },
  { code: '628_HONORAIRES', label_fr: 'Honoraires et remunerations intermediaires', label_en: 'Fees and intermediary remuneration', prefixes: ['628'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [28, 34], fiscal_treatment: 'review', display_order: 628 },
  { code: '63_AUTRES_SERVICES', label_fr: 'Autres services exterieurs', label_en: 'Other external services', prefixes: ['63'], income_statement_lines: ['SERVICES_EXT'], note_numbers: [15, 34], fiscal_treatment: 'deductible', display_order: 630 },
  { code: '64_IMPOTS_TAXES', label_fr: 'Impots et taxes', label_en: 'Taxes and duties', prefixes: ['64'], income_statement_lines: ['IMPOTS_TAXES'], note_numbers: [16, 29, 34], fiscal_treatment: 'tax', display_order: 640 },
  { code: '65_AUTRES_CHARGES', label_fr: 'Autres charges', label_en: 'Other expenses', prefixes: ['65'], income_statement_lines: ['AUTRES_CHARGES_EXPLOIT'], note_numbers: [34], fiscal_treatment: 'review', display_order: 650 },
  { code: '66_PERSONNEL', label_fr: 'Charges de personnel', label_en: 'Personnel expenses', prefixes: ['66'], income_statement_lines: ['CHARGES_PERS'], note_numbers: [17, 34], fiscal_treatment: 'deductible', display_order: 660 },
  { code: '67_FINANCIERES', label_fr: 'Charges financieres', label_en: 'Financial expenses', prefixes: ['67'], income_statement_lines: ['CHARGES_FIN'], note_numbers: [19, 34], fiscal_treatment: 'review', display_order: 670 },
  { code: '681_DOTATIONS_EXPLOIT', label_fr: 'Dotations exploitation', label_en: 'Operating depreciation and provisions', prefixes: ['681', '682', '683', '684', '685', '686', '687'], income_statement_lines: ['DOTATIONS_AMORT'], note_numbers: [18, 27, 34], fiscal_treatment: 'review', display_order: 681 },
  { code: '69_IMPOT_RESULTAT', label_fr: 'Impots sur le resultat', label_en: 'Income tax expense', prefixes: ['69'], income_statement_lines: ['IMPOT_RESULTAT'], note_numbers: [21, 35], fiscal_treatment: 'non_deductible', display_order: 690 },
];

export interface ExpenseLine {
  account_number: string;
  account_label: string;
  category_code: string;
  category_fr: string;
  category_en: string;
  amount_N: number;
  amount_N1: number | null;
  variation: number | null;
  variation_percentage: number | null;
  income_statement_lines: string[];
  note_numbers: number[];
  fiscal_treatment: ExpenseCategory['fiscal_treatment'];
  source_account: SourceAccountRef;
}

export interface ExpenseCategorySummary {
  code: string;
  label_fr: string;
  label_en: string;
  amount_N: number;
  amount_N1: number | null;
  variation: number | null;
  variation_percentage: number | null;
  income_statement_lines: string[];
  note_numbers: number[];
  fiscal_treatment: ExpenseCategory['fiscal_treatment'];
  display_order: number;
  lines: ExpenseLine[];
}

export interface ExpenseReconciliation {
  class6_total_N: number;
  income_statement_expense_total_N: number;
  difference_N: number;
  class6_total_N1: number | null;
  income_statement_expense_total_N1: number | null;
  difference_N1: number | null;
  reconciled: boolean;
}

export interface ExpenseDetailsReport {
  categories: ExpenseCategorySummary[];
  total_expenses_N: number;
  total_expenses_N1: number | null;
  total_variation: number | null;
  reconciliation: ExpenseReconciliation;
  fiscal_review_total_N: number;
  non_deductible_total_N: number;
  source_accounts: SourceAccountRef[];
}

function findCategory(accountNumber: string): ExpenseCategory | undefined {
  return [...EXPENSE_CATEGORIES]
    .sort((a, b) => Math.max(...b.prefixes.map((p) => p.length)) - Math.max(...a.prefixes.map((p) => p.length)))
    .find((category) => matchesPrefix(accountNumber, category.prefixes));
}

function amountForExpense(account: NormalizedAccount): number {
  return account.net_balance;
}

function makeSource(account: NormalizedAccount, balanceType: 'N' | 'N-1', ruleId: string): SourceAccountRef {
  return {
    account_number: account.account_number,
    account_label: account.account_label,
    net_balance: account.net_balance,
    balance_type: balanceType,
    mapping_rule_id: ruleId,
  };
}

function ensureCategory(map: Map<string, ExpenseCategorySummary>, category: ExpenseCategory): ExpenseCategorySummary {
  const existing = map.get(category.code);
  if (existing) return existing;
  const created: ExpenseCategorySummary = {
    code: category.code,
    label_fr: category.label_fr,
    label_en: category.label_en,
    amount_N: 0,
    amount_N1: null,
    variation: null,
    variation_percentage: null,
    income_statement_lines: category.income_statement_lines,
    note_numbers: category.note_numbers,
    fiscal_treatment: category.fiscal_treatment,
    display_order: category.display_order,
    lines: [],
  };
  map.set(category.code, created);
  return created;
}

const EXPENSE_INCOME_STATEMENT_LINES = [
  'ACHATS',
  'SERVICES_EXT',
  'IMPOTS_TAXES',
  'CHARGES_PERS',
  'AUTRES_CHARGES_EXPLOIT',
  'DOTATIONS_AMORT',
  'CHARGES_FIN',
  'IMPOT_RESULTAT',
] as const;

function incomeStatementExpenseTotal(
  incomeStatement: IncomeStatementReport | undefined,
  field: 'value_N' | 'value_N_1',
): number | null {
  if (!incomeStatement) return null;
  return EXPENSE_INCOME_STATEMENT_LINES.reduce((total, lineCode) => {
    const line = incomeStatement.lines.find((statementLine) => statementLine.line_code === lineCode);
    return total + (line?.[field] ?? 0);
  }, 0);
}

export function calculateExpenseDetails(
  accountsN: NormalizedAccount[],
  accountsN1: NormalizedAccount[] | undefined,
  incomeStatement?: IncomeStatementReport,
): ExpenseDetailsReport {
  const class6N = accountsN.filter((account) => account.account_class === 6);
  const class6N1 = accountsN1?.filter((account) => account.account_class === 6) ?? [];
  const n1Map = new Map(class6N1.map((account) => [account.account_number, account]));
  const hasN1 = accountsN1 !== undefined;
  const categoryMap = new Map<string, ExpenseCategorySummary>();

  for (const category of EXPENSE_CATEGORIES) {
    ensureCategory(categoryMap, category);
  }

  const otherCategory: ExpenseCategory = {
    code: 'OTHER_CLASS6',
    label_fr: 'Autres charges non classees',
    label_en: 'Other unclassified expenses',
    prefixes: [],
    income_statement_lines: ['TOTAL_CHARGES_EXPLOIT'],
    note_numbers: [34],
    fiscal_treatment: 'review',
    display_order: 999,
  };
  ensureCategory(categoryMap, otherCategory);

  for (const account of class6N) {
    const category = findCategory(account.account_number) ?? otherCategory;
    const entry = ensureCategory(categoryMap, category);
    const n1Account = n1Map.get(account.account_number);
    const amountN = amountForExpense(account);
    const amountN1 = n1Account ? amountForExpense(n1Account) : hasN1 ? 0 : null;
    const variation = amountN1 !== null ? amountN - amountN1 : null;
    const variationPercentage = variation !== null && amountN1 !== null && amountN1 !== 0
      ? (variation / Math.abs(amountN1)) * 100
      : null;

    entry.amount_N += amountN;
    entry.amount_N1 = (entry.amount_N1 ?? 0) + (amountN1 ?? 0);
    if (!hasN1) entry.amount_N1 = null;
    entry.lines.push({
      account_number: account.account_number,
      account_label: account.account_label,
      category_code: category.code,
      category_fr: category.label_fr,
      category_en: category.label_en,
      amount_N: amountN,
      amount_N1: amountN1,
      variation,
      variation_percentage: variationPercentage,
      income_statement_lines: category.income_statement_lines,
      note_numbers: category.note_numbers,
      fiscal_treatment: category.fiscal_treatment,
      source_account: makeSource(account, 'N', category.code),
    });
  }

  for (const entry of categoryMap.values()) {
    if (entry.amount_N1 !== null) {
      entry.variation = entry.amount_N - entry.amount_N1;
      entry.variation_percentage = entry.amount_N1 !== 0
        ? (entry.variation / Math.abs(entry.amount_N1)) * 100
        : null;
    }
    entry.lines.sort((a, b) => a.account_number.localeCompare(b.account_number));
  }

  const categories = [...categoryMap.values()]
    .filter((category) => category.amount_N !== 0 || category.lines.length > 0)
    .sort((a, b) => a.display_order - b.display_order);
  const totalN = categories.reduce((total, category) => total + category.amount_N, 0);
  const totalN1 = hasN1 ? categories.reduce((total, category) => total + (category.amount_N1 ?? 0), 0) : null;
  const totalVariation = totalN1 !== null ? totalN - totalN1 : null;
  const nonDeductibleTotal = categories
    .filter((category) => category.fiscal_treatment === 'non_deductible')
    .reduce((total, category) => total + category.amount_N, 0);
  const fiscalReviewTotal = categories
    .filter((category) => category.fiscal_treatment === 'review' || category.fiscal_treatment === 'tax')
    .reduce((total, category) => total + category.amount_N, 0);
  const incomeTotalN = incomeStatementExpenseTotal(incomeStatement, 'value_N') ?? totalN;
  const incomeTotalN1 = totalN1 !== null ? incomeStatementExpenseTotal(incomeStatement, 'value_N_1') ?? totalN1 : null;
  const differenceN = totalN - incomeTotalN;
  const differenceN1 = totalN1 !== null && incomeTotalN1 !== null ? totalN1 - incomeTotalN1 : null;

  return {
    categories,
    total_expenses_N: totalN,
    total_expenses_N1: totalN1,
    total_variation: totalVariation,
    reconciliation: {
      class6_total_N: totalN,
      income_statement_expense_total_N: incomeTotalN,
      difference_N: differenceN,
      class6_total_N1: totalN1,
      income_statement_expense_total_N1: incomeTotalN1,
      difference_N1: differenceN1,
      reconciled: Math.abs(differenceN) <= 0.0001 && (differenceN1 === null || Math.abs(differenceN1) <= 0.0001),
    },
    fiscal_review_total_N: fiscalReviewTotal,
    non_deductible_total_N: nonDeductibleTotal,
    source_accounts: categories.flatMap((category) => category.lines.map((line) => line.source_account)),
  };
}
