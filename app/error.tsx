'use client';

// Root error boundary (P3-01). Next.js renders this in place of the page
// content whenever a Server or Client Component under this route segment
// throws during render -- e.g. a fetch that isn't wrapped in its own
// try/catch, like the series-detail page's non-404 failure path (see
// getSeriesById in app/series/[id]/page.tsx, which throws intentionally for
// anything other than a 404 so it lands here). Must be a Client Component
// per Next's error.tsx contract.

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import FlowerIcon from '../components/shared/FlowerIcon';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console/monitoring for debugging --
    // the UI itself stays friendly and non-technical.
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-3xl bg-card/80 backdrop-blur-md border border-white/60 shadow-brand px-8 py-10 text-center">
        <span className="mx-auto mb-5 flex items-center justify-center size-16 rounded-full bg-brand-blush/45">
          <FlowerIcon className="size-8 text-primary" />
        </span>

        <h1 className="font-heading text-2xl text-foreground mb-2">Something bloomed the wrong way</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          We hit a snag loading this page. It&apos;s on us, not you -- try again, or head back home.
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
            href="/"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground text-[14px] font-semibold px-6 py-2.5 rounded-full hover:bg-muted transition-colors"
          >
            <Home className="size-4" />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
