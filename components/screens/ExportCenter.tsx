'use client';

import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/context/LangContext';
import { useAppData } from '@/lib/useAppData';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Icons } from '@/components/ui/Icon';

interface ExportItem {
  key: string;
  fr: string;
  en: string;
  desc_fr: string;
  desc_en: string;
  pages: number;
  status: 'ready' | 'warning' | 'critical';
}

interface ExportHistory {
  id: string;
  format: string;
  fileName: string;
  status: string;
  createdAt: string;
}

interface ExportPayload {
  ready: boolean;
  readiness: number;
  totalCritical: number;
  totalWarnings: number;
  reviewApproved: boolean;
  items: ExportItem[];
  exports: ExportHistory[];
  meta?: {
    companyName: string;
    fiscalYearLabel: string;
    currency: string;
  };
  message?: string;
}

const FORMATS = [
  { key: 'pdf', label: 'PDF', icon: <Icons.pdf />, desc_fr: 'Pret a deposer', desc_en: 'Ready to file' },
  { key: 'excel', label: 'Excel', icon: <Icons.excel />, desc_fr: 'Donnees structurees', desc_en: 'Structured data' },
  { key: 'zip', label: 'Package .zip', icon: <Icons.archive />, desc_fr: 'Dossier complet', desc_en: 'Complete package' },
];

