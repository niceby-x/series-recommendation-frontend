'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { mockRatingFor } from '../../lib/exploreMock';
import { seriesMatchesTropeKey } from '../../lib/moodMatch';
import { POPULAR_TROPES, NEW_TROPES } from '../../lib/tropesContent';
import { usePaginatedSeries, type SeriesPagination } from '../../lib/usePaginatedSeries';

// The logged-in Discover page. Country/genre/year/sort are REAL, working
// filters over the real catalog (not decorative) -- genre_names comes from
// GET /series's series_genres join (see P2-06/P2-07), same as country/year.
// Rating-based sorting still uses mockRatingFor from lib/exploreMock.ts for
// Trending Now/Top Rated ordering; average_rating is real (see P1-04) but
// isn't swapped into the sort here, only onto card display. When any
// filter/sort is non-default, the curated rows below (Trending Now, New
// Releases, Recommended For You) give way to a single filtered+sorted
// grid, same isFiltering pattern SeriesFilter.tsx (the logged-out Explore
// page) already uses.
//
// A `?trope=<key>` query param (set by PopularTropeCard/NewTropeCard on
// the Tropes page once a trope has real series_tags matches) also filters
// this grid, via seriesMatchesTropeKey -- this is a real tag-based filter,
// unlike genre's deterministic mock. There's no dropdown for it in
// DiscoverFiltersBar (trope isn't a small fixed list the way country/year
// are), so it surfaces as a dismissible pill above the grid instead.
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

  const [filters, setFilters] = useState<DiscoverFilterState>({
    country: 'All',
    genre: 'All',
    year: 'All',
    sort: 'popular',
  });

  const isFiltering =
    search.trim() !== '' ||
    filters.country !== 'All' ||
    filters.genre !== 'All' ||
    filters.year !== 'All' ||
    filters.sort !== 'popular' ||
    !!tropeFilter;

  const filteredSeries = useMemo(() => {
    let list = allSeries.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCountry = filters.country === 'All' || s.country === filters.country;
      const matchesGenre = filters.genre === 'All' || (s.genre_names ?? []).includes(filters.genre);
      const matchesYear = filters.year === 'All' || String(s.year) === filters.year;
      const matchesTrope = !tropeFilter || seriesMatchesTropeKey(s.tags, tropeFilter);
      return matchesSearch && matchesCountry && matchesGenre && matchesYear && matchesTrope;
    });

    if (filters.sort === 'newest') {
      list = [...list].sort((a, b) => b.year - a.year);
    } else if (filters.sort === 'top_rated') {
      list = [...list].sort((a, b) => mockRatingFor(b.id) - mockRatingFor(a.id));
    }

    return list;
  }, [allSeries, filters, search, tropeFilter]);

  // Trending Now: top 4 by mock rating. New Releases: top 4 by year. These
  // overlap with each other and with Recommended below when the catalog is
  // small (a handful of seed rows) -- acceptable for now since there's no
  // real trending/personalization signal yet to keep them apart.
  const trendingNow: DiscoverMediaCardData[] = useMemo(
    () =>
      [...allSeries]
        .sort((a, b) => mockRatingFor(b.id) - mockRatingFor(a.id))
        .slice(0, 4)
        .map((s) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: mockRatingFor(s.id),
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
          rating: mockRatingFor(s.id),
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
        .sort((a, b) => mockRatingFor(b.id) - mockRatingFor(a.id))
        .slice(0, 5)
        .map((s, i) => ({
          id: s.id,
          title: s.title,
          country: s.country,
          mediaType: 'Series',
          rating: mockRatingFor(s.id),
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
                  <p className="text-muted-foreground text-sm mb-6">
                    Showing {filteredSeries.length} of {allSeries.length} series
                  </p>
                  {filteredSeries.length === 0 ? (
                    <p className="text-muted-foreground">No series found. Try adjusting your filters.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredSeries.map((series) => (
                        <SeriesCard key={series.id} series={series} rating={mockRatingFor(series.id)} />
                      ))}
                    </div>
                  )}
                  <LoadMoreSeriesButton hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
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
                          <SeriesCard series={series} rating={mockRatingFor(series.id)} />
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