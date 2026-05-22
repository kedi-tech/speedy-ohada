import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { CashFlowManualInputs, FiscalLine, TaxConfig } from '@/lib/engine/types';
import type { FiscalManualInputs } from '@/lib/engine/FiscalEngine';
import { emptyFiscalManualInputs } from '@/lib/engine/FiscalEngine';

export async function getNotesManualOverrides(prisma: PrismaClient, fiscalYearId: string) {
  const values = await prisma.noteValue.findMany({ where: { fiscalYearId } });
  const overrides: Record<string, Record<string, unknown>> = {};

  for (const value of values) {
    const noteKey = `note_${value.noteNumber}`;
    overrides[noteKey] ??= {};
    overrides[noteKey][value.fieldKey] = value.value;
  }

  return overrides;
}

export async function getFiscalConfigForYear(prisma: PrismaClient, fiscalYearId: string): Promise<TaxConfig | null> {
  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return null;

  const config = await prisma.fiscalConfig.findFirst({
    where: {
      companyId: fiscalYear.companyId,
      countryCode: fiscalYear.company.country ?? 'GN',
      fiscalRegime: fiscalYear.company.taxRegime ?? 'normal',
      fiscalYear: fiscalYear.yearN,
    },
  }) ?? await prisma.fiscalConfig.create({
    data: {
      companyId: fiscalYear.companyId,
      countryCode: fiscalYear.company.country ?? 'GN',
      fiscalRegime: fiscalYear.company.taxRegime ?? 'normal',
      fiscalYear: fiscalYear.yearN,
      taxRate: 25,
      vatRate: 18,
      patenteRate: 0.5,
      currencyCode: fiscalYear.currency,
      decimalPlaces: fiscalYear.currency === 'GNF' || fiscalYear.currency === 'XOF' ? 0 : 2,
      roundingTolerance: 1,
    },
  });

  return {
    country_code: config.countryCode,
    fiscal_regime: config.fiscalRegime,
    fiscal_year: config.fiscalYear,
    tax_rate: config.taxRate,
    minimum_tax: config.minimumTax ?? undefined,
    patente_rate: config.patenteRate,
    currency_code: config.currencyCode,
    decimal_places: config.decimalPlaces,
    rounding_tolerance: config.roundingTolerance,
  };
}

function toFiscalLine(input: {
  lineCode: string;
  labelFr: string;
  labelEn: string;
  value: number;
  source: string | null;
  comment: string | null;
}): FiscalLine {
  return {
    line_code: input.lineCode,
    label_fr: input.labelFr,
    label_en: input.labelEn,
    value: input.value,
    is_manual: true,
    source: input.source ?? undefined,
    comment: input.comment ?? undefined,
  };
}

export async function getFiscalManualInputs(prisma: PrismaClient, fiscalYearId: string): Promise<FiscalManualInputs> {
  const rows = await prisma.fiscalManualInput.findMany({ where: { fiscalYearId } });
  const inputs = emptyFiscalManualInputs();

  for (const row of rows) {
    if (row.inputType === 'installments_paid') inputs.installments_paid += row.value;
    else if (row.inputType === 'tax_credits') inputs.tax_credits += row.value;
    else if (row.inputType === 'previous_deficit') inputs.previous_deficits += row.value;
    else if (row.inputType === 'add_back') inputs.add_backs.push(toFiscalLine(row));
    else if (row.inputType === 'deduction') inputs.deductions.push(toFiscalLine(row));
    else if (row.inputType === 'patente') inputs.patente_lines.push(toFiscalLine(row));
    else if (row.inputType === 'honoraire') inputs.honoraire_lines.push(toFiscalLine(row));
  }

  return inputs;
}

export async function getCashFlowManualInputs(prisma: PrismaClient, fiscalYearId: string): Promise<CashFlowManualInputs> {
  const rows = await prisma.fiscalManualInput.findMany({
    where: { fiscalYearId, inputType: 'cash_flow' },
  });
  const inputs: CashFlowManualInputs = {};

  for (const row of rows) {
    inputs[row.lineCode] = row.value;
  }

  return inputs;
}
