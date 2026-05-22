# Batch 10 - Full Mapping and Formula Rule Engine

Status: completed

## What Was Added

- Added safe formula-expression evaluation to `MappingEngine`.
- Added sequential formula dependency support so formula lines can depend on earlier formula lines.
- Added support for formula styles such as:
  - `SUM(A,B,C)`
  - `SUBTRACT(A,B)`
  - `A+B-C`
  - `[A]+[B]-[C]`
- Added mapping coverage analysis for:
  - mapped accounts
  - unmapped accounts
  - conflicting accounts
  - coverage percentage
- Added conflict detection to the mapping API.
- Added conversion-difference default mapping rules:
  - `478` -> Actif conversion difference
  - `479` -> Passif conversion difference
- Added initial formula mapping rules for income-statement subtotals:
  - total operating income
  - total operating expenses
  - operating result formula
- Updated default mapping seeding so newly added default rules are inserted into existing databases instead of being skipped when older defaults already exist.

## Files Changed

- `lib/engine/MappingEngine.ts`
- `lib/engine/mappingRules.ts`
- `lib/server-mapping.ts`
- `app/api/mapping/route.ts`
- `todo.md`

## Formula Engine Behavior

Formula rules are normal mapping rules where:

- `display_sign` is `formula`, or
- `formula_expression` is present.

The formula evaluator does not use JavaScript `eval`. It tokenizes and evaluates a small supported expression language for report-line references and arithmetic.

Formula values are calculated for N and N-1 when the relevant N-1 source exists. Formula lines also inherit source-account traceability from the lines referenced by the formula.

## Mapping Coverage Behavior

The mapping API now calculates mapping coverage from active non-formula rules.

Accounts can be classified as:

- `auto`: exactly one rule matches.
- `unmapped`: no active rule matches.
- `conflict`: multiple active rules match.
- `manual`: user selected a mapping decision.
- `excluded`: user excluded the account.

The API response now includes a mapping coverage summary in `meta.mappingCoverage`.

## Conversion Differences

The workbook contains `VENTI DES ECARTS DE CONV`, and `review.md` identified conversion differences as missing.

This batch adds the first mapping layer:

- account prefix `478` for Actif conversion differences;
- account prefix `479` for Passif conversion differences.

The full conversion-difference calculation, statement placement, notes, validation, and export behavior remains scheduled for batch 16.

## Notes

This batch implements the mapping and formula-rule foundation. It does not transcribe every workbook statement, note, fiscal, or detail line into mapping rules yet. Those full line sets are intentionally handled by later batches:

- Batch 11 for Actif, Passif, Bilan, and Income Statement lines.
- Batch 13 for Notes 1-36.
- Batch 14 for Detail des Charges.
- Batch 15 for Fiscal, DGI, Patente, and Honoraires.
- Batch 16 for full conversion-difference behavior.

## Verification

- `npm.cmd run build` passed.

