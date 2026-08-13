'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthModal } from '../../lib/AuthModalContext';
import type { User } from '@supabase/supabase-js';

// Shape of the `progress` field returned by GET /watchlist/:seriesId/progress
// (see backend src/routes/watchlist.ts). Q2-03: previously there was no
// per-series GET for progress alone, so prefill fetched the entire
// watchlist and matched this series by id -- an O(n) fetch just to check
// one row. This dedicated endpoint replaces that.
interface ExistingProgress {
  current_episode: number;
  minutes_remaining: number | null;
}

export default function ProgressTracker({
  seriesId,
  episodeCount,
}: {
  seriesId: number;
  episodeCount: number;
}) {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState('');
  const [minutesRemaining, setMinutesRemaining] = useState('');
  // Drives "Update" vs "Save" copy, same reasoning RatingForm.tsx uses
  // for hasExistingRating -- and, per Q1-01, this is the piece that was
  // missing entirely: without prefilling from an existing row, a signed-in
  // user resuming this page would submit a blank/lower episode number and
  // silently regress their own saved progress.
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);

      if (!session) return;

      fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist/' + seriesId + '/progress', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      })
        .then((res) => {
          if (res.status === 401) {
            setError('Your session expired. Please sign in again.');
            setSessionExpired(true);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then((json) => {
          const progress: ExistingProgress | null = json?.progress ?? null;
          if (progress) {
            setCurrentEpisode(String(progress.current_episode));
            setMinutesRemaining(
              progress.minutes_remaining != null ? String(progress.minutes_remaining) : ''
            );
            setHasExistingProgress(true);
          }
        })
        .catch(() => {
          // Prefill is a nicety, not a blocker -- if it fails, the form
          // just starts blank and the upsert on submit still works fine.
        });
    });
  }, [seriesId]);

  async function handleSubmit() {
    const episodeNum = parseInt(currentEpisode, 10);
    if (!Number.isInteger(episodeNum) || episodeNum < 1) {
      setError('Enter a valid episode number (1 or higher).');
      return;
    }

    const minutesTrimmed = minutesRemaining.trim();
    const minutesNum = minutesTrimmed === '' ? null : parseInt(minutesTrimmed, 10);
    if (minutesNum != null && (!Number.isInteger(minutesNum) || minutesNum < 0)) {
      setError('Minutes left must be a whole number, 0 or higher.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitted(false);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError('Your session expired. Please sign in again.');
      setSubmitting(false);
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist/' + seriesId + '/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({
        current_episode: episodeNum,
        minutes_remaining: minutesNum,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.message || 'Something went wrong saving your progress.');
      setSubmitting(false);
      return;
    }

    setHasExistingProgress(true);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (checkingSession) {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm mt-6">
        <p className="text-muted-foreground">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="text-primary hover:text-brand-purple-vivid"
          >
            Sign in
          </button>{' '}
          to track your episode progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-3 font-heading text-brand-gradient">
        {hasExistingProgress ? 'Update your progress' : 'Track your progress'}
      </h2>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Current episode</span>
          <input
            type="number"
            min={1}
            max={episodeCount > 0 ? episodeCount : undefined}
            value={currentEpisode}
            onChange={(e) => setCurrentEpisode(e.target.value)}
            className="w-28 bg-background border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:border-ring transition-colors"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Minutes left (optional)</span>
          <input
            type="number"
            min={0}
            value={minutesRemaining}
            onChange={(e) => setMinutesRemaining(e.target.value)}
            className="w-28 bg-background border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:border-ring transition-colors"
          />
        </label>

        {episodeCount > 0 && <span className="text-muted-foreground text-xs pb-2.5">of {episodeCount} episodes</span>}
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}
      {submitted && !error && <p className="text-[#3D7A4F] text-sm mb-4">Progress saved!</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || currentEpisode.trim() === '' || sessionExpired}
        className="bg-brand-gradient hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition-opacity"
      >
        {submitting ? 'Saving...' : sessionExpired ? 'Sign in required' : hasExistingProgress ? 'Update Progress' : 'Save Progress'}
      </button>
    </div>
  );
}
