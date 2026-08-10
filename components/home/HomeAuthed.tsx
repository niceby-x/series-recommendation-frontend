import Link from 'next/link';
import type { SeriesCardData } from '../shared/SeriesCard';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import MoodFeelingRow from './MoodFeelingRow';
import DashboardDiscoverRow, { type DashboardDiscoverCard } from './DashboardDiscoverRow';
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
// discovering, curator's picks) with a gamified right rail (Bloom Journey,
// weekly streak, trending list, recent activity). Data is fetched once in
// app/page.tsx and passed down (shared with LandingPage) rather than
// fetched again here; real catalog rows always come first, with mock rows
// filling any remaining slots -- same convention as the old hero carousel
// and trending row used.
export default function HomeAuthed({
  allSeries,
  curatorPicks: realCuratorPicksData,
}: {
  allSeries: SeriesCardData[];
  curatorPicks: RealCuratorPick[];
}) {
  // Continue Watching: real series first, mock titles fill the rest,
  // badges cycle in a fixed order so the row always reads Continue / New
  // Episode / Trending / Top Rated / Just Added left to right.
  const realDiscoverCards: DashboardDiscoverCard[] = allSeries.slice(0, 5).map((s, i) => ({
    id: s.id,
    title: s.title,
    country: s.country,
    mediaType: 'Series',
    rating: displayRatingFor(s),
    badge: CONTINUE_DISCOVERING_BADGES[i],
    imageUrl: s.backdrop_url ?? s.poster_url,
    progress: i === 0 ? 0.4 : undefined,
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
    progress: realDiscoverCards.length === 0 && i === 0 ? 0.4 : undefined,
    isReal: false,
  }));
  const discoverCards = [...realDiscoverCards, ...mockDiscoverCards];

  // Trending sidebar (right rail): same real-first-then-mock blend as the
  // old homepage's big Trending row, just condensed to a top-5 list with a
  // placeholder trend arrow (no historical ranking snapshots yet).
  const TRENDS: TrendingSidebarItem['trend'][] = ['up', 'down', 'up', 'up', 'flat'];
  const realTrendingCount = Math.min(allSeries.length, 5);
  const trendingItems: TrendingSidebarItem[] = [
    ...allSeries.slice(0, realTrendingCount).map((s, i) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      mediaType: 'Series',
      rating: displayRatingFor(s),
      imageUrl: s.backdrop_url ?? s.poster_url,
      trend: TRENDS[i],
      isReal: true,
    })),
    ...MOCK_TRENDING.slice(0, 5 - realTrendingCount).map((s, i) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      mediaType: 'Series',
      rating: s.mockRating,
      imageUrl: s.backdrop_url ?? s.poster_url,
      trend: TRENDS[realTrendingCount + i],
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
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
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

              <DashboardCuratorsPicks feature={curatorFeature} synopsis={curatorFeatureSynopsis} list={curatorListItems} />
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <BloomJourneyCard />
              <WeeklyJourneyCard />
              <TrendingSidebarCard items={trendingItems} />
              <RecentActivityCard />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}