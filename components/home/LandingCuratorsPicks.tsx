import Image from 'next/image';
import { Star, ChevronRight, Quote } from 'lucide-react';
import type { CuratorPick } from '../../lib/landingContent';
import TiltCard from '../shared/TiltCard';
import Spotlight from '../shared/Spotlight';

function FeatureCard({ pick, quote }: { pick: CuratorPick; quote: string }) {
  return (
    <TiltCard maxTilt={3} className="h-full">
      <Spotlight
        className="group relative rounded-[18px] overflow-hidden bg-gradient-to-br from-brand-blush/20 via-card to-brand-lilac/15 border border-border/60 shadow-sm h-full min-h-[280px]"
        color="rgba(200, 182, 249, 0.25)"
      >
      <div className="grid grid-cols-[3fr_2fr] h-full">
        {/* Photo fills the whole left half; title/meta/tags are overlaid
            directly on it (dark gradient underneath for legibility) rather
            than living in a separate content block below the image. */}
        <div className="relative bg-muted">
          {pick.imageUrl ? (
            <Image src={pick.imageUrl} alt={pick.title} fill sizes="280px" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-mauve to-[#2E2438]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
          {/* Soft seam so the photo visually bleeds into the quote panel
              instead of ending in a hard vertical line. */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-card/70 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-white text-[19px] font-semibold">{pick.title}</h3>
            <p className="text-white/75 text-[13px] mt-1 flex items-center gap-1">
              {pick.country} · {pick.mediaType} · {pick.year}
              <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
                <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {pick.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quote, on the same soft-tinted background the photo bleeds into. */}
        <div className="flex flex-col justify-center px-6 py-6">
          <Quote className="size-8 text-brand-lilac" fill="currentColor" />
          <p className="text-foreground text-[17px] font-medium leading-snug mt-3 mb-3">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="text-muted-foreground text-[13px]">— BLumi Curator</p>
        </div>
      </div>
      </Spotlight>
    </TiltCard>
  );
}

function ListRow({ pick }: { pick: CuratorPick }) {
  return (
    <div className="flex items-center gap-4 rounded-[15px] bg-card border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative shrink-0 self-stretch w-48 bg-muted">
        {pick.imageUrl ? (
          <Image src={pick.imageUrl} alt={pick.title} fill sizes="176px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blush/30 to-brand-lilac/30" />
        )}
      </div>
      <div className="flex-1 min-w-0 py-5">
        <h4 className="text-foreground text-[15px] font-semibold truncate">{pick.title}</h4>
        <p className="text-muted-foreground text-[12.5px] mt-0.5 flex items-center gap-1">
          {pick.country} · {pick.mediaType} · {pick.year}
          <span className="inline-flex items-center gap-0.5 text-brand-gold ml-1">
            <Star className="size-3" fill="currentColor" /> {pick.rating.toFixed(1)}
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {pick.tags.map((tag) => (
            <span key={tag} className="bg-muted text-foreground/70 text-[11px] font-medium px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="flex items-center justify-center size-8 rounded-full border border-border text-muted-foreground shrink-0 mr-3.5">
        <ChevronRight className="size-4" />
      </span>
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
    <div className="grid md:grid-cols-[1.5fr_1fr] gap-5">
      <FeatureCard pick={feature} quote={quote} />
      <div className="space-y-3">
        {list.map((pick) => (
          <ListRow key={pick.id} pick={pick} />
        ))}
      </div>
    </div>
  );
}