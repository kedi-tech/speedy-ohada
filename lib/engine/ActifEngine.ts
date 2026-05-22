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
    report_type: 'ACTIF',
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

export interface ActifReport {
  lines: ReportLine[];
  // Key totals
  total_immo_incorporelles_net_N: number;
  total_immo_corporelles_net_N: number;
  total_immo_financieres_net_N: number;
  total_fixed_assets_N: number;
  total_stocks_net_N: number;
  total_creances_N: number;
  total_current_assets_N: number;
  total_treasury_assets_N: number;
  total_actif_N: number;
  // N-1
  total_fixed_assets_N1: number | null;
  total_current_assets_N1: number | null;
  total_treasury_assets_N1: number | null;
  total_actif_N1: number | null;
}

export function calculateActif(
  accountsN: NormalizedAccount[],
  accountsN1: NormalizedAccount[] | undefined,
  overrides?: ManualOverride[],
  mappingRules: MappingRule[] = DEFAULT_MAPPING_RULES,
  groupedBalanceN?: GroupedBalance[],
  groupedBalanceN1?: GroupedBalance[],
): ActifReport {
  const ctx: MappingContext = { accountsN, accountsN1, overrides, groupedBalanceN, groupedBalanceN1 };
  const lines = applyAllMappingRules(mappingRules, ctx, 'ACTIF');

  const hasN1 = accountsN1 !== undefined;

  // Helper: get value for a line code
  const vN  = (code: string) => findLine(lines, code)?.value_N  ?? 0;
  const vN1 = (code: string) => findLine(lines, code)?.value_N_1 ?? null;
  const netN  = (gross: string, depr: string) => vN(gross) - vN(depr);
  const netN1 = (gross: string, depr: string): number | null =>
    hasN1 ? (vN1(gross) ?? 0) - (vN1(depr) ?? 0) : null;

  // ── Immobilisations incorporelles ─────────────────────────────────────────
  const incNetN  = netN('IMMO_INC_GROSS', 'IMMO_INC_DEPR');
  const incNetN1 = netN1('IMMO_INC_GROSS', 'IMMO_INC_DEPR');

  // ── Immobilisations corporelles ───────────────────────────────────────────
  const corpNetN  = netN('IMMO_CORP_GROSS', 'IMMO_CORP_DEPR');
  const corpNetN1 = netN1('IMMO_CORP_GROSS', 'IMMO_CORP_DEPR');

  // ── Immobilisations financières ───────────────────────────────────────────
  const finNetN  = netN('IMMO_FIN_GROSS', 'IMMO_FIN_PROV');
  const finNetN1 = netN1('IMMO_FIN_GROSS', 'IMMO_FIN_PROV');

  // ── Total actif immobilisé ────────────────────────────────────────────────
  const totalFixedN  = incNetN + corpNetN + finNetN;
  const totalFixedN1 = hasN1 ? (incNetN1 ?? 0) + (corpNetN1 ?? 0) + (finNetN1 ?? 0) : null;

  // ── Stocks ────────────────────────────────────────────────────────────────
  const stocksNetN  = netN('STOCKS', 'STOCKS_PROV');
  const stocksNetN1 = netN1('STOCKS', 'STOCKS_PROV');

  // ── Créances ──────────────────────────────────────────────────────────────
  const crClientsNetN  = netN('CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV');
  const crClientsNetN1 = netN1('CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV');
  const autresCrN  = vN('AUTRES_CREANCES');
  const autresCrN1 = vN1('AUTRES_CREANCES');
  const fournisseursAvancesN = vN('AVANCES_FOURNISSEURS');
  const fournisseursAvancesN1 = vN1('AVANCES_FOURNISSEURS');
  const personnelCreancesN = vN('PERSONNEL_CREANCES');
  const personnelCreancesN1 = vN1('PERSONNEL_CREANCES');
  const etatCreancesN = vN('ETAT_CREANCES');
  const etatCreancesN1 = vN1('ETAT_CREANCES');
  const associesCreancesN = vN('ASSOCIES_CREANCES');
  const associesCreancesN1 = vN1('ASSOCIES_CREANCES');
  const totalCrN = crClientsNetN + autresCrN + fournisseursAvancesN + personnelCreancesN + etatCreancesN + associesCreancesN;
  const totalCrN1 = hasN1
    ? (crClientsNetN1 ?? 0) + (autresCrN1 ?? 0) + (fournisseursAvancesN1 ?? 0) + (personnelCreancesN1 ?? 0) + (etatCreancesN1 ?? 0) + (associesCreancesN1 ?? 0)
    : null;

  // ── Total actif circulant ─────────────────────────────────────────────────
  const totalCurrentN  = stocksNetN + totalCrN;
  const totalCurrentN1 = hasN1 ? (stocksNetN1 ?? 0) + (totalCrN1 ?? 0) : null;

  // ── Trésorerie actif ──────────────────────────────────────────────────────
  const bankN   = vN('BANQUES_ACTIF');
  const bankN1  = vN1('BANQUES_ACTIF');
  const casseN  = vN('CAISSE_ACTIF');
  const casseN1 = vN1('CAISSE_ACTIF');
  const titresN  = vN('TITRES_PLACEMENT');
  const titresN1 = vN1('TITRES_PLACEMENT');
  const mobileMoneyN = vN('MOBILE_MONEY_ACTIF');
  const mobileMoneyN1 = vN1('MOBILE_MONEY_ACTIF');
  const totalTresN  = bankN + casseN + titresN + mobileMoneyN;
  const totalTresN1 = hasN1 ? (bankN1 ?? 0) + (casseN1 ?? 0) + (titresN1 ?? 0) + (mobileMoneyN1 ?? 0) : null;

  const ecartConvActifN = vN('ECART_CONV_ACTIF');
  const ecartConvActifN1 = vN1('ECART_CONV_ACTIF');

  // ── Total Actif ───────────────────────────────────────────────────────────
  const totalActifN  = totalFixedN + totalCurrentN + totalTresN + ecartConvActifN;
  const totalActifN1 = hasN1 ? (totalFixedN1 ?? 0) + (totalCurrentN1 ?? 0) + (totalTresN1 ?? 0) + (ecartConvActifN1 ?? 0) : null;

  const totals: ReportLine[] = [
    makeTotal('TOTAL_IMMO_INC',  'Immobilisations incorporelles (net)', 'Intangible assets (net)', incNetN, incNetN1, 150, 1),
    makeTotal('TOTAL_IMMO_CORP', 'Immobilisations corporelles (net)',   'Tangible fixed assets (net)', corpNetN, corpNetN1, 250, 1),
    makeTotal('TOTAL_IMMO_FIN',  'Immobilisations financières (net)',   'Financial assets (net)', finNetN, finNetN1, 350, 1),
    makeTotal('TOTAL_ACTIF_IMMO','Total Actif immobilisé',              'Total Fixed Assets', totalFixedN, totalFixedN1, 360),
    makeTotal('STOCKS_NET',      'Stocks nets',                         'Net Inventories', stocksNetN, stocksNetN1, 450, 1),
    makeTotal('CREANCES_CLIENTS_NET', 'Créances clients (nettes)',      'Net Customer Receivables', crClientsNetN, crClientsNetN1, 520, 1),
    makeTotal('TOTAL_CREANCES',  'Total créances',                      'Total Receivables', totalCrN, totalCrN1, 650),
    makeTotal('TOTAL_ACTIF_CIRC','Total Actif circulant',               'Total Current Assets', totalCurrentN, totalCurrentN1, 660),
    makeTotal('TOTAL_TRES_ACTIF','Total Trésorerie actif',              'Total Cash and Bank Assets', totalTresN, totalTresN1, 750),
    makeTotal('TOTAL_ACTIF',     'TOTAL ACTIF',                         'TOTAL ASSETS', totalActifN, totalActifN1, 9999),
  ];

  const statementTotals: ReportLine[] = [
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'IMMO_INC', lineCode: 'TOTAL_IMMO_INC', labelFr: 'Immobilisations incorporelles (net)', labelEn: 'Intangible assets (net)', valueN: incNetN, valueN1: incNetN1, order: 150, indent: 1, sourceLines: lines, sourceLineCodes: ['IMMO_INC_GROSS', 'IMMO_INC_DEPR'], formulaUsed: 'IMMO_INC_GROSS-IMMO_INC_DEPR', isSubtotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'IMMO_CORP', lineCode: 'TOTAL_IMMO_CORP', labelFr: 'Immobilisations corporelles (net)', labelEn: 'Tangible fixed assets (net)', valueN: corpNetN, valueN1: corpNetN1, order: 250, indent: 1, sourceLines: lines, sourceLineCodes: ['IMMO_CORP_GROSS', 'IMMO_CORP_DEPR'], formulaUsed: 'IMMO_CORP_GROSS-IMMO_CORP_DEPR', isSubtotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'IMMO_FIN', lineCode: 'TOTAL_IMMO_FIN', labelFr: 'Immobilisations financieres (net)', labelEn: 'Financial assets (net)', valueN: finNetN, valueN1: finNetN1, order: 350, indent: 1, sourceLines: lines, sourceLineCodes: ['IMMO_FIN_GROSS', 'IMMO_FIN_PROV'], formulaUsed: 'IMMO_FIN_GROSS-IMMO_FIN_PROV', isSubtotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'ACTIF_IMMO', lineCode: 'TOTAL_ACTIF_IMMO', labelFr: 'Total Actif immobilise', labelEn: 'Total Fixed Assets', valueN: totalFixedN, valueN1: totalFixedN1, order: 360, sourceLines: lines, sourceLineCodes: ['IMMO_INC_GROSS', 'IMMO_INC_DEPR', 'IMMO_CORP_GROSS', 'IMMO_CORP_DEPR', 'IMMO_FIN_GROSS', 'IMMO_FIN_PROV'], formulaUsed: 'TOTAL_IMMO_INC+TOTAL_IMMO_CORP+TOTAL_IMMO_FIN', isTotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'ACTIF_CIRC', lineCode: 'STOCKS_NET', labelFr: 'Stocks nets', labelEn: 'Net Inventories', valueN: stocksNetN, valueN1: stocksNetN1, order: 450, indent: 1, sourceLines: lines, sourceLineCodes: ['STOCKS', 'STOCKS_PROV'], formulaUsed: 'STOCKS-STOCKS_PROV', isSubtotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'ACTIF_CIRC', lineCode: 'CREANCES_CLIENTS_NET', labelFr: 'Creances clients nettes', labelEn: 'Net Customer Receivables', valueN: crClientsNetN, valueN1: crClientsNetN1, order: 520, indent: 1, sourceLines: lines, sourceLineCodes: ['CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV'], formulaUsed: 'CREANCES_CLIENTS-CREANCES_CLIENTS_PROV', isSubtotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'ACTIF_CIRC', lineCode: 'TOTAL_CREANCES', labelFr: 'Total creances', labelEn: 'Total Receivables', valueN: totalCrN, valueN1: totalCrN1, order: 650, sourceLines: lines, sourceLineCodes: ['CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV', 'AUTRES_CREANCES', 'AVANCES_FOURNISSEURS', 'PERSONNEL_CREANCES', 'ETAT_CREANCES', 'ASSOCIES_CREANCES'], formulaUsed: 'CREANCES_CLIENTS_NET+AUTRES_CREANCES+AVANCES_FOURNISSEURS+PERSONNEL_CREANCES+ETAT_CREANCES+ASSOCIES_CREANCES', isTotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'ACTIF_CIRC', lineCode: 'TOTAL_ACTIF_CIRC', labelFr: 'Total Actif circulant', labelEn: 'Total Current Assets', valueN: totalCurrentN, valueN1: totalCurrentN1, order: 660, sourceLines: lines, sourceLineCodes: ['STOCKS', 'STOCKS_PROV', 'CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV', 'AUTRES_CREANCES', 'AVANCES_FOURNISSEURS', 'PERSONNEL_CREANCES', 'ETAT_CREANCES', 'ASSOCIES_CREANCES'], formulaUsed: 'STOCKS_NET+TOTAL_CREANCES', isTotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'TRESORERIE_ACTIF', lineCode: 'TOTAL_TRES_ACTIF', labelFr: 'Total Trésorerie actif', labelEn: 'Total Cash and Bank Assets', valueN: totalTresN, valueN1: totalTresN1, order: 750, sourceLines: lines, sourceLineCodes: ['BANQUES_ACTIF', 'CAISSE_ACTIF', 'TITRES_PLACEMENT', 'MOBILE_MONEY_ACTIF'], formulaUsed: 'BANQUES_ACTIF+CAISSE_ACTIF+TITRES_PLACEMENT+MOBILE_MONEY_ACTIF', isTotal: true }),
    makeComputedLine({ reportType: 'ACTIF', sectionCode: 'TOTAL', lineCode: 'TOTAL_ACTIF', labelFr: 'TOTAL ACTIF', labelEn: 'TOTAL ASSETS', valueN: totalActifN, valueN1: totalActifN1, order: 9999, sourceLines: lines, sourceLineCodes: lines.map((line) => line.line_code), formulaUsed: 'TOTAL_ACTIF_IMMO+TOTAL_ACTIF_CIRC+TOTAL_TRES_ACTIF+ECART_CONV_ACTIF', isTotal: true }),
  ];

  return {
    lines: [...lines, ...statementTotals].sort((a, b) => a.display_order - b.display_order),
    total_immo_incorporelles_net_N: incNetN,
    total_immo_corporelles_net_N:   corpNetN,
    total_immo_financieres_net_N:   finNetN,
    total_fixed_assets_N:           totalFixedN,
    total_stocks_net_N:             stocksNetN,
    total_creances_N:               totalCrN,
    total_current_assets_N:         totalCurrentN,
    total_treasury_assets_N:        totalTresN,
    total_actif_N:                  totalActifN,
    total_fixed_assets_N1:          totalFixedN1,
    total_current_assets_N1:        totalCurrentN1,
    total_treasury_assets_N1:       totalTresN1,
    total_actif_N1:                 totalActifN1,
  };
}
