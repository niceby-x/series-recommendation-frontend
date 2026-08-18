'use client';

import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useAuthModal } from '../../lib/AuthModalContext';
import DashboardShell from '../../components/dashboard/DashboardShell';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

// Minimal placeholder Settings destination (see H4-04) -- a real page to
// point the new sidebar entry at, not just a dead link. Houses the one
// setting that's actually real today: dark mode, using the same
// lazy-initializer + document.documentElement class-toggle pattern as
// DashboardHeader.tsx's profile-dropdown toggle (dark mode isn't wired
// through a shared theme context anywhere, just a DOM class, so this is
// an independent copy rather than shared state -- the two toggles won't
// stay in sync if both are open at once, a pre-existing limitation of
// that approach, not something new here). The dropdown keeps its own
// toggle too, for quick access without leaving the current page.
export default function SettingsPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [darkMode, setDarkMode] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  }

  if (checkingSession) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-muted-foreground">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            Sign in
          </button>{' '}
          to manage your settings.
        </p>
      </main>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader title="Settings" subtitle="Manage your BLumi experience." />}>
      <div className="w-full max-w-[720px]">

          <section className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5 mb-6">
            <h2 className="font-heading text-[16px] font-normal text-foreground mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center size-9 rounded-full bg-muted text-foreground/70 shrink-0">
                  <Moon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Dark mode</p>
                  <p className="text-muted-foreground text-[12.5px]">Switch between light and dark themes.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                className={
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ' +
                  (darkMode ? 'bg-brand-gradient' : 'bg-muted-foreground/30')
                }
              >
                <span
                  className={
                    'inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ' +
                    (darkMode ? 'translate-x-[18px]' : 'translate-x-1')
                  }
                />
              </button>
            </div>
          </section>

          <section className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5 opacity-60">
            <h2 className="font-heading text-[16px] font-normal text-foreground mb-1">More settings</h2>
            <p className="text-muted-foreground text-[13px]">
              Notifications, privacy, and account preferences are on the way.
            </p>
          </section>
      </div>
    </DashboardShell>
  );
}
