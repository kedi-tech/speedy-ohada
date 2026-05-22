'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

type Tab = 'firm' | 'preferences' | 'security' | 'integrations' | 'billing';

export function SettingsScreen() {
  const { lang, setLang } = useT();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<Tab>('firm');
  const [saved, setSaved] = useState(false);

  const tabs: { key: Tab; fr: string; en: string }[] = [
    { key: 'firm',         fr: 'Cabinet',             en: 'Firm' },
    { key: 'preferences',  fr: 'Préférences',          en: 'Preferences' },
    { key: 'security',     fr: 'Sécurité',             en: 'Security' },
    // { key: 'integrations', fr: 'Intégrations',         en: 'Integrations' },
    { key: 'billing',      fr: 'Facturation',          en: 'Billing' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

  const [toggles, setToggles] = useState({
    emailNotifs: true,
    reviewAlerts: true,
    exportAlerts: false,
    twoFactor: false,
    sessionTimeout: true,
  });
  const toggle = (key: keyof typeof toggles) => setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <PageHeader
        title={fr ? 'Paramètres' : 'Settings'}
        subtitle={fr ? 'Cabinet Diaby Ibrahim & Associés' : 'Cabinet Diaby Ibrahim & Associates'}
        actions={
          <Btn variant="primary" icon={saved ? <Icons.check /> : undefined} onClick={handleSave}>
            {saved ? (fr ? 'Enregistré !' : 'Saved!') : (fr ? 'Enregistrer' : 'Save')}
          </Btn>
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

        {/* Firm settings */}
        {tab === 'firm' && (
          <Card>
            <CardHeader title={fr ? 'Informations du cabinet' : 'Firm information'} />
            <div className="px-5 py-5 grid gap-4 max-w-xl">
              <Field label={fr ? 'Nom du cabinet *' : 'Firm name *'}>
                <Input defaultValue="Cabinet Diaby Ibrahim & Associés" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={fr ? 'Numéro ONECCA' : 'ONECCA number'}>
                  <Input defaultValue="CI-2019-CEC-00142" />
                </Field>
                <Field label={fr ? 'RCCM' : 'RCCM'}>
                  <Input defaultValue="CI-ABJ-2019-B-04521" />
                </Field>
              </div>
              <Field label={fr ? 'Adresse' : 'Address'}>
                <Input defaultValue="Cocody Riviera Palmeraie, Abidjan" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={fr ? 'Téléphone' : 'Phone'}>
                  <Input defaultValue="+225 27 22 41 36 XX" />
                </Field>
                <Field label="Email">
                  <Input defaultValue="contact@cabinet-diaby.ci" />
                </Field>
              </div>
              <Field label={fr ? 'Site web' : 'Website'}>
                <Input defaultValue="https://cabinet-diaby.ci" />
              </Field>
              <Field label={fr ? 'Logo du cabinet' : 'Firm logo'}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-rust/10 grid place-items-center text-rust font-bold text-lg">D</div>
                  <Btn variant="secondary">{fr ? 'Changer le logo' : 'Change logo'}</Btn>
                </div>
              </Field>
            </div>
          </Card>
        )}

        {/* Preferences */}
        {tab === 'preferences' && (
          <Card>
            <CardHeader title={fr ? 'Préférences d\'affichage' : 'Display preferences'} />
            <div className="px-5 py-5 max-w-xl flex flex-col gap-5">
              <Field label={fr ? 'Langue par défaut' : 'Default language'}>
                <select value={lang} onChange={(e) => setLang(e.target.value as 'fr' | 'en')}
                  className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </Field>
              <Field label={fr ? 'Devise par défaut' : 'Default currency'}>
                <select className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                  {['GNF', 'EUR', 'USD'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={fr ? 'Format de date' : 'Date format'}>
                <select className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </Field>
              <div>
                <div className="text-[12.5px] font-semibold text-ink-2 mb-2">{fr ? 'Notifications' : 'Notifications'}</div>
                <Toggle checked={toggles.emailNotifs} onChange={() => toggle('emailNotifs')} label={fr ? 'Notifications par email' : 'Email notifications'} />
                <Toggle checked={toggles.reviewAlerts} onChange={() => toggle('reviewAlerts')} label={fr ? 'Alertes de révision' : 'Review alerts'} />
                <Toggle checked={toggles.exportAlerts} onChange={() => toggle('exportAlerts')} label={fr ? 'Notifications d\'export' : 'Export notifications'} />
              </div>
            </div>
          </Card>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader title={fr ? 'Mot de passe' : 'Password'} />
              <div className="px-5 py-5 max-w-sm flex flex-col gap-4">
                <Field label={fr ? 'Mot de passe actuel' : 'Current password'}>
                  <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
                </Field>
                <Field label={fr ? 'Nouveau mot de passe' : 'New password'}>
                  <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
                </Field>
                <Field label={fr ? 'Confirmer' : 'Confirm'}>
                  <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
                </Field>
                <Btn variant="primary" className="self-start">{fr ? 'Mettre à jour' : 'Update'}</Btn>
              </div>
            </Card>
            {/* <Card>
              <CardHeader title={fr ? 'Authentification à deux facteurs' : 'Two-factor authentication'} />
              <div className="px-5 py-4">
                <Toggle checked={toggles.twoFactor} onChange={() => toggle('twoFactor')} label={fr ? 'Activer la 2FA par email/SMS' : 'Enable 2FA via email/SMS'} />
                <Toggle checked={toggles.sessionTimeout} onChange={() => toggle('sessionTimeout')} label={fr ? 'Déconnexion automatique après 30 min' : 'Auto-logout after 30 min'} />
              </div>
            </Card> */}
          </div>
        )}

        {/* Integrations */}
        {tab === 'integrations' && (
          <Card>
            <CardHeader title={fr ? 'Intégrations disponibles' : 'Available integrations'} />
            <div className="px-5 py-5 flex flex-col gap-3">
              {[
                { name: 'Sage Paie & RH', desc: fr ? 'Importation automatique des charges de personnel' : 'Automatic personnel cost import', connected: true },
                { name: 'DGI e-Impôts CI', desc: fr ? 'Envoi électronique des déclarations fiscales' : 'Electronic submission of tax returns', connected: false },
                { name: 'Excel / CSV',     desc: fr ? 'Importation de balances depuis Excel ou CSV' : 'Balance import from Excel or CSV', connected: true },
                { name: 'API REST',        desc: fr ? 'Connectez votre ERP via API REST sécurisée' : 'Connect your ERP via secure REST API', connected: false },
              ].map((int, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-line">
                  <div className="w-9 h-9 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0 text-[11px] font-bold">{int.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink">{int.name}</div>
                    <div className="text-[12px] text-muted">{int.desc}</div>
                  </div>
                  <Btn variant={int.connected ? 'ghost' : 'secondary'}>
                    {int.connected ? (fr ? 'Déconnecter' : 'Disconnect') : (fr ? 'Connecter' : 'Connect')}
                  </Btn>
                  {int.connected && <span className="text-[11px] text-green font-semibold">{fr ? 'Connecté' : 'Connected'}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Billing */}
        {tab === 'billing' && (
          <div className="flex flex-col gap-4">
            <div className="bg-paper border border-line rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{fr ? 'Plan actuel' : 'Current plan'}</div>
                <div className="text-[18px] font-bold text-ink">Cabinet Pro</div>
                <div className="text-[12.5px] text-muted mt-0.5">{fr ? 'Facturé annuellement · 180 000 GNF/an' : 'Billed annually · 180,000 GNF/yr'}</div>
              </div>
              <Btn variant="secondary">{fr ? 'Changer de plan' : 'Change plan'}</Btn>
            </div>
            <Card>
              <CardHeader title={fr ? 'Historique de facturation' : 'Billing history'} />
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line-2 text-left">
                    {[fr ? 'Date' : 'Date', fr ? 'Description' : 'Description', fr ? 'Montant' : 'Amount', fr ? 'Statut' : 'Status', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '1 jan. 2026', desc: fr ? 'Cabinet Pro · Annuel 2026' : 'Cabinet Pro · Annual 2026', amount: '180 000', status: fr ? 'Payé' : 'Paid' },
                    { date: '1 jan. 2025', desc: fr ? 'Cabinet Pro · Annuel 2025' : 'Cabinet Pro · Annual 2025', amount: '180 000', status: fr ? 'Payé' : 'Paid' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-line-2 last:border-none">
                      <td className="px-5 py-3 text-muted">{row.date}</td>
                      <td className="px-5 py-3 text-ink">{row.desc}</td>
                      <td className="px-5 py-3 font-mono">{row.amount} GNF</td>
                      <td className="px-5 py-3"><span className="text-green text-[11px] font-semibold bg-green-soft px-2 py-0.5 rounded-full">{row.status}</span></td>
                      <td className="px-5 py-3"><Btn variant="ghost" icon={<Icons.download />}>{fr ? 'Facture' : 'Invoice'}</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
