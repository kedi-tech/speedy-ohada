# Missing Flows Audit

Date: 2026-05-18

This audit compares the current `D:\ohada\speedy-ohada` codebase with the financial source files provided in `D:\documents\financial_docs`.

## Sources Reviewed

- Project codebase: Next app routes, API routes, Prisma schema, engine modules, server workflow helpers, UI screens, implementation notes, and regression scripts.
- `Balances.xlsx`: two visible balance sheets, `N` and `N-1`, with real OHADA-style trial balance layouts and opening/movement/closing columns.
- `liste de comptes.xlsx`: one visible 1,499-row SYSCOHADA account-plan reference sheet.
- `Regroupement des Comptes Reforme.xlsx`: three visible mapping reference sheets for `ACTIF`, `PASSIF`, and `COMPTE DE RESULTAT`.
- `FICHIER TFT.xlsx`: one visible cash-flow reference sheet, 52 rows, with external links and many legacy defined names, including broken `#REF!` names.
- `Etats Financiers.xlsm`: 64 visible statutory workbook sheets, VBA present, external links present, 11,936 formula cells, and print areas for the statutory forms and notes.
- `Liasse des Etats Financiers.pdf`: 68-page statutory output package for Guinea, including cover pages, FIRD pages, bilan, income statement, cash flow, notes, code tables, and detail des charges.

## Current Implemented Flow

The project already has a meaningful end-to-end workflow:

1. Create companies and fiscal years.
2. Import N and N-1 trial balances through `/api/trial-balance/import`.
3. Normalize accounts, prefixes, classes, and grouped balances.
4. Persist trial balance lines, grouped balance rows, mapping rules, mapping decisions, calculation runs, notes, fiscal config, overrides, report versions, review approvals, and export records.
5. Run calculations through `/api/calculations/run`.
6. Display statements, validation, mapping, notes, fiscal, review, traceability, and export screens.
7. Gate export behind validation and review approval.
8. Generate PDF/XLSX/ZIP export buffers.

So the missing work is not the basic app skeleton. The missing work is mostly statutory fidelity, source-file parity, stronger auditability, and reference-data driven behavior.

## Missing Or Incomplete Flows

### 1. Original File And Import Audit Trail

- The import API accepts parsed `rawLines` JSON, but it does not persist the original uploaded workbook/PDF/CSV file.
- Raw worksheet rows and cell coordinates are not stored separately from normalized `TrialBalanceLine` records.
- Sheet name, detected header row, selected sheet/table, parser warnings, and rejected rows are not preserved as a full import audit artifact.
- `ImportBatch.columnMap` stores a map for the import, but there is no reusable import profile flow for files like `Balances.xlsx` with different `N` and `N-1` column offsets.
- There is no workbook health validation for external links, broken defined names, hidden sheets, or macro presence. This matters because `FICHIER TFT.xlsx` and `Etats Financiers.xlsm` contain external links, and `FICHIER TFT.xlsx` contains many `#REF!` defined names.

### 2. Reference Account Plan Flow

- `liste de comptes.xlsx` is not imported into a first-class account-plan reference table.
- The app detects classes and prefixes, but it does not validate every imported account against the official 1,499-row SYSCOHADA account list.
- There is no UI to browse, version, or update the chart of accounts reference.
- There is no validation distinction between an unknown account, a valid parent account, a deprecated account, and a newly revised SYSCOHADA account.

### 3. Regroupement Reference Mapping Flow

- `Regroupement des Comptes Reforme.xlsx` contains explicit statement mapping references for `ACTIF`, `PASSIF`, and `COMPTE DE RESULTAT`.
- The app has default mapping rules, but they are still maintained in code and are broader than the reference workbook rows.
- There is no import/crosswalk process that converts the regroupement workbook into auditable mapping seed data.
- Statement line codes like statutory `AD`, `AE`, `CA`, `TA`, `RA`, etc. are not fully enforced as the source mapping contract across UI, validation, and export.
- There is no mapping-version comparison between the workbook reference and the active database rules.

