import Link from 'next/link';

// Unlike Popular Tags (tropes aren't a real filter yet), genre IS a real,
// working filter on this page -- clicking a pill sets DiscoverAuthed's
// filter state directly via onSelect rather than linking away. `genres`
// comes from the real catalog (GET /series's genre_names, see P2-06/
// P2-07), not the fixed lib/exploreMock.ts GENRES list -- that list's
// keys don't match real TMDb genre names, so pills built from it would
// silently never match any series.
export default function ExploreByGenreCard({
  genres,
  onSelect,
}: {
  genres: string[];
  onSelect: (genre: string) => void;
}) {
  if (genres.length === 0) return null;

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Explore by Genre</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre)}
            className="bg-muted text-foreground/75 text-[12.5px] font-medium px-3.5 py-1.5 rounded-full hover:bg-brand-blush/30 hover:text-foreground transition-colors"
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}