'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

export default function ResetPasswordPage() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-soft text-green grid place-items-center mx-auto mb-4">
          <Icons.check />
        </div>
        <h2 className="text-[18px] font-semibold text-ink font-serif mb-2">
          {fr ? 'Mot de passe mis à jour' : 'Password updated'}
        </h2>
        <p className="text-sm text-muted mb-6">
          {fr ? 'Votre mot de passe a été réinitialisé avec succès.' : 'Your password has been successfully reset.'}
        </p>
        <Link href="/login">
          <Btn variant="primary" className="w-full justify-center">{fr ? 'Se connecter' : 'Sign in'}</Btn>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8">
      <h1 className="text-[22px] font-semibold text-ink font-serif mb-1">
        {fr ? 'Nouveau mot de passe' : 'New password'}
      </h1>
      <p className="text-sm text-muted mb-6">
        {fr ? 'Choisissez un nouveau mot de passe sécurisé.' : 'Choose a new secure password.'}
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Nouveau mot de passe' : 'New password'}
          </label>
          <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors" />
          <p className="mt-1 text-[11.5px] text-muted">{fr ? 'Minimum 8 caractères.' : 'Minimum 8 characters.'}</p>
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Confirmer le mot de passe' : 'Confirm password'}
          </label>
          <input type="password" className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors" />
        </div>
        <Btn variant="primary" className="w-full justify-center py-3 mt-2" onClick={() => setDone(true)}>
          {fr ? 'Réinitialiser le mot de passe' : 'Reset password'}
        </Btn>
      </div>
      <div className="mt-6 pt-6 border-t border-line-2 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink-2 no-underline">
          <Icons.arrowLeft />{fr ? 'Retour à la connexion' : 'Back to login'}
        </Link>
      </div>
    </div>
  );
}
