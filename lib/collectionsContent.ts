// lib/collectionsContent.ts
//
// Now only used by CollectionsLanding.tsx (the logged-out preview) and its
// static PreviewCard -- CollectionsAuthed moved to real data from
// /collections (see components/collections/CollectionsAuthed.tsx). MORE_COLLECTIONS,
// OVERVIEW_STATS, and RECENT_UPDATES below are unused now that the authed
// page computes its own real equivalents; left in place only as the source
// for MY_COLLECTIONS, which the landing preview still reads.

import {
  LayoutGrid,
  Heart,
  CheckCircle2,
  PlayCircle,
  Bookmark,
  Ban,
  GraduationCap,
  Sparkles,
  Flame,
  Droplet,
  RotateCcw,
  Star,
  Zap,
  Gem,
  type LucideIcon,
} from 'lucide-react';

export interface CollectionFilter {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const COLLECTION_FILTERS: CollectionFilter[] = [
  { key: 'all', label: 'All Collections', icon: LayoutGrid },
  { key: 'mine', label: 'My Collections', icon: Heart },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'ongoing', label: 'Ongoing', icon: PlayCircle },
  { key: 'plan_to_watch', label: 'Plan to Watch', icon: Bookmark },
  { key: 'dropped', label: 'Dropped', icon: Ban },
];

export type CollectionStatus = 'completed' | 'ongoing' | 'plan_to_watch' | 'dropped';

export interface Collection {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  seriesCount: number;
  updatedAgo: string;
  progressPct: number;
  status: CollectionStatus;
  imageUrl: string | null;
}

// The 4 featured collections (bigger cards, with progress bars).
export const MY_COLLECTIONS: Collection[] = [
  { key: 'all-time-favorites', icon: Heart, title: 'All Time Favorites', description: 'My ultimate favorite series that I can watch again and again.', seriesCount: 18, updatedAgo: '2d ago', progressPct: 82, status: 'ongoing', imageUrl: null },
  { key: 'school-days', icon: GraduationCap, title: 'School Days', description: 'Sweet school romance stories that melt my heart.', seriesCount: 12, updatedAgo: '5d ago', progressPct: 67, status: 'ongoing', imageUrl: null },
  { key: 'healing-series', icon: Sparkles, title: 'Healing Series', description: 'Series that healed me on my worst days.', seriesCount: 9, updatedAgo: '1w ago', progressPct: 100, status: 'completed', imageUrl: null },
  { key: 'weekend-watchlist', icon: Bookmark, title: 'Weekend Watchlist', description: 'Perfect series for my weekend binge-watching.', seriesCount: 15, updatedAgo: '3d ago', progressPct: 53, status: 'ongoing', imageUrl: null },
];

// The 6 smaller "More Collections" cards.
export const MORE_COLLECTIONS: Collection[] = [
  { key: 'binge-worthy', icon: Flame, title: 'Binge-Worthy', description: "Can't stop watching!", seriesCount: 21, updatedAgo: '1w ago', progressPct: 74, status: 'ongoing', imageUrl: null },
  { key: 'dramatic-feels', icon: Droplet, title: 'Dramatic Feels', description: 'For stories that make me cry (in a good way).', seriesCount: 14, updatedAgo: '6d ago', progressPct: 40, status: 'plan_to_watch', imageUrl: null },
  { key: 'rewatch-list', icon: RotateCcw, title: 'Rewatch List', description: 'Series I want to watch again.', seriesCount: 11, updatedAgo: '2w ago', progressPct: 100, status: 'completed', imageUrl: null },
  { key: 'thai-classics', icon: Star, title: 'Thai Classics', description: 'Timeless BL series worth remembering.', seriesCount: 16, updatedAgo: '3w ago', progressPct: 100, status: 'completed', imageUrl: null },
  { key: 'short-and-sweet', icon: Zap, title: 'Short & Sweet', description: 'Short series with big impact.', seriesCount: 8, updatedAgo: '5d ago', progressPct: 25, status: 'plan_to_watch', imageUrl: null },
  { key: 'underrated-gems', icon: Gem, title: 'Underrated Gems', description: 'Hidden gems that deserve more love.', seriesCount: 10, updatedAgo: '3w ago', progressPct: 15, status: 'dropped', imageUrl: null },
];

export const ALL_COLLECTIONS: Collection[] = [...MY_COLLECTIONS, ...MORE_COLLECTIONS];

// Right rail: "Collection Overview" -- placeholder until a real
// `collections` table + watch-time tracking exist.
export const COLLECTION_OVERVIEW = {
  totalCollections: 12,
  seriesInCollections: 149,
  completionRatePct: 78,
  totalWatchHours: 230,
};

// Right rail: "Recently Updated" list, ordered as shown in the mockup.
export const RECENTLY_UPDATED_KEYS = ['all-time-favorites', 'weekend-watchlist', 'healing-series', 'school-days', 'binge-worthy'];
