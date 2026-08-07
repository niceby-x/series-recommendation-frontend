import { ChevronRight } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import Image from 'next/image';
import Link from 'next/link';
import type { SeriesCardData } from '../shared/SeriesCard';
import LandingHero from './LandingHero';
import LandingStatsBar from './LandingStatsBar';
import ContinueDiscoveringRow from './ContinueDiscoveringRow';
import BrowseByMoodGrid from '../shared/BrowseByMoodGrid';
import PopularTropesRow from './PopularTropesRow';
import CuratorsPicks from './LandingCuratorsPicks';
import HowItWorks from './HowItWorks';
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
  const realHeroCards: HeroFeature[] = allSeries.slice(0, 3).map((series) => ({
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
    ...HERO_DECK_FALLBACK.slice(0, Math.max(0, 3 - realHeroCards.length)),
  ].slice(0, 3);

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
      <LandingHero deck={heroDeck} />

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

          <LandingStatsBar />

          <section className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-10 pb-14">
            <ScrollReveal>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
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
                  <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
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
                  <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
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
                  <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
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
            <BloomLayers />
            <ScrollReveal>
              <div className="relative mb-6">
                <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
                  <FlowerIcon className="size-5 text-primary" /> How BLumi Works
                </h2>
                <p className="text-muted-foreground text-sm mt-1">A quick look at how to find your next favorite story.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <HowItWorks />
            </ScrollReveal>
          </section>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}