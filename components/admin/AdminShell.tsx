'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminAccountMenu from './AdminAccountMenu';
import AdminHeader from './AdminHeader';

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
  // The dashboard (/admin) gets its full greeting/search/account row here
  // instead of just the account menu every other admin page gets --
  // AdminHeader already renders AdminAccountMenu itself at the end of its
  // row, so there's still only one account control either way. This strip
  // sits above the scrollable <main> below for every route, which is what
  // makes it "sticky": it was never part of the scrolling content to begin
  // with, on the dashboard same as everywhere else, so it stays put while
  // the stat cards/queue table scroll underneath it instead of scrolling
  // away with them the way AdminHeader used to when the page rendered it
  // inline as page content.
  const pathname = usePathname();
  const isDashboard = pathname === '/admin';

  return (
    <div className="min-h-screen bg-[#FED9E8] p-2.5 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[20px] md:rounded-[26px] border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)]">
        <AdminSidebar pendingCount={pendingCount} />
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <div
            className={
              'flex items-center px-5 md:px-8 lg:px-10 border-b border-border/60 shrink-0 ' +
              (isDashboard ? 'justify-between py-2.5' : 'justify-end py-3')
            }
          >
            {isDashboard ? <AdminHeader email={email} /> : <AdminAccountMenu email={email} />}
          </div>
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
