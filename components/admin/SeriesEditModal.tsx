'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, X, Image as ImageIcon, Info, Tags, BookHeart, Search, type LucideIcon } from 'lucide-react';
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
import type { AdminSeries } from './adminSeriesTypes';

const COUNTRY_OPTIONS = ['Thailand', 'Korea', 'Japan', 'Taiwan', 'China', 'Hong Kong', 'Other'];
const STATUS_OPTIONS = ['airing', 'completed', 'upcoming'];

const DIMENSION_SECTIONS: { dimension: TagDimension; label: string; helperText: string }[] = [
  { dimension: 'mood', label: 'Mood', helperText: '2-4 recommended' },
  { dimension: 'trope', label: 'Tropes', helperText: '1-3 recommended' },
  { dimension: 'relationship_dynamic', label: 'Relationship Dynamics', helperText: 'Pick what recurs' },
  { dimension: 'theme', label: 'Themes', helperText: 'Optional' },
  { dimension: 'content_warning', label: 'Content Warnings', helperText: 'Leave blank unless certain' },
];

// --- Types ---
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
  genre_names: string[];
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

export interface GenreOption {
  id: number;
  name: string;
}

// --- Helpers ---
function toForm(series: AdminSeries): SeriesEditForm {
  return {
    title: series.title || '',
    original_title: series.original_title ?? '',
    synopsis: series.synopsis ?? '',
    country: series.country || '',
    year: series.year,
    episode_count: series.episode_count ?? 0,
    status: series.status || 'airing',
    poster_url: series.poster_url ?? '',
    backdrop_url: series.backdrop_url ?? '',
    genre_names: series.genre_names ?? [],
    romance_pace: series.romance_pace ?? '',
    emotional_intensity: series.emotional_intensity ?? '',
    ending_type: series.ending_type ?? '',
    content_level: series.content_level ?? '',
    tag_ids: series.tag_ids ?? [],
    collection_ids: series.collection_ids ?? [],
  };
}

// --- Systematic UI Components ---
const inputStyles =
  'flex w-full rounded-[10px] border border-border/80 bg-input/40 px-3 py-2 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

