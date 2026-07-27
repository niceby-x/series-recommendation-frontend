type LogoTheme = 'brand' | 'light' | 'dark' | 'mono';

interface LogoProps {
  /** icon = mark only. full = mark + "BLumi" wordmark. */
  variant?: 'icon' | 'full';
  /** brand = pink/lilac gradient petals (default, works on light or dark bg).
   *  light = white mark, for use on dark/colored backgrounds.
   *  dark = deep mauve mark, for use on light backgrounds.
   *  mono = greyscale, for places brand color shouldn't appear. */
  theme?: LogoTheme;
  /** Height in pixels of the mark. Wordmark scales with it. */
  size?: number;
  className?: string;
}

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

function Mark({ theme, gradientId }: { theme: LogoTheme; gradientId: string }) {
  const solid =
    theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#5E4B6B' : theme === 'mono' ? '#9CA3AF' : null;

  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${gradientId}-blush`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBC9D6" />
          <stop offset="100%" stopColor="#F7B6C8" />
        </linearGradient>
        <linearGradient id={`${gradientId}-lilac`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D9CCFB" />
          <stop offset="100%" stopColor="#C8B6F9" />
        </linearGradient>
      </defs>
      <g>
        {PETAL_ANGLES.map((angle, i) => (
          <ellipse
            key={angle}
            cx="60"
            cy="60"
            rx="19"
            ry="32"
            transform={`rotate(${angle} 60 60) translate(0 -26)`}
            fill={solid ?? (i % 2 === 0 ? `url(#${gradientId}-blush)` : `url(#${gradientId}-lilac)`)}
            opacity={solid ? (theme === 'mono' ? 0.85 : 0.9) : 0.88}
            style={solid ? undefined : { mixBlendMode: 'multiply' }}
          />
        ))}
      </g>
      <polygon
        points="50,42 50,78 81,60"
        fill={theme === 'dark' ? '#FFF8F4' : '#FFFFFF'}
        strokeLinejoin="round"
        stroke={theme === 'dark' ? '#FFF8F4' : '#FFFFFF'}
        strokeWidth="10"
      />
    </svg>
  );
}

export default function Logo({ variant = 'full', theme = 'brand', size = 32, className = '' }: LogoProps) {
  const gradientId = `blumi-mark-${theme}`;
  const textColor =
    theme === 'light' ? '#FFFFFF' : theme === 'mono' ? '#6B7280' : '#5E4B6B';

  if (variant === 'icon') {
    return (
      <span
        className={className}
        style={{ display: 'inline-block', width: size, height: size }}
        role="img"
        aria-label="BLumi"
      >
        <Mark theme={theme} gradientId={gradientId} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="BLumi">
      <span style={{ display: 'inline-block', width: size, height: size, flexShrink: 0 }}>
        <Mark theme={theme} gradientId={gradientId} />
      </span>
      <span
        className="font-heading font-semibold tracking-tight"
        style={{ color: textColor, fontSize: size * 0.72, lineHeight: 1 }}
      >
        BLumi
      </span>
    </span>
  );
}
