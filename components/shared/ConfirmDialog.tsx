'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  message,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Escape to close, lock page scroll while open -- same as AuthModal.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm bg-card rounded-xl shadow-2xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <span
            className={
              'flex items-center justify-center size-9 rounded-full shrink-0 ' +
              (tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-muted text-foreground/70')
            }
          >
            <AlertTriangle className="size-4.5" />
          </span>
          <div className="pt-1">
            <h2 className="font-heading text-[17px] font-normal text-foreground mb-1">Are you sure?</h2>
            <p className="text-muted-foreground text-[13.5px] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-[13.5px] font-semibold text-foreground border border-border hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={
              'px-4 py-2 rounded-full text-[13.5px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity ' +
              (tone === 'danger' ? 'bg-rose-600' : 'bg-brand-gradient')
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
