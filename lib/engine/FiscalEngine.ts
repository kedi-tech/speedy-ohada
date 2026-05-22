import type {
  FiscalResult,
  FiscalLine,
  FiscalSchedule,
  TaxConfig,
  SourceAccountRef,
  NormalizedAccount,
} from './types';
import type { IncomeStatementReport } from './IncomeStatementEngine';
import { matchesPrefix } from './AccountPrefixEngine';

export interface FiscalManualInputs {
  add_backs: FiscalLine[];
  deductions: FiscalLine[];
  installments_paid: number;
  tax_credits: number;
  previous_deficits: number;
  patente_lines: FiscalLine[];
  honoraire_lines: FiscalLine[];
}

function sourceRef(account: NormalizedAccount, ruleId: string): SourceAccountRef {
  return {
    account_number: account.account_number,
    account_label: account.account_label,
    net_balance: account.net_balance,
    balance_type: 'N',
    mapping_rule_id: ruleId,
  };
}

function accountsByPrefix(accounts: NormalizedAccount[], prefixes: string[]) {
  return accounts.filter((account) => matchesPrefix(account.account_number, prefixes));
}

function sumAccounts(accounts: NormalizedAccount[], prefixes: string[]) {
  return accountsByPrefix(accounts, prefixes).reduce((total, account) => total + account.net_balance, 0);
}

function makeAutoLine(
  code: string,
  labelFr: string,
  labelEn: string,
  value: number,
  source: string,
  sourceAccounts: SourceAccountRef[] = [],
): FiscalLine {
  return {
    line_code: code,
    label_fr: labelFr,
    label_en: labelEn,
    value,
    is_manual: false,
    source,
    source_accounts: sourceAccounts,
  };
}

function positive(value: number) {
  return value > 0 ? value : 0;
}

function total(lines: FiscalLine[]) {
  return lines.reduce((sum, line) => sum + (line.value ?? 0), 0);
}

function makeSchedule(scheduleCode: string, titleFr: string, titleEn: string, lines: FiscalLine[]): FiscalSchedule {
  return {
    schedule_code: scheduleCode,
    title_fr: titleFr,
    title_en: titleEn,
    lines,
    total: total(lines),
  };
}

function buildAutoAddBacks(accountsN: NormalizedAccount[]): FiscalLine[] {
  const incomeTaxAccounts = accountsByPrefix(accountsN, ['69']);
  const penaltiesAccounts = accountsByPrefix(accountsN, ['647', '6581']);
  const giftsAccounts = accountsByPrefix(accountsN, ['6582', '6583']);

  const lines = [
    makeAutoLine(
      'REINT_IS',
      'Impots sur le resultat non deductibles',
      'Non-deductible income tax expense',
      positive(total(incomeTaxAccounts.map((account) => ({
        line_code: account.account_number,
        label_fr: account.account_label,
        label_en: account.account_label,
        value: account.net_balance,
        is_manual: false,
      })))),
      'Comptes 69',
      incomeTaxAccounts.map((account) => sourceRef(account, 'FISCAL_REINT_IS')),
    ),
    makeAutoLine(
      'REINT_PENALITES',
      'Amendes, penalites et charges non admises',
      'Fines, penalties and disallowed expenses',
      positive(sumAccounts(accountsN, ['647', '6581'])),
      'Comptes 647/6581',
      penaltiesAccounts.map((account) => sourceRef(account, 'FISCAL_REINT_PENALITES')),
    ),
    makeAutoLine(
      'REINT_DONS_LIBERALITES',
      'Dons et liberalites a examiner',
      'Donations and gifts to review',
      positive(sumAccounts(accountsN, ['6582', '6583'])),
      'Comptes 6582/6583',
      giftsAccounts.map((account) => sourceRef(account, 'FISCAL_REINT_DONS')),
    ),
  ];

  return lines.filter((line) => (line.value ?? 0) !== 0);
}

function buildAutoDeductions(accountsN: NormalizedAccount[], manualInputs: FiscalManualInputs): FiscalLine[] {
  const priorDeficit = positive(manualInputs.previous_deficits ?? 0);
  const exemptIncomeAccounts = accountsByPrefix(accountsN, ['779', '787']);
  const exemptIncome = positive(sumAccounts(accountsN, ['779', '787']) * -1);

  return [
    makeAutoLine(
      'DED_DEFICITS_ANTERIEURS',
      'Deficits anterieurs reportables',
      'Tax loss carry-forwards',
      priorDeficit,
      'Saisie manuelle',
    ),
    makeAutoLine(
      'DED_PRODUITS_EXONERES',
      'Produits exoneres ou non imposables a deduire',
      'Exempt or non-taxable income to deduct',
      exemptIncome,
      'Comptes 779/787',
      exemptIncomeAccounts.map((account) => sourceRef(account, 'FISCAL_DED_EXONERES')),
    ),
  ].filter((line) => (line.value ?? 0) !== 0);
}

