'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { Btn } from '@/components/ui/Btn';

export default function RegisterPage() {
  const { lang } = useT();
  const router = useRouter();
  const fr = lang === 'fr';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSignup = async () => {
    setError('');
    setSaving(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, organizationName, password }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok || !data.user) {
      setError(data.error ?? (fr ? 'Impossible de creer le compte.' : 'Could not create account.'));
      return;
    }

    localStorage.setItem('ohada_user', JSON.stringify(data.user));
    document.cookie = `ohada_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400`;
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8">
      <h1 className="text-[22px] font-semibold text-ink font-serif mb-1">
        {fr ? 'Créer un compte' : 'Create account'}
      </h1>
      <p className="text-sm text-muted mb-6">
        {fr
          ? 'Commencez gratuitement, sans carte bancaire.'
          : 'Get started for free, no credit card required.'}
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-soft border border-red/20 text-[13px] text-red">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
              {fr ? 'Prénom' : 'First name'}
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
              {fr ? 'Nom' : 'Last name'}
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Email professionnel' : 'Work email'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Cabinet / Organisation' : 'Firm / Organization'}
          </label>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
            {fr ? 'Mot de passe' : 'Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
          />
          <p className="mt-1 text-[11.5px] text-muted">
            {fr ? 'Minimum 8 caractères.' : 'Minimum 8 characters.'}
          </p>
        </div>

        <Btn
          variant="primary"
          className="w-full justify-center py-3 mt-2"
          onClick={handleSignup}
          disabled={saving}
        >
          {fr ? 'Créer mon compte' : 'Create my account'}
        </Btn>
      </div>

      <div className="mt-6 pt-6 border-t border-line-2 text-center text-[12.5px] text-muted">
        {fr ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
        <Link href="/login" className="text-rust font-semibold no-underline hover:text-rust-2">
          {fr ? 'Se connecter' : 'Sign in'}
        </Link>
      </div>
    </div>
  );
}
