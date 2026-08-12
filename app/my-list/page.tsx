'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useAuthModal } from '../../lib/AuthModalContext';
import type { User } from '@supabase/supabase-js';

type Status = 'plan_to_watch' | 'watching' | 'completed';

const STATUS_LABELS: Record<Status, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
};

const STATUS_BADGE_STYLES: Record<Status, string> = {
  plan_to_watch: 'bg-muted text-foreground/75',
  watching: 'bg-brand-blush/80 text-[#4A2F3F]',
  completed: 'bg-brand-lilac/80 text-[#3D2E52]',
};

const STATUS_ORDER: Status[] = ['watching', 'plan_to_watch', 'completed'];

interface Series {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  poster_url: string | null;
}

interface WatchlistEntry {
  id: number;
  status: Status;
  updated_at: string;
  series: Series;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

function SeriesCard({ entry }: { entry: WatchlistEntry }) {
  return (
    <Link
      href={'/series/' + entry.series.id}
      className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary/30"
    >
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {entry.series.poster_url ? (
          <Image
            src={entry.series.poster_url}
            alt={entry.series.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 text-muted-foreground text-sm px-4 text-center">
            {entry.series.title}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute top-2 left-2 flex gap-2">
          <span className="text-[13px] font-semibold bg-brand-blush/80 text-[#4A2F3F] px-2.5 py-1 rounded-full backdrop-blur-sm">
            {entry.series.country}
          </span>
        </div>

        <span
          className={
            'absolute top-2 right-2 text-[13px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ' +
            STATUS_BADGE_STYLES[entry.status]
          }
        >
          {STATUS_LABELS[entry.status]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold leading-snug mb-1 line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">{entry.series.title}</h3>
        <p className="text-sm text-muted-foreground">
          {entry.series.year} &middot; {entry.series.episode_count} episodes
        </p>
      </div>
    </Link>
  );
}

export default function MyListPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchWatchlist() {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      });

      if (!res.ok) {
        setError('Could not load your list. Try refreshing the page.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      setEntries(json.data);
      setLoading(false);
    }

    fetchWatchlist();
  }, [user]);

  if (checkingSession) {
    return null;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary hover:text-brand-purple-vivid">
            Sign in
          </button>{' '}
          to see your list.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold font-heading text-brand-gradient mb-2">My List</h1>
      <p className="text-muted-foreground mb-8">Series you&apos;re tracking</p>

      {error && <p className="text-destructive">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-muted-foreground">
          Your list is empty.{' '}
          <Link href="/series" className="text-primary hover:text-brand-purple-vivid">
            Browse series
          </Link>{' '}
          to add some.
        </p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="flex flex-col gap-10">
          {STATUS_ORDER.map((status) => {
            const groupEntries = entries.filter((e) => e.status === status);
            if (groupEntries.length === 0) return null;

            return (
              <section key={status}>
                <h2 className="text-lg font-semibold font-heading text-brand-gradient mb-4">
                  {STATUS_LABELS[status]} ({groupEntries.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupEntries.map((entry) => (
                    <SeriesCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}