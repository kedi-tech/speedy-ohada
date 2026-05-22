# Batch 19 - Statutory Excel/PDF Export Templates

Status: completed

## What changed

- Added server-side statutory export rendering in `lib/server-export-renderers.ts`.
- XLSX exports now generate a real workbook with sheets for:
  - cover metadata,
  - Actif,
  - Passif,
  - Compte de resultat,
  - Flux de tresorerie,
  - Notes annexes,
  - Detail des charges,
  - Fiscal/DGI schedules,
  - Validation,
  - Traceabilite.
- PDF exports now generate a real PDF report package from the selected sections.
- ZIP exports now package the generated XLSX, generated PDF, and metadata JSON together.
- The export API now supports the selected document package instead of exporting a fixed JSON artifact only.
- The export API reruns calculations before export when the current report version is not locked.
- Approved/exported review status is preserved after pre-export recalculation only when export-significant totals and validation state are unchanged.
- Export remains blocked when:
  - no calculation run exists,
  - pre-export recalculation changes report totals or validation state,
  - pre-export recalculation creates a new unapproved review version,
  - the review version is not approved/exported/locked,
  - validation says the report cannot be exported.
- Export records now archive the selected documents, format, calculation run, review version status, and lock state in the stored artifact.
- The export center now downloads the generated file from the API response instead of only displaying a JSON success message.

## Files changed

- `app/api/export/route.ts`
- `components/screens/ExportCenter.tsx`
- `lib/server-export-renderers.ts`
- `todo.md`

## Verification

- Ran `npm.cmd run build`.
- Result: passed.

## Notes

- The XLSX workbook is structured from the application calculation output and follows the statutory package sections that were derived from the workbook/review work.
- The PDF output is intentionally compact and text-based so the app can generate it without introducing a new dependency.
