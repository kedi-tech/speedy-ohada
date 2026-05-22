'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import type { NoteAnnexe } from '@/lib/engine/NotesAnnexesEngine';
import type { NoteStatus } from '@/lib/types';
import type { NoteApplicability } from '@/lib/frna';

type ActiveTab = 'notes' | 'frna';

interface FRNAEntryPayload {
  id: string;
  noteNumber: number;
  variant: string;
  labelFr: string;
  pageNumber: number;
  applicability: NoteApplicability;
  suggested: NoteApplicability;
  isOverridden: boolean;
  neverNa: boolean;
}

const STATUS_META: Record<NoteStatus, { fr: string; en: string; color: string; dot: string }> = {
  notStarted:  { fr: 'Non demarree', en: 'Not started', color: 'text-muted bg-bg-2', dot: 'bg-muted-2' },
  prefilled:   { fr: 'Preremplie', en: 'Pre-filled', color: 'text-amber bg-amber-tint', dot: 'bg-amber' },
  toComplete:  { fr: 'A completer', en: 'To complete', color: 'text-amber bg-amber-tint', dot: 'bg-amber' },
  completed:   { fr: 'Completee', en: 'Completed', color: 'text-green bg-green-soft', dot: 'bg-green' },
  needsReview: { fr: 'A reviser', en: 'Needs review', color: 'text-rust bg-rust-tint', dot: 'bg-rust' },
  validated:   { fr: 'Validee', en: 'Validated', color: 'text-green bg-green-soft', dot: 'bg-green' },
};

