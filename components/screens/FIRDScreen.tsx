'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/context/LangContext';
import { useAppData } from '@/lib/useAppData';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Progress } from '@/components/ui/Progress';
import { Icons } from '@/components/ui/Icon';
import {
  LEGAL_FORM_CODES,
  FISCAL_REGIME_CODES,
  ACTIVITY_CODES,
} from '@/lib/reference-data';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Shareholder {
  name: string;
  country: string;
  sharesPct: string;
  shareAmount: string;
}

interface BoardMember {
  name: string;
  title: string;
  nif: string;
}

interface Subsidiary {
  name: string;
  country: string;
  sharesPct: string;
}

interface FIRDData {
  id?: string;
  ministry_code?: string | null;
  tax_center_code?: string | null;
  deposit_center_code?: string | null;
  legal_form_code?: string | null;
  fiscal_regime_code?: string | null;
  importer_code?: string | null;
  bank_domiciliation?: string | null;
  social_security_number?: string | null;
  main_activity_code?: string | null;
  secondary_activity_code?: string | null;
  activity_percentage_main?: number | null;
  activity_percentage_secondary?: number | null;
  economic_activity_code?: string | null;
  accountant_name?: string | null;
  accountant_number?: string | null;
  auditor_name?: string | null;
  auditor_number?: string | null;
  signatory_name?: string | null;
  signatory_title?: string | null;
  signature_date?: string | null;
  shareholders?: Shareholder[] | null;
  board_members?: BoardMember[] | null;
  subsidiaries?: Subsidiary[] | null;
  status?: string;
  completion_pct?: number;
}

// ── Local form state shape ─────────────────────────────────────────────────────

interface FormState {
  ministryCode: string;
  taxCenterCode: string;
  depositCenterCode: string;
  legalFormCode: string;
  fiscalRegimeCode: string;
  importerCode: string;
  bankDomiciliation: string;
  socialSecurityNumber: string;
  mainActivityCode: string;
  secondaryActivityCode: string;
  activityPercentageMain: string;
  activityPercentageSecondary: string;
  economicActivityCode: string;
  accountantName: string;
  accountantNumber: string;
  auditorName: string;
  auditorNumber: string;
  signatoryName: string;
  signatoryTitle: string;
  signatureDate: string;
  shareholders: Shareholder[];
  boardMembers: BoardMember[];
  subsidiaries: Subsidiary[];
}

const EMPTY_FORM: FormState = {
  ministryCode: '',
  taxCenterCode: '',
  depositCenterCode: '',
  legalFormCode: '',
  fiscalRegimeCode: '',
  importerCode: '',
  bankDomiciliation: '',
  socialSecurityNumber: '',
  mainActivityCode: '',
  secondaryActivityCode: '',
  activityPercentageMain: '',
  activityPercentageSecondary: '',
  economicActivityCode: '',
  accountantName: '',
  accountantNumber: '',
  auditorName: '',
  auditorNumber: '',
  signatoryName: '',
  signatoryTitle: '',
  signatureDate: '',
  shareholders: [],
  boardMembers: [],
  subsidiaries: [],
};

function firdToForm(d: FIRDData): FormState {
  return {
    ministryCode: d.ministry_code ?? '',
    taxCenterCode: d.tax_center_code ?? '',
    depositCenterCode: d.deposit_center_code ?? '',
    legalFormCode: d.legal_form_code ?? '',
    fiscalRegimeCode: d.fiscal_regime_code ?? '',
    importerCode: d.importer_code ?? '',
    bankDomiciliation: d.bank_domiciliation ?? '',
    socialSecurityNumber: d.social_security_number ?? '',
    mainActivityCode: d.main_activity_code ?? '',
    secondaryActivityCode: d.secondary_activity_code ?? '',
    activityPercentageMain: d.activity_percentage_main != null ? String(d.activity_percentage_main) : '',
    activityPercentageSecondary: d.activity_percentage_secondary != null ? String(d.activity_percentage_secondary) : '',
    economicActivityCode: d.economic_activity_code ?? '',
    accountantName: d.accountant_name ?? '',
    accountantNumber: d.accountant_number ?? '',
    auditorName: d.auditor_name ?? '',
    auditorNumber: d.auditor_number ?? '',
    signatoryName: d.signatory_name ?? '',
    signatoryTitle: d.signatory_title ?? '',
    signatureDate: d.signature_date ? d.signature_date.slice(0, 10) : '',
    shareholders: (d.shareholders as Shareholder[]) ?? [],
    boardMembers: (d.board_members as BoardMember[]) ?? [],
    subsidiaries: (d.subsidiaries as Subsidiary[]) ?? [],
  };
}

