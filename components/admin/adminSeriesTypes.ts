// components/admin/adminSeriesTypes.ts -- shared between AdminSeriesTable
// (S1-03, the list/table view) and SeriesEditModal (the detail-edit form).
// Previously lived inline in SeriesList.tsx, which S1-03 replaces -- kept
// as its own file now that two sibling components need it, rather than one
// importing a type out of the other's file.
export interface AdminSeries {
  id: number;
  title: string;
  original_title: string | null;
  synopsis: string | null;
  country: string;
  year: number | null;
  episode_count: number | null;
  status: string;
  poster_url: string | null;
  backdrop_url: string | null;
  genre_names?: string[];
  romance_pace?: string | null;
  emotional_intensity?: string | null;
  ending_type?: string | null;
  content_level?: string | null;
  tag_ids?: number[];
  collection_ids?: number[];
  // S1-01: media_type is nullable on the wire (pre-TMDB-import rows never
  // had it backfilled) but the backend normalizes null -> 'tv' before this
  // ever reaches the frontend (see admin/series.ts's GET / handler) --
  // typed as non-nullable here for that reason, matching what admin list
  // rows actually contain.
  media_type?: 'tv' | 'movie';
  publish_status?: 'draft' | 'published' | 'archived';
  updated_at?: string | null;
  updated_by?: string | null;
}
