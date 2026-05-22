# Batch 18 - Traceability, Review Approval, Versioning, and Locking

Status: completed

## Scope

Completed the review and traceability layer needed to inspect calculated values, compare calculation runs, approve sections, track report versions, and lock final versions. The work builds on the existing persisted calculation-run JSON and report-version tables without requiring a database migration.

## Changes

- Enriched traceability records with:
  - formula dependency chains,
  - mapping rule ids,
  - source row placeholders,
  - source account mapping rule metadata.
- Preserved source account lists for totals, subtotals, formula lines, conversion schedules, expense schedules, and statement lines through the existing traceability generation path.
- Expanded `/api/report-versions` to return:
  - recent calculation run history,
  - latest-run comparison deltas,
  - serialized validation summaries,
  - change summaries,
  - export records attached to each report version.
- Added locked fiscal-year protection to review mutations so approved/locked dossiers cannot be changed unless explicitly unlocked.
- Expanded the review page with:
  - calculation history,
  - latest-run comparison cards,
  - report version and export history,
  - traceability drilldown showing formula, dependencies, mapping rules, and source accounts.
- Kept review approval gates tied to required sections and pending manual overrides before locking.
- Preserved immutable lock behavior by tying locked report versions to the calculation run and export records already stored by the workflow.

## Files Changed

- `lib/engine/TraceabilityEngine.ts`
- `lib/engine/types.ts`
- `lib/server-report-workflow.ts`
- `app/api/report-versions/route.ts`
- `components/screens/ReviewWorkflow.tsx`
- `todo.md`

## Verification

- `npm.cmd run build` passed.

## Notes

Imported source row numbers are represented as nullable placeholders in traceability because the current `SourceAccountRef` does not yet carry source-row metadata from persisted trial-balance lines. The drilldown still preserves the account, mapping rule, balance type, formula, calculation run, and override context needed for review.