### 4. Grouped Balance Fidelity

- `GroupedBalanceEngine` creates total, class, prefix, and account rows. That is useful, but it is not a formula-equivalent clone of the hidden `BALANCE REGROUPE` workbook logic.
- Workbook-specific helper rows, intermediary formulas, and conversion-difference dependencies are not fully represented as grouped balance rules.
- Parent/child hierarchy is calculated in memory but not fully persisted; `GroupedBalanceRow` does not store `parentGroupCode`, `groupKind`, or `accountCount` explicitly.
- There is no screen that lets a reviewer reconcile grouped-balance rows against the original balance and the official regroupement reference side by side.

### 5. Statutory Metadata Flow

- The PDF liasse requires FIRD/cover metadata: ministry, tax center, deposit center, legal form code, fiscal regime code, activity codes, importer code, bank domiciliation, social security number, accountant/auditor details, signature/date, shareholders, board members, subsidiaries, and activity percentages.
- The current company/fiscal-year models cover part of this, but not the full 68-page liasse metadata set.
- There is no dedicated FIRD 1, FIRD 2, and FIRD 3 completion workflow matching pages 3-6 of the PDF.
- There is no validation that required code-table values match `NOTE 36 TABLEAU DE CODES` or `CODES ACTIVITES ECONOMIQUES`.

### 6. Statement Form Layout Flow

- The app calculates statement lines, but export rendering does not reproduce the statutory workbook/PDF layouts.
- `server-export-renderers.ts` builds simplified worksheet tables and a plain text PDF, not the exact `Etats Financiers.xlsm` print areas or the 68-page liasse form.
- Print areas, merged cells, page numbering, statutory labels, fixed blank rows, and "do not create/delete rubric" constraints from the PDF are not enforced.
- `BILAN paysage` exists as a workbook sheet/reference, but there is no exact landscape statutory view/export flow.
- There is no visual regression process comparing generated PDF pages against `Liasse des Etats Financiers.pdf`.

### 7. Cash Flow/TFT Flow

- `FICHIER TFT.xlsx` contains a reference TFT code structure such as `ZA`, `FA`, and formula descriptions.
- The current `CashFlowEngine` implements a generic indirect cash flow, but it does not fully mirror the reference TFT row codes, labels, and formula descriptions.
- Manual cash-flow inputs are stored through the generic `FiscalManualInput` model with `inputType = cash_flow`, not a dedicated cash-flow input model with source document, preparer, review status, and per-line evidence.
- There is no import or validation flow for the TFT reference workbook, including its external links and broken names.
- Missing N-1 data creates unavailable lines, but there is no explicit user confirmation workflow for filing an N-only cash-flow package.

### 8. Notes Annexes Fidelity

- The code has note definitions for notes 1-36, but they are generic note summaries rather than exact statutory note pages.
- The PDF and workbook include split pages and variants such as `NOTE 3 A`, `NOTE 3 B`, `NOTE 3 C`, `NOTE 3C Bis`, `NOTE 3 D`, `NOTE 3 E`, `NOTE 8 A/B/C`, `NOTE 15 A/B`, `NOTE 16 A/B/B bis/C`, `NOTE 27 A/B`, and `NOTE 28 A/B/C`.
- These note variants are not modeled as separate statutory schedules with exact columns, rows, and formulas.
- Note definitions are hardcoded in `NotesAnnexesEngine.ts`, not stored as versioned database definitions.
- There is no note applicability flow that matches the liasse requirement: non-chiffrees notes may be suppressed, but statement rows must not be removed.
- There is no dedicated workflow for attachments/evidence behind manual note fields.

### 9. Detail Des Charges Flow

- The app calculates expense details, but `Etats Financiers.xlsm` has a 2,140-formula `DETAIL DES CHARGES` sheet and the PDF has detail pages 65-68.
- The current export is a summarized table, not the exact statutory multi-page detail des charges schedule.
- There is no imported crosswalk from the workbook's account-level detail rows into database seed data.
- There is no validation that each class 6 statutory detail row reconciles to the income statement, note 34, and the PDF detail pages.

