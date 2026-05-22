# Formula and Logic Alignment Review

Date: 2026-05-13

## Scope

This review compares:

- `logicprompt.md`
- `D:\documents\Etats Financiers\Etats Financiers.xlsm`
- `D:\documents\Etats Financiers\SPEEDY OHADA 2.1.xlsm`
- The current application logic in `lib/engine`, import/export routes, validation, and review/export pages

The Excel files were inspected structurally through their workbook XML because the macro workbooks contain complex drawings that prevent a normal full workbook load. The review therefore compares sheet coverage, formula density, formula dependencies, hidden operational sheets, and the app's implemented calculation engines.

## High-Level Finding

The app now follows the broad architecture requested in `logicprompt.md`: it has import, balance normalization, mapping, financial statement engines, validation, review, export preparation, traceability fields, manual overrides, and calculation runs.

However, it does not yet align with the full Excel workbook logic. The current app implements a simplified OHADA reporting engine, while `SPEEDY OHADA 2.1.xlsm` is a much larger operational workbook with many more calculation sheets, hidden grouping sheets, class-specific schedules, detailed note formulas, fiscal forms, and DGI declaration pages.

The biggest gaps are not small UI issues. They are missing calculation depth, missing Excel-equivalent classification logic, missing fiscal form logic, incomplete notes 9-36, incomplete balance regrouping behavior, and exports that do not yet recreate the Excel/PDF statutory outputs.

## Workbook Evidence

### Etats Financiers.xlsm

- 64 visible sheets.
- About 31,291 non-empty cells.
- About 11,936 formula cells.
- Main report sheets include `ACTIF`, `PASSIF`, `BILAN paysage`, `COMPTE DE RESULTAT`, `TABLEAU DE FLUX DE TRESORERIE`, `NOTES ANNEXES`, `NOTE 1` through `NOTE 36 TABLEAU DE CODES`, and `DETAIL DES CHARGES`.
- This workbook appears focused on financial statement forms and notes.

### SPEEDY OHADA 2.1.xlsm

- 100 sheets.
- 85 visible sheets and 15 hidden or very hidden sheets.
- About 135,396 non-empty cells.
- About 48,993 formula cells.
- Contains operational sheets absent from the smaller workbook, including `BALANCE N`, `BALANCE N-1`, `BALANCE REGROUPE`, `CLASSE 1` through `CLASSE 8`, `VENTI DES ECARTS DE CONV`, `CALCULS FISCAUX`, `BIC 1999 PAGE 1`, `BIC 1999 PAGE 2`, `BIC 1999 PAGE 3`, `PATENTE`, `HONORAIRES PAGE 1`, `HONORAIRES PAGE 2`, `Declaration DNI`, and `B V`.
- `BALANCE N` alone contains about 12,156 formula cells.
- `BALANCE REGROUPE` is very hidden and contains about 8,744 formula cells, which strongly indicates that regrouping/classification is a major part of the workbook logic.
- `DETAIL DES CHARGES` contains about 2,140 formula cells, much more detailed than the app's current expense detail grouping.

## Alignment Summary

Implemented or partially implemented:

- Flexible import and normalized trial balance records.
- N and N-1 balance support.
- Mapping rules by account prefixes and report sections.
- Actif, Passif, Income Statement, Cash Flow, Notes, Fiscal, Expense Details engines.
- Manual overrides.
- Validation center with fix actions and formula recalculation.
- Review page controls.
- Export selection and export preparation.
- Calculation run snapshots.
- Basic traceability fields for many calculated lines.

Not fully implemented:

- Excel-equivalent balance regrouping.
- Full OHADA line-by-line Actif, Passif, Bilan, Income Statement, Cash Flow, and Notes formulas.
- Notes 9-36 calculation logic.
- Detailed class sheet logic from `CLASSE 1` through `CLASSE 8`.
- Detailed fiscal workbook logic and DGI declaration pages.
- Full conversion difference handling.
- Full mapping include/exclude/range/formula behavior.
- Complete materiality logic using assets, turnover, and net result.
- Export to real statutory Excel/PDF forms.
- Full source-account traceability for totals and derived lines.

## Missing Logic and Formula Gaps

### 1. Balance Regrouping Is Too Simplified

`logicprompt.md` requires a grouped balance equivalent to Excel `BALANCE REGROUPE`.

The workbook confirms this is central logic: `BALANCE REGROUPE` is a very hidden sheet with thousands of formulas. The app currently normalizes imported rows and maps accounts by broad prefixes, but it does not reproduce the full hidden regrouping layer from Excel.

Missing:

- Excel-style regrouped account rows.
- Grouping by detailed OHADA account families before statement generation.
- Preservation of grouped N and N-1 totals.
- Group-level drilldown equivalent to the workbook's hidden operational calculations.
- A visible internal audit trail that shows how raw imported rows become grouped statement lines.

Impact:

- Financial statements may calculate from imported balances, but they do not yet match the workbook's regrouped calculation path.

### 2. Class Sheet Logic Is Not Implemented

