'use client';

import { MoreVertical } from 'lucide-react';
import type { Collection } from '../../lib/collectionsContent';

// Ellipsis menu is decorative for now (no edit/delete/rename backend yet) --
// same visual-only convention SeriesCard's bookmark toggle already
// established elsewhere in this app.
export default function CollectionCard({ collection }: { collection: Collection }) {
  const Icon = collection.icon;

  return (
    <div className="group rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25">
        <div className="w-full h-full flex items-center justify-center px-3 text-center">
          <span className="text-muted-foreground text-xs font-medium">{collection.title}</span>
        </div>
        <span className="absolute top-2.5 right-2.5 flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brand-gradient text-white text-[12px] font-bold shadow-sm">
          {collection.seriesCount}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="flex items-center gap-1.5 text-foreground font-semibold text-[15px] min-w-0">
            <Icon className="size-4 text-primary shrink-0" />
            <span className="truncate">{collection.title}</span>
          </p>
          <button
            type="button"
            aria-label="Collection options"
            className="shrink-0 flex items-center justify-center size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>

        <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 mb-3">{collection.description}</p>

        <div className="flex items-center gap-3 text-muted-foreground text-[12.5px] mb-3">
          <span>{collection.seriesCount} Series</span>
          <span aria-hidden>·</span>
          <span>Updated {collection.updatedAgo}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-brand-gradient rounded-full" style={{ width: collection.progressPct + '%' }} />
          </div>
          <span className="text-foreground text-[12.5px] font-semibold shrink-0">{collection.progressPct}%</span>
        </div>
      </div>
    </div>
  );
}
