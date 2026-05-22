'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Btn } from '@/components/ui/Btn';
import type { Lang } from '@/lib/i18n';
import type { Role } from '@/lib/types';

const ROLE_HOME: Record<Role, string> = {
  accountant:  '/dashboard',
  reviewer:    '/dashboard',
  org_admin:   '/dashboard',
  client:      '/portal',
  super_admin: '/dashboard',
};

export default function LoginPage() {
  const { lang, setLang } = useT();
  const { login } = useAuth();
  const router = useRouter();
  const fr = lang === 'fr';

  const [email, setEmail] = useState('sleekhub@gmail.com');
  const [password, setPassword] = useState('Sleekhub@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.status === 'invalid') {
      setError(fr ? 'Email ou mot de passe incorrect.' : 'Invalid email or password.');
      setLoading(false);
      return;
    }
    if (result.status === 'error') {
      setError(fr ? 'Erreur serveur. Veuillez reessayer.' : 'Server error. Please try again.');
      setLoading(false);
      return;
    }

    router.replace(ROLE_HOME[result.user.role as Role] ?? '/dashboard');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center bg-bg border border-line rounded-lg p-0.5">
          {(['fr', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`border-none px-2.5 py-1 text-[11.5px] font-semibold rounded-md cursor-pointer uppercase tracking-[.05em] transition-all ${
                lang === l
                  ? 'bg-paper text-rust shadow-[0_1px_2px_0_rgb(0_0_0/0.06)]'
                  : 'bg-transparent text-muted hover:text-ink-2'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] p-8">
        <h1 className="text-[22px] font-semibold text-ink font-serif mb-1">
          {fr ? 'Connexion' : 'Log in'}
        </h1>
        <p className="text-sm text-muted mb-6">
          {fr ? 'Accedez a votre espace Speedy OHADA.' : 'Sign in to your Speedy OHADA workspace.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-ink-2 mb-1.5">
              {fr ? 'Adresse email' : 'Email address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-rust transition-colors"
            />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-[12px] text-rust hover:text-rust-2 no-underline">
                {fr ? 'Mot de passe oublie ?' : 'Forgot password?'}
              </Link>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-soft border border-red/20 text-[12.5px] text-red">
              {error}
            </div>
          )}

          <Btn
            type="submit"
            variant="primary"
            className="w-full justify-center py-3 mt-1"
            disabled={loading}
          >
            {loading
              ? (fr ? 'Connexion...' : 'Signing in...')
              : (fr ? 'Se connecter' : 'Sign in')}
          </Btn>
        </form>
      </div>

      <div className="mt-4 text-center text-[12.5px] text-muted">
        {fr ? "Vous n'avez pas de compte ?" : "Don't have an account?"}{' '}
        <Link href="/register" className="text-rust font-semibold no-underline hover:text-rust-2">
          {fr ? 'Creer un compte' : 'Create account'}
        </Link>
      </div>
    </div>
  );
}
