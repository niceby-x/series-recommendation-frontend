// lib/moodsContent.ts
//
// Content for the Moods page (components/moods/MoodsAuthed.tsx). Mood
// tagging isn't a real column on `series` yet (see AGENTS.md / DiscoverAuthed's
// note on mockGenresFor) -- same PLACEHOLDER pattern used everywhere else in
// this app: mock cards render with imageUrl: null (honest gradient+title
// fallback, never a guessed photo) and isReal: false so they never link out.
// Real catalog rows get blended in real-first by MoodsAuthed, same
// real-first-then-mock convention as HomeAuthed/DiscoverAuthed.

import { LayoutGrid, Smile, Heart, Droplet, Zap, Frown, Leaf, type LucideIcon } from 'lucide-react';

export interface MoodFilter {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const MOOD_FILTERS: MoodFilter[] = [
  { key: 'all', label: 'All Moods', icon: LayoutGrid },
  { key: 'happy', label: 'Happy', icon: Smile },
  { key: 'romantic', label: 'Romantic', icon: Heart },
  { key: 'emotional', label: 'Emotional', icon: Droplet },
  { key: 'excited', label: 'Excited', icon: Zap },
  { key: 'sad', label: 'Sad', icon: Frown },
  { key: 'relaxed', label: 'Relaxed', icon: Leaf },
];

export interface MoodCardItem {
  id: number | string;
  title: string;
  country: string;
  mediaType: string;
  rating: number;
  imageUrl: string | null;
  isReal: boolean;
}

export interface MoodSection {
  key: string;
  moodFilterKey: string; // which MOOD_FILTERS key surfaces this section
  title: string;
  subtitle: string;
  mockItems: MoodCardItem[];
}

// Only the moods with enough editorial content to fill a real section ship
// today (mirrors the 3 rows in the reference mockup). Excited/Sad/Relaxed
// exist as filter chips already, since the row itself is honest about
// having nothing behind them yet (see MoodsAuthed's empty state).
export const MOOD_SECTIONS: MoodSection[] = [
  {
    key: 'feel-good-happy',
    moodFilterKey: 'happy',
    title: 'Feel-Good & Happy',
    subtitle: 'Uplifting stories that will put a smile on your face.',
    mockItems: [
      { id: 'mood-happy-1', title: 'Cherry Magic', country: 'Thailand', mediaType: 'Series', rating: 9.0, imageUrl: null, isReal: false },
      { id: 'mood-happy-2', title: 'Sunset Vibes', country: 'Thailand', mediaType: 'Series', rating: 8.6, imageUrl: null, isReal: false },
      { id: 'mood-happy-3', title: 'Step by Step', country: 'Thailand', mediaType: 'Series', rating: 8.7, imageUrl: null, isReal: false },
      { id: 'mood-happy-4', title: 'Fish Upon the Sky', country: 'Thailand', mediaType: 'Series', rating: 8.8, imageUrl: null, isReal: false },
    ],
  },
  {
    key: 'romantic-heartfelt',
    moodFilterKey: 'romantic',
    title: 'Romantic & Heartfelt',
    subtitle: 'Stories full of love, chemistry and unforgettable moments.',
    mockItems: [
      { id: 'mood-romantic-1', title: 'Love In The Air', country: 'Thailand', mediaType: 'Series', rating: 9.1, imageUrl: null, isReal: false },
      { id: 'mood-romantic-2', title: 'Kiseki: Dear to me', country: 'Taiwan', mediaType: 'Series', rating: 8.9, imageUrl: null, isReal: false },
      { id: 'mood-romantic-3', title: 'The Eclipse', country: 'Thailand', mediaType: 'Series', rating: 8.7, imageUrl: null, isReal: false },
      { id: 'mood-romantic-4', title: 'I Feel You Linger In The Air', country: 'Thailand', mediaType: 'Series', rating: 8.8, imageUrl: null, isReal: false },
    ],
  },
  {
    key: 'emotional-deep',
    moodFilterKey: 'emotional',
    title: 'Emotional & Deep',
    subtitle: 'Touching stories that stay with you.',
    mockItems: [
      { id: 'mood-emotional-1', title: 'Utsukushii Kare', country: 'Japan', mediaType: 'Series', rating: 8.5, imageUrl: null, isReal: false },
      { id: 'mood-emotional-2', title: 'Bad Buddy', country: 'Thailand', mediaType: 'Series', rating: 8.9, imageUrl: null, isReal: false },
      { id: 'mood-emotional-3', title: 'Until We Meet Again', country: 'Thailand', mediaType: 'Series', rating: 8.4, imageUrl: null, isReal: false },
      { id: 'mood-emotional-4', title: 'My Only 12%', country: 'Thailand', mediaType: 'Series', rating: 8.6, imageUrl: null, isReal: false },
    ],
  },
];

// Right rail: "Your Top Mood" progress card. Placeholder until real watch-
// time-by-mood tracking exists -- same pending-backend-data pattern as
// MOCK_BLOOM_JOURNEY in dashboardContent.ts.
export const MOCK_TOP_MOOD = {
  name: 'Romantic',
  description: 'You watch the most romantic stories.',
  watchTimePct: 32,
};

// Right rail: "Popular in Your Mood" list.
export const MOCK_POPULAR_IN_MOOD: MoodCardItem[] = [
  { id: 'mood-romantic-1', title: 'Love In The Air', country: 'Thailand', mediaType: 'Series', rating: 9.1, imageUrl: null, isReal: false },
  { id: 'mood-romantic-2', title: 'Kiseki: Dear to me', country: 'Taiwan', mediaType: 'Series', rating: 8.9, imageUrl: null, isReal: false },
  { id: 'mood-romantic-4', title: 'I Feel You Linger In The Air', country: 'Thailand', mediaType: 'Series', rating: 8.8, imageUrl: null, isReal: false },
  { id: 'mood-emotional-4', title: 'My Only 12%', country: 'Thailand', mediaType: 'Series', rating: 8.6, imageUrl: null, isReal: false },
];