export function ExportCenter() {
  const { t, lang } = useT();
  const { fiscalYears } = useAppData();
  const fr = lang === 'fr';
  const activeFiscalYear = fiscalYears[0];
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  const loadExportState = async () => {
    if (!activeFiscalYear?.id) return;
    const response = await fetch(`/api/export?fiscalYearId=${encodeURIComponent(activeFiscalYear.id)}`, { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    setPayload(data);
    setSelected((prev) => (prev.size ? prev : new Set((data.items ?? []).map((item: ExportItem) => item.key))));
  };

  useEffect(() => {
    void loadExportState();
  }, [activeFiscalYear?.id]);

  const items = payload?.items ?? [];
  const selectedItems = useMemo(() => items.filter((item) => selected.has(item.key)), [items, selected]);
  const readyCount = selectedItems.filter((item) => item.status === 'ready').length;
  const blocked = !payload?.ready || selectedItems.some((item) => item.status === 'critical');
  const disabledReason = !payload
    ? (fr ? "Chargement de l'etat d'export." : 'Loading export state.')
    : selected.size === 0
      ? (fr ? 'Selectionnez au moins un document.' : 'Select at least one document.')
      : !payload.reviewApproved
        ? (fr ? 'La revision doit etre approuvee avant export.' : 'Review must be approved before export.')
        : payload.totalCritical > 0
          ? (fr ? 'Corrigez les erreurs critiques avant export.' : 'Fix critical errors before export.')
          : selectedItems.some((item) => item.status === 'critical')
            ? (fr ? 'La selection contient un document critique.' : 'The selection contains a critical document.')
            : '';

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleExport = async () => {
    if (!activeFiscalYear?.id || blocked || selected.size === 0) return;
    setExporting(true);
    setMessage('');
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYearId: activeFiscalYear.id, format, selected: Array.from(selected), includeTraceability: true }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error ?? (fr ? 'Export impossible.' : 'Export failed.'));
        return;
      }
      const blob = await response.blob();
      const fileName = response.headers.get('X-Export-File-Name') ?? `export.${format === 'excel' ? 'xlsx' : format}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setMessage(fr ? `Export genere : ${fileName}` : `Export generated: ${fileName}`);
      await loadExportState();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={payload?.meta ? `${payload.meta.companyName} - ${payload.meta.fiscalYearLabel}` : activeFiscalYear?.label}
        title={t('nav_export')}
        subtitle={
          fr
            ? "Exportez le dossier approuve. Les exports finaux restent bloques tant que la revision ou la validation contient des points bloquants."
            : 'Export the approved report package. Final exports stay blocked until review and validation are clear.'
        }
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.mail />} disabled>
              {fr ? 'Envoyer par e-mail' : 'Send by email'}
            </Btn>
            <Btn
              variant={blocked ? 'secondary' : 'primary'}
              icon={exporting ? <Icons.spark /> : <Icons.download />}
              onClick={handleExport}
              disabled={blocked || exporting || selected.size === 0}
            >
              {exporting
                ? (fr ? 'Export en cours...' : 'Exporting...')
                : blocked
                  ? (fr ? 'Export bloqué' : 'Export blocked')
                  : (payload?.totalWarnings ?? 0) > 0
                    ? (fr ? `Exporter (${payload!.totalWarnings} avertissement${payload!.totalWarnings > 1 ? 's' : ''})` : `Export (${payload!.totalWarnings} warning${payload!.totalWarnings > 1 ? 's' : ''})`)
                    : (fr ? 'Exporter la sélection' : 'Export selection')}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 px-5 py-4 bg-paper border border-line rounded-xl" style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}>
          <div>
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{fr ? "Pret a l'export" : 'Export readiness'}</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[28px] font-medium font-serif">{Math.round(payload?.readiness ?? 0)}%</span>
              <span className={`text-[12px] font-semibold ${payload?.ready ? 'text-green' : 'text-red'}`}>
                {payload?.ready ? (fr ? 'Pret' : 'Ready') : (fr ? 'Bloque' : 'Blocked')}
              </span>
            </div>
            <Progress value={payload?.readiness ?? 0} height={5} color={payload?.ready ? 'var(--color-green)' : 'var(--color-red)'} />
          </div>
          {[
            { label: fr ? 'Erreurs critiques' : 'Critical errors', value: String(payload?.totalCritical ?? 0), color: 'text-red' },
            { label: fr ? 'Selectionnes' : 'Selected', value: `${selected.size}/${items.length}`, color: 'text-ink' },
            { label: fr ? 'Prets' : 'Ready', value: `${readyCount}`, color: 'text-green' },
          ].map((s) => (
            <div key={s.label} className="border-l border-line-2 pl-4">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-2 font-semibold">{s.label}</div>
              <div className={`text-[28px] font-medium font-serif ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="px-8 py-6 pb-12 grid gap-5" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        <Card className="p-0">
          <CardHeader
            title={fr ? 'Documents a exporter' : 'Documents to export'}
            subtitle={payload?.reviewApproved ? (fr ? 'Revision approuvee.' : 'Review approved.') : (fr ? 'Revision requise avant export.' : 'Review approval is required before export.')}
            action={
              <Btn size="sm" variant="ghost" onClick={() => setSelected(new Set(items.map((item) => item.key)))}>
                {fr ? 'Tout selectionner' : 'Select all'}
              </Btn>
            }
          />
          <div>
            {items.map((item, i) => {
              const isSelected = selected.has(item.key);
              const statusBadge = item.status === 'ready' ? 'completed' : item.status === 'warning' ? 'warning' : 'critical';
              const statusLabel = item.status === 'ready' ? (fr ? 'Pret' : 'Ready') : item.status === 'warning' ? (fr ? 'Avertissement' : 'Warning') : (fr ? 'Critique' : 'Critical');

              return (
                <div
                  key={item.key}
                  className={`grid items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${isSelected ? 'bg-bg' : 'hover:bg-bg/50'}`}
                  style={{
                    gridTemplateColumns: '20px 1fr auto auto',
                    borderBottom: i < items.length - 1 ? '1px solid var(--color-line-2)' : 'none',
                    borderLeft: isSelected ? '3px solid var(--color-rust)' : '3px solid transparent',
                  }}
                  onClick={() => toggle(item.key)}
                >
                  <div className={`w-5 h-5 rounded-md border-2 grid place-items-center ${isSelected ? 'bg-rust border-rust text-white' : 'border-line bg-paper'}`}>
                    {isSelected && <Icons.check />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink">{fr ? item.fr : item.en}</div>
                    <div className="text-[12px] text-muted mt-0.5">{fr ? item.desc_fr : item.desc_en}</div>
                  </div>
                  <span className="text-[11.5px] text-muted tabular-nums whitespace-nowrap">{item.pages} p.</span>
                  <Badge status={statusBadge} label={statusLabel} dot size="sm" />
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-muted">
                {payload?.message ?? (fr ? 'Aucun calcul disponible pour export.' : 'No calculation is available for export.')}
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4 sticky top-[72px]">
          <Card className="p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{fr ? "Format d'export" : 'Export format'}</div>
            <div className="flex flex-col gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors ${format === f.key ? 'border-rust bg-rust-tint' : 'border-line bg-bg hover:border-line-2'}`}
                >
                  <span className={`w-8 h-8 rounded-lg grid place-items-center ${format === f.key ? 'bg-rust text-white' : 'bg-bg-2 text-muted-2'}`}>
                    {f.icon}
                  </span>
                  <div>
                    <div className={`text-[13px] font-semibold ${format === f.key ? 'text-rust-2' : 'text-ink'}`}>{f.label}</div>
                    <div className="text-[11.5px] text-muted">{fr ? f.desc_fr : f.desc_en}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {message && (
            <Card className="p-4">
              <div className="text-[12.5px] text-ink-2">{message}</div>
            </Card>
          )}

          {disabledReason && (
            <Card className="p-4 border-amber/40 bg-amber-tint/30">
              <div className="text-[12.5px] text-ink-2">{disabledReason}</div>
            </Card>
          )}

          <Card className="p-4">
            <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{fr ? 'Historique' : 'History'}</div>
            {(payload?.exports ?? []).length === 0 ? (
              <div className="text-[12px] text-muted py-2">{fr ? 'Aucun export genere.' : 'No export generated yet.'}</div>
            ) : (payload?.exports ?? []).map((record) => (
              <div key={record.id} className="flex items-center gap-2.5 py-2 border-b border-line-2 last:border-none">
                <span className="w-6 h-6 rounded bg-bg-2 grid place-items-center text-muted-2 flex-shrink-0">
                  <Icons.download />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-ink-2 truncate">{record.format.toUpperCase()} - {record.fileName}</div>
                  <div className="text-[11px] text-muted">{new Date(record.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
