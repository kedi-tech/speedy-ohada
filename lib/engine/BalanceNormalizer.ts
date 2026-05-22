import type { RawImportLine, NormalizedAccount, BalanceType } from './types';

let _idCounter = 0;
function nextId(): string {
  return `acc_${Date.now()}_${++_idCounter}`;
}

export function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(String(val).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export function normalizeAccount(
  raw: RawImportLine,
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): NormalizedAccount {
  const warnings: string[] = [];

  // Normalize account number: trim whitespace, remove inner spaces, keep leading zeros
  let accountNumber = String(raw.account_number ?? '').trim().replace(/\s+/g, '');

  if (!accountNumber) {
    warnings.push('Account number is empty.');
  } else if (!/\d/.test(accountNumber)) {
    warnings.push(`Account number "${accountNumber}" contains no digits.`);
  }

  const accountLabel = String(raw.account_label ?? '').trim();
  if (!accountLabel) {
    warnings.push(`Account "${accountNumber}" has no label.`);
  }

  const openingDebit  = toNumber(raw.opening_debit);
  const openingCredit = toNumber(raw.opening_credit);
  const movementDebit  = toNumber(raw.movement_debit);
  const movementCredit = toNumber(raw.movement_credit);

  let closingDebit  = toNumber(raw.closing_debit);
  let closingCredit = toNumber(raw.closing_credit);
  let netBalance: number;
  const hasNetBalance = raw.net_balance !== undefined && raw.net_balance !== null;

  const hasClosing = raw.closing_debit !== undefined && raw.closing_debit !== null &&
                     raw.closing_credit !== undefined && raw.closing_credit !== null;

  if (hasNetBalance) {
    const importedNet = toNumber(raw.net_balance);
    if (importedNet > 0) {
      closingDebit = importedNet;
      closingCredit = 0;
    } else if (importedNet < 0) {
      closingDebit = 0;
      closingCredit = Math.abs(importedNet);
    } else {
      closingDebit = 0;
      closingCredit = 0;
    }
    netBalance = importedNet;
  } else if (hasClosing && (closingDebit !== 0 || closingCredit !== 0)) {
    netBalance = closingDebit - closingCredit;
  } else {
    const rawNet = openingDebit + movementDebit - openingCredit - movementCredit;
    if (rawNet > 0) {
      closingDebit  = rawNet;
      closingCredit = 0;
      netBalance    = rawNet;
    } else if (rawNet < 0) {
      closingDebit  = 0;
      closingCredit = Math.abs(rawNet);
      netBalance    = rawNet;
    } else {
      closingDebit  = 0;
      closingCredit = 0;
      netBalance    = 0;
    }
  }

  if (openingDebit < 0 || openingCredit < 0 || movementDebit < 0 || movementCredit < 0 ||
      closingDebit < 0 || closingCredit < 0) {
    warnings.push(`Account "${accountNumber}" has negative debit/credit values.`);
  }

  return {
    id: nextId(),
    account_number: accountNumber,
    account_label:  accountLabel,
    opening_debit:  openingDebit,
    opening_credit: openingCredit,
    movement_debit:  movementDebit,
    movement_credit: movementCredit,
    closing_debit:  Math.abs(closingDebit),
    closing_credit: Math.abs(closingCredit),
    net_balance:    netBalance,
    balance_type:   balanceType,
    fiscal_year_id:   fiscalYearId,
    company_id:       companyId,
    organization_id:  organizationId,
    warnings,
  };
}

export function normalizeBalance(
  rawLines: RawImportLine[],
  balanceType: BalanceType,
  fiscalYearId: string,
  companyId: string,
  organizationId: string,
): NormalizedAccount[] {
  return rawLines.map((raw) =>
    normalizeAccount(raw, balanceType, fiscalYearId, companyId, organizationId),
  );
}

export interface BalanceSummary {
  total_debit: number;
  total_credit: number;
  difference: number;
  is_balanced: boolean;
  tolerance: number;
}

export function summarizeBalance(accounts: NormalizedAccount[], tolerance = 1): BalanceSummary {
  const totalDebit  = accounts.reduce((s, a) => s + a.closing_debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.closing_credit, 0);
  const difference  = totalDebit - totalCredit;
  return {
    total_debit:  totalDebit,
    total_credit: totalCredit,
    difference,
    is_balanced: Math.abs(difference) <= tolerance,
    tolerance,
  };
}
