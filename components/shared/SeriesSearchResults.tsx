'use client';

import Link from 'next/link';
import type { SeriesSearchResult } from '../../lib/useSeriesSearch';

// Just the dropdown's contents, not the positioned wrapper -- each header
// places this differently relative to its own input (admin's sits inside a
// fixed-width search box, the public site's forms vary in width/position),
// so the wrapper (position, width, top offset) stays with each caller.
// bg-popover/border-border matches the same dropdown surface used
// elsewhere on both sides of the app (account menus, notifications,
// recent-searches), rather than AdminHeader's original bg-card, so a live
// search result list looks like the same kind of menu everywhere it shows
// up.
export default function SeriesSearchResults({
  query,
  loading,
  results,
  onSelect,
}: {
  query: string;
  loading: boolean;
  results: SeriesSearchResult[];
  onSelect?: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
      {loading && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
      )}
      {!loading && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-muted-foreground">No series match &ldquo;{query}&rdquo;.</p>
      )}
      {results.map((series) => (
        <Link
          key={series.id}
          href={'/series/' + series.id}
          onClick={onSelect}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
        >
          {series.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={series.poster_url} alt="" className="size-8 rounded-md object-cover shrink-0" />
          ) : (
            <span className="size-8 rounded-md bg-muted shrink-0" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-popover-foreground truncate">{series.title}</span>
            {series.year && <span className="block text-[11.5px] text-muted-foreground">{series.year}</span>}
          </span>
        </Link>
      ))}
    </div>
  );
}
