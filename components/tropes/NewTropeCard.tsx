import Link from 'next/link';
import type { NewTrope } from '../../lib/tropesContent';

export default function NewTropeCard({ trope }: { trope: NewTrope }) {
  return (
    <Link
      href="/series"
      className="group shrink-0 w-[200px] snap-start rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-blush/25 to-brand-lilac/25 flex items-center justify-center px-3 text-center">
        <span className="absolute top-2.5 left-2.5 bg-rose-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
          NEW
        </span>
        <span className="text-muted-foreground text-xs font-medium">{trope.title}</span>
      </div>

      <div className="p-3">
        <h3 className="text-card-foreground text-[15px] font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {trope.title}
        </h3>
        <p className="text-muted-foreground text-[13px] mt-0.5">{trope.seriesCount} Series</p>
      </div>
    </Link>
  );
}
