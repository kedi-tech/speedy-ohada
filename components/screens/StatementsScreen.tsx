'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useEngine } from '@/context/EngineContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import type { BilanRow, IncomeRow } from '@/lib/types';
import type { ActifReport } from '@/lib/engine/ActifEngine';
import type { PassifReport } from '@/lib/engine/PassifEngine';
import type { IncomeStatementReport } from '@/lib/engine/IncomeStatementEngine';
import type { CashFlowReport } from '@/lib/engine/CashFlowEngine';
import type { ReportLine } from '@/lib/engine/types';
import type { NoteAnnexe } from '@/lib/engine/NotesAnnexesEngine';
import { formatAmount, type CurrencyCode } from '@/lib/format';

type Tab = 'bilan' | 'cr' | 'cashflow' | 'notes';

const TABS: { key: Tab; fr: string; en: string }[] = [
  { key: 'bilan',    fr: 'Bilan',               en: 'Balance Sheet' },
  { key: 'cr',       fr: 'Compte de résultat',  en: 'Income Statement' },
  { key: 'cashflow', fr: 'Tableau de flux',      en: 'Cash Flow' },
  { key: 'notes',    fr: 'Annexes',              en: 'Notes' },
];


// ── Adapters ────────────────────────────────────────────────────────────────

function lv(lines: ReportLine[], code: string): number {
  return lines.find((l) => l.line_code === code)?.value_N ?? 0;
}
function lv1(lines: ReportLine[], code: string): number | undefined {
  const v = lines.find((l) => l.line_code === code)?.value_N_1;
  return v != null ? v : undefined;
}
function orU(v: number | null | undefined): number | undefined {
  return v != null ? v : undefined;
}

function buildActifRows(actif: ActifReport): BilanRow[] {
  const L = actif.lines;
  const vN  = (c: string) => lv(L, c);
  const vN1 = (c: string) => lv1(L, c);

  const deprFixed    = vN('IMMO_INC_DEPR') + vN('IMMO_CORP_DEPR') + vN('IMMO_FIN_PROV');
  const grossFixed   = vN('IMMO_INC_GROSS') + vN('IMMO_CORP_GROSS') + vN('IMMO_FIN_GROSS');
  const deprCurrent  = vN('STOCKS_PROV') + vN('CREANCES_CLIENTS_PROV');
  const grossCurrent = vN('STOCKS') + vN('CREANCES_CLIENTS') + vN('AUTRES_CREANCES');

  return [
    { sec: true, fr: 'ACTIF IMMOBILISÉ', en: 'FIXED ASSETS' },
    { fr: 'Immobilisations incorporelles', en: 'Intangible assets',
      gross: vN('IMMO_INC_GROSS'), depr: vN('IMMO_INC_DEPR') || undefined,
      net: vN('TOTAL_IMMO_INC'), netN1: vN1('TOTAL_IMMO_INC') },
    { fr: 'Immobilisations corporelles', en: 'Tangible fixed assets',
      gross: vN('IMMO_CORP_GROSS'), depr: vN('IMMO_CORP_DEPR') || undefined,
      net: vN('TOTAL_IMMO_CORP'), netN1: vN1('TOTAL_IMMO_CORP') },
    { fr: 'Immobilisations financières', en: 'Financial assets',
      gross: vN('IMMO_FIN_GROSS'), depr: vN('IMMO_FIN_PROV') || undefined,
      net: vN('TOTAL_IMMO_FIN'), netN1: vN1('TOTAL_IMMO_FIN') },
    { sub: true, fr: 'Total actif immobilisé', en: 'Total fixed assets',
      gross: grossFixed, depr: deprFixed || undefined,
      net: actif.total_fixed_assets_N, netN1: orU(actif.total_fixed_assets_N1) },
    { sec: true, fr: 'ACTIF CIRCULANT', en: 'CURRENT ASSETS' },
    { fr: 'Stocks et en-cours', en: 'Inventories',
      gross: vN('STOCKS'), depr: vN('STOCKS_PROV') || undefined,
      net: vN('STOCKS_NET'), netN1: vN1('STOCKS_NET') },
    { fr: 'Créances clients', en: 'Customer receivables',
      gross: vN('CREANCES_CLIENTS'), depr: vN('CREANCES_CLIENTS_PROV') || undefined,
      net: vN('CREANCES_CLIENTS_NET'), netN1: vN1('CREANCES_CLIENTS_NET') },
    { fr: 'Autres créances', en: 'Other receivables',
      gross: vN('AUTRES_CREANCES'), net: vN('AUTRES_CREANCES'), netN1: vN1('AUTRES_CREANCES') },
    { sub: true, fr: 'Total actif circulant', en: 'Total current assets',
      gross: grossCurrent, depr: deprCurrent || undefined,
      net: actif.total_current_assets_N, netN1: orU(actif.total_current_assets_N1) },
    { sec: true, fr: 'TRÉSORERIE-ACTIF', en: 'TREASURY ASSETS' },
    { fr: 'Banques', en: 'Banks',
      gross: vN('BANQUES_ACTIF'), net: vN('BANQUES_ACTIF'), netN1: vN1('BANQUES_ACTIF') },
    { fr: 'Caisse', en: 'Cash on hand',
      gross: vN('CAISSE_ACTIF'), net: vN('CAISSE_ACTIF'), netN1: vN1('CAISSE_ACTIF') },
    { fr: 'Titres de placement', en: 'Short-term investments',
      gross: vN('TITRES_PLACEMENT'), net: vN('TITRES_PLACEMENT'), netN1: vN1('TITRES_PLACEMENT') },
    { sub: true, fr: 'Total trésorerie-actif', en: 'Total treasury assets',
      gross: actif.total_treasury_assets_N, net: actif.total_treasury_assets_N,
      netN1: orU(actif.total_treasury_assets_N1) },
    { tot: true, fr: 'TOTAL ACTIF', en: 'TOTAL ASSETS',
      gross: grossFixed + grossCurrent + actif.total_treasury_assets_N,
      depr: (deprFixed + deprCurrent) || undefined,
      net: actif.total_actif_N, netN1: orU(actif.total_actif_N1) },
  ];
}

