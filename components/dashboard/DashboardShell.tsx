'use client';

import DashboardSidebar from './DashboardSidebar';

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
// py-2.5 matches AdminShell's dashboard-page bar exactly (not the
// py-3 used by AdminShell's non-dashboard pages) -- DashboardHeader
// renders on every one of these 7 pages, same as AdminHeader only renders
// on /admin, so the dashboard-bar height is the correct one to mirror
// everywhere here. DashboardHeader's own title/subtitle text sizes were
// sized down to match AdminHeader's (18px/20px title, 12px subtitle) for
// the same reason -- see DashboardHeader.tsx.
export default function DashboardShell({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FED9E8] p-2.5 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[20px] md:rounded-[26px] border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)]">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {header && (
            <div className="flex items-center px-5 md:px-8 lg:px-10 py-2.5 border-b border-border/40 shrink-0 bg-background/70 backdrop-blur-md shadow-[0_4px_12px_-6px_rgba(0,0,0,0.12)]">
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
