'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/context/LangContext';
import { useEngine } from '@/context/EngineContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { TAX_FORMS } from '@/lib/data';
import { formatAmount } from '@/lib/format';
import type { TaxStatus } from '@/lib/types';

const STATUS_META: Record<TaxStatus, { fr: string; en: string; color: string }> = {
  draft:     { fr: 'Brouillon',    en: 'Draft',      color: 'text-muted bg-bg-2' },
  completed: { fr: 'Complété',     en: 'Completed',  color: 'text-green bg-green-soft' },
  warning:   { fr: 'Avertissement',en: 'Warning',    color: 'text-amber bg-amber-tint' },
  approved:  { fr: 'Approuvé',     en: 'Approved',   color: 'text-green bg-green-soft' },
};

const PATENTE_ROWS = [
  { label_fr: 'Droit proportionnel (base CA)', label_en: 'Proportional duty (revenue base)', ref: 'Art. 264 CGI', value: 1850000 },
  { label_fr: 'Droit fixe minimum', label_en: 'Minimum fixed duty', ref: 'Art. 265 CGI', value: 100000 },
  { label_fr: 'Taxe de voirie (10%)', label_en: 'Road tax (10%)', ref: 'Art. 273 CGI', value: 195000 },
  { label_fr: 'Total patente', label_en: 'Total patente', ref: '', value: 2145000 },
];

const HONORAIRES_ROWS = [
  { label_fr: 'Honoraires versés aux personnes physiques', label_en: 'Fees paid to individuals', beneficiary: 'Diaby Ibrahim', amount: 750000, taux: '10%', ret: 75000 },
  { label_fr: 'Honoraires versés aux personnes morales', label_en: 'Fees paid to legal entities', beneficiary: 'Cabinet Diaby Ibrahim & Ass.', amount: 3500000, taux: '5%', ret: 175000 },
  { label_fr: 'Commissions diverses', label_en: 'Miscellaneous commissions', beneficiary: 'Divers', amount: 1200000, taux: '10%', ret: 120000 },
];

type ActiveTab = 'forms' | 'bic' | 'dni' | 'bv' | 'patente' | 'honoraires' | 'is' | 'tva';

type FiscalConfigPayload = {
  tax_rate: number;
  patente_rate?: number;
};

const FALLBACK_TAX_FORMS = [
  { id: 'bic', title_fr: 'BIC pages 1, 2 et 3', title_en: 'BIC pages 1, 2 and 3', description_fr: 'Synthese fiscale, reintegrations, deductions et deficits.', description_en: 'Tax summary, add-backs, deductions and losses.', form_type: 'bic', status: 'completed' as TaxStatus, required: true },
  { id: 'dni', title_fr: 'Declaration DNI', title_en: 'DNI declaration', description_fr: 'Resultat fiscal, IS brut, imputations et net a payer.', description_en: 'Taxable result, gross CIT, offsets and net payable.', form_type: 'dni', status: 'completed' as TaxStatus, required: true },
  { id: 'bv', title_fr: 'B V - Resultat fiscal', title_en: 'B V - Tax result', description_fr: 'Determination du resultat fiscal et deficit reporte.', description_en: 'Tax result determination and loss carried forward.', form_type: 'bv', status: 'completed' as TaxStatus, required: true },
  { id: 'patente', title_fr: 'Patente', title_en: 'Patente', description_fr: 'Base chiffre d affaires, droit proportionnel et total.', description_en: 'Revenue base, proportional duty and total.', form_type: 'patente', status: 'completed' as TaxStatus, required: true },
  { id: 'honoraires', title_fr: 'Honoraires et commissions', title_en: 'Fees and commissions', description_fr: 'Honoraires detectes et retenues a completer.', description_en: 'Detected fees and withholding to complete.', form_type: 'honoraires', status: 'warning' as TaxStatus, required: false },
];

function fmtN(v: number | null | undefined, currency: string): string {
  if (v == null) return '—';
  return formatAmount(Math.round(v ?? 0)) + ` ${currency}`;
}

