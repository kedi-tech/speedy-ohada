import { cookies } from 'next/headers';

export interface ServerSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
  initials: string;
}

export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
  const value = (await cookies()).get('ohada_user')?.value;
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<ServerSessionUser>;
    if (!parsed.id || !parsed.email) return null;
    return {
      id: parsed.id,
      name: parsed.name ?? parsed.email,
      email: parsed.email,
      role: parsed.role ?? 'accountant',
      org: parsed.org ?? '',
      initials: parsed.initials ?? '',
    };
  } catch {
    return null;
  }
}
