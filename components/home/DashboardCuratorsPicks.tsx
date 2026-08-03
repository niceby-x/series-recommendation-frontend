import Link from 'next/link';
import Image from 'next/image';
import { Star, Bookmark } from 'lucide-react';
import type { CuratorPick } from '../../lib/landingContent';

function FeatureCard({ pick, synopsis }: { pick: CuratorPick; synopsis: string }) {
  return (
    <div className="rounded-[22px] overflow-hidden bg-card border border-border/60 shadow-sm h-full">
      <div className="grid sm:grid-cols-[1.1fr_1fr] h-full">
        <div className="relative aspect-[4/3] sm:aspect-auto bg-muted min-h-[220px]">
          {pick.imageUrl ? (
            <Image src={pick.imageUrl} alt={pick.title} fill sizes="360px" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-mauve to-[#2E2438]" />
          )}
          <span className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Star className="size-3" fill="currentColor" />
            Curator&apos;s Pick
          </span>
        </div>

        <div className="flex flex-col justify-center px-6 py-6">
          <h3 className="font-heading text-[22px] font-normal text-foreground">{pick.title}</h3>
          <p className="text-muted-foreground text-[13.5px] mt-1 flex items-center gap-1">
            {pick.country} · {pick.mediaType} · {pick.year}
            <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
              <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {pick.tags.map((tag) => (
              <span key={tag} className="bg-muted text-foreground/70 text-[11px] font-medium px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-foreground/80 text-[13.5px] leading-relaxed mt-3">{synopsis}</p>
          <div className="flex items-center gap-2.5 mt-5">
            <Link
              href={typeof pick.id === 'number' ? '/series/' + pick.id : '/series'}
              className="inline-flex items-center gap-1.5 bg-brand-gradient text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity"
            >
              View Story
            </Link>
            <button
              type="button"
              aria-label="Add to watchlist"
              className="flex items-center justify-center size-9 rounded-full border border-border text-foreground/70 hover:bg-muted transition-colors"
            >
              <Bookmark className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListRow({ pick }: { pick: CuratorPick }) {
  const inner = (
    <div className="flex items-center gap-3.5 rounded-[16px] bg-card border border-border/60 p-2.5 hover:shadow-md transition-shadow">
      <div className="relative shrink-0 size-16 rounded-[12px] overflow-hidden bg-muted">
        {pick.imageUrl ? (
          <Image src={pick.imageUrl} alt={pick.title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-foreground text-[14.5px] font-semibold truncate">{pick.title}</h4>
        <p className="text-muted-foreground text-[12px] mt-0.5 flex items-center gap-1">
          {pick.country} · {pick.mediaType} · {pick.year}
        </p>
        <span className="inline-flex items-center gap-0.5 text-brand-gold text-[12px] mt-0.5">
          <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
        </span>
      </div>
    </div>
  );

  return typeof pick.id === 'number' ? (
    <Link href={'/series/' + pick.id} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function DashboardCuratorsPicks({
  feature,
  synopsis,
  list,
}: {
  feature: CuratorPick;
  synopsis: string;
  list: CuratorPick[];
}) {
  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-heading text-[22px] font-normal text-foreground">Curator&apos;s Picks</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Handpicked stories we think you&apos;ll love</p>
        </div>
        <Link href="/series" className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <FeatureCard pick={feature} synopsis={synopsis} />
        <div className="space-y-3">
          {list.map((pick) => (
            <ListRow key={pick.id} pick={pick} />
          ))}
        </div>
      </div>
    </section>
  );
}
