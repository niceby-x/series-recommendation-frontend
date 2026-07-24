'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Candidate {
  id: number;
  tmdb_id: number;
  title: string;
  original_title: string | null;
  synopsis: string;
  country: string;
  year: number | null;
  episode_count: number;
  status: string;
  poster_url: string | null;
  source_keyword: string;
  review_status: string;
  created_at: string;
}

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

function CandidateCard({
  candidate,
  onApprove,
  onReject,
  actioning,
}: {
  candidate: Candidate;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actioning: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-[2/3] bg-gray-800">
        {candidate.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.poster_url}
            alt={candidate.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm px-4 text-center">
            {candidate.title}
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs bg-blue-900/90 text-blue-300 px-2 py-1 rounded backdrop-blur-sm">
          {candidate.country}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold leading-snug line-clamp-2">{candidate.title}</h3>
        {candidate.original_title && candidate.original_title !== candidate.title && (
          <p className="text-xs text-gray-500 italic">{candidate.original_title}</p>
        )}
        <p className="text-sm text-gray-400">
          {candidate.year ?? '—'} &middot; {candidate.episode_count} eps &middot; {candidate.status}
        </p>
        <p className="text-sm text-gray-400 line-clamp-3 flex-1">{candidate.synopsis || 'No synopsis available.'}</p>
        <p className="text-xs text-gray-600">tmdb_id: {candidate.tmdb_id}</p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onApprove(candidate.id)}
            disabled={actioning}
            className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-green-900 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(candidate.id)}
            disabled={actioning}
            className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-red-950 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCandidatesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [actioningIds, setActioningIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setAccess('signed_out');
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchCandidates() {
    setAccess('checking');
    setErrorMessage('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates', {
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    if (res.status === 401) {
      setAccess('signed_out');
      return;
    }

    if (res.status === 403) {
      setAccess('forbidden');
      return;
    }

    if (!res.ok) {
      setAccess('error');
      setErrorMessage('Could not load candidates. Try refreshing the page.');
      return;
    }

    const json = await res.json();
    setCandidates(json.data);
    setAccess('ok');
  }

  async function handleAction(id: number, action: 'approve' | 'reject') {
    setActioningIds((prev) => new Set(prev).add(id));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/' + id + '/' + action, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErrorMessage(json.message || 'Action failed for candidate ' + id + '.');
      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setActioningIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  if (access === 'checking') {
    return null;
  }

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <p className="text-gray-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>{' '}
          to access this page.
        </p>
      </main>
    );
  }

  if (access === 'forbidden') {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <p className="text-red-400">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">Review Candidates</h1>
      <p className="text-gray-400 mb-8">
        {candidates.length} pending series from TMDB discovery
      </p>

      {errorMessage && <p className="text-red-400 mb-6">{errorMessage}</p>}

      {access === 'error' && (
        <p className="text-red-400">Could not load candidates. Try refreshing the page.</p>
      )}

      {access === 'ok' && candidates.length === 0 && (
        <p className="text-gray-400">No pending candidates right now. Run the discovery script to queue more.</p>
      )}

      {access === 'ok' && candidates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onApprove={(id) => handleAction(id, 'approve')}
              onReject={(id) => handleAction(id, 'reject')}
              actioning={actioningIds.has(candidate.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}