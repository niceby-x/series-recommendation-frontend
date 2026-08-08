'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, X, Pencil, Trash2, Sparkles, FolderOpen } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import SeriesCard, { type SeriesCardData } from '../../../components/shared/SeriesCard';

type LoadState = 'checking' | 'not_found' | 'forbidden' | 'ok' | 'error';

interface CollectionDetail {
  id: number;
  title: string;
  description: string | null;
  is_curated: boolean;
  is_mine: boolean;
  series: SeriesCardData[];
}

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

// One collection's page -- personal (owner-only edit/add/remove) or
// curated (view-only here; admins manage membership on /admin/collections
// or from a series' own edit screen). Public: a curated collection is
// visible to anyone, signed in or not; a personal one 403s for everyone
// but its owner (see GET /collections/:id).
export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { open: openAuthModal } = useAuthModal();
  const id = Number(params.id);
  const validId = Number.isFinite(id);

  const [state, setState] = useState<LoadState>('checking');
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);
  const [search, setSearch] = useState('');
  const [editingHeader, setEditingHeader] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!validId) return;

    async function load() {
      const header = await authHeader();

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + id, {
        headers: header || undefined,
        cache: 'no-store',
      });

      if (res.status === 404) {
        setState('not_found');
        return;
      }
      if (res.status === 403) {
        setState('forbidden');
        return;
      }
      if (!res.ok) {
        setState('error');
        return;
      }

      const json = await res.json();
      setDetail(json.data);
      setDraftTitle(json.data.title);
      setDraftDescription(json.data.description || '');
      setState('ok');
    }

    load();
  }, [id, validId]);

  useEffect(() => {
    if (!detail?.is_mine) return;
    fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json && setAllSeries(json.data || []));
  }, [detail?.is_mine]);

  const memberIds = useMemo(() => new Set((detail?.series || []).map((s) => s.id)), [detail]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allSeries.filter((s) => !memberIds.has(s.id) && s.title.toLowerCase().includes(query)).slice(0, 6);
  }, [search, allSeries, memberIds]);

  async function handleSaveHeader() {
    if (!detail) return;
    const title = draftTitle.trim();
    if (!title) return;

    setSaving(true);
    const header = await authHeader();
    if (!header) {
      openAuthModal('login');
      setSaving(false);
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + detail.id, {
      method: 'PATCH',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: draftDescription.trim() || null }),
    });

    setSaving(false);
    if (!res.ok) return;

    setDetail((prev) => (prev ? { ...prev, title, description: draftDescription.trim() || null } : prev));
    setEditingHeader(false);
  }

  async function handleDeleteCollection() {
    if (!detail) return;
    const confirmed = window.confirm('Delete "' + detail.title + '"? This cannot be undone.');
    if (!confirmed) return;

    const header = await authHeader();
    if (!header) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + detail.id, {
      method: 'DELETE',
      headers: header,
    });

    if (res.ok) router.push('/collections');
  }

  async function handleAddSeries(series: SeriesCardData) {
    if (!detail) return;

    const header = await authHeader();
    if (!header) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + detail.id + '/series', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: series.id }),
    });

    if (!res.ok) return;
    setDetail((prev) => (prev ? { ...prev, series: [...prev.series, series] } : prev));
    setSearch('');
  }

  async function handleRemoveSeries(seriesId: number) {
    if (!detail) return;

    const header = await authHeader();
    if (!header) return;

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + detail.id + '/series/' + seriesId,
      { method: 'DELETE', headers: header }
    );

    if (!res.ok) return;
    setDetail((prev) => (prev ? { ...prev, series: prev.series.filter((s) => s.id !== seriesId) } : prev));
  }

  if (validId && state === 'checking') return null;

  if (!validId || state === 'not_found') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-muted-foreground">This collection doesn&apos;t exist.</p>
      </main>
    );
  }

  if (state === 'forbidden') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          This is a personal collection you don&apos;t have access to.{' '}
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          if it&apos;s yours.
        </p>
      </main>
    );
  }

  if (state === 'error' || !detail) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-rose-500">Could not load this collection. Try refreshing the page.</p>
      </main>
    );
  }

  const Icon = detail.is_curated ? Sparkles : FolderOpen;

  return (
    <main className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/collections')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Collections
        </button>

        <div className="flex items-start justify-between gap-4 mb-8">
          {editingHeader ? (
            <div className="flex-1 flex flex-col gap-2.5 max-w-lg">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full bg-card text-foreground rounded-xl px-3.5 py-2.5 text-lg font-semibold border border-border focus:outline-none focus:border-ring transition-colors"
              />
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={2}
                placeholder="Description (optional)"
                className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  disabled={saving || !draftTitle.trim()}
                  className="text-primary text-sm font-semibold disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHeader(false)}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <h1 className="flex items-center gap-2.5 font-heading text-[28px] md:text-[34px] font-normal text-foreground">
                <Icon className="size-6 text-primary shrink-0" />
                {detail.title}
              </h1>
              {detail.description && <p className="text-muted-foreground text-[15px] mt-2 max-w-xl">{detail.description}</p>}
              <p className="text-muted-foreground text-[13px] mt-2">
                {detail.series.length} series{detail.is_curated ? ' · Curated' : ''}
              </p>
            </div>
          )}

          {detail.is_mine && !editingHeader && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setEditingHeader(true)}
                aria-label="Edit collection details"
                className="flex items-center justify-center size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteCollection}
                aria-label="Delete collection"
                className="flex items-center justify-center size-9 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>

        {detail.is_mine && (
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the catalog to add a series..."
              className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden py-1.5 z-20">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAddSeries(s)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors text-left"
                  >
                    <span className="truncate">
                      {s.title} <span className="text-muted-foreground">· {s.country} · {s.year}</span>
                    </span>
                    <span className="text-primary font-semibold text-[12.5px] shrink-0">Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {detail.series.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {detail.is_mine ? 'Nothing here yet -- search above to add a series.' : 'Nothing in this collection yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {detail.series.map((s) => (
              <div key={s.id} className="relative">
                <SeriesCard series={s} />
                {detail.is_mine && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSeries(s.id)}
                    aria-label={'Remove ' + s.title + ' from this collection'}
                    className="absolute top-2 left-2 z-10 flex items-center justify-center size-7 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
