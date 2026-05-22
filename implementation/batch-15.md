# Batch 15 - Fiscal, DGI, Patente, and Honoraires

Status: completed

## Scope

Implemented the first full fiscal-calculation layer needed from the workbook review. The app now derives fiscal result schedules from imported accounts where possible, keeps manual fiscal inputs in the existing persisted manual-input model, and exposes the generated BIC, DNI, B V, Patente, and Honoraires schedules in the tax module.

## Changes

- Expanded `FiscalResult` with fiscal lines, BIC schedules, DNI declaration lines, B V schedule, taxable profit, generated deficit, carried-forward deficit, class 69 reconciliation, patente totals, and honoraires totals.
- Reworked `FiscalEngine` to calculate:
  - accounting result from the income statement,
  - automatic add-backs for class 69 income tax and common non-deductible/review expense prefixes,
  - automatic deductions for previous deficits and identifiable exempt/non-taxable income prefixes,
  - taxable result, taxable profit, deficit generated, carried-forward deficit, calculated corporate tax, installments/credits, and net tax payable,
  - BIC pages 1, 2, and 3,
  - DNI declaration lines,
  - B V fiscal-result schedule,
  - Patente base/amount from turnover and configured patente rate,
  - Honoraires source lines from fee/intermediary account prefixes plus manual declaration lines.
- Added `patente_rate` to tax configuration flow so the persisted fiscal config can feed the engine.
- Added `previous_deficit` support in persisted fiscal manual inputs.
- Passed the income statement into fiscal calculation so fiscal schedules can use turnover and reconcile against income statement values.
- Expanded fiscal validation with taxable-result availability, class 69 tax reconciliation, and generated-deficit information.
- Updated the tax module so BIC, DNI, and B V schedules are visible and navigable instead of relying on an empty static form list.

## Files Changed

- `lib/engine/FiscalEngine.ts`
- `lib/engine/types.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ValidationEngine.ts`
- `lib/server-notes-fiscal.ts`
- `lib/server-calculations.ts`
- `components/screens/TaxModule.tsx`
- `todo.md`

## Verification

- `npm.cmd run build` passed.

## Notes

The formulas intentionally use only imported account families and persisted manual fields that exist in the app today. When declaration-level details are not available from the imported balance, the schedules expose a manual line path instead of inventing beneficiary-level or tax-credit details.
