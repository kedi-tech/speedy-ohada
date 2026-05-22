'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';
import type { Role } from '@/lib/types';

const ROLE_META: Record<Role, { fr: string; en: string; color: string }> = {
  super_admin: { fr: 'Super Admin',  en: 'Super Admin',  color: 'text-rust bg-rust-tint' },
  org_admin:   { fr: 'Administrateur',en:'Administrator', color: 'text-amber bg-amber-tint' },
  accountant:  { fr: 'Comptable',    en: 'Accountant',   color: 'text-green bg-green-soft' },
  reviewer:    { fr: 'Réviseur',     en: 'Reviewer',     color: 'text-ink-2 bg-bg-2' },
  client:      { fr: 'Client',       en: 'Client',       color: 'text-muted bg-bg-2' },
};

const STATUS_COLORS: Record<string, string> = {
  active:   'text-green bg-green-soft',
  inactive: 'text-muted bg-bg-2',
  pending:  'text-amber bg-amber-tint',
};

const PERMISSIONS: { key: string; fr: string; en: string; roles: Role[] }[] = [
  { key: 'view_companies',    fr: 'Voir les sociétés',         en: 'View companies',          roles: ['super_admin','org_admin','accountant','reviewer','client'] },
  { key: 'create_company',    fr: 'Créer une société',         en: 'Create company',          roles: ['super_admin','org_admin'] },
  { key: 'import_balance',    fr: 'Importer une balance',      en: 'Import balance',          roles: ['super_admin','org_admin','accountant'] },
  { key: 'edit_notes',        fr: 'Éditer les notes annexes',  en: 'Edit annex notes',        roles: ['super_admin','org_admin','accountant'] },
  { key: 'edit_tax',          fr: 'Éditer la liasse fiscale',  en: 'Edit tax forms',          roles: ['super_admin','org_admin','accountant'] },
  { key: 'review_approve',    fr: 'Réviser et approuver',      en: 'Review & approve',        roles: ['super_admin','org_admin','reviewer'] },
  { key: 'export_reports',    fr: 'Exporter les rapports',     en: 'Export reports',          roles: ['super_admin','org_admin','accountant','reviewer'] },
  { key: 'lock_unlock',       fr: 'Verrouiller / déverrouiller',en:'Lock / unlock',           roles: ['super_admin','org_admin'] },
  { key: 'manage_users',      fr: 'Gérer les utilisateurs',    en: 'Manage users',            roles: ['super_admin','org_admin'] },
  { key: 'view_audit',        fr: 'Voir les journaux d\'audit',en: 'View audit logs',         roles: ['super_admin','org_admin'] },
  { key: 'manage_billing',    fr: 'Gérer la facturation',      en: 'Manage billing',          roles: ['super_admin','org_admin'] },
];

type ActiveTab = 'users' | 'invite' | 'permissions';

export function UserManagement() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [tab, setTab] = useState<ActiveTab>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const { users: USERS } = useAppData();

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const tabs: { key: ActiveTab; fr: string; en: string }[] = [
    { key: 'users',       fr: 'Utilisateurs',           en: 'Users' },
    { key: 'invite',      fr: 'Inviter',                en: 'Invite' },
    { key: 'permissions', fr: 'Matrice des permissions',en: 'Permissions matrix' },
  ];

  return (
    <div>
      <PageHeader
        title={fr ? 'Gestion des utilisateurs' : 'User management'}
        subtitle={fr ? `${USERS.length} utilisateurs · 1 cabinet` : `${USERS.length} users · 1 firm`}
        actions={
          <Btn variant="primary" icon={<Icons.plus />} onClick={() => setTab('invite')}>
            {fr ? 'Inviter un utilisateur' : 'Invite user'}
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

        {/* Users list */}
        {tab === 'users' && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icons.search /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={fr ? 'Rechercher…' : 'Search…'}
                  className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
                className="px-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                <option value="all">{fr ? 'Tous les rôles' : 'All roles'}</option>
                {(Object.keys(ROLE_META) as Role[]).map((r) => (
                  <option key={r} value={r}>{fr ? ROLE_META[r].fr : ROLE_META[r].en}</option>
                ))}
              </select>
            </div>

            <Card>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line-2 text-left">
                    {[fr ? 'Utilisateur' : 'User', fr ? 'Rôle' : 'Role', fr ? 'Organisation' : 'Organization', fr ? 'Statut' : 'Status', fr ? 'Dernière connexion' : 'Last login', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const role = ROLE_META[user.role];
                    const statusColor = STATUS_COLORS[user.status];
                    return (
                      <tr key={user.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-rust/10 grid place-items-center text-rust text-[11px] font-bold flex-shrink-0">
                              {user.name[0]}
                            </div>
                            <div>
                              <div className="font-medium text-ink">{user.name}</div>
                              <div className="text-[11.5px] text-muted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${role.color}`}>{fr ? role.fr : role.en}</span>
                        </td>
                        <td className="px-5 py-3 text-muted">{user.organization ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor}`}>
                            {user.status === 'active' ? (fr ? 'Actif' : 'Active') : user.status === 'pending' ? (fr ? 'En attente' : 'Pending') : (fr ? 'Inactif' : 'Inactive')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted text-[12px]">{user.last_login ?? '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <Btn variant="ghost">{fr ? 'Modifier' : 'Edit'}</Btn>
                            <Btn variant="ghost" className="text-red">{fr ? 'Révoquer' : 'Revoke'}</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* Invite */}
        {tab === 'invite' && (
          <Card>
            <CardHeader title={fr ? 'Inviter un nouvel utilisateur' : 'Invite a new user'} />
            <div className="px-5 py-5 max-w-lg flex flex-col gap-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Email *' : 'Email *'}</label>
                <input type="email" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" placeholder="prenom.nom@example.ci" />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Rôle *' : 'Role *'}</label>
                <select className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
                  {(Object.keys(ROLE_META) as Role[]).filter((r) => r !== 'super_admin').map((r) => (
                    <option key={r} value={r}>{fr ? ROLE_META[r].fr : ROLE_META[r].en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Message personnalisé (optionnel)' : 'Custom message (optional)'}</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust resize-none"
                  placeholder={fr ? 'Bonjour, je vous invite à rejoindre notre espace…' : 'Hello, I am inviting you to join our workspace…'} />
              </div>
              <Btn variant="primary" icon={<Icons.send />} className="self-start">
                {fr ? 'Envoyer l\'invitation' : 'Send invitation'}
              </Btn>
            </div>
          </Card>
        )}

        {/* Permissions matrix */}
        {tab === 'permissions' && (
          <Card>
            <CardHeader title={fr ? 'Matrice des permissions par rôle' : 'Permission matrix by role'} />
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line-2">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{fr ? 'Permission' : 'Permission'}</th>
                    {(Object.keys(ROLE_META) as Role[]).map((r) => (
                      <th key={r} className="px-4 py-3 text-center text-[11px] font-semibold text-muted uppercase tracking-[.07em]">
                        {fr ? ROLE_META[r].fr : ROLE_META[r].en}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm, i) => (
                    <tr key={perm.key} className={`border-b border-line-2 last:border-none ${i % 2 === 1 ? 'bg-bg-2/30' : ''}`}>
                      <td className="px-5 py-2.5 text-ink">{fr ? perm.fr : perm.en}</td>
                      {(Object.keys(ROLE_META) as Role[]).map((role) => (
                        <td key={role} className="px-4 py-2.5 text-center">
                          {perm.roles.includes(role)
                            ? <span className="text-green"><Icons.check /></span>
                            : <span className="text-line-2">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
