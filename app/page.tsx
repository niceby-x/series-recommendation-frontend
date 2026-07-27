import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import SeriesCard, { type SeriesCardData } from '../components/SeriesCard';

const STATUS_LABELS: Record<string, string> = {
  airing: 'On Air',
  completed: 'Completed',
  upcoming: 'Coming Soon',
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

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

export default async function Home() {
  const allSeries = await getSeries();
  const spotlight = allSeries[0];
  const recentlyAdded = allSeries.slice(0, 6);
  const surprisePick = allSeries.length ? pickRandom(allSeries) : null;

  const countries = Array.from(new Set(allSeries.map((s) => s.country))).slice(0, 6);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/15 via-background to-brand-lilac/15" />
        <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading text-5xl md:text-6xl font-semibold leading-[1.05] mb-5">
              <span className="text-foreground">Where Stories</span>
              <br />
              <span className="text-brand-gradient">Bloom.</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Discover your next favorite BL series, movies, and anime — handpicked with love.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link
                href="/series"
                className="inline-flex items-center gap-2 bg-brand-gradient text-white px-7 py-3 rounded-full font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                Explore Now
                <ArrowRight className="size-4" />
              </Link>
              {surprisePick && (
                <Link
                  href={`/series/${surprisePick.id}`}
                  className="inline-flex items-center gap-2 border border-border bg-card px-7 py-3 rounded-full font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Sparkles className="size-4 text-primary" />
                  Surprise Me
                </Link>
              )}
            </div>
            {allSeries.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{allSeries.length}+</span> series
                curated with love, from Thailand to Japan, Korea, and beyond.
              </p>
            )}
          </div>

          {/* Spotlight card */}
          <div className="relative">
            {spotlight ? (
              <Link
                href={`/series/${spotlight.id}`}
                className="group relative block rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-muted"
              >
                {spotlight.poster_url ? (
                  <Image
                    src={spotlight.poster_url}
                    alt={spotlight.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute top-4 left-4 bg-white/90 text-[11px] font-semibold px-3 py-1 rounded-full text-brand-mauve">
                  Spotlight
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-brand-blush text-[#4A2F3F] text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
                    {STATUS_LABELS[spotlight.status] ?? spotlight.status}
                  </span>
                  <h2 className="font-heading text-2xl font-semibold text-white mb-1">
                    {spotlight.title}
                  </h2>
                  <p className="text-white/70 text-sm mb-3">
                    {spotlight.year} • {spotlight.country} • {spotlight.episode_count} episodes
                  </p>
                  {spotlight.synopsis && (
                    <p className="text-white/80 text-sm line-clamp-2 max-w-md">{spotlight.synopsis}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="rounded-3xl border border-dashed border-border aspect-[4/3] flex items-center justify-center text-muted-foreground text-sm text-center p-8">
                Couldn&apos;t load a spotlight pick right now.{' '}
                <Link href="/series" className="text-primary font-semibold ml-1">
                  Browse the catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick filters */}
      {countries.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 flex flex-wrap gap-3">
          <Link
            href="/series"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-accent text-accent-foreground hover:opacity-80 transition-opacity"
          >
            All
          </Link>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <Link
              key={status}
              href={`/series?status=${status}`}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
          {countries.map((country) => (
            <Link
              key={country}
              href={`/series?country=${encodeURIComponent(country)}`}
              className="text-sm font-semibold px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {country}
            </Link>
          ))}
        </div>
      )}

      {/* Recently added */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 pb-20">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground">From the Catalog</h2>
          <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
            See all →
          </Link>
        </div>

        {recentlyAdded.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Couldn&apos;t load series right now.{' '}
            <Link href="/series" className="text-primary font-semibold">
              Browse the full catalog
            </Link>{' '}
            instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyAdded.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
