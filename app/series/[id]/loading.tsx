// Route-level skeleton for /series/[id] (a single series' detail page).
// Was previously missing entirely -- without its own loading.tsx, Next.js
// falls back to the nearest ancestor's, which was app/series/loading.tsx's
// CardGridSkeleton (a 9-card catalog grid). That's the wrong shape for a
// detail page (poster + title + synopsis + related row, not a grid of
// cards), so it was a genuine mismatch rather than an approximation --
// this file gives the segment its own boundary so that inherited mismatch
// stops happening.
//
// Mirrors the real page's actual structure (see app/series/[id]/page.tsx):
// a back-link, a poster-plus-content two-column layout with placeholder
// bars for the badges/title/meta/genre-chips/synopsis card, then a
// related-series strip at the bottom.

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="animate-pulse h-4 w-32 rounded-full bg-muted mb-6" />

      <div className="max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-64 shrink-0">
          <div className="animate-pulse aspect-[2/3] w-full rounded-xl bg-muted" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-4">
            <div className="animate-pulse h-6 w-16 rounded-full bg-muted" />
            <div className="animate-pulse h-6 w-20 rounded-full bg-muted" />
          </div>

          <div className="animate-pulse h-9 w-3/4 max-w-sm rounded-full bg-muted mb-3" />
          <div className="animate-pulse h-4 w-1/3 max-w-[180px] rounded-full bg-muted mb-6" />

          <div className="flex gap-6 mb-6">
            <div className="animate-pulse h-4 w-20 rounded-full bg-muted" />
            <div className="animate-pulse h-4 w-24 rounded-full bg-muted" />
            <div className="animate-pulse h-4 w-16 rounded-full bg-muted" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-7 w-20 rounded-full bg-muted" />
            ))}
          </div>

          <div className="animate-pulse h-10 w-36 rounded-full bg-muted mb-6" />

          <div className="animate-pulse rounded-xl p-6 bg-muted h-32" />
        </div>
      </div>

      {/* Related series strip */}
      <div className="mt-12 max-w-4xl">
        <div className="animate-pulse h-6 w-48 rounded-full bg-muted mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted aspect-[2/3]" />
          ))}
        </div>
      </div>
    </main>
  );
}
