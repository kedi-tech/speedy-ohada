# Implementation Todo

This tracker was originally derived from `report.md`. Batches 1-7 are completed. The next backlog is derived from `review.md`, `logicprompt.md`, and the inspected Excel workbooks:

- `D:\documents\Etats Financiers\Etats Financiers.xlsm`
- `D:\documents\Etats Financiers\SPEEDY OHADA 2.1.xlsm`

Each new batch should be implemented, documented in `implementation/batch-N.md`, and then marked complete here.

## Completed Foundation

## Batch 1 - Saved Calculation Results as UI Source of Truth

Status: completed

- [x] Add an API endpoint to fetch the latest saved `CalculationRun`.
- [x] Add client context support for loading persisted calculation results.
- [x] Update financial statement, validation, tax, and charges screens to hydrate from saved results.
- [x] Document the batch in `implementation/batch-1.md`.

## Batch 2 - Persisted Mapping Workflow

Status: completed

- [x] Add database models for configurable mapping rules and account mapping decisions.
- [x] Replace `lib/data.ts` placeholders in `AccountMapping`.
- [x] Save mapping changes with reason/audit logs.
- [x] Trigger recalculation when mapping changes.
- [x] Document the batch in `implementation/batch-2.md`.

## Batch 3 - Grouped Balance Pipeline

Status: completed

- [x] Persist grouped balance rows per organization/company/fiscal year/balance type.
- [x] Use grouped balance in the calculation pipeline.
- [x] Allow mapping rules to use `trial_balance` or `grouped_balance`.
- [x] Document the batch in `implementation/batch-3.md`.

## Batch 4 - Manual Overrides and Approvals

Status: completed

- [x] Add manual override persistence and API routes.
- [x] Add reason, approval, rejection, and audit-log workflow.
- [x] Apply active approved/auto-approved overrides during recalculation.
- [x] Block overrides when reports are locked.
- [x] Document the batch in `implementation/batch-4.md`.

## Batch 5 - Notes and Fiscal Persistence

Status: completed

- [x] Persist note definitions, note values, manual fields, statuses, and editors.
- [x] Replace static notes screens with calculated/persisted note data.
- [x] Persist tax configuration by country/regime/year.
- [x] Replace hardcoded tax, VAT, patente, and honoraires values.
- [x] Document the batch in `implementation/batch-5.md`.

## Batch 6 - Report Versions, Locks, Review, and Export

Status: completed

- [x] Add report version and export record models.
- [x] Enforce locked report restrictions across imports, mappings, notes, fiscal edits, and overrides.
- [x] Connect review approval state to export readiness.
- [x] Replace fake export UI with export-preparation API and generated artifacts.
- [x] Document the batch in `implementation/batch-6.md`.

## Batch 7 - Traceability Drill-Down and Validation Coverage

Status: completed

- [x] Add UI to inspect source accounts, formulas, N/N-1 values, overrides, run metadata, and user.
- [x] Persist/query traceability or expose it from calculation runs.
- [x] Expand validation categories for Actif, Passif, review, export, materiality, and full mapping coverage.
- [x] Document the batch in `implementation/batch-7.md`.

## Review-Driven Backlog

## Batch 8 - Excel Formula Catalog and Crosswalk

Status: completed

- [x] Extract a reusable formula catalog from both `.xlsm` workbooks without relying on Excel macros.
- [x] Capture sheet names, hidden status, dimensions, formulas, defined names, external links, and cross-sheet dependencies.
- [x] Build a crosswalk from workbook sheets and formula groups to app engines, database tables, routes, and UI pages.
- [x] Identify formula groups that are calculation logic, display-only formulas, validations, print helpers, or external references.
- [x] Store the extracted catalog in a project-readable artifact under `implementation/`.
- [x] Document the batch in `implementation/batch-8.md`.

## Batch 9 - Excel-Equivalent Grouped Balance and Class Modules

Status: completed

