'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Status = 'plan_to_watch' | 'watching' | 'completed';

const STATUS_LABELS: Record<Status, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
};

export default function WatchlistButton({ seriesId }: { seriesId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchStatus() {
      setLoadingStatus(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingStatus(false);
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist/' + seriesId, {
        headers: { Authorization: 'Bearer ' + session.access_token },
      });
      const json = await res.json();

      setCurrentStatus(json.status);
      setLoadingStatus(false);
    }

    fetchStatus();
  }, [user, seriesId]);

  async function handleSetStatus(status: Status) {
    setUpdating(true);
    setError('');
    setMenuOpen(false);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setError('Your session expired. Please sign in again.');
      setUpdating(false);
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({ series_id: seriesId, status }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.message || 'Something went wrong updating your watchlist.');
      setUpdating(false);
      return;
    }

    setCurrentStatus(status);
    setUpdating(false);
  }

  async function handleRemove() {
    setUpdating(true);
    setError('');
    setMenuOpen(false);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setError('Your session expired. Please sign in again.');
      setUpdating(false);
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist/' + seriesId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.message || 'Something went wrong removing this series.');
      setUpdating(false);
      return;
    }

    setCurrentStatus(null);
    setUpdating(false);
  }

  if (checkingSession || (user && loadingStatus)) {
    return null;
  }

  if (!user) {
    return (
      <p className="text-gray-400 text-sm">
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>{' '}
        to add this to your watchlist.
      </p>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={updating}
        className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          currentStatus
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-60`}
      >
        {updating
          ? 'Updating...'
          : currentStatus
          ? STATUS_LABELS[currentStatus]
          : '+ Add to List'}
      </button>

      {menuOpen && (
        <div className="absolute mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
          {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
            <button
              key={status}
              onClick={() => handleSetStatus(status)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                currentStatus === status ? 'text-blue-400' : 'text-gray-300'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
          {currentStatus && (
            <button
              onClick={handleRemove}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-800"
            >
              Remove from List
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}