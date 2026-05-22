import type { PrismaClient } from '@/lib/generated/prisma/client';
import { buildWorkbookStyleGroupedBalance } from '@/lib/engine/GroupedBalanceEngine';
import type { BalanceType, GroupedBalance, NormalizedAccount } from '@/lib/engine/types';

type DbTrialBalanceLine = Awaited<ReturnType<PrismaClient['trialBalanceLine']['findMany']>>[number];
type DbGroupedBalanceRow = Awaited<ReturnType<PrismaClient['groupedBalanceRow']['findMany']>>[number];

const asJson = (value: unknown) => JSON.parse(JSON.stringify(value));

function toNormalizedAccount(line: DbTrialBalanceLine): NormalizedAccount {
  const closingDebit = line.balanceType === 'N-1' ? line.n1Debit : line.debit;
  const closingCredit = line.balanceType === 'N-1' ? line.n1Credit : line.credit;
  const warnings = Array.isArray(line.warnings) ? line.warnings.map(String) : [];

  return {
    id: line.id,
    account_number: line.acc,
    account_label: line.label,
    opening_debit: line.openingDebit,
    opening_credit: line.openingCredit,
    movement_debit: line.movementDebit,
    movement_credit: line.movementCredit,
    closing_debit: closingDebit,
    closing_credit: closingCredit,
    net_balance: line.netBalance,
    balance_type: line.balanceType as BalanceType,
    fiscal_year_id: line.fiscalYearId ?? '',
    company_id: line.companyId ?? '',
    organization_id: line.organizationId ?? '',
    warnings,
    prefix_1: line.prefix1 ?? undefined,
    prefix_2: line.prefix2 ?? undefined,
    prefix_3: line.prefix3 ?? undefined,
    prefix_4: line.prefix4 ?? undefined,
    prefix_5: line.prefix5 ?? undefined,
    prefix_6: line.prefix6 ?? undefined,
    account_class: line.accountClass ?? undefined,
    account_class_label_fr: line.accountClassLabelFr ?? undefined,
    account_class_label_en: line.accountClassLabelEn ?? undefined,
  };
}

export async function rebuildGroupedBalanceRows(
  prisma: PrismaClient,
  params: { fiscalYearId: string; balanceType?: BalanceType },
) {
  const where = {
    fiscalYearId: params.fiscalYearId,
    ...(params.balanceType ? { balanceType: params.balanceType } : {}),
  };

  const lines = await prisma.trialBalanceLine.findMany({
    where,
    orderBy: [{ balanceType: 'asc' }, { acc: 'asc' }],
  });

  const byType = new Map<BalanceType, NormalizedAccount[]>();
  for (const line of lines) {
    const balanceType = line.balanceType as BalanceType;
    const existing = byType.get(balanceType) ?? [];
    existing.push(toNormalizedAccount(line));
    byType.set(balanceType, existing);
  }

  const groupedRows: GroupedBalance[] = [];
  for (const [balanceType, accounts] of byType.entries()) {
    const first = accounts[0];
    if (!first) continue;
    groupedRows.push(...buildWorkbookStyleGroupedBalance(
      accounts,
      balanceType,
      params.fiscalYearId,
      first.company_id,
      first.organization_id,
    ));
  }

  await prisma.$transaction(async (tx) => {
    await tx.groupedBalanceRow.deleteMany({ where });
    if (groupedRows.length === 0) return;

    await tx.groupedBalanceRow.createMany({
      data: groupedRows.map((row) => ({
        organizationId: row.organization_id || null,
        companyId: row.company_id,
        fiscalYearId: row.fiscal_year_id,
        balanceType: row.balance_type,
        groupCode: row.group_code,
        groupLabelFr: row.group_label_fr,
        groupLabelEn: row.group_label_en,
        groupKind: row.group_kind ?? 'custom',
        parentGroupCode: row.parent_group_code ?? null,
        accountCount: row.account_count ?? 0,
        accountClass: row.account_class ?? null,
        prefixLevel: row.prefix_level ?? null,
        openingDebit: row.opening_debit,
        openingCredit: row.opening_credit,
        movementDebit: row.movement_debit,
        movementCredit: row.movement_credit,
        closingDebit: row.closing_debit,
        closingCredit: row.closing_credit,
        netBalance: row.net_balance,
        sourceAccounts: asJson(row.source_accounts),
      })),
    });
  });

  return groupedRows;
}

