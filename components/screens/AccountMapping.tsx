'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Icons } from '@/components/ui/Icon';
import type { MappingStatus } from '@/lib/types';
import { formatAmount } from '@/lib/format';

const FILTERS = ['all', 'unmapped', 'conflict', 'needsReview', 'manual', 'auto'] as const;
type Filter = typeof FILTERS[number];

interface MappingRuleOption {
  id: string;
  reportType: string;
  reportLineCode: string;
  labelFr: string;
  labelEn: string;
  displayOrder: number;
}

interface MappingRow {
  id: string;
  acc: string;
  label: string;
  debit: number;
  credit: number;
  n1Debit: number;
  n1Credit: number;
  netBalance: number;
  accountClass: number | null;
  status: MappingStatus;
  mappingRuleId: string;
  mappedLabel: string;
  reason: string;
}

interface MappingPayload {
  meta?: {
    companyName: string;
    fiscalYearLabel: string;
    currency: string;
  };
  rules: MappingRuleOption[];
  rows: MappingRow[];
}

const FILTER_LABELS: Record<string, { fr: string; en: string }> = {
  all:         { fr: 'Tout', en: 'All' },
  unmapped:    { fr: 'Non affectes', en: 'Unmapped' },
  conflict:    { fr: 'Conflits', en: 'Conflicts' },
  needsReview: { fr: 'A verifier', en: 'Review' },
  manual:      { fr: 'Manuels', en: 'Manual' },
  auto:        { fr: 'Auto', en: 'Auto' },
};

const STATUS_BADGE: Record<MappingStatus, string> = {
  auto:        'completed',
  manual:      'warning',
  unmapped:    'critical',
  conflict:    'critical',
  needsReview: 'warning',
  excluded:    'draft',
};

const STATUS_LABEL: Record<MappingStatus, { fr: string; en: string }> = {
  auto:        { fr: 'Auto', en: 'Auto' },
  manual:      { fr: 'Manuel', en: 'Manual' },
  unmapped:    { fr: 'Non affecte', en: 'Unmapped' },
  conflict:    { fr: 'Conflit', en: 'Conflict' },
  needsReview: { fr: 'A verifier', en: 'Review' },
  excluded:    { fr: 'Exclu', en: 'Excluded' },
};

function fmtAmount(n: number) {
  return formatAmount(n);
}

