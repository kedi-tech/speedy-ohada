'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';

const ROLE_HOME: Record<Role, string> = {
  accountant:  '/dashboard',
  reviewer:    '/dashboard',
  org_admin:   '/admin',
  client:      '/portal',
  super_admin: '/admin',
};

function Spinner() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-rust/30 border-t-rust rounded-full animate-spin" />
    </div>
  );
}

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (!allowedRoles.includes(user.role)) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) return <Spinner />;
  if (!user || !allowedRoles.includes(user.role)) return <Spinner />;
  return <>{children}</>;
}