// ── Mini UI primitives ────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function Select({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full border-t border-line-2 pt-4 mt-2 text-[11px] font-bold uppercase tracking-[.08em] text-muted-2">
      {children}
    </div>
  );
}

// ── Shareholder table ─────────────────────────────────────────────────────────

function ShareholderTable({
  rows,
  onChange,
  fr,
}: {
  rows: Shareholder[];
  onChange: (rows: Shareholder[]) => void;
  fr: boolean;
}) {
  const add = () =>
    onChange([...rows, { name: '', country: '', sharesPct: '', shareAmount: '' }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Shareholder, value: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    onChange(next);
  };

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-ink-2">
          {fr ? 'Actionnaires / associés' : 'Shareholders / partners'}
        </span>
        <Btn size="sm" variant="ghost" icon={<Icons.plus />} onClick={add}>
          {fr ? 'Ajouter' : 'Add'}
        </Btn>
      </div>
      {rows.length === 0 ? (
        <div className="text-[12px] text-muted py-3 text-center border border-dashed border-line-2 rounded-lg">
          {fr ? 'Aucun actionnaire enregistré.' : 'No shareholders recorded.'}
        </div>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden">
          <div
            className="grid text-[11px] font-semibold text-muted uppercase tracking-[.06em] bg-bg-2 px-3 py-2"
            style={{ gridTemplateColumns: '2fr 1.2fr 80px 1.2fr 32px' }}
          >
            <span>{fr ? 'Nom / Dénomination' : 'Name / Company'}</span>
            <span>{fr ? 'Pays' : 'Country'}</span>
            <span>%</span>
            <span>{fr ? 'Montant' : 'Amount'}</span>
            <span />
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid items-center gap-2 px-3 py-2 border-t border-line-2"
              style={{ gridTemplateColumns: '2fr 1.2fr 80px 1.2fr 32px' }}
            >
              <input
                value={row.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder={fr ? 'Nom' : 'Name'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.country}
                onChange={(e) => update(i, 'country', e.target.value)}
                placeholder={fr ? 'Pays' : 'Country'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.sharesPct}
                onChange={(e) => update(i, 'sharesPct', e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                max={100}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.shareAmount}
                onChange={(e) => update(i, 'shareAmount', e.target.value)}
                placeholder="0"
                type="number"
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <button
                onClick={() => remove(i)}
                className="w-7 h-7 rounded grid place-items-center text-muted hover:text-red hover:bg-red-soft transition-colors"
              >
                <Icons.x />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Board members table ───────────────────────────────────────────────────────

function BoardTable({
  rows,
  onChange,
  fr,
}: {
  rows: BoardMember[];
  onChange: (rows: BoardMember[]) => void;
  fr: boolean;
}) {
  const add = () => onChange([...rows, { name: '', title: '', nif: '' }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof BoardMember, value: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    onChange(next);
  };

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-ink-2">
          {fr ? 'Dirigeants et membres du CA' : 'Directors and board members'}
        </span>
        <Btn size="sm" variant="ghost" icon={<Icons.plus />} onClick={add}>
          {fr ? 'Ajouter' : 'Add'}
        </Btn>
      </div>
      {rows.length === 0 ? (
        <div className="text-[12px] text-muted py-3 text-center border border-dashed border-line-2 rounded-lg">
          {fr ? 'Aucun dirigeant enregistré.' : 'No directors recorded.'}
        </div>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden">
          <div
            className="grid text-[11px] font-semibold text-muted uppercase tracking-[.06em] bg-bg-2 px-3 py-2"
            style={{ gridTemplateColumns: '2fr 1.5fr 1fr 32px' }}
          >
            <span>{fr ? 'Nom / Dénomination' : 'Name'}</span>
            <span>{fr ? 'Fonction' : 'Title'}</span>
            <span>NIF</span>
            <span />
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid items-center gap-2 px-3 py-2 border-t border-line-2"
              style={{ gridTemplateColumns: '2fr 1.5fr 1fr 32px' }}
            >
              <input
                value={row.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder={fr ? 'Nom' : 'Name'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.title}
                onChange={(e) => update(i, 'title', e.target.value)}
                placeholder={fr ? 'Fonction' : 'Title'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.nif}
                onChange={(e) => update(i, 'nif', e.target.value)}
                placeholder="NIF"
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <button
                onClick={() => remove(i)}
                className="w-7 h-7 rounded grid place-items-center text-muted hover:text-red hover:bg-red-soft transition-colors"
              >
                <Icons.x />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subsidiaries table ────────────────────────────────────────────────────────

function SubsidiariesTable({
  rows,
  onChange,
  fr,
}: {
  rows: Subsidiary[];
  onChange: (rows: Subsidiary[]) => void;
  fr: boolean;
}) {
  const add = () => onChange([...rows, { name: '', country: '', sharesPct: '' }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Subsidiary, value: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    onChange(next);
  };

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-ink-2">
          {fr ? 'Filiales et participations' : 'Subsidiaries and participations'}
        </span>
        <Btn size="sm" variant="ghost" icon={<Icons.plus />} onClick={add}>
          {fr ? 'Ajouter' : 'Add'}
        </Btn>
      </div>
      {rows.length === 0 ? (
        <div className="text-[12px] text-muted py-3 text-center border border-dashed border-line-2 rounded-lg">
          {fr ? 'Aucune filiale enregistrée.' : 'No subsidiaries recorded.'}
        </div>
      ) : (
        <div className="border border-line rounded-lg overflow-hidden">
          <div
            className="grid text-[11px] font-semibold text-muted uppercase tracking-[.06em] bg-bg-2 px-3 py-2"
            style={{ gridTemplateColumns: '2fr 1.5fr 100px 32px' }}
          >
            <span>{fr ? 'Dénomination' : 'Name'}</span>
            <span>{fr ? 'Pays' : 'Country'}</span>
            <span>%</span>
            <span />
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid items-center gap-2 px-3 py-2 border-t border-line-2"
              style={{ gridTemplateColumns: '2fr 1.5fr 100px 32px' }}
            >
              <input
                value={row.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder={fr ? 'Nom' : 'Name'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.country}
                onChange={(e) => update(i, 'country', e.target.value)}
                placeholder={fr ? 'Pays' : 'Country'}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <input
                value={row.sharesPct}
                onChange={(e) => update(i, 'sharesPct', e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                max={100}
                className="w-full px-2 py-1.5 border border-line rounded text-[12.5px] bg-bg"
              />
              <button
                onClick={() => remove(i)}
                className="w-7 h-7 rounded grid place-items-center text-muted hover:text-red hover:bg-red-soft transition-colors"
              >
                <Icons.x />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function FIRDScreen() {
  const { lang } = useT();
  const { fiscalYears, companies } = useAppData();
  const fr = lang === 'fr';

  const activeFiscalYear = fiscalYears[0];
  const activeCompany = companies.find((c) => c.id === activeFiscalYear?.company_id);

  const [fird, setFird] = useState<FIRDData | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  const patch = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setDirty(true);
  };

  // Load FIRD data
  useEffect(() => {
    if (!activeFiscalYear?.id) return;
    setLoading(true);
    fetch(`/api/fird?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.fird) {
          setFird(data.fird);
          setForm(firdToForm(data.fird));
        }
      })
      .finally(() => setLoading(false));
  }, [activeFiscalYear?.id]);

  const handleSave = async () => {
    if (!activeFiscalYear?.id) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/fird', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          ministryCode: form.ministryCode || null,
          taxCenterCode: form.taxCenterCode || null,
          depositCenterCode: form.depositCenterCode || null,
          legalFormCode: form.legalFormCode || null,
          fiscalRegimeCode: form.fiscalRegimeCode || null,
          importerCode: form.importerCode || null,
          bankDomiciliation: form.bankDomiciliation || null,
          socialSecurityNumber: form.socialSecurityNumber || null,
          mainActivityCode: form.mainActivityCode || null,
          secondaryActivityCode: form.secondaryActivityCode || null,
          activityPercentageMain: form.activityPercentageMain ? Number(form.activityPercentageMain) : null,
          activityPercentageSecondary: form.activityPercentageSecondary ? Number(form.activityPercentageSecondary) : null,
          economicActivityCode: form.economicActivityCode || null,
          accountantName: form.accountantName || null,
          accountantNumber: form.accountantNumber || null,
          auditorName: form.auditorName || null,
          auditorNumber: form.auditorNumber || null,
          signatoryName: form.signatoryName || null,
          signatoryTitle: form.signatoryTitle || null,
          signatureDate: form.signatureDate || null,
          shareholders: form.shareholders.length ? form.shareholders : null,
          boardMembers: form.boardMembers.length ? form.boardMembers : null,
          subsidiaries: form.subsidiaries.length ? form.subsidiaries : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? (fr ? 'Erreur lors de la sauvegarde.' : 'Save failed.'));
        return;
      }
      setFird(data.fird);
      setDirty(false);
      setMessage(fr ? 'FIRD enregistré.' : 'FIRD saved.');
    } finally {
      setSaving(false);
    }
  };

  const completionPct = fird?.completion_pct ?? 0;

  // Derive exercise dates from fiscal year (ZA, ZB, ZC auto-fill)
  const openingDate = activeFiscalYear?.opening_date
    ? new Date(activeFiscalYear.opening_date).toLocaleDateString('fr-FR')
    : '—';
  const closingDate = activeFiscalYear?.closing_date
    ? new Date(activeFiscalYear.closing_date).toLocaleDateString('fr-FR')
    : '—';
  const yearN = activeFiscalYear?.year_n ?? '—';

  return (
    <div>
      <PageHeader
        eyebrow={
          activeCompany
            ? `${activeCompany.name} — ${activeFiscalYear?.label ?? ''}`
            : activeFiscalYear?.label
        }
        title={fr ? 'FIRD — Fiche d\'Identification et de Renseignements Divers' : 'FIRD — Identification & Miscellaneous Information Sheet'}
        subtitle={
          fr
            ? 'Renseignez les données statutaires d\'identification requises par la DGI pour le dossier fiscal annuel.'
            : 'Fill in the statutory identification data required by the tax authority for the annual tax file.'
        }
        actions={
          <>
            {dirty && (
              <span className="text-[12px] text-amber font-medium">
                {fr ? 'Modifications non sauvegardées' : 'Unsaved changes'}
              </span>
            )}
            <Btn
              variant="primary"
              icon={saving ? <Icons.spark /> : <Icons.check />}
              onClick={handleSave}
              disabled={saving || !activeFiscalYear?.id}
            >
              {saving ? (fr ? 'Sauvegarde...' : 'Saving...') : (fr ? 'Enregistrer' : 'Save')}
            </Btn>
          </>
        }
      >
        {/* Completion strip */}
        <div
          className="grid gap-4 px-5 py-4 bg-paper border border-line rounded-xl"
          style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}
        >
          <div>
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">
              {fr ? 'Complétude FIRD' : 'FIRD completion'}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[28px] font-medium font-serif">{completionPct}%</span>
              <span className={`text-[12px] font-semibold ${completionPct >= 100 ? 'text-green' : completionPct >= 50 ? 'text-amber' : 'text-red'}`}>
                {completionPct >= 100 ? (fr ? 'Complet' : 'Complete') : completionPct >= 50 ? (fr ? 'Partiel' : 'Partial') : (fr ? 'Incomplet' : 'Incomplete')}
              </span>
            </div>
            <Progress
              value={completionPct}
              height={5}
              color={completionPct >= 100 ? 'var(--color-green)' : completionPct >= 50 ? 'var(--color-amber)' : 'var(--color-red)'}
            />
          </div>
          {[
            { label: fr ? 'Exercice (ZA)' : 'Year (ZA)', value: String(yearN) },
            { label: fr ? 'Ouverture (ZB)' : 'Opening (ZB)', value: openingDate },
            { label: fr ? 'Clôture (ZC)' : 'Closing (ZC)', value: closingDate },
          ].map((s) => (
            <div key={s.label} className="border-l border-line-2 pl-4">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{s.label}</div>
              <div className="text-[16px] font-medium font-serif text-ink">{s.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <div className="px-8 py-12 text-center text-[13px] text-muted">
          {fr ? 'Chargement...' : 'Loading...'}
        </div>
      ) : (
        <div className="px-8 py-6 pb-12 flex flex-col gap-6">

          {message && (
            <div className="px-4 py-3 bg-green-soft border border-green/20 rounded-lg text-[13px] text-green font-medium">
              {message}
            </div>
          )}

          {/* ── Section 1: Identification administrative ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '1. Identification administrative' : '1. Administrative identification'}
              subtitle={fr ? 'Codes et numéros attribués par les administrations (DGI, greffe, douanes).' : 'Codes assigned by tax authority, registry, and customs.'}
            />
            <div className="px-5 pb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <Field label={fr ? 'Code ministère / Direction (ZD)' : 'Ministry / Division code (ZD)'} required>
                <Input
                  value={form.ministryCode}
                  onChange={(v) => patch({ ministryCode: v })}
                  placeholder="ex: 001"
                />
              </Field>
              <Field label={fr ? 'Centre des impôts (ZF)' : 'Tax center (ZF)'} required>
                <Input
                  value={form.taxCenterCode}
                  onChange={(v) => patch({ taxCenterCode: v })}
                  placeholder="ex: CGE"
                />
              </Field>
              <Field label={fr ? 'Centre de dépôt des états financiers (ZG)' : 'Financial statements deposit center (ZG)'}>
                <Input
                  value={form.depositCenterCode}
                  onChange={(v) => patch({ depositCenterCode: v })}
                  placeholder="ex: DGI-CONAKRY"
                />
              </Field>
              <Field label={fr ? 'Numéro CNSS / Sécurité sociale' : 'CNSS / Social security number'}>
                <Input
                  value={form.socialSecurityNumber}
                  onChange={(v) => patch({ socialSecurityNumber: v })}
                  placeholder="ex: GN-123456"
                />
              </Field>
              <Field label={fr ? 'Code importateur' : 'Importer code'}>
                <Input
                  value={form.importerCode}
                  onChange={(v) => patch({ importerCode: v })}
                  placeholder="ex: IMP-001"
                />
              </Field>
              <Field label={fr ? 'Domiciliation bancaire (ZH)' : 'Bank domiciliation (ZH)'}>
                <Input
                  value={form.bankDomiciliation}
                  onChange={(v) => patch({ bankDomiciliation: v })}
                  placeholder={fr ? 'Banque et n° de compte principal' : 'Bank and main account number'}
                />
              </Field>
            </div>
          </Card>

          {/* ── Section 2: Forme juridique et régime fiscal ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '2. Forme juridique et régime fiscal' : '2. Legal form and tax regime'}
              subtitle={fr ? 'Classification statutaire de la société.' : 'Statutory classification of the company.'}
            />
            <div className="px-5 pb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <Field label={fr ? 'Forme juridique (ZK)' : 'Legal form (ZK)'} required>
                <Select value={form.legalFormCode} onChange={(v) => patch({ legalFormCode: v })}>
                  <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                  {LEGAL_FORM_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.labelFr}</option>
                  ))}
                </Select>
              </Field>
              <Field label={fr ? 'Régime fiscal (ZL)' : 'Tax regime (ZL)'} required>
                <Select value={form.fiscalRegimeCode} onChange={(v) => patch({ fiscalRegimeCode: v })}>
                  <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                  {FISCAL_REGIME_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.labelFr}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          {/* ── Section 3: Activité économique ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '3. Activité économique' : '3. Economic activity'}
              subtitle={fr ? 'Nomenclature SYSCOHADA des activités — champs ZE, ZI, ZJ.' : 'SYSCOHADA activity nomenclature — fields ZE, ZI, ZJ.'}
            />
            <div className="px-5 pb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <Field label={fr ? 'Activité principale (ZE)' : 'Main activity (ZE)'} required>
                <Select value={form.mainActivityCode} onChange={(v) => patch({ mainActivityCode: v })}>
                  <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                  {ACTIVITY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.labelFr}</option>
                  ))}
                </Select>
              </Field>
              <Field label={fr ? '% CA activité principale' : '% turnover main activity'}>
                <Input
                  value={form.activityPercentageMain}
                  onChange={(v) => patch({ activityPercentageMain: v })}
                  type="number"
                  placeholder="0–100"
                />
              </Field>
              <Field label={fr ? 'Activité secondaire (ZI)' : 'Secondary activity (ZI)'}>
                <Select value={form.secondaryActivityCode} onChange={(v) => patch({ secondaryActivityCode: v })}>
                  <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                  {ACTIVITY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.labelFr}</option>
                  ))}
                </Select>
              </Field>
              <Field label={fr ? '% CA activité secondaire' : '% turnover secondary activity'}>
                <Input
                  value={form.activityPercentageSecondary}
                  onChange={(v) => patch({ activityPercentageSecondary: v })}
                  type="number"
                  placeholder="0–100"
                />
              </Field>
              <Field label={fr ? 'Code économique (ZJ)' : 'Economic code (ZJ)'} required>
                <Input
                  value={form.economicActivityCode}
                  onChange={(v) => patch({ economicActivityCode: v })}
                  placeholder="ex: B1"
                />
              </Field>
            </div>
          </Card>

          {/* ── Section 4: Personnel et signataires ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '4. Expert-comptable, commissaire et signataire' : '4. Accountant, auditor and signatory'}
              subtitle={fr ? 'Identificatiion des professionnels responsables de la liasse.' : 'Professionals responsible for the financial package.'}
            />
            <div className="px-5 pb-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <SectionTitle>{fr ? 'Expert-comptable (ZN)' : 'Chartered accountant (ZN)'}</SectionTitle>
              <Field label={fr ? 'Nom / Dénomination' : 'Name'} required>
                <Input
                  value={form.accountantName}
                  onChange={(v) => patch({ accountantName: v })}
                  placeholder={fr ? 'Nom de l\'expert-comptable ou du cabinet' : 'Accountant or firm name'}
                />
              </Field>
              <Field label={fr ? 'Numéro d\'inscription OEC / ONEC' : 'OEC / ONEC membership number'}>
                <Input
                  value={form.accountantNumber}
                  onChange={(v) => patch({ accountantNumber: v })}
                  placeholder="ex: OEC-2024-001"
                />
              </Field>

              <SectionTitle>{fr ? 'Commissaire aux comptes (ZO)' : 'Statutory auditor (ZO)'}</SectionTitle>
              <Field label={fr ? 'Nom / Dénomination' : 'Name'}>
                <Input
                  value={form.auditorName}
                  onChange={(v) => patch({ auditorName: v })}
                  placeholder={fr ? 'Nom du commissaire' : 'Auditor name'}
                />
              </Field>
              <Field label={fr ? 'Numéro d\'inscription CNCC / ONEC' : 'CNCC / ONEC registration number'}>
                <Input
                  value={form.auditorNumber}
                  onChange={(v) => patch({ auditorNumber: v })}
                  placeholder="ex: CNCC-2024-001"
                />
              </Field>

              <SectionTitle>{fr ? 'Signataire de la liasse (ZP)' : 'Package signatory (ZP)'}</SectionTitle>
              <Field label={fr ? 'Nom du signataire' : 'Signatory name'} required>
                <Input
                  value={form.signatoryName}
                  onChange={(v) => patch({ signatoryName: v })}
                  placeholder={fr ? 'Nom et prénom' : 'First and last name'}
                />
              </Field>
              <Field label={fr ? 'Qualité / Titre' : 'Title / Capacity'}>
                <Input
                  value={form.signatoryTitle}
                  onChange={(v) => patch({ signatoryTitle: v })}
                  placeholder={fr ? 'ex: Directeur Général, Gérant, ...' : 'ex: CEO, Manager, ...'}
                />
              </Field>
              <Field label={fr ? 'Date de signature' : 'Signature date'} required>
                <Input
                  value={form.signatureDate}
                  onChange={(v) => patch({ signatureDate: v })}
                  type="date"
                />
              </Field>
            </div>
          </Card>

          {/* ── Section 5: Actionnaires ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '5. Actionnaires et associés' : '5. Shareholders and partners'}
              subtitle={fr ? 'Répartition du capital social (ZQ).' : 'Share capital breakdown (ZQ).'}
            />
            <div className="px-5 pb-5">
              <ShareholderTable
                rows={form.shareholders}
                onChange={(rows) => patch({ shareholders: rows })}
                fr={fr}
              />
            </div>
          </Card>

          {/* ── Section 6: Dirigeants ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '6. Dirigeants et membres du conseil d\'administration' : '6. Directors and board of directors'}
              subtitle={fr ? 'Personnes physiques ou morales exerçant la direction ou le contrôle (ZR).' : 'Natural or legal persons exercising management or control (ZR).'}
            />
            <div className="px-5 pb-5">
              <BoardTable
                rows={form.boardMembers}
                onChange={(rows) => patch({ boardMembers: rows })}
                fr={fr}
              />
            </div>
          </Card>

          {/* ── Section 7: Filiales ── */}
          <Card className="p-0">
            <CardHeader
              title={fr ? '7. Filiales et participations' : '7. Subsidiaries and participations'}
              subtitle={fr ? 'Sociétés dans lesquelles la société détient une participation (ZS).' : 'Companies in which this company holds a participation (ZS).'}
            />
            <div className="px-5 pb-5">
              <SubsidiariesTable
                rows={form.subsidiaries}
                onChange={(rows) => patch({ subsidiaries: rows })}
                fr={fr}
              />
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}
