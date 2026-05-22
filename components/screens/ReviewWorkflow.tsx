'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { REVIEW_SECTIONS } from '@/lib/data';
import type { ReviewSection, ReviewStatus } from '@/lib/types';
import type { TraceabilitySummary } from '@/lib/engine/TraceabilityEngine';
import { formatAmount as fmtLib } from '@/lib/format';

const DEFAULT_REVIEW_SECTIONS: ReviewSection[] = [
  { id: 'balance', title_fr: 'Balance generale', title_en: 'Trial balance', status: 'readyForReview', comments: [], route: 'balance' },
  { id: 'statements', title_fr: 'Etats financiers', title_en: 'Financial statements', status: 'readyForReview', comments: [], route: 'statements' },
  { id: 'notes', title_fr: 'Notes annexes', title_en: 'Annex notes', status: 'readyForReview', comments: [], route: 'notes' },
  { id: 'tax', title_fr: 'Fiscalite', title_en: 'Tax', status: 'readyForReview', comments: [], route: 'tax' },
  { id: 'validation', title_fr: 'Validation et coherence', title_en: 'Validation and consistency', status: 'readyForReview', comments: [], route: 'validation' },
];

const STATUS_META: Record<ReviewStatus, { fr: string; en: string; color: string; dot: string }> = {
  notStarted:          { fr: 'Non démarré',         en: 'Not started',          color: 'text-muted bg-bg-2',        dot: 'bg-muted-2' },
  inProgress:          { fr: 'En cours',             en: 'In progress',          color: 'text-amber bg-amber-tint',  dot: 'bg-amber' },
  correctionRequested: { fr: 'Correction demandée',  en: 'Correction requested', color: 'text-rust bg-rust-tint',    dot: 'bg-rust' },
  readyForReview:      { fr: 'Prêt à réviser',       en: 'Ready for review',     color: 'text-green bg-green-soft',  dot: 'bg-green' },
  approved:            { fr: 'Approuvé',             en: 'Approved',             color: 'text-green bg-green-soft',  dot: 'bg-green' },
  rejected:            { fr: 'Rejeté',               en: 'Rejected',             color: 'text-red bg-red-soft',      dot: 'bg-red' },
  locked:              { fr: 'Verrouillé',           en: 'Locked',               color: 'text-muted bg-bg-2',        dot: 'bg-muted-2' },
};

const COMMENT_TYPE_COLORS: Record<string, string> = {
  comment:  'border-line bg-bg',
  correction: 'border-amber/40 bg-amber-tint/40',
  approval: 'border-green/40 bg-green-soft/40',
  rejection: 'border-red/40 bg-red-soft/40',
};

const SECTION_ROUTE: Record<string, string> = {
  balance: '/import',
  statements: '/statements',
  notes: '/notes',
  tax: '/tax',
  validation: '/validation',
};

