# SYSCOHADA FINANCIAL STATEMENTS WEB APPLICATION
## COMPLETE DATA FILE — ALL REFERENCE DATA

This file contains all reference data that the application needs to function. It replaces all Excel files (Etats_Financiers.xlsm, SPEEDY_OHADA_2_1.xlsm, FICHIER_TFT.xlsx, Regroupement_des_Comptes_Reforme.xlsx, liste_de_comptes.xlsx) since the IDE cannot read Excel files. Load this data into the application's database or configuration files on startup.

---

# DATA SECTION 1 — INCOME STATEMENT ACCOUNT MAPPING
(Regroupement Compte de Résultat)

Each row defines: REF code | Statement line label | Sign applied | SYSCOHADA accounts that contribute

| REF | Label | Sign | Accounts |
|---|---|---|---|
| TA | Ventes de marchandises | CREDIT | 701, 7011, 7012, 7013, 7014, 7015, 7016 minus 7019 |
| RA | Achats de marchandises | DEBIT negative | 601, 6011, 6012, 6013, 6014, 6015 minus 6019 |
| RB | Variation stocks marchandises | NET | 6031 (debit=negative, credit=positive) |
| XA | MARGE COMMERCIALE | COMPUTED | TA + RA + RB |
| TB | Ventes de produits fabriqués | CREDIT | 702, 7021, 7022, 7023, 7024, 7025, 7026 minus 7029 |
| TC | Travaux, services vendus | CREDIT | 703, 705, 7051, 7052, 7053, 7054, 7055, 7056, 706 |
| TD | Produits accessoires | CREDIT | 707, 7071, 7072, 7073, 7074, 7075, 7076, 7077, 7078 |
| XB | CHIFFRE D'AFFAIRES | COMPUTED | TA + TB + TC + TD |
| TE | Production stockée/déstockage | NET | 73, 731, 732, 733, 734, 735, 736, 737 (credit=positive, debit=negative) |
| TF | Production immobilisée | CREDIT | 72, 721, 722, 724, 728 |
| TG | Subventions d'exploitation | CREDIT | 71, 711, 712, 713, 714, 715, 716, 717, 718 |
| TH | Autres produits | CREDIT | 75, 751, 754, 756, 757, 758 |
| TI | Transferts charges exploitation | CREDIT | 781 |
| RC | Achats matières premières | DEBIT negative | 602, 6021, 6022, 6023, 6024, 6025 minus 6029 |
| RD | Variation stocks matières | NET | 6032 (debit=negative, credit=positive) |
| RE | Autres achats | DEBIT negative | 604, 6041, 6042, 6043, 6044, 6045, 6046, 6047, 6049, 605, 6051, 6052, 6053, 6054, 6055, 6056, 6057, 6058, 6059, 608, 6081, 6082, 6083, 6085 minus 6089 |
| RF | Variation stocks autres | NET | 6033 (debit=negative, credit=positive) |
| RG | Transports | DEBIT negative | 61, 6120, 6130, 6140, 6160, 6181, 6182, 6183 |
| RH | Services extérieurs | DEBIT negative | 62, 6210, 6221, 6222, 6223, 6224, 6225, 6226, 6228, 6232, 6233, 6234, 6238, 6241, 6242, 6243, 6244, 6248, 6251, 6252, 6253, 6254, 6255, 6257, 6258, 6261, 6265, 6266, 6271, 6272, 6273, 6274, 6275, 6276, 6277, 6278, 6281, 6282, 6283, 6288, 63, 6311, 6312, 6313, 6314, 6315, 6316, 6317, 6318, 6322, 6324, 6325, 6326, 6327, 6328, 6330, 6342, 6343, 6344, 6345, 6346, 6351, 6358, 6371, 6372, 6381, 6382, 6383, 6384, 6385, 6388 |
| RI | Impôts et taxes | DEBIT negative | 64, 6411, 6412, 6413, 6414, 6415, 6418, 6450, 6461, 6462, 6463, 6464, 6468, 6471, 6472, 6473, 6474, 6478, 6480 |
| RJ | Autres charges | DEBIT negative | 65, 6511, 6515, 6521, 6525, 6541, 6542, 6560, 6570, 6581, 6582, 6583, 6588, 6591, 6593, 6594, 6598 |
| XC | VALEUR AJOUTÉE | COMPUTED | (XB+RA+RB)+(TE+TF+TG+TH+TI+RC+RD+RE+RF+RG+RH+RI+RJ) |
| RK | Charges de personnel | DEBIT negative | 66, 6611, 6612, 6613, 6614, 6615, 6616, 6617, 6618, 6621, 6622, 6623, 6624, 6625, 6626, 6627, 6628, 6631, 6632, 6633, 6634, 6638, 6641, 6642, 6661, 6662, 6671, 6672, 6681, 6682, 6683, 6684, 6685, 6686, 6687, 6688 |
| XD | EXCÉDENT BRUT D'EXPLOITATION | COMPUTED | XC + RK |
| TJ | Reprises amortissements/provisions | CREDIT | 791, 7911, 7913, 7914, 798 |
| RL | Dotations amortissements/provisions | DEBIT negative | 681, 6812, 6813, 691, 6911, 6913, 6914 (EXCLUDING 697, 6971, 6972) |
| XE | RÉSULTAT D'EXPLOITATION | COMPUTED | XD + TJ + RL |
| TK | Revenus financiers | CREDIT | 77, 771, 772, 773, 774, 776, 777, 778 |
| TR | Reprises provisions financières | CREDIT | 797, 7971, 7972 |
| TM | Transferts charges financières | CREDIT | 787 |
| RM | Frais financiers | DEBIT negative | 67, 6711, 6712, 6713, 6714, 6722, 6723, 6724, 6728, 6730, 6741, 6742, 6743, 6744, 6745, 6748, 6750, 6760, 6771, 6772, 6781, 6782, 6784, 6791, 6795, 6798 |
| RN | Dotations provisions financières | DEBIT negative | 697, 6971, 6972 |
| XF | RÉSULTAT FINANCIER | COMPUTED | TK + TR + TM + RM + RN |
| XG | RÉSULTAT ACTIVITÉS ORDINAIRES | COMPUTED | XE + XF |
| TN | Produits cessions immobilisations | CREDIT | 82, 821, 822, 826, 828 |
| TO | Autres produits HAO | CREDIT | 84, 841, 842, 843, 844, 845, 848, 86, 861, 862, 863, 864, 865, 866, 867, 868, 88, 881, 882, 883, 884, 885, 886, 887, 888 |
| RO | VCN cessions immobilisations | DEBIT negative | 81, 811, 812, 813, 814, 815, 816, 817, 818 |
| RP | Autres charges HAO | DEBIT negative | 83, 831, 832, 833, 834, 835, 836, 837, 838, 85, 851, 852, 853, 854, 855, 856, 857, 858 |
| XH | RÉSULTAT HAO | COMPUTED | TN + TO + RO + RP |
| RQ | Participation travailleurs | DEBIT negative | 87, 871, 872, 873, 874, 875, 876, 877, 878 |
| RS | Impôt sur le résultat | DEBIT negative | 891 |
| XI | RÉSULTAT NET | COMPUTED | XG + XH + RQ + RS |

---

# DATA SECTION 2 — BALANCE SHEET ACTIF MAPPING

Each row defines: REF | Label | Gross accounts | Amortization/Depreciation accounts | NET rule

## Immobilisations Incorporelles

| REF | Label | GROSS Accounts | AMORT Accounts | NET |
|---|---|---|---|---|
| AE | Frais de développement et de prospection | 201, 202 | 2801, 2802 | GROSS − AMORT |
| AF | Brevets, licences, logiciels et droits similaires | 211, 212, 213, 214, 215 | 2811, 2812, 2813, 2814, 2815 | GROSS − AMORT |
| AG | Fonds commercial et droit au bail | 216, 217 | 2816, 2817 | GROSS − AMORT |
| AH | Autres immobilisations incorporelles | 218 | 2818 | GROSS − AMORT |
| AD | TOTAL IMMOB INCORPORELLES | SUM(AE,AF,AG,AH) gross | SUM(AE,AF,AG,AH) amort | SUM(AE,AF,AG,AH) net |

## Immobilisations Corporelles

| REF | Label | GROSS Accounts | AMORT Accounts | NET | Special |
|---|---|---|---|---|---|
| AJ | Terrains | 221,222,223,224,225,226,228 | 2821,2822,2823,2824,2825,2826,2828 | GROSS−AMORT | Sub-line: account 225 net = "dont placement en NET" |
| AK | Bâtiments | 231,232,233,234,235,238 | 2831,2832,2833,2834,2835,2838 | GROSS−AMORT | Sub-line: account 235 net = "dont placement en NET" |
| AL | Aménagement, agencement et installation | 241,242,243,244 | 2841,2842,2843,2844 | GROSS−AMORT | — |
| AM | Matériel, mobilier et actif biologique | 245,246,247,248 | 2845,2846,2847,2848 | GROSS−AMORT | — |
| AN | Matériel de transport | 251,252,253 | 285 | GROSS−AMORT | — |
| AI | TOTAL IMMOB CORPORELLES | SUM(AJ,AK,AL,AM,AN) gross | SUM amort | SUM net | — |
| AP | Avances et acomptes sur immobilisations | 261,262 | NONE | GROSS only | No amortization |

## Immobilisations Financières

