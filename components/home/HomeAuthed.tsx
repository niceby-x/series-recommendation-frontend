import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Heart, Leaf } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import type { SeriesCardData } from '../shared/SeriesCard';
import TrendingCard from './TrendingCard';
import TrendingStatsBar from './TrendingStatsBar';
import HeroCarousel, { type CarouselSlide } from './HeroCarousel';
import CategoryNav from './CategoryNav';
import ContinueJourneyRow from './ContinueJourneyRow';
import PetalDecoration from './PetalDecoration';
import {
  MOCK_TRENDING,
  REAL_TRENDING_OVERRIDES,
  PLACEHOLDER_GENRE_TAGS,
} from '../../lib/mockCatalogData';

const STATUS_LABELS: Record<string, string> = {
  airing: 'On Air',
  completed: 'Completed',
  upcoming: 'Coming Soon',
};

// MOCK — fills the carousel when the live catalog doesn't have enough titles yet
// (currently 1 approved series). These slides are visually identical to real ones
// but never link anywhere (isReal: false). Delete entries here as the real
// approved catalog grows past what's needed to fill the carousel.
const MOCK_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'mock-1',
    title: 'The Heart\u2019s Bloom',
    imageUrl: null,
    badge: 'Editor\u2019s Pick',
    statusLabel: 'On Air',
    meta: 'Episode 7 \u00b7 Every Saturday',
    tags: ['Romance', 'Slow Burn', 'University'],
    isReal: false,
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// The logged-in homepage. Data is fetched once in app/page.tsx and passed
// down (shared with LandingPage) rather than fetched again here.
export default function HomeAuthed({ allSeries }: { allSeries: SeriesCardData[] }) {
  const surprisePick = allSeries.length > 0 ? pickRandom(allSeries) : null;

  const realSlides: CarouselSlide[] = allSeries.slice(0, 4).map((s) => ({
    id: s.id,
    title: s.title,
    // Backdrops (landscape) look right in this 16:9 card; poster_url (portrait)
    // is only a fallback for series the backdrop backfill hasn't reached yet —
    // see src/backfill-backdrops.ts in the backend repo.
    imageUrl: s.backdrop_url ?? s.poster_url,
    badge: 'Editor\u2019s Pick',
    statusLabel: STATUS_LABELS[s.status] ?? s.status,
    meta: s.year + ' \u00b7 ' + s.country + ' \u00b7 ' + s.episode_count + ' episodes',
    tags: PLACEHOLDER_GENRE_TAGS, // see note above — real genre join not wired up yet
    isReal: true,
  }));
  const carouselSlides = realSlides.length > 0 ? realSlides : MOCK_CAROUSEL_SLIDES;

  const realTrendingCount = Math.min(allSeries.length, 7);
  const trendingReal = allSeries.slice(0, realTrendingCount);
  const trendingMock = MOCK_TRENDING.slice(0, 7 - realTrendingCount);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/35 via-background to-brand-lilac/35" />
        <PetalDecoration />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-10 md:py-14 grid md:grid-cols-[1fr_1.15fr] gap-10 items-center">
          <div>
            <h1 className="font-heading text-[36px] md:text-[48px] leading-[1.1] font-normal mb-4">
              <span className="text-foreground">Where Stories</span>
              <br />
              <span className="text-primary">Bloom.</span>
            </h1>
            <p className="text-muted-foreground text-[18px] font-normal mb-5 max-w-md">
              Discover your next favorite BL series, movies, and anime — handpicked with love.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <Link
                href="/series"
                className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[16px] font-semibold px-7 py-3 rounded-full shadow-sm hover:opacity-90 transition-opacity"
              >
                Explore Now
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={'/series/' + (surprisePick ? surprisePick.id : '')}
                className="inline-flex items-center gap-2 border border-border bg-card text-[16px] font-semibold px-7 py-3 rounded-full text-foreground hover:bg-muted transition-colors"
              >
                <FlowerIcon className="size-4" /> Surprise Me
              </Link>
            </div>

            {/* MOCK social proof — replace with a real user count once BLumi has one worth showing */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#F7B6C8', '#C8B6F9', '#5E4B6B', '#F0DCE4'].map((color, i) => (
                  <span
                    key={i}
                    className="size-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Loved by <span className="font-semibold text-foreground">12,842+</span> BL fans{' '}
                <Heart className="size-3.5 text-primary" fill="currentColor" />
              </p>
            </div>
          </div>

          <HeroCarousel slides={carouselSlides} />
        </div>

        {/* Category quick-nav — inside the hero wrapper so it shares the same
            gradient/petal background, no visible seam between the two */}
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pb-10">
          <CategoryNav />
        </div>
      </div>

      {/* Trending This Week */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-8">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-orange-100 to-brand-blush/40 text-orange-500 shrink-0">
              <Flame className="size-5" strokeWidth={2} fill="currentColor" />
            </span>
            <div>
              <h2 className="font-heading text-[28px] md:text-[32px] leading-tight font-normal text-foreground flex items-center gap-2">
                Trending This Week
                <Sparkles className="size-5 text-brand-lilac" />
              </h2>
              <p className="text-muted-foreground text-[14px]">The titles everyone&apos;s watching right now</p>
            </div>
          </div>
          <Link
            href="/series"
            className="group inline-flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
          >
            View All
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {(() => {
          const trendingList = [
            ...trendingReal.map((series, i) => {
              const override = REAL_TRENDING_OVERRIDES[series.title];
              return {
                series,
                rank: i + 1,
                rating: override?.rating ?? null,
                genres: override?.genres ?? PLACEHOLDER_GENRE_TAGS,
              };
            }),
            ...trendingMock.map((series, i) => ({
              series,
              rank: trendingReal.length + i + 1,
              rating: series.mockRating,
              genres: series.mockGenres,
            })),
          ];
          const featured = trendingList.slice(0, 3);
          const compact = trendingList.slice(3, 7);

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featured.map(({ series, rank, rating, genres }) => (
                  <TrendingCard key={series.id} series={series} rank={rank} rating={rating} genres={genres} variant="featured" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                {compact.map(({ series, rank, rating, genres }) => (
                  <TrendingCard key={series.id} series={series} rank={rank} rating={rating} genres={genres} variant="compact" />
                ))}
              </div>
            </>
          );
        })()}

        <TrendingStatsBar />
      </div>

      {(() => {
        // Mock episode progress — there's no per-episode watch-progress table yet
        // (see ContinueJourneyRow.tsx note), so this just gives the "continue
        // watching" cards plausible-looking numbers to display.
        const MOCK_PROGRESS = [5, 2, 8];
        const usedIds = new Set<number>();
        const continueItems = [];

        for (const series of allSeries) {
          if (continueItems.length >= 3) break;
          usedIds.add(series.id);
          continueItems.push({
            id: series.id,
            title: series.title,
            image_url: series.backdrop_url ?? series.poster_url,
            currentEpisode: Math.min(MOCK_PROGRESS[continueItems.length], series.episode_count),
            totalEpisodes: series.episode_count,
          });
        }
        for (const series of MOCK_TRENDING) {
          if (continueItems.length >= 3) break;
          if (usedIds.has(series.id)) continue;
          usedIds.add(series.id);
          continueItems.push({
            id: series.id,
            title: series.title,
            image_url: series.backdrop_url ?? series.poster_url,
            currentEpisode: Math.min(MOCK_PROGRESS[continueItems.length], series.episode_count),
            totalEpisodes: series.episode_count,
          });
        }

        const watchNextSeries =
          MOCK_TRENDING.find((series) => !usedIds.has(series.id)) ?? MOCK_TRENDING[MOCK_TRENDING.length - 1];
        const watchNext = {
          id: watchNextSeries.id,
          title: watchNextSeries.title,
          image_url: watchNextSeries.backdrop_url ?? watchNextSeries.poster_url,
          episode_count: watchNextSeries.episode_count,
        };

        return (
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-8 pb-20">
            <h2 className="font-heading text-[32px] font-normal text-foreground mb-6 flex items-center gap-2">
              <Leaf className="size-6 text-primary" /> Continue Your Journey
            </h2>
            <ContinueJourneyRow items={continueItems} watchNext={watchNext} />
          </div>
        );
      })()}
    </main>
  );
}