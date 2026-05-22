# SYSCOHADA FINANCIAL STATEMENTS WEB APPLICATION
## COMPLETE MASTER PROMPT — FULL SPECIFICATION

---

# PART A — OVERVIEW & PURPOSE

This is a web application that allows Guinean large enterprises (Grandes Entreprises) to produce their complete SYSCOHADA normalized financial statements (liasse fiscale) for submission to the DGI (Direction Nationale des Impôts) of the Republic of Guinea. The app takes a trial balance as input, automatically generates all financial statements, notes, and controls required by the official DGI template, and outputs a pixel-perfect filled version of the official `Liasse_des_Etats_Financiers.pdf` (68 pages) ready for printing and DGI submission.

---

# PART B — FUNDAMENTAL RULES (apply to every section without exception)

**RULE 1 — CURRENCY**: Currency is set ONCE in the company identification (FIRD). Default is GNF (Franc Guinéen). Once set, it propagates automatically to every amount field, every column header, every note table, every export label, and every printed page across the entire application. The user NEVER re-enters the currency anywhere else. If the user changes the currency after data entry, show a warning: "Changing currency will not convert existing amounts. All values will be treated as being in the new currency. Confirm?" — requires explicit user confirmation before proceeding.

**RULE 2 — PDF TEMPLATE**: The `Liasse_des_Etats_Financiers.pdf` is the single source of truth for layout and output. The app fills this exact template. Every page, every cell, every border, every label, every page number in the output is pixel-perfect identical to this PDF. The app NEVER generates a new layout. Read the PDF directly — it contains the complete visual structure of all 68 pages.

**RULE 3 — ZERO VALUES**: Any amount that is zero is displayed as "−" never as "0". Negative amounts are displayed in parentheses: (1,234,567). Thousands separators applied consistently per selected currency convention.

**RULE 4 — PAGE HEADERS**: Every single page of the liasse carries the following in the header: Désignation entité | Sigle usuel | Adresse | BP | Numéro d'identification fiscale | Exercice clos le 31-12-[year] | Durée (en mois): [duration]. These are set once in FIRD and auto-populate on every page automatically without any user action.

**RULE 5 — COMPARATIVE COLUMNS**: Every financial statement and every note shows two columns: current year N and prior year N-1. Both columns are always populated.

**RULE 6 — AUTO-SAVE**: The app auto-saves the entire session state every time the user navigates between steps, sections, or pages. No data is ever lost.

**RULE 7 — CASCADING RECALCULATION**: Any change to any input (trial balance, mapping override, note entry, FIRD field) triggers immediate recalculation of all dependent lines, subtotals, totals, cross-references, and control checks throughout the entire application.

**RULE 8 — EXPORT LOCK**: The export button is permanently locked until ALL mandatory control checks (C01 through C13) pass. No exceptions under any circumstances.

**RULE 9 — PAGE NUMBERING**: Every page carries its number in the format "Page X / 68". Page numbers are inherited from the original PDF template and never modified.

**RULE 10 — N/A NOTES**: Notes marked Non Applicable are hidden from the final output but their page structure is preserved in the PDF with N/A marked. The page count remains 68 regardless of how many notes are N/A.

---

# PART C — APPLICATION ENTRY & SESSION MANAGEMENT

## C.1 Landing Page
- Display two primary options: **New Filing** and **Continue Existing Filing**
- Display a third option: **Filing History** showing all past filings as a table: Company Name | Fiscal Year | Status | Last Modified | Export Date | Version
- MANUAL: User chooses an option

## C.2 New Filing
- User clicks New Filing
- App creates a new session with a unique filing ID (UUID)
- App displays a top progress stepper showing all major sections: Identification → Trial Balance → Mapping → Statements → Notes → Controls → Export
- Current step is always highlighted in the stepper
- User can navigate back freely to any previously completed step
- AUTOMATIC: Session ID generated, progress tracker initialized, auto-save activated

## C.3 Continue Existing Filing
- App displays list of all in-progress filings for the current user
- User selects one filing from the list
- App loads all previously entered data exactly as it was last saved
- App resumes at the last incomplete step, highlighted in the progress stepper
- AUTOMATIC: Full state restoration from saved session

## C.4 Filing History
- Table of all completed filings: Company | Year | Export Date | Format | Version | Download link
- User can re-open any past filing to amend it
- User can download any previously exported PDF or Excel file
- MANUAL: User selects action

## C.5 Fiscal Year Selection (first action in every new filing)
- User selects the fiscal year being filed (e.g., 2025) from a dropdown of years
- App automatically derives and sets:
  - Exercise closing date: 31/12/[selected year]
  - Previous year reference: 31/12/[selected year − 1]
  - Exercise start date: 01/01/[selected year] (editable)
  - Duration in months: 12 (editable)
- AUTOMATIC: All dates computed from year selection
- MANUAL: User can override start date (for first-year companies) and duration (for exceptional exercises)

---

# PART D — COMPANY IDENTIFICATION (FIRD — 4 PAGES)

