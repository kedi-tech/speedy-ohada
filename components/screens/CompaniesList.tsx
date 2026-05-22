'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';

export function CompaniesList() {
  const { t, lang } = useT();
  const router = useRouter();
  const [q, setQ] = useState('');
  const { companies: COMPANIES } = useAppData();

  const filtered = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.sector.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={t('nav_companies')}
        subtitle={
          lang === 'fr'
            ? 'Gérez les sociétés du cabinet, créez des exercices, et suivez leur progression.'
            : "Manage your firm's companies, create fiscal years, and track progress."
        }
        actions={
          <>
            <Btn variant="secondary" icon={<Icons.upload />}>
              {lang === 'fr' ? 'Importer' : 'Import'}
            </Btn>
            <Btn variant="primary" icon={<Icons.plus />} onClick={() => router.push('/companies/new')}>{t('qa_newCo')}</Btn>
          </>
        }
      />

      <div className="px-8 py-5 pb-12">
        <Card>
          {/* Filters */}
          <div className="px-4 py-3 flex gap-2.5 items-center border-b border-line-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg rounded-lg border border-line flex-1 text-muted">
              <Icons.search />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`${t('search')}…`}
                className="border-none outline-none bg-transparent flex-1 text-[13px] text-ink font-sans"
              />
            </div>
            <Btn size="sm" variant="secondary">{t('filter')}</Btn>
            <Btn size="sm" variant="secondary">
              {lang === 'fr' ? 'Statut' : 'Status'} <Icons.chevronDown />
            </Btn>
            <Btn size="sm" variant="secondary">
              {lang === 'fr' ? 'Exercice' : 'FY'} <Icons.chevronDown />
            </Btn>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-bg border-b border-line">
                {[
                  lang === 'fr' ? 'Société' : 'Company',
                  lang === 'fr' ? 'Secteur' : 'Sector',
                  lang === 'fr' ? 'Ville' : 'City',
                  lang === 'fr' ? 'Exercice' : 'FY',
                  lang === 'fr' ? 'Progression' : 'Progress',
                  lang === 'fr' ? 'Statut' : 'Status',
                  lang === 'fr' ? 'Mis à jour' : 'Updated',
                  '',
                ].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-[.06em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const statusKey = c.status === 'in-progress' ? 'inProgress' : c.status;
                const statusLabel = t(
                  's_' +
                    (c.status === 'in-progress'
                      ? 'inProgress'
                      : c.status === 'ready'
                      ? 'ready'
                      : c.status === 'warning'
                      ? 'warning'
                      : c.status === 'approved'
                      ? 'approved'
                      : 'draft')
                );
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-bg transition-colors cursor-pointer"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-line-2)' : 'none' }}
                    onClick={() => router.push(`/companies/${c.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[6px] bg-bg-2 grid place-items-center text-[10.5px] font-bold text-ink-2">
                          {c.name.split(' ').slice(0,2).map((w: string) => w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                          <div className="text-[11.5px] text-muted">RCCM CI-{c.id}284{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink-2">{c.sector}</td>
                    <td className="px-4 py-3 text-[12.5px] text-muted">{c.city}</td>
                    <td className="px-4 py-3 text-[12.5px] text-ink-2 font-mono">{c.fy}</td>
                    <td className="px-4 py-3 w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={c.progress} height={4} />
                        </div>
                        <span className="text-[11.5px] font-semibold text-ink-2 tabular-nums w-8 text-right">
                          {c.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={statusKey} label={statusLabel} dot size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">
                      {lang === 'fr' ? c.updated : c.updated_en}
                    </td>
                    <td className="px-4 py-3 text-muted-2">
                      <Icons.more />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
