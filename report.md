# Speedy OHADA Logic Implementation Gap Report

Date reviewed: 2026-05-13

This report compares the current codebase against `logicprompt.md`. The short version is that the project has a meaningful first draft of the calculation engine, but it does not yet implement the complete backend logic, persistence, workflow, traceability, and export behavior requested in the prompt.

## Overall Status

The implementation is partial.

Implemented or partially implemented:

- Import parsing helpers for CSV and Excel-like files.
- Balance normalization.
- Account prefix extraction.
- OHADA class detection.
- A hardcoded default mapping rule set.
- Basic Actif, Passif, Income Statement, Cash Flow, Notes, Expense Details, Fiscal, Validation, Traceability, Report Version, Manual Override, and Export Preparation modules.
- API endpoints for companies, fiscal years, trial balance import, app data, login/signup, and calculation runs.
- Persistence for companies, fiscal years, trial balance lines, import batches, calculation run JSON snapshots, audit logs, users, organizations, and notifications.

Not fully implemented:

- Complete end-to-end backend workflow from import to export.
- Persistent mapping rules and user mapping workflow.
- Persistent grouped balance.
- Persistent manual overrides and approvals.
- Persistent note completion/manual fields.
- Persistent fiscal settings and tax rates.
- Persistent report versions and export records.
- Loading saved calculation results into the statement, validation, tax, export, and notes UI.
- Real export generation.
- Full traceability UI.
- Full validation categories and blocking workflow.

## Major Architectural Mismatch

`logicprompt.md` asks for a backend-driven financial logic engine where every report value is calculated from imported trial balance lines, mapping rules, manual inputs, or approved overrides.

The current project mixes three separate sources of truth:

1. Database-backed import and calculation runs:
   - `app/api/trial-balance/import/route.ts`
   - `app/api/calculations/run/route.ts`
   - `prisma/schema.prisma`

2. In-memory client engine state:
   - `context/EngineContext.tsx`
   - `components/screens/StatementsScreen.tsx`
   - `components/screens/ValidationCenter.tsx`
   - `components/screens/TaxModule.tsx`

3. Empty or static placeholder data:
   - `lib/data.ts`
   - `components/screens/AccountMapping.tsx`
   - `components/screens/NotesAnnexes.tsx`
   - `components/screens/ExportCenter.tsx`

Because of this, successful backend calculation runs are saved but not consistently displayed by the app. For example, `/api/calculations/run` stores a `CalculationRun`, but `StatementsScreen` reads only `state.result` from `EngineContext`, which is not populated from the database.

## Missing or Incomplete Items by Prompt Section

### 1. Main Logic Architecture

Prompt requirement:

- Create independent modules for ImportEngine, BalanceNormalizer, AccountPrefixEngine, OHADAClassEngine, GroupedBalanceEngine, MappingEngine, FinancialStatementEngine, ActifEngine, PassifEngine, IncomeStatementEngine, CashFlowEngine, NotesAnnexesEngine, ExpenseDetailsEngine, FiscalEngine, ValidationEngine, TraceabilityEngine, ManualOverrideEngine, ReportVersionEngine, ExportPreparationEngine.
- Every calculation must be traceable back to source accounts.

Current status:

- Files exist for all requested modules under `lib/engine`.
- Several modules are skeletal or not wired into the actual persisted workflow.
- `FinancialStatementEngine.ts` imports `buildGroupedBalance` but does not use it.
- Manual override, report version, traceability, and export preparation are mostly pure helper modules, not persisted workflows.

Not implemented:

- No complete backend pipeline persists each stage.
- No database models for grouped balance, mapping rules, manual overrides, report versions, export records, traceability records, or note fields.
- No UI drill-down for source accounts/formulas on calculated report values.

Relevant files:

- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/GroupedBalanceEngine.ts`
- `lib/engine/TraceabilityEngine.ts`
- `lib/engine/ManualOverrideEngine.ts`
- `lib/engine/ReportVersionEngine.ts`
- `lib/engine/ExportPreparationEngine.ts`
- `prisma/schema.prisma`

### 2. Import Engine

Prompt requirement:

- Accept `.xlsx`, `.xls`, `.xlsm` as data-only and CSV.
- Read sheets/tables.
- Detect header row.
- Let user map columns.
- Preview and validate.
- Save raw import.
- Save normalized trial balance.

Current status:

- CSV parsing exists in `ImportEngine.ts`.
- File type detection exists.
- UI supports `.xlsx`, `.xls`, `.xlsm`, `.csv`, and `.txt` in `BalanceImport.tsx`.
- Excel reading is done client-side via `xlsx`.
- Trial balance lines are saved via `/api/trial-balance/import`.

Not implemented:

- Raw uploaded file is not stored.
- Raw imported rows are not stored separately from normalized lines.
- Sheet/table selection is minimal; it chooses preferred/current or first sheet.
- User column mapping is client-only for that import event and not saved as reusable configuration beyond JSON on `ImportBatch`.
- Import validation is basic; no full critical/warning validation workflow before save.
- No macro-specific guard beyond using data read; no explicit `.xlsm` macro handling policy.

Relevant files:

- `lib/engine/ImportEngine.ts`
- `components/screens/BalanceImport.tsx`
- `app/api/trial-balance/import/route.ts`
- `prisma/schema.prisma`

### 3. Balance Normalization Logic

Prompt requirement:

- Trim/remove spaces, keep leading zeros, convert numbers, flag negatives, validate labels/numbers/classes, calculate net balance from closing or opening/movement values.

Current status:

- Most basic normalization exists in `BalanceNormalizer.ts`.
- Prefix/class enrichment is done before persistence in import route.

Not implemented or incomplete:

- Empty account number and no digits are warnings, not critical errors.
- Negative values are flagged as warnings only.
- Warnings are stored, but there is no enforced blocking workflow at import time.
- Number parsing is simple and may not handle all OHADA/Excel regional formats consistently.

Relevant files:

- `lib/engine/BalanceNormalizer.ts`
- `app/api/trial-balance/import/route.ts`

### 4. Account Prefix Engine

Prompt requirement:

- Generate prefixes 1 through 6 and use them across classification, aggregation, mapping, notes, fiscal, and expenses.

Current status:

- Prefix extraction exists and is used during import and calculation.

Not implemented:

- Prefixes are not used across all requested downstream features.
- Grouped balance stage is not wired into the main calculation.
- Fiscal and notes logic only partially use account-derived data.

Relevant files:

- `lib/engine/AccountPrefixEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`

### 5. OHADA Class Engine

Prompt requirement:

- Detect classes 1-9.
- Include classes 1-8 in statements.
- Exclude class 9 unless enabled.
- Unknown class warning.
- Empty account number critical error.

Current status:

- Class detection exists.
- Class 9 can be excluded by helper `filterForStatements`.

Not implemented:

- There is no persisted/admin setting to enable class 9.
- Empty account numbers become warnings upstream, not critical errors.
- Statement engines do not consistently call `filterForStatements`; mapping rules determine inclusion instead.

Relevant files:

- `lib/engine/OHADAClassEngine.ts`
- `lib/engine/MappingEngine.ts`

### 6. Balance Validation Logic

Prompt requirement:

- Balance N mandatory.
- Balance N must be balanced.
- Balance N-1 recommended.
- Missing N-1 requires explicit user confirmation.
- Critical balance errors block final export.

Current status:

- Balance summaries exist.
- Validation engine checks Balance N and Balance N-1.
- `/api/calculations/run` blocks if Balance N is missing.

Not implemented:

- Missing N-1 is automatically treated as skipped in `/api/calculations/run`; there is no explicit user confirmation.
- Validation report is saved inside `CalculationRun`, but UI reads in-memory context rather than latest saved validation.
- Export screen does not use saved validation to actually block export.

Relevant files:

- `lib/engine/BalanceNormalizer.ts`
- `lib/engine/ValidationEngine.ts`
- `app/api/calculations/run/route.ts`
- `components/screens/ValidationCenter.tsx`
- `components/screens/ExportCenter.tsx`

### 7. Grouped Balance Engine

Prompt requirement:

- Replace Excel "BALANCE REGROUPE" sheet.
- Create grouped balance records per company/fiscal year/type.
- Support prefix, range, manual selection, exclusion, custom formula.
- Store source accounts.

Current status:

- `GroupedBalanceEngine.ts` exists.
- Type definitions exist.

Not implemented:

- Main calculation does not use grouped balance output.
- No `GroupedBalance` database model.
- No persistence of grouped records.
- No UI or API for grouped balance.
- No custom formula or manual selection persistence.

Relevant files:

- `lib/engine/GroupedBalanceEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `prisma/schema.prisma`

