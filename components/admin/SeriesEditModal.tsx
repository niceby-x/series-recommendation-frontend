'use client';

import { useState } from 'react';
import type {
  RomancePace,
  EmotionalIntensity,
  EndingType,
  ContentLevel,
  Tag,
  TagDimension,
} from '../../lib/taxonomy';
import {
  ROMANCE_PACE_DISPLAY,
  EMOTIONAL_INTENSITY_DISPLAY,
  ENDING_TYPE_DISPLAY,
  CONTENT_LEVEL_DISPLAY,
} from '../../lib/taxonomy';
import type { AdminSeries } from './SeriesList';

const COUNTRY_OPTIONS = ['Thailand', 'Korea', 'Japan', 'Taiwan', 'China', 'Hong Kong', 'Other'];
const STATUS_OPTIONS = ['airing', 'completed', 'upcoming'];

// Same 5 dimensions and helper copy as the candidates Taxonomy modal
// (app/admin/candidates/page.tsx) -- this is the same picker, just editing
// a live `series` row's series_tags instead of a candidate's
// series_candidate_tags, so a title's mood/trope tags can be fixed after
// publish, not only set once at approval time.
const DIMENSION_SECTIONS: { dimension: TagDimension; label: string; helperText: string }[] = [
  { dimension: 'mood', label: 'Mood', helperText: '2-4 recommended' },
  { dimension: 'trope', label: 'Tropes', helperText: '1-3 recommended' },
  { dimension: 'relationship_dynamic', label: 'Relationship Dynamics', helperText: 'pick what recurs' },
  { dimension: 'theme', label: 'Themes', helperText: 'optional' },
  { dimension: 'content_warning', label: 'Content Warnings', helperText: 'leave blank unless certain' },
];

export interface SeriesEditForm {
  title: string;
  original_title: string;
  synopsis: string;
  country: string;
  year: number | null;
  episode_count: number;
  status: string;
  poster_url: string;
  backdrop_url: string;
  genre_names: string; // comma-separated in the form, split into an array on save
  romance_pace: string;
  emotional_intensity: string;
  ending_type: string;
  content_level: string;
  tag_ids: number[];
  collection_ids: number[];
}

export interface CollectionOption {
  id: number;
  title: string;
}