function buildPassifRows(passif: PassifReport): BilanRow[] {
  const L = passif.lines;
  const vN  = (c: string) => lv(L, c);
  const vN1 = (c: string) => lv1(L, c);

  return [
    { sec: true, fr: 'CAPITAUX PROPRES', en: 'EQUITY' },
    { fr: 'Capital', en: 'Share capital', n: vN('CAPITAL'), netN1: vN1('CAPITAL') },
    { fr: 'Réserves', en: 'Reserves', n: vN('RESERVES'), netN1: vN1('RESERVES') },
    { fr: 'Report à nouveau', en: 'Retained earnings', n: vN('REPORT_NOUVEAU'), netN1: vN1('REPORT_NOUVEAU') },
    { fr: "Résultat net de l'exercice", en: 'Net result for the year',
      n: vN('RESULTAT_NET_BILAN'), netN1: vN1('RESULTAT_NET_BILAN'), hl: true },
    { fr: "Subventions d'investissement", en: 'Investment grants',
      n: vN('SUBV_INVEST'), netN1: vN1('SUBV_INVEST') },
    { fr: 'Provisions réglementées', en: 'Regulated provisions',
      n: vN('PROV_REGL'), netN1: vN1('PROV_REGL') },
    { sub: true, fr: 'Total capitaux propres', en: 'Total equity',
      n: vN('TOTAL_CP'), netN1: orU(passif.total_equity_N1) },
    { sec: true, fr: 'DETTES FINANCIÈRES', en: 'FINANCIAL DEBTS' },
    { fr: 'Emprunts et dettes financières', en: 'Loans and financial debts',
      n: vN('EMPRUNTS'), netN1: vN1('EMPRUNTS') },
    { fr: 'Provisions financières', en: 'Financial provisions',
      n: vN('PROV_FIN'), netN1: vN1('PROV_FIN') },
    { sub: true, fr: 'Total dettes financières', en: 'Total financial debts',
      n: vN('TOTAL_DETTES_FIN'), netN1: orU(passif.total_financial_debts_N1) },
    { sec: true, fr: 'PASSIF CIRCULANT', en: 'CURRENT LIABILITIES' },
    { fr: 'Fournisseurs', en: 'Suppliers', n: vN('FOURNISSEURS'), netN1: vN1('FOURNISSEURS') },
    { fr: 'Dettes fiscales', en: 'Tax liabilities', n: vN('DETTES_FISCALES'), netN1: vN1('DETTES_FISCALES') },
    { fr: 'Dettes sociales', en: 'Social liabilities', n: vN('DETTES_SOCIALES'), netN1: vN1('DETTES_SOCIALES') },
    { fr: 'Autres dettes', en: 'Other liabilities', n: vN('AUTRES_DETTES'), netN1: vN1('AUTRES_DETTES') },
    { sub: true, fr: 'Total passif circulant', en: 'Total current liabilities',
      n: vN('TOTAL_PASSIF_CIRC'), netN1: orU(passif.total_current_liabilities_N1) },
    { sec: true, fr: 'TRÉSORERIE-PASSIF', en: 'TREASURY LIABILITIES' },
    { fr: 'Banques, crédits de trésorerie', en: 'Bank overdrafts',
      n: vN('BANQUES_CREDIT'), netN1: vN1('BANQUES_CREDIT') },
    { sub: true, fr: 'Total trésorerie-passif', en: 'Total treasury liabilities',
      n: vN('TOTAL_TRES_PASSIF'), netN1: orU(passif.total_treasury_liabilities_N1) },
    { tot: true, fr: 'TOTAL PASSIF', en: 'TOTAL LIABILITIES & EQUITY',
      n: passif.total_passif_N, netN1: orU(passif.total_passif_N1) },
  ];
}

