import Image from 'next/image';
import { CalendarPlus } from 'lucide-react';
import type { UpcomingRelease } from '../../lib/newReleasesContent';

// Not a Link -- these are curated placeholder titles with nothing in the
// catalog to open yet (see lib/newReleasesContent.ts). The calendar-plus
// button is a visual "remind me" affordance only, same not-persisted
// scope as the bookmark toggle on SeriesCard elsewhere.
export default function UpcomingReleaseCard({ item }: { item: UpcomingRelease }) {
  return (
    <div className="group shrink-0 w-[220px] snap-start">
      <div className="relative aspect-[4/3] w-full rounded-[16px] overflow-hidden bg-muted shadow-sm">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill sizes="220px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-mauve/70 to-[#2E2438]/70 px-3 text-center">
            <span className="text-white/70 text-xs">{item.title}</span>
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 bg-violet-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          UPCOMING
        </span>

        <button
          type="button"
          aria-label="Remind me when it's out"
          className="absolute bottom-2.5 right-2.5 flex items-center justify-center size-8 rounded-full bg-white/90 text-primary shadow-sm hover:scale-110 transition-transform"
        >
          <CalendarPlus className="size-3.5" />
        </button>
      </div>

      <div className="pt-3">
        <h3 className="text-card-foreground text-[15px] font-semibold leading-snug line-clamp-1">{item.title}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
          <span className="bg-muted px-1.5 py-0.5 rounded text-foreground/70">EP 1</span>
          {item.releaseDate}
        </p>
      </div>
    </div>
  );
}
