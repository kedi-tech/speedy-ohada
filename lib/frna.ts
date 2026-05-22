// FRNA — Fiche Récapitulative des Notes Annexes
// Source: datamodel.md Data Section 11 + claudemaster.md Part D.9
// Defines all 36 notes + DGI states, their labels, and auto-N/A conditions.

export type NoteApplicability = 'A' | 'NA' | 'pending';

export interface FRNAEntry {
  id: string;             // e.g. "1", "3A", "3C-BIS", "DGI"
  noteNumber: number;     // numeric sort key
  variant: string;        // '', 'A', 'B', 'C', 'BIS', 'D', 'E', 'DGI'
  labelFr: string;
  pageNumber: number;     // 0 = multiple
  /** Account prefixes/classes that must have a non-zero balance for the note to be applicable */
  requiredPrefixes: string[];
  /** Classes that must have a non-zero balance (alternative to prefixes) */
  requiredClasses: number[];
  neverNa: boolean;       // if true, auto-suggest never produces N/A
}

export const FRNA_ENTRIES: FRNAEntry[] = [
  { id: '1',      noteNumber: 1,  variant: '',      labelFr: 'Dettes garanties par des sûretés réelles',                       pageNumber: 13, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '2',      noteNumber: 2,  variant: '',      labelFr: 'Informations obligatoires',                                       pageNumber: 14, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '3A',     noteNumber: 3,  variant: 'A',     labelFr: 'Immobilisations brutes (mouvement)',                              pageNumber: 15, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '3B',     noteNumber: 3,  variant: 'B',     labelFr: 'Biens pris en location-acquisition',                             pageNumber: 16, requiredPrefixes: ['17'], requiredClasses: [], neverNa: false },
  { id: '3C',     noteNumber: 3,  variant: 'C',     labelFr: 'Amortissements (mouvement)',                                     pageNumber: 17, requiredPrefixes: ['28'], requiredClasses: [], neverNa: false },
  { id: '3C-BIS', noteNumber: 3,  variant: 'C-BIS', labelFr: 'Dépréciations immobilisations (mouvement)',                      pageNumber: 18, requiredPrefixes: ['29'], requiredClasses: [], neverNa: false },
  { id: '3D',     noteNumber: 3,  variant: 'D',     labelFr: 'Plus-values et moins-values de cession',                         pageNumber: 19, requiredPrefixes: ['81', '82'], requiredClasses: [], neverNa: false },
  { id: '3E',     noteNumber: 3,  variant: 'E',     labelFr: 'Informations sur les réévaluations',                             pageNumber: 20, requiredPrefixes: ['106'], requiredClasses: [], neverNa: false },
  { id: '4',      noteNumber: 4,  variant: '',      labelFr: 'Immobilisations financières',                                     pageNumber: 21, requiredPrefixes: ['26', '27'], requiredClasses: [], neverNa: false },
  { id: '5',      noteNumber: 5,  variant: '',      labelFr: 'Actif circulant et dettes circulantes HAO',                      pageNumber: 22, requiredPrefixes: ['484', '485', '488'], requiredClasses: [], neverNa: false },
  { id: '6',      noteNumber: 6,  variant: '',      labelFr: 'Stocks et encours',                                              pageNumber: 23, requiredPrefixes: [], requiredClasses: [3], neverNa: false },
  { id: '7',      noteNumber: 7,  variant: '',      labelFr: 'Clients et produits à recevoir',                                  pageNumber: 24, requiredPrefixes: ['41'], requiredClasses: [], neverNa: false },
  { id: '8',      noteNumber: 8,  variant: '',      labelFr: 'Autres créances',                                                 pageNumber: 25, requiredPrefixes: [], requiredClasses: [], neverNa: false },
  { id: '8A',     noteNumber: 8,  variant: 'A',     labelFr: 'Étalement des charges immobilisées',                             pageNumber: 26, requiredPrefixes: ['4752'], requiredClasses: [], neverNa: false },
  { id: '8B',     noteNumber: 8,  variant: 'B',     labelFr: 'Étalement des provisions pour charges à répartir',               pageNumber: 27, requiredPrefixes: ['4752'], requiredClasses: [], neverNa: false },
  { id: '8C',     noteNumber: 8,  variant: 'C',     labelFr: 'Étalement des provisions engagements retraite',                  pageNumber: 28, requiredPrefixes: ['4752'], requiredClasses: [], neverNa: false },
  { id: '9',      noteNumber: 9,  variant: '',      labelFr: 'Titres de placement',                                             pageNumber: 29, requiredPrefixes: ['50'], requiredClasses: [], neverNa: false },
  { id: '10',     noteNumber: 10, variant: '',      labelFr: 'Valeurs à encaisser',                                             pageNumber: 30, requiredPrefixes: ['51'], requiredClasses: [], neverNa: false },
  { id: '11',     noteNumber: 11, variant: '',      labelFr: 'Disponibilités',                                                  pageNumber: 31, requiredPrefixes: ['52', '53', '54', '55', '56', '57'], requiredClasses: [], neverNa: false },
  { id: '12',     noteNumber: 12, variant: '',      labelFr: 'Écarts de conversion et transferts de charges',                   pageNumber: 32, requiredPrefixes: ['476', '477'], requiredClasses: [], neverNa: false },
  { id: '13',     noteNumber: 13, variant: '',      labelFr: 'Capital : valeur nominale des actions ou parts',                   pageNumber: 33, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '14',     noteNumber: 14, variant: '',      labelFr: 'Primes et réserves',                                              pageNumber: 34, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '15A',    noteNumber: 15, variant: 'A',     labelFr: 'Subventions et provisions réglementées',                          pageNumber: 35, requiredPrefixes: ['14', '15'], requiredClasses: [], neverNa: false },
  { id: '15B',    noteNumber: 15, variant: 'B',     labelFr: 'Autres fonds propres',                                            pageNumber: 36, requiredPrefixes: ['181', '182', '183', '184'], requiredClasses: [], neverNa: false },
  { id: '16A',    noteNumber: 16, variant: 'A',     labelFr: 'Dettes financières et ressources assimilées',                     pageNumber: 37, requiredPrefixes: ['16', '17', '19'], requiredClasses: [], neverNa: false },
  { id: '16B',    noteNumber: 16, variant: 'B',     labelFr: 'Engagements retraite : hypothèses actuarielles',                  pageNumber: 38, requiredPrefixes: ['196'], requiredClasses: [], neverNa: false },
  { id: '16B-BIS',noteNumber: 16, variant: 'B-BIS', labelFr: 'Actifs du régime de retraite',                                   pageNumber: 39, requiredPrefixes: ['196'], requiredClasses: [], neverNa: false },
  { id: '16C',    noteNumber: 16, variant: 'C',     labelFr: 'Actifs et passifs éventuels',                                     pageNumber: 40, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '17',     noteNumber: 17, variant: '',      labelFr: 'Fournisseurs d\'exploitation',                                    pageNumber: 41, requiredPrefixes: ['40'], requiredClasses: [], neverNa: false },
  { id: '18',     noteNumber: 18, variant: '',      labelFr: 'Dettes fiscales et sociales',                                     pageNumber: 42, requiredPrefixes: ['42', '43', '44'], requiredClasses: [], neverNa: false },
  { id: '19',     noteNumber: 19, variant: '',      labelFr: 'Autres dettes et provisions pour risques CT',                     pageNumber: 43, requiredPrefixes: ['46', '47', '499'], requiredClasses: [], neverNa: false },
  { id: '20',     noteNumber: 20, variant: '',      labelFr: 'Banques, crédit d\'escompte et de trésorerie',                    pageNumber: 44, requiredPrefixes: ['56'], requiredClasses: [], neverNa: false },
  { id: '21',     noteNumber: 21, variant: '',      labelFr: 'Chiffre d\'affaires et autres produits',                          pageNumber: 45, requiredPrefixes: [], requiredClasses: [7], neverNa: false },
  { id: '22',     noteNumber: 22, variant: '',      labelFr: 'Achats',                                                           pageNumber: 46, requiredPrefixes: ['60'], requiredClasses: [], neverNa: false },
  { id: '23',     noteNumber: 23, variant: '',      labelFr: 'Transports',                                                       pageNumber: 47, requiredPrefixes: ['61'], requiredClasses: [], neverNa: false },
  { id: '24',     noteNumber: 24, variant: '',      labelFr: 'Services extérieurs',                                              pageNumber: 48, requiredPrefixes: ['62', '63'], requiredClasses: [], neverNa: false },
  { id: '25',     noteNumber: 25, variant: '',      labelFr: 'Impôts et taxes',                                                  pageNumber: 49, requiredPrefixes: ['64'], requiredClasses: [], neverNa: false },
  { id: '26',     noteNumber: 26, variant: '',      labelFr: 'Autres charges',                                                   pageNumber: 50, requiredPrefixes: ['65'], requiredClasses: [], neverNa: false },
  { id: '27A',    noteNumber: 27, variant: 'A',     labelFr: 'Charges de personnel',                                             pageNumber: 51, requiredPrefixes: ['66'], requiredClasses: [], neverNa: false },
  { id: '27B',    noteNumber: 27, variant: 'B',     labelFr: 'Effectifs, masse salariale, personnel extérieur',                  pageNumber: 52, requiredPrefixes: ['66'], requiredClasses: [], neverNa: false },
  { id: '28A',    noteNumber: 28, variant: 'A',     labelFr: 'Provisions pour risques et charges (mouvement)',                   pageNumber: 53, requiredPrefixes: ['19', '499'], requiredClasses: [], neverNa: false },
  { id: '28B',    noteNumber: 28, variant: 'B',     labelFr: 'Dépréciations des immobilisations (mouvement)',                    pageNumber: 54, requiredPrefixes: ['29'], requiredClasses: [], neverNa: false },
  { id: '28C',    noteNumber: 28, variant: 'C',     labelFr: 'Autres dépréciations (mouvement)',                                 pageNumber: 55, requiredPrefixes: ['39', '49', '59'], requiredClasses: [], neverNa: false },
  { id: '29',     noteNumber: 29, variant: '',      labelFr: 'Charges et revenus financiers',                                    pageNumber: 56, requiredPrefixes: ['67', '77'], requiredClasses: [], neverNa: false },
  { id: '30',     noteNumber: 30, variant: '',      labelFr: 'Autres charges et produits HAO',                                   pageNumber: 57, requiredPrefixes: [], requiredClasses: [8], neverNa: false },
  { id: '31',     noteNumber: 31, variant: '',      labelFr: 'Répartition du résultat et historique 5 exercices',                pageNumber: 58, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '32',     noteNumber: 32, variant: '',      labelFr: 'Production de l\'exercice',                                        pageNumber: 59, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '33',     noteNumber: 33, variant: '',      labelFr: 'Achats destinés à la production',                                  pageNumber: 60, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '34',     noteNumber: 34, variant: '',      labelFr: 'Analyse financière — indicateurs principaux',                      pageNumber: 61, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: '35',     noteNumber: 35, variant: '',      labelFr: 'Informations sociales, environnementales, sociétales',             pageNumber: 62, requiredPrefixes: [], requiredClasses: [], neverNa: false },
  { id: '36',     noteNumber: 36, variant: '',      labelFr: 'Tables des codes',                                                  pageNumber: 63, requiredPrefixes: [], requiredClasses: [], neverNa: true },
  { id: 'DGI',    noteNumber: 99, variant: 'DGI',   labelFr: 'États complémentaires DGI (pages 65-68)',                          pageNumber: 65, requiredPrefixes: [], requiredClasses: [], neverNa: true },
];

