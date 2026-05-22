/**
 * FinancialStatementEngine — Main orchestrator
 *
 * Executes the full calculation pipeline:
 * normalize → prefix → class → validate → group → map → actif/passif →
 * income statement → cash flow → notes → expense details → fiscal → validation → snapshot
 */

import type {
  NormalizedAccount,
  ManualOverride,
  CalculationSnapshot,
  EngineContext,
  CashFlowManualInputs,
  MappingRule,
  MaterialityConfig,
} from './types';

import { normalizeBalance, summarizeBalance } from './BalanceNormalizer';
import { enrichAllWithPrefixes } from './AccountPrefixEngine';
import { enrichAllWithClass } from './OHADAClassEngine';
import { calculateActif, type ActifReport } from './ActifEngine';
import { calculatePassif, type PassifReport } from './PassifEngine';
import { calculateIncomeStatement, type IncomeStatementReport } from './IncomeStatementEngine';
import { calculateCashFlow, type CashFlowReport } from './CashFlowEngine';
import { calculateExpenseDetails, type ExpenseDetailsReport } from './ExpenseDetailsEngine';
import { calculateConversionDifferences, type ConversionDifferencesReport } from './ConversionDifferencesEngine';
import { buildNotesAnnexes, type NoteAnnexe, type NotesContext } from './NotesAnnexesEngine';
import { calculateFiscal, emptyFiscalManualInputs, type FiscalManualInputs } from './FiscalEngine';
import { runValidation, type ValidationInput } from './ValidationEngine';
import { buildAllTraceabilityRecords, type TraceabilitySummary, summarizeTraceability } from './TraceabilityEngine';
import type { RawImportLine } from './types';
import type { FiscalResult } from './types';
import type { FullValidationReport } from './types';
import type { GroupedBalance } from './types';

export interface FullCalculationInput {
  context: EngineContext;
  rawLinesN:   RawImportLine[];
  rawLinesN1?: RawImportLine[];
  skipN1?:     boolean;
  overrides?:  ManualOverride[];
  cashFlowManualInputs?: CashFlowManualInputs;
  fiscalManualInputs?:   FiscalManualInputs;
  companyInfo?: Record<string, string | undefined>;
  notesManualOverrides?: Record<string, Record<string, unknown>>;
  materialityConfig?: MaterialityConfig;
  mappingRules?: MappingRule[];
  groupedBalanceN?: GroupedBalance[];
  groupedBalanceN1?: GroupedBalance[];
  requiredApprovals?:  boolean;
  allApproved?:        boolean;
}

export interface FullCalculationResult {
  // Normalized data
  accountsN:   NormalizedAccount[];
  accountsN1?: NormalizedAccount[];
  groupedBalanceN?: GroupedBalance[];
  groupedBalanceN1?: GroupedBalance[];
  // Reports
  actifN:       ActifReport;
  passifN:      PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow:     CashFlowReport;
  expenseDetails: ExpenseDetailsReport;
  conversionDifferences: ConversionDifferencesReport;
  notes:        NoteAnnexe[];
  fiscal:       FiscalResult;
  // Validation & traceability
  validation:   FullValidationReport;
  traceability: TraceabilitySummary[];
  snapshot:     CalculationSnapshot;
  // Optional N-1 reports (for variation calculations)
  actifN1?:     ActifReport;
  passifN1?:    PassifReport;
}

