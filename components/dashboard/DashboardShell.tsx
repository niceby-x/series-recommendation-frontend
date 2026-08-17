'use client';

import DashboardSidebar from './DashboardSidebar';

// Mirrors components/admin/AdminShell.tsx -- same rounded floating-card
// frame, applied here to the 7 pages that already render their own full
// sidebar + header (HomeAuthed, DiscoverAuthed, MoodsAuthed, TropesAuthed,
// CollectionsAuthed, NewReleasesAuthed, and app/settings/page.tsx -- see
// Navbar.tsx's own DASHBOARD_ROUTES list, which already documents this
// exact set of pages as the ones with their own sidebar). Pages outside
// that set (my-list, community, series/[id], about) intentionally have no
// sidebar today and aren't touched by this.
//
// Each of the 7 pages still renders its own <DashboardHeader> inside
// {children} (title/subtitle differ per page), so this shell only owns
// the sidebar and the card frame around everything.
//
// Unlike AdminShell, there's no session data this needs to fetch --
// DashboardSidebar's own bottom-of-nav account control was removed as a
// straight duplicate of DashboardHeader's existing profile dropdown
// (which already has real Account/Settings/Log out), so this stays a
// plain layout wrapper with nothing to fetch.
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 p-2.5 md:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.25rem)] md:h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[20px] md:rounded-[26px] border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.16)]">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
