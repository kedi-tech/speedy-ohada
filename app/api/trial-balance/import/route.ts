import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { normalizeBalance, summarizeBalance } from '@/lib/engine/BalanceNormalizer';
import { enrichAllWithPrefixes } from '@/lib/engine/AccountPrefixEngine';
import { enrichAllWithClass } from '@/lib/engine/OHADAClassEngine';
import { rebuildGroupedBalanceRows } from '@/lib/server-grouped-balance';
import type { BalanceType, RawImportLine } from '@/lib/engine/types';

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const balanceType = (body.balanceType === 'N-1' ? 'N-1' : 'N') as BalanceType;
  const rawLines = (Array.isArray(body.rawLines) ? body.rawLines : []) as RawImportLine[];

  // Audit trail fields (Flow 1)
  const sheetName = body.sheetName ? String(body.sheetName).trim() : null;
  const headerRow = typeof body.headerRow === 'number' ? body.headerRow : null;
  const rawRowCount = typeof body.rawRowCount === 'number' ? body.rawRowCount : rawLines.length;
  const rejectedRowCount = typeof body.rejectedRowCount === 'number' ? body.rejectedRowCount : 0;
  const parserWarnings = Array.isArray(body.parserWarnings) ? body.parserWarnings : null;
  const importProfileId = body.importProfileId ? String(body.importProfileId).trim() : null;

  if (!fiscalYearId || rawLines.length === 0) {
    return NextResponse.json({ error: 'Fiscal year and balance lines are required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked) {
    return NextResponse.json({ error: 'This fiscal year is locked. Unlock it before importing a new balance.' }, { status: 423 });
  }

  const organizationId = fiscalYear.company.organizationId;
  const normalized = enrichAllWithClass(enrichAllWithPrefixes(
    normalizeBalance(rawLines, balanceType, fiscalYear.id, fiscalYear.companyId, organizationId ?? ''),
  ));
  const summary = summarizeBalance(normalized);
  const rowWarnings = normalized.flatMap((line) => line.warnings);

  const promoteExistingN = body.promoteExistingN === true && balanceType === 'N';

  const importBatch = await prisma.$transaction(async (tx) => {
    if (promoteExistingN) {
      // Check last N import batch — skip promote if same file is being re-uploaded
      const lastNBatch = await tx.importBatch.findFirst({
        where: { fiscalYearId: fiscalYear.id, balanceType: 'N' },
        orderBy: { createdAt: 'desc' },
      });
      const sameFile = lastNBatch?.fileName === String(body.fileName ?? '');
      if (!sameFile) {
        const existingNLines = await tx.trialBalanceLine.findMany({
          where: { fiscalYearId: fiscalYear.id, companyId: fiscalYear.companyId, balanceType: 'N' },
        });
        if (existingNLines.length > 0) {
          await tx.trialBalanceLine.deleteMany({
            where: { fiscalYearId: fiscalYear.id, companyId: fiscalYear.companyId, balanceType: 'N-1' },
          });
          await tx.trialBalanceLine.createMany({
            data: existingNLines.map(({ id: _id, importBatchId: _bid, balanceType: _bt, debit, credit, warnings, ...rest }) => ({
              ...rest,
              balanceType: 'N-1' as const,
              importBatchId: null,
              n1Debit: debit,
              n1Credit: credit,
              debit: 0,
              credit: 0,
              warnings: warnings ?? [],
            })),
          });
        }
      }
    }

    await tx.trialBalanceLine.deleteMany({
      where: { fiscalYearId: fiscalYear.id, companyId: fiscalYear.companyId, balanceType },
    });

    const batch = await tx.importBatch.create({
      data: {
        organizationId,
        companyId: fiscalYear.companyId,
        fiscalYearId: fiscalYear.id,
        userId: session.id,
        fileName: String(body.fileName ?? 'balance.csv'),
        balanceType,
        rowCount: normalized.length,
        totalDebit: summary.total_debit,
        totalCredit: summary.total_credit,
        difference: summary.difference,
        isBalanced: summary.is_balanced,
        errors: [],
        warnings: rowWarnings,
        columnMap: body.columnMap ?? {},
        sheetName,
        headerRow,
        rawRowCount,
        rejectedRowCount,
        parserWarnings,
        ...(importProfileId ? { importProfileId } : {}),
      },
    });

    await tx.trialBalanceLine.createMany({
      data: normalized.map((line) => ({
        organizationId,
        companyId: fiscalYear.companyId,
        fiscalYearId: fiscalYear.id,
        importBatchId: batch.id,
        balanceType,
        sourceRow: Number(line.id?.replace('line_', '')) || null,
        acc: line.account_number,
        label: line.account_label,
        openingDebit: line.opening_debit,
        openingCredit: line.opening_credit,
        movementDebit: line.movement_debit,
        movementCredit: line.movement_credit,
        debit: balanceType === 'N' ? line.closing_debit : 0,
        credit: balanceType === 'N' ? line.closing_credit : 0,
        n1Debit: balanceType === 'N-1' ? line.closing_debit : 0,
        n1Credit: balanceType === 'N-1' ? line.closing_credit : 0,
        netBalance: line.net_balance,
        prefix1: line.prefix_1 ?? null,
        prefix2: line.prefix_2 ?? null,
        prefix3: line.prefix_3 ?? null,
        prefix4: line.prefix_4 ?? null,
        prefix5: line.prefix_5 ?? null,
        prefix6: line.prefix_6 ?? null,
        accountClass: line.account_class ?? null,
        accountClassLabelFr: line.account_class_label_fr ?? null,
        accountClassLabelEn: line.account_class_label_en ?? null,
        warnings: line.warnings,
        status: line.warnings.length ? 'warning' : 'mapped',
      })),
    });

    await tx.fiscalYear.update({
      where: { id: fiscalYear.id },
      data: {
        status: summary.is_balanced ? 'mapping_required' : 'balance_failed',
        progress: summary.is_balanced ? 45 : 30,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'import_trial_balance',
        entityType: 'fiscal_year',
        entityName: `${fiscalYear.company.name} ${fiscalYear.label}`,
        newValue: `${normalized.length} ${balanceType} lines`,
        reason: 'Trial balance imported from UI',
      },
    });

    return batch;
  });

  const groupedRows = await rebuildGroupedBalanceRows(prisma, {
    fiscalYearId: fiscalYear.id,
    balanceType,
  });

  return NextResponse.json({
    importBatch,
    summary,
    importedRows: normalized.length,
    groupedRows: groupedRows.length,
  }, { status: 201 });
}
