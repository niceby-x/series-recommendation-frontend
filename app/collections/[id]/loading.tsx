// Route-level skeleton for /collections/[id] (a single collection's
// detail page). Was previously missing -- without its own loading.tsx,
// the segment inherited app/collections/loading.tsx's CardGridSkeleton,
// which is shaped for the /collections listing (a grid of collections),
// not one collection's own header-plus-series-grid layout. Lower-impact
// than the series/[id] case since this page is a client component that
// manages its own 'checking' state (so this only covers the brief window
// before that mounts, not the real data-fetch wait -- see the page's own
// state === 'checking' branch), but still the wrong inherited shape, so
// worth its own boundary.
//
// Mirrors the real page's structure (see app/collections/[id]/page.tsx):
// a back button, an editable title/description header, a search bar, and
// a grid of series cards at grid-cols-2 md:grid-cols-3 lg:grid-cols-5,
// matching the real grid exactly.

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="animate-pulse h-4 w-32 rounded-full bg-muted mb-6" />

      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse h-9 w-72 rounded-full bg-muted mb-3" />
        <div className="animate-pulse h-4 w-96 max-w-full rounded-full bg-muted mb-8" />

        <div className="animate-pulse h-11 w-full max-w-sm rounded-full bg-muted mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted aspect-[2/3]" />
          ))}
        </div>
      </div>
    </main>
  );
}
