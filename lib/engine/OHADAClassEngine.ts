import type { NormalizedAccount } from './types';

export interface OHADAClass {
  class_number: number;
  label_fr: string;
  label_en: string;
  included_in_statements: boolean;
}

export interface OHADAClassSummary {
  class_number: number;
  label_fr: string;
  label_en: string;
  included_in_statements: boolean;
  account_count: number;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  closing_debit: number;
  closing_credit: number;
  net_balance: number;
  source_accounts: string[];
}

export const OHADA_CLASSES: Record<number, OHADAClass> = {
  1: {
    class_number: 1,
    label_fr: 'Ressources durables, capitaux propres, emprunts, dettes financières',
    label_en: 'Long-term resources, equity, loans, financial debts',
    included_in_statements: true,
  },
  2: {
    class_number: 2,
    label_fr: 'Immobilisations',
    label_en: 'Fixed assets',
    included_in_statements: true,
  },
  3: {
    class_number: 3,
    label_fr: 'Stocks',
    label_en: 'Inventory',
    included_in_statements: true,
  },
  4: {
    class_number: 4,
    label_fr: 'Comptes de tiers',
    label_en: 'Third-party accounts',
    included_in_statements: true,
  },
  5: {
    class_number: 5,
    label_fr: 'Trésorerie',
    label_en: 'Treasury, bank, cash',
    included_in_statements: true,
  },
  6: {
    class_number: 6,
    label_fr: 'Charges',
    label_en: 'Expenses',
    included_in_statements: true,
  },
  7: {
    class_number: 7,
    label_fr: 'Produits',
    label_en: 'Income / revenue',
    included_in_statements: true,
  },
  8: {
    class_number: 8,
    label_fr: 'Autres charges et produits, comptes spéciaux',
    label_en: 'Other expenses and income, special accounts',
    included_in_statements: true,
  },
  9: {
    class_number: 9,
    label_fr: 'Comptabilité analytique ou engagements',
    label_en: 'Analytical accounting or commitments',
    included_in_statements: false,
  },
};

export function detectClass(accountNumber: string): number | null {
  const firstDigit = accountNumber.replace(/\s+/g, '')[0];
  if (!firstDigit || !/\d/.test(firstDigit)) return null;
  return parseInt(firstDigit, 10);
}

export function enrichWithClass(account: NormalizedAccount): NormalizedAccount {
  const classNumber = detectClass(account.account_number);
  if (classNumber === null) {
    return {
      ...account,
      warnings: [...account.warnings, `Cannot determine OHADA class for account "${account.account_number}".`],
    };
  }
  const cls = OHADA_CLASSES[classNumber];
  const warnings = [...account.warnings];
  if (!cls) {
    warnings.push(`Unknown OHADA class ${classNumber} for account "${account.account_number}".`);
  }
  return {
    ...account,
    account_class: classNumber,
    account_class_label_fr: cls?.label_fr,
    account_class_label_en: cls?.label_en,
    warnings,
  };
}

export function enrichAllWithClass(accounts: NormalizedAccount[]): NormalizedAccount[] {
  return accounts.map(enrichWithClass);
}

export function filterByClass(accounts: NormalizedAccount[], classNumbers: number[]): NormalizedAccount[] {
  return accounts.filter((a) => a.account_class !== undefined && classNumbers.includes(a.account_class));
}

export function filterForStatements(accounts: NormalizedAccount[], includeClass9 = false): NormalizedAccount[] {
  return accounts.filter((a) => {
    if (a.account_class === undefined) return false;
    const cls = OHADA_CLASSES[a.account_class];
    if (!cls) return false;
    if (a.account_class === 9) return includeClass9;
    return cls.included_in_statements;
  });
}

export function summarizeClass(classNumber: number, accounts: NormalizedAccount[]): OHADAClassSummary {
  const cls = OHADA_CLASSES[classNumber] ?? {
    class_number: classNumber,
    label_fr: `Classe ${classNumber}`,
    label_en: `Class ${classNumber}`,
    included_in_statements: false,
  };

  const sum = (fn: (account: NormalizedAccount) => number) =>
    accounts.reduce((total, account) => total + fn(account), 0);

  return {
    class_number: classNumber,
    label_fr: cls.label_fr,
    label_en: cls.label_en,
    included_in_statements: cls.included_in_statements,
    account_count: accounts.length,
    opening_debit: sum((account) => account.opening_debit),
    opening_credit: sum((account) => account.opening_credit),
    movement_debit: sum((account) => account.movement_debit),
    movement_credit: sum((account) => account.movement_credit),
    closing_debit: sum((account) => account.closing_debit),
    closing_credit: sum((account) => account.closing_credit),
    net_balance: sum((account) => account.net_balance),
    source_accounts: accounts.map((account) => account.account_number),
  };
}

export function buildOHADAClassSummaries(accounts: NormalizedAccount[]): OHADAClassSummary[] {
  const byClass = new Map<number, NormalizedAccount[]>();

  for (const account of accounts) {
    if (account.account_class === undefined) continue;
    const existing = byClass.get(account.account_class) ?? [];
    existing.push(account);
    byClass.set(account.account_class, existing);
  }

  return [...byClass.entries()]
    .sort(([a], [b]) => a - b)
    .map(([classNumber, classAccounts]) => summarizeClass(classNumber, classAccounts));
}
