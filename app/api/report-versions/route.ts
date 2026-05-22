import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';
import { compareRuns, getOrCreateReportVersion, REVIEW_SECTION_KEYS, serializeVersion } from '@/lib/server-report-workflow';

export async function GET(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fiscalYearId = searchParams.get('fiscalYearId')?.trim();
  if (!fiscalYearId) return NextResponse.json({ error: 'Fiscal year is required' }, { status: 400 });

  const versions = await prisma.reportVersion.findMany({
    where: { fiscalYearId },
    include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
    orderBy: { versionNumber: 'desc' },
  });

  const latestRun = await prisma.calculationRun.findFirst({
    where: { fiscalYearId },
    orderBy: { createdAt: 'desc' },
  });
  const runs = await prisma.calculationRun.findMany({
    where: { fiscalYearId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return NextResponse.json({
    latestRun: latestRun ? {
      id: latestRun.id,
      canExport: latestRun.canExport,
      totalCritical: latestRun.totalCritical,
      totalWarnings: latestRun.totalWarnings,
      createdAt: latestRun.createdAt.toISOString(),
    } : null,
    runHistory: runs.map((run) => ({
      id: run.id,
      status: run.status,
      triggerReason: run.triggerReason,
      createdAt: run.createdAt.toISOString(),
      canExport: run.canExport,
      totalCritical: run.totalCritical,
      totalWarnings: run.totalWarnings,
    })),
    runComparison: runs[0] ? compareRuns(runs[0], runs[1]) : null,
    latestVersion: versions[0] ? serializeVersion(versions[0]) : null,
    versions: versions.map(serializeVersion),
    requiredSections: REVIEW_SECTION_KEYS,
  });
}

export async function POST(request: Request) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fiscalYearId = String(body.fiscalYearId ?? '').trim();
  const action = String(body.action ?? '').trim();
  if (!fiscalYearId || !action) {
    return NextResponse.json({ error: 'Fiscal year and action are required' }, { status: 400 });
  }

  const fiscalYear = await prisma.fiscalYear.findUnique({
    where: { id: fiscalYearId },
    include: { company: true },
  });
  if (!fiscalYear) return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
  if (fiscalYear.locked && action !== 'unlock') {
    return NextResponse.json({ error: 'Fiscal year is locked. Unlock it before changing review state.' }, { status: 423 });
  }

  const result = await getOrCreateReportVersion(prisma, {
    fiscalYearId,
    session,
    status: action === 'approve' ? 'under_review' : 'draft',
    changeSummary: 'Review workflow started from saved calculation run',
  });
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { version } = result;

  if (action === 'approve') {
    const sectionKey = String(body.sectionKey ?? '').trim();
    const sections = sectionKey ? [sectionKey] : REVIEW_SECTION_KEYS;

    const updated = await prisma.$transaction(async (tx) => {
      for (const key of sections) {
        await tx.reviewApproval.upsert({
          where: { reportVersionId_sectionKey: { reportVersionId: version.id, sectionKey: key } },
          create: {
            reportVersionId: version.id,
            sectionKey: key,
            status: 'approved',
            reviewerId: session.id,
            reviewerName: session.name,
            comment: String(body.comment ?? '').trim() || null,
            approvedAt: new Date(),
          },
          update: {
            status: 'approved',
            reviewerId: session.id,
            reviewerName: session.name,
            comment: String(body.comment ?? '').trim() || null,
            approvedAt: new Date(),
          },
        });
      }

      const approvalCount = await tx.reviewApproval.count({
        where: {
          reportVersionId: version.id,
          sectionKey: { in: REVIEW_SECTION_KEYS },
          status: 'approved',
        },
      });

      const updatedVersion = await tx.reportVersion.update({
        where: { id: version.id },
        data: { status: approvalCount === REVIEW_SECTION_KEYS.length ? 'approved' : 'under_review' },
        include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: 'review_approval',
          entityType: 'report_version',
          entityName: `${fiscalYear.company.name} ${fiscalYear.label} v${updatedVersion.versionNumber}`,
          newValue: updatedVersion.status,
          reason: sectionKey ? `Approved ${sectionKey}` : 'Approved all review sections',
        },
      });

      return updatedVersion;
    });

    return NextResponse.json({ version: serializeVersion(updated) });
  }

  if (action === 'reject' || action === 'comment') {
    const sectionKey = String(body.sectionKey ?? '').trim();
    const comment = String(body.comment ?? '').trim();
    if (!sectionKey) return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    if (!comment) return NextResponse.json({ error: 'Comment is required' }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.reviewApproval.upsert({
        where: { reportVersionId_sectionKey: { reportVersionId: version.id, sectionKey } },
        create: {
          reportVersionId: version.id,
          sectionKey,
          status: action === 'reject' ? 'correction_requested' : 'comment',
          reviewerId: session.id,
          reviewerName: session.name,
          comment,
          approvedAt: null,
        },
        update: {
          status: action === 'reject' ? 'correction_requested' : 'comment',
          reviewerId: session.id,
          reviewerName: session.name,
          comment,
          approvedAt: null,
        },
      });

      const updatedVersion = await tx.reportVersion.update({
        where: { id: version.id },
        data: { status: 'under_review' },
        include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: action === 'reject' ? 'review_correction_requested' : 'review_comment',
          entityType: 'report_version',
          entityName: `${fiscalYear.company.name} ${fiscalYear.label} v${updatedVersion.versionNumber}`,
          newValue: sectionKey,
          reason: comment,
        },
      });

      return updatedVersion;
    });

    return NextResponse.json({ version: serializeVersion(updated) });
  }

  if (action === 'lock') {
    const latest = await prisma.reportVersion.findUnique({
      where: { id: String(body.reportVersionId ?? version.id) },
      include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
    });
    if (!latest) return NextResponse.json({ error: 'Report version not found' }, { status: 404 });
    if (!['approved', 'exported', 'locked'].includes(latest.status)) {
      return NextResponse.json({ error: 'Approve the review before locking this report' }, { status: 409 });
    }

    const pendingOverrides = await prisma.manualOverride.count({
      where: { fiscalYearId, status: 'pending' },
    });
    if (pendingOverrides > 0) {
      return NextResponse.json({ error: 'Approve or reject pending manual overrides before locking' }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const locked = await tx.reportVersion.update({
        where: { id: latest.id },
        data: {
          status: 'locked',
          isLocked: true,
          lockedById: session.id,
          lockedAt: new Date(),
        },
        include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
      });

      await tx.fiscalYear.update({
        where: { id: fiscalYearId },
        data: { locked: true, status: 'locked', progress: 100 },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: 'lock_report_version',
          entityType: 'report_version',
          entityName: `${fiscalYear.company.name} ${fiscalYear.label} v${locked.versionNumber}`,
          newValue: 'locked',
          reason: 'Final review lock',
        },
      });

      return locked;
    });

    return NextResponse.json({ version: serializeVersion(updated) });
  }

  if (action === 'unlock') {
    const reason = String(body.reason ?? '').trim();
    if (!reason) return NextResponse.json({ error: 'Unlock reason is required' }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      const unlocked = await tx.reportVersion.update({
        where: { id: String(body.reportVersionId ?? version.id) },
        data: {
          status: 'draft',
          isLocked: false,
          lockedById: null,
          lockedAt: null,
          unlockReason: reason,
        },
        include: { reviewApprovals: true, exportRecords: { orderBy: { createdAt: 'desc' } } },
      });

      await tx.fiscalYear.update({
        where: { id: fiscalYearId },
        data: { locked: false, status: 'ready_review', progress: 80 },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: 'unlock_report_version',
          entityType: 'report_version',
          entityName: `${fiscalYear.company.name} ${fiscalYear.label} v${unlocked.versionNumber}`,
          newValue: 'draft',
          reason,
        },
      });

      return unlocked;
    });

    return NextResponse.json({ version: serializeVersion(updated) });
  }

  return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
}
