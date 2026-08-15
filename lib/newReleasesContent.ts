// lib/newReleasesContent.ts
//
// Content for the logged-in New Releases page
// (components/new-releases/NewReleasesAuthed.tsx).
//
// G1-01: release_date is now a real column on `series` (see the backend's
// migrations/010_series_release_date.sql) -- "Just Released" / "This
// Week" / "This Month" filtering and sorting all happen server-side now
// (GET /series's sort=newest_release and release_date_min/
// release_date_max), replacing the old client-side mockDaysAgoFor hash
// that ran over the full unpaginated catalog. Ratings shown alongside it
// are, as before, real (average_rating from GET /series, see P1-04).
//
// "Upcoming Releases" is still different in kind: these are series that
// don't exist in the catalog at all yet (nothing to link to), so
// MOCK_UPCOMING remains fully curated placeholder content, not a stand-in
// for a real field on a real row -- unlike release_date, there's no
// column to add for a series that hasn't been added yet. Replace once a
// real release_schedule (or similar upcoming-titles) table exists.

import { Sparkles, CalendarDays, CalendarRange, Clock } from 'lucide-react';

export const RELEASE_FILTERS = [
  { key: 'all', label: 'All New', icon: Sparkles },
  { key: 'week', label: 'This Week', icon: CalendarDays },
  { key: 'month', label: 'This Month', icon: CalendarRange },
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
];

/** ISO 'YYYY-MM-DD' for `daysAgo` days before today -- matches the format
 * the backend's release_date column and release_date_min/max filters use
 * (see the backend's src/scripts/backfill-release-date.ts). */
export function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function formatReleaseDate(releaseDate: string | null | undefined): string {
  if (!releaseDate) return 'Recently released';
  // release_date is a plain YYYY-MM-DD date column (no time/zone
  // component) -- parsed as UTC-midnight and formatted with a UTC
  // timeZone so the displayed day never shifts based on the viewer's
  // local offset.
  const d = new Date(releaseDate + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export interface UpcomingRelease {
  key: string;
  title: string;
  country: string;
  imageUrl: string | null;
  releaseDate: string; // display string, e.g. "May 18, 2024"
  daysUntil: number;
}

// Curated placeholders -- see file header. imageUrl is intentionally null
// (no real art exists for a series that isn't in the catalog yet), same
// convention as CURATOR_FEATURE/CURATOR_LIST in lib/landingContent.ts.
export const MOCK_UPCOMING: UpcomingRelease[] = [
  { key: 'up-1', title: 'Falling Slowly', country: 'Thailand', imageUrl: null, releaseDate: 'May 18', daysUntil: 3 },
  { key: 'up-2', title: 'Between Us', country: 'Thailand', imageUrl: null, releaseDate: 'May 20', daysUntil: 5 },
  { key: 'up-3', title: 'Hidden Agenda', country: 'Thailand', imageUrl: null, releaseDate: 'May 25', daysUntil: 10 },
  { key: 'up-4', title: 'Our Time', country: 'Thailand', imageUrl: null, releaseDate: 'May 28', daysUntil: 13 },
];
