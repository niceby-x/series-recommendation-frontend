'use client';

import { useState } from 'react';
import { Plus, X, Pencil, Check, GitMerge } from 'lucide-react';
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

function TagChip({
  tag,
  busy,
  onToggle,
  onRename,
  onDelete,
}: {
  tag: AdminTag;
  busy: boolean;
  onToggle: () => void;
  onRename: (label: string, emoji: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(tag.display_label);
  const [emoji, setEmoji] = useState(tag.display_emoji || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!label.trim()) return;
          setSaving(true);
          setError(null);
          const ok = await onRename(label.trim(), emoji.trim());
          setSaving(false);
          if (ok) setEditing(false);
          else setError('Name already used in this dimension.');
        }}
        className="flex items-center gap-1"
      >
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={4}
          className="w-10 bg-card text-foreground text-center rounded-full px-1.5 py-1.5 text-sm border border-border focus:outline-none focus:border-ring"
        />
        <input
          type="text"
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-card text-foreground rounded-full px-3 py-1.5 text-sm border border-border focus:outline-none focus:border-ring w-36"
        />
        <button type="submit" disabled={saving} aria-label="Save" className="text-emerald-600 hover:bg-emerald-50 rounded-full p-1.5">
          <Check className="size-3.5" />
        </button>
        <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="text-muted-foreground hover:text-foreground rounded-full p-1.5">
          <X className="size-3.5" />
        </button>
        {error && <span className="text-rose-500 text-[11.5px]">{error}</span>}
      </form>
    );
  }

  return (
    <div
      className={
        'group flex items-center rounded-full border overflow-hidden transition-colors ' +
        (tag.is_active
          ? 'bg-brand-blush/25 text-[#5E4B6B] border-transparent'
          : 'bg-muted text-muted-foreground border-border')
      }
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        title={tag.is_active ? 'Click to deactivate' : 'Click to reactivate'}
        className={'flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed ' + (tag.is_active ? '' : 'line-through')}
      >
        {tag.display_emoji && <span aria-hidden>{tag.display_emoji}</span>}
        {tag.display_label}
      </button>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={busy}
        title="Rename"
        aria-label={'Rename ' + tag.display_label}
        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-opacity"
      >
        <Pencil className="size-3" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        title="Delete"
        aria-label={'Delete ' + tag.display_label}
        className="p-1.5 pr-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition-opacity"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export default function TagDimensionSection({
  dimension,
  label,
  helperText,
  tags,
  busyIds,
  onCreate,
  onToggle,
  onRename,
  onDelete,
  onMerge,
}: {
  dimension: TagDimension;
  label: string;
  helperText: string;
  tags: AdminTag[];
  busyIds: Set<number>;
  onCreate: (dimension: TagDimension, label: string, emoji: string) => Promise<boolean>;
  onToggle: (tag: AdminTag) => void;
  onRename: (tag: AdminTag, label: string, emoji: string) => Promise<boolean>;
  onDelete: (tag: AdminTag) => void;
  onMerge: (dimension: TagDimension, sourceIds: number[], targetId: number) => Promise<boolean>;
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [merging, setMerging] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetId, setTargetId] = useState<number | null>(null);
  const [mergeSaving, setMergeSaving] = useState(false);

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

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (targetId != null && !next.has(targetId)) setTargetId(null);
      return next;
    });
  }

  function exitMergeMode() {
    setMerging(false);
    setSelected(new Set());
    setTargetId(null);
  }

  async function handleMergeSubmit() {
    if (!targetId || selected.size < 2) return;
    setMergeSaving(true);
    const sourceIds = [...selected].filter((id) => id !== targetId);
    const ok = await onMerge(dimension, sourceIds, targetId);
    setMergeSaving(false);
    if (ok) exitMergeMode();
  }

  const selectedTags = tags.filter((t) => selected.has(t.id));

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-[18px] font-normal text-foreground">{label}</h2>
          <p className="text-muted-foreground text-[12.5px]">{helperText}</p>
        </div>
        <button
          type="button"
          onClick={() => (merging ? exitMergeMode() : setMerging(true))}
          className={
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold border transition-colors shrink-0 ' +
            (merging ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-ring hover:text-foreground')
          }
        >
          <GitMerge className="size-3.5" />
          {merging ? 'Cancel merge' : 'Merge duplicates'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) =>
          merging ? (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleSelected(tag.id)}
              className={
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border-2 transition-colors ' +
                (selected.has(tag.id)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-transparent text-muted-foreground hover:border-border')
              }
            >
              {tag.display_emoji && <span aria-hidden>{tag.display_emoji}</span>}
              {tag.display_label}
            </button>
          ) : (
            <TagChip
              key={tag.id}
              tag={tag}
              busy={busyIds.has(tag.id)}
              onToggle={() => onToggle(tag)}
              onRename={(l, e) => onRename(tag, l, e)}
              onDelete={() => onDelete(tag)}
            />
          )
        )}

        {!merging &&
          (adding ? (
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
          ))}
      </div>

      {error && <p className="text-rose-500 text-[12.5px] mt-2">{error}</p>}

      {merging && selected.size >= 2 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 bg-muted/60 border border-border/60 rounded-xl px-3.5 py-2.5">
          <span className="text-[13px] text-foreground">Merge {selected.size} tags into:</span>
          <select
            value={targetId ?? ''}
            onChange={(e) => setTargetId(parseInt(e.target.value))}
            className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-foreground focus:outline-none focus:border-ring"
          >
            <option value="" disabled>
              Choose the one to keep…
            </option>
            {selectedTags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMergeSubmit}
            disabled={!targetId || mergeSaving}
            className="bg-primary text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-full disabled:opacity-40"
          >
            {mergeSaving ? 'Merging…' : 'Merge'}
          </button>
        </div>
      )}
      {merging && selected.size === 1 && (
        <p className="text-muted-foreground text-[12.5px] mt-2">Select at least one more tag to merge together.</p>
      )}
    </section>
  );
}