function FieldGroup({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold leading-none text-foreground">
        {label}
      </label>
      {children}
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="bg-muted/30 rounded-2xl border border-border p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-4">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

// --- Pro Standard Token Combobox ---
function TokenSelect({
  label,
  description,
  options,
  selectedValues,
  onToggle,
  placeholder = "Search or select..."
}: {
  label: string;
  description?: string;
  options: { id: string | number; label: string; emoji?: string }[];
  selectedValues: (string | number)[];
  onToggle: (id: string | number) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unselectedOptions = options.filter(o => !selectedValues.includes(o.id));
  const filteredOptions = unselectedOptions.filter(o => 
    o.label.toLowerCase().includes(query.toLowerCase())
  );
  
  const selectedItems = selectedValues
    .map(v => options.find(o => o.id === v))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  function handleSelect(id: string | number) {
    onToggle(id);
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      <label className="text-sm font-semibold leading-none text-foreground flex items-baseline justify-between">
        {label}
        {description && <span className="text-[11px] font-normal text-muted-foreground">{description}</span>}
      </label>
      
      <div className="relative">
        {/* Input Wrapper */}
        <div 
          onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
          className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[10px] border border-border/80 bg-input/40 px-2 py-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring focus-within:border-primary/50 cursor-text"
        >
          {selectedItems.map((item) => (
            <span 
              key={item.id} 
              className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2 py-1 text-xs font-semibold text-foreground shadow-sm"
            >
              {item.emoji && <span aria-hidden>{item.emoji}</span>}
              {item.label}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                className="ml-0.5 rounded-sm opacity-70 hover:opacity-100 hover:bg-primary/20 transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedItems.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none py-0.5"
          />
          <Search className="size-4 text-muted-foreground/60 mr-1" />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-brand animate-in fade-in zoom-in-95 duration-100">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground italic">
                No matching options found.
              </div>
            ) : (
              <ul className="p-1.5">
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/80"
                  >
                    {option.emoji && <span>{option.emoji}</span>}
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Modal Component ---
export default function SeriesEditModal({
  series,
  availableTags,
  availableCollections,
  availableGenres,
  onSave,
  onClose,
}: {
  series: AdminSeries;
  availableTags: Record<TagDimension, Tag[]>;
  availableCollections: CollectionOption[];
  availableGenres: GenreOption[];
  onSave: (form: SeriesEditForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SeriesEditForm>(toForm(series));
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof SeriesEditForm>(key: K, value: SeriesEditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem<K extends 'genre_names' | 'tag_ids' | 'collection_ids'>(
    key: K,
    item: SeriesEditForm[K][number]
  ) {
    setForm((prev) => {
      const array = prev[key] as unknown as SeriesEditForm[K][number][];
      const next = array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
      return { ...prev, [key]: next } as SeriesEditForm;
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6" 
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-card border border-white/60 rounded-2xl shadow-brand flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-[10px] bg-brand-gradient text-white shadow-sm shrink-0">
              <Pencil className="size-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground leading-tight">Edit Series</h2>
              <p className="text-sm text-muted-foreground truncate max-w-md">{series.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <Section title="Basic Details" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldGroup label="Title">
                <input 
                  value={form.title} 
                  onChange={(e) => updateField('title', e.target.value)} 
                  className={inputStyles} 
                  placeholder="Main Title"
                />
              </FieldGroup>
              <FieldGroup label="Original Title">
                <input
                  value={form.original_title}
                  onChange={(e) => updateField('original_title', e.target.value)}
                  className={inputStyles}
                  placeholder="Native language title"
                />
              </FieldGroup>

              <FieldGroup label="Country">
                <select value={form.country} onChange={(e) => updateField('country', e.target.value)} className={inputStyles}>
                  {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Status">
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className={inputStyles}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </FieldGroup>

              <FieldGroup label="Release Year">
                <input
                  type="number"
                  value={form.year ?? ''}
                  onChange={(e) => updateField('year', e.target.value ? parseInt(e.target.value) : null)}
                  className={inputStyles}
                  placeholder="YYYY"
                />
              </FieldGroup>
              <FieldGroup label="Total Episodes">
                <input
                  type="number"
                  value={form.episode_count}
                  onChange={(e) => updateField('episode_count', parseInt(e.target.value) || 0)}
                  className={inputStyles}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Synopsis">
              <textarea
                value={form.synopsis}
                onChange={(e) => updateField('synopsis', e.target.value)}
                rows={4}
                className={`${inputStyles} py-3 resize-none`}
                placeholder="Brief summary of the plot..."
              />
            </FieldGroup>
          </Section>

          <Section title="Media URLs" icon={ImageIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldGroup label="Poster Image URL">
                <input value={form.poster_url} onChange={(e) => updateField('poster_url', e.target.value)} className={inputStyles} />
              </FieldGroup>
              <FieldGroup label="Backdrop Image URL">
                <input value={form.backdrop_url} onChange={(e) => updateField('backdrop_url', e.target.value)} className={inputStyles} />
              </FieldGroup>
            </div>
          </Section>

          <Section title="Pacing & Content" icon={BookHeart}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldGroup label="Romance Pace">
                <select value={form.romance_pace} onChange={(e) => updateField('romance_pace', e.target.value)} className={inputStyles}>
                  <option value="">Unset</option>
                  {(Object.keys(ROMANCE_PACE_DISPLAY) as RomancePace[]).map((key) => (
                    <option key={key} value={key}>{ROMANCE_PACE_DISPLAY[key].emoji} {ROMANCE_PACE_DISPLAY[key].label}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Emotional Intensity">
                <select value={form.emotional_intensity} onChange={(e) => updateField('emotional_intensity', e.target.value)} className={inputStyles}>
                  <option value="">Unset</option>
                  {(Object.keys(EMOTIONAL_INTENSITY_DISPLAY) as EmotionalIntensity[]).map((key) => (
                    <option key={key} value={key}>{EMOTIONAL_INTENSITY_DISPLAY[key].emoji} {EMOTIONAL_INTENSITY_DISPLAY[key].label}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Ending Type">
                <select value={form.ending_type} onChange={(e) => updateField('ending_type', e.target.value)} className={inputStyles}>
                  <option value="">Unset</option>
                  {(Object.keys(ENDING_TYPE_DISPLAY) as EndingType[]).map((key) => (
                    <option key={key} value={key}>{ENDING_TYPE_DISPLAY[key].emoji} {ENDING_TYPE_DISPLAY[key].label}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Content Level">
                <select value={form.content_level} onChange={(e) => updateField('content_level', e.target.value)} className={inputStyles}>
                  <option value="">Unset</option>
                  {(Object.keys(CONTENT_LEVEL_DISPLAY) as ContentLevel[]).map((key) => (
                    <option key={key} value={key}>{CONTENT_LEVEL_DISPLAY[key].emoji} {CONTENT_LEVEL_DISPLAY[key].label}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>
          </Section>

          <Section title="Taxonomy & Discovery" icon={Tags}>
            {/* Added padding bottom so dropdowns have room to expand before the modal scroll cuts them off */}
            <div className="space-y-7 pb-16">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genres */}
                <TokenSelect
                  label="System Genres"
                  description="Base genres mapped from the database."
                  options={availableGenres.map(g => ({ id: g.name, label: g.name }))}
                  selectedValues={form.genre_names}
                  onToggle={(val) => toggleArrayItem('genre_names', val as string)}
                />

                {/* Dimensions (Mood, Tropes, etc.) */}
                {DIMENSION_SECTIONS.map(({ dimension, label, helperText }) => (
                  <TokenSelect
                    key={dimension}
                    label={label}
                    description={helperText}
                    options={(availableTags[dimension] || []).map(t => ({
                      id: t.id,
                      label: t.display_label,
                      emoji: t.display_emoji || undefined
                    }))}
                    selectedValues={form.tag_ids}
                    onToggle={(val) => toggleArrayItem('tag_ids', val as number)}
                  />
                ))}

                {/* Curated Collections */}
                <TokenSelect
                  label="Curated Collections"
                  description="Assign to admin-curated collections."
                  options={availableCollections.map(c => ({ id: c.id, label: c.title }))}
                  selectedValues={form.collection_ids}
                  onToggle={(val) => toggleArrayItem('collection_ids', val as number)}
                />
              </div>

            </div>
          </Section>

        </div>

        {/* Sticky Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-card mt-auto rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-[10px] text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center min-w-[130px] px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-brand-gradient hover:opacity-90 shadow-sm transition-opacity disabled:opacity-70"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}