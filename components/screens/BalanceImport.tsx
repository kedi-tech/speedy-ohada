'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { parseCSV } from '@/lib/engine/ImportEngine';
import { summarizeBalance } from '@/lib/engine/BalanceNormalizer';
import { normalizeBalance } from '@/lib/engine/BalanceNormalizer';
import { enrichAllWithPrefixes } from '@/lib/engine/AccountPrefixEngine';
import { enrichAllWithClass } from '@/lib/engine/OHADAClassEngine';
import { useWorkspace } from '@/context/WorkspaceContext';
import type { RawImportLine } from '@/lib/engine/types';
import { formatAmount } from '@/lib/format';

const STEPS = ['upload', 'columns', 'preview'] as const;
type Step = typeof STEPS[number];

function fmtAmount(n: number) {
  return formatAmount(Math.round(n));
}

const toNum = (v: unknown) => {
  const raw = String(v ?? '').trim().replace(/\s/g, '');
  const isNeg = (raw.startsWith('(') && raw.endsWith(')')) || raw.startsWith('-');
  const stripped = raw.replace(/^-/, '').replace(/^\(/, '').replace(/\)$/, '');
  const cleaned = stripped.includes(',') && stripped.includes('.')
    ? stripped.replace(/,/g, '')
    : stripped.split(',').length > 2
      ? stripped.replace(/,/g, '')
      : /,\d{3}$/.test(stripped)
        ? stripped.replace(/,/g, '')
        : stripped.replace(',', '.');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : (isNeg ? -Math.abs(n) : n);
};

const EXCEL_EXTENSIONS = ['xlsx', 'xls', 'xlsm'];

interface ParsedFile {
  fileName:  string;
  sheetName?: string;
  rows:      unknown[][];
  headers:   string[];
  rawLines:  RawImportLine[];
  colMap:    Record<string, string>;
}

// Known field labels
const FIELD_LABELS: Record<string, { fr: string; en: string }> = {
  account_number:  { fr: 'Numéro de compte', en: 'Account number' },
  account_label:   { fr: 'Libellé',          en: 'Label' },
  opening_debit:   { fr: 'Débit ouverture',  en: 'Opening debit' },
  opening_credit:  { fr: 'Crédit ouverture', en: 'Opening credit' },
  movement_debit:  { fr: 'Mvt. débit',       en: 'Movement debit' },
  movement_credit: { fr: 'Mvt. crédit',      en: 'Movement credit' },
  closing_debit:   { fr: 'Solde débit',      en: 'Closing debit' },
  closing_credit:  { fr: 'Solde crédit',     en: 'Closing credit' },
  '(ignorer)':     { fr: '(ignorer)',         en: '(ignore)' },
};

const FIELD_OPTIONS = Object.keys(FIELD_LABELS);

