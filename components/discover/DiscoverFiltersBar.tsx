'use client';

import { Globe2, LayoutGrid, CalendarDays, ArrowDownUp } from 'lucide-react';

export type DiscoverSort = 'popular' | 'newest' | 'top_rated';

export interface DiscoverFilterState {
  country: string; // 'All' or a real country value from the catalog
  genre: string; // 'All' or a real genre name from the catalog (see P2-06/P2-07)
  year: string; // 'All' or a year as a string
  sort: DiscoverSort;
}

const SORT_LABELS: Record<DiscoverSort, string> = {
  popular: 'Popular',
  newest: 'Newest',
  top_rated: 'Top Rated',
};

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
  ariaLabel,
}: {
  icon: typeof Globe2;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border rounded-full pl-10 pr-9 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Real, functional filters -- driving DiscoverAuthed's client-side
// filter/sort of the real catalog. Genre options come from the catalog
// itself (see DiscoverAuthed's `genres` -- real GET /series genre_names,
// P2-06/P2-07), same as countries/years below, not a fixed list.
export default function DiscoverFiltersBar({
  filters,
  onChange,
  countries,
  years,
  genres,
}: {
  filters: DiscoverFilterState;
  onChange: (filters: DiscoverFilterState) => void;
  countries: string[];
  years: number[];
  genres: string[];
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <FilterSelect
        icon={Globe2}
        ariaLabel="Filter by country"
        value={filters.country}
        onChange={(country) => onChange({ ...filters, country })}
        options={[{ value: 'All', label: 'All Countries' }, ...countries.map((c) => ({ value: c, label: c }))]}
      />
      <FilterSelect
        icon={LayoutGrid}
        ariaLabel="Filter by genre"
        value={filters.genre}
        onChange={(genre) => onChange({ ...filters, genre })}
        options={[{ value: 'All', label: 'All Genres' }, ...genres.map((g) => ({ value: g, label: g }))]}
      />
      <FilterSelect
        icon={CalendarDays}
        ariaLabel="Filter by year"
        value={filters.year}
        onChange={(year) => onChange({ ...filters, year })}
        options={[{ value: 'All', label: 'All Years' }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
      />
      <FilterSelect
        icon={ArrowDownUp}
        ariaLabel="Sort series"
        value={filters.sort}
        onChange={(sort) => onChange({ ...filters, sort: sort as DiscoverSort })}
        options={(Object.keys(SORT_LABELS) as DiscoverSort[]).map((key) => ({
          value: key,
          label: 'Sort by: ' + SORT_LABELS[key],
        }))}
      />
    </div>
  );
}