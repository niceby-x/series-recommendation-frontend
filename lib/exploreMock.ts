// lib/exploreMock.ts
//
// The /series API doesn't return genres (they live in a separate
// series_genres join table that isn't wired into that endpoint yet) or
// real ratings (the `ratings` table has ~zero rows). Genre browsing and
// star ratings on the Explore page are cosmetic until that's true —
// everything here is deterministic (same series id always gets the same
// genre/rating) so it's at least consistent across reloads, not random.
//
// TODO(backend): once GET /series joins series_genres -> genres and the
// ratings table has real aggregate data, replace every call site of
// mockGenresFor / mockRatingFor with the real fields and delete this file.

import {
  Heart,
  GraduationCap,
  Sparkles,
  Drama as DramaIcon,
  Smile,
  Swords,
  Search,
  Leaf,
  type LucideIcon,
} from 'lucide-react';

export interface GenreMeta {
  key: string;
  label: string;
  icon: LucideIcon;
  mockCount: number;
}

export const GENRES: GenreMeta[] = [
  { key: 'romance', label: 'Romance', icon: Heart, mockCount: 1245 },
  { key: 'school', label: 'School', icon: GraduationCap, mockCount: 892 },
  { key: 'fantasy', label: 'Fantasy', icon: Sparkles, mockCount: 432 },
  { key: 'drama', label: 'Drama', icon: DramaIcon, mockCount: 1523 },
  { key: 'comedy', label: 'Comedy', icon: Smile, mockCount: 673 },
  { key: 'action', label: 'Action', icon: Swords, mockCount: 312 },
  { key: 'mystery', label: 'Mystery', icon: Search, mockCount: 208 },
  { key: 'slice_of_life', label: 'Slice of Life', icon: Leaf, mockCount: 554 },
];

function seededFraction(seed: number): number {
  const x = Math.sin(seed * 99991 + 1) * 10000;
  return x - Math.floor(x);
}

/** Deterministic 1-2 genre keys for a given series id. */
export function mockGenresFor(id: number): string[] {
  const first = Math.floor(seededFraction(id) * GENRES.length);
  const second = Math.floor(seededFraction(id + 7) * GENRES.length);
  const keys = [GENRES[first].key];
  if (second !== first) keys.push(GENRES[second].key);
  return keys;
}

export function mockGenreLabelsFor(id: number): string[] {
  const keys = mockGenresFor(id);
  return keys.map((k) => GENRES.find((g) => g.key === k)?.label ?? k);
}

/** Deterministic "average rating" in the 7.5-9.5 range, one decimal. */
export function mockRatingFor(id: number): number {
  return Math.round((7.5 + seededFraction(id) * 2) * 10) / 10;
}
