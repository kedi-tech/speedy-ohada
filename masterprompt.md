You are an expert product architect, senior full-stack engineer, UI/UX designer, financial reporting systems analyst, and OHADA/SYSCOHADA accounting workflow specialist.

I want you to build a complete bilingual web platform called:

Speedy OHADA Web

The platform must be in French and English.

French must be the default language.

The application is inspired by two existing Excel-based financial statement tools, but you must not depend on reading or importing the Excel files themselves. Instead, build the system from the complete workflow and specifications described here.

The goal is to create a professional website that allows accountants, accounting firms, auditors, consultants, and companies to generate OHADA/SYSCOHADA financial statements from trial balance data.

The platform must replace a complex Excel workflow with a seamless web experience.

The user experience should be:

Import Balance → Validate Data → Classify Accounts → Map Accounts → Generate Reports → Review → Approve → Export

The website must not feel like Excel. It should feel like a guided financial statement preparation system.

The platform must be production-ready, secure, multi-company, multi-year, multi-user, bilingual, and scalable.

==================================================
1. CORE PRODUCT DESCRIPTION
==================================================

Speedy OHADA Web is a financial statement automation platform.

It allows users to:

English:
- Create and manage companies
- Create fiscal years
- Import trial balances for the current year N
- Import trial balances for the previous year N-1
- Validate debit and credit totals
- Classify accounts based on OHADA account classes
- Map accounts to official financial statement lines
- Generate financial statements
- Generate annex notes
- Generate tax and fiscal sheets
- Review reports
- Approve reports
- Export PDF, Excel, and ZIP packages
- Archive generated reports
- Manage users, roles, organizations, subscriptions, and audit logs

French:
- Créer et gérer des sociétés
- Créer des exercices comptables
- Importer la balance de l’exercice N
- Importer la balance de l’exercice N-1
- Valider les totaux débit et crédit
- Classer les comptes selon les classes OHADA
- Affecter les comptes aux lignes officielles des états financiers
- Générer les états financiers
- Générer les notes annexes
- Générer les déclarations fiscales
- Réviser les rapports
- Approuver les rapports
- Exporter les documents en PDF, Excel et ZIP
- Archiver les rapports générés
- Gérer les utilisateurs, rôles, organisations, abonnements et journaux d’audit

The platform is not a full bookkeeping/accounting software.

It does not replace accounting software.

It takes an already-prepared trial balance and transforms it into official OHADA/SYSCOHADA financial statements.

==================================================
2. LANGUAGE REQUIREMENTS
==================================================

The platform must support two languages:

1. French
2. English

French must be the default language.

Every screen, button, label, error message, report title, status, menu item, and notification must support translation.

Use internationalization from the beginning.

Examples:

French:
- Tableau de bord
- Sociétés
- Exercices
- Balance
- Importer la balance
- Validation
- États financiers
- Actif
- Passif
- Bilan
- Compte de résultat
- Tableau des flux de trésorerie
- Notes annexes
- Déclarations fiscales
- Centre d’exportation
- Utilisateurs
- Paramètres
- Abonnement
- Rapport prêt pour exportation
- Erreur critique
- Avertissement
- Approuvé
- Verrouillé

English:
- Dashboard
- Companies
- Fiscal Years
- Trial Balance
- Import Trial Balance
- Validation
- Financial Statements
- Assets
- Liabilities
- Balance Sheet
- Income Statement
- Cash Flow Statement
- Annex Notes
- Tax Declarations
- Export Center
- Users
- Settings
- Subscription
- Report ready for export
- Critical error
- Warning
- Approved
- Locked

The language switcher must be available in the app header or user settings.

The system must store user language preference.

==================================================
3. USER TYPES AND ROLES
==================================================

The platform must support these roles:

1. Super Admin
2. Organization Admin / Accounting Firm Admin
3. Accountant
4. Reviewer / Auditor
5. Client

--------------------------------------------------
3.1 Super Admin
--------------------------------------------------

The Super Admin owns the whole platform.

Permissions:
- Manage all organizations
- Manage all users
- Manage subscription plans
- Manage licenses
- Manage report templates
- Manage OHADA mapping rules
- Manage validation rules
- View all audit logs
- Manage billing settings
- Manage platform configuration
- Access platform usage analytics

French label:
Super Administrateur

--------------------------------------------------
3.2 Organization Admin / Accounting Firm Admin
--------------------------------------------------

This user manages one accounting firm or organization.

Permissions:
- Manage organization workspace
- Invite users
- Assign roles
- Create companies
- Manage companies
- Manage fiscal years
- Assign accountants and reviewers
- View reports
- Manage exports
- Manage client access

French label:
Administrateur du Cabinet / Organisation

--------------------------------------------------
3.3 Accountant
--------------------------------------------------

The accountant prepares the financial statements.

Permissions:
- Create company files
- Create fiscal years
- Import balances
- Map accounts
- Complete notes
- Complete fiscal forms
- Generate financial statements
- Submit report for review

French label:
Comptable

--------------------------------------------------
3.4 Reviewer / Auditor
--------------------------------------------------

The reviewer verifies and approves reports.

Permissions:
- View assigned reports
- Add comments
- Request corrections
- Approve sections
- Reject sections
- Approve final package
- Lock reports if authorized

French label:
Réviseur / Auditeur

--------------------------------------------------
3.5 Client
--------------------------------------------------

The client has limited access.

Permissions:
- View approved reports
- Download final reports
- Add comments if allowed
- Approve final report if allowed

French label:
Client

==================================================
4. MAIN PLATFORM STRUCTURE
==================================================

Create the following major sections:

