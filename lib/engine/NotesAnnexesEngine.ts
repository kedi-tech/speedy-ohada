import type { NoteStatus, NormalizedAccount } from './types';
import type { ActifReport } from './ActifEngine';
import type { PassifReport } from './PassifEngine';
import type { IncomeStatementReport } from './IncomeStatementEngine';
import type { CashFlowReport } from './CashFlowEngine';
import { matchesPrefix } from './AccountPrefixEngine';

export interface NoteField {
  key: string;
  label_fr: string;
  label_en: string;
  value: number | string | null;
  is_manual: boolean;
  required: boolean;
  placeholder_fr?: string;
  placeholder_en?: string;
}

export interface NoteAnnexe {
  note_number: number;
  // Variant suffix for split schedules: '', 'A', 'B', 'C', 'Bis', 'D', 'E' etc. (Flow 8)
  // Full note key is note_number + note_variant, e.g. "3A", "3B", "8A", "16BBis"
  note_variant: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  source_accounts: string[];
  source_report_lines: string[];
  calculation_formula: string;
  fields: NoteField[];
  required_fields: string[];
  is_required: boolean;
  status: NoteStatus;
  validation_result: 'ok' | 'incomplete' | 'error';
}

export interface NotesContext {
  actifN: ActifReport;
  actifN1?: ActifReport;
  passifN: PassifReport;
  passifN1?: PassifReport;
  incomeStatement: IncomeStatementReport;
  cashFlow?: CashFlowReport;
  accountsN: NormalizedAccount[];
  accountsN1?: NormalizedAccount[];
}

type ManualOverrides = Record<string, Record<string, unknown>>;

interface NoteDefinition {
  note_number: number;
  note_variant: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  source_report_lines: string[];
  account_prefixes?: string[];
  calculation_formula: string;
  auto_fields: Array<{
    key: string;
    label_fr: string;
    label_en: string;
    value: (ctx: NotesContext) => number | string | null;
  }>;
  manual_fields: Array<{
    key: string;
    label_fr: string;
    label_en: string;
    required?: boolean;
  }>;
  required_when: (ctx: NotesContext) => boolean;
}

function computeStatus(fields: NoteField[], isRequired: boolean): NoteStatus {
  const required = fields.filter((field) => field.required);
  if (!isRequired && required.length === 0) return 'prefilled';
  if (required.length === 0) return 'completed';
  const allFilled = required.every((field) => field.value !== null && field.value !== '');
  const anyFilled = required.some((field) => field.value !== null && field.value !== '');
  if (allFilled) return 'completed';
  if (anyFilled) return 'toComplete';
  return isRequired ? 'notStarted' : 'prefilled';
}

function makeManual(key: string, labelFr: string, labelEn: string, required: boolean): NoteField {
  return {
    key,
    label_fr: labelFr,
    label_en: labelEn,
    value: null,
    is_manual: true,
    required,
    placeholder_fr: 'Completer si cette information existe dans les donnees importees ou dans les justificatifs.',
    placeholder_en: 'Complete when this information exists in the import or supporting schedules.',
  };
}

function makeAuto(key: string, labelFr: string, labelEn: string, value: number | string | null): NoteField {
  return { key, label_fr: labelFr, label_en: labelEn, value, is_manual: false, required: false };
}

function lineValue(
  ctx: NotesContext,
  report: 'actif' | 'passif' | 'income',
  lineCode: string,
  field: 'value_N' | 'value_N_1' = 'value_N',
): number | null {
  const lines =
    report === 'actif' ? ctx.actifN.lines :
    report === 'passif' ? ctx.passifN.lines :
    ctx.incomeStatement.lines;
  return lines.find((line) => line.line_code === lineCode)?.[field] ?? null;
}

function accountNumbersByPrefix(accounts: NormalizedAccount[], prefixes: string[] = []): string[] {
  return accounts
    .filter((account) => prefixes.length === 0 || matchesPrefix(account.account_number, prefixes))
    .map((account) => account.account_number)
    .sort();
}

function sumByPrefix(accounts: NormalizedAccount[], prefixes: string[] = []): number {
  return accounts
    .filter((account) => prefixes.length === 0 || matchesPrefix(account.account_number, prefixes))
    .reduce((total, account) => total + account.net_balance, 0);
}

function hasAnyValue(ctx: NotesContext, reportLines: string[], prefixes: string[] = []): boolean {
  const reportValue = reportLines.some((code) =>
    (lineValue(ctx, 'actif', code) ?? 0) !== 0 ||
    (lineValue(ctx, 'passif', code) ?? 0) !== 0 ||
    (lineValue(ctx, 'income', code) ?? 0) !== 0
  );
  const accountValue = prefixes.length > 0 && sumByPrefix(ctx.accountsN, prefixes) !== 0;
  return reportValue || accountValue;
}

function applyManualOverrides(noteNumber: number, noteVariant: string, fields: NoteField[], overrides: ManualOverrides) {
  const key = noteVariant ? `note_${noteNumber}${noteVariant}` : `note_${noteNumber}`;
  const noteOverrides = overrides[key] ?? {};
  for (const field of fields) {
    if (field.is_manual && Object.prototype.hasOwnProperty.call(noteOverrides, field.key)) {
      const value = noteOverrides[field.key];
      field.value = typeof value === 'number' || typeof value === 'string' ? value : JSON.stringify(value);
    }
  }
}

const commonManualFields = [
  { key: 'commentary', label_fr: 'Commentaire', label_en: 'Commentary' },
  { key: 'supporting_detail', label_fr: 'Detail justificatif', label_en: 'Supporting detail' },
];

function computeVA(ctx: NotesContext): number {
  const lv = (code: string) => lineValue(ctx, 'income', code) ?? 0;
  return lv('CHIFFRE_AFFAIRES') + lv('PROD_STOCKEE') + lv('PROD_IMMO')
    + lv('AUTRES_PROD_EXPLOIT')
    - lv('ACHATS') - lv('SERVICES_EXT') - lv('IMPOTS_TAXES')
    - lv('AUTRES_CHARGES_EXPLOIT');
}

function computeEBE(ctx: NotesContext): number {
  return computeVA(ctx) - (lineValue(ctx, 'income', 'CHARGES_PERS') ?? 0);
}

