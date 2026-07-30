'use client';

// Series counts here are mock — there's no public endpoint returning
// genre -> series count (genres live in a join table with no aggregate
// query exposed yet). See lib/exploreMock.ts.

import { Grid2x2 } from 'lucide-react';
import { GENRES } from '../../lib/exploreMock';

interface BrowseByGenreProps {
  onSelect: (genre: string) => void;
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

export default function BrowseByGenre({ onSelect }: BrowseByGenreProps) {
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
        {GENRES.map(({ key, label, icon: Icon, mockCount }, i) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={
              'group relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br shadow-sm transition-transform hover:-translate-y-0.5 ' +
              TILE_GRADIENTS[i % TILE_GRADIENTS.length]
            }
          >
            <Icon className="absolute -right-2 -bottom-2 size-16 text-white/20 rotate-[-12deg]" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-left">
              <p className="font-heading text-white text-[17px] font-semibold mb-0.5">{label}</p>
              <p className="text-white/80 text-[12px]">{mockCount.toLocaleString()} series</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