### 10. Fiscal/DGI Forms Flow

- `FiscalEngine` has a summary fiscal calculation, BIC page objects, DNI lines, `B V`, patente, and honoraires lines.
- The workbook/PDF require page-level statutory forms, including `CALCULS FISCAUX`, BIC pages 1-3, DNI pages, `B V`, `PATENTE`, `HONORAIRES PAGE 1`, `HONORAIRES PAGE 2`, `REPARTIT RESULT PERSONNES`, and `COMPLT ENTREPR INDIVID`.
- `REPARTIT RESULT PERSONNES` and `COMPLT ENTREPR INDIVID` do not have complete app workflows.
- Fiscal rates default to hardcoded values when config is missing (`25`, `18`, `0.5`), instead of requiring a validated country/regime/year setup before calculation.
- Fiscal manual inputs lack an approval workflow equivalent to manual overrides.

### 11. Export Artifact Storage And Retrieval

- `ExportRecord` stores metadata and a JSON artifact, but not the binary PDF/XLSX/ZIP that was generated.
- There is no download endpoint for an existing export record. The user can download only during the POST response.
- Export history in the UI lists prior exports but cannot retrieve the exact file later.
- There is no immutable storage path, checksum, file size, or binary retention policy for statutory filing evidence.
- "Send by email" is visible but disabled, so export distribution is not implemented.

### 12. Review, Permission, And Lock Governance

- Review, approval, lock, and override flows exist, but permissions are not granular enough for a statutory filing workflow.
- There is no clear role matrix for who can import, map, override, approve, lock, unlock, export, or delete/archive.
- Unlocking and fiscal-year locking exist, but there is no multi-step approval or dual-control flow for reopening a filed/locked report.
- Review comments are not tied to specific statement cells, note fields, validation messages, or export pages.

### 13. Traceability Depth

- Traceability is generated from calculated lines, but there is no first-class `TraceabilityRecord` table.
- Traceability is stored in `CalculationRun.traceability` JSON, making filtering, history comparison, and audit queries limited.
- Exported traceability is a simplified table, not a drill-down pack showing source row, grouped row, mapping rule, formula chain, manual input, override, approver, and calculation run for every statutory cell.
- Formula dependency chains are still shallower than the workbook formula graph.

### 14. Validation And Receivability Flow

- Validation categories exist, but they do not fully enforce the PDF's receivability instructions: no row/rubric deletion in statements, exact normalized forms, code-table usage, black-and-white filing form constraints, and explanations on separate sheets.
- There is no validation that every required liasse page is included or intentionally suppressed when allowed.
- There is no PDF/page-level validation for empty mandatory lines, missing signatures, missing codes, or FIRD inconsistencies.
- Materiality is covered by tests and engine concepts, but there is no first-class persisted materiality settings model or UI separate from fiscal config.

### 15. Workbook-Parity QA Flow

- `scripts/workbook-parity-regression.mjs` is mostly a structural/source-code smoke test. It does not run calculations against the actual provided workbooks and compare expected workbook outputs cell by cell.
- There are no golden-output fixtures derived from `Balances.xlsx`, `Regroupement des Comptes Reforme.xlsx`, `FICHIER TFT.xlsx`, or `Liasse des Etats Financiers.pdf`.
- There is no cell-level comparison against `Etats Financiers.xlsm` formulas for Actif, Passif, Bilan paysage, Compte de resultat, TFT, notes, fiscal forms, and detail des charges.
- There is no rendered PDF visual comparison against the 68-page liasse.

### 16. Active Company/Fiscal Year Selection Flow

- Several screens use `fiscalYears[0]` as the active fiscal year.
- There is no universal active-company/active-fiscal-year selector that every screen uses consistently.
- This can send mapping, notes, fiscal config, review, and export actions to the wrong fiscal year once a company has multiple years.

