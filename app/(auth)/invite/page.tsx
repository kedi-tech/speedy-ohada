'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

export default function AcceptInvitePage() {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [step, setStep] = useState<'info' | 'password'>('info');

  return (
    <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8">
      {/* Invitation banner */}
      <div className="flex items-center gap-3 p-4 bg-rust-tint border border-rust-soft rounded-xl mb-6">
        <div className="w-10 h-10 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0">
          <Icons.mail />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-ink">Cabinet Diaby Ibrahim & Associés</div>
          <div className="text-[12px] text-muted">
            {fr ? 'vous invite à rejoindre Speedy OHADA Web en tant que Comptable.' : 'invites you to join Speedy OHADA Web as an Accountant.'}
          </div>
        </div>
      </div>

      <h1 className="text-[22px] font-semibold text-ink font-serif mb-1">
        {fr ? "Accepter l'invitation" : 'Accept invitation'}
      </h1>
      <p className="text-sm text-muted mb-6">
        {fr ? 'Créez votre compte pour accéder à votre espace.' : 'Create your account to access your workspace.'}
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Email (prérempli)' : 'Email (pre-filled)'}</label>
          <input type="email" defaultValue="kofi.mensah@cabinet-diallo.ci" disabled
            className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-muted bg-bg-2 cursor-not-allowed" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Prénom' : 'First name'}</label>
            <input className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Nom' : 'Last name'}</label>
            <input className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
          </div>
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">{fr ? 'Mot de passe' : 'Password'}</label>
          <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust" />
          <p className="mt-1 text-[11.5px] text-muted">{fr ? 'Minimum 8 caractères.' : 'Minimum 8 characters.'}</p>
        </div>
        <Btn variant="primary" className="w-full justify-center py-3 mt-2" onClick={() => router.push('/dashboard')}>
          {fr ? 'Créer mon compte et rejoindre' : 'Create account and join'}
        </Btn>
      </div>
    </div>
  );
}
