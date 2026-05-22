'use client';

import { useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { SUBSCRIPTION_PLANS } from '@/lib/data';

export function SubscriptionManagement() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <div>
      <PageHeader
        title={fr ? 'Abonnements et plans' : 'Subscriptions & plans'}
        subtitle={fr ? 'Choisissez le plan adapté à votre cabinet.' : 'Choose the plan that fits your firm.'}
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-6">
        {/* Billing toggle */}
        <div className="flex items-center gap-3 justify-center">
          <span className={`text-[13px] ${billing === 'monthly' ? 'text-ink font-semibold' : 'text-muted'}`}>{fr ? 'Mensuel' : 'Monthly'}</span>
          <button onClick={() => setBilling((b) => b === 'monthly' ? 'annual' : 'monthly')}
            className={`w-12 h-6 rounded-full transition-colors relative ${billing === 'annual' ? 'bg-rust' : 'bg-bg-2'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-[13px] ${billing === 'annual' ? 'text-ink font-semibold' : 'text-muted'}`}>
            {fr ? 'Annuel' : 'Annual'}
            <span className="ml-1.5 text-[11px] text-green font-semibold bg-green-soft px-1.5 py-0.5 rounded-full">{fr ? '-20%' : '-20%'}</span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = billing === 'annual' ? plan.price_year : plan.price_month;
            const period = billing === 'annual' ? (fr ? '/an' : '/yr') : (fr ? '/mois' : '/mo');
            const isCurrent = plan.id === 'cabinet';
            return (
              <div key={plan.id} className={`relative rounded-2xl border p-5 flex flex-col gap-4 ${plan.popular ? 'border-rust shadow-[0_0_0_2px_var(--color-rust)]' : 'border-line'} ${isCurrent ? 'bg-rust-tint/30' : 'bg-paper'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rust text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {fr ? 'Populaire' : 'Popular'}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-green text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {fr ? 'Actuel' : 'Current'}
                  </div>
                )}
                <div>
                  <div className="text-[15px] font-bold text-ink">{fr ? plan.name_fr : plan.name_en}</div>
                  <div className="text-[26px] font-bold text-ink mt-1">
                    {price === 0 ? (fr ? 'Gratuit' : 'Free') : `${price.toLocaleString('fr-FR')} GNF`}
                    {price > 0 && <span className="text-[14px] font-normal text-muted">{period}</span>}
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {(fr ? plan.features_fr : plan.features_en).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted">
                      <span className="text-green flex-shrink-0 mt-0.5"><Icons.check /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Btn variant={isCurrent ? 'ghost' : plan.popular ? 'primary' : 'secondary'} className="w-full justify-center" disabled={isCurrent}>
                    {isCurrent ? (fr ? 'Plan actuel' : 'Current plan') : (fr ? 'Choisir ce plan' : 'Choose this plan')}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage */}
        <div className="bg-paper border border-line rounded-xl p-5">
          <div className="text-[13px] font-semibold text-ink mb-4">{fr ? 'Utilisation actuelle' : 'Current usage'}</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: fr ? 'Sociétés' : 'Companies', used: 6, max: 25 },
              { label: fr ? 'Utilisateurs' : 'Users', used: 8, max: 15 },
              { label: fr ? 'Exercices actifs' : 'Active years', used: 7, max: 50 },
            ].map((u, i) => {
              const pct = Math.round((u.used / u.max) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-[12.5px] mb-1.5">
                    <span className="text-muted">{u.label}</span>
                    <span className="font-medium text-ink">{u.used} / {u.max}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bg-2 overflow-hidden">
                    <div className="h-full rounded-full bg-rust" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
