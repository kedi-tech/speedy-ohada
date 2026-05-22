'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { RawImportLine } from '@/lib/engine/types';
import type { FullCalculationResult } from '@/lib/engine/FinancialStatementEngine';
import { runFullCalculation, makeEngineContext } from '@/lib/engine/FinancialStatementEngine';
import { parseCSV, detectColumnMappings, buildColumnPreview, type ColumnPreview } from '@/lib/engine/ImportEngine';
import { normalizeBalance } from '@/lib/engine/BalanceNormalizer';
import { enrichAllWithPrefixes } from '@/lib/engine/AccountPrefixEngine';
import { enrichAllWithClass } from '@/lib/engine/OHADAClassEngine';
import type { NormalizedAccount, ColumnMapping } from '@/lib/engine/types';

export interface ImportedBalance {
  rawLines: RawImportLine[];
  normalizedAccounts: NormalizedAccount[];
  fileName: string;
  rowCount: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface EngineState {
  balanceN:  ImportedBalance | null;
  balanceN1: ImportedBalance | null;
  result:    FullCalculationResult | null;
  isCalculating: boolean;
  isLoadingSavedResult: boolean;
  latestRunId?: string;
  resultSource?: 'memory' | 'database';
  companyName:   string;
  fiscalYearLabel: string;
  currency:      string;
  // Column preview for the current file being imported
  columnPreview: ColumnPreview[];
  detectedMappings: ColumnMapping[];
}

interface EngineContextValue {
  state: EngineState;
  /** Parse a CSV text and return preview rows, without storing yet */
  previewCSV(csvText: string, fileName: string): { preview: ColumnPreview[]; mappings: ColumnMapping[]; rawLines: RawImportLine[] };
  /** Store a parsed balance (N or N-1) after user confirms column mapping */
  commitBalance(rawLines: RawImportLine[], balanceType: 'N' | 'N-1', fileName: string): void;
  /** Run the full OHADA calculation engine */
  calculate(opts?: { companyName?: string; fiscalYear?: string; currency?: string }): FullCalculationResult | null;
  /** Load the latest persisted calculation run for the current or requested fiscal year */
  loadLatestCalculation(fiscalYearId?: string): Promise<FullCalculationResult | null>;
  /** Reset everything */
  reset(): void;
  setCompanyInfo(name: string, fy: string, currency: string): void;
}

const EngineContext = createContext<EngineContextValue | null>(null);

const EMPTY: EngineState = {
  balanceN:  null,
  balanceN1: null,
  result:    null,
  isCalculating: false,
  isLoadingSavedResult: false,
  latestRunId: undefined,
  resultSource: undefined,
  companyName:   'Société',
  fiscalYearLabel: '2025',
  currency:      'GNF',
  columnPreview: [],
  detectedMappings: [],
};

function computeImportedBalance(
  rawLines: RawImportLine[],
  fileName: string,
  balanceType: 'N' | 'N-1',
): ImportedBalance {
  const normalized = enrichAllWithClass(enrichAllWithPrefixes(
    normalizeBalance(rawLines, balanceType, 'fy_1', 'co_1', 'org_1'),
  ));
  const totalDebit  = normalized.reduce((s, a) => s + a.closing_debit,  0);
  const totalCredit = normalized.reduce((s, a) => s + a.closing_credit, 0);
  return {
    rawLines,
    normalizedAccounts: normalized,
    fileName,
    rowCount:   normalized.length,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) <= 1,
  };
}

