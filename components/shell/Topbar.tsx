'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAppData } from '@/lib/useAppData';
import { Icons } from '@/components/ui/Icon';
import type { Lang } from '@/lib/i18n';

const BREADCRUMBS: Record<string, string[]> = {
  '/dashboard':      ['Cabinet Diaby Ibrahim', 'nav_dashboard'],
  '/companies':      ['Cabinet Diaby Ibrahim', 'nav_companies'],
  '/companies/new':  ['Cabinet Diaby Ibrahim', 'nav_companies', 'Nouvelle société'],
  '/fiscal':         ['Cabinet Diaby Ibrahim', 'nav_fiscal'],
  '/fiscal/new':     ['Cabinet Diaby Ibrahim', 'nav_fiscal', 'Nouvel exercice'],
  '/workspace':      ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_workspace'],
  '/import':         ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_import'],
  '/mapping':        ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_mapping'],
  '/validation':     ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_validation'],
  '/statements':     ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_statements'],
  '/notes':          ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_notes'],
  '/tax':            ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_tax'],
  '/review':         ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_review'],
  '/export':         ['Cabinet Diaby Ibrahim', 'Sahel Industries SARL', 'FY 2025', 'nav_export'],
  '/archives':       ['Cabinet Diaby Ibrahim', 'nav_archives'],
  '/users':          ['Cabinet Diaby Ibrahim', 'nav_users'],
  '/notifications':  ['Cabinet Diaby Ibrahim', 'Notifications'],
  '/subscriptions':  ['Cabinet Diaby Ibrahim', 'Abonnement'],
  '/charges':        ['Cabinet Diaby Ibrahim', 'Charges'],
  '/settings':       ['Cabinet Diaby Ibrahim', 'nav_settings'],
  '/audit':          ['Cabinet Diaby Ibrahim', 'nav_audit'],
};

export function Topbar() {
  const { t, lang, setLang } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const workspace = useWorkspace();
  const { companies, fiscalYears, loading } = useAppData();
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    if (!loading && companies.length > 0) {
      workspace.syncFromList(companies, fiscalYears);
    }
  }, [loading, companies, fiscalYears, workspace]);

  const companyFYs = fiscalYears.filter((fy) => fy.company_id === workspace.activeCompanyId);

  const rawCrumbs = BREADCRUMBS[pathname] ?? ['Cabinet Diaby Ibrahim'];
  const crumbs = rawCrumbs.map((c) => (c.startsWith('nav_') ? t(c) : c));

  return (
    <div className="h-14 bg-paper border-b border-line flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted flex-1 min-w-0">
        {crumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <Icons.chevronRight className="text-muted-2" />}
            <span className={i === crumbs.length - 1 ? 'text-ink font-semibold' : 'text-muted'}>
              {b}
            </span>
          </span>
        ))}
      </div>

      {/* Active workspace selector */}
      {companies.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setSelectorOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-line rounded-lg text-[12px] text-ink hover:bg-paper transition-colors cursor-pointer"
          >
            <Icons.building className="text-muted w-3.5 h-3.5" />
            <span className="max-w-[160px] truncate font-medium">
              {workspace.activeCompany?.name ?? '—'}
            </span>
            <span className="text-muted text-[11px]">
              {workspace.activeFiscalYear?.label ?? '—'}
            </span>
            <Icons.chevronRight className="text-muted rotate-90 w-3 h-3" />
          </button>

          {selectorOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-paper border border-line rounded-xl shadow-lg z-[200] p-2">
              <p className="text-[11px] text-muted uppercase tracking-wider px-2 pb-1">
                {lang === 'fr' ? 'Société' : 'Company'}
              </p>
              {companies.map((co) => (
                <button
                  key={co.id}
                  onClick={() => {
                    workspace.setActiveCompany(co.id);
                    const firstFY = fiscalYears.find((fy) => fy.company_id === co.id);
                    if (firstFY) workspace.setActiveFiscalYear(firstFY.id);
                    setSelectorOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors ${
                    co.id === workspace.activeCompanyId
                      ? 'bg-rust/10 text-rust font-semibold'
                      : 'text-ink hover:bg-bg'
                  }`}
                >
                  {co.name}
                </button>
              ))}

              {companyFYs.length > 0 && (
                <>
                  <div className="border-t border-line my-1.5" />
                  <p className="text-[11px] text-muted uppercase tracking-wider px-2 pb-1">
                    {lang === 'fr' ? 'Exercice' : 'Fiscal Year'}
                  </p>
                  {companyFYs.map((fy) => (
                    <button
                      key={fy.id}
                      onClick={() => {
                        workspace.setActiveFiscalYear(fy.id);
                        setSelectorOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors ${
                        fy.id === workspace.activeFiscalYearId
                          ? 'bg-rust/10 text-rust font-semibold'
                          : 'text-ink hover:bg-bg'
                      }`}
                    >
                      {fy.label}
                      {fy.locked && <span className="ml-1 text-[10px] text-muted">(verrouillé)</span>}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bg rounded-lg border border-line w-[280px] text-muted">
        <Icons.search />
        <input
          placeholder={`${t('search')}…`}
          className="border-none outline-none bg-transparent flex-1 text-[13px] text-ink font-sans placeholder:text-muted"
        />
        <span className="text-[11px] px-1 py-px border border-line rounded bg-paper">⌘K</span>
      </div>

      {/* Lang switcher */}
      <div className="flex items-center bg-bg border border-line rounded-lg p-0.5">
        {(['fr', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`
              border-none px-2.5 py-1 text-[11.5px] font-semibold rounded-md cursor-pointer transition-all
              tracking-[.05em] uppercase
              ${lang === l
                ? 'bg-paper text-rust shadow-[0_1px_2px_0_rgb(0_0_0/0.06)]'
                : 'bg-transparent text-muted hover:text-ink-2'
              }
            `}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Bell */}
      <button onClick={() => router.push('/notifications')} className="relative w-8 h-8 border border-line rounded-lg bg-paper text-muted grid place-items-center cursor-pointer hover:bg-bg transition-colors">
        <Icons.bell />
        <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-rust border-2 border-paper" />
      </button>
    </div>
  );
}
