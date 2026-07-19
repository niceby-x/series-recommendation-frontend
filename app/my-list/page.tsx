'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Status = 'plan_to_watch' | 'watching' | 'completed';

const STATUS_LABELS: Record<Status, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
};

const STATUS_ORDER: Status[] = ['watching', 'plan_to_watch', 'completed'];

interface Series {
  id: number;
  title: string;
  country: string;
  year: number;
  episode_count: number;
  status: string;
}

interface WatchlistEntry {
  id: number;
  status: Status;
  updated_at: string;
  series: Series;
}

export default function MyListPage() {
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
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchWatchlist() {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
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
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>{' '}
          to see your list.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">My List</h1>
      <p className="text-gray-400 mb-8">Series you&apos;re tracking</p>

      {loading && <p className="text-gray-400">Loading your list...</p>}

      {error && <p className="text-red-400">{error}</p>}

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
                    <Link
                      key={entry.id}
                      href={`/series/${entry.series.id}`}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                          {entry.series.country}
                        </span>
                        <span className="text-xs text-gray-500">{entry.series.year}</span>
                      </div>

                      <h3 className="text-lg font-bold mb-1">{entry.series.title}</h3>

                      <p className="text-sm text-gray-400">
                        {entry.series.episode_count} episodes
                      </p>
                    </Link>
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