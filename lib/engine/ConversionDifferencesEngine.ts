import type { NormalizedAccount, ReportLine, SourceAccountRef } from './types';
import { matchesPrefix } from './AccountPrefixEngine';

export interface ConversionDifferenceEntry {
  account_number: string;
  account_label: string;
  nature: 'asset' | 'liability';
  amount_N: number;
  amount_N1: number | null;
  source_account: SourceAccountRef;
}

export interface ConversionDifferencesReport {
  entries: ConversionDifferenceEntry[];
  lines: ReportLine[];
  asset_total_N: number;
  asset_total_N1: number | null;
  liability_total_N: number;
  liability_total_N1: number | null;
  net_position_N: number;
  net_position_N1: number | null;
  source_accounts: SourceAccountRef[];
}

function sourceRef(account: NormalizedAccount, balanceType: 'N' | 'N-1', ruleId: string): SourceAccountRef {
  return {
    account_number: account.account_number,
    account_label: account.account_label,
    net_balance: account.net_balance,
    balance_type: balanceType,
    mapping_rule_id: ruleId,
  };
}

function amountForNature(account: NormalizedAccount, nature: 'asset' | 'liability') {
  return nature === 'asset' ? account.net_balance : -account.net_balance;
}

function variation(amountN: number, amountN1: number | null) {
  return amountN1 !== null ? amountN - amountN1 : null;
}

function variationPercent(amountN: number, amountN1: number | null) {
  const diff = variation(amountN, amountN1);
  return diff !== null && amountN1 !== null && amountN1 !== 0 ? (diff / Math.abs(amountN1)) * 100 : null;
}

function makeLine(
  lineCode: string,
  labelFr: string,
  labelEn: string,
  amountN: number,
  amountN1: number | null,
  order: number,
  sourceAccounts: SourceAccountRef[],
  formulaUsed: string,
  isTotal = false,
): ReportLine {
  return {
    report_type: 'ECARTS_CONVERSION',
    section_code: 'VENTI_DES_ECARTS_DE_CONV',
    line_code: lineCode,
    label_fr: labelFr,
    label_en: labelEn,
    value_N: amountN,
    value_N_1: amountN1,
    variation_amount: variation(amountN, amountN1),
    variation_percentage: variationPercent(amountN, amountN1),
    source_accounts: sourceAccounts,
    formula_used: formulaUsed,
    is_manual_override: false,
    validation_status: 'passed',
    display_order: order,
    is_total: isTotal,
  };
}

export function calculateConversionDifferences(
  accountsN: NormalizedAccount[],
  accountsN1?: NormalizedAccount[],
): ConversionDifferencesReport {
  const n1Map = new Map((accountsN1 ?? []).map((account) => [account.account_number, account]));
  const hasN1 = accountsN1 !== undefined;
  const conversionAccounts = accountsN.filter((account) => matchesPrefix(account.account_number, ['478', '479']));

  const entries: ConversionDifferenceEntry[] = conversionAccounts.map((account) => {
    const nature: 'asset' | 'liability' = matchesPrefix(account.account_number, ['478']) ? 'asset' : 'liability';
    const n1Account = n1Map.get(account.account_number);
    return {
      account_number: account.account_number,
      account_label: account.account_label,
      nature,
      amount_N: amountForNature(account, nature),
      amount_N1: n1Account ? amountForNature(n1Account, nature) : hasN1 ? 0 : null,
      source_account: sourceRef(account, 'N', nature === 'asset' ? 'ECART_CONV_ACTIF' : 'ECART_CONV_PASSIF'),
    };
  }).sort((a, b) => a.account_number.localeCompare(b.account_number));

  const assetEntries = entries.filter((entry) => entry.nature === 'asset');
  const liabilityEntries = entries.filter((entry) => entry.nature === 'liability');
  const assetTotalN = assetEntries.reduce((total, entry) => total + entry.amount_N, 0);
  const liabilityTotalN = liabilityEntries.reduce((total, entry) => total + entry.amount_N, 0);
  const assetTotalN1 = hasN1 ? assetEntries.reduce((total, entry) => total + (entry.amount_N1 ?? 0), 0) : null;
  const liabilityTotalN1 = hasN1 ? liabilityEntries.reduce((total, entry) => total + (entry.amount_N1 ?? 0), 0) : null;
  const netPositionN = assetTotalN - liabilityTotalN;
  const netPositionN1 = hasN1 ? (assetTotalN1 ?? 0) - (liabilityTotalN1 ?? 0) : null;

  const detailLines = entries.map((entry, index) => makeLine(
    `ECART_CONV_${entry.account_number}`,
    `${entry.nature === 'asset' ? 'Actif' : 'Passif'} - ${entry.account_label}`,
    `${entry.nature === 'asset' ? 'Asset' : 'Liability'} - ${entry.account_label}`,
    entry.amount_N,
    entry.amount_N1,
    100 + index,
    [entry.source_account],
    `${entry.nature === 'asset' ? '478 debit balance' : '479 credit balance'}`,
  ));

  const lines = [
    ...detailLines,
    makeLine('ECART_CONV_ACTIF_TOTAL', 'Total ecarts de conversion actif', 'Total asset translation differences', assetTotalN, assetTotalN1, 900, assetEntries.map((entry) => entry.source_account), 'SUM(478)', true),
    makeLine('ECART_CONV_PASSIF_TOTAL', 'Total ecarts de conversion passif', 'Total liability translation differences', liabilityTotalN, liabilityTotalN1, 901, liabilityEntries.map((entry) => entry.source_account), 'SUM(479)', true),
    makeLine('ECART_CONV_NET', 'Position nette des ecarts de conversion', 'Net translation difference position', netPositionN, netPositionN1, 902, entries.map((entry) => entry.source_account), 'ECART_CONV_ACTIF_TOTAL-ECART_CONV_PASSIF_TOTAL', true),
  ];

  return {
    entries,
    lines,
    asset_total_N: assetTotalN,
    asset_total_N1: assetTotalN1,
    liability_total_N: liabilityTotalN,
    liability_total_N1: liabilityTotalN1,
    net_position_N: netPositionN,
    net_position_N1: netPositionN1,
    source_accounts: entries.map((entry) => entry.source_account),
  };
}
