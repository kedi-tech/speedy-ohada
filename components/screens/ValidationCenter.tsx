'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useEngine } from '@/context/EngineContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import type { ValidationLevel } from '@/lib/types';
import type { ValidationResult, ValidationMessage } from '@/lib/engine/types';
import type { TraceabilitySummary } from '@/lib/engine/TraceabilityEngine';
import { formatAmount as fmtLib } from '@/lib/format';

const CATS = ['all', 'balance', 'company', 'mapping', 'materiality', 'fs', 'notes', 'tax', 'review', 'export', 'controls', 'warnings'] as const;
type Cat = typeof CATS[number];

const CAT_LABELS: Record<Cat, { fr: string; en: string }> = {
  all: { fr: 'Tout', en: 'All' },
  balance: { fr: 'Balance', en: 'Balance' },
  company: { fr: 'Société', en: 'Company' },
  mapping: { fr: 'Affectation', en: 'Mapping' },
  materiality: { fr: 'Matérialité', en: 'Materiality' },
  fs: { fr: 'États fin.', en: 'Fin. Stmts' },
  notes: { fr: 'Annexes', en: 'Notes' },
  tax: { fr: 'Fiscal', en: 'Tax' },
  review: { fr: 'Révision', en: 'Review' },
  export: { fr: 'Export', en: 'Export' },
  controls: { fr: 'C01-C13', en: 'C01-C13' },
  warnings: { fr: 'W01-W09', en: 'W01-W09' },
};

const ENGINE_CAT_TO_UI: Record<string, Cat> = {
  company: 'company',
  balance_n: 'balance',
  balance_n1: 'balance',
  mapping: 'mapping',
  mapping_coverage: 'mapping',
  materiality: 'materiality',
  bilan: 'fs',
  actif: 'fs',
  passif: 'fs',
  compte_resultat: 'fs',
  compte_resultat_detail: 'fs',
  cash_flow: 'fs',
  cash_flow_detail: 'fs',
  expense_details: 'fs',
  conversion_differences: 'fs',
  notes: 'notes',
  fiscal: 'tax',
  review: 'review',
  export: 'export',
  statutory_controls: 'controls',
  statutory_warnings: 'warnings',
};

const LEVEL_BADGE: Record<ValidationLevel, string> = {
  critical: 'critical',
  warning: 'warning',
  passed: 'passed',
  info: 'info',
};

const LEVEL_LABEL: Record<ValidationLevel, { fr: string; en: string }> = {
  critical: { fr: 'Critique', en: 'Critical' },
  warning: { fr: 'Avertissement', en: 'Warning' },
  passed: { fr: 'Conforme', en: 'Passed' },
  info: { fr: 'Info', en: 'Info' },
};

interface FlatValidation {
  cat: Cat;
  level: ValidationLevel;
  fr: string;
  en: string;
  code?: string;
  engineCategory?: string;
  fixType?: ValidationMessage['fix_type'];
  fixTarget?: string;
}

function fixRoute(validation: FlatValidation) {
  if (validation.fixTarget) return validation.fixTarget;
  if (validation.code?.startsWith('COMPANY_')) return '/companies';
  if (validation.code?.startsWith('BAL_')) return '/import';
  if (validation.code?.startsWith('UNMAP_') || validation.code?.startsWith('COVERAGE_')) return '/mapping';
  if (validation.code?.startsWith('NOTE_')) return '/notes';
  if (validation.code?.startsWith('TAX_') || validation.code?.startsWith('ACCOUNTING_RESULT_') || validation.code?.startsWith('FISCAL_')) return '/tax';
  if (validation.code?.startsWith('REVIEW_') || validation.engineCategory === 'review') return '/review';
  if (validation.code?.startsWith('EXPORT_') || validation.engineCategory === 'export') return '/export';
  if (validation.code?.startsWith('CONV_')) return '/statements';
  if (validation.code?.startsWith('EXPENSE_DETAIL_')) return '/charges';
  if (validation.cat === 'fs' || validation.engineCategory === 'bilan' || validation.engineCategory === 'compte_resultat' || validation.engineCategory === 'cash_flow') return '/statements';
  if (validation.cat === 'materiality') return '/settings';
  return '/workspace';
}