### 17. Localization And Encoding Cleanup

- Some source strings in the codebase contain mojibake such as `Societe`, `Reserves`, and similar encoding artifacts.
- Statutory exports need clean French labels. Encoding issues should be cleaned before final filing output.
- There is no validation that generated exports are accent-safe and match the French statutory wording from the workbook/PDF.

## Suggested Implementation Order

1. Add original-file/import-audit persistence: original file, sheet name, header row, raw rows, cell references, parser warnings, and reusable import profiles.
2. Import `liste de comptes.xlsx` and `Regroupement des Comptes Reforme.xlsx` as versioned reference data, then generate mapping rules from those references.
3. Expand grouped balance persistence to include exact workbook-style helper rows, parent groups, group kind, and account counts.
4. Build a full statutory metadata/FIRD workflow for pages 1-6 of the liasse.
5. Replace simplified export renderers with statutory templates matching `Etats Financiers.xlsm` and the 68-page PDF.
6. Split notes into exact statutory note schedules and variants, not only generic notes 1-36.
7. Make TFT, fiscal/DGI, patente, honoraires, `REPARTIT RESULT PERSONNES`, and `COMPLT ENTREPR INDIVID` page-level workflows.
8. Store generated export binaries with checksum and add a download endpoint for historical exports.
9. Add workbook/PDF parity tests using the actual supplied files as golden references.
10. Add a global active fiscal-year selector and granular permissions for import, review, lock, unlock, override, and export.

## Bottom Line

The current app has the broad accounting workflow in place, but it is still missing the strict statutory filing workflow needed to prove parity with the provided OHADA/Guinea files. The biggest remaining gap is not calculation existence; it is exact reference-data ingestion, exact statutory form output, original-source auditability, and cell/page-level parity testing.

---

## Gap Analysis Update — 2026-05-21

Second audit pass comparing `claudemaster.md` (Parts A–Q, 10 fundamental rules, C01-C13, W01-W09) and `datamodel.md` (all reference tables, note N/A conditions, currency conventions, 68-page structure) against the live codebase. Items 18–38 are net-new gaps not covered by items 1–17 above.

### 18. Currency Management Not Enforced (Rule 1)

- GNF must be pre-selected as default for every new filing; currency must propagate to every field header, column label, and export header.
- A currency-change warning dialog is required: "Changing currency will not convert existing amounts — only the display label changes."
- Per-currency thousands/decimal separator conventions must be applied everywhere: GNF uses space thousands separator and comma decimal; USD uses comma thousands and period decimal.
- No enforcement exists in any UI screen or in `server-export-renderers.ts`.

### 19. Number Display Rules Not Applied (Rule 3)

- Zero amounts must display as "−" (en dash), not "0".
- Negative amounts must display as `(1 234 567)` in parentheses, not with a minus sign.
- Thousands separators must follow the selected currency convention (space for GNF).
- These rules are defined in Rule 3 of `claudemaster.md` and apply to every statement table, notes grid, export XLSX cell, and PDF field — currently nothing enforces them.

### 20. Auto-Save on Navigation Not Implemented (Rule 6)

- Rule 6 requires that navigating between any two workflow steps auto-saves the entire session state.
- There is currently no auto-save hook, no session state object written on route change, and no "Saved" toast confirming persistence.

### 21. Progress Stepper / Filing Workflow UX Missing (Part C)

- The spec requires a landing page with three entry points: New Filing, Continue Existing Filing, Filing History.
- A persistent top progress stepper must span all steps: Identification → Trial Balance → Mapping → Statements → Notes → Controls → Export.
- Each filing must have a session UUID.
- Navigating to a resumed filing must restore the user to the last incomplete step automatically.
- None of these exist — the current UX is a flat navigation menu, not a guided stepper workflow.

### 22. Fiscal Year Selection as First Wizard Step (Part C.5)

