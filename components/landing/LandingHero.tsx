import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ListFilter, Star, Play, Plus } from 'lucide-react';
import type { SeriesCardData } from '../SeriesCard';

export default function LandingHero({ feature }: { feature: SeriesCardData | null }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blush/40 via-background to-brand-lilac/40" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-14 md:py-20 grid md:grid-cols-[1fr_0.85fr] gap-12 items-center">
        <div>
          <p className="flex items-center gap-1.5 text-primary text-[13px] font-bold tracking-wide mb-4">
            <span aria-hidden>🌸</span> CURATED WITH LOVE
          </p>
          <h1 className="font-heading text-[44px] md:text-[60px] leading-[1.05] font-normal mb-5">
            <span className="text-foreground">Where</span>
            <br />
            <span className="text-foreground">Stories</span>
            <br />
            <span className="text-primary">Bloom</span>
          </h1>
          <p className="text-muted-foreground text-[17px] leading-relaxed mb-7 max-w-md">
            Discover thoughtfully curated BL series, movies, and anime through moods, tropes,
            emotional journeys, and trusted recommendations.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/series"
              className="inline-flex items-center gap-2 bg-brand-gradient text-white text-[15px] font-semibold px-7 py-3.5 rounded-full shadow-sm hover:opacity-90 transition-opacity"
            >
              Discover Stories
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/series"
              className="inline-flex items-center gap-2 border border-border bg-card text-[15px] font-semibold px-7 py-3.5 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              Browse by Mood
              <ListFilter className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[300px]">
          {/* stacked cards behind the feature card, purely decorative */}
          <div className="absolute inset-0 rounded-[28px] bg-brand-lilac/50 rotate-6 translate-x-3" />
          <div className="absolute inset-0 rounded-[28px] bg-brand-blush/50 -rotate-3 -translate-x-2" />

          <div className="relative rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(88,54,99,0.18)] bg-card border border-border">
            <div className="relative aspect-[3/4] w-full bg-muted">
              {feature?.poster_url || feature?.backdrop_url ? (
                <Image
                  src={(feature.poster_url ?? feature.backdrop_url) as string}
                  alt={feature.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 px-6 text-center">
                  <span className="text-muted-foreground text-sm">
                    {feature?.title ?? 'Cherry Blossoms After Winter'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <span className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-brand-gradient text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                <Star className="size-3" fill="currentColor" />
                CURATOR&apos;S PICK
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-white text-[18px] font-semibold leading-tight mb-1">
                  {feature?.title ?? 'Cherry Blossoms After Winter'}
                </h3>
                <p className="text-white/75 text-[12px] mb-2.5">
                  {feature ? feature.country + ' · Series · ' + feature.year : 'Korea · Series · 2022'}
                  {' '}
                  <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
                    <Star className="size-3" fill="currentColor" /> 4.8
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {['Slow Burn', 'Healing', 'Hopeful'].map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/15 backdrop-blur-sm text-white text-[10.5px] font-medium px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={feature ? '/series/' + feature.id : '/series'}
                    className="flex-1 text-center bg-brand-gradient text-white text-[13px] font-semibold py-2.5 rounded-full hover:opacity-90 transition-opacity"
                  >
                    View Story
                  </Link>
                  <span className="flex items-center justify-center size-9 rounded-full bg-white/15 backdrop-blur-sm text-white shrink-0">
                    <Plus className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span className="absolute -top-4 -right-4 flex items-center justify-center size-11 rounded-full bg-white shadow-md text-primary">
            <Play className="size-4 translate-x-0.5" fill="currentColor" />
          </span>
        </div>
      </div>
    </div>
  );
}
