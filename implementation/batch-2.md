# Batch 2 - Persisted Mapping Workflow

Status: completed

## What changed

- Added first-class Prisma models for `MappingRule` and `AccountMappingDecision`.
- Added `GET /api/mapping` to seed default SYSCOHADA mapping rules, load imported trial balance lines, and merge saved account decisions.
- Added `POST /api/mapping` to save manual mapping/exclusion decisions with audit logs.
- Reworked the mapping screen to use real imported `TrialBalanceLine` data instead of `lib/data.ts` placeholders.
- Added a server calculation helper so both `/api/calculations/run` and mapping changes use the same persisted calculation path.
- Updated the calculation pipeline so persisted account decisions alter the effective mapping rules before a new `CalculationRun` is saved.

## Files changed

- `prisma/schema.prisma`
- `app/api/mapping/route.ts`
- `app/api/calculations/run/route.ts`
- `components/screens/AccountMapping.tsx`
- `lib/server-mapping.ts`
- `lib/server-calculations.ts`
- `lib/engine/FinancialStatementEngine.ts`
- `lib/engine/ActifEngine.ts`
- `lib/engine/PassifEngine.ts`
- `lib/engine/IncomeStatementEngine.ts`
- `lib/generated/prisma/*`

## Verification

- `npx.cmd prisma generate` passed.
- `npx.cmd prisma db push` synced the database schema.
- `npm.cmd run build` passed.

## Remaining follow-up

- Mapping rules are now persisted as global default rules plus per-account decisions. A later refinement can add an admin UI for editing the rule definitions themselves.
- Grouped-balance source rules are still not active in the calculation pipeline; that belongs to Batch 3.