function canAutoFixFormula(validation: FlatValidation) {
  const code = validation.code ?? '';
  if (validation.fixType === 'recalculate') return true;
  if (validation.fixType) return false;
  const recalculableCategories = new Set(['bilan', 'compte_resultat', 'cash_flow', 'expense_details', 'conversion_differences', 'fiscal', 'export']);
  return recalculableCategories.has(validation.engineCategory ?? '')
    || code.startsWith('BILAN_')
    || code.startsWith('RESULT_')
    || code.startsWith('CF_')
    || code.startsWith('EXPENSE_DETAIL_')
    || code.startsWith('CONV_')
    || code.startsWith('FISCAL_TAX_RECONCILIATION_')
    || code.startsWith('EXPORT_BLOCKED')
    || code.endsWith('_EMPTY_LINES')
    || code.endsWith('_NO_LINES');
}

function manualFixMessage(validation: FlatValidation, lang: string) {
  const route = fixRoute(validation);
  if (validation.fixType === 'import' || route === '/import') {
    return lang === 'fr'
      ? 'Cette correction necessite les donnees importees manquantes. Redirection vers import.'
      : 'This fix needs missing imported data. Redirecting to import.';
  }
  if (validation.fixType === 'mapping' || route === '/mapping') {
    return lang === 'fr'
      ? 'Cette correction necessite une affectation de compte. Redirection vers mapping.'
      : 'This fix needs account mapping. Redirecting to mapping.';
  }
  if (route === '/notes' || validation.fixType === 'manual_input') {
    return lang === 'fr'
      ? 'Cette correction necessite une saisie manuelle disponible dans vos justificatifs.'
      : 'This fix needs manual input from available supporting data.';
  }
  return lang === 'fr'
    ? 'Cette correction demande une action manuelle.'
    : 'This fix requires manual action.';
}

function formatAmount(value: number | null | undefined, _lang?: string) {
  return fmtLib(value);
}

