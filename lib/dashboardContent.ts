// lib/dashboardContent.ts
//
// Content for the logged-in dashboard homepage (components/home/HomeAuthed.tsx).
// Everything here is PLACEHOLDER data pending real backend support:
//   - XP / level / streak      -> no gamification tables yet (H2-03)
//   - trend direction (up/down) -> now real, see SeriesCardData.rank_trend (H2-01)
//   - recent activity feed     -> now real, see RecentActivityCard's own
//                                  GET /me/activity fetch (H2-04)
// Mirrors the isReal-gated, mock-fills-the-rest pattern used elsewhere in
// this app (see HeroCarousel slides, MOCK_TRENDING in mockCatalogData.ts).
//
// Note: the "How are you feeling?" mood row now imports MOCK_MOODS
// directly from lib/landingContent.ts (same list the landing page's
// BrowseByMoodGrid uses) rather than keeping a separate list here --
// used to have its own DASHBOARD_MOODS with a 6th "Exciting" mood the
// landing page didn't have, which was an inconsistency, not a feature.

// Badges cycle onto the "Continue Watching" row in this order (renamed
// from "Continue Discovering" -- see H1-02), real series first (see
// HomeAuthed) then mock fills the rest -- same real-first-then-mock
// pattern as the old Trending row.
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