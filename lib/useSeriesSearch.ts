'use client';

import { useEffect, useState } from 'react';

export interface SeriesSearchResult {
  id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
}

export const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MAX_RESULTS = 6;

// Originally AdminHeader-only (see D1-02: the admin search used to be
// visual-only, now a real debounced GET /series?q= lookup). The public
// site's own search bars (Navbar, DashboardHeader) only ever submitted to
// /series?q=... on Enter, with no live feedback while typing -- a
// noticeably different, less responsive experience than the admin panel's
// search for what's meant to be the same underlying feature. Pulling the
// debounce/fetch logic out into one shared hook (rather than copying
// AdminHeader's effect three times) guarantees the three surfaces actually
// stay identical -- same debounce window, same minimum query length, same
// result cap, same endpoint -- instead of three copies that quietly drift
// out of sync the next time one of them gets tweaked.
//
// Lint note (react-hooks/set-state-in-effect): the "reset to empty" and
// "start loading" state changes happen in setQuery below, a normal event
// handler -- not synchronously in the effect body. The effect itself only
// ever calls setResults/setLoading from inside the debounce timeout's
// callback, which the rule allows (deferred by the timer, not part of the
// render → effect → render chain). Same split AdminHeader's original
// implementation used; keep it if this hook is ever changed.
export function useSeriesSearch() {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SeriesSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  function setQuery(value: string) {
    setQueryState(value);
    if (value.trim().length < SEARCH_MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  function reset() {
    setQueryState('');
    setResults([]);
    setLoading(false);
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL +
            '/series?q=' +
            encodeURIComponent(trimmed) +
            '&limit=' +
            SEARCH_MAX_RESULTS
        );
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch {
        // Network hiccup mid-type -- leave whatever results are already
        // showing rather than clearing them out from under the person.
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  return { query, setQuery, results, loading, reset };
}