function toForm(series: AdminSeries): SeriesEditForm {
  return {
    title: series.title,
    original_title: series.original_title ?? '',
    synopsis: series.synopsis ?? '',
    country: series.country,
    year: series.year,
    episode_count: series.episode_count,
    status: series.status,
    poster_url: series.poster_url ?? '',
    backdrop_url: series.backdrop_url ?? '',
    genre_names: (series.genre_names ?? []).join(', '),
    romance_pace: series.romance_pace ?? '',
    emotional_intensity: series.emotional_intensity ?? '',
    ending_type: series.ending_type ?? '',
    content_level: series.content_level ?? '',
    tag_ids: series.tag_ids ?? [],
    collection_ids: series.collection_ids ?? [],
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-xs text-muted-foreground block">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  'mt-1.5 w-full bg-muted/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:bg-muted';

export default function SeriesEditModal({
  series,
  availableTags,
  availableCollections,
  onSave,
  onClose,
}: {
  series: AdminSeries;
  availableTags: Record<TagDimension, Tag[]>;
  availableCollections: CollectionOption[];
  onSave: (form: SeriesEditForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SeriesEditForm>(toForm(series));
  const [saving, setSaving] = useState(false);

  function field<K extends keyof SeriesEditForm>(key: K, value: SeriesEditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId: number) {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  }

  function toggleCollection(collectionId: number) {
    setForm((prev) => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(collectionId)
        ? prev.collection_ids.filter((id) => id !== collectionId)
        : [...prev.collection_ids, collectionId],
    }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-primary mb-5">Edit series</h2>

        <div className="flex flex-col gap-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => field('title', e.target.value)} className={inputClass} />
          </Field>

          <Field label="Original title">
            <input
              value={form.original_title}
              onChange={(e) => field('original_title', e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <select value={form.country} onChange={(e) => field('country', e.target.value)} className={inputClass}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => field('status', e.target.value)} className={inputClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <input
                type="number"
                value={form.year ?? ''}
                onChange={(e) => field('year', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass}
              />
            </Field>
            <Field label="Episodes">
              <input
                type="number"
                value={form.episode_count}
                onChange={(e) => field('episode_count', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Synopsis">
            <textarea
              value={form.synopsis}
              onChange={(e) => field('synopsis', e.target.value)}
              rows={4}
              className={inputClass + ' resize-none'}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Poster URL">
              <input value={form.poster_url} onChange={(e) => field('poster_url', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Backdrop URL">
              <input value={form.backdrop_url} onChange={(e) => field('backdrop_url', e.target.value)} className={inputClass} />
            </Field>
          </div>

          <Field label="Genres (comma-separated)">
            <input
              value={form.genre_names}
              onChange={(e) => field('genre_names', e.target.value)}
              placeholder="Romance, Drama, Fantasy"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Romance pace">
              <select
                value={form.romance_pace}
                onChange={(e) => field('romance_pace', e.target.value)}
                className={inputClass}
              >
                <option value="">Not set</option>
                {(Object.keys(ROMANCE_PACE_DISPLAY) as RomancePace[]).map((key) => (
                  <option key={key} value={key}>
                    {ROMANCE_PACE_DISPLAY[key].emoji} {ROMANCE_PACE_DISPLAY[key].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Emotional intensity">
              <select
                value={form.emotional_intensity}
                onChange={(e) => field('emotional_intensity', e.target.value)}
                className={inputClass}
              >
                <option value="">Not set</option>
                {(Object.keys(EMOTIONAL_INTENSITY_DISPLAY) as EmotionalIntensity[]).map((key) => (
                  <option key={key} value={key}>
                    {EMOTIONAL_INTENSITY_DISPLAY[key].emoji} {EMOTIONAL_INTENSITY_DISPLAY[key].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ending type">
              <select value={form.ending_type} onChange={(e) => field('ending_type', e.target.value)} className={inputClass}>
                <option value="">Not set</option>
                {(Object.keys(ENDING_TYPE_DISPLAY) as EndingType[]).map((key) => (
                  <option key={key} value={key}>
                    {ENDING_TYPE_DISPLAY[key].emoji} {ENDING_TYPE_DISPLAY[key].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Content level">
              <select
                value={form.content_level}
                onChange={(e) => field('content_level', e.target.value)}
                className={inputClass}
              >
                <option value="">Not set</option>
                {(Object.keys(CONTENT_LEVEL_DISPLAY) as ContentLevel[]).map((key) => (
                  <option key={key} value={key}>
                    {CONTENT_LEVEL_DISPLAY[key].emoji} {CONTENT_LEVEL_DISPLAY[key].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 mt-4">
              Discovery Tags
            </p>
            {DIMENSION_SECTIONS.map(({ dimension, label, helperText }) => (
              <div key={dimension} className="mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                  <span className="text-[11px] text-muted-foreground/70">{helperText}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(availableTags[dimension] || []).length === 0 && (
                    <span className="text-[12px] text-muted-foreground/60">No {label.toLowerCase()} tags yet.</span>
                  )}
                  {(availableTags[dimension] || []).map((tag) => {
                    const active = form.tag_ids.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={
                          'text-xs px-2.5 py-1 rounded-full border transition-colors ' +
                          (active
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-border bg-muted/60 text-muted-foreground hover:border-ring')
                        }
                      >
                        {tag.display_emoji && <span aria-hidden>{tag.display_emoji} </span>}
                        {tag.display_label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 mt-4">
              Curated Collections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableCollections.length === 0 && (
                <span className="text-[12px] text-muted-foreground/60">
                  No curated collections yet -- create one on the Collections page.
                </span>
              )}
              {availableCollections.map((collection) => {
                const active = form.collection_ids.includes(collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    className={
                      'text-xs px-2.5 py-1 rounded-full border transition-colors ' +
                      (active
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-border bg-muted/60 text-muted-foreground hover:border-ring')
                    }
                  >
                    {collection.title}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-1.5">
              Only admin-curated collections show here -- users&apos; personal collections are managed by them, not from
              here.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-muted/60 hover:bg-muted text-foreground/80 text-sm py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