- Exercise closing date must auto-derive from fiscal year selection (31/12/N for standard companies).
- Previous year (N-1) must auto-derive.
- Duration must auto-compute from start/end dates.
- Start date must be editable for first-year companies (duration < 12 months allowed).
- Currently fiscal year exists as a model but is not surfaced as a mandatory first step in a wizard with auto-derivation.

### 23. Full FIRD Workflow — All Field Groups Missing (Part D)

The FIRDMetadata Prisma model exists but the UI covers only a fraction of the statutory pages 1–6. The following field groups are absent:

- **ZA/ZB/ZC** — exercise open/close dates with auto-fill from fiscal year.
- **ZD** — Greffe, RCCM, répertoire fiscal fields.
- **ZE** — caisse sociale number, code importateur, code activité dropdown (from activity nomenclature reference, item 30 below).
- **ZF/ZG/ZH/ZI** — contact details, registered address, operational address, economic activity description.
- **Signatory section** — visa expert-comptable radio button, AG approval checkbox, signatory name/quality/date fields.
- **Bank domiciliation table** — up to 5 rows: bank name, branch, account number, IBAN.
- **ZK/ZL/ZM/ZN/ZU/ZP/ZQ/ZR/ZS** — all auxiliary identification fields.
- **Activity breakdown table** — activity code, label, revenue amount, auto-computed percentage of total.
- **Shareholders table** — name, nationality, capital amount contributed, auto-computed percentage.
- **Board of directors table** — name, quality, nationality.
- **Directors table** — name, NIF (tax ID), start date.
- **Subsidiaries/equity investments table** — company name, country, % held, book value.
- None of these sections have dedicated UI forms or FIRD completion validation.

### 24. FRNA Checklist (Note Applicability) Not Implemented (Part D.9)

- The spec requires a Fiche Récapitulative des Notes Annexes (FRNA) page immediately after FIRD (page 12 of the liasse).
- Each of the 36 notes plus the DGI detail states must have an A (Applicable) / N-A (Not Applicable) radio toggle.
- Auto-suggestion rules must fire: no Class 3 accounts → Note 6 suggested N/A; no accounts 26/27 → Note 4 suggested N/A; no HAO transactions → Note 13 N/A; etc. (full list in `datamodel.md` Data Section 11).
- Notes marked N/A must be hidden from the PDF body but their page slot preserved with an "N/A" stamp.
- No FRNA page, no auto-suggestion logic, and no N/A page-slot preservation exist.

### 25. Trial Balance Manual Entry and Clipboard Paste Missing (Part E)

- Part E specifies three input methods: file upload (implemented), manual line-by-line entry grid (missing), and copy-paste from clipboard into an editable grid (missing).
- There is no inline editable grid that allows accountants to type or paste trial balance data directly.

### 26. Trial Balance Validation Panel Incomplete (Part E.5–E.7)

- The spec defines exactly 6 trial balance checks with blocking vs. warning classification.
- The unknown-account resolution panel must offer exactly three options per unknown account: retype the correct account number / select from SYSCOHADA dropdown / mark as excluded.
- The trial balance summary dashboard must display exactly 10 cards: Total Actif Immobilisé, Actif Circulant, Trésorerie Actif, Capitaux Propres, Dettes Financières, Passif Circulant, Trésorerie Passif, Total Produits, Total Charges, Preliminary Net Result — with a green/red Actif = Passif balance indicator.
- The current validation UI lacks the 3-option resolution panel and the 10-card summary dashboard.

### 27. Mapping Review Screen Not Fully Implemented (Part F.3–F.4)

- The mapping screen must allow expand/collapse per REF code to see every contributing account.
- Drag-and-drop reassignment of an account from one REF code to another must be supported.
- Splitting a single account balance across two REF codes must be supported.
- Direct amount addition to a REF code (manual top-up) must be supported.
- The current mapping UI does not implement any of these four interactions.

### 28. Balance Sheet Landscape View Missing (Part G + Data Section 10 page 9)

- Page 9 of the 68-page liasse is a combined Actif + Passif landscape view on one page.
- No landscape combined view exists in either the UI statements screen or the export renderer.

