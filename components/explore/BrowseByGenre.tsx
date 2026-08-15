'use client';

// D2-03: genre names and counts are now real, derived from the currently-
// loaded catalog (same "count what's been fetched so far" pattern
// DiscoverAuthed.tsx already uses for its country/genre/year dropdown
// options) -- not lib/exploreMock.ts's GENRES, which paired each mock
// genre with a fabricated mockCount since there's no genre-count
// aggregate endpoint. Real genre strings have no curated icon mapping, so
// every tile now shares one generic Tag icon instead of a
// genre-specific one.

import { Grid2x2, Tag } from 'lucide-react';

interface BrowseByGenreProps {
  onSelect: (genre: string) => void;
  // Real genre name -> count of currently-loaded series with that genre.
  genreCounts: { name: string; count: number }[];
}

const TILE_GRADIENTS = [
  'from-brand-blush/70 to-brand-mauve/80',
  'from-brand-lilac/70 to-brand-mauve/80',
  'from-brand-blush/70 to-brand-lilac/80',
  'from-brand-mauve/70 to-brand-blush/80',
  'from-brand-lilac/70 to-brand-blush/80',
  'from-brand-mauve/70 to-brand-lilac/80',
  'from-brand-blush/60 to-brand-mauve/70',
  'from-brand-lilac/60 to-brand-mauve/70',
];

export default function BrowseByGenre({ onSelect, genreCounts }: BrowseByGenreProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-heading text-[24px] font-normal text-foreground">
          <span className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-brand-lilac/30 to-brand-blush/30 text-brand-mauve shrink-0">
            <Grid2x2 className="size-4.5" />
          </span>
          Browse by Genre
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {genreCounts.map(({ name, count }, i) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={
              'group relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br shadow-sm transition-transform hover:-translate-y-0.5 ' +
              TILE_GRADIENTS[i % TILE_GRADIENTS.length]
            }
          >
            <Tag className="absolute -right-2 -bottom-2 size-16 text-white/20 rotate-[-12deg]" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-left">
              <p className="font-heading text-white text-[17px] font-semibold mb-0.5">{name}</p>
              <p className="text-white/80 text-[12px]">{count.toLocaleString()} series</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