French navigation:
- Tableau de bord
- Sociétés
- Exercices
- Importation des balances
- Affectation des comptes
- Centre de validation
- États financiers
- Notes annexes
- Fiscalité
- Révision
- Exportation
- Archives
- Clients
- Utilisateurs
- Abonnements
- Paramètres
- Journal d’audit

English navigation:
- Dashboard
- Companies
- Fiscal Years
- Trial Balance Import
- Account Mapping
- Validation Center
- Financial Statements
- Annex Notes
- Tax
- Review
- Export
- Archives
- Clients
- Users
- Subscriptions
- Settings
- Audit Logs

==================================================
5. PUBLIC LANDING PAGE
==================================================

Create a bilingual public website for the platform.

The landing page should explain what Speedy OHADA Web does.

French default content:

Hero title:
Générez vos états financiers OHADA en quelques minutes

Hero subtitle:
Speedy OHADA Web permet aux comptables, cabinets, auditeurs et entreprises d’importer une balance, de valider les données, de générer les états financiers OHADA/SYSCOHADA et d’exporter des rapports professionnels en PDF et Excel.

English version:

Hero title:
Generate OHADA financial statements in minutes

Hero subtitle:
Speedy OHADA Web helps accountants, firms, auditors, and companies import trial balances, validate accounting data, generate OHADA/SYSCOHADA financial statements, and export professional PDF and Excel reports.

Landing page sections:

1. Hero section
2. Problem section
3. Solution section
4. How it works
5. Main features
6. Target users
7. Benefits
8. Pricing placeholder
9. FAQ
10. Contact/demo request form
11. Footer

Problem section should explain:
- Manual Excel work is complex
- Financial statements require many calculations
- Mapping accounts is time-consuming
- Errors are easy to make
- Reports need to be compliant and printable

Solution section should explain:
- Import the trial balance
- Validate automatically
- Classify accounts
- Generate financial statements
- Review and approve
- Export clean reports

How it works:

French:
1. Créez une société
2. Créez un exercice
3. Importez la balance N
4. Importez la balance N-1
5. Validez les données
6. Affectez les comptes
7. Générez les états financiers
8. Complétez les notes annexes
9. Révisez et approuvez
10. Exportez le dossier final

English:
1. Create a company
2. Create a fiscal year
3. Import Balance N
4. Import Balance N-1
5. Validate data
6. Map accounts
7. Generate financial statements
8. Complete annex notes
9. Review and approve
10. Export the final package

==================================================
6. AUTHENTICATION FLOW
==================================================

Create a complete authentication system.

Pages:
- Login
- Register
- Forgot password
- Reset password
- Email verification
- Invite user
- Accept invitation
- Logout

French labels:
- Connexion
- Créer un compte
- Mot de passe oublié
- Réinitialiser le mot de passe
- Vérification de l’email
- Invitation utilisateur
- Accepter l’invitation
- Déconnexion

English labels:
- Login
- Create account
- Forgot password
- Reset password
- Email verification
- User invitation
- Accept invitation
- Logout

After login:
- Super Admin goes to platform admin dashboard
- Organization users go to organization dashboard
- Clients go to client portal

The system must support role-based routing.

==================================================
7. DASHBOARD
==================================================

Create a clean dashboard.

Dashboard cards:

French:
- Sociétés
- Exercices actifs
- Rapports en cours
- Rapports prêts pour exportation
- Rapports avec erreurs
- Révisions en attente
- Rapports approuvés
- Exports récents

English:
- Companies
- Active fiscal years
- Reports in progress
- Reports ready for export
- Reports with errors
- Pending reviews
- Approved reports
- Recent exports

Dashboard should also show:

- Recent companies
- Recent fiscal years
- Recent validations
- Pending tasks
- Recent exports
- Warnings and alerts
- Quick actions

Quick actions:

French:
- Créer une société
- Créer un exercice
- Importer une balance
- Continuer un rapport
- Voir les validations

English:
- Create company
- Create fiscal year
- Import trial balance
- Continue report
- View validations

==================================================
8. COMPANY MANAGEMENT
==================================================

Users must be able to create and manage companies.

Company fields:

French / English:

- Nom de la société / Company name
- Raison sociale / Legal name
- Nom commercial / Commercial name
- Numéro RCCM / RCCM number
- NIF / Tax identification number
- Forme juridique / Legal form
- Secteur d’activité / Business sector
- Activité principale / Main activity
- Adresse / Address
- Ville / City
- Pays / Country
- Téléphone / Phone
- Email / Email
- Site web / Website
- Centre des impôts / Tax center
- Régime fiscal / Tax regime
- Devise / Currency
- Référentiel comptable / Accounting standard
- Logo de la société / Company logo
- Nom du dirigeant / Manager name
- Fonction du dirigeant / Manager title
- Nom du comptable / Accountant name
- Contact du comptable / Accountant contact
- Nom de l’auditeur / Auditor name
- Contact de l’auditeur / Auditor contact
- Notes / Notes

Company pages:

1. Company list
2. Create company
3. Company profile
4. Edit company
5. Company fiscal years
6. Company documents
7. Company users
8. Company settings

Company list must include:
- Search
- Filters
- Sorting
- Status badges
- Last updated date
- Assigned accountant
- Action buttons

Company status examples:

French:
- Actif
- Inactif
- Brouillon
- En cours
- Archivé

English:
- Active
- Inactive
- Draft
- In progress
- Archived

==================================================
9. FISCAL YEAR MANAGEMENT
==================================================

Each company can have multiple fiscal years.

Fiscal year fields:

French / English:

- Société / Company
- Libellé de l’exercice / Fiscal year label
- Date d’ouverture / Opening date
- Date de clôture / Closing date
- Année N / Year N
- Année N-1 / Year N-1
- Devise / Currency
- Statut / Status
- Verrouillé / Locked
- Créé par / Created by
- Révisé par / Reviewed by
- Approuvé par / Approved by
- Date d’exportation / Export date
- Notes / Notes

