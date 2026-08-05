'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Smile, Star, FolderOpen, Sparkles, Users, Bookmark, Heart, History, NotebookPen } from 'lucide-react';
import Logo from '../shared/Logo';

// Every link here honestly points at what's real today. Moods, Tropes,
// Collections, and New Releases are all real pages now (app/moods/page.tsx,
// app/tropes/page.tsx, app/collections/page.tsx, app/new-releases/page.tsx).
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/series', label: 'Discover', icon: Compass },
  { href: '/moods', label: 'Moods', icon: Smile },
  { href: '/tropes', label: 'Tropes', icon: Star },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/new-releases', label: 'New Releases', icon: Sparkles },
  { href: '/community', label: 'Community', icon: Users },
];

const LIBRARY_ITEMS = [
  { href: '/my-list', label: 'Watchlist', icon: Bookmark },
  { href: '/my-list', label: 'Favorites', icon: Heart },
  { href: '/my-list', label: 'History', icon: History },
  { href: '/my-list', label: 'Notes', icon: NotebookPen },
];

// Label span: 0-width + invisible while collapsed so it never affects the
// row's layout (that's what keeps the icon perfectly centered at rest),
// then grows in on hover alongside the row switching from centered to
// left-aligned (see ROW_CLASS).
const LABEL_CLASS =
  'whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200';

// Row: icon alone is perfectly centered at rest (justify-center, gap-0 --
// no invisible label/gap skewing it off-center), then switches to a normal
// left-aligned icon+label row on hover.
const ROW_CLASS =
  'flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 transition-all duration-200';

export default function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    const path = href.split('?')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path) && path !== '/series';
  }

  return (
    <>
      {/* Spacer: reserves the collapsed rail's width in the page's flex
          layout so main/aside content doesn't shift when the real
          <aside> below expands on hover (it's fixed + overlays instead
          of pushing content). */}
      <div className="hidden lg:block w-[76px] shrink-0" aria-hidden />

      <aside className="hidden lg:flex group flex-col fixed top-0 left-0 h-screen z-30 w-[76px] hover:w-[232px] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-r border-border bg-card px-3 py-6 transition-[width] duration-200 ease-out shadow-[4px_0_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.15)]">
        <Link href="/" className={ROW_CLASS + ' px-1 mb-4 shrink-0'}>
          <Logo variant="icon" theme="brand" size={30} className="shrink-0" />
          <span className={'font-heading font-semibold text-lg text-[#5E4B6B] ' + LABEL_CLASS}>BLumi</span>
        </Link>

        <div className="mb-4 px-1">
          <div className="border-t-2 border-foreground/15" />
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                title={label}
                className={
                  ROW_CLASS +
                  ' px-2.5 py-2.5 rounded-full text-sm font-semibold ' +
                  (active
                    ? 'bg-brand-gradient text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground')
                }
              >
                <Icon className="size-4.5 shrink-0" />
                <span className={LABEL_CLASS}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* A real divider line reads as intentional; the blank spacer it
            replaced just looked like a layout bug. The label above it
            takes zero height at rest (max-h-0) so the collapsed rail's
            gap here matches normal icon spacing, not reserved label space. */}
        <div className="mt-3 mb-3 px-1">
          <span
            className={
              'block text-[11px] font-bold uppercase tracking-wide text-muted-foreground px-1.5 max-h-0 group-hover:max-h-5 mb-0 group-hover:mb-2 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-200'
            }
          >
            My Library
          </span>
          <div className="border-t-2 border-foreground/15" />
        </div>

        <nav className="flex flex-col gap-1">
          {LIBRARY_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              title={label}
              className={ROW_CLASS + ' px-2.5 py-2.5 rounded-full text-sm font-semibold text-foreground/70 hover:bg-muted hover:text-foreground'}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className={LABEL_CLASS}>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}