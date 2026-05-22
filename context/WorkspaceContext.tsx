'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Company, FiscalYear } from '@/lib/types';

const STORAGE_KEY = 'ohada_workspace';

interface WorkspaceState {
  activeCompanyId: string | null;
  activeFiscalYearId: string | null;
}

interface WorkspaceContextValue {
  activeCompanyId: string | null;
  activeFiscalYearId: string | null;
  activeCompany: Company | null;
  activeFiscalYear: FiscalYear | null;
  setActive(companyId: string, fiscalYearId: string): void;
  setActiveCompany(companyId: string): void;
  setActiveFiscalYear(fiscalYearId: string): void;
  syncFromList(companies: Company[], fiscalYears: FiscalYear[]): void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStorage(): WorkspaceState {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw) as WorkspaceState;
  } catch {
    // ignore
  }
  return { activeCompanyId: null, activeFiscalYearId: null };
}

function writeStorage(state: WorkspaceState) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({ activeCompanyId: null, activeFiscalYearId: null });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  useEffect(() => {
    setState(readStorage());
  }, []);

  const setActive = useCallback((companyId: string, fiscalYearId: string) => {
    const next = { activeCompanyId: companyId, activeFiscalYearId: fiscalYearId };
    setState(next);
    writeStorage(next);
  }, []);

  const setActiveCompany = useCallback((companyId: string) => {
    setState((prev) => {
      const next = { ...prev, activeCompanyId: companyId };
      writeStorage(next);
      return next;
    });
  }, []);

  const setActiveFiscalYear = useCallback((fiscalYearId: string) => {
    setState((prev) => {
      const next = { ...prev, activeFiscalYearId: fiscalYearId };
      writeStorage(next);
      return next;
    });
  }, []);

  // Called once app data loads — auto-selects first available if nothing is stored
  const syncFromList = useCallback((companiesList: Company[], fiscalYearsList: FiscalYear[]) => {
    setCompanies(companiesList);
    setFiscalYears(fiscalYearsList);
    setState((prev) => {
      if (prev.activeCompanyId && prev.activeFiscalYearId) return prev;
      const firstCompany = companiesList[0];
      if (!firstCompany) return prev;
      const firstFY = fiscalYearsList.find((fy) => fy.company_id === firstCompany.id);
      if (!firstFY) return prev;
      const next = { activeCompanyId: firstCompany.id, activeFiscalYearId: firstFY.id };
      writeStorage(next);
      return next;
    });
  }, []);

  const activeCompany = companies.find((c) => c.id === state.activeCompanyId) ?? null;
  const activeFiscalYear = fiscalYears.find((fy) => fy.id === state.activeFiscalYearId) ?? null;

  return (
    <WorkspaceContext.Provider value={{
      activeCompanyId: state.activeCompanyId,
      activeFiscalYearId: state.activeFiscalYearId,
      activeCompany,
      activeFiscalYear,
      setActive,
      setActiveCompany,
      setActiveFiscalYear,
      syncFromList,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