### 29. Exact C01-C13 Control Identifiers and Click-to-Navigate (Part L + Data Section 12)

- `ValidationEngine` has checks but does not tag them with the exact C01-C13 identifiers.
- Exact French blocking messages from the spec are not used (e.g., "C01 — Le bilan n'est pas équilibré. Actif total ≠ Passif total.").
- Clicking a failed check must navigate directly to the source page or field — not implemented.
- Recomputation must fire in real-time on every data change — not implemented; currently triggered only on explicit "Run" action.

### 30. Exact W01-W09 Warning Identifiers Missing (Part L + Data Section 13)

- Same issue as item 29: current warning checks are not tagged W01-W09 with exact French messages.
- W01 (negative equity), W02 (zero turnover), W03 (result sign change vs N-1), W04 (abnormal account balances), W05 (missing N-1 data), W06 (significant HAO transactions), W07 (manual overrides present), W08 (Note 35 empty), W09 (manual TFT line) must each appear as distinct identifiers.

### 31. 68-Page In-Browser PDF Preview Not Implemented (Part M)

- The spec requires a pixel-perfect in-browser preview of the official 68-page PDF with live data overlaid at exact field positions.
- A sidebar must list all 68 pages with a status dot per page: green (complete), orange (warnings), red (blocking errors), grey (N/A).
- Inline editing directly in the preview must be supported: edited fields highlighted in yellow, cascading-recalculated fields highlighted in blue.
- None of this exists; the current review screen is a simplified data view, not a PDF-position-accurate preview.

### 32. Multi-Year Continuity Carry-Forward Not Implemented (Part O.2)

- When starting a new filing year, the app must detect a prior-year closed filing.
- It must offer "Import prior year closing balances as N-1 comparative data" with a preview diff.
- N-1 closing balance → N comparative column carry-forward must execute automatically.
- Note 31 historical shift must occur: N-4 data drops, N-3 becomes N-4, N-2 becomes N-3, N-1 becomes N-2.
- None of this carry-forward logic exists.

### 33. Reference Data Tables Not Seeded (Data Sections 6–9)

The following reference tables are defined in `datamodel.md` but not seeded in the database:

- **Legal form codes** (10 codes): SA, SARL, SCS, SNC, SP, GIE, Association, SAS, Autre, SA publique.
- **Fiscal regime codes** (4 codes): Réel Normal, Réel Simplifié, Synthétique, Forfait.
- **Country codes** (24 OHADA/world codes): GN, CI, SN, ML, BF, BJ, TG, NE, CM, GA, CG, CD, CF, TD, GQ, MG, KM, BI, RW, DJ, ST, MR, MU, autres.
- **Activity nomenclature codes** (100+ codes from Data Section 9): full sector/subsector classification used in FIRD ZE field.
- These are needed by FIRD dropdowns and by validation checks C10 (FIRD complet).

### 34. Note 34 Must Be Fully Automatic (Data Section 15)

- Note 34 (Analyse Financière) must be 100% automatic — zero manual input fields.
- The following must all auto-compute: VA, EBE, CAFG exploitation, CAFG global, autofinancement net, ressources stables, emplois stables, fonds de roulement net global, BFR exploitation, BFR HAO, BFR global, trésorerie nette, variation trésorerie nette, endettement financier brut, endettement financier net, rentabilité économique, rentabilité financière.
- Cross-check: trésorerie nette (from SIG) must equal BT − DT (from bilan); flag if mismatch.
- Currently `NotesAnnexesEngine` has partial SIG calculation but the full formula set and the cross-check are not implemented.

### 35. NotesAnnexesEngine Note Numbering Misaligned with Statutory Numbers

