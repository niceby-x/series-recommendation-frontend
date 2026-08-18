'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import AdminAccountMenu from './AdminAccountMenu';

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

// Mounted by AdminShell inside its top-bar strip (see the isDashboard
// branch there), not by the dashboard page itself -- that strip sits
// above the scrollable <main>, so this row gets the same sticky-at-top
// behavior every other admin page's top bar already has for free, rather
// than scrolling away with the stat cards/queue table beneath it. Takes
// `email` (not the full Supabase `User`) since that's what AdminShell's
// own session fetch already has on hand, the same value AdminAccountMenu
// receives elsewhere.
export default function AdminHeader({ email }: { email: string | null }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SeriesSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lint fix: react-hooks/set-state-in-effect flagged setResults/setLoading
  // being called directly (unconditionally, outside any timer/promise) in
  // the effect body below -- calling setState synchronously within an
  // effect can trigger cascading renders. Both calls belonged to reacting
  // to the *keystroke itself* (clear stale results below the minimum
  // length, or show a loading state while the debounce timer is pending),
  // not to anything the effect's own async fetch produced -- so they
  // belong in the change handler (a normal event handler, not an effect)
  // instead. The effect now only ever calls setState from inside the
  // timeout's async callback, which is exactly what the rule allows.
  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      // Nothing to fetch -- handleQueryChange already reset results/loading
      // for this case, so the effect itself has no state to set here.
      return;
    }

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

  const displayName = email ? email.split('@')[0] : 'Admin';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const trimmedQuery = query.trim();
  const showDropdown = open && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between gap-x-5 gap-y-4 w-full">
      <div className="min-w-0 shrink-0 max-w-full">
        <h1 className="font-heading text-[18px] md:text-[20px] leading-tight font-normal text-foreground flex items-center gap-1.5 min-w-0">
          <span className="min-w-0 truncate">
            {getGreeting()}, {capitalizedName}
          </span>
          <FlowerIcon className="size-3.5 text-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-[12px] mt-0.5">Here&apos;s what&apos;s happening with BLumi today.</p>
      </div>

      <div className="flex items-center gap-3 min-w-0 ml-auto sm:ml-0">
        <div ref={containerRef} className="hidden md:block relative flex-1 min-w-[220px] max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
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

        {/* D2-04: the bell used to be here, but notifCount was literally
            counts.pending -- the exact same number already badged on the
            sidebar's Candidates row, shown again under a "Notifications"
            label that implied a general activity stream that doesn't
            exist. Removed rather than kept as an empty icon: there's
            nothing frontend-only can wire it to that isn't already shown
            elsewhere, and a real general notification source (a flagged
            review, a new report, etc.) is backend work this task's scope
            doesn't cover. Bring it back once that source exists. */}

        {/* The avatar + name/"Admin" block that used to live here was a
            static, non-interactive duplicate of the account control. Now
            replaced with AdminAccountMenu itself, right in this row so the
            greeting, search, and account pill all sit on one line -- same
            avatar+chevron pill style as the public site's DashboardHeader,
            with the real Signed-in-as/Log-out dropdown behind it. */}
        <AdminAccountMenu email={email} />
      </div>
    </div>
  );
}
