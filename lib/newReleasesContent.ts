// lib/newReleasesContent.ts
//
// Content for the logged-in New Releases page
// (components/new-releases/NewReleasesAuthed.tsx).
//
// There's no release_date column on `series` yet, so mockDaysAgoFor() is a
// deterministic seeded assignment (same series id -> same "days ago",
// consistent across reloads, not random). "Just Released" / "This Week" /
// "This Month" filtering on this page is REAL filtering, it just runs on
// this mock date instead of a real one. Ratings shown alongside it are
// real (average_rating from GET /series, see P1-04), not mock.
//
// "Upcoming Releases" is different in kind, not just mock-vs-real: these
// are series that don't exist in the catalog at all yet (nothing to link
// to), so MOCK_UPCOMING is fully curated placeholder content, not a
// stand-in for a real field on a real row. Replace both once a real
// release_date / release_schedule table exists.

import { Sparkles, CalendarDays, CalendarRange, Clock } from 'lucide-react';

export const RELEASE_FILTERS = [
  { key: 'all', label: 'All New', icon: Sparkles },
  { key: 'week', label: 'This Week', icon: CalendarDays },
  { key: 'month', label: 'This Month', icon: CalendarRange },
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
];

function seededFraction(seed: number): number {
  const x = Math.sin(seed * 91387 + 7) * 10000;
  return x - Math.floor(x);
}

/** Deterministic "days ago" (0-59) release offset for a given series id. */
export function mockDaysAgoFor(id: number): number {
  return Math.floor(seededFraction(id) * 60);
}

export function formatMockReleaseDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
