// lib/taxonomy.ts
//
// Single source of truth for BLumi Taxonomy v1's structure and display
// values. Both the admin tagging UI and the curation-level calculator
// import from here so the two can never disagree about what counts as
// a valid value or which fields exist.
//
// The *values* (which tags exist, e.g. 'cozy', 'enemies_to_lovers') live
// in the database (see migrations/002_taxonomy_v1.sql) and should be
// fetched from `tags`, not hardcoded here -- that table is the governed,
// growable vocabulary per the taxonomy doc's §5 (Governance). The four
// Curated Attribute enums below ARE hardcoded here, deliberately: they're
// small, fixed, and not expected to grow the way Discovery Tags are.

export type RomancePace =
  | 'slow_burn'
  | 'natural_progression'
  | 'instant_attraction'
  | 'established_relationship';

export type EmotionalIntensity = 'lighthearted' | 'balanced' | 'emotionally_heavy';

export type EndingType = 'happy' | 'bittersweet' | 'open' | 'tragic';

export type ContentLevel = 'sweet' | 'mature';

export type TagDimension =
  | 'mood'
  | 'trope'
  | 'relationship_dynamic'
  | 'theme'
  | 'content_warning';

export interface Tag {
  id: number;
  dimension: TagDimension;
  value_key: string;
  display_label: string;
  display_emoji: string | null;
  sort_order: number;
}

// Display metadata for the four Curated Attributes. Emoji + label live in
// code (not the tags table) since these are fixed enums, not a governed
// growable vocabulary -- see the seed-data note at the bottom of the migration.

export const ROMANCE_PACE_DISPLAY: Record<RomancePace, { emoji: string; label: string }> = {
  slow_burn: { emoji: '🌱', label: 'Slow Burn' },
  natural_progression: { emoji: '🌤', label: 'Natural Progression' },
  instant_attraction: { emoji: '⚡', label: 'Instant Attraction' },
  established_relationship: { emoji: '🤝', label: 'Established Relationship' },
};

export const EMOTIONAL_INTENSITY_DISPLAY: Record<EmotionalIntensity, { emoji: string; label: string }> = {
  lighthearted: { emoji: '☁️', label: 'Lighthearted' },
  balanced: { emoji: '💜', label: 'Balanced' },
  emotionally_heavy: { emoji: '🌊', label: 'Emotionally Heavy' },
};

export const ENDING_TYPE_DISPLAY: Record<EndingType, { emoji: string; label: string }> = {
  happy: { emoji: '❤️', label: 'Happy Ending' },
  bittersweet: { emoji: '💜', label: 'Bittersweet Ending' },
  open: { emoji: '❓', label: 'Open Ending' },
  tragic: { emoji: '💔', label: 'Tragic Ending' },
};

export const CONTENT_LEVEL_DISPLAY: Record<ContentLevel, { emoji: string; label: string }> = {
  sweet: { emoji: '🌸', label: 'Sweet' },
  mature: { emoji: '💞', label: 'Mature' },
};

// Curation Tier field lists, per Taxonomy v1 §1. Used by the curation-level
// calculator (lib/curationLevel.ts) -- kept here so both stay in sync with
// the taxonomy doc as the single reference.

export const LEVEL_1_REQUIRED_TAG_DIMENSIONS: TagDimension[] = ['mood', 'trope', 'relationship_dynamic'];
export const LEVEL_1_REQUIRED_ATTRIBUTES: (keyof CuratableRecord)[] = ['romance_pace', 'ending_type'];
export const LEVEL_2_ATTRIBUTES: (keyof CuratableRecord)[] = ['emotional_intensity', 'content_level'];
export const LEVEL_2_TAG_DIMENSIONS: TagDimension[] = ['theme'];
export const LEVEL_3_TAG_DIMENSIONS: TagDimension[] = ['content_warning'];

// Shape shared by both `series` and `series_candidates` rows for the
// purposes of curation-level computation and the tagging UI.
export interface CuratableRecord {
  romance_pace: RomancePace | null;
  emotional_intensity: EmotionalIntensity | null;
  ending_type: EndingType | null;
  content_level: ContentLevel | null;
}