- [x] Rebuild the grouped balance layer to match the workbook's `BALANCE REGROUPE` structure beyond broad account prefix grouping.
- [x] Preserve raw imported rows, grouped N rows, grouped N-1 rows, signs, debit/credit movement, opening/closing balances, and net balances.
- [x] Add class calculation modules for `CLASSE 1` through `CLASSE 8`.
- [x] Add specialized grouped support for class sheets used heavily by the workbook, including classes 4, 5, 6, and 7.
- [x] Add group-level drilldown from grouped rows back to imported source accounts.
- [x] Add reconciliation between account detail grouped rows and grouped balance totals.
- [x] Document the batch in `implementation/batch-9.md`.

## Batch 10 - Full Mapping and Formula Rule Engine

Status: completed

- [x] Expand mapping rules to support prefixes, account ranges, exact includes, excludes, source types, formulas, signs, and calculation dependencies.
- [x] Add support for formula-based report lines that combine, subtract, or reuse other mapped lines.
- [x] Add mapping coverage foundations for conversion differences, notes, fiscal schedules, DGI pages, and detail des charges.
- [x] Add rule priority through display order and conflict resolution through mapping coverage analysis.
- [x] Add validation foundations for unmapped and multiply mapped accounts.
- [x] Add seed data for conversion differences and formula-line foundations based on the workbook and `logicprompt.md`.
- [x] Document the batch in `implementation/batch-10.md`.

## Batch 11 - Full Financial Statement Line Logic

Status: completed

- [x] Expand Actif with traceable gross, depreciation, net, movement-aware source lines, and subtotal behavior.
- [x] Add conversion difference assets.
- [x] Expand receivables, other current assets, treasury assets, bank, cash, and mobile money categories.
- [x] Expand Passif with equity, result allocation, debts, suppliers, tax/social liabilities, shareholder payables, other liabilities, treasury liabilities, and mobile money liabilities.
- [x] Add conversion difference liabilities.
- [x] Reconcile balance sheet net result with income statement net result when result accounts are missing or incomplete.
- [x] Improve generated Bilan behavior through Actif/Passif line outputs consumed by the statements and export pipeline.
- [x] Expand `COMPTE DE RESULTAT` with traceable operating, financial, HAO, tax, and net result totals.
- [x] Add source-account and formula traceability for every statement total and subtotal.
- [x] Document the batch in `implementation/batch-11.md`.

## Batch 12 - Cash Flow Statement Completion

Status: completed

- [x] Expand `TABLEAU DE FLUX DE TRESORERIE` line logic for operating, investing, financing, net variation, and reconciliation lines.
- [x] Persist and load manual cash flow inputs for acquisitions, disposals, borrowings, repayments, dividends, and other movement-only fields.
- [x] Calculate working capital deltas from N and N-1 statement/grouped-balance-derived totals.
- [x] Represent missing N-1 data as unavailable where required instead of silently using zero.
- [x] Add source traceability for automatic cash flow lines and manual-input traceability for manual lines.
- [x] Add validation for incomplete cash flow inputs and missing N-1 dependent formulas.
- [x] Document the batch in `implementation/batch-12.md`.

## Batch 13 - Notes Annexes 1-36

Status: completed

- [x] Implement calculated/manual hybrid logic for notes 1-36.
- [x] Expand fixed asset and depreciation notes with acquisition, disposal, transfer/manual fields, and closing calculated values.
- [x] Add inventory, receivable, debt, revenue, expense, tax, commitment, related-party, and disclosure schedules required by the workbook.
- [x] Link note totals to Actif, Passif, Income Statement, Cash Flow, Detail des Charges, and Fiscal output anchors where available.
- [x] Add required/optional note behavior based on the fields and accounts actually present in the imported data.
- [x] Add validation foundations that mark required note fields incomplete when note data is missing.
- [x] Document the batch in `implementation/batch-13.md`.

## Batch 14 - Detail Des Charges Completion

Status: completed

