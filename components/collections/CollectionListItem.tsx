'use client';

import Link from 'next/link';
import { FolderOpen, Sparkles } from 'lucide-react';
import type { RealCollection } from './CollectionCard';
import { formatTimeAgo } from '../../lib/formatTime';

export default function CollectionListItem({ collection }: { collection: RealCollection }) {
  const Icon = collection.is_curated ? Sparkles : FolderOpen;

  return (
    <Link
      href={'/collections/' + collection.id}
      className="group flex items-start gap-3.5 rounded-2xl bg-card border border-border/60 shadow-sm p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative shrink-0 size-16 rounded-xl overflow-hidden bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 flex items-center justify-center">
        <Icon className="size-5 text-primary/60" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-foreground font-semibold text-[14.5px] min-w-0">
          <Icon className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{collection.title}</span>
        </p>
        <p className="text-muted-foreground text-[12.5px] leading-snug line-clamp-1 mt-0.5 mb-1.5">
          {collection.description || 'No description yet.'}
        </p>
        <div className="flex items-center gap-2.5 text-muted-foreground text-[12px]">
          <span>{collection.series_count} Series</span>
          <span aria-hidden>·</span>
          <span>Updated {formatTimeAgo(collection.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}
