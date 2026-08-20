'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export interface SeriesFilterValue {
  country: string | null;
  genre: string | null;
}

// S1-03: header "Filters" button -- opens a small popover with Country/
// Genre selects, backed by GET /admin/series' `filters.countries`/
// `filters.genres` (distinct values across the whole catalog, not just the
// currently-filtered set -- see admin/series.ts). The badge on the button
// itself mirrors the mockup's "Filters 2" pill.
export default function SeriesFiltersButton({
  value,
  countries,
  genres,
  onChange,
}: {
  value: SeriesFilterValue;
  countries: string[];
  genres: string[];
  onChange: (next: SeriesFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = (value.country ? 1 : 0) + (value.genre ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full pl-3.5 pr-3 py-2.5 text-sm font-semibold bg-card border border-border shadow-sm hover:border-ring transition-colors"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center size-[18px] rounded-full bg-primary text-white text-[10.5px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 bg-popover border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-3.5">
          <div>
            <label className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">Country</label>
            <div className="relative mt-1.5">
              <select
                value={value.country ?? ''}
                onChange={(e) => onChange({ ...value, country: e.target.value || null })}
                className="w-full appearance-none bg-card border border-border rounded-xl pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
              >
                <option value="">Any country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">Genre</label>
            <div className="relative mt-1.5">
              <select
                value={value.genre ?? ''}
                onChange={(e) => onChange({ ...value, genre: e.target.value || null })}
                className="w-full appearance-none bg-card border border-border rounded-xl pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
              >
                <option value="">Any genre</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ country: null, genre: null })}
              className="text-[13px] font-semibold text-primary hover:opacity-80 self-start"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
