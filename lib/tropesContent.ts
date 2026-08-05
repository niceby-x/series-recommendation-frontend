// lib/tropesContent.ts
//
// Content for the Tropes page (components/tropes/TropesAuthed.tsx). Same
// PLACEHOLDER pattern as lib/moodsContent.ts: trope tagging isn't a real
// column on `series` yet (series_tags exists per AGENTS.md, but isn't
// exposed publicly), so counts/percentages/trend figures here are
// illustrative, not queried. imageUrl stays null throughout -- honest
// gradient+icon fallback, never a guessed photo, same convention as every
// other mock card in this app.

import {
  LayoutGrid,
  Heart,
  GraduationCap,
  Crown,
  Users,
  Moon,
  Sparkles,
  Drama as DramaIcon,
  Smile,
  Swords,
  Search,
  Leaf,
  type LucideIcon,
} from 'lucide-react';

export interface TropeFilter {
  key: string;
  label: string;
  icon: LucideIcon;
}

// First five ship as always-visible chips (mirrors the mockup); everything
// else lives behind "More" so the row doesn't grow unbounded as tropes are
// added.
export const TROPE_FILTERS: TropeFilter[] = [
  { key: 'all', label: 'All Tropes', icon: LayoutGrid },
  { key: 'romance', label: 'Romance', icon: Heart },
  { key: 'school', label: 'School', icon: GraduationCap },
  { key: 'fantasy', label: 'Fantasy', icon: Sparkles },
  { key: 'drama', label: 'Drama', icon: DramaIcon },
  { key: 'comedy', label: 'Comedy', icon: Smile },
];

export const MORE_TROPE_FILTERS: TropeFilter[] = [
  { key: 'action', label: 'Action', icon: Swords },
  { key: 'mystery', label: 'Mystery', icon: Search },
  { key: 'slice_of_life', label: 'Slice of Life', icon: Leaf },
];

export interface PopularTrope {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  seriesCount: number;
}

export const POPULAR_TROPES: PopularTrope[] = [
  { key: 'enemies-to-lovers', icon: Heart, title: 'Enemies to Lovers', description: 'The classic tension that turns into something beautiful.', seriesCount: 128 },
  { key: 'school-romance', icon: GraduationCap, title: 'School Romance', description: 'Sweet, awkward, and unforgettable high school love.', seriesCount: 95 },
  { key: 'royalty-mafia', icon: Crown, title: 'Royalty / Mafia', description: 'Power, status, and love that defies the rules.', seriesCount: 76 },
  { key: 'friends-to-lovers', icon: Users, title: 'Friends to Lovers', description: 'From best friends to soulmates.', seriesCount: 102 },
  { key: 'forbidden-love', icon: Moon, title: 'Forbidden Love', description: "Love that's not supposed to happen.", seriesCount: 89 },
];

export interface TropeCategory {
  key: string;
  icon: LucideIcon;
  label: string;
  seriesCount: number;
}

// Reuses the same 8 genre keys as lib/exploreMock.ts's GENRES (Discover
// page's genre filter) so "Romance" here and "Romance" there never drift
// into two different taxonomies.
export const BROWSE_CATEGORIES: TropeCategory[] = [
  { key: 'romance', icon: Heart, label: 'Romance', seriesCount: 156 },
  { key: 'school', icon: GraduationCap, label: 'School', seriesCount: 112 },
  { key: 'comedy', icon: Smile, label: 'Comedy', seriesCount: 88 },
  { key: 'drama', icon: DramaIcon, label: 'Drama', seriesCount: 134 },
  { key: 'fantasy', icon: Sparkles, label: 'Fantasy', seriesCount: 67 },
  { key: 'slice_of_life', icon: Leaf, label: 'Slice of Life', seriesCount: 93 },
  { key: 'action', icon: Swords, label: 'Action', seriesCount: 45 },
  { key: 'mystery', icon: Search, label: 'Mystery', seriesCount: 38 },
];

export interface NewTrope {
  key: string;
  title: string;
  seriesCount: number;
}

export const NEW_TROPES: NewTrope[] = [
  { key: 'fake-dating', title: 'Fake Dating', seriesCount: 32 },
  { key: 'second-chance', title: 'Second Chance', seriesCount: 28 },
  { key: 'slow-burn', title: 'Slow Burn', seriesCount: 41 },
  { key: 'one-bed', title: 'One Bed', seriesCount: 26 },
  { key: 'time-travel', title: 'Time Travel', seriesCount: 19 },
];

export interface RankedTrope {
  key: string;
  icon: LucideIcon;
  label: string;
  pct: number;
}

// Right rail: "Your Top Tropes" -- placeholder until real per-user trope
// affinity is tracked (no series_tags exposure yet, same as elsewhere in
// this file).
export const YOUR_TOP_TROPES: RankedTrope[] = [
  { key: 'enemies-to-lovers', icon: Heart, label: 'Enemies to Lovers', pct: 38 },
  { key: 'friends-to-lovers', icon: Users, label: 'Friends to Lovers', pct: 24 },
  { key: 'school-romance', icon: GraduationCap, label: 'School Romance', pct: 18 },
  { key: 'forbidden-love', icon: Moon, label: 'Forbidden Love', pct: 12 },
  { key: 'royalty-mafia', icon: Crown, label: 'Royalty / Mafia', pct: 8 },
];

export interface TrendingTrope {
  key: string;
  icon: LucideIcon;
  label: string;
  changePct: number;
}

// Right rail: "Trending Tropes" -- placeholder until real trend snapshots
// exist (no historical ranking data yet, same caveat as TRENDS in
// HomeAuthed/TopRatedSeriesCard).
export const TRENDING_TROPES: TrendingTrope[] = [
  { key: 'enemies-to-lovers', icon: Heart, label: 'Enemies to Lovers', changePct: 15 },
  { key: 'fake-dating', icon: Users, label: 'Fake Dating', changePct: 12 },
  { key: 'second-chance', icon: Search, label: 'Second Chance', changePct: 9 },
  { key: 'one-bed', icon: Moon, label: 'One Bed', changePct: 7 },
  { key: 'slow-burn', icon: DramaIcon, label: 'Slow Burn', changePct: 6 },
];
