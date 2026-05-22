import type { RawImportLine, ImportConfig, ImportResult, ColumnMapping, BalanceType } from './types';
import { toNumber } from './BalanceNormalizer';

// ─── Column detection helpers ─────────────────────────────────────────────────

const FIELD_ALIASES: Record<keyof Pick<RawImportLine, 'account_number' | 'account_label' | 'opening_debit' | 'opening_credit' | 'movement_debit' | 'movement_credit' | 'closing_debit' | 'closing_credit' | 'net_balance'>, string[]> = {
  account_number:  ['numéro de compte', 'numero de compte', 'compte', 'num compte', 'account number', 'account no', 'code', 'account_number'],
  account_label:   ['libellé', 'libelle', 'libellé du compte', 'intitulé', 'designation', 'account label', 'label', 'description', 'account_label'],
  opening_debit:   ['débit d\'ouverture', 'debit ouverture', 'opening debit', 'solde débit d\'ouverture', 'opening_debit'],
  opening_credit:  ['crédit d\'ouverture', 'credit ouverture', 'opening credit', 'solde crédit d\'ouverture', 'opening_credit'],
  movement_debit:  ['mouvement débit', 'mouvement debit', 'mvt débit', 'movement debit', 'movement_debit'],
  movement_credit: ['mouvement crédit', 'mouvement credit', 'mvt crédit', 'movement credit', 'movement_credit'],
  closing_debit:   ['solde débit', 'solde debit', 'closing debit', 'débit', 'debit', 'closing_debit'],
  closing_credit:  ['solde crédit', 'solde credit', 'closing credit', 'crédit', 'credit', 'closing_credit'],
  net_balance:     ['solde', 'balance', 'net balance', 'net_balance', 'solde net', 'balance nette', 'montant', 'amount'],
};

export function detectColumnMappings(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const normalizeHeader = (h: string) => h.toLowerCase().trim().replace(/\s+/g, ' ');

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const header of headers) {
      if (aliases.some((alias) => normalizeHeader(header) === alias.toLowerCase())) {
        mappings.push({
          source_column: header,
          target_field: field as keyof RawImportLine,
        });
        break;
      }
    }
  }
  return mappings;
}

export function detectHeaderRow(rows: unknown[][]): number {
  // Find first row where the cells look like headers (strings) rather than data
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    const stringCells = row.filter((c) => typeof c === 'string' && isNaN(Number(c)));
    if (stringCells.length >= 2) return i;
  }
  return 0;
}

// ─── Parse raw table data ─────────────────────────────────────────────────────

export function parseTableData(
  rows: unknown[][],
  config: ImportConfig,
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rawLines: RawImportLine[] = [];

  const headerRow = rows[config.header_row];
  if (!headerRow) {
    return { success: false, raw_lines: [], errors: ['Header row not found.'], warnings, row_count: 0 };
  }

  const headers = headerRow.map((h) => String(h ?? ''));
  const colIndex = new Map<string, number>(headers.map((h, i) => [h, i]));

  const getVal = (row: unknown[], targetField: keyof RawImportLine): unknown => {
    const mapping = config.column_mappings.find((m) => m.target_field === targetField);
    if (!mapping) return undefined;
    const idx = colIndex.get(mapping.source_column);
    return idx !== undefined ? row[idx] : undefined;
  };

  for (let ri = config.header_row + 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.every((c) => c === null || c === undefined || c === '')) continue;

    const accountNumber = String(getVal(row, 'account_number') ?? '').trim();
    if (!accountNumber) {
      warnings.push(`Row ${ri + 1}: empty account number, skipped.`);
      continue;
    }

    rawLines.push({
      row_index:       ri,
      account_number:  accountNumber,
      account_label:   String(getVal(row, 'account_label') ?? ''),
      opening_debit:   toNumber(getVal(row, 'opening_debit')),
      opening_credit:  toNumber(getVal(row, 'opening_credit')),
      movement_debit:  toNumber(getVal(row, 'movement_debit')),
      movement_credit: toNumber(getVal(row, 'movement_credit')),
      closing_debit:   toNumber(getVal(row, 'closing_debit')),
      closing_credit:  toNumber(getVal(row, 'closing_credit')),
      net_balance:     config.column_mappings.some((m) => m.target_field === 'net_balance') ? toNumber(getVal(row, 'net_balance')) : undefined,
      __present_fields: config.column_mappings.map((mapping) => mapping.target_field),
    });
  }

  if (rawLines.length === 0) {
    errors.push('No data rows found after header.');
  }

  return {
    success: errors.length === 0,
    raw_lines: rawLines,
    errors,
    warnings,
    row_count: rawLines.length,
  };
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

export function parseCSV(csvText: string, delimiter = ','): unknown[][] {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return lines
    .filter((l) => l.trim())
    .map((line) => {
      // Handle quoted fields
      const fields: string[] = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuote = !inQuote;
        } else if (ch === delimiter && !inQuote) {
          fields.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      fields.push(current.trim());
      return fields;
    });
}

// ─── File type detection ──────────────────────────────────────────────────────

export type SupportedFileType = 'xlsx' | 'xls' | 'xlsm' | 'csv';

export function detectFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm' || ext === 'csv') {
    return ext as SupportedFileType;
  }
  return null;
}

export function isSupportedFile(fileName: string): boolean {
  return detectFileType(fileName) !== null;
}

// ─── Column preview ───────────────────────────────────────────────────────────

export interface ColumnPreview {
  header: string;
  sample_values: string[];
  detected_field?: keyof RawImportLine;
}

export function buildColumnPreview(rows: unknown[][], headerRow: number, sampleCount = 3): ColumnPreview[] {
  const headers = (rows[headerRow] ?? []).map((h) => String(h ?? ''));
  const dataRows = rows.slice(headerRow + 1, headerRow + 1 + sampleCount);
  const detectedMappings = detectColumnMappings(headers);

  return headers.map((header, colIdx) => {
    const sampleValues = dataRows
      .map((row) => String((row as unknown[])[colIdx] ?? ''))
      .filter((v) => v !== '');
    const detected = detectedMappings.find((m) => m.source_column === header);
    return { header, sample_values: sampleValues, detected_field: detected?.target_field };
  });
}
