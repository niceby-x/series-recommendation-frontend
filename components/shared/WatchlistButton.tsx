'use client';

import { useEffect, useState } from 'react';
import { useAuthModal } from '../../lib/AuthModalContext';
import { useSession } from '../../lib/SessionContext';

type Status = 'plan_to_watch' | 'watching' | 'completed';

const STATUS_LABELS: Record<Status, string> = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
};

export default function WatchlistButton({ seriesId }: { seriesId: number }) {
  const { open: openAuthModal } = useAuthModal();
  const { user, session, checkingSession } = useSession();
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!session) return;
    const activeSession = session;

    async function fetchStatus() {
      setLoadingStatus(true);

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/watchlist/' + seriesId, {
        headers: { Authorization: 'Bearer ' + activeSession.access_token },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Your session expired. Please sign in again.');
          setSessionExpired(true);
        }
        setLoadingStatus(false);
        return;
      }

      const json = await res.json();

      setCurrentStatus(json.status);
      setLoadingStatus(false);
    }

    fetchStatus();
  }, [session, seriesId]);

  async function handleSetStatus(status: Status) {
    setUpdating(true);
    setError('');
    setMenuOpen(false);

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
      <p className="text-muted-foreground text-sm">
        <button type="button" onClick={() => openAuthModal('login')} className="text-primary hover:text-brand-purple-vivid">
          Sign in
        </button>{' '}
        to add this to your watchlist.
      </p>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={updating || sessionExpired}
        className={
          'px-5 py-2.5 rounded-full font-medium text-sm transition-colors ' +
          (currentStatus
            ? 'bg-muted text-foreground hover:bg-accent'
            : 'bg-brand-gradient text-white hover:opacity-90') +
          ' disabled:opacity-60'
        }
      >
        {updating
          ? 'Updating...'
          : sessionExpired
          ? 'Sign in required'
          : currentStatus
          ? STATUS_LABELS[currentStatus]
          : '+ Add to List'}
      </button>

      {menuOpen && (
        <div className="absolute mt-2 w-48 bg-card border border-border rounded-xl shadow-brand z-10 overflow-hidden">
          {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
            <button
              key={status}
              onClick={() => handleSetStatus(status)}
              className={
                'w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ' +
                (currentStatus === status ? 'text-primary' : 'text-foreground/75')
              }
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
          {currentStatus && (
            <button
              onClick={handleRemove}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors border-t border-border"
            >
              Remove from List
            </button>
          )}
        </div>
      )}

      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
    </div>
  );
}