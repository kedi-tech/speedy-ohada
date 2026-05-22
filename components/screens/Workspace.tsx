'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Icons } from '@/components/ui/Icon';
import { WORKFLOW } from '@/lib/data';

const STEP_ROUTES: Record<string, string> = {
  st_balN: '/import', st_balN1: '/import', st_balVal: '/validation',
  st_classify: '/mapping', st_map: '/mapping',
  st_fs: '/statements', st_notes: '/notes',
  st_review: '/review', st_export: '/export',
};

export function Workspace() {
  const { t, lang } = useT();
  const [activeStep, setActiveStep] = useState('st_map');

  const completed = WORKFLOW.filter(
    (s) => s.status === 'completed' || s.status === 'ready'
  ).length;
  const total = WORKFLOW.length;
  const pct = Math.round((completed / total) * 100);

  const getStepIcon = (status: string, index: number) => {
    if (status === 'completed' || status === 'ready') return <Icons.check />;
    if (status === 'warning') return <Icons.alert />;
    if (status === 'blocked') return <Icons.lock />;
    if (status === 'in-progress' || status === 'inProgress') return <Icons.spark />;
    return <span className="font-mono text-[11px] font-semibold">{String(index + 1).padStart(2, '0')}</span>;
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case 'completed': case 'ready':
        return { icon: 'text-green bg-green-soft border-green/20', dot: 'var(--color-green)' };
      case 'warning':
        return { icon: 'text-amber bg-amber-soft border-amber/20', dot: 'var(--color-amber)' };
      case 'blocked':
        return { icon: 'text-red bg-red-soft border-red/20', dot: 'var(--color-red)' };
      case 'in-progress': case 'inProgress':
        return { icon: 'text-rust bg-rust-tint border-rust/20', dot: 'var(--color-rust)' };
      default:
        return { icon: 'text-muted-2 bg-bg-2 border-line', dot: 'var(--color-line)' };
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={lang === 'fr' ? 'Espace de travail · Sahel Industries SARL' : 'Workspace · Sahel Industries SARL'}
        title={lang === 'fr' ? 'Exercice 2025 — Clôture au 31/12/2025' : 'Fiscal Year 2025 — Closing 31/12/2025'}
        subtitle={
          lang === 'fr'
            ? "Suivez chaque étape du dossier, de l'import de la balance jusqu'à l'export du package final."
            : 'Follow every step from trial balance import through final package export.'
        }
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.eye />}>
              {lang === 'fr' ? 'Voir le rapport' : 'View report'}
            </Btn>
            <Link href="/mapping">
              <Btn variant="primary" iconRight={<Icons.arrowRight />}>
                {lang === 'fr' ? "Reprendre l'étape" : 'Resume step'}
              </Btn>
            </Link>
          </>
        }
      >
        {/* Status strip */}
        <div
          className="grid gap-4 px-5 py-4 bg-paper border border-line rounded-xl"
          style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr' }}
        >
          <div>
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{t('progress')}</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[30px] font-medium font-serif tracking-[-0.02em]">{pct}%</span>
              <span className="text-[12px] text-muted">
                {completed}/{total} {lang === 'fr' ? 'étapes' : 'steps'}
              </span>
            </div>
            <Progress value={pct} height={5} />
          </div>
          {[
            { label: lang === 'fr' ? 'Statut' : 'Status', value: <Badge status="inProgress" dot label={lang === 'fr' ? 'En préparation' : 'In preparation'} /> },
            { label: t('accountant'), value: (
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#FED7AA] to-rust text-white text-[10px] font-bold grid place-items-center">DI</div>
                <span className="text-[13px] font-medium">Diaby I.</span>
              </div>
            )},
            { label: t('reviewer'), value: (
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#BFDBFE] to-blue text-white text-[10px] font-bold grid place-items-center">DI</div>
                <span className="text-[13px] font-medium">Diaby I.</span>
              </div>
            )},
            { label: t('lastUpdated'), value: <span className="text-[13px] text-ink-2 font-medium">{lang === 'fr' ? 'il y a 2 h' : '2 h ago'}</span> },
          ].map((s, i) => (
            <div key={i} className="border-l border-line-2 pl-4">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{s.label}</div>
              <div>{s.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="px-8 py-6 pb-12 grid gap-6" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start' }}>
        {/* Workflow checklist */}
        <Card className="p-0">
          <CardHeader
            title={t('workflow')}
            subtitle={lang === 'fr' ? 'Cliquez sur une étape pour la consulter ou la reprendre.' : 'Click a step to inspect or resume it.'}
            action={
              <Btn size="sm" variant="ghost" icon={<Icons.spark />}>{t('runValidation')}</Btn>
            }
          />
          <div>
            {WORKFLOW.map((step, i) => {
              const active = activeStep === step.key;
              const isLast = i === WORKFLOW.length - 1;
              const colors = getStepColors(step.status);
              const statusBadge = step.status === 'in-progress' ? 'inProgress' : step.status === 'ready' ? 'ready' : step.status === 'notStarted' ? 'notStarted' : step.status;
              const statusLabel = t('s_' + (step.status === 'in-progress' ? 'inProgress' : step.status === 'notStarted' ? 'notStarted' : step.status));
              const href = STEP_ROUTES[step.key];

              return (
                <Link
                  key={step.key}
                  href={href || '#'}
                  className="no-underline"
                  onClick={(e) => { if (!href) e.preventDefault(); setActiveStep(step.key); }}
                >
                  <div
                    className={`grid items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-colors ${
                      active ? 'bg-bg' : 'hover:bg-bg/50'
                    }`}
                    style={{
                      gridTemplateColumns: '32px 1fr auto auto',
                      borderBottom: isLast ? 'none' : '1px solid var(--color-line-2)',
                      borderLeft: active ? '3px solid var(--color-rust)' : '3px solid transparent',
                    }}
                  >
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-full grid place-items-center border ${colors.icon}`}>
                        {getStepIcon(step.status, i)}
                      </div>
                      {!isLast && (
                        <div className="absolute left-3.5 top-[30px] w-px h-7 bg-line" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink">
                        <span className="font-mono text-[11.5px] font-medium text-muted-2 mr-2">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {t(step.key)}
                      </div>
                      <div className="text-[12px] text-muted mt-0.5">
                        {lang === 'fr' ? step.note_fr : step.note_en}
                      </div>
                    </div>
                    <Badge status={statusBadge} label={statusLabel} dot size="sm" />
                    <Icons.chevronRight className="text-muted-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-4 sticky top-[72px]">
          {/* Recommended action */}
          <Card
            className="p-4"
            style={{ background: 'linear-gradient(160deg, #FFF1E6 0%, #FFFFFF 60%)', borderColor: '#FED7AA' }}
          >
            <div className="flex items-center gap-2 text-rust-2 text-[11px] font-bold uppercase tracking-[.08em] mb-2">
              <Icons.spark /> {t('recommendedAction')}
            </div>
            <div className="text-sm font-semibold text-ink mb-1 font-serif">
              {lang === 'fr' ? 'Affectez les 4 comptes manquants' : 'Map the 4 unmapped accounts'}
            </div>
            <div className="text-[12.5px] text-muted mb-3.5 leading-relaxed">
              {lang === 'fr'
                ? 'Trois comptes critiques bloquent la génération finale du Bilan. Estimation : 4 minutes.'
                : 'Three critical accounts block final balance sheet generation. Est. 4 minutes.'}
            </div>
            <Link href="/mapping">
              <Btn variant="primary" size="sm" iconRight={<Icons.arrowRight />}>
                {lang === 'fr' ? "Reprendre l'affectation" : 'Resume mapping'}
              </Btn>
            </Link>
          </Card>

          {/* Errors & warnings */}
          <Card>
            <CardHeader title={`${t('criticalErrors')} · ${t('warnings')}`} />
            <div className="py-1">
              {[
                { lvl: 'critical', fr: '4 comptes non affectés',         en: '4 unmapped accounts' },
                { lvl: 'critical', fr: '7 notes annexes incomplètes',    en: '7 annex notes incomplete' },
                { lvl: 'critical', fr: 'Patente non renseignée',         en: 'Business license missing' },
                { lvl: 'warning',  fr: 'Logo de la société manquant',   en: 'Company logo missing' },
                { lvl: 'warning',  fr: 'Variation de trésorerie à confirmer', en: 'Cash variation to confirm' },
              ].map((e, i) => (
                <div key={i} className="flex gap-2.5 px-4 py-2 items-start">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.lvl === 'critical' ? 'bg-red' : 'bg-amber'}`} />
                  <div className="text-[12.5px] text-ink-2">{lang === 'fr' ? e.fr : e.en}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Export readiness */}
          <Card className="p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{t('exportReadiness')}</div>
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className="text-[26px] font-medium font-serif text-ink tracking-[-0.02em]">72%</span>
              <span className="text-[12px] text-red font-semibold">{lang === 'fr' ? 'Bloqué' : 'Blocked'}</span>
            </div>
            <Progress value={72} height={4} color="var(--color-red)" />
            <div className="mt-3 text-[12px] text-muted leading-relaxed">
              {lang === 'fr'
                ? "L'export du dossier final est bloqué tant que les erreurs critiques n'ont pas été corrigées."
                : 'Final package export is blocked while critical errors remain.'}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
