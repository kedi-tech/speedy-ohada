import type { ReportLine, CashFlowManualInputs, SourceAccountRef } from './types';
import type { ActifReport } from './ActifEngine';
import type { PassifReport } from './PassifEngine';
import type { IncomeStatementReport } from './IncomeStatementEngine';
import { uniqueSourceAccounts } from './StatementLineHelpers';

function makeLine(
  lineCode: string,
  labelFr: string,
  labelEn: string,
  valueN: number | null,
  order: number,
  isManual = false,
  isTotal = false,
  options: {
    formulaUsed?: string;
    sourceAccounts?: SourceAccountRef[];
    validationStatus?: ReportLine['validation_status'];
  } = {},
): ReportLine {
  return {
    report_type: 'TABLEAU_FLUX_TRESORERIE',
    section_code: 'FLUX',
    line_code: lineCode,
    label_fr: labelFr,
    label_en: labelEn,
    value_N: valueN,
    value_N_1: null,
    variation_amount: null,
    variation_percentage: null,
    source_accounts: options.sourceAccounts ?? [],
    formula_used: options.formulaUsed ?? (isManual ? 'manual_input' : 'computed'),
    is_manual_override: isManual,
    validation_status: options.validationStatus ?? 'passed',
    display_order: order,
    is_total: isTotal,
  };
}

export interface CashFlowReport {
  lines: ReportLine[];
  opening_cash: number | null;
  closing_cash: number;
  net_cash_variation: number | null;
  operating_cash_flow: number | null;
  investing_cash_flow: number;
  financing_cash_flow: number;
  cash_flow_total: number | null;
  cash_flow_difference: number | null;
  is_balanced: boolean;
  comparative_data_available: boolean;
  unavailable_lines: string[];
}

function lineSources(lines: ReportLine[], codes: string[]): SourceAccountRef[] {
  return uniqueSourceAccounts(lines, codes);
}

