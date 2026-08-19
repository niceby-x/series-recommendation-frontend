import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import type { SeriesCardData } from '../shared/SeriesCard';

export default function RecentlyPublishedCard({ series }: { series: SeriesCardData[] }) {
  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="font-sans font-semibold text-[20px] font-normal text-foreground">Recently Published</h2>
        <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      {series.length === 0 ? (
        <p className="text-muted-foreground text-sm">No published titles yet.</p>
      ) : (
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          {series.map((s) => {
            const image = s.poster_url ?? s.backdrop_url;

            return (
              <Link
                key={s.id}
                href={'/series/' + s.id}
                className="group relative block w-full max-w-[180px] aspect-[2/3] mx-auto rounded-[10px] bg-muted shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 18vw, 180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 px-2 text-center">
                    <span className="text-muted-foreground text-[11px] font-medium">{s.title}</span>
                  </div>
                )}

                {/* Diagonal shine sweep on hover -- pointer-events-none so it never
                    blocks the click, and sits below the badge/scrim in the DOM so
                    those stay crisp instead of getting washed out by it. */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                {/* Small glassy green "Published" chip -- collapsed to just the
                    check icon by default, expands to reveal the label on hover. */}
                <div className="absolute top-2 right-2 flex items-center h-6 max-w-6 hover:max-w-24 overflow-hidden rounded-full bg-emerald-500/30 backdrop-blur-md ring-1 ring-inset ring-emerald-200/40 text-white shadow-sm transition-[max-width] duration-300 ease-out">
                  <span className="flex items-center justify-center size-6 shrink-0">
                    <BadgeCheck className="size-3.5" />
                  </span>
                  <span className="pr-2.5 text-[11px] font-semibold whitespace-nowrap">Published</span>
                </div>

                {/* Title/meta live on a bottom scrim rather than a text panel below
                    the art -- a fixed 2:3 tile has no spare height for one. */}
                <div className="absolute inset-x-0 bottom-0 pt-8 px-2.5 pb-2.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
                  <h3 className="font-sans text-white text-[12.5px] font-semibold leading-snug line-clamp-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
                    {s.title}
                  </h3>
                  <p className="text-white/75 text-[10.5px] leading-snug mt-0.5 line-clamp-1">
                    {s.country} · {s.year}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
