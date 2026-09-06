'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import ConfirmDialog from '../components/shared/ConfirmDialog';

interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
  // 'danger' (rose, the default) for anything destructive -- covers most
  // call sites (delete, ban, reject). 'neutral' (the brand gradient) for
  // actions that are reversible/low-stakes but still worth a beat before
  // committing, e.g. removing something from Curator Picks.
  tone?: 'danger' | 'neutral';
}

interface PendingConfirm extends Required<ConfirmOptions> {
  message: string;
}

interface ConfirmDialogContextValue {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    setPending({
      message,
      confirmLabel: options?.confirmLabel ?? 'Confirm',
      cancelLabel: options?.cancelLabel ?? 'Cancel',
      tone: options?.tone ?? 'danger',
    });
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    setPending(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={pending !== null}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Confirm'}
        cancelLabel={pending?.cancelLabel ?? 'Cancel'}
        tone={pending?.tone ?? 'danger'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmDialogContext.Provider>
  );
}

// Every place that used to `window.confirm('...')` now calls
// `await useConfirmDialog().confirm('...')` instead -- see
// CollectionsAuthed, and the admin series/users/curator-picks/reviews/
// genres/candidates/tags/collections pages, plus the public collection
// detail page.
export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return ctx;
}
