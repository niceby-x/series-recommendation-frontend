import Link from 'next/link';
import type { PopularTrope } from '../../lib/tropesContent';

// Trope filtering isn't wired into Explore yet (same honest-link
// convention as PopularTagsCard/BrowseByMoodGrid) -- links to the plain
// catalog rather than a query param nothing reads.
export default function PopularTropeCard({ trope }: { trope: PopularTrope }) {
  const Icon = trope.icon;

  return (
    <Link
      href="/series"
      className="group shrink-0 w-[220px] snap-start rounded-2xl bg-card border border-border/60 shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="flex items-center justify-center size-11 rounded-2xl bg-brand-lilac/25 text-secondary mb-4">
        <Icon className="size-5" />
      </span>
      <h3 className="font-heading text-[17px] font-normal text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {trope.title}
      </h3>
      <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-2">{trope.description}</p>
      <span className="inline-flex items-center gap-1 bg-brand-blush/25 text-[#5E4B6B] text-[12px] font-semibold px-2.5 py-1 rounded-full">
        {trope.seriesCount} Series
      </span>
    </Link>
  );
}
