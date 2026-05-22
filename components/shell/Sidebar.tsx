'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icon';
import type { Role } from '@/lib/types';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeRed?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  roles: Role[];
}

const ROLE_LABEL: Record<Role, { fr: string; en: string }> = {
  accountant:  { fr: 'Comptable',     en: 'Accountant' },
  reviewer:    { fr: 'Réviseur',      en: 'Reviewer' },
  org_admin:   { fr: 'Admin Cabinet', en: 'Firm Admin' },
  client:      { fr: 'Client',        en: 'Client' },
  super_admin: { fr: 'Super Admin',   en: 'Super Admin' },
};

export function Sidebar() {
  const { t, lang } = useT();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const role = user?.role ?? 'accountant';

  const groups: NavGroup[] = [
    {
      label: t('section_main'),
      roles: ['accountant', 'reviewer', 'org_admin', 'super_admin'],
      items: [
        { key: 'dashboard',  href: '/dashboard',   icon: <Icons.dashboard />,  label: t('nav_dashboard') },
        { key: 'companies',  href: '/companies',   icon: <Icons.building />,   label: t('nav_companies'), badge: '6' },
        { key: 'fiscal',     href: '/fiscal',      icon: <Icons.calendar />,   label: t('nav_fiscal') },
      ],
    },
    {
      label: lang === 'fr' ? 'Sahel Industries · 2025' : 'Sahel Industries · 2025',
      roles: ['accountant', 'reviewer', 'super_admin'],
      items: [
        { key: 'workspace',  href: '/workspace',   icon: <Icons.shield />,     label: t('nav_workspace') },
        { key: 'import',     href: '/import',      icon: <Icons.upload />,     label: t('nav_import'),    roles: ['accountant', 'super_admin'] } as NavItem & { roles?: Role[] },
        { key: 'mapping',    href: '/mapping',     icon: <Icons.link />,       label: t('nav_mapping'),   badge: '4', roles: ['accountant', 'super_admin'] } as NavItem & { roles?: Role[] },
        { key: 'validation', href: '/validation',  icon: <Icons.check />,      label: t('nav_validation'), badge: '!', badgeRed: true },
      ].filter((item) => {
        const itemRoles = (item as NavItem & { roles?: Role[] }).roles;
        return !itemRoles || itemRoles.includes(role);
      }),
    },
    {
      label: t('section_report'),
      roles: ['accountant', 'reviewer', 'super_admin'],
      items: [
        { key: 'statements', href: '/statements',  icon: <Icons.scale />,      label: t('nav_statements') },
        { key: 'notes',      href: '/notes',       icon: <Icons.notes />,      label: t('nav_notes'), badge: '29/36' },
        { key: 'fird',       href: '/fird',        icon: <Icons.doc />,        label: t('nav_fird'),  roles: ['accountant', 'super_admin'] } as NavItem & { roles?: Role[] },
        { key: 'tax',        href: '/tax',         icon: <Icons.doc />,        label: t('nav_tax'),   roles: ['accountant', 'super_admin'] } as NavItem & { roles?: Role[] },
        { key: 'review',     href: '/review',      icon: <Icons.eye />,        label: t('nav_review') },
        { key: 'export',     href: '/export',      icon: <Icons.download />,   label: t('nav_export') },
        { key: 'archives',   href: '/archives',    icon: <Icons.archive />,    label: t('nav_archives') },
      ].filter((item) => {
        const itemRoles = (item as NavItem & { roles?: Role[] }).roles;
        return !itemRoles || itemRoles.includes(role);
      }),
    },
    {
      label: lang === 'fr' ? 'Cabinet' : 'Firm',
      roles: ['org_admin', 'super_admin'],
      items: [
        { key: 'users',         href: '/users',         icon: <Icons.users />,    label: t('nav_users') },
        { key: 'subscriptions', href: '/subscriptions', icon: <Icons.spark />,    label: lang === 'fr' ? 'Abonnement' : 'Subscription' },
        { key: 'charges',       href: '/charges',       icon: <Icons.scale />,    label: lang === 'fr' ? 'Charges' : 'Charges' },
        { key: 'settings',      href: '/settings',      icon: <Icons.settings />, label: t('nav_settings') },
      ],
    },
    {
      label: lang === 'fr' ? 'Système' : 'System',
      roles: ['accountant', 'reviewer', 'org_admin', 'super_admin'],
      items: [
        { key: 'notifications', href: '/notifications', icon: <Icons.bell />,     label: lang === 'fr' ? 'Notifications' : 'Notifications', badge: '3', badgeRed: true },
        { key: 'audit',         href: '/audit',         icon: <Icons.log />,      label: t('nav_audit') },
      ],
    },
  ];

  const visibleGroups = groups
    .filter((g) => g.roles.includes(role))
    .map((g) => ({ ...g, items: g.items }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const roleLabel = ROLE_LABEL[role];

  return (
    <aside className="w-[248px] flex-shrink-0 bg-bg border-r border-line flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-[18px] flex items-center gap-2.5 border-b border-line-2">
        <div className="w-[30px] h-[30px] rounded-[7px] bg-gradient-to-br from-rust to-rust-2 grid place-items-center text-white font-bold text-sm font-serif shadow-[0_2px_6px_rgb(194_65_12/0.25)]">
          S
        </div>
        <div className="flex flex-col leading-[1.1]">
          <span className="text-sm font-bold text-ink font-serif">
            Speedy <span className="text-rust">OHADA</span>
          </span>
          <span className="text-[10.5px] text-muted tracking-[.1em] uppercase">Web · v0.9</span>
        </div>
      </div>

      {/* Org chip */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="w-full bg-paper border border-line rounded-lg px-2.5 py-2 flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-[6px] bg-bg-2 grid place-items-center text-[11px] font-bold text-ink-2">
            {user?.initials ?? 'DI'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink truncate">{user?.org ?? 'Cabinet Diaby Ibrahim & Associés'}</div>
            <div className="text-[11px] text-muted">
              {lang === 'fr' ? 'Plan Cabinet · 6 sociétés' : 'Firm plan · 6 companies'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-auto px-2 py-2 pb-4">
        {visibleGroups.map((g, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-3.5' : ''}>
            <div className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted-2 px-2.5 pb-1.5 pt-1">
              {g.label}
            </div>
            {g.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] mb-[1px]
                    text-[13px] font-medium transition-all duration-[100ms]
                    border-l-2 text-left cursor-pointer no-underline
                    ${active
                      ? 'bg-paper text-ink font-semibold border-l-rust shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]'
                      : 'text-muted border-l-transparent hover:bg-bg-2 hover:text-ink-2'
                    }
                  `}
                >
                  <span className={active ? 'text-rust' : 'text-muted'}>{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10.5px] px-1.5 py-px rounded-full font-semibold ${item.badgeRed ? 'bg-red text-white' : 'bg-bg-2 text-muted'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-line-2 px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#FED7AA] to-rust grid place-items-center text-white text-[12px] font-bold flex-shrink-0">
          {user?.initials ?? 'DI'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-ink truncate">{user?.name ?? 'Diaby Ibrahim'}</div>
          <div className="text-[11px] text-muted">
            {lang === 'fr' ? roleLabel.fr : roleLabel.en}
          </div>
        </div>
        <button
          onClick={logout}
          title={lang === 'fr' ? 'Se déconnecter' : 'Log out'}
          className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-red hover:bg-red-soft transition-colors flex-shrink-0"
        >
          <Icons.logout />
        </button>
      </div>
    </aside>
  );
}
