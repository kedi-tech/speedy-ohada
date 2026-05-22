# Batch 6 - Report Versions, Locks, Review, and Export

## Completed

- Added persisted `ReportVersion`, `ReviewApproval`, and `ExportRecord` models.
- Added `/api/report-versions` for review state, approvals, locking, and unlocking.
- Added `/api/export` for export readiness, export history, and generated export artifacts from saved calculation runs.
- Connected review approval state to export readiness. Exports are blocked until validation passes and the latest report version is approved, exported, or locked.
- Replaced the static export screen with live readiness, selectable documents, export history, and generated export calls.
- Connected the review screen to persisted approvals and report locking.
- Enforced locked fiscal years in trial-balance import, mapping changes, and calculation runs. Notes, fiscal edits, and manual overrides were already guarded by earlier batches.

## Verification

- Ran `npx.cmd prisma generate`.
- Ran `npm.cmd run build`.
- Ran `npx.cmd prisma db push`.

## Notes

- Export artifacts are persisted as structured JSON packages in `ExportRecord.artifact`. The UI now records generated packages and shows export history, but binary PDF/XLSX rendering remains a future enhancement.
- The review screen now uses fallback sections because `REVIEW_SECTIONS` is currently empty in `lib/data.ts`.