export function ValidationCenter() {
  const { t, lang } = useT();
  const { state, calculate, loadLatestCalculation } = useEngine();
  const { activeFiscalYear } = useWorkspace();
  const router = useRouter();
  const [activeCat, setActiveCat] = useState<Cat>('all');
  const [running, setRunning] = useState(false);
  const [fixingKey, setFixingKey] = useState('');
  const [fixMessage, setFixMessage] = useState('');
  const [traceability, setTraceability] = useState<TraceabilitySummary[]>([]);
  const [selectedTraceKey, setSelectedTraceKey] = useState('');
  const [selectedValidation, setSelectedValidation] = useState<FlatValidation | null>(null);

  const result = state.result;

  useEffect(() => {
    if (!state.result && !state.isLoadingSavedResult && activeFiscalYear?.id) {
      void loadLatestCalculation(activeFiscalYear.id);
    }
  }, [activeFiscalYear?.id, loadLatestCalculation, state.isLoadingSavedResult, state.result]);

  useEffect(() => {
    if (!activeFiscalYear?.id) {
      setTraceability((state.result?.traceability ?? []) as TraceabilitySummary[]);
      return;
    }

    const loadTraceability = async () => {
      const response = await fetch(`/api/traceability?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
      if (!response.ok) {
        setTraceability((state.result?.traceability ?? []) as TraceabilitySummary[]);
        return;
      }
      const payload = await response.json();
      setTraceability(payload.traceability ?? []);
    };

    void loadTraceability();
  }, [activeFiscalYear?.id, state.result]);

  const validations: FlatValidation[] = result
    ? result.validation.categories.flatMap((cat: ValidationResult) =>
        cat.messages.map((msg: ValidationMessage) => ({
          cat: ENGINE_CAT_TO_UI[msg.category] ?? 'all',
          level: msg.severity as ValidationLevel,
          fr: msg.message_fr,
          en: msg.message_en,
          code: msg.code,
          engineCategory: msg.category,
          fixType: msg.fix_type,
          fixTarget: msg.fix_target,
        })),
      )
    : [];

  const filtered = activeCat === 'all' ? validations : validations.filter((v) => v.cat === activeCat);
  const counts = {
    critical: validations.filter((v) => v.level === 'critical').length,
    warning: validations.filter((v) => v.level === 'warning').length,
    passed: validations.filter((v) => v.level === 'passed').length,
  };
  const overallStatus = result?.validation.overall_status ?? null;
  const selectedTrace = traceability.find((record) => `${record.report_type}:${record.line_code}` === selectedTraceKey) ?? traceability[0];

  const handleRun = async () => {
    if (!state.balanceN && !activeFiscalYear?.id) return;
    setRunning(true);
    if (activeFiscalYear?.id) {
      try {
        const response = await fetch('/api/calculations/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, triggerReason: 'validation_rerun' }),
        });
        if (response.ok) {
          await loadLatestCalculation(activeFiscalYear.id);
        }
      } finally {
        setRunning(false);
      }
      return;
    }

    setTimeout(() => {
      calculate();
      setRunning(false);
    }, 400);
  };

  const handleFix = async (validation: FlatValidation) => {
    if (!canAutoFixFormula(validation)) {
      setFixMessage(manualFixMessage(validation, lang));
      router.push(fixRoute(validation));
      return;
    }

    const key = validation.code ?? validation.fr;
    setFixingKey(key);
    setFixMessage('');
    try {
      if (activeFiscalYear?.id) {
        const response = await fetch('/api/calculations/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, triggerReason: 'validation_formula_fix' }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setFixMessage(payload.error ?? (lang === 'fr' ? 'Correction automatique impossible.' : 'Automatic fix failed.'));
          return;
        }
        await loadLatestCalculation(activeFiscalYear.id);
        setFixMessage(lang === 'fr' ? 'Formules recalculees depuis les donnees importees.' : 'Formulas recalculated from imported data.');
        return;
      }

      const recalculated = calculate();
      setFixMessage(recalculated
        ? (lang === 'fr' ? 'Formules recalculees.' : 'Formulas recalculated.')
        : (lang === 'fr' ? 'Importez une balance avant la correction automatique.' : 'Import a balance before automatic fixing.'));
    } finally {
      setFixingKey('');
    }
  };

  if (!result) {
    return (
      <div>
        <PageHeader title={t('nav_validation')} subtitle={lang === 'fr' ? 'Controle automatique de la conformite SYSCOHADA.' : 'Automatic SYSCOHADA compliance check.'} />
        <div className="px-8 py-6 flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-bg-2 border border-line grid place-items-center text-muted"><Icons.spark /></div>
          <div>
            <p className="text-[15px] font-semibold text-ink mb-1">
              {state.isLoadingSavedResult
                ? (lang === 'fr' ? 'Chargement du dernier calcul...' : 'Loading latest calculation...')
                : (lang === 'fr' ? 'Aucun calcul effectue' : 'No calculation performed')}
            </p>
            <p className="text-[13px] text-muted max-w-xs">
              {lang === 'fr' ? 'Importez une balance et lancez le calcul pour afficher le rapport de validation.' : 'Import a trial balance and run the calculation to display the validation report.'}
            </p>
          </div>
          {!state.isLoadingSavedResult && <Btn variant="primary" onClick={() => router.push('/import')}>{lang === 'fr' ? 'Importer une balance' : 'Import trial balance'}</Btn>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`${state.companyName} - ${lang === 'fr' ? 'Exercice' : 'FY'} ${state.fiscalYearLabel}`}
        title={t('nav_validation')}
        subtitle={lang === 'fr' ? 'Controle automatique SYSCOHADA avec tracabilite des lignes et sources.' : 'Automatic SYSCOHADA checks with line and source traceability.'}
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.download />}>{lang === 'fr' ? 'Exporter le rapport' : 'Export report'}</Btn>
            <Btn variant="primary" icon={<Icons.spark />} onClick={() => void handleRun()} disabled={running}>
              {running ? (lang === 'fr' ? 'Analyse en cours...' : 'Running...') : (lang === 'fr' ? 'Relancer la verification' : 'Run check')}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 px-5 py-4 bg-paper border border-line rounded-xl" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          {[
            {
              label: lang === 'fr' ? 'Statut global' : 'Overall status',
              value: <Badge
                status={overallStatus === 'valid' ? 'completed' : overallStatus === 'critical' ? 'critical' : 'warning'}
                label={overallStatus === 'valid' ? (lang === 'fr' ? 'Conforme' : 'Valid') : overallStatus === 'critical' ? (lang === 'fr' ? 'Critique' : 'Critical') : (lang === 'fr' ? 'Avertissements' : 'Warnings')}
                dot />,
            },
            { label: lang === 'fr' ? 'Critiques' : 'Critical', value: <span className="text-[26px] font-medium font-serif text-red">{counts.critical}</span> },
            { label: lang === 'fr' ? 'Avertissements' : 'Warnings', value: <span className="text-[26px] font-medium font-serif text-amber">{counts.warning}</span> },
            { label: lang === 'fr' ? 'Conformes' : 'Passed', value: <span className="text-[26px] font-medium font-serif text-green">{counts.passed}</span> },
          ].map((s, i) => (
            <div key={i} className={i > 0 ? 'border-l border-line-2 pl-4' : ''}>
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{s.label}</div>
              <div>{s.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {fixMessage && (
          <Card className="px-4 py-3">
            <div className="text-[12.5px] text-ink-2">{fixMessage}</div>
          </Card>
        )}
        <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0, 1fr) 360px', alignItems: 'start' }}>
          <Card className="p-0">
            <div className="px-5 py-4 border-b border-line-2">
              <div className="text-[13px] font-semibold text-ink">{lang === 'fr' ? 'Lignes tracables' : 'Traceable lines'}</div>
              <div className="text-[12px] text-muted mt-0.5">
                {lang === 'fr' ? 'Selectionnez une ligne pour voir comptes sources, formule, N/N-1, ajustement et run.' : 'Select a line to inspect source accounts, formula, N/N-1, override and run metadata.'}
              </div>
            </div>
            <div className="max-h-[360px] overflow-auto">
              {traceability.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-muted">
                  {lang === 'fr' ? 'Aucune tracabilite disponible.' : 'No traceability is available.'}
                </div>
              ) : traceability.map((record) => {
                const key = `${record.report_type}:${record.line_code}`;
                const active = key === `${selectedTrace?.report_type}:${selectedTrace?.line_code}`;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTraceKey(key)}
                    className={`grid w-full items-center gap-3 px-5 py-3 text-left border-b border-line-2 last:border-none ${active ? 'bg-rust-tint' : 'hover:bg-bg'}`}
                    style={{ gridTemplateColumns: '1fr auto auto' }}
                  >
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold text-ink truncate">{record.label ?? record.line_code}</span>
                      <span className="block text-[11px] text-muted font-mono mt-0.5">{record.report_type} / {record.line_code}</span>
                    </span>
                    <span className="text-[12px] text-ink tabular-nums">{formatAmount(record.value_N, lang)}</span>
                    <Badge status={record.is_manual_override ? 'warning' : 'completed'} label={record.is_manual_override ? (lang === 'fr' ? 'Ajuste' : 'Override') : (lang === 'fr' ? 'Auto' : 'Auto')} size="sm" dot />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{lang === 'fr' ? 'Detail de tracabilite' : 'Trace detail'}</div>
            {selectedTrace ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{selectedTrace.label ?? selectedTrace.line_code}</div>
                  <div className="text-[11px] text-muted font-mono mt-0.5">{selectedTrace.report_type} / {selectedTrace.line_code}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-bg px-3 py-2">
                    <div className="text-[10.5px] uppercase text-muted font-semibold">N</div>
                    <div className="text-[13px] text-ink tabular-nums">{formatAmount(selectedTrace.value_N, lang)}</div>
                  </div>
                  <div className="rounded-lg bg-bg px-3 py-2">
                    <div className="text-[10.5px] uppercase text-muted font-semibold">N-1</div>
                    <div className="text-[13px] text-ink tabular-nums">{formatAmount(selectedTrace.value_N_1, lang)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Formule' : 'Formula'}</div>
                  <div className="rounded-lg bg-bg px-3 py-2 text-[12px] text-ink-2 font-mono break-words">{selectedTrace.formula_used || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{lang === 'fr' ? 'Comptes sources' : 'Source accounts'}</div>
                  <div className="max-h-[180px] overflow-auto border border-line rounded-lg">
                    {selectedTrace.source_accounts.length === 0 ? (
                      <div className="px-3 py-3 text-[12px] text-muted">{lang === 'fr' ? 'Aucun compte source.' : 'No source account.'}</div>
                    ) : selectedTrace.source_accounts.map((account) => (
                      <div key={account.account_number} className="grid gap-2 px-3 py-2 border-b border-line-2 last:border-none" style={{ gridTemplateColumns: '70px 1fr auto' }}>
                        <span className="text-[11.5px] font-mono text-muted">{account.account_number}</span>
                        <span className="text-[12px] text-ink truncate">{account.account_label}</span>
                        <span className="text-[12px] text-ink tabular-nums">{formatAmount(account.net_balance, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-bg px-3 py-2 text-[12px] text-muted">
                  {lang === 'fr' ? 'Run' : 'Run'}: <span className="font-mono">{selectedTrace.calculation_run_id}</span>
                  <br />
                  {lang === 'fr' ? 'Calcule le' : 'Calculated at'}: {new Date(selectedTrace.calculated_at).toLocaleString()}
                  {selectedTrace.is_manual_override && (
                    <>
                      <br />
                      {lang === 'fr' ? 'Ajustement' : 'Override'}: {selectedTrace.override_reason ?? '-'}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[12px] text-muted">{lang === 'fr' ? 'Selectionnez une ligne.' : 'Select a line.'}</div>
            )}
          </Card>
        </div>

        <Card className="p-0">
          <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-line-2 overflow-x-auto">
            {CATS.map((cat) => {
              const label = CAT_LABELS[cat][lang];
              const count = cat === 'all' ? validations.length : validations.filter((v) => v.cat === cat).length;
              return (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeCat === cat ? 'text-rust border-rust' : 'text-muted border-transparent hover:text-ink-2'}`}>
                  {label}
                  <span className={`text-[10.5px] px-1.5 py-0.5 rounded-full font-semibold ${activeCat === cat ? 'bg-rust-tint text-rust-2' : 'bg-bg-2 text-muted'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div>
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                {lang === 'fr' ? 'Aucun element dans cette categorie.' : 'No items in this category.'}
              </div>
            )}
            {filtered.map((v, i) => {
              const badgeStatus = LEVEL_BADGE[v.level];
              const badgeLabel = LEVEL_LABEL[v.level][lang];
              const isClickable = v.level !== 'passed';
              return (
                <div
                  key={`${v.code ?? v.fr}-${i}`}
                  className={`grid items-start gap-4 px-5 py-3.5 transition-colors ${isClickable ? 'cursor-pointer hover:bg-bg' : ''}`}
                  style={{ gridTemplateColumns: '20px 1fr auto auto', borderBottom: i < filtered.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}
                  onClick={isClickable ? () => setSelectedValidation(v) : undefined}
                >
                  <div className="mt-0.5">
                    {v.level === 'passed' ? (
                      <span className="w-5 h-5 rounded-full bg-green-soft text-green grid place-items-center"><Icons.check /></span>
                    ) : (
                      <span className={`w-5 h-5 rounded-full grid place-items-center ${v.level === 'critical' ? 'bg-red-soft text-red' : 'bg-amber-soft text-amber'}`}><Icons.alert /></span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink">{lang === 'fr' ? v.fr : v.en}</div>
                    {v.code && <div className="text-[11.5px] font-mono text-muted mt-0.5">{v.code}</div>}
                  </div>
                  <Badge status={badgeStatus} label={badgeLabel} dot size="sm" />
                  {v.level !== 'passed' ? (
                    <Btn
                      size="sm"
                      variant="ghost"
                      disabled={fixingKey === (v.code ?? v.fr)}
                      onClick={(e) => { e.stopPropagation(); void handleFix(v); }}
                    >
                      {fixingKey === (v.code ?? v.fr)
                        ? (lang === 'fr' ? 'Correction...' : 'Fixing...')
                        : canAutoFixFormula(v)
                          ? (lang === 'fr' ? 'Recalculer' : 'Recalculate')
                          : (lang === 'fr' ? 'Corriger' : 'Fix')}
                    </Btn>
                  ) : <div />}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Validation detail modal */}
      <Modal
        open={!!selectedValidation}
        onClose={() => setSelectedValidation(null)}
        title={selectedValidation ? (lang === 'fr' ? selectedValidation.fr : selectedValidation.en) : ''}
        width={560}
      >
        {selectedValidation && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                selectedValidation.level === 'critical'
                  ? 'bg-red/8 text-red border border-red/20'
                  : 'bg-amber/8 text-amber border border-amber/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedValidation.level === 'critical' ? 'bg-red' : 'bg-amber'}`} />
                {LEVEL_LABEL[selectedValidation.level][lang]}
              </span>
              {selectedValidation.code && (
                <span className="text-[11.5px] font-mono text-muted-2 bg-bg-2 px-2 py-0.5 rounded">{selectedValidation.code}</span>
              )}
              {selectedValidation.cat !== 'all' && (
                <span className="text-[11.5px] text-muted bg-bg-2 px-2 py-0.5 rounded">{CAT_LABELS[selectedValidation.cat][lang]}</span>
              )}
            </div>

            <div className="rounded-xl border border-line bg-bg-2 px-4 py-3.5">
              <div className="text-[11px] font-semibold text-muted uppercase tracking-[.07em] mb-2 flex items-center gap-1.5">
                <Icons.info />
                {lang === 'fr' ? 'Message de validation' : 'Validation message'}
              </div>
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {lang === 'fr' ? selectedValidation.fr : selectedValidation.en}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-bg-2 px-4 py-3.5">
              <div className={`text-[11px] font-semibold uppercase tracking-[.07em] mb-2 flex items-center gap-1.5 ${
                selectedValidation.level === 'critical' ? 'text-red' : 'text-amber'
              }`}>
                <Icons.alert />
                <span className="text-muted">{lang === 'fr' ? 'Action requise' : 'Required action'}</span>
              </div>
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {manualFixMessage(selectedValidation, lang)}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <Btn variant="ghost" onClick={() => setSelectedValidation(null)}>
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </Btn>
              <Btn
                variant={selectedValidation.level === 'critical' ? 'primary' : 'secondary'}
                disabled={fixingKey === (selectedValidation.code ?? selectedValidation.fr)}
                onClick={() => { void handleFix(selectedValidation); setSelectedValidation(null); }}
              >
                {canAutoFixFormula(selectedValidation)
                  ? (lang === 'fr' ? 'Recalculer' : 'Recalculate')
                  : (lang === 'fr' ? 'Corriger' : 'Fix')}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