### 8. Mapping Engine

Prompt requirement:

- Mapping rules must be configurable, not hardcoded directly in code.
- Support report type, section, line, labels, prefixes/ranges/includes/excludes, source type, signs, formula, manual override flags.

Current status:

- Mapping type supports many required fields.
- Default rules exist in `mappingRules.ts`.
- `MappingEngine.ts` applies prefix/range/include/exclude and display signs.

Not implemented:

- Rules are hardcoded in `lib/engine/mappingRules.ts`, not configurable in the database.
- Mapping UI does not use real imported `TrialBalanceLine` data.
- Mapping UI imports empty placeholders from `lib/data.ts`.
- Applying a manual mapping does not save anything.
- No audit log for mapping changes.
- `formula_expression` and custom formula behavior are not implemented.
- `source_type: grouped_balance` is not implemented in practice.

Relevant files:

- `lib/engine/mappingRules.ts`
- `lib/engine/MappingEngine.ts`
- `components/screens/AccountMapping.tsx`
- `lib/data.ts`
- `prisma/schema.prisma`

### 9. Basic Report Line Calculation

Prompt requirement:

- Every report line calculated for N and N-1.
- Variation amount and percentage.
- Missing N-1 displays unavailable/null.
- Store source accounts, formula, override, validation status.

Current status:

- `ReportLine` type has most fields.
- `MappingEngine` calculates N, N-1, variation, source accounts for N.

Not implemented or incomplete:

- Source accounts only include N accounts, not N-1 accounts.
- Source amount uses raw net balance, not display-signed amount.
- Totals have empty `source_accounts`, so totals are not traceable.
- Missing N-1 display is handled ad hoc in UI, not as a consistent bilingual unavailable state.
- Calculated lines are saved only inside JSON blobs, not queryable line records.

Relevant files:

- `lib/engine/types.ts`
- `lib/engine/MappingEngine.ts`
- `lib/engine/ActifEngine.ts`
- `lib/engine/PassifEngine.ts`
- `lib/engine/IncomeStatementEngine.ts`

### 10. Actif Engine

Prompt requirement:

- Full assets structure including fixed assets, current assets, treasury assets, conversion differences, gross/depreciation/net columns.

Current status:

- Basic Actif calculation exists.
- It calculates fixed assets, stocks, receivables, treasury, total assets.

Not implemented or incomplete:

- Conversion difference assets are not implemented.
- Other current assets are not separately implemented.
- Mobile money/wallet treasury is not implemented.
- Gross/depreciation/net are not consistently stored on `ReportLine`; UI reconstructs some values.
- Mapping coverage is simplified.

Relevant files:

- `lib/engine/ActifEngine.ts`
- `lib/engine/mappingRules.ts`
- `components/screens/StatementsScreen.tsx`

### 11. Passif Engine

Prompt requirement:

- Full equity/liabilities structure including conversion differences and critical validation of total actif/passif.

Current status:

- Basic Passif calculation exists.
- Validation checks total Actif against total Passif.

Not implemented or incomplete:

- Conversion difference liabilities are not implemented.
- Short-term financing beyond bank credit mapping is simplified.
- Net result at passif relies on account prefix `13`; it is not automatically tied to calculated income statement result.

Relevant files:

- `lib/engine/PassifEngine.ts`
- `lib/engine/ValidationEngine.ts`

### 12. Balance Sheet Engine

Prompt requirement:

- Dedicated BalanceSheetEngine combining Actif and Passif with N and N-1 differences.

Current status:

- There is no separate `BalanceSheetEngine`.
- Validation performs some balance sheet checks.

Not implemented:

