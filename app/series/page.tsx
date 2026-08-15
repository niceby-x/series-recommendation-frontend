import { Suspense } from 'react';
import type { SeriesCardData } from '../../components/shared/SeriesCard';
import type { SeriesPagination } from '../../lib/usePaginatedSeries';
import HomeGate from '../../components/shared/HomeGate';
import DiscoverAuthed from '../../components/discover/DiscoverAuthed';
import DiscoverLanding from '../../components/discover/DiscoverLanding';

const PAGE_SIZE = 24;

// Series/Discover is the one page in the app that renders a flat,
// potentially-large grid of series cards for the user to page through
// (see P2-04) -- so it's the one page that fetches page 1 instead of the
// full catalog, and hands off to usePaginatedSeries client-side for
// "Load more". Every other /series caller in the app (Moods, Tropes, New
// Releases, Collections' add-series search) needs the whole catalog up
// front to compute matches/rankings/search results correctly, so those
// deliberately keep the old no-params full-list call.
async function getSeries(): Promise<{ data: SeriesCardData[]; pagination: SeriesPagination | null }> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/series?page=1&limit=' + PAGE_SIZE,
    { cache: 'no-store' }
  );

  // D1-01: a genuine failure here (5xx, network error) used to fall back
  // to { data: [], pagination: null } -- the exact same shape a
  // legitimately empty catalog returns, so a real outage rendered as an
  // indistinguishable "no series" page. Throwing instead routes this to
  // the nearest error.tsx boundary (same pattern getSeriesById already
  // uses for its own non-404 failures, see app/series/[id]/page.tsx),
  // which shows a distinct "something went wrong, try again" state. An
  // actually-empty catalog still reaches the normal empty-grid UI below,
  // since res.ok is true and json.data is just [].
  if (!res.ok) {
    throw new Error('Failed to load series: ' + res.status);
  }

  const json = await res.json();
  return {
    data: (json.data || []) as SeriesCardData[],
    pagination: (json.pagination ?? null) as SeriesPagination | null,
  };
}

// Same HomeGate split as app/page.tsx, app/moods/page.tsx, etc: logged-out
// visitors get DiscoverLanding (the existing real Explore page), logged-in
// users get the sidebar-dashboard DiscoverAuthed. DiscoverAuthed now reads
// useSearchParams (for the ?trope= filter coming from the Tropes page), so
// it's wrapped in Suspense per Next's requirement for that hook.
export default async function SeriesPage() {
  const { data: seriesList, pagination } = await getSeries();

  return (
    <HomeGate
      landing={<DiscoverLanding seriesList={seriesList} initialPagination={pagination} />}
      authed={
        <Suspense fallback={null}>
          <DiscoverAuthed allSeries={seriesList} initialPagination={pagination} />
        </Suspense>
      }
    />
  );
}
