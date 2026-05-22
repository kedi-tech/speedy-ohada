import { NextRequest, NextResponse } from 'next/server';

type Role = 'super_admin' | 'org_admin' | 'accountant' | 'reviewer' | 'client';

const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/invite'];

const ROLE_HOME: Record<Role, string> = {
  accountant: '/dashboard',
  reviewer: '/dashboard',
  org_admin: '/admin',
  client: '/portal',
  super_admin: '/admin',
};

const DENIED: Partial<Record<Role, string[]>> = {
  client: ['/dashboard', '/companies', '/fiscal', '/workspace', '/import', '/mapping', '/validation', '/statements', '/notes', '/tax', '/review', '/export', '/archives', '/users', '/settings', '/subscriptions', '/charges', '/audit', '/admin'],
  reviewer: ['/import', '/mapping', '/tax', '/users', '/settings', '/subscriptions', '/charges', '/admin'],
  accountant: ['/users', '/settings', '/subscriptions', '/charges', '/admin'],
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('ohada_user');
  if (!cookie?.value) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const user = JSON.parse(decodeURIComponent(cookie.value)) as { role: Role };
    const denied = DENIED[user.role] ?? [];
    if (denied.some((d) => pathname === d || pathname.startsWith(d + '/'))) {
      return NextResponse.redirect(new URL(ROLE_HOME[user.role], req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
