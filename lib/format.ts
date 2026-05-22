// SYSCOHADA number display rules (claudemaster.md Rule 3):
// • Zero → "−" (en dash)
// • Negatives → (1 234 567) in parentheses, no minus sign
// • Thousands separator follows the selected currency convention
// • GNF: space thousands, comma decimal (0 decimals by default)
// • USD: comma thousands, period decimal
// • EUR/XOF/XAF: space thousands, comma decimal

export type CurrencyCode = 'GNF' | 'USD' | 'EUR' | 'XOF' | 'XAF';

interface CurrencyFormat {
  thousandsSep: string;
  decimalSep: string;
  decimals: number;
  symbol: string;
  symbolPosition: 'before' | 'after';
}

const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  GNF: { thousandsSep: ' ', decimalSep: ',', decimals: 0, symbol: 'GNF', symbolPosition: 'after' },
  XOF: { thousandsSep: ' ', decimalSep: ',', decimals: 0, symbol: 'FCFA', symbolPosition: 'after' },
  XAF: { thousandsSep: ' ', decimalSep: ',', decimals: 0, symbol: 'FCFA', symbolPosition: 'after' },
  EUR: { thousandsSep: ' ', decimalSep: ',', decimals: 2, symbol: '€', symbolPosition: 'after' },
  USD: { thousandsSep: ',', decimalSep: '.', decimals: 2, symbol: '$', symbolPosition: 'before' },
};

function applyThousandsSep(intPart: string, sep: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/**
 * Format a financial amount following SYSCOHADA display rules.
 * Returns "−" for zero, parenthesized amount for negatives.
 */
export function formatAmount(
  value: number | null | undefined,
  currency: CurrencyCode = 'GNF',
  opts: { showZeroAsDash?: boolean; decimals?: number } = {},
): string {
  if (value === null || value === undefined) return '−';

  const fmt = CURRENCY_FORMATS[currency] ?? CURRENCY_FORMATS.GNF;
  const decimals = opts.decimals ?? fmt.decimals;
  const showZeroAsDash = opts.showZeroAsDash ?? true;

  if (value === 0 && showZeroAsDash) return '−';

  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  let formatted = applyThousandsSep(intPart, fmt.thousandsSep);
  if (decimals > 0 && decPart) {
    formatted += fmt.decimalSep + decPart;
  }

  return value < 0 ? `(${formatted})` : formatted;
}

/**
 * Format for export cells (XLSX): returns a raw number so Excel can apply
 * its own formatting, or a string for text-only cells.
 */
export function exportCellValue(value: number | null | undefined): number | string {
  if (value === null || value === undefined || value === 0) return '';
  return value;
}

/**
 * Parse a formatted SYSCOHADA amount string back to a number.
 * Handles: "−", "(1 234 567)", "1 234 567", "1,234,567.89"
 */
export function parseFormattedAmount(str: string): number {
  if (!str || str.trim() === '−' || str.trim() === '-') return 0;
  const isNeg = str.includes('(') && str.includes(')');
  const cleaned = str
    .replace(/[()]/g, '')
    .replace(/ /g, '')  // non-breaking space
    .replace(/\s/g, '')
    .replace(/,/g, '.');     // handle both comma-decimal and comma-thousands
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : isNeg ? -num : num;
}

/**
 * Format a percentage value with one decimal place.
 */
export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '−';
  return `${value.toFixed(1)} %`;
}

/**
 * Format a date in the SYSCOHADA statutory format: DD/MM/YYYY.
 */
export function formatStatutoryDate(date: Date | string | null | undefined): string {
  if (!date) return '−';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '−';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
