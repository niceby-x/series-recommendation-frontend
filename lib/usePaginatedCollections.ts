'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RealCollection } from '../components/collections/CollectionCard';

// Matches the `pagination` envelope GET /collections now returns when
// called with ?page=/&limit= (see G1-02's backend handoff) -- same shape
// as GET /series' own SeriesPagination.
export interface CollectionsPagination {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

// G1-02: `sort` has to be a real query param, not a client-side re-sort of
// whatever page happens to be loaded -- see the backend handoff for why
// (most_series in particular depends on the full matching set to sort
// correctly, computed server-side now).
export interface CollectionsQueryFilters {
  mine?: boolean;
  sort?: 'updated' | 'alpha' | 'most_series';
}

function buildCollectionsUrl(page: number, limit: number, filters: CollectionsQueryFilters): string {
  const params = new URLSearchParams();
  if (filters.mine) params.set('mine', 'true');
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return process.env.NEXT_PUBLIC_API_URL + '/collections?' + params.toString();
}

// G1-02: CollectionsAuthed uses two independent instances of this -- one
// with { mine: true } for "My Collections", one with { sort } for
// "Curated Collections" -- replacing a single unpaginated fetch-everything
// call each. Unlike usePaginatedSeries, there's no "unfiltered base
// instance" case here (every Collections fetch always wants real
// mine/sort-scoped data, nothing sources a dropdown off an unfiltered
// list), so this always fetches on mount and whenever `filters` changes,
// no skip case needed.
export function usePaginatedCollections(
  initial: RealCollection[],
  initialPagination: CollectionsPagination | null,
  filters: CollectionsQueryFilters,
  accessToken: string | null,
  limit = initialPagination?.limit ?? 20
) {
  const [collections, setCollections] = useState(initial);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (filters.mine && !accessToken) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const headers = accessToken ? { Authorization: 'Bearer ' + accessToken } : undefined;
        const res = await fetch(buildCollectionsUrl(1, limit, filters), { headers, cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setCollections((json.data || []) as RealCollection[]);
        setPagination((json.pagination ?? null) as CollectionsPagination | null);
      } catch {
        // Leave the list where it was -- CollectionsAuthed's own loaded
        // flag (for the "you haven't made a collection yet" empty state)
        // is a separate concern from a fetch failure here.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, limit, accessToken]);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.has_more || loadingMore || (filters.mine && !accessToken)) return;

    setLoadingMore(true);
    try {
      const headers = accessToken ? { Authorization: 'Bearer ' + accessToken } : undefined;
      const nextPage = pagination.page + 1;
      const res = await fetch(buildCollectionsUrl(nextPage, pagination.limit, filters), { headers, cache: 'no-store' });

      if (!res.ok) return;

      const json = await res.json();
      const next = (json.data || []) as RealCollection[];
      setCollections((prev) => [...prev, ...next]);
      setPagination(json.pagination ?? null);
    } catch {
      // Load more is a nicety, not a blocker -- on failure the list just
      // stays where it was and the button remains for a retry.
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, loadingMore, filtersKey, accessToken]);

  // setCollections is exposed directly (not wrapped) so CollectionsAuthed
  // can still do optimistic local updates -- prepending a just-created
  // collection, removing a just-deleted one -- the same way it already
  // updated its own `mine` state before this hook existed.
  return {
    collections,
    setCollections,
    hasMore: pagination?.has_more ?? false,
    total: pagination?.total ?? collections.length,
    loading,
    loadingMore,
    loadMore,
  };
}