`SPEEDY OHADA 2.1.xlsm` includes `CLASSE 1` through `CLASSE 8`, plus specialized sheets such as `CLASSE 4`, `CLASSE 5`, `CLASSE 6`, and `CLASSE 7`.

The app has broad prefix-based mapping, but it does not implement these class sheets as calculation modules.

Missing:

- Detailed class-level calculations.
- Class-specific account rollups.
- Class-level validation and reconciliation.
- Workbook-style dependencies from class sheets into Actif, Passif, Result, Notes, Fiscal, and Detail des Charges.

Impact:

- The app can classify accounts generally, but it cannot yet reproduce the detailed Excel source logic behind many report lines.

### 3. Mapping Rules Do Not Yet Match the Workbook Depth

`logicprompt.md` calls for configurable mapping rules with prefixes, ranges, includes, excludes, source types, formulas, and overrides.

The app has mapping rules, but most default rules are broad prefix rules. Formula-style mapping and deeper include/exclude behavior are not fully represented.

Missing:

- Complete OHADA mapping table equivalent to the workbook.
- Range-based and exception-based mappings at the same detail level as Excel.
- Formula mappings that combine or subtract mapped groups.
- Support for workbook-specific special cases, especially conversion differences, fiscal lines, and note schedules.
- More explicit source-type handling for calculated, manual, imported, and overridden values.

Impact:

- Some imported balances will be classified, but edge cases and statutory line placement may differ from the Excel workbook.

### 4. Actif Logic Is Partial

The app calculates fixed assets, current assets, treasury assets, and total assets. This matches the broad structure of `logicprompt.md`.

Missing compared with the workbook and prompt:

- Detailed gross/depreciation/net movements by asset category.
- Opening, acquisition, disposal, transfer, reclassification, and closing movement logic.
- Conversion difference assets.
- More complete inventory categories.
- More complete receivable categories.
- Distinct bank/cash/mobile money treatment where applicable.
- Source-account traceability on computed totals.

Impact:

- The Actif statement exists, but it is not yet Excel-equivalent for detailed OHADA lines and notes.

### 5. Passif Logic Is Partial

The app calculates equity, debts, current liabilities, treasury liabilities, and total liabilities/equity.

Missing:

- Conversion difference liabilities.
- More complete equity breakdown.
- More complete financial debt breakdown.
- Full supplier, tax, social, and other liability classifications.
- Direct reconciliation between income statement net result and balance sheet result when account 13 is absent or incomplete.
- Source-account traceability on computed totals.

Impact:

- Passif totals can be produced, but the app can diverge from Excel when result allocation, conversion differences, or detailed liability categories are needed.

### 6. Income Statement Logic Is Too Broad

The workbook `COMPTE DE RESULTAT` has about 146 formula cells and a much richer line structure than the current app engine.

The app implements:

- Operating income.
- Operating expenses.
- Financial result.
- HAO result.
- Tax.
- Net result.

Missing:

- Full OHADA income statement line structure.
- Detailed operating revenue categories.
- Detailed expense categories.
- Workbook-style subtotals and intermediate balances.
- Production, margin, value added, personnel, depreciation, and other detailed result measures where required.
- Stronger reconciliation with fiscal calculations and balance sheet result.

Impact:

- The app gives a valid high-level income result, but not the full Excel statement logic.

### 7. Cash Flow Logic Is Partial

`logicprompt.md` requires cash flow from automatic and manual fields, including working capital deltas and manual acquisitions, disposals, borrowings, repayments, dividends, and similar inputs.

The app has a simplified cash flow engine.

Missing:

- Full workbook-equivalent `TABLEAU DE FLUX DE TRESORERIE` line logic.
- Strong UI/database integration for cash flow manual inputs.
- Traceability for automatic working capital movement lines.
- Better handling when N-1 data is not imported.
- Clear unavailable/null state instead of defaulting some missing prior-year values to zero.

Impact:

- Cash flow can be generated, but it may silently produce incomplete or misleading values when the imported data lacks prior-year balances or manual movement inputs.

### 8. Notes Annexes Are Mostly Missing

This is one of the largest gaps.

`logicprompt.md` requires notes 1-36. The Excel workbooks include note sheets from `NOTE 1` through `NOTE 36 TABLEAU DE CODES`. Many note sheets have substantial formulas. The app currently calculates only the early notes partially and leaves many later notes as placeholders or manual content.

Missing:

- Calculated logic for most notes 9-36.
- Detailed schedules for fixed assets, depreciation, inventories, receivables, debts, revenue, expenses, taxes, commitments, and statutory disclosures.
- Note-to-statement reconciliation.
- Workbook-style note formulas and totals.
- Required/optional note behavior based on imported data presence.

Impact:

- The app does not yet satisfy the full notes annexes requirement from `logicprompt.md`.

### 9. Detail Des Charges Is Too Simple

The workbook `DETAIL DES CHARGES` contains about 2,140 formula cells.

The app groups class 6 expenses by broad categories and provides drilldown.

Missing:

