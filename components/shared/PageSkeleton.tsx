// Shared skeleton building block for route-level loading.tsx files
// (app/series, app/moods, app/tropes, app/collections -- see P3-03).
// Kept as one component so the four pulsing card-grids stay visually
// consistent instead of four near-duplicate hand-rolled layouts, and so a
// fifth "key route" can pick this up later with just a props tweak.

export function CardGridSkeleton({
  count = 8,
  gridClassName = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6',
  withSidebar = true,
}: {
  count?: number;
  gridClassName?: string;
  withSidebar?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background px-6 md:px-10 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="animate-pulse h-8 w-56 rounded-full bg-muted mb-3" />
        <div className="animate-pulse h-4 w-80 rounded-full bg-muted mb-8" />

        <div className={withSidebar ? 'grid grid-cols-1 xl:grid-cols-[1fr_336px] gap-8 items-start' : ''}>
          <div className={gridClassName}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[2/3]" />
            ))}
          </div>

          {withSidebar && (
            <aside className="hidden xl:flex flex-col gap-4">
              <div className="animate-pulse h-40 rounded-2xl bg-muted" />
              <div className="animate-pulse h-24 rounded-2xl bg-muted" />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
