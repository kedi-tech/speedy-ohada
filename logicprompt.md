You are a senior backend engineer, financial systems architect, and OHADA/SYSCOHADA accounting logic specialist.

I want you to build the complete backend logic engine for Speedy OHADA Web.

This logic must reproduce the flow of an Excel-based OHADA financial statement workbook, but without depending on Excel formulas or macros.

The system must calculate everything from imported trial balance data.

The core logic flow is:

Input Data
→ Balance Normalization
→ Account Prefix Extraction
→ OHADA Class Detection
→ Account Aggregation
→ Grouped Balance
→ Mapping to Report Lines
→ Financial Statement Calculation
→ Notes Annexes Calculation
→ Fiscal Calculation
→ Validation Controls
→ Export-Ready Report Data

The calculation logic must be bilingual:
- French default
- English supported

Do not use fake static values.
Do not hardcode final numbers.
Every report value must be calculated from trial balance lines, mapping rules, manual inputs, or approved overrides.

==================================================
1. MAIN LOGIC ARCHITECTURE
==================================================

Create these backend modules:

1. ImportEngine
2. BalanceNormalizer
3. AccountPrefixEngine
4. OHADAClassEngine
5. GroupedBalanceEngine
6. MappingEngine
7. FinancialStatementEngine
8. ActifEngine
9. PassifEngine
10. IncomeStatementEngine
11. CashFlowEngine
12. NotesAnnexesEngine
13. ExpenseDetailsEngine
14. FiscalEngine
15. ValidationEngine
16. TraceabilityEngine
17. ManualOverrideEngine
18. ReportVersionEngine
19. ExportPreparationEngine

Each module must be independent, testable, and reusable.

Every calculation must be traceable back to the source accounts.

==================================================
2. IMPORT ENGINE
==================================================

The ImportEngine handles uploaded trial balance files.

The system must accept:

- Excel .xlsx
- Excel .xls
- Excel .xlsm as data-only
- CSV

Do not run Excel macros.

Only read table data.

The user may import:

- Balance N
- Balance N-1

The import flow must be flexible because users may upload different balance formats.

Import steps:

1. Receive uploaded file
2. Read available sheets/tables
3. Detect possible header row
4. Extract columns
5. Let user map uploaded columns to system fields
6. Preview imported data
7. Validate basic data
8. Save raw import
9. Save normalized trial balance

Required system fields:

French:
- Numéro de compte
- Libellé du compte
- Débit d’ouverture
- Crédit d’ouverture
- Mouvement débit
- Mouvement crédit
- Solde débit
- Solde crédit
- Solde net

English:
- Account number
- Account label
- Opening debit
- Opening credit
- Movement debit
- Movement credit
- Closing debit
- Closing credit
- Net balance

Internal fields:

account_number
account_label
opening_debit
opening_credit
movement_debit
movement_credit
closing_debit
closing_credit
net_balance
balance_type
fiscal_year_id
company_id
organization_id

If some balances only contain closing debit and closing credit, accept them.

If opening and movement columns are missing, set them to 0.

==================================================
3. BALANCE NORMALIZATION LOGIC
==================================================

For every imported line, normalize values.

Rules:

1. Trim account number
2. Remove spaces from account number
3. Keep leading zeros if they exist
4. Convert debit and credit values to numbers
5. Empty numeric fields become 0
6. Negative values must be flagged as warnings
7. Account label must not be empty
8. Account number must contain digits
9. Account number must have at least 1 digit
10. Detect account class from first digit

If closing debit and closing credit are provided:

net_balance = closing_debit - closing_credit

If only opening/movement values are provided:

raw_net =
opening_debit
+ movement_debit
- opening_credit
- movement_credit

If raw_net > 0:
closing_debit = raw_net
closing_credit = 0
net_balance = raw_net

If raw_net < 0:
closing_debit = 0
closing_credit = absolute(raw_net)
net_balance = raw_net

If raw_net = 0:
closing_debit = 0
closing_credit = 0
net_balance = 0

French explanation:
Si le solde net est positif, le compte est débiteur.
Si le solde net est négatif, le compte est créditeur.
Si le solde net est zéro, le compte est soldé.

