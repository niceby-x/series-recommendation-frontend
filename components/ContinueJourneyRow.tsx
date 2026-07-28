// MOCK DATA ONLY. There is no per-episode watch-progress table yet — `user_lists`
// only tracks status (plan-to-watch/watching/completed), not episode position.
// This component exists to match the homepage mockup visually; wire it to real
// data once episode-level progress tracking is built. Do not treat this as a
// working feature yet.

const MOCK_CONTINUE_ITEMS = [
  { label: 'Continue Ep. 5', gradientFrom: 'from-brand-blush/40', gradientTo: 'to-brand-lilac/40' },
  { label: 'Continue Ep. 2', gradientFrom: 'from-brand-lilac/40', gradientTo: 'to-brand-blush/40' },
  { label: 'Continue Ep. 8', gradientFrom: 'from-brand-blush/30', gradientTo: 'to-brand-mauve/20' },
  { label: 'Watch Next', gradientFrom: 'from-brand-lilac/30', gradientTo: 'to-brand-blush/30' },
];

export default function ContinueJourneyRow() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
      {MOCK_CONTINUE_ITEMS.map((item) => (
        <div
          key={item.label}
          className={
            'relative shrink-0 w-64 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br ' +
            item.gradientFrom + ' ' + item.gradientTo
          }
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}