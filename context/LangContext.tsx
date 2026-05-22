'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { I18N, type Lang } from '@/lib/i18n';

interface LangContextType {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'fr',
  t: (k) => k,
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  const t = useCallback(
    (key: string): string => {
      return (I18N[lang] as Record<string, string>)[key] ?? (I18N.fr as Record<string, string>)[key] ?? key;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}

export function fmtNum(n: number | null | undefined, lang: Lang = 'fr'): string {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(Math.round(n));
  const sep = lang === 'fr' ? ' ' : ',';
  const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return n < 0 ? '(' + s + ')' : s;
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(1) + '%';
}