English explanation:
If net balance is positive, the account has a debit balance.
If net balance is negative, the account has a credit balance.
If net balance is zero, the account is settled.

==================================================
4. ACCOUNT PREFIX ENGINE
==================================================

For every account number, create prefixes.

Example:

Account number: 521000

prefix_1 = 5
prefix_2 = 52
prefix_3 = 521
prefix_4 = 5210
prefix_5 = 52100
prefix_6 = 521000

Store prefixes because the Excel logic uses prefixes heavily.

Internal fields:

account_prefix_1
account_prefix_2
account_prefix_3
account_prefix_4
account_prefix_5
account_prefix_6

These prefixes will be used by:

- Account classification
- OHADA aggregation
- Report mapping
- Expense details
- Notes annexes
- Fiscal forms

==================================================
5. OHADA CLASS ENGINE
==================================================

Detect OHADA/SYSCOHADA account class from the first digit.

Logic:

account_class = first digit of account_number

Classes:

Classe 1:
French: Ressources durables, capitaux propres, emprunts, dettes financières
English: Long-term resources, equity, loans, financial debts

Classe 2:
French: Immobilisations
English: Fixed assets

Classe 3:
French: Stocks
English: Inventory

Classe 4:
French: Comptes de tiers
English: Third-party accounts

Classe 5:
French: Trésorerie
English: Treasury, bank, cash

Classe 6:
French: Charges
English: Expenses

Classe 7:
French: Produits
English: Income / revenue

Classe 8:
French: Autres charges et produits, comptes spéciaux
English: Other expenses and income, special accounts

Classe 9:
French: Comptabilité analytique ou engagements
English: Analytical accounting or commitments

Rules:

- Classes 1 to 8 are included in standard financial statement logic.
- Class 9 is excluded by default unless admin enables it.
- Unknown class creates warning.
- Empty account number creates critical error.

==================================================
6. BALANCE VALIDATION LOGIC
==================================================

For every trial balance:

total_debit = sum(closing_debit)
total_credit = sum(closing_credit)
difference = total_debit - total_credit

If difference = 0:
balance_status = valid

If difference != 0:
balance_status = invalid

Validation messages:

French:
La balance n’est pas équilibrée. Le total débit est différent du total crédit.

English:
The trial balance is not balanced. Total debit does not equal total credit.

Validation result must include:

- total_debit
- total_credit
- difference
- is_balanced
- critical_errors
- warnings
- info_messages

Rules:

1. Balance N is mandatory.
2. Balance N must be balanced.
3. Balance N-1 is recommended.
4. If Balance N-1 is missing, user must explicitly confirm continuation.
5. If Balance N-1 is missing, display N-1 values as “Non disponible / Unavailable”.
6. Critical balance errors must block final export.

==================================================
7. GROUPED BALANCE ENGINE
==================================================

The grouped balance replaces the Excel “BALANCE REGROUPE” sheet.

It consolidates imported accounts into structured OHADA account groups.

For each company and fiscal year, create grouped balance records.

Grouped balance fields:

- organization_id
- company_id
- fiscal_year_id
- balance_type: N or N-1
- group_code
- group_label_fr
- group_label_en
- account_class
- prefix_level
- opening_debit
- opening_credit
- movement_debit
- movement_credit
- closing_debit
- closing_credit
- net_balance
- source_accounts

Aggregation logic:

For each group rule:

group_opening_debit =
sum opening_debit of accounts matching group prefix/range

group_opening_credit =
sum opening_credit of accounts matching group prefix/range

group_movement_debit =
sum movement_debit of accounts matching group prefix/range

group_movement_credit =
sum movement_credit of accounts matching group prefix/range

group_closing_debit =
sum closing_debit of accounts matching group prefix/range

group_closing_credit =
sum closing_credit of accounts matching group prefix/range

group_net_balance =
group_closing_debit - group_closing_credit

Group matching can use:

1. Account prefix
2. Account range
3. Manual account selection
4. Exclusion rules
5. Custom formula

Example:

Group: Banque
Match prefix: 521

Group value =
sum all accounts starting with 521

==================================================
8. MAPPING ENGINE
==================================================

The MappingEngine maps accounts or grouped balances to report lines.

