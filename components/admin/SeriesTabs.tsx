'use client';

import { Fragment } from 'react';
import { Sparkles, Tv, Clapperboard, FileText, BadgeCheck, Archive, type LucideIcon } from 'lucide-react';

export type SeriesTabKey = 'all' | 'series' | 'movies' | 'drafts' | 'published' | 'archived';

export interface SeriesTabCounts {
  all: number;
  series: number;
  movies: number;
  drafts: number;
  published: number;
  archived: number;
}

const TABS: { key: SeriesTabKey; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All Titles', icon: Sparkles },
  { key: 'series', label: 'Series', icon: Tv },
  { key: 'movies', label: 'Movies', icon: Clapperboard },
  { key: 'drafts', label: 'Drafts', icon: FileText },
  { key: 'published', label: 'Published', icon: BadgeCheck },
  { key: 'archived', label: 'Archived', icon: Archive },
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
    <div
      className="w-full flex items-center justify-between gap-1 overflow-x-auto rounded-full bg-white border border-border/50 shadow-md p-1.5"
      role="tablist"
      aria-label="Filter by type or publish status"
    >
      {TABS.map((tab, i) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          // Divider rendered as a flat sibling of the buttons -- not
          // nested inside a per-tab wrapper -- so justify-between splits
          // the leftover space equally on BOTH sides of it. Nesting it
          // with the following button inside one wrapper div put the
          // whole gap on one side only (between the previous tab and the
          // wrapper), leaving the divider glued to the next tab instead
          // of centered between the two.
          <Fragment key={tab.key}>
            {i > 0 && <span aria-hidden className="w-px h-5 bg-border/60 shrink-0" />}
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={
                'flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors ' +
                (isActive
                  ? 'bg-gradient-to-r from-brand-blush/35 to-brand-lilac/25 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60')
              }
            >
              <Icon className={'size-4 shrink-0 ' + (isActive ? 'text-primary' : 'text-muted-foreground/70')} />
              {tab.label}
              <span
                className={
                  'text-[11.5px] font-bold px-1.5 py-0.5 rounded-full ' +
                  (isActive ? 'bg-white/70 text-primary' : 'bg-muted text-muted-foreground')
                }
              >
                {counts ? counts[tab.key] : '—'}
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
