import Link from 'next/link';
import { GENRES } from '../../lib/exploreMock';

// Unlike Popular Tags (tropes aren't a real filter yet), genre IS a real,
// working filter on this page -- clicking a pill sets DiscoverAuthed's
// filter state directly via onSelect rather than linking away.
export default function ExploreByGenreCard({ onSelect }: { onSelect: (genreKey: string) => void }) {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Explore by Genre</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre.key}
            type="button"
            onClick={() => onSelect(genre.key)}
            className="bg-muted text-foreground/75 text-[12.5px] font-medium px-3.5 py-1.5 rounded-full hover:bg-brand-blush/30 hover:text-foreground transition-colors"
          >
            {genre.label}
          </button>
        ))}
      </div>
    </div>
  );
}