Do not hardcode every mapping directly in the code.

Use configurable mapping rules.

Mapping rule fields:

- id
- report_type
- report_section
- report_line_code
- label_fr
- label_en
- account_prefixes
- account_ranges
- included_accounts
- excluded_accounts
- source_type: trial_balance or grouped_balance
- normal_balance_type
- display_sign
- formula_type
- formula_expression
- display_order
- is_required
- is_editable
- allows_manual_override
- is_active

Report types:

- ACTIF
- PASSIF
- BILAN
- COMPTE_RESULTAT
- TABLEAU_FLUX_TRESORERIE
- NOTES_ANNEXES
- DETAILS_CHARGES
- FISCALITE

Display sign options:

1. debit_positive
2. credit_positive
3. subtract_from_gross
4. manual
5. formula

Logic:

If display_sign = debit_positive:
display_value = sum(net_balance)

If display_sign = credit_positive:
display_value = -sum(net_balance)

If display_sign = subtract_from_gross:
display_value = absolute(sum(net_balance))

If display_sign = formula:
display_value = result of formula_expression

==================================================
9. BASIC REPORT LINE CALCULATION
==================================================

Every report line must be calculated for N and N-1.

For each report line:

value_N =
sum mapped accounts from Balance N

value_N_1 =
sum mapped accounts from Balance N-1

variation_amount =
value_N - value_N_1

If value_N_1 is not zero:

variation_percentage =
variation_amount / absolute(value_N_1) * 100

If value_N_1 is zero and value_N is not zero:
variation_percentage = null
display “N/A”

If Balance N-1 is missing:
value_N_1 = null
variation_amount = null
variation_percentage = null

Display labels:

French:
Non disponible

English:
Unavailable

Every generated line must store:

- report_type
- section_code
- line_code
- label_fr
- label_en
- value_N
- value_N_1
- variation_amount
- variation_percentage
- source_accounts
- formula_used
- is_manual_override
- override_reason
- validation_status
- display_order

==================================================
10. ACTIF ENGINE
==================================================

The ActifEngine calculates the assets side.

French:
Actif

English:
Assets

Main structure:

1. Actif immobilisé / Fixed assets
2. Actif circulant / Current assets
3. Trésorerie actif / Cash and bank assets
4. Écart de conversion actif / Conversion difference assets
5. Total Actif / Total assets

Calculation structure:

A. Immobilisations incorporelles / Intangible assets

gross_intangible_assets =
sum mapped intangible fixed asset accounts

depreciation_intangible_assets =
sum mapped depreciation/provision accounts for intangible assets

net_intangible_assets =
gross_intangible_assets - depreciation_intangible_assets

B. Immobilisations corporelles / Tangible fixed assets

gross_tangible_assets =
sum mapped tangible fixed asset accounts

depreciation_tangible_assets =
sum mapped depreciation/provision accounts for tangible assets

net_tangible_assets =
gross_tangible_assets - depreciation_tangible_assets

C. Immobilisations financières / Financial assets

gross_financial_assets =
sum mapped financial fixed asset accounts

provision_financial_assets =
sum mapped provisions for financial assets

net_financial_assets =
gross_financial_assets - provision_financial_assets

D. Total actif immobilisé

total_fixed_assets =
net_intangible_assets
+ net_tangible_assets
+ net_financial_assets

E. Stocks / Inventory

inventory =
sum mapped inventory accounts

F. Créances / Receivables

customer_receivables =
sum mapped customer receivable accounts

other_receivables =
sum mapped other receivable accounts

tax_receivables =
sum mapped tax receivable accounts

total_receivables =
customer_receivables
+ other_receivables
+ tax_receivables

G. Total actif circulant

total_current_assets =
inventory
+ total_receivables
+ other_current_assets

H. Trésorerie actif

bank_assets =
sum mapped debit bank balances

cash_assets =
sum mapped cash accounts

mobile_money_assets =
sum mapped mobile money or wallet treasury accounts, if configured

total_treasury_assets =
bank_assets
+ cash_assets
+ mobile_money_assets

I. Total Actif

total_actif =
total_fixed_assets
+ total_current_assets
+ total_treasury_assets
+ conversion_difference_assets

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
11. PASSIF ENGINE
==================================================

