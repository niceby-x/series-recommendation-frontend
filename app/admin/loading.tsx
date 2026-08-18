// Admin-scoped loading fallback (A3-02). Applies to /admin and any
// sub-route (candidates, users, series, etc.) that doesn't define its own
// loading.tsx, taking priority over the root app/loading.tsx for anything
// under this segment. Most admin pages are Client Components that manage
// their own 'checking' access state once mounted, so this fallback is
// mainly visible for the brief window before that client code hydrates --
// still worth having so a first admin navigation doesn't flash the generic
// public loading screen. Plain Server Component, no client interactivity
// needed.

import FlowerIcon from '../../components/shared/FlowerIcon';

export default function AdminLoading() {
  return (
    <main className="h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex items-center justify-center size-14">
          <span className="absolute inset-0 rounded-full bg-brand-gradient opacity-20 animate-ping" />
          <FlowerIcon className="size-8 text-primary animate-pulse" />
        </span>
        <p className="text-muted-foreground text-sm font-medium">Loading admin dashboard…</p>
      </div>
    </main>
  );
}