function buildIncomeRows(is: IncomeStatementReport): IncomeRow[] {
  const L = is.lines;
  const vN  = (c: string) => lv(L, c);
  const vN1 = (c: string) => lv1(L, c);
  const rows: IncomeRow[] = [];

  rows.push({ sec: true, fr: "PRODUITS D'EXPLOITATION", en: 'OPERATING REVENUE' });
  rows.push({ fr: "Chiffre d'affaires", en: 'Turnover', n: vN('CHIFFRE_AFFAIRES'), netN1: vN1('CHIFFRE_AFFAIRES') });
  if (vN('PROD_STOCKEE')) rows.push({ fr: 'Production stockée', en: 'Change in inventories', n: vN('PROD_STOCKEE'), netN1: vN1('PROD_STOCKEE') });
  if (vN('PROD_IMMO')) rows.push({ fr: 'Production immobilisée', en: 'Capitalized production', n: vN('PROD_IMMO'), netN1: vN1('PROD_IMMO') });
  if (vN('AUTRES_PROD_EXPLOIT')) rows.push({ fr: "Autres produits d'exploitation", en: 'Other operating income', n: vN('AUTRES_PROD_EXPLOIT'), netN1: vN1('AUTRES_PROD_EXPLOIT') });
  if (vN('REPRISES_PROV')) rows.push({ fr: 'Reprises de provisions', en: 'Reversals of provisions', n: vN('REPRISES_PROV'), netN1: vN1('REPRISES_PROV') });
  rows.push({ sub: true, fr: "Total produits d'exploitation", en: 'Total operating revenue',
    n: is.total_operating_income_N, netN1: is.total_operating_income_N1 ?? undefined });

  rows.push({ sec: true, fr: "CHARGES D'EXPLOITATION", en: 'OPERATING EXPENSES' });
  if (vN('ACHATS')) rows.push({ fr: 'Achats', en: 'Purchases', n: vN('ACHATS'), netN1: vN1('ACHATS'), neg: true });
  if (vN('SERVICES_EXT')) rows.push({ fr: 'Services extérieurs', en: 'External services', n: vN('SERVICES_EXT'), netN1: vN1('SERVICES_EXT'), neg: true });
  if (vN('IMPOTS_TAXES')) rows.push({ fr: 'Impôts et taxes', en: 'Taxes', n: vN('IMPOTS_TAXES'), netN1: vN1('IMPOTS_TAXES'), neg: true });
  if (vN('CHARGES_PERS')) rows.push({ fr: 'Charges de personnel', en: 'Personnel expenses', n: vN('CHARGES_PERS'), netN1: vN1('CHARGES_PERS'), neg: true });
  if (vN('AUTRES_CHARGES_EXPLOIT')) rows.push({ fr: "Autres charges d'exploitation", en: 'Other expenses', n: vN('AUTRES_CHARGES_EXPLOIT'), netN1: vN1('AUTRES_CHARGES_EXPLOIT'), neg: true });
  if (vN('DOTATIONS_AMORT')) rows.push({ fr: 'Dotations aux amortissements', en: 'Depreciation', n: vN('DOTATIONS_AMORT'), netN1: vN1('DOTATIONS_AMORT'), neg: true });
  rows.push({ sub: true, fr: "Total charges d'exploitation", en: 'Total operating expenses',
    n: is.total_operating_expenses_N, netN1: is.total_operating_expenses_N1 ?? undefined, neg: true });

  rows.push({ hl: true, fr: "Résultat d'exploitation", en: 'Operating result',
    n: is.operating_result_N, netN1: is.operating_result_N1 ?? undefined });

  rows.push({ sec: true, fr: 'RÉSULTAT FINANCIER', en: 'FINANCIAL RESULT' });
  if (vN('PROD_FIN')) rows.push({ fr: 'Produits financiers', en: 'Financial income', n: vN('PROD_FIN'), netN1: vN1('PROD_FIN') });
  if (vN('CHARGES_FIN')) rows.push({ fr: 'Charges financières', en: 'Financial expenses', n: vN('CHARGES_FIN'), netN1: vN1('CHARGES_FIN'), neg: true });
  rows.push({ hl: true, fr: 'Résultat financier', en: 'Financial result', n: is.financial_result_N });
  rows.push({ hl: true, fr: 'Résultat avant impôts', en: 'Result before tax', n: is.ordinary_activities_result_N });

  if (vN('PROD_HAO') || vN('CHARGES_HAO')) {
    rows.push({ sec: true, fr: 'RÉSULTAT HAO', en: 'NON-ORDINARY RESULT' });
    if (vN('PROD_HAO')) rows.push({ fr: 'Produits HAO', en: 'Non-ordinary income', n: vN('PROD_HAO'), netN1: vN1('PROD_HAO') });
    if (vN('CHARGES_HAO')) rows.push({ fr: 'Charges HAO', en: 'Non-ordinary expenses', n: vN('CHARGES_HAO'), netN1: vN1('CHARGES_HAO'), neg: true });
    rows.push({ hl: true, fr: 'Résultat HAO', en: 'Non-ordinary result', n: is.hao_result_N });
  }

  if (vN('IMPOT_RESULTAT')) rows.push({ fr: "Impôts sur le résultat", en: 'Income tax', n: vN('IMPOT_RESULTAT'), netN1: vN1('IMPOT_RESULTAT'), neg: true });
  rows.push({ tot: true, fr: 'RÉSULTAT NET', en: 'NET RESULT', n: is.net_result_N, netN1: is.net_result_N1 ?? undefined });
  return rows;
}