The PassifEngine calculates equity and liabilities.

French:
Passif

English:
Liabilities and Equity

Main structure:

1. Capitaux propres / Equity
2. Provisions et dettes financières / Provisions and financial debts
3. Passif circulant / Current liabilities
4. Trésorerie passif / Treasury liabilities
5. Écart de conversion passif / Conversion difference liabilities
6. Total Passif / Total liabilities and equity

Calculation structure:

A. Capitaux propres

capital =
credit-positive sum of capital accounts

reserves =
credit-positive sum of reserve accounts

retained_earnings =
credit-positive sum of retained earnings accounts

net_result_balance_sheet =
credit-positive or debit-negative result account

investment_grants =
credit-positive sum of investment grant accounts

regulated_provisions =
credit-positive sum of regulated provision accounts

total_equity =
capital
+ reserves
+ retained_earnings
+ net_result_balance_sheet
+ investment_grants
+ regulated_provisions

B. Dettes financières

loans =
credit-positive sum of loan accounts

other_financial_debts =
credit-positive sum of other financial debt accounts

total_financial_debts =
loans + other_financial_debts

C. Passif circulant

supplier_payables =
credit-positive sum of supplier payable accounts

tax_liabilities =
credit-positive sum of tax payable accounts

social_liabilities =
credit-positive sum of staff/social payable accounts

other_liabilities =
credit-positive sum of other payable accounts

total_current_liabilities =
supplier_payables
+ tax_liabilities
+ social_liabilities
+ other_liabilities

D. Trésorerie passif

bank_overdrafts =
credit-positive sum of bank overdraft accounts

short_term_financing =
credit-positive sum of short-term financing accounts

total_treasury_liabilities =
bank_overdrafts + short_term_financing

E. Total Passif

total_passif =
total_equity
+ total_financial_debts
+ total_current_liabilities
+ total_treasury_liabilities
+ conversion_difference_liabilities

Critical validation:

total_actif must equal total_passif

difference =
total_actif - total_passif

If difference is not zero beyond tolerance:
create critical validation error.

French:
Le total Actif est différent du total Passif.

English:
Total assets do not equal total liabilities and equity.

==================================================
12. BALANCE SHEET ENGINE
==================================================

The BalanceSheetEngine combines Actif and Passif.

It must calculate:

- Total Actif N
- Total Passif N
- Difference N
- Total Actif N-1
- Total Passif N-1
- Difference N-1

Validation:

difference_N =
total_actif_N - total_passif_N

difference_N_1 =
total_actif_N_1 - total_passif_N_1

If difference_N != 0 beyond tolerance:
critical error

If difference_N_1 != 0 beyond tolerance:
warning or critical depending on whether N-1 is required

==================================================
13. INCOME STATEMENT ENGINE
==================================================

French:
Compte de résultat

English:
Income Statement

Source accounts:
- Classe 6 for expenses
- Classe 7 for income/revenue
- Classe 8 for special/HAO items if configured

Main structure:

A. Produits d’exploitation / Operating income

turnover =
credit-positive sum of sales accounts

capitalized_production =
credit-positive sum of capitalized production accounts

other_operating_income =
credit-positive sum of other operating income accounts

total_operating_income =
turnover
+ capitalized_production
+ other_operating_income

B. Charges d’exploitation / Operating expenses

purchases =
debit-positive sum of purchase accounts

external_services =
debit-positive sum of external service accounts

taxes =
debit-positive sum of tax expense accounts

personnel_expenses =
debit-positive sum of personnel expense accounts

depreciation_expenses =
debit-positive sum of depreciation/provision expense accounts

other_operating_expenses =
debit-positive sum of other operating expense accounts

total_operating_expenses =
purchases
+ external_services
+ taxes
+ personnel_expenses
+ depreciation_expenses
+ other_operating_expenses

C. Résultat d’exploitation / Operating result

operating_result =
total_operating_income - total_operating_expenses

D. Résultat financier / Financial result

financial_income =
credit-positive sum of financial income accounts

financial_expenses =
debit-positive sum of financial expense accounts

financial_result =
financial_income - financial_expenses

E. Résultat des activités ordinaires / Ordinary activities result

