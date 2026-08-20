'use client';

export type SeriesTabKey = 'all' | 'series' | 'movies' | 'drafts' | 'published' | 'archived';

export interface SeriesTabCounts {
  all: number;
  series: number;
  movies: number;
  drafts: number;
  published: number;
  archived: number;
}

const TABS: { key: SeriesTabKey; label: string }[] = [
  { key: 'all', label: 'All Titles' },
  { key: 'series', label: 'Series' },
  { key: 'movies', label: 'Movies' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'published', label: 'Published' },
  { key: 'archived', label: 'Archived' },
];

// S1-03: matches GET /admin/series' `counts` response shape exactly (see
// admin/series.ts) -- all/series/movies come from the type facet, drafts/
// published/archived from the publish_status facet, both computed off the
// FULL catalog regardless of the currently active tab or filters, so a tab
// count never collapses to zero just because you're already on it.
export default function SeriesTabs({
  active,
  counts,
  onChange,
}: {
  active: SeriesTabKey;
  counts: SeriesTabCounts | null;
  onChange: (tab: SeriesTabKey) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-px" role="tablist" aria-label="Filter by type or publish status">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={
              'flex items-center gap-2 px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap border-b-2 transition-colors ' +
              (isActive
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground')
            }
          >
            {tab.label}
            <span
              className={
                'text-[11.5px] font-bold px-1.5 py-0.5 rounded-full ' +
                (isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
              }
            >
              {counts ? counts[tab.key] : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
