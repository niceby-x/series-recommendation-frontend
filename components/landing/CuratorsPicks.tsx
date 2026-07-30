import Image from 'next/image';
import { Star, Play, ChevronRight, Quote } from 'lucide-react';
import type { CuratorPick } from '../../lib/landingContent';

function FeatureCard({ pick, quote }: { pick: CuratorPick; quote: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm h-full min-h-[280px]">
      <div className="absolute inset-0 bg-muted">
        {pick.imageUrl ? (
          <Image src={pick.imageUrl} alt={pick.title} fill sizes="480px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-mauve to-[#2E2438]" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="relative h-full flex flex-col justify-between p-6">
        <Quote className="size-7 text-white/60" fill="currentColor" />
        <div>
          <p className="text-white text-[17px] font-medium leading-snug mb-1 max-w-xs">&ldquo;{quote}&rdquo;</p>
          <p className="text-white/60 text-[12px] mb-4">— BLumi Curator 🌸</p>

          <h3 className="text-white text-[18px] font-semibold">{pick.title}</h3>
          <p className="text-white/70 text-[12px] mt-0.5 mb-2 flex items-center gap-1">
            {pick.country} · {pick.mediaType} · {pick.year}
            <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
              <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
            </span>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {pick.tags.map((tag) => (
                <span key={tag} className="bg-white/15 backdrop-blur-sm text-white text-[10.5px] font-medium px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <span className="flex items-center justify-center size-9 rounded-full bg-brand-gradient text-white shrink-0">
              <Play className="size-3.5 translate-x-0.5" fill="currentColor" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListRow({ pick }: { pick: CuratorPick }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3 hover:bg-muted/60 transition-colors">
      <div className="relative shrink-0 size-14 rounded-xl overflow-hidden bg-muted">
        {pick.imageUrl ? (
          <Image src={pick.imageUrl} alt={pick.title} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-foreground text-[14px] font-semibold truncate">{pick.title}</h4>
        <p className="text-muted-foreground text-[12px] flex items-center gap-1">
          {pick.country} · {pick.mediaType} · {pick.year}
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
            <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
          </span>
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {pick.tags.map((tag) => (
            <span key={tag} className="bg-muted text-foreground/70 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </div>
  );
}

export default function CuratorsPicks({
  feature,
  quote,
  list,
}: {
  feature: CuratorPick;
  quote: string;
  list: CuratorPick[];
}) {
  return (
    <div className="grid md:grid-cols-[1.1fr_1fr] gap-5">
      <FeatureCard pick={feature} quote={quote} />
      <div className="space-y-3">
        {list.map((pick) => (
          <ListRow key={pick.id} pick={pick} />
        ))}
      </div>
    </div>
  );
}
