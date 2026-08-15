'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import SeriesCard, { type SeriesCardData } from '../shared/SeriesCard';
import LoadMoreSeriesButton from '../shared/LoadMoreSeriesButton';
import DiscoverFiltersBar, { type DiscoverFilterState } from './DiscoverFiltersBar';
import ScrollRow from '../dashboard/ScrollRow';
import DiscoverMediaCard, { type DiscoverMediaCardData } from './DiscoverMediaCard';
import TopRatedSeriesCard, { type TopRatedItem } from './TopRatedSeriesCard';
import ExploreByGenreCard from './ExploreByGenreCard';
import PopularTagsCard from './PopularTagsCard';
import { seriesMatchesTropeKey } from '../../lib/moodMatch';
import { POPULAR_TROPES, NEW_TROPES } from '../../lib/tropesContent';
import { usePaginatedSeries, type SeriesPagination, type SeriesQueryFilters } from '../../lib/usePaginatedSeries';

// The logged-in Discover page. Country/genre/year/sort are REAL, working
// filters over the real catalog (not decorative) -- genre_names comes from
// GET /series's series_genres join (see P2-06/P2-07), same as country/year.
// Rating-based sorting/display uses the real average_rating field from
// GET /series (see P1-04) -- series with no ratings yet (average_rating is
// null/undefined) sort to the bottom via the ?? 0 fallback below, and
// SeriesCard/DiscoverMediaCard both already treat a null rating as "don't
// show a star badge" rather than rendering 0.0. When any
// filter/sort is non-default, the curated rows below (Trending Now, New
// Releases, Recommended For You) give way to a single filtered+sorted
// grid, same isFiltering pattern SeriesFilter.tsx (the logged-out Explore
// page) already uses.
//
// D2-01: search/country/genre/year/sort now query GET /series directly
// (see lib/usePaginatedSeries.ts's SeriesQueryFilters) instead of
// filtering/sorting client-side over whatever page has loaded so far.
// `sort` is always sent, including the default 'popular' value -- the
// backend's sort=popular now genuinely orders by the real rank field, so
// this also closes D2-02 ("Sort by: Popular" doing nothing) as a direct
// consequence of moving sort server-side at all, not a separate change.
// Two independent usePaginatedSeries instances are in play: `catalog`
// stays exactly as before (unfiltered, grown via its own Load More) and
// still sources the country/genre/year dropdown options plus the curated
// Trending Now/New Releases/Recommended rows; `filteredResults` is new,
// only fetches once isFiltering is true, and drives the results grid.
//
// A `?trope=<key>` query param (set by PopularTropeCard/NewTropeCard on
// the Tropes page once a trope has real series_tags matches) also filters
// this grid, via seriesMatchesTropeKey -- unlike the filters above, the
// backend has no trope query param, so this stays a client-side filter
// applied on top of whatever page of filteredResults has been fetched.
export default function DiscoverAuthed({
  allSeries: initialSeries,
  initialPagination = null,
}: {
  allSeries: SeriesCardData[];
  initialPagination?: SeriesPagination | null;
}) {
  // Series/Discover is the only page that paginates -- see
  // lib/usePaginatedSeries.ts. `allSeries` below is whatever's been loaded
  // so far (grows as "Load more" is clicked); the curated rows and filter
  // dropdown options derived from it naturally fill in as more loads,
  // same as the filtered grid.
  const { series: allSeries, hasMore, loadingMore, loadMore } = usePaginatedSeries(
    initialSeries,
    initialPagination
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Navbar's search form pushes to /series?q=<term> for both logged-in and
  // logged-out users (see components/shared/Navbar.tsx). SeriesFilter.tsx
  // (logged-out) already reads it; mirror that here so the same submit
  // actually filters the grid instead of landing on an unfiltered page.
  const search = searchParams.get('q') ?? '';
  const urlTropeFilter = searchParams.get('trope');
  // "Clear" just needs to override the URL value for this render tree, not
  // navigate -- avoids syncing the param into state via useEffect (a
  // cascading-render antipattern) since useSearchParams is already
  // reactive to URL changes on its own.
  const [tropeCleared, setTropeCleared] = useState(false);
  const tropeFilter = tropeCleared ? null : urlTropeFilter;

  const tropeLabel = useMemo(() => {
    if (!tropeFilter) return null;
    const known = [...POPULAR_TROPES, ...NEW_TROPES].find((t) => t.key === tropeFilter);
    return known?.title ?? tropeFilter;
  }, [tropeFilter]);

  const countries = useMemo(() => Array.from(new Set(allSeries.map((s) => s.country))).sort(), [allSeries]);
  const years = useMemo(
    () => Array.from(new Set(allSeries.map((s) => s.year))).sort((a, b) => b - a),
    [allSeries]
  );
  // Real genre names from GET /series's series_genres join (see P2-06),
  // same derive-from-the-catalog pattern as countries/years above -- not
  // GENRES from lib/exploreMock.ts, which is a curated mock taxonomy
  // ('romance', 'school', 'slice_of_life' as fixed keys) that doesn't
  // correspond to actual TMDb genre names at all (case differs, and some
  // GENRES entries like "School"/"Slice of Life" aren't real TMDb genres
  // to begin with). Swapping the *match* to check genre_names while still
  // sourcing dropdown *options* from GENRES would silently never match
  // anything -- this is why P2-07 needs it, not just DiscoverAuthed.tsx's
  // matchesGenre line.
  const genres = useMemo(
    () => Array.from(new Set(allSeries.flatMap((s) => s.genre_names ?? []))).sort(),
    [allSeries]
  );

  // D2-05: country/genre/year/sort now live in the URL, same as search/trope
  // above, instead of local-only state -- a refresh, shared link, or
  // browser back/forward previously lost these. Kept as plain derived
  // values (not synced into state via useEffect) for the same reason
  // tropeFilter avoids that pattern: useSearchParams is already reactive,
  // so there's no need to shadow it in a second source of truth.
  const countryParam = searchParams.get('country') ?? 'All';
  const genreParam = searchParams.get('genre') ?? 'All';
  const yearParam = searchParams.get('year') ?? 'All';
  const sortParam = (searchParams.get('sort') as DiscoverFilterState['sort']) ?? 'popular';
  const filters = useMemo<DiscoverFilterState>(
    () => ({ country: countryParam, genre: genreParam, year: yearParam, sort: sortParam }),
    [countryParam, genreParam, yearParam, sortParam]
  );

  // Mirrors React's setState signature (plain value or updater fn) so every
  // existing call site -- DiscoverFiltersBar's onChange, the sort
  // shortcut buttons, ExploreByGenreCard's onSelect -- keeps working
  // unchanged; this just writes the result to the URL instead of state.
  function setFilters(update: DiscoverFilterState | ((prev: DiscoverFilterState) => DiscoverFilterState)) {
    const next = typeof update === 'function' ? update(filters) : update;
    const params = new URLSearchParams(searchParams.toString());
    if (next.country === 'All') params.delete('country'); else params.set('country', next.country);
    if (next.genre === 'All') params.delete('genre'); else params.set('genre', next.genre);
    if (next.year === 'All') params.delete('year'); else params.set('year', next.year);
    if (next.sort === 'popular') params.delete('sort'); else params.set('sort', next.sort);
    const qs = params.toString();
    router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
  }

  const isFiltering =
    search.trim() !== '' ||
    filters.country !== 'All' ||
    filters.genre !== 'All' ||
    filters.year !== 'All' ||
    filters.sort !== 'popular' ||
    !!tropeFilter;

  // Only built (and only triggers a fetch, see usePaginatedSeries) once
  // isFiltering is true -- sort is always included so the default
  // 'popular' value reaches the backend's real rank-based ordering.
  const filteredQuery = useMemo<SeriesQueryFilters | undefined>(() => {
    if (!isFiltering) return undefined;
    const q: SeriesQueryFilters = { sort: filters.sort };
    if (search.trim()) q.q = search.trim();
    if (filters.country !== 'All') q.country = filters.country;
    if (filters.genre !== 'All') q.genre = filters.genre;
    if (filters.year !== 'All') {
      q.year_min = filters.year;
      q.year_max = filters.year;
    }
    return q;
  }, [isFiltering, search, filters]);

  const {
    series: filteredResults,
    hasMore: filteredHasMore,
    loading: filteredLoading,
    loadingMore: filteredLoadingMore,
    loadMore: loadMoreFiltered,
  } = usePaginatedSeries([], null, filteredQuery);

  const filteredSeries = useMemo(
    () => (tropeFilter ? filteredResults.filter((s) => seriesMatchesTropeKey(s.tags, tropeFilter)) : filteredResults),
    [filteredResults, tropeFilter]
  );

  // Trending Now: top 4 by real average_rating. New Releases: top 4 by year.
  // These overlap with each other and with Recommended below when the
  // catalog is small (a handful of seed rows) -- acceptable for now since
  // there's no real trending/personalization signal yet to keep them apart.
  const trendingNow: DiscoverMediaCardData[] = useMemo(
    () =>
      [...allSeries]
        .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
        .slice(0, 4)
        .map((s) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: s.average_rating ?? null,
          imageUrl: s.backdrop_url ?? s.poster_url,
          isReal: true,
        })),
    [allSeries]
  );

  const newReleases: DiscoverMediaCardData[] = useMemo(
    () =>
      [...allSeries]
        .sort((a, b) => b.year - a.year)
        .slice(0, 4)
        .map((s) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: s.average_rating ?? null,
          imageUrl: s.backdrop_url ?? s.poster_url,
          isReal: true,
        })),
    [allSeries]
  );

  // Not real personalization -- there's no recommendation engine yet, this
  // is just "everything else" so the row isn't a exact duplicate of the
  // two above when the catalog has enough rows.
  const recommended = useMemo(() => {
    const usedIds = new Set([...trendingNow, ...newReleases].map((c) => c.id));
    const rest = allSeries.filter((s) => !usedIds.has(s.id));
    return (rest.length > 0 ? rest : allSeries).slice(0, 8);
  }, [allSeries, trendingNow, newReleases]);

  const topRated: TopRatedItem[] = useMemo(
    () =>
      [...allSeries]
        .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
        .slice(0, 5)
        .map((s, i) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          // TopRatedItem.rating isn't nullable (unlike SeriesCard/DiscoverMediaCard) --
          // 0 only shows up here for a series with no ratings yet, which will already
          // be sorted to the bottom of this top-5 slice behind anything with a real score.
          rating: s.average_rating ?? 0,
          imageUrl: s.backdrop_url ?? s.poster_url,
          trend: i % 3 === 0 ? 'down' : i % 3 === 1 ? 'flat' : 'up',
          isReal: true,
        })),
    [allSeries]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1400px]">
          <DashboardHeader title="Discover" subtitle="Find your next favorite series" />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <DiscoverFiltersBar filters={filters} onChange={setFilters} countries={countries} years={years} genres={genres} />

              {isFiltering ? (
                <section>
                  {tropeLabel && (
                    <div className="inline-flex items-center gap-2 bg-brand-blush/25 text-[#5E4B6B] text-[13px] font-semibold pl-3.5 pr-2.5 py-1.5 rounded-full mb-4">
                      Trope: {tropeLabel}
                      <button
                        type="button"
                        onClick={() => setTropeCleared(true)}
                        aria-label="Clear trope filter"
                        className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {filteredLoading ? (
                    <p className="text-muted-foreground text-sm mb-6">Loading series...</p>
                  ) : (
                    <p className="text-muted-foreground text-sm mb-6">
                      Showing {filteredSeries.length} series
                    </p>
                  )}
                  {!filteredLoading && filteredSeries.length === 0 ? (
                    <p className="text-muted-foreground">No series found. Try adjusting your filters.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredSeries.map((series) => (
                        <SeriesCard key={series.id} series={series} rating={series.average_rating ?? null} />
                      ))}
                    </div>
                  )}
                  <LoadMoreSeriesButton hasMore={filteredHasMore} loading={filteredLoadingMore} onClick={loadMoreFiltered} />
                </section>
              ) : (
                <>
                  <section className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">Trending Now</h2>
                      <button
                        type="button"
                        onClick={() => setFilters((f) => ({ ...f, sort: 'top_rated' }))}
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </button>
                    </div>
                    <ScrollRow>
                      {trendingNow.map((card, i) => (
                        <DiscoverMediaCard key={card.id} card={card} rank={i + 1} />
                      ))}
                    </ScrollRow>
                  </section>

                  <section className="mb-10">
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">New Releases</h2>
                      <button
                        type="button"
                        onClick={() => setFilters((f) => ({ ...f, sort: 'newest' }))}
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </button>
                    </div>
                    <ScrollRow>
                      {newReleases.map((card) => (
                        <DiscoverMediaCard key={card.id} card={card} isNew />
                      ))}
                    </ScrollRow>
                  </section>

                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="font-heading text-[22px] font-normal text-foreground">Recommended For You</h2>
                      <button
                        type="button"
                        onClick={() => setFilters((f) => ({ ...f, sort: 'popular' }))}
                        className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0"
                      >
                        View all
                      </button>
                    </div>
                    <ScrollRow>
                      {recommended.map((series) => (
                        <div key={series.id} className="shrink-0 w-[160px] snap-start">
                          <SeriesCard series={series} rating={series.average_rating ?? null} />
                        </div>
                      ))}
                    </ScrollRow>
                  </section>

                  <LoadMoreSeriesButton hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
                </>
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <TopRatedSeriesCard items={topRated} />
              <ExploreByGenreCard genres={genres} onSelect={(genre) => setFilters((f) => ({ ...f, genre }))} />
              <PopularTagsCard />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
