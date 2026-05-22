'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

const PLAN_COLORS: Record<string, string> = {
  starter:      'text-muted bg-bg-2',
  professional: 'text-amber bg-amber-tint',
  cabinet:      'text-green bg-green-soft',
  enterprise:   'text-rust bg-rust-tint',
};

const STATUS_COLORS: Record<string, string> = {
  active:    'text-green bg-green-soft',
  suspended: 'text-red bg-red-soft',
  trial:     'text-amber bg-amber-tint',
};

type Tab = 'platform' | 'organizations' | 'system';

export function AdminDashboard() {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<Tab>('platform');
  const { organizations: ORGANIZATIONS } = useAppData();

  return (
    <div className="min-h-screen bg-bg">
      {/* Admin header */}
      <header className="bg-rust text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 grid place-items-center text-white font-bold text-sm">S</div>
          <span className="text-[15px] font-semibold font-serif">Speedy OHADA · Super Admin</span>
        </div>
        <Btn variant="ghost" className="text-white border-white/30 hover:bg-white/10" onClick={() => router.push('/dashboard')}>
          {fr ? 'Retour à l\'app' : 'Back to app'}
        </Btn>
      </header>

      <div className="px-8 py-6 pb-12 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-line">
          {[
            { key: 'platform',      fr: 'Tableau de bord plateforme', en: 'Platform dashboard' },
            { key: 'organizations', fr: 'Organisations',               en: 'Organizations' },
            { key: 'system',        fr: 'Système',                      en: 'System' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)}
              className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
              style={{ borderColor: tab === t.key ? 'var(--color-rust)' : 'transparent', color: tab === t.key ? 'var(--color-rust)' : 'var(--color-muted)' }}>
              {fr ? t.fr : t.en}
            </button>
          ))}
        </div>

        {/* Platform dashboard */}
        {tab === 'platform' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: fr ? 'Organisations actives' : 'Active orgs', value: ORGANIZATIONS.filter((o) => o.status === 'active').length, color: 'text-ink' },
                { label: fr ? 'Total sociétés' : 'Total companies', value: ORGANIZATIONS.reduce((s, o) => s + o.companies, 0), color: 'text-rust' },
                { label: fr ? 'Total utilisateurs' : 'Total users', value: ORGANIZATIONS.reduce((s, o) => s + o.users, 0), color: 'text-green' },
                { label: fr ? 'Essais en cours' : 'Active trials', value: ORGANIZATIONS.filter((o) => o.status === 'trial').length, color: 'text-amber' },
              ].map((kpi, i) => (
                <div key={i} className="bg-paper border border-line rounded-xl p-4">
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{kpi.label}</div>
                  <div className={`text-[28px] font-bold ${kpi.color}`}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader title={fr ? 'Répartition par plan' : 'Plan distribution'} />
              <div className="px-5 py-5 grid grid-cols-4 gap-3">
                {['starter', 'professional', 'cabinet', 'enterprise'].map((plan) => {
                  const count = ORGANIZATIONS.filter((o) => o.plan === plan).length;
                  return (
                    <div key={plan} className="text-center p-3 rounded-lg border border-line">
                      <div className="text-[22px] font-bold text-ink">{count}</div>
                      <div className={`mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-block ${PLAN_COLORS[plan]}`}>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Organizations */}
        {tab === 'organizations' && (
          <Card>
            <CardHeader
              title={fr ? 'Toutes les organisations' : 'All organizations'}
              action={<Btn variant="primary" icon={<Icons.plus />}>{fr ? 'Nouvelle organisation' : 'New organization'}</Btn>}
            />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line-2 text-left">
                  {[fr ? 'Organisation' : 'Organization', fr ? 'Plan' : 'Plan', fr ? 'Sociétés' : 'Companies', fr ? 'Utilisateurs' : 'Users', fr ? 'Statut' : 'Status', fr ? 'Créée le' : 'Created', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORGANIZATIONS.map((org) => (
                  <tr key={org.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{org.name}</div>
                      <div className="text-[11.5px] text-muted">{org.admin_email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${PLAN_COLORS[org.plan]}`}>
                        {org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">{org.companies}</td>
                    <td className="px-5 py-3 text-center">{org.users}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[org.status]}`}>
                        {org.status === 'active' ? (fr ? 'Actif' : 'Active') : org.status === 'trial' ? (fr ? 'Essai' : 'Trial') : (fr ? 'Suspendu' : 'Suspended')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted text-[12px]">{org.created_at}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Btn variant="ghost">{fr ? 'Gérer' : 'Manage'}</Btn>
                        <Btn variant="ghost" className={org.status === 'suspended' ? 'text-green' : 'text-red'}>
                          {org.status === 'suspended' ? (fr ? 'Réactiver' : 'Reactivate') : (fr ? 'Suspendre' : 'Suspend')}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* System */}
        {tab === 'system' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: fr ? 'Version de l\'application' : 'App version', value: 'v0.9.1' },
                { label: fr ? 'Environnement' : 'Environment', value: 'Production' },
                { label: fr ? 'Base de données' : 'Database', value: fr ? 'Connectée · 98 ms' : 'Connected · 98 ms' },
                { label: fr ? 'Stockage fichiers' : 'File storage', value: '2.4 GB / 50 GB' },
              ].map((s, i) => (
                <div key={i} className="bg-paper border border-line rounded-xl p-4">
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1">{s.label}</div>
                  <div className="text-[14px] font-semibold text-ink">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-amber-tint border border-amber/30 rounded-xl text-[13px] text-amber-700">
              {fr
                ? '⚠ Mise à jour disponible : v0.9.2 — corrections de bugs et améliorations de performance.'
                : '⚠ Update available: v0.9.2 — bug fixes and performance improvements.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
