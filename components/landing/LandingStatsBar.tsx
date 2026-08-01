import { Flower2, Heart, Sparkles, Users } from 'lucide-react';
import { LANDING_FEATURES } from '../../lib/landingContent';

const ICONS = [Flower2, Heart, Sparkles, Users];

// Icon treatment per tile -- gradient squircles (not plain circles) so each
// one reads as a distinct little badge rather than a generic bullet icon.
// Colors deliberately vary across the fixed brand palette.
const ICON_STYLES = [
  { bg: 'bg-gradient-to-br from-brand-blush to-brand-pink-vivid', fg: 'text-white' },
  { bg: 'bg-gradient-to-br from-brand-lilac to-brand-purple-vivid', fg: 'text-white' },
  { bg: 'bg-gradient-to-br from-brand-gold to-[#E8A33D]', fg: 'text-white' },
  { bg: 'bg-gradient-to-br from-brand-purple-vivid to-brand-lilac', fg: 'text-white' },
];

// Divider accent color to the left of each tile (desktop only) -- ties each
// item's rule line back to its own icon color instead of one flat gray line.
const DIVIDER_COLORS = ['bg-brand-blush', 'bg-brand-lilac', 'bg-brand-gold', 'bg-brand-lilac'];

export default function LandingStatsBar() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 mt-4 md:mt-6">
      <div className="rounded-tl-[36px] rounded-tr-[14px] rounded-br-[36px] rounded-bl-[14px] border border-white/50 bg-white/55 backdrop-blur-xl shadow-[0_10px_30px_rgba(88,54,99,0.1)] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {LANDING_FEATURES.map((feature, i) => {
          const Icon = ICONS[i];
          const style = ICON_STYLES[i];
          return (
            <div key={feature.label} className="relative flex items-start gap-3 md:pl-5">
              {i !== 0 && (
                <span className={`hidden md:block absolute left-0 top-0.5 bottom-0.5 w-[3px] rounded-full ${DIVIDER_COLORS[i]}/50`} aria-hidden="true" />
              )}
              <span className={`flex items-center justify-center size-11 rounded-xl shrink-0 shadow-sm ${style.bg} ${style.fg}`}>
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="text-foreground text-[13px] font-semibold leading-snug">{feature.label}</p>
                <p className="text-muted-foreground text-[12px] leading-snug">{feature.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}