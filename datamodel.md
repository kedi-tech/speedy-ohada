# SYSCOHADA FINANCIAL STATEMENTS WEB APPLICATION
## COMPLETE DATA FILE — ALL REFERENCE DATA (FULLY CORRECTED FROM SOURCE FILES)

This file contains ALL reference data extracted directly from the source Excel files:
- liste_de_comptes.xlsx → Sections 5 (complete chart of accounts, all 1499 rows)
- Regroupement_des_Comptes_Reforme.xlsx → Sections 1, 2, 3 (exact account-to-statement mapping)
- FICHIER_TFT.xlsx → Section 4 (cash flow formulas)

---

# DATA SECTION 1 — INCOME STATEMENT ACCOUNT MAPPING
(Source: Regroupement_des_Comptes_Reforme.xlsx — Sheet: COMPTE DE RESULTAT)

| REF | Label | Sign | Accounts | Note |
|---|---|---|---|---|
| TA | Ventes de marchandises A | + | 701 | 21 |
| RA | Achats de marchandises | − | 601 | 22 |
| RB | Variation de stocks de marchandises | ± | 6031 | 6 |
| XA | MARGE COMMERCIALE | COMPUTED | TA+RA+RB | |
| TB | Ventes de produits fabriqués B | + | 702 | 21 |
| TC | Travaux, services vendus C | + | 705, 706 | 21 |
| TD | Produits accessoires D | + | 707 | 21 |
| XB | CHIFFRE D'AFFAIRES | COMPUTED | TA+TB+TC+TD | |
| TE | Production stockée ou déstockage | ± | 73 | 6 |
| TF | Production immobilisée | + | 72 | 21 |
| TG | Subventions d'exploitation | + | 71 | 21 |
| TH | Autres produits | + | 75 | 21 |
| TI | Transferts de charges d'exploitation | + | 781 | 12 |
| RC | Achats de matières premières et fournitures liées | − | 602 | 22 |
| RD | Variation de matières premières et fournitures liées | ± | 6032 | 6 |
| RE | Autres achats | − | 604, 605, 608 | 22 |
| RF | Variation de stocks d'autres approvisionnements | ± | 6033 | 6 |
| RG | Transports | − | 61 | 23 |
| RH | Services extérieurs | − | 62, 63 | 24 |
| RI | Impôts et taxes | − | 64 | 25 |
| RJ | Autres charges | − | 65 | 26 |
| XC | VALEUR AJOUTÉE | COMPUTED | (XB+RA+RB)+(TE+TF+TG+TH+TI+RC+RD+RE+RF+RG+RH+RI+RJ) | |
| RK | Charges de personnel | − | 66 | 27 |
| XD | EXCÉDENT BRUT D'EXPLOITATION | COMPUTED | XC+RK | 28 |
| TJ | Reprises d'amortissements, provisions et dépréciations | + | 791, 798 | 28 |
| RL | Dotations aux amortissements, aux provisions et dépréciations | − | 68, 691 sauf 697 | 3C & 28 |
| XE | RÉSULTAT D'EXPLOITATION | COMPUTED | XD+TJ+RL | |
| TK | Revenus financiers et assimilés | + | 77 | 29 |
| TR | Reprises de provisions et dépréciations financières | + | 797 | 28 |
| TM | Transferts de charges financières | + | 787 | 12 |
| RM | Frais financiers et charges assimilées | − | 67 | 29 |
| RN | Dotations aux provisions et aux dépréciations financières | − | 697 | 3C & 28 |
| XF | RÉSULTAT FINANCIER | COMPUTED | TK+TR+TM+RM+RN | |
| XG | RÉSULTAT DES ACTIVITÉS ORDINAIRES | COMPUTED | XE+XF | |
| TN | Produits des cessions d'immobilisations | + | 82 | 3D |
| TO | Autres produits HAO | + | 84, 86, 88 | 30 |
| RO | Valeurs comptables des cessions d'immobilisations | − | 81 | 3D |
| RP | Autres charges HAO | − | 83, 85 | 30 |
| XH | RÉSULTAT HAO | COMPUTED | TN+TO+RO+RP | |
| RQ | Participation des travailleurs | − | 87 | 30 |
| RS | Impôt sur le résultat | − | 891 | |
| XI | RÉSULTAT NET | COMPUTED | XG+XH+RQ+RS | |

---

# DATA SECTION 2 — BALANCE SHEET ACTIF MAPPING
(Source: Regroupement_des_Comptes_Reforme.xlsx — Sheet: ACTIF)

| REF | Label | Note | BRUT | AMORT/DEP | NET Rule |
|---|---|---|---|---|---|
| AD | IMMOBILISATIONS INCORPORELLES | 3 | — | — | SUM AE to AH |
| AE | Frais de développement et de prospection | | 211 | 2811 | BRUT−AMORT |
| AF | Brevets, licences, logiciels et droits similaires | | 212, 213, 214 | 2812, 2813 | BRUT−AMORT |
| AG | Fonds commercial et droit au bail | | 215 | 2815 | BRUT−AMORT |
| AH | Autres immobilisations incorporelles | | 218 | 2818 | BRUT−AMORT |
| AI | IMMOBILISATIONS CORPORELLES | 3 | — | — | SUM AJ to AN |
| AJ | Terrains (dont placement en NET) | | 22 | 292 | BRUT−AMORT |
| AK | Bâtiments (dont placement en NET) | | 23 (sauf 234) | 283 | BRUT−AMORT |
| AL | Aménagement, agencement et installation | | 234 | 283 | BRUT−AMORT |
| AM | Matériel, mobilier et actif biologique | | 24 sauf 245 | 284 | BRUT−AMORT |
| AN | Matériel de transport | | 245 | 2845 | BRUT−AMORT |
| AP | Avances et acomptes versés sur immobilisations | 3 | 25 | — | BRUT only |
| AQ | IMMOBILISATIONS FINANCIÈRES | 4 | — | — | SUM AR+AS |
| AR | Titres de participation | | 26 | 296 | BRUT−DEPREC |
| AS | Autres immobilisations financières | | 27 | 297 | BRUT−DEPREC |
| AZ | TOTAL ACTIF IMMOBILISÉ | | — | — | AD+AI+AP+AQ |
| BA | ACTIF CIRCULANT HAO | 5 | 48 SD (debit) | — | Debit balance of 48 |
| BB | STOCKS ET ENCOURS | 6 | 3 sauf 39 | 39 | BRUT−DEPREC |
| BG | CRÉANCES ET EMPLOIS ASSIMILÉS | | — | — | BH+BI+BJ |
| BH | Fournisseurs avances versées | 17 | 4091 | — | Debit balance |
| BI | Clients | 7 | 41 SD (debit) | — | Net debit of 41 |
| BJ | Autres créances | 8 | 42,43,44,45,46,47 SD sauf (462,477,478) | — | Debit balances |
| BK | TOTAL ACTIF CIRCULANT | | — | — | BA+BB+BH+BI+BJ |
| BQ | Titres de placement | 9 | 50 | — | Net of depreciation 59 |
| BR | Valeurs à encaisser | 10 | 51 | — | Net |
| BS | Banques, chèques postaux, caisse et assimilés | 11 | 52, 53, 55, 57 | — | Debit balances only |
| BT | TOTAL TRÉSORERIE ACTIF | | — | — | BQ+BR+BS |
| BU | Écart de conversion Actif | 12 | 478 | — | Debit balance |
| BZ | TOTAL GÉNÉRAL ACTIF | | — | — | AZ+BK+BT+BU |