function pct(numerator: number, denominator: number): string | null {
  if (denominator === 0) return null;
  return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

const NOTE_DEFINITIONS: NoteDefinition[] = [
  {
    note_number: 1,
    note_variant: '',
    title_fr: 'Informations generales',
    title_en: 'General information',
    description_fr: 'Identification de l entreprise, referentiel et exercice.',
    description_en: 'Company identification, accounting standard, and reporting period.',
    source_report_lines: [],
    calculation_formula: 'manual company metadata',
    auto_fields: [],
    manual_fields: [
      { key: 'company_name', label_fr: 'Denomination sociale', label_en: 'Company name', required: true },
      { key: 'rccm', label_fr: 'RCCM', label_en: 'RCCM' },
      { key: 'nif', label_fr: 'NIF', label_en: 'Tax ID' },
      { key: 'address', label_fr: 'Adresse', label_en: 'Address' },
      { key: 'accounting_standard', label_fr: 'Referentiel comptable', label_en: 'Accounting standard', required: true },
      { key: 'fiscal_year', label_fr: 'Exercice fiscal', label_en: 'Fiscal year', required: true },
    ],
    required_when: () => true,
  },
  {
    note_number: 2,
    note_variant: '',
    title_fr: 'Regles et methodes comptables',
    title_en: 'Accounting policies',
    description_fr: 'Principes, methodes et jugements comptables appliques.',
    description_en: 'Accounting principles, methods, and judgments used.',
    source_report_lines: [],
    calculation_formula: 'manual policy disclosure',
    auto_fields: [],
    manual_fields: [
      { key: 'valuation_methods', label_fr: 'Methodes d evaluation', label_en: 'Valuation methods', required: true },
      { key: 'depreciation_methods', label_fr: 'Methodes d amortissement', label_en: 'Depreciation methods', required: true },
      { key: 'inventory_methods', label_fr: 'Methodes de valorisation des stocks', label_en: 'Inventory valuation methods' },
    ],
    required_when: () => true,
  },
  {
    note_number: 3,
    note_variant: 'A',
    title_fr: 'Immobilisations incorporelles',
    title_en: 'Intangible assets',
    description_fr: 'Mouvements des immobilisations incorporelles et amortissements.',
    description_en: 'Movements in intangible assets and amortization.',
    source_report_lines: ['IMMO_INC_GROSS', 'IMMO_INC_DEPR', 'TOTAL_IMMO_INC'],
    account_prefixes: ['20', '21', '22', '280', '281', '282'],
    calculation_formula: 'closing net = gross - depreciation',
    auto_fields: [
      { key: 'gross_close', label_fr: 'Brut cloture', label_en: 'Closing gross', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_INC_GROSS') },
      { key: 'depreciation_close', label_fr: 'Amortissements cloture', label_en: 'Closing amortization', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_INC_DEPR') },
      { key: 'net_close', label_fr: 'Net cloture', label_en: 'Closing net', value: (ctx) => lineValue(ctx, 'actif', 'TOTAL_IMMO_INC') },
    ],
    manual_fields: [
      { key: 'acquisitions', label_fr: 'Acquisitions', label_en: 'Acquisitions' },
      { key: 'disposals', label_fr: 'Cessions', label_en: 'Disposals' },
      { key: 'transfers', label_fr: 'Transferts', label_en: 'Transfers' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['IMMO_INC_GROSS', 'TOTAL_IMMO_INC'], ['20', '21', '22']),
  },
  {
    note_number: 3,
    note_variant: 'B',
    title_fr: 'Immobilisations corporelles',
    title_en: 'Tangible fixed assets',
    description_fr: 'Mouvements des immobilisations corporelles et amortissements.',
    description_en: 'Movements in tangible fixed assets and depreciation.',
    source_report_lines: ['IMMO_CORP_GROSS', 'IMMO_CORP_DEPR', 'TOTAL_IMMO_CORP'],
    account_prefixes: ['23', '24', '25', '26', '283', '284', '285', '286'],
    calculation_formula: 'closing net = gross - depreciation',
    auto_fields: [
      { key: 'gross_close', label_fr: 'Brut cloture', label_en: 'Closing gross', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_CORP_GROSS') },
      { key: 'depreciation_close', label_fr: 'Amortissements cloture', label_en: 'Closing depreciation', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_CORP_DEPR') },
      { key: 'net_close', label_fr: 'Net cloture', label_en: 'Closing net', value: (ctx) => lineValue(ctx, 'actif', 'TOTAL_IMMO_CORP') },
    ],
    manual_fields: [
      { key: 'acquisitions', label_fr: 'Acquisitions', label_en: 'Acquisitions' },
      { key: 'disposals', label_fr: 'Cessions', label_en: 'Disposals' },
      { key: 'depreciation_charge', label_fr: 'Dotation de l exercice', label_en: 'Depreciation charge' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['IMMO_CORP_GROSS', 'TOTAL_IMMO_CORP'], ['23', '24', '25', '26']),
  },
  {
    note_number: 3,
    note_variant: 'C',
    title_fr: 'Cessions et sorties d immobilisations',
    title_en: 'Asset disposals and retirements',
    description_fr: 'Plus-values et moins-values sur cessions d immobilisations incorporelles et corporelles.',
    description_en: 'Gains and losses on disposal of intangible and tangible fixed assets.',
    source_report_lines: [],
    account_prefixes: ['654', '754'],
    calculation_formula: 'gain_loss = produits_cessions (754) + vcn_cessions (654)',
    auto_fields: [
      { key: 'vcn', label_fr: 'VCN cessions (cpte 654)', label_en: 'Net book value of disposals (acct 654)', value: (ctx) => sumByPrefix(ctx.accountsN, ['654']) },
      { key: 'proceeds', label_fr: 'Produits de cessions (cpte 754)', label_en: 'Disposal proceeds (acct 754)', value: (ctx) => sumByPrefix(ctx.accountsN, ['754']) },
      { key: 'gain_loss', label_fr: 'Plus/moins-value nette', label_en: 'Net gain / (loss) on disposals', value: (ctx) => sumByPrefix(ctx.accountsN, ['754']) + sumByPrefix(ctx.accountsN, ['654']) },
    ],
    manual_fields: [
      { key: 'detail_cessions', label_fr: 'Detail des cessions par bien', label_en: 'Disposal detail by asset' },
    ],
    required_when: (ctx) => sumByPrefix(ctx.accountsN, ['654']) !== 0 || sumByPrefix(ctx.accountsN, ['754']) !== 0,
  },
  {
    note_number: 3,
    note_variant: 'Cbis',
    title_fr: 'Plus-values et moins-values sur cessions HAO',
    title_en: 'Non-ordinary asset gains and losses',
    description_fr: 'Produits et charges hors activites ordinaires lies aux cessions d actifs.',
    description_en: 'Non-ordinary income and expenses from asset disposals.',
    source_report_lines: ['PROD_HAO', 'CHARGES_HAO'],
    account_prefixes: ['82', '83', '84', '85'],
    calculation_formula: 'resultat_hao = produits_hao - charges_hao',
    auto_fields: [
      { key: 'hao_income', label_fr: 'Produits HAO', label_en: 'Non-ordinary income', value: (ctx) => ctx.incomeStatement.hao_income_N },
      { key: 'hao_expenses', label_fr: 'Charges HAO', label_en: 'Non-ordinary expenses', value: (ctx) => ctx.incomeStatement.hao_expenses_N },
      { key: 'hao_result', label_fr: 'Resultat HAO', label_en: 'Non-ordinary result', value: (ctx) => ctx.incomeStatement.hao_result_N },
    ],
    manual_fields: [
      { key: 'detail_hao', label_fr: 'Detail des operations HAO', label_en: 'Non-ordinary operations detail' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['PROD_HAO', 'CHARGES_HAO'], ['82', '83', '84', '85']),
  },
  {
    note_number: 3,
    note_variant: 'D',
    title_fr: 'Tableau des amortissements et provisions pour depreciation',
    title_en: 'Depreciation and impairment schedule',
    description_fr: 'Mouvements des amortissements et provisions pour depreciation des immobilisations.',
    description_en: 'Movements in accumulated depreciation and impairment of fixed assets.',
    source_report_lines: ['IMMO_INC_DEPR', 'IMMO_CORP_DEPR', 'DOTATIONS_AMORT'],
    account_prefixes: ['28', '29'],
    calculation_formula: 'cloture = ouverture + dotations - reprises - sorties_sur_cessions',
    auto_fields: [
      { key: 'depr_inc', label_fr: 'Amort incorporels cloture', label_en: 'Intangible depreciation closing', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_INC_DEPR') },
      { key: 'depr_corp', label_fr: 'Amort corporels cloture', label_en: 'Tangible depreciation closing', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_CORP_DEPR') },
      { key: 'dotations', label_fr: 'Dotations aux amortissements (cpte 68)', label_en: 'Depreciation charge (acct 68)', value: (ctx) => lineValue(ctx, 'income', 'DOTATIONS_AMORT') },
    ],
    manual_fields: [
      { key: 'ouverture', label_fr: 'Cumul amortissements a l ouverture', label_en: 'Opening accumulated depreciation' },
      { key: 'sorties_cessions', label_fr: 'Sorties sur cessions', label_en: 'Depreciation written off on disposals' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['IMMO_INC_DEPR', 'IMMO_CORP_DEPR'], ['28']),
  },
  {
    note_number: 3,
    note_variant: 'E',
    title_fr: 'Immobilisations financieres',
    title_en: 'Financial assets',
    description_fr: 'Detail des immobilisations financieres et provisions pour depreciation.',
    description_en: 'Financial asset detail and provisions.',
    source_report_lines: ['IMMO_FIN_GROSS', 'IMMO_FIN_PROV', 'TOTAL_IMMO_FIN'],
    account_prefixes: ['27', '297'],
    calculation_formula: 'closing net = gross - provision',
    auto_fields: [
      { key: 'gross_close', label_fr: 'Brut cloture', label_en: 'Closing gross', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_FIN_GROSS') },
      { key: 'provision_close', label_fr: 'Provisions cloture', label_en: 'Closing provisions', value: (ctx) => lineValue(ctx, 'actif', 'IMMO_FIN_PROV') },
      { key: 'net_close', label_fr: 'Net cloture', label_en: 'Closing net', value: (ctx) => lineValue(ctx, 'actif', 'TOTAL_IMMO_FIN') },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['IMMO_FIN_GROSS', 'TOTAL_IMMO_FIN'], ['27']),
  },
  {
    note_number: 6,
    note_variant: '',
    title_fr: 'Stocks et en-cours',
    title_en: 'Inventories and work in progress',
    description_fr: 'Detail des stocks, provisions et variation.',
    description_en: 'Inventory detail, provisions, and movement.',
    source_report_lines: ['STOCKS', 'STOCKS_PROV', 'STOCKS_NET'],
    account_prefixes: ['31', '32', '33', '34', '35', '36', '37', '38', '39'],
    calculation_formula: 'net inventories = gross inventories - provisions',
    auto_fields: [
      { key: 'gross', label_fr: 'Stocks bruts', label_en: 'Gross inventories', value: (ctx) => lineValue(ctx, 'actif', 'STOCKS') },
      { key: 'provision', label_fr: 'Provisions', label_en: 'Provisions', value: (ctx) => lineValue(ctx, 'actif', 'STOCKS_PROV') },
      { key: 'net', label_fr: 'Stocks nets', label_en: 'Net inventories', value: (ctx) => lineValue(ctx, 'actif', 'STOCKS_NET') },
      { key: 'variation', label_fr: 'Variation', label_en: 'Change', value: (ctx) => ctx.actifN1 ? ctx.actifN.total_stocks_net_N - ctx.actifN1.total_stocks_net_N : null },
    ],
    manual_fields: [{ key: 'valuation_method', label_fr: 'Methode de valorisation', label_en: 'Valuation method' }],
    required_when: (ctx) => hasAnyValue(ctx, ['STOCKS', 'STOCKS_NET'], ['3']),
  },
  {
    note_number: 7,
    note_variant: '',
    title_fr: 'Creances clients et autres creances',
    title_en: 'Customer and other receivables',
    description_fr: 'Detail des creances par nature, provisions et echeances.',
    description_en: 'Receivables by nature, provisions, and maturity.',
    source_report_lines: ['CREANCES_CLIENTS', 'CREANCES_CLIENTS_PROV', 'AUTRES_CREANCES', 'TOTAL_CREANCES'],
    account_prefixes: ['41', '42', '43', '44', '45', '46', '47', '48', '49'],
    calculation_formula: 'total receivables from actif lines',
    auto_fields: [
      { key: 'customers', label_fr: 'Clients', label_en: 'Customers', value: (ctx) => lineValue(ctx, 'actif', 'CREANCES_CLIENTS') },
      { key: 'customer_provisions', label_fr: 'Provisions clients', label_en: 'Customer provisions', value: (ctx) => lineValue(ctx, 'actif', 'CREANCES_CLIENTS_PROV') },
      { key: 'other_receivables', label_fr: 'Autres creances', label_en: 'Other receivables', value: (ctx) => lineValue(ctx, 'actif', 'AUTRES_CREANCES') },
      { key: 'total_receivables', label_fr: 'Total creances', label_en: 'Total receivables', value: (ctx) => ctx.actifN.total_creances_N },
    ],
    manual_fields: [{ key: 'maturity_breakdown', label_fr: 'Echeancier', label_en: 'Maturity schedule' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_CREANCES'], ['4']),
  },
  {
    note_number: 8,
    note_variant: 'A',
    title_fr: 'Trésorerie actif',
    title_en: 'Cash and bank assets',
    description_fr: 'Banques et etablissements financiers, caisse et monnaie electronique debitrice.',
    description_en: 'Banks, cash on hand, and mobile money assets.',
    source_report_lines: ['BANQUES_ACTIF', 'CAISSE_ACTIF', 'TOTAL_TRES_ACTIF'],
    account_prefixes: ['51', '52', '53', '571', '572'],
    calculation_formula: 'sum treasury asset lines',
    auto_fields: [
      { key: 'banks', label_fr: 'Banques', label_en: 'Banks', value: (ctx) => lineValue(ctx, 'actif', 'BANQUES_ACTIF') },
      { key: 'cash', label_fr: 'Caisse', label_en: 'Cash on hand', value: (ctx) => lineValue(ctx, 'actif', 'CAISSE_ACTIF') },
      { key: 'total', label_fr: 'Total tresorerie actif', label_en: 'Total cash assets', value: (ctx) => ctx.actifN.total_treasury_assets_N },
    ],
    manual_fields: [{ key: 'currency_breakdown', label_fr: 'Repartition par devises', label_en: 'Currency breakdown' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_TRES_ACTIF'], ['51', '52', '53']),
  },
  {
    note_number: 8,
    note_variant: 'B',
    title_fr: 'Trésorerie passif',
    title_en: 'Treasury liabilities',
    description_fr: 'Concours bancaires courants, decouverts et facilites de caisse.',
    description_en: 'Bank overdrafts and short-term credit facilities.',
    source_report_lines: ['BANQUES_CREDIT', 'TOTAL_TRES_PASSIF'],
    account_prefixes: ['55', '56'],
    calculation_formula: 'sum treasury liability lines',
    auto_fields: [
      { key: 'bank_credit', label_fr: 'Banques creditrices', label_en: 'Bank credit', value: (ctx) => lineValue(ctx, 'passif', 'BANQUES_CREDIT') },
      { key: 'mobile_money', label_fr: 'Monnaie electronique creditrice', label_en: 'Mobile money liabilities', value: (ctx) => lineValue(ctx, 'passif', 'MOBILE_MONEY_PASSIF') },
      { key: 'total', label_fr: 'Total tresorerie passif', label_en: 'Total treasury liabilities', value: (ctx) => ctx.passifN.total_treasury_liabilities_N },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_TRES_PASSIF'], ['55', '56']),
  },
  {
    note_number: 8,
    note_variant: 'C',
    title_fr: 'Titres de placement et monnaie electronique',
    title_en: 'Short-term investments and mobile money',
    description_fr: 'Titres et valeurs de placement, monnaie electronique et autres disponibilites.',
    description_en: 'Short-term investments, mobile money, and other liquid assets.',
    source_report_lines: ['TITRES_PLACEMENT', 'MOBILE_MONEY_ACTIF'],
    account_prefixes: ['50', '573', '574'],
    calculation_formula: 'sum placement and mobile money accounts',
    auto_fields: [
      { key: 'investments', label_fr: 'Titres de placement', label_en: 'Short-term investments', value: (ctx) => lineValue(ctx, 'actif', 'TITRES_PLACEMENT') },
      { key: 'mobile_money', label_fr: 'Monnaie electronique', label_en: 'Mobile money', value: (ctx) => lineValue(ctx, 'actif', 'MOBILE_MONEY_ACTIF') },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['TITRES_PLACEMENT', 'MOBILE_MONEY_ACTIF'], ['50']),
  },
  {
    note_number: 9,
    note_variant: '',
    title_fr: 'Capitaux propres',
    title_en: 'Equity',
    description_fr: 'Capital, reserves, report a nouveau, resultat et subventions.',
    description_en: 'Capital, reserves, retained earnings, result, and grants.',
    source_report_lines: ['CAPITAL', 'RESERVES', 'REPORT_NOUVEAU', 'RESULTAT_NET_BILAN', 'SUBV_INVEST', 'TOTAL_CP'],
    account_prefixes: ['10', '11', '12', '13', '14', '15'],
    calculation_formula: 'sum equity passif lines',
    auto_fields: [
      { key: 'capital', label_fr: 'Capital', label_en: 'Capital', value: (ctx) => lineValue(ctx, 'passif', 'CAPITAL') },
      { key: 'reserves', label_fr: 'Réserves', label_en: 'Reserves', value: (ctx) => lineValue(ctx, 'passif', 'RESERVES') },
      { key: 'net_result', label_fr: 'Resultat net', label_en: 'Net result', value: (ctx) => lineValue(ctx, 'passif', 'RESULTAT_NET_BILAN') },
      { key: 'total_equity', label_fr: 'Total capitaux propres', label_en: 'Total equity', value: (ctx) => ctx.passifN.total_equity_N },
    ],
    manual_fields: [{ key: 'appropriation', label_fr: 'Affectation du resultat', label_en: 'Result appropriation' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_CP'], ['1']),
  },
  {
    note_number: 10,
    note_variant: '',
    title_fr: 'Emprunts et dettes financieres',
    title_en: 'Borrowings and financial debts',
    description_fr: 'Emprunts, dettes financieres, provisions financieres et echeances.',
    description_en: 'Borrowings, financial debts, financial provisions, and maturities.',
    source_report_lines: ['EMPRUNTS', 'PROV_FIN', 'TOTAL_DETTES_FIN'],
    account_prefixes: ['16', '17', '19'],
    calculation_formula: 'sum financial debt lines',
    auto_fields: [
      { key: 'borrowings', label_fr: 'Emprunts', label_en: 'Borrowings', value: (ctx) => lineValue(ctx, 'passif', 'EMPRUNTS') },
      { key: 'financial_provisions', label_fr: 'Provisions financieres', label_en: 'Financial provisions', value: (ctx) => lineValue(ctx, 'passif', 'PROV_FIN') },
      { key: 'total', label_fr: 'Total dettes financieres', label_en: 'Total financial debts', value: (ctx) => ctx.passifN.total_financial_debts_N },
    ],
    manual_fields: [{ key: 'maturity_breakdown', label_fr: 'Echeancier', label_en: 'Maturity schedule' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_DETTES_FIN'], ['16', '17', '19']),
  },
  {
    note_number: 11,
    note_variant: '',
    title_fr: 'Fournisseurs et autres dettes',
    title_en: 'Suppliers and other payables',
    description_fr: 'Passif circulant par nature et echeance.',
    description_en: 'Current liabilities by nature and maturity.',
    source_report_lines: ['FOURNISSEURS', 'DETTES_FISCALES', 'DETTES_SOCIALES', 'AUTRES_DETTES', 'TOTAL_PASSIF_CIRC'],
    account_prefixes: ['40', '42', '43', '44', '46', '47', '48'],
    calculation_formula: 'sum current liability lines',
    auto_fields: [
      { key: 'suppliers', label_fr: 'Fournisseurs', label_en: 'Suppliers', value: (ctx) => lineValue(ctx, 'passif', 'FOURNISSEURS') },
      { key: 'tax_payables', label_fr: 'Dettes fiscales', label_en: 'Tax payables', value: (ctx) => lineValue(ctx, 'passif', 'DETTES_FISCALES') },
      { key: 'social_payables', label_fr: 'Dettes sociales', label_en: 'Social payables', value: (ctx) => lineValue(ctx, 'passif', 'DETTES_SOCIALES') },
      { key: 'total', label_fr: 'Total passif circulant', label_en: 'Total current liabilities', value: (ctx) => ctx.passifN.total_current_liabilities_N },
    ],
    manual_fields: [{ key: 'maturity_breakdown', label_fr: 'Echeancier', label_en: 'Maturity schedule' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_PASSIF_CIRC'], ['4']),
  },
  {
    note_number: 13,
    note_variant: '',
    title_fr: 'Chiffre d affaires',
    title_en: 'Turnover',
    description_fr: 'Chiffre d affaires par activite, zone ou categorie.',
    description_en: 'Turnover by activity, geography, or category.',
    source_report_lines: ['CHIFFRE_AFFAIRES'],
    account_prefixes: ['70'],
    calculation_formula: 'credit positive class 70',
    auto_fields: [
      { key: 'turnover_n', label_fr: 'Chiffre d affaires N', label_en: 'Turnover N', value: (ctx) => ctx.incomeStatement.turnover_N },
      { key: 'turnover_n1', label_fr: 'Chiffre d affaires N-1', label_en: 'Turnover N-1', value: (ctx) => ctx.incomeStatement.turnover_N1 },
    ],
    manual_fields: [
      { key: 'activity_breakdown', label_fr: 'Repartition par activite', label_en: 'Activity breakdown' },
      { key: 'geographic_breakdown', label_fr: 'Repartition geographique', label_en: 'Geographic breakdown' },
    ],
    required_when: (ctx) => ctx.incomeStatement.turnover_N !== 0,
  },
  {
    note_number: 14,
    note_variant: '',
    title_fr: 'Produits d exploitation',
    title_en: 'Operating income',
    description_fr: 'Autres produits, production stockee et production immobilisee.',
    description_en: 'Other operating income, inventory production, and capitalized production.',
    source_report_lines: ['PROD_STOCKEE', 'PROD_IMMO', 'AUTRES_PROD_EXPLOIT', 'REPRISES_PROV', 'TOTAL_PROD_EXPLOIT'],
    account_prefixes: ['71', '72', '73', '74', '75', '76', '78', '79'],
    calculation_formula: 'sum operating income lines',
    auto_fields: [
      { key: 'total_operating_income', label_fr: 'Total produits exploitation', label_en: 'Total operating income', value: (ctx) => ctx.incomeStatement.total_operating_income_N },
      { key: 'reversals', label_fr: 'Reprises', label_en: 'Reversals', value: (ctx) => lineValue(ctx, 'income', 'REPRISES_PROV') },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_PROD_EXPLOIT'], ['71', '72', '73', '74', '75', '76', '78', '79']),
  },
  {
    note_number: 15,
    note_variant: 'A',
    title_fr: 'Achats de marchandises et de matieres',
    title_en: 'Purchases and raw materials',
    description_fr: 'Achats de marchandises (601), matieres premieres (602) et fournitures liees.',
    description_en: 'Purchases of goods (601), raw materials (602) and related supplies.',
    source_report_lines: ['ACHATS'],
    account_prefixes: ['601', '602', '603', '604', '605', '608'],
    calculation_formula: 'class 60 debit positive',
    auto_fields: [
      { key: 'purchases', label_fr: 'Achats', label_en: 'Purchases', value: (ctx) => lineValue(ctx, 'income', 'ACHATS') },
      { key: 'marchandises', label_fr: 'Achats marchandises (601)', label_en: 'Goods purchases (601)', value: (ctx) => sumByPrefix(ctx.accountsN, ['601']) },
      { key: 'matieres', label_fr: 'Achats matieres premieres (602)', label_en: 'Raw material purchases (602)', value: (ctx) => sumByPrefix(ctx.accountsN, ['602']) },
      { key: 'variation_stocks', label_fr: 'Variation stocks (603)', label_en: 'Stock movements (603)', value: (ctx) => sumByPrefix(ctx.accountsN, ['603']) },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['ACHATS'], ['60']),
  },
  {
    note_number: 15,
    note_variant: 'B',
    title_fr: 'Autres achats et charges externes',
    title_en: 'External services and other purchases',
    description_fr: 'Transports (61), services exterieurs (62-63) et autres charges externes.',
    description_en: 'Transport (61), external services (62-63) and other external charges.',
    source_report_lines: ['SERVICES_EXT'],
    account_prefixes: ['61', '62', '63'],
    calculation_formula: 'sum class 61-63 expense lines',
    auto_fields: [
      { key: 'external_services', label_fr: 'Services exterieurs', label_en: 'External services', value: (ctx) => lineValue(ctx, 'income', 'SERVICES_EXT') },
      { key: 'transport', label_fr: 'Transports (61)', label_en: 'Transport (61)', value: (ctx) => sumByPrefix(ctx.accountsN, ['61']) },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['SERVICES_EXT'], ['61', '62', '63']),
  },
  {
    note_number: 16,
    note_variant: 'A',
    title_fr: 'Impots et taxes',
    title_en: 'Taxes and duties',
    description_fr: 'Charges fiscales et taxes hors impot sur le resultat.',
    description_en: 'Tax expenses excluding income tax.',
    source_report_lines: ['IMPOTS_TAXES'],
    account_prefixes: ['64'],
    calculation_formula: 'class 64 debit positive',
    auto_fields: [{ key: 'taxes', label_fr: 'Impots et taxes', label_en: 'Taxes and duties', value: (ctx) => lineValue(ctx, 'income', 'IMPOTS_TAXES') }],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['IMPOTS_TAXES'], ['64']),
  },
  {
    note_number: 16,
    note_variant: 'B',
    title_fr: 'Charges de personnel',
    title_en: 'Personnel expenses',
    description_fr: 'Salaires, charges sociales et effectifs.',
    description_en: 'Salaries, social charges, and headcount.',
    source_report_lines: ['CHARGES_PERS'],
    account_prefixes: ['66'],
    calculation_formula: 'class 66 debit positive',
    auto_fields: [{ key: 'personnel_expenses', label_fr: 'Charges de personnel', label_en: 'Personnel expenses', value: (ctx) => lineValue(ctx, 'income', 'CHARGES_PERS') }],
    manual_fields: [
      { key: 'headcount', label_fr: 'Effectif moyen', label_en: 'Average headcount' },
      { key: 'payroll_detail', label_fr: 'Detail de la masse salariale', label_en: 'Payroll detail' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['CHARGES_PERS'], ['66']),
  },
  {
    note_number: 16,
    note_variant: 'Bbis',
    title_fr: 'Personnel interimaire et exterieur',
    title_en: 'Temporary and external staff',
    description_fr: 'Remunerations versees au personnel interimaire et exterieur a l entreprise.',
    description_en: 'Remuneration paid to temporary and external staff.',
    source_report_lines: [],
    account_prefixes: ['621'],
    calculation_formula: 'class 621 debit positive',
    auto_fields: [
      { key: 'interim', label_fr: 'Personnel interimaire (621)', label_en: 'Temporary staff (621)', value: (ctx) => sumByPrefix(ctx.accountsN, ['621']) },
    ],
    manual_fields: [
      { key: 'agences', label_fr: 'Agences d interim utilisees', label_en: 'Temp agencies used' },
      { key: 'etp_interimaires', label_fr: 'ETP interimaires', label_en: 'Temporary staff FTEs' },
    ],
    required_when: (ctx) => sumByPrefix(ctx.accountsN, ['621']) !== 0,
  },
  {
    note_number: 16,
    note_variant: 'C',
    title_fr: 'Remuneration des dirigeants',
    title_en: 'Directors and management remuneration',
    description_fr: 'Remunerations allouees aux membres des organes de direction et d administration.',
    description_en: 'Remuneration allocated to directors and management bodies.',
    source_report_lines: [],
    account_prefixes: ['661', '665'],
    calculation_formula: 'manual disclosure — class 661/665 as indicators',
    auto_fields: [
      { key: 'remuneration_dir', label_fr: 'Remunerations dirigeants (665)', label_en: 'Directors fees (665)', value: (ctx) => sumByPrefix(ctx.accountsN, ['665']) },
    ],
    manual_fields: [
      { key: 'dirigeants_detail', label_fr: 'Detail par dirigeant (nom, qualite, montant)', label_en: 'Detail by director (name, role, amount)', required: true },
    ],
    required_when: () => true,
  },
  {
    note_number: 18,
    note_variant: '',
    title_fr: 'Dotations amortissements et provisions',
    title_en: 'Depreciation and provisions expense',
    description_fr: 'Dotations aux amortissements, provisions et pertes de valeur.',
    description_en: 'Depreciation, provisions, and impairment charges.',
    source_report_lines: ['DOTATIONS_AMORT'],
    account_prefixes: ['68'],
    calculation_formula: 'class 68 debit positive',
    auto_fields: [{ key: 'depreciation_expense', label_fr: 'Dotations', label_en: 'Charges', value: (ctx) => lineValue(ctx, 'income', 'DOTATIONS_AMORT') }],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['DOTATIONS_AMORT'], ['68']),
  },
  {
    note_number: 19,
    note_variant: '',
    title_fr: 'Resultat financier',
    title_en: 'Financial result',
    description_fr: 'Produits et charges financiers.',
    description_en: 'Financial income and expenses.',
    source_report_lines: ['PROD_FIN', 'CHARGES_FIN', 'RESULTAT_FINANCIER'],
    account_prefixes: ['67', '77'],
    calculation_formula: 'financial income - financial expenses',
    auto_fields: [
      { key: 'financial_income', label_fr: 'Produits financiers', label_en: 'Financial income', value: (ctx) => lineValue(ctx, 'income', 'PROD_FIN') },
      { key: 'financial_expenses', label_fr: 'Charges financieres', label_en: 'Financial expenses', value: (ctx) => lineValue(ctx, 'income', 'CHARGES_FIN') },
      { key: 'financial_result', label_fr: 'Resultat financier', label_en: 'Financial result', value: (ctx) => ctx.incomeStatement.financial_result_N },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['PROD_FIN', 'CHARGES_FIN'], ['67', '77']),
  },
  {
    note_number: 20,
    note_variant: '',
    title_fr: 'Resultat HAO',
    title_en: 'Non-ordinary result',
    description_fr: 'Produits et charges hors activites ordinaires.',
    description_en: 'Non-ordinary income and expenses.',
    source_report_lines: ['PROD_HAO', 'CHARGES_HAO', 'RESULTAT_HAO'],
    account_prefixes: ['81', '82', '83', '84', '85', '86', '87', '88'],
    calculation_formula: 'HAO income - HAO expenses',
    auto_fields: [
      { key: 'hao_income', label_fr: 'Produits HAO', label_en: 'Non-ordinary income', value: (ctx) => ctx.incomeStatement.hao_income_N },
      { key: 'hao_expenses', label_fr: 'Charges HAO', label_en: 'Non-ordinary expenses', value: (ctx) => ctx.incomeStatement.hao_expenses_N },
      { key: 'hao_result', label_fr: 'Resultat HAO', label_en: 'Non-ordinary result', value: (ctx) => ctx.incomeStatement.hao_result_N },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['PROD_HAO', 'CHARGES_HAO'], ['8']),
  },
  {
    note_number: 21,
    note_variant: '',
    title_fr: 'Impots sur le resultat',
    title_en: 'Income tax',
    description_fr: 'Charge d impot, rapprochement fiscal et impot exigible.',
    description_en: 'Income tax expense, tax reconciliation, and tax payable.',
    source_report_lines: ['IMPOT_RESULTAT', 'IMPOT_RESULTAT_LINE', 'RESULTAT_NET'],
    account_prefixes: ['69'],
    calculation_formula: 'income tax expense from class 69',
    auto_fields: [
      { key: 'income_tax', label_fr: 'Impot sur le resultat', label_en: 'Income tax', value: (ctx) => ctx.incomeStatement.income_tax_N },
      { key: 'net_result', label_fr: 'Resultat net', label_en: 'Net result', value: (ctx) => ctx.incomeStatement.net_result_N },
    ],
    manual_fields: [{ key: 'tax_reconciliation', label_fr: 'Rapprochement fiscal', label_en: 'Tax reconciliation' }],
    required_when: (ctx) => hasAnyValue(ctx, ['IMPOT_RESULTAT', 'RESULTAT_NET'], ['69']),
  },
  {
    note_number: 22,
    note_variant: '',
    title_fr: 'Tableau des flux de tresorerie',
    title_en: 'Cash flow statement',
    description_fr: 'Elements explicatifs des flux de tresorerie.',
    description_en: 'Supporting information for cash flow movements.',
    source_report_lines: ['TOTAL_TRES_ACTIF', 'TOTAL_TRES_PASSIF'],
    account_prefixes: ['5'],
    calculation_formula: 'treasury assets - treasury liabilities',
    auto_fields: [
      { key: 'closing_cash_assets', label_fr: 'Trésorerie actif', label_en: 'Treasury assets', value: (ctx) => ctx.actifN.total_treasury_assets_N },
      { key: 'closing_cash_liabilities', label_fr: 'Trésorerie passif', label_en: 'Treasury liabilities', value: (ctx) => ctx.passifN.total_treasury_liabilities_N },
    ],
    manual_fields: [{ key: 'movement_explanation', label_fr: 'Explication des mouvements', label_en: 'Movement explanation' }],
    required_when: (ctx) => hasAnyValue(ctx, ['TOTAL_TRES_ACTIF', 'TOTAL_TRES_PASSIF'], ['5']),
  },
  {
    note_number: 23,
    note_variant: '',
    title_fr: 'Engagements hors bilan',
    title_en: 'Off-balance sheet commitments',
    description_fr: 'Garanties, cautions, engagements recus et donnes.',
    description_en: 'Guarantees, sureties, commitments received and given.',
    source_report_lines: [],
    account_prefixes: ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    calculation_formula: 'manual with class 9 indicators when imported',
    auto_fields: [{ key: 'class9_balance', label_fr: 'Solde classe 9', label_en: 'Class 9 balance', value: (ctx) => sumByPrefix(ctx.accountsN, ['9']) }],
    manual_fields: [{ key: 'commitments_detail', label_fr: 'Detail des engagements', label_en: 'Commitments detail' }],
    required_when: (ctx) => sumByPrefix(ctx.accountsN, ['9']) !== 0,
  },
  {
    note_number: 24,
    note_variant: '',
    title_fr: 'Parties liees',
    title_en: 'Related parties',
    description_fr: 'Transactions et soldes avec parties liees.',
    description_en: 'Transactions and balances with related parties.',
    source_report_lines: ['ASSOCIES_CREANCES', 'ASSOCIES_DETTES'],
    account_prefixes: ['46'],
    calculation_formula: 'shareholder receivables/payables',
    auto_fields: [
      { key: 'receivables', label_fr: 'Creances associes', label_en: 'Shareholder receivables', value: (ctx) => lineValue(ctx, 'actif', 'ASSOCIES_CREANCES') },
      { key: 'payables', label_fr: 'Dettes associes', label_en: 'Shareholder payables', value: (ctx) => lineValue(ctx, 'passif', 'ASSOCIES_DETTES') },
    ],
    manual_fields: [{ key: 'related_party_detail', label_fr: 'Detail parties liees', label_en: 'Related party detail' }],
    required_when: (ctx) => hasAnyValue(ctx, ['ASSOCIES_CREANCES', 'ASSOCIES_DETTES'], ['46']),
  },
  {
    note_number: 25,
    note_variant: '',
    title_fr: 'Ecarts de conversion',
    title_en: 'Translation differences',
    description_fr: 'Ecarts de conversion actif et passif.',
    description_en: 'Translation differences in assets and liabilities.',
    source_report_lines: ['ECART_CONV_ACTIF', 'ECART_CONV_PASSIF'],
    account_prefixes: ['478', '479'],
    calculation_formula: 'conversion difference lines from 478/479',
    auto_fields: [
      { key: 'asset', label_fr: 'Ecart conversion actif', label_en: 'Asset translation difference', value: (ctx) => lineValue(ctx, 'actif', 'ECART_CONV_ACTIF') },
      { key: 'liability', label_fr: 'Ecart conversion passif', label_en: 'Liability translation difference', value: (ctx) => lineValue(ctx, 'passif', 'ECART_CONV_PASSIF') },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['ECART_CONV_ACTIF', 'ECART_CONV_PASSIF'], ['478', '479']),
  },
  {
    note_number: 26,
    note_variant: '',
    title_fr: 'Subventions',
    title_en: 'Grants',
    description_fr: 'Subventions d investissement et d exploitation.',
    description_en: 'Investment and operating grants.',
    source_report_lines: ['SUBV_INVEST'],
    account_prefixes: ['14', '74'],
    calculation_formula: 'subsidy accounts and passif lines',
    auto_fields: [
      { key: 'investment_grants', label_fr: 'Subventions investissement', label_en: 'Investment grants', value: (ctx) => lineValue(ctx, 'passif', 'SUBV_INVEST') },
      { key: 'operating_grants', label_fr: 'Subventions exploitation', label_en: 'Operating grants', value: (ctx) => sumByPrefix(ctx.accountsN, ['74']) },
    ],
    manual_fields: commonManualFields,
    required_when: (ctx) => hasAnyValue(ctx, ['SUBV_INVEST'], ['14', '74']),
  },
  {
    note_number: 27,
    note_variant: 'A',
    title_fr: 'Provisions reglementees',
    title_en: 'Regulated provisions',
    description_fr: 'Provisions reglementees constituees en application de textes legaux ou fiscaux.',
    description_en: 'Provisions established under legal or tax regulations.',
    source_report_lines: ['PROV_REGL'],
    account_prefixes: ['15'],
    calculation_formula: 'provision accounts class 15',
    auto_fields: [
      { key: 'regulated', label_fr: 'Provisions reglementees', label_en: 'Regulated provisions', value: (ctx) => lineValue(ctx, 'passif', 'PROV_REGL') },
    ],
    manual_fields: [{ key: 'detail', label_fr: 'Nature et justification', label_en: 'Nature and justification' }],
    required_when: (ctx) => hasAnyValue(ctx, ['PROV_REGL'], ['15']),
  },
  {
    note_number: 27,
    note_variant: 'B',
    title_fr: 'Provisions pour risques et charges',
    title_en: 'Provisions for risks and charges',
    description_fr: 'Provisions pour risques (litige, garantie) et charges futures.',
    description_en: 'Provisions for risks (litigation, warranties) and future charges.',
    source_report_lines: ['PROV_FIN'],
    account_prefixes: ['19', '49', '59'],
    calculation_formula: 'provision accounts class 19/49/59',
    auto_fields: [
      { key: 'financial', label_fr: 'Provisions financieres', label_en: 'Financial provisions', value: (ctx) => lineValue(ctx, 'passif', 'PROV_FIN') },
      { key: 'customer_prov', label_fr: 'Provisions clients (49)', label_en: 'Customer provisions (49)', value: (ctx) => sumByPrefix(ctx.accountsN, ['49']) },
      { key: 'treasury_prov', label_fr: 'Provisions tresorerie (59)', label_en: 'Treasury provisions (59)', value: (ctx) => sumByPrefix(ctx.accountsN, ['59']) },
    ],
    manual_fields: [{ key: 'risques_detail', label_fr: 'Detail des risques identifies', label_en: 'Identified risks detail' }],
    required_when: (ctx) => hasAnyValue(ctx, ['PROV_FIN'], ['19', '49', '59']),
  },
  {
    note_number: 28,
    note_variant: 'A',
    title_fr: 'Honoraires',
    title_en: 'Fees',
    description_fr: 'Honoraires et remunerations des commissaires aux comptes, experts et conseils.',
    description_en: 'Fees paid to statutory auditors, experts, and advisors.',
    source_report_lines: ['SERVICES_EXT'],
    account_prefixes: ['622', '623', '628'],
    calculation_formula: 'service expense accounts likely related to fees',
    auto_fields: [{ key: 'service_expenses', label_fr: 'Services exterieurs', label_en: 'External services', value: (ctx) => lineValue(ctx, 'income', 'SERVICES_EXT') }],
    manual_fields: [{ key: 'fees_detail', label_fr: 'Detail des honoraires', label_en: 'Fees detail' }],
    required_when: (ctx) => hasAnyValue(ctx, ['SERVICES_EXT'], ['622', '623', '628']),
  },
  {
    note_number: 28,
    note_variant: 'B',
    title_fr: 'Remuneration de la direction',
    title_en: 'Management remuneration',
    description_fr: 'Remunerations globales versees aux mandataires sociaux et membres de la direction.',
    description_en: 'Total remuneration paid to corporate officers and management.',
    source_report_lines: [],
    account_prefixes: ['665'],
    calculation_formula: 'manual — class 665 as indicator',
    auto_fields: [
      { key: 'remuneration_665', label_fr: 'Remunerations organes sociaux (665)', label_en: 'Corporate officers remuneration (665)', value: (ctx) => sumByPrefix(ctx.accountsN, ['665']) },
    ],
    manual_fields: [
      { key: 'direction_detail', label_fr: 'Remunerations par beneficiaire', label_en: 'Remuneration by recipient', required: true },
      { key: 'avantages', label_fr: 'Avantages en nature', label_en: 'Benefits in kind' },
    ],
    required_when: () => true,
  },
  {
    note_number: 28,
    note_variant: 'C',
    title_fr: 'Effectifs',
    title_en: 'Workforce',
    description_fr: 'Effectifs par categorie et masse salariale.',
    description_en: 'Headcount by category and payroll.',
    source_report_lines: ['CHARGES_PERS'],
    account_prefixes: ['66'],
    calculation_formula: 'class 66 debit positive',
    auto_fields: [
      { key: 'total_charges_pers', label_fr: 'Charges de personnel', label_en: 'Personnel expenses', value: (ctx) => lineValue(ctx, 'income', 'CHARGES_PERS') },
    ],
    manual_fields: [
      { key: 'cadres', label_fr: 'Effectif cadres', label_en: 'Management headcount' },
      { key: 'non_cadres', label_fr: 'Effectif non cadres', label_en: 'Non-management headcount' },
      { key: 'total_effectif', label_fr: 'Effectif total', label_en: 'Total headcount' },
    ],
    required_when: (ctx) => hasAnyValue(ctx, ['CHARGES_PERS'], ['66']),
  },
  {
    note_number: 29,
    note_variant: '',
    title_fr: 'Patente et licences',
    title_en: 'Business license and permits',
    description_fr: 'Patente, licences et taxes assimilees.',
    description_en: 'Business license, permits, and related taxes.',
    source_report_lines: ['IMPOTS_TAXES'],
    account_prefixes: ['64'],
    calculation_formula: 'tax expense accounts plus manual fiscal detail',
    auto_fields: [{ key: 'taxes', label_fr: 'Impots et taxes', label_en: 'Taxes and duties', value: (ctx) => lineValue(ctx, 'income', 'IMPOTS_TAXES') }],
    manual_fields: [{ key: 'patente_detail', label_fr: 'Detail patente', label_en: 'Business license detail' }],
    required_when: (ctx) => hasAnyValue(ctx, ['IMPOTS_TAXES'], ['64']),
  },
  {
    note_number: 30,
    note_variant: '',
    title_fr: 'Credit-bail et locations',
    title_en: 'Leases',
    description_fr: 'Credit-bail, locations et engagements associes.',
    description_en: 'Finance leases, rentals, and related commitments.',
    source_report_lines: ['SERVICES_EXT'],
    account_prefixes: ['62'],
    calculation_formula: 'external service lease indicators',
    auto_fields: [{ key: 'external_services', label_fr: 'Services exterieurs', label_en: 'External services', value: (ctx) => lineValue(ctx, 'income', 'SERVICES_EXT') }],
    manual_fields: [{ key: 'lease_detail', label_fr: 'Detail des contrats', label_en: 'Contract detail' }],
    required_when: (ctx) => sumByPrefix(ctx.accountsN, ['62']) !== 0,
  },
  {
    note_number: 31,
    note_variant: '',
    title_fr: 'Evenements posterieurs',
    title_en: 'Subsequent events',
    description_fr: 'Evenements significatifs intervenus apres la cloture.',
    description_en: 'Significant events after the reporting date.',
    source_report_lines: [],
    calculation_formula: 'manual disclosure',
    auto_fields: [],
    manual_fields: [{ key: 'events', label_fr: 'Evenements posterieurs', label_en: 'Subsequent events' }],
    required_when: () => false,
  },
  {
    note_number: 32,
    note_variant: '',
    title_fr: 'Continuites et incertitudes',
    title_en: 'Going concern and uncertainties',
    description_fr: 'Hypothese de continuite et incertitudes significatives.',
    description_en: 'Going concern assumption and significant uncertainties.',
    source_report_lines: ['RESULTAT_NET', 'TOTAL_ACTIF', 'TOTAL_PASSIF'],
    calculation_formula: 'manual disclosure supported by result and balance totals',
    auto_fields: [
      { key: 'net_result', label_fr: 'Resultat net', label_en: 'Net result', value: (ctx) => ctx.incomeStatement.net_result_N },
      { key: 'bilan_difference', label_fr: 'Ecart bilan', label_en: 'Balance sheet difference', value: (ctx) => ctx.actifN.total_actif_N - ctx.passifN.total_passif_N },
    ],
    manual_fields: [{ key: 'going_concern_assessment', label_fr: 'Analyse continuite', label_en: 'Going concern assessment' }],
    required_when: () => true,
  },
  {
    note_number: 33,
    note_variant: '',
    title_fr: 'Changements de methodes',
    title_en: 'Changes in accounting methods',
    description_fr: 'Changements de methodes, estimations ou corrections.',
    description_en: 'Changes in accounting policies, estimates, or corrections.',
    source_report_lines: [],
    calculation_formula: 'manual disclosure',
    auto_fields: [],
    manual_fields: [{ key: 'changes', label_fr: 'Changements constates', label_en: 'Changes identified' }],
    required_when: () => false,
  },
  {
    note_number: 34,
    note_variant: '',
    title_fr: 'Soldes intermediaires de gestion et analyse financiere',
    title_en: 'Intermediate management balances and financial analysis',
    description_fr: 'SIG (XB-XI), CAFG, structure financiere (FR/BFE/TN) et rentabilite. Valeur ajoutee approximative : exclut la separation marchandises/matieres et les reprises de provisions.',
    description_en: 'SIG (XB-XI), CAFG, financial structure (FR/BFE/TN) and profitability. Value added is approximate: excludes merchandise/material separation and provision reversals.',
    source_report_lines: ['RESULTAT_NET', 'RESULTAT_EXPLOITATION', 'RESULTAT_FINANCIER', 'RESULTAT_HAO'],
    account_prefixes: ['6', '7'],
    calculation_formula: 'auto from income statement, balance sheet totals and account-level data',
    auto_fields: [
      // ── SIG ──────────────────────────────────────────────────────────────────
      { key: 'sig_ca',  label_fr: 'SIG — Chiffre d affaires (XB)',             label_en: 'SIG — Turnover (XB)',                     value: (ctx) => ctx.incomeStatement.turnover_N },
      { key: 'sig_va',  label_fr: 'SIG — Valeur ajoutee (XC) approx.',         label_en: 'SIG — Value added (XC) approx.',          value: (ctx) => computeVA(ctx) },
      { key: 'sig_ebe', label_fr: 'SIG — Excedent brut d exploitation (XD)',   label_en: 'SIG — Gross operating surplus (XD)',      value: (ctx) => computeEBE(ctx) },
      { key: 'sig_re',  label_fr: 'SIG — Resultat d exploitation (XE)',        label_en: 'SIG — Operating result (XE)',             value: (ctx) => ctx.incomeStatement.operating_result_N },
      { key: 'sig_rf',  label_fr: 'SIG — Resultat financier (XF)',             label_en: 'SIG — Financial result (XF)',             value: (ctx) => ctx.incomeStatement.financial_result_N },
      { key: 'sig_rao', label_fr: 'SIG — Resultat activites ordinaires (XG)',  label_en: 'SIG — Ordinary activities result (XG)',   value: (ctx) => ctx.incomeStatement.ordinary_activities_result_N },
      { key: 'sig_hao', label_fr: 'SIG — Resultat HAO (XH)',                   label_en: 'SIG — Non-ordinary result (XH)',          value: (ctx) => ctx.incomeStatement.hao_result_N },
      { key: 'sig_rn',  label_fr: 'SIG — Resultat net (XI)',                   label_en: 'SIG — Net result (XI)',                   value: (ctx) => ctx.incomeStatement.net_result_N },
      // ── CAFG ─────────────────────────────────────────────────────────────────
      { key: 'cafg_vcn654',     label_fr: 'CAFG — VCN cessions immo (cpte 654)',           label_en: 'CAFG — Book value disposals (acct 654)',    value: (ctx) => sumByPrefix(ctx.accountsN, ['654']) },
      { key: 'cafg_prod754',    label_fr: 'CAFG — Produits cessions immo (cpte 754)',       label_en: 'CAFG — Disposal proceeds (acct 754)',       value: (ctx) => sumByPrefix(ctx.accountsN, ['754']) },
      { key: 'cafg_exploit',    label_fr: 'CAFG exploitation',                              label_en: 'Operating CAFG',                           value: (ctx) => { const vcn = sumByPrefix(ctx.accountsN, ['654']); const prod = sumByPrefix(ctx.accountsN, ['754']); return computeEBE(ctx) + vcn + prod; } },
      { key: 'cafg_rev_fin',    label_fr: 'CAFG — Revenus financiers',                      label_en: 'CAFG — Financial income',                  value: (ctx) => ctx.incomeStatement.financial_income_N },
      { key: 'cafg_ch_fin',     label_fr: 'CAFG — Frais financiers (negatif)',              label_en: 'CAFG — Financial expenses (negative)',      value: (ctx) => -ctx.incomeStatement.financial_expenses_N },
      { key: 'cafg_prod_hao',   label_fr: 'CAFG — Produits HAO',                           label_en: 'CAFG — Non-ordinary income',               value: (ctx) => ctx.incomeStatement.hao_income_N },
      { key: 'cafg_ch_hao',     label_fr: 'CAFG — Charges HAO (negatif)',                  label_en: 'CAFG — Charges HAO (negative)',             value: (ctx) => -ctx.incomeStatement.hao_expenses_N },
      { key: 'cafg_impot',      label_fr: 'CAFG — Impots sur resultats (negatif)',          label_en: 'CAFG — Income tax (negative)',              value: (ctx) => -ctx.incomeStatement.income_tax_N },
      { key: 'cafg_total',      label_fr: 'CAFG total (hors participations/changes)',       label_en: 'CAFG total (excl. profit-sharing/FX)',      value: (ctx) => { const vcn = sumByPrefix(ctx.accountsN, ['654']); const prod = sumByPrefix(ctx.accountsN, ['754']); const cExploit = computeEBE(ctx) + vcn + prod; return cExploit + ctx.incomeStatement.financial_income_N - ctx.incomeStatement.financial_expenses_N + ctx.incomeStatement.hao_income_N - ctx.incomeStatement.hao_expenses_N - ctx.incomeStatement.income_tax_N; } },
      { key: 'cafg_dividendes', label_fr: 'CAFG — Dividendes verses (TFT ligne JD)',        label_en: 'CAFG — Dividends paid (CF line JD)',         value: (ctx) => { const jd = ctx.cashFlow?.lines.find((l) => l.line_code === 'JD')?.value_N ?? 0; return jd; } },
      { key: 'cafg_autofinancement', label_fr: 'Autofinancement (CAFG + Dividendes JD)',    label_en: 'Self-financing (CAFG + Dividends JD)',        value: (ctx) => { const vcn = sumByPrefix(ctx.accountsN, ['654']); const prod = sumByPrefix(ctx.accountsN, ['754']); const cafg = computeEBE(ctx) + vcn + prod + ctx.incomeStatement.financial_income_N - ctx.incomeStatement.financial_expenses_N + ctx.incomeStatement.hao_income_N - ctx.incomeStatement.hao_expenses_N - ctx.incomeStatement.income_tax_N; const jd = ctx.cashFlow?.lines.find((l) => l.line_code === 'JD')?.value_N ?? 0; return cafg + jd; } },
      // ── Structure financiere ───────────────────────────────────────────────
      { key: 'struct_cp',     label_fr: 'Structure — Capitaux propres',              label_en: 'Structure — Equity',                     value: (ctx) => ctx.passifN.total_equity_N },
      { key: 'struct_df',     label_fr: 'Structure — Dettes financieres',            label_en: 'Structure — Financial debts',             value: (ctx) => ctx.passifN.total_financial_debts_N },
      { key: 'struct_rs',     label_fr: 'Structure — Ressources stables',            label_en: 'Structure — Stable resources',            value: (ctx) => ctx.passifN.total_equity_N + ctx.passifN.total_financial_debts_N },
      { key: 'struct_ai',     label_fr: 'Structure — Actif immobilise',              label_en: 'Structure — Fixed assets',                value: (ctx) => ctx.actifN.total_fixed_assets_N },
      { key: 'struct_fr',     label_fr: 'Structure — Fonds de roulement (FR)',       label_en: 'Structure — Working capital (FR)',         value: (ctx) => (ctx.passifN.total_equity_N + ctx.passifN.total_financial_debts_N) - ctx.actifN.total_fixed_assets_N },
      { key: 'struct_ac',     label_fr: 'Structure — Actif circulant exploitation',  label_en: 'Structure — Current assets (operating)',   value: (ctx) => ctx.actifN.total_current_assets_N },
      { key: 'struct_pc',     label_fr: 'Structure — Passif circulant exploitation', label_en: 'Structure — Current liabilities (operating)', value: (ctx) => ctx.passifN.total_current_liabilities_N },
      { key: 'struct_bfe',    label_fr: 'Structure — BFE (Besoin fin. exploitation)', label_en: 'Structure — Operating working capital need', value: (ctx) => ctx.actifN.total_current_assets_N - ctx.passifN.total_current_liabilities_N },
      { key: 'struct_bfg',    label_fr: 'Structure — BFG = BFE + BF HAO',            label_en: 'Structure — Total WCN = BFE + HAO WCN',    value: (ctx) => ctx.actifN.total_current_assets_N - ctx.passifN.total_current_liabilities_N },
      { key: 'struct_tn',     label_fr: 'Structure — Tresorerie nette (FR - BFG)',   label_en: 'Structure — Net treasury (FR - WCN)',      value: (ctx) => { const fr = (ctx.passifN.total_equity_N + ctx.passifN.total_financial_debts_N) - ctx.actifN.total_fixed_assets_N; const bfe = ctx.actifN.total_current_assets_N - ctx.passifN.total_current_liabilities_N; return fr - bfe; } },
      { key: 'struct_tn_ctrl',label_fr: 'Structure — TN controle (Tres.actif - Tres.passif)', label_en: 'Structure — Net treasury check (BT-DT)', value: (ctx) => ctx.actifN.total_treasury_assets_N - ctx.passifN.total_treasury_liabilities_N },
      { key: 'struct_tn_diff',label_fr: 'Structure — Ecart TN (doit etre 0)',        label_en: 'Structure — TN discrepancy (must be 0)',   value: (ctx) => { const fr = (ctx.passifN.total_equity_N + ctx.passifN.total_financial_debts_N) - ctx.actifN.total_fixed_assets_N; const bfe = ctx.actifN.total_current_assets_N - ctx.passifN.total_current_liabilities_N; const tn = fr - bfe; const tnCtrl = ctx.actifN.total_treasury_assets_N - ctx.passifN.total_treasury_liabilities_N; return tn - tnCtrl; } },
      { key: 'struct_efb',    label_fr: 'Structure — Endettement financier brut (DF + Tres.passif)', label_en: 'Structure — Gross financial debt (FD + Cash liabs)', value: (ctx) => ctx.passifN.total_financial_debts_N + ctx.passifN.total_treasury_liabilities_N },
      { key: 'struct_efn',    label_fr: 'Structure — Endettement financier net (EFB - Tres.actif)',  label_en: 'Structure — Net financial debt (GFD - Cash assets)',  value: (ctx) => (ctx.passifN.total_financial_debts_N + ctx.passifN.total_treasury_liabilities_N) - ctx.actifN.total_treasury_assets_N },
      // ── Rentabilite ────────────────────────────────────────────────────────
      { key: 'rent_eco', label_fr: 'Rentabilite economique (XE / (CP+DF))',   label_en: 'Economic return (XE / (Equity+Debts))',  value: (ctx) => pct(ctx.incomeStatement.operating_result_N, ctx.passifN.total_equity_N + ctx.passifN.total_financial_debts_N) },
      { key: 'rent_fin', label_fr: 'Rentabilite financiere (XI / CP)',         label_en: 'Financial return (XI / Equity)',          value: (ctx) => pct(ctx.incomeStatement.net_result_N, ctx.passifN.total_equity_N) },
      // ── Variation tresorerie (from cash flow statement) ───────────────────
      { key: 'flux_op',  label_fr: 'Flux operationnels (ZB)',                  label_en: 'Operating cash flows (ZB)',               value: (ctx) => ctx.cashFlow?.operating_cash_flow ?? null },
      { key: 'flux_inv', label_fr: 'Flux investissement (ZC)',                 label_en: 'Investment cash flows (ZC)',              value: (ctx) => ctx.cashFlow?.investing_cash_flow ?? null },
      { key: 'flux_fin_cf', label_fr: 'Flux financement (ZF)',                 label_en: 'Financing cash flows (ZF)',               value: (ctx) => ctx.cashFlow?.financing_cash_flow ?? null },
      { key: 'flux_var', label_fr: 'Variation tresorerie nette (ZG)',          label_en: 'Net treasury variation (ZG)',             value: (ctx) => ctx.cashFlow?.net_cash_variation ?? null },
    ],
    manual_fields: [
      { key: 'marge_commerciale', label_fr: 'Marge commerciale (XA) — a saisir (separation 601/701 requise)', label_en: 'Gross margin (XA) — enter manually (601/701 split required)' },
      { key: 'participations',    label_fr: 'Participations des salaries (si hors classe 66)', label_en: 'Employee profit-sharing (if outside class 66)' },
      { key: 'bf_hao',           label_fr: 'BF HAO specifique (si actif/passif HAO separes)', label_en: 'HAO WCN (if HAO assets/liabilities are separated)' },
    ],
    required_when: () => true,
  },
  {
    note_number: 35,
    note_variant: '',
    title_fr: 'Informations fiscales complementaires',
    title_en: 'Additional tax information',
    description_fr: 'Elements necessaires aux declarations fiscales.',
    description_en: 'Information needed for tax declarations.',
    source_report_lines: ['RESULTAT_NET', 'IMPOT_RESULTAT'],
    account_prefixes: ['64', '69'],
    calculation_formula: 'income tax and accounting result anchors',
    auto_fields: [
      { key: 'net_result', label_fr: 'Resultat comptable', label_en: 'Accounting result', value: (ctx) => ctx.incomeStatement.net_result_N },
      { key: 'income_tax', label_fr: 'Impot resultat', label_en: 'Income tax', value: (ctx) => ctx.incomeStatement.income_tax_N },
    ],
    manual_fields: [{ key: 'tax_disclosures', label_fr: 'Informations fiscales', label_en: 'Tax disclosures' }],
    required_when: () => true,
  },
  {
    note_number: 36,
    note_variant: '',
    title_fr: 'Tableau de codes et autres informations',
    title_en: 'Code table and other information',
    description_fr: 'Codes activite, informations complementaires et controles de coherence.',
    description_en: 'Activity codes, additional information, and consistency checks.',
    source_report_lines: [],
    calculation_formula: 'manual metadata and activity code disclosure',
    auto_fields: [
      { key: 'imported_account_count', label_fr: 'Nombre de comptes importes', label_en: 'Imported account count', value: (ctx) => ctx.accountsN.length },
      { key: 'source_account_count', label_fr: 'Comptes sources avec solde', label_en: 'Source accounts with balance', value: (ctx) => ctx.accountsN.filter((account) => account.net_balance !== 0).length },
    ],
    manual_fields: [
      { key: 'activity_code', label_fr: 'Code activite', label_en: 'Activity code' },
      { key: 'other_information', label_fr: 'Autres informations', label_en: 'Other information' },
    ],
    required_when: () => true,
  },
];

export function buildNotesAnnexes(ctx: NotesContext, manualOverrides: ManualOverrides = {}): NoteAnnexe[] {
  return NOTE_DEFINITIONS.map((definition) => {
    const isRequired = definition.required_when(ctx);
    const sourceAccounts = accountNumbersByPrefix(ctx.accountsN, definition.account_prefixes);
    const autoFields = definition.auto_fields.map((field) =>
      makeAuto(field.key, field.label_fr, field.label_en, field.value(ctx)),
    );
    const manualFields = definition.manual_fields.map((field) =>
      makeManual(field.key, field.label_fr, field.label_en, Boolean(field.required) || isRequired),
    );
    const fields = [...autoFields, ...manualFields];
    applyManualOverrides(definition.note_number, definition.note_variant, fields, manualOverrides);
    const status = computeStatus(fields, isRequired);

    return {
      note_number: definition.note_number,
      note_variant: definition.note_variant,
      title_fr: definition.title_fr,
      title_en: definition.title_en,
      description_fr: definition.description_fr,
      description_en: definition.description_en,
      source_accounts: sourceAccounts,
      source_report_lines: definition.source_report_lines,
      calculation_formula: definition.calculation_formula,
      fields,
      required_fields: fields.filter((field) => field.required).map((field) => field.key),
      is_required: isRequired,
      status,
      validation_result: status === 'notStarted' || status === 'toComplete' ? 'incomplete' : 'ok',
    };
  });
}
