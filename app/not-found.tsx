// Root not-found page (P3-02). Renders for any URL that doesn't match a
// route, and for explicit notFound() calls -- including the series-detail
// page's 404 path added in P1-02 (app/series/[id]/page.tsx). Plain Server
// Component, no client interactivity needed.

import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import FlowerIcon from '../components/shared/FlowerIcon';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-3xl bg-card/80 backdrop-blur-md border border-white/60 shadow-brand px-8 py-10 text-center">
        <span className="mx-auto mb-5 flex items-center justify-center size-16 rounded-full bg-brand-lilac/40">
          <FlowerIcon className="size-8 text-secondary" />
        </span>

        <p className="text-secondary text-[13px] font-bold tracking-wide mb-1.5">404</p>
        <h1 className="font-heading text-2xl text-foreground mb-2">This page wandered off</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          We couldn&apos;t find what you&apos;re looking for. It may have been moved, renamed, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[14px] font-semibold px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(197,84,143,0.35)] hover:opacity-90 transition-opacity"
          >
            <Home className="size-4" />
            Go home
          </Link>

          <Link
            href="/series"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground text-[14px] font-semibold px-6 py-2.5 rounded-full hover:bg-muted transition-colors"
          >
            <Compass className="size-4" />
            Browse series
          </Link>
        </div>
      </div>
    </main>
  );
}
