import type { ReportVersionRecord, VersionStatus } from './types';

let _seq = 0;
function nextId(): string {
  return `rv_${Date.now()}_${++_seq}`;
}

export function createVersion(params: {
  fiscal_year_id: string;
  company_id: string;
  organization_id: string;
  version_number: number;
  generated_by: string;
  calculation_run_id: string;
  validation_summary: string;
  change_summary: string;
}): ReportVersionRecord {
  return {
    report_version_id: nextId(),
    fiscal_year_id:    params.fiscal_year_id,
    company_id:        params.company_id,
    organization_id:   params.organization_id,
    version_number:    params.version_number,
    status:            'draft',
    generated_by:      params.generated_by,
    generated_at:      new Date().toISOString(),
    calculation_run_id: params.calculation_run_id,
    validation_summary: params.validation_summary,
    change_summary:     params.change_summary,
    is_locked:         false,
  };
}

export function advanceStatus(
  version: ReportVersionRecord,
  newStatus: VersionStatus,
  byUser: string,
): ReportVersionRecord {
  const transitions: Record<VersionStatus, VersionStatus[]> = {
    draft:        ['under_review', 'approved'],
    under_review: ['approved', 'draft'],
    approved:     ['exported', 'locked', 'under_review'],
    exported:     ['locked', 'archived'],
    locked:       ['archived'],
    archived:     [],
  };
  const allowed = transitions[version.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot advance from "${version.status}" to "${newStatus}".`);
  }
  const locked = newStatus === 'locked' || (version.is_locked && newStatus !== 'archived');
  return {
    ...version,
    status:    newStatus,
    is_locked: locked,
    ...(locked && !version.is_locked ? { locked_by: byUser, locked_at: new Date().toISOString() } : {}),
  };
}

export function unlockVersion(
  version: ReportVersionRecord,
  byUser: string,
  reason: string,
): ReportVersionRecord {
  if (!version.is_locked) return version;
  return {
    ...version,
    is_locked:    false,
    status:       'draft',
    unlock_reason: reason,
    locked_by:    undefined,
    locked_at:    undefined,
  };
}

export function assertNotLocked(version: ReportVersionRecord): void {
  if (version.is_locked) {
    throw new Error('This report version is locked. No modifications are allowed.');
  }
}
