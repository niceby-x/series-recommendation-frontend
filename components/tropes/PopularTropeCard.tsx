import Link from 'next/link';
import Image from 'next/image';
import type { PopularTrope } from '../../lib/tropesContent';

// Trope filtering now links to a real filtered view (/series?trope=key,
// read by DiscoverAuthed) once a trope has real matches -- previously this
// always linked to the plain catalog regardless. Still falls back to the
// plain /series link when there are none yet, same honest-link convention
// as PopularTagsCard/BrowseByMoodGrid.
//
// posterUrls, when present (1-3 real poster/backdrop images from actual
// matching series), replace the icon tile with a small offset collage --
// makes a card with real data visually distinct from one that's still
// fully editorial/mock, not just a different number in the count chip.
export default function PopularTropeCard({
  trope,
  posterUrls,
}: {
  trope: PopularTrope;
  posterUrls?: (string | null)[];
}) {
  const Icon = trope.icon;
  const hasReal = !!posterUrls && posterUrls.length > 0;
  const href = hasReal ? '/series?trope=' + encodeURIComponent(trope.key) : '/series';

  return (
    <Link
      href={href}
      className="group shrink-0 w-[220px] snap-start rounded-2xl bg-card border border-border/60 shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {hasReal ? (
        <div className="relative h-14 w-20 mb-4">
          {posterUrls!.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="absolute top-0 w-10 aspect-[2/3] rounded-md overflow-hidden border-2 border-card shadow-sm bg-muted"
              style={{ left: i * 14 + 'px', zIndex: 10 - i }}
            >
              {url ? (
                <Image src={url} alt="" fill sizes="40px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-blush/40 to-brand-lilac/40" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <span className="flex items-center justify-center size-11 rounded-2xl bg-brand-lilac/25 text-secondary mb-4">
          <Icon className="size-5" />
        </span>
      )}
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
