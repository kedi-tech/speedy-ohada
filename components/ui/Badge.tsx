import React from 'react';

type BadgeVariant =
  | 'draft' | 'notStarted' | 'inProgress' | 'in-progress'
  | 'completed' | 'ready' | 'approved'
  | 'warning' | 'blocked' | 'critical'
  | 'locked' | 'info' | 'passed'
  | 'auto' | 'manual' | 'unmapped' | 'conflict' | 'needsReview'
  | 'exported';

interface BadgeProps {
  status: BadgeVariant | string;
  label: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_CLASSES: Record<string, string> = {
  draft:       'bg-bg-2 text-muted border-line',
  notStarted:  'bg-bg-2 text-muted border-line',
  inProgress:  'bg-rust-tint text-rust-2 border-rust-soft',
  'in-progress': 'bg-rust-tint text-rust-2 border-rust-soft',
  completed:   'bg-green-soft text-green border-green-soft',
  ready:       'bg-green-soft text-green border-green-soft',
  approved:    'bg-green-soft text-green border-green-soft',
  exported:    'bg-green-soft text-green border-green-soft',
  warning:     'bg-amber-soft text-amber border-amber-soft',
  blocked:     'bg-red-soft text-red border-red-soft',
  critical:    'bg-red-soft text-red border-red-soft',
  locked:      'bg-blue-soft text-blue border-blue-soft',
  info:        'bg-blue-soft text-blue border-blue-soft',
  passed:      'bg-green-soft text-green border-green-soft',
  auto:        'bg-blue-soft text-blue border-blue-soft',
  manual:      'bg-purple-soft text-purple border-purple-soft',
  unmapped:    'bg-red-soft text-red border-red-soft',
  conflict:    'bg-amber-soft text-amber border-amber-soft',
  needsReview: 'bg-amber-soft text-amber border-amber-soft',
};

const DOT_CLASSES: Record<string, string> = {
  draft:       'bg-muted',
  notStarted:  'bg-muted',
  inProgress:  'bg-rust-2',
  'in-progress': 'bg-rust-2',
  completed:   'bg-green',
  ready:       'bg-green',
  approved:    'bg-green',
  exported:    'bg-green',
  warning:     'bg-amber',
  blocked:     'bg-red',
  critical:    'bg-red',
  locked:      'bg-blue',
  info:        'bg-blue',
  passed:      'bg-green',
  auto:        'bg-blue',
  manual:      'bg-purple',
  unmapped:    'bg-red',
  conflict:    'bg-amber',
  needsReview: 'bg-amber',
};

export function Badge({ status, label, dot, size = 'md', className = '' }: BadgeProps) {
  const colorClass = BADGE_CLASSES[status] ?? BADGE_CLASSES.draft;
  const dotColor = DOT_CLASSES[status] ?? DOT_CLASSES.draft;
  const sizeClass = size === 'sm' ? 'text-[11px] px-[7px] py-[2px]' : 'text-[11.5px] px-[9px] py-[3px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full leading-[1.4] whitespace-nowrap ${colorClass} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
    </span>
  );
}
