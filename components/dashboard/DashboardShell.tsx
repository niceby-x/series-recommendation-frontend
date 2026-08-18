'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const COLLAPSE_STORAGE_KEY = 'dashboard-sidebar-collapsed';

function loadCollapsedPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Mirrors components/admin/AdminShell.tsx -- same rounded floating-card
// frame AND the same sticky top bar treatment, applied here to the 7
// pages that already render their own full sidebar + header (HomeAuthed,
// DiscoverAuthed, MoodsAuthed, TropesAuthed, CollectionsAuthed,
// NewReleasesAuthed, and app/settings/page.tsx -- see Navbar.tsx's own
// DASHBOARD_ROUTES list, which already documents this exact set of pages
// as the ones with their own sidebar). Pages outside that set (my-list,
// community, series/[id], about) intentionally have no sidebar today and
// aren't touched by this.
//
// `header` (each page's own <DashboardHeader title=... subtitle=... />)
// used to be the first thing rendered inside {children}, which put it
// inside <main>'s overflow-y-auto scroll container -- so it scrolled away
// with the rest of the page instead of staying put, unlike AdminShell's
// top bar. Hoisting it into its own prop, rendered as a flex sibling
// above <main> (same as AdminShell), fixes that: it was never part of the
// scrolling content to begin with, so there's nothing to keep "stuck" via
// position: sticky -- it just isn't in the scroll container in the first
// place. Same glassy treatment (translucent blur + soft shadow) as
// AdminShell's bar, for the same reason: it's a bar floating above
// content, not an overlay directly on top of scrolling content, but reads
// as elevated/frosted against the card's own background either way.
// `relative z-30` on that bar: backdrop-blur-md already forces it into
// its own stacking context (backdrop-filter does that regardless of
// z-index), but with z-index left at auto that context was still only
// z:0 -- the same "weight" as a `position: sticky` descendant elsewhere
// on the page (sticky elements always get their own stacking context
// too, per spec). BloomJourneyCard's `xl:sticky` aside on the homepage
// is exactly that, and being later in the DOM than this bar, it was
// winning the paint order and covering the account/notification
// dropdowns. Explicit z-30 (still well under AuthModal's z-[100]) settles
// that regardless of DOM order.
// py-2.5 matches AdminShell's dashboard-page bar exactly (not the
// py-3 used by AdminShell's non-dashboard pages) -- DashboardHeader
// renders on every one of these 7 pages, same as AdminHeader only renders
// on /admin, so the dashboard-bar height is the correct one to mirror
// everywhere here. DashboardHeader's own title/subtitle text sizes were
// sized down to match AdminHeader's (18px/20px title, 12px subtitle) for
// the same reason -- see DashboardHeader.tsx.
//
// The desktop collapse state (and the toggle button that flips it) also
// moved here from DashboardSidebar's own header row, mirroring the same
// move on AdminShell/AdminSidebar -- it's owned here since it now drives
// both the sidebar's width AND the button rendered beside `header` below,
// rather than living only inside the sidebar itself.
export default function DashboardShell({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-[#FED9E8] p-2.5 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[20px] md:rounded-[26px] border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)]">
        <DashboardSidebar collapsed={collapsed} />
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {header && (
            <div className="relative z-30 flex items-center gap-3 px-5 md:px-8 lg:px-10 py-2.5 border-b border-border/40 shrink-0 bg-background/70 backdrop-blur-md shadow-[0_4px_12px_-6px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                className="hidden lg:flex items-center justify-center size-8 rounded-full text-foreground/50 hover:text-primary hover:bg-muted transition-colors shrink-0"
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </button>
              {header}
            </div>
          )}
          <main className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
