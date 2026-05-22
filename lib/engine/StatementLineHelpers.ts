import type { ReportLine, ReportType, SourceAccountRef, ValidationSeverity } from './types';

export function uniqueSourceAccounts(lines: ReportLine[], lineCodes: string[]): SourceAccountRef[] {
  const byKey = new Map<string, SourceAccountRef>();

  for (const line of lines) {
    if (!lineCodes.includes(line.line_code)) continue;
    for (const source of line.source_accounts) {
      byKey.set(`${source.balance_type}:${source.account_number}:${source.mapping_rule_id}`, source);
    }
  }

  return [...byKey.values()].sort((a, b) => a.account_number.localeCompare(b.account_number));
}

export function makeComputedLine(params: {
  reportType: ReportType;
  sectionCode: string;
  lineCode: string;
  labelFr: string;
  labelEn: string;
  valueN: number;
  valueN1: number | null;
  order: number;
  sourceLines?: ReportLine[];
  sourceLineCodes?: string[];
  formulaUsed: string;
  indent?: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  validationStatus?: ValidationSeverity;
}): ReportLine {
  const variationAmount = params.valueN1 !== null ? params.valueN - params.valueN1 : null;
  const variationPercentage =
    variationAmount !== null && params.valueN1 !== null && params.valueN1 !== 0
      ? (variationAmount / Math.abs(params.valueN1)) * 100
      : null;

  return {
    report_type: params.reportType,
    section_code: params.sectionCode,
    line_code: params.lineCode,
    label_fr: params.labelFr,
    label_en: params.labelEn,
    value_N: params.valueN,
    value_N_1: params.valueN1,
    variation_amount: variationAmount,
    variation_percentage: variationPercentage,
    source_accounts: params.sourceLines && params.sourceLineCodes
      ? uniqueSourceAccounts(params.sourceLines, params.sourceLineCodes)
      : [],
    formula_used: params.formulaUsed,
    is_manual_override: false,
    validation_status: params.validationStatus ?? 'passed',
    display_order: params.order,
    is_subtotal: params.isSubtotal,
    is_total: params.isTotal,
    indent: params.indent,
  };
}
