'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

interface SessionContextValue {
  user: User | null;
  session: Session | null;
  checkingSession: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// Q2-04: RatingForm, WatchlistButton, and ProgressTracker each independently
// called supabase.auth.getSession() -- once on mount and again inside every
// write handler -- 8 calls total across the three components on a single
// series-detail page load. This provider fetches the session once and keeps
// it current via onAuthStateChange (which fires on sign-in, sign-out, and
// token refresh), so the three widgets can read from context instead of
// hitting the Supabase client themselves.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ user: session?.user ?? null, session, checkingSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
