import Link from 'next/link';

// No real category imagery yet -- honest dark gradient + icon instead of a
// guessed stock photo, same fallback convention as MoodCard/SeriesCard use
// when imageUrl is null.
import type { TropeCategory } from '../../lib/tropesContent';

export default function CategoryCard({ category }: { category: TropeCategory }) {
  const Icon = category.icon;

  return (
    <Link
      href="/series"
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A2033] to-[#1A1420] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity" />

      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <Icon className="size-5 text-white/90" />
        <div>
          <p className="text-white text-[16px] font-semibold leading-tight">{category.label}</p>
          <p className="text-white/65 text-[12.5px] mt-0.5">{category.seriesCount} Series</p>
        </div>
      </div>
    </Link>
  );
}
