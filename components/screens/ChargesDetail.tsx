'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useEngine } from '@/context/EngineContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { formatAmount } from '@/lib/format';
import type { CurrencyCode } from '@/lib/format';
import type { NormalizedAccount } from '@/lib/engine/types';

// DGI statutory sections matching pages 65–68 of the 68-page liasse
const DGI_SECTIONS = [
  { code: 'RA', label_fr: 'Achats de marchandises',                              label_en: 'Purchases of goods for resale',          prefixes: ['601'] },
  { code: 'RB', label_fr: 'Variation de stocks de marchandises',                  label_en: 'Changes in merchandise inventory',       prefixes: ['6031'] },
  { code: 'RC', label_fr: 'Achats de matieres premieres et fournitures liees',    label_en: 'Raw material and supply purchases',      prefixes: ['602'] },
  { code: 'RD', label_fr: 'Variation de stocks de matieres premieres',            label_en: 'Changes in raw material inventory',      prefixes: ['6032'] },
  { code: 'RE', label_fr: 'Autres achats',                                        label_en: 'Other purchases',                        prefixes: ['604', '605', '608'] },
  { code: 'RF', label_fr: 'Variation autres stocks d approvisionnements',         label_en: 'Changes in other supply inventory',      prefixes: ['6033'] },
  { code: 'RG', label_fr: 'Transports',                                           label_en: 'Transport',                              prefixes: ['61'] },
  { code: 'RH', label_fr: 'Services exterieurs',                                  label_en: 'External services',                      prefixes: ['62', '63'] },
  { code: 'RI', label_fr: 'Impots et taxes',                                      label_en: 'Taxes and duties',                       prefixes: ['64'] },
  { code: 'RJ', label_fr: 'Autres charges',                                       label_en: 'Other expenses',                         prefixes: ['65'] },
  { code: 'RK', label_fr: 'Charges de personnel',                                 label_en: 'Personnel expenses',                     prefixes: ['66'] },
  { code: 'RL', label_fr: 'Dotations aux amortissements exploitation',            label_en: 'Depreciation (operations)',              prefixes: ['681', '682'] },
  { code: 'RM', label_fr: 'Frais financiers et charges assimilees',               label_en: 'Financial charges',                      prefixes: ['67'] },
  { code: 'RN', label_fr: 'Dotations aux provisions financieres',                 label_en: 'Financial provisions',                   prefixes: ['686'] },
] as const;

type DGICode = typeof DGI_SECTIONS[number]['code'];

function matchesDGIPrefix(accountNumber: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => accountNumber.startsWith(p));
}

interface AccountRow {
  account_number: string;
  account_label: string;
  amount_n: number;
  amount_n1: number | null;
}

interface DGISection {
  code: DGICode;
  label_fr: string;
  label_en: string;
  rows: AccountRow[];
  total_n: number;
  total_n1: number;
}

function buildDGISections(
  accountsN: NormalizedAccount[],
  accountsN1: NormalizedAccount[] | undefined,
): { sections: DGISection[]; unmatched: AccountRow[]; grand_total_n: number; grand_total_n1: number } {
  const class6N = accountsN.filter((a) => a.account_number.startsWith('6') && !a.account_number.startsWith('69'));
  const class6N1Map = new Map(
    (accountsN1 ?? [])
      .filter((a) => a.account_number.startsWith('6') && !a.account_number.startsWith('69'))
      .map((a) => [a.account_number, a.net_balance]),
  );

  const matchedSet = new Set<string>();

  const sections: DGISection[] = DGI_SECTIONS.map((section) => {
    const rows: AccountRow[] = class6N
      .filter((a) => matchesDGIPrefix(a.account_number, section.prefixes))
      .sort((a, b) => a.account_number.localeCompare(b.account_number))
      .map((a) => {
        matchedSet.add(a.account_number);
        return {
          account_number: a.account_number,
          account_label: a.account_label,
          amount_n: a.net_balance,
          amount_n1: class6N1Map.get(a.account_number) ?? null,
        };
      });
    const total_n = rows.reduce((s, r) => s + r.amount_n, 0);
    const total_n1 = rows.reduce((s, r) => s + (r.amount_n1 ?? 0), 0);
    return { code: section.code, label_fr: section.label_fr, label_en: section.label_en, rows, total_n, total_n1 };
  });

  const unmatched: AccountRow[] = class6N
    .filter((a) => !matchedSet.has(a.account_number))
    .sort((a, b) => a.account_number.localeCompare(b.account_number))
    .map((a) => ({
      account_number: a.account_number,
      account_label: a.account_label,
      amount_n: a.net_balance,
      amount_n1: class6N1Map.get(a.account_number) ?? null,
    }));

  const grand_total_n = sections.reduce((s, sec) => s + sec.total_n, 0) + unmatched.reduce((s, r) => s + r.amount_n, 0);
  const grand_total_n1 = sections.reduce((s, sec) => s + sec.total_n1, 0) + unmatched.reduce((s, r) => s + (r.amount_n1 ?? 0), 0);

  return { sections, unmatched, grand_total_n, grand_total_n1 };
}