ordinary_activities_result =
operating_result + financial_result

F. Résultat HAO / Non-ordinary result

hao_income =
credit-positive sum of HAO or non-ordinary income accounts

hao_expenses =
debit-positive sum of HAO or non-ordinary expense accounts

hao_result =
hao_income - hao_expenses

G. Impôt sur le résultat / Income tax

income_tax =
debit-positive sum of income tax expense accounts

H. Résultat net / Net result

net_result =
ordinary_activities_result
+ hao_result
- income_tax

Display:

If net_result > 0:
French: Bénéfice
English: Profit

If net_result < 0:
French: Perte
English: Loss

Critical validation:

net_result from income statement must match result shown in Passif.

result_difference =
income_statement_net_result - balance_sheet_net_result

If result_difference is not zero beyond tolerance:
create critical validation error.

French:
Le résultat du compte de résultat ne correspond pas au résultat inscrit au passif.

English:
The income statement result does not match the result shown in liabilities and equity.

==================================================
14. EXPENSE DETAILS ENGINE
==================================================

French:
Détails des charges

English:
Expense Details

Source:
Classe 6 accounts.

Create categories:

French:
- Achats
- Services extérieurs
- Autres services extérieurs
- Impôts et taxes
- Charges de personnel
- Charges financières
- Dotations aux amortissements
- Dotations aux provisions
- Autres charges

English:
- Purchases
- External services
- Other external services
- Taxes
- Personnel expenses
- Financial expenses
- Depreciation expenses
- Provision expenses
- Other expenses

For each category:

amount_N =
sum mapped Classe 6 accounts for category in Balance N

amount_N_1 =
sum mapped Classe 6 accounts for category in Balance N-1

variation =
amount_N - amount_N_1

variation_percentage =
variation / absolute(amount_N_1) * 100, if amount_N_1 is not zero

Allow drill-down:

Category
→ Account prefix
→ Account number
→ Account label
→ Amount N
→ Amount N-1
→ Variation

==================================================
15. CASH FLOW ENGINE
==================================================

French:
Tableau des flux de trésorerie

English:
Cash Flow Statement

The system must support automatic and manual cash flow logic.

Core sections:

1. Flux liés aux activités opérationnelles / Operating cash flow
2. Flux liés aux activités d’investissement / Investing cash flow
3. Flux liés aux activités de financement / Financing cash flow
4. Variation nette de trésorerie / Net cash variation
5. Trésorerie à l’ouverture / Opening cash
6. Trésorerie à la clôture / Closing cash

Treasury logic:

opening_cash =
treasury_assets_N_1 - treasury_liabilities_N_1

closing_cash =
treasury_assets_N - treasury_liabilities_N

net_cash_variation =
closing_cash - opening_cash

Operating cash flow simplified formula:

operating_cash_flow =
net_result
+ depreciation_and_provisions
- reversals
- gains_on_asset_disposals
+ losses_on_asset_disposals
- increase_in_inventory
- increase_in_operating_receivables
+ increase_in_operating_payables

Where:

increase_in_inventory =
inventory_N - inventory_N_1

increase_in_operating_receivables =
operating_receivables_N - operating_receivables_N_1

increase_in_operating_payables =
operating_payables_N - operating_payables_N_1

Investing cash flow:

investing_cash_flow =
- acquisitions_of_fixed_assets
+ disposals_of_fixed_assets
- acquisitions_of_financial_assets
+ disposals_of_financial_assets

Financing cash flow:

financing_cash_flow =
capital_increases
+ new_borrowings
- loan_repayments
- dividends_paid
+ grants_received

Important:
Some values cannot always be inferred from a trial balance alone.

For these, create manual input fields:

- Acquisitions of fixed assets
- Disposals of fixed assets
- New borrowings
- Loan repayments
- Dividends paid
- Grants received
- Gains/losses on disposal
- Reversals

Manual values require reason and audit log.

Validation:

cash_flow_total =
operating_cash_flow
+ investing_cash_flow
+ financing_cash_flow

cash_flow_difference =
cash_flow_total - net_cash_variation

If difference is not zero beyond tolerance:
create warning or critical error depending on configuration.

