// Route-level skeleton for /my-list. Was previously missing -- my-list is
// a Server Component that awaits getServerSession() and a /watchlist
// fetch (see app/my-list/page.tsx's own comment: that refactor removed
// the old client-side "checkingSession" flash, but the server-side await
// itself still suspends the segment for its duration), so it was falling
// back to the generic root spinner instead of a grid skeleton like the
// other card-grid routes get.
//
// my-list has no sidebar shell (it's intentionally outside DashboardShell
// -- see DashboardShell.tsx's own comment listing my-list as one of the
// pages without one), so withSidebar is off here, and the grid matches
// the real page's grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.
import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return (
    <CardGridSkeleton
      count={6}
      gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      withSidebar={false}
    />
  );
}
