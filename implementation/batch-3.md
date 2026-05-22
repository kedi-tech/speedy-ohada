# Batch 3 - Grouped Balance Pipeline

Status: completed

## What changed

- Added a persisted `GroupedBalanceRow` Prisma model for grouped balances per organization, company, fiscal year, balance type, and group code.
- Added a server grouped-balance helper that rebuilds prefix-level groups from imported normalized trial balance lines.
- Updated trial balance import to rebuild grouped balance rows immediately after each N or N-1 import.
- Updated the calculation runner to refresh grouped balances before each calculation and pass persisted grouped rows into the engine.
- Updated the mapping engine so mapping rules with `source_type: grouped_balance` can calculate from grouped rows instead of raw trial balance accounts.
- Added `GET /api/grouped-balance` to fetch persisted grouped balance rows for a fiscal year.
- Included grouped balances in `/api/calculations/latest` result payloads.

## Files changed

- `prisma/schema.prisma`
- `app/api/grouped-balance/route.ts`
- `app/api/trial-balance/import/route.ts`
- `app/api/calculations/latest/route.ts`
- `lib/server-grouped-balance.ts`
- `lib/server-calculations.ts`
- `lib/engine/MappingEngine.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ActifEngine.ts`
- `lib/engine/PassifEngine.ts`
- `lib/engine/IncomeStatementEngine.ts`
- `lib/generated/prisma/*`

## Verification

- `npx.cmd prisma generate` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma db push` synced the database schema.

## Remaining follow-up

- Group rules are currently generated automatically from account prefixes 1 through 6. A future admin workflow can add custom group formulas, exclusions, and manual group definitions.
- Existing mapping rules still default to `trial_balance`; they can now safely be moved to `grouped_balance` where needed.
