'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';
import { SUPPORTED_CURRENCIES } from '@/lib/reference-data';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors" />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props} className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors">
      {children}
    </select>
  );
}

export function FiscalYearForm() {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const { companies: COMPANIES } = useAppData();
  const [companyId, setCompanyId] = useState('');
  const [yearN, setYearN] = useState(2025);
  const [yearN1, setYearN1] = useState(2024);
  const [openingDate, setOpeningDate] = useState('2025-01-01');
  const [closingDate, setClosingDate] = useState('2025-12-31');
  const [currency, setCurrency] = useState('GNF');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!companyId) {
      setError(fr ? 'Selectionnez une societe.' : 'Select a company.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/fiscal-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, yearN, yearN1, openingDate, closingDate, currency, notes }),
    });
    setSaving(false);

    if (!res.ok) {
      setError(fr ? "Impossible de creer l'exercice." : 'Could not create fiscal year.');
      return;
    }

    router.push('/fiscal');
    router.refresh();
  };

  return (
    <div>
      <PageHeader
        title={fr ? 'Nouvel exercice fiscal' : 'New fiscal year'}
        subtitle={fr ? 'Créez un exercice fiscal pour une société.' : 'Create a fiscal year for a company.'}
        actions={
          <>
            <Btn variant="ghost" onClick={() => router.push('/fiscal')}>{fr ? 'Annuler' : 'Cancel'}</Btn>
            <Btn variant="primary" icon={<Icons.check />} onClick={handleCreate} disabled={saving}>
              {fr ? 'Créer l\'exercice' : 'Create fiscal year'}
            </Btn>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 grid gap-6" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
        <div className="flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-soft border border-red/20 text-[13px] text-red">
              {error}
            </div>
          )}
          <Card>
            <CardHeader title={fr ? 'Société et exercice' : 'Company & year'} />
            <div className="px-5 py-5 grid gap-4">
              <Field label={fr ? 'Société *' : 'Company *'}>
                <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                  <option value="">{fr ? '— Sélectionner une société —' : '— Select a company —'}</option>
                  {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={fr ? 'Année N *' : 'Year N *'}>
                  <Input type="number" value={yearN} min={2000} max={2099} onChange={(e) => setYearN(Number(e.target.value))} />
                </Field>
                <Field label={fr ? 'Année N-1 *' : 'Year N-1 *'}>
                  <Input type="number" value={yearN1} min={2000} max={2099} onChange={(e) => setYearN1(Number(e.target.value))} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={fr ? 'Date d\'ouverture *' : 'Opening date *'}>
                  <Input type="date" value={openingDate} onChange={(e) => setOpeningDate(e.target.value)} />
                </Field>
                <Field label={fr ? 'Date de clôture *' : 'Closing date *'}>
                  <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title={fr ? 'Paramètres comptables' : 'Accounting settings'} />
            <div className="px-5 py-5 grid gap-4">
              <Field label={fr ? 'Devise *' : 'Currency *'}>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.labelFr}</option>
                  ))}
                </Select>
              </Field>
              <Field label={fr ? 'Référentiel comptable *' : 'Accounting standard *'}>
                <Select defaultValue="SYSCOHADA">
                  <option value="SYSCOHADA">SYSCOHADA Révisé (OHADA)</option>
                  <option value="IFRS">IFRS</option>
                  <option value="local">{fr ? 'Normes locales' : 'Local standards'}</option>
                </Select>
              </Field>
              <Field label={fr ? 'Notes' : 'Notes'}>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors resize-none"
                  placeholder={fr ? 'Informations complémentaires…' : 'Additional notes…'} />
              </Field>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <Card className="p-4 sticky top-[72px]">
          <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{fr ? 'Informations' : 'Info'}</div>
          <div className="flex flex-col gap-3 text-[12.5px] text-muted">
            <div className="p-3 bg-bg rounded-lg border border-line-2">
              {fr
                ? 'Un exercice fiscal couvre une période de 12 mois. Vous pourrez importer les balances N et N-1 après création.'
                : 'A fiscal year covers a 12-month period. You can import N and N-1 balances after creation.'}
            </div>
            <div className="p-3 bg-amber-tint rounded-lg border border-amber/30 text-amber-700">
              {fr
                ? 'Assurez-vous que les dates correspondent aux déclarations fiscales de la société.'
                : 'Ensure dates match the company\'s tax filings.'}
            </div>
            <div className="p-3 bg-bg-2 rounded-lg border border-line-2 text-[12px] text-muted leading-relaxed">
              {fr
                ? 'Attention : changer la devise après l\'import de la balance ne convertit pas les montants — seul le libellé change. La devise GNF est obligatoire pour les dépôts DGI Guinée.'
                : 'Warning: changing currency after balance import does not convert amounts — only the label changes. GNF is required for DGI Guinea filings.'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
