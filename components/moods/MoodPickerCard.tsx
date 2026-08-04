'use client';

import { Shuffle } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import { MOOD_FILTERS } from '../../lib/moodsContent';

// "Surprise Me" picks a random real mood (never 'all') and hands it back to
// MoodsAuthed via onPick, reusing the same selectedMood state the filter
// chips drive -- one source of truth for "what mood is showing" rather than
// a second local one here.
export default function MoodPickerCard({ onPick }: { onPick: (key: string) => void }) {
  function handleSurprise() {
    const choices = MOOD_FILTERS.filter((m) => m.key !== 'all');
    const pick = choices[Math.floor(Math.random() * choices.length)];
    onPick(pick.key);
  }

  return (
    <div className="relative rounded-[20px] bg-card border border-border/60 shadow-sm p-5 overflow-hidden">
      <FlowerIcon className="absolute -top-3 -right-3 size-20 text-brand-lilac/30" />

      <div className="relative">
        <p className="font-heading text-[16px] font-normal text-foreground mb-1.5">How&apos;s your mood?</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed mb-4">
          Pick a mood and we&apos;ll recommend the perfect series for you.
        </p>
        <button
          type="button"
          onClick={handleSurprise}
          className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Shuffle className="size-4" />
          Surprise Me
        </button>
      </div>
    </div>
  );
}
