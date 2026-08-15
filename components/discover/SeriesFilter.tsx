'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SeriesCard, { type SeriesCardData } from '../shared/SeriesCard';
import LoadMoreSeriesButton from '../shared/LoadMoreSeriesButton';
import ExploreHero from '../explore/ExploreHero';
import GenreStrip from '../explore/GenreStrip';
import PopularThisWeek from '../explore/PopularThisWeek';
import BrowseByGenre from '../explore/BrowseByGenre';
import ContinueExploring from '../explore/ContinueExploring';
import ExploreSidebar, { type ExploreFilters, type NavCategory } from '../explore/ExploreSidebar';
import { usePaginatedSeries, type SeriesPagination, type SeriesQueryFilters } from '../../lib/usePaginatedSeries';

interface Props {
  seriesList: SeriesCardData[];
  initialPagination?: SeriesPagination | null;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// D2-01/D2-03: search/country/genre/year/episodes/rating/status/sort all
// now query GET /series directly (see lib/usePaginatedSeries.ts's
// SeriesQueryFilters) instead of filtering/sorting client-side over
// whatever page happens to be loaded -- same server-driven pattern
// DiscoverAuthed.tsx (the logged-in Discover page) uses. Genre in
// particular used to match against lib/exploreMock.ts's mockGenresFor(),
// a deterministic but fabricated assignment; it's now the real `genre`
// query param against genre_names, same field DiscoverAuthed.tsx's genre
// filter already used. GenreStrip/BrowseByGenre/ExploreSidebar's genre
// options are real too now (see genreCounts below), not the fixed mock
// GENRES taxonomy.
export default function SeriesFilter({ seriesList: initialSeriesList, initialPagination = null }: Props) {
  // See lib/usePaginatedSeries.ts -- Series/Discover (both the logged-in
  // and logged-out variants) is the one page that paginates. `seriesList`
  // stays the unfiltered, growing-via-Load-More catalog (used to source
  // dropdown/genre options and the non-filtering browse sections below);
  // a second, filtered instance drives the results grid once a
  // search/filter is active (see filteredQuery/filteredResults below).
  const { series: seriesList, hasMore, loadingMore, loadMore } = usePaginatedSeries(
    initialSeriesList,
    initialPagination
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search] = useState(searchParams.get('q') ?? '');

  const countries = useMemo(
    () => ['All', ...Array.from(new Set(seriesList.map((s) => s.country)))],
    [seriesList]
  );
  const years = seriesList.map((s) => s.year);
  const dataYearMin = years.length ? Math.min(...years) : 2000;
  const dataYearMax = years.length ? Math.max(...years) : new Date().getFullYear();

  // Real genre name -> count of currently-loaded series with that genre,
  // from GET /series's genre_names field -- same "derive from what's
  // loaded so far" pattern DiscoverAuthed.tsx's country/genre/year
  // dropdowns already use, replacing lib/exploreMock.ts's fabricated
  // GENRES/mockCount pairing (D2-03).
  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of seriesList) {
      for (const g of s.genre_names ?? []) {
        counts.set(g, (counts.get(g) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [seriesList]);
  const genres = useMemo(() => genreCounts.map((g) => g.name), [genreCounts]);

  // ?section=trending / ?section=top-rated come from the logged-out
  // Discover mega-menu (see components/shared/Navbar.tsx's DISCOVER_MENU)
  // -- map them onto the same navCategory values the sidebar's own
  // Trending/Top Rated nav items use, same pattern as ?status=upcoming
  // below (see Q1-05).
  const initialNavCategory: NavCategory =
    searchParams.get('status') === 'upcoming'
      ? 'coming_soon'
      : searchParams.get('section') === 'trending'
        ? 'trending'
        : searchParams.get('section') === 'top-rated'
          ? 'top_rated'
          : 'all';

  const [filters, setFilters] = useState<ExploreFilters>({
    navCategory: initialNavCategory,
    country: searchParams.get('country') ?? 'All',
    genre: 'All',
    yearMin: dataYearMin,
    yearMax: dataYearMax,
    episodes: 'Any',
    rating: 'Any',
  });

  const isFiltering =
    search.trim() !== '' ||
    filters.navCategory !== 'all' ||
    filters.country !== 'All' ||
    filters.genre !== 'All' ||
    filters.yearMin !== dataYearMin ||
    filters.yearMax !== dataYearMax ||
    filters.episodes !== 'Any' ||
    filters.rating !== 'Any';

  // Only built (and only triggers a fetch, see usePaginatedSeries) once
  // isFiltering is true. year_min/year_max are only included when the
  // slider has actually moved off its full-data-range defaults -- sending
  // dataYearMin/dataYearMax unconditionally would wrongly hard-cap results
  // to whatever range happened to be loaded into `seriesList` so far, cutting
  // off real series outside that partial window.
  const filteredQuery = useMemo<SeriesQueryFilters | undefined>(() => {
    if (!isFiltering) return undefined;
    const f: SeriesQueryFilters = {};
    if (search.trim()) f.q = search.trim();
    if (filters.country !== 'All') f.country = filters.country;
    if (filters.genre !== 'All') f.genre = filters.genre;
    if (filters.yearMin !== dataYearMin || filters.yearMax !== dataYearMax) {
      f.year_min = filters.yearMin;
      f.year_max = filters.yearMax;
    }
    // Matches the '1-12' bucket's original client-side check exactly
    // (series.episode_count <= 12, no lower bound).
    if (filters.episodes === '1-12') {
      f.episode_max = 12;
    } else if (filters.episodes === '13-24') {
      f.episode_min = 13;
      f.episode_max = 24;
    } else if (filters.episodes === '25+') {
      f.episode_min = 25;
    }
    if (filters.rating !== 'Any') f.rating_min = Number(filters.rating);
    if (filters.navCategory === 'coming_soon') f.status = 'upcoming';
    else if (filters.navCategory === 'completed') f.status = 'completed';
    if (filters.navCategory === 'new') f.sort = 'newest';
    else if (filters.navCategory === 'top_rated') f.sort = 'top_rated';
    else if (filters.navCategory === 'hidden_gems') f.sort = 'hidden_gems';
    return f;
  }, [isFiltering, search, filters, dataYearMin, dataYearMax]);

  const {
    series: filtered,
    hasMore: filteredHasMore,
    loading: filteredLoading,
    loadingMore: filteredLoadingMore,
    loadMore: loadMoreFiltered,
  } = usePaginatedSeries([], null, filteredQuery);

  function handleSurpriseMe() {
    if (seriesList.length === 0) return;
    router.push(`/series/${pickRandom(seriesList).id}`);
  }

  function handleGenreStripSelect(genreKey: string | null) {
    setFilters((f) => ({ ...f, genre: genreKey ?? 'All' }));
  }

  function handleBrowseByGenreSelect(genreKey: string) {
    setFilters((f) => ({ ...f, genre: genreKey }));
  }

  function handleContinueExploringSelect(key: string) {
    const map: Record<string, NavCategory> = {
      'new-releases': 'new',
      completed: 'completed',
      'hidden-gems': 'hidden_gems',
      'top-rated': 'top_rated',
    };
    setFilters((f) => ({ ...f, navCategory: map[key] ?? 'all' }));
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
      <ExploreSidebar
        filters={filters}
        onChange={setFilters}
        countries={countries}
        genres={genres}
        dataYearMin={dataYearMin}
        dataYearMax={dataYearMax}
        onSurpriseMe={handleSurpriseMe}
      />

      <div className="flex-1 min-w-0 space-y-8">
        {isFiltering ? (
          <div>
            {filteredLoading ? (
              <p className="text-muted-foreground text-sm mb-6">Loading series...</p>
            ) : (
              <p className="text-muted-foreground text-sm mb-6">Showing {filtered.length} series</p>
            )}
            {!filteredLoading && filtered.length === 0 ? (
              <p className="text-muted-foreground">No series found. Try adjusting your filters.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((series) => (
                  <SeriesCard key={series.id} series={series} rating={series.average_rating ?? null} />
                ))}
              </div>
            )}
            <LoadMoreSeriesButton hasMore={filteredHasMore} loading={filteredLoadingMore} onClick={loadMoreFiltered} />
          </div>
        ) : (
          <>
            <ExploreHero backgrounds={seriesList.slice(0, 4)} />
            <GenreStrip activeGenre={filters.genre === 'All' ? null : filters.genre} onSelect={handleGenreStripSelect} genres={genres} />
            <PopularThisWeek items={seriesList.slice(0, 7)} />
            <BrowseByGenre onSelect={handleBrowseByGenreSelect} genreCounts={genreCounts} />
            <ContinueExploring onSelect={handleContinueExploringSelect} />
            <LoadMoreSeriesButton hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
