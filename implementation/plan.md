# Review-Driven Implementation Plan

Date: 2026-05-13

This plan converts `review.md`, `logicprompt.md`, and the inspected Excel workbook structure into the next implementation roadmap. It starts after the completed foundation batches 1-7.

## Source of Truth

The project should now treat these sources as the implementation references:

- `logicprompt.md` for product and accounting behavior.
- `review.md` for current gaps.
- `D:\documents\Etats Financiers\SPEEDY OHADA 2.1.xlsm` for the operational calculation model.
- `D:\documents\Etats Financiers\Etats Financiers.xlsm` for the statutory form and notes model.

The larger workbook contains the critical missing operational logic: `BALANCE N`, `BALANCE N-1`, `BALANCE REGROUPE`, classes 1-8, conversion difference schedules, fiscal schedules, DGI declarations, Patente, Honoraires, and detailed charge formulas.

## Guiding Rules

- Imported data controls what can be calculated. Missing optional fields must not block unrelated calculations.
- Formulas should calculate every value that can be derived from imported balances, grouped balances, mapping rules, manual inputs, or approved overrides.
- Manual input should be required only when the Excel workbook depends on information that is not present in the imported balance.
- Every calculated value needs traceability: source rows, grouped rows, mapping rules, formulas, manual inputs, overrides, calculation run, and version.
- Export must rerun calculations and validations immediately before producing files.
- Locked report versions must be immutable.

## Batch Order

### Batch 8 - Excel Formula Catalog and Crosswalk

Purpose: create the technical map needed to avoid missing workbook logic.

Deliverables:

- Formula catalog for both `.xlsm` workbooks.
- Sheet inventory with hidden/visible status.
- Formula dependency map by sheet and report area.
- Crosswalk from workbook sheets to app modules.
- Classification of formulas as calculation, validation, display, print, or external reference.

Acceptance:

- Every relevant workbook sheet is either mapped to an app module or explicitly marked out of scope with a reason.
- The catalog identifies the formulas needed for future batches.

### Batch 9 - Excel-Equivalent Grouped Balance and Class Modules

Purpose: replace broad grouping with workbook-style `BALANCE REGROUPE` and class calculations.

Deliverables:

- Grouped N and N-1 rows equivalent to the hidden workbook regrouping layer.
- Class modules for classes 1-8.
- Reconciliation from imported balance to grouped balance.
- Drilldown from group to source imported rows.

Acceptance:

- Report engines consume grouped/classified balances.
- Raw balance totals and grouped balance totals reconcile.

### Batch 10 - Full Mapping and Formula Rule Engine

Purpose: make mapping expressive enough for the workbook.

Deliverables:

- Prefix, range, exact include, exclude, source type, sign, formula, and dependency support.
- Rule priority and conflict resolution.
- Complete OHADA mapping seed data.
- Coverage for conversion differences, notes, fiscal schedules, DGI pages, and detail charges.

Acceptance:

- Unmapped and multiply mapped accounts are detectable.
- Formula lines can depend on mapped groups and other formula lines.

### Batch 11 - Full Financial Statement Line Logic

Purpose: bring Actif, Passif, Bilan, and Income Statement up to workbook line depth.

Deliverables:

- Full Actif lines with gross, depreciation, net, opening, movement, and closing logic.
- Full Passif lines with equity, debts, result allocation, liabilities, and treasury logic.
- Generated `BILAN paysage` view.
- Full `COMPTE DE RESULTAT` line structure.
- Net result reconciliation across Result and Passif.

Acceptance:

- Statement totals reconcile.
- Every subtotal has formula and source traceability.

### Batch 12 - Cash Flow Statement Completion

Purpose: finish `TABLEAU DE FLUX DE TRESORERIE`.

Deliverables:

- Full workbook-equivalent cash flow line structure.
- Persisted manual inputs for movement-only items.
- Working capital delta calculations from N/N-1 grouped balances.
- Unavailable state for missing N-1 where zero would be misleading.

Acceptance:

- Cash flow identifies which values are automatic, manual, overridden, or unavailable.
- Missing N-1 does not silently create false movements.

### Batch 13 - Notes Annexes 1-36

Purpose: implement the full notes package.

Deliverables:

- Calculated/manual hybrid logic for notes 1-36.
- Movement schedules for fixed assets and depreciation.
- Inventory, receivable, debt, revenue, expense, tax, commitment, and disclosure schedules.
- Note-to-statement reconciliation.

Acceptance:

- Every note from the workbook has an app representation.
- Required notes are validated; optional notes depend on imported data presence.

### Batch 14 - Detail Des Charges Completion

