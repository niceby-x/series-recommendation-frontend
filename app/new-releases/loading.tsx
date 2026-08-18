// Route-level skeleton for /new-releases. Was previously missing entirely
// -- new-releases is structurally the same "own DashboardShell, card-grid
// content" category as series/moods/tropes/collections (see
// components/dashboard/DashboardShell.tsx's list of the 7 pages that use
// it), but had no dedicated loading.tsx, so it fell back to the generic
// root spinner while its siblings all got a matching grid skeleton.
//
// Reuses the same CardGridSkeleton building block as those siblings, with
// gridClassName matching NewReleasesAuthed's actual "This Week" /
// "New This Month" grid (grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6)
// and withSidebar on to mirror its trending/calendar sidebar column. This
// intentionally doesn't attempt to mimic the hero carousel or calendar
// strip above the grid -- same tradeoff the other three skeletons already
// make (approximate shape, not a pixel-perfect clone).
import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return <CardGridSkeleton count={8} gridClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" />;
}
