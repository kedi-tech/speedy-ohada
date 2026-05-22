import type {
  AnnexNote,
  AuditLog,
  ChargeRow,
  Company,
  FiscalYear,
  Notification,
  Organization,
  ReportVersion,
  ReviewSection,
  SubscriptionPlanInfo,
  TaxForm,
  TrialBalanceLine,
  User,
  ValidationRule,
  WorkflowStep,
} from '@/lib/types';

export const COMPANIES: Company[] = [];
export const FISCAL_YEARS: FiscalYear[] = [];
export const USERS: User[] = [];
export const ORGANIZATIONS: Organization[] = [];
export const AUDIT_LOGS: AuditLog[] = [];
export const NOTIFICATIONS: Notification[] = [];
export const TRIAL_BALANCE: TrialBalanceLine[] = [];
export const WORKFLOW: WorkflowStep[] = [];
export const VALIDATIONS: ValidationRule[] = [];
export const ANNEX_NOTES: AnnexNote[] = [];
export const TAX_FORMS: TaxForm[] = [];
export const REVIEW_SECTIONS: ReviewSection[] = [];
export const REPORT_VERSIONS: ReportVersion[] = [];
export const SUBSCRIPTION_PLANS: SubscriptionPlanInfo[] = [];
export const CHARGES: ChargeRow[] = [];
export const PLATFORM_USERS: Array<{ id: string; org_id: string; name: string; email: string; role: string }> = [];

export const MAPPING_LINES: Record<string, string> = {};
export const NOTES_META = { total: 0, completed: 0, missing: 0, warnings: 0 };
export const PLAN_META: Record<string, { fr: string; en: string; color: string }> = {};