function buildPatenteLines(
  incomeStatement: IncomeStatementReport,
  taxConfig: TaxConfig,
  manualLines: FiscalLine[],
): FiscalLine[] {
  const turnover = positive(incomeStatement.turnover_N);
  const rate = taxConfig.patente_rate ?? 0.5;
  const proportional = turnover * (rate / 100);
  const baseLines = [
    makeAutoLine('PAT_CA_BASE', 'Base chiffre d affaires HT', 'Revenue base excl. VAT', turnover, 'Compte de resultat'),
    makeAutoLine('PAT_DROIT_PROP', 'Droit proportionnel', 'Proportional duty', proportional, `Taux patente ${rate}%`),
    makeAutoLine('PAT_TOTAL_AUTO', 'Total patente calculee', 'Calculated patente total', proportional, 'PAT_DROIT_PROP'),
  ];
  return [...baseLines, ...manualLines];
}

function buildHonoraireLines(accountsN: NormalizedAccount[], manualLines: FiscalLine[]): FiscalLine[] {
  const feeAccounts = accountsByPrefix(accountsN, ['628', '632']);
  const feeTotal = positive(sumAccounts(accountsN, ['628', '632']));
  const autoLines = feeTotal === 0 ? [] : [
    makeAutoLine(
      'HON_BRUT_AUTO',
      'Honoraires, commissions et intermediaires identifies',
      'Identified fees, commissions and intermediary expenses',
      feeTotal,
      'Comptes 628/632',
      feeAccounts.map((account) => sourceRef(account, 'FISCAL_HONORAIRES')),
    ),
    makeAutoLine(
      'HON_RETENUE_ESTIMEE',
      'Retenue a la source estimee a completer',
      'Estimated withholding tax to complete',
      0,
      'Saisie requise si declaration applicable',
      feeAccounts.map((account) => sourceRef(account, 'FISCAL_HONORAIRES_RETENUE')),
    ),
  ];
  return [...autoLines, ...manualLines];
}