export function TaxModule() {
  const { lang } = useT();
  const { state, loadLatestCalculation } = useEngine();
  const { activeFiscalYear } = useWorkspace();
  const fr = lang === 'fr';
  const [activeTab, setActiveTab] = useState<ActiveTab>('forms');
  const [taxRate, setTaxRate] = useState('25');
  const [vatRate, setVatRate] = useState('18');
  const [patenteRate, setPatenteRate] = useState('0.5');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!state.result && !state.isLoadingSavedResult && activeFiscalYear?.id) {
      void loadLatestCalculation(activeFiscalYear.id);
    }
  }, [activeFiscalYear?.id, loadLatestCalculation, state.isLoadingSavedResult, state.result]);

  useEffect(() => {
    if (!activeFiscalYear?.id) return;
    fetch(`/api/fiscal-config?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((payload: { config?: FiscalConfigPayload } | null) => {
        if (payload?.config) setTaxRate(String(payload.config.tax_rate));
        if (payload?.config?.patente_rate !== undefined) setPatenteRate(String(payload.config.patente_rate));
      });
  }, [activeFiscalYear?.id]);

  const fiscal = state.result?.fiscal ?? null;
  const currency = state.currency;

  const tabs: { key: ActiveTab; fr: string; en: string }[] = [
    { key: 'forms',      fr: 'Vue d\'ensemble',           en: 'Overview' },
    { key: 'bic',        fr: 'BIC',                        en: 'BIC' },
    { key: 'dni',        fr: 'DNI',                        en: 'DNI' },
    { key: 'bv',         fr: 'B V',                        en: 'B V' },
    { key: 'patente',    fr: 'Patente',                   en: 'Patente' },
    { key: 'honoraires', fr: 'Honoraires & commissions',  en: 'Fees & commissions' },
    { key: 'is',         fr: 'Impôt sur les sociétés',    en: 'Corporate tax' },
    { key: 'tva',        fr: 'TVA',                       en: 'VAT' },
  ];

  const fmt = (v: number) => formatAmount(v) + ` ${currency}`;
  const turnover = state.result?.incomeStatement.turnover_N ?? 0;
  const patenteRows = fiscal?.patente_lines?.length ? fiscal.patente_lines.map((line) => ({
    label_fr: line.label_fr,
    label_en: line.label_en,
    ref: line.source ?? '',
    value: line.value ?? 0,
  })) : [
    { label_fr: 'Droit proportionnel (base CA)', label_en: 'Proportional duty (revenue base)', ref: 'Config', value: turnover * (Number(patenteRate) / 100) },
    { label_fr: 'Total patente', label_en: 'Total patente', ref: '', value: turnover * (Number(patenteRate) / 100) },
  ];
  const honorairesRows = fiscal?.honoraire_lines?.length ? fiscal.honoraire_lines.map((line) => ({
    label_fr: line.label_fr,
    label_en: line.label_en,
    beneficiary: line.source ?? '',
    amount: line.value ?? 0,
    taux: '',
    ret: line.value ?? 0,
  })) : HONORAIRES_ROWS;
  const saveFiscalConfig = async () => {
    if (!activeFiscalYear?.id) return;
    setSavingConfig(true);
    try {
      const response = await fetch('/api/fiscal-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          taxRate: Number(taxRate),
          vatRate: Number(vatRate),
          patenteRate: Number(patenteRate),
        }),
      });
      if (response.ok) await loadLatestCalculation(activeFiscalYear.id);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={state.result ? `${state.companyName} · ${fr ? 'Exercice' : 'FY'} ${state.fiscalYearLabel}` : undefined}
        title={fr ? 'Liasse fiscale' : 'Tax forms'}
        subtitle={fr ? 'Déclarations et formulaires fiscaux SYSCOHADA' : 'SYSCOHADA tax declarations and forms'}
        actions={<Btn variant="primary" icon={<Icons.save />} onClick={() => void saveFiscalConfig()}>{savingConfig ? (fr ? 'Enregistrement...' : 'Saving...') : (fr ? 'Enregistrer config' : 'Save config')}</Btn>}
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        <div className="flex gap-0 border-b border-line">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px"
              style={{ borderColor: activeTab === t.key ? 'var(--color-rust)' : 'transparent', color: activeTab === t.key ? 'var(--color-rust)' : 'var(--color-muted)' }}>
              {fr ? t.fr : t.en}
            </button>
          ))}
        </div>

        {activeTab === 'forms' && (
          <div className="flex flex-col gap-4">
            {(TAX_FORMS.length ? TAX_FORMS : FALLBACK_TAX_FORMS).map((form) => {
              const s = STATUS_META[form.status];
              return (
                <div key={form.id} className="bg-paper border border-line rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0"><Icons.doc /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink">{fr ? form.title_fr : form.title_en}</div>
                    <div className="text-[12px] text-muted mt-0.5">{fr ? form.description_fr : form.description_en}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>{fr ? s.fr : s.en}</span>
                    {form.required && <span className="text-[11px] text-rust font-semibold">{fr ? 'Requise' : 'Required'}</span>}
                    <Btn variant="ghost" onClick={() => setActiveTab(form.form_type as ActiveTab)}>{fr ? 'Compléter' : 'Fill in'}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'bic' && (
          <div className="flex flex-col gap-4">
            {(fiscal?.bic_pages ?? []).map((page) => (
              <Card key={page.schedule_code}>
                <CardHeader title={fr ? page.title_fr : page.title_en} />
                <div className="px-5 py-5">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-line-2 text-left">
                        {[fr ? 'Ligne' : 'Line', fr ? 'Source' : 'Source', fr ? `Montant (${currency})` : `Amount (${currency})`].map((h, i) => (
                          <th key={i} className="py-3 pr-5 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {page.lines.map((line) => (
                        <tr key={line.line_code} className="border-b border-line-2 last:border-none">
                          <td className="py-3 pr-5 text-ink">{fr ? line.label_fr : line.label_en}</td>
                          <td className="py-3 pr-5 text-muted text-[12px]">{line.source ?? ''}</td>
                          <td className="py-3 pr-5 text-right font-mono">{fmtN(line.value, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'dni' && (
          <Card>
            <CardHeader title={fr ? 'Declaration DNI' : 'DNI declaration'} />
            <div className="px-5 py-5">
              <table className="w-full text-[13px]">
                <tbody>
                  {(fiscal?.dni_lines ?? []).map((line) => (
                    <tr key={line.line_code} className="border-b border-line-2 last:border-none">
                      <td className="py-3 pr-5 text-ink">{fr ? line.label_fr : line.label_en}</td>
                      <td className="py-3 pr-5 text-muted text-[12px]">{line.source ?? ''}</td>
                      <td className="py-3 pr-5 text-right font-mono">{fmtN(line.value, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'bv' && fiscal?.bv_schedule && (
          <Card>
            <CardHeader title={fr ? fiscal.bv_schedule.title_fr : fiscal.bv_schedule.title_en} />
            <div className="px-5 py-5">
              <table className="w-full text-[13px]">
                <tbody>
                  {fiscal.bv_schedule.lines.map((line) => (
                    <tr key={line.line_code} className="border-b border-line-2 last:border-none">
                      <td className="py-3 pr-5 text-ink">{fr ? line.label_fr : line.label_en}</td>
                      <td className="py-3 pr-5 text-muted text-[12px]">{line.source ?? ''}</td>
                      <td className="py-3 pr-5 text-right font-mono">{fmtN(line.value, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'patente' && (
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader title={fr ? 'Déclaration de patente' : 'Patente declaration'} />
              <div className="px-5 py-5">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? "Chiffre d'affaires HT" : 'Revenue excl. VAT'}</label>
                    <input type="number" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust"
                      defaultValue={state.result ? Math.round(state.result.incomeStatement.turnover_N) : ''} />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Taux applicable (%)' : 'Applicable rate (%)'}</label>
                    <input value={patenteRate} onChange={(e) => setPatenteRate(e.target.value)} type="number" step="0.01" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
                  </div>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-line-2 text-left">
                      {[fr ? 'Élément' : 'Element', fr ? 'Référence' : 'Reference', fr ? `Montant (${currency})` : `Amount (${currency})`].map((h, i) => (
                        <th key={i} className="py-3 pr-5 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patenteRows.map((row, i) => (
                      <tr key={i} className={`border-b border-line-2 last:border-none ${i === patenteRows.length - 1 ? 'font-semibold text-ink' : ''}`}>
                        <td className="py-3 pr-5 text-ink">{fr ? row.label_fr : row.label_en}</td>
                        <td className="py-3 pr-5 text-muted font-mono text-[12px]">{row.ref}</td>
                        <td className="py-3 pr-5 text-right font-mono">{formatAmount(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'honoraires' && (
          <Card>
            <CardHeader
              title={fr ? 'Tableau récapitulatif des honoraires et commissions' : 'Summary of fees & commissions'}
              action={<Btn variant="secondary" icon={<Icons.plus />}>{fr ? 'Ajouter une ligne' : 'Add row'}</Btn>}
            />
            <div className="px-5 py-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line-2 text-left">
                    {[fr ? 'Description' : 'Description', fr ? 'Bénéficiaire' : 'Beneficiary', fr ? 'Montant brut' : 'Gross amount', fr ? 'Taux retenue' : 'WHT rate', fr ? 'Retenue' : 'WHT amount'].map((h, i) => (
                      <th key={i} className="py-3 pr-5 text-[11px] font-semibold text-muted uppercase tracking-[.07em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {honorairesRows.map((row, i) => (
                    <tr key={i} className="border-b border-line-2 last:border-none">
                      <td className="py-3 pr-5 text-ink">{fr ? row.label_fr : row.label_en}</td>
                      <td className="py-3 pr-5 text-muted">{row.beneficiary}</td>
                      <td className="py-3 pr-5 text-right font-mono">{fmt(row.amount)}</td>
                      <td className="py-3 pr-5 text-center text-muted">{row.taux}</td>
                      <td className="py-3 pr-5 text-right font-mono text-rust">{fmt(row.ret)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line font-semibold">
                    <td colSpan={2} className="py-3 pr-5 text-ink">{fr ? 'Total retenues à la source' : 'Total withholding taxes'}</td>
                    <td className="py-3 pr-5 text-right font-mono">{fmt(honorairesRows.reduce((sum, row) => sum + row.amount, 0))}</td>
                    <td />
                    <td className="py-3 pr-5 text-right font-mono text-rust">{fmt(honorairesRows.reduce((sum, row) => sum + row.ret, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'is' && (
          <Card>
            <CardHeader title={fr ? 'Impôt sur les sociétés (IS)' : 'Corporate income tax'}
              action={!fiscal ? <span className="text-[12px] text-amber">{fr ? 'Importez une balance pour calculer' : 'Import a balance to compute'}</span> : undefined} />
            <div className="px-5 py-5 grid gap-4">
              {!fiscal ? (
                <p className="text-[13px] text-muted py-4 text-center">
                  {fr ? 'Aucune balance importée. Le calcul de l\'IS nécessite une balance générale N.' : 'No trial balance imported. IS calculation requires a balance N.'}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: fr ? 'Résultat comptable avant IS' : 'Accounting result before tax', value: fmtN(fiscal.accounting_result, currency) },
                    { label: fr ? 'Réintégrations fiscales' : 'Tax add-backs', value: fmtN(fiscal.total_add_backs, currency) },
                    { label: fr ? 'Déductions fiscales' : 'Tax deductions', value: fmtN(fiscal.total_deductions, currency) },
                    { label: fr ? 'Résultat fiscal' : 'Taxable income', value: fmtN(fiscal.taxable_result, currency) },
                    { label: fr ? 'Taux IS' : 'Tax rate', value: `${taxRate}%` },
                    { label: fr ? 'IS théorique' : 'Theoretical IS', value: fmtN(fiscal.calculated_tax, currency) },
                    { label: fr ? 'Acomptes déjà versés' : 'Installments paid', value: fmtN(fiscal.installments_paid, currency) },
                    { label: fr ? 'IS net à payer' : 'Net IS payable', value: fmtN(fiscal.balance_payable, currency), highlight: true },
                  ].map((row, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${(row as {highlight?: boolean}).highlight ? 'border-rust/40 bg-rust-tint col-span-2' : 'border-line bg-bg'}`}>
                      <div className="text-[11.5px] text-muted">{row.label}</div>
                      <div className={`text-[15px] font-semibold mt-0.5 ${(row as {highlight?: boolean}).highlight ? 'text-rust' : 'text-ink'}`}>{row.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'tva' && (
          <Card>
            <CardHeader title={fr ? 'Déclaration de TVA' : 'VAT declaration'} />
            <div className="px-5 py-5 grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: fr ? 'CA taxable HT' : 'Taxable revenue excl. VAT', value: state.result ? fmtN(state.result.incomeStatement.turnover_N, currency) : '—' },
                  { label: fr ? `TVA collectée (${vatRate}%)` : `Output VAT (${vatRate}%)`, value: state.result ? fmtN(state.result.incomeStatement.turnover_N * (Number(vatRate) / 100), currency) : '—', highlight: true },
                  { label: fr ? 'TVA déductible sur achats' : 'Input VAT on purchases', value: '—' },
                  { label: fr ? 'TVA déductible sur immobilisations' : 'Input VAT on assets', value: '—' },
                  { label: fr ? 'Total TVA déductible' : 'Total input VAT', value: '—' },
                  { label: fr ? 'TVA nette à payer' : 'Net VAT payable', value: '—', highlight: true },
                ].map((row, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${(row as {highlight?: boolean}).highlight ? 'border-rust/40 bg-rust-tint' : 'border-line bg-bg'}`}>
                    <div className="text-[11.5px] text-muted">{row.label}</div>
                    <div className={`text-[15px] font-semibold mt-0.5 ${(row as {highlight?: boolean}).highlight ? 'text-rust' : 'text-ink'}`}>{row.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-muted">{fr ? 'La TVA déductible doit être saisie manuellement depuis les déclarations mensuelles.' : 'Input VAT must be entered manually from monthly declarations.'}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
