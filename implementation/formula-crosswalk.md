# Excel Formula Crosswalk

Generated from the two source macro workbooks. This file is used by batch 8 and later batches to keep the app aligned with the workbook logic.

## Workbook Summary

| Workbook | Sheets | Hidden | Formula cells | Defined names | External links |
| --- | ---: | ---: | ---: | ---: | ---: |
| `Etats Financiers.xlsm` | 64 | 0 | 11936 | 63 | 2 |
| `SPEEDY OHADA 2.1.xlsm` | 100 | 15 | 48993 | 86 | 4 |

## Sheet Crosswalk

| Workbook | Sheet | State | Dimension | Formulas | Classification | App module | Status | Batch |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| `Etats Financiers.xlsm` | `PAGE DE GARDE` | visible | A1:S134 | 76 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `FICHE R1` | visible | B2:V65 | 110 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `FICHE R2` | visible | A2:AD57 | 120 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `dirigeants` | visible | B2:J66 | 197 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `ACTIF` | visible | B1:O48 | 171 | calculation | ActifEngine | partial | Batch 11 |
| `Etats Financiers.xlsm` | `PASSIF` | visible | B1:O47 | 102 | calculation | PassifEngine | partial | Batch 11 |
| `Etats Financiers.xlsm` | `BILAN paysage` | visible | B1:O42 | 252 | calculation | FinancialStatementEngine | partial | Batch 11 |
| `Etats Financiers.xlsm` | `COMPTE DE RESULTAT` | visible | B1:M150 | 146 | calculation | IncomeStatementEngine | partial | Batch 11 |
| `Etats Financiers.xlsm` | `TABLEAU DE FLUX DE TRESORERIE` | visible | A1:L108 | 105 | calculation | CashFlowEngine | partial | Batch 12 |
| `Etats Financiers.xlsm` | `NOTES ANNEXES` | visible | B3:M71 | 172 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `Imprimer` | visible | B2:C60 | 49 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `NOTE 1` | visible | A1:J61 | 244 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 2` | visible | A1:J59 | 65 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 A` | visible | A1:L43 | 190 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 B` | visible | A1:M29 | 92 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 C` | visible | A1:J36 | 103 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3C Bis` | visible | B2:L35 | 100 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 D` | visible | A1:I32 | 118 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 E` | visible | B1:K58 | 158 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 4` | visible | B1:M39 | 206 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 5` | visible | B1:K30 | 111 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 6` | visible | B1:M131 | 123 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 7` | visible | B1:M38 | 189 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8` | visible | B1:M35 | 188 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8 A` | visible | B1:L36 | 124 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8 B` | visible | B1:K22 | 38 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8 C` | visible | B1:K22 | 38 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 9` | visible | B1:K31 | 110 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 10` | visible | B1:K30 | 103 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 11` | visible | B1:P36 | 152 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 12` | visible | B1:L64 | 318 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 13` | visible | B1:N42 | 141 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 14` | visible | B1:G39 | 89 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 15 A` | visible | B1:N42 | 252 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 15 B` | visible | B1:P30 | 102 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 16 A` | visible | B1:N53 | 407 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 16 B` | visible | B1:J46 | 96 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 16 B bis` | visible | B1:H32 | 66 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 16 C` | visible | B1:H31 | 53 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 17` | visible | B1:P42 | 168 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 18` | visible | B1:Q40 | 238 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 19` | visible | B1:P44 | 272 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 20` | visible | B1:M32 | 111 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 21` | visible | B1:P68 | 321 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 22` | visible | B1:N53 | 272 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 23` | visible | B1:K30 | 95 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 24` | visible | B1:K38 | 158 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 25` | visible | B1:L28 | 78 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 26` | visible | B1:L34 | 117 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 27 A` | visible | B1:O32 | 103 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 27 B` | visible | B1:T43 | 234 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 28 A` | visible | B1:M35 | 120 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 28 B` | visible | B1:L46 | 121 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 28 C` | visible | B1:K39 | 92 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 29` | visible | A1:L44 | 201 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 30` | visible | B1:L46 | 220 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 31` | visible | B1:H40 | 170 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 32` | visible | B1:K43 | 299 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 33` | visible | B1:J38 | 246 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 34` | visible | B1:O74 | 432 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 35` | visible | B1:H58 | 63 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 36 TABLEAU DE CODES` | visible | B2:K43 | 28 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `Etats Financiers.xlsm` | `CODES ACTIVITES ECONOMIQUES` | visible | C3:F84 | 161 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `Etats Financiers.xlsm` | `DETAIL DES CHARGES` | visible | A2:P276 | 2140 | calculation | ExpenseDetailsEngine | partial | Batch 14 |
| `SPEEDY OHADA 2.1.xlsm` | `SOMMAIRE` | veryHidden | B1:J181 | 0 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 5` | veryHidden | A3:L145 | 884 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 8` | veryHidden | B3:K68 | 373 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `IMPRESSION` | veryHidden | B1:D229 | 0 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE N` | visible | A1:X1739 | 12156 | calculation | ImportEngine, BalanceNormalizer, TrialBalance import routes | partial | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE N-1` | visible | A1:O1501 | 3000 | calculation | ImportEngine, BalanceNormalizer, TrialBalance import routes | partial | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `RENSEIGNEMENT` | visible | B2:R136 | 0 | unknown | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `PAGE DE GARDE` | visible | A1:R134 | 76 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `FICHE R1` | visible | B2:V65 | 110 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `FICHE R2` | visible | A2:AD57 | 120 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `dirigeants` | visible | B2:J70 | 54 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `ACTIF` | visible | B1:O48 | 171 | calculation | ActifEngine | partial | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 4` | veryHidden | B3:Q492 | 2994 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `PASSIF` | visible | B1:O47 | 102 | calculation | PassifEngine | partial | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `BILAN paysage` | visible | B1:O42 | 252 | calculation | FinancialStatementEngine | partial | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `COMPTE DE RESULTAT` | visible | B1:M150 | 146 | calculation | IncomeStatementEngine | partial | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `Feuil3` | veryHidden | C2:G14 | 27 | unknown | IncomeStatementEngine, FinancialStatementEngine | missing_helper_logic | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `VENTI DES ECARTS DE CONV` | veryHidden | B2:H40 | 95 | calculation | MappingEngine, ActifEngine, PassifEngine, NotesAnnexesEngine | missing | Batch 16 |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE REGROUPE` | veryHidden | B1:O1570 | 8744 | calculation | GroupedBalanceEngine | partial | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `Feuil2` | veryHidden | B2:K57 | 85 | unknown | CashFlowEngine, FinancialStatementEngine | missing_helper_logic | Batch 12 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 6` | veryHidden | B3:N511 | 2846 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 7` | veryHidden | B3:N235 | 1344 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `TABLEAU DE FLUX DE TRESORERIE` | visible | A1:L109 | 104 | calculation | CashFlowEngine | partial | Batch 12 |
| `SPEEDY OHADA 2.1.xlsm` | `CAPITAL` | veryHidden | A2:K1048559 | 20 | unknown | CashFlowEngine, FinancialStatementEngine | missing_helper_logic | Batch 12 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTES ANNEXES` | visible | B3:M71 | 174 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 1` | visible | A1:J61 | 75 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 2` | visible | A1:J59 | 23 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 2` | veryHidden | B3:L570 | 3606 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 A` | visible | A1:L43 | 147 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 B` | visible | A1:M29 | 45 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 C` | visible | A1:J36 | 88 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3C Bis` | visible | B2:L35 | 87 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 D` | visible | A1:I32 | 102 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 E` | visible | B1:K58 | 32 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 4` | visible | B1:M39 | 128 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 5` | visible | B1:K30 | 105 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 3` | veryHidden | B3:L141 | 850 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 6` | visible | B1:M131 | 111 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 7` | visible | B1:M38 | 153 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 8` | visible | B1:M35 | 142 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 8 A` | visible | B1:L36 | 37 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 8 B` | visible | B1:K22 | 30 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 8 C` | visible | B1:K22 | 30 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 9` | visible | B1:K31 | 100 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 10` | visible | B1:K30 | 93 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 11` | visible | B1:P36 | 142 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 12` | visible | B1:M64 | 131 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 13` | visible | B1:N42 | 43 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 14` | visible | B1:I39 | 77 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 1` | veryHidden | A3:M267 | 1664 | calculation | OHADAClassEngine, AccountPrefixEngine | missing_depth | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 15 A` | visible | B1:N42 | 192 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 15 B` | visible | B1:P30 | 70 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 16 A` | visible | B1:N53 | 313 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `ACCUEIL` | visible | A1:S109 | 1 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 16 B` | visible | B1:J46 | 48 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 16 B bis` | visible | B1:H32 | 39 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 16 C` | visible | B1:H31 | 25 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `controle` | visible | A3:H1490 | 237 | validation | ValidationEngine | partial | Batch 17 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 17` | visible | B1:P42 | 153 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 18` | visible | B1:Q40 | 179 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 19` | visible | B1:P44 | 217 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 20` | visible | B1:M32 | 101 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 21` | visible | B1:P68 | 307 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 22` | visible | B1:N53 | 258 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 23` | visible | B1:K30 | 84 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 24` | visible | B1:K38 | 147 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 25` | visible | B1:L28 | 68 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 26` | visible | B1:L34 | 106 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 27 A` | visible | B1:O32 | 91 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 27 B` | visible | B1:T43 | 98 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 28 A` | visible | B1:M35 | 110 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 28 B` | visible | B1:L46 | 95 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 28 C` | visible | B1:K39 | 77 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 29` | visible | A1:L44 | 189 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 30` | visible | B1:L46 | 201 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 31` | visible | B1:H40 | 77 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 32` | visible | B1:K43 | 40 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 33` | visible | B1:J38 | 31 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 34` | visible | B1:O74 | 432 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 35` | visible | B1:H58 | 63 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 36 TABLEAU DE CODES` | visible | B2:K43 | 28 | calculation | NotesAnnexesEngine | partial_missing_9_36 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CODES ACTIVITES ECONOMIQUES` | visible | C3:F84 | 161 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `TITRE ETATS DGI` | visible | B1:I30 | 1 | display_or_export | ExportPreparationEngine, company/report metadata UI | partial_display_export | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `COMPLEMENT TABLEAU 13` | visible | A1:M54 | 50 | unknown | NotesAnnexesEngine, ExpenseDetailsEngine | missing_helper_logic | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `DETAIL DES CHARGES` | visible | A2:P276 | 2140 | calculation | ExpenseDetailsEngine | partial | Batch 14 |
| `SPEEDY OHADA 2.1.xlsm` | `REPARTIT RESULT PERSONNES` | visible | A1:N53 | 42 | unknown | FiscalEngine, company/report metadata UI | missing | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `COMPLT ENTREPR INDIVID` | visible | B1:L64 | 21 | unknown | FiscalEngine, company/report metadata UI | missing | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `CALCULS FISCAUX` | visible | B1:L169 | 108 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `BIC 1999 PAGE 1` | visible | B1:Q427 | 70 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `BIC 1999 PAGE 2` | visible | B1:M246 | 54 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `BIC 1999 PAGE 3` | visible | A1:M269 | 28 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `PATENTE` | visible | B1:S119 | 117 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `HONORAIRES PAGE  1 ` | visible | B1:CB105 | 46 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `HONORAIRES PAGE 2` | visible | B1:N70 | 13 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTES - MEMORANDUM` | visible | B1:J105 | 3 | calculation | NotesAnnexesEngine, ExpenseDetailsEngine | missing_helper_logic | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `Déclaration DNI (5)` | visible | B2:L47 | 36 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `Déclaration DNI (6)` | visible | B1:G54 | 28 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `Déclaration DNI (7)` | visible | B1:H48 | 20 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `Déclaration DNI (9)` | visible | B1:G41 | 23 | calculation | FiscalEngine | partial | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `B V` | visible | B1:U45 | 37 | unknown | FiscalEngine | partial | Batch 15 |

## High Formula Density Sheets

| Workbook | Sheet | Formulas | Referenced sheets | Implementation target |
| --- | --- | ---: | --- | --- |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE N` | 12156 | FICHE R1 | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE REGROUPE` | 8744 | BALANCE REGROUPE, CLASSE 2, VENTI DES ECARTS DE CONV | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 2` | 3606 | CLASSE 2, BALANCE N | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `BALANCE N-1` | 3000 | FICHE R1 | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 4` | 2994 | CLASSE 4, BALANCE N, CLASSE 1, CLASSE 2, VENTI DES ECARTS DE CONV | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 6` | 2846 | CLASSE 6, BALANCE N | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `DETAIL DES CHARGES` | 2140 | CLASSE 6, ACCUEIL, NOTE 34, COMPLEMENT TABLEAU 13 | Batch 14 |
| `Etats Financiers.xlsm` | `DETAIL DES CHARGES` | 2140 | CLASSE 6, ACCUEIL, NOTE 34, COMPLEMENT TABLEAU 13 | Batch 14 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 1` | 1664 | CLASSE 1, BALANCE N, CLASSE 4, CLASSE 5, VENTI DES ECARTS DE CONV | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 7` | 1344 | CLASSE 7, BALANCE N | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 5` | 884 | BALANCE N, CLASSE 5 | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 3` | 850 | BALANCE N, CLASSE 3 | Batch 9 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 34` | 432 | ACCUEIL, COMPTE DE RESULTAT, PASSIF, NOTE 33, ACTIF, VENTI DES ECARTS DE CONV | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 34` | 432 | ACCUEIL, COMPTE DE RESULTAT, PASSIF, NOTE 33, ACTIF, VENTI DES ECARTS DE CONV | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 16 A` | 407 | NOTE 16 A, CLASSE 1, ACCUEIL, NOTE 15 B, NOTE 8, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CLASSE 8` | 373 | CLASSE 8, BALANCE N, CLASSE 6, CLASSE 7, CLASSE 1, CLASSE 2 | Batch 9 |
| `Etats Financiers.xlsm` | `NOTE 21` | 321 | CLASSE 7, ACCUEIL, NOTE 20, NOTE 21, NOTE 14 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 12` | 318 | NOTE 12, NOTE 11, ACCUEIL, CLASSE 7 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 16 A` | 313 | CLASSE 1, ACCUEIL, NOTE 15 B, NOTE 8, NOTE 14, BALANCE REGROUPE | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 21` | 307 | CLASSE 7, ACCUEIL, NOTE 20, NOTE 14 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 32` | 299 | NOTE 32, NOTE 31, ACCUEIL | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 22` | 272 | CLASSE 6, ACCUEIL, NOTE 21, NOTE 22, NOTE 14 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 19` | 272 | NOTE 19, CLASSE 4, ACCUEIL, NOTE 18, CLASSE 1, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 22` | 258 | CLASSE 6, ACCUEIL, NOTE 21, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `BILAN paysage` | 252 | BALANCE REGROUPE, ACTIF, PASSIF, CLASSE 2, CLASSE 4, CLASSE 1 | Batch 11 |
| `Etats Financiers.xlsm` | `NOTE 15 A` | 252 | NOTE 15 A, CLASSE 1, ACCUEIL, NOTE 14, NOTE 11, BALANCE REGROUPE | Batch 13 |
| `Etats Financiers.xlsm` | `BILAN paysage` | 252 | BALANCE REGROUPE, ACTIF, PASSIF, CLASSE 2, CLASSE 4, CLASSE 1 | Batch 11 |
| `Etats Financiers.xlsm` | `NOTE 33` | 246 | NOTE 33, NOTE 32, ACCUEIL | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 1` | 244 | NOTE 1, ACCUEIL, TABLEAU DE FLUX DE TRESORERIE, NOTES ANNEXES | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 18` | 238 | NOTE 18, ACCUEIL, CLASSE 4, NOTE 17, NOTE 16 A, BALANCE REGROUPE | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `controle` | 237 | BALANCE N, controle, PASSIF, TABLEAU DE FLUX DE TRESORERIE, ACTIF, COMPTE DE RESULTAT | Batch 17 |
| `Etats Financiers.xlsm` | `NOTE 27 B` | 234 | NOTE 27 B, ACCUEIL, NOTE 27 A | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 30` | 220 | CLASSE 8, ACCUEIL, NOTE 29, NOTE 30 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 19` | 217 | CLASSE 4, ACCUEIL, NOTE 18, CLASSE 1, NOTE 14, NOTE 16 B | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 4` | 206 | NOTE 4, ACCUEIL, CLASSE 2, NOTE 3 E, BALANCE REGROUPE, NOTE 3 C | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 30` | 201 | CLASSE 8, ACCUEIL, NOTE 29 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 29` | 201 | ACCUEIL, CLASSE 6, CLASSE 7, NOTE 28 C, NOTE 29, NOTE 27 A | Batch 13 |
| `Etats Financiers.xlsm` | `dirigeants` | 197 | dirigeants, ACCUEIL, FICHE R2, ACTIF | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 15 A` | 192 | CLASSE 1, ACCUEIL, NOTE 14, NOTE 11, BALANCE REGROUPE | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3 A` | 190 | CLASSE 2, NOTE 3 A, ACCUEIL, NOTE 2, ACTIF, BALANCE N | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 29` | 189 | ACCUEIL, CLASSE 6, CLASSE 7, NOTE 28 C, NOTE 27 A | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 7` | 189 | NOTE 7, ACCUEIL, CLASSE 4, NOTE 6, BALANCE REGROUPE, NOTE 5 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8` | 188 | NOTE 8, NOTE 7, ACCUEIL, BALANCE REGROUPE, CLASSE 4, NOTE 5 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 18` | 179 | ACCUEIL, CLASSE 4, NOTE 17, NOTE 16 A, BALANCE REGROUPE, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTES ANNEXES` | 174 | IMPRESSION, ACCUEIL, TABLEAU DE FLUX DE TRESORERIE, FICHE R2 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTES ANNEXES` | 172 | Imprimer, ACCUEIL, TABLEAU DE FLUX DE TRESORERIE, FICHE R2 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `ACTIF` | 171 | ACCUEIL, CLASSE 2, BALANCE REGROUPE, CLASSE 4, dirigeants, CLASSE 5 | Batch 11 |
| `Etats Financiers.xlsm` | `ACTIF` | 171 | ACCUEIL, CLASSE 2, BALANCE REGROUPE, dirigeants, CLASSE 4, ACTIF | Batch 11 |
| `Etats Financiers.xlsm` | `NOTE 31` | 170 | NOTE 31, ACCUEIL, NOTE 30 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 17` | 168 | CLASSE 4, NOTE 17, ACCUEIL, NOTE 16 C, BALANCE REGROUPE, NOTE 16 A | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `CODES ACTIVITES ECONOMIQUES` | 161 | ACCUEIL | Batch 19 |
| `Etats Financiers.xlsm` | `CODES ACTIVITES ECONOMIQUES` | 161 | ACCUEIL | Batch 19 |
| `Etats Financiers.xlsm` | `NOTE 3 E` | 158 | NOTE 3 E, NOTE 3 D, ACCUEIL, CLASSE 1 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 24` | 158 | CLASSE 6, NOTE 23, ACCUEIL, NOTE 24 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 7` | 153 | ACCUEIL, CLASSE 4, NOTE 6, BALANCE REGROUPE, NOTE 5, NOTE 4 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 17` | 153 | CLASSE 4, ACCUEIL, NOTE 16 C, BALANCE REGROUPE, NOTE 16 A, NOTE 16 B | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 11` | 152 | CLASSE 5, NOTE 10, ACCUEIL, NOTE 11 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 A` | 147 | CLASSE 2, ACCUEIL, NOTE 2, ACTIF, BALANCE N, CLASSE 1 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 24` | 147 | CLASSE 6, NOTE 23, ACCUEIL | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `COMPTE DE RESULTAT` | 146 | ACCUEIL, CLASSE 6, CLASSE 7, CLASSE 8, PASSIF, BILAN paysage | Batch 11 |
| `Etats Financiers.xlsm` | `COMPTE DE RESULTAT` | 146 | ACCUEIL, CLASSE 6, CLASSE 7, CLASSE 8, PASSIF, BILAN paysage | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 8` | 142 | NOTE 7, ACCUEIL, BALANCE REGROUPE, CLASSE 4, NOTE 5, CLASSE 1 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 11` | 142 | CLASSE 5, NOTE 10, ACCUEIL | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 13` | 141 | NOTE 13, NOTE 12, ACCUEIL, NOTE 11, CLASSE 1 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 12` | 131 | NOTE 11, ACCUEIL, CLASSE 7, CLASSE 4, FICHE R1 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 4` | 128 | ACCUEIL, CLASSE 2, NOTE 3 E, BALANCE REGROUPE, NOTE 3 C, NOTE 3 D | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 8 A` | 124 | NOTE 8 A, ACCUEIL, NOTE 8 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 6` | 123 | NOTE 5, ACCUEIL, NOTE 6, CLASSE 3, BALANCE REGROUPE | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 28 B` | 121 | CLASSE 2, NOTE 28 B, ACCUEIL, NOTE 28 A, NOTE 27 A | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `FICHE R2` | 120 | RENSEIGNEMENT, ACCUEIL, FICHE R1, COMPTE DE RESULTAT | Batch 19 |
| `Etats Financiers.xlsm` | `NOTE 28 A` | 120 | CLASSE 1, ACCUEIL, NOTE 27 B, CLASSE 4, NOTE 28 A, CLASSE 5 | Batch 13 |
| `Etats Financiers.xlsm` | `FICHE R2` | 120 | RENSEIGNEMENT, ACCUEIL, FICHE R1, COMPTE DE RESULTAT | Batch 19 |
| `Etats Financiers.xlsm` | `NOTE 3 D` | 118 | ACCUEIL, NOTE 3 C, NOTE 3 D, NOTE 3 A, NOTE 3C Bis, CLASSE 8 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `PATENTE` | 117 | ACCUEIL, TABLE CONVERSION, FICHE IDENTIFICATION 1 OK, ETAT ANNEXE | Batch 15 |
| `Etats Financiers.xlsm` | `NOTE 26` | 117 | CLASSE 6, NOTE 25, ACCUEIL, NOTE 26 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 6` | 111 | NOTE 5, ACCUEIL, CLASSE 3, BALANCE REGROUPE, NOTE 6 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 5` | 111 | NOTE 4, ACCUEIL, CLASSE 4, BALANCE REGROUPE, NOTE 5 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 20` | 111 | NOTE 19, ACCUEIL, CLASSE 5, NOTE 20, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 28 A` | 110 | CLASSE 1, ACCUEIL, NOTE 27 B, CLASSE 4, CLASSE 5 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `FICHE R1` | 110 | RENSEIGNEMENT, ACCUEIL, PAGE DE GARDE | Batch 19 |
| `Etats Financiers.xlsm` | `NOTE 9` | 110 | CLASSE 5, ACCUEIL, NOTE 9, NOTE 8 C, NOTE 8 A, NOTE 8 | Batch 13 |
| `Etats Financiers.xlsm` | `FICHE R1` | 110 | RENSEIGNEMENT, ACCUEIL, PAGE DE GARDE | Batch 19 |
| `SPEEDY OHADA 2.1.xlsm` | `CALCULS FISCAUX` | 108 | ACCUEIL, TABLE CONVERSION | Batch 15 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 26` | 106 | CLASSE 6, NOTE 25, ACCUEIL | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 5` | 105 | NOTE 4, ACCUEIL, CLASSE 4, BALANCE REGROUPE | Batch 13 |
| `Etats Financiers.xlsm` | `TABLEAU DE FLUX DE TRESORERIE` | 105 | ACCUEIL, Feuil2, COMPTE DE RESULTAT, VENTI DES ECARTS DE CONV, CAPITAL, TABLEAU DE FLUX DE TRESORERIE | Batch 12 |
| `SPEEDY OHADA 2.1.xlsm` | `TABLEAU DE FLUX DE TRESORERIE` | 104 | ACCUEIL, Feuil2, COMPTE DE RESULTAT, VENTI DES ECARTS DE CONV, CAPITAL, BALANCE REGROUPE | Batch 12 |
| `Etats Financiers.xlsm` | `NOTE 3 C` | 103 | CLASSE 2, ACCUEIL, NOTE 3 B, NOTE 3 C, NOTE 3 A | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 27 A` | 103 | NOTE 26, CLASSE 6, NOTE 27 A, ACCUEIL | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 10` | 103 | NOTE 9, CLASSE 5, ACCUEIL, NOTE 10 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `PASSIF` | 102 | ACCUEIL, BALANCE REGROUPE, ACTIF, CLASSE 1, CLASSE 4, CLASSE 5 | Batch 11 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 3 D` | 102 | ACCUEIL, NOTE 3 C, NOTE 3 A, NOTE 3C Bis, CLASSE 8 | Batch 13 |
| `Etats Financiers.xlsm` | `PASSIF` | 102 | ACCUEIL, BALANCE REGROUPE, ACTIF, CLASSE 1, CLASSE 4, CLASSE 5 | Batch 11 |
| `Etats Financiers.xlsm` | `NOTE 15 B` | 102 | NOTE 15 B, NOTE 15 A, ACCUEIL, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 20` | 101 | NOTE 19, ACCUEIL, CLASSE 5, NOTE 14 | Batch 13 |
| `SPEEDY OHADA 2.1.xlsm` | `NOTE 9` | 100 | CLASSE 5, ACCUEIL, NOTE 8 C, NOTE 8 A, NOTE 8 | Batch 13 |
| `Etats Financiers.xlsm` | `NOTE 3C Bis` | 100 | CLASSE 2, ACCUEIL, NOTE 3 C, NOTE 3C Bis | Batch 13 |

## Coverage Notes

- Sheets marked `partial` already have an app engine or UI area, but the implementation does not yet match workbook depth.
- Sheets marked `missing_depth` need workbook-equivalent calculation modules or much deeper rule coverage.
- Sheets marked `missing` have no complete equivalent in the app yet.
- Sheets marked `display_or_export` may include metadata, print layout, or export template logic rather than accounting calculations.
- `formula-catalog.json` contains formula samples and cross-sheet references for implementation work.
