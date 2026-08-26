'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Sparkles, Search, ArrowRight } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import Image from 'next/image';
import Link from 'next/link';
import type { SeriesCardData } from '../shared/SeriesCard';
import { useSeriesSearch, SEARCH_MIN_QUERY_LENGTH } from '../../lib/useSeriesSearch';
import SeriesSearchResults from '../shared/SeriesSearchResults';
import LandingPosterStage from './LandingPosterStage';
import LandingStatsBar from './LandingStatsBar';
import ContinueDiscoveringRow from './ContinueDiscoveringRow';
import BrowseByMoodGrid from '../shared/BrowseByMoodGrid';
import PopularTropesRow from './PopularTropesRow';
import CuratorsPicks from './LandingCuratorsPicks';
import HowItWorks from './HowItWorks';
import LandingCTA from './LandingCTA';
import LandingFooter from './LandingFooter';
import ScrollReveal from '../shared/ScrollReveal';
import BloomLayers from './BloomLayers';
import {
  MOCK_MOODS,
  MOCK_TROPES,
  MOCK_CONTINUE_DISCOVERING,
  CURATOR_FEATURE,
  CURATOR_FEATURE_QUOTE,
  CURATOR_LIST,
  HERO_DECK_FALLBACK,
  type DiscoverCard,
  type HeroFeature,
  type CuratorPick,
} from '../../lib/landingContent';
import { toCuratorPick, type RealCuratorPick } from '../../lib/curatorPicks';

