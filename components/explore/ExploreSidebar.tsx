'use client';

import {
  LayoutGrid,
  Sparkles as NewIcon,
  Flame,
  Star,
  CalendarClock,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

export type NavCategory = 'all' | 'new' | 'trending' | 'top_rated' | 'coming_soon' | 'completed' | 'hidden_gems';

export interface ExploreFilters {
  navCategory: NavCategory;
  country: string; // 'All' or a real country value from the catalog
  genre: string; // 'All' or a real genre name from the catalog (see P2-07/D2-03)
  yearMin: number;
  yearMax: number;
  episodes: string; // 'Any' | '1-12' | '13-24' | '25+'
  rating: string; // 'Any' | '9' | '8' | '7' -- threshold against the real average_rating field
}

interface ExploreSidebarProps {
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  countries: string[];
  // D2-03: real genre names derived from the catalog (GET /series's
  // genre_names field), replacing the fixed mock GENRES taxonomy this
  // dropdown used to render.
  genres: string[];
  dataYearMin: number;
  dataYearMax: number;
  onSurpriseMe: () => void;
  // D1-02: a separate callback from onChange so Clear All can also reset
  // the search term -- onChange only knows about the ExploreFilters shape
  // (navCategory/country/genre/year/episodes/rating), not search, which
  // lives outside it in the URL (see SeriesFilter.tsx's handleClearFilters).
  onClearAll: () => void;
}

const NAV_ITEMS: { key: NavCategory; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'new', label: 'New Releases', icon: NewIcon },
  { key: 'trending', label: 'Trending', icon: Flame },
  { key: 'top_rated', label: 'Top Rated', icon: Star },
  { key: 'coming_soon', label: 'Coming Soon', icon: CalendarClock },
  { key: 'completed', label: 'Just Completed', icon: CheckCircle2 },
];

export default function ExploreSidebar({
  filters,
  onChange,
  countries,
  genres,
  dataYearMin,
  dataYearMax,
  onSurpriseMe,
  onClearAll,
}: ExploreSidebarProps) {
  function set<K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-5 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1 no-scrollbar">
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => set('navCategory', key)}
            className={
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ' +
              (filters.navCategory === key
                ? 'bg-brand-blush/25 text-brand-mauve'
                : 'text-foreground/70 hover:bg-muted')
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-bold text-foreground">Filters</h2>
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => set('country', e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => set('genre', e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring"
            >
              <option value="All">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
              Year
            </label>
            <input
              type="range"
              min={dataYearMin}
              max={dataYearMax}
              value={filters.yearMin}
              onChange={(e) => set('yearMin', Math.min(Number(e.target.value), filters.yearMax))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground -mt-0.5">
              <span>{filters.yearMin}</span>
              <span>{filters.yearMax}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
              Episodes
            </label>
            <select
              value={filters.episodes}
              onChange={(e) => set('episodes', e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring"
            >
              {['Any', '1-12', '13-24', '25+'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
              Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => set('rating', e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring"
            >
              <option value="Any">Any</option>
              <option value="9">9.0+</option>
              <option value="8">8.0+</option>
              <option value="7">7.0+</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSurpriseMe}
        className="w-full flex items-center justify-center gap-2 border border-brand-blush/50 text-brand-mauve font-semibold text-[13px] px-4 py-2 rounded-full hover:bg-brand-blush/10 transition-colors"
      >
        <Wand2 className="size-3.5" />
        Surprise Me
      </button>
    </aside>
  );
}