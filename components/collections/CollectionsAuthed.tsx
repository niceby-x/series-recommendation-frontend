'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DashboardSidebar from '../dashboard/DashboardSidebar';
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

const INITIAL_MORE_VISIBLE = 6;

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
// narrow to one or the other; Sort only reorders the curated grid, same
// scope as the original mockup.
export default function CollectionsAuthed() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [showAllCurated, setShowAllCurated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mine, setMine] = useState<RealCollection[]>([]);
  const [curated, setCurated] = useState<RealCollection[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadAll = useCallback(async () => {
    const header = await authHeader();
    if (!header) return;

    const [mineRes, curatedRes] = await Promise.all([
      fetch(process.env.NEXT_PUBLIC_API_URL + '/collections?mine=true', { headers: header }),
      fetch(process.env.NEXT_PUBLIC_API_URL + '/collections', { headers: header }),
    ]);

    if (mineRes.ok) {
      const json = await mineRes.json();
      setMine(json.data || []);
    }
    if (curatedRes.ok) {
      const json = await curatedRes.json();
      setCurated(json.data || []);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const showMine = selectedFilter === 'all' || selectedFilter === 'mine';
  const showCurated = selectedFilter === 'all' || selectedFilter === 'curated';

  const sortedCurated = useMemo(() => {
    const list = [...curated];
    if (sort === 'most_series') return list.sort((a, b) => b.series_count - a.series_count);
    if (sort === 'alpha') return list.sort((a, b) => a.title.localeCompare(b.title));
    return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [curated, sort]);

  const visibleCurated = showAllCurated ? sortedCurated : sortedCurated.slice(0, INITIAL_MORE_VISIBLE);

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

    setMine((prev) => [
      {
        id: json.data.id,
        title: json.data.title,
        description: json.data.description,
        is_curated: false,
        is_mine: true,
        series_count: 0,
        progress_pct: 0,
        updated_at: json.data.updated_at,
      },
      ...prev,
    ]);
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
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 min-w-0 flex justify-center px-5 md:px-8 lg:px-10 py-6 md:py-8">
        <div className="w-full max-w-[1400px]">
          <DashboardHeader title="Collections" subtitle="Organize and revisit your favorite series." />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start">
            <main className="min-w-0">
              <CollectionFilterChips selected={selectedFilter} onSelect={setSelectedFilter} />

              {showMine && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <h2 className="font-heading text-[22px] font-normal text-foreground flex items-center gap-2">
                      My Collections
                      <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brand-blush/30 text-primary text-[12.5px] font-bold">
                        {mine.length}
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

                  {loaded && mine.length === 0 ? (
                    <p className="text-muted-foreground text-sm mb-10">
                      You haven&apos;t made a collection yet -- create one above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                      {mine.map((collection) => (
                        <CollectionCard key={collection.id} collection={collection} onDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {showCurated && sortedCurated.length > 0 && (
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
                    {visibleCurated.map((collection) => (
                      <CollectionListItem key={collection.id} collection={collection} />
                    ))}
                  </div>

                  {sortedCurated.length > INITIAL_MORE_VISIBLE && (
                    <div className="flex justify-center mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAllCurated((v) => !v)}
                        className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity"
                      >
                        {showAllCurated ? 'Show Less' : 'Show More Collections'}
                        <ChevronDown className={'size-4 transition-transform ' + (showAllCurated ? 'rotate-180' : '')} />
                      </button>
                    </div>
                  )}
                </section>
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <CollectionOverviewCard mine={mine} curated={curated} />
              <RecentlyUpdatedCard collections={[...mine, ...curated]} />
              <CreateCollectionCTA onCreate={() => setModalOpen(true)} />
            </aside>
          </div>
        </div>
      </div>

      {modalOpen && <CreateCollectionModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
    </div>
  );
}
