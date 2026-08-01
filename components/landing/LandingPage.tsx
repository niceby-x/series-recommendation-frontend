import Image from 'next/image';
import Link from 'next/link';
import type { SeriesCardData } from '../shared/SeriesCard';
import LandingHero from './LandingHero';
import LandingStatsBar from './LandingStatsBar';
import ContinueDiscoveringRow from './ContinueDiscoveringRow';
import BrowseByMoodGrid from './BrowseByMoodGrid';
import PopularTropesRow from './PopularTropesRow';
import CuratorsPicks from './CuratorsPicks';
import HowItWorks from './HowItWorks';
import LandingFooter from './LandingFooter';
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
} from '../../lib/landingContent';

export default function LandingPage({ allSeries }: { allSeries: SeriesCardData[] }) {
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

  const realDiscoverCards: DiscoverCard[] = allSeries.slice(0, 5).map((series) => ({
    id: series.id,
    title: series.title,
    country: series.country,
    mediaType: 'Series',
    year: series.year,
    rating: 4.5,
    badge: 'Editor\u2019s Pick',
    tags: ['Romance', 'Drama'],
    imageUrl: series.backdrop_url ?? series.poster_url,
    isReal: true,
  }));
  const discoverCards = [
    ...realDiscoverCards,
    ...MOCK_CONTINUE_DISCOVERING.slice(0, Math.max(0, 5 - realDiscoverCards.length)),
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Spacer reserves scroll space where the fixed hero visually sits */}
      <div className="h-[640px] md:h-screen" aria-hidden="true" />

      {/* Fixed hero — pinned permanently; everything below scrolls over it */}
      <div className="fixed top-0 left-0 right-0 z-0 h-[640px] md:h-screen">
        <LandingHero deck={heroDeck} />
      </div>

      <div className="relative z-10 bg-background">
        {/* Stats bar + Continue Discovering pin together as one unit under
            the navbar, then get covered as a whole once the "rest of
            sections" block (z-20 below) scrolls up over them. */}
        <div className="sticky top-14 z-10 relative overflow-hidden">
          <Image
            src="/continue-discovering-bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top pointer-events-none -z-10"
          />
          <div className="absolute inset-0 bg-background/40 -z-10" aria-hidden="true" />

          <LandingStatsBar />

          <section className="relative">
            <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-10 pb-16 md:pt-12 md:pb-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
                  🌸 Continue Discovering
                </h2>
                <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
                  View all »
                </Link>
              </div>
              <ContinueDiscoveringRow cards={discoverCards} />
            </div>
          </section>
        </div>

        <div className="relative z-20 bg-background rounded-t-3xl max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-14 pb-14 space-y-14">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
              🌸 Browse by Mood
            </h2>
            <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
              View all moods »
            </Link>
          </div>
          <BrowseByMoodGrid moods={MOCK_MOODS} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
              🌸 Popular Tropes
            </h2>
            <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
              View all tropes »
            </Link>
          </div>
          <PopularTropesRow tropes={MOCK_TROPES} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
              🌸 Curator&apos;s Picks
            </h2>
            <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
              View all picks »
            </Link>
          </div>
          <CuratorsPicks feature={CURATOR_FEATURE} quote={CURATOR_FEATURE_QUOTE} list={CURATOR_LIST} />
        </section>

        <section>
          <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2 mb-6">
            🌸 How BLumi Works
          </h2>
          <HowItWorks />
        </section>
          </div>
      </div>

      <LandingFooter />
    </main>
  );
}