Fiscal year statuses:

French:
- Brouillon
- Configuration incomplète
- En attente de la balance N
- En attente de la balance N-1
- Validation de balance échouée
- Affectation des comptes requise
- Notes annexes requises
- Fiscalité requise
- Prêt pour révision
- En révision
- Approuvé
- Exporté
- Verrouillé

English:
- Draft
- Setup incomplete
- Waiting for Balance N
- Waiting for Balance N-1
- Balance validation failed
- Account mapping required
- Annex notes required
- Tax information required
- Ready for review
- Under review
- Approved
- Exported
- Locked

==================================================
10. FISCAL YEAR WORKSPACE
==================================================

This is the most important screen in the application.

The fiscal year workspace must guide the user step by step.

The workspace should show:

- Company name
- Fiscal year
- Completion percentage
- Current status
- Validation score
- Last updated date
- Assigned accountant
- Assigned reviewer
- Export readiness
- Main workflow checklist
- Alerts
- Recent activity
- Next recommended action

Workflow steps:

French:
1. Informations de la société
2. Balance N
3. Balance N-1
4. Validation des balances
5. Classification des comptes
6. Affectation des comptes
7. États financiers
8. Notes annexes
9. Fiscalité
10. Révision
11. Approbation
12. Exportation
13. Verrouillage

English:
1. Company information
2. Balance N
3. Balance N-1
4. Balance validation
5. Account classification
6. Account mapping
7. Financial statements
8. Annex notes
9. Tax
10. Review
11. Approval
12. Export
13. Locking

Each step should show a status:

French:
- Non commencé
- En cours
- Terminé
- Avertissement
- Bloqué
- Prêt pour révision
- Approuvé
- Verrouillé

English:
- Not started
- In progress
- Completed
- Warning
- Blocked
- Ready for review
- Approved
- Locked

The workspace should show a right-side panel with:

- Critical errors
- Warnings
- Missing information
- Recent comments
- Next action
- Export readiness

Example French:

Société: ABC SARL
Exercice: 2025
Progression: 72 %

Étapes:
1. Informations de la société — Terminé
2. Balance N — Terminé
3. Balance N-1 — Terminé
4. Validation des balances — Avertissement
5. Affectation des comptes — 4 comptes non affectés
6. États financiers — Générés
7. Notes annexes — 7 notes incomplètes
8. Fiscalité — En attente
9. Révision — Non commencé
10. Exportation — Bloquée

Action recommandée:
Compléter les notes annexes manquantes avant la validation finale.

Example English:

Company: ABC SARL
Fiscal year: 2025
Progress: 72%

Steps:
1. Company information — Completed
2. Balance N — Completed
3. Balance N-1 — Completed
4. Balance validation — Warning
5. Account mapping — 4 unmapped accounts
6. Financial statements — Generated
7. Annex notes — 7 incomplete notes
8. Tax — Pending
9. Review — Not started
10. Export — Blocked

Recommended action:
Complete missing annex notes before final validation.

==================================================
11. BALANCE IMPORT MODULE
==================================================

This is one of the most important modules.

The system must allow users to import:

- Balance N
- Balance N-1

Import methods:

French:
- Importer un fichier Excel
- Importer un fichier CSV
- Saisie manuelle
- Copier-coller un tableau
- Utiliser un modèle enregistré

English:
- Upload Excel file
- Upload CSV file
- Manual entry
- Copy/paste table
- Use saved template

Supported file types:
- .xlsx
- .xls
- .csv
- .xlsm as data-only import, without running macros

The system must not run Excel macros.

It only extracts table data.

Required balance columns:

French / English:

- Numéro de compte / Account number
- Libellé du compte / Account label
- Débit d’ouverture / Opening debit
- Crédit d’ouverture / Opening credit
- Mouvement débit / Movement debit
- Mouvement crédit / Movement credit
- Solde débit / Closing debit
- Solde crédit / Closing credit
- Solde net / Net balance
- Classe du compte / Account class

The system should support flexible column mapping.

Example:

French:
Colonne importée “Compte” → Numéro de compte
Colonne importée “Libellé” → Libellé du compte
Colonne importée “Débit” → Solde débit
Colonne importée “Crédit” → Solde crédit

English:
Uploaded column “Account” → Account number
Uploaded column “Label” → Account label
Uploaded column “Debit” → Closing debit
Uploaded column “Credit” → Closing credit

After upload, show a preview table.

Preview table columns:

French:
- Numéro de compte
- Libellé
- Débit
- Crédit
- Solde net
- Classe détectée
- Statut d’affectation
- Erreurs

English:
- Account number
- Label
- Debit
- Credit
- Net balance
- Detected class
- Mapping status
- Errors

Balance validation checks:

French:
- Les colonnes obligatoires sont présentes
- Les numéros de compte sont valides
- Les montants débit/crédit sont numériques
- Le total débit est égal au total crédit
- Aucun compte obligatoire n’est vide
- Les libellés sont présents
- Les doublons sont détectés
- La classe du compte est détectée
- Les valeurs anormales sont signalées
- Les soldes négatifs inhabituels sont signalés
- Les comptes non reconnus sont signalés

English:
- Required columns are present
- Account numbers are valid
- Debit/credit values are numeric
- Total debit equals total credit
- Required accounts are not empty
- Labels are present
- Duplicates are detected
- Account class is detected
- Abnormal values are flagged
- Suspicious negative balances are flagged
- Unknown accounts are flagged

If the balance is not balanced, show:

French:
- Total débit
- Total crédit
- Écart
- Lignes problématiques
- Suggestion de correction
- Bouton: Corriger les données

English:
- Total debit
- Total credit
- Difference
- Problematic lines
- Suggested correction
- Button: Fix data