**IMPORTANT CORRECTIONS from source file vs previous version:**
- AE: account 211 (not 201/202) | Amort: 2811
- AF: accounts 212, 213, 214 (not 215) | Amort: 2812, 2813
- AG: account 215 (not 216/217) | Amort: 2815
- AH: account 218 | Amort: 2818
- AJ: account 22 (all terrains) | Amort: 292 (depreciations)
- AK: account 23 EXCEPT 234 | Amort: 283
- AL: account 234 ONLY | Amort: 283
- AM: account 24 EXCEPT 245 | Amort: 284
- AN: account 245 ONLY | Amort: 2845
- AP: account 25 (avances et acomptes)
- BA: account 48 debit balances (SD)
- BH: account 4091 specifically (not all of 409)
- BI: account 41 debit balances
- BJ: accounts 42,43,44,45,46,47 debit balances EXCLUDING 462, 477, 478
- BU: account 478 (not 476 — 476 is charges constatées d'avance per revised plan)
- DV: account 479 (not 477 — 477 is produits constatés d'avance per revised plan)

---

# DATA SECTION 3 — BALANCE SHEET PASSIF MAPPING
(Source: Regroupement_des_Comptes_Reforme.xlsx — Sheet: PASSIF)

| REF | Label | Note | Accounts | Direction |
|---|---|---|---|---|
| CA | CAPITAL | 13 | 10 sauf 105, 106, 109 | CREDIT |
| CB | Apporteurs capital non appelé (-) | 13 | 109 | DEBIT shown NEGATIVE |
| CD | Primes liées au capital social | 14 | 105 | CREDIT |
| CE | Écart de réévaluation | 3C | 106 | CREDIT |
| CF | Réserves indisponibles | 14 | 111, 112, 113 | CREDIT |
| CG | Réserves libres | 14 | 118 | CREDIT |
| CH | Report à nouveau + ou − | 14 | 129 SD (debit=negative), 121 SC (credit=positive) | BOTH |
| CJ | Résultat net de l'exercice | | Computed from XI (N) / account 13 (N-1) | WITH SIGN |
| CL | Subventions d'investissement | 15 | 14 | CREDIT |
| CM | Provisions réglementées | 15 | 15 | CREDIT |
| CP | TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES | | CA+CB+CD+CE+CF+CG+CH+CJ+CL+CM | |
| DA | Emprunts et dettes financières diverses | 16 | 16 et 18 | CREDIT |
| DB | Dettes de location et acquisition | 16 | 17 | CREDIT |
| DC | Provisions pour risques et charges | 16 | 19 | CREDIT |
| DD | TOTAL DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES | | DA+DB+DC | |
| DF | TOTAL RESSOURCES STABLES | | CP+DD | |
| DH | Dettes circulantes HAO | 5 | 48 SC (credit balances) | CREDIT |
| DI | Clients, avances reçues | 7 | 4191 | CREDIT |
| DJ | Fournisseurs d'exploitation | 17 | 40 SC sauf 409 | CREDIT |
| DK | Dettes fiscales et sociales | 18 | 42, 43, 44 SC | CREDIT |
| DM | Autres dettes | 19 | 45, 46, 47 sauf 479 | CREDIT |
| DN | Provisions pour risques à court terme | 19 | 499 et 599 | CREDIT |
| DP | TOTAL PASSIF CIRCULANT | | DH+DI+DJ+DK+DM+DN | |
| DQ | Banques, crédits d'escompte | 20 | 56 | CREDIT |
| DR | Banques, établissements financiers et crédits trésorerie | 20 | 52 SC (credit balances of 52) | CREDIT |
| DT | TOTAL TRÉSORERIE PASSIF | | DQ+DR | |
| DV | Écart de conversion passif | 12 | 479 | CREDIT |
| DZ | TOTAL GÉNÉRAL PASSIF | | DF+DP+DT+DV | |

**KEY CORRECTIONS from source:**
- DA: accounts 16 AND 18 (titres participatifs, avances conditionnées, TSDI, ORA)
- DH: account 48 credit balances (SC)
- DI: account 4191 specifically
- DJ: account 40 credit balances EXCLUDING 409
- DM: accounts 45, 46, 47 EXCLUDING 479 (479 = écart de conversion passif = DV)
- DQ: ALL of account 56
- DR: account 52 credit balances only
- DV: account 479 (écarts de conversion passif — sub-accounts 4791-4798)
- BU: account 478 (écarts de conversion actif — sub-accounts 4781-4788)

---

# DATA SECTION 4 — CASH FLOW STATEMENT FORMULAS
(Source: FICHIER_TFT.xlsx — Sheet: TFT DAE version 2)

| REF | Label | Formula | Notes |
|---|---|---|---|
| ZA | Trésorerie nette au 1er janvier | (BT−DT)_N-1 − [S(4726)+S(4786)−S(4797)]_N-1 | Opening cash |
| FA | CAFG | XD+TK+TM+TO−S(86)+RM+RP+S(85)+RQ+RS+S(654)−S(754) | TK+RM+RS included |
| FB | Variation actif circulant HAO | −([B(488)−A(498)+47818−47918]_N − same_N-1) | Deduct increase |
| FC | Variation des stocks | −[BB_N − BB_N-1] | Deduct increase |
| FD | Variation des créances | −([BG+SD(47811,276)−SD(414,4494,458,461,467,4751)−SC(47911)]_N − same_N-1) | Deduct increase |
| FE | Variation du passif circulant | [DH'+DI'+DJ'+DK'+DM'+DN+4793+4798−4783+S(176)]_N − same_N-1 | DH'=S(484,4998); DJ'=DJ−S(404); DK'=DK−S(4493,4494,4497,4499); DM'=DM−S(4726,461,465,4752)−MD(4713) |
| ZB | Flux opérationnels | FA+FB+FC+FD+FE | |
| FF | Acquisitions immob incorporelles | −(Acquisitions[IMMOB INCORP](Note3A)+Acquisitions[AVANCES IMMOB INCORP](Note3A)−Cessions[AVANCES IMMOB INCORP](Note3A)−[S(4811,4821,4041,4046,48161,48171,48181)_N−same_N-1]) | |
| FG | Acquisitions immob corporelles | −(Acquisitions[IMMOB CORP](Note3A)+Acquisitions[AVANCES IMMOB CORP](Note3A)−Cessions[AVANCES IMMOB CORP](Note3A)−Acquisitions[LOCATION-ACQUISITION](Note3B)−[S(4812,4822,4042,4047,47918,47938,48162,48172,48182)_N−same_N-1]) | |
| FH | Acquisitions immob financières | −(Acquisitions[IMMOB FIN](Note3A)+[S(4813,4782,−4792,−MD(2714,276))_N−same_N-1]) | |
| FI | Cessions incorp et corp | SC(754,821,822)−[SD(414,485,−4856)_N−SD(414,485,−4856)_N-1] | |
| FJ | Cessions financières | SC(826)+[−SD(4856)_N+SD(4856)_N-1]+MC(27 sauf 2714,2766) | |
| ZC | Flux investissement | FF+FG+FH+FI+FJ | |
| FK | Augmentations capital | [CA+CB−SD(4613,4619,467,4581)]_N − same_N-1 = 0 si négatif | |
| FL | Subventions reçues | MC(14)−[SD(4582,4494)_N−SD(4582,4494)_N-1] | |
| FM | Prélèvements capital | =FK si FK négatif 0 autrement (CF+CG+CH)_N−(CF+CG+CH+CJ)_N-1+MC(465) | |
| FN | Dividendes versés | −MD(465) | |
| ZD | Flux capitaux propres | FK+FL+FM+FN | |
| FO | Emprunts nouveaux | MC(161,162)−SD(4784)−MD(4713)−MD(4794)−(S(166)_N−S(166)_N-1) | |
| FP | Autres dettes financières | MC(163,164,165,181,182,183,184) | |
| FQ | Remboursements | −MD(16,17,181,182,183,184)+SC(4794) | |
| ZE | Flux capitaux étrangers | FO+FP+FQ | |
| ZF | Flux financement | ZD+ZE | |
| ZG | Variation trésorerie | ZB+ZC+ZF | |
| ZH | Trésorerie 31 décembre | ZG+ZA | Control: (BT−DT)+[S(4786)−S(4726)−S(4797)]_N |

**Légende TFT:**
- S = Solde (débit−crédit)
- B = Brut
- A = Amortissement
- SD = Solde Débiteur
- SC = Solde Créditeur
- MD = Mouvement Débit
- MC = Mouvement Crédit

---

# DATA SECTION 5 — COMPLETE SYSCOHADA CHART OF ACCOUNTS
(Source: liste_de_comptes.xlsx — all 1499 rows extracted)

## CLASSE 1 : COMPTES DE RESSOURCES DURABLES

```
10  CAPITAL
    101  CAPITAL SOCIAL
         1011  Capital souscrit, non appelé
         1012  Capital souscrit, appelé, non versé
         1013  Capital souscrit, appelé, versé, non amorti
         1014  Capital souscrit, appelé, versé, amorti
         1018  Capital souscrit soumis à des conditions particulières
    102  CAPITAL PAR DOTATION
         1021  Dotation initiale
         1022  Dotations complémentaires
         1028  Autres dotations
    103  CAPITAL PERSONNEL
    104  COMPTE DE L'EXPLOITANT
         1041  Apports temporaires
         1042  Opérations courantes
         1043  Rémunérations, impôts et autres charges personnelles
         1047  Prélèvements d'autoconsommation
         1048  Autres prélèvements
    105  PRIMES LIEES AU CAPITAL SOCIAL
         1051  Primes d'émission
         1052  Primes d'apport
         1053  Primes de fusion
         1054  Primes de conversion
         1058  Autres primes
    106  ECARTS DE REEVALUATION
         1061  Ecarts de réévaluation légale
         1062  Ecarts de réévaluation libre
    109  APPORTEURS, CAPITAL SOUSCRIT, NON APPELE

11  RESERVES
    111  RESERVE LEGALE
    112  RESERVES STATUTAIRES OU CONTRACTUELLES
    113  RESERVES REGLEMENTEES
         1131  Réserves de plus-values nettes à long terme
         1132  Réserves d'attribution gratuite d'actions au personnel salarié et aux dirigeants
         1133  Réserves consécutives à l'octroi de subventions d'investissement
         1134  Réserves des valeurs mobilières donnant accès au capital
         1138  Autres réserves réglementées
    118  AUTRES RESERVES
         1181  Réserves facultatives
         1188  Réserves diverses

12  REPORT A NOUVEAU
    121  REPORT A NOUVEAU CREDITEUR
    129  REPORT A NOUVEAU DEBITEUR
         1291  Perte nette à reporter
         1292  Perte - Amortissements réputés différés

13  RESULTAT NET DE L'EXERCICE
    130  RESULTAT EN INSTANCE D'AFFECTATION
         1301  Résultat en instance d'affectation : Bénéfice
         1309  Résultat en instance d'affectation : Perte
    131  RESULTAT NET : BENEFICE
    132  MARGE COMMERCIALE (MC)
         1321  Marge brute sur marchandises (SUPPRIME)
         1322  Marge brute sur matières
    133  VALEUR AJOUTEE (V.A.)
    134  EXCEDENT BRUT D'EXPLOITATION (E.B.E.)
    135  RESULTAT D'EXPLOITATION (R.E.)
    136  RESULTAT FINANCIER (R.F.)
    137  RESULTAT DES ACTIVITES ORDINAIRES (R.A.O.)
    138  RESULTAT HORS ACTIVITES ORDINAIRES (R.H.A.O.)
         1381  Résultat de fusion
         1382  Résultat d'apport partiel d'actif
         1383  Résultat de scission
         1384  Résultat de liquidation
    139  RESULTAT NET : PERTE

14  SUBVENTIONS D'INVESTISSEMENT
    141  SUBVENTIONS D'EQUIPEMENT A
         1411  Etat
         1412  Régions
         1413  Départements
         1414  Communes et collectivités publiques décentralisées
         1415  Entités publiques ou mixtes
         1416  Entités et organismes privés
         1417  Organismes internationaux
         1418  Autres
    142  SUBVENTIONS D'EQUIPEMENT B
    148  AUTRES SUBVENTIONS D'INVESTISSEMENT

15  PROVISIONS REGLEMENTEES ET FONDS ASSIMILES
    151  AMORTISSEMENTS DEROGATOIRES
    152  PLUS-VALUES DE CESSION A REINVESTIR
    153  FONDS REGLEMENTES
         1531  Fonds National
         1532  Prélèvement pour le Budget
    154  PROVISIONS SPECIALES DE REEVALUATION
    155  PROVISIONS REGLEMENTEES RELATIVES AUX IMMOBILISATIONS
         1551  Reconstitution des gisements miniers et pétroliers
    156  PROVISIONS REGLEMENTEES RELATIVES AUX STOCKS
         1561  Hausse de prix
         1562  Fluctuation des cours
    157  PROVISIONS POUR INVESTISSEMENT
    158  AUTRES PROVISIONS ET FONDS REGLEMENTES

16  EMPRUNTS ET DETTES ASSIMILES
    161  EMPRUNTS OBLIGATAIRES
         1611  Emprunts obligataires ordinaires
         1612  Emprunts obligataires convertibles en actions
         1613  Emprunts obligataires remboursables en actions
         1618  Autres emprunts obligataires
    162  EMPRUNTS ET DETTES AUPRES DES ETABLISSEMENTS DE CREDIT
    163  AVANCES RECUES DE L'ETAT
    164  AVANCES RECUES ET COMPTES COURANTS BLOQUES
    165  DEPOTS ET CAUTIONNEMENTS RECUS
         1651  Dépôts
         1652  Cautionnements
    166  INTERETS COURUS
         1661  sur emprunts obligataires
         1662  sur emprunts et dettes auprès des établissements de crédit
         1663  sur avances reçues de l'Etat
         1664  sur avances reçues et comptes courants bloqués
         1665  sur dépôts et cautionnements reçus
         1667  sur avances assorties de conditions particulières
         1668  sur autres emprunts et dettes
    167  AVANCES ASSORTIES DE CONDITIONS PARTICULIERES
         1671  Avances bloquées pour augmentation du capital
         1672  Avances conditionnées par l'Etat
         1673  Avances conditionnées par les autres organismes africains
         1674  Avances conditionnées par les organismes internationaux
         1676  Droits du concédant exigibles en nature
    168  AUTRES EMPRUNTS ET DETTES
         1681  Rentes viagères capitalisées
         1682  Billets de fonds
         1683  Dettes consécutives à des titres empruntés
         1684  Emprunts participatifs
         1685  Participation des travailleurs aux bénéfices
         1686  Emprunts et dettes contractés auprès des autres tiers

17  DETTES DE LOCATION-ACQUISITION
    172  DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL IMMOBILIER
    173  DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL MOBILIER
    174  DETTES DE LOCATION-ACQUISITION / LOCATION-VENTE
    176  INTERETS COURUS
         1762  sur dettes de location-acquisition / crédit-bail immobilier
         1763  sur dettes de location-acquisition / crédit-bail mobilier
         1764  sur dettes de location-acquisition / location-vente
         1768  sur autres dettes de location-acquisition
    178  AUTRES DETTES DE LOCATION-ACQUISITION

18  DETTES LIEES A DES PARTICIPATIONS ET COMPTES DE LIAISON
    181  DETTES LIEES A DES PARTICIPATIONS
         1811  Dettes liées à des participations (groupe)
         1812  Dettes liées à des participations (hors groupe)
    182  DETTES LIEES A DES SOCIETES EN PARTICIPATION
    183  INTERETS COURUS SUR DETTES LIEES A DES PARTICIPATIONS
    184  COMPTES PERMANENTS BLOQUES DES ETABLISSEMENTS ET SUCCURSALES
    185  COMPTES PERMANENTS NON BLOQUES DES ETABLISSEMENTS ET SUCCURSALES
    186  COMPTES DE LIAISON CHARGES
    187  COMPTES DE LIAISON PRODUITS
    188  COMPTES DE LIAISON DES SOCIETES EN PARTICIPATION

19  PROVISIONS POUR RISQUES ET CHARGES
    191  PROVISIONS POUR LITIGES
    192  PROVISIONS POUR GARANTIES DONNEES AUX CLIENTS
    193  PROVISIONS POUR PERTES SUR MARCHES A ACHEVEMENT FUTUR
    194  PROVISIONS POUR PERTES DE CHANGE
    195  PROVISIONS POUR IMPOTS
    196  PROVISIONS POUR PENSIONS ET OBLIGATIONS SIMILAIRES
         1961  Provisions pour pensions et obligations similaires – engagement de retraite
         1962  Actif du régime de retraite
    197  PROVISIONS POUR RESTRUCTURATION
         1971  Provisions pour grosses réparations
    198  AUTRES PROVISIONS POUR RISQUES ET CHARGES
         1981  Provisions pour amendes et pénalités
         1982  Provisions pour renouvellement des immobilisations (entreprises concessionnaires)
         1983  Provisions de propre assureur
         1984  Provisions pour démantèlement et remise en état
         1985  Provisions pour droits à réduction ou avantage en nature
         1988  Provisions pour divers risques et charges
```

## CLASSE 2 : COMPTES D'ACTIF IMMOBILISÉ

```
20  CHARGES IMMOBILISEES (Supprimé — conservé pour transition)
    201  FRAIS D'ETABLISSEMENT
         2011  Frais de constitution
         2012  Frais de prospection
         2013  Frais de publicité et de lancement
         2014  Frais de fonctionnement antérieurs au démarrage
         2015  Frais de modification du capital (fusions, scissions, transformations)
         2016  Frais d'entrée à la Bourse
         2017  Frais de restructuration
         2018  Frais divers d'établissement
    202  CHARGES A REPARTIR SUR PLUSIEURS EXERCICES
         2021  Charges différées
         2022  Frais d'acquisition d'immobilisations
         2026  Frais d'émission des emprunts
         2028  Charges à étaler
    206  PRIMES DE REMBOURSEMENT DES OBLIGATIONS
         2061  Obligations ordinaires
         2062  Obligations convertibles
         2068  Autres emprunts obligataires

21  IMMOBILISATIONS INCORPORELLES
    211  FRAIS DE DEVELOPPEMENT
    212  BREVETS, LICENCES, CONCESSIONS ET DROITS SIMILAIRES
         2121  Brevets
         2122  Licences
         2123  Concessions de service public
         2128  Autres concessions et droits similaires
    213  LOGICIELS ET SITES INTERNET
         2131  Logiciels
         2132  Sites internet
    214  MARQUES
    215  FONDS COMMERCIAL
    216  DROIT AU BAIL
    217  INVESTISSEMENTS DE CREATION
    218  AUTRES DROITS ET VALEURS INCORPORELS
         2181  Frais de prospection et d'évaluation de ressources minérales
         2182  Coûts d'obtention du contrat
         2183  Fichiers clients, notices, titres de journaux et magazines
         2184  Coûts des franchises
         2188  Divers droits et valeurs incorporels
    219  IMMOBILISATIONS INCORPORELLES EN COURS
         2191  Frais de développement
         2193  Logiciels et sites internet
         2198  Autres droits et valeurs incorporels

22  TERRAINS
    221  TERRAINS AGRICOLES ET FORESTIERS
         2211  Terrains d'exploitation agricole
         2212  Terrains d'exploitation forestière
         2218  Autres terrains
    222  TERRAINS NUS
         2221  Terrains à bâtir
         2228  Autres terrains nus
    223  TERRAINS BATIS
         2231  pour bâtiments industriels et agricoles
         2232  pour bâtiments administratifs et commerciaux
         2234  pour bâtiments affectés aux autres opérations professionnelles
         2235  pour bâtiments affectés aux autres opérations non professionnelles
         2238  Autres terrains bâtis
    224  TRAVAUX DE MISE EN VALEUR DES TERRAINS
         2241  Plantation d'arbres et d'arbustes
         2245  Améliorations du fonds
         2248  Autres travaux
    225  TERRAINS DE CARRIERES – TREFONDS
         2251  Carrières
    226  TERRAINS AMENAGES
         2261  Parkings
    227  TERRAINS MIS EN CONCESSION
    228  AUTRES TERRAINS
         2281  Terrains - immeubles de placement
         2285  Terrains des logements affectés au personnel
         2286  Terrains de location-acquisition
         2288  Divers terrains
    229  AMENAGEMENTS DE TERRAINS EN COURS
         2291  Terrains agricoles et forestiers
         2292  Terrains nus
         2295  Terrains de carrières - tréfonds
         2298  Autres terrains

23  BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS
    231  BATIMENTS INDUSTRIELS, AGRICOLES, ADMINISTRATIFS ET COMMERCIAUX SUR SOL PROPRE
         2311  Bâtiments industriels
         2312  Bâtiments agricoles
         2313  Bâtiments administratifs et commerciaux
         2314  Bâtiments affectés au logement du personnel
         2315  Bâtiments - immeubles de placement
         2316  Bâtiments de location-acquisition
    232  BATIMENTS SUR SOL D'AUTRUI
         2321  Bâtiments industriels
         2322  Bâtiments agricoles
         2323  Bâtiments administratifs et commerciaux
         2324  Bâtiments affectés au logement du personnel
         2325  Bâtiments - immeubles de placement
         2326  Bâtiments de location-acquisition
    233  OUVRAGES D'INFRASTRUCTURE
         2331  Voies de terre
         2332  Voies de fer
         2333  Voies d'eau
         2334  Barrages, Digues
         2335  Pistes d'aérodrome
         2338  Autres ouvrages d'infrastructures
    234  AMENAGEMENTS, AGENCEMENTS ET INSTALLATIONS TECHNIQUES
         2341  Installations complexes spécialisées sur sol propre
         2342  Installations complexes spécialisées sur sol d'autrui
         2343  Installations à caractère spécifique sur sol propre
         2344  Installations à caractère spécifique sur sol d'autrui
         2345  Aménagements et agencements des bâtiments
    235  AMENAGEMENTS DE BUREAUX
         2351  Installations générales
         2358  Autres aménagements de bureaux
    237  BATIMENTS MIS EN CONCESSION
    238  AUTRES INSTALLATIONS ET AGENCEMENTS
    239  BATIMENTS, AMENAGEMENTS ET INSTALLATIONS EN COURS
         2391  Bâtiments en cours
         2392  Installations en cours
         2393  Ouvrages d'infrastructure en cours
         2394  Aménagements, agencements et installations techniques en cours
         2395  Aménagements de bureaux en cours
         2398  Autres installations et agencements en cours

24  MATERIEL, MOBILIER ET ACTIFS BIOLOGIQUES
    241  MATERIEL ET OUTILLAGE INDUSTRIEL ET COMMERCIAL
         2411  Matériel industriel
         2412  Outillage industriel
         2413  Matériel commercial
         2414  Outillage commercial
         2416  Matériel et outillage industriel et commercial de location-acquisition
    242  MATERIEL ET OUTILLAGE AGRICOLE
         2421  Matériel agricole
         2422  Outillage agricole
         2426  Matériel et outillage agricole de location-acquisition
    243  MATERIEL D'EMBALLAGE RECUPERABLE ET IDENTIFIABLE
    244  MATERIEL ET MOBILIER
         2441  Matériel de bureau
         2442  Matériel informatique
         2443  Matériel bureautique
         2444  Mobilier de bureau
         2445  Matériel et mobilier - immeubles de placement
         2446  Matériel et mobilier de location-acquisition
         2447  Matériel et mobilier des logements du personnel
    245  MATERIEL DE TRANSPORT
         2451  Matériel automobile
         2452  Matériel ferroviaire
         2453  Matériel fluvial, lagunaire
         2454  Matériel naval
         2455  Matériel aérien
         2456  Matériel de transport de location-acquisition
         2457  Matériel hippomobile
         2458  Autres matériels de transport
    246  ACTIFS BIOLOGIQUES
         2461  Cheptel, animaux de trait
         2462  Cheptel, animaux reproducteurs
         2463  Animaux de garde
         2465  Plantations agricoles
         2468  Autres actifs biologiques
    247  AGENCEMENTS, AMENAGEMENTS DU MATERIEL ET DES ACTIFS BIOLOGIQUES
         2471  Agencements et aménagements du matériel
         2472  Agencements et aménagements des actifs biologiques
         2478  Autres agencements, aménagements
    248  AUTRES MATERIELS ET MOBILIERS
         2481  Collections et œuvres d'art
         2488  Divers matériels et mobiliers
    249  MATERIELS ET ACTIFS BIOLOGIQUES EN COURS
         2491  Matériel et outillage industriel et commercial
         2492  Matériel et outillage agricole
         2493  Matériel d'emballage récupérable et identifiable
         2494  Matériel et mobilier de bureau
         2495  Matériel de transport
         2496  Actifs biologiques
         2497  Agencements et aménagements du matériel et des actifs biologiques
         2498  Autres matériels et actifs biologiques

25  AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS
    251  AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS INCORPORELLES
    252  AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS CORPORELLES

26  TITRES DE PARTICIPATION
    261  TITRES DE PARTICIPATION DANS DES ENTITES SOUS CONTROLE EXCLUSIF
    262  TITRES DE PARTICIPATION DANS DES ENTITES SOUS CONTROLE CONJOINT
    263  TITRES DE PARTICIPATION DANS DES ENTITES CONFERANT UNE INFLUENCE NOTABLE
    265  PARTICIPATIONS DANS DES ORGANISMES PROFESSIONNELS
    266  PARTS DANS DES GROUPEMENTS D'INTERET ECONOMIQUE (G.I.E.)
    268  AUTRES TITRES DE PARTICIPATION

27  AUTRES IMMOBILISATIONS FINANCIERES
    271  PRETS ET CREANCES
         2711  Prêts participatifs
         2712  Prêts aux associés
         2713  Billets de fonds
         2714  Créances de location-financement
         2715  Titres prêtés
         2718  Autres prêts et créances
    272  PRETS AU PERSONNEL
         2721  Prêts immobiliers
         2722  Prêts mobiliers et d'installation
         2728  Autres prêts au personnel
    273  CREANCES SUR L'ETAT
         2731  Retenues de garantie
         2733  Fonds réglementé
         2734  Créances sur le concédant
         2738  Autres créances sur l'Etat
    274  TITRES IMMOBILISES
         2741  Titres immobilisés de l'activité de portefeuille (T.I.A.P.)
         2742  Titres participatifs
         2743  Certificats d'investissement
         2744  Parts de fonds commun de placement (F.C.P.)
         2745  Obligations
         2746  Actions ou parts propres
         2748  Autres titres immobilisés
    275  DEPOTS ET CAUTIONNEMENTS VERSES
         2751  Dépôts pour loyers d'avance
         2752  Dépôts pour l'électricité
         2753  Dépôts pour l'eau
         2754  Dépôts pour le gaz
         2755  Dépôts pour le téléphone, le télex, la télécopie
         2756  Cautionnements sur marchés publics
         2757  Cautionnements sur autres opérations
         2758  Autres dépôts et cautionnements
    276  INTERETS COURUS
         2761  Prêts et créances non commerciales
         2762  Prêts au personnel
         2763  Créances sur l'Etat
         2764  Titres immobilisés
         2765  Dépôts et cautionnements versés
         2766  Créances de location-financement
         2767  Créances rattachées à des participations
         2768  Immobilisations financières diverses
    277  CREANCES RATTACHEES A DES PARTICIPATIONS ET AVANCES A DES G.I.E.
         2771  Créances rattachées à des participations (groupe)
         2772  Créances rattachées à des participations (hors groupe)
         2773  Créances rattachées à des sociétés en participation
         2774  Avances à des Groupements d'intérêt économique (G.I.E.)
    278  IMMOBILISATIONS FINANCIERES DIVERSES
         2781  Créances diverses groupe
         2782  Créances diverses hors groupe
         2784  Banques dépôts à terme
         2785  Or et métaux précieux
         2788  Autres immobilisations financières

28  AMORTISSEMENTS
    281  AMORTISSEMENTS DES IMMOBILISATIONS INCORPORELLES
         2811  Amortissements des frais de développement
         2812  Amortissements des brevets, licences, concessions et droits similaires
         2813  Amortissements des logiciels et sites internet
         2814  Amortissements des marques
         2815  Amortissements du fonds commercial
         2816  Amortissements du droit au bail
         2817  Amortissements des investissements de création
         2818  Amortissements des autres droits et valeurs incorporels
    282  AMORTISSEMENTS DES TERRAINS
         2821  Amortissements des terrains agricoles et forestiers
         2824  Amortissements des travaux de mise en valeur des terrains
         2825  Amortissements des terrains de gisement
    283  AMORTISSEMENTS DES BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS
         2831  Amortissements des bâtiments industriels, agricoles, administratifs et commerciaux sur sol propre
         2832  Amortissements des bâtiments sur sol d'autrui
         2833  Amortissements des ouvrages d'infrastructure
         2834  Amortissements des aménagements, agencements et installations techniques
         2835  Amortissements des aménagements de bureaux
         2837  Amortissements des bâtiments mis en concession
         2838  Amortissements des autres installations et agencements
    284  AMORTISSEMENTS DU MATERIEL
         2841  Amortissements du matériel et outillage industriel et commercial
         2842  Amortissements du matériel et outillage agricole
         2843  Amortissements du matériel d'emballage récupérable et identifiable
         2844  Amortissements du matériel et mobilier
         2845  Amortissements du matériel de transport
         2846  Amortissements des actifs biologiques
         2847  Amortissements des agencements, aménagements du matériel et des actifs biologiques
         2848  Amortissements des autres matériels

29  DEPRECIATIONS DES IMMOBILISATIONS
    291  DEPRECIATIONS DES IMMOBILISATIONS INCORPORELLES
         2911  Dépréciations des frais de développement
         2912  Dépréciations des brevets, licences, concessions et droits similaires
         2913  Dépréciations des logiciels et sites internet
         2914  Dépréciations des marques
         2915  Dépréciations du fonds commercial
         2916  Dépréciations du droit au bail
         2917  Dépréciations des investissements de création
         2918  Dépréciations des autres droits et valeurs incorporels
         2919  Dépréciations des immobilisations incorporelles en cours
    292  DEPRECIATIONS DES TERRAINS
         2921  Dépréciations des terrains agricoles et forestiers
         2922  Dépréciations des terrains nus
         2923  Dépréciations des terrains bâtis
         2924  Dépréciations des travaux de mise en valeur des terrains
         2925  Dépréciations des terrains de carrières-tréfonds
         2926  Dépréciations des terrains aménagés
         2927  Dépréciations des terrains mis en concession
         2928  Dépréciations des autres terrains
         2929  Dépréciations des aménagements de terrains en cours
    293  DEPRECIATIONS DES BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS
         2931  Dépréciations des bâtiments sur sol propre
         2932  Dépréciations des bâtiments sur sol d'autrui
         2933  Dépréciations des ouvrages d'infrastructures
         2934  Dépréciations des aménagements, agencements et installations techniques
         2935  Dépréciations des aménagements de bureaux
         2937  Dépréciations des bâtiments mis en concession
         2938  Dépréciations des autres installations et agencements
         2939  Dépréciations des bâtiments et installations en cours
    294  DEPRECIATIONS DE MATERIEL, DU MOBILIER ET DE L'ACTIF BIOLOGIQUE
         2941  Dépréciations du matériel et outillage industriel et commercial
         2942  Dépréciations du matériel et outillage agricole
         2943  Dépréciations du matériel d'emballage récupérable et identifiable
         2944  Dépréciations du matériel et mobilier
         2945  Dépréciations du matériel de transport
         2946  Dépréciations des actifs biologiques
         2947  Dépréciations des agencements, aménagements du matériel et des actifs biologiques
         2948  Dépréciations des autres matériels
         2949  Dépréciations de matériel en cours
    295  DEPRECIATIONS DES AVANCES ET ACOMPTES
         2951  Dépréciations des avances et acomptes versés sur immobilisations incorporelles
         2952  Dépréciations des avances et acomptes versés sur immobilisations corporelles
    296  DEPRECIATIONS DES TITRES DE PARTICIPATION
         2961  Dépréciations des titres - entités sous contrôle exclusif
         2962  Dépréciations des titres - entités sous contrôle conjoint
         2963  Dépréciations des titres - entités conférant une influence notable
         2965  Dépréciations des participations dans des organismes professionnels
         2966  Dépréciations des parts dans des GIE
         2968  Dépréciations des autres titres de participation
    297  DEPRECIATIONS DES AUTRES IMMOBILISATIONS FINANCIERES
         2971  Dépréciations des prêts et créances
         2972  Dépréciations des prêts au personnel
         2973  Dépréciations des créances sur l'Etat
         2974  Dépréciations des titres immobilisés
         2975  Dépréciations des dépôts et cautionnements versés
         2977  Dépréciations des créances rattachées à des participations et avances à des GIE
         2978  Dépréciations des créances financières diverses
```

## CLASSE 3 : COMPTES DE STOCKS

```
31  MARCHANDISES
    311  MARCHANDISES A
         3111  Marchandises A1
         3112  Marchandises A2
    312  MARCHANDISES B
         3121  Marchandises B1
         3122  Marchandises B2
    313  ACTIFS BIOLOGIQUES
         3131  Animaux
         3132  Végétaux
    318  MARCHANDISES HORS ACTIVITES ORDINAIRES (H.A.O.)

32  MATIERES PREMIERES ET FOURNITURES LIEES
    321  MATIERES A
    322  MATIERES B
    323  FOURNITURES (A, B)

33  AUTRES APPROVISIONNEMENTS
    331  MATIERES CONSOMMABLES
    332  FOURNITURES D'ATELIER ET D'USINE
    333  FOURNITURES DE MAGASIN
    334  FOURNITURES DE BUREAU
    335  EMBALLAGES
         3351  Emballages perdus
         3352  Emballages récupérables non identifiables
         3353  Emballages à usage mixte
         3358  Autres emballages
    338  AUTRES MATIERES

34  PRODUITS EN COURS
    341  PRODUITS EN COURS
         3411  Produits en cours P1
         3412  Produits en cours P2
    342  TRAVAUX EN COURS
         3421  Travaux en cours T1
         3422  Travaux en cours T2
    343  PRODUITS INTERMEDIAIRES EN COURS
         3431  Produits intermédiaires A
         3432  Produits intermédiaires B
    344  PRODUITS RESIDUELS EN COURS
         3441  Produits résiduels A
         3442  Produits résiduels B
    345  ACTIFS BIOLOGIQUES
         3451  Animaux
         3452  Végétaux

35  SERVICES EN COURS
    351  ETUDES EN COURS
         3511  Etudes en cours E1
         3512  Etudes en cours E2
    352  PRESTATIONS DE SERVICES EN COURS
         3521  Prestations de services S1
         3522  Prestations de services S2

36  PRODUITS FINIS
    361  PRODUITS FINIS A
    362  PRODUITS FINIS B
    363  ACTIFS BIOLOGIQUES
         3631  Animaux
         3632  Végétaux
         3638  Autres stocks (activités annexes)

37  PRODUITS INTERMEDIAIRES ET RESIDUELS
    371  PRODUITS INTERMEDIAIRES
         3711  Produits intermédiaires A
         3712  Produits intermédiaires B
    372  PRODUITS RESIDUELS
         3721  Déchets
         3722  Rebuts
         3723  Matières de récupération
    373  ACTIFS BIOLOGIQUES
         3731  Animaux
         3732  Végétaux
         3738  Autres stocks (activités annexes)

38  STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT
    381  MARCHANDISES EN COURS DE ROUTE
    382  MATIERES PREMIERES ET FOURNITURES LIEES EN COURS DE ROUTE
    383  AUTRES APPROVISIONNEMENTS EN COURS DE ROUTE
    386  PRODUITS FINIS EN COURS DE ROUTE
    387  STOCK EN CONSIGNATION OU EN DEPOT
         3871  Stock en consignation
         3872  Stock en dépôt
    388  STOCK PROVENANT D'IMMOBILISATIONS MISES HORS SERVICE OU AU REBUT

39  DEPRECIATIONS DES STOCKS ET ENCOURS
    391  DEPRECIATIONS DES STOCKS DE MARCHANDISES
    392  DEPRECIATIONS DES STOCKS DE MATIERES PREMIERES ET FOURNITURES LIEES
    393  DEPRECIATIONS DES STOCKS D'AUTRES APPROVISIONNEMENTS
    394  DEPRECIATIONS DES PRODUCTIONS EN COURS
    395  DEPRECIATIONS DES SERVICES EN COURS
    396  DEPRECIATIONS DES STOCKS DE PRODUITS FINIS
    397  DEPRECIATIONS DES STOCKS DE PRODUITS INTERMEDIAIRES ET RESIDUELS
    398  DEPRECIATIONS DES STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT
```

## CLASSE 4 : COMPTES DE TIERS

```
40  FOURNISSEURS ET COMPTES RATTACHES
    401  FOURNISSEURS, DETTES EN COMPTE
         4011  Fournisseurs
         4012  Fournisseurs Groupe
         4013  Fournisseurs sous-traitants
         4016  Fournisseurs, réserve de propriété
         4017  Fournisseurs, retenues de garantie
    402  FOURNISSEURS, EFFETS A PAYER
         4021  Fournisseurs, Effets à payer
         4022  Fournisseurs - Groupe, Effets à payer
         4023  Fournisseurs sous-traitants, Effets à payer
    404  FOURNISSEURS, ACQUISITIONS COURANTES D'IMMOBILISATIONS
         4041  Fournisseurs dettes en compte, immobilisations incorporelles
         4042  Fournisseurs dettes en compte, immobilisations corporelles
         4046  Fournisseurs effets à payer, immobilisations incorporelles
         4047  Fournisseurs effets à payer, immobilisations corporelles
    408  FOURNISSEURS, FACTURES NON PARVENUES
         4081  Fournisseurs
         4082  Fournisseurs - Groupe
         4083  Fournisseurs sous-traitants
         4086  Fournisseurs, intérêts courus
    409  FOURNISSEURS DEBITEURS
         4091  Fournisseurs avances et acomptes versés [→ BH on Bilan]
         4092  Fournisseurs - Groupe avances et acomptes versés
         4093  Fournisseurs sous-traitants avances et acomptes versés
         4094  Fournisseurs créances pour emballages et matériels à rendre
         4098  Fournisseurs, rabais, remises, ristournes et autres avoirs à obtenir

41  CLIENTS ET COMPTES RATTACHES
    411  CLIENTS
         4111  Clients
         4112  Clients - Groupe
         4114  Clients, Etat et Collectivités publiques
         4115  Clients, organismes internationaux
         4116  Clients, réserve de propriété
         4117  Clients, retenues de garantie
         4118  Clients, dégrèvement de TVA
    412  CLIENTS, EFFETS A RECEVOIR EN PORTEFEUILLE
         4121  Clients, Effets à recevoir
         4122  Clients - Groupe, Effets à recevoir
         4124  Etat et Collectivités publiques, Effets à recevoir
         4125  Organismes Internationaux, Effets à recevoir
    413  CLIENTS, CHEQUES, EFFETS ET AUTRES VALEURS IMPAYES
         4131  Clients, chèques impayés
         4132  Clients, Effets impayés
         4133  Clients, cartes de crédit impayées
         4138  Clients, autres valeurs impayées
    414  CREANCES SUR CESSIONS COURANTES D'IMMOBILISATIONS
         4141  Créances en compte, immobilisations incorporelles
         4142  Créances en compte, immobilisations corporelles
         4146  Effets à recevoir, immobilisations incorporelles
         4147  Effets à recevoir, immobilisations corporelles
    415  CLIENTS, EFFETS ESCOMPTES NON ECHUS
    416  CREANCES CLIENTS LITIGIEUSES OU DOUTEUSES
         4161  Créances litigieuses
         4162  Créances douteuses
    418  CLIENTS, PRODUITS A RECEVOIR
         4181  Clients, factures à établir
         4186  Clients, intérêts courus
    419  CLIENTS CREDITEURS [→ DI on Bilan]
         4191  Clients, avances et acomptes reçus
         4192  Clients - Groupe, avances et acomptes reçus
         4194  Clients, dettes pour emballages et matériels consignés
         4198  Clients, rabais, remises, ristournes et autres avoirs à accorder

42  PERSONNEL
    421  PERSONNEL, AVANCES ET ACOMPTES
         4211  Personnel, avances
         4212  Personnel, acomptes
         4213  Frais avancés et fournitures au personnel
    422  PERSONNEL, REMUNERATIONS DUES
    423  PERSONNEL, OPPOSITIONS, SAISIES-ARRETS
         4231  Personnel, oppositions
         4232  Personnel, saisies-arrêts
         4233  Personnel, avis à tiers détenteur
    424  PERSONNEL, OEUVRES SOCIALES INTERNES
         4241  Assistance médicale
         4242  Allocations familiales
         4245  Organismes sociaux rattachés à l'entité
         4248  Autres oeuvres sociales internes
    425  REPRESENTANTS DU PERSONNEL
         4251  Délégués du personnel
         4252  Syndicats et Comités d'entreprises, d'Etablissement
         4258  Autres représentants du personnel
    426  PERSONNEL, PARTICIPATION AUX BENEFICES ET AU CAPITAL
         4261  Participation aux bénéfices
         4264  Participation au capital
    427  PERSONNEL – DEPOTS
    428  PERSONNEL, CHARGES A PAYER ET PRODUITS A RECEVOIR
         4281  Dettes provisionnées pour congés à payer
         4286  Autres charges à payer
         4287  Produits à recevoir

43  ORGANISMES SOCIAUX
    431  SECURITE SOCIALE
         4311  Prestations familiales
         4312  Accidents de travail
         4313  Caisse de retraite obligatoire
         4314  Caisse de retraite facultative
         4318  Autres cotisations sociales
    432  CAISSES DE RETRAITE COMPLEMENTAIRE
    433  AUTRES ORGANISMES SOCIAUX
         4331  Mutuelle
         4332  Assurances Retraite
         4333  Assurances et organismes de santé
    438  ORGANISMES SOCIAUX, CHARGES A PAYER ET PRODUITS A RECEVOIR
         4381  Charges sociales sur gratifications à payer
         4382  Charges sociales sur congés à payer
         4386  Autres charges à payer
         4387  Produits à recevoir

44  ETAT ET COLLECTIVITES PUBLIQUES
    441  ETAT, IMPOT SUR LES BENEFICES
    442  ETAT, AUTRES IMPOTS ET TAXES
         4421  Impôts et taxes d'Etat
         4422  Impôts et taxes pour les collectivités publiques
         4423  Impôts et taxes recouvrables sur des obligataires
         4424  Impôts et taxes recouvrables sur des associés
         4426  Droits de douane
         4428  Autres impôts et taxes
    443  ETAT, T.V.A. FACTUREE
         4431  T.V.A. facturée sur ventes
         4432  T.V.A. facturée sur prestations de services
         4433  T.V.A. facturée sur travaux
         4334  T.V.A. facturée sur production livrée à soi-même
         4335  T.V.A. sur factures à établir
    444  ETAT, T.V.A. DUE OU CREDIT DE T.V.A.
         4441  Etat, T.V.A. due
         4445  Etat, dégrèvement T.V.A.
         4449  Etat, crédit de T.V.A. à reporter
    445  ETAT, T.V.A. RECUPERABLE
         4451  T.V.A. récupérable sur immobilisations
         4452  T.V.A. récupérable sur achats
         4453  T.V.A. récupérable sur transport
         4454  T.V.A. récupérable sur services extérieurs et autres charges
         4455  T.V.A. récupérable sur factures non parvenues
         4456  T.V.A. transférée par d'autres entités
    446  ETAT, AUTRES TAXES SUR LE CHIFFRE D'AFFAIRES
    447  ETAT, IMPOTS RETENUS A LA SOURCE
         4471  Impôt Général sur le revenu
         4472  Impôts sur salaires
         4473  Contribution nationale
         4474  Contribution nationale de solidarité
         4478  Autres impôts et contributions
    448  ETAT, CHARGES A PAYER ET PRODUITS A RECEVOIR
         4486  Charges à payer
         4487  Produits à recevoir
    449  ETAT, CREANCES ET DETTES DIVERSES
         4491  Etat, obligations cautionnées
         4492  Etat, avances et acomptes versés sur impôts
         4493  Etat, fonds de dotation à recevoir
         4494  Etat, subventions d'investissement à recevoir
         4495  Etat, subventions d'exploitation à recevoir
         4496  Etat, subventions d'équilibre à recevoir
         4497  Etat, avances sur subventions
         4499  Etat, fonds réglementé provisionné

45  ORGANISMES INTERNATIONAUX
    451  OPERATIONS AVEC LES ORGANISMES AFRICAINS
    452  OPERATIONS AVEC LES AUTRES ORGANISMES INTERNATIONAUX
    458  ORGANISMES INTERNATIONAUX, FONDS DE DOTATION ET SUBVENTIONS A RECEVOIR
         4581  Organismes internationaux, fonds de dotation à recevoir
         4582  Organismes internationaux, subventions à recevoir

46  APPORTEURS, ASSOCIES ET GROUPE
    461  APPORTEURS, OPERATIONS SUR LE CAPITAL
         4611  Apporteurs, apports en nature
         4612  Apporteurs, apports en numéraire
         4613  Apporteurs, capital appelé, non versé
         4614  Apporteurs, compte d'apport, opérations de restructuration (fusion…)
         4615  Apporteurs, versements reçus sur augmentation de capital
         4616  Apporteurs, versements anticipés
         4617  Apporteurs défaillants
         4618  Apporteurs, titres à échanger
         4619  Apporteurs, capital à rembourser
    462  ASSOCIES, COMPTES COURANTS
         4621  Principal
         4626  Intérêts courus
    463  ASSOCIES, OPERATIONS FAITES EN COMMUN ET GIE
         4631  Opérations courantes
         4636  Intérêts courus
    465  ASSOCIES, DIVIDENDES A PAYER
    466  GROUPE, COMPTES COURANTS
    467  APPORTEURS RESTANT DU SUR CAPITAL APPELE
    469  ENTITE, DIVIDENDES A RECEVOIR

47  DEBITEURS ET CREDITEURS DIVERS
    471  DEBITEURS ET CREDITEURS DIVERS
         4711  Débiteurs divers
         4712  Créditeurs divers
         4713  Obligataires
         4715  Rémunérations d'administrateurs non associés
         4716  Compte d'affacturage et de titrisation
         4717  Débiteurs divers - retenues de garantie
         4718  Apport, compte de fusion et opérations assimilées
         4719  Bons de souscription d'actions et d'obligations
    472  CREANCES ET DETTES SUR TITRES DE PLACEMENT
         4721  Créances sur cessions de titres de placement
         4726  Versements restant à effectuer sur titres de placement non libérés
    473  INTERMEDIAIRES - OPERATIONS FAITES POUR COMPTE DE TIERS
         4731  Mandants
         4732  Mandataires
         4733  Commettants
         4734  Commissionnaires
         4739  Etat, Collectivités publiques, fonds global d'allocation
    474  COMPTE DE REPARTITION PERIODIQUE DES CHARGES ET DES PRODUITS
         4746  Compte de répartition périodique des charges
         4747  Compte de répartition périodique des produits
    475  COMPTE TRANSITOIRE, AJUSTEMENT SPECIAL LIE A LA REVISION DU SYSCOHADA
         4751  Compte-actif
         4752  Compte-passif [used for Notes 8A, 8B, 8C]
    476  CHARGES CONSTATEES D'AVANCE [ACTIF — goes to BJ]
    477  PRODUITS CONSTATES D'AVANCE [PASSIF — goes to DM]
    478  ECARTS DE CONVERSION - ACTIF [→ BU on Bilan]
         4781  Diminution des créances d'exploitation et HAO
         47811 Diminution des créances d'exploitation
         47818 Diminution des créances HAO
         4782  Diminution des créances financières
         4783  Augmentation des dettes d'exploitation et HAO
         47831 Augmentation des dettes d'exploitation
         47838 Augmentation des dettes HAO
         4784  Augmentation des dettes financières
         4786  Différences d'évaluation sur instruments de trésorerie
         4788  Différences compensées par couverture de change
    479  ECARTS DE CONVERSION - PASSIF [→ DV on Bilan]
         4791  Augmentation des créances d'exploitation et HAO
         47911 Augmentation des créances d'exploitation
         47918 Augmentation des créances HAO
         4792  Augmentation des créances financières
         4793  Diminution des dettes d'exploitation et HAO
         47931 Diminution des dettes d'exploitation
         47938 Diminution des dettes HAO
         4794  Diminution des dettes financières
         4797  Différences d'évaluation sur instruments de trésorerie
         4798  Différences compensées par couverture de change

48  CREANCES ET DETTES HORS ACTIVITES ORDINAIRES (HAO)
    481  FOURNISSEURS D'INVESTISSEMENTS [→ DH passif circulant]
         4811  Immobilisations incorporelles
         4812  Immobilisations corporelles
         4813  Versements restant à effectuer sur titres de participation et titres immobilisés non libérés
         4816  Réserve de propriété
         48161 Réserve de propriété - immobilisations incorporelles
         48162 Réserve de propriété - immobilisations corporelles
         4817  Retenues de garantie
         48171 Retenues de garantie - immobilisations incorporelles
         48172 Retenues de garantie - immobilisations corporelles
         4818  Factures non parvenues
         48181 Factures non parvenues - immobilisations incorporelles
         48182 Factures non parvenues - immobilisations corporelles
    482  FOURNISSEURS D'INVESTISSEMENTS, EFFETS A PAYER [→ DH]
         4821  Immobilisations incorporelles
         4822  Immobilisations corporelles
    483  DETTES SUR ACQUISITION DE TITRES DE PLACEMENT
    484  AUTRES DETTES HORS ACTIVITES ORDINAIRES (H.A.O.) [→ DH]
    485  CREANCES SUR CESSIONS D'IMMOBILISATIONS [→ BA actif]
         4851  En compte, immobilisations incorporelles
         4852  En compte, immobilisations corporelles
         4853  Effets à recevoir, immobilisations incorporelles
         4854  Effets à recevoir, immobilisations corporelles
         4855  Effets escomptés non échus
         4856  Immobilisations financières
         4857  Retenues de garantie
         4858  Factures à établir
    486  CREANCES SUR CESSIONS DE TITRES DE PLACEMENT
    488  AUTRES CREANCES HORS ACTIVITES ORDINAIRES (H.A.O.) [→ BA actif]

49  DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME (TIERS)
    490  DEPRECIATIONS DES COMPTES FOURNISSEURS
    491  DEPRECIATIONS DES COMPTES CLIENTS
         4911  Créances litigieuses
         4912  Créances douteuses
    492  DEPRECIATIONS DES COMPTES PERSONNEL
    493  DEPRECIATIONS DES COMPTES ORGANISMES SOCIAUX
    494  DEPRECIATIONS DES COMPTES ETAT ET COLLECTIVITES PUBLIQUES
    495  DEPRECIATIONS DES COMPTES ORGANISMES INTERNATIONAUX
    496  DEPRECIATIONS DES COMPTES ASSOCIES ET GROUPE
         4962  Associés, comptes courants
         4963  Associés, opérations faites en commun et GIE
         4966  Groupe, comptes courants
    497  DEPRECIATIONS DES COMPTES DEBITEURS DIVERS
    498  DEPRECIATIONS DES COMPTES DE CREANCES H.A.O.
         4985  Créances sur cessions d'immobilisations
         4986  Créances sur cessions de titres de placement
         4988  Autres créances H.A.O.
    499  PROVISIONS POUR RISQUES A COURT TERME [→ DN on Bilan]
         4991  Sur opérations d'exploitation
         4998  Sur opérations H.A.O.
```

## CLASSE 5 : COMPTES DE TRESORERIE

```
50  TITRES DE PLACEMENT
    501  TITRES DU TRESOR ET BONS DE CAISSE A COURT TERME
         5011  Titres du Trésor à court terme
         5012  Titres d'organismes financiers
         5013  Bons de caisse à court terme
         5016  Frais d'acquisition des titres de Trésor et bons de caisse
    502  ACTIONS
         5021  Actions ou parts propres
         5022  Actions cotées
         5023  Actions non cotées
         5024  Actions démembrées (certificats d'investissement ; droits de vote)
         5025  Autres actions
         5026  Frais d'acquisition des actions
    503  OBLIGATIONS
         5031  Obligations émises par l'entité et rachetées par elle
         5032  Obligations cotées
         5033  Obligations non cotées
         5035  Autres obligations
         5036  Frais d'acquisition des obligations
    504  BONS DE SOUSCRIPTION
         5042  Bons de souscription d'actions
         5043  Bons de souscription d'obligations
    505  TITRES NEGOCIABLES HORS REGION
    506  INTERETS COURUS
         5061  Titres du Trésor et bons de caisse à court terme
         5062  Actions
         5063  Obligations
    508  AUTRES TITRES DE PLACEMENT ET CREANCES ASSIMILEES

51  VALEURS A ENCAISSER
    511  EFFETS A ENCAISSER
    512  EFFETS A L'ENCAISSEMENT
    513  CHEQUES A ENCAISSER
    514  CHEQUES A L'ENCAISSEMENT
    515  CARTES DE CREDIT A ENCAISSER
    518  AUTRES VALEURS A L'ENCAISSEMENT
         5181  Warrants
         5182  Billets de fonds
         5185  Chèques de voyage
         5186  Coupons échus
         5187  Intérêts échus des obligations

52  BANQUES
    521  BANQUES LOCALES
         5211  Banques en monnaie nationale
         5215  Banques en devises
    522  BANQUES AUTRES ETATS REGION
    523  BANQUES AUTRES ETATS ZONE MONETAIRE
    524  BANQUES HORS ZONE MONETAIRE
    525  BANQUES DEPOT A TERME
    526  BANQUES, INTERETS COURUS
         5261  Banque, intérêts courus charges à payer
         5267  Banque, intérêts courus produits à recevoir

53  ETABLISSEMENTS FINANCIERS ET ASSIMILES
    531  CHEQUES POSTAUX
    532  TRESOR
    533  SOCIETES DE GESTION ET D'INTERMEDIATION (S.G.I.)
    536  ETABLISSEMENTS FINANCIERS, INTERETS COURUS
    538  AUTRES ORGANISMES FINANCIERS

54  INSTRUMENTS DE TRESORERIE
    541  OPTIONS DE TAUX D'INTERET
    542  OPTIONS DE TAUX DE CHANGE
    543  OPTIONS DE TAUX BOURSIERS
    544  INSTRUMENTS DE MARCHES A TERME
    545  AVOIRS D'OR ET AUTRES METAUX PRECIEUX

55  INSTRUMENTS DE MONNAIE ELECTRONIQUE
    551  MONNAIE ELECTRONIQUE - CARTE CARBURANT
    552  MONNAIE ELECTRONIQUE - TELEPHONE PORTABLE
    553  MONNAIE ELECTRONIQUE - CARTE PEAGE
    554  PORTE-MONNAIE ELECTRONIQUE
    558  AUTRES INSTRUMENTS DE MONNAIES ELECTRONIQUES

56  BANQUES, CREDITS DE TRESORERIE ET D'ESCOMPTE [→ DQ, DR on Bilan PASSIF]
    561  CREDITS DE TRESORERIE [→ DR]
    564  ESCOMPTE DE CREDITS DE CAMPAGNE [→ DQ]
    565  ESCOMPTE DE CREDITS ORDINAIRES [→ DQ]
    566  BANQUES, CREDITS DE TRESORERIE, INTERETS COURUS

57  CAISSE
    571  CAISSE SIEGE SOCIAL
         5711  Caisse en monnaie nationale
         5712  Caisse en devises
    572  CAISSE SUCCURSALE A
         5721  en monnaie nationale
         5722  en devises
    573  CAISSE SUCCURSALE B
         5731  en monnaie nationale
         5732  en devises

58  REGIES D'AVANCES, ACCREDITIFS ET VIREMENTS INTERNES
    581  REGIES D'AVANCE
    582  ACCREDITIFS
    585  VIREMENTS DE FONDS
    588  AUTRES VIREMENTS INTERNES

59  DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME (TRESORERIE)
    590  DEPRECIATIONS DES TITRES DE PLACEMENT
    591  DEPRECIATIONS DES TITRES ET VALEURS A ENCAISSER
    592  DEPRECIATIONS DES COMPTES BANQUES
    593  DEPRECIATIONS DES COMPTES ETABLISSEMENTS FINANCIERS ET ASSIMILES
    594  DEPRECIATIONS DES COMPTES D'INSTRUMENTS DE TRESORERIE
    599  PROVISIONS POUR RISQUE A COURT TERME A CARACTERE FINANCIER [→ DN on Bilan]
```

## CLASSE 6 : COMPTES DE CHARGES DES ACTIVITES ORDINAIRES

```
60  ACHATS ET VARIATIONS DE STOCKS
    601  ACHATS DE MARCHANDISES
         6011  dans la Région
         6012  hors Région
         6013  aux entités du groupe dans la Région
         6014  aux entités du groupe hors Région
         6015  frais sur achats
         6019  Rabais, Remises et Ristournes obtenus (non ventilés)
    602  ACHATS DE MATIERES PREMIERES ET FOURNITURES LIEES
         6021  dans la Région
         6022  hors Région
         6023  aux entités du groupe dans la Région
         6024  aux entités du groupe hors Région
         6025  frais sur achats
         6029  Rabais, Remises et Ristournes obtenus (non ventilés)
    603  VARIATIONS DES STOCKS DE BIENS ACHETES
         6031  Variations des stocks de marchandises
         6032  Variations des stocks de matières premières et fournitures liées
         6033  Variations des stocks d'autres approvisionnements
    604  ACHATS STOCKES DE MATIERES ET FOURNITURES CONSOMMABLES
         6041  Matières consommables
         6042  Matières combustibles
         6043  Produits d'entretien
         6044  Fournitures d'atelier et d'usine
         6045  frais sur achats
         6046  Fournitures de magasin
         6047  Fournitures de bureau
         6049  Rabais, Remises et Ristournes obtenus (non ventilés)
    605  AUTRES ACHATS
         6051  Fournitures non stockables - Eau
         6052  Fournitures non stockables - Electricité
         6053  Fournitures non stockables – Autres énergies
         6054  Fournitures d'entretien non stockables
         6055  Fournitures de bureau non stockables
         6056  Achats de petit matériel et outillage
         6057  Achats d'études et prestations de services
         6058  Achats de travaux, matériels et équipements
         6059  Rabais, Remises et Ristournes obtenus (non ventilés)
    608  ACHATS D'EMBALLAGES
         6081  Emballages perdus
         6082  Emballages récupérables non identifiables
         6083  Emballages à usage mixte
         6085  frais sur achats
         6089  Rabais, Remises et Ristournes obtenus (non ventilés)

61  TRANSPORTS
    611  TRANSPORTS SUR ACHATS (Supprimé)
    612  TRANSPORTS SUR VENTES
    613  TRANSPORTS POUR LE COMPTE DE TIERS
    614  TRANSPORTS DU PERSONNEL
    616  TRANSPORTS DE PLIS
    618  AUTRES FRAIS DE TRANSPORT
         6181  Voyages et déplacements
         6182  Transports entre établissements ou chantiers
         6183  Transports administratifs

62  SERVICES EXTERIEURS
    621  SOUS-TRAITANCE GENERALE
    622  LOCATIONS, CHARGES LOCATIVES
         6221  Locations de terrains
         6222  Locations de bâtiments
         6223  Locations de matériels et outillages
         6224  Malis sur emballages
         6225  Locations d'emballages
         6226  Fermages et loyers du foncier
         6228  Locations et charges locatives diverses
    623  REDEVANCES DE LOCATION-ACQUISITION
         6232  Crédit-bail immobilier
         6233  Crédit-bail mobilier
         6234  Location-vente
         6238  Autres contrats de location-acquisition
    624  ENTRETIEN, REPARATIONS, REMISE EN ETAT ET MAINTENANCE
         6241  Entretien et réparations des biens immobiliers
         6242  Entretien et réparations des biens mobiliers
         6243  Maintenance
         6244  Charges de démantèlement et remise en état
         6248  Autres entretiens et réparations
    625  PRIMES D'ASSURANCE
         6251  Assurances multirisques
         6252  Assurances matériel de transport
         6253  Assurances risques d'exploitation
         6254  Assurances responsabilité du producteur
         6255  Assurances insolvabilité clients
         6256  Assurances transport sur achats
         6257  Assurances transport sur ventes
         6258  Autres primes d'assurances
    626  ETUDES, RECHERCHES ET DOCUMENTATION
         6261  Etudes et recherches
         6265  Documentation générale
         6266  Documentation technique
    627  PUBLICITE, PUBLICATIONS, RELATIONS PUBLIQUES
         6271  Annonces, insertions
         6272  Catalogues, imprimés publicitaires
         6273  Echantillons
         6274  Foires et expositions
         6275  Publications
         6276  Cadeaux à la clientèle
         6277  Frais de colloques, séminaires, conférences
         6278  Autres charges de publicité et relations publiques
    628  FRAIS DE TELECOMMUNICATIONS
         6281  Frais de téléphone
         6282  Frais de télex
         6283  Frais de télécopie
         6288  Autres frais de télécommunications

63  AUTRES SERVICES EXTERIEURS
    631  FRAIS BANCAIRES
         6311  Frais sur titres (vente, garde)
         6312  Frais sur effets
         6313  Location de coffres
         6314  Commissions d'affacturage et de titrisation
         6315  Commissions sur cartes de crédit
         6316  Frais d'émission d'emprunts
         6317  Frais sur instruments monnaie électronique
         6318  Autres frais bancaires
    632  REMUNERATIONS D'INTERMEDIAIRES ET DE CONSEILS
         6321  Commissions et courtages sur achats
         6322  Commissions et courtages sur ventes
         6323  Rémunérations des transitaires
         6324  Honoraires des professions réglementées
         6325  Frais d'actes et de contentieux
         6326  Rémunérations d'affacturage et de titrisation
         6327  Rémunérations des autres prestataires de services
         6328  Divers frais
    633  FRAIS DE FORMATION DU PERSONNEL
    634  REDEVANCES POUR BREVETS, LICENCES, LOGICIELS, CONCESSIONS, DROITS ET VALEURS SIMILAIRES
         6342  Redevances pour brevets, licences
         6343  Redevances pour logiciels
         6344  Redevances pour marques
         6345  Redevances pour sites internet
         6346  Redevances pour concessions, droits et valeurs similaires
    635  COTISATIONS
         6351  Cotisations
         6358  Concours divers
    637  REMUNERATIONS DE PERSONNEL EXTERIEUR A L'ENTITE
         6371  Personnel intérimaire
         6372  Personnel détaché ou prêté à l'entité
    638  AUTRES CHARGES EXTERNES
         6381  Frais de recrutement du personnel
         6382  Frais de déménagement
         6383  Réceptions
         6384  Missions
         6385  Charges de copropriété
         6388  Charges externes diverses

64  IMPOTS ET TAXES
    641  IMPOTS ET TAXES DIRECTS
         6411  Impôts fonciers et taxes annexes
         6412  Patentes, licences et taxes annexes
         6413  Taxes sur appointements et salaires
         6414  Taxes d'apprentissage
         6415  Formation professionnelle continue
         6418  Autres impôts et taxes directs
    645  IMPOTS ET TAXES INDIRECTS
    646  DROITS D'ENREGISTREMENT
         6461  Droits de mutation
         6462  Droits de timbre
         6463  Taxes sur les véhicules de société
         6464  Vignettes
         6468  Autres droits d'enregistrement
    647  PENALITES, AMENDES FISCALES
         6471  Pénalités d'assiette, impôts directs
         6472  Pénalités d'assiette, impôts indirects
         6473  Pénalités de recouvrement, impôts directs
         6474  Pénalités de recouvrement, impôts indirects
         6478  Autres pénalités et amendes fiscales
    648  AUTRES IMPOTS ET TAXES

65  AUTRES CHARGES
    651  PERTES SUR CREANCES CLIENTS ET AUTRES DEBITEURS
         6511  Clients
         6515  Autres débiteurs
    652  QUOTE-PART DE RESULTAT SUR OPERATIONS FAITES EN COMMUN
         6521  Quote-part transférée de bénéfices (comptabilité du gérant)
         6525  Pertes imputées par transfert (comptabilité des associés non gérants)
    653  QUOTE-PART DE RÉSULTAT ANNULÉE SUR EXÉCUTION PARTIELLE DE CONTRATS PLURI-EXERCICES
    654  VALEURS COMPTABLES DES CESSIONS COURANTES D'IMMOBILISATIONS
         6541  Immobilisations incorporelles
         6542  Immobilisations corporelles
    656  PERTE DE CHANGE SUR CREANCES ET DETTES COMMERCIALES
    657  PENALITES ET AMENDES PENALES
    658  CHARGES DIVERSES
         6581  Indemnités de fonction et autres rémunérations d'administrateurs
         6582  Dons
         6583  Mécénat
         6588  Autres charges diverses
    659  CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME D'EXPLOITATION
         6591  sur risques à court terme
         6593  sur stocks
         6594  sur créances
         6598  Autres charges pour dépréciations et provisions pour risques à court terme

66  CHARGES DE PERSONNEL
    661  REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NATIONAL
         6611  Appointements salaires et commissions
         6612  Primes et gratifications
         6613  Congés payés
         6614  Indemnités de préavis, de licenciement et de recherche d'embauche
         6615  Indemnités de maladie versées aux travailleurs
         6616  Supplément familial
         6617  Avantages en nature
         6618  Autres rémunérations directes
    662  REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NON NATIONAL
         6621  Appointements salaires et commissions
         6622  Primes et gratifications
         6623  Congés payés
         6624  Indemnités de préavis, de licenciement et de recherche d'embauche
         6625  Indemnités de maladie versées aux travailleurs
         6626  Supplément familial
         6627  Avantages en nature
         6628  Autres rémunérations directes
    663  INDEMNITES FORFAITAIRES VERSEES AU PERSONNEL
         6631  Indemnités de logement
         6632  Indemnités de représentation
         6633  Indemnités d'expatriation
         6634  Indemnités de transport
         6638  Autres indemnités et avantages divers
    664  CHARGES SOCIALES
         6641  Charges sociales sur rémunération du personnel national
         6642  Charges sociales sur rémunération du personnel non national
    666  REMUNERATIONS ET CHARGES SOCIALES DE L'EXPLOITANT INDIVIDUEL
         6661  Rémunération du travail de l'exploitant
         6662  Charges sociales
    667  REMUNERATION TRANSFEREE DE PERSONNEL EXTERIEUR
         6671  Personnel intérimaire
         6672  Personnel détaché ou prêté à l'entité
    668  AUTRES CHARGES SOCIALES
         6681  Versements aux Syndicats et Comités d'entreprise, d'établissement
         6682  Versements aux Comités d'hygiène et de sécurité
         6683  Versements et contributions aux autres œuvres sociales
         6684  Médecine du travail et pharmacie
         6685  Assurances et organismes de santé
         6686  Assurances retraite et fonds de pensions
         6687  Majorations et pénalités sociales
         6688  Charges sociales diverses

67  FRAIS FINANCIERS ET CHARGES ASSIMILEES
    671  INTERETS DES EMPRUNTS
         6711  Emprunts obligataires
         6712  Emprunts auprès des établissements de crédit
         6713  Dettes liées à des participations
         6714  Primes de remboursement des obligations
    672  INTERETS DANS LOYERS DE LOCATION-ACQUISITION
         6722  Intérêts dans loyers de location-acquisition/crédit-bail immobilier
         6723  Intérêts dans loyers de location-acquisition/crédit-bail mobilier
         6724  Intérêts dans loyers de location-acquisition/location-vente
         6728  Intérêts dans loyers des autres locations-acquisition
    673  ESCOMPTES ACCORDES
    674  AUTRES INTERETS
         6741  Avances reçues et dépôts créditeurs
         6742  Comptes courants bloqués
         6743  Intérêts sur obligations cautionnées
         6744  Intérêts sur dettes commerciales
         6745  Intérêts bancaires et sur opérations de financement (escompte…)
         6748  Intérêts sur dettes diverses
    675  ESCOMPTES DES EFFETS DE COMMERCE
    676  PERTES DE CHANGE FINANCIERES
    677  PERTES SUR TITRES DE PLACEMENT
         6771  Pertes sur cessions de titres de placement
         6772  Malis provenant d'attribution gratuite d'actions au personnel salarié et aux dirigeants
    678  PERTES ET CHARGES SUR RISQUES FINANCIERS
         6781  sur rentes viagères
         6782  sur opérations financières
         6784  sur instruments de trésorerie
    679  CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME FINANCIERES
         6791  sur risques financiers
         6795  sur titres de placement
         6798  Autres charges pour dépréciations et provisions pour risques à court terme financières

68  DOTATIONS AUX AMORTISSEMENTS
    681  DOTATIONS AUX AMORTISSEMENTS D'EXPLOITATION
         6811  Dotations aux amortissements des charges immobilisées
         6812  Dotations aux amortissements des immobilisations incorporelles
         6813  Dotations aux amortissements des immobilisations corporelles
    687  DOTATIONS AUX AMORTISSEMENTS A CARACTERE FINANCIER
         6872  Dotations aux amortissements des primes de remboursement des obligations
         6878  Autres dotations aux amortissements à caractère financier

69  DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS
    691  DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS D'EXPLOITATION
         6911  Dotations aux provisions pour risques et charges
         6912  pour grosses réparations
         6913  Dotations aux dépréciations des immobilisations incorporelles
         6914  Dotations aux dépréciations des immobilisations corporelles
    697  DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS FINANCIERES
         6971  Dotations aux provisions pour risques et charges
         6972  Dotations aux dépréciations des immobilisations financières
```

## CLASSE 7 : COMPTES DE PRODUITS DES ACTIVITES ORDINAIRES

```
70  VENTES
    701  VENTES DE MARCHANDISES
         7011  dans la Région
         7012  hors Région
         7013  aux entités du groupe dans la Région
         7014  aux entités du groupe hors Région
         7015  sur internet
         7019  Rabais, remises, ristournes accordés (non ventilés)
    702  VENTES DE PRODUITS FINIS
         7021  dans la Région
         7022  hors Région
         7023  aux entités du groupe dans la Région
         7024  aux entités du groupe hors Région
         7025  sur internet
         7029  Rabais, remises, ristournes accordés (non ventilés)
    703  VENTES DE PRODUITS INTERMEDIAIRES
         7031  dans la Région
         7032  hors Région
         7033  aux entités du groupe dans la Région
         7034  aux entités du groupe hors Région
         7035  sur internet
         7039  Rabais, remises, ristournes accordés (non ventilés)
    704  VENTES DE PRODUITS RESIDUELS
         7041  dans la Région
         7042  hors Région
         7043  aux entités du groupe dans la Région
         7044  aux entités du groupe hors Région
         7045  sur internet
         7049  Rabais, remises, ristournes accordés (non ventilés)
    705  TRAVAUX FACTURES
         7051  dans la Région
         7052  hors Région
         7053  aux entités du groupe dans la Région
         7054  aux entités du groupe hors Région
         7055  sur internet
         7059  Rabais, remises, ristournes accordés (non ventilés)
    706  SERVICES VENDUS
         7061  dans la Région
         7062  hors Région
         7063  aux entités du groupe dans la Région
         7064  aux entités du groupe hors Région
         7065  sur internet
         7069  Rabais, remises, ristournes accordés (non ventilés)
    707  PRODUITS ACCESSOIRES
         7071  Ports, emballages perdus et autres frais facturés
         7072  Commissions et courtages
         7073  Locations et redevances de location-financement
         7074  Bonis sur reprises et cessions d'emballages
         7075  Mise à disposition de personnel
         7076  Redevances pour brevets, logiciels, marques et droits similaires
         7077  Services exploités dans l'intérêt du personnel
         7078  Autres produits accessoires

71  SUBVENTIONS D'EXPLOITATION
    711  SUR PRODUITS A L'EXPORTATION
    712  SUR PRODUITS A L'IMPORTATION
    713  SUR PRODUITS DE PEREQUATION
    714  INDEMNITES ET SUBVENTIONS D'EXPLOITATION (entité agricole)
    718  AUTRES SUBVENTIONS D'EXPLOITATION
         7181  Versées par l'Etat et les collectivités publiques
         7182  Versées par les organismes internationaux
         7183  Versées par des tiers

72  PRODUCTION IMMOBILISEE
    721  IMMOBILISATIONS INCORPORELLES
    722  IMMOBILISATIONS CORPORELLES
         7221  immobilisations corporelles (hors actifs biologiques)
         7222  immobilisations corporelles (actifs biologiques)
    724  PRODUCTION AUTO-CONSOMMEE
    726  IMMOBILISATIONS FINANCIERES

73  VARIATIONS DES STOCKS DE BIENS ET DE SERVICES PRODUITS
    734  VARIATIONS DES STOCKS DE PRODUITS EN COURS
         7341  Produits en cours
         7342  Travaux en cours
    735  VARIATIONS DES SERVICES EN COURS
         7351  Etudes en cours
         7352  Prestations de services en cours
    736  VARIATIONS DES STOCKS DE PRODUITS FINIS
    737  VARIATIONS DES STOCKS DE PRODUITS INTERMEDIAIRES ET RESIDUELS
         7371  Produits intermédiaires
         7372  Produits résiduels

75  AUTRES PRODUITS
    751  PROFITS SUR CREANCES CLIENTS ET AUTRES DEBITEURS
    752  QUOTE-PART DE RESULTAT SUR OPERATIONS FAITES EN COMMUN
         7521  Quote-part transférée de pertes (comptabilité du gérant)
         7525  Bénéfices attribués par transfert (comptabilité des associés non gérants)
    753  QUOTE-PART DE RÉSULTAT SUR EXÉCUTION PARTIELLE DE CONTRATS (Supprimé)
    754  PRODUITS DES CESSIONS COURANTES D'IMMOBILISATIONS
         7541  Immobilisations incorporelles
         7542  Immobilisations corporelles
    756  GAINS DE CHANGE SUR CREANCES ET DETTES COMMERCIALES
    758  PRODUITS DIVERS
         7581  Indemnités de fonction et autres rémunérations d'administrateurs
         7582  Indemnités d'assurances reçues
         7588  Autres produits divers
    759  REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME D'EXPLOITATION
         7591  sur risques à court terme
         7593  sur stocks
         7594  sur créances
         7598  sur autres charges pour dépréciations et provisions

77  REVENUS FINANCIERS ET PRODUITS ASSIMILES
    771  INTERETS DE PRETS ET CREANCES DIVERSES
         7712  Intérêts de prêts
         7713  Intérêts sur créances diverses
    772  REVENUS DE PARTICIPATIONS ET AUTRES TITRES IMMOBILISES
         7721  Revenus des titres de participation
         7722  Revenus autres titres immobilisés
    773  ESCOMPTES OBTENUS
    774  REVENUS DE PLACEMENT
         7745  Revenus des obligations
         7746  Revenus des titres de placement
    775  INTERETS DANS LOYERS DE LOCATION-FINANCEMENT
    776  GAINS DE CHANGE FINANCIERS
    777  GAINS SUR CESSIONS DE TITRES DE PLACEMENT
    778  GAINS SUR RISQUES FINANCIERS
         7781  sur rentes viagères
         7782  sur opérations financières
         7784  sur instruments de trésorerie
    779  REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME FINANCIERES
         7791  sur risques financiers
         7795  sur titres de placement
         7798  sur autres charges pour dépréciations et provisions

78  TRANSFERTS DE CHARGES
    781  TRANSFERTS DE CHARGES D'EXPLOITATION
    787  TRANSFERTS DE CHARGES FINANCIERES

79  REPRISES DE PROVISIONS, DE DEPRECIATIONS ET AUTRES
    791  REPRISES DE PROVISIONS ET DEPRECIATIONS D'EXPLOITATION
         7911  pour risques et charges
         7912  pour grosses réparations
         7913  des immobilisations incorporelles
         7914  des immobilisations corporelles
    797  REPRISES DE PROVISIONS ET DEPRECIATIONS FINANCIERES
         7971  pour risques et charges
         7972  des immobilisations financières
    798  REPRISES D'AMORTISSEMENTS (cas de révision de plan d'amortissement)
    799  REPRISES DE SUBVENTIONS D'INVESTISSEMENT
```

## CLASSE 8 : COMPTES DES AUTRES CHARGES ET DES AUTRES PRODUITS

```
81  VALEURS COMPTABLES DES CESSIONS D'IMMOBILISATIONS
    811  IMMOBILISATIONS INCORPORELLES
    812  IMMOBILISATIONS CORPORELLES
    816  IMMOBILISATIONS FINANCIERES

82  PRODUITS DES CESSIONS D'IMMOBILISATIONS
    821  IMMOBILISATIONS INCORPORELLES
    822  IMMOBILISATIONS CORPORELLES
    826  IMMOBILISATIONS FINANCIERES

83  CHARGES HORS ACTIVITES ORDINAIRES
    831  CHARGES H.A.O. CONSTATEES
    833  CHARGES LIEES AUX OPERATIONS DE RESTRUCTURATION
    834  PERTES SUR CREANCES H.A.O.
    835  DONS ET LIBERALITES ACCORDES
    836  ABANDONS DE CREANCES CONSENTIS
    837  CHARGES LIEES AUX OPERATIONS DE LIQUIDATION
    839  CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME H.A.O.

84  PRODUITS HORS ACTIVITES ORDINAIRES
    841  PRODUITS H.A.O. CONSTATES
    843  PRODUITS LIES AUX OPERATIONS DE RESTRUCTURATION
    844  INDEMNITES ET SUBVENTIONS H.A.O. (entité agricole)
    845  DONS ET LIBERALITES OBTENUS
    846  ABANDONS DE CREANCES OBTENUS
    847  PRODUITS LIES AUX OPERATIONS DE LIQUIDATION
    848  TRANSFERTS DE CHARGES H.A.O.
    849  REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME H.A.O.

85  DOTATIONS HORS ACTIVITES ORDINAIRES
    851  DOTATIONS AUX PROVISIONS REGLEMENTEES
    852  DOTATIONS AUX AMORTISSEMENTS H.A.O.
    853  DOTATIONS AUX DEPRECIATIONS H.A.O.
    854  DOTATIONS AUX PROVISIONS POUR RISQUES ET CHARGES H.A.O.
    858  AUTRES DOTATIONS H.A.O.

86  REPRISES DE CHARGES, PROVISIONS ET DEPRECIATIONS HAO
    861  REPRISES DE PROVISIONS REGLEMENTEES
    862  REPRISES D'AMORTISSEMENTS H.A.O.
    863  REPRISES DE DEPRECIATIONS H.A.O.
    864  REPRISES DE PROVISIONS POUR RISQUES ET CHARGES H.A.O.
    865  REPRISES DE SUBVENTIONS D'INVESTISSEMENT (Supprimé)
    868  AUTRES REPRISES H.A.O.

87  PARTICIPATION DES TRAVAILLEURS
    871  PARTICIPATION LEGALE AUX BENEFICES
    874  PARTICIPATION CONTRACTUELLE AUX BENEFICES
    878  AUTRES PARTICIPATIONS

88  SUBVENTIONS D'EQUILIBRE
    881  ETAT
    884  COLLECTIVITES PUBLIQUES
    886  GROUPE
    888  AUTRES

89  IMPOTS SUR LE RESULTAT
    891  IMPOTS SUR LES BENEFICES DE L'EXERCICE
         8911  Activités exercées dans l'Etat
         8912  Activités exercées dans les autres Etats de la Région
         8913  Activités exercées hors Région
    892  RAPPEL D'IMPOTS SUR RESULTATS ANTERIEURS
    895  IMPOT MINIMUM FORFAITAIRE (I.M.F.)
    899  DEGREVEMENTS ET ANNULATIONS D'IMPOTS SUR RESULTATS ANTERIEURS
         8991  Dégrèvements
         8994  Annulations pour pertes rétroactives
```

## CLASSE 9 : ENGAGEMENTS HORS BILAN ET COMPTABILITE ANALYTIQUE

```
90  ENGAGEMENTS OBTENUS ET ENGAGEMENTS ACCORDES
91  CONTREPARTIES DES ENGAGEMENTS

ENGAGEMENTS OBTENUS (901 à 904)
    901  ENGAGEMENTS DE FINANCEMENT OBTENUS
         9011  Crédits confirmés obtenus
         9012  Emprunts restant à encaisser
         9013  Facilités de financement renouvelables
         9014  Facilités d'émission
         9018  Autres engagements de financement obtenus
    902  ENGAGEMENTS DE GARANTIE OBTENUS
         9021  Avals obtenus
         9022  Cautions, garanties obtenues
         9023  Hypothèques obtenues
         9024  Effets endossés par des tiers
         9028  Autres garanties obtenues
    903  ENGAGEMENTS RECIPROQUES
         9031  Achats de marchandises à terme
         9032  Achats à terme de devises
         9033  Commandes fermes des clients
         9038  Autres engagements réciproques
    904  AUTRES ENGAGEMENTS OBTENUS
         9041  Abandons de créances conditionnels
         9043  Ventes avec clause de réserve de propriété
         9048  Divers engagements obtenus

ENGAGEMENTS ACCORDES (905 à 908)
    905  ENGAGEMENTS DE FINANCEMENT ACCORDES
         9051  Crédits accordés non décaissés
         9058  Autres engagements de financement accordés
    906  ENGAGEMENTS DE GARANTIE ACCORDES
         9061  Avals accordés
         9062  Cautions, garanties accordées
         9063  Hypothèques accordées
         9064  Effets endossés par l'entité
         9068  Autres garanties accordées
    907  ENGAGEMENTS RECIPROQUES
         9071  Ventes de marchandises à terme
         9072  Ventes à terme de devises
         9073  Commandes fermes aux fournisseurs
         9078  Autres engagements réciproques
    908  AUTRES ENGAGEMENTS ACCORDES
         9081  Annulations conditionnelles de dettes
         9082  Engagements de retraite
         9083  Achats avec clause de réserve de propriété
         9088  Divers engagements accordés

COMPTES DE LA COMPTABILITE ANALYTIQUE (CAGE)
    92  COMPTES REFLECHIS
    93  COMPTES DE RECLASSEMENTS
    94  COMPTES DE COUTS
    95  COMPTES DE STOCKS
    96  COMPTES D'ECARTS SUR COUTS PREETABLIS
    97  COMPTES DE DIFFERENCES DE TRAITEMENT COMPTABLE
    98  COMPTES DE RESULTATS
    99  COMPTES DE LIAISONS INTERNES
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

# DATA SECTION 9 — ACTIVITY NOMENCLATURE CODES

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

# DATA SECTION 10 — PDF PAGE STRUCTURE (68 pages)

| Page | Content | Data Source |
|---|---|---|
| 1 | Page de Garde | FIRD D.1 |
| 2 | Conditions de recevabilité (STATIC — do not fill) | STATIC |
| 3 | Cover + document checklist | FIRD D.1 |
| 4 | FIRD 1 (ZA–ZI, signatory, banks) | FIRD D.2–D.5 |
| 5 | FIRD 2 (ZK–ZS, activity table) | FIRD D.6–D.7 |
| 6 | FIRD 3 (shareholders, board, directors, subsidiaries) | FIRD D.8 |
| 7 | Bilan Actif Page 1/2 (AD–BZ) | Balance Sheet G.1 |
| 8 | Bilan Passif Page 2/2 (CA–DZ) | Balance Sheet G.2 |
| 9 | Bilan Paysage Page 1/1 (combined) | Balance Sheet G.1+G.2 |
| 10 | Compte de Résultat (TA–XI) | Income Statement H |
| 11 | Tableau de Flux de Trésorerie (ZA, FA–ZH) | Cash Flow I |
| 12 | FRNA (checklist 36 notes) | FIRD D.9 |
| 13 | Note 1 | J.1 |
| 14 | Note 2 | J.2 |
| 15 | Note 3A | J.3 |
| 16 | Note 3B | J.4 |
| 17 | Note 3C | J.5 |
| 18 | Note 3C Bis | J.6 |
| 19 | Note 3D | J.7 |
| 20 | Note 3E | J.8 |
| 21 | Note 4 | J.9 |
| 22 | Note 5 | J.10 |
| 23 | Note 6 | J.11 |
| 24 | Note 7 | J.12 |
| 25 | Note 8 | J.13 |
| 26 | Note 8A | J.14 |
| 27 | Note 8B | J.14 |
| 28 | Note 8C | J.14 |
| 29 | Note 9 | J.15 |
| 30 | Note 10 | J.16 |
| 31 | Note 11 | J.17 |
| 32 | Note 12 | J.18 |
| 33 | Note 13 | J.19 |
| 34 | Note 14 | J.20 |
| 35 | Note 15A | J.21 |
| 36 | Note 15B | J.22 |
| 37 | Note 16A | J.23 |
| 38 | Note 16B | J.24 |
| 39 | Note 16B bis | J.24 |
| 40 | Note 16C | J.24 |
| 41 | Note 17 | J.25 |
| 42 | Note 18 | J.26 |
| 43 | Note 19 | J.27 |
| 44 | Note 20 | J.28 |
| 45 | Note 21 | J.29 |
| 46 | Note 22 | J.30 |
| 47 | Note 23 | J.31 |
| 48 | Note 24 | J.32 |
| 49 | Note 25 | J.33 |
| 50 | Note 26 | J.34 |
| 51 | Note 27A | J.35 |
| 52 | Note 27B | J.36 |
| 53 | Note 28A | J.37 |
| 54 | Note 28B | J.38 |
| 55 | Note 28C | J.39 |
| 56 | Note 29 | J.40 |
| 57 | Note 30 | J.41 |
| 58 | Note 31 | J.42 |
| 59 | Note 32 | J.43 |
| 60 | Note 33 | J.44 |
| 61 | Note 34 | J.45 |
| 62 | Note 35 | J.46 |
| 63 | Note 36 Table des codes | J.47 |
| 64 | Codes activités économiques | Section 9 above |
| 65 | État complémentaire DGI Page 1/4 | Part K |
| 66 | État complémentaire DGI Page 2/4 | Part K |
| 67 | État complémentaire DGI Page 3/4 | Part K |
| 68 | État complémentaire DGI Page 4/4 | Part K |

HEADER ON EVERY PAGE: Désignation entité | Sigle usuel | Adresse | BP | Numéro d'identification | Exercice clos le 31-12-[year] | Durée (en mois): [duration]
PAGE NUMBER ON EVERY PAGE: "Page X / 68"

---

# DATA SECTION 11 — MANDATORY CONTROL CHECKS

| ID | Control | Pass Condition | Message if Fail |
|---|---|---|---|
| C01 | Bilan équilibré | BZ = DZ | DÉSÉQUILIBRE BILAN: écart=[amount] |
| C02 | Résultat cohérent | XI = CJ | RÉSULTAT INCOHÉRENT: CR=[x] Bilan=[y] |
| C03 | TFT réconcilié | ZH = (BT−DT)+[S(4786)−S(4726)−S(4797)]_N | TFT NON RÉCONCILIÉ: ZH=[x] Contrôle=[y] |
| C04 | Balance N équilibrée | Total débit N = Total crédit N | BALANCE N DÉSÉQUILIBRÉE |
| C05 | Balance N-1 équilibrée | Total débit N-1 = Total crédit N-1 | BALANCE N-1 DÉSÉQUILIBRÉE |
| C06 | Immob brutes | Note 3A total G = AZ gross column | ÉCART IMMOB BRUTES |
| C07 | Amortissements | Note 3C total D = AZ amort column | ÉCART AMORTISSEMENTS |
| C08 | Provisions | Note 28A total D = DC + DN | ÉCART PROVISIONS |
| C09 | Stocks | Note 6 total net = BB | ÉCART STOCKS |
| C10 | Clients | Note 7 total net = BI | ÉCART CLIENTS |
| C11 | FIRD complet | All mandatory FIRD fields filled | FIRD INCOMPLET |
| C12 | Notes applicables renseignées | No Applicable note left empty | NOTES VIDES |
| C13 | Analyse Note 34 | Note 34 trésorerie nette = BT−DT | ANALYSE NOTE 34 INCOHÉRENTE |

---

# DATA SECTION 12 — DEFAULT CURRENCIES

| Code | Name | Default |
|---|---|---|
| GNF | Franc Guinéen | YES — pre-selected |
| USD | US Dollar | No |
| EUR | Euro | No |
| XOF | Franc CFA BCEAO | No |
| XAF | Franc CFA BEAC | No |
| GBP | Pound Sterling | No |

---

END OF DATA FILE — COMPLETE AND FULLY SOURCED FROM ORIGINAL FILES