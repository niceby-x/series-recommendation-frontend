// lucide-react deliberately ships no brand/platform logos (X, Instagram,
// Discord, TikTok, etc. were dropped from the library on purpose). These are
// small, simplified pictograms that read as "that platform" at a glance --
// not pixel-accurate reproductions of any brand's official logo artwork.
// Swap in real brand assets later if BLumi settles on official partner badges.

type IconProps = { className?: string };

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 4L20 20M20 4L4 20"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8.5C8.2 7 15.8 7 18 8.5C19.2 11 19.6 14 19 17C16.8 18.6 15.5 19 15.5 19L14.7 17.3C14.7 17.3 15.3 17.1 15.9 16.7C15.9 16.7 12 18.2 8.1 16.7C8.7 17.1 9.3 17.3 9.3 17.3L8.5 19C8.5 19 7.2 18.6 5 17C4.4 14 4.8 11 6 8.5Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="13" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 4v9.5a2.75 2.75 0 1 1-2.75-2.75"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <path
        d="M14 4c.3 2 1.9 3.5 4 3.7"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}
