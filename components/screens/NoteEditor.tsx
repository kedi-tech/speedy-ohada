'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import type { NoteAnnexe } from '@/lib/engine/NotesAnnexesEngine';
import type { NoteField } from '@/lib/engine/NotesAnnexesEngine';

export function NoteEditor({ id }: { id: string }) {
  const { lang } = useT();
  const { activeFiscalYear } = useWorkspace();
  const router = useRouter();
  const fr = lang === 'fr';
  const noteNumber = Number(id);
  const [notes, setNotes] = useState<NoteAnnexe[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!activeFiscalYear?.id) return;
    fetch(`/api/notes?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : { notes: [] })
      .then((payload) => {
        setNotes(payload.notes ?? []);
        const note = (payload.notes ?? []).find((n: NoteAnnexe) => n.note_number === noteNumber);
        setValues(Object.fromEntries((note?.fields ?? []).map((field: NoteField) => [field.key, field.value ?? ''])));
      });
  }, [activeFiscalYear?.id, noteNumber]);

  const note = notes.find((n) => n.note_number === noteNumber);
  const noteIdx = notes.findIndex((n) => n.note_number === noteNumber);
  const prev = noteIdx > 0 ? notes[noteIdx - 1] : null;
  const next = noteIdx >= 0 && noteIdx < notes.length - 1 ? notes[noteIdx + 1] : null;

  const handleSave = async () => {
    if (!activeFiscalYear?.id || !note) return;
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, noteNumber: note.note_number, values }),
    });
    if (response.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (!note) {
    return (
      <div>
        <PageHeader title={fr ? 'Note annexe' : 'Annex note'} actions={<Btn variant="ghost" onClick={() => router.push('/notes')}>{fr ? 'Retour' : 'Back'}</Btn>} />
        <div className="px-8 py-16 text-center text-muted">{fr ? 'Note introuvable.' : 'Note not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${fr ? 'Note' : 'Note'} ${note.note_number} - ${fr ? note.title_fr : note.title_en}`}
        subtitle={fr ? note.description_fr : note.description_en}
        actions={
          <>
            <Btn variant="ghost" onClick={() => router.push('/notes')}>{fr ? 'Retour' : 'Back'}</Btn>
            {prev && <Btn variant="secondary" icon={<Icons.arrowLeft />} onClick={() => router.push(`/notes/${prev.note_number}`)}>{fr ? 'Precedent' : 'Previous'}</Btn>}
            {next && <Btn variant="secondary" onClick={() => router.push(`/notes/${next.note_number}`)}>{fr ? 'Suivant' : 'Next'} <Icons.arrowRight /></Btn>}
            <Btn variant="primary" icon={saved ? <Icons.check /> : <Icons.save />} onClick={() => void handleSave()}>
              {saved ? (fr ? 'Enregistre !' : 'Saved!') : (fr ? 'Enregistrer' : 'Save')}
            </Btn>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 grid gap-6" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
        <Card>
          <CardHeader title={fr ? 'Champs de la note' : 'Note fields'} />
          <div className="px-5 py-5 grid gap-4">
            {note.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
                  {fr ? field.label_fr : field.label_en}
                  {field.required && <span className="text-rust ml-1">*</span>}
                </label>
                {field.is_manual ? (
                  <textarea
                    value={String(values[field.key] ?? '')}
                    onChange={(e) => setValues((prevValues) => ({ ...prevValues, [field.key]: e.target.value }))}
                    rows={3}
                    placeholder={fr ? field.placeholder_fr : field.placeholder_en}
                    className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors resize-none"
                  />
                ) : (
                  <div className="px-3 py-2.5 border border-line rounded-lg text-[13px] text-muted bg-bg-2">
                    {field.value == null || field.value === '' ? '-' : String(field.value)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4 sticky top-[72px]">
          <Card className="p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{fr ? 'Informations' : 'Info'}</div>
            <div className="flex flex-col gap-2 text-[12.5px]">
              <div className="flex justify-between"><span className="text-muted">{fr ? 'Note no' : 'Note #'}</span><span className="text-ink font-medium">{note.note_number} / 36</span></div>
              <div className="flex justify-between"><span className="text-muted">{fr ? 'Requise' : 'Required'}</span><span className={note.is_required ? 'text-rust font-medium' : 'text-muted'}>{note.is_required ? (fr ? 'Oui' : 'Yes') : (fr ? 'Non' : 'No')}</span></div>
              <div className="flex justify-between"><span className="text-muted">{fr ? 'Statut' : 'Status'}</span><span className="text-ink font-medium">{note.status}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
