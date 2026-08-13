import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Calendar, Clapperboard, Star } from 'lucide-react';
import type { Metadata } from 'next';
import RatingForm from '../../../components/shared/RatingForm';
import WatchlistButton from '@/components/shared/WatchlistButton';
import ProgressTracker from '@/components/shared/ProgressTracker';

interface Series {
  id: number;
  title: string;
  original_title: string | null;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
  average_rating: number | null;
  rating_count: number;
}

// Restores the query string (filters, search, mood/trope context) the user
// had active on /series when they clicked into this page. This is a Server
// Component, so params only carries the route's [id] -- but next/link's
// client-side navigation still issues an RSC fetch that carries a normal
// Referer header set to the page the click originated from, and next/headers
// lets a Server Component read it. (document.referrer client-side was
// considered, but it only reflects the last *full* page load and goes stale
// after a couple of soft navigations -- this header is set fresh on every
// navigation, so it's the more reliable source here.)
async function getBackToBrowseHref(): Promise<string> {
  const headersList = await headers();
  const referer = headersList.get('referer');
  if (!referer) return '/series';

  try {
    const refererUrl = new URL(referer);
    const host = headersList.get('host');
    if (host && refererUrl.host === host && refererUrl.pathname === '/series') {
      return refererUrl.pathname + refererUrl.search;
    }
  } catch {
    // Malformed referer header -- fall through to the plain default.
  }

  return '/series';
}

async function getSeriesById(id: string): Promise<Series> {
  // no-store: series data (rating, status, synopsis edits from admin, etc.)
  // changes at runtime, per AGENTS.md's fetch-caching rule.
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series/' + id, {
    cache: 'no-store',
  });

  // GET /series/:id 404s for both a missing series and a malformed/non-numeric
  // id (see backend src/index.ts), so this one check covers both cases the
  // task calls out. Anything else unexpected (5xx, network) still throws
  // into the nearest error boundary rather than reading series.status on
  // an undefined series.
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to load series ' + id + ': ' + res.status);
  }

  const json = await res.json();
  return json.data;
}

// Dynamic per-page metadata -- previously only the root layout set
// <title>/<description>, so every series detail page looked identical
// (both in the browser tab and when a link is pasted into
// Discord/Twitter/etc., which read og:title/og:description/og:image
// rather than the page's visible content). Reuses getSeriesById(id): Next
// dedupes identical fetch() calls made during the same request, so this
// doesn't cost a second round trip on top of the page component's own
// call below.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeriesById(id);

  const description = series.synopsis
    ? series.synopsis.length > 155
      ? series.synopsis.slice(0, 155).trimEnd() + '…'
      : series.synopsis
    : 'Discover ' + series.title + ' on BLumi -- ' + series.country + ', ' + series.year + '.';

  return {
    title: series.title,
    description,
    openGraph: {
      title: series.title,
      description,
      type: 'video.tv_show',
      images: series.poster_url ? [{ url: series.poster_url }] : undefined,
    },
    twitter: {
      card: series.poster_url ? 'summary_large_image' : 'summary',
      title: series.title,
      description,
      images: series.poster_url ? [series.poster_url] : undefined,
    },
  };
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesById(id);
  const backToBrowseHref = await getBackToBrowseHref();

  const statusBadgeClass = series.status === 'completed'
    ? 'text-[13px] font-semibold px-2.5 py-1 rounded-full bg-brand-lilac text-[#3D2E52]'
    : 'text-[13px] font-semibold px-2.5 py-1 rounded-full bg-brand-gold/40 text-[#5E4B6B]';

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <Link href={backToBrowseHref} className="text-primary hover:text-brand-purple-vivid text-sm mb-6 block">
        ← Back to Browse
      </Link>

      <div className="max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-card border border-border shadow-brand">
            {series.poster_url ? (
              <Image
                src={series.poster_url}
                alt={series.title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25">
                <span className="text-muted-foreground text-sm px-4 text-center">{series.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-4">
            <span className="text-[13px] font-semibold bg-brand-blush/25 text-[#5E4B6B] px-2.5 py-1 rounded-full">
              {series.country}
            </span>
            <span className={statusBadgeClass}>
              {series.status}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-2">{series.title}</h1>

          {series.original_title && (
            <p className="text-muted-foreground mb-4">{series.original_title}</p>
          )}

          <div className="flex gap-6 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {series.year}</span>
            <span className="flex items-center gap-1.5"><Clapperboard className="size-4" /> {series.episode_count} episodes</span>
            {series.average_rating != null ? (
              <span className="flex items-center gap-1.5 text-brand-gold">
                <Star className="size-4 fill-brand-gold" />
                {series.average_rating.toFixed(1)}
                <span className="text-muted-foreground">
                  ({series.rating_count} {series.rating_count === 1 ? 'rating' : 'ratings'})
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="size-4" /> No ratings yet
              </span>
            )}
          </div>

          <div className="mb-6">
            <WatchlistButton seriesId={series.id} />
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 font-heading text-brand-gradient">Synopsis</h2>
            <p className="text-foreground/80 leading-relaxed">
              {series.synopsis || 'No synopsis available.'}
            </p>
          </div>

          <ProgressTracker seriesId={series.id} episodeCount={series.episode_count} />

          <RatingForm seriesId={series.id} />
        </div>
      </div>
    </main>
  );
}