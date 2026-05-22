import type { FullValidationReport, CalculationSnapshot, ReportVersionRecord } from './types';
import type { ActifReport } from './ActifEngine';
import type { PassifReport } from './PassifEngine';
import type { IncomeStatementReport } from './IncomeStatementEngine';
import type { CashFlowReport } from './CashFlowEngine';
import type { NoteAnnexe } from './NotesAnnexesEngine';
import type { ExpenseDetailsReport } from './ExpenseDetailsEngine';
import type { FiscalResult } from './types';
import type { TraceabilitySummary } from './TraceabilityEngine';

export interface ExportReadyReport {
  version_id: string;
  calculation_run_id: string;
  generated_at: string;
  // Sections
  actif: ActifReport;
  passif: PassifReport;
  income_statement: IncomeStatementReport;
  cash_flow: CashFlowReport;
  notes: NoteAnnexe[];
  expense_details: ExpenseDetailsReport;
  fiscal: FiscalResult;
  validation_report: FullValidationReport;
  traceability?: TraceabilitySummary[];
  snapshot: CalculationSnapshot;
  // Metadata
  company_name: string;
  fiscal_year_label: string;
  currency_code: string;
  export_warnings: string[];
}

export function prepareExport(params: {
  validation:      FullValidationReport;
  version:         ReportVersionRecord;
  snapshot:        CalculationSnapshot;
  actif:           ActifReport;
  passif:          PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow:        CashFlowReport;
  notes:           NoteAnnexe[];
  expenseDetails:  ExpenseDetailsReport;
  fiscal:          FiscalResult;
  traceability?:   TraceabilitySummary[];
  company_name:    string;
  fiscal_year_label: string;
  currency_code:   string;
  include_traceability?: boolean;
}): ExportReadyReport {
  const { validation, version } = params;

  if (!validation.can_export) {
    const criticalMessages = validation.categories
      .flatMap((c) => c.messages)
      .filter((m) => m.severity === 'critical')
      .map((m) => m.message_fr);
    throw new Error(
      `Exportation bloquée. Des erreurs critiques doivent être corrigées:\n${criticalMessages.join('\n')}`,
    );
  }

  const exportWarnings: string[] = validation.categories
    .flatMap((c) => c.messages)
    .filter((m) => m.severity === 'warning')
    .map((m) => m.message_fr);

  return {
    version_id:        version.report_version_id,
    calculation_run_id: version.calculation_run_id,
    generated_at:      new Date().toISOString(),
    actif:             params.actif,
    passif:            params.passif,
    income_statement:  params.incomeStatement,
    cash_flow:         params.cashFlow,
    notes:             params.notes,
    expense_details:   params.expenseDetails,
    fiscal:            params.fiscal,
    validation_report: params.validation,
    traceability:      params.include_traceability ? params.traceability : undefined,
    snapshot:          params.snapshot,
    company_name:      params.company_name,
    fiscal_year_label: params.fiscal_year_label,
    currency_code:     params.currency_code,
    export_warnings:   exportWarnings,
  };
}
