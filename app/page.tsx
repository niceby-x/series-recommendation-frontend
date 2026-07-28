import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SeriesCard, { type SeriesCardData } from '../components/SeriesCard';
import HeroCarousel, { type CarouselSlide } from '../components/HeroCarousel';
import CategoryNav from '../components/CategoryNav';
import ContinueJourneyRow from '../components/ContinueJourneyRow';
import PetalDecoration from '../components/PetalDecoration';

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
    posterUrl: null,
    badge: 'Editor\u2019s Pick',
    statusLabel: 'On Air',
    meta: 'Episode 7 \u00b7 Every Saturday',
    tags: ['Romance', 'Slow Burn', 'University'],
    isReal: false,
  },
];

// MOCK — pads the Trending grid to a full row. The `ratings` table has zero rows
// right now, so there's no real rating data to show yet either way. Real series
// (from getSeries()) always come first; these only fill remaining slots.
const MOCK_TRENDING: (SeriesCardData & { mockRating: number })[] = [
  { id: -1, title: 'Only Us', country: 'Thailand', year: 2023, episode_count: 12, status: 'completed', synopsis: null, poster_url: null, mockRating: 9.3 },
  { id: -2, title: 'Our Skyy 2', country: 'Thailand', year: 2023, episode_count: 10, status: 'completed', synopsis: null, poster_url: null, mockRating: 9.1 },
  { id: -3, title: 'The Eighth Sense', country: 'Korea', year: 2023, episode_count: 14, status: 'completed', synopsis: null, poster_url: null, mockRating: 9.0 },
  { id: -4, title: 'Kiseki: Dear to Me', country: 'Japan', year: 2023, episode_count: 8, status: 'completed', synopsis: null, poster_url: null, mockRating: 8.8 },
  { id: -5, title: 'My Personal Weatherman', country: 'Japan', year: 2023, episode_count: 8, status: 'completed', synopsis: null, poster_url: null, mockRating: 8.7 },
  { id: -6, title: 'Stay With Me', country: 'China', year: 2023, episode_count: 12, status: 'completed', synopsis: null, poster_url: null, mockRating: 8.6 },
  { id: -7, title: 'A Shoulder to Cry On', country: 'Korea', year: 2023, episode_count: 10, status: 'completed', synopsis: null, poster_url: null, mockRating: 8.5 },
];

// PLACEHOLDER — real series don't have genre pills yet because genres live in the
// separate `series_genres` join table, not denormalized onto `series` (unlike
// series_candidates.genre_names). Until that join is wired up, real slides fall
// back to this generic pair rather than showing an empty, sparse-looking card.
// Replace this the moment real genre data is available per-slide.
const PLACEHOLDER_GENRE_TAGS = ['Romance', 'Drama'];

async function getSeries(): Promise<SeriesCardData[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Series fetch failed with status ' + res.status);
      return [];
    }

    const json = await res.json();
    return (json.data || []) as SeriesCardData[];
  } catch (err) {
    console.error('Series fetch threw an error:', err);
    return [];
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function Home() {
  const allSeries = await getSeries();
  const surprisePick = allSeries.length > 0 ? pickRandom(allSeries) : null;

  const realSlides: CarouselSlide[] = allSeries.slice(0, 4).map((s) => ({
    id: s.id,
    title: s.title,
    posterUrl: s.poster_url,
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

        <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-10 md:py-14 grid md:grid-cols-2 gap-10 items-center">
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
                🌸 Surprise Me
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
              <p className="text-sm text-muted-foreground">
                Loved by <span className="font-semibold text-foreground">12,842+</span> BL fans ❤️
              </p>
            </div>
          </div>

          <HeroCarousel slides={carouselSlides} />
        </div>

        {/* Category quick-nav — inside the hero wrapper so it shares the same
            gradient/petal background, no visible seam between the two */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-8 pb-10">
          <CategoryNav />
        </div>
      </div>

      {/* Trending This Week */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-heading text-[32px] font-normal text-foreground flex items-center gap-2">
            🔥 Trending This Week
          </h2>
          <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {trendingReal.map((series, i) => (
            <SeriesCard key={series.id} series={series} rank={i + 1} rating={null} />
          ))}
          {trendingMock.map((series, i) => (
            <SeriesCard
              key={series.id}
              series={series}
              rank={trendingReal.length + i + 1}
              rating={series.mockRating}
            />
          ))}
        </div>
      </div>

      {/* Continue Your Journey — mock, see ContinueJourneyRow.tsx */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 pb-20">
        <h2 className="font-heading text-[32px] font-normal text-foreground mb-6 flex items-center gap-2">
          🍃 Continue Your Journey
        </h2>
        <ContinueJourneyRow />
      </div>
    </main>
  );
}