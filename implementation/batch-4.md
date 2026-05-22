# Batch 4 - Manual Overrides and Approvals

Status: completed

## What changed

- Added a persisted `ManualOverride` Prisma model with original value, new value, difference, reason, status, creator, approver, and review metadata.
- Added `GET`, `POST`, and `PATCH` support under `/api/manual-overrides`.
- Manual override creation now requires a reason and is blocked when the fiscal year is locked.
- Approval and rejection actions write audit logs and are blocked when the fiscal year is locked.
- Approved and auto-approved overrides are loaded during recalculation and applied by the mapping engine.
- Pending overrides are no longer applied to report values.
- Added a statements-screen override request dialog for report lines.
- Added a review-screen approval panel for pending manual overrides.

## Files changed

- `prisma/schema.prisma`
- `app/api/manual-overrides/route.ts`
- `components/screens/StatementsScreen.tsx`
- `components/screens/ReviewWorkflow.tsx`
- `lib/server-manual-overrides.ts`
- `lib/server-calculations.ts`
- `lib/engine/ManualOverrideEngine.ts`
- `lib/engine/MappingEngine.ts`
- `lib/generated/prisma/*`

## Verification

- `npx.cmd prisma generate` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma db push` synced the database schema.

## Remaining follow-up

- This batch blocks overrides on locked fiscal years. Broader lock enforcement across imports, mappings, notes, fiscal edits, and export belongs to Batch 6.
- The override UI is intentionally compact; later traceability work can expose override history directly on each report value.