Critical rule:
Do not allow final export if the trial balance has critical validation errors.

==================================================
12. OHADA ACCOUNT CLASSIFICATION
==================================================

Automatically classify accounts using OHADA/SYSCOHADA classes.

Class mapping:

Classe 1:
French: Comptes de ressources durables, capital, réserves, emprunts, dettes financières
English: Long-term resources, capital, reserves, loans, financial debts

Classe 2:
French: Comptes d’actif immobilisé, immobilisations incorporelles, corporelles et financières
English: Fixed assets, intangible assets, tangible assets, financial assets

Classe 3:
French: Comptes de stocks
English: Inventory accounts

Classe 4:
French: Comptes de tiers, clients, fournisseurs, État, personnel, organismes sociaux
English: Third-party accounts, customers, suppliers, tax, staff, social organizations

Classe 5:
French: Comptes de trésorerie, banque, caisse, instruments financiers
English: Treasury accounts, bank, cash, financial instruments

Classe 6:
French: Comptes de charges
English: Expense accounts

Classe 7:
French: Comptes de produits
English: Income/revenue accounts

Classe 8:
French: Autres comptes spéciaux selon le référentiel
English: Other special accounts according to the standard

Detection rule:
The first digit of the account number determines the account class.

Examples:
- 101000 → Classe 1
- 245000 → Classe 2
- 311000 → Classe 3
- 401000 → Classe 4
- 521000 → Classe 5
- 601000 → Classe 6
- 701000 → Classe 7
- 801000 → Classe 8

==================================================
13. ACCOUNT MAPPING ENGINE
==================================================

The system must map accounts to official report lines.

The mapping engine must support:

French:
- Affectation automatique
- Affectation manuelle
- Comptes non affectés
- Conflits d’affectation
- Modèles d’affectation
- Réutilisation des affectations
- Historique des modifications
- Motif obligatoire pour les modifications manuelles

English:
- Automatic mapping
- Manual mapping
- Unmapped accounts
- Mapping conflicts
- Mapping templates
- Reusable mappings
- Change history
- Required reason for manual changes

Accounts must be mapped to:

- Actif / Assets
- Passif / Liabilities
- Bilan / Balance Sheet
- Compte de résultat / Income Statement
- Tableau des flux de trésorerie / Cash Flow Statement
- Notes annexes / Annex Notes
- Détails des charges / Expense Details
- Déclarations fiscales / Tax Declarations

Mapping table columns:

French:
- Numéro de compte
- Libellé du compte
- Classe
- Débit
- Crédit
- Solde net
- Ligne suggérée
- Affectation actuelle
- Statut
- Action

English:
- Account number
- Account label
- Class
- Debit
- Credit
- Net balance
- Suggested line
- Current mapping
- Status
- Action

Mapping statuses:

French:
- Affecté automatiquement
- Affecté manuellement
- À vérifier
- Non affecté
- Conflit
- Exclu

English:
- Auto mapped
- Manually mapped
- Needs review
- Unmapped
- Conflict
- Excluded

Manual mapping rule:
Every manual mapping change must require a reason and must be saved in the audit log.

==================================================
14. VALIDATION CENTER
==================================================

Create a validation center that checks if the financial statement package is ready.

Validation categories:

French:
1. Validation des informations société
2. Validation de la balance N
3. Validation de la balance N-1
4. Validation de l’affectation des comptes
5. Validation des états financiers
6. Validation des notes annexes
7. Validation fiscale
8. Validation finale avant exportation

English:
1. Company information validation
2. Balance N validation
3. Balance N-1 validation
4. Account mapping validation
5. Financial statement validation
6. Annex notes validation
7. Tax validation
8. Final export validation

Severity levels:

French:
- Critique
- Avertissement
- Information
- Validé

English:
- Critical
- Warning
- Information
- Passed

Critical errors must block export.

Warnings should not block export but should be clearly displayed.

Examples of validation rules:

French:
- La balance N est manquante
- La balance N-1 est manquante
- Le total débit n’est pas égal au total crédit
- Le compte 245000 n’est pas affecté
- Le NIF de la société est manquant
- Le RCCM est manquant
- Les notes annexes sont incomplètes
- Le total Actif est différent du total Passif
- Le résultat du compte de résultat ne correspond pas au résultat du bilan
- Les informations fiscales sont incomplètes
- Une section obligatoire du rapport est vide

English:
- Balance N is missing
- Balance N-1 is missing
- Total debit does not equal total credit
- Account 245000 is unmapped
- Company tax ID is missing
- RCCM number is missing
- Annex notes are incomplete
- Total assets do not equal total liabilities
- Income statement result does not match balance sheet result
- Tax information is incomplete
- A required report section is empty

Validation center UI:

- Overall readiness percentage
- Number of critical errors
- Number of warnings
- Number of passed checks
- Grouped checklist
- Fix buttons
- Validation history
- Re-run validation button

==================================================
15. FINANCIAL STATEMENT GENERATOR
==================================================

Generate the full OHADA/SYSCOHADA financial statement package.

The system must generate these reports:

French:
1. Page de garde
2. Fiche signalétique
3. Fiche R1
4. Fiche R2
5. Dirigeants
6. Actif
7. Passif
8. Bilan
9. Compte de résultat
10. Tableau des flux de trésorerie
11. Notes annexes
12. Notes 1 à 36
13. Détails des charges
14. Déclarations fiscales
15. Patente
16. Honoraires
17. Synthèse des calculs
18. Rapport de validation
19. Dossier complet imprimable

