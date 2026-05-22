'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

const REPORTS = [
  { id: 'r1', company: 'Sahel Industries SARL', year: '2025', type_fr: 'États financiers complets', type_en: 'Full financial statements', date: '12 avr. 2026', status: 'approved' as const },
  { id: 'r2', company: 'Sahel Industries SARL', year: '2024', type_fr: 'États financiers complets', type_en: 'Full financial statements', date: '10 mars 2025', status: 'locked' as const },
];

const DOCS = [
  { name: 'États financiers SYSCOHADA 2025.pdf', size: '1.4 MB', date: '12 avr. 2026' },
  { name: 'Rapport de révision 2025.pdf', size: '0.8 MB', date: '12 avr. 2026' },
  { name: 'États financiers SYSCOHADA 2024.pdf', size: '1.2 MB', date: '10 mars 2025' },
];

export function ClientPortal() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<'dashboard' | 'reports' | 'documents'>('dashboard');

  return (
    <div className="min-h-screen bg-bg">
      {/* Client portal header */}
      <header className="bg-paper border-b border-line px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rust to-rust-2 grid place-items-center text-white font-bold text-sm font-serif">S</div>
          <span className="text-[15px] font-semibold text-ink font-serif">Speedy <span className="text-rust">OHADA</span></span>
          <span className="text-muted mx-2">·</span>
          <span className="text-[13px] text-muted">{fr ? 'Espace client' : 'Client portal'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted">Diaby Ibrahim</span>
          <div className="w-8 h-8 rounded-full bg-rust/10 grid place-items-center text-rust text-[12px] font-bold">D</div>
        </div>
      </header>

      <div className="px-8 py-6 pb-12 max-w-4xl mx-auto flex flex-col gap-6">
        {/* Welcome */}
        <div className="bg-paper border border-line rounded-xl p-5">
          <div className="text-[16px] font-semibold text-ink">
            {fr ? 'Bienvenue, Diaby Ibrahim' : 'Welcome, Diaby Ibrahim'}
          </div>
          <div className="text-[13px] text-muted mt-0.5">
            {fr ? 'Sahel Industries SARL · Abidjan, Côte d\'Ivoire' : 'Sahel Industries SARL · Abidjan, Côte d\'Ivoire'}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-line">
          {[
            { key: 'dashboard', fr: 'Tableau de bord', en: 'Dashboard' },
            { key: 'reports',   fr: 'Rapports',        en: 'Reports' },
            { key: 'documents', fr: 'Documents',       en: 'Documents' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
              style={{ borderColor: tab === t.key ? 'var(--color-rust)' : 'transparent', color: tab === t.key ? 'var(--color-rust)' : 'var(--color-muted)' }}>
              {fr ? t.fr : t.en}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: fr ? 'Exercice en cours' : 'Current year', value: '2025', sub: fr ? 'En révision' : 'Under review', color: 'text-amber' },
                { label: fr ? 'Progression' : 'Progress', value: '72%', sub: fr ? '29 / 36 notes' : '29 / 36 notes', color: 'text-rust' },
                { label: fr ? 'Dernière mise à jour' : 'Last update', value: '12 avr.', sub: 'Diaby I.', color: 'text-ink' },
              ].map((kpi, i) => (
                <div key={i} className="bg-paper border border-line rounded-xl p-4">
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{kpi.label}</div>
                  <div className={`text-[22px] font-bold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-[12px] text-muted mt-0.5">{kpi.sub}</div>
                </div>
              ))}
            </div>
            <div className="bg-paper border border-line rounded-xl p-4">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{fr ? 'Progression globale' : 'Overall progress'}</div>
              <div className="w-full h-2.5 rounded-full bg-bg-2 overflow-hidden">
                <div className="h-full rounded-full bg-rust" style={{ width: '72%' }} />
              </div>
              <div className="text-[12px] text-muted mt-2">{fr ? 'Votre dossier est en cours de traitement par le cabinet.' : 'Your file is being processed by the firm.'}</div>
            </div>
          </div>
        )}

        {/* Reports */}
        {tab === 'reports' && (
          <div className="flex flex-col gap-3">
            {REPORTS.map((r) => (
              <div key={r.id} className="bg-paper border border-line rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0"><Icons.doc /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{fr ? r.type_fr : r.type_en} · {r.year}</div>
                  <div className="text-[12px] text-muted">{r.company} · {r.date}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${r.status === 'approved' ? 'text-green bg-green-soft' : 'text-muted bg-bg-2'}`}>
                  {r.status === 'approved' ? (fr ? 'Approuvé' : 'Approved') : (fr ? 'Verrouillé' : 'Locked')}
                </span>
                <Btn variant="secondary" icon={<Icons.download />}>{fr ? 'Télécharger' : 'Download'}</Btn>
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {tab === 'documents' && (
          <div className="flex flex-col gap-3">
            {DOCS.map((doc, i) => (
              <div key={i} className="bg-paper border border-line rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0"><Icons.doc /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">{doc.name}</div>
                  <div className="text-[11.5px] text-muted">{doc.date} · {doc.size}</div>
                </div>
                <Btn variant="ghost" icon={<Icons.download />}>{fr ? 'Télécharger' : 'Download'}</Btn>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
