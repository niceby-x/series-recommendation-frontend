// Simple 5-petal blossom, no stem or leaves -- the brand's flower motif,
// reused everywhere a small flower glyph appears (section markers, badges,
// buttons). Renders in whatever `currentColor` the surrounding text/className
// sets, same drop-in usage as a lucide icon: <FlowerIcon className="size-4 text-primary" />

import type { SVGProps } from 'react';

const PETAL_ANGLES = [0, 72, 144, 216, 288];

// Petal tapers to a point at the flower's center (12,12) and rounds out to a
// wide tip near the top -- unlike a plain ellipse, this leaves a visible gap
// at the very middle instead of the petals fully covering it.
const PETAL_PATH = 'M12 12 C 8.7 9.3 8.3 4.6 12 2 C 15.7 4.6 15.3 9.3 12 12 Z';

export default function FlowerIcon({ className, strokeWidth: _strokeWidth, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" {...rest}>
      {PETAL_ANGLES.map((angle) => (
        <path key={angle} d={PETAL_PATH} transform={`rotate(${angle} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.6" fill="white" />
    </svg>
  );
}