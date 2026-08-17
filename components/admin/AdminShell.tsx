'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';

// Rendered once by app/admin/layout.tsx, wrapping every /admin/* route --
// previously each of the ~12 admin page files duplicated its own
// `<div className="flex min-h-screen bg-background"><AdminSidebar />...`
// wrapper. Centralizing it here means the sidebar (and the floating-card
// frame around the whole panel) render exactly once per navigation
// instead of being torn down and rebuilt by every page, and there's one
// place to fetch the pending-count badge instead of eleven.
//
// This has to be a Client Component: AdminSidebar needs usePathname() for
// active-link highlighting, and the pending count needs an access token
// that only exists in the browser's Supabase session (same client-only
// session pattern every other admin page already uses -- see G2-02 for
// the known tradeoff there, which this doesn't change one way or the
// other).
function useAdminSession(): { pendingCount: number; email: string | null } {
  const [pendingCount, setPendingCount] = useState(0);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session || cancelled) return;
        setEmail(session.user?.email ?? null);

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', {
          headers: { Authorization: 'Bearer ' + session.access_token },
          cache: 'no-store',
        });
        if (!res.ok || cancelled) return;

        const json = await res.json();
        if (!cancelled) setPendingCount(json.pending || 0);
      } catch {
        // Sidebar badge/email just stay at their defaults -- a stale/
        // missing count or email on the sidebar chrome isn't worth
        // surfacing an error for; each page's own data load still runs
        // and shows its own real error state if something's actually wrong.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { pendingCount, email };
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { pendingCount, email } = useAdminSession();

  return (
    <div className="min-h-screen bg-muted/40 p-2.5 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[20px] md:rounded-[26px] border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)]">
        <AdminSidebar pendingCount={pendingCount} email={email} />
        <main className="flex-1 min-w-0 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
