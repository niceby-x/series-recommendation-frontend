'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import { useSeriesSearch, SEARCH_MIN_QUERY_LENGTH } from '../../lib/useSeriesSearch';
import SeriesSearchResults from '../shared/SeriesSearchResults';

// The eyebrow, headline, subhead, and trust badges all now live in
// LandingPosterStage's own header overlay -- it renders the full hero
// copy on top of its 3D scene, so this component doesn't repeat any of
// it. What's left is the one thing that overlay can't hold: a real,
// working search entry point, rendered as the light landing pad right
// where the 3D stage's floor fades out. See LandingPosterStage's
// background gradient, which now ends on this section's own start color.
export default function LandingHero() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const { query: search, setQuery: setSearch, results: liveResults, loading: liveLoading, reset: resetSearch } =
    useSeriesSearch();

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim();
    setSearchFocused(false);
    router.push(trimmed ? '/series?q=' + encodeURIComponent(trimmed) : '/series');
  }

  function handleLiveResultSelect() {
    setSearchFocused(false);
    resetSearch();
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FDF1F6] via-[#FBEAF8] to-[#F1E3FB] pt-10 md:pt-14 pb-14 md:pb-18">
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(247,182,200,0.55), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute -top-10 -right-20 w-72 h-72 rounded-full blur-3xl opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,182,249,0.5), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto px-6 md:px-10">
        {/* Floating search pill -- functionally real, wired to the same
            debounced /series?q= search every other header on the site uses
            (see lib/useSeriesSearch.ts), not a decorative mockup input. */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/85 backdrop-blur-md border border-white/70 rounded-full shadow-[0_20px_50px_rgba(107,63,117,0.16)] p-2 pl-2.5">
          <Link
            href="/moods"
            className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-brand-mauve/10 shrink-0 group/vibe"
          >
            <span className="inline-flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-brand-blush/60 to-brand-lilac/60 shrink-0">
              <Sparkles className="size-4 text-brand-purple-vivid" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[12.5px] font-semibold text-brand-mauve group-hover/vibe:text-brand-pink-vivid transition-colors">
                Not sure what to read?
              </span>
              <span className="block text-[10.5px] text-foreground/45">Tell us your vibe and we&rsquo;ll find a match.</span>
            </span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                placeholder="Search stories, tropes, moods..."
                aria-label="Search stories, tropes, or moods"
                className="w-full bg-transparent text-brand-mauve placeholder:text-foreground/35 text-[13.5px] pl-3 pr-9 py-2.5 focus:outline-none"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-foreground/35 pointer-events-none" />

              {searchFocused && search.trim().length >= SEARCH_MIN_QUERY_LENGTH && (
                <SeriesSearchResults query={search.trim()} loading={liveLoading} results={liveResults} onSelect={handleLiveResultSelect} />
              )}
            </div>

            <button
              type="submit"
              aria-label="Search"
              className="inline-flex items-center justify-center size-9 sm:size-10 rounded-full bg-brand-gradient text-white shrink-0 hover:opacity-90 transition-opacity"
            >
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
