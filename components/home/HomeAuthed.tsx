import Link from 'next/link';
import type { SeriesCardData } from '../shared/SeriesCard';
import DashboardShell from '../dashboard/DashboardShell';
import DashboardHeader from '../dashboard/DashboardHeader';
import MoodFeelingRow from './MoodFeelingRow';
import DashboardDiscoverRow, { type DashboardDiscoverCard } from './DashboardDiscoverRow';
import MadeForYouRow from './MadeForYouRow';
import DashboardCuratorsPicks from './DashboardCuratorsPicks';
import BloomJourneyCard from './BloomJourneyCard';
import WeeklyJourneyCard from './WeeklyJourneyCard';
import TrendingSidebarCard, { type TrendingSidebarItem } from '../dashboard/TrendingSidebarCard';
import RecentActivityCard from './RecentActivityCard';
import {
  MOCK_TRENDING,
  displayRatingFor,
  displayGenresFor,
} from '../../lib/mockCatalogData';
import {
  MOCK_CONTINUE_DISCOVERING,
  CURATOR_FEATURE,
  CURATOR_LIST,
  type CuratorPick,
} from '../../lib/landingContent';
import { CONTINUE_DISCOVERING_BADGES } from '../../lib/dashboardContent';
import { toCuratorPick, type RealCuratorPick } from '../../lib/curatorPicks';

const CURATOR_FEATURE_SYNOPSIS =
  'A nobleman falls for a handmaiden hired to deceive him — until their plan unfolds into something neither expected.';

