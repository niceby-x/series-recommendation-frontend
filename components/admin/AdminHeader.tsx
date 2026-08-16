'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import FlowerIcon from '../shared/FlowerIcon';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface SeriesSearchResult {
  id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
}

// D1-02: was visual-only -- looked and behaved exactly like working
// search (focus states, a ⌘K hint, an editable input) but its own code
// comment admitted it didn't submit anywhere. Now a real debounced search
// against GET /series?q=, which already does a case-insensitive title
// match server-side (see series.ts) and is public, so no auth token is
// needed here.
//
// Deliberately series-only, not "series, users, moods" like the old
// placeholder implied: GET /admin/users has no q filter yet and needs an
// admin Bearer token this component doesn't receive (it only gets
// user/notifCount) -- wiring that too would mean a backend change plus
// threading accessToken through every one of the ~12 admin pages that
// render this header. Rather than re-create the exact "looks like it does
// more than it does" problem this task exists to fix, the label and
// results only cover what's actually wired.
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_RESULTS = 6;

export default function AdminHeader({ user, notifCount }: { user: User | null; notifCount: number }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SeriesSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/series?q=' + encodeURIComponent(trimmed) + '&limit=' + MAX_RESULTS
        );
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch {
        // Network hiccup mid-type -- leave whatever results are already
        // showing rather than clearing them out from under the admin.
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click-outside to close the results dropdown, same pattern used
  // elsewhere in the app for dismissible panels.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // The ⌘K hint used to be decorative -- now it actually focuses the
  // input, same honest-affordance fix as the search itself.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName = user?.email ? user.email.split('@')[0] : 'Admin';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const initial = displayName.charAt(0).toUpperCase();
  const trimmedQuery = query.trim();
  const showDropdown = open && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between gap-x-5 gap-y-4 mb-8">
      <div className="min-w-0 shrink-0 max-w-full">
        <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground flex items-center gap-2 min-w-0">
          <span className="min-w-0 truncate">
            {getGreeting()}, {capitalizedName}
          </span>
          <FlowerIcon className="size-5 text-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">Here&apos;s what&apos;s happening with BLumi today.</p>
      </div>

      <div className="flex items-center gap-3 min-w-0 ml-auto sm:ml-0">
        <div ref={containerRef} className="hidden md:block relative flex-1 min-w-[220px] max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search series..."
            className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-10 pr-14 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground/70 border border-border rounded-md px-1.5 py-0.5 pointer-events-none">
            ⌘K
          </span>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-20 max-h-80 overflow-y-auto">
              {loading && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
              )}
              {!loading && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">No series match &ldquo;{trimmedQuery}&rdquo;.</p>
              )}
              {results.map((series) => (
                <Link
                  key={series.id}
                  href={'/series/' + series.id}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  {series.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={series.poster_url} alt="" className="size-8 rounded-md object-cover shrink-0" />
                  ) : (
                    <span className="size-8 rounded-md bg-muted shrink-0" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-foreground truncate">{series.title}</span>
                    {series.year && <span className="block text-[11.5px] text-muted-foreground">{series.year}</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center size-10 rounded-full bg-card border border-border text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
        >
          <Bell className="size-4.5" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {notifCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center justify-center size-10 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading">
            {initial}
          </span>
          <span className="hidden sm:block text-left">
            <span className="block text-[13.5px] font-semibold text-foreground leading-tight">{capitalizedName}</span>
            <span className="block text-[11.5px] text-muted-foreground leading-tight">Super Admin</span>
          </span>
        </div>
      </div>
    </div>
  );
}
