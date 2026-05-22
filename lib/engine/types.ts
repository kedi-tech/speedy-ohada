// Core engine types for the OHADA/SYSCOHADA logic engine

export type BalanceType = 'N' | 'N-1';
export type DisplaySign = 'debit_positive' | 'credit_positive' | 'subtract_from_gross' | 'manual' | 'formula';
export type SourceType = 'trial_balance' | 'grouped_balance';
export type ReportType =
  | 'ACTIF'
  | 'PASSIF'
  | 'BILAN'
  | 'COMPTE_RESULTAT'
  | 'TABLEAU_FLUX_TRESORERIE'
  | 'NOTES_ANNEXES'
  | 'DETAILS_CHARGES'
  | 'ECARTS_CONVERSION'
  | 'FISCALITE';

export type ValidationSeverity = 'critical' | 'warning' | 'info' | 'passed';
export type NoteStatus = 'notStarted' | 'prefilled' | 'toComplete' | 'completed' | 'needsReview' | 'validated';
export type VersionStatus = 'draft' | 'under_review' | 'approved' | 'exported' | 'locked' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OverrideStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

// ─── Raw Import ───────────────────────────────────────────────────────────────

export interface RawImportLine {
  row_index: number;
  account_number: string;
  account_label: string;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  closing_debit: number;
  closing_credit: number;
  net_balance?: number;
  [key: string]: unknown;
}

export interface ColumnMapping {
  source_column: string;
  target_field: keyof RawImportLine;
}

export interface ImportConfig {
  file_name: string;
  sheet_name?: string;
  header_row: number;
  column_mappings: ColumnMapping[];
  balance_type: BalanceType;
  fiscal_year_id: string;
  company_id: string;
  organization_id: string;
}

export interface ImportResult {
  success: boolean;
  raw_lines: RawImportLine[];
  errors: string[];
  warnings: string[];
  row_count: number;
}

// ─── Normalized Account ───────────────────────────────────────────────────────

export interface NormalizedAccount {
  id: string;
  account_number: string;
  account_label: string;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  closing_debit: number;
  closing_credit: number;
  net_balance: number;
  balance_type: BalanceType;
  fiscal_year_id: string;
  company_id: string;
  organization_id: string;
  warnings: string[];
  // Prefixes (added by AccountPrefixEngine)
  prefix_1?: string;
  prefix_2?: string;
  prefix_3?: string;
  prefix_4?: string;
  prefix_5?: string;
  prefix_6?: string;
  // Class (added by OHADAClassEngine)
  account_class?: number;
  account_class_label_fr?: string;
  account_class_label_en?: string;
}

// ─── Grouped Balance ──────────────────────────────────────────────────────────

export interface GroupRule {
  group_code: string;
  group_label_fr: string;
  group_label_en: string;
  account_class?: number;
  prefix_level?: number;
  match_prefixes?: string[];
  match_ranges?: Array<{ from: string; to: string }>;
  included_accounts?: string[];
  excluded_accounts?: string[];
}

export interface GroupedBalance {
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  balance_type: BalanceType;
  group_kind?: 'account' | 'prefix' | 'class' | 'total' | 'custom';
  group_code: string;
  parent_group_code?: string;
  group_label_fr: string;
  group_label_en: string;
  account_class?: number;
  prefix_level?: number;
  account_count?: number;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  closing_debit: number;
  closing_credit: number;
  net_balance: number;
  source_accounts: string[];
}

// ─── Mapping Rules ────────────────────────────────────────────────────────────

export interface MappingRule {
  id: string;
  report_type: ReportType;
  report_section: string;
  report_line_code: string;
  label_fr: string;
  label_en: string;
  account_prefixes?: string[];
  account_ranges?: Array<{ from: string; to: string }>;
  included_accounts?: string[];
  excluded_accounts?: string[];
  source_type: SourceType;
  normal_balance_type: 'debit' | 'credit';
  display_sign: DisplaySign;
  formula_type?: 'sum' | 'subtraction' | 'custom';
  formula_expression?: string;
  display_order: number;
  is_required: boolean;
  is_editable: boolean;
  allows_manual_override: boolean;
  is_active: boolean;
}

// ─── Report Lines ─────────────────────────────────────────────────────────────

export interface SourceAccountRef {
  account_number: string;
  account_label: string;
  net_balance: number;
  balance_type: BalanceType;
  mapping_rule_id: string;
}

export interface ReportLine {
  report_type: ReportType;
  section_code: string;
  line_code: string;
  label_fr: string;
  label_en: string;
  value_N: number | null;
  value_N_1: number | null;
  gross_N?: number;
  depreciation_N?: number;
  gross_N_1?: number;
  depreciation_N_1?: number;
  variation_amount: number | null;
  variation_percentage: number | null;
  source_accounts: SourceAccountRef[];
  formula_used: string;
  is_manual_override: boolean;
  override_reason?: string;
  override_id?: string;
  validation_status: ValidationSeverity;
  display_order: number;
  is_subtotal?: boolean;
  is_total?: boolean;
  is_header?: boolean;
  indent?: number;
}

// ─── Traceability ─────────────────────────────────────────────────────────────

export interface TraceabilityRecord {
  line_code: string;
  report_type: ReportType;
  calculation_run_id: string;
  source_accounts: SourceAccountRef[];
  dependency_chain?: string[];
  mapping_rule_ids?: string[];
  source_rows?: Array<{ account_number: string; source_row: number | null; balance_type: BalanceType }>;
  formula_used: string;
  value_N: number | null;
  value_N_1: number | null;
  variation_amount: number | null;
  manual_override?: ManualOverride;
  calculated_at: string;
  calculated_by?: string;
}

