import type { ManualOverride, ReportType, OverrideStatus } from './types';

let _seq = 0;
function nextId(): string {
  return `ovr_${Date.now()}_${++_seq}`;
}

export function createOverride(params: {
  organization_id: string;
  company_id: string;
  fiscal_year_id: string;
  report_type: ReportType;
  report_line_code: string;
  original_value: number | null;
  new_value: number;
  reason: string;
  created_by: string;
  requires_approval?: boolean;
}): ManualOverride {
  if (!params.reason.trim()) {
    throw new Error('Manual override requires a reason.');
  }

  return {
    id:               nextId(),
    organization_id:  params.organization_id,
    company_id:       params.company_id,
    fiscal_year_id:   params.fiscal_year_id,
    report_type:      params.report_type,
    report_line_code: params.report_line_code,
    original_value:   params.original_value,
    new_value:        params.new_value,
    difference:       params.new_value - (params.original_value ?? 0),
    reason:           params.reason,
    created_by:       params.created_by,
    created_at:       new Date().toISOString(),
    approval_status:  params.requires_approval ? 'pending' : 'auto_approved',
  };
}

export function approveOverride(override: ManualOverride, approvedBy: string): ManualOverride {
  return {
    ...override,
    approval_status: 'approved',
    approved_by:     approvedBy,
    approved_at:     new Date().toISOString(),
  };
}

export function rejectOverride(override: ManualOverride, rejectedBy: string): ManualOverride {
  return {
    ...override,
    approval_status: 'rejected',
    approved_by:     rejectedBy,
    approved_at:     new Date().toISOString(),
  };
}

export function getActiveOverrides(overrides: ManualOverride[]): ManualOverride[] {
  return overrides.filter((o) => o.approval_status === 'approved' || o.approval_status === 'auto_approved');
}

export function getOverrideForLine(
  overrides: ManualOverride[],
  reportType: ReportType,
  lineCode: string,
): ManualOverride | undefined {
  return getActiveOverrides(overrides).find(
    (o) => o.report_type === reportType && o.report_line_code === lineCode,
  );
}