export function EngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EngineState>(EMPTY);

  const previewCSV = useCallback((csvText: string, fileName: string) => {
    const rows = parseCSV(csvText);
    const headers = (rows[0] ?? []) as string[];
    const preview = buildColumnPreview(rows, 0, 5);
    const mappings = detectColumnMappings(headers);

    // Build raw lines from first-pass with auto-detected mappings
    const colIndex = new Map(headers.map((h, i) => [h, i]));
    const getRaw = (row: unknown[], field: string): unknown => {
      const mapping = mappings.find((m) => m.target_field === field as never);
      if (!mapping) return '';
      const idx = colIndex.get(mapping.source_column);
      return idx !== undefined ? (row as unknown[])[idx] : '';
    };
    const toNum = (v: unknown) => {
      const n = Number(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };

    const rawLines: RawImportLine[] = rows.slice(1).filter((r) => r.some((c) => c !== '')).map((row, ri) => ({
      row_index:       ri + 1,
      account_number:  String(getRaw(row, 'account_number') ?? '').trim(),
      account_label:   String(getRaw(row, 'account_label') ?? '').trim(),
      opening_debit:   toNum(getRaw(row, 'opening_debit')),
      opening_credit:  toNum(getRaw(row, 'opening_credit')),
      movement_debit:  toNum(getRaw(row, 'movement_debit')),
      movement_credit: toNum(getRaw(row, 'movement_credit')),
      closing_debit:   toNum(getRaw(row, 'closing_debit')),
      closing_credit:  toNum(getRaw(row, 'closing_credit')),
      net_balance:     mappings.some((m) => m.target_field === 'net_balance') ? toNum(getRaw(row, 'net_balance')) : undefined,
      __present_fields: mappings.map((mapping) => mapping.target_field),
    })).filter((l) => l.account_number !== '');

    setState((prev) => ({ ...prev, columnPreview: preview, detectedMappings: mappings }));
    return { preview, mappings, rawLines };
  }, []);

  const commitBalance = useCallback((rawLines: RawImportLine[], balanceType: 'N' | 'N-1', fileName: string) => {
    const balance = computeImportedBalance(rawLines, fileName, balanceType);
    setState((prev) => ({
      ...prev,
      balanceN:  balanceType === 'N'   ? balance : prev.balanceN,
      balanceN1: balanceType === 'N-1' ? balance : prev.balanceN1,
      result: null, // invalidate previous result
      latestRunId: undefined,
      resultSource: undefined,
    }));
  }, []);

  const calculate = useCallback((opts?: { companyName?: string; fiscalYear?: string; currency?: string }) => {
    setState((prev) => ({ ...prev, isCalculating: true }));
    try {
      const balN  = state.balanceN;
      if (!balN) return null;
      const balN1 = state.balanceN1;

      const ctx = makeEngineContext({
        organization_id:   'org_1',
        company_id:        'co_1',
        fiscal_year_id:    'fy_1',
        fiscal_year_label: opts?.fiscalYear ?? state.fiscalYearLabel,
        currency_code:     opts?.currency ?? state.currency,
        tax_rate:          25,
        triggered_by:      'user',
        trigger_reason:    'manual_run',
      });

      const result = runFullCalculation({
        context:   ctx,
        rawLinesN: balN.rawLines,
        rawLinesN1: balN1?.rawLines,
        companyInfo: {
          name:     opts?.companyName ?? state.companyName,
          currency: opts?.currency ?? state.currency,
        },
      });

      setState((prev) => ({
        ...prev,
        isCalculating: false,
        result,
        latestRunId: undefined,
        resultSource: 'memory',
        companyName:   opts?.companyName ?? prev.companyName,
        fiscalYearLabel: opts?.fiscalYear ?? prev.fiscalYearLabel,
        currency:      opts?.currency ?? prev.currency,
      }));
      return result;
    } catch (err) {
      setState((prev) => ({ ...prev, isCalculating: false }));
      console.error('Engine calculation failed:', err);
      return null;
    }
  }, [state]);

  const loadLatestCalculation = useCallback(async (fiscalYearId?: string) => {
    setState((prev) => ({ ...prev, isLoadingSavedResult: true }));
    try {
      const query = fiscalYearId ? `?fiscalYearId=${encodeURIComponent(fiscalYearId)}` : '';
      const response = await fetch(`/api/calculations/latest${query}`, { cache: 'no-store' });

      if (response.status === 404) {
        setState((prev) => ({ ...prev, isLoadingSavedResult: false }));
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to load latest calculation run');
      }

      const payload = await response.json();
      const result = payload.result as FullCalculationResult;

      setState((prev) => ({
        ...prev,
        result,
        isLoadingSavedResult: false,
        latestRunId: payload.run?.id,
        resultSource: 'database',
        companyName: payload.meta?.companyName ?? prev.companyName,
        fiscalYearLabel: payload.meta?.fiscalYearLabel ?? prev.fiscalYearLabel,
        currency: payload.meta?.currency ?? prev.currency,
      }));

      return result;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoadingSavedResult: false }));
      console.error('Loading latest calculation failed:', err);
      return null;
    }
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const setCompanyInfo = useCallback((name: string, fy: string, currency: string) => {
    setState((prev) => ({ ...prev, companyName: name, fiscalYearLabel: fy, currency }));
  }, []);

  return (
    <EngineContext.Provider value={{ state, previewCSV, commitBalance, calculate, loadLatestCalculation, reset, setCompanyInfo }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used inside EngineProvider');
  return ctx;
}
