'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthModal } from '../../lib/AuthModalContext';
import type { User } from '@supabase/supabase-js';

// Mirrors the backend's POST /ratings cap (see P2-08 handoff) -- keeping
// this in sync with the server lets the textarea's maxLength (and the
// counter below) give inline feedback instead of users hitting the
// server's 400 after typing a review out.
const MAX_REVIEW_LENGTH = 2000;

export default function RatingForm({ seriesId }: { seriesId: number }) {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [score, setScore] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Whether the user already had a rating for this series before this page
  // load -- drives the "Update" vs "Submit" copy below, and lets the
  // upserting POST /ratings behave predictably instead of silently
  // overwriting a prior review with no indication it was ever there.
  const [hasExistingRating, setHasExistingRating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);

      if (!session) return;

      fetch(process.env.NEXT_PUBLIC_API_URL + '/ratings/mine/' + seriesId, {
        headers: { Authorization: 'Bearer ' + session.access_token },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            setScore(json.data.score);
            setReviewText(json.data.review_text ?? '');
            setHasExistingRating(true);
          }
        })
        .catch(() => {
          // Prefill is a nicety, not a blocker -- if it fails, the form
          // just starts blank and the upsert on submit still works fine.
        });
    });
  }, [seriesId]);

  async function handleSubmit() {
    if (score < 1 || score > 10) {
      setError('Please choose a score between 1 and 10.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setError('Your session expired. Please sign in again.');
      setSubmitting(false);
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({
        series_id: seriesId,
        score,
        review_text: reviewText || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || 'Something went wrong submitting your rating.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setHasExistingRating(true);
    setSubmitting(false);
  }

  if (checkingSession) {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mt-6">
        <p className="text-gray-400">
          <button type="button" onClick={() => openAuthModal('login')} className="text-blue-400 hover:text-blue-300">
            Sign in
          </button>{' '}
          to rate this series.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mt-6">
        <p className="text-green-400 font-medium">
          {hasExistingRating ? 'Your rating has been updated!' : 'Thanks for rating this series!'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mt-6">
      <h2 className="text-lg font-semibold mb-3 text-blue-400">
        {hasExistingRating ? 'Update your rating' : 'Rate this series'}
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            className={
              'w-10 h-10 rounded-lg font-medium transition-colors ' +
              (score === n
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700')
            }
          >
            {n}
          </button>
        ))}
      </div>

      <textarea
        placeholder="Write a review (optional)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
        maxLength={MAX_REVIEW_LENGTH}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
      />
      <p className="text-gray-500 text-xs text-right mb-4">
        {reviewText.length} / {MAX_REVIEW_LENGTH}
      </p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || score === 0}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {submitting ? 'Submitting...' : hasExistingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </div>
  );
}