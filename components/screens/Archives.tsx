'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { REPORT_VERSIONS } from '@/lib/data';

const STATUS_META: Record<string, { fr: string; en: string; color: string }> = {
  draft:        { fr: 'Brouillon',       en: 'Draft',          color: 'text-muted bg-bg-2' },
  under_review: { fr: 'En révision',     en: 'Under review',   color: 'text-amber bg-amber-tint' },
  approved:     { fr: 'Approuvé',        en: 'Approved',       color: 'text-green bg-green-soft' },
  exported:     { fr: 'Exporté',         en: 'Exported',       color: 'text-green bg-green-soft' },
  locked:       { fr: 'Verrouillé',      en: 'Locked',         color: 'text-muted bg-bg-2' },
  archived:     { fr: 'Archivé',         en: 'Archived',       color: 'text-muted bg-bg-2' },
};

export function Archives() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [activeTab, setActiveTab] = useState<'versions' | 'archives'>('versions');

  return (
    <div>
      <PageHeader
        title={fr ? 'Archives et versions' : 'Archives & versions'}
        subtitle={fr ? 'Historique des versions et dossiers archivés' : 'Version history and archived files'}
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-line">
          {[{ key: 'versions', fr: 'Historique des versions', en: 'Version history' }, { key: 'archives', fr: 'Dossiers archivés', en: 'Archived files' }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
              className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
              style={{ borderColor: activeTab === t.key ? 'var(--color-rust)' : 'transparent', color: activeTab === t.key ? 'var(--color-rust)' : 'var(--color-muted)' }}>
              {fr ? t.fr : t.en}
            </button>
          ))}
        </div>

        {/* Version history */}
        {activeTab === 'versions' && (
          <div className="flex flex-col gap-4">
            {REPORT_VERSIONS.map((v) => {
              const s = STATUS_META[v.status] ?? STATUS_META.draft;
              return (
                <div key={v.id} className="bg-paper border border-line rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0 font-bold text-sm">
                    v{v.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>{fr ? s.fr : s.en}</span>
                      <span className="text-[12px] text-muted">{v.created_at}</span>
                      <span className="text-[12px] text-muted">· {v.created_by}</span>
                    </div>
                    <div className="text-[13px] text-ink">{fr ? v.summary_fr : v.summary_en}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {v.download_url && (
                      <Btn variant="secondary" icon={<Icons.download />}>{fr ? 'Télécharger' : 'Download'}</Btn>
                    )}
                    <Btn variant="ghost">{fr ? 'Comparer' : 'Compare'}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Archived files */}
        {activeTab === 'archives' && (
          <Card>
            <CardHeader title={fr ? 'Dossiers archivés' : 'Archived files'} />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line-2 text-left">
                  {[fr ? 'Société' : 'Company', fr ? 'Exercice' : 'Year', fr ? 'Date d\'archivage' : 'Archive date', fr ? 'Archivé par' : 'Archived by', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { company: 'BTP Sahara SAS', year: '2024', date: '15 mars 2025', by: 'Diaby I.' },
                  { company: 'Sahel Industries SARL', year: '2023', date: '10 avr. 2024', by: 'Diaby I.' },
                  { company: 'Cabinet Médical Plateau', year: '2023', date: '8 avr. 2024', by: 'Diaby I.' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">{row.company}</td>
                    <td className="px-5 py-3 text-muted">{row.year}</td>
                    <td className="px-5 py-3 text-muted">{row.date}</td>
                    <td className="px-5 py-3 text-muted">{row.by}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <Btn variant="secondary" icon={<Icons.download />}>{fr ? 'Télécharger' : 'Download'}</Btn>
                        <Btn variant="ghost">{fr ? 'Désarchiver' : 'Restore'}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
