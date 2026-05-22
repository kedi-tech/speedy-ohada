import React from 'react';

interface ProgressProps {
  value: number;
  height?: number;
  color?: string;
  label?: string;
}

export function Progress({ value, height = 6, color = 'var(--color-rust)', label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1.5 text-[12px] text-muted">
          <span>{label}</span>
          <span className="font-semibold text-ink">{value}%</span>
        </div>
      )}
      <div
        className="bg-bg-2 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-[350ms] ease-out"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  );
}
