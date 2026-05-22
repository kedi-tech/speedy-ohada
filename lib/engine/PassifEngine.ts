import type { ReportLine, NormalizedAccount, ManualOverride, MappingRule, GroupedBalance } from './types';
import { applyAllMappingRules, findLine, type MappingContext } from './MappingEngine';
import { DEFAULT_MAPPING_RULES } from './mappingRules';
import { makeComputedLine } from './StatementLineHelpers';

function makeTotal(
  lineCode: string,
  labelFr: string,
  labelEn: string,
  valueN: number,
  valueN1: number | null,
  order: number,
  indent = 0,
): ReportLine {
  const variationAmount = valueN1 !== null ? valueN - valueN1 : null;
  const variationPercentage =
    variationAmount !== null && valueN1 !== null && valueN1 !== 0
      ? (variationAmount / Math.abs(valueN1)) * 100
      : null;
  return {
    report_type: 'PASSIF',
    section_code: 'TOTAL',
    line_code: lineCode,
    label_fr: labelFr,
    label_en: labelEn,
    value_N: valueN,
    value_N_1: valueN1,
    variation_amount: variationAmount,
    variation_percentage: variationPercentage,
    source_accounts: [],
    formula_used: 'computed_total',
    is_manual_override: false,
    validation_status: 'passed',
    display_order: order,
    is_total: true,
    indent,
  };
}

export interface PassifReport {
  lines: ReportLine[];
  total_equity_N: number;
  total_financial_debts_N: number;
  total_current_liabilities_N: number;
  total_treasury_liabilities_N: number;
  total_passif_N: number;
  total_equity_N1: number | null;
  total_financial_debts_N1: number | null;
  total_current_liabilities_N1: number | null;
  total_treasury_liabilities_N1: number | null;
  total_passif_N1: number | null;
}

