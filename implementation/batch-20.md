# Batch 20 - Workbook-Parity QA and Regression Suite

Status: completed

## What changed

- Added fixture imports under `tests/fixtures/imports`:
  - `available-n.json`
  - `available-n-n1.json`
  - `missing-optional-fields.json`
  - `sparse-import.json`
- Added `scripts/workbook-parity-regression.mjs`.
- Added package scripts:
  - `npm run test:workbook-parity`
  - `npm run test:regression`

## Coverage added

- Fixture coverage for:
  - N-only data,
  - N and N-1 comparative data,
  - imports where optional opening/movement fields are missing,
  - sparse imports where debit/credit sides must be derived from `net_balance`.
- Workbook-parity source checks for:
  - grouped balance,
  - OHADA class summaries,
  - financial statements,
  - notes annexes,
  - detail des charges,
  - fiscal/DGI schedules,
  - validation gates,
  - XLSX/PDF/ZIP export rendering.
- UI workflow wiring checks for:
  - import normalization and grouped-balance rebuild,
  - validation formula fix rerun,
  - routing missing imported data to import,
  - review approval and lock flow,
  - export file download.
- Numeric regression checks for:
  - rounding tolerance,
  - materiality threshold selection.

## Verification

- Ran `npm.cmd run test:regression`.
- Ran `npm.cmd run build`.
- Both passed.

## Notes

- The regression suite is dependency-free and runs with plain Node so it works inside the current project setup.
- The checks intentionally protect the behavior requested by the user: calculations should work from the data that was actually imported, and optional missing fields should not break derivable formulas.
