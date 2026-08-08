'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  plan_to_watch: 'bg-gray-800 text-gray-300',
  watching: 'bg-blue-900 text-blue-300',
  completed: 'bg-green-900 text-green-300',
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}

function SeriesCard({ entry }: { entry: WatchlistEntry }) {
  return (
    <Link
      href={'/series/' + entry.series.id}
      className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
    >
      <div className="relative aspect-[2/3] bg-gray-800 overflow-hidden">
        {entry.series.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.series.poster_url}
            alt={entry.series.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm px-4 text-center">
            {entry.series.title}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />

        <div className="absolute top-2 left-2 flex gap-2">
          <span className="text-xs bg-blue-900/90 text-blue-300 px-2 py-1 rounded backdrop-blur-sm">
            {entry.series.country}
          </span>
        </div>

        <span
          className={
            'absolute top-2 right-2 text-xs px-2 py-1 rounded backdrop-blur-sm ' +
            STATUS_BADGE_STYLES[entry.status]
          }
        >
          {STATUS_LABELS[entry.status]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold leading-snug mb-1 line-clamp-2">{entry.series.title}</h3>
        <p className="text-sm text-gray-400">
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
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <p className="text-gray-400">
          <button type="button" onClick={() => openAuthModal('login')} className="text-blue-400 hover:text-blue-300">
            Sign in
          </button>{' '}
          to see your list.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">My List</h1>
      <p className="text-gray-400 mb-8">Series you&apos;re tracking</p>

      {error && <p className="text-red-400">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-gray-400">
          Your list is empty.{' '}
          <Link href="/series" className="text-blue-400 hover:text-blue-300">
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
                <h2 className="text-lg font-semibold text-blue-400 mb-4">
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