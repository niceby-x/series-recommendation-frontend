import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Check, Clock, Globe, Heart, MoreHorizontal, Play, Sparkles, Star, Tv, type LucideIcon } from 'lucide-react';
import RatingForm from '@/components/shared/RatingForm';
import WatchlistButton from '@/components/shared/WatchlistButton';
import ProgressTracker from '@/components/shared/ProgressTracker';
import RelatedSeriesRow, { type RelatedSeriesItem } from '@/components/shared/RelatedSeriesRow';
import type { SeriesTagData } from '@/components/shared/SeriesCard';
import { SessionProvider } from '@/lib/SessionContext';
import SeriesDetailTabs from './SeriesDetailTabs';

const TAG_DIMENSION_LABELS: Record<SeriesTagData['dimension'], string> = {
  mood: 'Mood',
  trope: 'Trope',
  relationship_dynamic: 'Relationship dynamic',
  theme: 'Theme',
  content_warning: 'Content warning',
};

export interface SeriesDetail {
  id: number;
  title: string;
  original_title: string | null;
  country: string;
  year: number;
  episode_count: number;
  status: string;
  synopsis: string | null;
  poster_url: string | null;
  // Wide TMDB backdrop -- preferred for the hero. Falls back to the
  // (portrait) poster when a series has no backdrop yet.
  backdrop_url?: string | null;
  average_rating: number | null;
  rating_count: number;
  // Real values from TMDB (see backend migration 018). Any of them can be
  // null -- the Duration / Language stats and the Watch Trailer button
  // are simply left out when there's nothing to show.
  runtime_minutes?: number | null;
  original_language?: string | null;
  trailer_url?: string | null;
  genre_names?: string[];
  tags?: SeriesTagData[];
}

// TMDB's original_language is an ISO 639-1 code ('th', 'ko', 'zh').
// Intl.DisplayNames turns it into a name ('Thai', 'Korean', 'Chinese')
// without keeping a lookup table of our own.
function languageName(code: string | null | undefined): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? null;
  } catch {
    return null;
  }
}

interface Stat {
  label: string;
  value: string;
  Icon: LucideIcon;
}

