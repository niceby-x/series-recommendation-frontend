// Root loading fallback (P3-01). Applies to any route under the app root
// that doesn't define its own loading.tsx. The four "key routes" called out
// in P3-03 (series, moods, tropes, collections) define their own more
// specific skeletons which take priority over this one -- see
// app/series/loading.tsx etc. This one stays deliberately generic since it
// covers everything else (home, about, my-list, series/[id], collections/[id], ...).

import FlowerIcon from '../components/shared/FlowerIcon';

export default function Loading() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex items-center justify-center size-14">
          <span className="absolute inset-0 rounded-full bg-brand-gradient opacity-20 animate-ping" />
          <FlowerIcon className="size-8 text-primary animate-pulse" />
        </span>
        <p className="text-muted-foreground text-sm font-medium">Loading…</p>
      </div>
    </main>
  );
}
