'use client';

import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

export default function ForgotPasswordPage() {
  const { lang } = useT();
  const fr = lang === 'fr';

  return (
    <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8">
      <h1 className="text-[22px] font-semibold text-ink font-serif mb-1">
        {fr ? 'Mot de passe oublié' : 'Forgot password'}
      </h1>
      <p className="text-sm text-muted mb-6">
        {fr
          ? 'Entrez votre email pour recevoir un lien de réinitialisation.'
          : 'Enter your email to receive a reset link.'}
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Adresse email' : 'Email address'}
          </label>
          <input
            type="email"
            className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
          />
        </div>

        <Btn variant="primary" className="w-full justify-center py-3">
          {fr ? 'Envoyer le lien' : 'Send reset link'}
        </Btn>
      </div>

      <div className="mt-6 pt-6 border-t border-line-2 text-center text-[12.5px] text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-muted hover:text-ink-2 no-underline"
        >
          <Icons.arrowLeft />
          {fr ? 'Retour à la connexion' : 'Back to login'}
        </Link>
      </div>
    </div>
  );
}
