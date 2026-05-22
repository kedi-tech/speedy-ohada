# Batch 5 - Notes and Fiscal Persistence

Status: completed

## What changed

- Added persisted `NoteValue`, `FiscalConfig`, and `FiscalManualInput` Prisma models.
- Added `/api/notes` to load saved calculation notes and persist manual note fields by fiscal year/note/field.
- Replaced static notes list and note editor data with saved calculation notes plus persisted manual values.
- Added `/api/fiscal-config` to load/save tax configuration by company, country, regime, and fiscal year.
- Updated recalculation to load note manual fields, fiscal manual inputs, and persisted tax configuration before calculating and saving a new `CalculationRun`.
- Updated the tax screen so IS, VAT, and patente rates are configurable/persisted and no longer only hardcoded UI constants.
- Patente and honoraires tables now prefer persisted fiscal result lines when present.

## Files changed

- `prisma/schema.prisma`
- `app/api/notes/route.ts`
- `app/api/fiscal-config/route.ts`
- `components/screens/NotesAnnexes.tsx`
- `components/screens/NoteEditor.tsx`
- `components/screens/TaxModule.tsx`
- `lib/server-notes-fiscal.ts`
- `lib/server-calculations.ts`
- `lib/generated/prisma/*`

## Verification

- `npx.cmd prisma generate` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma db push` synced the database schema.

## Remaining follow-up

- Fiscal manual input editing has backend support, but the current UI only exposes the core tax/VAT/patente config. A fuller fiscal editor can add rows for add-backs, deductions, installments, credits, honoraires, and patente details.
- Saved note values are used on the next recalculation; the editor does not yet trigger recalculation automatically after every note save.
