# Batch 1 - Saved Calculation Results as UI Source of Truth

Status: completed

## What changed

- Added `GET /api/calculations/latest` to return the latest persisted `CalculationRun`, optionally scoped by `fiscalYearId`.
- Extended `EngineContext` with saved-result loading state, `latestRunId`, `resultSource`, and `loadLatestCalculation`.
- Updated the Statements, Validation, Tax, and Charges screens to hydrate from the latest saved calculation run when browser memory has no result.
- Updated Validation Center reruns to call the persisted calculation API when an active fiscal year exists, then reload the saved run.

## Files changed

- `app/api/calculations/latest/route.ts`
- `context/EngineContext.tsx`
- `components/screens/StatementsScreen.tsx`
- `components/screens/ValidationCenter.tsx`
- `components/screens/TaxModule.tsx`
- `components/screens/ChargesDetail.tsx`

## Verification

- `npm.cmd run build` passed.

## Remaining follow-up

- Notes and Export still need to read saved calculation/report readiness data. They are covered by later batches because they also require replacing static placeholder workflows.