- Dedicated module requested by the prompt is absent.
- Balance sheet output is not stored as its own structured result beyond Actif/Passif JSON.

Relevant files:

- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ValidationEngine.ts`

### 13. Income Statement Engine

Prompt requirement:

- Classe 6/7/8 logic, operating, financial, ordinary, HAO, income tax, net result.
- Validate income statement net result against passif.

Current status:

- Basic income statement exists.
- Basic result validation exists.

Not implemented or incomplete:

- Mapping is simplified.
- Class 8 inclusion/configuration is not admin-configurable.
- Net result validation depends on passif account `13`, not an automated closing/accounting result process.
- No persisted report line table.

Relevant files:

- `lib/engine/IncomeStatementEngine.ts`
- `lib/engine/ValidationEngine.ts`
- `lib/engine/mappingRules.ts`

### 14. Expense Details Engine

Prompt requirement:

- Classe 6 categories, N/N-1, variation, drill-down to account prefix/account/label/amount.

Current status:

- `ExpenseDetailsEngine.ts` exists and calculates categories.
- `ChargesDetail.tsx` appears to consume engine context when available.

Not implemented or incomplete:

- No persistence of expense details outside `CalculationRun` JSON.
- No backend route to fetch expense details by fiscal year.
- No full drill-down traceability linked to persisted accounts and mapping rules.

Relevant files:

- `lib/engine/ExpenseDetailsEngine.ts`
- `components/screens/ChargesDetail.tsx`

### 15. Cash Flow Engine

Prompt requirement:

- Automatic/manual cash flow logic.
- Manual inputs require reason and audit log.
- Validation of cash flow.

Current status:

- Basic indirect cash flow calculation exists.
- Manual input type exists.

Not implemented:

- No UI for required cash flow manual inputs with reason.
- No persistence for cash flow manual inputs.
- No audit logs for manual cash flow values.
- Missing N-1 defaults opening cash to zero rather than requiring/recording explicit continuation.
- Manual values are not integrated with approval/override workflow.

Relevant files:

- `lib/engine/CashFlowEngine.ts`
- `lib/engine/types.ts`
- `components/screens/StatementsScreen.tsx`

### 16. Notes Annexes Engine

Prompt requirement:

- Support Notes 1 to 36, fields, formulas, manual fields, required fields, statuses, validation, manual completion when not calculable.

Current status:

- `NotesAnnexesEngine.ts` creates note data.
- `StatementsScreen` can show notes from in-memory result.

Not implemented:

- Notes UI uses `ANNEX_NOTES` and `NOTES_META` from `lib/data.ts`, not calculated/persisted notes.
- `lib/data.ts` has empty `ANNEX_NOTES`.
- Note editor reads placeholder `ANNEX_NOTES` and saves only local state.
- No database model for note values, manual fields, status, editor, or validation result.
- No complete Notes 1-36 persisted workflow.

Relevant files:

- `lib/engine/NotesAnnexesEngine.ts`
- `components/screens/NotesAnnexes.tsx`
- `components/screens/NoteEditor.tsx`
- `lib/data.ts`
- `prisma/schema.prisma`

### 17. Fiscal Engine

Prompt requirement:

- Tax rates configurable by country, regime, year.
- Manual fiscal values require source/comment.
- Calculate accounting result, add-backs, deductions, taxable result, calculated tax, installments, tax credits, balance payable, patente, honoraires.

Current status:

- `FiscalEngine.ts` calculates basic tax from accounting result and manual inputs.
- `TaxModule.tsx` displays fiscal result if in-memory context has one.

Not implemented:

- No `TaxConfig` database model.
- Tax rate defaults to `25` in `makeEngineContext`, which conflicts with "do not hardcode tax rates" unless always supplied.
- No UI/API to configure tax rate by country/regime/year.
- Fiscal manual inputs are not persisted.
- Manual fiscal values do not require source/comment in the UI.
- Patente and honoraires screens use hardcoded rows.
- VAT uses hardcoded 18%.

Relevant files:

- `lib/engine/FiscalEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `components/screens/TaxModule.tsx`
- `prisma/schema.prisma`