// Auto-detect which system field a column header maps to
const ALIASES: Record<string, string> = {
  'numéro de compte': 'account_number', 'numero de compte': 'account_number',
  'compte': 'account_number', 'num compte': 'account_number', 'code': 'account_number',
  'account number': 'account_number', 'account no': 'account_number',
  'libellé': 'account_label', 'libelle': 'account_label', 'label': 'account_label',
  'intitulé': 'account_label', 'designation': 'account_label', 'description': 'account_label',
  'débit ouverture': 'opening_debit', 'debit ouverture': 'opening_debit', 'opening debit': 'opening_debit',
  'crédit ouverture': 'opening_credit', 'credit ouverture': 'opening_credit', 'opening credit': 'opening_credit',
  'mouvement débit': 'movement_debit', 'mvt débit': 'movement_debit', 'movement debit': 'movement_debit',
  'mouvement crédit': 'movement_credit', 'mvt crédit': 'movement_credit', 'movement credit': 'movement_credit',
  'solde débit': 'closing_debit', 'solde debit': 'closing_debit', 'closing debit': 'closing_debit',
  'débit': 'closing_debit', 'debit': 'closing_debit',
  'solde crédit': 'closing_credit', 'solde credit': 'closing_credit', 'closing credit': 'closing_credit',
  'crédit': 'closing_credit', 'credit': 'closing_credit',
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectField(header: string, index = -1, columnCount = 0): string {
  if (columnCount >= 8) {
    const byIndex: Record<number, string> = {
      0: 'account_number',
      1: 'account_label',
      2: 'opening_debit',
      3: 'opening_credit',
      4: 'movement_debit',
      5: 'movement_credit',
      6: 'closing_debit',
      7: 'closing_credit',
    };
    if (byIndex[index]) return byIndex[index];
  }

  const normalized = normalizeHeader(header);
  if (normalized.includes('compte') || normalized === 'code') return 'account_number';
  if (normalized.includes('libelle') || normalized.includes('label') || normalized.includes('intitule')) return 'account_label';
  if (normalized === 'debiteurs' || normalized === 'debits') return 'closing_debit';
  if (normalized === 'crediteurs' || normalized === 'credits') return 'closing_credit';
  return ALIASES[header.toLowerCase().trim()] ?? '(ignorer)';
}

function cleanRows(rows: unknown[][]) {
  return rows
    .map((row) => row.map((cell) => cell ?? ''))
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
}

function findHeaderRowIndex(rows: unknown[][]) {
  const limit = Math.min(rows.length, 20);
  for (let i = 0; i < limit; i += 1) {
    const normalized = rows[i].map((cell) => normalizeHeader(String(cell ?? '')));
    const hasAccount = normalized.some((cell) => cell.includes('compte') || cell === 'code');
    const hasLabel = normalized.some((cell) => cell.includes('libelle') || cell.includes('label') || cell.includes('intitule'));
    if (hasAccount && hasLabel) return i;
  }
  for (let i = 0; i < limit; i += 1) {
    const normalized = rows[i].map((cell) => normalizeHeader(String(cell ?? '')));
    const hasAccount = normalized.some((cell) => cell.includes('compte') || cell === 'code');
    const nextRowsHaveAccounts = rows.slice(i + 1, i + 6).some((row) => /^[0-9]/.test(String(row[0] ?? '').trim()));
    if (hasAccount && nextRowsHaveAccounts) return i;
  }
  return 0;
}

function makeUniqueHeaders(headers: string[]) {
  const counts = new Map<string, number>();
  return headers.map((header, index) => {
    const base = header || `Column ${index + 1}`;
    const next = (counts.get(base) ?? 0) + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base} ${next}`;
  });
}

function buildRawLines(rows: unknown[][], headers: string[], colMap: Record<string, string>): RawImportLine[] {
  const colIdx = new Map(headers.map((h, i) => [h, i]));
  const getByField = (row: unknown[], field: string): unknown => {
    const header = Object.entries(colMap).find(([, f]) => f === field)?.[0];
    if (!header && headers.length >= 8) {
      const fallbackIndex: Record<string, number> = {
        account_number: 0,
        account_label: 1,
        opening_debit: 2,
        opening_credit: 3,
        movement_debit: 4,
        movement_credit: 5,
        closing_debit: 6,
        closing_credit: 7,
      };
      const idx = fallbackIndex[field];
      return idx !== undefined ? row[idx] : '';
    }
    if (!header) return '';
    const idx = colIdx.get(header);
    return idx !== undefined ? row[idx] : '';
  };

  const IGNORED_ACCOUNTS = new Set(['521600']);

  return rows.slice(1).filter((r) => r.some((c) => c !== '' && c !== null && c !== undefined)).map((row, ri) => ({
    row_index:       ri + 1,
    account_number:  String(getByField(row, 'account_number') ?? '').trim(),
    account_label:   String(getByField(row, 'account_label') ?? '').trim(),
    opening_debit:   toNum(getByField(row, 'opening_debit')),
    opening_credit:  toNum(getByField(row, 'opening_credit')),
    movement_debit:  toNum(getByField(row, 'movement_debit')),
    movement_credit: toNum(getByField(row, 'movement_credit')),
    closing_debit:   toNum(getByField(row, 'closing_debit')),
    closing_credit:  toNum(getByField(row, 'closing_credit')),
  })).filter((l) => /^[0-9]/.test(l.account_number) && !IGNORED_ACCOUNTS.has(l.account_number));
}

function detectSheets(sheetNames: string[]): { nSheet: string | null; n1Sheet: string | null } {
  const norm = (s: string) => normalizeHeader(s);
  const isN  = (n: string) => n === 'n';
  const isN1 = (n: string) => n === 'n-1';
  const nSheet  = sheetNames.find((s) => isN(norm(s)))  ?? null;
  const n1Sheet = sheetNames.find((s) => isN1(norm(s))) ?? null;
  return { nSheet, n1Sheet };
}

export function BalanceImport() {
  const { t, lang } = useT();
  const router = useRouter();
  const { activeFiscalYear } = useWorkspace();
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [balanceType, setBalanceType] = useState<'N' | 'N-1'>('N');
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [parsedN1, setParsedN1] = useState<ParsedFile | null>(null);
  const [onlyNSheet, setOnlyNSheet] = useState(false);
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stepIndex = STEPS.indexOf(step);

  const processFile = useCallback((file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || (!EXCEL_EXTENSIONS.includes(ext) && ext !== 'csv' && ext !== 'txt')) {
      setError(lang === 'fr' ? 'Seul le format CSV est supporté pour le moment. Exportez votre balance depuis Excel en CSV.' : 'Only CSV format is supported. Please export your balance from Excel as CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      let rows: unknown[][] = [];

      if (EXCEL_EXTENSIONS.includes(ext)) {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(e.target?.result, { type: 'array' });
        const { nSheet, n1Sheet } = detectSheets(workbook.SheetNames);

        if (!nSheet) {
          setError(
            lang === 'fr'
              ? `Aucune feuille nommée "N" trouvée. Les feuilles disponibles sont : ${workbook.SheetNames.join(', ')}. Renommez la feuille de l'exercice courant en "N" et celle de l'exercice précédent en "N-1".`
              : `No sheet named "N" found. Available sheets: ${workbook.SheetNames.join(', ')}. Rename the current-year sheet to "N" and the prior-year sheet to "N-1".`,
          );
          return;
        }

        const nWorksheet = workbook.Sheets[nSheet];
        rows = nWorksheet ? XLSX.utils.sheet_to_json<unknown[]>(nWorksheet, { header: 1, raw: false, defval: '' }) : [];

        if (n1Sheet && workbook.Sheets[n1Sheet]) {
          let n1Rows = cleanRows(XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[n1Sheet], { header: 1, raw: false, defval: '' }));
          if (n1Rows.length >= 2) {
            const n1HeaderIdx = findHeaderRowIndex(n1Rows);
            n1Rows = n1Rows.slice(n1HeaderIdx);
            const n1Headers = makeUniqueHeaders((n1Rows[0] ?? []).map((h) => String(h ?? '').trim()));
            const n1ColMap: Record<string, string> = {};
            n1Headers.forEach((h, i) => { n1ColMap[h] = detectField(h, i, n1Headers.length); });
            const n1RawLines = buildRawLines(n1Rows, n1Headers, n1ColMap);
            setParsedN1({ fileName: file.name, sheetName: n1Sheet, rows: n1Rows, headers: n1Headers, rawLines: n1RawLines, colMap: n1ColMap });
            setOnlyNSheet(false);
          } else {
            setParsedN1(null);
            setOnlyNSheet(true);
          }
        } else {
          setParsedN1(null);
          setOnlyNSheet(true);
        }
        setBalanceType('N');
      } else {
        setParsedN1(null);
        const text = e.target?.result as string;
        const sep = text.includes(';') ? ';' : ',';
        rows = parseCSV(text, sep);
      }

      rows = cleanRows(rows);
      if (rows.length < 2) {
        setError(lang === 'fr' ? 'Fichier vide ou invalide.' : 'File is empty or invalid.');
        return;
      }
      const headerRowIndex = findHeaderRowIndex(rows);
      rows = rows.slice(headerRowIndex);
      const headers = makeUniqueHeaders((rows[0] ?? []).map((h) => String(h ?? '').trim()));
      const initialColMap: Record<string, string> = {};
      headers.forEach((h, index) => { initialColMap[h] = detectField(h, index, headers.length); });
      const rawLines = buildRawLines(rows, headers, initialColMap);
      setParsed({ fileName: file.name, rows, headers, rawLines, colMap: initialColMap });
      setColMap(initialColMap);
      setStep('columns');
    };
    if (EXCEL_EXTENSIONS.includes(ext)) reader.readAsArrayBuffer(file);
    else reader.readAsText(file, 'UTF-8');
  }, [balanceType, lang]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleColMapChange = (header: string, field: string) => {
    setColMap((prev) => {
      const next = { ...prev, [header]: field };
      if (parsed) {
        const newRaw = buildRawLines(parsed.rows, parsed.headers, next);
        setParsed((p) => p ? { ...p, colMap: next, rawLines: newRaw } : p);
      }
      return next;
    });
  };

  const rawLines   = parsed   ? buildRawLines(parsed.rows,   parsed.headers,   colMap) : [];
  const rawLinesN1 = parsedN1 ? buildRawLines(parsedN1.rows, parsedN1.headers, colMap) : [];

  // Compute live preview stats
  const previewAccounts = rawLines.length > 0 ? enrichAllWithClass(enrichAllWithPrefixes(
    normalizeBalance(rawLines, balanceType, 'fy_1', 'co_1', 'org_1')
  )) : [];
  const summary = previewAccounts.length > 0 ? summarizeBalance(previewAccounts) : null;

  const handleValidate = async () => {
    if (!activeFiscalYear) {
      setError(lang === 'fr' ? 'Creez d abord une societe et un exercice fiscal.' : 'Create a company and fiscal year first.');
      return;
    }

    setIsImporting(true);
    setError('');

    const fileName = parsed?.fileName ?? 'balance.xlsx';

    // Import N (with optional promote-previous-N-to-N-1 when only N sheet was found)
    const importRes = await fetch('/api/trial-balance/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fiscalYearId:    activeFiscalYear.id,
        balanceType:     'N',
        rawLines,
        fileName,
        columnMap:       colMap,
        sheetName:       parsed?.sheetName,
        promoteExistingN: onlyNSheet,
      }),
    });

    if (!importRes.ok) {
      setIsImporting(false);
      setError(lang === 'fr' ? "L'import a échoué. Vérifiez le fichier et l'exercice." : 'Import failed. Check the file and fiscal year.');
      return;
    }

    // Import N-1 when both sheets were found
    if (parsedN1 && rawLinesN1.length > 0) {
      const importResN1 = await fetch('/api/trial-balance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: activeFiscalYear.id,
          balanceType:  'N-1',
          rawLines:     rawLinesN1,
          fileName,
          columnMap:    colMap,
          sheetName:    parsedN1.sheetName,
        }),
      });
      if (!importResN1.ok) {
        setIsImporting(false);
        setError(lang === 'fr' ? "L'import N-1 a échoué." : 'N-1 import failed.');
        return;
      }
    }

    await fetch('/api/calculations/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fiscalYearId: activeFiscalYear.id }),
    });

    setIsImporting(false);
    router.push('/validation');
    router.refresh();
  };

  return (
    <div>
      <PageHeader
        eyebrow={activeFiscalYear ? `${activeFiscalYear.company_name ?? ''} · ${lang === 'fr' ? 'Exercice' : 'FY'} ${activeFiscalYear.label}` : undefined}
        title={t('nav_import')}
        subtitle={
          lang === 'fr'
            ? "Importez la balance générale au format CSV. L'assistant détecte automatiquement les colonnes."
            : 'Import the trial balance in Excel or CSV format. The assistant auto-detects columns.'
        }
        actions={
          step === 'preview' ? (
            <>
              <Btn variant="secondary" onClick={() => setStep('columns')}>
                {lang === 'fr' ? 'Retour' : 'Back'}
              </Btn>
              <Btn
                variant="primary"
                icon={isImporting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icons.check />}
                disabled={isImporting || rawLines.length === 0}
                onClick={handleValidate}
              >
                {isImporting ? (lang === 'fr' ? 'Traitement…' : 'Processing…') : (lang === 'fr' ? 'Valider et continuer' : 'Validate & continue')}
              </Btn>
            </>
          ) : null
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Stepper */}
        <div className="flex items-center gap-0">
          {([
            { key: 'upload',  label: lang === 'fr' ? 'Fichier' : 'File' },
            { key: 'columns', label: lang === 'fr' ? 'Colonnes' : 'Columns' },
            { key: 'preview', label: lang === 'fr' ? 'Aperçu' : 'Preview' },
          ] as { key: Step; label: string }[]).map((s, i) => {
            const done = STEPS.indexOf(s.key) < stepIndex;
            const active = s.key === step;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold border ${
                    done ? 'bg-green text-white border-green' :
                    active ? 'bg-rust text-white border-rust' :
                    'bg-bg-2 text-muted-2 border-line'
                  }`}>
                    {done ? <Icons.check /> : String(i + 1)}
                  </div>
                  <span className={`text-[13px] font-medium ${active ? 'text-ink' : 'text-muted'}`}>{s.label}</span>
                </div>
                {i < 2 && (
                  <div className="w-12 h-px mx-3" style={{ background: done ? 'var(--color-green)' : 'var(--color-line)' }} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-soft border border-red/20 text-[13px] text-red">
            {error}
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
            <Card className="p-5 flex flex-col gap-4">
              {/* Sheet naming instructions */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-bg-2 border border-line">
                <span className="text-muted-2 mt-0.5 flex-shrink-0"><Icons.info /></span>
                <div>
                  <div className="text-[12.5px] font-semibold text-ink mb-0.5">
                    {lang === 'fr' ? 'Nommage des feuilles Excel requis' : 'Required Excel sheet names'}
                  </div>
                  <div className="text-[12px] text-ink-2 leading-relaxed">
                    {lang === 'fr'
                      ? 'Le fichier doit contenir une feuille nommée exactement "N" (exercice courant) et optionnellement "N-1" (exercice précédent). Si seule la feuille "N" est présente, la balance N précédente sera automatiquement promue en N-1.'
                      : 'The file must contain a sheet named exactly "N" (current year) and optionally "N-1" (prior year). If only the "N" sheet is present, the previous N balance will automatically be promoted to N-1.'}
                  </div>
                </div>
              </div>

              {/* Drop zone */}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.xlsm,.csv,.txt"
                className="hidden"
                onChange={handleFileInput}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-14 cursor-pointer transition-colors ${
                  isDragging ? 'border-rust bg-rust-tint' : 'border-line-2 hover:border-line hover:bg-bg'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-bg-2 grid place-items-center text-muted-2">
                  <Icons.upload />
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-ink mb-1">
                    {lang === 'fr' ? 'Déposez votre fichier CSV ici' : 'Drop your CSV file here'}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {lang === 'fr' ? 'ou cliquez pour parcourir · UTF-8, séparateur ; ou ,' : 'or click to browse · UTF-8, semicolon or comma separated'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <div className="flex flex-col gap-3">
              <Card className="p-4">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{lang === 'fr' ? 'Formats acceptés' : 'Accepted formats'}</div>
                {[
                  { icon: <Icons.doc />, label: 'CSV', sub: lang === 'fr' ? 'UTF-8, ; ou ,' : 'UTF-8, ; or ,' },
                  { icon: <Icons.excel />, label: 'Excel → CSV', sub: lang === 'fr' ? 'Enregistrer sous → CSV' : 'Save As → CSV' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5 py-2">
                    <span className="w-7 h-7 rounded-lg bg-bg-2 grid place-items-center text-muted-2">{f.icon}</span>
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{f.label}</div>
                      <div className="text-[11.5px] text-muted">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <Card className="p-4">
                <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">{lang === 'fr' ? 'Colonnes requises' : 'Required columns'}</div>
                {[
                  lang === 'fr' ? 'N° de compte (classe 1–9)' : 'Account number (class 1–9)',
                  lang === 'fr' ? 'Libellé du compte' : 'Account label',
                  lang === 'fr' ? 'Solde débiteur' : 'Debit balance',
                  lang === 'fr' ? 'Solde créditeur' : 'Credit balance',
                ].map((l) => (
                  <div key={l} className="flex items-center gap-2 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                    <span className="text-[12.5px] text-ink-2">{l}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* Step: Columns */}
        {step === 'columns' && parsed && (
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'start' }}>
            {/* Sheet detection status */}
            <div className="col-span-2 flex items-center gap-4 px-4 py-3 rounded-xl border border-line bg-bg-2 text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green grid place-items-center text-white" style={{ fontSize: 9 }}>✓</span>
                <span className="text-ink-2">
                  {lang === 'fr' ? 'Feuille N :' : 'Sheet N:'}{' '}
                  <span className="font-mono font-semibold text-ink">{parsed.sheetName ?? 'N'}</span>
                </span>
              </div>
              {parsedN1 ? (
                <div className="flex items-center gap-2 border-l border-line pl-4">
                  <span className="w-4 h-4 rounded-full bg-green grid place-items-center text-white" style={{ fontSize: 9 }}>✓</span>
                  <span className="text-ink-2">
                    {lang === 'fr' ? 'Feuille N-1 :' : 'Sheet N-1:'}{' '}
                    <span className="font-mono font-semibold text-ink">{parsedN1.sheetName ?? 'N-1'}</span>
                  </span>
                </div>
              ) : onlyNSheet ? (
                <div className="flex items-center gap-2 border-l border-line pl-4">
                  <span className="text-[13px] text-amber-500 font-bold leading-none">!</span>
                  <span className="text-ink-2">
                    {lang === 'fr'
                      ? 'Aucune feuille N-1 — la balance N existante sera automatiquement promue en N-1'
                      : 'No N-1 sheet — the existing N balance will automatically be promoted to N-1'}
                  </span>
                </div>
              ) : null}
            </div>
            <Card>
              <CardHeader
                title={lang === 'fr' ? 'Affectation des colonnes' : 'Column mapping'}
                subtitle={
                  lang === 'fr'
                    ? `Fichier : ${parsed.fileName} · ${rawLines.length} lignes détectées`
                    : `File: ${parsed.fileName} · ${rawLines.length} rows detected`
                }
              />
              <div>
                <div className="grid px-5 py-2.5 bg-bg border-b border-line text-[11px] font-semibold text-muted uppercase tracking-[.06em]"
                  style={{ gridTemplateColumns: '1fr 140px 1fr 180px' }}>
                  <span>{lang === 'fr' ? 'En-tête fichier' : 'File header'}</span>
                  <span>{lang === 'fr' ? 'Aperçu' : 'Sample'}</span>
                  <span>{lang === 'fr' ? 'Champ détecté' : 'Detected field'}</span>
                  <span>{lang === 'fr' ? 'Affecter à' : 'Map to'}</span>
                </div>
                {parsed.headers.map((header, i) => {
                  const sample = parsed.rows.slice(1, 4).map((r) => String(r[i] ?? '')).filter(Boolean).join(', ');
                  const detected = detectField(header, i, parsed.headers.length);
                  return (
                    <div
                      key={`${header || 'column'}-${i}`}
                      className="grid items-center gap-3 px-5 py-3"
                      style={{ gridTemplateColumns: '1fr 140px 1fr 180px', borderBottom: i < parsed.headers.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}
                    >
                      <div className="text-[12.5px] font-mono text-ink-2 truncate">{header}</div>
                      <div className="text-[11.5px] text-muted truncate">{sample || '—'}</div>
                      <div className="text-[12px] text-muted-2">
                        {detected ? (lang === 'fr' ? FIELD_LABELS[detected]?.fr : FIELD_LABELS[detected]?.en) ?? detected : '—'}
                      </div>
                      <select
                        value={colMap[header] ?? '(ignorer)'}
                        onChange={(e) => handleColMapChange(header, e.target.value)}
                        className="text-[12.5px] text-ink bg-bg border border-line rounded-lg px-2.5 py-1.5 outline-none focus:border-rust"
                      >
                        {FIELD_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {lang === 'fr' ? (FIELD_LABELS[o]?.fr ?? o) : (FIELD_LABELS[o]?.en ?? o)}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center px-5 py-3.5 border-t border-line-2">
                <Btn variant="ghost" onClick={() => { setParsed(null); setStep('upload'); }}>
                  {lang === 'fr' ? '← Retour' : '← Back'}
                </Btn>
                <Btn variant="primary" iconRight={<Icons.arrowRight />} onClick={() => setStep('preview')}>
                  {lang === 'fr' ? 'Suivant : aperçu' : 'Next: preview'}
                </Btn>
              </div>
            </Card>

            <Card className="p-4 sticky top-[72px]">
              <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-3 font-semibold">
                {lang === 'fr' ? 'Résumé de détection' : 'Detection summary'}
              </div>
              {[
                { label: lang === 'fr' ? 'Lignes détectées' : 'Detected rows', value: String(rawLines.length), ok: rawLines.length > 0 },
                { label: lang === 'fr' ? 'Colonnes mappées' : 'Mapped columns', value: `${Object.values(colMap).filter((v) => v !== '(ignorer)').length}/${parsed.headers.length}`, ok: true },
                { label: lang === 'fr' ? 'Fichier' : 'File', value: parsed.fileName.split('.').pop()?.toUpperCase() ?? '?', ok: true },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-line-2 last:border-none">
                  <span className="text-[12.5px] text-ink-2">{r.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-semibold text-ink">{r.value}</span>
                    {r.ok && <span className="w-1.5 h-1.5 rounded-full bg-green" />}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && !summary && (
          <Card className="p-5">
            <div className="text-[14px] font-semibold text-ink mb-1">
              {lang === 'fr' ? 'Aucune ligne a afficher' : 'No rows to preview'}
            </div>
            <div className="text-[12.5px] text-muted mb-4">
              {lang === 'fr'
                ? 'Verifiez l affectation des colonnes. Les colonnes Compte, Libelle, Debit cloture et Credit cloture doivent etre detectees.'
                : 'Check the column mapping. Account, Label, Closing debit, and Closing credit must be detected.'}
            </div>
            <Btn variant="secondary" onClick={() => setStep('columns')}>
              {lang === 'fr' ? 'Retour aux colonnes' : 'Back to columns'}
            </Btn>
          </Card>
        )}

        {step === 'preview' && summary && (
          <div className="flex flex-col gap-4">
            {/* Summary strip */}
            <div className="grid gap-4 p-5 bg-paper border border-line rounded-xl" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
              {[
                { label: lang === 'fr' ? 'Lignes' : 'Rows', value: String(previewAccounts.length), sub: lang === 'fr' ? 'comptes importés' : 'accounts imported' },
                { label: lang === 'fr' ? 'Total débit' : 'Total debit', value: fmtAmount(summary.total_debit), sub: activeFiscalYear?.currency ?? '' },
                { label: lang === 'fr' ? 'Total crédit' : 'Total credit', value: fmtAmount(summary.total_credit), sub: activeFiscalYear?.currency ?? '' },
                { label: lang === 'fr' ? 'Équilibre' : 'Balance check', value: summary.is_balanced ? '✓' : '✗', sub: summary.is_balanced ? (lang === 'fr' ? 'Équilibré' : 'Balanced') : (lang === 'fr' ? 'Déséquilibré' : 'Unbalanced') },
                { label: lang === 'fr' ? 'Fichier' : 'File', value: parsed?.fileName.split('.').pop()?.toUpperCase() ?? '?', sub: parsed?.fileName ?? '' },
              ].map((s, i) => (
                <div key={i} className={i > 0 ? 'border-l border-line-2 pl-4' : ''}>
                  <div className="text-[11px] text-muted uppercase tracking-[.08em] mb-1.5 font-semibold">{s.label}</div>
                  <div className={`text-[22px] font-medium font-serif tracking-[-0.02em] leading-none ${
                    s.label.includes('Équilibre') || s.label.includes('Balance') ? (summary.is_balanced ? 'text-green' : 'text-red') : 'text-ink'
                  }`}>{s.value}</div>
                  <div className="text-[11px] text-muted mt-1 truncate">{s.sub}</div>
                </div>
              ))}
            </div>

            {!summary.is_balanced && (
              <div className="px-4 py-3 rounded-xl bg-red-soft border border-red/20 text-[13px] text-red">
                {lang === 'fr'
                  ? `La balance n'est pas équilibrée. Écart : ${fmtAmount(Math.abs(summary.difference))} ${activeFiscalYear?.currency ?? ''}. Vérifiez votre fichier avant de continuer.`
                  : `Balance is not balanced. Difference: ${fmtAmount(Math.abs(summary.difference))} ${activeFiscalYear?.currency ?? ''}. Check your file before continuing.`}
              </div>
            )}

            {/* Table preview */}
            <Card className="p-0">
              <CardHeader
                title={lang === 'fr' ? `Aperçu de la balance (${Math.min(previewAccounts.length, 50)} premières lignes)` : `Balance preview (first ${Math.min(previewAccounts.length, 50)} lines)`}
                action={
                  <Badge
                    status={summary.is_balanced ? 'completed' : 'warning'}
                    label={summary.is_balanced ? (lang === 'fr' ? 'Équilibrée' : 'Balanced') : (lang === 'fr' ? 'Déséquilibrée' : 'Unbalanced')}
                    dot
                    size="sm"
                  />
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-bg border-b border-line">
                      {[
                        lang === 'fr' ? 'Compte' : 'Account',
                        lang === 'fr' ? 'Libellé' : 'Label',
                        lang === 'fr' ? 'Classe' : 'Class',
                        lang === 'fr' ? 'Débit clôture' : 'Closing debit',
                        lang === 'fr' ? 'Crédit clôture' : 'Closing credit',
                        lang === 'fr' ? 'Solde net' : 'Net balance',
                        lang === 'fr' ? 'Statut' : 'Status',
                      ].map((h, i) => (
                        <th key={i} className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-[.06em] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewAccounts.slice(0, 50).map((acc, i) => (
                      <tr
                        key={acc.account_number + i}
                        className="hover:bg-bg transition-colors"
                        style={{ borderBottom: i < Math.min(previewAccounts.length, 50) - 1 ? '1px solid var(--color-line-2)' : 'none' }}
                      >
                        <td className="px-4 py-2.5 font-mono text-[12px] text-ink-2 whitespace-nowrap">{acc.account_number}</td>
                        <td className="px-4 py-2.5 text-[12.5px] text-ink max-w-[200px] truncate">{acc.account_label}</td>
                        <td className="px-4 py-2.5 text-[12px] text-muted whitespace-nowrap">
                          {acc.account_class !== undefined ? `Cl. ${acc.account_class}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] tabular-nums text-right text-ink-2 whitespace-nowrap">
                          {acc.closing_debit > 0 ? fmtAmount(acc.closing_debit) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] tabular-nums text-right text-ink-2 whitespace-nowrap">
                          {acc.closing_credit > 0 ? fmtAmount(acc.closing_credit) : '—'}
                        </td>
                        <td className={`px-4 py-2.5 text-[12px] tabular-nums text-right font-semibold whitespace-nowrap ${acc.net_balance < 0 ? 'text-red' : 'text-ink'}`}>
                          {fmtAmount(acc.net_balance)}
                        </td>
                        <td className="px-4 py-2.5">
                          {acc.warnings.length === 0 ? (
                            <span className="text-[11px] font-medium text-green">Auto</span>
                          ) : (
                            <Badge status="warning" label={lang === 'fr' ? 'Avert.' : 'Warn'} size="sm" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-bg border-t-2 border-line">
                      <td className="px-4 py-3 text-[12px] font-bold text-ink" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-[12px] font-bold tabular-nums text-right text-ink">{fmtAmount(summary.total_debit)}</td>
                      <td className="px-4 py-3 text-[12px] font-bold tabular-nums text-right text-ink">{fmtAmount(summary.total_credit)}</td>
                      <td className="px-4 py-3 text-[12px] font-bold tabular-nums text-right text-ink">
                        {fmtAmount(summary.total_debit - summary.total_credit)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          status={summary.is_balanced ? 'completed' : 'warning'}
                          label={summary.is_balanced ? (lang === 'fr' ? 'Équilibré' : 'Balanced') : (lang === 'fr' ? 'Écart' : 'Gap')}
                          dot
                          size="sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
