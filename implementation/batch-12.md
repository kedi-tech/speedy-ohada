# Batch 12 - Cash Flow Statement Completion

Status: completed

## What Was Added

- Reworked `CashFlowEngine` so missing N-1 data no longer silently creates false working-capital movements from zero.
- Added explicit unavailable handling for cash-flow lines that require comparative N-1 data.
- Added persisted manual cash-flow inputs using the existing `FiscalManualInput` table with `inputType = cash_flow`.
- Added `GET /api/cash-flow-inputs` to load manual cash-flow fields.
- Added `POST /api/cash-flow-inputs` to save manual cash-flow fields and trigger recalculation.
- Loaded persisted cash-flow manual inputs during server calculation runs.
- Added traceability for automatic cash-flow source lines where the source comes from Actif, Passif, or Income Statement report lines.
- Updated validation so missing N-1 produces a clear cash-flow warning instead of trying to format a null reconciliation difference.

## Files Changed

- `lib/engine/CashFlowEngine.ts`
- `lib/engine/ValidationEngine.ts`
- `lib/server-notes-fiscal.ts`
- `lib/server-calculations.ts`
- `app/api/cash-flow-inputs/route.ts`
- `todo.md`

## Manual Input Fields

The cash-flow API supports these persisted manual fields:

- `acquisitions_of_fixed_assets`
- `disposals_of_fixed_assets`
- `acquisitions_of_financial_assets`
- `disposals_of_financial_assets`
- `new_borrowings`
- `loan_repayments`
- `dividends_paid`
- `grants_received`
- `capital_increases`
- `gains_on_disposal`
- `losses_on_disposal`
- `reversals`

## Missing N-1 Behavior

When N-1 is not imported:

- opening cash is `null`;
- working-capital movement lines are `null`;
- operating cash flow is `null`;
- net cash variation is `null`;
- total cash flows and reconciliation difference are `null`;
- affected report lines are marked with `formula_used = unavailable_missing_n1`;
- validation reports a cash-flow warning explaining that automatic movement lines require N-1.

Manual investing and financing lines still calculate from persisted manual inputs.

## Verification

- `npm.cmd run build` passed.

