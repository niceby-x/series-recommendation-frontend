// lib/mockCatalogData.ts
//
// Single source of truth for the mock/placeholder data used to fill out
// homepage + Explore surfaces while the real catalog and genres pipeline
// are still small. Previously this lived duplicated inline in
// app/page.tsx; Explore needs the exact same "Popular This Week" data as
// the homepage's "Trending This Week", so it's centralized here instead of
// copy-pasted a second time.
//
// Ratings are real now (see displayRatingFor below, backed by GET
// /series's average_rating aggregation) -- REAL_TRENDING_OVERRIDES only
// still supplies genres, since real per-series genres aren't denormalized
// onto the /series list response yet. Remove the genres half of this file
// once that's true too, rather than leaving stale mock data next to real.

import type { SeriesCardData } from '../components/shared/SeriesCard';

export interface MockTrendingSeries extends SeriesCardData {
  mockRating: number;
  mockGenres: string[];
}

// Fills out the Trending/Popular row to a full 7 when the live catalog
// doesn't have enough approved titles yet. Real series (from getSeries())
// always come first; these only fill remaining slots.
export const MOCK_TRENDING: MockTrendingSeries[] = [
  { id: -10, title: 'We Are', country: 'Thailand', year: 2024, episode_count: 16, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 9.4, mockGenres: ['Romance', 'School'] },
  { id: -1, title: 'Revenged Love', country: 'China', year: 2025, episode_count: 24, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 9.2, mockGenres: ['Drama', 'Enemies to Lovers'] },
  { id: -2, title: 'Love In The Air', country: 'Thailand', year: 2022, episode_count: 13, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 9.1, mockGenres: ['Romance', 'Bromance'] },
  { id: -3, title: 'Perfect 10 Liners', country: 'Thailand', year: 2024, episode_count: 24, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 9.0, mockGenres: ['Comedy', 'School'] },
  { id: -4, title: 'Me and Thee', country: 'Thailand', year: 2025, episode_count: 10, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 8.9, mockGenres: ['Romance', 'Drama'] },
  { id: -5, title: 'Fourever You', country: 'Thailand', year: 2024, episode_count: 41, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 8.8, mockGenres: ['Romance', 'Friendship'] },
  { id: -6, title: 'Pit Babe', country: 'Thailand', year: 2023, episode_count: 26, status: 'completed', synopsis: null, poster_url: null, backdrop_url: null, mockRating: 8.7, mockGenres: ['Action', 'Suspense'] },
];

// Keyed by exact title so a real approved series that happens to match one
// of the mock titles above (e.g. "We Are") shows a rating/genre pair on its
// card instead of the generic placeholder. NOTE: this breaks silently if a
// title is edited in the admin candidate review flow -- keying by tmdb_id
// would be sturdier if this needs to survive title edits.
export const REAL_TRENDING_OVERRIDES: Record<string, { rating: number; genres: string[] }> = {
  'We Are': { rating: 9.4, genres: ['Romance', 'School'] },
  'Revenged Love': { rating: 9.2, genres: ['Drama', 'Enemies to Lovers'] },
  'Love In The Air': { rating: 9.1, genres: ['Romance', 'Bromance'] },
  'Perfect 10 Liners': { rating: 9.0, genres: ['Comedy', 'School'] },
  'Me and Thee': { rating: 8.9, genres: ['Romance', 'Drama'] },
  'Fourever You': { rating: 8.8, genres: ['Romance', 'Friendship'] },
  'Pit Babe': { rating: 8.7, genres: ['Action', 'Suspense'] },
};

// Real series without a title match above fall back to this generic pair
// rather than showing an empty, sparse-looking card.
export const PLACEHOLDER_GENRE_TAGS = ['Romance', 'Drama'];

export function displayRatingFor(series: SeriesCardData): number | null {
  return series.average_rating ?? null;
}

export function displayGenresFor(series: SeriesCardData): string[] {
  return REAL_TRENDING_OVERRIDES[series.title]?.genres ?? PLACEHOLDER_GENRE_TAGS;
}

// Browse-by-Genre tile counts are now real, derived from the loaded
// catalog's genre_names field (see SeriesFilter.tsx's genreCounts and
// D2-03) -- not a list in this file or in lib/exploreMock.ts's GENRES.
// Don't re-add a mock genre-count list here.