export function runFullCalculation(input: FullCalculationInput): FullCalculationResult {
  const { context } = input;
  const startedAt = new Date().toISOString();

  // ── Step 1: Normalize ─────────────────────────────────────────────────────
  const rawN  = normalizeBalance(input.rawLinesN, 'N', context.fiscal_year_id, context.company_id, context.organization_id);
  const rawN1 = input.rawLinesN1
    ? normalizeBalance(input.rawLinesN1, 'N-1', context.fiscal_year_id, context.company_id, context.organization_id)
    : undefined;

  // ── Step 2: Extract prefixes ──────────────────────────────────────────────
  const prefixedN  = enrichAllWithPrefixes(rawN);
  const prefixedN1 = rawN1 ? enrichAllWithPrefixes(rawN1) : undefined;

  // ── Step 3: Detect classes ────────────────────────────────────────────────
  const accountsN  = enrichAllWithClass(prefixedN);
  const accountsN1 = prefixedN1 ? enrichAllWithClass(prefixedN1) : undefined;

  // ── Step 4: Validate balances ─────────────────────────────────────────────
  const summaryN = summarizeBalance(accountsN, context.rounding_tolerance);

  // ── Step 5: Calculate financial statements ────────────────────────────────
  const overrides = input.overrides ?? [];

  const mappingRules = input.mappingRules;
  const groupedBalanceN = input.groupedBalanceN;
  const groupedBalanceN1 = input.groupedBalanceN1;

  const actifN  = calculateActif(accountsN, accountsN1, overrides, mappingRules, groupedBalanceN, groupedBalanceN1);
  const actifN1 = accountsN1 ? calculateActif(accountsN1, undefined, undefined, mappingRules, groupedBalanceN1, undefined) : undefined;

  const incomeStatement = calculateIncomeStatement(accountsN, accountsN1, overrides, mappingRules, groupedBalanceN, groupedBalanceN1);

  const passifN  = calculatePassif(
    accountsN,
    accountsN1,
    overrides,
    mappingRules,
    groupedBalanceN,
    groupedBalanceN1,
    incomeStatement.net_result_N,
    incomeStatement.net_result_N1,
  );
  const passifN1 = accountsN1
    ? calculatePassif(accountsN1, undefined, undefined, mappingRules, groupedBalanceN1, undefined, incomeStatement.net_result_N1 ?? undefined, null)
    : undefined;

  const cashFlow = calculateCashFlow(
    actifN,
    actifN1 ?? null,
    passifN,
    passifN1 ?? null,
    incomeStatement,
    input.cashFlowManualInputs ?? {},
    context.rounding_tolerance,
  );

  const expenseDetails = calculateExpenseDetails(accountsN, accountsN1, incomeStatement);
  const conversionDifferences = calculateConversionDifferences(accountsN, accountsN1);

  // ── Step 6: Notes ─────────────────────────────────────────────────────────
  const notesCtx: NotesContext = {
    actifN,
    actifN1,
    passifN,
    passifN1,
    incomeStatement,
    cashFlow,
    accountsN,
    accountsN1,
  };
  const notes = buildNotesAnnexes(notesCtx, input.notesManualOverrides ?? {});

  // ── Step 7: Fiscal ────────────────────────────────────────────────────────
  const fiscal = calculateFiscal(
    incomeStatement.net_result_N,
    accountsN,
    context.tax_config,
    input.fiscalManualInputs ?? emptyFiscalManualInputs(),
    incomeStatement,
  );

  const allLines = [
    ...actifN.lines,
    ...passifN.lines,
    ...incomeStatement.lines,
    ...cashFlow.lines,
    ...conversionDifferences.lines,
  ];

  // ── Step 8: Validation ────────────────────────────────────────────────────
  const validationInput: ValidationInput = {
    calculation_run_id: context.calculation_run_id,
    fiscal_year_id:     context.fiscal_year_id,
    company_id:         context.company_id,
    company_info:       input.companyInfo ?? {},
    accountsN,
    accountsN1,
    balanceSummaryN:    summaryN,
    skipN1:             input.skipN1 ?? false,
    actif:              actifN,
    passif:             passifN,
    incomeStatement,
    cashFlow,
    expenseDetails,
    conversionDifferences,
    notes,
    fiscal,
    taxConfig:          context.tax_config,
    tolerance:          context.rounding_tolerance,
    materialityConfig:  input.materialityConfig,
    requiredApprovals:  input.requiredApprovals,
    allApproved:        input.allApproved,
    reportLines:        allLines,
  };
  const validation = runValidation(validationInput);

  // ── Step 9: Traceability ──────────────────────────────────────────────────
  const traceRecords = buildAllTraceabilityRecords(allLines, context.calculation_run_id, overrides, context.triggered_by);
  const traceability = traceRecords.map((r) => {
    const line = allLines.find((l) => l.line_code === r.line_code);
    return summarizeTraceability(r, line?.label_fr);
  });

  // ── Step 10: Snapshot ─────────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  const snapshot: CalculationSnapshot = {
    calculation_run_id: context.calculation_run_id,
    organization_id:    context.organization_id,
    company_id:         context.company_id,
    fiscal_year_id:     context.fiscal_year_id,
    triggered_by_user:  context.triggered_by,
    trigger_reason:     context.trigger_reason,
    started_at:         startedAt,
    completed_at:       completedAt,
    status:             'completed',
    total_debit_N:      summaryN.total_debit,
    total_credit_N:     summaryN.total_credit,
    difference_N:       summaryN.difference,
    total_debit_N_1:    accountsN1 ? summarizeBalance(accountsN1, context.rounding_tolerance).total_debit : null,
    total_credit_N_1:   accountsN1 ? summarizeBalance(accountsN1, context.rounding_tolerance).total_credit : null,
    difference_N_1:     accountsN1 ? summarizeBalance(accountsN1, context.rounding_tolerance).difference : null,
    total_actif_N:      actifN.total_actif_N,
    total_passif_N:     passifN.total_passif_N,
    bilan_difference_N: actifN.total_actif_N - passifN.total_passif_N,
    total_actif_N_1:    actifN1?.total_actif_N ?? null,
    total_passif_N_1:   passifN1?.total_passif_N ?? null,
    bilan_difference_N_1: actifN1 && passifN1 ? actifN1.total_actif_N - passifN1.total_passif_N : null,
    net_result:         incomeStatement.net_result_N,
    cash_flow_difference: cashFlow.cash_flow_difference,
    conversion_difference_asset_N: conversionDifferences.asset_total_N,
    conversion_difference_liability_N: conversionDifferences.liability_total_N,
    conversion_difference_net_N: conversionDifferences.net_position_N,
    conversion_differences: conversionDifferences,
    validation_status:  validation.overall_status === 'valid' ? 'valid' : validation.total_critical > 0 ? 'critical' : 'warnings',
    critical_errors_count: validation.total_critical,
    warnings_count:     validation.total_warnings,
  };

  return {
    accountsN,
    accountsN1,
    groupedBalanceN,
    groupedBalanceN1,
    actifN,
    actifN1,
    passifN,
    passifN1,
    incomeStatement,
    cashFlow,
    expenseDetails,
    conversionDifferences,
    notes,
    fiscal,
    validation,
    traceability,
    snapshot,
  };
}

