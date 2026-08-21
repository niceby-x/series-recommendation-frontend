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
  gradient: string; // tailwind gradient classes -- used as the art-panel background, and as the fallback when image is null
  image: string | null; // path under /public, e.g. '/images/moods/cozy.png'
  // Which lib/moodsContent.ts MOOD_FILTERS key this editorial tile maps to
  // (see H1-01). Only 'happy'/'romantic'/'emotional' have real MOOD_SECTIONS
  // content today -- 'sad' is a real filter chip but has no section behind
  // it yet, so Melancholic honestly lands on /moods' "still curating" empty
  // state rather than being force-fit into an unrelated section.
  moodKey: string;
}

export const MOCK_MOODS: MoodTile[] = [
  { name: 'Cozy', count: 128, gradient: 'from-[#FBE0C7] to-[#F7B6C8]/50', image: '/images/moods/cozy.png', moodKey: 'happy' },
  { name: 'Emotional', count: 215, gradient: 'from-[#D8E3F7] to-[#C8D9F7]/60', image: '/images/moods/emotional.png', moodKey: 'emotional' },
  { name: 'Healing', count: 186, gradient: 'from-[#E3D9F9] to-brand-lilac/50', image: '/images/moods/healing.png', moodKey: 'emotional' },
  { name: 'Heartwarming', count: 243, gradient: 'from-[#F9D6DE] to-brand-blush/60', image: '/images/moods/heartwarming.png', moodKey: 'romantic' },
  { name: 'Angsty', count: 153, gradient: 'from-[#DCD6E3] to-[#C7BFD4]/60', image: '/images/moods/angsty.png', moodKey: 'emotional' },
  { name: 'Melancholic', count: 107, gradient: 'from-[#CFC7E8] to-[#8E7FB8]/60', image: '/images/moods/melancholic.png', moodKey: 'sad' },
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

// Fills "Continue Watching" (renamed from "Continue Discovering" -- see
// H1-02) when the live catalog is thin. Mirrors the
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

// Landing-page value-prop tiles (icon + title + description, no numeric
// claim). Replaces the old numeric LANDING_STATS -- those were placeholder
// figures we didn't want to ship unverified; these are statements about
// what the product does, which we can actually stand behind.
export const LANDING_FEATURES = [
  { label: 'Curated with Love', sublabel: 'Handpicked series and movies that deserve your time.' },
  { label: 'Mood & Trope Discovery', sublabel: 'Find the perfect story for your current mood.' },
  { label: 'Smart Recommendations', sublabel: 'Personalized picks based on what you love.' },
  { label: 'A Community for Everyone', sublabel: 'Connect, share, and celebrate BL together.' },
];

// The hero card-stack carousel. Real catalog series are mapped into this
// shape first (see LandingPage.tsx); these two fill in any remaining slots
// so the stack always has 3 cards even before the catalog has enough real
// titles. imageUrl is intentionally null -- see CURATOR_LIST above for why
// we don't hand-guess external poster URLs for named real titles.
export interface HeroFeature {
  id: number | string;
  title: string;
  country: string;
  year: number;
  rating: number;
  tags: string[];
  imageUrl: string | null;
}

export const HERO_DECK_FALLBACK: HeroFeature[] = [
  {
    id: 'hero-fallback-1',
    title: 'Cherry Blossoms After Winter',
    country: 'Korea',
    year: 2022,
    rating: 4.8,
    tags: ['Slow Burn', 'Healing', 'Hopeful'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-2',
    title: 'Neon Nights, Quiet Hearts',
    country: 'Thailand',
    year: 2023,
    rating: 4.7,
    tags: ['Enemies to Lovers', 'Angsty', 'Bittersweet'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-3',
    title: 'Paper Boats, Ocean Hearts',
    country: 'Japan',
    year: 2021,
    rating: 4.6,
    tags: ['Friends to Lovers', 'Coming of Age'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-4',
    title: 'Midnight Library',
    country: 'Taiwan',
    year: 2023,
    rating: 4.9,
    tags: ['Fated Mates', 'Fantasy'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-5',
    title: 'Second Chance Serenade',
    country: 'Philippines',
    year: 2022,
    rating: 4.5,
    tags: ['Second Chance', 'Musician AU'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-6',
    title: 'The Umbrella We Shared',
    country: 'Korea',
    year: 2024,
    rating: 4.8,
    tags: ['Slow Burn', 'Office Romance'],
    imageUrl: null,
  },
  {
    id: 'hero-fallback-7',
    title: 'Stargazing Season',
    country: 'Thailand',
    year: 2022,
    rating: 4.7,
    tags: ['Healing', 'Found Family'],
    imageUrl: null,
  },
];