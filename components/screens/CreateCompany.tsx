'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

const STEPS = ['identity', 'contact', 'fiscal', 'people'] as const;
type Step = typeof STEPS[number];

const LEGAL_FORMS = ['SARL', 'SA', 'SAS', 'SASU', 'SNC', 'GIE', 'Entreprise individuelle', 'Autre'];
const CURRENCIES = ['GNF', 'XOF', 'XAF', 'EUR', 'USD', 'MAD', 'DZD'];
const TAX_REGIMES_FR = ['Régime réel normal', 'Régime réel simplifié', 'Régime de la taxe professionnelle unique', 'Non assujetti'];
const TAX_REGIMES_EN = ['Normal real regime', 'Simplified real regime', 'Single professional tax', 'Not subject'];
const COUNTRIES = ["Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'Togo', 'Bénin', 'Cameroun', 'Congo', 'Gabon', 'RDC', 'Autre'];

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

export interface CompanyFormData {
  id?:                string;
  name:               string;
  legalName:          string;
  commercialName:     string;
  legalForm:          string;
  rccm:               string;
  nif:                string;
  sector:             string;
  mainActivity:       string;
  currency:           string;
  address:            string;
  city:               string;
  country:            string;
  phone:              string;
  email:              string;
  website:            string;
  taxCenter:          string;
  taxRegime:          string;
  accountingStandard: string;
  managerName:        string;
  managerTitle:       string;
  accountantName:     string;
  accountantContact:  string;
  auditorName:        string;
  auditorContact:     string;
  notes:              string;
}

const EMPTY_FORM: CompanyFormData = {
  name: '', legalName: '', commercialName: '', legalForm: '', rccm: '', nif: '',
  sector: '', mainActivity: '', currency: 'GNF', address: '', city: '', country: '',
  phone: '', email: '', website: '', taxCenter: '', taxRegime: '',
  accountingStandard: 'SYSCOHADA', managerName: '', managerTitle: '',
  accountantName: '', accountantContact: '', auditorName: '', auditorContact: '', notes: '',
};

interface Props {
  initialData?: Partial<CompanyFormData>;
  companyId?:   string;
}

export function CreateCompany({ initialData, companyId }: Props) {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const isEdit = !!companyId;

  const [step, setStep] = useState<Step>('identity');
  const [form, setForm] = useState<CompanyFormData>({ ...EMPTY_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const stepIndex = STEPS.indexOf(step);

  const set = (field: keyof CompanyFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const steps = [
    { key: 'identity', fr: 'Identité',  en: 'Identity' },
    { key: 'contact',  fr: 'Contact',   en: 'Contact' },
    { key: 'fiscal',   fr: 'Fiscal',    en: 'Tax' },
    { key: 'people',   fr: 'Personnes', en: 'People' },
  ];

  const save = async () => {
    setError('');
    if (!form.name.trim()) {
      setError(fr ? 'Le nom de la société est obligatoire.' : 'Company name is required.');
      setStep('identity');
      return;
    }

    setSaving(true);
    const url    = isEdit ? `/api/companies/${companyId}` : '/api/companies';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (!res.ok) {
      setError(fr ? 'Impossible de sauvegarder la société.' : 'Could not save company.');
      return;
    }

    router.push(isEdit ? `/companies/${companyId}` : '/companies');
    router.refresh();
  };

  const handleNext = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
    else void save();
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? (fr ? 'Modifier la société' : 'Edit company') : (fr ? 'Nouvelle société' : 'New company')}
        subtitle={fr ? 'Renseignez les informations de la société.' : 'Fill in the company details.'}
        actions={
          <>
            <Btn variant="ghost" onClick={() => router.push(isEdit ? `/companies/${companyId}` : '/companies')}>
              {fr ? 'Annuler' : 'Cancel'}
            </Btn>
            <Btn
              variant="primary"
              icon={stepIndex === STEPS.length - 1 ? <Icons.check /> : <Icons.arrowRight />}
              onClick={handleNext}
              disabled={saving}
            >
              {stepIndex === STEPS.length - 1
                ? (fr ? (isEdit ? 'Enregistrer' : 'Créer la société') : (isEdit ? 'Save' : 'Create company'))
                : (fr ? 'Suivant' : 'Next')}
            </Btn>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 grid gap-6" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
        <div className="flex flex-col gap-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-soft border border-red/20 text-[13px] text-red">{error}</div>
          )}

          {/* Step tabs */}
          <div className="flex gap-0">
            {steps.map((s, i) => {
              const done = i < stepIndex;
              const active = s.key === step;
              return (
                <button key={s.key} onClick={() => setStep(s.key as Step)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors"
                  style={{ borderColor: active ? 'var(--color-rust)' : done ? 'var(--color-green)' : 'var(--color-line)', color: active ? 'var(--color-rust)' : done ? 'var(--color-green)' : 'var(--color-muted)' }}>
                  <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold ${done ? 'bg-green text-white' : active ? 'bg-rust text-white' : 'bg-bg-2 text-muted'}`}>
                    {done ? <Icons.check /> : String(i + 1)}
                  </span>
                  {fr ? s.fr : s.en}
                </button>
              );
            })}
          </div>

          {/* Identity */}
          {step === 'identity' && (
            <Card>
              <CardHeader title={fr ? 'Identité légale' : 'Legal identity'} />
              <div className="px-5 py-5 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Nom de la société *' : 'Company name *'}>
                    <Input placeholder={fr ? 'Nom de la société' : 'Company name'} value={form.name} onChange={set('name')} />
                  </Field>
                  <Field label={fr ? 'Raison sociale' : 'Legal name'}>
                    <Input placeholder={fr ? 'Raison sociale complète' : 'Full legal name'} value={form.legalName} onChange={set('legalName')} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Nom commercial' : 'Commercial name'}>
                    <Input placeholder={fr ? 'Nom commercial si différent' : 'Trade name if different'} value={form.commercialName} onChange={set('commercialName')} />
                  </Field>
                  <Field label={fr ? 'Forme juridique' : 'Legal form'}>
                    <Select value={form.legalForm} onChange={set('legalForm')}>
                      <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                      {LEGAL_FORMS.map((f) => <option key={f}>{f}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Numéro RCCM' : 'RCCM number'}>
                    <Input placeholder="CI-ABJ-2024-B-XXXXX" value={form.rccm} onChange={set('rccm')} />
                  </Field>
                  <Field label={fr ? 'NIF' : 'Tax ID (NIF)'}>
                    <Input placeholder="XXXXXXXX" value={form.nif} onChange={set('nif')} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? "Secteur d'activité" : 'Business sector'}>
                    <Input placeholder={fr ? 'Ex: Industrie agroalimentaire' : 'e.g., Food & Beverage'} value={form.sector} onChange={set('sector')} />
                  </Field>
                  <Field label={fr ? 'Activité principale' : 'Main activity'}>
                    <Input placeholder={fr ? 'Description courte' : 'Short description'} value={form.mainActivity} onChange={set('mainActivity')} />
                  </Field>
                </div>
                <Field label={fr ? 'Devise *' : 'Currency *'}>
                  <Select value={form.currency} onChange={set('currency')}>
                    {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </Field>
              </div>
            </Card>
          )}

          {/* Contact */}
          {step === 'contact' && (
            <Card>
              <CardHeader title={fr ? 'Coordonnées' : 'Contact details'} />
              <div className="px-5 py-5 grid gap-4">
                <Field label={fr ? 'Adresse' : 'Address'}>
                  <Input placeholder={fr ? 'Rue, avenue, lot…' : 'Street, avenue, lot…'} value={form.address} onChange={set('address')} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Ville' : 'City'}>
                    <Input placeholder="Conakry" value={form.city} onChange={set('city')} />
                  </Field>
                  <Field label={fr ? 'Pays' : 'Country'}>
                    <Select value={form.country} onChange={set('country')}>
                      <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Téléphone' : 'Phone'}>
                    <Input type="tel" placeholder="+224 XX XX XX XX" value={form.phone} onChange={set('phone')} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" placeholder="contact@société.com" value={form.email} onChange={set('email')} />
                  </Field>
                </div>
                <Field label={fr ? 'Site web' : 'Website'}>
                  <Input placeholder="https://www.société.com" value={form.website} onChange={set('website')} />
                </Field>
              </div>
            </Card>
          )}

          {/* Fiscal */}
          {step === 'fiscal' && (
            <Card>
              <CardHeader title={fr ? 'Informations fiscales' : 'Tax information'} />
              <div className="px-5 py-5 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Centre des impôts' : 'Tax center'}>
                    <Input placeholder={fr ? 'Ex: DGI Conakry' : 'e.g., Tax office'} value={form.taxCenter} onChange={set('taxCenter')} />
                  </Field>
                  <Field label={fr ? 'Régime fiscal' : 'Tax regime'}>
                    <Select value={form.taxRegime} onChange={set('taxRegime')}>
                      <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
                      {(fr ? TAX_REGIMES_FR : TAX_REGIMES_EN).map((r) => <option key={r}>{r}</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label={fr ? 'Référentiel comptable' : 'Accounting standard'}>
                  <Select value={form.accountingStandard} onChange={set('accountingStandard')}>
                    <option value="SYSCOHADA">SYSCOHADA Révisé (OHADA)</option>
                    <option value="IFRS">IFRS</option>
                    <option value="local">{fr ? 'Normes locales' : 'Local standards'}</option>
                  </Select>
                </Field>
                <div className="p-4 bg-bg rounded-xl border border-line">
                  <div className="text-[12.5px] text-muted">
                    {fr
                      ? 'Le référentiel SYSCOHADA Révisé est utilisé par défaut pour les états OHADA.'
                      : 'SYSCOHADA Revised is used by default for OHADA statements.'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* People */}
          {step === 'people' && (
            <Card>
              <CardHeader title={fr ? 'Dirigeants et intervenants' : 'Management & contacts'} />
              <div className="px-5 py-5 grid gap-5">
                <div>
                  <div className="text-[11px] font-bold text-muted uppercase tracking-[.08em] mb-3">{fr ? 'Dirigeant' : 'Manager'}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={fr ? 'Nom du dirigeant' : 'Manager name'}>
                      <Input placeholder={fr ? 'Nom complet' : 'Full name'} value={form.managerName} onChange={set('managerName')} />
                    </Field>
                    <Field label={fr ? 'Fonction' : 'Title'}>
                      <Input placeholder={fr ? 'Ex: Directeur Général' : 'e.g., CEO'} value={form.managerTitle} onChange={set('managerTitle')} />
                    </Field>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted uppercase tracking-[.08em] mb-3">{fr ? 'Comptable' : 'Accountant'}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={fr ? 'Nom du comptable' : 'Accountant name'}>
                      <Input placeholder={fr ? 'Nom complet' : 'Full name'} value={form.accountantName} onChange={set('accountantName')} />
                    </Field>
                    <Field label="Contact">
                      <Input placeholder={fr ? 'Email ou téléphone' : 'Email or phone'} value={form.accountantContact} onChange={set('accountantContact')} />
                    </Field>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-muted uppercase tracking-[.08em] mb-3">{fr ? 'Auditeur' : 'Auditor'}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={fr ? "Nom de l'auditeur" : 'Auditor name'}>
                      <Input placeholder={fr ? 'Nom complet ou cabinet' : 'Full name or firm'} value={form.auditorName} onChange={set('auditorName')} />
                    </Field>
                    <Field label="Contact">
                      <Input placeholder={fr ? 'Email ou téléphone' : 'Email or phone'} value={form.auditorContact} onChange={set('auditorContact')} />
                    </Field>
                  </div>
                </div>
                <Field label={fr ? 'Notes internes' : 'Internal notes'}>
                  <textarea rows={3}
                    className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors resize-none"
                    placeholder={fr ? 'Informations complémentaires…' : 'Additional information…'}
                    value={form.notes}
                    onChange={set('notes')}
                  />
                </Field>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <Card className="p-4 sticky top-[72px]">
          <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{fr ? 'Résumé' : 'Summary'}</div>
          {[
            { label: fr ? 'Identité' : 'Identity', done: stepIndex > 0 },
            { label: fr ? 'Contact' : 'Contact',   done: stepIndex > 1 },
            { label: fr ? 'Fiscal' : 'Tax',         done: stepIndex > 2 },
            { label: fr ? 'Personnes' : 'People',   done: stepIndex > 3 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 border-b border-line-2 last:border-none">
              <span className={`w-5 h-5 rounded-full grid place-items-center ${s.done ? 'bg-green text-white' : 'bg-bg-2 text-muted-2'}`}>
                {s.done ? <Icons.check /> : <span className="text-[10px]">{i + 1}</span>}
              </span>
              <span className={`text-[12.5px] ${s.done ? 'text-green font-medium' : 'text-muted'}`}>{s.label}</span>
            </div>
          ))}
          {form.currency && (
            <div className="mt-3 p-3 bg-bg rounded-lg border border-line-2 text-[12px] text-muted">
              {fr ? `Devise : ${form.currency}` : `Currency: ${form.currency}`}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
