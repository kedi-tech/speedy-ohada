# Batch 17 - Validation, Materiality, and Fix Actions

Status: completed

## Scope

Expanded the validation layer into a fuller statutory consistency engine and made the validation center fix button useful for formula-derived problems. The app now calculates materiality from fixed threshold, total assets, turnover, and net result, and the validation UI can rerun all automatically derivable calculations while routing manual/import/mapping issues to the correct workflow.

## Changes

- Expanded materiality calculation to evaluate:
  - fixed threshold,
  - total assets percentage,
  - turnover percentage,
  - net result percentage.
- Updated mapping and mapping-coverage validation to use the richer materiality basis.
- Added validation metadata fields for fix behavior:
  - `fix_type`,
  - `fix_target`.
- Expanded validation center category mapping to include:
  - expense details,
  - conversion differences,
  - fiscal reconciliation,
  - export readiness.
- Expanded the fix-button classifier so recalculable issues can rerun formulas for:
  - Bilan,
  - Result,
  - Cash Flow,
  - Detail des Charges,
  - Conversion Differences,
  - Fiscal reconciliation,
  - Export readiness.
- Added manual-fix messaging so missing imported data, mapping gaps, note/manual fields, review gates, and export gates are explained before routing.
- Preserved the existing behavior that skipped N-1, missing N-1, missing required notes, and unavailable optional fields are treated differently instead of all becoming generic failures.
- Added a lightweight validation regression script.
- Added `npm.cmd run test:validation`.

## Files Changed

- `lib/engine/ValidationEngine.ts`
- `lib/engine/types.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `components/screens/ValidationCenter.tsx`
- `scripts/validation-regression.mjs`
- `package.json`
- `todo.md`

## Verification

- `npm.cmd run test:validation` passed.
- `npm.cmd run build` passed.

## Notes

The fix button now recalculates what the app can derive from imported balances and persisted manual inputs. It does not invent missing source data; when a correction requires import, mapping, note details, tax inputs, review approval, or export action, the UI routes to that workflow.