export function calculateFiscal(
  net_result_from_income_statement: number,
  accountsN: NormalizedAccount[],
  taxConfig: TaxConfig,
  manualInputs: FiscalManualInputs,
  incomeStatement?: IncomeStatementReport,
): FiscalResult {
  const { tax_rate, minimum_tax } = taxConfig;
  const accountingResult = net_result_from_income_statement;
  const autoAddBacks = buildAutoAddBacks(accountsN);
  const autoDeductions = buildAutoDeductions(accountsN, manualInputs);
  const addBacks = [...autoAddBacks, ...manualInputs.add_backs];
  const deductions = [...autoDeductions, ...manualInputs.deductions];
  const totalAddBacks = total(addBacks);
  const totalDeductions = total(deductions);
  const taxableResult = accountingResult + totalAddBacks - totalDeductions;
  const taxableProfit = positive(taxableResult);
  const deficitGenerated = taxableResult < 0 ? Math.abs(taxableResult) : 0;
  const deficitCarriedForward = deficitGenerated;

  let calculatedTax = 0;
  if (taxableProfit > 0) {
    calculatedTax = taxableProfit * (tax_rate / 100);
    if (minimum_tax !== undefined && calculatedTax < minimum_tax) calculatedTax = minimum_tax;
  } else if (minimum_tax !== undefined) {
    calculatedTax = minimum_tax;
  }

  const taxExpenseFromAccounts = positive(sumAccounts(accountsN, ['69']));
  const taxReconciliationDifference = calculatedTax - taxExpenseFromAccounts;
  const balancePayable = calculatedTax - manualInputs.installments_paid - manualInputs.tax_credits;
  const statement = incomeStatement ?? {
    turnover_N: 0,
    net_result_N: accountingResult,
  } as IncomeStatementReport;
  const patenteLines = buildPatenteLines(statement, taxConfig, manualInputs.patente_lines);
  const honoraireLines = buildHonoraireLines(accountsN, manualInputs.honoraire_lines);
  const honoraireTotal = total(honoraireLines.filter((line) => !line.line_code.includes('RETENUE')));
  const honoraireWithholdingTotal = total(honoraireLines.filter((line) => line.line_code.includes('RETENUE')));

  const fiscalLines = [
    makeAutoLine('RES_COMPTABLE', 'Resultat comptable', 'Accounting result', accountingResult, 'Compte de resultat'),
    makeAutoLine('TOTAL_REINTEGRATIONS', 'Total reintegrations fiscales', 'Total tax add-backs', totalAddBacks, 'CALCULS FISCAUX'),
    makeAutoLine('TOTAL_DEDUCTIONS', 'Total deductions fiscales', 'Total tax deductions', totalDeductions, 'CALCULS FISCAUX'),
    makeAutoLine('RESULTAT_FISCAL', 'Resultat fiscal', 'Taxable result', taxableResult, 'RES_COMPTABLE + reintegrations - deductions'),
    makeAutoLine('BENEFICE_IMPOSABLE', 'Benefice imposable', 'Taxable profit', taxableProfit, 'max(resultat fiscal, 0)'),
    makeAutoLine('DEFICIT_REPORTE', 'Deficit reporte', 'Loss carried forward', deficitCarriedForward, 'max(-resultat fiscal, 0)'),
    makeAutoLine('IS_CALCULE', 'Impots sur les societes calcule', 'Calculated corporate income tax', calculatedTax, `Taux ${tax_rate}%`),
    makeAutoLine('ACOMPTES_CREDITS', 'Acomptes et credits imputables', 'Installments and tax credits', manualInputs.installments_paid + manualInputs.tax_credits, 'Saisie manuelle'),
    makeAutoLine('IS_NET_A_PAYER', 'IS net a payer', 'Net corporate income tax payable', balancePayable, 'IS - acomptes - credits'),
  ];

  const bicPages = [
    makeSchedule('BIC_PAGE_1', 'BIC page 1 - Synthese fiscale', 'BIC page 1 - Tax summary', [
      fiscalLines[0],
      fiscalLines[3],
      fiscalLines[6],
      fiscalLines[8],
    ]),
    makeSchedule('BIC_PAGE_2', 'BIC page 2 - Reintegrations', 'BIC page 2 - Add-backs', addBacks),
    makeSchedule('BIC_PAGE_3', 'BIC page 3 - Deductions et deficits', 'BIC page 3 - Deductions and losses', [
      ...deductions,
      fiscalLines[5],
    ]),
  ];

  const dniLines = [
    makeAutoLine('DNI_CA', 'Chiffre d affaires declare', 'Declared turnover', statement.turnover_N, 'Compte de resultat'),
    makeAutoLine('DNI_RESULTAT_FISCAL', 'Resultat fiscal declare', 'Declared taxable result', taxableResult, 'CALCULS FISCAUX'),
    makeAutoLine('DNI_IS_BRUT', 'IS brut declare', 'Declared gross CIT', calculatedTax, `Taux ${tax_rate}%`),
    makeAutoLine('DNI_IMPUTATIONS', 'Acomptes et credits', 'Installments and credits', manualInputs.installments_paid + manualInputs.tax_credits, 'Saisie manuelle'),
    makeAutoLine('DNI_NET_A_PAYER', 'Net a payer', 'Net payable', balancePayable, 'DNI_IS_BRUT - DNI_IMPUTATIONS'),
  ];

  const bvSchedule = makeSchedule('B_V', 'B V - Determination du resultat fiscal', 'B V - Tax result determination', [
    fiscalLines[0],
    fiscalLines[1],
    fiscalLines[2],
    fiscalLines[3],
    fiscalLines[4],
    fiscalLines[5],
  ]);

  const sourceAccounts = [
    ...accountsByPrefix(accountsN, ['69']).map((account) => sourceRef(account, 'FISCAL')),
    ...accountsByPrefix(accountsN, ['647', '6581', '6582', '6583', '779', '787', '628', '632']).map((account) => sourceRef(account, 'FISCAL')),
  ];

  return {
    accounting_result: accountingResult,
    fiscal_lines: fiscalLines,
    add_backs: addBacks,
    deductions,
    total_add_backs: totalAddBacks,
    total_deductions: totalDeductions,
    taxable_result: taxableResult,
    taxable_profit: taxableProfit,
    deficit_generated: deficitGenerated,
    deficit_carried_forward: deficitCarriedForward,
    tax_rate,
    calculated_tax: calculatedTax,
    tax_expense_from_accounts: taxExpenseFromAccounts,
    tax_reconciliation_difference: taxReconciliationDifference,
    installments_paid: manualInputs.installments_paid,
    tax_credits: manualInputs.tax_credits,
    balance_payable: balancePayable,
    bic_pages: bicPages,
    dni_lines: dniLines,
    bv_schedule: bvSchedule,
    patente_lines: patenteLines,
    patente_total: total(patenteLines.filter((line) => line.line_code !== 'PAT_CA_BASE')),
    honoraire_lines: honoraireLines,
    honoraire_total: honoraireTotal,
    honoraire_withholding_total: honoraireWithholdingTotal,
    source_accounts: sourceAccounts,
  };
}

export function emptyFiscalManualInputs(): FiscalManualInputs {
  return {
    add_backs: [],
    deductions: [],
    installments_paid: 0,
    tax_credits: 0,
    previous_deficits: 0,
    patente_lines: [],
    honoraire_lines: [],
  };
}
