'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  org: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ status: 'ok'; user: AuthUser } | { status: 'invalid' } | { status: 'error' }>;
  logout: () => void;
}

const SESSION_KEY = 'ohada_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ status: 'ok'; user: AuthUser } | { status: 'invalid' } | { status: 'error' }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) return { status: 'invalid' };
      if (!res.ok) return { status: 'error' };

      const data = await res.json();
      const authUser: AuthUser = data.user;

      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(authUser))}; path=/; max-age=86400`;
      return { status: 'ok', user: authUser };
    } catch {
      return { status: 'error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