export function calculatePassif(
  accountsN: NormalizedAccount[],
  accountsN1: NormalizedAccount[] | undefined,
  overrides?: ManualOverride[],
  mappingRules: MappingRule[] = DEFAULT_MAPPING_RULES,
  groupedBalanceN?: GroupedBalance[],
  groupedBalanceN1?: GroupedBalance[],
  netResultN?: number,
  netResultN1?: number | null,
): PassifReport {
  const ctx: MappingContext = { accountsN, accountsN1, overrides, groupedBalanceN, groupedBalanceN1 };
  const mappedLines = applyAllMappingRules(mappingRules, ctx, 'PASSIF');

  const hasN1 = accountsN1 !== undefined;
  const resultLine = findLine(mappedLines, 'RESULTAT_NET_BILAN');
  const needsResultFallback = resultLine && (resultLine.value_N ?? 0) === 0 && resultLine.source_accounts.length === 0 && netResultN !== undefined;
  const lines = needsResultFallback
    ? mappedLines.map((line) => line.line_code === 'RESULTAT_NET_BILAN'
      ? {
          ...line,
          value_N: netResultN,
          value_N_1: hasN1 ? (netResultN1 ?? null) : null,
          variation_amount: hasN1 && netResultN1 !== null && netResultN1 !== undefined ? netResultN - netResultN1 : null,
          variation_percentage: hasN1 && netResultN1 ? ((netResultN - netResultN1) / Math.abs(netResultN1)) * 100 : null,
          formula_used: 'income_statement.RESULTAT_NET fallback',
        }
      : line)
    : mappedLines;

  const vN  = (code: string) => findLine(lines, code)?.value_N  ?? 0;
  const vN1 = (code: string) => findLine(lines, code)?.value_N_1 ?? null;

  // ── Capitaux propres ──────────────────────────────────────────────────────
  const equityItemsN  = ['CAPITAL','RESERVES','REPORT_NOUVEAU','RESULTAT_NET_BILAN','SUBV_INVEST','PROV_REGL'].map(vN);
  const totalEquityN  = equityItemsN.reduce((s, v) => s + v, 0);
  const totalEquityN1 = hasN1
    ? ['CAPITAL','RESERVES','REPORT_NOUVEAU','RESULTAT_NET_BILAN','SUBV_INVEST','PROV_REGL'].reduce((s, c) => s + (vN1(c) ?? 0), 0)
    : null;

  // ── Dettes financières ────────────────────────────────────────────────────
  const totalFinDebtsN  = vN('EMPRUNTS') + vN('PROV_FIN');
  const totalFinDebtsN1 = hasN1 ? (vN1('EMPRUNTS') ?? 0) + (vN1('PROV_FIN') ?? 0) : null;

  // ── Passif circulant ──────────────────────────────────────────────────────
  const circItems   = ['FOURNISSEURS','DETTES_FISCALES','DETTES_SOCIALES','AUTRES_DETTES','AVANCES_CLIENTS','ASSOCIES_DETTES'];
  const totalCircN  = circItems.reduce((s, c) => s + vN(c), 0);
  const totalCircN1 = hasN1 ? circItems.reduce((s, c) => s + (vN1(c) ?? 0), 0) : null;

  // ── Trésorerie passif ─────────────────────────────────────────────────────
  const totalTresPassifN  = vN('BANQUES_CREDIT') + vN('MOBILE_MONEY_PASSIF');
  const totalTresPassifN1 = hasN1 ? (vN1('BANQUES_CREDIT') ?? 0) + (vN1('MOBILE_MONEY_PASSIF') ?? 0) : null;

  const ecartConvPassifN = vN('ECART_CONV_PASSIF');
  const ecartConvPassifN1 = vN1('ECART_CONV_PASSIF');

  // ── Total Passif ──────────────────────────────────────────────────────────
  const totalPassifN  = totalEquityN + totalFinDebtsN + totalCircN + totalTresPassifN + ecartConvPassifN;
  const totalPassifN1 = hasN1
    ? (totalEquityN1 ?? 0) + (totalFinDebtsN1 ?? 0) + (totalCircN1 ?? 0) + (totalTresPassifN1 ?? 0) + (ecartConvPassifN1 ?? 0)
    : null;

  const totals: ReportLine[] = [
    makeTotal('TOTAL_CP',            'Total Capitaux propres',         'Total Equity',                        totalEquityN,       totalEquityN1,       1050),
    makeTotal('TOTAL_DETTES_FIN',    'Total Dettes financières',       'Total Financial Debts',               totalFinDebtsN,     totalFinDebtsN1,     1150),
    makeTotal('TOTAL_PASSIF_CIRC',   'Total Passif circulant',         'Total Current Liabilities',           totalCircN,         totalCircN1,         1260),
    makeTotal('TOTAL_TRES_PASSIF',   'Total Trésorerie passif',        'Total Treasury Liabilities',          totalTresPassifN,   totalTresPassifN1,   1350),
    makeTotal('TOTAL_PASSIF',        'TOTAL PASSIF',                   'TOTAL LIABILITIES AND EQUITY',        totalPassifN,       totalPassifN1,       9999),
  ];

  const statementTotals: ReportLine[] = [
    makeComputedLine({ reportType: 'PASSIF', sectionCode: 'CAPITAUX_PROPRES', lineCode: 'TOTAL_CP', labelFr: 'Total Capitaux propres', labelEn: 'Total Equity', valueN: totalEquityN, valueN1: totalEquityN1, order: 1050, sourceLines: lines, sourceLineCodes: ['CAPITAL','RESERVES','REPORT_NOUVEAU','RESULTAT_NET_BILAN','SUBV_INVEST','PROV_REGL'], formulaUsed: 'CAPITAL+RESERVES+REPORT_NOUVEAU+RESULTAT_NET_BILAN+SUBV_INVEST+PROV_REGL', isTotal: true }),
    makeComputedLine({ reportType: 'PASSIF', sectionCode: 'DETTES_FIN', lineCode: 'TOTAL_DETTES_FIN', labelFr: 'Total Dettes financieres', labelEn: 'Total Financial Debts', valueN: totalFinDebtsN, valueN1: totalFinDebtsN1, order: 1150, sourceLines: lines, sourceLineCodes: ['EMPRUNTS','PROV_FIN'], formulaUsed: 'EMPRUNTS+PROV_FIN', isTotal: true }),
    makeComputedLine({ reportType: 'PASSIF', sectionCode: 'PASSIF_CIRC', lineCode: 'TOTAL_PASSIF_CIRC', labelFr: 'Total Passif circulant', labelEn: 'Total Current Liabilities', valueN: totalCircN, valueN1: totalCircN1, order: 1260, sourceLines: lines, sourceLineCodes: circItems, formulaUsed: circItems.join('+'), isTotal: true }),
    makeComputedLine({ reportType: 'PASSIF', sectionCode: 'TRESORERIE_PASSIF', lineCode: 'TOTAL_TRES_PASSIF', labelFr: 'Total Trésorerie passif', labelEn: 'Total Treasury Liabilities', valueN: totalTresPassifN, valueN1: totalTresPassifN1, order: 1350, sourceLines: lines, sourceLineCodes: ['BANQUES_CREDIT','MOBILE_MONEY_PASSIF'], formulaUsed: 'BANQUES_CREDIT+MOBILE_MONEY_PASSIF', isTotal: true }),
    makeComputedLine({ reportType: 'PASSIF', sectionCode: 'TOTAL', lineCode: 'TOTAL_PASSIF', labelFr: 'TOTAL PASSIF', labelEn: 'TOTAL LIABILITIES AND EQUITY', valueN: totalPassifN, valueN1: totalPassifN1, order: 9999, sourceLines: lines, sourceLineCodes: lines.map((line) => line.line_code), formulaUsed: 'TOTAL_CP+TOTAL_DETTES_FIN+TOTAL_PASSIF_CIRC+TOTAL_TRES_PASSIF+ECART_CONV_PASSIF', isTotal: true }),
  ];

  return {
    lines: [...lines, ...statementTotals].sort((a, b) => a.display_order - b.display_order),
    total_equity_N:               totalEquityN,
    total_financial_debts_N:      totalFinDebtsN,
    total_current_liabilities_N:  totalCircN,
    total_treasury_liabilities_N: totalTresPassifN,
    total_passif_N:               totalPassifN,
    total_equity_N1:              totalEquityN1,
    total_financial_debts_N1:     totalFinDebtsN1,
    total_current_liabilities_N1: totalCircN1,
    total_treasury_liabilities_N1:totalTresPassifN1,
    total_passif_N1:              totalPassifN1,
  };
}