interface ManualOverrideItem {
  id: string;
  fiscalYearId: string;
  reportType: string;
  reportLineCode: string;
  lineLabelFr: string | null;
  lineLabelEn: string | null;
  originalValue: number | null;
  newValue: number;
  difference: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface ReviewVersion {
  id: string;
  versionNumber: number;
  status: string;
  isLocked: boolean;
  lockedAt?: string | null;
  calculationRunId: string;
  changeSummary?: string;
  exportRecords?: Array<{ id: string; format: string; fileName: string; status: string; createdAt: string }>;
  reviewApprovals: Array<{ sectionKey: string; status: string; reviewerName: string | null; comment: string | null; approvedAt: string | null; updatedAt?: string | null }>;
}

interface RunHistoryItem {
  id: string;
  triggerReason: string;
  createdAt: string;
  canExport: boolean;
  totalCritical: number;
  totalWarnings: number;
}

interface RunComparison {
  criticalDelta: number | null;
  warningDelta: number | null;
  totalActifDelta: number | null;
  totalPassifDelta: number | null;
  netResultDelta: number | null;
}

export function ReviewWorkflow() {
  const { lang } = useT();
  const { activeFiscalYear } = useWorkspace();
  const router = useRouter();
  const fr = lang === 'fr';
  const sections = REVIEW_SECTIONS.length ? REVIEW_SECTIONS : DEFAULT_REVIEW_SECTIONS;
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [newComment, setNewComment] = useState('');
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [overrides, setOverrides] = useState<ManualOverrideItem[]>([]);
  const [overrideBusy, setOverrideBusy] = useState<string | null>(null);
  const [reviewVersion, setReviewVersion] = useState<ReviewVersion | null>(null);
  const [reportVersions, setReportVersions] = useState<ReviewVersion[]>([]);
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([]);
  const [runComparison, setRunComparison] = useState<RunComparison | null>(null);
  const [traceability, setTraceability] = useState<TraceabilitySummary[]>([]);
  const [selectedTraceKey, setSelectedTraceKey] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const loadReviewState = async () => {
    if (!activeFiscalYear?.id) return;
    const response = await fetch(`/api/report-versions?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    setReviewVersion(payload.latestVersion ?? null);
    setReportVersions(payload.versions ?? []);
    setRunHistory(payload.runHistory ?? []);
    setRunComparison(payload.runComparison ?? null);
  };

  const loadTraceability = async () => {
    if (!activeFiscalYear?.id) return;
    const response = await fetch(`/api/traceability?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    setTraceability(payload.traceability ?? []);
  };

  const loadOverrides = async () => {
    if (!activeFiscalYear?.id) return;
    const response = await fetch(`/api/manual-overrides?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    setOverrides(payload.overrides ?? []);
  };

  useEffect(() => {
    void loadOverrides();
    void loadReviewState();
    void loadTraceability();
  }, [activeFiscalYear?.id]);

  const reviewOverride = async (id: string, action: 'approve' | 'reject') => {
    setOverrideBusy(id);
    try {
      const response = await fetch('/api/manual-overrides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (response.ok) await loadOverrides();
    } finally {
      setOverrideBusy(null);
    }
  };

  const approveReview = async (sectionKey?: string) => {
    if (!activeFiscalYear?.id) return;
    setReviewBusy(true);
    setReviewMessage('');
    try {
      const response = await fetch('/api/report-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, action: 'approve', sectionKey }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setReviewMessage(payload.error ?? (fr ? 'Approbation impossible.' : 'Approval failed.'));
        return;
      }
      setReviewVersion(payload.version);
      setReviewMessage(fr ? 'Revision approuvee.' : 'Review approved.');
    } finally {
      setReviewBusy(false);
    }
  };

  const updateReview = async (action: 'reject' | 'comment', sectionKey: string) => {
    if (!activeFiscalYear?.id || !newComment.trim()) {
      setReviewMessage(fr ? 'Ajoutez un commentaire avant de continuer.' : 'Add a comment before continuing.');
      return;
    }
    setReviewBusy(true);
    setReviewMessage('');
    try {
      const response = await fetch('/api/report-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          action,
          sectionKey,
          comment: newComment,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setReviewMessage(payload.error ?? (fr ? 'Action de revision impossible.' : 'Review action failed.'));
        return;
      }
      setReviewVersion(payload.version);
      setNewComment('');
      setReviewMessage(action === 'reject'
        ? (fr ? 'Correction demandee.' : 'Correction requested.')
        : (fr ? 'Commentaire ajoute.' : 'Comment added.'));
    } finally {
      setReviewBusy(false);
    }
  };

  const lockReport = async () => {
    if (!activeFiscalYear?.id) return;
    setReviewBusy(true);
    setReviewMessage('');
    try {
      const response = await fetch('/api/report-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          action: 'lock',
          reportVersionId: reviewVersion?.id,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setReviewMessage(payload.error ?? (fr ? 'Verrouillage impossible.' : 'Lock failed.'));
        return;
      }
      setReviewVersion(payload.version);
      setShowLockDialog(false);
      setReviewMessage(fr ? 'Dossier verrouille.' : 'Report locked.');
    } finally {
      setReviewBusy(false);
    }
  };

  const section = sections.find((s) => s.id === activeSection) ?? sections[0];
  const approvedSections = new Set((reviewVersion?.reviewApprovals ?? []).filter((approval) => approval.status === 'approved').map((approval) => approval.sectionKey));
  const persistedApproved = ['approved', 'exported', 'locked'].includes(reviewVersion?.status ?? '');
  const statusForSection = (item: ReviewSection): ReviewStatus => {
    const review = reviewVersion?.reviewApprovals.find((approval) => approval.sectionKey === item.id);
    if (persistedApproved || approvedSections.has(item.id)) return 'approved';
    if (review?.status === 'correction_requested') return 'correctionRequested';
    if (review?.status === 'comment') return 'inProgress';
    return item.status;
  };
  const sectionReview = reviewVersion?.reviewApprovals.find((approval) => approval.sectionKey === section.id);
  const sectionStatus = statusForSection(section);
  const approvedCount = persistedApproved ? sections.length : sections.filter((s) => approvedSections.has(s.id) || s.status === 'approved').length;
  const pendingOverrides = overrides.filter((override) => override.status === 'pending');
  const allApproved = persistedApproved && pendingOverrides.length === 0;
  const selectedTrace = traceability.find((record) => `${record.report_type}:${record.line_code}` === selectedTraceKey) ?? traceability[0];
  const formatAmount = (value: number | null | undefined) => fmtLib(value);

  if (!activeFiscalYear) {
    return (
      <div>
        <PageHeader
          title={fr ? 'Revision et approbation' : 'Review & approval'}
          subtitle={fr ? 'Aucun exercice disponible pour la revision.' : 'No fiscal year is available for review.'}
        />
        <div className="px-8 py-10">
          <Card className="p-8 text-center">
            <div className="text-[14px] font-semibold text-ink mb-2">
              {fr ? 'Creez ou selectionnez un exercice.' : 'Create or select a fiscal year.'}
            </div>
            <div className="text-[13px] text-muted mb-4">
              {fr ? 'La revision demarre apres import et calcul du dossier.' : 'Review starts after import and calculation.'}
            </div>
            <Btn variant="primary" onClick={() => router.push('/fiscal/new')}>
              {fr ? 'Nouvel exercice' : 'New fiscal year'}
            </Btn>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={fr ? 'Révision et approbation' : 'Review & approval'}
        subtitle={fr
          ? `${approvedCount} / ${sections.length} sections approuvées`
          : `${approvedCount} / ${sections.length} sections approved`}
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.download />} onClick={() => router.push('/export')}>
              {fr ? 'Exporter le rapport' : 'Export report'}
            </Btn>
            <Btn
              variant="primary"
              icon={<Icons.lock />}
              onClick={() => setShowLockDialog(true)}
              disabled={!allApproved || reviewBusy}
              className={allApproved ? '' : 'opacity-50 cursor-not-allowed'}>
              {fr ? 'Verrouiller le dossier' : 'Lock file'}
            </Btn>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 grid gap-6" style={{ gridTemplateColumns: '260px 1fr', alignItems: 'start' }}>
        {/* Section list */}
        <div className="flex flex-col gap-2 sticky top-[72px]">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-[.08em] px-1 mb-1">
            {fr ? 'Sections' : 'Sections'}
          </div>
          {sections.map((s) => {
            const status = statusForSection(s);
            const meta = STATUS_META[status];
            const isActive = s.id === activeSection;
            const persistedComment = reviewVersion?.reviewApprovals.find((approval) => approval.sectionKey === s.id)?.comment;
            const commentCount = s.comments.length + (persistedComment ? 1 : 0);
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${isActive ? 'bg-rust/10 border border-rust/20' : 'border border-transparent hover:bg-bg-2'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                <span className={`text-[12.5px] font-medium flex-1 min-w-0 truncate ${isActive ? 'text-rust' : 'text-ink-2'}`}>
                  {fr ? s.title_fr : s.title_en}
                </span>
                {commentCount > 0 && (
                  <span className="text-[10px] text-muted bg-bg-2 rounded-full px-1.5 py-0.5">{commentCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section detail */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Card>
              <CardHeader title={fr ? 'Historique des calculs' : 'Calculation history'} />
              <div className="px-5 py-4 flex flex-col gap-2">
                {runHistory.length === 0 ? (
                  <div className="text-[13px] text-muted py-4 text-center">{fr ? 'Aucun calcul.' : 'No calculation run.'}</div>
                ) : runHistory.map((run) => (
                  <div key={run.id} className="grid items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2" style={{ gridTemplateColumns: '1fr auto' }}>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold text-ink truncate">{run.triggerReason}</div>
                      <div className="text-[11px] text-muted font-mono">{run.id}</div>
                      <div className="text-[11px] text-muted">{new Date(run.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right text-[11.5px] text-muted">
                      <div>{fr ? 'Critiques' : 'Critical'}: {run.totalCritical}</div>
                      <div>{fr ? 'Avert.' : 'Warn.'}: {run.totalWarnings}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title={fr ? 'Comparaison du dernier calcul' : 'Latest run comparison'} />
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                {[
                  [fr ? 'Critiques' : 'Critical', runComparison?.criticalDelta],
                  [fr ? 'Avertissements' : 'Warnings', runComparison?.warningDelta],
                  [fr ? 'Total Actif' : 'Total assets', runComparison?.totalActifDelta],
                  [fr ? 'Resultat net' : 'Net result', runComparison?.netResultDelta],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-bg border border-line px-3 py-2">
                    <div className="text-[10.5px] text-muted uppercase tracking-[.08em] font-semibold">{label}</div>
                    <div className="text-[14px] text-ink font-mono mt-1">{typeof value === 'number' ? formatAmount(value) : '-'}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title={fr ? 'Versions et exports verrouilles' : 'Versions and locked exports'} />
            <div className="px-5 py-4 flex flex-col gap-2">
              {reportVersions.length === 0 ? (
                <div className="py-5 text-center text-[13px] text-muted">
                  {fr ? 'Aucune version de rapport.' : 'No report version.'}
                </div>
              ) : reportVersions.map((version) => (
                <div key={version.id} className="grid items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2" style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-ink">
                      v{version.versionNumber} - {version.status}
                      {version.isLocked && <span className="ml-2 text-[11px] text-rust">{fr ? 'verrouillee' : 'locked'}</span>}
                    </div>
                    <div className="text-[11px] text-muted font-mono truncate">{version.calculationRunId}</div>
                    <div className="text-[11px] text-muted truncate">{version.changeSummary ?? ''}</div>
                  </div>
                  <div className="text-[11.5px] text-muted text-right">
                    {(version.exportRecords ?? []).length} {fr ? 'export(s)' : 'export(s)'}
                    {(version.exportRecords ?? [])[0] && (
                      <div className="font-mono">{version.exportRecords?.[0]?.format}</div>
                    )}
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => setReviewVersion(version)}>
                    {fr ? 'Voir' : 'View'}
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title={fr ? 'Drilldown de tracabilite' : 'Traceability drilldown'} />
            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
              <div className="max-h-[280px] overflow-auto border-r border-line">
                {traceability.length === 0 ? (
                  <div className="px-5 py-8 text-center text-[13px] text-muted">{fr ? 'Aucune tracabilite disponible.' : 'No traceability available.'}</div>
                ) : traceability.slice(0, 80).map((record) => {
                  const key = `${record.report_type}:${record.line_code}`;
                  const active = key === `${selectedTrace?.report_type}:${selectedTrace?.line_code}`;
                  return (
                    <button key={key} onClick={() => setSelectedTraceKey(key)} className={`grid w-full items-center gap-3 px-5 py-3 text-left border-b border-line-2 ${active ? 'bg-rust-tint' : 'hover:bg-bg'}`} style={{ gridTemplateColumns: '1fr auto' }}>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold text-ink truncate">{record.label ?? record.line_code}</span>
                        <span className="block text-[11px] text-muted font-mono">{record.report_type} / {record.line_code}</span>
                      </span>
                      <span className="text-[12px] text-ink font-mono">{formatAmount(record.value_N)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-4">
                {selectedTrace ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{selectedTrace.label ?? selectedTrace.line_code}</div>
                      <div className="text-[11px] text-muted font-mono">{selectedTrace.report_type} / {selectedTrace.line_code}</div>
                    </div>
                    <div className="rounded-lg bg-bg border border-line px-3 py-2">
                      <div className="text-[10.5px] uppercase tracking-[.08em] text-muted font-semibold">{fr ? 'Formule' : 'Formula'}</div>
                      <div className="text-[12px] text-ink-2 font-mono break-words mt-1">{selectedTrace.formula_used || '-'}</div>
                    </div>
                    <div className="rounded-lg bg-bg border border-line px-3 py-2">
                      <div className="text-[10.5px] uppercase tracking-[.08em] text-muted font-semibold">{fr ? 'Dependances' : 'Dependencies'}</div>
                      <div className="text-[12px] text-ink-2 font-mono break-words mt-1">{selectedTrace.dependency_chain?.join(', ') || '-'}</div>
                    </div>
                    <div className="rounded-lg bg-bg border border-line px-3 py-2">
                      <div className="text-[10.5px] uppercase tracking-[.08em] text-muted font-semibold">{fr ? 'Regles mapping' : 'Mapping rules'}</div>
                      <div className="text-[12px] text-ink-2 font-mono break-words mt-1">{selectedTrace.mapping_rule_ids?.join(', ') || '-'}</div>
                    </div>
                    <div className="max-h-[120px] overflow-auto border border-line rounded-lg">
                      {selectedTrace.source_accounts.length === 0 ? (
                        <div className="px-3 py-3 text-[12px] text-muted">{fr ? 'Aucun compte source.' : 'No source account.'}</div>
                      ) : selectedTrace.source_accounts.map((account) => (
                        <div key={`${account.account_number}-${account.mapping_rule_id ?? ''}`} className="grid gap-2 px-3 py-2 border-b border-line-2 last:border-none" style={{ gridTemplateColumns: '70px 1fr auto' }}>
                          <span className="text-[11.5px] font-mono text-muted">{account.account_number}</span>
                          <span className="text-[12px] text-ink truncate">{account.account_label}</span>
                          <span className="text-[12px] text-ink font-mono">{formatAmount(account.net_balance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-muted">{fr ? 'Selectionnez une ligne.' : 'Select a line.'}</div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title={fr ? 'Ajustements manuels a approuver' : 'Manual overrides to approve'} />
            <div className="px-5 py-4 flex flex-col gap-3">
              {reviewMessage && (
                <div className="rounded-lg border border-line bg-bg px-3 py-2 text-[12.5px] text-ink-2">
                  {reviewMessage}
                </div>
              )}
              {pendingOverrides.length === 0 ? (
                <div className="py-5 text-center text-[13px] text-muted">
                  {fr ? 'Aucun ajustement manuel en attente.' : 'No manual override is pending.'}
                </div>
              ) : pendingOverrides.map((override) => (
                <div key={override.id} className="grid items-center gap-3 p-3 rounded-lg border border-line bg-bg" style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">
                      {fr ? override.lineLabelFr ?? override.reportLineCode : override.lineLabelEn ?? override.reportLineCode}
                    </div>
                    <div className="text-[11.5px] text-muted mt-0.5">
                      {override.reportType} / {override.reportLineCode}
                    </div>
                    <div className="text-[12px] text-ink-2 mt-2">
                      {fr ? 'Raison :' : 'Reason:'} {override.reason}
                    </div>
                    <div className="text-[12px] text-muted mt-1">
                      {fr ? 'Ancienne valeur' : 'Old value'}: {override.originalValue ?? '-'} · {fr ? 'Nouvelle valeur' : 'New value'}: {override.newValue}
                    </div>
                  </div>
                  <Btn variant="secondary" size="sm" className="border-red text-red hover:bg-red-soft" disabled={overrideBusy === override.id} onClick={() => void reviewOverride(override.id, 'reject')}>
                    {fr ? 'Rejeter' : 'Reject'}
                  </Btn>
                  <Btn variant="primary" size="sm" className="bg-green border-green hover:bg-green/90" disabled={overrideBusy === override.id} onClick={() => void reviewOverride(override.id, 'approve')}>
                    {fr ? 'Approuver' : 'Approve'}
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-ink">{fr ? section.title_fr : section.title_en}</h2>
              {section.reviewer && (
                <div className="text-[12px] text-muted mt-0.5">{fr ? 'Réviseur :' : 'Reviewer:'} {section.reviewer}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${STATUS_META[sectionStatus].color}`}>
                {fr ? STATUS_META[sectionStatus].fr : STATUS_META[sectionStatus].en}
              </span>
              <Btn variant="secondary" icon={<Icons.eye />} onClick={() => router.push(SECTION_ROUTE[section.id] ?? `/${section.route}`)}>
                {fr ? 'Voir le document' : 'View document'}
              </Btn>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex gap-3">
            <Btn
              variant="primary"
              icon={<Icons.check />}
              className="bg-green hover:bg-green/90 border-green"
              disabled={reviewBusy || pendingOverrides.length > 0}
              onClick={() => void approveReview(activeSection)}
            >
              {fr ? 'Approuver la section' : 'Approve section'}
            </Btn>
            <Btn
              variant="secondary"
              icon={<Icons.check />}
              className="border-green text-green hover:bg-green-soft"
              disabled={reviewBusy || pendingOverrides.length > 0}
              onClick={() => void approveReview()}
            >
              {fr ? 'Approuver tout' : 'Approve all'}
            </Btn>
            <Btn
              variant="secondary"
              icon={<Icons.x />}
              className="border-red text-red hover:bg-red-soft"
              disabled={reviewBusy}
              onClick={() => void updateReview('reject', activeSection)}
            >
              {fr ? 'Rejeter / demander correction' : 'Reject / request correction'}
            </Btn>
          </div>

          {/* Comments thread */}
          <Card>
            <CardHeader title={fr ? 'Commentaires et échanges' : 'Comments & exchanges'} />
            <div className="px-5 py-4 flex flex-col gap-3">
              {section.comments.length === 0 && !sectionReview?.comment ? (
                <div className="py-6 text-center text-muted text-[13px]">
                  {fr ? 'Aucun commentaire pour cette section.' : 'No comments for this section.'}
                </div>
              ) : (
                <>
                  {sectionReview?.comment && (
                    <div className={`p-3 rounded-lg border ${COMMENT_TYPE_COLORS[sectionReview.status === 'correction_requested' ? 'correction' : sectionReview.status === 'approved' ? 'approval' : 'comment']}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-rust/10 grid place-items-center text-rust text-[10px] font-bold flex-shrink-0">
                          {(sectionReview.reviewerName ?? 'U')[0]}
                        </div>
                        <span className="text-[12.5px] font-semibold text-ink">{sectionReview.reviewerName ?? (fr ? 'Utilisateur' : 'User')}</span>
                        <span className="text-[11px] text-muted ml-auto">{sectionReview.updatedAt ? new Date(sectionReview.updatedAt).toLocaleString() : ''}</span>
                      </div>
                      <div className="text-[13px] text-ink-2 leading-relaxed">{sectionReview.comment}</div>
                    </div>
                  )}
                  {section.comments.map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg border ${COMMENT_TYPE_COLORS[c.type]}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-rust/10 grid place-items-center text-rust text-[10px] font-bold flex-shrink-0">
                          {c.author[0]}
                        </div>
                        <span className="text-[12.5px] font-semibold text-ink">{c.author}</span>
                        <span className="text-[11px] text-muted">{c.role}</span>
                        <span className="text-[11px] text-muted ml-auto">{c.timestamp}</span>
                      </div>
                      <div className="text-[13px] text-ink-2 leading-relaxed">{fr ? c.text_fr : c.text_en}</div>
                    </div>
                  ))}
                </>
              )}

              {/* Add comment */}
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder={fr ? 'Ajouter un commentaire…' : 'Add a comment…'}
                  className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors resize-none" />
                <div className="flex justify-end">
                  <Btn variant="primary" icon={<Icons.send />} disabled={reviewBusy || !newComment.trim()} onClick={() => void updateReview('comment', activeSection)}>
                    {fr ? 'Envoyer' : 'Send'}
                  </Btn>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lock dialog */}
      {showLockDialog && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4" onClick={() => setShowLockDialog(false)}>
          <div className="bg-paper rounded-2xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-amber-tint grid place-items-center text-amber mx-auto mb-4">
              <Icons.lock />
            </div>
            <h3 className="text-[17px] font-semibold text-ink text-center mb-2">
              {fr ? 'Verrouiller le dossier ?' : 'Lock the file?'}
            </h3>
            <p className="text-[13px] text-muted text-center mb-5">
              {fr
                ? 'Une fois verrouillé, aucune modification ne sera possible sans déverrouillage par un administrateur. Cette action génère un PDF final horodaté.'
                : 'Once locked, no changes will be possible without admin unlock. This action generates a timestamped final PDF.'}
            </p>
            <div className="flex gap-3">
              <Btn variant="ghost" className="flex-1 justify-center" onClick={() => setShowLockDialog(false)}>
                {fr ? 'Annuler' : 'Cancel'}
              </Btn>
              <Btn
                variant="primary"
                className="flex-1 justify-center bg-amber border-amber hover:bg-amber/90"
                icon={<Icons.lock />}
                disabled={reviewBusy}
                onClick={() => void lockReport()}
              >
                {fr ? 'Confirmer le verrouillage' : 'Confirm lock'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
