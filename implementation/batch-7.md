# Batch 7 - Traceability Drill-Down and Validation Coverage

## Completed

- Added `/api/traceability` to expose saved calculation-run traceability by fiscal year or run id.
- Added a validation-screen traceability drill-down with:
  - report type and line code
  - source accounts and balances
  - formula used
  - N and N-1 values
  - manual override indicator and reason
  - calculation run id and timestamp
- Expanded validation coverage with new categories for:
  - materiality threshold
  - mapping coverage from accounts to financial-statement lines
  - Actif line coverage
  - Passif line coverage
  - Income statement line coverage
  - Cash-flow line coverage
  - review approval readiness
  - export readiness
- Updated the validation screen category tabs to surface mapping, materiality, review, and export checks separately.

## Verification

- Ran `npm.cmd run build`.

## Notes

- Traceability is already persisted inside `CalculationRun.traceability`; this batch exposes it through an API and adds the UI for inspection.
- Review/export validation can now be represented by the engine, while the persisted review/export workflow remains controlled by the Batch 6 APIs.
