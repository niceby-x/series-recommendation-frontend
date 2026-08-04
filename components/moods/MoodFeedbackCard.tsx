import Link from 'next/link';
import { NotebookPen } from 'lucide-react';

// There's no feedback-intake endpoint yet, so "Tell Us" honestly points at
// Community (a real page) rather than a form that goes nowhere -- same
// not-yet-real-feature convention as Navbar/DashboardSidebar's Moods/
// Tropes/Collections links.
export default function MoodFeedbackCard() {
  return (
    <div className="relative rounded-[20px] bg-gradient-to-br from-brand-blush/30 via-card to-brand-lilac/25 border border-border/60 shadow-sm p-5 overflow-hidden">
      <NotebookPen className="absolute -bottom-3 -right-3 size-20 text-brand-lilac/40 rotate-[-8deg]" />

      <div className="relative">
        <p className="font-heading text-[16px] font-normal text-foreground mb-1.5">Can&apos;t find the right mood?</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 max-w-[85%]">
          Tell us how you feel and we&apos;ll find something just for you.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          Tell Us
        </Link>
      </div>
    </div>
  );
}
