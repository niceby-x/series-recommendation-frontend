import Link from 'next/link';
import {
  Star,
  Heart,
  HeartHandshake,
  Leaf,
  GraduationCap,
  Briefcase,
  Sparkles,
  HeartCrack,
  Users2,
  HomeIcon,
  Infinity as InfinityIcon,
} from 'lucide-react';
import type { TropeChip } from '../../lib/landingContent';

const TROPE_ICONS: Record<string, typeof Star> = {
  'Slow Burn': Star,
  'Enemies to Lovers': Heart,
  'Friends to Lovers': HeartHandshake,
  'Green Flag Couple': Leaf,
  'College Romance': GraduationCap,
  'Office Romance': Briefcase,
  'Fantasy': Sparkles,
  'Fake Dating': HeartCrack,
  'Age Gap': Users2,
  'Found Family': HomeIcon,
  'Omega Verse': InfinityIcon,
};

// Same honest-link note as BrowseByMoodGrid — trope filtering isn't a real
// Explore filter yet, so these point at the plain catalog rather than a
// query param nothing reads.
export default function PopularTropesRow({ tropes }: { tropes: TropeChip[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tropes.map((trope) => {
        const Icon = TROPE_ICONS[trope.name] ?? Star;
        return (
          <Link
            key={trope.name}
            href="/series"
            className="inline-flex items-center gap-2 border border-border bg-card text-foreground text-[13px] font-medium px-4 py-2.5 rounded-full hover:bg-muted hover:border-ring transition-colors"
          >
            <Icon className="size-[15px] text-primary" strokeWidth={1.75} />
            {trope.name}
          </Link>
        );
      })}
    </div>
  );
}
