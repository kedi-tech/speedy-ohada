import type { PrismaClient } from '@/lib/generated/prisma/client';
import type { ServerSessionUser } from '@/lib/server-session';
import { makeEngineContext, runFullCalculation } from '@/lib/engine/FinancialStatementEngine';
import type { RawImportLine } from '@/lib/engine/types';
import { getEffectiveMappingRules } from '@/lib/server-mapping';
import { getPersistedGroupedBalances, rebuildGroupedBalanceRows } from '@/lib/server-grouped-balance';
import { getActiveManualOverrides } from '@/lib/server-manual-overrides';
import { getCashFlowManualInputs, getFiscalConfigForYear, getFiscalManualInputs, getNotesManualOverrides } from '@/lib/server-notes-fiscal';

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));

function toRawLine(line: {
  sourceRow: number | null;
  acc: string;
  label: string;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  debit: number;
  credit: number;
  n1Debit: number;
  n1Credit: number;
  balanceType: string;
}): RawImportLine {
  const closingDebit = line.balanceType === 'N-1' ? line.n1Debit : line.debit;
  const closingCredit = line.balanceType === 'N-1' ? line.n1Credit : line.credit;
  return {
    row_index: line.sourceRow ?? 0,
    account_number: line.acc,
    account_label: line.label,
    opening_debit: line.openingDebit,
    opening_credit: line.openingCredit,
    movement_debit: line.movementDebit,
    movement_credit: line.movementCredit,
    closing_debit: closingDebit,
    closing_credit: closingCredit,
  };
}