export default function SeriesDetailView({
  series,
  relatedSeries,
  backToBrowseHref,
}: {
  series: SeriesDetail;
  relatedSeries: RelatedSeriesItem[];
  backToBrowseHref: string;
}) {
  const tagRows = (Object.keys(TAG_DIMENSION_LABELS) as SeriesTagData['dimension'][])
    .map((dimension) => ({
      dimension,
      label: TAG_DIMENSION_LABELS[dimension],
      tags: (series.tags ?? []).filter((tag) => tag.dimension === dimension),
    }))
    .filter((row) => row.tags.length > 0);

  const heroImage = series.backdrop_url || series.poster_url;
  const language = languageName(series.original_language);
  const stats = [
    { label: 'Episodes', value: String(series.episode_count), Icon: Tv },
    series.runtime_minutes ? { label: 'Duration', value: '~' + series.runtime_minutes + ' min', Icon: Clock } : null,
    language ? { label: 'Language', value: language, Icon: Globe } : null,
  ].filter((stat): stat is Stat => stat !== null);

  const overview = (
    <div className="pt-2">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-3">About</h2>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-[75ch]">
        {series.synopsis || 'No synopsis available.'}
      </p>
      <div className="mt-6">
        <RatingForm seriesId={series.id} />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl">
      <SessionProvider>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
          
          {/* Left Column: Hero & Tabs */}
          <div className="min-w-0">
            
            {/* Hero Image Block */}
            <section className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[24px] overflow-hidden bg-muted shadow-sm group">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={series.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 800px"
                  className={series.backdrop_url ? 'object-cover' : 'object-cover object-top'}
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blush to-brand-lilac" />
              )}
              
              {/* Gradient Overlay for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top Right Action Icons */}
              <div className="absolute top-5 right-5 flex items-center gap-2">
                <button aria-label="Like" className="flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                  <Heart className="size-4" />
                </button>
                <WatchlistButton seriesId={series.id} />
                <button aria-label="More options" className="flex items-center justify-center size-9 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>

              {/* Bottom Left Content */}
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
                  {series.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
                    {series.country}
                  </span>
                  <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
                    {series.year}
                  </span>
                  <span className="px-3.5 py-1.5 text-[13px] font-medium bg-white/20 backdrop-blur-md rounded-full">
                    {series.episode_count} Episodes
                  </span>
                </div>

                {series.trailer_url && (
                  <a
                    href={series.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-purple-vivid rounded-full font-bold text-sm shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <Play className="size-4 fill-current" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </section>

            <div className="mt-6">
              <SeriesDetailTabs
                tabs={[
                  { id: 'overview', label: 'Overview', content: overview },
                  { id: 'characters', label: 'Characters', content: <p className="text-muted-foreground pt-4 text-sm">Character data coming soon.</p> },
                  { id: 'episodes', label: 'Episodes', content: <ProgressTracker seriesId={series.id} episodeCount={series.episode_count} /> },
                  { id: 'similar', label: 'Similar', content: <p className="text-muted-foreground pt-4 text-sm">Similar shows coming soon.</p> },
                ]}
              />
            </div>
          </div>

          {/* Right Column: Title Card & Why You Might Like This */}
          <aside className="space-y-6 min-w-0">
            
            {/* Title & Details Card */}
            <section className="bg-card rounded-[24px] border border-border shadow-sm p-6">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="text-xl font-bold text-foreground leading-tight">{series.title}</h2>
                {series.average_rating != null && (
                  <span className="shrink-0 inline-flex items-center gap-1.5 bg-brand-blush/40 text-brand-purple-vivid px-2.5 py-1 rounded-lg text-sm font-bold">
                    <Star className="size-4 fill-current" />
                    {series.average_rating.toFixed(1)}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-4">
                {series.country} • {series.year} • {series.episode_count} episodes
              </p>
              
              <p className="text-[13px] leading-relaxed text-foreground/80 mb-6 line-clamp-4">
                {series.synopsis}
              </p>

              {series.genre_names && series.genre_names.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {series.genre_names.map((genre) => (
                    <span key={genre} className="bg-brand-blush/20 text-brand-purple-vivid text-xs font-medium px-3 py-1.5 rounded-full border border-brand-blush/50">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats Grid -- only stats we have real data for */}
              <div className="grid grid-flow-col auto-cols-fr gap-4 pt-5 border-t border-border">
                {stats.map(({ label, value, Icon }) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <Icon className="size-5 text-muted-foreground mb-1.5" strokeWidth={1.5} aria-hidden />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</span>
                    <span className="text-xs font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Why You Might Like This Section */}
            {tagRows.length > 0 && (
              <section className="rounded-[24px] bg-gradient-to-br from-brand-blush/10 to-brand-lilac/10 p-6 border border-brand-blush/20">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold text-brand-purple-vivid mb-4">
                  <Sparkles className="size-4 text-brand-purple-vivid" aria-hidden />
                  Why You Might Like This
                </h2>
                <ul className="space-y-3">
                  {tagRows.map((row) => (
                    <li key={row.dimension} className="flex items-start gap-3 text-[13px] text-foreground/80">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-lilac/40 text-brand-purple-vivid">
                        <Check className="size-3" aria-hidden />
                      </span>
                      <span>
                        <span className="font-medium text-foreground">{row.label}: </span>
                        {row.tags
                          .map((tag) => (tag.display_emoji ? tag.display_emoji + ' ' : '') + tag.display_label)
                          .join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </SessionProvider>

      <div className="mt-12">
        <RelatedSeriesRow items={relatedSeries} />
      </div>
    </div>
  );
}