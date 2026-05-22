// All SYSCOHADA / DGI Guinea reference code tables.
// Source: datamodel.md Data Sections 6–9.
// These are static statutory code lists — stored as constants, not in the database.

export interface ReferenceCode {
  code: string;
  labelFr: string;
}

// Data Section 6 — Legal Form Codes (FIRD ZK field)
export const LEGAL_FORM_CODES: ReferenceCode[] = [
  { code: '00', labelFr: 'SA à participation publique' },
  { code: '01', labelFr: 'SA (Société Anonyme)' },
  { code: '02', labelFr: 'SARL (Société à Responsabilité Limitée)' },
  { code: '03', labelFr: 'SCS (Société en Commandite Simple)' },
  { code: '04', labelFr: 'SNC (Société en Nom Collectif)' },
  { code: '05', labelFr: 'SP (Société en Participation)' },
  { code: '06', labelFr: "GIE (Groupement d'Intérêt Économique)" },
  { code: '07', labelFr: 'Association' },
  { code: '08', labelFr: 'SAS (Société par Actions Simplifiée)' },
  { code: '09', labelFr: 'Autre forme juridique (à préciser)' },
];

// Data Section 7 — Fiscal Regime Codes (FIRD ZL field)
export const FISCAL_REGIME_CODES: ReferenceCode[] = [
  { code: '1', labelFr: 'Réel Normal' },
  { code: '2', labelFr: 'Réel Simplifié' },
  { code: '3', labelFr: 'Synthétique' },
  { code: '4', labelFr: 'Forfait' },
];

// Data Section 8 — Country Codes (FIRD ZM field)
export const COUNTRY_CODES: ReferenceCode[] = [
  { code: '01', labelFr: 'Bénin' },
  { code: '02', labelFr: 'Burkina Faso' },
  { code: '03', labelFr: "Côte d'Ivoire" },
  { code: '04', labelFr: 'Guinée Bissau' },
  { code: '05', labelFr: 'Mali' },
  { code: '06', labelFr: 'Niger' },
  { code: '07', labelFr: 'Sénégal' },
  { code: '08', labelFr: 'Togo' },
  { code: '09', labelFr: 'Cameroun' },
  { code: '10', labelFr: 'Congo' },
  { code: '11', labelFr: 'Gabon' },
  { code: '12', labelFr: 'République Centrafricaine' },
  { code: '13', labelFr: 'Tchad' },
  { code: '14', labelFr: 'Comores' },
  { code: '15', labelFr: 'Guinée' },
  { code: '16', labelFr: 'Guinée Équatoriale' },
  { code: '17', labelFr: 'Congo RDC' },
  { code: '20', labelFr: 'Autres pays africains' },
  { code: '21', labelFr: 'France' },
  { code: '30', labelFr: "Autres pays de l'Union Européenne" },
  { code: '40', labelFr: 'USA' },
  { code: '41', labelFr: 'Canada' },
  { code: '49', labelFr: 'Autres pays américains' },
  { code: '50', labelFr: 'Pays asiatiques' },
  { code: '99', labelFr: 'Autres pays' },
];