French:
Le tableau de flux de trésorerie est déséquilibré.

English:
The cash flow statement is not balanced.

==================================================
16. NOTES ANNEXES ENGINE
==================================================

French:
Notes annexes

English:
Annex Notes

The system must support Notes 1 to 36.

Each note must have:

- note_number
- title_fr
- title_en
- description_fr
- description_en
- source_accounts
- source_report_lines
- calculation_formula
- manual_fields
- required_fields
- is_required
- status
- validation_result

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

Examples of note calculation logic:

A. Fixed assets note

opening_gross =
gross_fixed_assets_N_1

acquisitions =
manual input or derived from fixed asset movement debit

disposals =
manual input or derived from fixed asset movement credit

closing_gross =
opening_gross + acquisitions - disposals + transfers

opening_depreciation =
depreciation_fixed_assets_N_1

depreciation_charge =
mapped depreciation expense accounts

depreciation_reversal =
manual input or mapped reversal accounts

closing_depreciation =
opening_depreciation + depreciation_charge - depreciation_reversal

net_value =
closing_gross - closing_depreciation

B. Inventory note

inventory_N =
mapped inventory accounts from Balance N

inventory_N_1 =
mapped inventory accounts from Balance N-1

variation =
inventory_N - inventory_N_1

C. Receivables note

gross_receivables =
mapped receivable accounts

provisions =
mapped provision accounts

net_receivables =
gross_receivables - provisions

D. Debts note

debts_by_category =
supplier_debts
+ tax_debts
+ social_debts
+ financial_debts
+ other_debts

E. Revenue note

revenue_by_category =
mapped Classe 7 accounts grouped by revenue category

F. Expense note

expenses_by_category =
mapped Classe 6 accounts grouped by expense category

If required note data cannot be calculated:
show manual input field.

French placeholder:
Veuillez compléter cette information.

English placeholder:
Please complete this information.

==================================================
17. FISCAL ENGINE
==================================================

French:
Fiscalité

English:
Tax

The FiscalEngine calculates tax-related values.

Important:
Do not hardcode tax rates.
Tax rates must be configurable by country, fiscal regime, and year.

Fiscal fields:

French:
- Résultat comptable
- Réintégrations
- Déductions
- Résultat fiscal
- Taux d’impôt
- Impôt calculé
- Acomptes versés
- Crédits d’impôt
- Solde à payer
- Patente
- Honoraires

English:
- Accounting result
- Add-backs
- Deductions
- Taxable result
- Tax rate
- Calculated tax
- Installments paid
- Tax credits
- Balance payable
- Business license/tax
- Fees/honorarium

Formula:

accounting_result =
income_statement_net_result

taxable_result =
accounting_result + add_backs - deductions

calculated_tax =
taxable_result * tax_rate

balance_payable =
calculated_tax - installments_paid - tax_credits

If taxable_result < 0:
calculated_tax can be 0 unless configuration says otherwise.

Manual inputs:

- Add-backs
- Deductions
- Installments paid
- Tax credits
- Patente values
- Honorarium details

Every manual fiscal value requires source/comment.

==================================================
18. MANUAL OVERRIDE ENGINE
==================================================

Manual overrides allow authorized users to adjust calculated values.

Every override must include:

- organization_id
- company_id
- fiscal_year_id
- report_type
- report_line_code
- original_value
- new_value
- difference
- reason
- created_by
- created_at
- approval_status

Rules:

1. Manual override requires a reason.
2. Manual override must be visible in the report.
3. Manual override must appear in audit logs.
4. Manual override can require reviewer approval.
5. Locked reports cannot be overridden.
6. Manual override should not delete original calculated value.
7. Manual override must keep traceability.

French label:
Modification manuelle

English label:
Manual override

==================================================
19. TRACEABILITY ENGINE
==================================================

Every report value must be traceable.

When a user clicks a calculated value, show:

French:
- Comptes sources
- Formule utilisée
- Montant N
- Montant N-1
- Variation
- Ajustements manuels
- Dernier recalcul
- Utilisateur ayant modifié

English:
- Source accounts
- Formula used
- Amount N
- Amount N-1
- Variation
- Manual adjustments
- Last recalculation
- User who modified

Traceability data:

