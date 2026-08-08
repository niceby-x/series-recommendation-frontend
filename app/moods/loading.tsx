// Route-level skeleton for /moods (P3-03). Mirrors MoodsAuthed's grid shape
// (see components/moods/MoodsAuthed.tsx).

import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return <CardGridSkeleton count={8} gridClassName="grid grid-cols-2 lg:grid-cols-4 gap-5" />;
}