export function AccountMapping() {
  const { t, lang } = useT();
  const { activeFiscalYear } = useWorkspace();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [payload, setPayload] = useState<MappingPayload>({ rules: [], rows: [] });
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMapping = async () => {
    if (!activeFiscalYear?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/mapping?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load mapping');
      const next = await response.json() as MappingPayload;
      setPayload(next);
      const first = next.rows.find((row) => row.status === 'unmapped') ?? next.rows[0] ?? null;
      setSelectedAcc((current) => current ?? first?.acc ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMapping();
  }, [activeFiscalYear?.id]);

  const selectedRow = payload.rows.find((row) => row.acc === selectedAcc) ?? null;

  useEffect(() => {
    setSelectedRuleId(selectedRow?.mappingRuleId ?? '');
    setReason(selectedRow?.reason ?? '');
  }, [selectedRow?.acc, selectedRow?.mappingRuleId, selectedRow?.reason]);

  const filtered = useMemo(() => payload.rows.filter((row) => {
    const matchFilter = filter === 'all' || row.status === filter;
    const query = q.toLowerCase();
    const matchQ = !query || row.acc.includes(query) || row.label.toLowerCase().includes(query);
    return matchFilter && matchQ;
  }), [filter, payload.rows, q]);

  const mapped = payload.rows.filter((row) => row.status !== 'unmapped').length;
  const total = payload.rows.length;
  const pct = total > 0 ? Math.round((mapped / total) * 100) : 0;

  const counts: Record<string, number> = {};
  for (const f of FILTERS) {
    counts[f] = f === 'all' ? total : payload.rows.filter((row) => row.status === f).length;
  }

  const saveDecision = async (status: 'manual' | 'excluded') => {
    if (!activeFiscalYear?.id || !selectedRow) return;
    if (status === 'manual' && !selectedRuleId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          trialBalanceLineId: selectedRow.id,
          accountNumber: selectedRow.acc,
          mappingRuleId: selectedRuleId,
          status,
          reason,
        }),
      });
      if (!response.ok) throw new Error('Failed to save mapping');
      await loadMapping();
    } finally {
      setSaving(false);
    }
  };

  const meta = payload.meta;

  return (
    <div>
      <PageHeader
        eyebrow={meta ? `${meta.companyName} · ${lang === 'fr' ? 'Exercice' : 'FY'} ${meta.fiscalYearLabel}` : undefined}
        title={t('nav_mapping')}
        subtitle={
          lang === 'fr'
            ? 'Affectez chaque compte importe aux postes du referentiel SYSCOHADA.'
            : 'Map each imported trial balance account to SYSCOHADA reference positions.'
        }
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.spark />} onClick={() => void loadMapping()}>
              {lang === 'fr' ? 'Recharger' : 'Refresh'}
            </Btn>
            <Link href="/statements">
              <Btn variant="primary" iconRight={<Icons.arrowRight />}>
                {lang === 'fr' ? 'Voir les etats' : 'View statements'}
              </Btn>
            </Link>
          </>
        }
      >
        <div className="grid gap-4 px-5 py-4 bg-paper border border-line rounded-xl" style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}>
          <div>
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{lang === 'fr' ? 'Progression' : 'Progress'}</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[28px] font-medium font-serif tracking-[-0.02em]">{pct}%</span>
              <span className="text-[12px] text-muted">{mapped}/{total}</span>
            </div>
            <Progress value={pct} height={5} />
          </div>
          {[
            { label: lang === 'fr' ? 'Non affectes' : 'Unmapped', value: counts.unmapped, color: 'text-red' },
            { label: lang === 'fr' ? 'Conflits' : 'Conflicts', value: counts.conflict, color: 'text-red' },
            { label: lang === 'fr' ? 'A verifier' : 'Review', value: counts.needsReview, color: 'text-amber' },
          ].map((s) => (
            <div key={s.label} className="border-l border-line-2 pl-4">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{s.label}</div>
              <div className={`text-[28px] font-medium font-serif tracking-[-0.02em] ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="px-8 py-6 pb-12 grid gap-4" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'start' }}>
        <Card className="p-0">
          <div className="px-4 py-3 flex gap-2 items-center border-b border-line-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg rounded-lg border border-line flex-1 text-muted">
              <Icons.search />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={lang === 'fr' ? 'Rechercher un compte...' : 'Search account...'}
                className="border-none outline-none bg-transparent flex-1 text-[13px] text-ink font-sans"
              />
            </div>
          </div>

          <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-line-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
                  filter === f ? 'text-rust border-rust' : 'text-muted border-transparent hover:text-ink-2'
                }`}
              >
                {FILTER_LABELS[f][lang]}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  filter === f ? 'bg-rust-tint text-rust-2' : 'bg-bg-2 text-muted'
                }`}>{counts[f]}</span>
              </button>
            ))}
          </div>

          <div>
            {loading && (
              <div className="px-5 py-10 text-center text-[13px] text-muted">
                {lang === 'fr' ? 'Chargement des affectations...' : 'Loading mappings...'}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-[13px] text-muted">
                {lang === 'fr' ? 'Aucun compte trouve.' : 'No account found.'}
              </div>
            )}
            {!loading && filtered.map((row, i) => {
              const isSelected = selectedAcc === row.acc;
              const status = row.status;
              return (
                <div
                  key={row.id}
                  className={`grid items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-bg' : 'hover:bg-bg/50'}`}
                  style={{
                    gridTemplateColumns: '86px 1fr 1fr auto',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-line-2)' : 'none',
                    borderLeft: isSelected ? '3px solid var(--color-rust)' : '3px solid transparent',
                  }}
                  onClick={() => setSelectedAcc(row.acc)}
                >
                  <span className="font-mono text-[12px] text-muted font-semibold">{row.acc}</span>
                  <span className="text-[12.5px] text-ink font-medium truncate">{row.label}</span>
                  <span className="text-[11.5px] text-muted truncate">{row.mappedLabel || (lang === 'fr' ? 'Non affecte' : 'Unmapped')}</span>
                  <Badge status={STATUS_BADGE[status]} label={STATUS_LABEL[status][lang]} size="sm" dot />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="sticky top-[72px] flex flex-col gap-4">
          {selectedRow ? (
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1 font-semibold">{lang === 'fr' ? 'Compte selectionne' : 'Selected account'}</div>
                  <div className="font-mono text-[18px] font-bold text-ink">{selectedRow.acc}</div>
                  <div className="text-[13px] text-ink-2 mt-0.5">{selectedRow.label}</div>
                </div>
                <Badge status={STATUS_BADGE[selectedRow.status]} label={STATUS_LABEL[selectedRow.status][lang]} dot />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Debit N', value: selectedRow.debit },
                  { label: 'Credit N', value: selectedRow.credit },
                  { label: 'Net N', value: selectedRow.netBalance },
                  { label: 'Class', value: selectedRow.accountClass ?? 0 },
                ].map((field) => (
                  <div key={field.label} className="p-2.5 bg-bg rounded-lg">
                    <div className="text-[10.5px] text-muted mb-1 font-semibold">{field.label}</div>
                    <div className="text-[13px] font-semibold tabular-nums text-ink">{field.value ? fmtAmount(Number(field.value)) : '-'}</div>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Poste SYSCOHADA' : 'SYSCOHADA line'}</div>
                <select
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="w-full text-[12.5px] text-ink bg-bg border border-line rounded-lg px-3 py-2 outline-none focus:border-rust"
                >
                  <option value="">{lang === 'fr' ? '- Selectionner -' : '- Select -'}</option>
                  {payload.rules.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.reportType} / {lang === 'fr' ? option.labelFr : option.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Raison' : 'Reason'}</div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-[12.5px] text-ink bg-bg border border-line rounded-lg px-3 py-2 outline-none focus:border-rust resize-none"
                  placeholder={lang === 'fr' ? 'Pourquoi cette affectation ?' : 'Why this mapping?'}
                />
              </div>

              <div className="flex gap-2">
                <Btn variant="primary" size="sm" className="flex-1" onClick={() => void saveDecision('manual')} disabled={saving || !selectedRuleId}>
                  {saving ? (lang === 'fr' ? 'Enregistrement...' : 'Saving...') : (lang === 'fr' ? 'Appliquer' : 'Apply')}
                </Btn>
                <Btn variant="secondary" size="sm" onClick={() => void saveDecision('excluded')} disabled={saving}>
                  {lang === 'fr' ? 'Exclure' : 'Exclude'}
                </Btn>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-2 mb-2"><Icons.link /></div>
              <div className="text-[13px] font-medium text-muted">{lang === 'fr' ? 'Selectionnez un compte' : 'Select an account'}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
