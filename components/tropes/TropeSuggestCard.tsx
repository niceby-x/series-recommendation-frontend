import Link from 'next/link';
import { Feather } from 'lucide-react';

// Same honest-link convention as MoodFeedbackCard -- there's no
// suggestion-intake endpoint yet, so "Suggest Now" points at Community (a
// real page) instead of a form that goes nowhere.
export default function TropeSuggestCard() {
  return (
    <div className="relative rounded-[20px] bg-gradient-to-br from-brand-blush/30 via-card to-brand-lilac/25 border border-border/60 shadow-sm p-5 overflow-hidden">
      <Feather className="absolute -bottom-3 -right-3 size-20 text-brand-lilac/40 rotate-[-8deg]" />

      <div className="relative">
        <p className="font-heading text-[16px] font-normal text-foreground mb-1.5">Can&apos;t find a trope?</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 max-w-[85%]">
          Suggest a trope and help us improve your experience!
        </p>
        <Link
          href="/community"
          className="inline-flex items-center bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          Suggest Now
        </Link>
      </div>
    </div>
  );
}