// Data Section 9 — Activity Nomenclature Codes (FIRD ZE field)
export const ACTIVITY_CODES: ReferenceCode[] = [
  { code: '001001', labelFr: 'Culture céréalière' },
  { code: '001002', labelFr: 'Cultures de tubercules et plantains' },
  { code: '001003', labelFr: 'Culture de légumes' },
  { code: '001004', labelFr: 'Culture de condiments' },
  { code: '001005', labelFr: 'Culture de fruits' },
  { code: '001006', labelFr: "Culture d'autres produits de l'agriculture vivrière" },
  { code: '002001', labelFr: 'Culture de canne à sucre' },
  { code: '002002', labelFr: "Culture d'arachide d'huilerie" },
  { code: '002003', labelFr: 'Culture d\'arachide de bouche' },
  { code: '002004', labelFr: 'Culture de tabac' },
  { code: '002005', labelFr: 'Culture de coton' },
  { code: '002006', labelFr: 'Culture de blé' },
  { code: '002007', labelFr: 'Culture de cacao' },
  { code: '002008', labelFr: 'Culture de café' },
  { code: '002009', labelFr: "Culture de banane d'exportation" },
  { code: '002010', labelFr: "Culture d'ananas d'exportation" },
  { code: '002011', labelFr: 'Autres cultures industrielles' },
  { code: '003001', labelFr: 'Élevage bovin' },
  { code: '003002', labelFr: 'Élevage ovin, caprin, équin' },
  { code: '003003', labelFr: 'Élevage de volailles' },
  { code: '003004', labelFr: 'Autres élevages' },
  { code: '003005', labelFr: 'Chasse' },
  { code: '004001', labelFr: 'Sylviculture' },
  { code: '004002', labelFr: 'Exploitation forestière' },
  { code: '005001', labelFr: 'Pêche de poissons' },
  { code: '005003', labelFr: 'Autres pêches et aquaculture' },
  { code: '006001', labelFr: "Extraction d'hydrocarbures" },
  { code: '006002', labelFr: "Extraction d'autres produits" },
  { code: '007001', labelFr: 'Production de viande et produits à base de viande' },
  { code: '007002', labelFr: 'Production de poissons et produits à base de poisson' },
  { code: '008000', labelFr: 'Travail de grain et fabrication de produits amylacés' },
  { code: '009001', labelFr: 'Transformation du café' },
  { code: '009002', labelFr: 'Transformation du cacao' },
  { code: '010001', labelFr: 'Huile brute et tourteaux' },
  { code: '010002', labelFr: 'Autres corps gras' },
  { code: '011001', labelFr: 'Fabrication de pains, biscuits et pâtisserie' },
  { code: '011002', labelFr: 'Fabrication de pâtes alimentaires' },
  { code: '012000', labelFr: 'Industrie laitière' },
  { code: '013001', labelFr: 'Fabrication de sucre' },
  { code: '013002', labelFr: 'Fabrication de produits à base de fruits et légumes' },
  { code: '013003', labelFr: "Fabrication d'autres produits alimentaires" },
  { code: '014001', labelFr: 'Brasseries et malteries' },
  { code: '014002', labelFr: "Fabrication d'autres boissons alcoolisées" },
  { code: '014003', labelFr: 'Fabrication de boissons non alcoolisées et eaux minérales' },
  { code: '015000', labelFr: 'Industrie du tabac' },
  { code: '016001', labelFr: 'Industries textiles' },
  { code: '016002', labelFr: "Industries de l'habillement" },
  { code: '017001', labelFr: 'Fabrication du cuir et articles en cuir' },
  { code: '017002', labelFr: 'Fabrication de chaussures' },
  { code: '018001', labelFr: 'Sciage, rabotage et imprégnation du bois' },
  { code: '018002', labelFr: 'Fabrication de panneaux en bois' },
  { code: '018003', labelFr: "Fabrication d'articles en bois assemblés" },
  { code: '019001', labelFr: 'Industrie du papier et du carton' },
  { code: '019002', labelFr: 'Édition, imprimerie, reproduction' },
  { code: '020000', labelFr: 'Raffinage de pétrole' },
  { code: '021001', labelFr: 'Industries chimiques de base' },
  { code: '021002', labelFr: "Fabrication de savons, détergents et produits d'entretien" },
  { code: '021003', labelFr: 'Fabrication de produits agro-chimiques' },
  { code: '021004', labelFr: 'Industries pharmaceutiques' },
  { code: '021005', labelFr: 'Autres produits chimiques' },
  { code: '022001', labelFr: 'Fabrication du caoutchouc naturel' },
  { code: '022002', labelFr: 'Industrie du caoutchouc' },
  { code: '022003', labelFr: 'Fabrication de matière plastique' },
  { code: '023001', labelFr: 'Industrie du verre' },
  { code: '023002', labelFr: 'Fabrication de produits minéraux pour la construction' },
  { code: '023003', labelFr: "Fabrication d'autres produits non métalliques" },
  { code: '024001', labelFr: 'Métallurgie' },
  { code: '024002', labelFr: 'Travail des métaux' },
  { code: '025001', labelFr: "Fabrication de machines et d'équipement" },
  { code: '025002', labelFr: 'Fabrication de machines de bureaux' },
  { code: '025003', labelFr: "Fabrication d'appareils électriques" },
  { code: '026001', labelFr: "Fabrication d'équipements et appareils audiovisuels et de communication" },
  { code: '026002', labelFr: "Fabrication d'instruments médicaux, d'optiques et d'horlogerie" },
  { code: '027001', labelFr: 'Fabrication de véhicules routiers' },
  { code: '027002', labelFr: "Fabrication d'autres matériels de transport" },
  { code: '028001', labelFr: 'Fabrication de meubles' },
  { code: '028002', labelFr: 'Industries diverses' },
  { code: '029001', labelFr: "Production, transport et distribution d'électricité" },
  { code: '029002', labelFr: "Captage, épuration et distribution d'eau" },
  { code: '029003', labelFr: 'Production et distribution de gaz' },
  { code: '030001', labelFr: "Préparation de sites et construction d'ouvrages" },
  { code: '030002', labelFr: 'Travaux d\'installation et de finition' },
  { code: '031001', labelFr: 'Commerce de véhicules, accessoires et carburant' },
  { code: '031002', labelFr: "Commerce de produits bruts et d'animaux vivants" },
  { code: '031003', labelFr: 'Autres commerces' },
  { code: '032001', labelFr: 'Entretien et réparation de véhicules automobiles' },
  { code: '032002', labelFr: 'Réparations de biens personnels et domestiques' },
  { code: '033001', labelFr: 'Hôtels' },
  { code: '033002', labelFr: 'Bars et restaurants' },
  { code: '034001', labelFr: 'Transport ferroviaire' },
  { code: '034002', labelFr: 'Transports routiers, transports par conduite' },
  { code: '034003', labelFr: 'Transport par eau' },
  { code: '034004', labelFr: 'Transport aérien' },
  { code: '034005', labelFr: 'Services annexes et auxiliaires de transport' },
  { code: '035001', labelFr: 'Postes' },
  { code: '035002', labelFr: 'Télécommunications' },
  { code: '036001', labelFr: "Services d'intermédiation financière" },
  { code: '036002', labelFr: 'Assurances (sauf sécurité sociale)' },
  { code: '036003', labelFr: "Auxiliaires financiers et d'assurances" },
  { code: '037001', labelFr: 'Location de biens immobiliers' },
  { code: '037002', labelFr: 'Autres services immobiliers' },
  { code: '038001', labelFr: 'Locations sans opérateur' },
  { code: '038002', labelFr: 'Activités informatiques' },
  { code: '038003', labelFr: 'Services rendus principalement aux entités' },
  { code: '039001', labelFr: 'Administration générale, économique et sociale' },
  { code: '039002', labelFr: 'Services de prérogative publique' },
  { code: '039003', labelFr: 'Sécurité sociale obligatoire' },
  { code: '040000', labelFr: 'Éducation' },
  { code: '041001', labelFr: 'Activité pour la santé des hommes' },
  { code: '041002', labelFr: 'Activité vétérinaire' },
  { code: '041003', labelFr: 'Action sociale' },
  { code: '042001', labelFr: 'Assainissement, voirie et gestion des déchets' },
  { code: '042002', labelFr: 'Activités associatives' },
  { code: '042003', labelFr: 'Activités récréatives, culturelles et sportives' },
  { code: '042004', labelFr: 'Services personnels' },
  { code: '042005', labelFr: 'Services domestiques' },
  { code: '043000', labelFr: 'Services d\'intermédiation financière indirectement mesurés' },
  { code: '044000', labelFr: 'Correction territoriale' },
];