export async function runAndPersistCalculation(
  prisma: PrismaClient,
  params: { fiscalYearId: string; session: ServerSessionUser; triggerReason?: string },
) {
  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: params.fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return { error: 'Fiscal year not found' as const, status: 404 as const };
  if (fiscalYear.locked) {
    return { error: 'This fiscal year is locked. Unlock it before running new calculations.' as const, status: 423 as const };
  }

  const lines = await prisma.trialBalanceLine.findMany({
    where: { fiscalYearId: params.fiscalYearId },
    orderBy: [{ balanceType: 'asc' }, { acc: 'asc' }],
  });
  const rawLinesN = lines.filter((line) => line.balanceType === 'N').map(toRawLine);
  const rawLinesN1 = lines.filter((line) => line.balanceType === 'N-1').map(toRawLine);

  if (rawLinesN.length === 0) {
    return { error: 'Import the N trial balance before running calculations' as const, status: 400 as const };
  }

  await rebuildGroupedBalanceRows(prisma, { fiscalYearId: fiscalYear.id });
  const groupedBalances = await getPersistedGroupedBalances(prisma, fiscalYear.id);
  const groupedBalanceN = groupedBalances.filter((row) => row.balance_type === 'N');
  const groupedBalanceN1 = groupedBalances.filter((row) => row.balance_type === 'N-1');

  const mappingRules = await getEffectiveMappingRules(prisma, {
    organizationId: fiscalYear.company.organizationId,
    fiscalYearId: fiscalYear.id,
  });
  const overrides = await getActiveManualOverrides(prisma, fiscalYear.id);
  const notesManualOverrides = await getNotesManualOverrides(prisma, fiscalYear.id);
  const fiscalManualInputs = await getFiscalManualInputs(prisma, fiscalYear.id);
  const cashFlowManualInputs = await getCashFlowManualInputs(prisma, fiscalYear.id);
  const persistedTaxConfig = await getFiscalConfigForYear(prisma, fiscalYear.id);

  const context = makeEngineContext({
    organization_id: fiscalYear.company.organizationId ?? '',
    company_id: fiscalYear.companyId,
    fiscal_year_id: fiscalYear.id,
    fiscal_year_label: fiscalYear.label,
    currency_code: fiscalYear.currency,
    tax_regime: fiscalYear.company.taxRegime ?? undefined,
    country_code: fiscalYear.company.country ?? undefined,
    fiscal_year: fiscalYear.yearN,
    tax_rate: persistedTaxConfig?.tax_rate,
    patente_rate: persistedTaxConfig?.patente_rate,
    decimal_places: persistedTaxConfig?.decimal_places,
    rounding_tolerance: persistedTaxConfig?.rounding_tolerance,
    triggered_by: params.session.id,
    trigger_reason: params.triggerReason || 'manual_run',
  });

  const result = runFullCalculation({
    context,
    rawLinesN,
    rawLinesN1,
    skipN1: rawLinesN1.length === 0,
    overrides,
    cashFlowManualInputs,
    mappingRules,
    groupedBalanceN,
    groupedBalanceN1: groupedBalanceN1.length > 0 ? groupedBalanceN1 : undefined,
    notesManualOverrides,
    fiscalManualInputs,
    companyInfo: {
      name: fiscalYear.company.name,
      legal_name: fiscalYear.company.legalName ?? fiscalYear.company.name,
      nif: fiscalYear.company.nif ?? undefined,
      rccm: fiscalYear.company.rccm ?? undefined,
      city: fiscalYear.company.city,
      country: fiscalYear.company.country ?? undefined,
    },
  });

  const run = await prisma.$transaction(async (tx) => {
    const created = await tx.calculationRun.create({
      data: {
        id: result.snapshot.calculation_run_id,
        organizationId: fiscalYear.company.organizationId,
        companyId: fiscalYear.companyId,
        fiscalYearId: fiscalYear.id,
        userId: params.session.id,
        status: result.snapshot.status,
        triggerReason: context.trigger_reason,
        snapshot: asJson(result.snapshot),
        validation: asJson(result.validation),
        actif: asJson(result.actifN),
        passif: asJson(result.passifN),
        incomeStatement: asJson(result.incomeStatement),
        cashFlow: asJson(result.cashFlow),
        notes: asJson(result.notes),
        expenseDetails: asJson(result.expenseDetails),
        fiscal: asJson(result.fiscal),
        traceability: asJson(result.traceability),
        totalDebitN: result.snapshot.total_debit_N,
        totalCreditN: result.snapshot.total_credit_N,
        differenceN: result.snapshot.difference_N,
        totalCritical: result.validation.total_critical,
        totalWarnings: result.validation.total_warnings,
        canExport: result.validation.can_export,
      },
    });

    // Persist first-class TraceabilityRecord rows (Flow 13)
    // Delete previous traceability records for this fiscal year to keep one clean set per run
    await tx.traceabilityRecord.deleteMany({ where: { fiscalYearId: fiscalYear.id } });
    if (Array.isArray(result.traceability) && result.traceability.length > 0) {
      await tx.traceabilityRecord.createMany({
        data: result.traceability.map((tr: {
          line_code: string;
          report_type: string;
          label_fr?: string;
          label_en?: string;
          value_N?: number | null;
          value_N_1?: number | null;
          variation_amount?: number | null;
          formula_used: string;
          source_accounts?: unknown[];
          dependency_chain?: unknown;
          mapping_rule_ids?: unknown;
          source_rows?: unknown;
          is_manual_override?: boolean;
          manual_override?: { id?: string; reason?: string } | null;
        }) => ({
          organizationId: fiscalYear.company.organizationId ?? null,
          companyId: fiscalYear.companyId,
          fiscalYearId: fiscalYear.id,
          calculationRunId: created.id,
          reportType: tr.report_type,
          lineCode: tr.line_code,
          labelFr: tr.label_fr ?? tr.line_code,
          labelEn: tr.label_en ?? tr.line_code,
          valueN: tr.value_N ?? null,
          valueN1: tr.value_N_1 ?? null,
          variationAmount: tr.variation_amount ?? null,
          formulaUsed: tr.formula_used,
          sourceAccounts: asJson(tr.source_accounts ?? []),
          dependencyChain: tr.dependency_chain ? asJson(tr.dependency_chain) : null,
          mappingRuleIds: tr.mapping_rule_ids ? asJson(tr.mapping_rule_ids) : null,
          sourceRows: tr.source_rows ? asJson(tr.source_rows) : null,
          isManualOverride: Boolean(tr.is_manual_override),
          overrideId: tr.manual_override?.id ?? null,
          overrideReason: tr.manual_override?.reason ?? null,
        })),
      });
    }

    await tx.fiscalYear.update({
      where: { id: fiscalYear.id },
      data: {
        status: result.validation.can_export ? 'ready_review' : result.validation.total_critical > 0 ? 'mapping_required' : 'notes_required',
        progress: result.validation.can_export ? 80 : 60,
      },
    });

    await tx.company.update({
      where: { id: fiscalYear.companyId },
      data: { status: result.validation.can_export ? 'ready' : 'in-progress', progress: result.validation.can_export ? 80 : 60 },
    });

    await tx.auditLog.create({
      data: {
        userId: params.session.id,
        userName: params.session.name,
        userRole: params.session.role,
        action: 'run_calculation',
        entityType: 'fiscal_year',
        entityName: `${fiscalYear.company.name} ${fiscalYear.label}`,
        newValue: created.id,
        reason: 'OHADA calculation engine run from UI',
      },
    });

    return created;
  });

  return {
    run,
    snapshot: result.snapshot,
    validation: result.validation,
    status: 201 as const,
  };
}