type CFRow = { sec?: boolean; sub?: boolean; tot?: boolean; fr: string; en: string; n?: number };

function buildCashFlowRows(cf: CashFlowReport): CFRow[] {
  const L = cf.lines;
  const v = (c: string): number | undefined => {
    const val = L.find((l) => l.line_code === c)?.value_N;
    return val != null ? val : undefined;
  };
  return [
    { fr: "Trésorerie à l'ouverture", en: 'Opening cash', n: v('TRESORERIE_OUVERTURE') },
    { sec: true, fr: "FLUX DE L'ACTIVITÉ", en: 'OPERATING ACTIVITIES' },
    { fr: 'Résultat net', en: 'Net result', n: v('RESULTAT_NET_CF') },
    { fr: 'Dotations aux amortissements', en: 'Depreciation', n: v('DOTATIONS_AMORT_CF') },
    { fr: 'Variation des stocks', en: 'Change in inventories', n: v('VAR_STOCKS') },
    { fr: "Variation des créances", en: 'Change in receivables', n: v('VAR_CREANCES') },
    { fr: 'Variation des dettes', en: 'Change in payables', n: v('VAR_DETTES') },
    { sub: true, fr: "Flux net de l'activité", en: 'Net operating cash flow', n: v('FLUX_EXPLOITATION') },
    { sec: true, fr: "FLUX D'INVESTISSEMENT", en: 'INVESTING ACTIVITIES' },
    { fr: "Acquisitions d'immobilisations", en: 'Capital expenditure', n: v('ACQ_IMMO') },
    { fr: "Cessions d'immobilisations", en: 'Asset disposals', n: v('CESSIONS_IMMO') },
    { sub: true, fr: "Flux net d'investissement", en: 'Net investing cash flow', n: v('FLUX_INVESTISSEMENT') },
    { sec: true, fr: 'FLUX DE FINANCEMENT', en: 'FINANCING ACTIVITIES' },
    { fr: "Remboursements d'emprunts", en: 'Loan repayments', n: v('REMBOURS_EMPRUNTS') },
    { fr: 'Dividendes versés', en: 'Dividends paid', n: v('DIVIDENDES') },
    { sub: true, fr: 'Flux net de financement', en: 'Net financing cash flow', n: v('FLUX_FINANCEMENT') },
    { tot: true, fr: 'VARIATION DE TRÉSORERIE NETTE', en: 'NET CHANGE IN CASH', n: v('VAR_NETTE_TRESORERIE') },
    { fr: "Trésorerie à l'ouverture", en: 'Opening cash', n: v('TRESORERIE_OUVERTURE') },
    { tot: true, fr: 'TRÉSORERIE À LA CLÔTURE', en: 'CLOSING CASH', n: v('TRESORERIE_CLOTURE') },
  ];
}

// ── Table components ────────────────────────────────────────────────────────