// Supported currencies with display metadata (Data Section 14 equivalent)
export interface CurrencyMeta {
  code: string;
  labelFr: string;
  symbol: string;
  thousandsSep: string;
  decimalSep: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'GNF', labelFr: 'Franc Guinéen (GNF)', symbol: 'GNF', thousandsSep: ' ', decimalSep: ',', decimals: 0 },
  { code: 'XOF', labelFr: 'Franc CFA UEMOA (XOF)', symbol: 'FCFA', thousandsSep: ' ', decimalSep: ',', decimals: 0 },
  { code: 'XAF', labelFr: 'Franc CFA CEMAC (XAF)', symbol: 'FCFA', thousandsSep: ' ', decimalSep: ',', decimals: 0 },
  { code: 'EUR', labelFr: 'Euro (EUR)', symbol: '€', thousandsSep: ' ', decimalSep: ',', decimals: 2 },
  { code: 'USD', labelFr: 'Dollar américain (USD)', symbol: '$', thousandsSep: ',', decimalSep: '.', decimals: 2 },
  { code: 'GBP', labelFr: 'Livre sterling (GBP)', symbol: '£', thousandsSep: ',', decimalSep: '.', decimals: 2 },
  { code: 'CHF', labelFr: 'Franc suisse (CHF)', symbol: 'CHF', thousandsSep: "'", decimalSep: '.', decimals: 2 },
  { code: 'MAD', labelFr: 'Dirham marocain (MAD)', symbol: 'MAD', thousandsSep: ' ', decimalSep: ',', decimals: 2 },
];

// Helper: look up a legal form label by code
export function getLegalFormLabel(code: string): string {
  return LEGAL_FORM_CODES.find((r) => r.code === code)?.labelFr ?? code;
}

// Helper: look up a fiscal regime label by code
export function getFiscalRegimeLabel(code: string): string {
  return FISCAL_REGIME_CODES.find((r) => r.code === code)?.labelFr ?? code;
}

// Helper: look up a country label by code
export function getCountryLabel(code: string): string {
  return COUNTRY_CODES.find((r) => r.code === code)?.labelFr ?? code;
}

// Helper: look up an activity label by code
export function getActivityLabel(code: string): string {
  return ACTIVITY_CODES.find((r) => r.code === code)?.labelFr ?? code;
}
