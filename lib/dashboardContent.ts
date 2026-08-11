// lib/dashboardContent.ts
//
// Content for the logged-in dashboard homepage (components/home/HomeAuthed.tsx).
// Everything here is PLACEHOLDER data pending real backend support:
//   - XP / level / streak      -> real for BloomJourneyCard/WeeklyJourneyCard,
//                                  which fetch GET /me/gamification directly
//                                  (H2-03). MOCK_BLOOM_JOURNEY below is now
//                                  ONLY used by DashboardHeader.tsx's profile
//                                  dropdown label -- see that export's own
//                                  note for why it's still here.
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

// Bloom Journey level label -- BloomJourneyCard itself now fetches the
// real value from GET /me/gamification (see H2-03), but
// DashboardHeader.tsx's profile dropdown still shows this mock label next
// to the user's name and wasn't in H2-03's file list, so it's left as-is
// here for now rather than silently going stale/undefined. Worth a
// follow-up task to point DashboardHeader.tsx at the real label too.
export const MOCK_BLOOM_JOURNEY = {
  level: 12,
  label: 'Curious Bloom',
  xp: 620,
  xpToNext: 900,
};