| REF | Label | GROSS Accounts | DEPRECIATION Accounts | NET |
|---|---|---|---|---|
| AR | Titres de participation | 261, 262 | 2961, 2962 | GROSS − DEPREC |
| AS | Autres immobilisations financières | 271,272,273,274,275,276,277,278 | 2971,2972,2973,2974,2975,2976,2977,2978 | GROSS − DEPREC |
| AQ | TOTAL IMMOB FINANCIÈRES | SUM(AR,AS) gross | SUM deprec | SUM net |

**AZ: TOTAL ACTIF IMMOBILISÉ = AD + AI + AP + AQ (all three columns separately)**

## Actif Circulant

| REF | Label | NET Accounts | DEPRECIATION Accounts | Rule |
|---|---|---|---|---|
| BA | Actif Circulant HAO | 488 | 498 | 488 minus 498 |
| BB | Stocks et Encours | 31,32,33,34,35,36,37,38 | 391,392,393,394,395,396,397,398 | GROSS − DEPREC |
| BH | Fournisseurs avances versées | 409 | NONE | Debit balance only |
| BI | Clients | 411,412,413,414,415,416,417,418 | 491 | GROSS − DEPREC |
| BJ | Autres créances | 421,422,423,424,425,426,431,432,433,434,438,441,442,443,444,445,446,447,448,451,452,453,454,455,456,457,458,461,462,464,465,467,468,4711,4712,476 | 492,493,494,495,496,497 | GROSS − DEPREC |
| BK | TOTAL ACTIF CIRCULANT | SUM(BA,BB,BH,BI,BJ) | — | COMPUTED |

## Trésorerie Actif

| REF | Label | NET Accounts | DEPRECIATION | Rule |
|---|---|---|---|---|
| BQ | Titres de placement | 501,502,503,504,505,506,507,508 | 591,592,593,594,595,596,597,598 | GROSS − DEPREC |
| BR | Valeurs à encaisser | 511,512,513,514,515,516,517,518 | NONE | Debit balance |
| BS | Banques, chèques, caisse | 521,522,523,524,525,526,531,532,541,551,552,571,572,573,574,575,576,578 | NONE | DEBIT balances ONLY |
| BT | TOTAL TRÉSORERIE ACTIF | SUM(BQ,BR,BS) | — | COMPUTED |

**BU: Écart de conversion Actif | Account: 476 | Debit balance**
**BZ: TOTAL GÉNÉRAL ACTIF = AZ + BK + BT + BU**

---

# DATA SECTION 3 — BALANCE SHEET PASSIF MAPPING

| REF | Label | Accounts | Direction | Notes |
|---|---|---|---|---|
| CA | Capital | 101,102,103,104 (EXCLUDING 109) | CREDIT | Includes 1011-1018, 1021-1028, 103, 104x |
| CB | Apporteurs capital non appelé | 109 | DEBIT shown as NEGATIVE | Deducted from capitaux propres |
| CD | Primes liées au capital | 105 | CREDIT | 1051,1052,1053,1054,1058 |
| CE | Écart de réévaluation | 106 | CREDIT | 1061,1062 |
| CF | Réserves indisponibles | 111,112,113 | CREDIT | 1131,1132,1133,1134,1138 |
| CG | Réserves libres | 118 | CREDIT | 1181,1188 |
| CH | Report à nouveau | 121 (SC positive), 129 (SD negative) | CREDIT=positive DEBIT=negative | Show with sign |
| CJ | Résultat net exercice | COMPUTED from XI (N) / Account 13 (N-1) | WITH SIGN | Bénéfice positive, Perte negative |
| CL | Subventions d'investissement | 14 (141-148) | CREDIT | — |
| CM | Provisions réglementées | 15 (151-158) | CREDIT | — |
| CP | TOTAL CAPITAUX PROPRES | COMPUTED | — | CA+CB+CD+CE+CF+CG+CH+CJ+CL+CM |
| DA | Emprunts et dettes financières | 161,162,163,164,165,166,167,168,169,181,182,183,184 | CREDIT | — |
| DB | Dettes location-acquisition | 171,172,173,174,176,178 | CREDIT | — |
| DC | Provisions risques et charges | 191,192,193,194,195,196,197,198,199 | CREDIT | — |
| DD | TOTAL DETTES FINANCIÈRES | COMPUTED | — | DA+DB+DC |
| DF | TOTAL RESSOURCES STABLES | COMPUTED | — | CP+DD |
| DH | Dettes circulantes HAO | 484,485 | CREDIT | — |
| DI | Clients avances reçues | 419 | CREDIT | — |
| DJ | Fournisseurs d'exploitation | 401,402,403,404,405,406,407,408 | CREDIT | NOT 409 (that's BH) |
| DK | Dettes fiscales et sociales | 421,422,423,424,425,426,431,432,433,434,438,441,442,443,444,445,446,447,448 | CREDIT | — |
| DM | Autres dettes | 451,452,453,454,455,456,457,458,461,462,464,465,467,468,471,472,473,474,475,478 | CREDIT | — |
| DN | Provisions risques court terme | 499,599 | CREDIT | — |
| DP | TOTAL PASSIF CIRCULANT | COMPUTED | — | DH+DI+DJ+DK+DM+DN |
| DQ | Banques crédits d'escompte | 564,565 | CREDIT | — |
| DR | Banques crédits trésorerie | 561,562,563,566,567,568 | CREDIT | — |
| DT | TOTAL TRÉSORERIE PASSIF | COMPUTED | — | DQ+DR |
| DV | Écart de conversion passif | 477 | CREDIT | — |
| DZ | TOTAL GÉNÉRAL PASSIF | COMPUTED | — | DF+DP+DT+DV |

---

# DATA SECTION 4 — CASH FLOW STATEMENT FORMULAS

