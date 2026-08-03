'use client';

import { useEffect, useState } from 'react';
import { Check, X, Pencil, Tag as TagIcon } from 'lucide-react';
import { useAuthModal } from '../../../lib/AuthModalContext';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Tag, TagDimension, RomancePace, EmotionalIntensity, EndingType, ContentLevel } from '../../../lib/taxonomy';
import {
  ROMANCE_PACE_DISPLAY,
  EMOTIONAL_INTENSITY_DISPLAY,
  ENDING_TYPE_DISPLAY,
  CONTENT_LEVEL_DISPLAY,
} from '../../../lib/taxonomy';
import { computeCurationLevel } from '../../../lib/curationLevel';

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
  romance_pace: string | null;
  emotional_intensity: string | null;
  ending_type: string | null;
  content_level: string | null;
  tag_ids: number[];
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
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

function accentColor(candidate: Candidate): string {
  const missingData = !candidate.synopsis || !candidate.genre_names?.length || !candidate.cast_json?.length;
  if (missingData) return 'border-l-rose-500';
  if (candidate.episode_count >= LONG_RUNNING_THRESHOLD) return 'border-l-amber-500';
  if (candidate.is_animated) return 'border-l-violet-500';
  return 'border-l-slate-700';
}

// Builds { mood: [1,4], trope: [7], ... } from a candidate's flat tag_ids array,
// using the availableTags lookup fetched once at the page level. Needed by
// computeCurationLevel, which groups tag presence by dimension.
function groupTagIdsByDimension(
  tagIds: number[],
  availableTags: Record<TagDimension, Tag[]>
): Partial<Record<TagDimension, number[]>> {
  const idToDimension = new Map<number, TagDimension>();
  for (const dimension of Object.keys(availableTags) as TagDimension[]) {
    for (const tag of availableTags[dimension]) {
      idToDimension.set(tag.id, dimension);
    }
  }

  const grouped: Partial<Record<TagDimension, number[]>> = {};
  for (const id of tagIds) {
    const dimension = idToDimension.get(id);
    if (!dimension) continue;
    if (!grouped[dimension]) grouped[dimension] = [];
    grouped[dimension]!.push(id);
  }
  return grouped;
}

function curationBadgeTone(level: 0 | 1 | 2 | 3): 'rose' | 'amber' | 'blue' | 'emerald' {
  if (level === 0) return 'rose';
  if (level === 1) return 'amber';
  if (level === 2) return 'blue';
  return 'emerald';
}

