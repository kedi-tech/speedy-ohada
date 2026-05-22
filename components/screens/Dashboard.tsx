'use client';

import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

export function Dashboard() {
  const { t, lang } = useT();
  const { companies: COMPANIES, activity: ACTIVITY } = useAppData();

  const kpis = [
    { key: 'kpi_companies',  value: COMPANIES.length,  delta: lang==='fr'?'total':'total', trend: 'flat', icon: <Icons.building />,  warn: false },
    { key: 'kpi_active',     value: COMPANIES.length,  delta: lang==='fr'?'actives':'active', trend: 'flat', icon: <Icons.calendar />, warn: false },
    { key: 'kpi_inProgress', value: COMPANIES.filter((c) => c.status === 'in-progress').length,  delta: '-', trend: 'flat', icon: <Icons.spark />,    warn: false },
    { key: 'kpi_ready',      value: COMPANIES.filter((c) => c.status === 'ready').length,  delta: '-', trend: 'flat', icon: <Icons.check />,    warn: false },
    { key: 'kpi_errors',     value: COMPANIES.filter((c) => c.status === 'warning').length,  delta: lang==='fr'?'a corriger':'to fix', trend: COMPANIES.some((c) => c.status === 'warning') ? 'warn' : 'flat', icon: <Icons.alert />, warn: true },
    { key: 'kpi_pending',    value: 0,  delta: lang==='fr'?'reviseur':'reviewer', trend: 'flat', icon: <Icons.eye />,  warn: false },
    { key: 'kpi_approved',   value: COMPANIES.filter((c) => c.status === 'approved').length, delta: lang==='fr'?'total':'total',  trend: 'flat', icon: <Icons.shield />,   warn: false },
    { key: 'kpi_exports',    value: 0,  delta: lang==='fr'?'30 j':'30 d',   trend: 'flat',   icon: <Icons.download />, warn: false },
  ];

  const nextActions = COMPANIES.filter((c) => c.status === 'warning' || c.status === 'draft').slice(0, 4).map((c) => ({
    fr: c.status === 'warning' ? 'Verifier le dossier' : 'Completer la configuration',
    en: c.status === 'warning' ? 'Review file' : 'Complete setup',
    co: c.name,
    level: c.status === 'warning' ? 'warning' : 'info',
    href: `/companies/${c.id}`,
  }));

  return (
    <div>
      <PageHeader
        eyebrow={lang==='fr' ? 'Tableau de bord · Cabinet Diaby Ibrahim & Associés' : 'Dashboard · Cabinet Diaby Ibrahim & Associés'}
        title={t('welcome')}
        subtitle={t('welcomeSub')}
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.plus />}>{t('qa_newCo')}</Btn>
            <Link href="/import">
              <Btn variant="primary" icon={<Icons.upload />}>{t('qa_import')}</Btn>
            </Link>
          </>
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* KPI grid */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Card key={k.key} className="px-[18px] py-4">
              <div className="flex items-center gap-2.5 text-muted mb-3">
                <span className={`w-7 h-7 rounded-[7px] grid place-items-center ${k.warn ? 'bg-red-soft text-red' : 'bg-bg-2 text-ink-2'}`}>
                  {k.icon}
                </span>
                <span className="text-[12px] font-medium">{t(k.key)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-medium font-serif text-ink tracking-[-0.02em]">{k.value}</span>
                <span className={`text-[11.5px] font-medium ${
                  k.trend === 'up' ? 'text-green' : k.trend === 'warn' ? 'text-red' : 'text-muted'
                }`}>{k.delta}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Two-column */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* Recent companies */}
          <Card>
            <CardHeader
              title={t('recentCompanies')}
              action={
                <Link href="/companies">
                  <Btn size="sm" variant="ghost" iconRight={<Icons.arrowRight />}>
                    {lang==='fr' ? 'Voir tout' : 'See all'}
                  </Btn>
                </Link>
              }
            />
            <div>
              {COMPANIES.slice(0, 5).map((c, i) => {
                const statusKey = c.status === 'in-progress' ? 'inProgress' : c.status;
                const statusLabel = t('s_' + (c.status === 'in-progress' ? 'inProgress' : c.status === 'ready' ? 'ready' : c.status === 'warning' ? 'warning' : c.status === 'approved' ? 'approved' : 'draft'));
                return (
                  <Link
                    key={c.id}
                    href={`/companies/${c.id}`}
                    className="grid items-center gap-3 px-5 py-3 no-underline hover:bg-bg transition-colors"
                    style={{ gridTemplateColumns: '32px 1fr 100px 80px 20px', borderBottom: i < 4 ? '1px solid var(--color-line-2)' : 'none' }}
                  >
                    <div className="w-8 h-8 rounded-[7px] bg-bg-2 grid place-items-center text-[11px] font-bold text-ink-2">
                      {c.name.split(' ').slice(0,2).map((w: string) => w[0]).join('').slice(0,2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-ink">{c.name}</div>
                      <div className="text-[11.5px] text-muted">{c.sector} · {c.city} · FY {c.fy}</div>
                    </div>
                    <Badge status={statusKey} label={statusLabel} dot size="sm" />
                    <div className="text-[11.5px] text-muted text-right">{lang==='fr' ? c.updated : c.updated_en}</div>
                    <Icons.chevronRight className="text-muted-2" />
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Next actions */}
          <Card>
            <CardHeader title={t('nextActions')} />
            <div>
              {nextActions.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-bg transition-colors cursor-pointer"
                  style={{ borderBottom: i < nextActions.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}
                  onClick={() => a.href && (window.location.href = a.href)}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    a.level === 'critical' ? 'bg-red' : a.level === 'warning' ? 'bg-amber' : 'bg-blue'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-ink-2 font-medium">{lang==='fr' ? a.fr : a.en}</div>
                    <div className="text-[11.5px] text-muted">{a.co}</div>
                  </div>
                  {a.href && <Icons.chevronRight className="text-muted-2" />}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity */}
        <Card>
          <CardHeader
            title={t('recentActivity')}
            action={
              <Link href="/audit">
                <Btn size="sm" variant="ghost">{lang==='fr' ? 'Journal complet' : 'Full log'}</Btn>
              </Link>
            }
          />
          <div>
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                className="grid items-center gap-3.5 px-5 py-2.5"
                style={{ gridTemplateColumns: '28px 1fr auto auto', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}
              >
                <div className="w-[26px] h-[26px] rounded-full bg-bg-2 grid place-items-center text-[10px] font-bold text-ink-2">
                  {a.who.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] text-ink-2">
                    <span className="font-semibold">{a.who}</span> {lang==='fr' ? a.what_fr : a.what_en}
                  </div>
                  <div className="text-[11.5px] text-muted">{a.co}</div>
                </div>
                {a.flag && (
                  <Badge
                    status={a.flag === 'ok' ? 'passed' : a.flag}
                    label={a.flag === 'ok' ? 'OK' : a.flag}
                    size="sm"
                  />
                )}
                <span className="text-[11.5px] text-muted whitespace-nowrap">
                  {lang==='fr' ? a.when_fr : a.when_en}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