English:
1. Cover page
2. Company identity sheet
3. R1 sheet
4. R2 sheet
5. Directors/managers
6. Assets
7. Liabilities
8. Balance sheet
9. Income statement
10. Cash flow statement
11. Annex notes
12. Notes 1 to 36
13. Expense details
14. Tax declarations
15. Business license/tax sheet
16. Fees/honorarium sheet
17. Calculation summary
18. Validation report
19. Complete printable package

Report page structure:

Each report page must show:

French:
- Titre du rapport
- Nom de la société
- Exercice
- Devise
- Valeurs N
- Valeurs N-1
- Variation
- Pourcentage de variation
- Total
- Statut de validation
- Commentaires
- Bouton aperçu
- Bouton exporter

English:
- Report title
- Company name
- Fiscal year
- Currency
- N values
- N-1 values
- Variation
- Variation percentage
- Total
- Validation status
- Comments
- Preview button
- Export button

==================================================
16. ACTIF REPORT
==================================================

The Actif report must present company assets.

French sections:
- Actif immobilisé
- Immobilisations incorporelles
- Immobilisations corporelles
- Immobilisations financières
- Actif circulant
- Stocks
- Créances clients
- Autres créances
- Trésorerie actif
- Banque
- Caisse
- Total Actif

English sections:
- Fixed assets
- Intangible assets
- Tangible assets
- Financial assets
- Current assets
- Inventory
- Customer receivables
- Other receivables
- Cash and bank assets
- Bank
- Cash
- Total assets

Columns:

French:
- Brut
- Amortissements / Provisions
- Net N
- Net N-1
- Variation

English:
- Gross
- Depreciation / Provisions
- Net N
- Net N-1
- Variation

==================================================
17. PASSIF REPORT
==================================================

The Passif report must present equity and liabilities.

French sections:
- Capitaux propres
- Capital
- Réserves
- Report à nouveau
- Résultat net de l’exercice
- Subventions
- Provisions
- Dettes financières
- Fournisseurs
- Dettes fiscales
- Dettes sociales
- Autres dettes
- Trésorerie passif
- Total Passif

English sections:
- Equity
- Capital
- Reserves
- Retained earnings
- Net result for the year
- Grants
- Provisions
- Financial debts
- Suppliers
- Tax liabilities
- Social liabilities
- Other liabilities
- Treasury liabilities
- Total liabilities and equity

Critical validation:
Total Actif must equal Total Passif.

French error:
Le total Actif est différent du total Passif.

English error:
Total assets do not equal total liabilities and equity.

==================================================
18. COMPTE DE RÉSULTAT / INCOME STATEMENT
==================================================

Generate the income statement using Classe 6 and Classe 7 accounts.

French sections:
- Produits d’exploitation
- Chiffre d’affaires
- Production immobilisée
- Autres produits d’exploitation
- Charges d’exploitation
- Achats
- Services extérieurs
- Impôts et taxes
- Charges de personnel
- Dotations aux amortissements
- Résultat d’exploitation
- Produits financiers
- Charges financières
- Résultat financier
- Résultat des activités ordinaires
- Produits hors activités ordinaires
- Charges hors activités ordinaires
- Impôts sur le résultat
- Résultat net

English sections:
- Operating revenue
- Turnover
- Capitalized production
- Other operating income
- Operating expenses
- Purchases
- External services
- Taxes
- Personnel expenses
- Depreciation expenses
- Operating result
- Financial income
- Financial expenses
- Financial result
- Result from ordinary activities
- Non-ordinary income
- Non-ordinary expenses
- Income tax
- Net result

Critical validation:
The net result from the income statement must match the result carried in the balance sheet.

==================================================
19. CASH FLOW STATEMENT
==================================================

Generate the cash flow statement from account mappings and N/N-1 variations.

French sections:
- Flux de trésorerie liés aux activités opérationnelles
- Flux de trésorerie liés aux activités d’investissement
- Flux de trésorerie liés aux activités de financement
- Variation nette de trésorerie
- Trésorerie à l’ouverture
- Trésorerie à la clôture

English sections:
- Cash flow from operating activities
- Cash flow from investing activities
- Cash flow from financing activities
- Net cash variation
- Opening cash position
- Closing cash position

If some cash flow values cannot be automatically calculated, allow manual input with required explanation.

==================================================
20. NOTES ANNEXES
==================================================

Create a complete notes annexes module.

The system must support Notes 1 to 36.

Each note should have:

French:
- Numéro de note
- Titre
- Description
- Données calculées automatiquement
- Champs de saisie manuelle
- Tableau de support
- Commentaires
- Statut
- Obligatoire ou optionnelle

English:
- Note number
- Title
- Description
- Automatically calculated data
- Manual input fields
- Supporting table
- Comments
- Status
- Required or optional

Note statuses:

French:
- Non commencée
- Pré-remplie
- À compléter
- Complétée
- À vérifier
- Validée

English:
- Not started
- Pre-filled
- To complete
- Completed
- Needs review
- Validated

The notes overview page must show:

- Total notes
- Completed notes
- Missing notes
- Notes with warnings
- Required notes
- Optional notes

The user should be able to edit notes with a rich text editor.

==================================================
21. DETAILS DES CHARGES / EXPENSE DETAILS
==================================================

Create a detailed expense module based on Classe 6 accounts.

French categories:
- Achats
- Services extérieurs
- Autres services extérieurs
- Impôts et taxes
- Charges de personnel
- Charges financières
- Dotations aux amortissements
- Dotations aux provisions
- Autres charges

English categories:
- Purchases
- External services
- Other external services
- Taxes
- Personnel expenses
- Financial expenses
- Depreciation expenses
- Provision expenses
- Other expenses

Table columns:

French:
- Numéro de compte
- Libellé
- Montant N
- Montant N-1
- Variation
- Catégorie
- Notes

English:
- Account number
- Label
- Amount N
- Amount N-1
- Variation
- Category
- Notes

