'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SeriesCardData } from '../components/shared/SeriesCard';

// Matches the `pagination` envelope GET /series now returns when called
// with ?page=/&limit= (see P2-04 backend handoff). Backend keeps returning
// the old full-list shape (no `pagination` key) for every caller that
// omits these params, which is most of the app -- see the "deliberately
// not paginated" comments on those fetch sites.
export interface SeriesPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

// D2-01: the real query params GET /series now accepts (see the backend
// handoff on that item) -- all optional, all combine with AND. Passing
// this to usePaginatedSeries switches it from plain pagination over the
// unfiltered catalog into a server-driven filtered/sorted result set.
export interface SeriesQueryFilters {
  q?: string;
  country?: string;
  genre?: string;
  year_min?: number | string;
  year_max?: number | string;
  status?: string;
  episode_min?: number | string;
  episode_max?: number | string;
  rating_min?: number | string;
  sort?: string;
}

function buildSeriesUrl(page: number, limit: number, filters?: SeriesQueryFilters): string {
  const params = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
  }
  params.set('page', String(page));
  params.set('limit', String(limit));
  return process.env.NEXT_PUBLIC_API_URL + '/series?' + params.toString();
}

// Only the Series/Discover browse page uses this: it's the one place in
// the app that renders a flat, potentially-large grid of series cards the
// user pages through. Everywhere else (Moods, Tropes, New Releases,
// Collections' add-series search) needs the *whole* catalog up front to
// compute matches/rankings/search results, so pagination would silently
// corrupt those instead of helping -- see P2-04 frontend notes.
//
// D2-01: `filters` is optional and, when provided, moves search/filter/
// sort onto the real GET /series query params (see SeriesQueryFilters)
// instead of the caller's own client-side .filter()/.sort() over whatever
// page happens to be loaded. Passing `undefined` preserves the original
// plain-pagination behavior exactly -- this is how DiscoverAuthed/
// SeriesFilter still use a *second*, unfiltered instance of this same
// hook to source dropdown filter options and the curated/browse rows,
// alongside a *filtered* instance (with `filters` set) that drives the
// actual results grid once a search/filter is active.
//
// `filters` changing (by value, not just identity -- see the JSON.
// stringify dependency below) always re-fetches page 1 and replaces the
// current series/pagination, including on first mount: a deep link that
// already has ?q=<term> in the URL needs its results corrected
// immediately, not just on the next filter change.
export function usePaginatedSeries(
  initialSeries: SeriesCardData[],
  initialPagination: SeriesPagination | null,
  filters?: SeriesQueryFilters,
  limit = initialPagination?.limit ?? 24
) {
  const [series, setSeries] = useState(initialSeries);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const filtersKey = JSON.stringify(filters ?? null);

  useEffect(() => {
    // Base/unfiltered instances (filters === undefined, e.g. the one
    // sourcing dropdown options) never auto-fetch here -- their initial
    // data is already the correct unfiltered page 1, and growth only
    // happens through loadMore, exactly like before D2-01.
    if (filters === undefined) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(buildSeriesUrl(1, limit, filters), { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setSeries((json.data || []) as SeriesCardData[]);
        setPagination((json.pagination ?? null) as SeriesPagination | null);
      } catch {
        // Same "leave it where it was" fallback as loadMore below --
        // the calling component's own error state (if any) is out of
        // scope here (see D1-01, a separate item on getSeries() itself).
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // filters is intentionally represented by filtersKey (a stable,
    // value-based dependency) rather than the object reference itself,
    // since callers naturally rebuild the filters object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, limit]);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.has_more || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const res = await fetch(buildSeriesUrl(nextPage, pagination.limit, filters), { cache: 'no-store' });

      if (!res.ok) return;

      const json = await res.json();
      const nextSeries = (json.data || []) as SeriesCardData[];
      setSeries((prev) => [...prev, ...nextSeries]);
      setPagination(json.pagination ?? null);
    } catch {
      // Load more is a nicety, not a blocker -- on failure the list just
      // stays where it was and the button remains for a retry.
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, loadingMore, filtersKey]);

  return {
    series,
    hasMore: pagination?.has_more ?? false,
    loading,
    loadingMore,
    loadMore,
  };
}