export function makeEngineContext(params: {
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  fiscal_year_label: string;
  currency_code?: string;
  decimal_places?: number;
  rounding_tolerance?: number;
  tax_rate?: number;
  patente_rate?: number;
  tax_regime?: string;
  country_code?: string;
  fiscal_year?: number;
  triggered_by?: string;
  trigger_reason?: string;
}): EngineContext {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const currencyCode = params.currency_code ?? 'XOF';
  return {
    organization_id:    params.organization_id,
    company_id:         params.company_id,
    fiscal_year_id:     params.fiscal_year_id,
    fiscal_year_label:  params.fiscal_year_label,
    currency_code:      currencyCode,
    decimal_places:     params.decimal_places ?? (currencyCode === 'XOF' || currencyCode === 'GNF' ? 0 : 2),
    rounding_tolerance: params.rounding_tolerance ?? 1,
    tax_config: {
      country_code:    params.country_code ?? 'CI',
      fiscal_regime:   params.tax_regime ?? 'normal',
      fiscal_year:     params.fiscal_year ?? new Date().getFullYear(),
      tax_rate:        params.tax_rate ?? 25,
      patente_rate:    params.patente_rate ?? 0.5,
      currency_code:   currencyCode,
      decimal_places:  params.decimal_places ?? 0,
      rounding_tolerance: params.rounding_tolerance ?? 1,
    },
    calculation_run_id: runId,
    triggered_by:       params.triggered_by ?? 'system',
    trigger_reason:     params.trigger_reason ?? 'manual_run',
  };
}
