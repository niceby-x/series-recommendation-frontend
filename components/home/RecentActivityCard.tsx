'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Star, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatTimeAgo } from '../../lib/formatTime';

// Real per-user activity feed (see H2-04 -- backed by GET /me/activity,
// replaces MOCK_RECENT_ACTIVITY). Fetched client-side, same
// auth-header pattern as WatchlistButton/RatingForm, since it needs the
// signed-in user's session token and isn't available at the server-render
// pass that fetches allSeries in app/page.tsx.
//
// Unlike Continue Watching/Trending/Curator's Picks, this deliberately
// does NOT fall back to mock rows when real data is thin: those are
// catalog listings where a mock row is just an unfilled slot, but every
// row here is a first-person "You did X" claim about the signed-in
// user's own actions -- showing a fabricated one would be misleading
// regardless of how the row is filled. An empty/new-user feed just shows
// an empty state instead.
interface ActivityEntry {
  id: string;
  kind: string;
  series_id: number;
  series_title: string;
  occurred_at: string;
  status?: string;
  score?: number;
}

const KIND_ICON: Record<string, typeof Bookmark> = {
  watchlist: Bookmark,
  rating: Star,
  progress: Play,
};
const KIND_CLASS: Record<string, string> = {
  watchlist: 'bg-brand-lilac/25 text-[#5E4B6B]',
  rating: 'bg-brand-gold/25 text-amber-600',
  progress: 'bg-brand-blush/30 text-primary',
};
const WATCHLIST_STATUS_TEXT: Record<string, string> = {
  completed: 'You finished watching',
  watching: 'You started watching',
  plan_to_watch: 'You added',
};

function describeEntry(entry: ActivityEntry): { text: string; target: string } {
  if (entry.kind === 'rating') {
    return {
      text: 'You rated',
      target: entry.series_title + (entry.score != null ? ' ' + entry.score + '/10' : ''),
    };
  }

  if (entry.kind === 'watchlist') {
    const text = (entry.status && WATCHLIST_STATUS_TEXT[entry.status]) || 'You updated';
    const target = entry.status === 'plan_to_watch' ? entry.series_title + ' to Watchlist' : entry.series_title;
    return { text, target };
  }

  // Covers activity kinds the backend doesn't emit yet (e.g. episode
  // progress -- still blocked on H2-02's own handoff) without crashing
  // on an unrecognized kind.
  return { text: 'Activity on', target: entry.series_title };
}

export default function RecentActivityCard() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) setEntries([]);
        return;
      }

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/me/activity', {
          headers: { Authorization: 'Bearer ' + session.access_token },
        });

        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }

        const json = await res.json();
        if (!cancelled) setEntries((json.data || []) as ActivityEntry[]);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Recent Activity</p>
        <Link href="/my-list" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      {entries === null && !error && <p className="text-muted-foreground text-[13px] py-3">Loading...</p>}

      {error && <p className="text-muted-foreground text-[13px] py-3">Couldn&apos;t load your recent activity.</p>}

      {entries !== null && entries.length === 0 && !error && (
        <p className="text-muted-foreground text-[13px] py-3">
          No activity yet — rate, watch, or add a series to your list to see it here.
        </p>
      )}

      {entries !== null && entries.length > 0 && (
        <div className="flex flex-col">
          {entries.map((entry) => {
            const Icon = KIND_ICON[entry.kind] ?? Bookmark;
            const { text, target } = describeEntry(entry);
            return (
              <Link
                key={entry.id}
                href={'/series/' + entry.series_id}
                className="flex items-start gap-3 py-2.5 -mx-2 px-2 rounded-[12px] hover:bg-muted/60 transition-colors"
              >
                <span
                  className={
                    'flex items-center justify-center size-8 rounded-full shrink-0 ' +
                    (KIND_CLASS[entry.kind] ?? KIND_CLASS.watchlist)
                  }
                >
                  <Icon className="size-3.5" fill={entry.kind === 'rating' ? 'currentColor' : 'none'} />
                </span>
                <p className="text-[13px] text-foreground/85 leading-snug pt-1">
                  {text} <span className="font-semibold text-foreground">{target}</span>
                  <span className="block text-muted-foreground text-[11.5px] mt-0.5">
                    {formatTimeAgo(entry.occurred_at)}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
