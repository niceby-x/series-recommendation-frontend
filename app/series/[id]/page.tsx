import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SeriesDetailView, { type SeriesDetail } from '@/components/series/SeriesDetailView';
import type { RelatedSeriesItem } from '@/components/shared/RelatedSeriesRow';
import { getServerSession } from '@/lib/getServerSession';

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

async function getSeriesById(id: string): Promise<SeriesDetail> {
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

// Q2-02: "more like this" data for RelatedSeriesRow, backed by the new
// GET /series/:id/related (see backend src/routes/series.ts). Unlike
// getSeriesById above, a failure here degrades to an empty section
// rather than a page-level error -- related series is a nice-to-have,
// not core content the page can't render without.
async function getRelatedSeries(id: string): Promise<RelatedSeriesItem[]> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series/' + id + '/related', {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.data ?? [];
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

// Same logged-in/logged-out split as the other pages (see HomeGate): a
// signed-in user gets the sidebar dashboard frame (DashboardShell +
// DashboardHeader, same as Discover/Moods/etc.), a logged-out visitor
// gets the plain page under the site Navbar. The page content itself
// (SeriesDetailView) is identical in both.
export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [series, relatedSeries, backToBrowseHref, { user }] = await Promise.all([
    getSeriesById(id),
    getRelatedSeries(id),
    getBackToBrowseHref(),
    getServerSession(),
  ]);

  const content = (
    <SeriesDetailView series={series} relatedSeries={relatedSeries} backToBrowseHref={backToBrowseHref} />
  );

  if (user) {
    return <DashboardShell header={<DashboardHeader />}>{content}</DashboardShell>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="mx-auto max-w-6xl">{content}</div>
    </main>
  );
}
