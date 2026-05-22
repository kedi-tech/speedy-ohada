# Batch 9 - Excel-Equivalent Grouped Balance and Class Modules

Status: completed

## What Was Added

- Replaced the prefix-only grouped balance rebuild path with a workbook-style grouped balance structure.
- Added account detail grouped rows for each imported trial balance account.
- Added class total rows for OHADA classes 1-8.
- Kept prefix rollups from level 1 through level 6.
- Added a total grouped balance row per balance type.
- Added class summary helpers in `OHADAClassEngine`.
- Added grouped-balance reconciliation output from the grouped balance API.
- Tightened grouped-balance mapping so prefix rules do not double-count P2, P3, P4, P5, P6, and detail rows at the same time.

## Files Changed

- `lib/engine/types.ts`
- `lib/engine/OHADAClassEngine.ts`
- `lib/engine/GroupedBalanceEngine.ts`
- `lib/engine/MappingEngine.ts`
- `lib/server-grouped-balance.ts`
- `app/api/grouped-balance/route.ts`

## Grouped Row Structure

The rebuilt grouped balance now produces these row kinds:

- `total`: one `TB_TOTAL` row per balance type.
- `class`: one class row per detected OHADA account class, such as `C1`, `C2`, `C3`.
- `prefix`: prefix rollups `P1_`, `P2_`, `P3_`, `P4_`, `P5_`, and `P6_`.
- `account`: account detail rows using `A_<account_number>`.

This gives later batches a closer equivalent to the workbook's hidden `BALANCE REGROUPE` layer than the previous prefix-only grouping.

## Reconciliation

`GET /api/grouped-balance` now returns:

- grouped rows
- reconciliation summaries per balance type

The reconciliation compares the `TB_TOTAL` row to the sum of account detail rows and reports debit, credit, and net-balance differences.

## Mapping Safety

Because grouped balances now include class, prefix, total, and account rows, mapping from grouped balances needed to avoid duplicate counting.

The mapping engine now:

- uses only the matching prefix level for simple prefix rules;
- uses account detail rows when a rule has exact includes, excludes, or account ranges;
- keeps N-1 unavailable when grouped N-1 data is not present.

## Notes

This batch implements the structural grouped-balance and class layer required by later workbook-parity work. It does not yet transcribe every Excel formula in `BALANCE REGROUPE`; that work continues in batch 10 and batch 11 when the full mapping/formula engine and statement line logic are expanded.

## Verification

- `npm.cmd run build` passed.

