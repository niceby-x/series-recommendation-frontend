'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MoreHorizontal, Play } from 'lucide-react';
import WatchlistButton from '@/components/shared/WatchlistButton';
import {
  readSeriesTransitionPreview,
  seriesPosterLayoutId,
  type SeriesTransitionPreview,
} from '@/lib/seriesTransitionCache';

interface SeriesHeroProps {
  id: number;
  title: string;
  backdropUrl: string | null;
  posterUrl: string | null;
  trailerUrl?: string | null;
}

const HERO_LAYOUT_TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

export default function SeriesHero({
  id,
  title,
  backdropUrl,
  posterUrl,
  trailerUrl,
}: SeriesHeroProps) {
  // The real backdrop is already in props by the time this renders (the
  // Server Component parent awaited the fetch), so this is only ever used
  // to decide what to crossfade *from* -- the poster the user actually
  // clicked, carried across the navigation by seriesTransitionCache. A
  // direct page load / refresh has no preview and just renders the
  // backdrop straight away, no crossfade.
  // Starts null (matching the server's render, since there's no
  // sessionStorage there) and is only populated in an effect after mount --
  // same hydration-safety reason as AdminShell's collapsed-sidebar pref:
  // reading sessionStorage during the lazy useState initializer would
  // return different values on the server (always null) vs. a client that
  // just navigated here from a card (a real preview), mismatching the
  // hero's DOM between server and client.
  const [preview, setPreview] = useState<SeriesTransitionPreview | null>(null);
  useEffect(() => {
    const found = readSeriesTransitionPreview(id);
    if (found) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(found);
    }
  }, [id]);

  const heroImage = backdropUrl || posterUrl;
  const showCrossfade = preview?.posterUrl && preview.posterUrl !== backdropUrl;

  return (
    <motion.section
      layoutId={seriesPosterLayoutId(id)}
      transition={{ layout: HERO_LAYOUT_TRANSITION }}
      className="relative w-full h-[clamp(300px,52vh,520px)] overflow-hidden bg-muted"
    >
      {heroImage ? (
        <Image
          src={heroImage}
          alt={title}
          fill
          sizes="(max-width: 1280px) 100vw, 1152px"
          className={backdropUrl ? 'object-cover object-[50%_25%]' : 'object-cover object-top'}
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blush to-brand-lilac" />
      )}

      {/* Crossfades the clicked poster out once the real backdrop has had a
          moment to paint -- covers the gap between "morph lands" and "the
          wider backdrop image is actually the same pixels as the poster". */}
      {showCrossfade && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeInOut' }}
        >
          <Image
            src={preview!.posterUrl!}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1280px) 100vw, 1152px"
            className="object-cover object-top"
          />
        </motion.div>
      )}

      {/* Scrims: a soft one up top so the action buttons read on bright art,
          and a plum-tinted (not pure black) one from the bottom so the title
          and trailer button read on any art while staying on-brand. */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#2b1533]/90 via-[#2b1533]/40 to-transparent" />

      {/* Top Right Action Icons */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button aria-label="Like" className="flex items-center justify-center size-9 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
          <Heart className="size-4" />
        </button>
        <WatchlistButton seriesId={id} />
        <button aria-label="More options" className="flex items-center justify-center size-9 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Bottom row: title on the left, Watch Trailer on the right */}
      <div className="absolute inset-x-8 bottom-7 flex flex-col items-start gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
        <h1 className="max-w-2xl min-w-0 text-balance font-heading text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          {title}
        </h1>

        {trailerUrl && (
          <a
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 px-6 py-2.5 bg-white text-brand-purple-vivid rounded-full font-bold text-sm shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-gray-100 transition-colors"
          >
            <Play className="size-4 fill-current" />
            Watch Trailer
          </a>
        )}
      </div>
    </motion.section>
  );
}