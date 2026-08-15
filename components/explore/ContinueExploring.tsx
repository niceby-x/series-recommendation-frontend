'use client';

import { Play, Compass } from 'lucide-react';

interface PromoTile {
  key: string;
  title: string;
  description: string;
  count: string;
  gradient: string;
}

// Series counts here are still curated/hardcoded promotional copy for this
// component's own tiles (distinct from BrowseByGenre.tsx's genre counts,
// which are real as of D2-03) -- there's no per-tile aggregate query for
// these categories yet.
const TILES: PromoTile[] = [
  {
    key: 'new-releases',
    title: 'New Releases',
    description: 'Fresh Episodes Just for You',
    count: '18 series',
    gradient: 'from-brand-blush/80 to-brand-mauve/90',
  },
  {
    key: 'completed',
    title: 'Completed Series',
    description: 'Binge-Worthy Finished Stories',
    count: '85 series',
    gradient: 'from-brand-mauve/80 to-[#2E2438]/90',
  },
  {
    key: 'hidden-gems',
    title: 'Hidden Gems',
    description: 'Underrated but Totally Worth It',
    count: '32 series',
    gradient: 'from-brand-lilac/80 to-brand-mauve/90',
  },
  {
    key: 'top-rated',
    title: 'Top Rated',
    description: 'Highest Rated by Our Community',
    count: '50 series',
    gradient: 'from-brand-blush/80 to-brand-lilac/90',
  },
];

export default function ContinueExploring({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 text-brand-mauve shrink-0">
          <Compass className="size-4.5" />
        </span>
        <h2 className="font-heading text-[24px] font-normal text-foreground">Continue Exploring</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TILES.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => onSelect(tile.key)}
            className={
              'group relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br shadow-sm transition-transform hover:-translate-y-0.5 text-left ' +
              tile.gradient
            }
          >
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div>
                <p className="font-heading text-white text-[17px] font-semibold leading-snug">{tile.title}</p>
                <p className="text-white/80 text-[12px] mt-0.5">{tile.description}</p>
                <p className="text-white/60 text-[11px] mt-1.5">{tile.count}</p>
              </div>
              <span className="flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors self-end">
                <Play className="size-3.5 text-white translate-x-0.5" fill="currentColor" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