==================================================
22. TAX AND FISCAL MODULE
==================================================

Create a tax and fiscal module.

French sections:
- Informations fiscales de la société
- Centre des impôts
- Régime fiscal
- NIF
- Déclaration fiscale
- Patente
- Honoraires
- Calculs fiscaux
- Récapitulatif fiscal
- Feuilles DGI

English sections:
- Company tax information
- Tax center
- Tax regime
- Tax identification number
- Tax declaration
- Business license/tax sheet
- Fees/honorarium sheet
- Tax calculations
- Tax summary
- Tax authority sheets

The fiscal module should combine:

- Data pulled from financial statements
- Manual fiscal inputs
- Tax calculation fields
- Validation checks

Tax forms must have:
- Draft status
- Completed status
- Warning status
- Approved status

==================================================
23. REVIEW AND APPROVAL WORKFLOW
==================================================

Create a review center.

Review steps:

French:
1. Révision des informations société
2. Révision de la balance
3. Révision des affectations
4. Révision de l’Actif
5. Révision du Passif
6. Révision du compte de résultat
7. Révision du tableau de flux
8. Révision des notes annexes
9. Révision fiscale
10. Validation finale
11. Approbation
12. Verrouillage

English:
1. Company information review
2. Trial balance review
3. Account mapping review
4. Assets review
5. Liabilities review
6. Income statement review
7. Cash flow review
8. Annex notes review
9. Tax review
10. Final validation
11. Approval
12. Locking

Reviewers can:

French:
- Ajouter un commentaire
- Demander une correction
- Approuver une section
- Rejeter une section
- Approuver le rapport final
- Verrouiller le rapport

English:
- Add comment
- Request correction
- Approve section
- Reject section
- Approve final report
- Lock report

Section statuses:

French:
- Non commencé
- En cours
- Correction demandée
- Prêt pour révision
- Approuvé
- Rejeté
- Verrouillé

English:
- Not started
- In progress
- Correction requested
- Ready for review
- Approved
- Rejected
- Locked

==================================================
24. EXPORT CENTER
==================================================

Create a powerful export center.

Export formats:

- PDF
- Excel
- ZIP

Optional:
- Word

Export packages:

French:
- Dossier complet des états financiers
- Bilan uniquement
- Compte de résultat uniquement
- Tableau de flux uniquement
- Notes annexes uniquement
- Déclarations fiscales uniquement
- Détails des charges uniquement
- Rapport interne de travail
- Rapport client
- Rapport de validation
- Rapport avec commentaires

English:
- Full financial statement package
- Balance sheet only
- Income statement only
- Cash flow only
- Annex notes only
- Tax declarations only
- Expense details only
- Internal working report
- Client report
- Validation report
- Report with comments

Before export:
- Run final validation
- Block export if critical errors exist
- Show warnings if they exist
- Save export record

Export record fields:

French / English:
- Type d’export / Export type
- Format / Format
- Utilisateur / User
- Date / Date
- Société / Company
- Exercice / Fiscal year
- Version / Version
- Statut de validation / Validation status
- Lien de téléchargement / Download link

==================================================
25. REPORT VERSIONING AND ARCHIVE
==================================================

The system must keep report versions.

Version statuses:

French:
- Brouillon
- En révision
- Approuvé
- Exporté
- Verrouillé
- Archivé

English:
- Draft
- Under review
- Approved
- Exported
- Locked
- Archived

Version history must show:
- Version number
- Created by
- Created date
- Status
- Change summary
- Download button
- Restore option, if allowed

==================================================
26. REPORT LOCKING
==================================================

After approval, authorized users can lock reports.

When locked:

French:
- La balance ne peut plus être modifiée
- Les affectations ne peuvent plus être modifiées
- Les notes ne peuvent plus être modifiées
- Les états financiers ne peuvent plus être modifiés
- Seuls les utilisateurs autorisés peuvent déverrouiller
- Le déverrouillage exige un motif
- L’action est enregistrée dans le journal d’audit

English:
- Trial balance cannot be changed
- Mappings cannot be changed
- Notes cannot be changed
- Financial statements cannot be changed
- Only authorized users can unlock
- Unlocking requires a reason
- The action is saved in the audit log

==================================================
27. AUDIT LOGS
==================================================

Track all important actions.

Audit log events:

- Login
- Logout
- Company created
- Company updated
- Fiscal year created
- Balance imported
- Balance deleted
- Balance re-imported
- Mapping changed
- Manual adjustment added
- Note edited
- Tax form edited
- Validation run
- Comment added
- Section approved
- Section rejected
- Report exported
- Report locked
- Report unlocked
- User invited
- Role changed
- Subscription changed

Audit log fields:

- User
- Action
- Entity type
- Entity ID
- Old value
- New value
- Reason
- Timestamp
- IP address
- Browser/device info

==================================================
28. SUBSCRIPTION AND LICENSE MANAGEMENT
==================================================

Create subscription plans.

Plans:

1. Starter
French:
- 1 société
- 1 utilisateur
- États financiers de base
- Export PDF

English:
- 1 company
- 1 user
- Basic financial statements
- PDF export

2. Professional
French:
- Plusieurs sociétés
- Plusieurs utilisateurs
- États financiers complets
- Export PDF et Excel
- Notes annexes
- Centre de validation

English:
- Multiple companies
- Multiple users
- Full financial statements
- PDF and Excel export
- Annex notes
- Validation center

3. Cabinet
French:
- Espace cabinet comptable
- Gestion multi-clients
- Collaboration équipe
- Workflow de révision
- Portail client
- Historique des versions

English:
- Accounting firm workspace
- Multi-client management
- Team collaboration
- Review workflow
- Client portal
- Version history