export function dbGroupedRowToEngine(row: DbGroupedBalanceRow): GroupedBalance {
  const sourceAccounts = Array.isArray(row.sourceAccounts)
    ? row.sourceAccounts.map(String)
    : [];

  const groupKind = (row as { groupKind?: string }).groupKind as GroupedBalance['group_kind'] | undefined;

  return {
    organization_id: row.organizationId ?? '',
    company_id: row.companyId,
    fiscal_year_id: row.fiscalYearId,
    balance_type: row.balanceType as BalanceType,
    group_kind: groupKind ?? (
      row.groupCode === 'TB_TOTAL'
        ? 'total'
        : row.groupCode.startsWith('C')
          ? 'class'
          : row.groupCode.startsWith('A_')
            ? 'account'
            : row.groupCode.startsWith('P')
              ? 'prefix'
              : 'custom'
    ),
    group_code: row.groupCode,
    parent_group_code: (row as { parentGroupCode?: string | null }).parentGroupCode ?? undefined,
    group_label_fr: row.groupLabelFr,
    group_label_en: row.groupLabelEn,
    account_class: row.accountClass ?? undefined,
    prefix_level: row.prefixLevel ?? undefined,
    account_count: (row as { accountCount?: number }).accountCount ?? sourceAccounts.length,
    opening_debit: row.openingDebit,
    opening_credit: row.openingCredit,
    movement_debit: row.movementDebit,
    movement_credit: row.movementCredit,
    closing_debit: row.closingDebit,
    closing_credit: row.closingCredit,
    net_balance: row.netBalance,
    source_accounts: sourceAccounts,
  };
}

export async function getPersistedGroupedBalances(prisma: PrismaClient, fiscalYearId: string) {
  const rows = await prisma.groupedBalanceRow.findMany({
    where: { fiscalYearId },
    orderBy: [{ balanceType: 'asc' }, { prefixLevel: 'asc' }, { groupCode: 'asc' }],
  });
  return rows.map(dbGroupedRowToEngine);
}

export function summarizeGroupedBalanceReconciliation(rows: GroupedBalance[]) {
  return (['N', 'N-1'] as BalanceType[])
    .map((balanceType) => {
      const rowsForType = rows.filter((row) => row.balance_type === balanceType);
      const accountRows = rowsForType.filter((row) => row.group_kind === 'account');
      const totalRow = rowsForType.find((row) => row.group_code === 'TB_TOTAL');
      const sum = (field: keyof Pick<GroupedBalance, 'opening_debit' | 'opening_credit' | 'movement_debit' | 'movement_credit' | 'closing_debit' | 'closing_credit' | 'net_balance'>) =>
        accountRows.reduce((total, row) => total + row[field], 0);

      return {
        balance_type: balanceType,
        grouped_row_count: rowsForType.length,
        account_row_count: accountRows.length,
        class_row_count: rowsForType.filter((row) => row.group_kind === 'class').length,
        prefix_row_count: rowsForType.filter((row) => row.group_kind === 'prefix').length,
        has_total_row: Boolean(totalRow),
        total_closing_debit: totalRow?.closing_debit ?? 0,
        total_closing_credit: totalRow?.closing_credit ?? 0,
        account_rows_closing_debit: sum('closing_debit'),
        account_rows_closing_credit: sum('closing_credit'),
        closing_debit_difference: (totalRow?.closing_debit ?? 0) - sum('closing_debit'),
        closing_credit_difference: (totalRow?.closing_credit ?? 0) - sum('closing_credit'),
        net_balance_difference: (totalRow?.net_balance ?? 0) - sum('net_balance'),
        reconciled: Boolean(totalRow)
          && Math.abs((totalRow?.closing_debit ?? 0) - sum('closing_debit')) < 0.0001
          && Math.abs((totalRow?.closing_credit ?? 0) - sum('closing_credit')) < 0.0001
          && Math.abs((totalRow?.net_balance ?? 0) - sum('net_balance')) < 0.0001,
      };
    })
    .filter((summary) => summary.grouped_row_count > 0);
}
