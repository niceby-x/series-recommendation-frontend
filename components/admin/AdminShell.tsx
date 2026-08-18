'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminAccountMenu from './AdminAccountMenu';
import AdminHeader from './AdminHeader';

const COLLAPSE_STORAGE_KEY = 'admin-sidebar-collapsed';

function loadCollapsedPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

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
  // Desktop-only collapse state, now owned here instead of AdminSidebar --
  // it drives both the sidebar's own width AND the toggle button below,
  // which moved into this top bar (beside the heading) instead of living
  // inside the sidebar's own header row. Starts false (matching the
  // server's render, since there's no window there) and is only updated
  // to the saved preference in an effect after mount, for the same
  // hydration-safety reason this pattern always has: reading localStorage
  // during the lazy useState initializer would return different values on
  // the server (always false) vs. a client with a saved '1' preference
  // (true), producing a hydration mismatch on the sidebar's width/
  // className.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (loadCollapsedPref()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Private browsing / storage quota -- the toggle still works for
        // this session, it just won't persist across visits.
      }
      return next;
    });
  }

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
        <AdminSidebar pendingCount={pendingCount} collapsed={collapsed} />
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {/* Glassy treatment: translucent bg-background/70 + backdrop-blur-md
              instead of a flat bg-background, softened border-border/40
              instead of /60, plus a soft downward shadow so the bar reads
              as floating above the content rather than flush with it. This
              bar is a flex sibling above <main>, not an overlay on top of
              it, so there's no scrolling content directly behind it to
              blur -- the blur/opacity/shadow combo still reads as a
              frosted, elevated panel against the card's own background
              either way. True "content blurs as it scrolls under the bar"
              would need the bar repositioned as a sticky/absolute overlay
              inside the same scroll container as <main>, which touches how
              every admin page beneath it is laid out -- a bigger change
              than this pass, flag it if that's actually what's wanted. */}
          <div
            className={
              'flex items-center gap-3 px-5 md:px-8 lg:px-10 justify-between border-b border-border/40 shrink-0 bg-background/70 backdrop-blur-md shadow-[0_4px_12px_-6px_rgba(0,0,0,0.12)] ' +
              (isDashboard ? 'py-2.5' : 'py-3')
            }
          >
            {/* The desktop collapse toggle, moved here from inside
                AdminSidebar's own header row -- always the leftmost
                element in this bar, on every admin page, not just the
                dashboard. On the dashboard it sits right beside
                AdminHeader's title (which fills the remaining width as a
                flex-1 sibling); on every other admin page there's no
                heading in this bar at all (each page renders its own
                further down, inside the scrollable area), so it just
                keeps the same left-edge spot rather than jumping to a
                different corner depending on the route. */}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
              className="hidden lg:flex items-center justify-center size-8 rounded-full text-foreground/50 hover:text-primary hover:bg-muted transition-colors shrink-0"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
            {isDashboard ? <AdminHeader email={email} /> : <AdminAccountMenu email={email} />}
          </div>
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
