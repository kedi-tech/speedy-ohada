import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = '', style, onClick }: CardProps) {
  return (
    <div
      className={`bg-paper border border-line rounded-xl shadow-[0_1px_3px_0_rgb(0_0_0/0.06),0_1px_2px_-1px_rgb(0_0_0/0.04)] ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}

export function CardHeader({ title, subtitle, action, eyebrow }: CardHeaderProps) {
  return (
    <div className="px-5 py-4 border-b border-line-2 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[11px] text-muted uppercase tracking-[0.08em] mb-1">{eyebrow}</div>
        )}
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        {subtitle && (
          <div className="text-[12.5px] text-muted mt-0.5">{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}
