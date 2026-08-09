'use client';

// Admin-scoped error boundary (A3-02). Next.js renders this instead of the
// root app/error.tsx for anything under /admin, since a route segment's own
// error.tsx takes priority over its parent's. Most admin pages already
// catch their own fetch failures inline (see the AccessState 'error' branch
// in app/admin/page.tsx and its siblings) -- this boundary is for the
// remaining case those don't cover: an unhandled render-time exception
// (e.g. a malformed response shape throwing while mapping over rows). The
// root error.tsx's "Go home"/"try again" pairing isn't useful mid-
// moderation-task, so this offers "Back to dashboard" instead of "Go home".
// Must be a Client Component per Next's error.tsx contract.

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, LayoutDashboard } from 'lucide-react';
import FlowerIcon from '../../components/shared/FlowerIcon';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console/monitoring for debugging --
    // the UI itself stays friendly and non-technical.
    console.error('Unhandled admin error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-3xl bg-card/80 backdrop-blur-md border border-white/60 shadow-brand px-8 py-10 text-center">
        <span className="mx-auto mb-5 flex items-center justify-center size-16 rounded-full bg-brand-blush/45">
          <FlowerIcon className="size-8 text-primary" />
        </span>

        <h1 className="font-heading text-2xl text-foreground mb-2">Something went wrong in admin</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          We hit a snag loading this page. Your data wasn&apos;t affected -- try again, or head back to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[14px] font-semibold px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(197,84,143,0.35)] hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground text-[14px] font-semibold px-6 py-2.5 rounded-full hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
