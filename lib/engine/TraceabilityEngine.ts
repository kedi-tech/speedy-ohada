import type { TraceabilityRecord, ReportLine, ManualOverride, ReportType } from './types';

function dependencyChain(line: ReportLine): string[] {
  const formulaRefs = (line.formula_used.match(/[A-Z][A-Z0-9_]{2,}/g) ?? [])
    .filter((token) => token !== line.line_code);
  const sourceRefs = line.source_accounts.map((account) => account.account_number);
  return [...new Set([...formulaRefs, ...sourceRefs])];
}

export function buildTraceabilityRecord(
  line: ReportLine,
  calculationRunId: string,
  calculatedBy?: string,
  override?: ManualOverride,
): TraceabilityRecord {
  return {
    line_code:          line.line_code,
    report_type:        line.report_type,
    calculation_run_id: calculationRunId,
    source_accounts:    line.source_accounts,
    dependency_chain:   dependencyChain(line),
    mapping_rule_ids:   [...new Set(line.source_accounts.map((account) => account.mapping_rule_id).filter(Boolean))],
    source_rows:        line.source_accounts.map((account) => ({
      account_number: account.account_number,
      source_row: null,
      balance_type: account.balance_type,
    })),
    formula_used:       line.formula_used,
    value_N:            line.value_N,
    value_N_1:          line.value_N_1,
    variation_amount:   line.variation_amount,
    manual_override:    override,
    calculated_at:      new Date().toISOString(),
    calculated_by:      calculatedBy,
  };
}

export function buildAllTraceabilityRecords(
  lines: ReportLine[],
  calculationRunId: string,
  overrides: ManualOverride[] = [],
  calculatedBy?: string,
): TraceabilityRecord[] {
  return lines.map((line) => {
    const override = overrides.find(
      (o) => o.report_type === line.report_type && o.report_line_code === line.line_code,
    );
    return buildTraceabilityRecord(line, calculationRunId, calculatedBy, override);
  });
}

export function findTraceability(
  records: TraceabilityRecord[],
  lineCode: string,
  reportType: ReportType,
): TraceabilityRecord | undefined {
  return records.find((r) => r.line_code === lineCode && r.report_type === reportType);
}

export interface TraceabilitySummary {
  line_code: string;
  report_type: ReportType;
  label?: string;
  value_N: number | null;
  value_N_1: number | null;
  variation_amount: number | null;
  source_accounts: Array<{
    account_number: string;
    account_label: string;
    net_balance: number;
    mapping_rule_id?: string;
  }>;
  dependency_chain: string[];
  mapping_rule_ids: string[];
  source_rows: Array<{ account_number: string; source_row: number | null; balance_type: string }>;
  formula_used: string;
  is_manual_override: boolean;
  override_reason?: string;
  override_by?: string;
  override_at?: string;
  calculated_at: string;
  calculated_by?: string;
  calculation_run_id: string;
}

export function summarizeTraceability(
  record: TraceabilityRecord,
  lineLabelFr?: string,
): TraceabilitySummary {
  return {
    line_code:        record.line_code,
    report_type:      record.report_type,
    label:            lineLabelFr,
    value_N:          record.value_N,
    value_N_1:        record.value_N_1,
    variation_amount: record.variation_amount,
    source_accounts:  record.source_accounts.map((s) => ({
      account_number: s.account_number,
      account_label:  s.account_label,
      net_balance:    s.net_balance,
      mapping_rule_id: s.mapping_rule_id,
    })),
    dependency_chain:   record.dependency_chain ?? [],
    mapping_rule_ids:   record.mapping_rule_ids ?? [],
    source_rows:        record.source_rows ?? [],
    formula_used:       record.formula_used,
    is_manual_override: !!record.manual_override,
    override_reason:    record.manual_override?.reason,
    override_by:        record.manual_override?.created_by,
    override_at:        record.manual_override?.created_at,
    calculated_at:      record.calculated_at,
    calculated_by:      record.calculated_by,
    calculation_run_id: record.calculation_run_id,
  };
}
