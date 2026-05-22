'use client';

import { useEffect, useState } from 'react';
import type {
  ActivityItem,
  AuditLog,
  Company,
  FiscalYear,
  Notification,
  Organization,
  TrialBalanceLine,
  User,
} from '@/lib/types';

export interface AppData {
  organizations: Organization[];
  users: User[];
  companies: Company[];
  fiscalYears: FiscalYear[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  trialBalance: TrialBalanceLine[];
  activity: ActivityItem[];
}

const EMPTY_DATA: AppData = {
  organizations: [],
  users: [],
  companies: [],
  fiscalYears: [],
  auditLogs: [],
  notifications: [],
  trialBalance: [],
  activity: [],
};

function toActivity(log: AuditLog): ActivityItem {
  return {
    who: log.user,
    what_fr: `a effectue ${log.action}`,
    what_en: `performed ${log.action}`,
    when_fr: log.timestamp,
    when_en: log.timestamp,
    co: log.entity_name,
    flag: log.action === 'login' ? 'ok' : undefined,
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch('/api/app-data', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load app data');
        return res.json();
      })
      .then((payload) => {
        if (!active) return;
        const next: AppData = {
          organizations: payload.organizations ?? [],
          users: payload.users ?? [],
          companies: payload.companies ?? [],
          fiscalYears: payload.fiscalYears ?? [],
          auditLogs: payload.auditLogs ?? [],
          notifications: payload.notifications ?? [],
          trialBalance: payload.trialBalance ?? [],
          activity: (payload.auditLogs ?? []).slice(0, 8).map(toActivity),
        };
        setData(next);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { ...data, loading, error };
}
