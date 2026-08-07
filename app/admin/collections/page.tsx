'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, FolderOpen, Plus, X, Pencil } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import type { SeriesCardData } from '../../../components/shared/SeriesCard';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

interface AdminCollection {
  id: number;
  title: string;
  description: string | null;
  series_count: number;
  updated_at: string;
}

interface CollectionDetail {
  id: number;
  title: string;
  description: string | null;
  series: SeriesCardData[];
}

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

// Admin management for CURATED collections only -- the site-wide,
// everyone-sees-them collections (e.g. "Staff Picks: Slow Burns"). Regular
// users' own personal collections aren't shown or editable here; they're
// managed by their owner on /collections (see CollectionsAuthed and
// POST/PATCH/DELETE /collections/*).
export default function AdminCollectionsPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [pendingCount, setPendingCount] = useState(0);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [allSeries, setAllSeries] = useState<SeriesCardData[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingHeader, setEditingHeader] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const header = await authHeader();
      if (!header) {
        setAccess('signed_out');
        return;
      }

      const [collectionsRes, countsRes, seriesRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections', { headers: header }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: header }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/series', { cache: 'no-store' }),
      ]);

      if (collectionsRes.status === 401 || countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (collectionsRes.status === 403 || countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!collectionsRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const collectionsJson = await collectionsRes.json();
      setCollections(collectionsJson.data || []);

      const countsJson = await countsRes.json();
      setPendingCount(countsJson.pending || 0);

      if (seriesRes.ok) {
        const seriesJson = await seriesRes.json();
        setAllSeries(seriesJson.data || []);
      }

      setAccess('ok');
    }

    load();
  }, [user]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }

    async function loadDetail() {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + selectedId);
      if (!res.ok) return;
      const json = await res.json();
      setDetail(json.data);
      setDraftTitle(json.data.title);
      setDraftDescription(json.data.description || '');
      setEditingHeader(false);
    }

    loadDetail();
  }, [selectedId]);

  const memberIds = useMemo(() => new Set((detail?.series || []).map((s) => s.id)), [detail]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || !detail) return [];
    return allSeries.filter((s) => !memberIds.has(s.id) && s.title.toLowerCase().includes(query)).slice(0, 6);
  }, [search, allSeries, memberIds, detail]);

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;

    setBusy(true);
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: newDescription.trim() || null }),
    });

    setBusy(false);

    if (!res.ok) return;
    const json = await res.json();

    setCollections((prev) => [{ id: json.data.id, title: json.data.title, description: json.data.description, series_count: 0, updated_at: json.data.updated_at }, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setCreating(false);
    setSelectedId(json.data.id);
  }

  async function handleSaveHeader() {
    if (!detail) return;
    const title = draftTitle.trim();
    if (!title) return;

    setBusy(true);
    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections/' + detail.id, {
      method: 'PATCH',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: draftDescription.trim() || null }),
    });

    setBusy(false);

    if (!res.ok) return;

    setDetail((prev) => (prev ? { ...prev, title, description: draftDescription.trim() || null } : prev));
    setCollections((prev) => prev.map((c) => (c.id === detail.id ? { ...c, title, description: draftDescription.trim() || null } : c)));
    setEditingHeader(false);
  }

  async function handleDeleteCollection(collection: AdminCollection) {
    const confirmed = window.confirm('Permanently delete "' + collection.title + '"? This cannot be undone.');
    if (!confirmed) return;

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections/' + collection.id, {
      method: 'DELETE',
      headers: header,
    });

    if (!res.ok) return;

    setCollections((prev) => prev.filter((c) => c.id !== collection.id));
    if (selectedId === collection.id) setSelectedId(null);
  }

  async function handleAddSeries(series: SeriesCardData) {
    if (!detail) return;

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections/' + detail.id + '/series', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: series.id }),
    });

    if (!res.ok) return;

    setDetail((prev) => (prev ? { ...prev, series: [...prev.series, series] } : prev));
    setCollections((prev) => prev.map((c) => (c.id === detail.id ? { ...c, series_count: c.series_count + 1 } : c)));
    setSearch('');
  }

  async function handleRemoveSeries(seriesId: number) {
    if (!detail) return;

    const header = await authHeader();
    if (!header) {
      setAccess('signed_out');
      return;
    }

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/admin/collections/' + detail.id + '/series/' + seriesId,
      { method: 'DELETE', headers: header }
    );

    if (!res.ok) return;

    setDetail((prev) => (prev ? { ...prev, series: prev.series.filter((s) => s.id !== seriesId) } : prev));
    setCollections((prev) => prev.map((c) => (c.id === detail.id ? { ...c, series_count: Math.max(0, c.series_count - 1) } : c)));
  }

  if (access === 'checking') return null;

  if (access === 'signed_out') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          to access the admin dashboard.
        </p>
      </main>
    );
  }

  if (access === 'forbidden') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </main>
    );
  }

  if (access === 'error') {
    return (
      <main className="min-h-screen bg-background p-8">
        <p className="text-rose-500">Could not load collections. Try refreshing the page.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingCount={pendingCount} />

      <div className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="mb-6">
            <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Collections</h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Curated collections shown site-wide (e.g. &quot;Staff Picks: Slow Burns&quot;). Separate from users&apos; own
              personal collections, which they manage themselves.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            <div className="flex flex-col gap-3">
              {creating ? (
                <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-4 flex flex-col gap-2.5">
                  <input
                    type="text"
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Collection name"
                    className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-ring transition-colors resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={busy || !newTitle.trim()}
                      className="flex-1 bg-brand-gradient text-white rounded-full py-2 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setNewTitle('');
                        setNewDescription('');
                      }}
                      className="px-3 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex items-center justify-center gap-1.5 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-4" />
                  New Collection
                </button>
              )}

              {collections.length === 0 && !creating && (
                <p className="text-muted-foreground text-sm px-1">No curated collections yet.</p>
              )}

              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => setSelectedId(collection.id)}
                  className={
                    'text-left rounded-2xl border shadow-sm p-4 transition-colors ' +
                    (selectedId === collection.id
                      ? 'bg-primary/10 border-primary/60'
                      : 'bg-card border-border/60 hover:border-ring')
                  }
                >
                  <p className="flex items-center gap-1.5 text-foreground font-semibold text-[14px] truncate">
                    <FolderOpen className="size-3.5 text-primary shrink-0" />
                    {collection.title}
                  </p>
                  <p className="text-muted-foreground text-[12.5px] mt-1">{collection.series_count} series</p>
                </button>
              ))}
            </div>

            <div className="min-w-0">
              {!detail ? (
                <div className="rounded-[20px] bg-card border border-border/60 p-8 text-center">
                  <p className="text-foreground font-semibold mb-1">Select a collection</p>
                  <p className="text-muted-foreground text-sm">Pick one from the list, or create a new one, to manage its series.</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-5">
                  {editingHeader ? (
                    <div className="flex flex-col gap-2.5 mb-4">
                      <input
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full bg-background text-foreground rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
                      />
                      <textarea
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        rows={2}
                        placeholder="Description (optional)"
                        className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:border-ring transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveHeader}
                          disabled={busy || !draftTitle.trim()}
                          className="text-primary text-[13px] font-semibold disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingHeader(false)}
                          className="text-muted-foreground text-[13px] hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold text-[17px]">{detail.title}</p>
                        {detail.description && <p className="text-muted-foreground text-[13.5px] mt-1">{detail.description}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingHeader(true)}
                          aria-label="Edit collection details"
                          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(collections.find((c) => c.id === detail.id)!)}
                          aria-label="Delete collection"
                          className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative mb-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search the catalog to add a series..."
                      className="w-full bg-background text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
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

                  {detail.series.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No series in this collection yet. Search above to add one.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {detail.series.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-background border border-border/60 px-3.5 py-2.5">
                          <span className="text-foreground text-[13.5px] truncate">
                            {s.title} <span className="text-muted-foreground">· {s.country} · {s.year}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSeries(s.id)}
                            aria-label={'Remove ' + s.title}
                            className="flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