Purpose: match the workbook's detailed expense schedules.

Deliverables:

- Detailed class 6 expense schedule.
- Account-level drilldowns.
- Links to income statement, notes, and fiscal add-backs/deductions.
- Validation against class 6 and income statement totals.

Acceptance:

- `DETAIL DES CHARGES` is no longer only broad expense grouping.

### Batch 15 - Fiscal, DGI, Patente, and Honoraires

Purpose: replace summary tax logic with workbook-level fiscal forms.

Deliverables:

- `CALCULS FISCAUX`.
- BIC pages 1-3.
- DNI declaration calculations.
- `B V` logic.
- Patente logic.
- Honoraires pages 1-2.
- Detailed add-backs, deductions, deficits, tax credits, installments, and fiscal result reconciliation.

Acceptance:

- Fiscal output is form-level, not only a summary taxable income calculation.

### Batch 16 - Conversion Differences

Purpose: implement `VENTI DES ECARTS DE CONV` and its statement effects.

Deliverables:

- Conversion difference asset and liability mapping.
- Statement lines.
- Notes and validation.
- Traceability to source accounts.

Acceptance:

- Conversion difference accounts are correctly classified, calculated, validated, and exported.

### Batch 17 - Validation, Materiality, and Fix Actions

Purpose: make validation a full statutory consistency engine.

Deliverables:

- Materiality using fixed amount, assets, turnover, and net result.
- Validation categories for company, balances, mapping, statements, cash flow, notes, fiscal, review, and export.
- Fix actions for all automatically derivable values.
- Clear status for missing required data, optional data, skipped N-1, and unavailable fields.

Acceptance:

- The validation center can recalculate formula-derived issues and explains what needs manual data.

### Batch 18 - Traceability, Review Approval, Versioning, and Locking

Purpose: complete the audit and approval workflow.

Deliverables:

- Full dependency chains.
- Source rows and grouped rows on totals and subtotals.
- Review approval gates.
- Immutable locked report versions.
- Comparison between calculation runs, reviewed versions, and exported versions.

Acceptance:

- A reviewer can explain every value in the report and lock a final version.

### Batch 19 - Statutory Excel/PDF Export Templates

Purpose: produce real statutory output, not only JSON artifacts.

Deliverables:

- XLSX exports matching statements, notes, detail schedules, fiscal forms, DGI declarations, Patente, and Honoraires.
- PDF exports for selected packages.
- Export archive linked to calculation run, review version, selected package, and locked state.
- Pre-export recalculation and validation gates.

Acceptance:

- Exported files match the selected report package and are tied to an immutable calculation/version record.

### Batch 20 - Workbook-Parity QA and Regression Suite

Purpose: prevent future regressions and prove workbook alignment.

Deliverables:

- Fixtures for full N/N-1 data, N-only data, sparse imports, and missing optional fields.
- Unit tests for engines and mapping.
- Integration tests for calculation runs.
- End-to-end UI tests for import, validation fix, review, and export.
- Rounding and materiality tolerance tests.

Acceptance:

- The app can be safely changed without breaking workbook-equivalent behavior.

## Coverage Checklist

- [ ] `BALANCE N`
- [ ] `BALANCE N-1`
- [ ] `BALANCE REGROUPE`
- [ ] `CLASSE 1`
- [ ] `CLASSE 2`
- [ ] `CLASSE 3`
- [ ] `CLASSE 4`
- [ ] `CLASSE 5`
- [ ] `CLASSE 6`
- [ ] `CLASSE 7`
- [ ] `CLASSE 8`
- [ ] `ACTIF`
- [ ] `PASSIF`
- [ ] `BILAN paysage`
- [ ] `COMPTE DE RESULTAT`
- [ ] `TABLEAU DE FLUX DE TRESORERIE`
- [ ] `NOTES ANNEXES`
- [ ] `NOTE 1` through `NOTE 36 TABLEAU DE CODES`
- [ ] `DETAIL DES CHARGES`
- [ ] `VENTI DES ECARTS DE CONV`
- [ ] `CALCULS FISCAUX`
- [ ] `BIC 1999 PAGE 1`
- [ ] `BIC 1999 PAGE 2`
- [ ] `BIC 1999 PAGE 3`
- [ ] `PATENTE`
- [ ] `HONORAIRES PAGE 1`
- [ ] `HONORAIRES PAGE 2`
- [ ] `Declaration DNI`
- [ ] `B V`
- [ ] Review approval
- [ ] Validation fix actions
- [ ] Traceability
- [ ] Report locking
- [ ] Statutory XLSX export
- [ ] Statutory PDF export
- [ ] Workbook-parity tests
