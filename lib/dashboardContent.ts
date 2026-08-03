// lib/dashboardContent.ts
//
// Content for the logged-in dashboard homepage (components/home/HomeAuthed.tsx).
// Everything here is PLACEHOLDER data pending real backend support:
//   - XP / level / streak      -> no gamification tables yet
//   - trend direction (up/down) -> no historical ranking snapshots yet
//   - recent activity feed     -> no activity/events table yet
// Mirrors the isReal-gated, mock-fills-the-rest pattern used elsewhere in
// this app (see HeroCarousel slides, MOCK_TRENDING in mockCatalogData.ts).

import { Coffee, Flower2, Heart, CloudRain, Moon, Sparkles, type LucideIcon } from 'lucide-react';

export interface DashboardMood {
  name: string;
  count: number;
  gradient: string;
  image: string | null;
  icon: LucideIcon;
}

// Deliberately a separate list from lib/landingContent.ts's MOCK_MOODS —
// same underlying art/counts for the first five (kept in sync by hand),
// plus a sixth "Exciting" mood the landing page's grid doesn't have.
// Duplicated on purpose so editing the dashboard's mood row never
// reshapes the logged-out landing page's 6-tile grid.
export const DASHBOARD_MOODS: DashboardMood[] = [
  { name: 'Cozy', count: 128, gradient: 'from-[#FBE0C7] to-[#F7B6C8]/50', image: '/images/moods/cozy.png', icon: Coffee },
  { name: 'Healing', count: 186, gradient: 'from-[#E3D9F9] to-brand-lilac/50', image: '/images/moods/healing.png', icon: Flower2 },
  { name: 'Heartwarming', count: 243, gradient: 'from-[#F9D6DE] to-brand-blush/60', image: '/images/moods/heartwarming.png', icon: Heart },
  { name: 'Angsty', count: 153, gradient: 'from-[#DCD6E3] to-[#C7BFD4]/60', image: '/images/moods/angsty.png', icon: CloudRain },
  { name: 'Melancholic', count: 107, gradient: 'from-[#CFC7E8] to-[#8E7FB8]/60', image: '/images/moods/melancholic.png', icon: Moon },
  { name: 'Exciting', count: 98, gradient: 'from-[#FBEFC7] to-brand-blush/45', image: null, icon: Sparkles },
];

// Badges cycle onto the "Continue Discovering" row in this order, real
// series first (see HomeAuthed) then mock fills the rest -- same
// real-first-then-mock pattern as the old Trending row.
export const CONTINUE_DISCOVERING_BADGES = ['Continue', 'New Episode', 'Trending', 'Top Rated', 'Just Added'];

// Bloom Journey (right-rail gamification card) -- placeholder until a real
// XP system exists. Level thresholds/labels are illustrative.
export const MOCK_BLOOM_JOURNEY = {
  level: 12,
  label: 'Curious Bloom',
  xp: 620,
  xpToNext: 900,
};

// This Week's Journey (7-day discovery streak). `completed: true` days
// render filled; today gets a ring even if not yet completed.
export const MOCK_WEEKLY_JOURNEY = {
  completedCount: 5,
  goal: 7,
  days: [
    { label: 'M', completed: true },
    { label: 'T', completed: true },
    { label: 'W', completed: true },
    { label: 'T', completed: true, isToday: true },
    { label: 'F', completed: true },
    { label: 'S', completed: false },
    { label: 'S', completed: false },
  ],
};

export interface RecentActivityItem {
  id: string;
  text: string;
  target: string;
  timeAgo: string;
  kind: 'watchlist' | 'rating' | 'progress';
}

export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: 'a1', kind: 'watchlist', text: 'You added', target: 'The Handmaiden to Watchlist', timeAgo: '2m ago' },
  { id: 'a2', kind: 'rating', text: 'You rated', target: 'Cherry Magic 4.5 stars', timeAgo: '1h ago' },
  { id: 'a3', kind: 'progress', text: 'You finished', target: 'episode 7 of Step by Step', timeAgo: '5h ago' },
];
