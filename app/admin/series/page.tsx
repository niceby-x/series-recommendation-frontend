'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useAuthModal } from '../../../lib/AuthModalContext';
import type { AdminSeries } from '../../../components/admin/adminSeriesTypes';
import AdminSeriesTable, {
  type SeriesSortKey,
  type PublishStatus,
  type BulkAction,
  type ViewMode,
  type SeriesPagination,
} from '../../../components/admin/AdminSeriesTable';
import SeriesTabs, { type SeriesTabKey, type SeriesTabCounts } from '../../../components/admin/SeriesTabs';
import SeriesFiltersButton, { type SeriesFilterValue } from '../../../components/admin/SeriesFiltersButton';
import SeriesFilterChips from '../../../components/admin/SeriesFilterChips';
import SeriesEditModal, { type SeriesEditForm, type CollectionOption, type GenreOption } from '../../../components/admin/SeriesEditModal';
import type { Tag, TagDimension } from '../../../lib/taxonomy';
import { useAdminPageHeader } from '../../../components/admin/AdminPageHeaderContext';

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ok' | 'error';

const EMPTY_TAGS: Record<TagDimension, Tag[]> = {
  mood: [],
  trope: [],
  relationship_dynamic: [],
  theme: [],
  content_warning: [],
};

const VIEW_STORAGE_KEY = 'blumi-admin-series-view';

const TAB_PUBLISH_STATUS: Partial<Record<SeriesTabKey, 'draft' | 'published' | 'archived'>> = {
  drafts: 'draft',
  published: 'published',
  archived: 'archived',
};

function buildAdminSeriesUrl(params: {
  q: string;
  tab: SeriesTabKey;
  filters: SeriesFilterValue;
  sort: SeriesSortKey;
  page: number;
  limit: number;
}): string {
  const search = new URLSearchParams();
  if (params.q.trim()) search.set('q', params.q.trim());
  if (params.tab === 'series') search.set('type', 'series');
  if (params.tab === 'movies') search.set('type', 'movie');
  const publishStatus = TAB_PUBLISH_STATUS[params.tab];
  if (publishStatus) search.set('publish_status', publishStatus);
  if (params.filters.country) search.set('country', params.filters.country);
  if (params.filters.genre) search.set('genre', params.filters.genre);
  search.set('sort', params.sort);
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  return process.env.NEXT_PUBLIC_API_URL + '/admin/series?' + search.toString();
}

