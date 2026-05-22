'use client';

import { useEffect, useRef } from 'react';
import { Icons } from '@/components/ui/Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 520 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,15,0.45)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative bg-paper border border-line rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{ width, maxWidth: '100%' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-2 flex-shrink-0">
          <div className="text-[14px] font-semibold text-ink">{title}</div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <Icons.x />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
