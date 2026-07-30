'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SeriesCard, { type SeriesCardData } from '../../components/shared/SeriesCard';
import ExploreHero from '../../components/explore/ExploreHero';
import GenreStrip from '../../components/explore/GenreStrip';
import PopularThisWeek from '../../components/explore/PopularThisWeek';
import BrowseByGenre from '../../components/explore/BrowseByGenre';
import ContinueExploring from '../../components/explore/ContinueExploring';
import ExploreSidebar, { type ExploreFilters, type NavCategory } from '../../components/explore/ExploreSidebar';
import { mockGenresFor, mockRatingFor } from '../../lib/exploreMock';

interface Props {
  seriesList: SeriesCardData[];
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default function SeriesFilter({ seriesList }: Props) {
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

  const [filters, setFilters] = useState<ExploreFilters>({
    navCategory: (searchParams.get('status') === 'upcoming' ? 'coming_soon' : 'all') as NavCategory,
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

  const filtered = useMemo(() => {
    let list = seriesList.filter((series) => {
      const matchesSearch = series.title.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = filters.country === 'All' || series.country === filters.country;
      const matchesGenre = filters.genre === 'All' || mockGenresFor(series.id).includes(filters.genre);
      const matchesYear = series.year >= filters.yearMin && series.year <= filters.yearMax;
      const matchesEpisodes =
        filters.episodes === 'Any' ||
        (filters.episodes === '1-12' && series.episode_count <= 12) ||
        (filters.episodes === '13-24' && series.episode_count > 12 && series.episode_count <= 24) ||
        (filters.episodes === '25+' && series.episode_count > 24);
      const matchesRating = filters.rating === 'Any' || mockRatingFor(series.id) >= Number(filters.rating);
      const matchesStatus =
        filters.navCategory !== 'coming_soon' && filters.navCategory !== 'completed'
          ? true
          : filters.navCategory === 'coming_soon'
            ? series.status === 'upcoming'
            : series.status === 'completed';

      return matchesSearch && matchesCountry && matchesGenre && matchesYear && matchesEpisodes && matchesRating && matchesStatus;
    });

    if (filters.navCategory === 'new') {
      list = [...list].sort((a, b) => b.year - a.year);
    } else if (filters.navCategory === 'top_rated') {
      list = [...list].sort((a, b) => mockRatingFor(b.id) - mockRatingFor(a.id));
    } else if (filters.navCategory === 'hidden_gems') {
      list = [...list].sort((a, b) => mockRatingFor(a.id) - mockRatingFor(b.id));
    }

    return list;
  }, [seriesList, search, filters]);

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
        dataYearMin={dataYearMin}
        dataYearMax={dataYearMax}
        onSurpriseMe={handleSurpriseMe}
      />

      <div className="flex-1 min-w-0 space-y-8">
        {isFiltering ? (
          <div>
            <p className="text-muted-foreground text-sm mb-6">
              Showing {filtered.length} of {seriesList.length} series
            </p>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground">No series found. Try adjusting your filters.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((series) => (
                  <SeriesCard key={series.id} series={series} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <ExploreHero backgrounds={seriesList.slice(0, 4)} />
            <GenreStrip activeGenre={filters.genre === 'All' ? null : filters.genre} onSelect={handleGenreStripSelect} />
            <PopularThisWeek items={seriesList.slice(0, 7)} />
            <BrowseByGenre onSelect={handleBrowseByGenreSelect} />
            <ContinueExploring onSelect={handleContinueExploringSelect} />
          </>
        )}
      </div>
    </div>
  );
}
