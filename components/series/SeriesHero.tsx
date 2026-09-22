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
  country: string;
  year: number;
  episodeCount: number;
  backdropUrl: string | null;
  posterUrl: string | null;
  trailerUrl?: string | null;
}

const HERO_LAYOUT_TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

export default function SeriesHero({
  id,
  title,
  country,
  year,
  episodeCount,
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
      className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[24px] overflow-hidden bg-muted shadow-sm group"
    >
      {heroImage ? (
        <Image
          src={heroImage}
          alt={title}
          fill
          sizes="(max-width: 1280px) 100vw, 800px"
          className={backdropUrl ? 'object-cover' : 'object-cover object-top'}
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
            sizes="(max-width: 1280px) 100vw, 800px"
            className="object-cover object-top"
          />
        </motion.div>
      )}

      {/* Gradient Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top Right Action Icons */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button aria-label="Like" className="flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
          <Heart className="size-4" />
        </button>
        <WatchlistButton seriesId={id} />
        <button aria-label="More options" className="flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Bottom Left Content */}
      <div className="absolute bottom-6 left-6 text-white">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
            {country}
          </span>
          <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
            {year}
          </span>
          <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
            {episodeCount} Episodes
          </span>
        </div>

        {trailerUrl && (
          <a
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-purple-vivid rounded-full font-bold text-sm shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Play className="size-4 fill-current" />
            Watch Trailer
          </a>
        )}
      </div>
    </motion.section>
  );
}