function BilanTable({ rows, lang, side, currency }: { rows: BilanRow[]; lang: string; side: 'actif' | 'passif'; currency: string }) {
  const isActif = side === 'actif';
  const fmtAmt = (n: number | undefined) => formatAmount(n, (currency || 'GNF') as CurrencyCode);
  const headers = isActif
    ? [lang === 'fr' ? 'Poste' : 'Line item', lang === 'fr' ? 'Brut' : 'Gross', lang === 'fr' ? 'Amort./Dép.' : 'Deprec.', 'Net N', 'Net N-1']
    : [lang === 'fr' ? 'Poste' : 'Line item', 'N', 'N-1'];

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-bg border-b border-line">
          {headers.map((h, i) => (
            <th key={i} className={`py-2.5 text-[11px] font-semibold text-muted uppercase tracking-[.06em] ${i === 0 ? 'px-5 text-left' : 'px-4 text-right'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          if (row.sec) {
            return (
              <tr key={i} className="bg-bg-2">
                <td colSpan={isActif ? 5 : 3} className="px-5 py-2 text-[11px] font-bold text-muted uppercase tracking-[.08em]">
                  {lang === 'fr' ? row.fr : row.en}
                </td>
              </tr>
            );
          }
          const isTotal = row.tot;
          const isSub = row.sub;
          const isHl = row.hl;
          const rowClass = isTotal ? 'bg-bg border-t-2 border-line' : isSub ? 'bg-bg/50 border-t border-line-2' : 'hover:bg-bg transition-colors';
          const textClass = isTotal ? 'text-[13px] font-bold text-ink' : isSub ? 'text-[12.5px] font-semibold text-ink-2' : isHl ? 'text-[12.5px] font-semibold text-rust-2' : 'text-[12.5px] text-ink-2';
          return (
            <tr key={i} className={rowClass} style={{ borderBottom: i < rows.length - 1 && !isTotal ? '1px solid var(--color-line-2)' : 'none' }}>
              <td className={`px-5 py-2.5 ${textClass} ${isSub || isTotal ? 'pl-5' : 'pl-8'}`}>{lang === 'fr' ? row.fr : row.en}</td>
              {isActif ? (
                <>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${textClass}`}>{fmtAmt(row.gross)}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${row.depr ? 'text-red/70' : textClass}`}>{row.depr ? `(${fmtAmt(row.depr)})` : '—'}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${textClass} font-semibold`}>{fmtAmt(row.net)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{fmtAmt(row.netN1)}</td>
                </>
              ) : (
                <>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${textClass} font-semibold`}>{fmtAmt(row.n)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{fmtAmt(row.netN1)}</td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function IncomeTable({ rows, lang, currency }: { rows: IncomeRow[]; lang: string; currency: string }) {
  const fmtAmt = (n: number | undefined) => formatAmount(n, (currency || 'GNF') as CurrencyCode);
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-bg border-b border-line">
          {[lang === 'fr' ? 'Rubrique' : 'Line item', 'N', 'N-1', lang === 'fr' ? 'Variation' : 'Change'].map((h, i) => (
            <th key={i} className={`py-2.5 text-[11px] font-semibold text-muted uppercase tracking-[.06em] ${i === 0 ? 'px-5 text-left' : 'px-4 text-right'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          if (row.sec) {
            return (
              <tr key={i} className="bg-bg-2">
                <td colSpan={4} className="px-5 py-2 text-[11px] font-bold text-muted uppercase tracking-[.08em]">{lang === 'fr' ? row.fr : row.en}</td>
              </tr>
            );
          }
          const isTotal = row.tot;
          const isSub = row.sub;
          const isHl = row.hl;
          const rowClass = isTotal ? 'bg-bg border-t-2 border-line' : isSub ? 'bg-bg/50 border-t border-line-2' : 'hover:bg-bg transition-colors';
          const textClass = isTotal ? 'text-[13px] font-bold text-ink' : isSub ? 'text-[12.5px] font-semibold text-ink-2' : isHl ? 'text-[12.5px] font-semibold text-rust-2' : 'text-[12.5px] text-ink-2';
          const variation = row.n !== undefined && row.netN1 !== undefined && row.netN1 !== 0
            ? Math.round(((row.n - row.netN1) / Math.abs(row.netN1)) * 100) : null;
          return (
            <tr key={i} className={rowClass} style={{ borderBottom: i < rows.length - 1 && !isTotal ? '1px solid var(--color-line-2)' : 'none' }}>
              <td className={`px-5 py-2.5 ${textClass} ${isSub || isTotal || isHl ? 'pl-5' : 'pl-8'}`}>{lang === 'fr' ? row.fr : row.en}</td>
              <td className={`px-4 py-2.5 text-right tabular-nums ${textClass} font-semibold`}>
                {row.neg && row.n ? `(${fmtAmt(Math.abs(row.n ?? 0))})` : fmtAmt(row.n)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                {row.neg && row.netN1 ? `(${fmtAmt(Math.abs(row.netN1 ?? 0))})` : fmtAmt(row.netN1)}
              </td>
              <td className="px-4 py-2.5 text-right">
                {variation !== null ? (
                  <span className={`text-[11.5px] font-semibold tabular-nums ${variation >= 0 ? 'text-green' : 'text-red'}`}>
                    {variation >= 0 ? '+' : ''}{variation}%
                  </span>
                ) : <span className="text-muted">—</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CashFlowTable({ rows, lang, currency }: { rows: CFRow[]; lang: string; currency: string }) {
  const fmtAmt = (n: number | undefined) => formatAmount(n, (currency || 'GNF') as CurrencyCode);
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-bg border-b border-line">
          {[lang === 'fr' ? 'Rubrique' : 'Line item', 'N'].map((h, i) => (
            <th key={i} className={`py-2.5 text-[11px] font-semibold text-muted uppercase tracking-[.06em] ${i === 0 ? 'px-5 text-left' : 'px-4 text-right'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          if (row.sec) {
            return (
              <tr key={i} className="bg-bg-2">
                <td colSpan={2} className="px-5 py-2 text-[11px] font-bold text-muted uppercase tracking-[.08em]">{lang === 'fr' ? row.fr : row.en}</td>
              </tr>
            );
          }
          const isTotal = row.tot;
          const isSub = row.sub;
          const textClass = isTotal ? 'text-[13px] font-bold text-ink' : isSub ? 'text-[12.5px] font-semibold text-ink-2' : 'text-[12.5px] text-ink-2';
          return (
            <tr key={i} className={isTotal ? 'bg-bg border-t-2 border-line' : isSub ? 'bg-bg/50 border-t border-line-2' : 'hover:bg-bg transition-colors'}
              style={{ borderBottom: i < rows.length - 1 && !isTotal ? '1px solid var(--color-line-2)' : 'none' }}>
              <td className={`px-5 py-2.5 ${textClass} ${isSub || isTotal ? 'pl-5' : 'pl-8'}`}>{lang === 'fr' ? row.fr : row.en}</td>
              <td className={`px-4 py-2.5 text-right tabular-nums ${textClass} ${(row.n ?? 0) < 0 ? 'text-red' : ''}`}>
                {fmtAmt(row.n)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ lang }: { lang: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-xl bg-bg-2 border border-line grid place-items-center text-muted">
        <Icons.doc />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-ink mb-1">
          {lang === 'fr' ? 'Aucune balance importée' : 'No trial balance imported'}
        </p>
        <p className="text-[13px] text-muted max-w-xs">
          {lang === 'fr'
            ? 'Importez une balance générale pour générer automatiquement les états financiers SYSCOHADA.'
            : 'Import a trial balance to automatically generate SYSCOHADA financial statements.'}
        </p>
      </div>
      <Btn variant="primary" onClick={() => router.push('/import')}>
        {lang === 'fr' ? 'Importer une balance' : 'Import trial balance'}
      </Btn>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function StatementsScreen() {
  const { t, lang } = useT();
  const { state, loadLatestCalculation } = useEngine();
  const { activeFiscalYear } = useWorkspace();
  const [tab, setTab] = useState<Tab>('bilan');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideLineKey, setOverrideLineKey] = useState('');
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSaving, setOverrideSaving] = useState(false);

  useEffect(() => {
    if (!state.result && !state.isLoadingSavedResult && activeFiscalYear?.id) {
      void loadLatestCalculation(activeFiscalYear.id);
    }
  }, [activeFiscalYear?.id, loadLatestCalculation, state.isLoadingSavedResult, state.result]);

  const result = state.result;
  const currency = state.currency;
  const companyName = state.companyName;
  const fy = state.fiscalYearLabel;
  const fmtAmt = (n: number | undefined) => formatAmount(n, (currency || 'GNF') as CurrencyCode);

  const actifRows  = result ? buildActifRows(result.actifN)   : null;
  const passifRows = result ? buildPassifRows(result.passifN) : null;
  const incomeRows = result ? buildIncomeRows(result.incomeStatement) : null;
  const cfRows     = result ? buildCashFlowRows(result.cashFlow) : null;

  const isBalanced = result ? Math.abs(result.actifN.total_actif_N - result.passifN.total_passif_N) <= 1 : false;
  const subtitle = `(en ${currency})`;

  const notesData: NoteAnnexe[] = result?.notes ?? [];
  const notesDone = notesData.filter((n: NoteAnnexe) => n.status === 'completed').length;
  const notesTotal = notesData.length;
  const overrideLines = result
    ? [
        ...result.actifN.lines,
        ...result.passifN.lines,
        ...result.incomeStatement.lines,
        ...result.cashFlow.lines,
      ].filter((line) => !line.is_header)
    : [];

  const submitOverride = async () => {
    if (!activeFiscalYear?.id || !overrideLineKey || !overrideValue || !overrideReason.trim()) return;
    const [reportType, reportLineCode] = overrideLineKey.split(':');
    setOverrideSaving(true);
    try {
      const response = await fetch('/api/manual-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          reportType,
          reportLineCode,
          newValue: Number(overrideValue),
          reason: overrideReason,
          requiresApproval: true,
        }),
      });
      if (response.ok) {
        setShowOverrideDialog(false);
        setOverrideLineKey('');
        setOverrideValue('');
        setOverrideReason('');
      }
    } finally {
      setOverrideSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={result ? `${companyName} · ${lang === 'fr' ? 'Exercice' : 'FY'} ${fy}` : undefined}
        title={t('nav_statements')}
        subtitle={
          lang === 'fr'
            ? 'Bilan, compte de résultat et tableau des flux générés automatiquement depuis la balance affectée.'
            : 'Balance sheet, income statement and cash flow auto-generated from the mapped trial balance.'
        }
        actions={
          result ? (
            <>
              <Btn variant="secondary" icon={<Icons.edit />} onClick={() => setShowOverrideDialog(true)}>{lang === 'fr' ? 'Ajustement' : 'Override'}</Btn>
              <Btn variant="secondary" icon={<Icons.pdf />}>{lang === 'fr' ? 'Exporter PDF' : 'Export PDF'}</Btn>
              <Btn variant="secondary" icon={<Icons.excel />}>{lang === 'fr' ? 'Exporter Excel' : 'Export Excel'}</Btn>
            </>
          ) : undefined
        }
      >
        <div className="flex gap-1">
          {TABS.map((tab_) => (
            <button key={tab_.key} onClick={() => setTab(tab_.key)}
              className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${tab === tab_.key ? 'bg-rust text-white' : 'text-muted hover:text-ink bg-paper border border-line'}`}>
              {lang === 'fr' ? tab_.fr : tab_.en}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="px-8 py-6 pb-12">
        {!result && state.isLoadingSavedResult && (
          <div className="py-24 text-center text-[13px] text-muted">
            {lang === 'fr' ? 'Chargement du dernier calcul...' : 'Loading latest calculation...'}
          </div>
        )}

        {!result && !state.isLoadingSavedResult && <EmptyState lang={lang} />}

        {result && tab === 'bilan' && (
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
            <Card className="p-0">
              <CardHeader title={lang === 'fr' ? 'ACTIF' : 'ASSETS'} subtitle={subtitle}
                action={<Badge status="completed" label={lang === 'fr' ? 'Calculé' : 'Computed'} dot size="sm" />} />
              <BilanTable rows={actifRows!} lang={lang} side="actif" currency={currency} />
            </Card>
            <Card className="p-0">
              <CardHeader title={lang === 'fr' ? 'PASSIF' : 'LIABILITIES & EQUITY'} subtitle={subtitle}
                action={<Badge status={isBalanced ? 'completed' : 'critical'} label={isBalanced ? (lang === 'fr' ? 'Équilibré' : 'Balanced') : (lang === 'fr' ? 'Déséquilibré' : 'Unbalanced')} dot size="sm" />} />
              <BilanTable rows={passifRows!} lang={lang} side="passif" currency={currency} />
            </Card>
          </div>
        )}

        {result && tab === 'cr' && (
          <Card className="p-0">
            <CardHeader
              title={lang === 'fr' ? 'Compte de résultat' : 'Income Statement'}
              subtitle={lang === 'fr' ? `Exercice ${fy} · ${subtitle}` : `FY ${fy} · ${subtitle}`}
              action={<Badge status="completed" label={lang === 'fr' ? 'Calculé' : 'Computed'} dot size="sm" />}
            />
            <IncomeTable rows={incomeRows!} lang={lang} currency={currency} />
          </Card>
        )}

        {result && tab === 'cashflow' && (
          <Card className="p-0">
            <CardHeader
              title={lang === 'fr' ? 'Tableau des flux de trésorerie' : 'Cash Flow Statement'}
              subtitle={lang === 'fr' ? `Méthode indirecte · ${subtitle}` : `Indirect method · ${subtitle}`}
              action={<Badge status={result.cashFlow.is_balanced ? 'completed' : 'warning'} label={result.cashFlow.is_balanced ? (lang === 'fr' ? 'Équilibré' : 'Balanced') : (lang === 'fr' ? 'À confirmer' : 'To confirm')} dot size="sm" />}
            />
            <CashFlowTable rows={cfRows!} lang={lang} currency={currency} />
          </Card>
        )}

        {result && tab === 'notes' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
            <Card className="p-0">
              <CardHeader
                title={lang === 'fr' ? 'Notes annexes' : 'Annex Notes'}
                subtitle={lang === 'fr' ? `${notesDone} complétées · ${notesTotal - notesDone} manquantes` : `${notesDone} completed · ${notesTotal - notesDone} missing`}
                action={<Btn size="sm" variant="primary" icon={<Icons.plus />}>{lang === 'fr' ? 'Compléter les notes' : 'Complete notes'}</Btn>}
              />
              <div>
                {notesData.map((note: NoteAnnexe, i: number) => (
                  <div key={note.note_number} className="grid items-center gap-3 px-5 py-3 hover:bg-bg transition-colors cursor-pointer"
                    style={{ gridTemplateColumns: '28px 1fr auto', borderBottom: i < notesData.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}>
                    <span className="text-[11.5px] font-mono font-semibold text-muted-2">{String(note.note_number).padStart(2, '0')}</span>
                    <span className={`text-[13px] font-medium ${note.status === 'completed' ? 'text-ink-2' : 'text-ink'}`}>
                      {lang === 'fr' ? note.title_fr : note.title_en}
                    </span>
                    {note.status === 'completed'
                      ? <Badge status="completed" label={lang === 'fr' ? 'Complète' : 'Done'} dot size="sm" />
                      : note.status === 'toComplete' || note.status === 'prefilled'
                      ? <Badge status="warning" label={lang === 'fr' ? 'Incomplète' : 'Incomplete'} dot size="sm" />
                      : <Badge status="notStarted" label={lang === 'fr' ? 'Vide' : 'Empty'} dot size="sm" />}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sticky top-[72px]">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{lang === 'fr' ? 'Résumé annexes' : 'Notes summary'}</div>
              {[
                { label: lang === 'fr' ? 'Total annexes' : 'Total notes', value: notesTotal, color: 'text-ink' },
                { label: lang === 'fr' ? 'Complétées' : 'Completed', value: notesDone, color: 'text-green' },
                { label: lang === 'fr' ? 'Incomplètes' : 'Incomplete', value: notesTotal - notesDone, color: 'text-red' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-line-2 last:border-none">
                  <span className="text-[12.5px] text-ink-2">{r.label}</span>
                  <span className={`text-[13px] font-bold ${r.color}`}>{r.value}</span>
                </div>
              ))}
              <div className="mt-4">
                <Btn variant="primary" size="sm" className="w-full" icon={<Icons.notes />}>
                  {lang === 'fr' ? 'Aller aux annexes' : 'Go to notes'}
                </Btn>
              </div>
            </Card>
          </div>
        )}
      </div>

      {showOverrideDialog && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" onClick={() => setShowOverrideDialog(false)}>
          <div className="bg-paper rounded-xl shadow-xl border border-line p-5 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-[16px] font-semibold text-ink">{lang === 'fr' ? 'Demander un ajustement manuel' : 'Request manual override'}</h3>
                <p className="text-[12.5px] text-muted mt-1">
                  {lang === 'fr' ? 'Les ajustements doivent etre approuves avant recalcul.' : 'Overrides must be approved before recalculation.'}
                </p>
              </div>
              <button className="text-muted hover:text-ink" onClick={() => setShowOverrideDialog(false)}><Icons.x /></button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="block text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Ligne' : 'Line'}</label>
                <select
                  value={overrideLineKey}
                  onChange={(e) => setOverrideLineKey(e.target.value)}
                  className="w-full text-[12.5px] text-ink bg-bg border border-line rounded-lg px-3 py-2 outline-none focus:border-rust"
                >
                  <option value="">{lang === 'fr' ? '- Selectionner -' : '- Select -'}</option>
                  {overrideLines.map((line) => (
                    <option key={`${line.report_type}:${line.line_code}`} value={`${line.report_type}:${line.line_code}`}>
                      {line.report_type} / {lang === 'fr' ? line.label_fr : line.label_en} ({fmtAmt(line.value_N ?? undefined)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Nouvelle valeur' : 'New value'}</label>
                <input
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  type="number"
                  className="w-full text-[12.5px] text-ink bg-bg border border-line rounded-lg px-3 py-2 outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Raison' : 'Reason'}</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={4}
                  className="w-full text-[12.5px] text-ink bg-bg border border-line rounded-lg px-3 py-2 outline-none focus:border-rust resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Btn variant="ghost" onClick={() => setShowOverrideDialog(false)}>{lang === 'fr' ? 'Annuler' : 'Cancel'}</Btn>
              <Btn variant="primary" onClick={() => void submitOverride()} disabled={overrideSaving || !overrideLineKey || !overrideValue || !overrideReason.trim()}>
                {overrideSaving ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Soumettre' : 'Submit')}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
