// Purely decorative — absolutely positioned petal shapes scattered around the
// hero section, matching the mockup's falling-sakura flourish. No interactivity,
// aria-hidden since it carries no content meaning.

const PETALS = [
  { top: '6%', left: '2%', size: 44, rotate: -18, opacity: 0.45 },
  { top: '14%', left: '92%', size: 18, rotate: 55, opacity: 0.35 },
  { top: '30%', left: '8%', size: 16, rotate: 12, opacity: 0.3 },
  { top: '22%', left: '48%', size: 12, rotate: -30, opacity: 0.28 },
  { top: '46%', left: '95%', size: 34, rotate: -10, opacity: 0.4 },
  { top: '58%', left: '4%', size: 26, rotate: 20, opacity: 0.38 },
  { top: '68%', left: '44%', size: 14, rotate: 40, opacity: 0.3 },
  { top: '78%', left: '90%', size: 20, rotate: -25, opacity: 0.32 },
  { top: '86%', left: '10%', size: 48, rotate: 8, opacity: 0.4 },
  { top: '90%', left: '55%', size: 15, rotate: -45, opacity: 0.28 },
];

function Petal({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ opacity }}
    >
      <path
        d="M12 2C12 2 16 6 16 11C16 14.3 14.2 16 12 16C9.8 16 8 14.3 8 11C8 6 12 2 12 2Z"
        fill="var(--color-brand-blush)"
      />
    </svg>
  );
}

export default function PetalDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PETALS.map((petal, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: petal.top,
            left: petal.left,
            transform: 'rotate(' + petal.rotate + 'deg)',
          }}
        >
          <Petal size={petal.size} opacity={petal.opacity} />
        </div>
      ))}
    </div>
  );
}