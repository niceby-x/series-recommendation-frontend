import { Check, Clock, Globe, Sparkles, Star, Tv, type LucideIcon } from 'lucide-react';
import RatingForm from '@/components/shared/RatingForm';
import ProgressTracker from '@/components/shared/ProgressTracker';
import RelatedSeriesRow, { type RelatedSeriesItem } from '@/components/shared/RelatedSeriesRow';
import type { SeriesTagData } from '@/components/shared/SeriesCard';
import { SessionProvider } from '@/lib/SessionContext';
import SeriesDetailTabs from './SeriesDetailTabs';
import SeriesHero from './SeriesHero';

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
            
            {/* Hero Image Block -- client component: carries the shared
                layoutId transition from the clicked SeriesCard poster */}
            <SeriesHero
              id={series.id}
              title={series.title}
              country={series.country}
              year={series.year}
              episodeCount={series.episode_count}
              backdropUrl={series.backdrop_url ?? null}
              posterUrl={series.poster_url}
              trailerUrl={series.trailer_url}
            />

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