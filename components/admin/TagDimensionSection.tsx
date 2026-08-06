'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { TagDimension } from '../../lib/taxonomy';

export interface AdminTag {
  id: number;
  dimension: TagDimension;
  value_key: string;
  display_label: string;
  display_emoji: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function TagDimensionSection({
  dimension,
  label,
  helperText,
  tags,
  busyIds,
  onCreate,
  onToggle,
}: {
  dimension: TagDimension;
  label: string;
  helperText: string;
  tags: AdminTag[];
  busyIds: Set<number>;
  onCreate: (dimension: TagDimension, label: string, emoji: string) => Promise<boolean>;
  onToggle: (tag: AdminTag) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setSaving(true);
    setError(null);
    const ok = await onCreate(dimension, newLabel.trim(), newEmoji.trim());
    setSaving(false);

    if (ok) {
      setNewLabel('');
      setNewEmoji('');
      setAdding(false);
    } else {
      setError('Could not create that tag. It may already exist in this dimension.');
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="font-heading text-[18px] font-normal text-foreground">{label}</h2>
        <p className="text-muted-foreground text-[12.5px]">{helperText}</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag)}
            disabled={busyIds.has(tag.id)}
            title={tag.is_active ? 'Click to deactivate' : 'Click to reactivate'}
            className={
              'group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border transition-colors disabled:opacity-50 ' +
              (tag.is_active
                ? 'bg-brand-blush/25 text-[#5E4B6B] border-transparent hover:bg-rose-50 hover:text-rose-600'
                : 'bg-muted text-muted-foreground border-border line-through hover:bg-emerald-50 hover:text-emerald-600 hover:no-underline')
            }
          >
            {tag.display_emoji && <span aria-hidden>{tag.display_emoji}</span>}
            {tag.display_label}
            <X className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}

        {adding ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="🙂"
              maxLength={4}
              className="w-12 bg-card text-foreground text-center rounded-full px-2 py-1.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
            />
            <input
              type="text"
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Tag name"
              className="bg-card text-foreground placeholder:text-muted-foreground rounded-full px-3.5 py-1.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors w-40"
            />
            <button
              type="submit"
              disabled={saving || !newLabel.trim()}
              className="bg-brand-gradient text-white px-3.5 py-1.5 rounded-full text-[13px] font-semibold disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="text-muted-foreground text-[13px] px-1.5 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium border border-dashed border-border text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
          >
            <Plus className="size-3.5" />
            Add tag
          </button>
        )}
      </div>

      {error && <p className="text-rose-500 text-[12.5px] mt-2">{error}</p>}
    </section>
  );
}
