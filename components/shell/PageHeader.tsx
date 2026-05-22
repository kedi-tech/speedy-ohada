import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions, children }: PageHeaderProps) {
  return (
    <div className="px-8 pt-7 pb-5 border-b border-line-2 bg-bg">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="text-[11px] text-muted uppercase tracking-[.1em] mb-2 font-semibold">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[28px] font-medium m-0 text-ink font-serif tracking-[-0.01em] leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted mt-2 mb-0 max-w-[720px]">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2 items-center flex-shrink-0">{actions}</div>
        )}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
