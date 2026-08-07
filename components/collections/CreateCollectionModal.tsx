'use client';

import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

// Real-backed now -- onCreate (passed in by CollectionsAuthed) calls
// POST /collections and only closes the modal once that succeeds.
export default function CreateCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, description: string) => void | Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    await onCreate(trimmed, description.trim());
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-popover border border-border rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="flex items-center gap-2 font-heading text-[18px] font-normal text-foreground">
            <FolderPlus className="size-5 text-primary" />
            Create Collection
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="collection-title" className="block text-[13px] font-semibold text-foreground mb-1.5">
              Collection name
            </label>
            <input
              id="collection-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Comfort Rewatches"
              className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          <div>
            <label htmlFor="collection-description" className="block text-[13px] font-semibold text-foreground mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection for?"
              rows={2}
              className="w-full bg-card text-foreground placeholder:text-muted-foreground rounded-xl px-3.5 py-2.5 text-sm border border-border focus:outline-none focus:border-ring transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="mt-1 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? 'Creating...' : 'Create Collection'}
          </button>
        </form>
      </div>
    </div>
  );
}
