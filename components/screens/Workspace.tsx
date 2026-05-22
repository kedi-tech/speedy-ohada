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
import { Modal } from '@/components/ui/Modal';
import { WORKFLOW } from '@/lib/data';
import { useWorkspace } from '@/context/WorkspaceContext';

const STEP_ROUTES: Record<string, string> = {
  st_balN: '/import', st_balN1: '/import', st_balVal: '/validation',
  st_classify: '/mapping', st_map: '/mapping',
  st_fs: '/statements', st_notes: '/notes',
  st_review: '/review', st_export: '/export',
};

interface Issue {
  id: string;
  lvl: 'critical' | 'warning';
  title_fr: string;
  title_en: string;
  desc_fr: string;
  desc_en: string;
  impact_fr: string;
  impact_en: string;
  fix_fr: string;
  fix_en: string;
  href?: string;
  href_label_fr?: string;
  href_label_en?: string;
}

const ISSUES: Issue[] = [
  {
    id: 'unmapped_accounts',
    lvl: 'critical',
    title_fr: '4 comptes non affectés',
    title_en: '4 unmapped accounts',
    desc_fr:
      "Quatre comptes du plan comptable importé n'ont pas encore été affectés à une ligne du bilan ou du compte de résultat SYSCOHADA. Ces comptes ont été détectés lors de l'import de la balance mais leur nature (actif, passif, produit ou charge) n'a pas pu être déterminée automatiquement.",
    desc_en:
      "Four accounts from the imported trial balance have not yet been assigned to a balance sheet or income statement line under SYSCOHADA. They were detected during the import but their nature (asset, liability, income or expense) could not be determined automatically.",
    impact_fr:
      "Tant que ces comptes restent non affectés, les totaux du Bilan et du Compte de résultat sont incomplets. La génération du package de clôture final est bloquée.",
    impact_en:
      "As long as these accounts remain unmapped, the balance sheet and income statement totals are incomplete. Final package generation is blocked.",
    fix_fr: "Ouvrez l'écran Affectation des comptes, recherchez les comptes marqués « Non affecté » et assignez chacun à la rubrique SYSCOHADA correspondante.",
    fix_en: 'Open the Account Mapping screen, find accounts marked "Unmapped", and assign each one to the appropriate SYSCOHADA line.',
    href: '/mapping',
    href_label_fr: "Aller à l'affectation",
    href_label_en: 'Go to mapping',
  },
  {
    id: 'incomplete_notes',
    lvl: 'critical',
    title_fr: '7 notes annexes incomplètes',
    title_en: '7 annex notes incomplete',
    desc_fr:
      "Sept notes annexes obligatoires du dossier de clôture SYSCOHADA sont incomplètes ou n'ont pas encore été renseignées. Les notes annexes font partie intégrante des états financiers ; leur absence constitue une non-conformité réglementaire.",
    desc_en:
      "Seven mandatory annex notes required by the SYSCOHADA closing package are incomplete or have not yet been filled in. Annex notes are an integral part of the financial statements; their absence constitutes a regulatory non-compliance.",
    impact_fr:
      "Les états financiers ne peuvent pas être validés ni exportés sans l'ensemble des notes annexes requises. Le réviseur ne pourra pas signer le dossier tant que ces notes restent vides.",
    impact_en:
      "Financial statements cannot be validated or exported without the complete set of required notes. The reviewer cannot sign off on the file while these notes remain empty.",
    fix_fr:
      "Accédez à l'écran Notes annexes, consultez la liste des notes en attente (marquées en rouge), et complétez chaque champ requis.",
    fix_en:
      "Go to the Annex Notes screen, review the pending notes (marked in red), and complete each required field.",
    href: '/notes',
    href_label_fr: 'Aller aux notes annexes',
    href_label_en: 'Go to annex notes',
  },
  {
    id: 'missing_patent',
    lvl: 'critical',
    title_fr: 'Patente non renseignée',
    title_en: 'Business licence missing',
    desc_fr:
      "Le numéro de patente (ou numéro de contribution des patentes) de la société n'a pas été renseigné dans la fiche entreprise. Ce numéro est obligatoire dans le cadre du dépôt SYSCOHADA auprès des administrations fiscales de la zone OHADA.",
    desc_en:
      "The business licence number (patente) for the company has not been entered in the company profile. This number is mandatory for SYSCOHADA filing with tax authorities in the OHADA zone.",
    impact_fr:
      "L'absence de ce numéro entraîne le rejet du dossier par l'administration fiscale. Il apparaît sur la page de garde des états financiers et sur les formulaires de dépôt obligatoires.",
    impact_en:
      "Without this number, the filing will be rejected by the tax authority. It appears on the cover page of the financial statements and on mandatory submission forms.",
    fix_fr:
      "Ouvrez la fiche de la société (Paramètres > Société), renseignez le numéro de patente dans le champ prévu, puis enregistrez.",
    fix_en:
      "Open the company profile (Settings > Company), enter the business licence number in the designated field, then save.",
    href: '/settings',
    href_label_fr: 'Aller aux paramètres',
    href_label_en: 'Go to settings',
  },
  {
    id: 'missing_logo',
    lvl: 'warning',
    title_fr: 'Logo de la société manquant',
    title_en: 'Company logo missing',
    desc_fr:
      "Aucun logo n'a été téléversé pour cette société. Le logo apparaît sur les pages de garde, les états financiers exportés et les rapports PDF générés par l'application.",
    desc_en:
      "No logo has been uploaded for this company. The logo appears on cover pages, exported financial statements, and PDF reports generated by the application.",
    impact_fr:
      "Sans logo, les documents exportés utiliseront un espace vide ou un placeholder générique, ce qui peut nuire à la présentation professionnelle du dossier. Cela ne bloque pas l'export.",
    impact_en:
      "Without a logo, exported documents will display an empty space or a generic placeholder, which may affect the professional appearance of the package. This does not block the export.",
    fix_fr:
      "Dans les paramètres de la société, cliquez sur « Changer le logo » et importez un fichier PNG ou SVG (recommandé : 400 × 400 px minimum, fond transparent).",
    fix_en:
      'In the company settings, click "Change logo" and upload a PNG or SVG file (recommended: 400 × 400 px minimum, transparent background).',
    href: '/settings',
    href_label_fr: 'Aller aux paramètres',
    href_label_en: 'Go to settings',
  },
  {
    id: 'cash_variation',
    lvl: 'warning',
    title_fr: 'Variation de trésorerie à confirmer',
    title_en: 'Cash variation to confirm',
    desc_fr:
      "La variation nette de trésorerie calculée dans le tableau des flux de trésorerie (TFT) ne correspond pas exactement à la différence entre les soldes de trésorerie de clôture N et N-1. Un écart résiduel de ±1 a été détecté, probablement dû à un arrondi ou à un compte de trésorerie non affecté.",
    desc_en:
      "The net cash variation calculated in the statement of cash flows (SCF) does not exactly match the difference between the N and N-1 closing cash balances. A residual difference of ±1 was detected, likely due to rounding or an unassigned treasury account.",
    impact_fr:
      "Un écart dans le TFT constitue une anomalie comptable. Bien que non bloquant pour l'export, il sera signalé lors de la révision et devra être justifié avant signature.",
    impact_en:
      "A discrepancy in the SCF constitutes an accounting anomaly. Although non-blocking for export, it will be flagged during review and must be justified before sign-off.",
    fix_fr:
      "Vérifiez que tous les comptes de trésorerie (classe 5) sont bien affectés. Contrôlez les soldes d'ouverture N-1 et les montants de clôture N dans la balance. Si l'écart persiste, ajustez manuellement la note de réconciliation.",
    fix_en:
      "Verify that all treasury accounts (class 5) are properly assigned. Check N-1 opening balances and N closing amounts in the trial balance. If the gap persists, manually adjust the reconciliation note.",
    href: '/statements',
    href_label_fr: 'Voir les états financiers',
    href_label_en: 'View financial statements',
  },
];

