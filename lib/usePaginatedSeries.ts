'use client';

import { useCallback, useState } from 'react';
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

// Only the Series/Discover browse page uses this: it's the one place in
// the app that renders a flat, potentially-large grid of series cards the
// user pages through. Everywhere else (Moods, Tropes, New Releases,
// Collections' add-series search) needs the *whole* catalog up front to
// compute matches/rankings/search results, so pagination would silently
// corrupt those instead of helping -- see P2-04 frontend notes.
export function usePaginatedSeries(
  initialSeries: SeriesCardData[],
  initialPagination: SeriesPagination | null
) {
  const [series, setSeries] = useState(initialSeries);
  const [pagination, setPagination] = useState(initialPagination);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.has_more || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          '/series?page=' + nextPage + '&limit=' + pagination.limit,
        { cache: 'no-store' }
      );

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
  }, [pagination, loadingMore]);

  return {
    series,
    hasMore: pagination?.has_more ?? false,
    loadingMore,
    loadMore,
  };
}
