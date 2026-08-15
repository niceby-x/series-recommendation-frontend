'use client';

import { LayoutGrid, Tag } from 'lucide-react';

interface GenreStripProps {
  activeGenre: string | null; // null = "All"
  onSelect: (genre: string | null) => void;
  // D2-03: real genre names derived from the catalog, replacing the fixed
  // mock GENRES taxonomy (each with its own curated icon) this strip used
  // to render -- arbitrary real genre strings have no icon mapping, so
  // every chip now shares one generic Tag icon instead.
  genres: string[];
}

export default function GenreStrip({ activeGenre, onSelect, genres }: GenreStripProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={
            'flex flex-col items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-2xl transition-colors ' +
            (activeGenre === null ? 'bg-brand-gradient text-white' : 'text-foreground hover:bg-muted')
          }
        >
          <LayoutGrid className="size-5" />
          <span className="text-xs font-semibold whitespace-nowrap">All</span>
        </button>

        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre)}
            className={
              'flex flex-col items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-2xl transition-colors ' +
              (activeGenre === genre ? 'bg-brand-gradient text-white' : 'text-foreground hover:bg-muted')
            }
          >
            <Tag className="size-5" />
            <span className="text-xs font-semibold whitespace-nowrap">{genre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
