import Link from 'next/link';
import { MOCK_TROPES } from '../../lib/landingContent';

// Same honest-link note as PopularTropesRow on the landing page: trope
// filtering isn't a real Explore filter yet (unlike genre, which is wired
// on this page), so these point at the plain catalog rather than a query
// param nothing reads.
export default function PopularTagsCard() {
  return (
    <div className="rounded-[20px] bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[16px] font-normal text-foreground">Popular Tags</p>
        <Link href="/series" className="text-primary text-[12.5px] font-semibold hover:opacity-80 transition-opacity shrink-0">
          View all
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOCK_TROPES.slice(0, 6).map((trope) => (
          <Link
            key={trope.name}
            href="/series"
            className="bg-brand-blush/25 text-[#5E4B6B] text-[12.5px] font-medium px-3.5 py-1.5 rounded-full hover:bg-brand-blush/40 transition-colors"
          >
            #{trope.name.replace(/\s+/g, '')}
          </Link>
        ))}
      </div>
    </div>
  );
}