## D.1 FIRD Page 1 — Basic Identification (ZA field group)
All fields mandatory unless marked optional:
- Full company name (Dénomination Sociale)
- Trade name / Sigle Usuel
- Complete address (street, district, city, country)
- Tax identification number (NIF / Numéro d'Identification Fiscale)
- Phone number
- Email address (optional)
- PO Box (Boîte Postale) and city code
- Centre des Impôts de Rattachement: dropdown → Grandes Entreprises (pre-selected and locked for this app)
- **CURRENCY FIELD** (mandatory): dropdown selection
  - Default: GNF (Franc Guinéen) — pre-selected automatically
  - Options: GNF, USD, EUR, XOF, XAF, GBP, and other major currencies
  - Once selected, currency code propagates EVERYWHERE in the application (see Rule 1)
  - Change warning required if changed after data entry (see Rule 1)
- AUTOMATIC: Company name, sigle, NIF, address, exercise dates, currency auto-populate in the header of every page of the liasse immediately upon entry
- MANUAL: All fields entered by user

## D.2 FIRD Page 1 — Exercise Dates (ZA, ZB, ZC field groups)
- ZA — Exercise start date: auto-filled 01/01/N, editable
- ZA — Exercise closing date: auto-filled 31/12/N, editable
- ZA — Duration in months: auto-computed from dates, editable (default 12)
- ZB — Date d'arrêté effectif des comptes: manual entry (e.g., 30/04/2025)
- ZC — Previous exercise closing date: auto-filled 31/12/N−1, editable
- ZC — Previous exercise duration: auto-filled 12, editable
- AUTOMATIC: All date fields derived from fiscal year selection in C.5
- MANUAL: Effective closing date (ZB); previous duration if different from 12 months

## D.3 FIRD Page 1 — Registration & Legal Info (ZD, ZE field groups)
- ZD — Greffe number
- ZD — Registre du Commerce number
- ZD — Numéro de répertoire des entités
- ZE — Numéro de caisse sociale
- ZE — Code importateur
- ZE — Code activité principale: dropdown from DATA file Activity Nomenclature Codes table
- MANUAL: All fields

## D.4 FIRD Page 1 — Contact Details (ZF, ZG, ZH, ZI field groups)
- ZF — Désignation de l'entité (full legal name repeated)
- ZF — Sigle
- ZG — N° de téléphone, Email, Code ville, Boîte postale, Ville
- ZH — Adresse géographique complète (immeuble, rue, quartier, ville, pays)
- ZI — Désignation précise de l'activité exercée
- ZI — Contact person: name, address, quality for supplementary information requests
- ZI — Name of internal accounting professional OR name + address + phone of external certified accounting firm (inscribed with Ordre National des Experts Comptables et des Comptables Agréés)
- MANUAL: All fields

## D.5 FIRD Page 1 — Signatory & Approval
- Visa de l'expert comptable ou du comptable agréé: three radio options — Non assujettie / NON / OUI
- États financiers approuvés par l'Assemblée Générale: checkbox OUI/NON
- Nom du signataire des états financiers
- Qualité du signataire
- Date de signature
- Bank domiciliation table: up to 5 rows of Banque name + N° de compte
- MANUAL: All fields

## D.6 FIRD Page 2 — Legal Form, Regime & Control (ZK to ZS field groups)
- ZK — Forme juridique: dropdown using Legal Form Codes from DATA file (SA, SARL, SNC, etc.)
- ZL — Régime fiscal: dropdown using Fiscal Regime Codes from DATA file (Réel Normal, Réel Simplifié, Synthétique, Forfait)
- ZM — Pays du siège social: dropdown using Country Codes from DATA file
- ZN — Nombre d'établissements hors du pays: numeric field
- ZU — Nombre d'établissements hors du pays avec comptabilité de distance: numeric field
- ZP — Première année d'exercice dans le pays: year field
- ZQ/ZR/ZS — Control type: radio button — Entreprise sous contrôle public / Privé national / Privé étranger (only one can be selected)
- AUTOMATIC: Code values auto-inserted when user selects from dropdowns
- MANUAL: All selections

## D.7 FIRD Page 2 — Activity Breakdown Table
- Table with up to 6 named activity lines + 1 Divers line
- For each line: Désignation de l'activité (free text) + Code nomenclature d'activité (dropdown from DATA file) + Chiffre d'Affaires HT or Valeur Ajoutée (amount in selected currency)
- AUTOMATIC: Percentage of each activity in total CA/VA computed automatically: amount / TOTAL × 100
- AUTOMATIC: TOTAL row = sum of all activity lines (computed instantly)
- AUTOMATIC: Divers line = TOTAL − sum of named activity lines
- MANUAL: Activity descriptions, codes, and amounts per line

## D.8 FIRD Page 3 — Shareholders, Board & Directors

**Section 1 — Actionnaires ou Associés Principaux** (in descending order of capital subscribed):
- Table: Nom | Prénoms | Nationalité | Montant capital (in selected currency) | Percentage
- AUTOMATIC: Percentage = amount / total capital × 100
- AUTOMATIC: TOTAL row summed automatically
- MANUAL: All entries

**Section 2 — Membres du Conseil d'Administration**:
- Table: Nom | Prénoms | Qualité | Adresse (BP, ville, pays)
- MANUAL: All entries

**Section 3 — Dirigeants** (PDG, DG, Administrateur Général, Gérant, Autres):
- Table: Nom | Prénoms | Qualité | Adresse (BP, ville, pays) | NIF
- MANUAL: All entries

**Section 4 — Filiales et Participations**:
- Table: Désignation | Nationalité | Capital
- MANUAL: All entries

## D.9 FIRD Page 4 — Applicable Notes Checklist (FRNA)
- App displays the full list of all 36 notes + DGI states (from DATA file Notes List)
- For each note: two radio options — A (Applicable) or N/A (Non Applicable)
- AUTOMATIC: App pre-suggests N/A status based on trial balance data:
  - No stock accounts (Class 3) present → suggest Note 6 as N/A
  - No financial investment accounts (26, 27) present → suggest Note 4 as N/A
  - No lease accounts (17) present → suggest Note 3B as N/A
  - No foreign currency accounts (476, 477) present → suggest Note 12 as N/A
  - No HAO accounts (Class 8 excluding 81-82) present → suggest Notes 5 and 30 as N/A
  - No revaluation account (106) balance → suggest Note 3E as N/A
  - No deferred charges → suggest Notes 8A, 8B, 8C as N/A
  - Headcount < 250 (from Note 27B) → suggest Note 35 as N/A
- AUTOMATIC: Notes marked N/A are hidden in PDF but page preserved with N/A marking
- MANUAL: Final decision on every note's applicability rests with the user — suggestions are only suggestions

---

# PART E — TRIAL BALANCE INPUT

## E.1 Upload Method Selection
User chooses one of three methods:
- Upload file (Excel .xlsx/.xlsm or CSV) — recommended
- Manual entry — line-by-line input in an on-screen data grid
- Copy-paste — paste from clipboard directly into the grid
- MANUAL: User chooses method

## E.2 Required Trial Balance Structure
Each row of the trial balance must contain these columns:
1. Account number (4 to 8 digits, SYSCOHADA format)
2. Account label (text description)
3. Opening debit balance (solde débiteur d'ouverture)
4. Opening credit balance (solde créditeur d'ouverture)
5. Period debit movements (mouvements débit de la période)
6. Period credit movements (mouvements crédit de la période)
7. Closing debit balance (solde débiteur de clôture)
8. Closing credit balance (solde créditeur de clôture)

MINIMUM ACCEPTABLE: columns 1, 2, 7, 8 only (closing balances). If movement columns (5, 6) are absent, TFT investment and financing lines (FF, FG, FH, FO, FP, FQ) will require manual entry by the user and the app will flag this clearly.

## E.3 Trial Balance Upload — Year N (current year)
- User uploads current year trial balance file
- App reads the file and displays a preview table showing first 20 rows and total row count
- AUTOMATIC: App attempts to auto-detect which file columns correspond to which required fields based on column headers and data patterns (keywords like "débit", "crédit", "solde", "compte", "libellé", "mouvement")
- AUTOMATIC: App shows its column mapping proposal with confidence percentage
- MANUAL: User confirms or corrects the column mapping using a drag-and-assign interface
- User clicks "Confirm Mapping" to proceed

## E.4 Trial Balance Upload — Year N-1 (prior year)
- Exact same upload and mapping process as E.3
- Required for all N-1 comparative columns in every financial statement and note
- AUTOMATIC: Same column mapping automatically applied (user can adjust if structure is different)
- MANUAL: User uploads file and confirms mapping

## E.5 Automatic Validation Checks (run instantly on upload, no user action needed)

**Check 1 — Balance Integrity**:
Total closing debit = Total closing credit for each year separately.
If fails: show exact difference amount. This is a BLOCKING error — user cannot proceed until resolved.

**Check 2 — Account Recognition**:
Every account number checked against complete SYSCOHADA chart of accounts in DATA file (Classes 1 through 8, all accounts and sub-accounts). Every unrecognized account flagged individually with its label and balance shown.

**Check 3 — No Duplicate Account Numbers**:
Each account number appears exactly once per balance. Any duplicates flagged with the duplicate rows shown side by side.

**Check 4 — Abnormal Balances**:
Accounts whose balance is on the unexpected side flagged as WARNINGS (non-blocking):
- Class 1 (liabilities): credit balance expected — debit balance is abnormal
- Class 2 (assets): debit balance expected — credit balance is abnormal
- Class 3 (stocks): debit balance expected — credit balance is abnormal
- Class 4 (tiers): mixed — flagged individually based on account type
- Class 5 (trésorerie): debit balance expected for 50-57 — credit balance for 56
- Class 6 (charges): debit balance expected — credit balance is abnormal
- Class 7 (produits): credit balance expected — debit balance is abnormal

**Check 5 — Income Statement Presence**:
If Class 6 and 7 accounts are present (income statement accounts), app notes this and handles them correctly in income statement mapping. This is normal for a pre-closing trial balance.

**Check 6 — Zero Balance Accounts**:
Accounts with zero in both debit and credit columns are noted but not flagged. They are excluded from all mappings.

- AUTOMATIC: All 6 checks run instantly on upload
- MANUAL: User corrects all BLOCKING errors. User reviews and decides on WARNINGS before proceeding.

## E.6 Unknown Accounts Resolution Panel
App displays a dedicated resolution panel listing all unrecognized account numbers.
For each unknown account, user chooses one of three options:
1. Type the correct SYSCOHADA account number (app re-maps automatically)
2. Select the closest SYSCOHADA account from a searchable dropdown of the full chart
3. Mark as "Exclude from filing" (excluded from all calculations — flagged in audit log)
- MANUAL: Every unknown account must be resolved. This panel cannot be skipped.
- AUTOMATIC: Once all resolved, app immediately re-runs all mapping with corrections applied.

## E.7 Trial Balance Summary Dashboard
Once both balances (N and N-1) are validated and clean, app shows summary cards:
- Total Actif Immobilisé (gross)
- Total Actif Circulant (net)
- Total Trésorerie Actif
- Total Capitaux Propres
- Total Dettes Financières
- Total Passif Circulant
- Total Trésorerie Passif
- Total Produits (Class 7 total)
- Total Charges (Class 6 total)
- Preliminary Net Result (Class 7 − Class 6)
- Balance check indicator: Actif = Passif (large green checkmark if balanced, red alert if not)
- AUTOMATIC: All totals computed and displayed instantly from the validated trial balance
- MANUAL: User reviews summary and clicks "Proceed to Account Mapping" to continue

---

# PART F — ACCOUNT MAPPING ENGINE

## F.1 Mapping Rules Source
The mapping engine uses the account-to-statement mapping rules in the DATA file as its complete rulebook. This defines:
- Which SYSCOHADA account numbers (or ranges) contribute to each financial statement line (REF code)
- The sign to apply to each account (positive or negative)
- Whether to use gross balance, net balance, debit balance, or credit balance
- Which financial statement each REF belongs to (Bilan Actif / Bilan Passif / Compte de Résultat / TFT)

## F.2 Automatic Mapping Execution
For every account in the trial balance (N and N-1):
- App looks up the account number in the mapping rules from the DATA file
- Identifies which REF code(s) the account contributes to
- Applies the correct sign rule (positive or negative contribution)
- Assigns the closing balance amount to that REF for both N and N-1 columns
- Records the full mapping trace: Account Number → Account Label → REF Code → Statement Line Label → Amount N → Amount N-1

This produces a complete mapping table covering:
- All Balance Sheet ACTIF lines (AD through BZ, 22 lines)
- All Balance Sheet PASSIF lines (CA through DZ, 20 lines)
- All Income Statement lines (TA through XI, 30 lines including computed subtotals)
- All Cash Flow lines (ZA through ZH, FA through FQ, 20 lines)
- All 36 Notes detail line breakdowns

- AUTOMATIC: Entire mapping executes instantly without any user input

## F.3 Mapping Review Screen
App displays the complete mapping table grouped by financial statement section:
- Each REF code shown with its full label
- Expand any REF to see exactly which accounts contribute and their individual amounts
- Totals shown per REF for N and N-1 columns
- Any REF with no contributing accounts shown with "−" and flagged with orange warning if it is normally expected to have a value (e.g., TA with no 701 account is a warning if the company is a trading company)
- MANUAL: User reviews the entire mapping for anomalies — this is a critical review step that cannot be skipped

## F.4 Manual Mapping Overrides
User can perform the following corrections:
- Move an account from one REF code to another (using a drag interface or a dropdown reassignment)
- Split a single account's balance across two REF codes (user enters the amount allocated to each REF — both amounts must sum to the total account balance)
- Add a manual amount directly to any REF code (for adjustments or entries not captured in the trial balance)
- Every override is automatically logged: Original REF → New REF → Amount → Mandatory note field explaining the override reason
- MANUAL: All overrides are user-initiated and user-justified

## F.5 Gross, Amortization, Net Separation for Balance Sheet ACTIF
For every asset line on the ACTIF side (lines AE through AS), the app automatically:
- Identifies the gross value accounts (Class 2: 201, 202, 211-218, 221-228, 231-238, 241-248, 25, 261-262, 271-278)
- Identifies the corresponding accumulated amortization accounts (Class 28: 2801-2802, 2811-2818, 2821-2828, 2831-2838, 2841-2848, 285, no amort on Class 26)
- Identifies the corresponding depreciation accounts (Class 29: 291, 292, 293, 294, 295, 296, 297, 298)
- Computes for each asset line: NET = GROSS − AMORTISSEMENTS − DÉPRÉCIATIONS
- Maps to three separate columns: BRUT | AMORTISSEMENT/DÉPRÉCIATION | NET
- Matching rule: account 281x amortizes account 21x, 282x amortizes 22x, 283x amortizes 23x, 284x amortizes 24x, 285x amortizes 25x. Accounts 296, 297 depreciate accounts 261-262, 271-278 respectively.
- AUTOMATIC: All three columns populated for every ACTIF immobilisé line
- MANUAL: User corrects any mismatch if an asset's depreciation account does not follow the standard numbering convention

## F.6 Debit/Credit Direction Rules (applied automatically)
- Asset accounts (normal debit balance — Class 2, 3, 4 debit accounts, 5 debit accounts): use closing debit balance
- Liability accounts (normal credit balance — Class 1, 4 credit accounts, 56): use closing credit balance
- Income accounts (Class 7): use closing credit balance
- Expense accounts (Class 6): use closing debit balance
- Account 12 (Report à nouveau): credit balance = positive CG; debit balance = negative (shown in parentheses)
- Account 409 (Fournisseurs débiteurs): debit balance → appears on ACTIF side as BH
- Account 419 (Clients avances reçues): credit balance → appears on PASSIF side as DI
- Accounts with abnormal balances (opposite of expected): flagged individually for user review
- AUTOMATIC: All direction rules applied without user intervention

---

# PART G — BALANCE SHEET GENERATION (BILAN)

## G.1 ACTIF Side — Full Automatic Population

All amounts in selected currency. All lines show N and N-1 columns. All three sub-columns (BRUT / AMORTISSEMENT-DÉPRÉCIATION / NET) for immobilized assets. Single NET column for current assets.

**IMMOBILISATIONS INCORPORELLES**
- AE: Frais de développement et de prospection | Gross: 201, 202 | Amort: 2801, 2802 | Net = Gross − Amort
- AF: Brevets, licences, logiciels et droits similaires | Gross: 211,212,213,214,215 | Amort: 2811,2812,2813,2814,2815 | Net = Gross − Amort
- AG: Fonds commercial et droit au bail | Gross: 216,217 | Amort: 2816,2817 | Net = Gross − Amort
- AH: Autres immobilisations incorporelles | Gross: 218 | Amort: 2818 | Net = Gross − Amort
- AD: TOTAL IMMOBILISATIONS INCORPORELLES = sum of AE+AF+AG+AH (all three columns separately)

**IMMOBILISATIONS CORPORELLES**
- AJ: Terrains | Gross: 221,222,223,224,225,226,228 | Amort: 2821,2822,2823,2824,2825,2826,2828 | Net = Gross − Amort. Sub-line: dont placement en NET = account 225 net
- AK: Bâtiments | Gross: 231,232,233,234,235,238 | Amort: 2831,2832,2833,2834,2835,2838 | Net = Gross − Amort. Sub-line: dont placement en NET = account 235 net
- AL: Aménagement, agencement et installation | Gross: 241,242,243,244 | Amort: 2841,2842,2843,2844 | Net = Gross − Amort
- AM: Matériel, mobilier et actif biologique | Gross: 245,246,247,248 | Amort: 2845,2846,2847,2848 | Net = Gross − Amort
- AN: Matériel de transport | Gross: 25 | Amort: 285 | Net = Gross − Amort
- AI: TOTAL IMMOBILISATIONS CORPORELLES = sum AJ+AK+AL+AM+AN (all three columns)
- AP: Avances et acomptes versés sur immobilisations | Gross: 251,252,253 | No amort | Net = Gross

**IMMOBILISATIONS FINANCIÈRES**
- AR: Titres de participation | Gross: 261,262 | Dépréciation: 2961,2962 | Net = Gross − Dépréciation
- AS: Autres immobilisations financières | Gross: 271,272,273,274,275,276,277,278 | Dépréciation: 2971,2972,2973,2974,2975,2976,2977,2978 | Net = Gross − Dépréciation
- AQ: TOTAL IMMOBILISATIONS FINANCIÈRES = AR + AS (all three columns)

- AZ: TOTAL ACTIF IMMOBILISÉ = AD + AI + AP + AQ (all three columns)

**ACTIF CIRCULANT**
- BA: Actif Circulant HAO | Net: account 488 minus account 498 | N and N-1
- BB: Stocks et Encours | Gross: accounts 31,32,33,34,35,36,37,38 | Dépréciation: 391,392,393,394,395,396,397,398 | Net = Gross − Dépréciation

**CRÉANCES ET EMPLOIS ASSIMILÉS (BG group)**
- BH: Fournisseurs avances versées | Net: account 409 (debit balance) | N and N-1
- BI: Clients | Gross: 411,412,413,414,415,416,417,418 | Dépréciation: 491 | Net = Gross − Dépréciation
- BJ: Autres créances | Gross: 421,422,423,424,425,426,431,432,441,442,443,444,445,446,447,448,451,452,453,454,455,456,457,458,461,462,464,465,467,4711,4712,476 | Dépréciation: 492,493,494,495,496,497 | Net = Gross − Dépréciation
- BK: TOTAL ACTIF CIRCULANT = BA + BB + BH + BI + BJ

**TRÉSORERIE ACTIF**
- BQ: Titres de placement | Gross: 501,502,503,504,505,506,507,508 | Dépréciation: 591,592,593,594,595,596,597,598 | Net = Gross − Dépréciation
- BR: Valeurs à encaisser | Net: 511,512,513,514,515,516,517,518
- BS: Banques, chèques postaux, Caisse et assimilés | Net: 521,522,523,524,525,526,531,532,541,551,552,571,572,573,574,575,576,578 — DEBIT BALANCES ONLY (credit balances of these accounts go to PASSIF trésorerie)
- BT: TOTAL TRÉSORERIE ACTIF = BQ + BR + BS

- BU: Écart de conversion Actif | Net: account 476 | N and N-1
- BZ: TOTAL GÉNÉRAL ACTIF = AZ + BK + BT + BU

All lines computed automatically. Both N and N-1 columns populated simultaneously.

## G.2 PASSIF Side — Full Automatic Population

All amounts in selected currency. All lines show N and N-1 columns.

**CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES**
- CA: Capital | accounts 101,102,103,104 (excluding 109) | credit balance | N and N-1
- CB: Apporteurs capital non appelé (-) | account 109 | debit balance shown as NEGATIVE deduction | N and N-1
- CD: Primes liées au capital social | account 105 | credit balance | N and N-1
- CE: Écart de réévaluation | account 106 | credit balance | N and N-1
- CF: Réserves indisponibles | accounts 111,112,113 | credit balance | N and N-1
- CG: Réserves libres | account 118 | credit balance | N and N-1
- CH: Report à nouveau (+or−) | account 12 | credit balance = positive; debit balance = negative shown in parentheses | N and N-1
- CJ: Résultat net de l'exercice (bénéfice+ ou perte−) | N = computed from Income Statement line XI | N-1 = account 13 from prior year balance | both shown with sign
- CL: Subventions d'investissement | account 14 | credit balance | N and N-1
- CM: Provisions réglementées | account 15 | credit balance | N and N-1
- CP: TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES = CA+CB+CD+CE+CF+CG+CH+CJ+CL+CM

**DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES**
- DA: Emprunts et dettes financières diverses | accounts 161,162,163,164,165,166,181,182,183,184 | credit balance | N and N-1
- DB: Dettes de location et acquisition | account 17 (171,172,173,174,176,178) | credit balance | N and N-1
- DC: Provisions pour risques et charges | account 19 (191,192,193,194,195,196,197,198,199) | credit balance | N and N-1
- DD: TOTAL DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES = DA+DB+DC
- DF: TOTAL RESSOURCES STABLES = CP + DD

**PASSIF CIRCULANT**
- DH: Dettes circulantes HAO | accounts 484,485 | credit balance | N and N-1
- DI: Clients, avances reçues | account 419 | credit balance | N and N-1
- DJ: Fournisseurs d'exploitation | accounts 401,402,403,404,405,406,407,408 | credit balance | N and N-1
- DK: Dettes fiscales et sociales | accounts 421,422,423,424,425,426,431,432,433,434,438,441,442,443,444,445,446,447,448 | credit balance | N and N-1
- DM: Autres dettes | accounts 451,452,453,454,455,456,457,458,461,462,464,465,467,468,471,472,473,474,475,478 | credit balance | N and N-1
- DN: Provisions pour risques à court terme | accounts 499,599 | credit balance | N and N-1
- DP: TOTAL PASSIF CIRCULANT = DH+DI+DJ+DK+DM+DN

**TRÉSORERIE PASSIF**
- DQ: Banques, crédits d'escompte | accounts 564,565 | credit balance | N and N-1
- DR: Banques, établissements financiers et crédits de trésorerie | accounts 561,562,563,566,567,568 | credit balance | N and N-1
- DT: TOTAL TRÉSORERIE PASSIF = DQ + DR

- DV: Écart de conversion Passif | account 477 | credit balance | N and N-1
- DZ: TOTAL GÉNÉRAL PASSIF = DF + DP + DT + DV

## G.3 Balance Sheet Control Check
- AUTOMATIC: App instantly computes BZ − DZ after every recalculation
- If BZ = DZ: large green checkmark displayed "Bilan équilibré ✓"
- If BZ ≠ DZ: large red alert "DÉSÉQUILIBRE DU BILAN: [exact difference amount]" — export button locked — user directed to mapping review screen
- MANUAL: User must resolve any imbalance before export is possible

---

# PART H — INCOME STATEMENT GENERATION (COMPTE DE RÉSULTAT)

## H.1 Revenue Lines — Complete Automatic Population
- TA: Ventes de marchandises A (+) | account 701 net of 7019 | N and N-1
- RA: Achat de marchandises (−) | account 601 net of 6019 | N and N-1
- RB: Variation de stocks de marchandises (±) | account 6031 | debit = increase stock = negative in CR; credit = decrease = positive | N and N-1
- XA: MARGE COMMERCIALE = TA + RA + RB | AUTOMATIC computed subtotal
- TB: Ventes de produits fabriqués B (+) | account 702 | N and N-1
- TC: Travaux, services vendus C (+) | accounts 703,705,706 | N and N-1
- TD: Produits accessoires D (+) | account 707 | N and N-1
- XB: CHIFFRE D'AFFAIRES = TA + TB + TC + TD | AUTOMATIC computed subtotal

## H.2 Other Operating Lines
- TE: Production stockée ou déstockage (±) | account 73 | credit = production > consumption = positive; debit = destockage = negative | N and N-1
- TF: Production immobilisée (+) | accounts 721,722,724,728 | N and N-1
- TG: Subventions d'exploitation (+) | account 71 | N and N-1
- TH: Autres produits (+) | accounts 751,754,756,757,758 | N and N-1
- TI: Transferts de charges d'exploitation (+) | account 781 | N and N-1

## H.3 Operating Expense Lines
- RC: Achats de matières premières et fournitures liées (−) | account 602 net of 6029 | N and N-1
- RD: Variation de stocks matières premières (±) | account 6032 | same sign rule as RB | N and N-1
- RE: Autres achats (−) | accounts 604,605,608 net of 6049,6089 | N and N-1
- RF: Variation de stocks d'autres approvisionnements (±) | account 6033 | N and N-1
- RG: Transports (−) | account 61 (6120,6130,6140,6160,6181,6182,6183) | N and N-1
- RH: Services extérieurs (−) | accounts 62,63 | N and N-1
- RI: Impôts et taxes (−) | account 64 | N and N-1
- RJ: Autres charges (−) | account 65 | N and N-1
- XC: VALEUR AJOUTÉE = (XB + RA + RB) + (TE + TF + TG + TH + TI + RC + RD + RE + RF + RG + RH + RI + RJ) | AUTOMATIC computed subtotal
- RK: Charges de personnel (−) | account 66 | N and N-1
- XD: EXCÉDENT BRUT D'EXPLOITATION = XC + RK | AUTOMATIC computed subtotal

## H.4 Amortization & Provisions Lines
- TJ: Reprises d'amortissements, provisions et dépréciations (+) | accounts 791,798 | N and N-1
- RL: Dotations aux amortissements, aux provisions et dépréciations (−) | accounts 6812,6813,6911,6913,6914 (all 68x and 691x excluding 697x) | N and N-1
- XE: RÉSULTAT D'EXPLOITATION = XD + TJ + RL | AUTOMATIC computed subtotal

## H.5 Financial Result Lines
- TK: Revenus financiers et assimilés (+) | account 77 | N and N-1
- TR: Reprises de provisions et dépréciations financières (+) | account 797 | N and N-1
- TM: Transfert de charges financières (+) | account 787 | N and N-1
- RM: Frais financiers et charges assimilées (−) | account 67 | N and N-1
- RN: Dotations aux provisions et aux dépréciations financières (−) | account 697 | N and N-1
- XF: RÉSULTAT FINANCIER = TK + TR + TM + RM + RN | AUTOMATIC computed subtotal
- XG: RÉSULTAT DES ACTIVITÉS ORDINAIRES = XE + XF | AUTOMATIC computed subtotal

## H.6 HAO Lines
- TN: Produits des cessions d'immobilisations (+) | accounts 821,822,826,828 | N and N-1
- TO: Autres produits HAO (+) | accounts 841,842,843,844,845,848,861-868 | N and N-1
- RO: Valeurs comptables des cessions d'immobilisations (−) | accounts 811,812,813,814-818 | N and N-1
- RP: Autres charges HAO (−) | accounts 831,832,833,834,835,838,851-858 | N and N-1
- XH: RÉSULTAT HAO = TN + TO + RO + RP | AUTOMATIC computed subtotal
- RQ: Participation des travailleurs (−) | account 87 | N and N-1
- RS: Impôt sur le résultat (−) | account 891 | N and N-1
- XI: RÉSULTAT NET = XG + XH + RQ + RS | AUTOMATIC computed subtotal

## H.7 Income Statement Control Check
- AUTOMATIC: App checks XI (Income Statement) = CJ (Balance Sheet)
- If equal: green checkmark "Résultat cohérent ✓"
- If not equal: red alert showing both values and exact difference — export blocked
- MANUAL: User resolves discrepancy by reviewing mapping

---

# PART I — CASH FLOW STATEMENT (TABLEAU DE FLUX DE TRÉSORERIE)

## I.1 Opening Cash Position
- ZA: Trésorerie Nette au 1er Janvier
- Formula: (BT_N-1 − DT_N-1) + [S(4786) − S(4726) − S(4797)] at N-1
- = Total Trésorerie Actif from prior year minus Total Trésorerie Passif from prior year, adjusted for conversion differences
- AUTOMATIC: Pulled directly from prior year balance sheet values

## I.2 Operating Activities

**FA — Capacité d'Autofinancement Globale (CAFG)**
Formula: XD + TK + TM + TO − balance(account 86) + RM + RP + balance(account 85) + RQ + RS + balance(account 654) − balance(account 754)
Where all XD, TK, TM, TO, RM, RP, RQ, RS are from Income Statement lines already computed.
Account 654 = VCN cessions courantes; account 754 = Produits cessions courantes; account 85 = Dotations HAO; account 86 = Reprises HAO.
AUTOMATIC: Computed entirely from Income Statement

**FB — Variation d'Actif Circulant HAO**
Formula: −(BA_N − BA_N-1)
Increase in HAO assets = use of cash = negative sign applied
AUTOMATIC: Computed from two balance sheets

**FC — Variation des Stocks**
Formula: −(BB_N − BB_N-1)
Increase in stocks = use of cash = negative sign applied
AUTOMATIC: Computed from two balance sheets

**FD — Variation des Créances**
Formula: −([BG + SD(47811,276) − SD(414,4494,458,461,467,4751) − SC(47911)]_N − [same expression]_N-1)
Where BG = total of BH+BI+BJ from ACTIF; SD = solde débiteur; SC = solde créditeur of specified accounts
Increase in receivables = use of cash = negative sign applied
AUTOMATIC: Computed from two balance sheets with account-level adjustments

**FE — Variation du Passif Circulant**
Formula: [DH' + DI' + DJ' + DK' + DM' + DN + 4793 + 4798 − 4783 + S(176)]_N − [same]_N-1
Where: DH' = only accounts S(484,4998); DJ' = DJ − S(404); DK' = DK − S(4493,4494,4497,4499); DM' = DM − S(4726,461,465,4752) − MD(4713)
Increase in payables = source of cash = positive sign applied
AUTOMATIC: Computed from two balance sheets with account-level adjustments

- Variation du BFR lié aux activités opérationnelles = FB + FC + FD + FE (shown as informational sub-total)
- ZB: FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS OPÉRATIONNELLES = FA + FB + FC + FD + FE | AUTOMATIC

## I.3 Investment Activities

**FF — Décaissements liés aux acquisitions d'immobilisations incorporelles**
Formula: −(Note3A_acquisitions_incorporelles + Note3A_avances_incorporelles − Note3A_cessions_avances_incorporelles − [S(4811,4821,4041,4046,48161,48171,48181)_N − same_N-1])
AUTOMATIC IF Note 3A is filled. MANUAL entry allowed if Note 3A not yet complete (app flags this clearly).

**FG — Décaissements liés aux acquisitions d'immobilisations corporelles**
Formula: −(Note3A_acquisitions_corporelles + Note3A_avances_corporelles − Note3A_cessions_avances_corporelles − Note3B_acquisitions_totales − [S(4812,4822,4042,4047,47918,47938,48162,48172,48182)_N − same_N-1])
AUTOMATIC IF Notes 3A and 3B are filled. MANUAL entry allowed if notes not yet complete.

**FH — Décaissements liés aux acquisitions d'immobilisations financières**
Formula: −(Note3A_acquisitions_financieres + [S(4813,4782,−4792,−MD(2714,276))_N − same_N-1])
AUTOMATIC IF Note 3A is filled. MANUAL entry allowed if note not yet complete.

**FI — Encaissements liés aux cessions d'immobilisations incorporelles et corporelles**
Formula: SC(754,821,822) − [SD(414,485,−4856)_N − SD(414,485,−4856)_N-1]
AUTOMATIC: From trial balance account balances and movements

**FJ — Encaissements liés aux cessions d'immobilisations financières**
Formula: SC(826) + [−SD(4856)_N + SD(4856)_N-1] + MC(27 excluding 2714 and 2766)
Where MC = credit movements (mouvements crédit) during the period — requires movement columns in trial balance
AUTOMATIC if movement columns provided. MANUAL if only closing balances available.

- ZC: FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS D'INVESTISSEMENT = FF+FG+FH+FI+FJ | AUTOMATIC

## I.4 Financing Activities — Equity (Capitaux Propres)

**FK — Augmentations de capital par apports nouveaux**
Formula: [CA + CB − SD(4613,4619,467,4581)]_N − [CA + CB − SD(4613,4619,467,4581)]_N-1
If result is negative, FK = 0 (negative value goes to FM instead)
AUTOMATIC: Computed from balance sheet changes

**FL — Subventions d'investissement reçues**
Formula: MC(14) − [SD(4582,4494)_N − SD(4582,4494)_N-1]
Where MC(14) = credit movements in account 14 during the period
AUTOMATIC if movement columns provided. MANUAL otherwise.

**FM — Prélèvements sur le capital**
Formula: If FK < 0, then FM = FK (absolute value); else FM = (CF+CG+CH)_N − (CF+CG+CH+CJ)_N-1 + MC(465)
AUTOMATIC: Computed from balance sheet changes

**FN — Dividendes versés**
Formula: −MD(465)
Where MD(465) = debit movements in account 465 during the period
AUTOMATIC if movement columns provided. MANUAL otherwise.

- ZD: FLUX DE TRÉSORERIE PROVENANT DES CAPITAUX PROPRES = FK+FL+FM+FN | AUTOMATIC

## I.5 Financing Activities — External Debt (Capitaux Étrangers)

**FO — Emprunts et dettes financières nouvelles**
Formula: MC(161,162) − SD(4784) − MD(4713) − MD(4794) − (S(166)_N − S(166)_N-1)
AUTOMATIC if movement columns provided.

**FP — Dettes de location-acquisition nouvelles**
Formula: MC(163,164,165,181,182,183,184)
AUTOMATIC if movement columns provided.

**FQ — Remboursements des emprunts et autres dettes financières**
Formula: −MD(16,17,181,182,183,184) + SC(4794)
AUTOMATIC if movement columns provided.

- ZE: FLUX DE TRÉSORERIE PROVENANT DES CAPITAUX ÉTRANGERS = FO+FP+FQ | AUTOMATIC
- ZF: FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS DE FINANCEMENT = ZD + ZE | AUTOMATIC

## I.6 Cash Reconciliation
- ZG: VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE = ZB + ZC + ZF | AUTOMATIC
- ZH: TRÉSORERIE NETTE AU 31 DÉCEMBRE = ZA + ZG | AUTOMATIC
- CONTROL CHECK: ZH must equal (BT_N − DT_N) + [S(4786) − S(4726) − S(4797)]_N
- If ZH = control value: green checkmark "TFT réconcilié ✓"
- If ZH ≠ control value: red alert showing ZH, expected value, and difference — export blocked
- MANUAL: User resolves any discrepancy by reviewing mapping and note 3A/3B inputs

---

# PART J — ALL 36 NOTES ANNEXES

## J.1 Note 1 — Dettes Garanties par Sûretés Réelles

**Structure**: Three sections
1. Table of secured debts: columns Libellé | Note | Montant Brut | split by HYPOTHÈQUES / NANTISSEMENTS / GAGES / AUTRES
2. Engagements financiers table: Libellé | Engagements donnés | Engagements reçus | Engagements réciproques
   Rows: Avals, cautions, garanties | Hypothèques nantissements gages | Engagements consentis entités liées | Primes remboursement obligations non échues | Effets escomptés non échus | Autres engagements réciproques | Créances commerciales cédées | Abandons créances conditionnels | Achats marchandises à terme | Achats devises non couverts | Commandes fermes clients
3. Commentary field (free text)

**Population**:
- AUTOMATIC: Debt line labels pre-populated from Balance Sheet debt lines (DA, DB, DP accounts)
- AUTOMATIC: Amounts from corresponding Balance Sheet values
- MANUAL: Guarantee type (which of hypothèque/nantissement/gage/autre applies to each debt)
- MANUAL: All off-balance-sheet commitment amounts (engagements donnés, reçus, réciproques)
- MANUAL: Commentary text

## J.2 Note 2 — Informations Obligatoires

**Section A — Déclaration de conformité**:
AUTOMATIC pre-filled text: "Les états financiers sont établis en conformité avec le système comptable OHADA et l'acte uniforme relatif au droit comptable et à l'information financière"

**Section B — Règles et méthodes comptables**:
AUTOMATIC pre-filled opening text: "Les états financiers ont été confectionnés dans le respect des postulats, conventions et des règles d'évaluation édictés par le SYSCOHADA et l'acte uniforme"
MANUAL: User adds specific accounting methods:
- Depreciation method and rates used per asset category
- Inventory valuation method (FIFO, weighted average, etc.)
- Foreign currency translation method
- Revenue recognition policy
- Any other significant accounting policy choices

**Section C — Dérogations aux postulats et conventions**:
AUTOMATIC pre-filled: "Respect de tous les postulats et conventions comptables sans aucune dérogation"
MANUAL: User modifies this text if any derogation from SYSCOHADA standards exists, with explanation

**Section D — Informations complémentaires**:
AUTOMATIC pre-filled: "Pas d'informations complémentaires relatives aux autres états financiers"
MANUAL: User adds any additional significant information about the balance sheet, income statement, or TFT

## J.3 Note 3A — Immobilisations Brutes (Movement Table)

**Structure**: Movement table with columns:
- A: Montant Brut à l'ouverture de l'exercice
- B: Acquisitions / Apports / Créations
- C: Virements de poste à poste (in)
- D: Suite à réévaluation pratiquée au cours de l'exercice
- E: Cessions / Scissions / Hors Service
- F: Virements de poste à poste (out)
- G: Montant Brut à la clôture de l'exercice = A + B + C + D − E − F

**Rows**: All asset categories:
IMMOBILISATIONS INCORPORELLES: Frais développement | Brevets licences logiciels | Fonds commercial | Autres incorporelles
IMMOBILISATIONS CORPORELLES: Terrains hors placement | Terrains immeuble placement | Bâtiments hors placement | Bâtiments immeuble placement | Aménagements agencements | Matériel mobilier actifs biologiques | Matériel transport
AVANCES ET ACOMPTES: one row
IMMOBILISATIONS FINANCIÈRES: Titres de participation | Autres immobilisations financières
TOTAL GÉNÉRAL

**Population**:
- AUTOMATIC: Column A (opening brut) = Gross values from N-1 trial balance (Class 2 accounts)
- AUTOMATIC: Column G (closing brut) = Gross values from N trial balance (Class 2 accounts)
- AUTOMATIC: Column G is immediately validated against Balance Sheet gross column values — must match exactly
- AUTOMATIC: Column G recomputed as A + B + C + D − E − F and both the formula result and the trial balance value shown — any discrepancy flagged
- MANUAL: Column B (acquisitions/créations) — user enters amounts per category
- MANUAL: Column C (virements in) — user enters reclassification amounts
- MANUAL: Column D (réévaluations) — user enters if revaluation occurred
- MANUAL: Column E (cessions/mises hors service) — user enters amounts per category
- MANUAL: Column F (virements out) — user enters reclassification amounts
- CROSS-REFERENCE: Column B totals per category feed into TFT lines FF, FG, FH automatically

## J.4 Note 3B — Biens Pris en Location-Acquisition

**Structure**: Same movement table as 3A (columns A through G) plus:
- Additional first column: Nature du contrat (I = Crédit-bail immobilier, M = Crédit-bail mobilier, A = Autres)

**Rows**: Terrains | Bâtiments | Aménagements agencements | Matériel mobilier actifs biologiques | Matériel de transport
TOTAL IMMOBILISATIONS EN LOCATION-ACQUISITION

**Population**:
- AUTOMATIC: Column G closing total validated against account 17 balance on Balance Sheet
- MANUAL: All movement columns (B through F) — leased asset details and movements are not typically in trial balance sub-accounts
- MANUAL: Contract type for each row (I, M, or A)
- CROSS-REFERENCE: Total column B (new acquisitions via lease) feeds into TFT line FG as a deduction

## J.5 Note 3C — Immobilisations (Amortissements) Movement Table

**Structure**: Movement table with columns:
- A: Amortissements cumulés à l'ouverture de l'exercice
- B: Augmentations — Dotations de l'exercice
- C: Diminutions — Amortissements relatifs aux éléments sortis de l'actif
- D: Cumul des amortissements à la clôture de l'exercice = A + B − C

**Rows**: Same asset categories as Note 3A (incorporelles, corporelles by sub-type, financial assets)
SOUS TOTAL INCORPORELLES | SOUS TOTAL CORPORELLES | TOTAL GÉNÉRAL

**Population**:
- AUTOMATIC: Column A = accumulated amortization from N-1 trial balance (Class 28 accounts)
- AUTOMATIC: Column D = accumulated amortization from N trial balance (Class 28 accounts)
- AUTOMATIC: Column D validated against Balance Sheet amortissement column — must match exactly
- AUTOMATIC: Column B (dotations) = debit movements in accounts 6812, 6813 (from movement columns if available), allocated per asset category based on sub-accounts of 68x
- AUTOMATIC: Column C = A + B − D (mathematically derived)
- MANUAL: User verifies allocation of Column B per category if depreciation accounts are not broken down by asset category in the trial balance

## J.6 Note 3C Bis — Immobilisations (Dépréciations)

**Structure**: Same movement table as 3C but for impairments
- A: Dépréciations cumulées à l'ouverture
- B: Augmentations — Dotations de l'exercice
- C: Diminutions — Reprises de l'exercice
- D: Cumul des dépréciations à la clôture = A + B − C

**Rows**: Same as 3C

**Population**:
- AUTOMATIC: Column A from N-1 Class 29 account balances
- AUTOMATIC: Column D from N Class 29 account balances
- AUTOMATIC: Column D validated against depreciation sub-column in Balance Sheet
- AUTOMATIC: Column B from accounts 6913, 6914 movements
- AUTOMATIC: Column C from accounts 7913, 7914 movements
- MANUAL: User adds commentary on impairment events (what triggered impairment, which assets affected)

## J.7 Note 3D — Immobilisations: Plus-Values et Moins-Values de Cession

**Structure**: Table with columns:
- A: Montant Brut (of disposed asset)
- B: Amortissements pratiqués (accumulated amort on disposed asset)
- C: Valeur Comptable Nette = A − B
- D: Prix de Cession (sale price received)
- E: Plus ou Moins-Value = D − C

**Rows**: By asset category (Frais développement | Brevets | Fonds commercial | Autres incorporelles | Terrains | Bâtiments | Aménagements | Matériel mobilier | Matériel transport | Titres participation | Autres immob financières)
SOUS TOTALS + TOTAL GÉNÉRAL

**Population**:
- AUTOMATIC: Column A = gross value of disposed assets (from Note 3A column E per category)
- AUTOMATIC: Column B = accumulated amortization on disposed assets (from Note 3C column C per category)
- AUTOMATIC: Column C = A − B (net book value at time of disposal)
- AUTOMATIC: Column E = D − C (gain or loss on disposal)
- AUTOMATIC: Total E cross-checked against XH (HAO result) on Income Statement — difference flagged
- MANUAL: Column D (sale prices) — user enters actual proceeds received per asset category

## J.8 Note 3E — Informations sur les Réévaluations

**Structure**: Free table with columns:
- Éléments réévalués par poste de bilan
- Montants coûts historiques
- Montants réévalués
- Écarts de réévaluation
- Amortissements supplémentaires

Plus text fields for:
- Nature et date des réévaluations
- Méthode de réévaluation utilisée
- Traitement fiscal de l'écart de réévaluation
- Montant de l'écart incorporé au capital

**Population**:
- If account 106 balance = 0 in both N and N-1: note pre-suggested as N/A
- MANUAL: All fields — fully manual if revaluation occurred

## J.9 Note 4 — Immobilisations Financières

**Structure**: Two parts

**Part 1 — Balances table**:
Rows: Titres de participation | Prêts et créances diverses | Prêts au personnel | Créances sur l'État | Titres immobilisés | Dépôts et cautionnements versés | Intérêts courus | Créances rattachées avances et participations GIE | Immobilisations financières diverses
TOTAL BRUT | Dépréciations titres participation | Dépréciations autres immobilisations | TOTAL NET

Columns: Année N | Année N-1 | Variation en % | Créances à un an ou plus | 1 à 2 ans | Plus de 2 ans

**Part 2 — List of subsidiaries and participations**:
Columns: Dénomination sociale | Localisation (ville/pays) | Valeur d'acquisition | % Détenu | Montant capitaux propres filiale | Résultat dernier exercice filiale | Part de bénéfice reçue

**Population**:
- AUTOMATIC: Part 1 balances from accounts 261,262,271,272,273,274,275,276,277,278 with depreciations from 296, 297
- AUTOMATIC: N and N-1 from respective trial balances
- AUTOMATIC: Variations computed automatically
- AUTOMATIC: Total NET validated against AQ on Balance Sheet
- MANUAL: Aging breakdown per row (1 yr, 1-2 yrs, >2 yrs) if not available from trial balance sub-accounts
- MANUAL: All of Part 2 (subsidiary percentage, their equity, their result, dividends received)

## J.10 Note 5 — Actif Circulant et Dettes Circulantes HAO

**Structure**: Two separate tables

**Table 1 — Actif Circulant HAO**:
Rows: Créances sur cessions d'immobilisations | Autres créances hors activités ordinaires
Columns: Année N | Année N-1 | Variation % | TOTAL BRUT | Dépréciations | TOTAL NET

**Table 2 — Dettes Circulantes HAO**:
Rows: Fournisseurs d'investissements | Fournisseurs effets à payer | Autres dettes HAO | Versements restant à effectuer sur titres non libérés
Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: Table 1 from accounts 488, 498
- AUTOMATIC: Table 2 from accounts 484, 485
- AUTOMATIC: Table 1 NET validated against BA on Balance Sheet
- AUTOMATIC: Table 2 total validated against DH on Balance Sheet
- MANUAL: Commentary field

## J.11 Note 6 — Stocks et Encours

**Structure**: Single table
Rows: Marchandises | Matières premières et fournitures liées | Autres approvisionnements | Produits en cours | Services en cours | Produits finis | Produits intermédiaires | Stocks en cours de route, en consignation ou en dépôt
TOTAL BRUT STOCKS ET EN COURS | Dépréciations des stocks | TOTAL NET DE DÉPRÉCIATION

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: Gross from accounts 31,32,33,34,35,36,37,38
- AUTOMATIC: Dépréciations from accounts 391,392,393,394,395,396,397,398
- AUTOMATIC: NET = Gross − Dépréciations per row
- AUTOMATIC: TOTAL NET validated against BB on Balance Sheet — must match exactly
- AUTOMATIC: Variations computed per row
- MANUAL: Commentary field
- NOTE: Stocks HAO included here only if > 5% of total actif circulant; otherwise in Note 5

## J.12 Note 7 — Clients et Produits à Recevoir

**Structure**: Table
Rows: Clients (hors réserves de propriété groupe) | Clients effets à recevoir hors RP | Clients et effets avec réserves de propriété | Clients et effets groupe | Créances sur cessions d'immobilisations | Clients litigieux ou douteux | Clients produits à recevoir | Clients effets escomptés non échus | TOTAL BRUT CLIENTS | Dépréciations comptes clients | TOTAL NET | then: Autres clients créditeurs (Client avances reçues hors groupe | Client avances reçues groupe) | TOTAL CLIENTS CRÉDITEURS

Columns: Année N | Année N-1 | Variation % | Créances à 1 an ou plus | 1 à 2 ans | Plus de 2 ans

**Population**:
- AUTOMATIC: Balances from accounts 411,412,413,414,415,416,417,418 and depreciation from 491
- AUTOMATIC: TOTAL NET validated against BI on Balance Sheet
- AUTOMATIC: Client avances reçues from account 419 validated against DI on Balance Sheet
- AUTOMATIC: Variations computed
- MANUAL: Aging breakdown per row (columns ≤1yr, 1-2yr, >2yr) if not in sub-accounts
- MANUAL: Commentary

## J.13 Note 8 — Autres Créances

**Structure**: Table
Rows: Personnel | Organismes sociaux | État et Collectivités publiques | Organismes internationaux | Apporteurs, associés et groupe | Compte transitoire ajustement spécial SYSCOHADA | Charges constatées d'avance | Autres débiteurs divers | Comptes permanents non bloqués établissements et succursales | Comptes de liaison charges et produits | Comptes de liaison sociétés en participation
TOTAL BRUT | Dépréciations autres créances | TOTAL NET

Columns: Année N | Année N-1 | Variation % | Créances ≤1 an | 1-2 ans | >2 ans

**Population**:
- AUTOMATIC: From accounts 42 (debit),43 (debit),44 (debit),45 (debit),46 (debit),4752,476,471,478 and depreciations 492,493,494,495,496,497
- AUTOMATIC: TOTAL NET validated against BJ on Balance Sheet
- MANUAL: Aging breakdown
- MANUAL: Commentary

## J.14 Notes 8A, 8B, 8C — Tableaux d'Étalement

**Note 8A — Tableau d'étalement des charges immobilisées**:
Three sub-tables for: Frais d'établissement | Primes de remboursement des obligations | Charges à répartir sur plusieurs exercices
Each sub-table: Account numbers used + Amounts + Duration retained + Annual amounts per year from 2018 to 2022+
TOTAL GÉNÉRAL

**Note 8B — Tableau d'étalement des provisions pour charges à répartir**:
Account 791 (Reprises) | Duration | Annual amounts | Account transitoire 4752

**Note 8C — Tableau d'étalement des provisions pour engagements de retraite**:
Account 6911 (Dotations) | Duration | Annual amounts | Account transitoire 4752

**Population**:
- MANUAL: All three notes are entirely manual
- These notes are N/A for most companies unless they have specific deferred charge arrangements from the 2018 SYSCOHADA revision transition
- Typically mark as N/A unless account 4752 (compte transitoire) has a balance

## J.15 Note 9 — Titres de Placement

**Structure**: Table
Rows: Titres de trésor et bons de caisse à court terme | Actions | Obligations | Bons de souscription | Titres négociables hors régions | Intérêts courus | Autres valeurs assimilées
TOTAL BRUT TITRES | Dépréciations des titres | TOTAL NET

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: From accounts 501,502,503,504,505,506,507,508 and depreciations 591-598
- AUTOMATIC: TOTAL NET validated against BQ on Balance Sheet
- MANUAL: Commentary

## J.16 Note 10 — Valeurs à Encaisser

**Structure**: Table
Rows: Effets à encaisser | Effets à l'encaissement | Chèques à encaisser | Chèques à l'encaissement | Cartes de crédit à encaisser | Autres valeurs à encaisser
TOTAL BRUT | Dépréciations | TOTAL NET

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: From accounts 511,512,513,514,515,516,517,518 and depreciations
- AUTOMATIC: TOTAL NET validated against BR on Balance Sheet
- MANUAL: Commentary

## J.17 Note 11 — Disponibilités

**Structure**: Table
Rows: Banques locales | Autres banques | Banques autres États région | Banques dépôts à terme | Banques intérêts courus | Chèques postaux | Caisses | Caisses électronique mobile | Régies d'avances et virements accréditifs | Autres établissements financiers | Établissements financiers intérêts courus | Instruments de trésorerie
TOTAL BRUT DISPONIBILITÉS | Dépréciations | TOTAL NET

Columns: Année N | Année N-1 | Variation %

Note: Banques et intérêts courus and établissements financiers intérêts courus figure here as NEGATIVE if the principal account is debtor

**Population**:
- AUTOMATIC: From accounts 521,522,523,524,525,526,531,532,541,551,552,571,572,573,574,575,576,578 and depreciations
- AUTOMATIC: TOTAL NET validated against BS on Balance Sheet
- MANUAL: Individual bank account names (optional additional detail)
- MANUAL: Commentary

## J.18 Note 12 — Écarts de Conversion et Transferts de Charges

**Structure**: Two parts

**Part 1 — Écarts de conversion**:
Two sub-sections: ÉCART DE CONVERSION ACTIF and ÉCART DE CONVERSION PASSIF
For each: detail table listing the foreign currency receivables/payables involved
Columns: Devise | Montant en devises | Cours UML années acquisition | Cours UML 31/12/N | Variation en valeur absolue

**Part 2 — Transferts de charges**:
Rows: Transferts de charges d'exploitation (detail by nature) | Transferts de charges financières (detail by nature)
Columns: Rubrique | Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: Écart de conversion Actif total from account 476 (validated against BU on Balance Sheet)
- AUTOMATIC: Écart de conversion Passif total from account 477 (validated against DV on Balance Sheet)
- AUTOMATIC: Transferts exploitation total from account 781 (validated against TI on Income Statement)
- AUTOMATIC: Transferts financiers total from account 787 (validated against TM on Income Statement)
- MANUAL: Currency details for each item (which currency, historical rate, closing rate)
- MANUAL: Nature description for each transfer of charges

## J.19 Note 13 — Capital: Valeur Nominale des Actions ou Parts

**Structure**: Two parts

**Part 1 — Share capital detail table**:
Header field: Valeur Nominale: [amount in selected currency per share]
Columns: Nom et Prénoms | Nationalité | Nature des actions ou parts (ordinaires/préférences) | Nombre | Montant total | Cession ou remboursement en cours de l'exercice
TOTAL row

**Part 2 — Apporteurs capital non appelé**: single amount line

**Population**:
- AUTOMATIC: TOTAL capital validated against CA on Balance Sheet
- AUTOMATIC: Capital non appelé validated against CB on Balance Sheet
- MANUAL: Par value per share (valeur nominale)
- MANUAL: Individual shareholder rows (name, nationality, share class, number of shares)

## J.20 Note 14 — Primes et Réserves

**Structure**: Table
Rows: 
PRIMES: Prime d'émission | Prime d'apport | Prime de fusion | Prime de conversion | Autres primes | TOTAL PRIMES
RÉSERVES INDISPONIBLES: Réserves légales | Réserves statutaires | Réserves plus-values nettes LT | Réserves attribution gratuite actions | Autres réserves réglementées | TOTAL RÉSERVES INDISPONIBLES
Réserves libres | Report à nouveau | TOTAL

Columns: Année N | Année N-1 | Variation en valeur absolue

**Population**:
- AUTOMATIC: Primes from account 105 sub-accounts (1051-1058)
- AUTOMATIC: Réserves indisponibles from accounts 111,112,113 sub-accounts
- AUTOMATIC: Réserves libres from account 118
- AUTOMATIC: Report à nouveau from account 12
- AUTOMATIC: All totals validated against CD, CF, CG, CH on Balance Sheet
- AUTOMATIC: Variations computed
- MANUAL: Commentary on significant movements

## J.21 Note 15A — Total Subventions et Provisions Réglementées

**Structure**: Two tables

**Table 1 — Subventions d'investissement** (by grantor):
Rows: État | Régions | Département | Communes et collectivités | Entités publiques ou mixtes | Entités et organismes privés | Organismes internationaux | Autres | Total subventions

**Table 2 — Provisions réglementées**:
Rows: Amortissements dérogatoires | Plus-values de cession à réinvestir | Provision spéciale de réévaluation 3E | Provisions réglementées relatives aux immobilisations | Provisions relatives aux stocks | Provision pour investissement | Autres provisions et fonds réglementés | Total provisions réglementées

TOTAL SUBVENTIONS ET PROVISIONS RÉGLEMENTÉES

Columns: Année N | Année N-1 | Échéances | Variation en valeur absolue | Variation % | Note | Régime fiscal

**Population**:
- AUTOMATIC: Table 1 total from account 14 validated against CL on Balance Sheet
- AUTOMATIC: Table 2 total from account 15 validated against CM on Balance Sheet
- MANUAL: Breakdown by grantor for Table 1
- MANUAL: Breakdown by type for Table 2
- MANUAL: Maturities (échéances) and tax regime for each line

## J.22 Note 15B — Autres Fonds Propres

**Structure**: Table
Rows: Titres participatifs | Avances conditionnées | TSDI | ORA | Autres
TOTAL AUTRES FONDS PROPRES

Columns: Année N | Année N-1 | Variation en valeur absolue | Variation % | Échéances

**Population**:
- AUTOMATIC: From accounts 181,182,183,184
- MANUAL: Terms and conditions of each instrument
- Typically N/A for most standard companies

## J.23 Note 16A — Dettes Financières et Ressources Assimilées

**Structure**: Three sections

**Section 1 — Emprunts et dettes financières**:
Rows: Emprunts obligataires | Emprunts établissements crédit | Avances reçues de l'État | Avances reçues et comptes courants bloqués | Dépôts et cautionnements reçus | Intérêts courus | Avances assorties conditions particulières | Autres emprunts et dettes | Dettes liées participations | Comptes permanents bloqués établissements et succursales | TOTAL EMPRUNTS ET DETTES FINANCIÈRES

**Section 2 — Dettes de location-acquisition**:
Rows: Crédit-bail immobilier | Crédit-bail mobilier | Location-vente | Intérêts courus | Autres dettes location-acquisition | TOTAL DETTES LOCATION-ACQUISITION

**Section 3 — Provisions pour risques et charges**:
Rows: Litiges | Garanties clients | Pertes marchés | Pertes change | Impôts | Pensions et obligations similaires | Actif du régime de retraite | Restructuration | Amendes et pénalités | Propre assureur | Démantèlement et remise en état | Droits à déduction | Autres provisions | TOTAL PROVISIONS POUR RISQUES ET CHARGES

Columns: Créances à 1 an ou plus | 1-2 ans | +2 ans | Année N | Année N-1 | Variation | Variation %

**Population**:
- AUTOMATIC: Section 1 from accounts 161-166,181-184 validated against DA on Balance Sheet
- AUTOMATIC: Section 2 from account 17 validated against DB on Balance Sheet
- AUTOMATIC: Section 3 from account 19 validated against DC on Balance Sheet
- MANUAL: Aging breakdown per row
- MANUAL: Individual loan terms and conditions
- MANUAL: Commentary

## J.24 Notes 16B, 16B bis, 16C — Retirement & Contingencies

**Note 16B — Hypothèses actuarielles et variation de l'obligation de retraite**:
Table 1 — Hypothèses actuarielles: Taux d'augmentation salaires | Taux d'actualisation | Taux d'inflation | Probabilité présence | Probabilité vie | Taux rendement actifs
Table 2 — Variation de l'obligation: Obligation ouverture | Coût services | Coût financier | Pertes actuarielles | Prestations payées | Coûts passés | Obligation clôture
Table 3 — Analyse de sensibilité: Variations of ±% on taux actualisation, taux salaires, taux départ

**Note 16B bis — Actifs du régime**:
Table: Actions | Obligations | Autres | TOTAL
Columns: Rendement attendu | Juste valeur actifs (N and N-1)
Actif/Passif net comptable: Excédent/Déficit du régime

**Note 16C — Actifs et passifs éventuels**:
ACTIF ÉVENTUEL: Litiges | other items
PASSIF ÉVENTUEL: Litiges | other items
Columns: Année N | Année N-1

**Population**:
- MANUAL: All three notes are entirely manual
- 16B and 16B bis require actuarial study — data provided by external actuary
- 16C requires legal assessment — data provided by company's legal counsel

## J.25 Note 17 — Fournisseurs d'Exploitation

**Structure**: Two tables

**Table 1 — Dettes fournisseurs**:
Rows: Fournisseurs dettes en compte hors groupe | Fournisseurs sous-traitants | Réserve de propriété | Retenue de garantie | Effets à payer hors groupe | Dettes et effets à payer groupe | Acquisitions courantes d'immobilisations | Factures non parvenues hors groupe | Factures non parvenues groupe | TOTAL FOURNISSEURS

**Table 2 — Fournisseurs débiteurs (ACTIF)**:
Rows: Avances et acomptes hors groupe | Avances et acomptes groupe | Sous-traitants avances | Créances emballages | RRR à obtenir | TOTAL FOURNISSEURS DÉBITEURS

Columns: Année N | Année N-1 | Variation % | Créances ≤1 an | 1-2 ans | >2 ans

**Population**:
- AUTOMATIC: Table 1 from accounts 401,402,403,404,405,406,407,408 validated against DJ on Balance Sheet
- AUTOMATIC: Table 2 from account 409 validated against BH on Balance Sheet
- MANUAL: Aging breakdown
- MANUAL: Commentary

## J.26 Note 18 — Dettes Fiscales et Sociales

**Structure**: Two sections

**Dettes sociales**:
Rows: Personnel rémunérations dues | Congés à payer | Charges sociales sur congés | Autres personnel | Caisse de sécurité sociale | Caisse de retraite | Mutuelle de santé | Assurance retraite | Autres organismes sociaux | TOTAL DETTES SOCIALES

**Dettes fiscales**:
Rows: État impôts sur bénéfices | État impôts et taxes | État TVA | État impôts retenus à la source | Autres dettes État | TOTAL DETTES FISCALES

TOTAL DETTES SOCIALES ET FISCALES

Columns: Année N | Année N-1 | Variation | Variation % | Aging

**Population**:
- AUTOMATIC: Dettes sociales from accounts 421,422,423,424,425,426,431,432,433,434,438
- AUTOMATIC: Dettes fiscales from accounts 441,442,443,444,445,446,447,448
- AUTOMATIC: TOTAL validated against DK on Balance Sheet
- MANUAL: Aging breakdown
- MANUAL: Commentary

## J.27 Note 19 — Autres Dettes et Provisions pour Risques à Court Terme

**Structure**: Multiple sub-tables

**Créditeurs divers**: Obligataires | Rémunérations administrateurs | Versements titres placement | Compte transitoire SYSCOHADA | Autres créditeurs | TOTAL CRÉDITEURS DIVERS

**Comptes de liaison**: Non bloqués établissements | Charges et produits | Sociétés participation | TOTAL COMPTES DE LIAISON

**Dettes associés**: Opérations sur capital | Associés compte courant | Dividendes à payer | Groupe comptes courants | Autres dettes sociales | TOTAL DETTES ASSOCIÉS

**Produits constatés d'avance**: single line

TOTAL AUTRES DETTES

Columns: Année N | Année N-1 | Variation | Variation % | Aging

**Population**:
- AUTOMATIC: From accounts 46 (credit),47x (credit excluding 476,477),499
- AUTOMATIC: TOTAL validated against DM + DN on Balance Sheet
- MANUAL: Aging breakdown
- MANUAL: Commentary

## J.28 Note 20 — Banques, Crédit d'Escompte et de Trésorerie

**Structure**: Two sections

**Crédit d'escompte**:
Rows: Escomptes de crédit de campagne | Escomptes de crédit ordinaires | Total Banque crédit d'escompte

**Crédit de trésorerie**:
Rows: Banques locales | Banques autres États régions | Autres banques | Banques intérêts courus | Crédit de trésorerie | Total Banque crédit de trésorerie

TOTAL GÉNÉRAL

Note: Banques et intérêts courus figures here if the principal account is CREDITOR

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: From accounts 564,565 (validated against DQ) and 561,562,563,566,567,568 (validated against DR)
- MANUAL: Individual bank names
- MANUAL: Commentary

## J.29 Note 21 — Chiffre d'Affaires et Autres Produits

**Structure**: Table grouped by revenue type with geographic breakdown

**VENTES DE MARCHANDISES**:
Rows: Dans l'État partie | Autres États OHADA | Hors région | Groupe | Sur internet | RRR accordés (non ventilés) | TOTAL VENTES MARCHANDISES

**VENTES DE PRODUITS FABRIQUÉS**:
Same geographic rows | TOTAL VENTES PRODUITS FABRIQUÉS

**VENTES DE TRAVAUX ET SERVICES**:
Same geographic rows | TOTAL VENTES TRAVAUX ET SERVICES

**PRODUITS ACCESSOIRES** (by nature of activity):
Ports, emballages | Commissions et courtages | Locations et redevances | Bonis sur reprises emballages | Mise à disposition personnel | Redevances brevets | Services personnel | Autres | TOTAL AUTRES PRODUITS

**PRODUCTION IMMOBILISÉE**
**SUBVENTIONS D'EXPLOITATION**
**AUTRES PRODUITS**
TOTAL CHIFFRE D'AFFAIRES | TOTAL GÉNÉRAL

Columns: Année N | Année N-1 | Variation %

Note: For location-financement, provide: Résultat de la vente | Produits financiers sur investissement net | Revenus locatifs variables | Échéances loyers à recevoir (≤1 an, 1-5 ans, >5 ans)

**Population**:
- AUTOMATIC: Total revenues validated against TA, TB, TC, TD, TF, TG, TH on Income Statement
- MANUAL: Geographic breakdown per revenue category (État partie / OHADA / Hors région)
- MANUAL: Group vs third-party split
- MANUAL: Internet sales split
- MANUAL: Commentary

## J.30 Note 22 — Achats

**Structure**: Full sub-account detail table
All rows from Class 60 sub-accounts as listed in the DATA file Chart of Accounts.
Columns: Account number | Account label | Année N | Année N-1 | Variation en valeur | Variation %

**Population**:
- AUTOMATIC: ALL sub-account balances pulled directly from trial balance Class 60 accounts
- AUTOMATIC: Line totals RA, RB, RC, RD, RE, RF validated against Income Statement
- AUTOMATIC: All variations computed automatically
- No manual input required unless trial balance does not have sub-account detail (in that case, totals per REF only)

## J.31 Note 23 — Transports

**Structure**: Sub-account detail
All rows: 6120 | 6130 | 6140 | 6160 | 6181 | 6182 | 6183
Columns: Account | Label | N | N-1 | Variation

**Population**:
- AUTOMATIC: All from accounts 61x
- AUTOMATIC: Total RG validated against Income Statement

## J.32 Note 24 — Services Extérieurs

**Structure**: Sub-account detail
All rows: 6210 through 6388 (all sub-accounts of 62 and 63 as listed in DATA file)
Columns: Account | Label | N | N-1 | Variation

**Population**:
- AUTOMATIC: All from accounts 62x, 63x
- AUTOMATIC: Total RH validated against Income Statement

## J.33 Note 25 — Impôts et Taxes

**Structure**: Sub-account detail
All rows: 6411 through 6480 (all sub-accounts of 64)
Columns: Account | Label | N | N-1 | Variation

**Population**:
- AUTOMATIC: All from accounts 64x
- AUTOMATIC: Total RI validated against Income Statement

## J.34 Note 26 — Autres Charges

**Structure**: Sub-account detail
All rows: 6511 through 6598 (all sub-accounts of 65)
Columns: Account | Label | N | N-1 | Variation

**Population**:
- AUTOMATIC: All from accounts 65x
- AUTOMATIC: Total RJ validated against Income Statement

## J.35 Note 27A — Charges de Personnel

**Structure**: Sub-account detail
All rows: 6611 through 6688 (all sub-accounts of 66)
Columns: Account | Label | N | N-1 | Variation

**Population**:
- AUTOMATIC: All from accounts 66x
- AUTOMATIC: Total RK validated against Income Statement

## J.36 Note 27B — Effectifs, Masse Salariale et Personnel Extérieur

**Structure**: Complex matrix table

**Table A — Effectifs and Masse Salariale**:
Rows (qualifications):
YA: 1. Cadres supérieurs
YB: 2. Techniciens supérieurs et cadres moyens
YC: 3. Techniciens, agents de maîtrise et ouvriers qualifiés
YD: 4. Employés, manœuvres, ouvriers et apprentis
YE: TOTAL (1) — Permanents
YF: 1. Cadres supérieurs (Saisonniers)
YG: 2. Techniciens supérieurs (Saisonniers)
YH: 3. Techniciens agents maîtrise (Saisonniers)
YI: 4. Employés manœuvres (Saisonniers)
YJ: TOTAL (1) — Saisonniers
2. Personnel extérieur:
YK: Saisonniers — Facturation à l'entité
YL: TOTAL (2) — Personnel extérieur
YM: TOTAL (1+2)

Sub-columns for EFFECTIFS and MASSE SALARIALE each split by: Nationaux M | Nationaux F | Autres États UEMOA M | Autres États UEMOA F | Hors UEMOA M | Hors UEMOA F | TOTAL M | TOTAL F

YN label: M = Masculin
YO label: F = Féminin

**Table B — Montants non rapportés dans état 301**:
Amount field + reference to other notes

**Table C — Avantages en nature et en espèces**:
Amount field

**Total frais de personnel ligne RK** = A + B + C (must equal RK on Income Statement)

**Population**:
- AUTOMATIC: Total payroll (RK) from Income Statement validated as A+B+C total
- MANUAL: ALL headcount figures per row per gender per origin — requires HR records
- MANUAL: Payroll breakdown between permanent/seasonal/external
- MANUAL: Advantages en nature amounts

## J.37 Note 28A — Provisions pour Risques et Charges (Movement Table)

**Structure**: Movement table
Columns:
- A: Provisions à l'ouverture de l'exercice
- B (split into 3): Augmentations Dotations — D'exploitation | Financières | HAO
- C (split into 3): Diminutions Reprises — D'exploitation | Financières | HAO
- D = A + B − C: Provisions à la clôture de l'exercice

Rows:
PROVISIONS POUR RISQUES ET CHARGES (LONG TERME):
Litiges | Garanties clients | Pertes marchés | Pertes change | Impôts | Pensions | Restructurations | Autres
TOTAL PROVISIONS LONG TERME

PROVISIONS POUR RISQUES À COURT TERME:
Risques CT exploitation | Risques CT financiers | Risques CT HAO
TOTAL PROVISIONS CT

TOTAL GÉNÉRAL

**Population**:
- AUTOMATIC: Column A from accounts 19 and 499 in N-1 balance
- AUTOMATIC: Column D from accounts 19 and 499 in N balance
- AUTOMATIC: Column B dotations exploitation from accounts 6911,6913,6914; financières from 6971,6972; HAO from 698x
- AUTOMATIC: Column C reprises exploitation from accounts 7911,7913,7914; financières from 7971,7972; HAO from 798x
- AUTOMATIC: Column D validated against DC (long term) + DN (short term) on Balance Sheet
- MANUAL: Allocation of dotations/reprises between exploitation/financier/HAO if accounts not broken down by type
- MANUAL: Commentary on significant provisions

## J.38 Note 28B — Dépréciations des Immobilisations (Movement Table)

Same movement table structure as 28A but for impairments of immobilized assets.
Rows: All asset categories (incorporelles sub-types, corporelles sub-types, financières sub-types)
SOUS TOTAL INCORPORELLES | SOUS TOTAL CORPORELLES | SOUS TOTAL FINANCIÈRES | TOTAL DES IMMOBILISATIONS DÉPRÉCIÉES

**Population**:
- AUTOMATIC: From accounts 29x (291 through 298)
- AUTOMATIC: Opening from N-1, Closing from N, validated against Balance Sheet depreciation columns
- MANUAL: Commentary on impairment events and circumstances

## J.39 Note 28C — Autres Dépréciations (Movement Table)

Same movement table structure.
Rows: Dépréciations des stocks | Actifs circulant HAO | Fournisseurs | Clients | Autres créances | Titres de placements | Valeurs à encaisser | Disponibilités | TOTAL DES AUTRES DÉPRÉCIATIONS

**Population**:
- AUTOMATIC: From accounts 39x, 49x, 59x
- AUTOMATIC: Validated against depreciation sub-columns throughout Balance Sheet
- MANUAL: Commentary

## J.40 Note 29 — Charges et Revenus Financiers

**Structure**: Two sections

**FRAIS FINANCIERS** sub-accounts:
6711,6712,6713,6714,6722,6723,6724,6728,6730,6741,6742,6743,6744,6745,6748,6750,6760,6771,6772,6781,6782,6784,6791,6795,6798
SOUS TOTAL FRAIS FINANCIERS
Malis provenant attribution gratuite actions (separate line)
Charges pour dépréciations et provisions CT financières (from Note 28A)

**REVENUS FINANCIERS** sub-accounts and rows:
Intérêts prêts et créances | Revenus participations | Escomptes obtenus | Revenus placements | Gains change | Gains cessions titres placement | Gains risques financiers
SOUS TOTAL REVENUS FINANCIERS
Reprises charges dépréciations provisions CT financières (from Note 28A)

TOTAL GÉNÉRAL

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: All from trial balance accounts 67x and 77x
- AUTOMATIC: Totals RM, RN, TK, TR validated against Income Statement
- MANUAL: Commentary

## J.41 Note 30 — Autres Charges et Produits HAO

**Structure**: Two sections

**CHARGES HAO**:
Charges HAO constatées (831) — detail by nature (user enters descriptions)
Charges restructuration | Pertes créances HAO | Dons et libéralités accordés | Abandons créances consenties | Charges provisionnées HAO | Dotations HAO | Participation des travailleurs | Subventions d'équilibre
SOUS TOTAL AUTRES CHARGES HAO

**PRODUITS HAO**:
Produits HAO constatés (841) — detail by nature (user enters descriptions)
Opérations restructuration | Indemnités et subventions HAO | Dons obtenus | Abandons créances obtenus | Transferts charges HAO | Reprises charges provisions dépréciations HAO
SOUS TOTAL AUTRES PRODUITS HAO

TOTAL GÉNÉRAL

Columns: Année N | Année N-1 | Variation %

**Population**:
- AUTOMATIC: From accounts 81-88 validated against XH on Income Statement
- MANUAL: Detailed description of each HAO event — what it is, why it qualifies as HAO, amounts per item
- MANUAL: Commentary

## J.42 Note 31 — Répartition du Résultat et Éléments Caractéristiques des 5 Dernières Années

**Structure**: Historical table with 5 columns for fiscal years (N-4, N-3, N-2, N-1, N)
For the current filing: columns would be 2021 | 2022 | 2023 | 2024 | 2025

**STRUCTURE DU CAPITAL À LA CLÔTURE**:
Actions ordinaires | Actions à dividendes prioritaires (ADP) | Actions nouvelles à émettre (par conversion d'obligations, par exercice droit souscription)
Capital social

**OPÉRATIONS ET RÉSULTATS DE L'EXERCICE**:
Chiffre d'affaires HT | Résultat des activités ordinaires (RAO) hors dotations et reprises | Résultat net | Participation des travailleurs | Impôt sur le résultat

**RÉSULTAT ET DIVIDENDES DISTRIBUÉS**:
Résultat distribué | Dividende attribué à chaque action

**PERSONNEL ET POLITIQUE SALARIALE**:
Effectif moyen propre | Effectif moyen personnel extérieur | Masse salariale distribuée | Avantages sociaux versés | Personnel extérieur facturé

**Population**:
- AUTOMATIC: Current year column (N = 2025) pulled entirely from current filing data
- AUTOMATIC: Prior year column (N-1 = 2024) pulled from N-1 trial balance and prior filing where available
- MANUAL: Years N-4, N-3, N-2 (2021, 2022, 2023) — user enters from historical records
- MANUAL: Any N-1 data not available from trial balance (headcount, dividends)

## J.43 Note 32 — Production de l'Exercice

**Structure**: Table by product
Columns: Désignation du produit | Unité de quantité choisie | Production immobilisée (Qté + Valeur) | Vendue dans le pays (Qté + Valeur) | Vendue autres pays OHADA (Qté + Valeur) | Vendue hors OHADA (Qté + Valeur)
NON VENTILÉ row | TOTAL row

**Population**:
- AUTOMATIC: Total values cross-referenced against TB, TC, TF on Income Statement
- MANUAL: All quantity data, product names, units, geographic breakdown — requires operational records

## J.44 Note 33 — Achats Destinés à la Production

**Structure**: Table by raw material
Columns: Désignation des matières et produits | Unité de quantité | Achetés dans l'État (Qté + Valeur) | Achetés autres États OHADA (Qté + Valeur) | Importés hors OHADA (Qté + Valeur) | Variation de stock (Valeur)
NON VENTILÉS row | TOTAL row

**Population**:
- AUTOMATIC: Total purchase values cross-referenced against RC, RE on Income Statement
- MANUAL: All quantity data, material names, units, geographic origin — requires procurement records

## J.45 Note 34 — Analyse d'Activité — 100% AUTOMATIC

**Structure**: Three sections (all computed from financial statements)

**SOLDES INTERMÉDIAIRES DE GESTION**:
Chiffre d'affaires (=XB) | Marge commerciale (=XA) | Valeur ajoutée (=XC) | EBE (=XD) | Résultat d'exploitation (=XE) | Résultat financier (=XF) | Résultat des activités ordinaires (=XG) | Résultat HAO (=XH) | Résultat net (=XI)
Columns: Année N | Année N-1 | Variation %

**DÉTERMINATION DE LA CAFG**:
EBE (+) | VCN cessions courantes compte 654 (+) | Produits cessions courantes compte 754 (−) | = CAFG Exploitation
+ Revenus financiers | + Gains change financiers | + Transferts charges financières | + Produits HAO | + Transferts charges HAO
− Frais financiers | − Pertes change financières | − Charges HAO | − Participations travailleurs | − Impôts résultats
= CAPACITÉ D'AUTOFINANCEMENT GLOBAL (CAFG) (validated against FA in TFT)
− Distribution dividendes opérés durant l'exercice (account 465 movements)
= AUTOFINANCEMENT
Columns: N and N-1

**ANALYSE DE LA STRUCTURE FINANCIÈRE**:
Capitaux propres et ressources assimilées (=CP) | + Dettes financières (=DD) | = Ressources stables (=DF)
− Actif immobilisé (=AZ) | = FONDS DE ROULEMENT (1)

Actif circulant d'exploitation (=BK adjusted) | − Passif circulant d'exploitation (=DP adjusted) | = BESOIN DE FINANCEMENT D'EXPLOITATION (2)
Actif circulant HAO (=BA) | − Passif circulant HAO (=DH) | = BESOIN DE FINANCEMENT HAO (3)
BESOIN DE FINANCEMENT GLOBAL (4) = (2) + (3)
TRÉSORERIE NETTE (5) = (1) − (4)
CONTRÔLE: TRÉSORERIE NETTE = BT − DT (must equal — flagged if not)

**ANALYSE DE LA VARIATION DE LA TRÉSORERIE**:
Flux opérationnels (=ZB) | − Flux investissement (=ZC) | + Flux financement (=ZF) | = Variation trésorerie nette (=ZG)

**ANALYSE DE L'ENDETTEMENT FINANCIER NET**:
Endettement financier brut = DA + DB + DT | − Trésorerie actif (=BT) | = ENDETTEMENT FINANCIER NET

**RATIOS**:
Rentabilité économique = XE / (CP + DA + DB) [expressed as %]
Rentabilité financière = XI / CP [expressed as %]
Columns: N and N-1

**Population**:
- 100% AUTOMATIC: Every single figure computed from already-generated financial statements
- Zero manual input required
- Any failed cross-check flagged as a warning (e.g., if Trésorerie nette (5) ≠ BT − DT)

## J.46 Note 35 — Informations Sociales, Environnementales et Sociétales

**Structure**: Free-form narrative text organized in labeled sections:

**INFORMATIONS SOCIALES**:
Emploi: effectif total et répartition, embauches et licenciements, rémunérations
Relations sociales: organisation dialogue social, bilan accords collectifs
Santé et sécurité: conditions de travail, bilan accords signés
Formation: politiques formation, nombre total heures
Égalité de traitement: mesures femmes/hommes, insertion personnes handicapées

**INFORMATIONS ENVIRONNEMENTALES**:
Politique générale: organisation, démarches certification, formation salariés
Pollution et gestion déchets: mesures prévention rejets, recyclage, nuisances sonores
Utilisation durable ressources: consommation eau, matières premières, énergie
Changement climatique: rejets gaz à effet de serre
Biodiversité: mesures préservation

**ENGAGEMENTS SOCIÉTAUX**:
Impact territorial: emploi régional, populations riveraines
Relations parties prenantes: conditions dialogue, partenariats mécénat
Sous-traitance et fournisseurs: politique d'achat responsable

**Population**:
- AUTOMATIC: Note pre-marked N/A if company headcount (from Note 27B) < 250 employees
- MANUAL: All narrative text entered by user — mandatory only if headcount ≥ 250

## J.47 Note 36 — Table des Codes

**Structure**: Reference tables (static — no input needed)

Table 1 — Code forme juridique (from DATA file)
Table 2 — Code régime fiscal (from DATA file)
Table 3 — Code pays du siège social (from DATA file)
Table 4 — Codes activités économiques — full nomenclature (from DATA file)

**Population**:
- 100% AUTOMATIC: Pre-loaded from DATA file reference tables
- No input required — this is a static reference page printed as-is in the liasse

---

# PART K — DGI COMPLEMENTARY STATES (Pages 65–68)

## K.1 Structure
Four pages titled "ÉTAT COMPLÉMENTAIRE DIRECTION GÉNÉRALE DES IMPÔTS / COMPTABILITÉ NATIONALE — DETAIL DES CHARGES EN GNF [currency]"

The title "EN GNF" updates automatically to reflect the selected currency.

**Page 1/4**: RA sub-accounts (6011–6019) → RB (6031) → RC (6021–6029) → RD (6032) → RE (6041–6059, 6081–6089) → RF (6033) → RG (6120–6183) → RH start (6210–6248)

**Page 2/4**: RH continued (6251–6388) → RI (6411–6480)

**Page 3/4**: RJ (6511–6598) → RK (6611–6688) → RM start (6711–6760)

**Page 4/4**: RM continued (6771–6798) → RL (6812,6813,6911,6913,6914) → RN (6971,6972) → TOTAL DES CHARGES ORDINAIRES

## K.2 Columns
Account number | Account label | Année N | Année N-1 | Variation en valeur (N−N-1) | Variation en % ((N−N-1)/N-1 × 100)

## K.3 Population
- 100% AUTOMATIC: Every sub-account balance pulled directly from trial balance Class 6 accounts
- AUTOMATIC: All N values from N trial balance, all N-1 values from N-1 trial balance
- AUTOMATIC: All absolute variations and percentage variations computed
- AUTOMATIC: Each Income Statement line subtotal (RA, RB, RC, RD, RE, RF, RG, RH, RI, RJ, RK, RM, RL, RN) shown as a bolded sub-total row validated against Income Statement — any discrepancy flagged
- AUTOMATIC: TOTAL DES CHARGES ORDINAIRES = sum of all charge lines
- No manual input required for these 4 pages

---

# PART L — GLOBAL VALIDATION & CONTROLS DASHBOARD

## L.1 Mandatory Control Checks (C01–C13) — Export blocked if ANY fails

| ID | Control Name | Formula / Rule | Blocking Message |
|---|---|---|---|
| C01 | Bilan équilibré | BZ = DZ | DÉSÉQUILIBRE BILAN: difference = [amount] |
| C02 | Résultat cohérent | XI (Compte de Résultat) = CJ (Bilan Passif) | RÉSULTAT INCOHÉRENT: CR=[x] Bilan=[y] écart=[z] |
| C03 | TFT réconcilié | ZH = (BT−DT)_N adjusted | TFT NON RÉCONCILIÉ: ZH=[x] Contrôle=[y] écart=[z] |
| C04 | Balance N équilibrée | Total débit N = Total crédit N | BALANCE N DÉSÉQUILIBRÉE: écart=[amount] |
| C05 | Balance N-1 équilibrée | Total débit N-1 = Total crédit N-1 | BALANCE N-1 DÉSÉQUILIBRÉE: écart=[amount] |
| C06 | Immob brutes cohérentes | Note 3A total G = AZ gross column | ÉCART IMMOB BRUTES: Note3A=[x] Bilan=[y] |
| C07 | Amortissements cohérents | Note 3C total D = AZ amort column | ÉCART AMORTISSEMENTS: Note3C=[x] Bilan=[y] |
| C08 | Provisions cohérentes | Note 28A total D = DC + DN | ÉCART PROVISIONS: Note28A=[x] Bilan=[y] |
| C09 | Stocks cohérents | Note 6 total net = BB | ÉCART STOCKS: Note6=[x] Bilan=[y] |
| C10 | Clients cohérents | Note 7 total net = BI | ÉCART CLIENTS: Note7=[x] Bilan=[y] |
| C11 | FIRD complet | All mandatory FIRD fields filled (D.1–D.8) | FIRD INCOMPLET: [list of missing fields] |
| C12 | Notes applicables renseignées | No note marked Applicable left entirely empty | NOTES VIDES: [list of applicable but empty notes] |
| C13 | Analyse financière cohérente | Note 34 trésorerie nette = BT−DT | ANALYSE NOTE34 INCOHÉRENTE |

## L.2 Warning Checks (W01–W09) — Non-blocking, shown as orange warnings

| ID | Warning Name | Condition Triggering Warning |
|---|---|---|
| W01 | Capitaux propres négatifs | CP < 0 |
| W02 | Chiffre d'affaires nul | XB = 0 |
| W03 | Changement de signe du résultat | Sign(XI_N) ≠ Sign(XI_N-1) |
| W04 | Soldes anormaux | Any account with abnormal balance identified in E.5 Check 4 |
| W05 | Comparatif N-1 absent | Any major statement line: N ≠ 0 but N-1 = 0 |
| W06 | HAO significatif | |XH| > 20% of |XG| |
| W07 | Remplacements manuels présents | Any mapping override logged in F.4 |
| W08 | Note 35 vide | Headcount ≥ 250 (from Note 27B) but Note 35 not filled |
| W09 | Lignes TFT saisies manuellement | FF, FG, FH, FO, FP, FQ entered manually (not from note/movement data) |

## L.3 Controls Dashboard Screen
- Full table of all 13 mandatory checks (C01–C13) and 9 warning checks (W01–W09)
- Color: GREEN = passed | RED = failed blocking | ORANGE = warning
- For each failed mandatory check: exact values shown, formula displayed, difference amount highlighted
- Click any check row → navigate directly to the source page/field causing the failure
- Real-time update: every check recomputes automatically whenever any data changes anywhere
- Export button state: GREY/DISABLED if any C check is RED; GREEN/ENABLED only when all C checks are GREEN
- Warning count badge shown on export button even when enabled: "Export (3 warnings)"

---

# PART M — REVIEW MODE (FULL LIASSE PREVIEW)

## M.1 Preview Engine
- The preview renders the actual `Liasse_des_Etats_Financiers.pdf` template with all data overlaid at exact field positions
- User sees precisely what will be printed — 68 pages rendered faithfully in the browser
- Data is injected at the precise coordinates of each fillable field on the template
- Static content (all labels, borders, page numbers, official headers) from the original PDF — completely unchanged
- Dynamic content (all company data, all financial figures) overlaid at correct positions per the template field map

## M.2 Sidebar Navigation
Left sidebar shows the complete page index:
- Page 1: Page de Garde
- Pages 3–4: FIRD 1
- Page 5: FIRD 2
- Page 6: FIRD 3
- Page 7: Bilan Actif (Page 1/2)
- Page 8: Bilan Passif (Page 2/2)
- Page 9: Bilan Paysage (Page 1/1)
- Page 10: Compte de Résultat
- Page 11: Tableau de Flux de Trésorerie
- Page 12: FRNA (checklist)
- Pages 13–62: Note 1 through Note 35
- Page 63: Note 36 Table des codes
- Page 64: Codes activités économiques
- Pages 65–68: États complémentaires DGI (1/4 through 4/4)

Status indicators on each page in sidebar:
- Green dot: complete, all controls passing
- Orange dot: has warnings (W checks)
- Red dot: has blocking errors (C checks)
- Grey dot: marked N/A

## M.3 Inline Editing
- User can click any data field in the preview to edit it directly
- Edited cells highlighted in yellow with a pencil icon overlay
- Editing in preview triggers immediate cascading recalculation of all dependent values
- Dependent values that change because of an edit highlighted in blue (cascade effect visible)
- MANUAL: All final adjustments made in preview mode

## M.4 Print Preview
- Before exporting, user clicks "Print Preview" button
- App shows exact page breaks as they will appear when printed
- User can zoom in to 150% or 200% on any page to verify detail
- Each page header shows: company name | NIF | exercise | Page X/68

---

# PART N — EXPORT

## N.1 Pre-Export Checklist (fully automatic verification)
App verifies all of the following before enabling export:
- All 13 mandatory controls (C01–C13) are GREEN
- All notes marked Applicable have at least some content entered
- FIRD is 100% complete (all mandatory fields in D.1–D.8)
- At least one export format selected by user
- User has clicked through the preview at least once (confirmation checkbox)

If all conditions met: "Export" button activates and turns green
If any condition fails: button remains locked and the specific unmet condition is shown

## N.2 Export Format Selection
User selects one or more options (multiple allowed):
- PDF — official DGI liasse, 68 pages, print-ready, pixel-perfect match to template
- Excel — populated version of Etats_Financiers.xlsm
- Both PDF + Excel — recommended for submission (PDF) + internal records (Excel)
- MANUAL: User selects desired format(s)

## N.3 PDF Generation
- Backend takes the original `Liasse_des_Etats_Financiers.pdf` as the base template
- Uses the pre-mapped field coordinate system to inject each value at its exact position on each page
- Applies all SYSCOHADA formatting rules:
  - Zero amounts → "−" (en dash)
  - Negative amounts → (1,234,567) in parentheses
  - Positive amounts → 1,234,567 with thousands separators per currency convention
  - Currency code in all column headers
  - Company name, sigle, NIF, address, dates in every page header
  - Page numbers "Page X / 68" maintained from template
- N/A notes: pages preserved in PDF with N/A checkbox marked, amount cells left blank
- Output: single PDF file of exactly 68 pages, identical layout to official DGI template
- AUTOMATIC: Entire generation without user input

## N.4 Excel Generation
- Backend populates the `Etats_Financiers.xlsm` template
- All computed values written to correct cells per the template structure
- Formulas preserved in template cells that contain them
- Same SYSCOHADA formatting rules applied
- Output: .xlsm file ready for download
- AUTOMATIC: Entire generation without user input

## N.5 Download
- Both files available for immediate download via download links shown after generation
- Download links remain accessible for 30 days from the filing history screen
- Files also permanently saved to the filing history with the filing record
- MANUAL: User clicks download link(s)

## N.6 Post-Export Automatic Record
App automatically records in filing history:
- Company name and NIF
- Fiscal year filed
- Export date and exact time
- Format(s) exported (PDF / Excel / Both)
- Version number (1 for first export, incremented by 1 for each amendment re-export)
- User ID who performed the export
- SHA-256 hash of the generated PDF for file integrity verification
- AUTOMATIC: All recorded without any user action

---

# PART O — AMENDMENT & MULTI-YEAR MANAGEMENT

## O.1 Amending a Filed Return
- User opens any past filing from the filing history screen
- All data loaded exactly as it was at the time of the last export
- User makes any corrections anywhere in the application (trial balance, notes, FIRD, mappings)
- Every correction triggers the full cascading recalculation chain
- All controls re-run automatically after every change
- User goes through the preview and export process again
- New export automatically saved as Version 2 (or 3, 4, etc.)
- All previous versions permanently preserved and individually accessible
- AUTOMATIC: Version control, recalculation cascade, history preservation
- MANUAL: Specific corrections entered by user

## O.2 Multi-Year Continuity
When starting a new fiscal year filing for a company that has a prior year filing:
- App detects prior year filing automatically
- App offers "Import prior year data" option with preview of what will be imported
- If accepted, app automatically carries forward:
  - N-1 closing trial balance → used as N-1 comparative data for all statements and notes
  - All N-1 financial statement values pre-populate N-1 columns throughout
  - Company identification (FIRD) pre-populated from prior year (all fields editable)
  - Note 31 historical data shifted forward: prior N-4 becomes new N-5 (dropped), prior N-3 becomes N-4, etc.
  - Prior year N-1 columns serve as current year N-1 automatically
- AUTOMATIC: All carry-forward logic executed instantly upon user confirmation
- MANUAL: User confirms the import and reviews/updates FIRD fields for the new year

## O.3 Multi-Company Support
- Application supports unlimited companies under one user account
- Each company has its own isolated profile and complete filing history
- Company selector visible in the main navigation at all times
- All data completely isolated between companies — no cross-contamination
- User can switch between companies freely from the navigation
- AUTOMATIC: Company isolation enforced at the data level

---

# PART P — COMPLETE AUTOMATIC vs MANUAL REFERENCE

## P.1 — 100% Automatic (zero user input required)
- All financial statement line calculations and cascade subtotals (every XA through XI, AD through BZ, CA through DZ, ZA through ZH)
- All 13 mandatory control checks and 9 warning checks, running continuously in real-time
- Currency propagation from FIRD to every field, header, column label, and export
- Page header population on all 68 pages (company name, NIF, dates, duration, sigle)
- Account-to-statement mapping execution from trial balance
- Gross / amortization / net separation for all ACTIF immobilisé lines
- Debit/credit direction rules application for all accounts
- All percentage calculations and variation computations in all notes
- Note 34 — every single ratio, SIG, structure analysis, and cash flow analysis
- DGI Complementary States — all 4 pages, all sub-accounts, all variations
- Notes 22–29 sub-account population from Class 6 trial balance accounts
- Notes 28A, 28B, 28C — opening/closing from trial balances, dotations/reprises from accounts
- Note 6 — all stock amounts from accounts 31–39
- Note 11 — all cash amounts from accounts 52–57
- Balance Sheet total validations in Notes 4, 5, 6, 7, 8, 9, 10, 11, 17, 18, 19, 20
- PDF template field injection and complete PDF generation
- Excel template population and generation
- Session auto-saving on every navigation action
- Post-export filing history recording including version control and file hash
- N-1 carry-forward for multi-year continuity
- Pre-suggestion of N/A note status based on trial balance data patterns
- All sorting, aggregation, subtotaling, and formatting of financial data

## P.2 — Mostly Automatic (user reviews and confirms, can override)
- Account mapping: auto-mapped from rules, user reviews in mapping screen
- Depreciation matching to assets: auto-matched by account numbering convention, user verifies
- Note 3C amortization movements: opening and closing auto, dotations auto, user verifies per-category allocation
- TFT investment lines (FF, FG, FH): auto when Note 3A filled, otherwise user enters
- TFT financing movement lines (FL, FN, FO, FP, FQ): auto when movement columns provided in trial balance, otherwise user enters
- Notes 4, 5, 7, 8, 9, 10, 17, 18, 19, 21: amounts auto from accounts, user adds aging breakdowns and geographic splits
- FIRD notes applicability checklist: app suggests N/A status, user makes every final decision
- Unknown account resolution: app flags all unknowns, user decides how each one is remapped

## P.3 — 100% Manual (cannot be automated, requires user knowledge)
- All FIRD identification fields (company name, NIF, address, legal form, directors, shareholders, bank accounts, signatory, auditor)
- Currency selection (though GNF is pre-selected as default)
- Note 1 — guarantee details (hypothèques, nantissements, gages) and off-balance-sheet commitments
- Note 2 — specific accounting methods, depreciation rates, inventory method, derogations
- Note 3A — acquisition amounts, disposal amounts, reclassifications during the year
- Note 3B — all leased asset details and movements
- Note 3D — sale prices of each disposed asset
- Note 3E — revaluation details, method, amounts, tax treatment
- Note 4 Part 2 — subsidiary percentage held, their equity, their result, dividends received
- Note 12 — currency breakdown, historical rates, closing rates for each foreign currency item
- Note 13 — par value per share, individual shareholder details, share classes
- Note 15A — subvention grantor breakdown, tax regime per item
- Note 16A — individual loan terms, maturities, aging per debt line
- Note 16B, 16B bis — all actuarial data (requires external actuary)
- Note 16C — all litigation and contingency data (requires legal assessment)
- Note 27B — all headcount figures by qualification, gender, and origin (requires HR records)
- Note 30 — description of each HAO event
- Note 31 — historical years N-4, N-3, N-2 data
- Note 32 — all production quantities and geographic breakdown
- Note 33 — all purchase quantities and geographic origin
- Note 35 — all social, environmental, societal narrative text (if headcount ≥ 250)
- All commentary fields throughout all notes
- Resolution of any failed mandatory control check
- Final review confirmation before export
- Export format selection
- Download action

---

# PART Q — TECHNOLOGY STACK RECOMMENDATION

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Interactive forms, statement viewer, PDF preview overlay |
| UI Components | Tailwind CSS + shadcn/ui | Consistent design system |
| State Management | Zustand or Redux | Complex cascading recalculation state |
| Backend | Node.js (Express) or Python (FastAPI) | Mapping engine, calculations, validation |
| Database | PostgreSQL | Company profiles, trial balances, filing sessions, history |
| PDF Engine | pdf-lib (Node) or PyPDF2/ReportLab (Python) | Field injection into existing PDF template |
| Excel Engine | ExcelJS (Node) or openpyxl (Python) | Populating Etats_Financiers.xlsm |
| File Storage | AWS S3 or equivalent | Storing generated PDFs, Excel files, uploaded balances |
| Authentication | JWT + bcrypt | User accounts, company access control |
| Session Storage | Redis | Auto-save session state, real-time recalculation cache |

---

END OF MASTER PROMPT

This prompt is complete and self-contained. The DATA file contains all reference data needed (account mappings, chart of accounts, codes tables, PDF page structure). Together they form the full specification for the SYSCOHADA Financial Statements Web Application.