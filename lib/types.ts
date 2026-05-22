export type Lang = 'fr' | 'en';
export type Role = 'super_admin' | 'org_admin' | 'accountant' | 'reviewer' | 'client';

export type CompanyStatus = 'in-progress' | 'ready' | 'warning' | 'approved' | 'draft' | 'locked' | 'archived';

export type WorkflowStatus =
  | 'completed'
  | 'ready'
  | 'in-progress'
  | 'inProgress'
  | 'warning'
  | 'blocked'
  | 'notStarted'
  | 'approved'
  | 'locked'
  | 'draft';

export type MappingStatus = 'auto' | 'manual' | 'unmapped' | 'conflict' | 'needsReview' | 'excluded';
export type ValidationLevel = 'critical' | 'warning' | 'info' | 'passed';
export type NoteStatus = 'notStarted' | 'prefilled' | 'toComplete' | 'completed' | 'needsReview' | 'validated';
export type ReviewStatus = 'notStarted' | 'inProgress' | 'correctionRequested' | 'readyForReview' | 'approved' | 'rejected' | 'locked';
export type TaxStatus = 'draft' | 'completed' | 'warning' | 'approved';
export type FiscalYearStatus = 'draft' | 'setup_incomplete' | 'waiting_balance_n' | 'waiting_balance_n1' | 'balance_failed' | 'mapping_required' | 'notes_required' | 'tax_required' | 'ready_review' | 'under_review' | 'approved' | 'exported' | 'locked';
export type AuditAction = 'login' | 'logout' | 'company_created' | 'company_updated' | 'fiscal_year_created' | 'balance_imported' | 'balance_deleted' | 'mapping_changed' | 'note_edited' | 'tax_edited' | 'validation_run' | 'comment_added' | 'section_approved' | 'section_rejected' | 'report_exported' | 'report_locked' | 'report_unlocked' | 'user_invited' | 'role_changed';
export type SubscriptionPlan = 'starter' | 'professional' | 'cabinet' | 'enterprise';
export type NotifType = 'info' | 'warning' | 'success' | 'error';

export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  commercial_name?: string;
  rccm?: string;
  nif?: string;
  legal_form?: string;
  sector: string;
  main_activity?: string;
  address?: string;
  city: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_center?: string;
  tax_regime?: string;
  currency?: string;
  accounting_standard?: string;
  manager_name?: string;
  manager_title?: string;
  accountant_name?: string;
  accountant_contact?: string;
  auditor_name?: string;
  auditor_contact?: string;
  notes?: string;
  status: CompanyStatus;
  progress: number;
  fy: string;
  updated: string;
  updated_en: string;
}

export interface FiscalYear {
  id: string;
  company_id: string;
  company_name: string;
  label: string;
  opening_date: string;
  closing_date: string;
  year_n: number;
  year_n1: number;
  currency: string;
  status: FiscalYearStatus;
  locked: boolean;
  created_by: string;
  reviewed_by?: string;
  approved_by?: string;
  export_date?: string;
  progress: number;
  notes?: string;
}

export interface WorkflowStep {
  key: string;
  status: WorkflowStatus;
  note_fr: string;
  note_en: string;
}

export interface TrialBalanceLine {
  acc: string;
  label: string;
  debit: number;
  credit: number;
  n1_debit: number;
  n1_credit: number;
  mapped: string;
  status: MappingStatus;
}

export interface ValidationRule {
  cat: string;
  level: ValidationLevel;
  fr: string;
  en: string;
  code?: string;
}

export interface BilanRow {
  sec?: boolean;
  sub?: boolean;
  tot?: boolean;
  hl?: boolean;
  fr: string;
  en: string;
  gross?: number;
  depr?: number;
  net?: number;
  netN1?: number;
  n?: number;
}

export interface IncomeRow {
  sec?: boolean;
  sub?: boolean;
  tot?: boolean;
  hl?: boolean;
  neg?: boolean;
  fr: string;
  en: string;
  n?: number;
  netN1?: number;
}

export interface ActivityItem {
  who: string;
  what_fr: string;
  what_en: string;
  when_fr: string;
  when_en: string;
  co: string;
  flag?: string;
}

export interface AnnexNote {
  id: string;
  number: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  status: NoteStatus;
  required: boolean;
  auto_data?: string;
  content?: string;
  last_edited?: string;
  editor?: string;
}

export interface TaxForm {
  id: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  status: TaxStatus;
  required: boolean;
  form_type: 'patente' | 'honoraires' | 'tva' | 'is' | 'dgi' | 'other';
}

export interface ReviewSection {
  id: string;
  title_fr: string;
  title_en: string;
  status: ReviewStatus;
  reviewer?: string;
  comments: ReviewComment[];
  route: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  role: string;
  text_fr: string;
  text_en: string;
  timestamp: string;
  type: 'comment' | 'correction' | 'approval' | 'rejection';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization?: string;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
  created_at: string;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  user_role: string;
  action: AuditAction;
  entity_type: string;
  entity_name: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  timestamp: string;
  ip?: string;
  device?: string;
}

export interface Notification {
  id: string;
  type: NotifType;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  timestamp: string;
  read: boolean;
  action_href?: string;
}

export interface ReportVersion {
  id: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'exported' | 'locked' | 'archived';
  created_by: string;
  created_at: string;
  summary_fr: string;
  summary_en: string;
  download_url?: string;
}

export interface SubscriptionPlanInfo {
  id: SubscriptionPlan;
  name_fr: string;
  name_en: string;
  price_month: number;
  price_year: number;
  max_companies: number | null;
  max_users: number | null;
  features_fr: string[];
  features_en: string[];
  popular?: boolean;
}

export interface ChargeRow {
  acc: string;
  label: string;
  category_fr: string;
  category_en: string;
  amount_n: number;
  amount_n1: number;
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  status: string;
  adminEmail: string;
  oneccaNumber?: string;
  rccm?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  companies: number;
  users: number;
  created_at?: string;
}
