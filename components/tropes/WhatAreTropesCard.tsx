import { Star } from 'lucide-react';

// "Learn More" has nowhere real to go yet (no tropes explainer page) --
// rendered as a plain button rather than a Link to a dead route, same
// not-yet-real-feature convention used elsewhere (see MoodFeedbackCard).
export default function WhatAreTropesCard() {
  return (
    <div className="relative rounded-[20px] bg-card border border-border/60 shadow-sm p-5 overflow-hidden">
      <Star className="absolute -top-2 -right-2 size-16 text-brand-lilac/25" fill="currentColor" />

      <div className="relative">
        <p className="font-heading text-[16px] font-normal text-foreground mb-1.5">What are Tropes?</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 max-w-[85%]">
          Tropes are common themes or story patterns that make our favorite series so satisfying.
        </p>
        <button
          type="button"
          className="bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
