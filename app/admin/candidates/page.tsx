'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface CastEntry {
  name: string;
  character: string;
  photo_url: string | null;
}

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
  is_animated: boolean;
  number_of_seasons: number | null;
  genre_names: string[] | null;
  cast_json: CastEntry[] | null;
  media_type: string;
}

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';
type Tab = 'pending' | 'approved' | 'rejected';

const LONG_RUNNING_THRESHOLD = 60;
const COUNTRY_OPTIONS = ['Thailand', 'Korea', 'Japan', 'Taiwan', 'China', 'Hong Kong', 'Other'];
const STATUS_OPTIONS = ['airing', 'completed'];

function tmdbUrl(candidate: Candidate): string | null {
  if (candidate.tmdb_id < 0) return null;
  const path = candidate.media_type === 'movie' ? 'movie' : 'tv';
  return 'https://www.themoviedb.org/' + path + '/' + candidate.tmdb_id;
}

// The colored left-edge accent that lets you scan the queue at a glance —
// red for missing data (needs real attention before approving), amber for
// long-running (likely not true BL), violet for animated, blue-gray otherwise.
function accentColor(candidate: Candidate): string {
  const missingData = !candidate.synopsis || !candidate.genre_names?.length || !candidate.cast_json?.length;
  if (missingData) return 'border-l-rose-500';
  if (candidate.episode_count >= LONG_RUNNING_THRESHOLD) return 'border-l-amber-500';
  if (candidate.is_animated) return 'border-l-violet-500';
  return 'border-l-slate-700';
}

function Chip({ tone, children }: { tone: 'blue' | 'slate' | 'violet' | 'amber' | 'rose'; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-300',
    slate: 'bg-slate-500/15 text-slate-300',
    violet: 'bg-violet-500/15 text-violet-300',
    amber: 'bg-amber-500/15 text-amber-300',
    rose: 'bg-rose-500/15 text-rose-300',
  };
  return (
    <span className={'text-[11px] font-medium px-2 py-0.5 rounded-full ' + tones[tone]}>
      {children}
    </span>
  );
}

function IconButton({
  onClick,
  disabled,
  tone,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  tone: 'approve' | 'reject' | 'neutral' | 'restore';
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    approve: 'bg-emerald-600/90 hover:bg-emerald-500 text-white disabled:bg-emerald-900/50',
    reject: 'bg-rose-600/90 hover:bg-rose-500 text-white disabled:bg-rose-900/50',
    neutral: 'bg-white/5 hover:bg-white/10 text-slate-300 disabled:bg-white/5',
    restore: 'bg-blue-600/90 hover:bg-blue-500 text-white disabled:bg-blue-900/50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed ' + tones[tone]}
    >
      {children}
    </button>
  );
}