4. Enterprise
French:
- Limites personnalisées
- Marque blanche
- Accès API
- Support prioritaire
- Journaux d’audit avancés

English:
- Custom limits
- White label
- API access
- Priority support
- Advanced audit logs

Feature access must depend on subscription plan.

If the user does not have access, show upgrade message.

==================================================
29. DATABASE MODEL
==================================================

Create a database schema that supports:

- Multi-tenant organizations
- Users
- Roles
- Permissions
- Companies
- Fiscal years
- Trial balances
- Trial balance lines
- Account classes
- Mapping rules
- Account mappings
- Financial statement templates
- Financial statement lines
- Generated reports
- Notes annexes
- Tax forms
- Validation rules
- Validation results
- Comments
- Approvals
- Exports
- Report versions
- Subscriptions
- Plans
- Licenses
- Audit logs
- Files
- Notifications
- Settings
- Translations

Required entities:

1. users
2. organizations
3. organization_members
4. roles
5. permissions
6. role_permissions
7. companies
8. company_users
9. fiscal_years
10. trial_balances
11. trial_balance_lines
12. account_classes
13. account_mapping_rules
14. account_mappings
15. financial_statement_templates
16. financial_statement_sections
17. financial_statement_lines
18. generated_reports
19. report_sections
20. annex_notes
21. annex_note_entries
22. tax_forms
23. tax_form_entries
24. validation_rules
25. validation_results
26. comments
27. approvals
28. exports
29. report_versions
30. subscriptions
31. plans
32. licenses
33. audit_logs
34. files
35. notifications
36. settings
37. translations

==================================================
30. SECURITY REQUIREMENTS
==================================================

The platform must be secure.

Include:

- Role-based access control
- Multi-tenant data isolation
- Protected routes
- Secure authentication
- Secure file upload
- Input validation
- File type restriction
- File size limit
- Session management
- Rate limiting
- Audit logging
- Report locking
- Permission checks
- Organization-level data separation
- Secure export links
- Backup-ready structure

Critical security rule:
A user from one organization must never access data from another organization.

==================================================
31. NOTIFICATIONS
==================================================

Create notification system.

Notify users when:

French:
- Une balance est importée
- Une balance contient des erreurs
- Une validation échoue
- Des comptes ne sont pas affectés
- Des notes sont incomplètes
- Un rapport est prêt pour révision
- Un commentaire est ajouté
- Une correction est demandée
- Un rapport est approuvé
- Un rapport est rejeté
- Un export est terminé
- Un abonnement expire bientôt

English:
- A trial balance is imported
- A trial balance contains errors
- A validation fails
- Accounts are unmapped
- Notes are incomplete
- A report is ready for review
- A comment is added
- A correction is requested
- A report is approved
- A report is rejected
- An export is completed
- A subscription is expiring soon

==================================================
32. DESIGN REQUIREMENTS
==================================================

The design must be professional, corporate, clean, and trustworthy.

Primary color:
Dark orange.

The UI should feel:
- Premium
- Serious
- Financial
- Modern
- Organized
- Simple
- Guided

Use:
- Sidebar navigation
- Top bar
- Language switcher
- Breadcrumbs
- KPI cards
- Data tables
- Status badges
- Progress steppers
- Workflow checklist
- File upload cards
- Report preview pages
- Validation panels
- Export modals
- Comment panels
- Approval panels
- Empty states
- Loading states
- Error states

Avoid:
- Too many colors
- Overly playful design
- Confusing navigation
- Excel-like sheet tabs everywhere

The app should be desktop-first but responsive for tablets and mobile viewing.

==================================================
33. MAIN PAGES TO CREATE
==================================================

Create these pages:

1. Landing page
2. Login
3. Register
4. Forgot password
5. Reset password
6. Invite user
7. Dashboard
8. Company list
9. Create company
10. Company profile
11. Edit company
12. Company users
13. Fiscal year list
14. Create fiscal year
15. Fiscal year workspace
16. Company information step
17. Balance N import
18. Balance N-1 import
19. Column mapping
20. Balance preview
21. Balance validation results
22. Account classification
23. Account mapping
24. Unmapped accounts
25. Mapping rules
26. Validation center
27. Financial statements overview
28. Actif report
29. Passif report
30. Bilan report
31. Compte de résultat
32. Tableau des flux de trésorerie
33. Notes annexes overview
34. Note detail page
35. Details des charges
36. Tax forms overview
37. Tax form detail page
38. Review center
39. Approval page
40. Export center
41. Export history
42. Report version history
43. Report archive
44. Client portal dashboard
45. Client report viewer
46. User management
47. Role management
48. Permission management
49. Subscription management
50. Plan management
51. License management
52. Super admin dashboard
53. Organization management
54. System settings
55. Audit logs
56. Notifications
57. Help/documentation

==================================================
34. REUSABLE COMPONENTS
==================================================

Create reusable components:

- AppLayout
- PublicLayout
- AuthLayout
- Sidebar
- Topbar
- LanguageSwitcher
- Breadcrumb
- PageHeader
- KPICard
- StatusBadge
- ProgressStepper
- WorkflowChecklist
- DataTable
- SearchFilterBar
- FileUploader
- ColumnMapper
- BalancePreviewTable
- ValidationAlert
- ValidationChecklist
- AccountClassificationBadge
- AccountMappingTable
- FinancialStatementTable
- ReportPreview
- NotesEditor
- CommentPanel
- ApprovalPanel
- ExportModal
- VersionHistory
- AuditLogTable
- RolePermissionMatrix
- SubscriptionPlanCard
- NotificationDropdown
- EmptyState
- LoadingState
- ErrorState
- ConfirmationDialog
- LockReportDialog
- UnlockReportDialog

==================================================
35. EXACT USER JOURNEY TO IMPLEMENT
==================================================