- The engine uses internal note numbers (Note 3, Note 6, Note 8, Note 15…) that do not match the statutory schedule identifiers (Note 3A, Note 3B, Note 3C, Note 3C-bis, Note 3D, Note 3E; Note 8A, Note 8B, Note 8C; Note 15A, Note 15B; Note 16A, Note 16B, Note 16B-bis, Note 16C; Note 27A, Note 27B; Note 28A, Note 28B, Note 28C).
- Every statutory note schedule must have its own identifier, column structure, and row definitions matching the liasse exactly.
- The current engine note-to-page mapping must be rebuilt to align engine output identifiers with statutory PDF page positions.

### 36. DGI Complementary States Exact 4-Page Layout Incomplete (Part K + Data Section 10)

- Pages 65–68 of the liasse must show every Class 6 sub-account (accounts 6011 through 6798) with exact DGI column structure: account number, account label, Année N, Année N-1, Variation absolute, Variation %.
- Accounts must be organized across exactly 4 pages as defined in Data Section 10 of `datamodel.md`.
- Each Income Statement line subtotal (RA, RB, RC, RD…) must appear as a bolded subtotal row between account groups.
- `ExpenseDetailsEngine` currently produces a summary aggregation, not the exact 4-page statutory form with per-account rows.

### 37. Export Button Lock Enforcement Incomplete (Rule 8)

- Export must be permanently locked until ALL 13 controls C01-C13 pass — it is unclear whether all 13 are currently enforced as hard blockers.
- When warnings exist but no blockers, the export button must show a warning count badge: "Exporter (3 avertissements)".
- Currently the export button gating logic does not display a warning badge.

### 38. Filing History Download Endpoint Missing (Part C.4)

- The filing history table must allow downloading the exact previously generated PDF/XLSX/ZIP file for any past export record.
- `ExportRecord` exists in the schema but the binary file is not stored (see item 11); therefore no download endpoint can serve historical files.
- The history table must also allow re-opening a past filing to amend it (amendment workflow from Part O).
- This is related to item 11 but specifically concerns the UX entry point and the re-open/amend flow.

## Updated Implementation Priority (Items 18–38)

Ordered from most foundational (unblocks everything else) to most UI-intensive:

1. **Item 33** — Seed reference data (legal codes, fiscal regime, countries, activity codes); unblocks FIRD dropdowns and C10 validation.
2. **Item 19** — Implement number display formatting utility (zero → "−", negatives in parentheses, GNF thousands separator); apply everywhere.
3. **Item 18** — Enforce currency management: GNF default, propagation, warning dialog, per-currency separator config.
4. **Item 24** — Build FRNA note applicability checklist with auto-suggestion rules; gate Note rendering on A/N-A status.
5. **Item 23** — Complete FIRD workflow: all field groups, tables, and signatory section.
6. **Item 34** — Complete Note 34 fully automatic SIG formulas and trésorerie cross-check.
7. **Item 35** — Realign NotesAnnexesEngine note identifiers to statutory schedule numbers.
8. **Item 29** — Tag ValidationEngine checks with exact C01-C13 identifiers and French messages; add click-to-navigate.
9. **Item 30** — Tag warning checks with exact W01-W09 identifiers and French messages.
10. **Item 37** — Enforce export lock on all 13 C-controls; add warning count badge to export button.
11. **Item 26** — Complete trial balance validation panel: 3-option resolution, 10-card summary dashboard.
12. **Item 27** — Add expand/collapse, drag-and-drop, split, and manual-add to mapping review screen.
13. **Item 36** — Rebuild DGI complementary states as exact 4-page per-account statutory form.
14. **Item 28** — Add landscape combined Actif + Passif view for page 9.
15. **Item 21** — Build progress stepper UX with session UUID and auto-resume.
16. **Item 22** — Add fiscal year wizard step with auto-derivation.
17. **Item 20** — Add auto-save on navigation.
18. **Item 25** — Add manual entry grid and clipboard paste for trial balance.
19. **Item 32** — Implement multi-year carry-forward and Note 31 historical shift.
20. **Item 38** — Add filing history download endpoint and re-open/amend flow.
21. **Item 31** — Build 68-page in-browser PDF preview with sidebar and inline editing (largest UI task).