- source_account_number
- source_account_label
- source_amount
- source_balance_type
- mapping_rule_id
- formula_used
- calculation_run_id
- manual_override_id

Example:

Line:
Créances clients / Customer receivables

Source accounts:
411000 Client A: 10,000,000
411100 Client B: 5,000,000

Formula:
Sum debit-positive accounts mapped to customer receivables

Value:
15,000,000

==================================================
20. VALIDATION ENGINE
==================================================

The ValidationEngine runs controls after each major calculation.

Validation categories:

1. Company information
2. Balance N
3. Balance N-1
4. Account classification
5. Account mapping
6. Actif
7. Passif
8. Bilan
9. Compte de résultat
10. Tableau des flux de trésorerie
11. Notes annexes
12. Fiscalité
13. Review
14. Export

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

Rules:

A. Company information validation

Required:
- Company name
- RCCM if applicable
- NIF if applicable
- Fiscal year opening date
- Fiscal year closing date
- Currency

B. Balance validation

- Balance N exists
- Balance N is balanced
- Balance N-1 exists or is explicitly skipped
- Account numbers valid
- Debit/credit values numeric

C. Mapping validation

- All material accounts are mapped
- No critical mapping conflict
- Manual mappings have reasons

D. Balance sheet validation

- Total Actif equals Total Passif
- Difference within tolerance

E. Result validation

- Income statement net result matches Passif net result

F. Cash flow validation

- Closing cash minus opening cash equals net cash variation
- Operating + investing + financing cash flows equal net cash variation

G. Notes validation

- Required notes completed
- Required manual fields completed

H. Tax validation

- Tax regime exists
- Tax rate configured
- Required fiscal fields completed

I. Export validation

- No critical errors
- Required approvals completed if workflow enabled
- Report is not already locked unless exporting locked version

Critical errors block export.

Warnings do not block export but must appear in validation report.

==================================================
21. MATERIALITY LOGIC
==================================================

The system must support materiality thresholds.

Materiality can be configured by:

1. Fixed amount
2. Percentage of total assets
3. Percentage of turnover
4. Percentage of net result

Formula:

materiality_amount =
maximum of enabled materiality calculations

Example:

fixed_threshold = 1,000,000
assets_threshold = total_assets * 1%
turnover_threshold = turnover * 0.5%

materiality_amount =
max(fixed_threshold, assets_threshold, turnover_threshold)

If an unmapped account is below materiality:
create warning.

If an unmapped account is above materiality:
create critical error.

==================================================
22. ROUNDING AND TOLERANCE LOGIC
==================================================

Currency settings:

- currency_code
- decimal_places
- rounding_method
- rounding_tolerance

Examples:

GNF:
decimal_places = 0

USD:
decimal_places = 2

EUR:
decimal_places = 2

Rounding methods:

- nearest
- floor
- ceil

Validation should use tolerance.

Example:

If total_actif = 100,000,000
and total_passif = 99,999,999
difference = 1

If tolerance = 1:
validation passes with rounding note.

French:
Écart dû à l’arrondi.

English:
Difference due to rounding.

==================================================
23. RECALCULATION LOGIC
==================================================

The system must recalculate reports when:

- Balance N is imported
- Balance N-1 is imported
- Balance is re-imported
- Account mapping changes
- Manual override is added
- Manual override is removed
- Fiscal settings change
- Currency settings change
- Tax settings change
- Report template changes

Recalculation process:

1. Normalize balance
2. Extract prefixes
3. Detect classes
4. Validate balances
5. Build grouped balance
6. Apply mapping rules
7. Calculate Actif
8. Calculate Passif
9. Validate Actif = Passif
10. Calculate income statement
11. Validate net result
12. Calculate cash flow
13. Validate cash flow
14. Calculate notes annexes
15. Calculate expense details
16. Calculate fiscal values
17. Run final validation
18. Save calculation snapshot
19. Update fiscal year status
20. Update progress percentage

==================================================
24. CALCULATION SNAPSHOT LOGIC
==================================================

Every calculation run must create a snapshot.

Snapshot fields:

- calculation_run_id
- organization_id
- company_id
- fiscal_year_id
- triggered_by_user
- trigger_reason
- started_at
- completed_at
- status
- total_debit_N
- total_credit_N
- difference_N
- total_debit_N_1
- total_credit_N_1
- difference_N_1
- total_actif_N
- total_passif_N
- bilan_difference_N
- total_actif_N_1
- total_passif_N_1
- bilan_difference_N_1
- net_result
- cash_flow_difference
- validation_status
- critical_errors_count
- warnings_count

This allows calculation history and auditability.

==================================================
25. REPORT VERSION LOGIC
==================================================

Every report generation should create a version.

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

Version fields:

- report_version_id
- fiscal_year_id
- version_number
- status
- generated_by
- generated_at
- calculation_run_id
- validation_summary
- change_summary
- is_locked

If a report is locked:
- Do not allow balance modification
- Do not allow mapping modification
- Do not allow manual override
- Do not allow note edits
- Do not allow fiscal edits

Unlocking requires:

- Permission
- Reason
- Audit log entry

==================================================
26. EXPORT PREPARATION ENGINE
==================================================

Before export:

1. Run recalculation
2. Run final validation
3. Check critical errors
4. Check review approval if enabled
5. Generate export-ready report data
6. Create export record
7. Save export version

If critical errors exist:

French:
Exportation bloquée. Des erreurs critiques doivent être corrigées.

English:
Export blocked. Critical errors must be fixed.

If warnings exist:

French:
Des avertissements existent. Vous pouvez exporter, mais ils seront inclus dans le rapport de validation.

English:
Warnings exist. You may export, but they will be included in the validation report.

Export data must include:

- Cover page
- Company identity sheet
- Actif
- Passif
- Bilan
- Compte de résultat
- Tableau de flux de trésorerie
- Notes annexes
- Details des charges
- Fiscal forms
- Validation report
- Traceability summary if internal report

==================================================
27. DEFAULT REPORT LINE LABELS
==================================================

Every report line must have French and English labels.

Examples:

line_code: TOTAL_ACTIF
label_fr: Total Actif
label_en: Total Assets

line_code: TOTAL_PASSIF
label_fr: Total Passif
label_en: Total Liabilities and Equity

line_code: RESULTAT_NET
label_fr: Résultat net
label_en: Net Result

line_code: CHIFFRE_AFFAIRES
label_fr: Chiffre d’affaires
label_en: Turnover

line_code: TRESORERIE_ACTIF
label_fr: Trésorerie actif
label_en: Cash and Bank Assets

line_code: TRESORERIE_PASSIF
label_fr: Trésorerie passif
label_en: Treasury Liabilities

line_code: RESULTAT_EXPLOITATION
label_fr: Résultat d’exploitation
label_en: Operating Result

line_code: RESULTAT_FINANCIER
label_fr: Résultat financier
label_en: Financial Result

line_code: RESULTAT_ACTIVITES_ORDINAIRES
label_fr: Résultat des activités ordinaires
label_en: Result from Ordinary Activities

line_code: RESULTAT_HAO
label_fr: Résultat HAO
label_en: Non-ordinary Result

line_code: IMPOT_RESULTAT
label_fr: Impôt sur le résultat
label_en: Income Tax

==================================================
28. FINAL EXPECTED OUTPUT
==================================================

The logic engine must output:

1. Normalized Balance N
2. Normalized Balance N-1
3. Account prefixes
4. OHADA classes
5. Grouped balance
6. Mapping results
7. Actif report
8. Passif report
9. Balance sheet validation
10. Income statement
11. Net result validation
12. Cash flow statement
13. Cash flow validation
14. Notes annexes values
15. Expense details
16. Fiscal values
17. Validation report
18. Traceability data
19. Calculation snapshot
20. Export-ready report data

The user must always be able to understand:

French:
- Comment le montant a été calculé
- Quels comptes ont été utilisés
- Quelle formule a été appliquée
- Quelle validation a été exécutée
- Qui a modifié une valeur
- Pourquoi une valeur a été modifiée

English:
- How the amount was calculated
- Which accounts were used
- Which formula was applied
- Which validation was run
- Who changed a value
- Why a value was changed

Do not use static financial numbers.
Do not make the reports decorative only.
The logic must calculate from imported trial balance lines.