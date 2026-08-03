import Link from 'next/link';
import { Bookmark, Star, Play } from 'lucide-react';
import { MOCK_RECENT_ACTIVITY, type RecentActivityItem } from '../../lib/dashboardContent';

const KIND_ICON: Record<RecentActivityItem['kind'], typeof Bookmark> = {
  watchlist: Bookmark,
  rating: Star,
  progress: Play,
};
const KIND_CLASS: Record<RecentActivityItem['kind'], string> = {
  watchlist: 'bg-brand-lilac/25 text-[#5E4B6B]',
  rating: 'bg-brand-gold/25 text-amber-600',
  progress: 'bg-brand-blush/30 text-primary',
};

export default function RecentActivityCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading text-[16px] font-normal text-foreground">Recent Activity</p>
        <Link href="/my-list" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="flex flex-col">
        {MOCK_RECENT_ACTIVITY.map((item) => {
          const Icon = KIND_ICON[item.kind];
          return (
            <div key={item.id} className="flex items-start gap-3 py-2.5">
              <span className={'flex items-center justify-center size-8 rounded-full shrink-0 ' + KIND_CLASS[item.kind]}>
                <Icon className="size-3.5" fill={item.kind === 'rating' ? 'currentColor' : 'none'} />
              </span>
              <p className="text-[13px] text-foreground/85 leading-snug pt-1">
                {item.text} <span className="font-semibold text-foreground">{item.target}</span>
                <span className="block text-muted-foreground text-[11.5px] mt-0.5">{item.timeAgo}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
