'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

const STATUS_META: Record<string, { fr: string; en: string; color: string }> = {
  draft:               { fr: 'Brouillon',            en: 'Draft',                color: 'text-muted bg-bg-2' },
  setup_incomplete:    { fr: 'Configuration',         en: 'Setup incomplete',     color: 'text-amber bg-amber-tint' },
  waiting_balance_n:   { fr: 'Attente bilan N',       en: 'Waiting balance N',    color: 'text-amber bg-amber-tint' },
  waiting_balance_n1:  { fr: 'Attente bilan N-1',     en: 'Waiting balance N-1',  color: 'text-amber bg-amber-tint' },
  balance_failed:      { fr: 'Bilan échoué',          en: 'Balance failed',       color: 'text-red bg-red-soft' },
  mapping_required:    { fr: 'Affectation requise',   en: 'Mapping required',     color: 'text-amber bg-amber-tint' },
  notes_required:      { fr: 'Notes requises',        en: 'Notes required',       color: 'text-amber bg-amber-tint' },
  tax_required:        { fr: 'Fiscal requis',         en: 'Tax required',         color: 'text-amber bg-amber-tint' },
  ready_review:        { fr: 'Prêt pour révision',    en: 'Ready for review',     color: 'text-green bg-green-soft' },
  under_review:        { fr: 'En révision',           en: 'Under review',         color: 'text-rust bg-rust-tint' },
  approved:            { fr: 'Approuvé',              en: 'Approved',             color: 'text-green bg-green-soft' },
  exported:            { fr: 'Exporté',               en: 'Exported',             color: 'text-green bg-green-soft' },
  locked:              { fr: 'Verrouillé',            en: 'Locked',               color: 'text-muted bg-bg-2' },
};

export function FiscalYearList() {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { fiscalYears: FISCAL_YEARS } = useAppData();

  const filtered = FISCAL_YEARS.filter((fy) => {
    const matchSearch = fy.company_name.toLowerCase().includes(search.toLowerCase()) || fy.label.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || fy.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title={fr ? 'Exercices fiscaux' : 'Fiscal years'}
        subtitle={fr ? `${FISCAL_YEARS.length} exercices · toutes sociétés` : `${FISCAL_YEARS.length} fiscal years · all companies`}
        actions={
          <Btn variant="primary" icon={<Icons.plus />} onClick={() => router.push('/fiscal/new')}>
            {fr ? 'Nouvel exercice' : 'New fiscal year'}
          </Btn>
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icons.search /></span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher…' : 'Search…'}
              className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
            <option value="all">{fr ? 'Tous les statuts' : 'All statuses'}</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{fr ? v.fr : v.en}</option>
            ))}
          </select>
        </div>

        <Card>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line-2 text-left">
                {[fr ? 'Société' : 'Company', fr ? 'Exercice' : 'Year', fr ? 'Période' : 'Period', fr ? 'Statut' : 'Status', fr ? 'Progression' : 'Progress', fr ? 'Verrouillé' : 'Locked', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted">{fr ? 'Aucun résultat.' : 'No results.'}</td></tr>
              ) : filtered.map((fy) => {
                const s = STATUS_META[fy.status] ?? STATUS_META.draft;
                return (
                  <tr key={fy.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/50 transition-colors cursor-pointer"
                    onClick={() => router.push('/workspace')}>
                    <td className="px-5 py-3 font-medium text-ink">{fy.company_name}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{fy.label}</td>
                    <td className="px-5 py-3 text-muted">{fy.opening_date} → {fy.closing_date}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>{fr ? s.fr : s.en}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-bg-2 overflow-hidden">
                          <div className="h-full rounded-full bg-rust" style={{ width: `${fy.progress}%` }} />
                        </div>
                        <span className="text-muted text-[12px]">{fy.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {fy.locked ? <span className="text-muted"><Icons.lock /></span> : <span className="text-muted-2">—</span>}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <Btn variant="ghost" onClick={() => router.push('/workspace')}>{fr ? 'Ouvrir' : 'Open'}</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