// The logged-in homepage -- a sidebar dashboard (mood picker, continue
// discovering, made for you, curator's picks, trending) with a gamified
// right rail (Bloom Journey, weekly streak, recent activity). Data is
// fetched once in app/page.tsx and passed down (shared with LandingPage)
// rather than fetched again here; real catalog rows always come first,
// with mock rows filling any remaining slots -- same convention as the
// old hero carousel and trending row used. Trending moved from the right
// rail into the main flow (see H4-03) -- a content-discovery module
// doesn't belong competing for space with account/progress widgets. Made
// For You (see H3-01) owns its own fetch/empty-state and isn't part of
// that real-first-then-mock blend -- it's a first-person "for you"
// signal, so it has nothing to show (an honest prompt instead) rather
// than a mock fallback when the backend doesn't have enough signal yet.
export default function HomeAuthed({
  allSeries,
  curatorPicks: realCuratorPicksData,
}: {
  allSeries: SeriesCardData[];
  curatorPicks: RealCuratorPick[];
}) {
  // Continue Watching: real series first, mock titles fill the rest,
  // badges cycle in a fixed order so the row always reads Continue / New
  // Episode / Trending / Top Rated / Just Added left to right. Per-episode
  // progress (see H2-02) is fetched and matched onto real cards inside
  // DashboardDiscoverRow itself, since it's per-user data that needs the
  // Supabase session -- not something this server component has.
  const realDiscoverCards: DashboardDiscoverCard[] = allSeries.slice(0, 5).map((s, i) => ({
    id: s.id,
    title: s.title,
    country: s.country,
    mediaType: 'Series',
    rating: displayRatingFor(s),
    badge: CONTINUE_DISCOVERING_BADGES[i],
    imageUrl: s.backdrop_url ?? s.poster_url,
    isReal: true,
  }));
  const mockDiscoverCards: DashboardDiscoverCard[] = MOCK_CONTINUE_DISCOVERING.slice(
    0,
    5 - realDiscoverCards.length
  ).map((c, i) => ({
    id: c.id,
    title: c.title,
    country: c.country,
    mediaType: c.mediaType,
    rating: c.rating,
    badge: CONTINUE_DISCOVERING_BADGES[realDiscoverCards.length + i],
    imageUrl: c.imageUrl,
    isReal: false,
  }));
  const discoverCards = [...realDiscoverCards, ...mockDiscoverCards];

  // Trending sidebar (right rail): same real-first-then-mock blend as the
  // old homepage's big Trending row, condensed to a top-5 list. Trend
  // direction and rank now come from GET /series (see H2-01 -- backed by
  // a real week-over-week rank-snapshot job), not a hardcoded array.
  // Sorted by rank (nulls last) so the list order actually matches what
  // the arrows are claiming.
  const rankedSeries = [...allSeries].sort((a, b) => {
    if (a.rank == null && b.rank == null) return 0;
    if (a.rank == null) return 1;
    if (b.rank == null) return -1;
    return a.rank - b.rank;
  });
  const realTrendingCount = Math.min(rankedSeries.length, 5);
  const trendingItems: TrendingSidebarItem[] = [
    ...rankedSeries.slice(0, realTrendingCount).map((s) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      mediaType: 'Series',
      rating: displayRatingFor(s),
      imageUrl: s.backdrop_url ?? s.poster_url,
      trend: s.rank_trend,
      isReal: true,
    })),
    // Mock fallback rows have no real ranking snapshot behind them, so
    // trend is left as null (unknown) rather than a fabricated arrow.
    ...MOCK_TRENDING.slice(0, 5 - realTrendingCount).map((s) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      mediaType: 'Series',
      rating: s.mockRating,
      imageUrl: s.backdrop_url ?? s.poster_url,
      trend: null,
      isReal: false,
    })),
  ];

  // Curator's Picks now comes from real admin-curated data (see
  // lib/curatorPicks.ts / app/admin/curator-picks/page.tsx) instead of an
  // arbitrary slice of the catalog with hardcoded fallback ratings/tags.
  // Falls back to allSeries-derived picks, then the fully-mock
  // CURATOR_FEATURE/CURATOR_LIST, if fewer than 4 admin picks exist yet --
  // same real-first-then-mock convention as Continue Watching above.
  const realCuratorPicks: CuratorPick[] = realCuratorPicksData.map(toCuratorPick);
  const realCuratorCount = Math.max(0, 4 - realCuratorPicks.length);
  const fallbackCuratorPicks: CuratorPick[] = allSeries.slice(0, realCuratorCount).map((s) => ({
    id: s.id,
    title: s.title,
    country: s.country,
    mediaType: 'Series',
    year: s.year,
    rating: displayRatingFor(s) ?? 4.5,
    tags: displayGenresFor(s),
    imageUrl: s.backdrop_url ?? s.poster_url,
  }));
  const mockCuratorFill = [CURATOR_FEATURE, ...CURATOR_LIST].slice(
    0,
    Math.max(0, 4 - realCuratorPicks.length - fallbackCuratorPicks.length)
  );
  const combinedCuratorPicks = [...realCuratorPicks, ...fallbackCuratorPicks, ...mockCuratorFill];
  const curatorFeature = combinedCuratorPicks[0];
  const curatorListItems = combinedCuratorPicks.slice(1);
  const featureBlurb = realCuratorPicksData.find((p) => p.isFeature)?.blurb;
  const curatorFeatureSynopsis =
    featureBlurb ||
    (realCuratorPicks.length > 0 || fallbackCuratorPicks.length > 0
      ? allSeries[0]?.synopsis?.trim() || 'A story worth discovering.'
      : CURATOR_FEATURE_SYNOPSIS);

  return (
    <DashboardShell>
      <div className="w-full max-w-[1400px]">
        <DashboardHeader />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <MoodFeelingRow />

              <section className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="font-heading text-[22px] font-normal text-foreground">Continue Watching</h2>
                  <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
                    Browse all
                  </Link>
                </div>
                <DashboardDiscoverRow cards={discoverCards} />
              </section>

              <MadeForYouRow />

              <section className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="font-heading text-[22px] font-normal text-foreground">Trending This Week</h2>
                  <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
                    See full ranking
                  </Link>
                </div>
                <TrendingSidebarCard items={trendingItems} variant="row" />
              </section>

              <DashboardCuratorsPicks feature={curatorFeature} synopsis={curatorFeatureSynopsis} list={curatorListItems} />
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <BloomJourneyCard />
              <WeeklyJourneyCard />
              <RecentActivityCard />
            </aside>
          </div>
      </div>
    </DashboardShell>
  );
}