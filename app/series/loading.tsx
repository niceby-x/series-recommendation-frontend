// Route-level skeleton for /series (P3-03). Mirrors the sidebar + card-grid
// shape both DiscoverLanding and DiscoverAuthed use (see
// components/discover/DiscoverAuthed.tsx) so the swap-in doesn't jump.

import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return (
    <CardGridSkeleton count={9} gridClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" />
  );
}
