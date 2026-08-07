// lib/curatorPicks.ts
//
// Shape of a row from GET /curator-picks (see backend src/index.ts's
// fetchCuratorPicksJoined). Consumed by app/page.tsx (server fetch) and
// mapped into the existing CuratorPick shape (lib/landingContent.ts) that
// LandingCuratorsPicks/DashboardCuratorsPicks already render, so neither
// of those components needed to change.

import type { CuratorPick } from './landingContent';

export interface RealCuratorPick {
  id: number;
  pick_id: number;
  title: string;
  country: string;
  mediaType: 'Series';
  year: number;
  rating: number | null;
  tags: string[];
  imageUrl: string | null;
  isFeature: boolean;
  blurb: string | null;
}

// rating from the backend is a real average on the same /10 scale
// `ratings.score` uses everywhere else -- but lib/landingContent.ts's
// CuratorPick (and every sibling mock entry in this file, e.g.
// CURATOR_FEATURE's rating: 4.6) is on a /5 scale, matching the single-
// star-icon display LandingCuratorsPicks/DashboardCuratorsPicks use.
// Converting here keeps that consistent instead of a real curator pick
// suddenly showing an out-of-place "8.2★" next to picks reading "4.6★".
// Falls back to a fixed, plausible /5 value (matching the hardcoded
// ratings HomeLanding.tsx's other real-but-unrated rows already use)
// rather than 0.0 for a series with no ratings yet.
export function toCuratorPick(pick: RealCuratorPick): CuratorPick {
  return {
    id: pick.id,
    title: pick.title,
    country: pick.country,
    mediaType: pick.mediaType,
    year: pick.year,
    rating: pick.rating !== null ? pick.rating / 2 : 4.6,
    tags: pick.tags,
    imageUrl: pick.imageUrl,
  };
}
