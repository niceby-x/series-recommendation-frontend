'use client';

import { LayoutGrid } from 'lucide-react';
import { GENRES } from '../../lib/exploreMock';

interface GenreStripProps {
  activeGenre: string | null; // null = "All"
  onSelect: (genre: string | null) => void;
}

export default function GenreStrip({ activeGenre, onSelect }: GenreStripProps) {
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

        {GENRES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={
              'flex flex-col items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-2xl transition-colors ' +
              (activeGenre === key ? 'bg-brand-gradient text-white' : 'text-foreground hover:bg-muted')
            }
          >
            <Icon className="size-5" />
            <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