export function NotesAnnexes() {
  const { lang } = useT();
  const { activeFiscalYear } = useWorkspace();
  const router = useRouter();
  const fr = lang === 'fr';
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [filter, setFilter] = useState<NoteStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<NoteAnnexe[]>([]);
  const [frnaEntries, setFrnaEntries] = useState<FRNAEntryPayload[]>([]);
  const [frnaUpdates, setFrnaUpdates] = useState<Record<string, NoteApplicability>>({});
  const [savingFrna, setSavingFrna] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeFiscalYear?.id) return;
    setLoading(true);
    fetch(`/api/notes?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : { notes: [] })
      .then((payload) => setNotes(payload.notes ?? []))
      .finally(() => setLoading(false));
  }, [activeFiscalYear?.id]);

  useEffect(() => {
    if (!activeFiscalYear?.id || activeTab !== 'frna') return;
    fetch(`/api/frna?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : { entries: [] })
      .then((payload) => setFrnaEntries(payload.entries ?? []));
  }, [activeFiscalYear?.id, activeTab]);

  const setFrnaApplicability = useCallback((id: string, value: NoteApplicability) => {
    setFrnaEntries((prev) => prev.map((e) => e.id === id ? { ...e, applicability: value, isOverridden: true } : e));
    setFrnaUpdates((prev) => ({ ...prev, [id]: value }));
  }, []);

  const saveFrna = async () => {
    if (!activeFiscalYear?.id || Object.keys(frnaUpdates).length === 0) return;
    setSavingFrna(true);
    await fetch('/api/frna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, updates: frnaUpdates }),
    });
    setFrnaUpdates({});
    setSavingFrna(false);
  };

  const filtered = notes.filter((note) => {
    const matchStatus = filter === 'all' || note.status === filter;
    const title = fr ? note.title_fr : note.title_en;
    return matchStatus && title.toLowerCase().includes(search.toLowerCase());
  });

  const total = notes.length;
  const completed = notes.filter((note) => note.status === 'completed' || note.status === 'validated').length;
  const missing = notes.filter((note) => note.is_required && note.status !== 'completed' && note.status !== 'validated').length;
  const warnings = notes.filter((note) => note.status === 'toComplete' || note.status === 'needsReview').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const frnaApplicableCount = frnaEntries.filter((e) => e.applicability === 'A').length;
  const frnaNotApplicableCount = frnaEntries.filter((e) => e.applicability === 'NA').length;
  const frnaPendingCount = frnaEntries.filter((e) => e.applicability === 'pending').length;

  return (
    <div>
      <PageHeader
        title={fr ? 'Notes annexes' : 'Annex notes'}
        subtitle={fr ? `${completed} / ${total} notes complétées` : `${completed} / ${total} notes completed`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border ${activeTab === 'notes' ? 'bg-rust text-white border-rust' : 'bg-bg border-line text-ink hover:border-rust'}`}>
              {fr ? 'Notes' : 'Notes'}
            </button>
            <button onClick={() => setActiveTab('frna')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border ${activeTab === 'frna' ? 'bg-rust text-white border-rust' : 'bg-bg border-line text-ink hover:border-rust'}`}>
              {fr ? 'FRNA — Applicabilité' : 'FRNA — Applicability'}
            </button>
          </div>
        }
      />

      {activeTab === 'notes' && (
        <div className="px-8 py-6 pb-12 flex flex-col gap-5">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: fr ? 'Total' : 'Total', value: total, color: 'text-ink' },
              { label: fr ? 'Complétées' : 'Completed', value: completed, color: 'text-green' },
              { label: fr ? 'Manquantes' : 'Missing', value: missing, color: 'text-amber' },
              { label: fr ? 'Avertissements' : 'Warnings', value: warnings, color: 'text-rust' },
            ].map((s) => (
              <div key={s.label} className="bg-paper border border-line rounded-xl p-4">
                <div className={`text-[24px] font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[12px] text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-paper border border-line rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="font-semibold text-ink">{fr ? 'Progression globale' : 'Overall progress'}</span>
                <span className="text-muted">{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-2 overflow-hidden">
                <div className="h-full rounded-full bg-rust transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icons.search /></span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={fr ? 'Rechercher une note...' : 'Search notes...'}
                className="pl-9 pr-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust w-52"
              />
            </div>
            {(['all', 'notStarted', 'toComplete', 'prefilled', 'completed', 'validated'] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${filter === s ? 'bg-rust text-white border-rust' : 'bg-bg border-line text-muted hover:border-rust hover:text-ink'}`}>
                {s === 'all' ? (fr ? 'Toutes' : 'All') : (fr ? STATUS_META[s].fr : STATUS_META[s].en)}
              </button>
            ))}
          </div>

          <Card>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line-2 text-left">
                  {['#', fr ? 'Note' : 'Note', fr ? 'Statut' : 'Status', fr ? 'Requise' : 'Required', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">{fr ? 'Chargement...' : 'Loading...'}</td></tr>}
                {!loading && filtered.map((note) => {
                  const s = STATUS_META[note.status];
                  return (
                    <tr key={note.note_number} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/notes/${note.note_number}`)}>
                      <td className="px-5 py-3 text-muted w-10">{note.note_number}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink">{fr ? note.title_fr : note.title_en}</div>
                        <div className="text-[11.5px] text-muted mt-0.5 truncate max-w-[420px]">{fr ? note.description_fr : note.description_en}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {fr ? s.fr : s.en}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {note.is_required ? <span className="text-rust"><Icons.check /></span> : <span className="text-muted-2">-</span>}
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <Btn variant="ghost" onClick={() => router.push(`/notes/${note.note_number}`)}>
                          {note.status === 'notStarted' ? (fr ? 'Démarrer' : 'Start') : (fr ? 'Éditer' : 'Edit')}
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'frna' && (
        <div className="px-8 py-6 pb-12 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: fr ? 'Applicables (A)' : 'Applicable (A)', value: frnaApplicableCount, color: 'text-green' },
              { label: fr ? 'Non applicables (N/A)' : 'Not applicable (N/A)', value: frnaNotApplicableCount, color: 'text-muted' },
              { label: fr ? 'En attente' : 'Pending', value: frnaPendingCount, color: 'text-amber' },
            ].map((s) => (
              <div key={s.label} className="bg-paper border border-line rounded-xl p-4">
                <div className={`text-[24px] font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[12px] text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted">
              {fr
                ? 'Cochez A (Applicable) ou N/A (Non Applicable) pour chaque note. Les suggestions sont calculées automatiquement depuis la balance importée.'
                : 'Mark each note as A (Applicable) or N/A (Not Applicable). Suggestions are auto-computed from the imported trial balance.'}
            </p>
            <Btn variant="primary" onClick={saveFrna} disabled={savingFrna || Object.keys(frnaUpdates).length === 0}>
              {savingFrna ? (fr ? 'Enregistrement...' : 'Saving...') : (fr ? 'Enregistrer' : 'Save')}
            </Btn>
          </div>

          <Card>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line-2 text-left">
                  {[fr ? 'Note' : 'Note', fr ? 'Intitulé' : 'Title', fr ? 'Page' : 'Page', fr ? 'Suggestion' : 'Suggestion', fr ? 'Applicabilité' : 'Applicability'].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frnaEntries.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">{fr ? 'Importez une balance pour calculer les suggestions.' : 'Import a trial balance to compute suggestions.'}</td></tr>
                )}
                {frnaEntries.map((entry) => {
                  const appClass = entry.applicability === 'A' ? 'text-green font-semibold' : entry.applicability === 'NA' ? 'text-muted' : 'text-amber';
                  const suggClass = entry.suggested === 'A' ? 'text-green' : entry.suggested === 'NA' ? 'text-muted' : 'text-amber';
                  return (
                    <tr key={entry.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/30">
                      <td className="px-5 py-3 font-mono text-[12px] text-ink-2 w-16">{entry.id}</td>
                      <td className="px-5 py-3 text-ink max-w-[340px]">{entry.labelFr}</td>
                      <td className="px-5 py-3 text-muted text-center w-16">{entry.pageNumber > 0 ? entry.pageNumber : '—'}</td>
                      <td className="px-5 py-3 w-28">
                        {entry.neverNa
                          ? <span className="text-[11px] text-muted italic">{fr ? 'Toujours A' : 'Always A'}</span>
                          : <span className={`text-[12px] ${suggClass}`}>{entry.suggested === 'pending' ? '?' : entry.suggested}</span>
                        }
                      </td>
                      <td className="px-5 py-3 w-36">
                        <div className="flex items-center gap-3">
                          {(['A', 'NA', 'pending'] as const).map((v) => (
                            <label key={v} className={`flex items-center gap-1 cursor-pointer select-none ${entry.neverNa && v !== 'A' ? 'opacity-30 pointer-events-none' : ''}`}>
                              <input
                                type="radio"
                                name={`frna-${entry.id}`}
                                value={v}
                                checked={entry.applicability === v}
                                onChange={() => setFrnaApplicability(entry.id, v)}
                                className="accent-rust"
                              />
                              <span className={`text-[12px] font-medium ${entry.applicability === v ? appClass : 'text-muted'}`}>
                                {v === 'pending' ? '?' : v}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
