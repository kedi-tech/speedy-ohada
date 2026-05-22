'use client';

import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';
import type { ReactNode } from 'react';

interface StubScreenProps {
  titleKey: string;
  subtitleFr: string;
  subtitleEn: string;
  icon: ReactNode;
  soon?: boolean;
}

export function StubScreen({ titleKey, subtitleFr, subtitleEn, icon, soon = true }: StubScreenProps) {
  const { t, lang } = useT();

  return (
    <div>
      <PageHeader
        eyebrow={lang === 'fr' ? 'Sahel Industries SARL · Exercice 2025' : 'Sahel Industries SARL · FY 2025'}
        title={t(titleKey)}
        subtitle={lang === 'fr' ? subtitleFr : subtitleEn}
      />
      <div className="px-8 py-6 pb-12">
        <Card className="p-16">
          <div className="flex flex-col items-center text-center gap-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-bg-2 grid place-items-center text-muted-2 text-2xl">
              {icon}
            </div>
            <div>
              <div className="text-[17px] font-semibold text-ink font-serif mb-1.5">
                {lang === 'fr' ? 'Fonctionnalité en préparation' : 'Feature coming soon'}
              </div>
              <div className="text-[13px] text-muted leading-relaxed">
                {lang === 'fr'
                  ? 'Cette section est en cours de développement et sera disponible prochainement.'
                  : 'This section is under development and will be available soon.'}
              </div>
            </div>
            {soon && (
              <span className="text-[11px] font-semibold text-rust-2 bg-rust-tint border border-rust-soft px-3 py-1 rounded-full uppercase tracking-[.06em]">
                {lang === 'fr' ? 'Bientôt disponible' : 'Coming soon'}
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
