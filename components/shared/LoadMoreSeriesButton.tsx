'use client';

interface Props {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
}

// Shared "Load more" control for the Series/Discover browse grid (both the
// logged-in and logged-out variants) -- see lib/usePaginatedSeries.ts.
export default function LoadMoreSeriesButton({ hasMore, loading, onClick }: Props) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bg-card border border-border hover:border-ring disabled:cursor-not-allowed text-foreground px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-colors"
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  );
}
