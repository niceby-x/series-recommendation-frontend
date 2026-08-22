'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Loader2, Plus, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// IMP5-01: the "Add by Title" tab of the Import & Sync page -- a manual,
// single-item complement to the bulk keyword-discovery importer. Title
// search finds a specific known show/movie; it can't surface content the
// admin doesn't already know the name of, which is the bulk importer's
// job (see GET /admin/import/search-title's own comment on the backend).
// This is for the "an admin heard about a new BL series and wants to add
// it right now, rather than wait for the next discovery run to maybe
// surface it" case.
//
// A self-contained component (owns its own search/add state), same
// reasoning as ImportHistoryTable -- only ever mounted while this tab is
// active, so switching away and back always starts from a fresh empty
// search rather than a stale result list.

interface SearchResult {
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number | null;
  mediaType: 'tv' | 'movie';
  posterUrl: string | null;
  overview: string;
  alreadyExists: boolean;
}

// Per-row add state, keyed by tmdbId -- a plain 'adding' boolean wouldn't
// work here since multiple rows can be added independently/concurrently,
// and each needs its own success/error outcome shown next to it rather
// than one shared status for the whole result list.
type AddState = 'idle' | 'adding' | 'added' | 'error';

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

export default function ImportAddByTitle() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [addStates, setAddStates] = useState<Record<number, AddState>>({});
  const [addErrors, setAddErrors] = useState<Record<number, string>>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(null);
    // A fresh search starts with a clean slate -- any add-state pills
    // from a previous search's results would otherwise reference tmdbIds
    // that may no longer even be on screen.
    setAddStates({});
    setAddErrors({});

    const header = await authHeader();
    if (!header) {
      setSearching(false);
      setSearchError('You must be signed in to search.');
      return;
    }

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/admin/import/search-title?q=' + encodeURIComponent(trimmed),
      { headers: header }
    );
    setSearching(false);

    if (!res.ok) {
      setSearchError('Search failed. Try again.');
      return;
    }

    const json = await res.json();
    setResults(json.results || []);
  }

  async function handleAdd(result: SearchResult) {
    setAddStates((prev) => ({ ...prev, [result.tmdbId]: 'adding' }));
    setAddErrors((prev) => {
      const next = { ...prev };
      delete next[result.tmdbId];
      return next;
    });

    const header = await authHeader();
    if (!header) {
      setAddStates((prev) => ({ ...prev, [result.tmdbId]: 'error' }));
      setAddErrors((prev) => ({ ...prev, [result.tmdbId]: 'You must be signed in.' }));
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/import/add-by-tmdb-id', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId: result.tmdbId, mediaType: result.mediaType }),
    });

    if (res.status === 409) {
      // Already queued/cataloged -- e.g. added a second ago, or another
      // admin just added the same title. Reflect it the same way an
      // already-existing result looks, not as a failure.
      setAddStates((prev) => ({ ...prev, [result.tmdbId]: 'added' }));
      setResults((prev) => prev && prev.map((r) => (r.tmdbId === result.tmdbId ? { ...r, alreadyExists: true } : r)));
      return;
    }

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setAddStates((prev) => ({ ...prev, [result.tmdbId]: 'error' }));
      setAddErrors((prev) => ({ ...prev, [result.tmdbId]: json?.message || 'Could not add. Try again.' }));
      return;
    }

    setAddStates((prev) => ({ ...prev, [result.tmdbId]: 'added' }));
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5 mb-6">
        <label htmlFor="title-search" className="block text-[12.5px] font-semibold text-foreground mb-1.5">
          Search TMDB by title
        </label>
        <div className="flex items-center gap-3">
          <input
            id="title-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Cherry Magic"
            className="flex-1 bg-background text-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {searchError && <p className="text-rose-500 text-[13px] mt-3">{searchError}</p>}
        <p className="text-muted-foreground text-[12px] mt-2">
          Searches TV and movie titles on TMDB directly -- for finding a specific show you already know about, not
          for discovering new ones. Use the Run Import tab for that.
        </p>
      </form>

      {results !== null && (
        <div className="rounded-[20px] bg-card border border-border/60 shadow-sm overflow-hidden">
          {results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-foreground font-semibold mb-1">No results</p>
              <p className="text-muted-foreground text-sm">Try a different spelling or a shorter title.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {results.map((result) => (
                <SearchResultRow
                  key={result.tmdbId}
                  result={result}
                  addState={addStates[result.tmdbId] ?? 'idle'}
                  addError={addErrors[result.tmdbId]}
                  onAdd={() => handleAdd(result)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({
  result,
  addState,
  addError,
  onAdd,
}: {
  result: SearchResult;
  addState: AddState;
  addError?: string;
  onAdd: () => void;
}) {
  return (
    <li className="flex items-start gap-3 px-5 py-4">
      <div className="relative shrink-0 size-16 rounded-[10px] overflow-hidden bg-muted">
        {result.posterUrl ? (
          <Image src={result.posterUrl} alt={result.title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-foreground text-[14px] font-semibold">{result.title}</p>
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
            {result.mediaType === 'tv' ? 'TV' : 'Movie'}
          </span>
          {result.alreadyExists && addState !== 'added' && (
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 rounded-full px-1.5 py-0.5">
              Already in catalog
            </span>
          )}
        </div>
        {result.originalTitle && result.originalTitle !== result.title && (
          <p className="text-muted-foreground text-[12.5px]">{result.originalTitle}</p>
        )}
        <p className="text-muted-foreground text-[12.5px] mt-0.5">
          {result.year ?? 'Year unknown'}
        </p>
        {result.overview && (
          <p className="text-muted-foreground text-[12.5px] mt-1 line-clamp-2">{result.overview}</p>
        )}
        {addError && (
          <p className="flex items-center gap-1 text-rose-500 text-[12.5px] mt-1.5">
            <AlertTriangle className="size-3.5" />
            {addError}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <AddButton result={result} addState={addState} onAdd={onAdd} />
      </div>
    </li>
  );
}

function AddButton({ result, addState, onAdd }: { result: SearchResult; addState: AddState; onAdd: () => void }) {
  // Already-cataloged (from the search response) and just-added (from
  // this session's own add) render the same way -- both mean "there's
  // nothing left to do here", just reached by different paths.
  if (result.alreadyExists || addState === 'added') {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 text-[12.5px] font-semibold px-3 py-2">
        <Check className="size-4" />
        {addState === 'added' && !result.alreadyExists ? 'Added' : 'In catalog'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={addState === 'adding'}
      className="flex items-center gap-1.5 bg-brand-gradient text-white px-3 py-2 rounded-full text-[12.5px] font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
    >
      {addState === 'adding' ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
      {addState === 'adding' ? 'Adding…' : addState === 'error' ? 'Retry' : 'Add'}
    </button>
  );
}
