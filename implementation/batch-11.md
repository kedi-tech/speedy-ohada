# Batch 11 - Full Financial Statement Line Logic

Status: completed

## What Was Added

- Added `StatementLineHelpers` for traceable computed statement lines.
- Added debit/credit-aware mapping so the same account family can map to Actif or Passif depending on its net balance.
- Expanded Actif mapping coverage with supplier advances, personnel/social receivables, tax/public receivables, shareholder receivables, mobile money, and conversion difference assets.
- Expanded Passif mapping coverage with customer advances, shareholder payables, mobile money liabilities, and conversion difference liabilities.
- Narrowed broad receivable/payable rules so detailed lines do not conflict with generic other receivables or other debts.
- Added traceable computed totals for Actif, Passif, and Income Statement totals/subtotals.
- Added source-account inheritance for computed totals.
- Added Passif net-result fallback from the Income Statement when account 13 is absent or not imported.
- Reordered the calculation flow so the Income Statement can supply net result to Passif.

## Files Changed

- `lib/engine/StatementLineHelpers.ts`
- `lib/engine/MappingEngine.ts`
- `lib/engine/mappingRules.ts`
- `lib/engine/ActifEngine.ts`
- `lib/engine/PassifEngine.ts`
- `lib/engine/IncomeStatementEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `todo.md`

## Notes

This batch closes the core statement-engine gaps from `review.md`: better line coverage, conversion differences, result reconciliation, and traceable totals. Exact statutory Excel/PDF rendering remains scheduled for batch 19.

## Verification

- `npm.cmd run build` passed.

