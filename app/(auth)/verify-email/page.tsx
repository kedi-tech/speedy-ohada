'use client';

import Link from 'next/link';
import { useT } from '@/context/LangContext';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

export default function VerifyEmailPage() {
  const { lang } = useT();
  const fr = lang === 'fr';

  return (
    <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-bg-2 grid place-items-center mx-auto mb-5">
        <Icons.mail className="text-[24px] text-muted-2" />
      </div>
      <h1 className="text-[22px] font-semibold text-ink font-serif mb-2">
        {fr ? 'Vérifiez votre email' : 'Verify your email'}
      </h1>
      <p className="text-sm text-muted mb-2 max-w-[320px] mx-auto">
        {fr
          ? 'Un lien de vérification a été envoyé à votre adresse email. Cliquez sur le lien pour activer votre compte.'
          : 'A verification link has been sent to your email address. Click the link to activate your account.'}
      </p>
      <div className="bg-bg border border-line rounded-lg px-4 py-2.5 text-[13px] font-mono text-ink-2 my-4 inline-block">
        ibrahim.diaby@cabinet-diaby.ci
      </div>
      <div className="flex flex-col gap-3 mt-6">
        <Btn variant="secondary" className="w-full justify-center">
          {fr ? 'Renvoyer le lien de vérification' : 'Resend verification link'}
        </Btn>
        <Link href="/login">
          <Btn variant="ghost" className="w-full justify-center">{fr ? 'Retour à la connexion' : 'Back to login'}</Btn>
        </Link>
      </div>
    </div>
  );
}
