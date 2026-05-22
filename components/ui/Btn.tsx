import React from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet';
type BtnSize = 'sm' | 'md';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary:   'bg-rust text-white border-rust hover:bg-rust-2 hover:border-rust-2',
  secondary: 'bg-paper text-ink border-line hover:bg-bg',
  ghost:     'bg-transparent text-ink-2 border-transparent hover:bg-bg-2',
  danger:    'bg-paper text-red border-line hover:bg-red-soft',
  quiet:     'bg-bg-2 text-ink-2 border-transparent hover:bg-bg',
};

const SIZE_CLASSES: Record<BtnSize, string> = {
  sm: 'text-[12.5px] px-[10px] py-[6px] gap-1.5',
  md: 'text-[13px] px-[14px] py-2 gap-2',
};

export function Btn({
  variant = 'ghost',
  size = 'md',
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center font-medium border rounded-lg
        transition-all duration-[120ms] whitespace-nowrap cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        active:translate-y-px
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
