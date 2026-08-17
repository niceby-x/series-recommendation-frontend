'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import SeriesList, { type AdminSeries } from '../../../components/admin/SeriesList';
import SeriesEditModal, { type SeriesEditForm, type CollectionOption, type GenreOption } from '../../../components/admin/SeriesEditModal';
import type { Tag, TagDimension } from '../../../lib/taxonomy';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

const EMPTY_TAGS: Record<TagDimension, Tag[]> = {
  mood: [],
  trope: [],
  relationship_dynamic: [],
  theme: [],
  content_warning: [],
};

export default function AdminSeriesPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [series, setSeries] = useState<AdminSeries[]>([]);
  const [availableTags, setAvailableTags] = useState<Record<TagDimension, Tag[]>>(EMPTY_TAGS);
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreOption[]>([]);
  const [search, setSearch] = useState('');
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [editingSeries, setEditingSeries] = useState<AdminSeries | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadAll() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAccess('signed_out');
        return;
      }
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      // /series is public (no auth needed to browse the catalog), but the
      // counts call doubles as our own admin-access check for this page --
      // same reasoning as the Reviews page, which isn't itself an admin-only
      // endpoint's response either.
      const [seriesRes, countsRes, tagsRes, collectionsRes, genresRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/series'),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/candidates/counts', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections', { headers: authHeader }),
        // D3-01: real genres table, sourced the same way the taxonomy
        // dimensions already are, instead of a free-text field prone to
        // typos and casing drift.
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres', { headers: authHeader }),
      ]);

      if (countsRes.status === 401) {
        setAccess('signed_out');
        return;
      }
      if (countsRes.status === 403) {
        setAccess('forbidden');
        return;
      }
      if (!seriesRes.ok || !countsRes.ok) {
        setAccess('error');
        return;
      }

      const seriesJson = await seriesRes.json();
      setSeries(seriesJson.data || []);

      if (tagsRes.ok) {
        const tagsJson = await tagsRes.json();
        setAvailableTags({ ...EMPTY_TAGS, ...(tagsJson.data || {}) });
      }

      if (collectionsRes.ok) {
        const collectionsJson = await collectionsRes.json();
        setAvailableCollections(
          (collectionsJson.data || []).map((c: { id: number; title: string }) => ({ id: c.id, title: c.title }))
        );
      }

      if (genresRes.ok) {
        const genresJson = await genresRes.json();
        setAvailableGenres(
          (genresJson.data || []).map((g: { id: number; name: string }) => ({ id: g.id, name: g.name }))
        );
      }

      setAccess('ok');
    }

    loadAll();
  }, [user]);

  const visibleSeries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return series;
    return series.filter((s) => s.title.toLowerCase().includes(query) || s.country.toLowerCase().includes(query));
  }, [series, search]);

  async function withAdminAuth<T>(run: (authHeader: Record<string, string>) => Promise<T>): Promise<T | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAccess('signed_out');
      return null;
    }
    return run({ Authorization: 'Bearer ' + session.access_token });
  }

  async function handleSave(form: SeriesEditForm) {
    if (!editingSeries) return;
    const target = editingSeries;
    setBusyIds((prev) => new Set(prev).add(target.id));

    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/series/' + target.id, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          original_title: form.original_title || null,
          synopsis: form.synopsis || null,
          country: form.country,
          year: form.year,
          episode_count: form.episode_count,
          status: form.status,
          poster_url: form.poster_url || null,
          backdrop_url: form.backdrop_url || null,
          genre_names: form.genre_names,
          romance_pace: form.romance_pace || null,
          emotional_intensity: form.emotional_intensity || null,
          ending_type: form.ending_type || null,
          content_level: form.content_level || null,
          tag_ids: form.tag_ids,
          collection_ids: form.collection_ids,
        }),
      })
    );

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });

    if (result?.ok) {
      setSeries((prev) =>
        prev.map((s) =>
          s.id === target.id
            ? {
                ...s,
                title: form.title,
                original_title: form.original_title || null,
                synopsis: form.synopsis || null,
                country: form.country,
                year: form.year,
                episode_count: form.episode_count,
                status: form.status,
                poster_url: form.poster_url || null,
                backdrop_url: form.backdrop_url || null,
                genre_names: form.genre_names,
                romance_pace: form.romance_pace || null,
                emotional_intensity: form.emotional_intensity || null,
                ending_type: form.ending_type || null,
                content_level: form.content_level || null,
                tag_ids: form.tag_ids,
                collection_ids: form.collection_ids,
              }
            : s
        )
      );
      setEditingSeries(null);
    }
  }

  async function handleEdit(target: AdminSeries) {
    // The list endpoint (GET /series) doesn't include genre_names -- only
    // GET /series/:id does. Fetching fresh here (rather than editing the
    // list-sourced object directly) matters: the PATCH endpoint treats
    // genre_names as the COMPLETE desired list, so opening the modal with
    // genre_names missing/stale and saving would silently wipe out the
    // series' actual genres.
    setLoadingEditId(target.id);
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/series/' + target.id);
    setLoadingEditId(null);

    if (!res.ok) {
      window.alert('Could not load this series\u2019 full details. Try again.');
      return;
    }

    const json = await res.json();
    setEditingSeries(json.data);
  }

  async function handleDelete(target: AdminSeries) {
    const confirmed = window.confirm(
      'Permanently delete "' + target.title + '"? This removes it from every watchlist and deletes its ratings too. This cannot be undone.'
    );
    if (!confirmed) return;

    setBusyIds((prev) => new Set(prev).add(target.id));

    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/series/' + target.id, {
        method: 'DELETE',
        headers: authHeader,
      })
    );

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });

    if (result?.ok) {
      setSeries((prev) => prev.filter((s) => s.id !== target.id));
    }
  }

  if (access === 'checking') return null;

  if (access === 'signed_out') {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-semibold hover:opacity-80">
            Sign in
          </button>{' '}
          to access the admin dashboard.
        </p>
      </div>
    );
  }

  if (access === 'forbidden') {
    return (
      <div className="p-8">
        <p className="text-rose-500 font-semibold">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  if (access === 'error') {
    return (
      <div className="p-8">
        <p className="text-rose-500">Could not load series. Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[900px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="font-heading text-[26px] md:text-[30px] leading-tight font-normal text-foreground">Series & Movies</h1>
              <p className="text-muted-foreground text-[14px] mt-1">
                {series.length} published. Edit details or remove a title entirely.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or country"
                className="bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors w-[240px]"
              />
            </div>
          </div>

          <SeriesList
            series={visibleSeries}
            busyIds={loadingEditId != null ? new Set(busyIds).add(loadingEditId) : busyIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {editingSeries && (
        <SeriesEditModal
          series={editingSeries}
          availableTags={availableTags}
          availableCollections={availableCollections}
          availableGenres={availableGenres}
          onSave={handleSave}
          onClose={() => setEditingSeries(null)}
        />
      )}
    </>
  );
}