// Home's logged-out branch. Named/located to match the XLanding.tsx
// convention every other page (Moods/Tropes/Collections/New Releases)
// follows -- this predates that convention (it's the original landing
// page), moved here for consistency. Its own sub-components keep their
// original file names (LandingHero.tsx etc.) since renaming every single
// one wasn't necessary for the folder-level consistency goal.
export default function HomeLanding({
  allSeries,
  curatorPicks,
}: {
  allSeries: SeriesCardData[];
  curatorPicks: RealCuratorPick[];
}) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const { query: search, setQuery: setSearch, results: liveResults, loading: liveLoading, reset: resetSearch } =
    useSeriesSearch();

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim();
    setSearchFocused(false);
    router.push(trimmed ? '/series?q=' + encodeURIComponent(trimmed) : '/series');
  }

  function handleLiveResultSelect() {
    setSearchFocused(false);
    resetSearch();
  }

  const realHeroCards: HeroFeature[] = allSeries.slice(0, 7).map((series) => ({
    id: series.id,
    title: series.title,
    country: series.country,
    year: series.year,
    rating: 4.8,
    tags: ['Slow Burn', 'Healing', 'Hopeful'],
    imageUrl: series.poster_url ?? series.backdrop_url
  }));
  const heroDeck: HeroFeature[] = [
    ...realHeroCards,
    ...HERO_DECK_FALLBACK.slice(0, Math.max(0, 7 - realHeroCards.length)),
  ].slice(0, 7);

  // Rotates through the same badge vocabulary the mock cards use, so real
  // catalog cards get visual variety instead of all reading "Editor's
  // Pick". Cosmetic only -- doesn't reflect an actual trending/rating
  // signal from the backend yet.
  const DISCOVER_BADGE_ROTATION = ['Trending', 'Top Rated', 'Must Watch', 'New Episode', 'Movie', 'Anime'];

  const realDiscoverCards: DiscoverCard[] = allSeries.slice(0, 6).map((series, i) => ({
    id: series.id,
    title: series.title,
    country: series.country,
    mediaType: 'Series',
    year: series.year,
    rating: 4.5,
    badge: DISCOVER_BADGE_ROTATION[i % DISCOVER_BADGE_ROTATION.length],
    tags: ['Romance', 'Drama'],
    imageUrl: series.poster_url ?? series.backdrop_url,
    isReal: true,
  }));
  const discoverCards = [
    ...realDiscoverCards,
    ...MOCK_CONTINUE_DISCOVERING.slice(0, Math.max(0, 6 - realDiscoverCards.length)),
  ];

  // Curator's Picks now comes from real admin-curated data (see
  // lib/curatorPicks.ts / app/admin/curator-picks/page.tsx) instead of an
  // arbitrary slice of the catalog with hardcoded fake tags/rating. Falls
  // back to the mock feature/list below only if no admin has picked
  // anything yet, same real-first-then-mock convention as everywhere else
  // on this page.
  const realFeaturePick = curatorPicks.find((p) => p.isFeature);
  const realListPicks = curatorPicks.filter((p) => !p.isFeature);

  const curatorFeature: CuratorPick = realFeaturePick ? toCuratorPick(realFeaturePick) : CURATOR_FEATURE;
  const curatorQuote = realFeaturePick?.blurb || CURATOR_FEATURE_QUOTE;
  const curatorList: CuratorPick[] = [
    ...realListPicks.slice(0, 3).map(toCuratorPick),
    ...CURATOR_LIST.slice(0, Math.max(0, 3 - realListPicks.length)),
  ];

  return (
    <main className="min-h-screen bg-background">
      <LandingPosterStage deck={heroDeck} />

      {/* Was a separate LandingHero component; inlined here since it was
          only ever rendered from this one spot. The eyebrow, headline,
          subhead, and trust badges all live in LandingPosterStage's own
          header overlay -- it renders the full hero copy on top of its 3D
          scene, so this section doesn't repeat any of it. What's left is
          the one thing that overlay can't hold: a real, working search
          entry point, rendered as the light landing pad right where the
          3D stage's floor fades out. See LandingPosterStage's background
          gradient, which ends on this section's own start color. */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FDF1F6] via-[#FBEAF8] to-[#F1E3FB] pt-10 md:pt-14 pb-14 md:pb-18">
        <div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(247,182,200,0.55), transparent 70%)' }}
          aria-hidden
        />
        <div
          className="absolute -top-10 -right-20 w-72 h-72 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,182,249,0.5), transparent 70%)' }}
          aria-hidden
        />

        <div className="relative max-w-2xl mx-auto px-6 md:px-10">
          {/* Floating search pill -- functionally real, wired to the same
              debounced /series?q= search every other header on the site uses
              (see lib/useSeriesSearch.ts), not a decorative mockup input. */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/85 backdrop-blur-md border border-white/70 rounded-full shadow-[0_20px_50px_rgba(107,63,117,0.16)] p-2 pl-2.5">
            <Link
              href="/moods"
              className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-brand-mauve/10 shrink-0 group/vibe"
            >
              <span className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-brand-blush/60 to-brand-lilac/60 shrink-0">
                <Sparkles className="size-4 text-brand-purple-vivid" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[12.5px] font-semibold text-brand-mauve group-hover/vibe:text-brand-pink-vivid transition-colors">
                  Not sure what to read?
                </span>
                <span className="block text-[10.5px] text-foreground/45">Tell us your vibe and we&rsquo;ll find a match.</span>
              </span>
            </Link>

            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Search stories, tropes, moods..."
                  aria-label="Search stories, tropes, or moods"
                  className="w-full bg-transparent text-brand-mauve placeholder:text-foreground/35 text-[13.5px] pl-3 pr-9 py-2.5 focus:outline-none"
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-foreground/35 pointer-events-none" />

                {searchFocused && search.trim().length >= SEARCH_MIN_QUERY_LENGTH && (
                  <SeriesSearchResults query={search.trim()} loading={liveLoading} results={liveResults} onSelect={handleLiveResultSelect} />
                )}
              </div>

              <button
                type="submit"
                aria-label="Search"
                className="inline-flex items-center justify-center size-9 sm:size-10 rounded-full bg-brand-gradient text-white shrink-0 hover:opacity-90 transition-opacity"
              >
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-background">
        {/* Stats bar + Curator's Picks */}
        <div className="relative overflow-hidden">
          <Image
            src="/continue-discovering-bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top pointer-events-none -z-10"
          />
          <div className="absolute inset-0 bg-background/40 -z-10" aria-hidden="true" />

          <LandingStatsBar seriesCount={allSeries.length} curatorPicksCount={curatorPicks.length} />

          <section className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-10 pb-14">
            <ScrollReveal>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display italic text-2xl font-normal text-foreground flex items-center gap-2">
                    <FlowerIcon className="size-5 text-primary" /> Curator&apos;s Picks
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Handpicked favorites from our editors.</p>
                </div>
                <Link href="/series" className="flex items-center gap-0.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity mt-1 shrink-0">
                  View all picks <ChevronRight className="size-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <CuratorsPicks feature={curatorFeature} quote={curatorQuote} list={curatorList} />
            </ScrollReveal>
          </section>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pb-14 space-y-14">
          <section>
            <ScrollReveal>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display italic text-2xl font-normal text-foreground flex items-center gap-2">
                    <FlowerIcon className="size-5 text-primary" /> Browse by Mood
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Find stories that match how you feel right now.</p>
                </div>
                <Link href="/series" className="flex items-center gap-0.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity mt-1 shrink-0">
                  View all moods <ChevronRight className="size-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <BrowseByMoodGrid moods={MOCK_MOODS} />
            </ScrollReveal>
          </section>

          <section>
            <ScrollReveal>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display italic text-2xl font-normal text-foreground flex items-center gap-2">
                    <FlowerIcon className="size-5 text-primary" /> Popular Tropes
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Explore beloved story themes and find your next obsession.</p>
                </div>
                <Link href="/series" className="flex items-center gap-0.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity mt-1 shrink-0">
                  View all tropes <ChevronRight className="size-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <PopularTropesRow tropes={MOCK_TROPES} />
            </ScrollReveal>
          </section>

          <section>
            <ScrollReveal>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display italic text-2xl font-normal text-foreground flex items-center gap-2">
                    <FlowerIcon className="size-5 text-primary" /> Popular on BLumi
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Trending picks the community can&apos;t stop talking about.</p>
                </div>
                <Link href="/series" className="flex items-center gap-0.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity mt-1 shrink-0">
                  View all <ChevronRight className="size-4" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ContinueDiscoveringRow cards={discoverCards} />
            </ScrollReveal>
          </section>

          <section className="relative">
            <div className="absolute inset-0 -z-10">
              <BloomLayers />
            </div>
            <ScrollReveal>
              <div className="relative mb-6">
                <h2 className="font-display italic text-2xl font-normal text-foreground flex items-center gap-2">
                  <FlowerIcon className="size-5 text-primary" /> How BLumi Works
                </h2>
                <p className="text-muted-foreground text-sm mt-1">A quick look at how to find your next favorite story.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <HowItWorks />
            </ScrollReveal>
          </section>

          <ScrollReveal>
            <LandingCTA />
          </ScrollReveal>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}