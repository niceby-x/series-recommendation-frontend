// Progress shown here is mock — there's no per-episode watch-progress table
// yet (`user_lists` only tracks status: plan-to-watch/watching/completed, not
// episode position). Titles/posters for real series are real; the episode
// numbers and % progress are illustrative until that table exists.

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface ContinueItem {
  id: number;
  title: string;
  image_url: string | null;
  currentEpisode: number;
  totalEpisodes: number;
}

interface ContinueJourneyRowProps {
  items: ContinueItem[];
  watchNext: { id: number; title: string; image_url: string | null; episode_count: number };
}

function CardShell({
  id,
  title,
  image_url,
  children,
}: {
  id: number;
  title: string;
  image_url: string | null;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={'/series/' + id}
      className="group relative shrink-0 w-64 aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-brand-mauve to-[#2E2438] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {image_url ? (
        <Image
          src={image_url}
          alt={title}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0" />

      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-sm">
          <Play className="size-4 text-white translate-x-0.5" fill="currentColor" />
        </span>
      </span>

      {children}
    </Link>
  );
}

export default function ContinueJourneyRow({ items, watchNext }: ContinueJourneyRowProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
      {items.map((item) => {
        const progressPct = Math.min(100, Math.round((item.currentEpisode / item.totalEpisodes) * 100));
        return (
          <CardShell key={item.id} id={item.id} title={item.title} image_url={item.image_url}>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-1.5 drop-shadow-sm">
                {item.title}
              </p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/80 text-[11px] font-medium">
                  Ep {item.currentEpisode} of {item.totalEpisodes}
                </span>
                <span className="text-white/60 text-[11px]">{progressPct}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: progressPct + '%' }} />
              </div>
            </div>
          </CardShell>
        );
      })}

      <CardShell id={watchNext.id} title={watchNext.title} image_url={watchNext.image_url}>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-1.5 drop-shadow-sm">
            {watchNext.title}
          </p>
          <span className="inline-block text-white text-[11px] font-semibold bg-brand-gradient px-2.5 py-1 rounded-full">
            Watch Next
          </span>
        </div>
      </CardShell>
    </div>
  );
}