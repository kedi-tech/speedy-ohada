'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppData } from '@/lib/useAppData';

type Tab = 'firm' | 'preferences' | 'security' | 'billing';

const COUNTRIES = [
  "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger',
  'Guinée', 'Togo', 'Bénin', 'Cameroun', 'Congo', 'Gabon', 'RDC', 'Autre',
];

const PLANS = [
  { value: 'starter',       fr: 'Starter',       en: 'Starter' },
  { value: 'cabinet',       fr: 'Cabinet',        en: 'Cabinet' },
  { value: 'cabinet_pro',   fr: 'Cabinet Pro',    en: 'Cabinet Pro' },
  { value: 'enterprise',    fr: 'Entreprise',     en: 'Enterprise' },
];

export function SettingsScreen() {
  const { lang, setLang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<Tab>('firm');

  const { organizations, loading: dataLoading } = useAppData();
  const org = organizations[0];

  const [form, setForm] = useState({
    name: '', adminEmail: '', plan: 'starter', oneccaNumber: '',
    rccm: '', address: '', city: '', country: '', phone: '', email: '', website: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        name:         org.name         ?? '',
        adminEmail:   org.adminEmail   ?? '',
        plan:         org.plan         ?? 'starter',
        oneccaNumber: org.oneccaNumber ?? '',
        rccm:         org.rccm         ?? '',
        address:      org.address      ?? '',
        city:         org.city         ?? '',
        country:      org.country      ?? '',
        phone:        org.phone        ?? '',
        email:        org.email        ?? '',
        website:      org.website      ?? '',
      });
    }
  }, [org]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSaveFirm = async () => {
    if (!org?.id) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setSaveError(d.error ?? (fr ? 'Erreur lors de la sauvegarde' : 'Save failed'));
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError(fr ? 'Erreur réseau' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!org?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organizations/${org.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/login');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const tabs: { key: Tab; fr: string; en: string }[] = [
    { key: 'firm',        fr: 'Cabinet',     en: 'Firm' },
    { key: 'preferences', fr: 'Préférences', en: 'Preferences' },
    { key: 'security',    fr: 'Sécurité',    en: 'Security' },
    { key: 'billing',     fr: 'Facturation', en: 'Billing' },
  ];

  function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
      <div>
        <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
          {label}{required && <span className="text-red ml-0.5">*</span>}
        </label>
        {children}
      </div>
    );
  }

  function Input({ value, onChange, placeholder, type = 'text' }: {
    value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string; type?: string;
  }) {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
      />
    );
  }

  function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-line-2 last:border-none">
        <span className="text-[13px] text-ink">{label}</span>
        <button onClick={onChange} className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-rust' : 'bg-bg-2'}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  }

  const [toggles, setToggles] = useState({ emailNotifs: true, reviewAlerts: true, exportAlerts: false });
  const toggle = (key: keyof typeof toggles) => setToggles((p) => ({ ...p, [key]: !p[key] }));

  const isFirmTab = tab === 'firm';
  const orgInitial = org?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div>
      <PageHeader
        title={fr ? 'Paramètres' : 'Settings'}
        subtitle={org?.name ?? (dataLoading ? '…' : (fr ? 'Cabinet' : 'Firm'))}
        actions={
          isFirmTab ? (
            <Btn
              variant="primary"
              icon={saved ? <Icons.check /> : saving ? undefined : undefined}
              onClick={handleSaveFirm}
              disabled={saving || dataLoading || !org}
            >
              {saving ? (fr ? 'Enregistrement…' : 'Saving…') : saved ? (fr ? 'Enregistré !' : 'Saved!') : (fr ? 'Enregistrer' : 'Save')}
            </Btn>
          ) : null
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-line">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
              style={{ borderColor: tab === t.key ? 'var(--color-rust)' : 'transparent', color: tab === t.key ? 'var(--color-rust)' : 'var(--color-muted)' }}>
              {fr ? t.fr : t.en}
            </button>
          ))}
        </div>

        {/* ── FIRM TAB ── */}
        {tab === 'firm' && (
          <div className="flex flex-col gap-5">
            {saveError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red/8 border border-red/20 text-red text-[13px]">
                <Icons.alert /> {saveError}
              </div>
            )}

            <Card>
              <CardHeader title={fr ? 'Identité du cabinet' : 'Firm identity'} />
              <div className="px-5 py-5 grid gap-4 max-w-xl">
                {/* Logo row */}
                <Field label={fr ? 'Logo du cabinet' : 'Firm logo'}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rust/10 grid place-items-center text-rust text-xl font-bold flex-shrink-0">
                      {orgInitial}
                    </div>
                    <Btn variant="secondary" size="sm">{fr ? 'Changer le logo' : 'Change logo'}</Btn>
                  </div>
                </Field>

                <Field label={fr ? 'Nom du cabinet *' : 'Firm name *'} required>
                  <Input value={form.name} onChange={set('name')} placeholder={fr ? 'Cabinet Dupont & Associés' : 'Dupont & Associates'} />
                </Field>
                <Field label={fr ? 'Email administrateur *' : 'Admin email *'} required>
                  <Input value={form.adminEmail} onChange={set('adminEmail')} type="email" placeholder="admin@cabinet.ci" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Numéro ONECCA' : 'ONECCA number'}>
                    <Input value={form.oneccaNumber} onChange={set('oneccaNumber')} placeholder="CI-2019-CEC-00142" />
                  </Field>
                  <Field label="RCCM">
                    <Input value={form.rccm} onChange={set('rccm')} placeholder="CI-ABJ-2019-B-04521" />
                  </Field>
                </div>
                <Field label={fr ? 'Plan' : 'Plan'}>
                  <select
                    value={form.plan}
                    onChange={set('plan')}
                    className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust"
                  >
                    {PLANS.map((p) => (
                      <option key={p.value} value={p.value}>{fr ? p.fr : p.en}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title={fr ? 'Coordonnées' : 'Contact details'} />
              <div className="px-5 py-5 grid gap-4 max-w-xl">
                <Field label={fr ? 'Adresse' : 'Address'}>
                  <Input value={form.address} onChange={set('address')} placeholder="Cocody Riviera Palmeraie" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Ville' : 'City'}>
                    <Input value={form.city} onChange={set('city')} placeholder="Abidjan" />
                  </Field>
                  <Field label={fr ? 'Pays' : 'Country'}>
                    <select
                      value={form.country}
                      onChange={set('country')}
                      className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust"
                    >
                      <option value="">{fr ? '— Choisir —' : '— Select —'}</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={fr ? 'Téléphone' : 'Phone'}>
                    <Input value={form.phone} onChange={set('phone')} placeholder="+225 27 22 41 36 00" />
                  </Field>
                  <Field label="Email">
                    <Input value={form.email} onChange={set('email')} type="email" placeholder="contact@cabinet.ci" />
                  </Field>
                </div>
                <Field label={fr ? 'Site web' : 'Website'}>
                  <Input value={form.website} onChange={set('website')} placeholder="https://cabinet.ci" />
                </Field>
              </div>
            </Card>

            {/* Danger zone */}
            <Card className="border-red/20">
              <CardHeader
                title={fr ? 'Zone dangereuse' : 'Danger zone'}
                subtitle={fr ? 'Ces actions sont irréversibles.' : 'These actions are irreversible.'}
              />
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13px] font-semibold text-ink">
                    {fr ? 'Supprimer le cabinet' : 'Delete this firm'}
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">
                    {fr
                      ? 'Supprime définitivement le cabinet et toutes ses sociétés, exercices et données.'
                      : 'Permanently deletes the firm and all its companies, fiscal years, and data.'}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex-shrink-0 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-red border border-red/30 hover:bg-red/8 transition-colors"
                >
                  {fr ? 'Supprimer le cabinet' : 'Delete firm'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {tab === 'preferences' && (
          <Card>
            <CardHeader title={fr ? "Préférences d'affichage" : 'Display preferences'} />
            <div className="px-5 py-5 max-w-xl flex flex-col gap-5">
              <Field label={fr ? 'Langue par défaut' : 'Default language'}>
                <select value={lang} onChange={(e) => setLang(e.target.value as 'fr' | 'en')}
                  className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </Field>
              <div>
                <div className="text-[12.5px] font-semibold text-ink-2 mb-2">{fr ? 'Notifications' : 'Notifications'}</div>
                <Toggle checked={toggles.emailNotifs} onChange={() => toggle('emailNotifs')} label={fr ? 'Notifications par email' : 'Email notifications'} />
                <Toggle checked={toggles.reviewAlerts} onChange={() => toggle('reviewAlerts')} label={fr ? 'Alertes de révision' : 'Review alerts'} />
                <Toggle checked={toggles.exportAlerts} onChange={() => toggle('exportAlerts')} label={fr ? "Notifications d'export" : 'Export notifications'} />
              </div>
            </div>
          </Card>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <Card>
            <CardHeader title={fr ? 'Mot de passe' : 'Password'} />
            <div className="px-5 py-5 max-w-sm flex flex-col gap-4">
              {[
                { label: fr ? 'Mot de passe actuel' : 'Current password' },
                { label: fr ? 'Nouveau mot de passe' : 'New password' },
                { label: fr ? 'Confirmer' : 'Confirm' },
              ].map((f, i) => (
                <Field key={i} label={f.label}>
                  <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
                </Field>
              ))}
              <Btn variant="primary" className="self-start">{fr ? 'Mettre à jour' : 'Update'}</Btn>
            </div>
          </Card>
        )}

        {/* ── BILLING TAB ── */}
        {tab === 'billing' && (
          <div className="flex flex-col gap-4">
            <div className="bg-paper border border-line rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{fr ? 'Plan actuel' : 'Current plan'}</div>
                <div className="text-[18px] font-bold text-ink">{PLANS.find((p) => p.value === (org?.plan ?? 'starter'))?.[fr ? 'fr' : 'en'] ?? 'Starter'}</div>
              </div>
              <Btn variant="secondary">{fr ? 'Changer de plan' : 'Change plan'}</Btn>
            </div>
            <Card>
              <CardHeader title={fr ? 'Historique de facturation' : 'Billing history'} />
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                {fr ? 'Aucune facture disponible.' : 'No invoices available.'}
              </div>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteOrg}
        loading={deleting}
        danger
        requireTyped={org?.name}
        title={fr ? 'Supprimer le cabinet' : 'Delete firm'}
        description={
          fr
            ? `Cette action supprime définitivement le cabinet "${org?.name}" ainsi que toutes ses sociétés, exercices fiscaux, balances et données associées. Cette opération est irréversible.`
            : `This action permanently deletes the firm "${org?.name}" along with all its companies, fiscal years, trial balances, and associated data. This cannot be undone.`
        }
        confirmLabel={fr ? 'Supprimer définitivement' : 'Delete permanently'}
        cancelLabel={fr ? 'Annuler' : 'Cancel'}
      />
    </div>
  );
}