// ─── Manual Override ──────────────────────────────────────────────────────────

export interface ManualOverride {
  id: string;
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  report_type: ReportType;
  report_line_code: string;
  original_value: number | null;
  new_value: number;
  difference: number;
  reason: string;
  created_by: string;
  created_at: string;
  approval_status: OverrideStatus;
  approved_by?: string;
  approved_at?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationMessage {
  code: string;
  category: string;
  severity: ValidationSeverity;
  message_fr: string;
  message_en: string;
  details?: string;
  line_code?: string;
  account_number?: string;
  fix_type?: 'recalculate' | 'manual_input' | 'mapping' | 'import' | 'review' | 'export' | 'none' | 'navigate';
  fix_target?: string;
}

export interface ValidationResult {
  category: string;
  passed: boolean;
  messages: ValidationMessage[];
  critical_count: number;
  warning_count: number;
  info_count: number;
  passed_count: number;
}

export interface FullValidationReport {
  calculation_run_id: string;
  fiscal_year_id: string;
  company_id: string;
  validated_at: string;
  overall_status: 'valid' | 'warnings' | 'critical' | 'blocked';
  can_export: boolean;
  categories: ValidationResult[];
  total_critical: number;
  total_warnings: number;
  total_info: number;
  total_passed: number;
}

// ─── Calculation Snapshot ─────────────────────────────────────────────────────

export interface CalculationSnapshot {
  calculation_run_id: string;
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  triggered_by_user: string;
  trigger_reason: string;
  started_at: string;
  completed_at: string;
  status: 'running' | 'completed' | 'failed';
  total_debit_N: number;
  total_credit_N: number;
  difference_N: number;
  total_debit_N_1: number | null;
  total_credit_N_1: number | null;
  difference_N_1: number | null;
  total_actif_N: number | null;
  total_passif_N: number | null;
  bilan_difference_N: number | null;
  total_actif_N_1: number | null;
  total_passif_N_1: number | null;
  bilan_difference_N_1: number | null;
  net_result: number | null;
  cash_flow_difference: number | null;
  conversion_difference_asset_N?: number;
  conversion_difference_liability_N?: number;
  conversion_difference_net_N?: number;
  conversion_differences?: unknown;
  validation_status: 'valid' | 'warnings' | 'critical';
  critical_errors_count: number;
  warnings_count: number;
}

// ─── Report Version ───────────────────────────────────────────────────────────

export interface ReportVersionRecord {
  report_version_id: string;
  fiscal_year_id: string;
  company_id: string;
  organization_id: string;
  version_number: number;
  status: VersionStatus;
  generated_by: string;
  generated_at: string;
  calculation_run_id: string;
  validation_summary: string;
  change_summary: string;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  unlock_reason?: string;
}

// ─── Fiscal ───────────────────────────────────────────────────────────────────

export interface TaxConfig {
  country_code: string;
  fiscal_regime: string;
  fiscal_year: number;
  tax_rate: number;
  minimum_tax?: number;
  patente_rate?: number;
  currency_code: string;
  decimal_places: number;
  rounding_tolerance: number;
}

export interface FiscalLine {
  line_code: string;
  label_fr: string;
  label_en: string;
  value: number | null;
  is_manual: boolean;
  source?: string;
  comment?: string;
  source_accounts?: SourceAccountRef[];
}

export interface FiscalSchedule {
  schedule_code: string;
  title_fr: string;
  title_en: string;
  lines: FiscalLine[];
  total: number;
}

export interface FiscalResult {
  accounting_result: number | null;
  fiscal_lines: FiscalLine[];
  add_backs: FiscalLine[];
  deductions: FiscalLine[];
  total_add_backs: number;
  total_deductions: number;
  taxable_result: number;
  taxable_profit: number;
  deficit_generated: number;
  deficit_carried_forward: number;
  tax_rate: number;
  calculated_tax: number;
  tax_expense_from_accounts: number;
  tax_reconciliation_difference: number;
  installments_paid: number;
  tax_credits: number;
  balance_payable: number;
  bic_pages: FiscalSchedule[];
  dni_lines: FiscalLine[];
  bv_schedule: FiscalSchedule;
  patente_lines: FiscalLine[];
  patente_total: number;
  honoraire_lines: FiscalLine[];
  honoraire_total: number;
  honoraire_withholding_total: number;
  source_accounts: SourceAccountRef[];
}

// ─── Cash Flow Manual Inputs ──────────────────────────────────────────────────

export interface CashFlowManualInputs {
  acquisitions_of_fixed_assets?: number;
  disposals_of_fixed_assets?: number;
  acquisitions_of_financial_assets?: number;
  disposals_of_financial_assets?: number;
  new_borrowings?: number;
  loan_repayments?: number;
  dividends_paid?: number;
  grants_received?: number;
  capital_increases?: number;
  gains_on_disposal?: number;
  losses_on_disposal?: number;
  reversals?: number;
  [key: string]: number | undefined;
}

// ─── Materiality Config ───────────────────────────────────────────────────────

export interface MaterialityConfig {
  fixed_threshold?: number;
  assets_percentage?: number;
  turnover_percentage?: number;
  net_result_percentage?: number;
}

// ─── Engine Context ───────────────────────────────────────────────────────────

export interface EngineContext {
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  fiscal_year_label: string;
  currency_code: string;
  decimal_places: number;
  rounding_tolerance: number;
  tax_config: TaxConfig;
  materiality_config?: MaterialityConfig;
  calculation_run_id: string;
  triggered_by: string;
  trigger_reason: string;
}