function Chip({ tone, children }: { tone: 'blue' | 'slate' | 'violet' | 'amber' | 'rose' | 'emerald'; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-300',
    slate: 'bg-slate-500/15 text-slate-300',
    violet: 'bg-violet-500/15 text-violet-300',
    amber: 'bg-amber-500/15 text-amber-300',
    rose: 'bg-rose-500/15 text-rose-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
  };
  return (
    <span className={'text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ' + tones[tone]}>
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
      className={'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:cursor-not-allowed whitespace-nowrap ' + tones[tone]}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'emerald' | 'rose' }) {
  const tones: Record<string, string> = {
    blue: 'text-blue-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
  };
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 flex-1 min-w-[140px]">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={'text-2xl font-bold tabular-nums ' + tones[tone]}>{value.toLocaleString()}</p>
    </div>
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

function TaxonomyModal({
  candidate,
  availableTags,
  onSaved,
  onClose,
}: {
  candidate: Candidate;
  availableTags: Record<TagDimension, Tag[]>;
  onSaved: (updates: Partial<Candidate>) => void;
  onClose: () => void;
}) {
  const [romancePace, setRomancePace] = useState(candidate.romance_pace || '');
  const [emotionalIntensity, setEmotionalIntensity] = useState(candidate.emotional_intensity || '');
  const [endingType, setEndingType] = useState(candidate.ending_type || '');
  const [contentLevel, setContentLevel] = useState(candidate.content_level || '');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set(candidate.tag_ids));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const curation = computeCurationLevel(
    {
      romance_pace: (romancePace || null) as RomancePace | null,
      emotional_intensity: (emotionalIntensity || null) as EmotionalIntensity | null,
      ending_type: (endingType || null) as EndingType | null,
      content_level: (contentLevel || null) as ContentLevel | null,
    },
    groupTagIdsByDimension([...selectedTagIds], availableTags)
  );

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaveError('Session expired — refresh the page.');
      setSaving(false);
      return;
    }

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/' + candidate.id + '/taxonomy',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({
          romance_pace: romancePace || null,
          emotional_intensity: emotionalIntensity || null,
          ending_type: endingType || null,
          content_level: contentLevel || null,
          tag_ids: [...selectedTagIds],
        }),
      }
    );

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setSaveError(json.message || 'Save failed.');
      setSaving(false);
      return;
    }

    onSaved({
      romance_pace: romancePace || null,
      emotional_intensity: emotionalIntensity || null,
      ending_type: endingType || null,
      content_level: contentLevel || null,
      tag_ids: [...selectedTagIds],
    });
    setSaving(false);
    onClose();
  }

  const dimensionSections: { dimension: TagDimension; label: string; helperText: string }[] = [
    { dimension: 'mood', label: 'Mood', helperText: '2-4 recommended' },
    { dimension: 'trope', label: 'Tropes', helperText: '1-3 recommended' },
    { dimension: 'relationship_dynamic', label: 'Relationship Dynamics', helperText: 'pick what recurs' },
    { dimension: 'theme', label: 'Themes', helperText: 'optional · Level 2' },
    { dimension: 'content_warning', label: 'Content Warnings', helperText: 'leave blank unless certain · Level 3' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#12141c] border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-blue-300">Taxonomy — {candidate.title}</h2>
          <Chip tone={curationBadgeTone(curation.level)}>Curation Level {curation.level}</Chip>
        </div>

        {curation.missingForLevel1.length > 0 && (
          <p className="text-xs text-amber-300/80 mb-4">
            Missing for Level 1: {curation.missingForLevel1.join(', ')}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <label className="text-xs text-slate-500">
            Romance Pace *
            <select
              value={romancePace}
              onChange={(e) => setRomancePace(e.target.value)}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
            >
              <option value="">Select...</option>
              {Object.entries(ROMANCE_PACE_DISPLAY).map(([key, { emoji, label }]) => (
                <option key={key} value={key}>{emoji} {label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Ending Type *
            <select
              value={endingType}
              onChange={(e) => setEndingType(e.target.value)}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
            >
              <option value="">Select...</option>
              {Object.entries(ENDING_TYPE_DISPLAY).map(([key, { emoji, label }]) => (
                <option key={key} value={key}>{emoji} {label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Emotional Intensity
            <select
              value={emotionalIntensity}
              onChange={(e) => setEmotionalIntensity(e.target.value)}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
            >
              <option value="">Select...</option>
              {Object.entries(EMOTIONAL_INTENSITY_DISPLAY).map(([key, { emoji, label }]) => (
                <option key={key} value={key}>{emoji} {label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Content Level
            <select
              value={contentLevel}
              onChange={(e) => setContentLevel(e.target.value)}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60"
            >
              <option value="">Needs Content Review</option>
              {Object.entries(CONTENT_LEVEL_DISPLAY).map(([key, { emoji, label }]) => (
                <option key={key} value={key}>{emoji} {label}</option>
              ))}
            </select>
          </label>
        </div>

        {dimensionSections.map(({ dimension, label, helperText }) => (
          <div key={dimension} className="mb-4">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
              <span className="text-[11px] text-slate-600">{helperText}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(availableTags[dimension] || []).map((tag) => {
                const active = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={
                      'text-xs px-2.5 py-1 rounded-full border transition-colors ' +
                      (active
                        ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20')
                    }
                  >
                    {tag.display_label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Taxonomy'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
        {saveError && <p className="text-rose-400 text-xs mt-2">{saveError}</p>}
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  edited,
  onEdited,
  onApprove,
  onReject,
  onRestore,
  onTaxonomySaved,
  availableTags,
  actioning,
  isActive,
}: {
  candidate: Candidate;
  edited: Candidate;
  onEdited: (edited: Candidate) => void;
  onApprove: (id: number, overrides: Partial<Candidate>) => void;
  onReject: (id: number) => void;
  onRestore: (id: number) => void;
  onTaxonomySaved: (id: number, updates: Partial<Candidate>) => void;
  availableTags: Record<TagDimension, Tag[]>;
  actioning: boolean;
  isActive: boolean;
}) {
  const isPending = candidate.review_status === 'pending';
  const isLongRunning = edited.episode_count >= LONG_RUNNING_THRESHOLD;
  const [modalOpen, setModalOpen] = useState(false);
  const [taxonomyModalOpen, setTaxonomyModalOpen] = useState(false);
  const link = tmdbUrl(candidate);

  const castNames = candidate.cast_json && candidate.cast_json.length > 0
    ? candidate.cast_json.slice(0, 3).map((c) => c.name).join(', ')
    : null;

  const curation = computeCurationLevel(
    {
      romance_pace: candidate.romance_pace as RomancePace | null,
      emotional_intensity: candidate.emotional_intensity as EmotionalIntensity | null,
      ending_type: candidate.ending_type as EndingType | null,
      content_level: candidate.content_level as ContentLevel | null,
    },
    groupTagIdsByDimension(candidate.tag_ids || [], availableTags)
  );

  return (
    <div
      className={
        'bg-[#0e1016] border-l-4 px-3.5 py-3 flex gap-3.5 transition-colors hover:bg-white/[0.02] ' +
        accentColor(candidate) +
        (isActive ? ' bg-blue-500/[0.06] ring-1 ring-inset ring-blue-500/40' : '')
      }
    >
      <div className="relative w-14 h-20 flex-shrink-0 bg-white/5 rounded-md overflow-hidden">
        {candidate.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={candidate.poster_url} alt={edited.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[9px] px-1 text-center">
            {edited.title}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] gap-x-4 gap-y-1 items-center">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm leading-snug tracking-tight truncate text-white">{edited.title}</h3>
          <p className="text-xs text-slate-500 truncate">
            {edited.country} · {edited.year ?? '—'}
            {candidate.media_type !== 'movie' ? ' · ' + edited.episode_count + ' eps' : ' · Movie'}
            {' · ' + edited.status}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Chip tone="slate">{candidate.media_type === 'movie' ? 'Movie' : 'TV'}</Chip>
            {candidate.is_animated && <Chip tone="violet">Animated</Chip>}
            {isLongRunning && <Chip tone="amber">{edited.episode_count} eps</Chip>}
            {!edited.synopsis && <Chip tone="rose">No synopsis</Chip>}
            {(!candidate.genre_names || candidate.genre_names.length === 0) && <Chip tone="rose">No genres</Chip>}
            {(!candidate.cast_json || candidate.cast_json.length === 0) && <Chip tone="rose">No cast</Chip>}
            {isPending && <Chip tone={curationBadgeTone(curation.level)}>Taxonomy L{curation.level}</Chip>}
          </div>
        </div>

        <div className="min-w-0 hidden md:block">
          {candidate.genre_names && candidate.genre_names.length > 0 && (
            <p className="text-xs text-slate-500 truncate">{candidate.genre_names.join(' · ')}</p>
          )}
          {castNames && <p className="text-xs text-slate-600 truncate mt-0.5">Cast: {castNames}</p>}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
            >
              TMDB ↗
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {isPending ? (
            <>
              <IconButton onClick={() => onApprove(candidate.id, edited)} disabled={actioning} tone="approve">
                <Check className="inline size-3 -mt-0.5 mr-1" /> Approve{isActive ? ' (A)' : ''}
              </IconButton>
              <IconButton onClick={() => onReject(candidate.id)} disabled={actioning} tone="reject">
                <X className="inline size-3 -mt-0.5 mr-1" /> Reject{isActive ? ' (R)' : ''}
              </IconButton>
              <IconButton onClick={() => setModalOpen(true)} tone="neutral">
                <Pencil className="inline size-3 -mt-0.5 mr-1" /> Edit
              </IconButton>
              <IconButton onClick={() => setTaxonomyModalOpen(true)} tone="neutral">
                <TagIcon className="inline size-3 -mt-0.5 mr-1" /> Taxonomy
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => onRestore(candidate.id)} disabled={actioning} tone="restore">
              ↺ Restore
            </IconButton>
          )}
        </div>
      </div>

      {modalOpen && (
        <EditModal candidate={edited} onSave={onEdited} onClose={() => setModalOpen(false)} />
      )}

      {taxonomyModalOpen && (
        <TaxonomyModal
          candidate={candidate}
          availableTags={availableTags}
          onSaved={(updates) => onTaxonomySaved(candidate.id, updates)}
          onClose={() => setTaxonomyModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminCandidatesPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
  const [editedMap, setEditedMap] = useState<Record<number, Candidate>>({});
  const [actioningIds, setActioningIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [availableTags, setAvailableTags] = useState<Record<TagDimension, Tag[]>>({
    mood: [], trope: [], relationship_dynamic: [], theme: [], content_warning: [],
  });

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
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    fetchAvailableTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchAvailableTags() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags', {
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    if (res.ok) {
      const json = await res.json();
      setAvailableTags(json.data);
    }
  }

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

  async function fetchCounts() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', {
      headers: { Authorization: 'Bearer ' + session.access_token },
    });

    if (res.ok) {
      const json = await res.json();
      setCounts({ pending: json.pending, approved: json.approved, rejected: json.rejected });
    }
  }

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
    fetchCounts();
  }

  // TaxonomyModal already persisted these fields via its own PATCH call —
  // this just updates local state so the row (and its curation badge)
  // reflects the save without needing a full refetch of the candidate list.
  function handleTaxonomySaved(id: number, updates: Partial<Candidate>) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
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

    fetchCounts();
  }

  if (access === 'checking' && candidates.length === 0) {
    return null;
  }

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-[#0a0c10] text-white p-8">
        <p className="text-slate-400">
          <button type="button" onClick={() => openAuthModal('login')} className="text-blue-400 hover:text-blue-300">
            Sign in
          </button>{' '}
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

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-1 text-xs font-medium text-blue-400/80 uppercase tracking-wider">Admin</div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-5">TMDB Review Queue</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Pending" value={counts.pending} tone="blue" />
          <StatCard label="Approved" value={counts.approved} tone="emerald" />
          <StatCard label="Rejected" value={counts.rejected} tone="rose" />
          <StatCard label="Total" value={counts.pending + counts.approved + counts.rejected} tone="blue" />
        </div>

        <div className="border-b border-white/10 flex gap-6 mb-4">
          {(['pending', 'approved', 'rejected'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px flex items-center gap-2 ' +
                (activeTab === tab
                  ? 'text-white border-blue-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300')
              }
            >
              {tab}
              <span className="text-xs bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full tabular-nums">
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="sticky top-0 z-10 bg-[#0a0c10]/95 backdrop-blur-sm pt-2 pb-3 -mt-2">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-wrap gap-2">
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
            <span className="ml-auto self-center text-xs text-slate-500">
              {filteredCandidates.length} of {candidates.length} shown
              {activeTab === 'pending' ? ' · A / R shortcuts active' : ''}
            </span>
          </div>

          {activeTab === 'pending' && (filteredCandidates.some((c) => c.episode_count >= LONG_RUNNING_THRESHOLD) || filteredCandidates.some((c) => c.is_animated)) && (
            <div className="mt-2 flex flex-wrap gap-2">
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
        </div>

        {errorMessage && <p className="text-rose-400 my-3 text-sm">{errorMessage}</p>}

        {access === 'error' && (
          <p className="text-rose-400 text-sm mt-3">Could not load candidates. Try refreshing the page.</p>
        )}

        {access === 'ok' && candidates.length === 0 && (
          <p className="text-slate-400 text-sm mt-3">
            {activeTab === 'pending'
              ? 'No pending candidates right now. Run the discovery script to queue more.'
              : 'Nothing here yet.'}
          </p>
        )}

        {access === 'ok' && candidates.length > 0 && filteredCandidates.length === 0 && (
          <p className="text-slate-400 text-sm mt-3">No candidates match the current filters.</p>
        )}

        {access === 'ok' && filteredCandidates.length > 0 && (
          <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 mt-3">
            {filteredCandidates.map((candidate, index) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                edited={editedMap[candidate.id] || candidate}
                onEdited={(edited) => setEditedMap((prev) => ({ ...prev, [candidate.id]: edited }))}
                onApprove={(id, overrides) => handleAction(id, 'approve', overrides)}
                onReject={(id) => handleAction(id, 'reject')}
                onRestore={(id) => handleAction(id, 'restore')}
                onTaxonomySaved={handleTaxonomySaved}
                availableTags={availableTags}
                actioning={actioningIds.has(candidate.id)}
                isActive={activeTab === 'pending' && index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}