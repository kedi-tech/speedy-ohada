# Batch 16 - Conversion Differences

Status: completed

## Scope

Implemented the workbook-equivalent foundation for `VENTI DES ECARTS DE CONV`. The app now isolates imported 478/479 accounts, produces a dedicated conversion-difference schedule, reconciles it to Actif and Passif conversion lines, feeds note coverage, and preserves source-account traceability.

## Changes

- Added `ConversionDifferencesEngine` to calculate:
  - account-level conversion-difference entries,
  - asset conversion differences from 478 accounts,
  - liability conversion differences from 479 accounts,
  - N and N-1 totals when comparative data exists,
  - net conversion-difference position,
  - traceable report lines for each imported 478/479 account and schedule totals.
- Kept 478/479 excluded from generic receivable/payable mappings and mapped to:
  - `ECART_CONV_ACTIF` in Actif,
  - `ECART_CONV_PASSIF` in Passif.
- Wired conversion differences into the full calculation result and included the schedule lines in traceability generation.
- Persisted the conversion-difference report inside the calculation snapshot JSON so saved calculation runs can expose it without a database schema change.
- Exposed `conversionDifferences` from `/api/calculations/latest`.
- Added validation coverage that:
  - reconciles conversion schedule totals to Actif and Passif lines,
  - reports when no 478/479 accounts are present,
  - confirms account-level schedule detail when present,
  - checks that note 12 is available when conversion differences exist.
- Exported the new engine from the engine barrel.

## Files Changed

- `lib/engine/ConversionDifferencesEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ValidationEngine.ts`
- `lib/engine/types.ts`
- `lib/engine/index.ts`
- `app/api/calculations/latest/route.ts`
- `todo.md`

## Verification

- `npm.cmd run build` passed.

## Notes

The conversion schedule follows the imported-data rule: if no 478/479 accounts exist in the imported balance, the schedule remains empty and validation records that the conversion-difference section is not applicable.
