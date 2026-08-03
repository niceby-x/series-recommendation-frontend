'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import AuthModal from '../components/shared/AuthModal';

type AuthModalMode = 'login' | 'register';

interface AuthModalContextValue {
  open: (mode?: AuthModalMode) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>('login');

  const open = useCallback((initialMode: AuthModalMode = 'login') => {
    setMode(initialMode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ open, close }}>
      {children}
      <AuthModal isOpen={isOpen} initialMode={mode} onClose={close} />
    </AuthModalContext.Provider>
  );
}

// Every place that used to <Link href="/login"> now calls useAuthModal().open()
// instead -- see Navbar, WatchlistButton, RatingForm, my-list, admin/candidates.
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}