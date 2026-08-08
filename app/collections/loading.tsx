// Route-level skeleton for /collections (P3-03). Mirrors the curated +
// personal collection grids in CollectionsAuthed (see
// components/collections/CollectionsAuthed.tsx).

import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return <CardGridSkeleton count={4} gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-5" />;
}
