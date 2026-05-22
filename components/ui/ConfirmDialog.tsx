'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** If set, the user must type this exact string to enable the confirm button */
  requireTyped?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  requireTyped,
  loading = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');

  const canConfirm = requireTyped ? typed === requireTyped : true;

  const handleConfirm = async () => {
    if (!canConfirm || loading) return;
    await onConfirm();
    setTyped('');
  };

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} width={460}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          <div className={`w-9 h-9 rounded-full grid place-items-center flex-shrink-0 ${danger ? 'bg-red/10 text-red' : 'bg-amber/10 text-amber'}`}>
            <Icons.alert />
          </div>
          <p className="text-[13px] text-ink-2 leading-relaxed">{description}</p>
        </div>

        {requireTyped && (
          <div>
            <label className="block text-[12px] font-semibold text-muted mb-1.5">
              Type <span className="font-mono text-ink bg-bg-2 px-1 py-0.5 rounded">{requireTyped}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyped}
              className="w-full px-3 py-2.5 border border-line rounded-lg text-[13px] text-ink bg-bg focus:outline-none focus:border-red transition-colors"
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-1">
          <Btn variant="ghost" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Btn>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? 'bg-red text-white hover:bg-red/90'
                : 'bg-amber text-white hover:bg-amber/90'
            }`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
