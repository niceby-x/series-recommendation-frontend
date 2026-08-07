'use client';

import Link from 'next/link';
import { FolderOpen, Sparkles } from 'lucide-react';
import type { RealCollection } from './CollectionCard';
import { formatTimeAgo } from '../../lib/formatTime';

// Real sort by updated_at now, off the same collections list the parent
// already fetched (mine + curated combined) -- no separate request, no
// hardcoded key order.
export default function RecentlyUpdatedCard({ collections }: { collections: RealCollection[] }) {
  const items = [...collections]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <p className="font-heading text-[16px] font-normal text-foreground mb-1">Recently Updated</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-[12.5px] mt-3">No collections yet.</p>
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((item) => {
            const Icon = item.is_curated ? Sparkles : FolderOpen;
            return (
              <Link key={item.id} href={'/collections/' + item.id} className="flex items-center gap-3 py-2.5">
                <div className="relative shrink-0 size-11 rounded-[10px] overflow-hidden bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30 flex items-center justify-center">
                  <Icon className="size-4 text-primary/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-[13.5px] font-semibold truncate">{item.title}</p>
                  <p className="text-muted-foreground text-[11.5px] truncate">
                    Updated {formatTimeAgo(item.updated_at)} · {item.series_count} Series
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
