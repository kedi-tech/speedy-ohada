# Batch 13 - Notes Annexes 1-36

Status: completed

## What Was Added

- Replaced the previous notes 9-36 placeholders with a full note registry for notes 1-36.
- Added calculated/manual hybrid fields for every note.
- Added source account detection by OHADA account prefixes.
- Added source report line links for notes tied to Actif, Passif, Income Statement, Cash Flow, fiscal/tax, and detail schedules.
- Added required/optional behavior based on the imported data and calculated report values.
- Added validation status per note based on required manual fields.
- Added recalculation after note manual fields are saved.

## Files Changed

- `lib/engine/NotesAnnexesEngine.ts`
- `app/api/notes/route.ts`
- `todo.md`

## Coverage

The notes package now covers:

- general information and accounting policies;
- intangible, tangible, and financial assets;
- inventory;
- receivables;
- treasury assets and liabilities;
- equity;
- financial debts;
- suppliers and other payables;
- turnover and operating income;
- purchases, services, taxes, personnel, depreciation, financial result, HAO, and income tax;
- cash-flow supporting information;
- off-balance sheet commitments;
- related parties;
- conversion differences;
- grants;
- provisions and risks;
- honoraires;
- patente and licenses;
- leases;
- subsequent events;
- going concern;
- accounting method changes;
- expense-detail reconciliation;
- tax disclosures;
- activity code and other information.

## Required Behavior

Notes are required only when they are always statutory/core disclosures or when the imported/calculated data indicates that the note applies.

Examples:

- asset notes become required when corresponding asset balances exist;
- receivable/debt notes become required when related account families or statement lines are present;
- conversion-difference note becomes required only when 478/479 or conversion-difference lines exist;
- off-balance sheet commitments become required when class 9 accounts are imported;
- policy, going-concern, tax, and metadata notes remain required.

## Verification

- `npm.cmd run build` passed.