function varPct(n: number, n1: number | null): string {
  if (n1 === null || n1 === 0) return '—';
  const v = ((n - n1) / Math.abs(n1)) * 100;
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

function varAbs(n: number, n1: number | null): number | null {
  if (n1 === null) return null;
  return n - n1;
}

type ViewMode = 'dgi' | 'simple';

export function ChargesDetail() {
  const { lang } = useT();
  const { state, loadLatestCalculation } = useEngine();
  const { activeFiscalYear } = useWorkspace();
  const router = useRouter();
  const fr = lang === 'fr';
  const [viewMode, setViewMode] = useState<ViewMode>('dgi');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!state.result && !state.isLoadingSavedResult && activeFiscalYear?.id) {
      void loadLatestCalculation(activeFiscalYear.id);
    }
  }, [activeFiscalYear?.id, loadLatestCalculation, state.isLoadingSavedResult, state.result]);

  const currency = (state.currency || 'GNF') as CurrencyCode;
  const fy = state.fiscalYearLabel;
  const fyN1 = fy ? String(parseInt(fy) - 1) : '—';
  const fmt = (v: number | null) => v == null ? '—' : formatAmount(v, currency);

  const dgi = useMemo(() => {
    if (!state.result?.accountsN) return null;
    return buildDGISections(state.result.accountsN, state.result.accountsN1);
  }, [state.result]);

  // Simple view data from expenseDetails
  const simpleRows = useMemo(() => {
    if (!state.result?.expenseDetails) return [];
    return state.result.expenseDetails.categories.flatMap((cat) =>
      cat.lines
        .filter((line) => {
          if (!search) return true;
          return line.account_number.includes(search) || line.account_label.toLowerCase().includes(search.toLowerCase());
        })
        .map((line) => ({
          acc: line.account_number,
          label: line.account_label,
          cat_fr: line.category_fr,
          cat_en: line.category_en,
          n: line.amount_N,
          n1: line.amount_N1 ?? null,
        })),
    );
  }, [state.result, search]);

  if (!state.result) {
    return (
      <div>
        <PageHeader
          title={fr ? 'Détail des charges DGI' : 'DGI Charges detail'}
          subtitle={fr ? 'États complémentaires DGI — pages 65–68 de la liasse' : 'DGI supplementary schedules — pages 65–68 of the filing'}
        />
        <div className="px-8 py-24 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-bg-2 border border-line grid place-items-center text-muted"><Icons.doc /></div>
          <p className="text-[15px] font-semibold text-ink">
            {state.isLoadingSavedResult ? (fr ? 'Chargement...' : 'Loading...') : (fr ? 'Aucune balance importée' : 'No trial balance imported')}
          </p>
          {!state.isLoadingSavedResult && (
            <Btn variant="primary" onClick={() => router.push('/import')}>{fr ? 'Importer une balance' : 'Import trial balance'}</Btn>
          )}
        </div>
      </div>
    );
  }

  const totalN  = dgi?.grand_total_n ?? 0;
  const totalN1 = dgi?.grand_total_n1 ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow={`${state.companyName} · ${fr ? 'Exercice' : 'FY'} ${fy}`}
        title={fr ? 'Détail des charges DGI' : 'DGI Charges detail'}
        subtitle={fr
          ? `États complémentaires DGI — pages 65–68 · Classes 6 hors impôt résultat`
          : `DGI supplementary schedules — pages 65–68 · Class 6 excl. income tax`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line overflow-hidden text-[12px]">
              <button onClick={() => setViewMode('dgi')}
                className={`px-3 py-1.5 font-semibold transition-colors ${viewMode === 'dgi' ? 'bg-rust text-white' : 'bg-bg text-ink-2 hover:bg-bg-2'}`}>
                {fr ? 'Formulaire DGI' : 'DGI Form'}
              </button>
              <button onClick={() => setViewMode('simple')}
                className={`px-3 py-1.5 font-semibold transition-colors ${viewMode === 'simple' ? 'bg-rust text-white' : 'bg-bg text-ink-2 hover:bg-bg-2'}`}>
                {fr ? 'Vue simple' : 'Simple view'}
              </button>
            </div>
            <Btn variant="secondary" icon={<Icons.download />}>{fr ? 'Exporter' : 'Export'}</Btn>
          </div>
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-paper border border-line rounded-xl p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{fr ? 'Total charges N' : 'Total charges N'}</div>
            <div className="text-[20px] font-bold text-ink">{fmt(totalN)}</div>
          </div>
          <div className="bg-paper border border-line rounded-xl p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{fr ? `Total charges N-1 (${fyN1})` : `Total charges N-1 (${fyN1})`}</div>
            <div className="text-[20px] font-bold text-ink">{fmt(totalN1)}</div>
          </div>
          <div className="bg-paper border border-line rounded-xl p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{fr ? 'Variation' : 'Variation'}</div>
            <div className="text-[20px] font-bold text-muted">{varPct(totalN, totalN1)}</div>
          </div>
        </div>

        {viewMode === 'dgi' && dgi ? (
          <Card>
            <div className="px-5 py-3 border-b border-line-2 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold text-ink uppercase tracking-[.06em]">
                  {fr ? 'DÉTAIL DES CHARGES' : 'CHARGES DETAIL'} — {currency}
                </div>
                <div className="text-[11px] text-muted mt-0.5">{fr ? 'Référentiel SYSCOHADA · RA à RN' : 'SYSCOHADA reference · RA to RN'}</div>
              </div>
            </div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-bg-2 border-b border-line-2 text-left">
                  {[
                    { h: fr ? 'Ref' : 'Ref', cls: 'w-12' },
                    { h: fr ? 'N° compte' : 'Acct', cls: 'w-28' },
                    { h: fr ? 'Libellé' : 'Label', cls: '' },
                    { h: fy ?? 'N', cls: 'w-36 text-right' },
                    { h: fyN1, cls: 'w-36 text-right' },
                    { h: fr ? 'Variation' : 'Change', cls: 'w-32 text-right' },
                    { h: '%', cls: 'w-20 text-right' },
                  ].map((col, i) => (
                    <th key={i} className={`px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-[.07em] ${col.cls}`}>{col.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dgi.sections.map((section) => (
                  <>
                    {/* Section header / subtotal row */}
                    <tr key={`hdr-${section.code}`} className="bg-bg-2/60 border-t border-line-2">
                      <td className="px-3 py-2 font-bold text-rust text-[12px]">{section.code}</td>
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 font-semibold text-ink">
                        {fr ? section.label_fr : section.label_en}
                      </td>
                      <td className="px-3 py-2 text-right font-bold font-mono text-ink">{fmt(section.total_n)}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted">{fmt(section.total_n1)}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted">{fmt(varAbs(section.total_n, section.total_n1))}</td>
                      <td className="px-3 py-2 text-right text-[11.5px] font-semibold text-muted">{varPct(section.total_n, section.total_n1)}</td>
                    </tr>
                    {/* Per-account rows */}
                    {section.rows.map((row) => (
                      <tr key={row.account_number} className="border-b border-line-2/40 hover:bg-bg-2/30 transition-colors">
                        <td className="px-3 py-1.5" />
                        <td className="px-3 py-1.5 font-mono text-[11.5px] text-muted">{row.account_number}</td>
                        <td className="px-3 py-1.5 text-ink pl-6">{row.account_label}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmt(row.amount_n)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted">{fmt(row.amount_n1)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted">{fmt(varAbs(row.amount_n, row.amount_n1))}</td>
                        <td className="px-3 py-1.5 text-right text-[11px] text-muted">{varPct(row.amount_n, row.amount_n1)}</td>
                      </tr>
                    ))}
                    {section.rows.length === 0 && (
                      <tr key={`empty-${section.code}`} className="border-b border-line-2/20">
                        <td colSpan={7} className="px-3 py-1.5 text-[11px] text-muted/60 pl-16 italic">
                          {fr ? 'Aucun compte' : 'No accounts'}
                        </td>
                      </tr>
                    )}
                  </>
                ))}

                {/* Unmatched class 6 accounts */}
                {dgi.unmatched.length > 0 && (
                  <>
                    <tr className="bg-amber-tint/30 border-t border-line-2">
                      <td className="px-3 py-2 font-bold text-amber text-[12px]">—</td>
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 font-semibold text-ink">
                        {fr ? 'Autres comptes classe 6 (non classés DGI)' : 'Other class 6 accounts (unclassified DGI)'}
                      </td>
                      <td className="px-3 py-2 text-right font-bold font-mono">{fmt(dgi.unmatched.reduce((s, r) => s + r.amount_n, 0))}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted">{fmt(dgi.unmatched.reduce((s, r) => s + (r.amount_n1 ?? 0), 0))}</td>
                      <td colSpan={2} />
                    </tr>
                    {dgi.unmatched.map((row) => (
                      <tr key={row.account_number} className="border-b border-line-2/40 hover:bg-bg-2/30 transition-colors">
                        <td className="px-3 py-1.5" />
                        <td className="px-3 py-1.5 font-mono text-[11.5px] text-amber">{row.account_number}</td>
                        <td className="px-3 py-1.5 text-ink pl-6">{row.account_label}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmt(row.amount_n)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted">{fmt(row.amount_n1)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-muted">{fmt(varAbs(row.amount_n, row.amount_n1))}</td>
                        <td className="px-3 py-1.5 text-right text-[11px] text-muted">{varPct(row.amount_n, row.amount_n1)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line bg-bg-2">
                  <td colSpan={2} className="px-3 py-3 font-bold text-ink text-[13px]">TOTAL</td>
                  <td className="px-3 py-3 font-bold text-ink text-[12px]">
                    {fr ? 'TOTAL DES CHARGES ORDINAIRES' : 'TOTAL ORDINARY CHARGES'}
                  </td>
                  <td className="px-3 py-3 text-right font-bold font-mono text-ink">{fmt(totalN)}</td>
                  <td className="px-3 py-3 text-right font-bold font-mono text-muted">{fmt(totalN1)}</td>
                  <td className="px-3 py-3 text-right font-bold font-mono text-muted">{fmt(varAbs(totalN, totalN1))}</td>
                  <td className="px-3 py-3 text-right font-bold text-muted">{varPct(totalN, totalN1)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>
        ) : (
          /* Simple view */
          <Card>
            <div className="px-5 py-3 border-b border-line-2 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icons.search /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={fr ? 'Compte ou libellé…' : 'Account or label…'}
                  className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
              </div>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line-2 text-left">
                  {[fr ? 'Compte' : 'Account', fr ? 'Libellé' : 'Label', fr ? 'Catégorie' : 'Category', fy ?? 'N', fyN1, fr ? 'Variation' : 'Var.'].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em] ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {simpleRows.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">{fr ? 'Aucun résultat.' : 'No results.'}</td></tr>
                )}
                {simpleRows.map((row, i) => (
                  <tr key={i} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-[12px] text-muted">{row.acc}</td>
                    <td className="px-5 py-3 text-ink">{row.label}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-ink-2 bg-bg-2">{fr ? row.cat_fr : row.cat_en}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">{fmt(row.n)}</td>
                    <td className="px-5 py-3 text-right font-mono text-muted">{fmt(row.n1)}</td>
                    <td className="px-5 py-3 text-right text-[12px] font-semibold text-muted">{varPct(row.n, row.n1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line font-semibold">
                  <td colSpan={3} className="px-5 py-3 text-ink">{fr ? 'Total affiché' : 'Displayed total'}</td>
                  <td className="px-5 py-3 text-right font-mono">{fmt(simpleRows.reduce((s, r) => s + r.n, 0))}</td>
                  <td className="px-5 py-3 text-right font-mono text-muted">{fmt(simpleRows.reduce((s, r) => s + (r.n1 ?? 0), 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
