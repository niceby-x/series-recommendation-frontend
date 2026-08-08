// Route-level skeleton for /tropes (P3-03). Mirrors TropesAuthed's grid
// shape (see components/tropes/TropesAuthed.tsx).

import { CardGridSkeleton } from '../../components/shared/PageSkeleton';

export default function Loading() {
  return <CardGridSkeleton count={8} gridClassName="grid grid-cols-2 md:grid-cols-4 gap-5" />;
}
