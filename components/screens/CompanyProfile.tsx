'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

const STATUS_LABELS: Record<string, { fr: string; en: string; color: string }> = {
  draft:       { fr: 'Brouillon',    en: 'Draft',       color: 'text-muted bg-bg-2' },
  'in-progress':{ fr: 'En cours',    en: 'In progress', color: 'text-amber bg-amber-tint' },
  ready:       { fr: 'Prêt',         en: 'Ready',       color: 'text-green bg-green-soft' },
  warning:     { fr: 'Avertissement',en: 'Warning',     color: 'text-amber bg-amber-tint' },
  approved:    { fr: 'Approuvé',     en: 'Approved',    color: 'text-green bg-green-soft' },
  locked:      { fr: 'Verrouillé',   en: 'Locked',      color: 'text-ink-2 bg-bg-2' },
  archived:    { fr: 'Archivé',      en: 'Archived',    color: 'text-muted bg-bg-2' },
};

type Tab = 'overview' | 'fiscal' | 'documents' | 'users';

export function CompanyProfile({ id }: { id: string }) {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<Tab>('overview');
  const { companies: COMPANIES, fiscalYears: FISCAL_YEARS, loading } = useAppData();

  const company = COMPANIES.find((c) => c.id === id);
  const fiscalYears = FISCAL_YEARS.filter((fy) => fy.company_id === id);
  const status = STATUS_LABELS[company?.status ?? 'draft'] ?? STATUS_LABELS.draft;

  const tabs: { key: Tab; fr: string; en: string }[] = [
    { key: 'overview',   fr: 'Vue d\'ensemble', en: 'Overview' },
    { key: 'fiscal',     fr: 'Exercices',        en: 'Fiscal years' },
    { key: 'documents',  fr: 'Documents',        en: 'Documents' },
    { key: 'users',      fr: 'Utilisateurs',     en: 'Users' },
  ];

  const Info = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <div className="text-[11px] font-semibold text-muted uppercase tracking-[.08em] mb-0.5">{label}</div>
      <div className="text-[13px] text-ink">{value || <span className="text-muted-2">—</span>}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[320px] grid place-items-center">
        <div className="w-5 h-5 border-2 border-rust/30 border-t-rust rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <PageHeader
          title={fr ? 'Société introuvable' : 'Company not found'}
          subtitle={fr ? 'Cette societe n existe pas encore dans Supabase.' : 'This company does not exist in Supabase yet.'}
          actions={<Btn variant="ghost" onClick={() => router.push('/companies')}>{fr ? 'Retour' : 'Back'}</Btn>}
        />
        <div className="px-8 py-6">
          <Card className="p-6 text-[13px] text-muted">
            {fr ? 'Creez une societe ou ouvrez une societe existante depuis la liste.' : 'Create a company or open an existing company from the list.'}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={company.sector}
        actions={
          <>
            <Btn variant="ghost" onClick={() => router.push('/companies')}>{fr ? 'Retour' : 'Back'}</Btn>
            <Btn variant="secondary" icon={<Icons.users />} onClick={() => router.push(`/companies/${id}/users`)}>
              {fr ? 'Utilisateurs' : 'Users'}
            </Btn>
            <Btn variant="primary" icon={<Icons.edit />} onClick={() => router.push(`/companies/${id}/edit`)}>
              {fr ? 'Modifier' : 'Edit'}
            </Btn>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Header strip */}
        <div className="flex items-center gap-4 p-4 bg-paper border border-line rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-rust/10 grid place-items-center text-rust text-xl font-bold font-serif flex-shrink-0">
            {company.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold text-ink">{company.name}</div>
            <div className="text-[12.5px] text-muted">{company.city} · {company.fy}</div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${status.color}`}>
            {fr ? status.fr : status.en}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 rounded-full bg-bg-2 overflow-hidden">
              <div className="h-full rounded-full bg-rust" style={{ width: `${company.progress}%` }} />
            </div>
            <span className="text-[12px] text-muted">{company.progress}%</span>
          </div>
        </div>

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

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Card>
              <CardHeader title={fr ? 'Identité légale' : 'Legal identity'} />
              <div className="px-5 py-5 grid grid-cols-2 gap-4">
                <Info label={fr ? 'Raison sociale' : 'Legal name'} value={company.legal_name ?? company.name} />
                <Info label={fr ? 'Nom commercial' : 'Trade name'} value={company.commercial_name} />
                <Info label={fr ? 'Forme juridique' : 'Legal form'} value={company.legal_form} />
                <Info label={fr ? 'Secteur' : 'Sector'} value={company.sector} />
                <Info label="RCCM" value={company.rccm ?? 'CI-ABJ-2018-B-12847'} />
                <Info label="NIF" value={company.nif ?? '1820234A'} />
                <Info label={fr ? 'Devise' : 'Currency'} value={company.currency ?? 'GNF'} />
                <Info label={fr ? 'Référentiel' : 'Standard'} value={company.accounting_standard ?? 'SYSCOHADA Révisé'} />
              </div>
            </Card>

            <Card>
              <CardHeader title={fr ? 'Coordonnées' : 'Contact details'} />
              <div className="px-5 py-5 grid grid-cols-2 gap-4">
                <Info label={fr ? 'Adresse' : 'Address'} value={company.address} />
                <Info label={fr ? 'Ville' : 'City'} value={company.city} />
                <Info label={fr ? 'Pays' : 'Country'} value={company.country ?? "Côte d'Ivoire"} />
                <Info label={fr ? 'Téléphone' : 'Phone'} value={company.phone} />
                <Info label="Email" value={company.email} />
                <Info label={fr ? 'Site web' : 'Website'} value={company.website} />
              </div>
            </Card>

            <Card>
              <CardHeader title={fr ? 'Informations fiscales' : 'Tax information'} />
              <div className="px-5 py-5 grid grid-cols-2 gap-4">
                <Info label={fr ? 'Centre des impôts' : 'Tax center'} value={company.tax_center} />
                <Info label={fr ? 'Régime fiscal' : 'Tax regime'} value={company.tax_regime} />
              </div>
            </Card>

            <Card>
              <CardHeader title={fr ? 'Dirigeants et intervenants' : 'Management & contacts'} />
              <div className="px-5 py-5 grid grid-cols-2 gap-4">
                <Info label={fr ? 'Dirigeant' : 'Manager'} value={company.manager_name} />
                <Info label={fr ? 'Fonction' : 'Title'} value={company.manager_title} />
                <Info label={fr ? 'Comptable' : 'Accountant'} value={company.accountant_name} />
                <Info label={fr ? 'Contact comptable' : 'Accountant contact'} value={company.accountant_contact} />
                <Info label={fr ? 'Auditeur' : 'Auditor'} value={company.auditor_name} />
                <Info label={fr ? 'Contact auditeur' : 'Auditor contact'} value={company.auditor_contact} />
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Fiscal Years */}
        {tab === 'fiscal' && (
          <Card>
            <CardHeader
              title={fr ? 'Exercices fiscaux' : 'Fiscal years'}
              action={
                <Btn variant="primary" icon={<Icons.plus />} onClick={() => router.push('/fiscal/new')}>
                  {fr ? 'Nouvel exercice' : 'New fiscal year'}
                </Btn>
              }
            />
            {fiscalYears.length === 0 ? (
              <div className="px-5 py-10 text-center text-muted text-[13px]">
                {fr ? 'Aucun exercice fiscal créé.' : 'No fiscal years created.'}
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line-2 text-left">
                    {[fr ? 'Exercice' : 'Year', fr ? 'Période' : 'Period', fr ? 'Statut' : 'Status', fr ? 'Progression' : 'Progress', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fiscalYears.map((fy) => {
                    const s = STATUS_LABELS[fy.status] ?? STATUS_LABELS.draft;
                    return (
                      <tr key={fy.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/50 transition-colors">
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
                            <span className="text-muted">{fy.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Btn variant="ghost" onClick={() => router.push('/workspace')}>
                            {fr ? 'Ouvrir' : 'Open'}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {/* Tab: Documents */}
        {tab === 'documents' && (
          <Card>
            <CardHeader title={fr ? 'Documents exportés' : 'Exported documents'} />
            <div className="px-5 py-5 flex flex-col gap-3">
              <div className="text-[13px] text-muted">
                {fr ? 'Aucun document exporte pour cette societe.' : 'No exported documents for this company.'}
              </div>
            </div>
          </Card>
        )}

        {/* Tab: Users */}
        {tab === 'users' && (
          <Card>
            <CardHeader title={fr ? 'Utilisateurs assignés' : 'Assigned users'} action={
              <Btn variant="primary" icon={<Icons.plus />}>{fr ? 'Inviter' : 'Invite'}</Btn>
            } />
            <div className="px-5 py-5 flex flex-col gap-3">
              <div className="text-[13px] text-muted">
                {fr ? 'Aucun utilisateur assigne a cette societe.' : 'No users assigned to this company.'}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
