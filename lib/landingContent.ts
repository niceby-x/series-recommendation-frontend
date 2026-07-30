// lib/landingContent.ts
//
// Content for the logged-out landing page. Split out from mockCatalogData.ts
// because this is landing-page-specific editorial content (moods, tropes,
// curator copy), not catalog-filler data shared with the homepage/Explore.
//
// PLACEHOLDER data pending real backend support:
//   - mood/trope counts   -> no public tag-count endpoint yet (series_tags
//                             exists per AGENTS.md, but isn't exposed publicly)
//   - curator's picks     -> hand-picked editorial choice, not a query; still
//                             needs real TMDb posters once these specific
//                             titles are approved in the catalog

export interface MoodTile {
  name: string;
  count: number;
  gradient: string; // tailwind gradient classes
}

export const MOCK_MOODS: MoodTile[] = [
  { name: 'Cozy', count: 128, gradient: 'from-[#FBE0C7] to-[#F7B6C8]/50' },
  { name: 'Emotional', count: 215, gradient: 'from-[#D8E3F7] to-[#C8D9F7]/60' },
  { name: 'Healing', count: 186, gradient: 'from-[#E3D9F9] to-brand-lilac/50' },
  { name: 'Heartwarming', count: 243, gradient: 'from-[#F9D6DE] to-brand-blush/60' },
  { name: 'Angsty', count: 153, gradient: 'from-[#DCD6E3] to-[#C7BFD4]/60' },
  { name: 'Melancholic', count: 107, gradient: 'from-[#CFC7E8] to-[#8E7FB8]/60' },
];

export interface TropeChip {
  name: string;
}

export const MOCK_TROPES: TropeChip[] = [
  { name: 'Slow Burn' },
  { name: 'Enemies to Lovers' },
  { name: 'Friends to Lovers' },
  { name: 'Green Flag Couple' },
  { name: 'College Romance' },
  { name: 'Office Romance' },
  { name: 'Fantasy' },
  { name: 'Fake Dating' },
  { name: 'Age Gap' },
  { name: 'Found Family' },
  { name: 'Omega Verse' },
];

export interface DiscoverCard {
  id: number | string;
  title: string;
  country: string;
  mediaType: 'Series' | 'Anime';
  year: number;
  rating: number;
  badge: string;
  tags: string[];
  imageUrl: string | null;
  isReal: boolean;
}

// Fills "Continue Discovering" when the live catalog is thin. Mirrors the
// isReal-gated pattern from HeroCarousel — mock cards never link out.
export const MOCK_CONTINUE_DISCOVERING: DiscoverCard[] = [
  { id: 'ld-1', title: 'The Eclipse', country: 'Thailand', mediaType: 'Series', year: 2022, rating: 4.7, badge: 'Trending', tags: ['Friends to Lovers', 'College'], imageUrl: null, isReal: false },
  { id: 'ld-2', title: 'Kiseki: Dear to Me', country: 'Japan', mediaType: 'Series', year: 2022, rating: 4.6, badge: 'Top Rated', tags: ['Destiny', 'Slow Burn'], imageUrl: null, isReal: false },
  { id: 'ld-3', title: 'Step by Step', country: 'Thailand', mediaType: 'Series', year: 2024, rating: 4.5, badge: 'Must Watch', tags: ['Healing', 'Green Flag'], imageUrl: null, isReal: false },
  { id: 'ld-4', title: 'Our Dating Sim', country: 'Korea', mediaType: 'Series', year: 2024, rating: 4.6, badge: 'New Episode', tags: ['Sweet', 'Short & Sweet'], imageUrl: null, isReal: false },
  { id: 'ld-5', title: 'Sasaki and Miyano', country: 'Japan', mediaType: 'Anime', year: 2022, rating: 4.7, badge: 'Anime', tags: ['School', 'Slice of Life'], imageUrl: null, isReal: false },
];

export interface CuratorPick {
  id: number | string;
  title: string;
  country: string;
  mediaType: 'Series' | 'Movie';
  year: number;
  rating: number;
  tags: string[];
  imageUrl: string | null;
}

// Real, well-known titles — but these need real TMDb posters before shipping.
// Showing a real, recognizable show next to a photo that isn't actually from
// it is a worse trust problem than an honest placeholder, so these render
// with the same gradient+title fallback the rest of the app uses for
// missing images, not a stock photo, until real posters are wired in.
export const CURATOR_FEATURE: CuratorPick = {
  id: 'curator-feature',
  title: 'The Handmaiden',
  country: 'Korea',
  mediaType: 'Movie',
  year: 2022,
  rating: 4.6,
  tags: ['Historical', 'Melancholic', 'Forbidden Love'],
  imageUrl: null,
};

export const CURATOR_FEATURE_QUOTE =
  'A beautifully written romance that stays with you long after the credits roll.';

export const CURATOR_LIST: CuratorPick[] = [
  { id: 'curator-1', title: 'Beyond the Memories', country: 'Korea', mediaType: 'Series', year: 2021, rating: 4.5, tags: ['Second Chance', 'Healing'], imageUrl: null },
  { id: 'curator-2', title: 'I Told Sunset About You', country: 'Thailand', mediaType: 'Series', year: 2020, rating: 4.7, tags: ['Coming of Age', 'Bittersweet'], imageUrl: null },
  { id: 'curator-3', title: 'Cherry Magic', country: 'Japan', mediaType: 'Series', year: 2020, rating: 4.6, tags: ['Office Romance', 'Magical'], imageUrl: null },
];

// Landing-page-only stats. These are placeholder figures -- swap for real
// counts (or drop the ones that aren't true yet) before this goes live to
// real visitors. Framed as "curated titles / mood tags / tropes" rather
// than a user/fan count, which is at least a claim about scope of work
// rather than a claim about popularity that could be fabricated.
export const LANDING_STATS = [
  { label: 'Curated Titles', sublabel: 'Handpicked with care', value: '1,000+' },
  { label: 'Mood Tags', sublabel: 'Find stories that match how you feel', value: '300+' },
  { label: 'Tropes', sublabel: 'From sweet to angsty, we\u2019ve got it all', value: '500+' },
  { label: 'Human Curated', sublabel: 'No algorithms. Just real people.', value: '100%' },
];
