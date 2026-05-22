'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

const ACTION_LABELS: Record<string, { fr: string; en: string; color: string }> = {
  login:              { fr: 'Connexion',               en: 'Login',                color: 'text-muted bg-bg-2' },
  logout:             { fr: 'Déconnexion',              en: 'Logout',               color: 'text-muted bg-bg-2' },
  company_created:    { fr: 'Société créée',            en: 'Company created',      color: 'text-green bg-green-soft' },
  company_updated:    { fr: 'Société modifiée',         en: 'Company updated',      color: 'text-amber bg-amber-tint' },
  fiscal_year_created:{ fr: 'Exercice créé',            en: 'Fiscal year created',  color: 'text-green bg-green-soft' },
  balance_imported:   { fr: 'Balance importée',         en: 'Balance imported',     color: 'text-green bg-green-soft' },
  balance_deleted:    { fr: 'Balance supprimée',        en: 'Balance deleted',      color: 'text-red bg-red-soft' },
  mapping_changed:    { fr: 'Affectation modifiée',     en: 'Mapping changed',      color: 'text-amber bg-amber-tint' },
  note_edited:        { fr: 'Note éditée',              en: 'Note edited',          color: 'text-ink-2 bg-bg-2' },
  tax_edited:         { fr: 'Liasse modifiée',          en: 'Tax form edited',      color: 'text-ink-2 bg-bg-2' },
  validation_run:     { fr: 'Validation exécutée',      en: 'Validation run',       color: 'text-ink-2 bg-bg-2' },
  comment_added:      { fr: 'Commentaire ajouté',       en: 'Comment added',        color: 'text-ink-2 bg-bg-2' },
  section_approved:   { fr: 'Section approuvée',        en: 'Section approved',     color: 'text-green bg-green-soft' },
  section_rejected:   { fr: 'Section rejetée',          en: 'Section rejected',     color: 'text-red bg-red-soft' },
  report_exported:    { fr: 'Rapport exporté',          en: 'Report exported',      color: 'text-green bg-green-soft' },
  report_locked:      { fr: 'Rapport verrouillé',       en: 'Report locked',        color: 'text-rust bg-rust-tint' },
  report_unlocked:    { fr: 'Rapport déverrouillé',     en: 'Report unlocked',      color: 'text-amber bg-amber-tint' },
  user_invited:       { fr: 'Utilisateur invité',       en: 'User invited',         color: 'text-green bg-green-soft' },
  role_changed:       { fr: 'Rôle modifié',             en: 'Role changed',         color: 'text-amber bg-amber-tint' },
};

export function AuditLogs() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const { auditLogs: AUDIT_LOGS } = useAppData();

  const filtered = AUDIT_LOGS.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_name.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div>
      <PageHeader
        title={fr ? "Journal d'audit" : 'Audit log'}
        subtitle={fr ? `${AUDIT_LOGS.length} entrées enregistrées` : `${AUDIT_LOGS.length} entries recorded`}
        actions={<Btn variant="secondary" icon={<Icons.download />}>{fr ? 'Exporter CSV' : 'Export CSV'}</Btn>}
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icons.search /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher un utilisateur ou entité…' : 'Search user or entity…'}
              className="w-full pl-9 pr-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
          </div>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust">
            <option value="all">{fr ? 'Toutes les actions' : 'All actions'}</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{fr ? v.fr : v.en}</option>
            ))}
          </select>
        </div>

        <Card>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line-2 text-left">
                {[fr ? 'Date / Heure' : 'Date / Time', fr ? 'Utilisateur' : 'User', fr ? 'Action' : 'Action', fr ? 'Entité' : 'Entity', fr ? 'Ancienne valeur' : 'Old value', fr ? 'Nouvelle valeur' : 'New value', fr ? 'IP / Appareil' : 'IP / Device'].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted">{fr ? 'Aucun résultat.' : 'No results.'}</td></tr>
              ) : filtered.map((log) => {
                const action = ACTION_LABELS[log.action] ?? { fr: log.action, en: log.action, color: 'text-muted bg-bg-2' };
                return (
                  <tr key={log.id} className="border-b border-line-2 last:border-none hover:bg-bg-2/40 transition-colors">
                    <td className="px-5 py-3 text-muted text-[12px] font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{log.user}</div>
                      <div className="text-[11px] text-muted">{log.user_role}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${action.color}`}>
                        {fr ? action.fr : action.en}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-ink">{log.entity_name}</div>
                      <div className="text-[11px] text-muted">{log.entity_type}</div>
                    </td>
                    <td className="px-5 py-3 text-muted text-[12px]">{log.old_value ?? '—'}</td>
                    <td className="px-5 py-3 text-muted text-[12px]">{log.new_value ?? '—'}</td>
                    <td className="px-5 py-3 text-[11.5px] text-muted">
                      {log.ip && <div className="font-mono">{log.ip}</div>}
                      {log.device && <div>{log.device}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
