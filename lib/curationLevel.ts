// lib/curationLevel.ts
//
// Curation Level (1 / 2 / 3) is computed on read, not stored. This was a
// deliberate choice: a stored column can drift out of sync with the actual
// data (e.g. a tag gets removed later and nobody re-runs the calculation),
// and this table is small/admin-only, so the always-accurate read cost is
// worth it over the sync-risk of a cached column.
//
// Curation Level is internal/admin-only -- per Taxonomy v1 §1, it is never
// shown to users. Only call this from admin routes/components.

import {
  CuratableRecord,
  TagDimension,
  LEVEL_1_REQUIRED_TAG_DIMENSIONS,
  LEVEL_1_REQUIRED_ATTRIBUTES,
  LEVEL_2_ATTRIBUTES,
  LEVEL_2_TAG_DIMENSIONS,
  LEVEL_3_TAG_DIMENSIONS,
} from './taxonomy';

export type CurationLevel = 0 | 1 | 2 | 3;

export interface CurationStatus {
  level: CurationLevel;
  missingForLevel1: string[];
  missingForLevel2: string[];
  missingForLevel3: string[];
}

// `tagsByDimension` should be pre-grouped by the caller (e.g. from a single
// `series_tags` fetch joined with `tags`) -- this function doesn't hit the
// DB itself, it just evaluates what's already been loaded.
export function computeCurationLevel(
  record: CuratableRecord,
  tagsByDimension: Partial<Record<TagDimension, unknown[]>>
): CurationStatus {
  const hasTag = (dimension: TagDimension) => (tagsByDimension[dimension]?.length ?? 0) > 0;

  const missingForLevel1: string[] = [];
  for (const dimension of LEVEL_1_REQUIRED_TAG_DIMENSIONS) {
    if (!hasTag(dimension)) missingForLevel1.push(dimensionLabel(dimension));
  }
  for (const attribute of LEVEL_1_REQUIRED_ATTRIBUTES) {
    if (!record[attribute]) missingForLevel1.push(attributeLabel(attribute));
  }

  const missingForLevel2: string[] = [];
  for (const attribute of LEVEL_2_ATTRIBUTES) {
    if (!record[attribute]) missingForLevel2.push(attributeLabel(attribute));
  }
  for (const dimension of LEVEL_2_TAG_DIMENSIONS) {
    if (!hasTag(dimension)) missingForLevel2.push(dimensionLabel(dimension));
  }

  const missingForLevel3: string[] = [];
  for (const dimension of LEVEL_3_TAG_DIMENSIONS) {
    if (!hasTag(dimension)) missingForLevel3.push(dimensionLabel(dimension));
  }

  // Level 3's Content Warnings is explicitly optional/progressive (Taxonomy
  // v1 §3.5) -- absence never blocks a level, it's tracked for visibility
  // only. So Level 3 is reached once Level 2 is complete, not gated on
  // Content Warnings being populated.
  let level: CurationLevel = 0;
  if (missingForLevel1.length === 0) level = 1;
  if (level === 1 && missingForLevel2.length === 0) level = 2;
  if (level === 2) level = 3; // Level 3 fields are progressive, not gating

  return { level, missingForLevel1, missingForLevel2, missingForLevel3 };
}

function dimensionLabel(dimension: TagDimension): string {
  const labels: Record<TagDimension, string> = {
    mood: 'Mood',
    trope: 'Trope',
    relationship_dynamic: 'Relationship Dynamics',
    theme: 'Themes',
    content_warning: 'Content Warnings',
  };
  return labels[dimension];
}

function attributeLabel(attribute: string): string {
  const labels: Record<string, string> = {
    romance_pace: 'Romance Pace',
    ending_type: 'Ending Type',
    emotional_intensity: 'Emotional Intensity',
    content_level: 'Content Level',
  };
  return labels[attribute] ?? attribute;
}