| REF | Label | Formula | Data Source |
|---|---|---|---|
| ZA | Trésorerie nette 1er janvier | (BT_N-1 − DT_N-1) + [S(4786) − S(4726) − S(4797)] at N-1 | Prior year Balance Sheet |
| FA | CAFG | XD + TK + TM + TO − S(86) + RM + RP + S(85) + RQ + RS + S(654) − S(754) | Income Statement |
| FB | Variation actif HAO | −(BA_N − BA_N-1) | Two Balance Sheets |
| FC | Variation stocks | −(BB_N − BB_N-1) | Two Balance Sheets |
| FD | Variation créances | −([BG + SD(47811,276) − SD(414,4494,458,461,467,4751) − SC(47911)]_N − same_N-1) | Two Balance Sheets |
| FE | Variation passif circulant | [DH'+DI'+DJ'+DK'+DM'+DN+4793+4798−4783+S(176)]_N − same_N-1. DH'=S(484,4998); DJ'=DJ−S(404); DK'=DK−S(4493,4494,4497,4499); DM'=DM−S(4726,461,465,4752)−MD(4713) | Two Balance Sheets |
| ZB | FLUX OPÉRATIONNELS | FA+FB+FC+FD+FE | COMPUTED |
| FF | Acquisitions immob incorporelles | −(Note3A_B_incorp + Note3A_B_avances_incorp − Note3A_E_avances_incorp − [S(4811,4821,4041,4046,48161,48171,48181)_N − same_N-1]) | Note 3A |
| FG | Acquisitions immob corporelles | −(Note3A_B_corp + Note3A_B_avances_corp − Note3A_E_avances_corp − Note3B_B_total − [S(4812,4822,4042,4047,47918,47938,48162,48172,48182)_N − same_N-1]) | Notes 3A, 3B |
| FH | Acquisitions immob financières | −(Note3A_B_fin + [S(4813,4782,−4792,−MD(2714,276))_N − same_N-1]) | Note 3A |
| FI | Cessions incorp et corp | SC(754,821,822) − [SD(414,485,−4856)_N − SD(414,485,−4856)_N-1] | Trial Balance |
| FJ | Cessions financières | SC(826) + [−SD(4856)_N + SD(4856)_N-1] + MC(27 excl.2714,2766) | Trial Balance movements |
| ZC | FLUX INVESTISSEMENT | FF+FG+FH+FI+FJ | COMPUTED |
| FK | Augmentations capital | [CA+CB−SD(4613,4619,467,4581)]_N − same_N-1 (set to 0 if negative) | Balance Sheets |
| FL | Subventions reçues | MC(14) − [SD(4582,4494)_N − SD(4582,4494)_N-1] | Trial Balance movements |
| FM | Prélèvements capital | FK if FK<0 (absolute value); else (CF+CG+CH)_N−(CF+CG+CH+CJ)_N-1+MC(465) | Balance Sheets |
| FN | Dividendes versés | −MD(465) | Trial Balance movements |
| ZD | FLUX CAPITAUX PROPRES | FK+FL+FM+FN | COMPUTED |
| FO | Emprunts nouveaux | MC(161,162)−SD(4784)−MD(4713)−MD(4794)−(S(166)_N−S(166)_N-1) | Trial Balance movements |
| FP | Autres dettes financières | MC(163,164,165,181,182,183,184) | Trial Balance movements |
| FQ | Remboursements | −MD(16,17,181,182,183,184)+SC(4794) | Trial Balance movements |
| ZE | FLUX CAPITAUX ÉTRANGERS | FO+FP+FQ | COMPUTED |
| ZF | FLUX FINANCEMENT | ZD+ZE | COMPUTED |
| ZG | VARIATION TRÉSORERIE | ZB+ZC+ZF | COMPUTED |
| ZH | TRÉSORERIE 31 DÉCEMBRE | ZA+ZG | COMPUTED |
| CTRL | Control check | ZH must equal (BT_N−DT_N)+[S(4786)−S(4726)−S(4797)]_N | Must match |

---

# DATA SECTION 5 — COMPLETE SYSCOHADA CHART OF ACCOUNTS

## CLASS 1 — RESSOURCES DURABLES

```
10  CAPITAL
    101  Capital social
         1011  Capital souscrit, non appelé
         1012  Capital souscrit, appelé, non versé
         1013  Capital souscrit, appelé, versé, non amorti
         1014  Capital souscrit, appelé, versé, amorti
         1018  Capital souscrit soumis à conditions particulières
    102  Capital par dotation
         1021  Dotation initiale
         1022  Dotations complémentaires
         1028  Autres dotations
    103  Capital personnel
    104  Compte de l'exploitant
         1041  Apports temporaires
         1042  Opérations courantes
         1043  Rémunérations, impôts et autres charges personnelles
         1047  Prélèvements d'autoconsommation
         1048  Autres prélèvements
    105  Primes liées au capital social
         1051  Primes d'émission
         1052  Primes d'apport
         1053  Primes de fusion
         1054  Primes de conversion
         1058  Autres primes
    106  Écarts de réévaluation
         1061  Écarts de réévaluation légale
         1062  Écarts de réévaluation libre
    109  Apporteurs, capital souscrit, non appelé

11  RÉSERVES
    111  Réserve légale
    112  Réserves statutaires ou contractuelles
    113  Réserves réglementées
         1131  Réserves de plus-values nettes à long terme
         1132  Réserves d'attribution gratuite d'actions au personnel salarié et aux dirigeants
         1133  Réserves consécutives à l'octroi de subventions d'investissement
         1134  Réserves des valeurs mobilières donnant accès au capital
         1138  Autres réserves réglementées
    118  Autres réserves
         1181  Réserves facultatives
         1188  Réserves diverses

12  REPORT À NOUVEAU
    121  Report à nouveau créditeur (solde créditeur = positive)
    129  Report à nouveau débiteur (solde débiteur = shown negative)

13  RÉSULTAT NET DE L'EXERCICE
    131  Résultat net bénéfice
    139  Résultat net perte

14  SUBVENTIONS D'INVESTISSEMENT
    141  Subventions État
    142  Subventions Régions
    143  Subventions Départements
    144  Subventions Communes et collectivités
    145  Subventions entités publiques ou mixtes
    146  Subventions entités et organismes privés
    147  Subventions organismes internationaux
    148  Autres subventions

15  PROVISIONS RÉGLEMENTÉES
    151  Amortissements dérogatoires
    152  Plus-values de cession à réinvestir
    153  Provision spéciale de réévaluation
    154  Provisions réglementées relatives aux immobilisations
    155  Provisions réglementées relatives aux stocks
    156  Provision pour investissement
    158  Autres provisions et fonds réglementés

16  EMPRUNTS ET DETTES FINANCIÈRES DIVERSES
    161  Emprunts obligataires convertibles
    162  Autres emprunts obligataires
    163  Emprunts et dettes auprès des établissements de crédit
    164  Dettes rattachées à des participations
    165  Dépôts et cautionnements reçus
    166  Intérêts courus sur emprunts et dettes
    167  Emprunts et dettes assortis de conditions particulières
    168  Autres emprunts et dettes financières
    169  Primes de remboursement des obligations

17  DETTES DE LOCATION-ACQUISITION
    171  Dettes de crédit-bail immobilier
    172  Dettes de crédit-bail mobilier
    173  Dettes sur contrats de location-vente
    174  Dettes sur contrats de location-acquisition (autres)
    176  Intérêts courus sur dettes de location-acquisition
    178  Autres dettes de location-acquisition

18  DETTES LIÉES AU FINANCEMENT
    181  Titres participatifs
    182  Avances conditionnées
    183  Titres Subordonnés à Durée Indéterminée (TSDI)
    184  Obligations Remboursables en Actions (ORA)

19  PROVISIONS POUR RISQUES ET CHARGES
    191  Provisions pour litiges
    192  Provisions pour garanties données aux clients
    193  Provisions pour pertes sur marchés à achèvement futur
    194  Provisions pour pertes de change
    195  Provisions pour impôts
    196  Provisions pour pensions et obligations similaires
    197  Provisions pour restructuration
    198  Autres provisions pour risques et charges
    199  Provisions diverses
```

## CLASS 2 — IMMOBILISATIONS

```
20  CHARGES IMMOBILISÉES
    201  Frais de développement
    202  Frais de prospection

21  IMMOBILISATIONS INCORPORELLES
    211  Brevets
    212  Licences
    213  Logiciels
    214  Marques
    215  Droits et valeurs similaires
    216  Fonds commercial
    217  Droit au bail
    218  Autres immobilisations incorporelles

22  TERRAINS
    221  Terrains agricoles et forestiers
    222  Terrains nus
    223  Terrains bâtis
    224  Terrains de gisement
    225  Terrains — immeubles de placement
    226  Aménagements de terrains
    228  Autres terrains

23  BÂTIMENTS
    231  Bâtiments industriels sur sol propre
    232  Bâtiments industriels sur sol d'autrui
    233  Bâtiments commerciaux sur sol propre
    234  Bâtiments commerciaux sur sol d'autrui
    235  Bâtiments — immeubles de placement
    238  Autres bâtiments

24  MATÉRIEL
    241  Matériel et outillage industriel et commercial
    242  Matériel et outillage artisanal et agricole
    243  Installations et agencements
    244  Aménagements divers
    245  Matériel de bureau
    246  Mobilier et matériel de bureau
    247  Matériel informatique
    248  Actifs biologiques

25  MATÉRIEL DE TRANSPORT
    251  Véhicules automobiles
    252  Matériel de transport spécialisé
    253  Autres matériels de transport

26  TITRES DE PARTICIPATION
    261  Titres de participation (sociétés contrôlées)
    262  Autres titres de participation

27  AUTRES IMMOBILISATIONS FINANCIÈRES
    271  Titres immobilisés (droit de propriété)
    272  Titres immobilisés (droit de créance)
    273  Prêts et créances diverses à long terme
    274  Prêts au personnel
    275  Dépôts et cautionnements versés
    276  Créances sur l'État (long terme)
    277  Titres immobilisés de l'activité de portefeuille
    278  Autres immobilisations financières

28  AMORTISSEMENTS DES IMMOBILISATIONS
    280  Amortissements des charges immobilisées
         2801  Amortissements frais de développement
         2802  Amortissements frais de prospection
    281  Amortissements immobilisations incorporelles
         2811  Amortissements brevets
         2812  Amortissements licences
         2813  Amortissements logiciels
         2814  Amortissements marques
         2815  Amortissements droits similaires
         2816  Amortissements fonds commercial
         2817  Amortissements droit au bail
         2818  Amortissements autres incorporelles
    282  Amortissements terrains
         2821  Amortissements terrains agricoles
         2822  Amortissements terrains nus
         2823  Amortissements terrains bâtis
         2824  Amortissements terrains de gisement
         2825  Amortissements terrains immeubles placement
         2826  Amortissements aménagements terrains
         2828  Amortissements autres terrains
    283  Amortissements bâtiments
         2831  Amortissements bâtiments industriels sol propre
         2832  Amortissements bâtiments industriels sol autrui
         2833  Amortissements bâtiments commerciaux sol propre
         2834  Amortissements bâtiments commerciaux sol autrui
         2835  Amortissements bâtiments immeubles placement
         2838  Amortissements autres bâtiments
    284  Amortissements matériel
         2841  Amortissements matériel outillage industriel
         2842  Amortissements matériel outillage artisanal
         2843  Amortissements installations agencements
         2844  Amortissements aménagements divers
         2845  Amortissements matériel bureau
         2846  Amortissements mobilier
         2847  Amortissements matériel informatique
         2848  Amortissements actifs biologiques
    285  Amortissements matériel de transport
    287  Amortissements autres immobilisations financières
         2871  Amortissements titres immobilisés propriété
         2872  Amortissements titres immobilisés créance
         2873  Amortissements prêts créances LT
         2874  Amortissements prêts personnel
         2875  Amortissements dépôts cautionnements
         2876  Amortissements créances État LT
         2877  Amortissements titres portefeuille
         2878  Amortissements autres immob financières

29  DÉPRÉCIATIONS DES IMMOBILISATIONS
    291  Dépréciations immobilisations incorporelles
    292  Dépréciations terrains
    293  Dépréciations bâtiments
    294  Dépréciations matériel
    295  Dépréciations matériel de transport
    296  Dépréciations titres de participation
    297  Dépréciations autres immobilisations financières
    298  Dépréciations avances et acomptes sur immobilisations
```

## CLASS 3 — STOCKS ET EN-COURS

```
31  MARCHANDISES
32  MATIÈRES PREMIÈRES ET FOURNITURES LIÉES
33  AUTRES APPROVISIONNEMENTS
34  PRODUITS EN COURS
35  SERVICES EN COURS
36  PRODUITS FINIS
37  PRODUITS INTERMÉDIAIRES ET RÉSIDUELS
38  STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DÉPÔT

39  DÉPRÉCIATIONS DES STOCKS
    391  Dépréciations marchandises
    392  Dépréciations matières premières
    393  Dépréciations autres approvisionnements
    394  Dépréciations produits en cours
    395  Dépréciations services en cours
    396  Dépréciations produits finis
    397  Dépréciations produits intermédiaires
    398  Dépréciations stocks en cours de route
```

## CLASS 4 — COMPTES DE TIERS

```
40  FOURNISSEURS ET COMPTES RATTACHÉS
    401  Fournisseurs, dettes en compte (hors groupe)
    402  Fournisseurs, effets à payer
    403  Fournisseurs, sous-traitants
    404  Fournisseurs d'immobilisations
    405  Fournisseurs, réserve de propriété
    406  Fournisseurs, retenue de garantie
    407  Fournisseurs, factures litigieuses
    408  Fournisseurs, factures non parvenues
    409  Fournisseurs débiteurs (avances, acomptes, RRR à obtenir) [ACTIF side BH]

41  CLIENTS ET COMPTES RATTACHÉS
    411  Clients
    412  Clients, effets à recevoir
    413  Clients, réserve de propriété
    414  Créances sur cessions d'immobilisations
    415  Clients, travaux non encore facturables
    416  Créances litigieuses ou douteuses
    417  Clients, factures à établir
    418  Clients, produits à recevoir
    419  Clients, avances reçues [PASSIF side DI]
    491  Dépréciations des comptes clients

42  PERSONNEL
    421  Personnel, rémunérations dues
    422  Personnel, avances et acomptes
    423  Personnel, oppositions
    424  Personnel, œuvres sociales
    425  Personnel, dépôts
    426  Personnel, autres dettes

43  ORGANISMES SOCIAUX
    431  Caisse de sécurité sociale
    432  Caisse de retraite
    433  Mutuelle de santé
    434  Assurance retraite
    438  Autres organismes sociaux

44  ÉTAT ET COLLECTIVITÉS PUBLIQUES
    441  État, impôts sur les bénéfices
    442  État, autres impôts et taxes
    443  État, TVA collectée
    444  État, TVA déductible
    445  État, TVA à décaisser / crédit de TVA
    446  État, autres taxes sur le chiffre d'affaires
    447  État, impôts retenus à la source
    448  État, autres créances et dettes

45  ORGANISMES INTERNATIONAUX
    451  Organismes internationaux, dettes
    452  Organismes internationaux, créances
    453-458  Autres organismes internationaux

46  ASSOCIÉS ET GROUPE
    461  Associés, comptes courants
    462  Associés, opérations faites en commun
    463  Associés, opérations sur capital
    464  Associés, dividendes à payer
    465  Associés, dividendes versés (mouvement débit = dividendes payés)
    467  Groupe, comptes courants
    468  Groupe, autres comptes

47  DÉBITEURS ET CRÉDITEURS DIVERS
    471  Débiteurs divers
    472  Créditeurs divers
    473  Chèques à encaisser
    474  Versements restant à effectuer sur titres non libérés
    475  Compte transitoire
         4752  Compte transitoire, ajustement spécial lié à la révision du SYSCOHADA (compte passif)
    476  Écarts de conversion — actif (perte latente de change) [→ BU on Bilan]
    477  Écarts de conversion — passif (gain latent de change) [→ DV on Bilan]
    478  Autres débiteurs et créditeurs divers
    4711  Débiteurs divers (short term)
    4712  Créditeurs divers (short term)

48  CRÉANCES ET DETTES DIVERSES HAO
    481  Créances HAO diverses
    484  Dettes fournisseurs d'investissement [→ DH on Bilan]
    485  Autres dettes HAO [→ DH on Bilan]
    488  Actifs transitoires HAO [→ BA on Bilan, gross]
    498  Passifs transitoires HAO [→ BA on Bilan, deducted]

49  DÉPRÉCIATIONS ET PROVISIONS POUR RISQUES CT
    491  Dépréciations clients [applies to 411-418]
    492  Dépréciations personnel
    493  Dépréciations organismes sociaux
    494  Dépréciations État et collectivités
    495  Dépréciations organismes internationaux
    496  Dépréciations associés et groupe
    497  Dépréciations débiteurs divers
    499  Provisions pour risques à court terme [→ DN on Bilan]
```

## CLASS 5 — TRÉSORERIE

```
50  TITRES DE PLACEMENT
    501  Titres du trésor et bons de caisse à court terme
    502  Actions
    503  Obligations
    504  Bons de souscription
    505  Titres négociables hors régions
    506  Intérêts courus sur titres de placement
    507  Autres titres de placement
    508  Autres valeurs assimilées

51  VALEURS À ENCAISSER
    511  Effets à encaisser
    512  Effets à l'encaissement
    513  Chèques à encaisser
    514  Chèques à l'encaissement
    515  Cartes de crédit à encaisser
    516  Autres valeurs à encaisser
    518  Valeurs diverses à encaisser

52  BANQUES
    521  Banques locales [debit=actif, credit=passif via 56]
    522  Autres banques
    523  Banques autres États région
    524  Banques, dépôts à terme
    525  Banques, intérêts courus (debit=actif, credit=passif)
    526  Instruments de trésorerie

53  CHÈQUES POSTAUX
    531  Chèques postaux locaux
    532  Autres chèques postaux

54  AUTRES ÉTABLISSEMENTS FINANCIERS
    541  Établissements financiers

55  INSTRUMENTS MONNAIE ÉLECTRONIQUE
    551  Caisses électronique mobile
    552  Autres instruments monnaie électronique

56  BANQUES, CRÉDITS DE TRÉSORERIE [PASSIF → DQ, DR on Bilan]
    561  Banques, crédits de trésorerie
    562  Banques, autres crédits à court terme
    563  Établissements financiers, crédits
    564  Banques, crédits d'escompte de campagne [→ DQ]
    565  Banques, crédits d'escompte ordinaires [→ DQ]
    566  Banques, intérêts courus (if principal account credit)
    567  Autres crédits de trésorerie
    568  Autres crédits bancaires

57  CAISSE
    571  Caisse siège social
    572  Caisses succursales et agences
    573  Caisses chantiers
    574  Régies d'avances
    575  Virements de fonds internes
    576  Autres caisses
    578  Fonds de caisse divers

59  DÉPRÉCIATIONS DES VALEURS DE PLACEMENT [applies to 50x]
    591  Dépréciations titres de trésor
    592  Dépréciations actions
    593  Dépréciations obligations
    594  Dépréciations bons de souscription
    595  Dépréciations titres négociables hors régions
    596  Dépréciations intérêts courus
    597  Dépréciations autres titres
    598  Dépréciations autres valeurs
```

## CLASS 6 — CHARGES DES ACTIVITÉS ORDINAIRES

```
60  ACHATS ET VARIATIONS DE STOCKS
    601  Achats de marchandises
         6011  Achats marchandises dans l'État partie
         6012  Achats marchandises hors région
         6013  Achats marchandises groupe dans la région
         6014  Achats marchandises groupe hors région
         6015  Frais sur achats marchandises
         6019  Rabais, remises, ristournes obtenus sur marchandises (non ventilés) [DEDUCTED]
    602  Achats de matières premières et fournitures liées
         6021  Dans l'État partie
         6022  Hors région
         6023  Groupe dans la région
         6024  Groupe hors région
         6025  Frais sur achats matières premières
         6029  RRR obtenus sur matières premières [DEDUCTED]
    604  Matières consommables
         6041  Matières consommables
         6042  Matières combustibles
         6043  Produits d'entretien
         6044  Fournitures d'atelier, d'usine et de gestion
         6045  Frais sur achats matières consommables
         6046  Fournitures de magasin
         6047  Fournitures de bureau
         6049  RRR obtenus sur matières consommables [DEDUCTED]
    605  Fournitures non stockables
         6051  Eau
         6052  Électricité
         6053  Autres énergies
         6054  Fournitures d'entretien non stockables
         6055  Fournitures de bureau non stockables
         6056  Achats de petit matériel et outillage
         6057  Achats d'études et prestations de services
         6058  Achats de travaux, matériels et équipements
         6059  RRR obtenus sur fournitures non stockables [DEDUCTED]
    608  Achats d'emballages
         6081  Emballages perdus
         6082  Emballages récupérables non identifiables
         6083  Emballages à usage mixte
         6085  Frais sur achats emballages
         6089  RRR obtenus sur emballages [DEDUCTED]
    6031  Variation des stocks de marchandises
    6032  Variation des stocks de matières premières et fournitures liées
    6033  Variation des stocks d'autres approvisionnements

61  TRANSPORTS
    6120  Transports sur ventes
    6130  Transports pour le compte de tiers
    6140  Transports du personnel
    6160  Transports de plis
    6181  Voyages et déplacements (transport)
    6182  Transports entre établissements ou chantiers
    6183  Transports administratifs

62  SERVICES EXTÉRIEURS A
    6210  Sous-traitance générale
    6221  Location de terrains
    6222  Location de bâtiments
    6223  Location de matériels et outillages
    6224  Malis sur emballages
    6225  Locations d'emballages
    6226  Fermages et loyers du foncier
    6228  Locations et charges locatives diverses
    6232  Crédit-bail immobilier
    6233  Crédit-bail mobilier
    6234  Location-vente
    6238  Autres contrats de location-acquisition
    6241  Entretien et réparation des biens immobiliers
    6242  Entretien et réparation des biens mobiliers
    6243  Maintenance
    6244  Charges de démantèlement et remise en état
    6248  Autres entretiens et réparations
    6251  Assurances multirisques
    6252  Assurances matériels de transport
    6253  Assurances risques d'exploitation
    6254  Assurances responsabilité du producteur
    6255  Assurances insolvabilité clients
    6257  Assurances transport sur ventes
    6258  Autres primes d'assurances
    6261  Études et recherches
    6265  Documentation générale
    6266  Documentation technique
    6271  Annonces, insertions
    6272  Catalogues, imprimés publicitaires
    6273  Échantillons
    6274  Foires et expositions
    6275  Publications
    6276  Cadeaux à la clientèle
    6277  Frais de colloques, séminaires, conférences
    6278  Autres charges de publicité et relations publiques
    6281  Frais de téléphone
    6282  Frais de télex
    6283  Frais de télécopie
    6288  Autres frais de télécommunications

63  SERVICES EXTÉRIEURS B
    6311  Frais sur titres (vente, garde)
    6312  Frais sur effets
    6313  Location de coffres
    6314  Commissions d'affacturage et de titrisation
    6315  Commissions sur cartes de crédit
    6316  Frais d'émission d'emprunts
    6317  Frais sur instruments monnaie électronique
    6318  Autres frais bancaires
    6322  Commissions et courtages sur ventes
    6324  Honoraires des professions réglementées
    6325  Frais d'actes et de contentieux
    6326  Rémunérations d'affacturage
    6327  Rémunérations des autres prestataires de services
    6328  Divers frais
    6330  Frais de formation du personnel
    6342  Redevances pour brevets, licences
    6343  Redevances pour logiciels
    6344  Redevances pour marques
    6345  Redevances pour sites internet
    6346  Redevances pour concessions, droits et valeurs similaires
    6351  Cotisations
    6358  Concours divers
    6371  Personnel intérimaire
    6372  Personnel détaché ou prêté à l'entité
    6381  Frais de recrutement du personnel
    6382  Frais de déménagement
    6383  Réceptions
    6384  Missions
    6385  Charges de copropriété
    6388  Charges externes diverses

64  IMPÔTS ET TAXES
    6411  Impôts fonciers et taxes annexes
    6412  Patentes, licences et taxes annexes
    6413  Taxes sur appointements et salaires
    6414  Taxes d'apprentissage
    6415  Formation professionnelle continue
    6418  Autres impôts et taxes directs
    6450  Impôts et taxes indirects
    6461  Droits de mutation
    6462  Droits de timbre
    6463  Taxes sur les véhicules de société
    6464  Vignettes
    6468  Autres droits
    6471  Pénalités d'assiette, impôts directs
    6472  Pénalités d'assiette, impôts indirects
    6473  Pénalités de recouvrement, impôts directs
    6474  Pénalités de recouvrement, impôts indirects
    6478  Autres pénalités et amendes fiscales
    6480  Autres impôts et taxes

65  AUTRES CHARGES
    6511  Pertes sur créances clients
    6515  Pertes sur autres débiteurs
    6521  Quote-part transférée de bénéfices (comptabilité du gérant)
    6525  Pertes imputées par transfert (comptabilité des associés non gérants)
    6541  Valeur comptable des cessions courantes d'immobilisations incorporelles
    6542  Valeur comptable des cessions courantes d'immobilisations corporelles
    6560  Pertes de change sur créances et dettes commerciales
    6570  Pénalités et amendes pénales
    6581  Indemnités de fonction et autres rémunérations d'administrateurs
    6582  Dons
    6583  Mécénat
    6588  Autres charges diverses
    6591  Charges pour dépréciations et provisions d'exploitation sur risques CT
    6593  Charges pour dépréciations et provisions pour risque CT sur stocks
    6594  Charges pour dépréciations et provisions pour risque CT sur créances
    6598  Autres charges pour dépréciations et provisions CT d'exploitation

66  CHARGES DE PERSONNEL
    6611  Appointements, salaires et commissions versés au personnel national
    6612  Primes et gratifications versées au personnel national
    6613  Congés payés versés au personnel national
    6614  Indemnités de préavis, de licenciement et de recherche d'embauche (national)
    6615  Indemnités de maladie versées aux travailleurs nationaux
    6616  Supplément familial versé au personnel national
    6617  Avantages en nature du personnel national
    6618  Autres rémunérations directes versées au personnel national
    6621  Appointements, salaires et commissions versés au personnel non national
    6622  Primes et gratifications versées au personnel non national
    6623  Congés payés versés au personnel non national
    6624  Indemnités de préavis, licenciement (non national)
    6625  Indemnités de maladie versées aux travailleurs non nationaux
    6626  Supplément familial versé au personnel non national
    6627  Avantages en nature du personnel non national
    6628  Autres rémunérations directes versées au personnel non national
    6631  Indemnités forfaitaires de logement versées au personnel
    6632  Indemnités forfaitaires de représentation versées au personnel
    6633  Indemnités forfaitaires d'expatriation versées au personnel
    6634  Indemnités forfaitaires de transport versées au personnel
    6638  Autres indemnités et avantages divers versés au personnel
    6641  Charges sociales sur rémunération du personnel national
    6642  Charges sociales sur rémunération du personnel non national
    6661  Rémunérations du travail de l'exploitant individuel
    6662  Charges sociales de l'exploitant individuel
    6671  Rémunérations transférées du personnel intérimaire
    6672  Rémunérations transférées du personnel détaché ou prêté
    6681  Versements aux syndicats et comités d'entreprise
    6682  Versements aux comités d'hygiène et de sécurité
    6683  Versements et contributions aux autres œuvres sociales
    6684  Médecine du travail et pharmacie
    6685  Assurances et organismes de santé
    6686  Assurances retraite et fonds de pension
    6687  Majorations et pénalités sociales
    6688  Charges sociales diverses

67  FRAIS FINANCIERS ET CHARGES ASSIMILÉES
    6711  Intérêts des emprunts obligataires
    6712  Intérêts des emprunts auprès des établissements de crédit
    6713  Intérêts des dettes liées à des participations
    6714  Intérêts des primes de remboursement des obligations
    6722  Intérêts dans loyers de location-acquisition / crédit-bail immobilier
    6723  Intérêts dans loyers de location-acquisition / crédit-bail mobilier
    6724  Intérêts dans loyers de location-acquisition / location-vente
    6728  Intérêts dans loyers des autres locations-acquisition
    6730  Escomptes accordés
    6741  Intérêts sur avances reçues et dépôts créditeurs
    6742  Intérêts sur comptes courants bloqués
    6743  Intérêts sur obligations cautionnées
    6744  Intérêts sur dettes commerciales
    6745  Intérêts bancaires et sur opérations de financement
    6748  Intérêts sur dettes diverses
    6750  Escomptes des effets de commerce
    6760  Pertes de change financières
    6771  Pertes sur cessions de titres de placement
    6772  Malis provenant d'attribution gratuite d'actions au personnel salarié et aux dirigeants
    6781  Pertes et charges sur rentes viagères
    6782  Pertes et charges sur opérations financières
    6784  Pertes et charges sur instruments de trésorerie
    6791  Charges pour dépréciations et provisions sur risques financiers CT
    6795  Charges pour dépréciations et provisions sur titres de placement
    6798  Autres charges pour dépréciations et provisions pour risques CT financières

68  DOTATIONS AUX AMORTISSEMENTS D'EXPLOITATION
    6812  Dotations aux amortissements des immobilisations incorporelles
    6813  Dotations aux amortissements des immobilisations corporelles

691 DOTATIONS AUX PROVISIONS D'EXPLOITATION (EXCLUDING 697)
    6911  Dotations aux provisions pour risques et charges
    6913  Dotations aux dépréciations des immobilisations incorporelles
    6914  Dotations aux dépréciations des immobilisations corporelles

697 DOTATIONS AUX PROVISIONS FINANCIÈRES
    6971  Dotations aux provisions pour risques et charges financières
    6972  Dotations aux dépréciations des immobilisations financières
```

## CLASS 7 — PRODUITS DES ACTIVITÉS ORDINAIRES

```
70  VENTES
    701  Ventes de marchandises
         7011  Dans l'État partie
         7012  Dans les autres États OHADA
         7013  Hors région OHADA
         7014  Groupe dans la région
         7015  Groupe hors région
         7016  Sur internet
         7019  Rabais, remises, ristournes accordés non ventilés [DEDUCTED]
    702  Ventes de produits fabriqués
         7021  Dans l'État partie
         7022  Autres États OHADA
         7023  Hors région
         7024  Groupe région
         7025  Groupe hors région
         7026  Sur internet
         7029  RRR accordés [DEDUCTED]
    703  Ventes de travaux
    705  Ventes de services
         7051  Dans l'État partie
         7052  Autres États OHADA
         7053  Hors région
         7054  Groupe région
         7055  Groupe hors région
         7056  Sur internet
         7059  RRR accordés [DEDUCTED]
    706  Ventes d'études
    707  Produits accessoires
         7071  Ports, emballages perdus et autres frais facturés
         7072  Commissions et courtages
         7073  Locations et redevances de location-financement
         7074  Bonis sur reprises et cessions d'emballages
         7075  Mise à disposition de personnel
         7076  Redevances pour brevets, logiciels, marques et droits similaires
         7077  Services exploités dans l'intérêt du personnel
         7078  Autres produits accessoires

71  SUBVENTIONS D'EXPLOITATION
    711  État, 712  Régions, 713  Départements, 714  Communes
    715  Entités publiques, 716  Entités privées, 717  Organismes internationaux, 718  Autres

72  PRODUCTION IMMOBILISÉE
    721  Immobilisations incorporelles produites
    722  Immobilisations corporelles produites
    724  Études produites
    728  Autres productions immobilisées

73  VARIATION DE STOCKS DE PRODUITS
    731  Variation stocks produits finis
    732  Variation stocks produits intermédiaires
    733  Variation stocks produits résiduels
    734  Variation stocks produits en cours
    735  Variation stocks services en cours
    736  Variation stocks actifs biologiques
    737  Variation stocks autres produits

75  AUTRES PRODUITS
    751  Produits accessoires divers
    754  Produits des cessions courantes d'immobilisations (account 6541/6542 counterpart)
    756  Gains de change sur créances et dettes commerciales
    757  Gains sur cessions de titres de placement
    758  Produits divers

77  REVENUS FINANCIERS ET ASSIMILÉS
    771  Intérêts des prêts et créances diverses
    772  Revenus de participations
    773  Escomptes obtenus
    774  Revenus de placements
    776  Gains de change financiers
    777  Gains sur cessions de titres de placement
    778  Autres revenus financiers

781  TRANSFERTS DE CHARGES D'EXPLOITATION
787  TRANSFERTS DE CHARGES FINANCIÈRES

791  REPRISES DE PROVISIONS D'EXPLOITATION
     7911  Reprises provisions pour risques et charges exploitation
     7913  Reprises dépréciations immobilisations incorporelles
     7914  Reprises dépréciations immobilisations corporelles

797  REPRISES DE PROVISIONS FINANCIÈRES
     7971  Reprises provisions pour risques et charges financières
     7972  Reprises dépréciations immobilisations financières

798  REPRISES DE PROVISIONS HAO
```

## CLASS 8 — COMPTES HAO ET RÉSULTAT

```
81  VALEURS COMPTABLES NETTES DES CESSIONS D'IMMOBILISATIONS
    811  VCN immobilisations incorporelles cédées
    812  VCN immobilisations corporelles cédées
    813  VCN immobilisations financières cédées
    814-818  Autres VCN cessions

82  PRODUITS DES CESSIONS D'IMMOBILISATIONS
    821  Prix de cession immobilisations incorporelles
    822  Prix de cession immobilisations corporelles
    826  Prix de cession immobilisations financières
    828  Autres prix de cession

83  CHARGES HAO CONSTATÉES
    831  Charges HAO constatées diverses
    832  Charges liées aux opérations de restructuration
    833  Pertes sur créances HAO
    834  Dons et libéralités accordés
    835  Abandons de créances consentis
    836  Charges provisionnées HAO
    837  Dotations HAO diverses
    838  Autres charges HAO

84  PRODUITS HAO CONSTATÉS
    841  Produits HAO constatés divers
    842  Subventions d'équilibre
    843  Indemnités et subventions HAO (entité agricole)
    844  Dons et libéralités obtenus
    845  Abandons de créances obtenus
    848  Autres produits HAO

85  DOTATIONS HAO
    851-858  Dotations aux provisions et dépréciations HAO

86  REPRISES HAO
    861-868  Reprises de charges, provisions et dépréciations HAO

87  PARTICIPATION DES TRAVAILLEURS
    871-878  Participation des travailleurs aux bénéfices

88  SUBVENTIONS D'ÉQUILIBRE
    881-888  Subventions d'équilibre diverses

891  IMPÔT SUR LE RÉSULTAT
```

---

# DATA SECTION 6 — LEGAL FORM CODES (ZK)

| Code | Legal Form |
|---|---|
| 00 | SA à participation publique |
| 01 | SA (Société Anonyme) |
| 02 | SARL (Société à Responsabilité Limitée) |
| 03 | SCS (Société en Commandite Simple) |
| 04 | SNC (Société en Nom Collectif) |
| 05 | SP (Société en Participation) |
| 06 | GIE (Groupement d'Intérêt Économique) |
| 07 | Association |
| 08 | SAS (Société par Actions Simplifiée) |
| 09 | Autre forme juridique (à préciser) |

---

# DATA SECTION 7 — FISCAL REGIME CODES (ZL)

| Code | Regime |
|---|---|
| 1 | Réel Normal |
| 2 | Réel Simplifié |
| 3 | Synthétique |
| 4 | Forfait |

---

# DATA SECTION 8 — COUNTRY CODES (ZM)

| Code | Country |
|---|---|
| 01 | Bénin |
| 02 | Burkina Faso |
| 03 | Côte d'Ivoire |
| 04 | Guinée Bissau |
| 05 | Mali |
| 06 | Niger |
| 07 | Sénégal |
| 08 | Togo |
| 09 | Cameroun |
| 10 | Congo |
| 11 | Gabon |
| 12 | République Centrafricaine |
| 13 | Tchad |
| 14 | Comores |
| 15 | Guinée |
| 16 | Guinée Équatoriale |
| 17 | Congo RDC |
| 20 | Autres pays africains |
| 21 | France |
| 30 | Autres pays de l'Union Européenne |
| 40 | USA |
| 41 | Canada |
| 49 | Autres pays américains |
| 50 | Pays asiatiques |
| 99 | Autres pays |

---

# DATA SECTION 9 — ACTIVITY NOMENCLATURE CODES (ZE / FIRD 2)

| Code | Activity |
|---|---|
| 001001 | Culture céréalière |
| 001002 | Cultures de tubercules et plantains |
| 001003 | Culture de légumes |
| 001004 | Culture de condiments |
| 001005 | Culture de fruits |
| 001006 | Culture d'autres produits de l'agriculture vivrière |
| 002001 | Culture de canne à sucre |
| 002002 | Culture d'arachide d'huilerie |
| 002003 | Culture d'arachide de bouche |
| 002004 | Culture de tabac |
| 002005 | Culture de coton |
| 002006 | Culture de blé |
| 002007 | Culture de cacao |
| 002008 | Culture de café |
| 002009 | Culture de banane d'exportation |
| 002010 | Culture d'ananas d'exportation |
| 002011 | Autres cultures industrielles |
| 003001 | Élevage bovin |
| 003002 | Élevage ovin, caprin, équin |
| 003003 | Élevage de volailles |
| 003004 | Autres élevages |
| 003005 | Chasse |
| 004001 | Sylviculture |
| 004002 | Exploitation forestière |
| 005001 | Pêche de poissons |
| 005003 | Autres pêches et aquaculture |
| 006001 | Extraction d'hydrocarbures |
| 006002 | Extraction d'autres produits |
| 007001 | Production de viande et produits à base de viande |
| 007002 | Production de poissons et produits à base de poisson |
| 008000 | Travail de grain et fabrication de produits amylacés |
| 009001 | Transformation du café |
| 009002 | Transformation du cacao |
| 010001 | Huile brute et tourteaux |
| 010002 | Autres corps gras |
| 011001 | Fabrication de pains, biscuits et pâtisserie |
| 011002 | Fabrication de pâtes alimentaires |
| 012000 | Industrie laitière |
| 013001 | Fabrication de sucre |
| 013002 | Fabrication de produits à base de fruits et légumes |
| 013003 | Fabrication d'autres produits alimentaires |
| 014001 | Brasseries et malteries |
| 014002 | Fabrication d'autres boissons alcoolisées |
| 014003 | Fabrication de boissons non alcoolisées et eaux minérales |
| 015000 | Industrie du tabac |
| 016001 | Industries textiles |
| 016002 | Industries de l'habillement |
| 017001 | Fabrication du cuir et articles en cuir |
| 017002 | Fabrication de chaussures |
| 018001 | Sciage, rabotage et imprégnation du bois |
| 018002 | Fabrication de panneaux en bois |
| 018003 | Fabrication d'articles en bois assemblés |
| 019001 | Industrie du papier et du carton |
| 019002 | Édition, imprimerie, reproduction |
| 020000 | Raffinage de pétrole |
| 021001 | Industries chimiques de base |
| 021002 | Fabrication de savons, détergents et produits d'entretien |
| 021003 | Fabrication de produits agro-chimiques |
| 021004 | Industries pharmaceutiques |
| 021005 | Autres produits chimiques |
| 022001 | Fabrication du caoutchouc naturel |
| 022002 | Industrie du caoutchouc |
| 022003 | Fabrication de matière plastique |
| 023001 | Industrie du verre |
| 023002 | Fabrication de produits minéraux pour la construction |
| 023003 | Fabrication d'autres produits non métalliques |
| 024001 | Métallurgie |
| 024002 | Travail des métaux |
| 025001 | Fabrication de machines et d'équipement |
| 025002 | Fabrication de machines de bureaux |
| 025003 | Fabrication d'appareils électriques |
| 026001 | Fabrication d'équipements et appareils audiovisuels et de communication |
| 026002 | Fabrication d'instruments médicaux, d'optiques et d'horlogerie |
| 027001 | Fabrication de véhicules routiers |
| 027002 | Fabrication d'autres matériels de transport |
| 028001 | Fabrication de meubles |
| 028002 | Industries diverses |
| 029001 | Production, transport et distribution d'électricité |
| 029002 | Captage, épuration et distribution d'eau |
| 029003 | Production et distribution de gaz |
| 030001 | Préparation de sites et construction d'ouvrages |
| 030002 | Travaux d'installation et de finition |
| 031001 | Commerce de véhicules, accessoires et carburant |
| 031002 | Commerce de produits bruts et d'animaux vivants |
| 031003 | Autres commerces |
| 032001 | Entretien et réparation de véhicules automobiles |
| 032002 | Réparations de biens personnels et domestiques |
| 033001 | Hôtels |
| 033002 | Bars et restaurants |
| 034001 | Transport ferroviaire |
| 034002 | Transports routiers, transports par conduite |
| 034003 | Transport par eau |
| 034004 | Transport aérien |
| 034005 | Services annexes et auxiliaires de transport |
| 035001 | Postes |
| 035002 | Télécommunications |
| 036001 | Services d'intermédiation financière |
| 036002 | Assurances (sauf sécurité sociale) |
| 036003 | Auxiliaires financiers et d'assurances |
| 037001 | Location de biens immobiliers |
| 037002 | Autres services immobiliers |
| 038001 | Locations sans opérateur |
| 038002 | Activités informatiques |
| 038003 | Services rendus principalement aux entités |
| 039001 | Administration générale, économique et sociale |
| 039002 | Services de prérogative publique |
| 039003 | Sécurité sociale obligatoire |
| 040000 | Éducation |
| 041001 | Activité pour la santé des hommes |
| 041002 | Activité vétérinaire |
| 041003 | Action sociale |
| 042001 | Assainissement, voirie et gestion des déchets |
| 042002 | Activités associatives |
| 042003 | Activités récréatives, culturelles et sportives |
| 042004 | Services personnels |
| 042005 | Services domestiques |
| 043000 | Services d'intermédiation financière indirectement mesurés |
| 044000 | Correction territoriale |

---

# DATA SECTION 10 — PDF TEMPLATE PAGE STRUCTURE

The official `Liasse_des_Etats_Financiers.pdf` has exactly 68 pages. Read this PDF directly for the visual layout. The page structure is:

| Page | Content | Financial Data Section |
|---|---|---|
| 1 | Page de Garde — Cover with Republic of Guinea header, SYSCOHADA normal system, exercise year, company info boxes, DGI center | FIRD D.1 |
| 2 | Conditions de recevabilité — Static instructions (do not fill) | STATIC |
| 3 | Cover page full format — checklist of documents deposited, DGI reserved section, date, signature | FIRD D.1 |
| 4 | FIRD 1 — ZA (exercise dates), ZB (arrêté effectif), ZC (exercice précédent), ZD (registre), ZE (codes), ZF (désignation), ZG (contacts), ZH (adresse), ZI (activité), signatory section, bank domiciliation table | FIRD D.2-D.5 |
| 5 | FIRD 2 — ZK (forme juridique), ZL (régime fiscal), ZM (pays), ZN (établissements), ZU (comptabilité distance), ZP (première année), ZQ/ZR/ZS (contrôle), Activity breakdown table | FIRD D.6-D.7 |
| 6 | FIRD 3 — Actionnaires table, Conseil d'administration table, Dirigeants table, Filiales table | FIRD D.8 |
| 7 | Bilan Actif Page 1/2 — REF AD through BZ, three columns (BRUT/AMORT-DEPREC/NET) for N, single NET for N-1 | Balance Sheet G.1 |
| 8 | Bilan Passif Page 2/2 — REF CA through DZ, two NET columns (N and N-1) | Balance Sheet G.2 |
| 9 | Bilan Paysage Page 1/1 — Combined ACTIF and PASSIF on single landscape page, same data as pages 7-8 | Balance Sheet G.1-G.2 |
| 10 | Compte de Résultat — REF TA through XI, two columns (N and N-1) | Income Statement H |
| 11 | Tableau de Flux de Trésorerie — REF ZA, FA through ZH, two columns (N and N-1) | Cash Flow I |
| 12 | FRNA — Fiche Récapitulative Notes Annexes — full checklist of 36 notes + DGI states, A/N-A columns | FIRD D.9 |
| 13 | Note 1 — Dettes garanties, engagements financiers | Note J.1 |
| 14 | Note 2 — Informations obligatoires A/B/C/D | Note J.2 |
| 15 | Note 3A — Immobilisations brutes movement table | Note J.3 |
| 16 | Note 3B — Biens location-acquisition movement table | Note J.4 |
| 17 | Note 3C — Amortissements movement table | Note J.5 |
| 18 | Note 3C Bis — Dépréciations immobilisations movement table | Note J.6 |
| 19 | Note 3D — Plus/moins-values de cession | Note J.7 |
| 20 | Note 3E — Informations sur réévaluations | Note J.8 |
| 21 | Note 4 — Immobilisations financières + subsidiaries | Note J.9 |
| 22 | Note 5 — Actif et passif circulant HAO | Note J.10 |
| 23 | Note 6 — Stocks et encours | Note J.11 |
| 24 | Note 7 — Clients et produits à recevoir | Note J.12 |
| 25 | Note 8 — Autres créances | Note J.13 |
| 26 | Note 8A — Tableau étalement charges immobilisées | Note J.14 |
| 27 | Note 8B — Tableau étalement provisions charges à répartir | Note J.14 |
| 28 | Note 8C — Tableau étalement provisions engagements retraite | Note J.14 |
| 29 | Note 9 — Titres de placement | Note J.15 |
| 30 | Note 10 — Valeurs à encaisser | Note J.16 |
| 31 | Note 11 — Disponibilités | Note J.17 |
| 32 | Note 12 — Écarts de conversion + transferts charges | Note J.18 |
| 33 | Note 13 — Capital valeur nominale | Note J.19 |
| 34 | Note 14 — Primes et réserves | Note J.20 |
| 35 | Note 15A — Subventions et provisions réglementées | Note J.21 |
| 36 | Note 15B — Autres fonds propres | Note J.22 |
| 37 | Note 16A — Dettes financières et ressources assimilées | Note J.23 |
| 38 | Note 16B — Engagements retraite hypothèses actuarielles | Note J.24 |
| 39 | Note 16B bis — Actifs du régime de retraite | Note J.24 |
| 40 | Note 16C — Actifs et passifs éventuels | Note J.24 |
| 41 | Note 17 — Fournisseurs d'exploitation | Note J.25 |
| 42 | Note 18 — Dettes fiscales et sociales | Note J.26 |
| 43 | Note 19 — Autres dettes et provisions risques CT | Note J.27 |
| 44 | Note 20 — Banques crédit d'escompte et trésorerie | Note J.28 |
| 45 | Note 21 — Chiffre d'affaires et autres produits | Note J.29 |
| 46 | Note 22 — Achats (sub-account detail) | Note J.30 |
| 47 | Note 23 — Transports | Note J.31 |
| 48 | Note 24 — Services extérieurs | Note J.32 |
| 49 | Note 25 — Impôts et taxes | Note J.33 |
| 50 | Note 26 — Autres charges | Note J.34 |
| 51 | Note 27A — Charges de personnel | Note J.35 |
| 52 | Note 27B — Effectifs, masse salariale, personnel extérieur | Note J.36 |
| 53 | Note 28A — Provisions pour risques et charges (movement table) | Note J.37 |
| 54 | Note 28B — Dépréciations des immobilisations (movement table) | Note J.38 |
| 55 | Note 28C — Autres dépréciations (movement table) | Note J.39 |
| 56 | Note 29 — Charges et revenus financiers | Note J.40 |
| 57 | Note 30 — Autres charges et produits HAO | Note J.41 |
| 58 | Note 31 — Répartition résultat 5 dernières années | Note J.42 |
| 59 | Note 32 — Production de l'exercice | Note J.43 |
| 60 | Note 33 — Achats destinés à la production | Note J.44 |
| 61 | Note 34 — Analyse d'activité (ratios, SIG, structure financière) | Note J.45 |
| 62 | Note 35 — Informations sociales, environnementales, sociétales | Note J.46 |
| 63 | Note 36 — Table des codes (forme juridique, régime fiscal, pays) | Note J.47 |
| 64 | Codes activités économiques — full nomenclature (from Data Section 9) | Note J.47 |
| 65 | État complémentaire DGI Page 1/4 — Charges RA through RH (start) | Part K |
| 66 | État complémentaire DGI Page 2/4 — Charges RH (continued) through RI | Part K |
| 67 | État complémentaire DGI Page 3/4 — Charges RJ through RM (start) | Part K |
| 68 | État complémentaire DGI Page 4/4 — Charges RM (continued) through TOTAL | Part K |

**HEADER ON EVERY PAGE (68 pages)**:
- Désignation entité: [company name from FIRD]
- Sigle usuel: [sigle from FIRD]
- Adresse: [address from FIRD]
- BP: [PO Box from FIRD]
- Numéro d'identification: [NIF from FIRD]
- Exercice clos le 31 - 12 - [year]
- Durée (en mois): [duration]

**PAGE NUMBER ON EVERY PAGE**: "Page X / 68"

---

# DATA SECTION 11 — LIST OF ALL 36 NOTES FOR FRNA CHECKLIST

| Note | Label | Auto N/A Condition |
|---|---|---|
| NOTE 1 | Dettes garanties par des sûretés réelles | Never auto N/A |
| NOTE 2 | Informations obligatoires | Never auto N/A |
| NOTE 3A | Immobilisation brute | Never auto N/A |
| NOTE 3B | Biens pris en location-acquisition | No account 17 balance |
| NOTE 3C | Immobilisations: amortissements | No account 28 balance |
| NOTE 3C BIS | Immobilisations: dépréciations | No account 29 balance |
| NOTE 3D | Immobilisations: plus-values et moins-values de cession | No account 81/82 balance |
| NOTE 3E | Informations sur les réévaluations effectuées par l'entité | No account 106 balance |
| NOTE 4 | Immobilisations financières | No accounts 26/27 balance |
| NOTE 5 | Actif circulant et dettes circulantes HAO | No accounts 488/484/485 balance |
| NOTE 6 | Stocks et encours | No Class 3 accounts balance |
| NOTE 7 | Clients et produits à recevoir | No accounts 41x balance |
| NOTE 8 | Autres créances | No other receivable accounts balance |
| NOTE 8A | Tableau d'étalement des charges immobilisées | No account 4752 balance |
| NOTE 8B | Tableau d'étalement des provisions pour charges à répartir | No account 4752 balance |
| NOTE 8C | Tableau d'étalement des provisions pour engagement de retraite | No account 4752 balance |
| NOTE 9 | Titres de placement | No accounts 50x balance |
| NOTE 10 | Valeurs à encaisser | No accounts 51x balance |
| NOTE 11 | Disponibilités | No accounts 52-57 balance |
| NOTE 12 | Écarts de conversion et transferts de charges | No accounts 476/477 balance |
| NOTE 13 | Capital: valeur nominale des actions ou parts | Never auto N/A |
| NOTE 14 | Primes et réserves | Never auto N/A |
| NOTE 15A | Subventions et provisions réglementées | No accounts 14/15 balance |
| NOTE 15B | Autres fonds propres | No accounts 181-184 balance |
| NOTE 16A | Dettes financières et ressources assimilées | No accounts 16/17/19 balance |
| NOTE 16B | Engagements de retraite (méthode actuarielle) Partie 1 | No account 196 balance |
| NOTE 16B bis | Engagements de retraite (méthode actuarielle) Partie 2 | No account 196 balance |
| NOTE 16C | Actifs et passifs éventuels | Never auto N/A |
| NOTE 17 | Fournisseurs d'exploitation | No accounts 40x balance |
| NOTE 18 | Dettes fiscales et sociales | No accounts 42/43/44 balance |
| NOTE 19 | Autres dettes et provisions pour risques à court terme | No accounts 46/47/499 balance |
| NOTE 20 | Banques, crédit d'escompte et de trésorerie | No accounts 56x balance |
| NOTE 21 | Chiffre d'affaires et autres produits | No Class 7 accounts balance |
| NOTE 22 | Achats | No Class 60 accounts balance |
| NOTE 23 | Transports | No Class 61 accounts balance |
| NOTE 24 | Services extérieurs | No Class 62/63 accounts balance |
| NOTE 25 | Impôts et taxes | No Class 64 accounts balance |
| NOTE 26 | Autres charges | No Class 65 accounts balance |
| NOTE 27A | Charges de personnel | No Class 66 accounts balance |
| NOTE 27B | Effectifs, masse salariale et personnel extérieur | No Class 66 accounts balance |
| NOTE 28A | Provisions pour risques et charges | No accounts 19/499 balance |
| NOTE 28B | Dépréciations des immobilisations | No accounts 29x balance |
| NOTE 28C | Autres dépréciations | No accounts 39/49/59 balance |
| NOTE 29 | Charges et revenus financiers | No Class 67/77 accounts balance |
| NOTE 30 | Autres charges et produits HAO | No Class 8 accounts balance |
| NOTE 31 | Répartition du résultat et autres éléments caractéristiques des cinq derniers exercices | Never auto N/A |
| NOTE 32 | Production de l'exercice | Never auto N/A (user decides) |
| NOTE 33 | Achats destinés à la production | Never auto N/A (user decides) |
| NOTE 34 | Fiche de synthèse des principaux indicateurs financiers | Never auto N/A — always computed |
| NOTE 35 | Liste des informations sociales, environnementales et sociétales | Headcount < 250 in Note 27B |
| NOTE 36 | Tables des codes | Never auto N/A — always printed |
| NOTES DGI | États complémentaires DGI | Never auto N/A — always printed |

---

# DATA SECTION 12 — MANDATORY CONTROL CHECKS

| ID | Control | Pass Condition | Fail Message |
|---|---|---|---|
| C01 | Bilan équilibré | BZ = DZ exactly | "DÉSÉQUILIBRE BILAN: écart = [amount]" |
| C02 | Résultat cohérent | XI = CJ exactly | "RÉSULTAT INCOHÉRENT: CR=[x] Bilan=[y] écart=[z]" |
| C03 | TFT réconcilié | ZH = (BT_N − DT_N) + [S(4786)−S(4726)−S(4797)]_N | "TFT NON RÉCONCILIÉ: ZH=[x] Contrôle=[y] écart=[z]" |
| C04 | Balance N équilibrée | Total débit N = Total crédit N | "BALANCE N DÉSÉQUILIBRÉE: écart=[amount]" |
| C05 | Balance N-1 équilibrée | Total débit N-1 = Total crédit N-1 | "BALANCE N-1 DÉSÉQUILIBRÉE: écart=[amount]" |
| C06 | Immob brutes cohérentes | Note 3A total G column = AZ gross column on Bilan | "ÉCART IMMOB BRUTES: Note3A=[x] Bilan=[y] écart=[z]" |
| C07 | Amortissements cohérents | Note 3C total D column = AZ amort column on Bilan | "ÉCART AMORTISSEMENTS: Note3C=[x] Bilan=[y] écart=[z]" |
| C08 | Provisions cohérentes | Note 28A total D = DC + DN on Bilan | "ÉCART PROVISIONS: Note28A=[x] Bilan=[y] écart=[z]" |
| C09 | Stocks cohérents | Note 6 TOTAL NET = BB on Bilan | "ÉCART STOCKS: Note6=[x] BB=[y] écart=[z]" |
| C10 | Clients cohérents | Note 7 TOTAL NET = BI on Bilan | "ÉCART CLIENTS: Note7=[x] BI=[y] écart=[z]" |
| C11 | FIRD complet | All mandatory fields in FIRD pages 1-3 filled | "FIRD INCOMPLET: champs manquants = [list]" |
| C12 | Notes applicables renseignées | No note marked 'A' left with zero content | "NOTES APPLICABLES VIDES: [list of note names]" |
| C13 | Analyse financière cohérente | Note 34 trésorerie nette = BT_N − DT_N | "ANALYSE NOTE 34 INCOHÉRENTE" |

---

# DATA SECTION 13 — WARNING CHECKS

| ID | Warning | Condition |
|---|---|---|
| W01 | Capitaux propres négatifs | CP < 0 |
| W02 | Chiffre d'affaires nul | XB = 0 |
| W03 | Changement de signe résultat | sign(XI_N) ≠ sign(XI_N-1) |
| W04 | Soldes anormaux présents | Any account flagged in Check 4 of validation |
| W05 | Comparatif N-1 absent | Any line where N ≠ 0 but N-1 = 0 for major statement lines |
| W06 | HAO significatif | ABS(XH) > 0.20 × ABS(XG) |
| W07 | Remplacements manuels présents | Count of manual overrides in mapping > 0 |
| W08 | Note 35 requise mais vide | Headcount from Note 27B ≥ 250 AND Note 35 content empty |
| W09 | Lignes TFT saisies manuellement | Any of FF, FG, FH, FO, FP, FQ entered as manual override |

---

# DATA SECTION 14 — DEFAULT CURRENCY LIST

| Code | Name | Symbol | Thousands Separator | Decimal Separator |
|---|---|---|---|---|
| GNF | Franc Guinéen | GNF | space | , |
| USD | US Dollar | $ | , | . |
| EUR | Euro | € | space | , |
| XOF | Franc CFA BCEAO | FCFA | space | , |
| XAF | Franc CFA BEAC | FCFA | space | , |
| GBP | Pound Sterling | £ | , | . |
| CHF | Swiss Franc | CHF | ' | . |
| JPY | Japanese Yen | ¥ | , | . |

Default: GNF — pre-selected and pre-filled for all new filings.

---

# DATA SECTION 15 — NOTE 34 COMPUTED FORMULAS

All formulas in Note 34 are 100% automatic. No manual input. These derive from financial statements already generated.

| Indicator | Formula |
|---|---|
| Chiffre d'affaires | = XB |
| Marge commerciale | = XA |
| Valeur ajoutée | = XC |
| EBE | = XD |
| Résultat d'exploitation | = XE |
| Résultat financier | = XF |
| Résultat des activités ordinaires | = XG |
| Résultat HAO | = XH |
| Résultat net | = XI |
| CAFG Exploitation | = XD + S(654) − S(754) |
| CAFG Global | = FA (from TFT) |
| Autofinancement | = CAFG − dividendes distribués (MD of account 465) |
| Ressources stables | = DF (= CP + DD) |
| Fonds de Roulement | = DF − AZ |
| BFR Exploitation | = (BB + BI + BJ + BH) − (DJ + DK + DM + DN − DH) |
| BFR HAO | = BA − DH |
| BFR Global | = BFR Exploitation + BFR HAO |
| Trésorerie Nette | = Fonds de Roulement − BFR Global |
| Control Trésorerie | = BT − DT (must equal Trésorerie Nette) |
| Endettement financier brut | = DA + DB + DT |
| Endettement financier net | = (DA + DB + DT) − BT |
| Rentabilité économique | = XE / (CP + DA + DB) × 100 |
| Rentabilité financière | = XI / CP × 100 |
| Variation trésorerie (flux) | = ZB + ZC + ZF (= ZG from TFT) |

---

END OF DATA FILE

This data file is complete and self-contained. Load every section into the application's database or configuration layer. Together with the Master Prompt file, this constitutes the full specification and data foundation for the SYSCOHADA Financial Statements Web Application.