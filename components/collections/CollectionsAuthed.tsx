'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePaginatedCollections } from '../../lib/usePaginatedCollections';
import LoadMoreSeriesButton from '../shared/LoadMoreSeriesButton';
import DashboardShell from '../dashboard/DashboardShell';
import DashboardHeader from '../dashboard/DashboardHeader';
import CollectionFilterChips from './CollectionFilterChips';
import CollectionCard, { type RealCollection } from './CollectionCard';
import CollectionListItem from './CollectionListItem';
import CollectionOverviewCard from './CollectionOverviewCard';
import RecentlyUpdatedCard from './RecentlyUpdatedCard';
import CreateCollectionCTA from './CreateCollectionCTA';
import CreateCollectionModal from './CreateCollectionModal';

type SortKey = 'updated' | 'most_series' | 'alpha';

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently Updated',
  most_series: 'Most Series',
  alpha: 'A–Z',
};

const CURATED_PAGE_SIZE = 6;

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return { Authorization: 'Bearer ' + session.access_token };
}

// The logged-in Collections page. "My Collections" (the featured cards) is
// the caller's own real personal collections (GET /collections?mine=true);
// "Curated Collections" below it is every admin-curated one, visible to
// everyone (GET /collections, no auth needed for that half). Filter chips
// narrow to one or the other; Sort reorders the curated grid.
//
// G1-02: both lists are real server-side pagination now (usePaginatedCollections,
// mirroring usePaginatedSeries) instead of one unpaginated fetch-everything
// call each. The sort dropdown moved from a client-side re-sort of an
// already-fetched array to a real `sort` query param -- required once
// pagination is in play, since "Most Series"/"A-Z" would otherwise only
// reorder whatever happened to already be loaded instead of the true
// full-catalog order (see the backend handoff on this item).
export default function CollectionsAuthed() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [modalOpen, setModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setAccessToken(session?.access_token ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    collections: mine,
    setCollections: setMine,
    total: mineTotal,
    hasMore: mineHasMore,
    loading: mineLoading,
    loadingMore: mineLoadingMore,
    loadMore: loadMoreMine,
  } = usePaginatedCollections([], null, { mine: true }, accessToken);

  const {
    collections: curated,
    total: curatedTotal,
    hasMore: curatedHasMore,
    loading: curatedLoading,
    loadingMore: curatedLoadingMore,
    loadMore: loadMoreCurated,
  } = usePaginatedCollections([], null, { sort }, accessToken, CURATED_PAGE_SIZE);

  // The sidebar widgets (CollectionOverviewCard's series/completion
  // totals, RecentlyUpdatedCard's cross-list recency ranking) are real
  // aggregations over *every* collection, not just whatever page happens
  // to be loaded in the main grids above -- same "aggregation needs the
  // full data" reasoning as G1-01. Collections lists are small (a user's
  // own, or an admin-curated set) compared to the series catalog, so one
  // extra unpaginated fetch (page/limit omitted -- the backend's own
  // documented "everything" behavior) is a proportionate trade here,
  // rather than standing up a dedicated summary endpoint for two sidebar
  // widgets.
  const [statsData, setStatsData] = useState<{ mine: RealCollection[]; curated: RealCollection[] }>({ mine: [], curated: [] });

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    (async () => {
      const authHeader = { Authorization: 'Bearer ' + accessToken };
      const [mineRes, curatedRes] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL + '/collections?mine=true', { headers: authHeader, cache: 'no-store' }),
        fetch(process.env.NEXT_PUBLIC_API_URL + '/collections', { headers: authHeader, cache: 'no-store' }),
      ]);
      if (cancelled) return;

      const mineJson = mineRes.ok ? await mineRes.json() : { data: [] };
      const curatedJson = curatedRes.ok ? await curatedRes.json() : { data: [] };
      if (cancelled) return;

      setStatsData({ mine: mineJson.data || [], curated: curatedJson.data || [] });
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const showMine = selectedFilter === 'all' || selectedFilter === 'mine';
  const showCurated = selectedFilter === 'all' || selectedFilter === 'curated';

  async function handleCreate(title: string, description: string) {
    const header = await authHeader();
    if (!header) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections', {
      method: 'POST',
      headers: { ...header, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || null }),
    });

    if (!res.ok) return;
    const json = await res.json();

    const newCollection: RealCollection = {
      id: json.data.id,
      title: json.data.title,
      description: json.data.description,
      is_curated: false,
      is_mine: true,
      series_count: 0,
      progress_pct: 0,
      updated_at: json.data.updated_at,
    };

    setMine((prev) => [newCollection, ...prev]);
    setStatsData((prev) => ({ ...prev, mine: [newCollection, ...prev.mine] }));
    setModalOpen(false);
  }

  async function handleDelete(collection: RealCollection) {
    const confirmed = window.confirm('Delete "' + collection.title + '"? This cannot be undone.');
    if (!confirmed) return;

    const header = await authHeader();
    if (!header) return;

    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/collections/' + collection.id, {
      method: 'DELETE',
      headers: header,
    });

    if (res.ok) {
      setMine((prev) => prev.filter((c) => c.id !== collection.id));
      setStatsData((prev) => ({ ...prev, mine: prev.mine.filter((c) => c.id !== collection.id) }));
    }
  }

  return (
    <>
      <DashboardShell header={<DashboardHeader title="Collections" subtitle="Organize and revisit your favorite series." />}>
        <div className="w-full max-w-[1400px]">

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <CollectionFilterChips selected={selectedFilter} onSelect={setSelectedFilter} />

              {showMine && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <h2 className="font-heading text-[22px] font-normal text-foreground flex items-center gap-2">
                      My Collections
                      <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brand-blush/30 text-primary text-[12.5px] font-bold">
                        {mineTotal}
                      </span>
                    </h2>

                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex items-center gap-1.5 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity shrink-0"
                    >
                      <Plus className="size-4" />
                      Create Collection
                    </button>
                  </div>

                  {!mineLoading && mine.length === 0 ? (
                    <p className="text-muted-foreground text-sm mb-10">
                      You haven&apos;t made a collection yet -- create one above.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
                        {mine.map((collection) => (
                          <CollectionCard key={collection.id} collection={collection} onDelete={handleDelete} />
                        ))}
                      </div>
                      <div className="mb-6">
                        <LoadMoreSeriesButton hasMore={mineHasMore} loading={mineLoadingMore} onClick={loadMoreMine} />
                      </div>
                    </>
                  )}
                </>
              )}

              {showCurated && curated.length > 0 && (
                <section>
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <h2 className="font-heading text-[22px] font-normal text-foreground">Curated Collections</h2>
                    <div className="relative">
                      <select
                        aria-label="Sort collections"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-ring focus:outline-none focus:border-ring transition-colors cursor-pointer"
                      >
                        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                          <option key={key} value={key}>
                            Sort by: {SORT_LABELS[key]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {curated.map((collection) => (
                      <CollectionListItem key={collection.id} collection={collection} />
                    ))}
                  </div>

                  <LoadMoreSeriesButton hasMore={curatedHasMore} loading={curatedLoadingMore} onClick={loadMoreCurated} />
                  {!curatedLoading && curatedTotal > 0 && (
                    <p className="text-center text-muted-foreground text-xs mt-3">
                      {curated.length} of {curatedTotal}
                    </p>
                  )}
                </section>
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <CollectionOverviewCard mine={statsData.mine} curated={statsData.curated} />
              <RecentlyUpdatedCard collections={[...statsData.mine, ...statsData.curated]} />
              <CreateCollectionCTA onCreate={() => setModalOpen(true)} />
            </aside>
          </div>
      </div>
      </DashboardShell>

      {modalOpen && <CreateCollectionModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
    </>
  );
}