Implement this exact workflow:

English:
1. User logs in
2. User selects language
3. User lands on dashboard
4. User creates a company
5. User creates fiscal year 2025
6. User imports Balance N
7. System previews imported data
8. User maps file columns
9. System validates Balance N
10. User imports Balance N-1
11. System validates Balance N-1
12. System classifies accounts by OHADA class
13. System suggests account mappings
14. User reviews unmapped accounts
15. User fixes mapping conflicts
16. System generates Actif
17. System generates Passif
18. System checks Actif = Passif
19. System generates income statement
20. System checks net result consistency
21. System generates cash flow statement
22. User completes annex notes
23. User completes tax forms
24. User runs final validation
25. Reviewer reviews the report
26. Reviewer approves or requests correction
27. User exports PDF and Excel package
28. System saves export version
29. Authorized user locks the final report
30. Client downloads final report

French:
1. L’utilisateur se connecte
2. L’utilisateur choisit la langue
3. L’utilisateur arrive sur le tableau de bord
4. L’utilisateur crée une société
5. L’utilisateur crée l’exercice 2025
6. L’utilisateur importe la balance N
7. Le système affiche un aperçu des données
8. L’utilisateur affecte les colonnes du fichier
9. Le système valide la balance N
10. L’utilisateur importe la balance N-1
11. Le système valide la balance N-1
12. Le système classe les comptes selon les classes OHADA
13. Le système propose les affectations comptables
14. L’utilisateur vérifie les comptes non affectés
15. L’utilisateur corrige les conflits d’affectation
16. Le système génère l’Actif
17. Le système génère le Passif
18. Le système vérifie Actif = Passif
19. Le système génère le compte de résultat
20. Le système vérifie la cohérence du résultat net
21. Le système génère le tableau des flux de trésorerie
22. L’utilisateur complète les notes annexes
23. L’utilisateur complète les formulaires fiscaux
24. L’utilisateur lance la validation finale
25. Le réviseur vérifie le rapport
26. Le réviseur approuve ou demande une correction
27. L’utilisateur exporte le dossier PDF et Excel
28. Le système enregistre la version exportée
29. Un utilisateur autorisé verrouille le rapport final
30. Le client télécharge le rapport final

==================================================
36. IMPORTANT BUSINESS RULES
==================================================

Rules:

1. The user cannot export final reports without importing Balance N.
2. The user can continue without Balance N-1 only after confirmation.
3. Missing Balance N-1 should display N-1 values as unavailable.
4. Critical validation errors block export.
5. Warnings do not block export but must be visible.
6. Manual mapping changes require a reason.
7. Manual adjustments require a reason.
8. All important actions must be logged.
9. Actif must equal Passif.
10. Income statement result must match balance sheet result.
11. Reports can be locked after approval.
12. Locked reports cannot be modified.
13. Only authorized users can unlock reports.
14. Unlocking requires a reason.
15. Each export must be saved in history.
16. Each organization must only access its own data.
17. French is the default language.
18. English is optional but fully supported.
19. The app must not run Excel macros.
20. The app must extract data only from uploaded files.

==================================================
37. MVP, PRODUCTION, AND SCALE PHASES
==================================================

Build in phases.

Phase 1: MVP

Include:
- Authentication
- Bilingual interface
- Dashboard
- Company management
- Fiscal year management
- Balance N import
- Balance N-1 import
- Column mapping
- Balance preview
- Balance validation
- OHADA account classification
- Basic account mapping
- Actif
- Passif
- Compte de résultat
- Basic validation center
- Basic notes annexes
- PDF export
- Excel export
- User roles
- Audit logs basic

Phase 2: Production

Include:
- Full notes 1 to 36
- Cash flow statement
- Tax forms
- Patente
- Honoraires
- Details des charges
- Advanced validation
- Review workflow
- Approval workflow
- Report versioning
- Report locking
- Client portal
- Export center
- Subscription management
- License management
- Advanced audit logs
- Notifications

Phase 3: Scale

Include:
- Accounting firm workspace
- Multi-client management
- White-label mode
- AI-assisted mapping
- AI validation assistant
- OCR balance import
- API access
- Advanced analytics
- Financial ratios
- Tax risk detection
- E-signature
- External accounting software integrations
- Automated reminders

==================================================
38. OPTIONAL AI FEATURES
==================================================

AI features should be optional and not required for the MVP.

AI can help with:
- Suggesting account mappings
- Detecting abnormal balances
- Explaining validation errors
- Suggesting missing notes
- Generating financial commentary
- Summarizing financial performance
- Detecting tax risks

AI must never silently change financial data.

AI suggestions must require user approval.

==================================================
39. FINAL EXPECTED RESULT
==================================================

Generate a complete production-ready bilingual web application.

The final app must include:

- Public landing page
- Authentication
- Role-based access
- Organization management
- Company management
- Fiscal year management
- Balance import
- Column mapping
- Balance validation
- OHADA account classification
- Account mapping
- Financial statement generation
- Actif
- Passif
- Bilan
- Compte de résultat
- Tableau des flux de trésorerie
- Notes annexes
- Tax forms
- Details des charges
- Review and approval workflow
- Export center
- Report versioning
- Report archive
- Report locking
- Client portal
- Super admin panel
- Subscription and license system
- Audit logs
- Notifications
- Bilingual French/English interface
- Secure multi-tenant architecture
- Clean professional UI
- Dark orange primary color

Before coding, create:
1. Project structure
2. Database schema
3. User flows
4. Page list
5. Component list
6. Implementation task list

Then implement step by step.

Do not skip the accounting workflow.

Do not create a generic dashboard only.

Do not depend on reading Excel macros.

The system must recreate the financial statement workflow through structured web modules.

The final product must feel simple for users but powerful behind the scenes.