export default function AdminSeriesPage() {
  const { open: openAuthModal } = useAuthModal();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');

  const [rows, setRows] = useState<AdminSeries[]>([]);
  const [counts, setCounts] = useState<SeriesTabCounts | null>(null);
  const [filterOptions, setFilterOptions] = useState<{ countries: string[]; genres: string[] }>({ countries: [], genres: [] });
  const [pagination, setPagination] = useState<SeriesPagination | null>(null);
  const [rowsLoading, setRowsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState<SeriesTabKey>('all');
  const [filters, setFilters] = useState<SeriesFilterValue>({ country: null, genre: null });
  const [sort, setSort] = useState<SeriesSortKey>('updated_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Hydration-safety pattern (same as AdminSidebar/DashboardShell): always
  // initialize to the default so server and first client render match,
  // then read localStorage in an effect after mount -- never in the
  // useState initializer itself.
  const [view, setView] = useState<ViewMode>('list');

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [availableTags, setAvailableTags] = useState<Record<TagDimension, Tag[]>>(EMPTY_TAGS);
  const [availableCollections, setAvailableCollections] = useState<CollectionOption[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreOption[]>([]);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [editingSeries, setEditingSeries] = useState<AdminSeries | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);

  useAdminPageHeader({
    title: 'Series & Movies',
    subtitle: 'Manage all your series and movies in one place.',
    search: (
      <div className="hidden md:block relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search title, country, genre..."
          className="bg-card text-foreground placeholder:text-muted-foreground rounded-full pl-9 pr-4 py-2.5 text-sm border border-border shadow-sm focus:outline-none focus:border-ring transition-colors w-[260px]"
        />
      </div>
    ),
    actions: (
      <div className="flex items-center gap-2.5">
        <SeriesFiltersButton
          value={filters}
          countries={filterOptions.countries}
          genres={filterOptions.genres}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />
        {/* No manual "create a title" form exists yet -- every title enters
            the catalog via the TMDB import/candidate-review pipeline (see
            app/admin/import), so this is where "+ Add title" sends you. */}
        <Link
          href="/admin/import"
          className="flex items-center justify-center gap-1.5 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="size-4" />
          Add title
        </Link>
      </div>
    ),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccess('signed_out');
    });
  }, []);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(VIEW_STORAGE_KEY) : null;
    if (stored === 'grid' || stored === 'list') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safety pattern, see AdminShell's collapsed-state effect for the same convention
      setView(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting to page 1 whenever the tab/search/sort itself changes is the intended behavior, not a derived-value sync this could be rewritten to avoid
    setPage(1);
  }, [tab, debouncedSearch, sort]);

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

  async function loadRows() {
    setRowsLoading(true);
    const result = await withAdminAuth((authHeader) =>
      fetch(buildAdminSeriesUrl({ q: debouncedSearch, tab, filters, sort, page, limit }), { headers: authHeader })
    );

    if (!result) {
      setRowsLoading(false);
      return;
    }
    if (result.status === 403) {
      setAccess('forbidden');
      setRowsLoading(false);
      return;
    }
    if (!result.ok) {
      setAccess('error');
      setRowsLoading(false);
      return;
    }

    const json = await result.json();
    setRows(json.data || []);
    setCounts(json.counts ?? null);
    setFilterOptions(json.filters ?? { countries: [], genres: [] });
    setPagination(json.pagination ?? null);
    setAccess('ok');
    setRowsLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadRows fetches from the network; its setState calls all happen after an await, this just flags the call site
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, debouncedSearch, tab, filters, sort, page, limit]);

  useEffect(() => {
    if (!user) return;

    async function loadSupportingData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const authHeader = { Authorization: 'Bearer ' + session.access_token };

      const [tagsRes, collectionsRes, genresRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/tags', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/collections', { headers: authHeader }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/genres', { headers: authHeader }),
      ]);

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
        setAvailableGenres((genresJson.data || []).map((g: { id: number; name: string }) => ({ id: g.id, name: g.name })));
      }
    }

    loadSupportingData();
  }, [user]);

  // Selection is page-scoped (matches the mockup's "0 selected" resetting
  // as you page/filter) -- clear it whenever the row set changes for a
  // reason other than the rows themselves mutating in place.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing selection is the intended reaction to the row set changing underneath it, not a value derivable during render
    setSelectedIds(new Set());
  }, [tab, filters, sort, page, limit, debouncedSearch]);

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const allSelected = rows.length > 0 && rows.every((r) => prev.has(r.id));
      if (allSelected) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  }

  async function handleStatusChange(row: AdminSeries, next: PublishStatus) {
    setBusyIds((prev) => new Set(prev).add(row.id));
    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/series/' + row.id, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish_status: next }),
      })
    );
    setBusyIds((prev) => {
      const n = new Set(prev);
      n.delete(row.id);
      return n;
    });
    if (result?.ok) await loadRows();
  }

  async function handleBulkAction(action: BulkAction) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === 'delete') {
      const confirmed = window.confirm(
        'Permanently delete ' + ids.length + ' title(s)? This removes them from every watchlist and deletes their ratings too. This cannot be undone.'
      );
      if (!confirmed) return;
    }

    setBusyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });

    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/series/bulk', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
    );

    setBusyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

    if (result?.ok) {
      setSelectedIds(new Set());
      await loadRows();
    }
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
      setEditingSeries(null);
      await loadRows();
    }
  }

  async function handleEdit(target: AdminSeries) {
    // S1-02: GET /admin/series/:id, not the public GET /series/:id -- the
    // public route now 404s on drafts/archived titles (see
    // migrations/012_series_publish_status.sql), which would make an
    // unpublished title un-editable from here otherwise.
    setLoadingEditId(target.id);
    const result = await withAdminAuth((authHeader) =>
      fetch(process.env.NEXT_PUBLIC_API_URL + '/admin/series/' + target.id, { headers: authHeader })
    );
    setLoadingEditId(null);

    if (!result?.ok) {
      window.alert('Could not load this title\u2019s full details. Try again.');
      return;
    }

    const json = await result.json();
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

    if (result?.ok) await loadRows();
  }

  const busyIdsWithEditLoad = useMemo(() => {
    if (loadingEditId == null) return busyIds;
    return new Set(busyIds).add(loadingEditId);
  }, [busyIds, loadingEditId]);

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
        <p className="text-rose-500">Could not load titles. Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 md:px-8 lg:px-10 py-6 md:py-8 flex flex-col gap-4">
        <SeriesTabs
          active={tab}
          counts={counts}
          onChange={(next) => {
            setTab(next);
            setFilters({ country: null, genre: null });
          }}
        />

        <SeriesFilterChips
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />

        <AdminSeriesTable
          rows={rows}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAllOnPage={toggleAllOnPage}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          busyIds={rowsLoading ? new Set(rows.map((r) => r.id)) : busyIdsWithEditLoad}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
        />
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
