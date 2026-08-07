'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import { formatTimeAgo } from '../../lib/formatTime';

export interface RealCollection {
  id: number;
  title: string;
  description: string | null;
  is_curated: boolean;
  is_mine: boolean;
  series_count: number;
  progress_pct: number | null;
  updated_at: string;
}

// Real data now (see /collections, GET /collections/:id). Curated
// collections use a Sparkles icon (admin-picked, shown to everyone);
// personal ones use FolderOpen. The options menu only offers Delete, and
// only when is_mine -- curated collections aren't editable from here at
// all, they're managed on /admin/collections.
export default function CollectionCard({
  collection,
  onDelete,
}: {
  collection: RealCollection;
  onDelete?: (collection: RealCollection) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = collection.is_curated ? Sparkles : FolderOpen;

  return (
    <div className="group relative rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={'/collections/' + collection.id} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25">
          <div className="w-full h-full flex items-center justify-center px-3 text-center">
            <span className="text-muted-foreground text-xs font-medium">{collection.title}</span>
          </div>
          <span className="absolute top-2.5 right-2.5 flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brand-gradient text-white text-[12px] font-bold shadow-sm">
            {collection.series_count}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link href={'/collections/' + collection.id} className="flex items-center gap-1.5 text-foreground font-semibold text-[15px] min-w-0">
            <Icon className="size-4 text-primary shrink-0" />
            <span className="truncate">{collection.title}</span>
          </Link>
          {collection.is_mine && onDelete && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Collection options"
                className="flex items-center justify-center size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MoreVertical className="size-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-10 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(collection);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 mb-3">
          {collection.description || 'No description yet.'}
        </p>

        <div className="flex items-center gap-3 text-muted-foreground text-[12.5px] mb-3">
          <span>{collection.series_count} Series</span>
          <span aria-hidden>·</span>
          <span>Updated {formatTimeAgo(collection.updated_at)}</span>
        </div>

        {collection.progress_pct !== null && (
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient rounded-full" style={{ width: collection.progress_pct + '%' }} />
            </div>
            <span className="text-foreground text-[12.5px] font-semibold shrink-0">{collection.progress_pct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