export function calculateCashFlow(
  actifN: ActifReport,
  actifN1: ActifReport | null,
  passifN: PassifReport,
  passifN1: PassifReport | null,
  incomeStatement: IncomeStatementReport,
  manualInputs: CashFlowManualInputs = {},
  tolerance = 1,
): CashFlowReport {
  const hasComparativeData = Boolean(actifN1 && passifN1);
  const closingCash = actifN.total_treasury_assets_N - passifN.total_treasury_liabilities_N;
  const openingCash = hasComparativeData && actifN1 && passifN1
    ? actifN1.total_treasury_assets_N - passifN1.total_treasury_liabilities_N
    : null;
  const netCashVar = openingCash !== null ? closingCash - openingCash : null;

  const netResult = incomeStatement.net_result_N;
  const deprAmort = incomeStatement.lines.find((line) => line.line_code === 'DOTATIONS_AMORT')?.value_N ?? 0;
  const reprises = manualInputs.reversals ?? (incomeStatement.lines.find((line) => line.line_code === 'REPRISES_PROV')?.value_N ?? 0);
  const gainsDisp = manualInputs.gains_on_disposal ?? 0;
  const lossesDisp = manualInputs.losses_on_disposal ?? 0;

  const inventoryN = actifN.total_stocks_net_N ?? 0;
  const inventoryN1 = actifN1?.total_stocks_net_N ?? null;
  const deltaInventory = inventoryN1 !== null ? inventoryN - inventoryN1 : null;

  const receivablesN = actifN.total_creances_N ?? 0;
  const receivablesN1 = actifN1?.total_creances_N ?? null;
  const deltaReceivables = receivablesN1 !== null ? receivablesN - receivablesN1 : null;

  const payablesN = passifN.total_current_liabilities_N ?? 0;
  const payablesN1 = passifN1?.total_current_liabilities_N ?? null;
  const deltaPayables = payablesN1 !== null ? payablesN - payablesN1 : null;

  const operatingBeforeWorkingCapital = netResult + deprAmort - reprises - gainsDisp + lossesDisp;
  const operatingCF = hasComparativeData && deltaInventory !== null && deltaReceivables !== null && deltaPayables !== null
    ? operatingBeforeWorkingCapital - deltaInventory - deltaReceivables + deltaPayables
    : null;

  const acqFixed = -(manualInputs.acquisitions_of_fixed_assets ?? 0);
  const dispFixed = manualInputs.disposals_of_fixed_assets ?? 0;
  const acqFinAss = -(manualInputs.acquisitions_of_financial_assets ?? 0);
  const dispFinAss = manualInputs.disposals_of_financial_assets ?? 0;
  const investingCF = acqFixed + dispFixed + acqFinAss + dispFinAss;

  const capIncrease = manualInputs.capital_increases ?? 0;
  const newLoans = manualInputs.new_borrowings ?? 0;
  const loanRepay = -(manualInputs.loan_repayments ?? 0);
  const dividends = -(manualInputs.dividends_paid ?? 0);
  const grantsRec = manualInputs.grants_received ?? 0;
  const financingCF = capIncrease + newLoans + loanRepay + dividends + grantsRec;

  const cashFlowTotal = operatingCF !== null ? operatingCF + investingCF + financingCF : null;
  const cashFlowDiff = cashFlowTotal !== null && netCashVar !== null ? cashFlowTotal - netCashVar : null;
  const isBalanced = cashFlowDiff !== null && Math.abs(cashFlowDiff) <= tolerance;
  const unavailableFormula = 'unavailable_missing_n1';
  const unavailableLines = hasComparativeData ? [] : [
    'ZA',  // opening cash requires N-1
    'FF',  // stock variation requires N-1
    'FG',  // receivables variation requires N-1
    'FH',  // payables variation requires N-1
    'ZB',  // operating CF requires N-1 working capital
    'ZE',  // net variation requires opening cash
    'ECART_FLUX',
  ];

  // SYSCOHADA TFT line codes: ZA = opening cash, ZB = operating CF, ZC = investing CF,
  // ZD = financing CF, ZE = net variation, ZF = closing cash.
  // FA–FH are sub-lines within the operating section (indirect method).
  const lines: ReportLine[] = [
    // ZA – Tresorerie nette au 1er janvier (ouverture)
    makeLine('ZA', 'Trésorerie nette au 1er janvier (A)', 'Opening cash balance (A)', openingCash, 100, false, false, {
      formulaUsed: openingCash === null ? unavailableFormula : 'TOTAL_TRES_ACTIF_N1-TOTAL_TRES_PASSIF_N1',
      validationStatus: openingCash === null ? 'warning' : 'passed',
    }),

    // Operating section sub-lines (FA–FH, indirect method)
    makeLine('FA', 'Resultat net de l exercice', 'Net result for the period', netResult, 200, false, false, {
      formulaUsed: 'incomeStatement.RESULTAT_NET',
      sourceAccounts: lineSources(incomeStatement.lines, ['RESULTAT_NET']),
    }),
    makeLine('FB', 'Dotations aux amortissements et provisions', 'Depreciation and provisions', deprAmort, 201, false, false, {
      formulaUsed: 'incomeStatement.DOTATIONS_AMORT',
      sourceAccounts: lineSources(incomeStatement.lines, ['DOTATIONS_AMORT']),
    }),
    makeLine('FC', 'Reprises de provisions', 'Provision reversals', -reprises, 202, true),
    makeLine('FD', 'Gains sur cessions d immobilisations', 'Gains on disposal of assets', -gainsDisp, 203, true),
    makeLine('FE', 'Pertes sur cessions d immobilisations', 'Losses on disposal of assets', lossesDisp, 204, true),
    makeLine('FF', 'Variation des stocks', 'Change in inventories', deltaInventory === null ? null : -deltaInventory, 205, false, false, {
      formulaUsed: deltaInventory === null ? unavailableFormula : 'STOCKS_NET_N1-STOCKS_NET_N',
      sourceAccounts: lineSources(actifN.lines, ['STOCKS', 'STOCKS_PROV']),
      validationStatus: deltaInventory === null ? 'warning' : 'passed',
    }),
    makeLine('FG', 'Variation des creances d exploitation', 'Change in operating receivables', deltaReceivables === null ? null : -deltaReceivables, 206, false, false, {
      formulaUsed: deltaReceivables === null ? unavailableFormula : 'CREANCES_N1-CREANCES_N',
      sourceAccounts: lineSources(actifN.lines, ['CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV', 'AUTRES_CREANCES', 'AVANCES_FOURNISSEURS', 'PERSONNEL_CREANCES', 'ETAT_CREANCES', 'ASSOCIES_CREANCES']),
      validationStatus: deltaReceivables === null ? 'warning' : 'passed',
    }),
    makeLine('FH', 'Variation des dettes d exploitation', 'Change in operating payables', deltaPayables, 207, false, false, {
      formulaUsed: deltaPayables === null ? unavailableFormula : 'DETTES_N-DETTES_N1',
      sourceAccounts: lineSources(passifN.lines, ['FOURNISSEURS', 'DETTES_FISCALES', 'DETTES_SOCIALES', 'AUTRES_DETTES', 'AVANCES_CLIENTS', 'ASSOCIES_DETTES']),
      validationStatus: deltaPayables === null ? 'warning' : 'passed',
    }),

    // ZB – Flux de tresorerie provenant des activites operationnelles
    makeLine('ZB', 'Flux de tresorerie provenant des activites operationnelles (B)', 'Net cash from operating activities (B)', operatingCF, 300, false, true, {
      formulaUsed: operatingCF === null ? unavailableFormula : 'FA+FB+FC+FD+FE+FF+FG+FH',
      validationStatus: operatingCF === null ? 'warning' : 'passed',
    }),

    // Investing section sub-lines (IA–ID)
    makeLine('IA', 'Acquisitions d immobilisations corporelles et incorporelles', 'Acquisitions of tangible and intangible assets', acqFixed, 400, true),
    makeLine('IB', 'Cessions d immobilisations corporelles et incorporelles', 'Disposals of tangible and intangible assets', dispFixed, 401, true),
    makeLine('IC', 'Acquisitions d actifs financiers', 'Acquisitions of financial assets', acqFinAss, 402, true),
    makeLine('ID', 'Cessions d actifs financiers', 'Disposals of financial assets', dispFinAss, 403, true),

    // ZC – Flux de tresorerie provenant des activites d investissement
    makeLine('ZC', 'Flux de tresorerie provenant des activites d investissement (C)', 'Net cash from investing activities (C)', investingCF, 500, false, true, {
      formulaUsed: 'IA+IB+IC+ID',
    }),

    // Financing section sub-lines (JA–JE)
    makeLine('JA', 'Augmentation de capital par apports nouveaux', 'Capital increases from new contributions', capIncrease, 600, true),
    makeLine('JB', 'Emprunts contractes dans l exercice', 'New borrowings contracted during period', newLoans, 601, true),
    makeLine('JC', 'Remboursements d emprunts', 'Repayments of borrowings', loanRepay, 602, true),
    makeLine('JD', 'Dividendes verses', 'Dividends paid', dividends, 603, true),
    makeLine('JE', 'Subventions d investissement recues', 'Investment grants received', grantsRec, 604, true),

    // ZD – Flux de tresorerie provenant des activites de financement
    makeLine('ZD', 'Flux de tresorerie provenant des activites de financement (D)', 'Net cash from financing activities (D)', financingCF, 700, false, true, {
      formulaUsed: 'JA+JB+JC+JD+JE',
    }),

    // ZE – Variation de tresorerie nette de la periode (B+C+D)
    makeLine('ZE', 'Variation de tresorerie nette de la periode (E=B+C+D)', 'Net change in cash for the period (E=B+C+D)', cashFlowTotal, 800, false, true, {
      formulaUsed: cashFlowTotal === null ? unavailableFormula : 'ZB+ZC+ZD',
      validationStatus: cashFlowTotal === null ? 'warning' : 'passed',
    }),

    // Ecart de reconciliation (controle)
    makeLine('ECART_FLUX', 'Ecart de reconciliation (E-ZE)', 'Reconciliation check (net var - E)', cashFlowDiff, 850, false, false, {
      formulaUsed: cashFlowDiff === null ? unavailableFormula : 'ZE-(ZF-ZA)',
      validationStatus: cashFlowDiff === null ? 'warning' : (Math.abs(cashFlowDiff ?? 0) > tolerance ? 'critical' : 'passed'),
    }),

    // ZF – Tresorerie nette au 31 decembre (cloture)
    makeLine('ZF', 'Trésorerie nette au 31 décembre (F=E+A)', 'Closing cash balance (F=E+A)', closingCash, 900, false, true, {
      formulaUsed: 'TOTAL_TRES_ACTIF-TOTAL_TRES_PASSIF',
    }),
  ];

  return {
    lines,
    opening_cash: openingCash,
    closing_cash: closingCash,
    net_cash_variation: netCashVar,
    operating_cash_flow: operatingCF,
    investing_cash_flow: investingCF,
    financing_cash_flow: financingCF,
    cash_flow_total: cashFlowTotal,
    cash_flow_difference: cashFlowDiff,
    is_balanced: isBalanced,
    comparative_data_available: hasComparativeData,
    unavailable_lines: unavailableLines,
  };
}
