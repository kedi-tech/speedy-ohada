import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center text-muted">
      <div className="w-11 h-11 rounded-full bg-bg-2 grid place-items-center mb-3 text-muted">
        {icon}
      </div>
      <div className="font-semibold text-ink-2 text-sm mb-1">{title}</div>
      {sub && <div className="text-[12.5px] max-w-xs">{sub}</div>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
