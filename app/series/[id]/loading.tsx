// Route-level skeleton for /series/[id] (a single series' detail page).
// Mirrors the real page's structure (see components/series/SeriesDetailView.tsx):
// a back-link, a wide hero banner plus tab row on the left, a details
// card and a "what to expect" card on the right, then a related-series
// strip. Rendered without the dashboard frame -- loading.tsx can't know
// yet whether the visitor is signed in, and a plain skeleton is a fine
// stand-in either way.

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse h-4 w-32 rounded-full bg-muted mb-5" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          <div className="min-w-0">
            <div className="animate-pulse h-[320px] rounded-3xl bg-muted" />
            <div className="flex gap-4 mt-6 border-b border-border pb-3">
              <div className="animate-pulse h-5 w-20 rounded-full bg-muted" />
              <div className="animate-pulse h-5 w-20 rounded-full bg-muted" />
            </div>
            <div className="animate-pulse h-24 rounded-2xl bg-muted mt-6 max-w-[65ch]" />
          </div>

          <aside className="space-y-5">
            <div className="animate-pulse h-64 rounded-3xl bg-muted" />
            <div className="animate-pulse h-40 rounded-3xl bg-muted" />
          </aside>
        </div>

        <div className="mt-10">
          <div className="animate-pulse h-6 w-48 rounded-full bg-muted mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-48 w-[220px] shrink-0 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