### 18. Manual Override Engine

Prompt requirement:

- Manual overrides require reason, visibility, audit logs, reviewer approval, lock protection, preserve original value, traceability.

Current status:

- `ManualOverrideEngine.ts` can create, approve, reject override objects in memory.
- `MappingEngine.ts` can apply overrides passed into calculation.

Not implemented:

- No `ManualOverride` database model.
- No override UI.
- No API for creating/approving/rejecting overrides.
- No audit log integration for overrides.
- No report locking enforcement.
- No persisted override traceability.

Relevant files:

- `lib/engine/ManualOverrideEngine.ts`
- `lib/engine/MappingEngine.ts`
- `prisma/schema.prisma`

### 19. Traceability Engine

Prompt requirement:

- Click a calculated value and show source accounts, formula, amounts, variation, manual adjustments, last recalculation, user.

Current status:

- `TraceabilityEngine.ts` creates summaries from report lines.
- `CalculationRun.traceability` JSON is saved by `/api/calculations/run`.

Not implemented:

- No UI to click a value and inspect traceability.
- No persisted traceability table.
- Totals often have no source accounts, so traceability is incomplete.
- N-1 source accounts are not included in line traceability.
- Mapping rule IDs are hardcoded rule IDs, not persisted configurable rules.

Relevant files:

- `lib/engine/TraceabilityEngine.ts`
- `lib/engine/MappingEngine.ts`
- `components/screens/StatementsScreen.tsx`
- `prisma/schema.prisma`

### 20. Validation Engine

Prompt requirement:

- Categories: company, Balance N, Balance N-1, classification, mapping, Actif, Passif, Bilan, Income Statement, Cash Flow, Notes, Fiscal, Review, Export.
- Critical errors block export.

Current status:

- Basic validation engine exists.
- Validates company info, balance N/N-1, mapping classification, bilan, income/passif result, cash flow, notes, fiscal, export.

Not implemented or incomplete:

- Does not separately validate Actif and Passif categories.
- Does not validate review workflow.
- Mapping validation only checks account class unknown/out of 1-8, not actual unmapped material accounts against mapping rules.
- Materiality supports only fixed threshold and assets percentage in validation input; turnover/net result materiality are not implemented.
- Company info validation requires currency/opening/closing dates, but `/api/calculations/run` does not pass them, causing avoidable critical errors.
- Validation UI reads in-memory context only, not saved calculation validation.
- Export screen does not enforce validation.

Relevant files:

- `lib/engine/ValidationEngine.ts`
- `app/api/calculations/run/route.ts`
- `components/screens/ValidationCenter.tsx`
- `components/screens/ExportCenter.tsx`

### 21. Materiality Logic

Prompt requirement:

- Fixed amount, percentage of total assets, percentage of turnover, percentage of net result; max of enabled calculations.

Current status:

- Partial fixed/assets percentage support exists in `ValidationEngine`.

Not implemented:

- Turnover percentage is not implemented.
- Net result percentage is not implemented.
- No settings UI or persistence.
- No proper unmapped-account materiality because mapping persistence is absent.

Relevant files:

- `lib/engine/types.ts`
- `lib/engine/ValidationEngine.ts`

### 22. Rounding and Tolerance Logic

Prompt requirement:

- Currency settings with decimal places, rounding method, rounding tolerance.

Current status:

- Context has `decimal_places` and `rounding_tolerance`.
- Tolerance is used in some validation checks.

Not implemented:

- No rounding method support (`nearest`, `floor`, `ceil`).
- No currency settings database model.
- No UI for currency decimal/tolerance configuration.
- Report values are not consistently rounded through a central engine.

Relevant files:

- `lib/engine/types.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ValidationEngine.ts`

### 23. Recalculation Logic

Prompt requirement:

- Recalculate when balance import/reimport, mapping changes, overrides, fiscal/currency/tax/template changes.
- Save snapshot, update status/progress.

Current status:

- Import of Balance N triggers `/api/calculations/run` from `BalanceImport.tsx`.
- `/api/calculations/run` updates fiscal year/company progress and status.

Not implemented:

- No recalculation trigger on N-1 import.
- No recalculation trigger on mapping changes because mapping changes are not persisted.
- No recalculation trigger on manual override changes.
- No recalculation trigger on fiscal/tax/currency/template changes.
- No job or service layer for recalculation dependencies.

Relevant files:

- `components/screens/BalanceImport.tsx`
- `app/api/calculations/run/route.ts`
- `components/screens/AccountMapping.tsx`
- `components/screens/TaxModule.tsx`

### 24. Calculation Snapshot Logic

Prompt requirement:

- Every calculation run creates a snapshot with many totals and validation counts.

Current status:

- `CalculationSnapshot` type exists.
- `CalculationRun` stores `snapshot` JSON and summary numeric fields.

Not implemented or incomplete:

- Snapshot lacks some requested fields as first-class DB columns.
- It is saved as JSON, making querying and history reporting limited.
- No UI for calculation history.
- No failed/running state workflow.

Relevant files:

- `lib/engine/types.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `prisma/schema.prisma`
- `app/api/calculations/run/route.ts`

### 25. Report Version Logic

Prompt requirement:

- Create report versions with statuses draft/review/approved/exported/locked/archived.
- Locked reports block modifications.
- Unlock requires permission, reason, audit log.

Current status:

- `ReportVersionEngine.ts` has pure helper functions.
- `ReportVersionRecord` type exists.

Not implemented:

- No `ReportVersion` database model.
- No API for version creation, status transitions, locking/unlocking.
- No enforcement that locked reports prevent balance/mapping/override/note/fiscal edits.
- Archive/review screens are mostly static or use placeholder data.

Relevant files:

- `lib/engine/ReportVersionEngine.ts`
- `components/screens/Archives.tsx`
- `components/screens/ReviewWorkflow.tsx`
- `prisma/schema.prisma`

### 26. Export Preparation Engine

Prompt requirement:

- Before export run recalculation, final validation, critical error checks, review approvals, export-ready data, export record, export version.

Current status:

- `ExportPreparationEngine.ts` can throw when validation cannot export.

Not implemented:

- Export screen does not call the engine.
- No export API.
- No export record model.
- No actual PDF/Excel generation.
- No review approval check.
- No saved export version.
- Export UI is hardcoded and uses a timeout to fake completion.

Relevant files:

- `lib/engine/ExportPreparationEngine.ts`
- `components/screens/ExportCenter.tsx`
- `prisma/schema.prisma`

### 27. Default Report Line Labels

Prompt requirement:

- Every report line must have French and English labels.

Current status:

- Mapping rules and generated totals generally include French and English labels.

Not implemented or incomplete:

- Coverage is incomplete relative to full SYSCOHADA statements.
- Labels contain encoding/mojibake issues in many files.
- Static UI labels are not always consistent with engine labels.

Relevant files:

- `lib/engine/mappingRules.ts`
- `lib/engine/ActifEngine.ts`
- `lib/engine/PassifEngine.ts`
- `lib/engine/IncomeStatementEngine.ts`
- `components/screens/StatementsScreen.tsx`

### 28. Final Expected Output

Prompt requirement:

The logic engine must output:

1. Normalized Balance N
2. Normalized Balance N-1
3. Account prefixes
4. OHADA classes
5. Grouped balance
6. Mapping results
7. Actif report
8. Passif report
9. Balance sheet validation
10. Income statement
11. Net result validation
12. Cash flow statement
13. Cash flow validation
14. Notes annexes values
15. Expense details
16. Fiscal values
17. Validation report
18. Traceability data
19. Calculation snapshot
20. Export-ready report data

Current status:

- Items 1-4 are implemented.
- Items 7-18 are partially implemented in memory/JSON.
- Item 19 is implemented as a JSON snapshot.

Not implemented or incomplete:

- Item 5 grouped balance is not integrated.
- Item 6 mapping results are not persisted as configurable/user-editable results.
- Item 20 export-ready report data exists as a helper but is not wired to the UI/API or persistence.
- The user cannot always understand how amounts were calculated because there is no complete traceability UI.

## Specific UI Areas That Are Still Prototype/Static

### Account Mapping

- Uses `TRIAL_BALANCE` and `MAPPING_LINES` from `lib/data.ts`.
- These are empty placeholders.
- Mapping changes do not persist.
- Apply/Skip buttons do nothing.

Files:

- `components/screens/AccountMapping.tsx`
- `lib/data.ts`

### Statements

- Displays only `EngineContext.state.result`.
- Does not fetch latest `CalculationRun`.
- Export buttons do not trigger export.

Files:

- `components/screens/StatementsScreen.tsx`
- `context/EngineContext.tsx`

### Validation Center

- Displays only in-memory validation.
- Does not fetch latest saved validation report.
- "Run check" calls client calculation only if `state.balanceN` exists in memory.

Files:

- `components/screens/ValidationCenter.tsx`
- `context/EngineContext.tsx`

### Notes

- Main notes screen and editor use `ANNEX_NOTES`/`NOTES_META` from `lib/data.ts`.
- No persistence or API.

Files:

- `components/screens/NotesAnnexes.tsx`
- `components/screens/NoteEditor.tsx`
- `lib/data.ts`

### Tax

- Patente/honoraires are hardcoded.
- VAT rate is hardcoded at 18%.
- Patente rate input defaults to 0.5%.
- No persisted country/regime/year tax configuration.

Files:

- `components/screens/TaxModule.tsx`
- `lib/engine/FiscalEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`

### Export

- Static export item list.
- Static readiness percentage.
- Static critical/warning counts.
- Fake export via `setTimeout`.
- No API or generated files.

Files:

- `components/screens/ExportCenter.tsx`
- `lib/engine/ExportPreparationEngine.ts`

## Missing Database Models

The following prompt concepts are not represented as first-class Prisma models:

- MappingRule
- AccountMapping or UserMappingDecision
- GroupedBalance
- ReportLine
- ValidationReport / ValidationMessage
- TraceabilityRecord
- ManualOverride
- ManualOverrideApproval
- ReportVersion
- ExportRecord
- ExportPackage
- NoteDefinition
- NoteValue
- NoteManualField
- FiscalConfig / TaxRate
- FiscalManualInput
- CurrencySetting
- MaterialitySetting
- CashFlowManualInput
- ReviewApproval / ReviewComment

Current schema only has:

- Organization
- User
- Company
- FiscalYear
- TrialBalanceLine
- ImportBatch
- CalculationRun
- AuditLog
- Notification

## Highest Priority Fixes

1. Make the database/API the source of truth for calculation results.
   - Add an API to fetch the latest `CalculationRun` for a fiscal year.
   - Update Statements, Validation, Tax, Charges, Notes, and Export screens to load saved results.

2. Persist mapping rules and mapping decisions.
   - Add `MappingRule` and account mapping models.
   - Replace `lib/data.ts` placeholders in `AccountMapping`.
   - Recalculate after mapping changes.

3. Implement grouped balance persistence and use it in the pipeline.
   - Store grouped balance rows per company/fiscal year/balance type.
   - Let mapping rules use either trial balance or grouped balance.

4. Implement manual overrides as a real workflow.
   - Add model, API, UI, approval state, audit logs, lock checks.

5. Replace static export with real export preparation.
   - Add export API.
   - Call recalculation/validation.
   - Block critical errors.
   - Create report version/export record.

6. Replace static notes and tax screens.
   - Persist note fields/statuses.
   - Persist tax config by country/regime/year.
   - Remove hardcoded tax/VAT/patente/honoraires values.

7. Add report/version locking.
   - Enforce locks across imports, mappings, overrides, notes, and fiscal edits.

8. Build traceability drill-down UI.
   - Show source accounts, formulas, N/N-1, overrides, calculation run, and user.

## Conclusion

The codebase currently contains a useful engine scaffold and some real import/calculation persistence, but it does not yet satisfy the complete logic contract in `logicprompt.md`.

The biggest issue is not that nothing exists. The biggest issue is that the existing pieces are not connected into a single persisted, auditable workflow. The app still relies heavily on client memory and static placeholders, while the prompt requires a backend-first system where every amount can be recalculated, validated, versioned, exported, and traced back to source accounts and approved manual changes.