/**
 * Auto-suggest N/A status for each FRNA entry based on the accounts present
 * in the trial balance. Returns 'NA' if the required accounts are all absent,
 * 'A' if at least one required account has a non-zero balance.
 * Returns 'pending' for entries with neverNa=true or no restriction.
 */
export function computeFRNASuggestions(
  accountNumbers: string[],
  accountClasses: Map<string, number>,
  netBalances: Map<string, number>,
): Map<string, NoteApplicability> {
  const result = new Map<string, NoteApplicability>();

  function hasBalance(prefixes: string[], classes: number[]): boolean {
    if (prefixes.length === 0 && classes.length === 0) return true;
    for (const acc of accountNumbers) {
      const bal = netBalances.get(acc) ?? 0;
      if (bal === 0) continue;
      if (prefixes.some((p) => acc.startsWith(p))) return true;
      const cls = accountClasses.get(acc) ?? parseInt(acc[0] ?? '0', 10);
      if (classes.includes(cls)) return true;
    }
    return false;
  }

  for (const entry of FRNA_ENTRIES) {
    if (entry.neverNa || (entry.requiredPrefixes.length === 0 && entry.requiredClasses.length === 0)) {
      result.set(entry.id, 'pending');
    } else {
      result.set(entry.id, hasBalance(entry.requiredPrefixes, entry.requiredClasses) ? 'A' : 'NA');
    }
  }
  return result;
}
