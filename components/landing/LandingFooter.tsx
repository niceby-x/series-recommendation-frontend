import Link from 'next/link';
import { Globe, Rss, Share2, AtSign } from 'lucide-react';

// Only /series, /community, and /about exist as real routes right now.
// Everything else in this footer (Moods, Tropes, Collections, Reviews,
// Leaderboard, Events, Blog, Contact, and all Legal links) doesn't have a
// page yet -- rather than link to something that 404s or point multiple
// distinct-sounding items at the same placeholder, those render as plain
// muted text. Wire each one up for real as its page ships.
const COLUMNS: { heading: string; links: { label: string; href: string | null }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Discover', href: '/series' },
      { label: 'Moods', href: null },
      { label: 'Tropes', href: null },
      { label: 'Collections', href: null },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Discussions', href: '/community' },
      { label: 'Reviews', href: null },
      { label: 'Leaderboard', href: null },
      { label: 'Events', href: null },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Curation', href: null },
      { label: 'Blog', href: null },
      { label: 'Contact', href: null },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: null },
      { label: 'Terms of Service', href: null },
      { label: 'Cookie Policy', href: null },
      { label: 'Guidelines', href: null },
    ],
  },
];

const SOCIALS = [Globe, Rss, Share2, AtSign];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-12 grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <p className="font-heading text-xl font-normal text-foreground flex items-center gap-1.5 mb-2">
            🌸 BLumi
          </p>
          <p className="text-muted-foreground text-[13px] mb-4">Where stories bloom.</p>
          <p className="text-muted-foreground text-[12px]">© 2026 BLumi. All rights reserved.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="text-foreground text-[13px] font-bold mb-3">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((link) =>
                link.href ? (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-[13px] hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label} className="text-muted-foreground/50 text-[13px]">
                    {link.label}
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-5 flex items-center justify-between">
          <p className="text-muted-foreground text-[12px]">Follow Us</p>
          <div className="flex items-center gap-3">
            {SOCIALS.map((Icon, i) => (
              <span
                key={i}
                className="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
