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
  isNegative = false,
): ReportLine {
  const variationAmount = valueN1 !== null ? valueN - valueN1 : null;
  const variationPercentage =
    variationAmount !== null && valueN1 !== null && valueN1 !== 0
      ? (variationAmount / Math.abs(valueN1)) * 100
      : null;
  return {
    report_type: 'COMPTE_RESULTAT',
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
  };
}

export interface IncomeStatementReport {
  lines: ReportLine[];
  turnover_N: number;
  total_operating_income_N: number;
  total_operating_expenses_N: number;
  operating_result_N: number;
  financial_income_N: number;
  financial_expenses_N: number;
  financial_result_N: number;
  ordinary_activities_result_N: number;
  hao_income_N: number;
  hao_expenses_N: number;
  hao_result_N: number;
  income_tax_N: number;
  net_result_N: number;
  // N-1
  turnover_N1: number | null;
  total_operating_income_N1: number | null;
  total_operating_expenses_N1: number | null;
  operating_result_N1: number | null;
  net_result_N1: number | null;
}

export function calculateIncomeStatement(
  accountsN: NormalizedAccount[],
  accountsN1: NormalizedAccount[] | undefined,
  overrides?: ManualOverride[],
  mappingRules: MappingRule[] = DEFAULT_MAPPING_RULES,
  groupedBalanceN?: GroupedBalance[],
  groupedBalanceN1?: GroupedBalance[],
): IncomeStatementReport {
  const ctx: MappingContext = { accountsN, accountsN1, overrides, groupedBalanceN, groupedBalanceN1 };
  const lines = applyAllMappingRules(mappingRules, ctx, 'COMPTE_RESULTAT')
    .filter((line) => !['TOTAL_PRODUITS_EXPLOIT', 'TOTAL_PROD_EXPLOIT', 'TOTAL_CHARGES_EXPLOIT', 'RESULTAT_EXPLOIT_FORMULA', 'RESULTAT_EXPLOITATION'].includes(line.line_code));

  const hasN1 = accountsN1 !== undefined;
  const vN  = (code: string) => findLine(lines, code)?.value_N  ?? 0;
  const vN1 = (code: string) => findLine(lines, code)?.value_N_1 ?? null;
  const sumN  = (codes: string[]) => codes.reduce((s, c) => s + vN(c), 0);
  const sumN1 = (codes: string[]): number | null =>
    hasN1 ? codes.reduce((s, c) => s + (vN1(c) ?? 0), 0) : null;

  // ── Produits d'exploitation ───────────────────────────────────────────────
  const prodExploitCodes = ['CHIFFRE_AFFAIRES','PROD_STOCKEE','PROD_IMMO','AUTRES_PROD_EXPLOIT','REPRISES_PROV'];
  const totalProdExploitN  = sumN(prodExploitCodes);
  const totalProdExploitN1 = sumN1(prodExploitCodes);

  // ── Charges d'exploitation ────────────────────────────────────────────────
  const chargesExploitCodes = ['ACHATS','SERVICES_EXT','IMPOTS_TAXES','CHARGES_PERS','AUTRES_CHARGES_EXPLOIT','DOTATIONS_AMORT'];
  const totalChargesExploitN  = sumN(chargesExploitCodes);
  const totalChargesExploitN1 = sumN1(chargesExploitCodes);

  // ── Résultat d'exploitation ───────────────────────────────────────────────
  const opResultN  = totalProdExploitN - totalChargesExploitN;
  const opResultN1 = hasN1 ? (totalProdExploitN1 ?? 0) - (totalChargesExploitN1 ?? 0) : null;

  // ── Résultat financier ────────────────────────────────────────────────────
  const finIncomeN  = vN('PROD_FIN');
  const finIncomeN1 = vN1('PROD_FIN');
  const finExpN     = vN('CHARGES_FIN');
  const finExpN1    = vN1('CHARGES_FIN');
  const finResultN  = finIncomeN - finExpN;
  const finResultN1 = hasN1 ? (finIncomeN1 ?? 0) - (finExpN1 ?? 0) : null;

  // ── Résultat activités ordinaires ─────────────────────────────────────────
  const ordResultN  = opResultN + finResultN;
  const ordResultN1 = hasN1 ? (opResultN1 ?? 0) + (finResultN1 ?? 0) : null;

  // ── HAO ───────────────────────────────────────────────────────────────────
  const haoIncN  = vN('PROD_HAO');
  const haoIncN1 = vN1('PROD_HAO');
  const haoExpN  = vN('CHARGES_HAO');
  const haoExpN1 = vN1('CHARGES_HAO');
  const haoResultN  = haoIncN - haoExpN;
  const haoResultN1 = hasN1 ? (haoIncN1 ?? 0) - (haoExpN1 ?? 0) : null;

  // ── Impôt sur le résultat ─────────────────────────────────────────────────
  const incomeTaxN  = vN('IMPOT_RESULTAT');
  const incomeTaxN1 = vN1('IMPOT_RESULTAT');

  // ── Résultat net ──────────────────────────────────────────────────────────
  const netResultN  = ordResultN + haoResultN - incomeTaxN;
  const netResultN1 = hasN1 ? (ordResultN1 ?? 0) + (haoResultN1 ?? 0) - (incomeTaxN1 ?? 0) : null;

  const totals: ReportLine[] = [
    makeTotal('TOTAL_PROD_EXPLOIT',    'Total produits d\'exploitation',   'Total operating income',         totalProdExploitN,   totalProdExploitN1,   2050),
    makeTotal('TOTAL_CHARGES_EXPLOIT', 'Total charges d\'exploitation',    'Total operating expenses',       totalChargesExploitN, totalChargesExploitN1, 2150),
    makeTotal('RESULTAT_EXPLOITATION', 'Résultat d\'exploitation',         'Operating result',               opResultN,           opResultN1,           2160),
    makeTotal('RESULTAT_FINANCIER',    'Résultat financier',               'Financial result',               finResultN,          finResultN1,          2260),
    makeTotal('RESULTAT_ACT_ORD',      'Résultat des activités ordinaires','Result from ordinary activities',ordResultN,          ordResultN1,          2270),
    makeTotal('RESULTAT_HAO',          'Résultat HAO',                     'Non-ordinary result',            haoResultN,          haoResultN1,          2360),
    makeTotal('IMPOT_RESULTAT_LINE',   'Impôt sur le résultat',            'Income tax',                     incomeTaxN,          incomeTaxN1,          2410),
    makeTotal('RESULTAT_NET',          'Résultat net',                     'Net result',                     netResultN,          netResultN1,          9999),
  ];

  const statementTotals: ReportLine[] = [
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'PROD_EXPLOIT', lineCode: 'TOTAL_PROD_EXPLOIT', labelFr: 'Total produits d exploitation', labelEn: 'Total operating income', valueN: totalProdExploitN, valueN1: totalProdExploitN1, order: 2050, sourceLines: lines, sourceLineCodes: prodExploitCodes, formulaUsed: prodExploitCodes.join('+'), isTotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'CHARGES_EXPLOIT', lineCode: 'TOTAL_CHARGES_EXPLOIT', labelFr: 'Total charges d exploitation', labelEn: 'Total operating expenses', valueN: totalChargesExploitN, valueN1: totalChargesExploitN1, order: 2150, sourceLines: lines, sourceLineCodes: chargesExploitCodes, formulaUsed: chargesExploitCodes.join('+'), isTotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'RESULTAT_EXPLOIT', lineCode: 'RESULTAT_EXPLOITATION', labelFr: 'Resultat d exploitation', labelEn: 'Operating result', valueN: opResultN, valueN1: opResultN1, order: 2160, sourceLines: lines, sourceLineCodes: [...prodExploitCodes, ...chargesExploitCodes], formulaUsed: 'TOTAL_PROD_EXPLOIT-TOTAL_CHARGES_EXPLOIT', isSubtotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'RESULTAT_FIN', lineCode: 'RESULTAT_FINANCIER', labelFr: 'Resultat financier', labelEn: 'Financial result', valueN: finResultN, valueN1: finResultN1, order: 2260, sourceLines: lines, sourceLineCodes: ['PROD_FIN','CHARGES_FIN'], formulaUsed: 'PROD_FIN-CHARGES_FIN', isSubtotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'RESULTAT_ORD', lineCode: 'RESULTAT_ACT_ORD', labelFr: 'Resultat des activites ordinaires', labelEn: 'Result from ordinary activities', valueN: ordResultN, valueN1: ordResultN1, order: 2270, sourceLines: lines, sourceLineCodes: [...prodExploitCodes, ...chargesExploitCodes, 'PROD_FIN','CHARGES_FIN'], formulaUsed: 'RESULTAT_EXPLOITATION+RESULTAT_FINANCIER', isSubtotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'RESULTAT_HAO', lineCode: 'RESULTAT_HAO', labelFr: 'Resultat HAO', labelEn: 'Non-ordinary result', valueN: haoResultN, valueN1: haoResultN1, order: 2360, sourceLines: lines, sourceLineCodes: ['PROD_HAO','CHARGES_HAO'], formulaUsed: 'PROD_HAO-CHARGES_HAO', isSubtotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'IMPOT', lineCode: 'IMPOT_RESULTAT_LINE', labelFr: 'Impot sur le resultat', labelEn: 'Income tax', valueN: incomeTaxN, valueN1: incomeTaxN1, order: 2410, sourceLines: lines, sourceLineCodes: ['IMPOT_RESULTAT'], formulaUsed: 'IMPOT_RESULTAT', isSubtotal: true }),
    makeComputedLine({ reportType: 'COMPTE_RESULTAT', sectionCode: 'RESULTAT_NET', lineCode: 'RESULTAT_NET', labelFr: 'Resultat net', labelEn: 'Net result', valueN: netResultN, valueN1: netResultN1, order: 9999, sourceLines: lines, sourceLineCodes: lines.map((line) => line.line_code), formulaUsed: 'RESULTAT_ACT_ORD+RESULTAT_HAO-IMPOT_RESULTAT_LINE', isTotal: true }),
  ];

  return {
    lines: [...lines, ...statementTotals].sort((a, b) => a.display_order - b.display_order),
    turnover_N:                  vN('CHIFFRE_AFFAIRES'),
    total_operating_income_N:    totalProdExploitN,
    total_operating_expenses_N:  totalChargesExploitN,
    operating_result_N:          opResultN,
    financial_income_N:          finIncomeN,
    financial_expenses_N:        finExpN,
    financial_result_N:          finResultN,
    ordinary_activities_result_N: ordResultN,
    hao_income_N:                haoIncN,
    hao_expenses_N:              haoExpN,
    hao_result_N:                haoResultN,
    income_tax_N:                incomeTaxN,
    net_result_N:                netResultN,
    turnover_N1:                 vN1('CHIFFRE_AFFAIRES'),
    total_operating_income_N1:   totalProdExploitN1,
    total_operating_expenses_N1: totalChargesExploitN1,
    operating_result_N1:         opResultN1,
    net_result_N1:               netResultN1,
  };
}
