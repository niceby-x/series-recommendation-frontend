'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, Plus, FolderOpen } from 'lucide-react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import CollectionFilterChips from './CollectionFilterChips';
import CollectionCard from './CollectionCard';
import CollectionListItem from './CollectionListItem';
import CollectionOverviewCard from './CollectionOverviewCard';
import RecentlyUpdatedCard from './RecentlyUpdatedCard';
import CreateCollectionCTA from './CreateCollectionCTA';
import CreateCollectionModal from './CreateCollectionModal';
import { MY_COLLECTIONS, MORE_COLLECTIONS, type Collection } from '../../lib/collectionsContent';

type SortKey = 'updated' | 'most_series' | 'alpha';

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently Updated',
  most_series: 'Most Series',
  alpha: 'A–Z',
};

const INITIAL_MORE_VISIBLE = 4;

// The logged-in Collections page. "My Collections" (the 4 featured cards)
// stays in its original curated order -- Sort only reorders "More
// Collections" below it, same scope the mockup implies (Sort sits right by
// that grid, not above the featured row). Filtering (status chips) applies
// to both rows. Newly created collections are appended to "More
// Collections" state only -- see CreateCollectionModal for why this isn't
// persisted anywhere.
export default function CollectionsAuthed() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [showAllMore, setShowAllMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [moreCollections, setMoreCollections] = useState<Collection[]>(MORE_COLLECTIONS);

  // "My Collections" has no separate ownership concept yet (single-user
  // app, no shared/public collections) -- so it's an alias for "all", same
  // honest simplification noted in lib/collectionsContent.ts.
  const matchesFilter = useCallback(
    (c: Collection) => {
      if (selectedFilter === 'all' || selectedFilter === 'mine') return true;
      return c.status === selectedFilter;
    },
    [selectedFilter]
  );

  const visibleFeatured = useMemo(() => MY_COLLECTIONS.filter(matchesFilter), [matchesFilter]);

  const sortedMore = useMemo(() => {
    const filtered = moreCollections.filter(matchesFilter);
    if (sort === 'most_series') return [...filtered].sort((a, b) => b.seriesCount - a.seriesCount);
    if (sort === 'alpha') return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [moreCollections, sort, matchesFilter]);

  const visibleMore = showAllMore ? sortedMore : sortedMore.slice(0, INITIAL_MORE_VISIBLE);

  function handleCreate(title: string, description: string) {
    const created: Collection = {
      key: 'created-' + Date.now(),
      icon: FolderOpen,
      title,
      description: description || 'A new collection.',
      seriesCount: 0,
      updatedAgo: 'just now',
      progressPct: 0,
      status: 'plan_to_watch',
      imageUrl: null,
    };
    setMoreCollections((prev) => [created, ...prev]);
    setModalOpen(false);
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

              <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <h2 className="font-heading text-[22px] font-normal text-foreground flex items-center gap-2">
                  My Collections
                  <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brand-blush/30 text-primary text-[12.5px] font-bold">
                    {visibleFeatured.length}
                  </span>
                </h2>

                <div className="flex items-center gap-2.5">
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

                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Plus className="size-4" />
                    Create Collection
                  </button>
                </div>
              </div>

              {visibleFeatured.length === 0 ? (
                <p className="text-muted-foreground text-sm mb-10">No collections match this filter yet.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                  {visibleFeatured.map((collection) => (
                    <CollectionCard key={collection.key} collection={collection} />
                  ))}
                </div>
              )}

              {sortedMore.length > 0 && (
                <section>
                  <h2 className="font-heading text-[22px] font-normal text-foreground mb-4">More Collections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleMore.map((collection) => (
                      <CollectionListItem key={collection.key} collection={collection} />
                    ))}
                  </div>

                  {sortedMore.length > INITIAL_MORE_VISIBLE && (
                    <div className="flex justify-center mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAllMore((v) => !v)}
                        className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:opacity-80 transition-opacity"
                      >
                        {showAllMore ? 'Show Less' : 'Show More Collections'}
                        <ChevronDown className={'size-4 transition-transform ' + (showAllMore ? 'rotate-180' : '')} />
                      </button>
                    </div>
                  )}
                </section>
              )}
            </main>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-8">
              <CollectionOverviewCard />
              <RecentlyUpdatedCard />
              <CreateCollectionCTA onCreate={() => setModalOpen(true)} />
            </aside>
          </div>
        </div>
      </div>

      {modalOpen && <CreateCollectionModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
    </div>
  );
}
