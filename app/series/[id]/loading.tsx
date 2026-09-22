'use client';

// Route-level skeleton for /series/[id] (a single series' detail page).
// Mirrors the real page's structure (see components/series/SeriesDetailView.tsx):
// a back-link, a wide hero banner plus tab row on the left, a details
// card and a "what to expect" card on the right, then a related-series
// strip. Rendered without the dashboard frame -- loading.tsx can't know
// yet whether the visitor is signed in, and a plain skeleton is a fine
// stand-in either way.
//
// The hero slot carries the same layoutId as the SeriesCard poster the
// user clicked (see lib/seriesTransitionCache.ts) and, when a preview is
// available, renders that poster immediately instead of a grey box --
// that's what lets the shared-element morph land here first, before the
// real page's fetch has even resolved, rather than jumping straight to a
// blank skeleton and only animating once real data arrives.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  peekSeriesTransitionPreview,
  seriesPosterLayoutId,
  type SeriesTransitionPreview,
} from '@/lib/seriesTransitionCache';

function useSeriesIdFromPath(): string | null {
  const pathname = usePathname();
  const match = pathname?.match(/^\/series\/([^/]+)/);
  return match ? match[1] : null;
}

export default function Loading() {
  const id = useSeriesIdFromPath();
  // Same hydration-safety pattern as SeriesHero's preview state (and
  // AdminShell's collapsed-sidebar pref) -- starts null to match the
  // server's render, only populated client-side after mount.
  const [preview, setPreview] = useState<SeriesTransitionPreview | null>(null);
  useEffect(() => {
    const found = id ? peekSeriesTransitionPreview(id) : null;
    if (found) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(found);
    }
  }, [id]);

  const previewImage = preview?.backdropUrl || preview?.posterUrl;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse h-4 w-32 rounded-full bg-muted mb-5" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          <div className="min-w-0">
            <motion.div
              layoutId={id ? seriesPosterLayoutId(id) : undefined}
              transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[24px] overflow-hidden bg-muted"
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 1280px) 100vw, 800px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 animate-pulse" />
              )}
            </motion.div>
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