- Excel-equivalent detail lines.
- Detailed account-level schedule formulas.
- Cross-linking between expense details, income statement, notes, and fiscal schedules.
- Full support for workbook-specific category totals.

Impact:

- The current expense detail view is useful, but it is not equivalent to the statutory/detail workbook logic.

### 10. Fiscal Logic Is Much Smaller Than Excel

The prompt requires fiscal result, add-backs, deductions, taxable income, tax rate, tax credits, installments, patente, and honoraires.

The workbook includes many fiscal sheets:

- `CALCULS FISCAUX`
- `BIC 1999 PAGE 1`
- `BIC 1999 PAGE 2`
- `BIC 1999 PAGE 3`
- `PATENTE`
- `HONORAIRES PAGE 1`
- `HONORAIRES PAGE 2`
- `Declaration DNI`
- `B V`

The app has only a simplified fiscal engine.

Missing:

- Full `CALCULS FISCAUX` line logic.
- BIC page calculations.
- DNI declaration calculations.
- Detailed add-back and deduction categories.
- Deficit/carry-forward handling where applicable.
- Patente calculation structure.
- Honoraires declaration structure.
- Fiscal form export.

Impact:

- Fiscal output is currently a summary calculation, not a replacement for the workbook's tax forms.

### 11. Conversion Difference Logic Is Missing

The workbook contains `VENTI DES ECARTS DE CONV`, and the prompt explicitly includes conversion difference assets and liabilities.

Missing:

- Conversion difference asset calculations.
- Conversion difference liability calculations.
- Account mapping and statement placement for conversion differences.
- Note and validation logic for conversion differences.

Impact:

- Entities with conversion difference accounts will not be handled correctly.

### 12. Validation Is Improved But Not Complete

The validation center now performs more real checks and the fix button can recalculate formulas.

Remaining gaps:

- Materiality is not fully based on fixed amount, total assets, turnover, and net result as required.
- Validation does not yet cover every statement, note, fiscal form, review, and export category at workbook depth.
- Validation cannot fix missing source data that was not imported, and it does not always distinguish clearly between missing optional data and missing required data.
- N-1 absence is warned, but not fully modeled as an intentional user decision across all dependent formulas.
- Fiscal validation is still minimal.

Impact:

- Validation is useful, but it is not yet a full statutory consistency engine.

### 13. Export Does Not Recreate the Excel Outputs

`logicprompt.md` requires export preparation with all selected report parts and final validation gates.

The app currently prepares export data, but it does not generate the real Excel/PDF statutory files equivalent to the workbook.

Missing:

- Real XLSX/PDF export matching the OHADA/DGI forms.
- Export templates for all statements, notes, and fiscal pages.
- Recalculation immediately before export.
- Export archive with exact files and selected report package.
- Strong locking/version behavior tied to exported reports.

Impact:

- Export selection works at the app level, but final statutory output is not yet equivalent to the Excel workbook.

### 14. Traceability Is Incomplete for Derived Totals

The prompt requires traceability for every value: source account, imported row, mapping rule, manual input, formula used, and override history.

The app includes traceability fields on many lines, but computed totals often do not preserve source accounts or detailed formula dependencies.

Missing:

- Source-account lists on all totals and derived lines.
- Formula dependency chains.
- Mapping rule references for grouped and formula lines.
- Manual input references for cash flow, notes, and fiscal forms.
- Override history displayed consistently in review/export.

Impact:

- The app can explain some values, but not every value as required by the prompt.

### 15. Versioning and Locking Are Not Yet Complete

Calculation runs are stored, and report versions exist in the data model.

Missing:

- Full report locking workflow.
- Export-linked immutable version snapshots.
- Clear review approval state before final export.
- Comparison between calculation runs and locked versions.

Impact:

- The app has the beginning of report versioning, but not the full workflow requested in the prompt.

## Overall Alignment Verdict

The app aligns with the architecture of `logicprompt.md`, but not with the full formula logic of the Excel workbooks.

The current implementation should be considered a functional foundation, not a complete Excel replacement. It can import data, classify accounts broadly, calculate major statements, validate, review, and prepare exports. But the Excel workbooks contain many thousands of formulas across hidden regrouping sheets, class sheets, notes, detailed charges, and fiscal forms that are not yet implemented.

## Recommended Implementation Order

1. Implement a real grouped balance layer equivalent to `BALANCE REGROUPE`.
2. Expand mapping rules to cover full OHADA statement lines, including ranges, exceptions, formulas, and conversion differences.
3. Add class sheet calculation modules for classes 1-8.
4. Expand Actif, Passif, Bilan, and Income Statement to full line-level OHADA structure.
5. Implement Notes 9-36 as calculated/manual hybrid schedules.
6. Expand `DETAIL DES CHARGES` to match workbook-level detail.
7. Implement full fiscal schedules: `CALCULS FISCAUX`, BIC pages, DNI, Patente, and Honoraires.
8. Complete materiality and validation rules across statements, notes, fiscal, review, and export.
9. Add real Excel/PDF export templates matching the statutory workbooks.
10. Complete traceability, report locking, and export archive behavior.