export function Workspace() {
  const { t, lang } = useT();
  const { activeFiscalYear } = useWorkspace();
  const [activeStep, setActiveStep] = useState('st_map');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

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
        eyebrow={activeFiscalYear ? `${lang === 'fr' ? 'Espace de travail' : 'Workspace'} · ${activeFiscalYear.company_name}` : undefined}
        title={activeFiscalYear ? `${lang === 'fr' ? 'Exercice' : 'FY'} ${activeFiscalYear.label}` : (lang === 'fr' ? 'Espace de travail' : 'Workspace')}
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
              {ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setSelectedIssue(issue)}
                  className="w-full text-left flex gap-2.5 px-4 py-2.5 items-start hover:bg-bg transition-colors group"
                >
                  <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${issue.lvl === 'critical' ? 'bg-red' : 'bg-amber'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-ink-2 group-hover:text-ink transition-colors leading-snug">
                      {lang === 'fr' ? issue.title_fr : issue.title_en}
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {issue.lvl === 'critical'
                        ? (lang === 'fr' ? 'Erreur critique · Cliquer pour détails' : 'Critical error · Click for details')
                        : (lang === 'fr' ? 'Avertissement · Cliquer pour détails' : 'Warning · Click for details')}
                    </div>
                  </div>
                  <Icons.chevronRight className="text-muted-2 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
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

      {/* Issue detail modal */}
      <Modal
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue ? (lang === 'fr' ? selectedIssue.title_fr : selectedIssue.title_en) : ''}
        width={540}
      >
        {selectedIssue && (
          <div className="flex flex-col gap-4">
            {/* Level badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                selectedIssue.lvl === 'critical'
                  ? 'bg-red/8 text-red border border-red/20'
                  : 'bg-amber/8 text-amber border border-amber/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedIssue.lvl === 'critical' ? 'bg-red' : 'bg-amber'}`} />
                {selectedIssue.lvl === 'critical'
                  ? (lang === 'fr' ? 'Erreur critique' : 'Critical error')
                  : (lang === 'fr' ? 'Avertissement' : 'Warning')}
              </span>
            </div>

            {/* Description */}
            <Section
              label={lang === 'fr' ? 'Description' : 'Description'}
              icon={<Icons.info />}
            >
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {lang === 'fr' ? selectedIssue.desc_fr : selectedIssue.desc_en}
              </p>
            </Section>

            {/* Impact */}
            <Section
              label={lang === 'fr' ? 'Impact sur le dossier' : 'Impact on the file'}
              icon={<Icons.alert />}
              iconColor={selectedIssue.lvl === 'critical' ? 'text-red' : 'text-amber'}
            >
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {lang === 'fr' ? selectedIssue.impact_fr : selectedIssue.impact_en}
              </p>
            </Section>

            {/* How to fix */}
            <Section
              label={lang === 'fr' ? 'Comment corriger' : 'How to fix'}
              icon={<Icons.check />}
              iconColor="text-green"
            >
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {lang === 'fr' ? selectedIssue.fix_fr : selectedIssue.fix_en}
              </p>
            </Section>

            {/* CTA */}
            {selectedIssue.href && (
              <div className="pt-1">
                <Link href={selectedIssue.href} onClick={() => setSelectedIssue(null)}>
                  <Btn variant="primary" size="sm" iconRight={<Icons.arrowRight />}>
                    {lang === 'fr' ? selectedIssue.href_label_fr : selectedIssue.href_label_en}
                  </Btn>
                </Link>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Section({
  label,
  icon,
  iconColor = 'text-muted-2',
  children,
}: {
  label: string;
  icon: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-bg-2 px-4 py-3.5">
      <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.07em] mb-2 ${iconColor}`}>
        {icon}
        <span className="text-muted">{label}</span>
      </div>
      {children}
    </div>
  );
}