- [x] Expand `DETAIL DES CHARGES` beyond broad class 6 categories to workbook-level detail.
- [x] Add account-level schedules, subtotals, and cross-links to income statement lines.
- [x] Link expense detail lines to relevant notes and fiscal add-back/deduction schedules.
- [x] Add drilldown from each detail line to grouped balance rows and source imported rows.
- [x] Add validation for expense detail totals against class 6 and income statement totals.
- [x] Document the batch in `implementation/batch-14.md`.

## Batch 15 - Fiscal, DGI, Patente, and Honoraires

Status: completed

- [x] Implement `CALCULS FISCAUX` line logic.
- [x] Implement BIC pages 1, 2, and 3 calculations.
- [x] Implement DNI declaration calculations.
- [x] Implement `B V` fiscal schedule logic where used by the workbook.
- [x] Expand add-back and deduction categories.
- [x] Add deficit/carry-forward handling where applicable.
- [x] Implement Patente calculation structure and persisted manual fields.
- [x] Implement Honoraires pages 1 and 2 with declaration lines and manual fields.
- [x] Reconcile fiscal result to accounting result and income tax expense.
- [x] Document the batch in `implementation/batch-15.md`.

## Batch 16 - Conversion Differences

Status: completed

- [x] Implement `VENTI DES ECARTS DE CONV` logic.
- [x] Add account mapping for conversion difference assets and liabilities.
- [x] Add Actif and Passif statement lines for conversion differences.
- [x] Add note and validation coverage for conversion differences.
- [x] Add traceability from conversion difference report lines back to source accounts.
- [x] Document the batch in `implementation/batch-16.md`.

## Batch 17 - Validation, Materiality, and Fix Actions

Status: completed

- [x] Complete materiality calculation using fixed amount, total assets, turnover, and net result.
- [x] Expand validation categories for company, N/N-1 balance, account classification, mapping, Actif, Passif, Bilan, Result, Cash Flow, Notes, Fiscal, Review, and Export.
- [x] Distinguish clearly between missing required data, missing optional data, intentionally skipped N-1 data, and unavailable imported fields.
- [x] Extend fix actions so formulas recalculate every automatically derivable value and only request manual input when source data is missing.
- [x] Add validation/fix coverage for notes, fiscal schedules, conversion differences, and export readiness.
- [x] Add regression tests for validation categories and fix actions.
- [x] Document the batch in `implementation/batch-17.md`.

## Batch 18 - Traceability, Review Approval, Versioning, and Locking

Status: completed

- [x] Store full formula dependency chains for every calculated value.
- [x] Preserve source account lists for all totals, subtotals, and formula lines.
- [x] Show mapping rule, source row, manual input, override, formula, and calculation run history in review drilldowns.
- [x] Complete review approval state and approval gates before export.
- [x] Add immutable locked report versions tied to calculation runs and export records.
- [x] Add comparison between calculation runs, review versions, and locked export versions.
- [x] Document the batch in `implementation/batch-18.md`.

## Batch 19 - Statutory Excel/PDF Export Templates

Status: completed

- [x] Generate real XLSX exports matching the workbook statements, notes, detail schedules, and fiscal forms.
- [x] Generate PDF exports for the selected report package.
- [x] Support export selections for financial statements, notes, detail des charges, fiscal forms, DGI declarations, Patente, Honoraires, and review pack.
- [x] Rerun calculations and validations immediately before export.
- [x] Block export when required validation gates fail.
- [x] Archive exported files with selected package, calculation run, review version, and lock state.
- [x] Document the batch in `implementation/batch-19.md`.

## Batch 20 - Workbook-Parity QA and Regression Suite

Status: completed

- [x] Create fixture imports that represent available N data, available N/N-1 data, missing optional fields, and sparse imports.
- [x] Add workbook-parity tests for grouped balance, class modules, financial statements, notes, detail charges, fiscal schedules, validation, and exports.
- [x] Add end-to-end UI tests for import, validation fix, review approval, and export.
- [x] Add numeric tolerance tests for rounding and materiality.
- [x] Add non-regression tests to ensure missing imported fields do not break calculations that can still be derived.
- [x] Document the batch in `implementation/batch-20.md`.
