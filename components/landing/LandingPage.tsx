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
  type DiscoverCard,
} from '../../lib/landingContent';

export default function LandingPage({ allSeries }: { allSeries: SeriesCardData[] }) {
  const featureSeries = allSeries[0] ?? null;

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
      <LandingHero feature={featureSeries} />
      <LandingStatsBar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-14 space-y-14">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-normal text-foreground flex items-center gap-2">
              🌸 Continue Discovering
            </h2>
            <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
              View all »
            </Link>
          </div>
          <ContinueDiscoveringRow cards={discoverCards} />
        </section>

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

      <LandingFooter />
    </main>
  );
}
