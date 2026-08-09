import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteConfig';

interface SeriesForSitemap {
  id: number;
}

// Deliberately NOT paginated (see P2-04 / lib/usePaginatedSeries.ts): a
// sitemap needs every series URL, not a page of them, so this keeps the
// full-list call. Only Series/Discover (a real flat browse grid) paginates.
async function getAllSeriesForSitemap(): Promise<SeriesForSitemap[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Sitemap: series fetch failed with status ' + res.status);
      return [];
    }

    const json = await res.json();
    return (json.data || []) as SeriesForSitemap[];
  } catch (err) {
    // A sitemap that 500s can take the whole site down for crawlers --
    // fail soft to just the static routes instead, same reasoning as the
    // try/catch around every other public getSeries() call in this app.
    console.error('Sitemap: series fetch threw an error:', err);
    return [];
  }
}

const STATIC_ROUTES = [
  '',
  '/series',
  '/moods',
  '/tropes',
  '/collections',
  '/new-releases',
  '/about',
  '/community',
];

// /admin and /my-list are intentionally excluded -- private/gated, see
// app/robots.ts. /collections/[id] is excluded too: personal (non-curated)
// collections are user-private, and this route doesn't currently
// distinguish curated from personal ids at the list level, so there's no
// safe way to include only the public ones here without also fetching and
// filtering that separately.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const series = await getAllSeriesForSitemap();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: SITE_URL + route,
    changeFrequency: route === '' || route === '/series' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((s) => ({
    url: SITE_URL + '/series/' + s.id,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...seriesEntries];
}