function EditModal({
  candidate,
  onSave,
  onClose,
}: {
  candidate: Candidate;
  onSave: (edited: Candidate) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Candidate>(candidate);

  function field<K extends keyof Candidate>(key: K, value: Candidate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#12141c] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-blue-300 mb-5">Edit before approving</h2>

        <div className="flex flex-col gap-4">
          <label className="text-xs text-slate-500">
            Title
            <input
              value={form.title}
              onChange={(e) => field('title', e.target.value)}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-500">
              Country
              <select
                value={form.country}
                onChange={(e) => field('country', e.target.value)}
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Status
              <select
                value={form.status}
                onChange={(e) => field('status', e.target.value)}
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Year
              <input
                type="number"
                value={form.year ?? ''}
                onChange={(e) => field('year', e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
              />
            </label>
            <label className="text-xs text-slate-500">
              Episodes
              <input
                type="number"
                value={form.episode_count}
                onChange={(e) => field('episode_count', parseInt(e.target.value) || 0)}
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
              />
            </label>
          </div>

          <label className="text-xs text-slate-500">
            Synopsis
            <textarea
              value={form.synopsis}
              onChange={(e) => field('synopsis', e.target.value)}
              rows={4}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 resize-none focus:outline-none focus:border-blue-500/60"
            />
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  edited,
  onEdited,
  onApprove,
  onReject,
  onRestore,
  actioning,
  isActive,
}: {
  candidate: Candidate;
  edited: Candidate;
  onEdited: (edited: Candidate) => void;
  onApprove: (id: number, overrides: Partial<Candidate>) => void;
  onReject: (id: number) => void;
  onRestore: (id: number) => void;
  actioning: boolean;
  isActive: boolean;
}) {
  const isPending = candidate.review_status === 'pending';
  const isLongRunning = edited.episode_count >= LONG_RUNNING_THRESHOLD;
  const [modalOpen, setModalOpen] = useState(false);
  const link = tmdbUrl(candidate);

  const castNames = candidate.cast_json && candidate.cast_json.length > 0
    ? candidate.cast_json.slice(0, 3).map((c) => c.name).join(', ')
    : null;

  return (
    <div
      className={
        'bg-[#12141c] border border-white/5 border-l-4 rounded-xl p-3.5 flex gap-3.5 transition-all hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ' +
        accentColor(candidate) +
        (isActive ? ' ring-2 ring-blue-500/60' : '')
      }
    >
      <div className="relative w-[76px] h-[108px] flex-shrink-0 bg-white/5 rounded-lg overflow-hidden shadow-md">
        {candidate.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={candidate.poster_url} alt={edited.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] px-1 text-center">
            {edited.title}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h3 className="font-semibold text-[15px] leading-snug tracking-tight truncate text-white">{edited.title}</h3>

        <div className="flex flex-wrap items-center gap-1">
          <Chip tone="blue">{edited.country}</Chip>
          <Chip tone="slate">{candidate.media_type === 'movie' ? 'Movie' : 'TV'}</Chip>
          {candidate.is_animated && <Chip tone="violet">Animated</Chip>}
          {isLongRunning && <Chip tone="amber">{edited.episode_count} eps</Chip>}
          {!edited.synopsis && <Chip tone="rose">No synopsis</Chip>}
          {(!candidate.genre_names || candidate.genre_names.length === 0) && <Chip tone="rose">No genres</Chip>}
          {(!candidate.cast_json || candidate.cast_json.length === 0) && <Chip tone="rose">No cast</Chip>}
        </div>

        <p className="text-xs text-slate-500">
          {edited.year ?? '—'}
          {candidate.media_type !== 'movie' ? ' · ' + edited.episode_count + ' eps' : ''}
          {candidate.number_of_seasons ? ' (' + candidate.number_of_seasons + ' season' + (candidate.number_of_seasons > 1 ? 's' : '') + ')' : ''}
          {' · ' + edited.status}
        </p>

        {candidate.genre_names && candidate.genre_names.length > 0 && (
          <p className="text-xs text-slate-500 truncate">{candidate.genre_names.join(' · ')}</p>
        )}
        {castNames && <p className="text-xs text-slate-600 truncate">Cast: {castNames}</p>}

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {isPending ? (
            <>
              <IconButton onClick={() => onApprove(candidate.id, edited)} disabled={actioning} tone="approve">
                ✓ Approve{isActive ? ' (A)' : ''}
              </IconButton>
              <IconButton onClick={() => onReject(candidate.id)} disabled={actioning} tone="reject">
                ✕ Reject{isActive ? ' (R)' : ''}
              </IconButton>
              <IconButton onClick={() => setModalOpen(true)} tone="neutral">
                ✎ Edit
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => onRestore(candidate.id)} disabled={actioning} tone="restore">
              ↺ Restore to pending
            </IconButton>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors ml-auto"
            >
              TMDB ↗
            </a>
          )}
        </div>
      </div>

      {modalOpen && (
        <EditModal candidate={edited} onSave={onEdited} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

export default function AdminCandidatesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [editedMap, setEditedMap] = useState<Record<number, Candidate>>({});
  const [actioningIds, setActioningIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All');
  const [hideAnimated, setHideAnimated] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'episodes_asc' | 'episodes_desc' | 'year_desc' | 'year_asc'>('default');

  const filteredCandidates = candidates
    .filter((c) => countryFilter === 'All' || c.country === countryFilter)
    .filter((c) => mediaTypeFilter === 'All' || c.media_type === mediaTypeFilter)
    .filter((c) => !hideAnimated || !c.is_animated)
    .filter((c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'episodes_asc') return a.episode_count - b.episode_count;
      if (sortBy === 'episodes_desc') return b.episode_count - a.episode_count;
      if (sortBy === 'year_desc') return (b.year ?? 0) - (a.year ?? 0);
      if (sortBy === 'year_asc') return (a.year ?? 0) - (b.year ?? 0);
      return 0;
    });

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
    fetchCandidates(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (access !== 'ok' || activeTab !== 'pending' || filteredCandidates.length === 0) return;

      const target = event.target as HTMLElement;
      const isEditableField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      if (isEditableField) return;

      const activeCandidate = filteredCandidates[0];
      if (actioningIds.has(activeCandidate.id)) return;

      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        handleAction(activeCandidate.id, 'approve', editedMap[activeCandidate.id] || activeCandidate);
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleAction(activeCandidate.id, 'reject');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates, actioningIds, access, activeTab, editedMap]);

  async function fetchCandidates(tab: Tab) {
    setAccess('checking');
    setErrorMessage('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates?status=' + tab, {
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
    setEditedMap({});
    setAccess('ok');
  }

  async function handleAction(id: number, action: 'approve' | 'reject' | 'restore', overrides?: Partial<Candidate>) {
    setActioningIds((prev) => new Set(prev).add(id));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/' + id + '/' + action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: action === 'approve' && overrides ? JSON.stringify(overrides) : undefined,
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

  async function handleBulkReject(targets: Candidate[], label: string) {
    if (targets.length === 0) return;

    const confirmed = window.confirm(
      'Reject all ' + targets.length + ' candidates that are ' + label + '? This cannot be undone.'
    );

    if (!confirmed) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return;
    }

    setActioningIds((prev) => {
      const next = new Set(prev);
      targets.forEach((c) => next.add(c.id));
      return next;
    });

    for (const candidate of targets) {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/' + candidate.id + '/reject',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + session.access_token },
        }
      );

      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      }

      setActioningIds((prev) => {
        const next = new Set(prev);
        next.delete(candidate.id);
        return next;
      });
    }
  }

  if (access === 'checking') {
    return null;
  }

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-white p-8">
        <p className="text-slate-400">
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
      <main className="min-h-screen bg-[#0a0c10] text-white p-8">
        <p className="text-rose-400">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  const pendingCount = candidates.length;
  const tabCounts: Record<Tab, number | null> = { pending: activeTab === 'pending' ? pendingCount : null, approved: null, rejected: null };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white p-6">
      <h1 className="text-2xl font-bold text-blue-300 tracking-tight mb-4">Review Candidates</h1>

      <div className="inline-flex items-center gap-1 bg-white/5 rounded-full p-1 mb-4">
        {(['pending', 'approved', 'rejected'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              'px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ' +
              (activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white')
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="text-slate-500 text-xs mb-4">
        {filteredCandidates.length} of {candidates.length} shown
        {activeTab === 'pending' ? (
          <span className="text-slate-600"> · <span className="text-slate-400 font-medium">A</span> approves, <span className="text-slate-400 font-medium">R</span> rejects the highlighted card</span>
        ) : ''}
      </p>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-wrap gap-2 mb-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search title..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/60"
        >
          <option value="All">All countries</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={mediaTypeFilter}
          onChange={(e) => setMediaTypeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/60"
        >
          <option value="All">TV + Movies</option>
          <option value="tv">TV only</option>
          <option value="movie">Movies only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/60"
        >
          <option value="default">Default order</option>
          <option value="episodes_asc">Episodes: low to high</option>
          <option value="episodes_desc">Episodes: high to low</option>
          <option value="year_desc">Year: newest first</option>
          <option value="year_asc">Year: oldest first</option>
        </select>
        <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={hideAnimated} onChange={(e) => setHideAnimated(e.target.checked)} />
          Hide animated
        </label>
      </div>

      {errorMessage && <p className="text-rose-400 mb-4 text-sm">{errorMessage}</p>}

      {access === 'error' && (
        <p className="text-rose-400 text-sm">Could not load candidates. Try refreshing the page.</p>
      )}

      {access === 'ok' && candidates.length === 0 && (
        <p className="text-slate-400 text-sm">
          {activeTab === 'pending'
            ? 'No pending candidates right now. Run the discovery script to queue more.'
            : 'Nothing here yet.'}
        </p>
      )}

      {access === 'ok' && candidates.length > 0 && filteredCandidates.length === 0 && (
        <p className="text-slate-400 text-sm">No candidates match the current filters.</p>
      )}

      {access === 'ok' && filteredCandidates.length > 0 && (
        <>
          {activeTab === 'pending' && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filteredCandidates.some((c) => c.episode_count >= LONG_RUNNING_THRESHOLD) && (
                <button
                  onClick={() => handleBulkReject(
                    filteredCandidates.filter((c) => c.episode_count >= LONG_RUNNING_THRESHOLD),
                    LONG_RUNNING_THRESHOLD + '+ episodes'
                  )}
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  Reject all {filteredCandidates.filter((c) => c.episode_count >= LONG_RUNNING_THRESHOLD).length} with {LONG_RUNNING_THRESHOLD}+ episodes
                </button>
              )}
              {filteredCandidates.some((c) => c.is_animated) && (
                <button
                  onClick={() => handleBulkReject(
                    filteredCandidates.filter((c) => c.is_animated),
                    'animated'
                  )}
                  className="bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  Reject all {filteredCandidates.filter((c) => c.is_animated).length} animated
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                edited={editedMap[candidate.id] || candidate}
                onEdited={(edited) => setEditedMap((prev) => ({ ...prev, [candidate.id]: edited }))}
                onApprove={(id, overrides) => handleAction(id, 'approve', overrides)}
                onReject={(id) => handleAction(id, 'reject')}
                onRestore={(id) => handleAction(id, 'restore')}
                actioning={actioningIds.has(candidate.id)}
                isActive={activeTab === 'pending' && index === 0}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}