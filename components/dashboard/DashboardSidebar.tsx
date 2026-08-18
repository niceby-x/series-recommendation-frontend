'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Smile,
  Star,
  FolderOpen,
  Sparkles,
  Users,
  Bookmark,
  Heart,
  History,
  NotebookPen,
  Settings,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from 'lucide-react';
import Logo from '../shared/Logo';

// Every link here honestly points at what's real today. Moods, Tropes,
// Collections, and New Releases are all real pages now (app/moods/page.tsx,
// app/tropes/page.tsx, app/collections/page.tsx, app/new-releases/page.tsx).
// Settings (pinned to the bottom, see below) is real too, if minimal --
// see H4-04 / app/settings/page.tsx.
const HOME_ITEM = { href: '/', label: 'Home', icon: Home };

const NAV_SECTIONS: { label: string; items: { href: string; label: string; icon: typeof Home }[] }[] = [
  {
    label: 'Browse',
    items: [
      { href: '/series', label: 'Discover', icon: Compass },
      { href: '/moods', label: 'Moods', icon: Smile },
      { href: '/tropes', label: 'Tropes', icon: Star },
      { href: '/collections', label: 'Collections', icon: FolderOpen },
      { href: '/new-releases', label: 'New Releases', icon: Sparkles },
      { href: '/community', label: 'Community', icon: Users },
    ],
  },
  {
    label: 'My Library',
    items: [
      { href: '/my-list', label: 'Watchlist', icon: Bookmark },
      { href: '/my-list', label: 'Favorites', icon: Heart },
      { href: '/my-list', label: 'History', icon: History },
      { href: '/my-list', label: 'Notes', icon: NotebookPen },
    ],
  },
];

const SETTINGS_ITEM = { href: '/settings', label: 'Settings', icon: Settings };

const COLLAPSE_STORAGE_KEY = 'dashboard-sidebar-collapsed';

// Deliberately always returns false on the server (no window there) --
// see the comment on DashboardSidebar's own useState/useEffect pairing
// below for why this can't be read synchronously via a lazy useState
// initializer instead.
function loadCollapsedPref(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Mirrors components/admin/AdminSidebar.tsx's redesign: click-to-toggle
// collapse to a 76px icon rail (replacing the old hover-to-expand rail --
// an admin/user working through a session benefits more from a state
// they set once than one that snaps shut the instant the mouse leaves),
// expandable nav groups, and a bottom user-footer with a real Log out
// action. Same collapsed width as AdminSidebar for visual consistency
// between the two.
function NavRow({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: { href: string; label: string; icon: typeof Home };
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ' +
        (collapsed ? 'justify-center ' : '') +
        (active ? 'bg-brand-gradient text-white shadow-sm' : 'text-foreground/70 hover:bg-muted hover:text-foreground')
      }
    >
      <Icon className="size-4.5 shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </Link>
  );
}

// Each section header is its own toggle -- clicking it collapses just
// that group's rows, chevron rotates to match. Ignored entirely in the
// icon-only rail: with no room for a section label there's nothing to
// click, so every row always renders there regardless of a section's
// expanded/collapsed state elsewhere.
function NavSection({
  section,
  isActive,
  collapsed,
  onNavigate,
}: {
  section: (typeof NAV_SECTIONS)[number];
  isActive: (href: string) => boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const expanded = collapsed || open;

  return (
    <div>
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-1 px-3 py-1 mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{section.label}</span>
          <ChevronDown className={'size-3.5 shrink-0 transition-transform duration-150 ' + (open ? '' : '-rotate-90')} />
        </button>
      )}
      {expanded && (
        <div className="flex flex-col gap-0.5">
          {section.items.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavContent({
  isActive,
  collapsed,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mt-5 mb-2">
        <NavRow item={HOME_ITEM} active={isActive(HOME_ITEM.href)} collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <nav className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.label}
            section={section}
            isActive={isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="pt-3 mt-auto border-t border-border/60">
        <NavRow item={SETTINGS_ITEM} active={isActive(SETTINGS_ITEM.href)} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Always starts false (collapsed=false) so the very first client render
  // matches the server's -- SSR has no window/localStorage and would
  // otherwise disagree with a client that has a saved '1' preference,
  // producing a hydration mismatch on the <aside>'s width/className
  // (exactly the "Client"/"Server" className diff Next.js's hydration
  // error surfaces). The real preference, once known, is applied in the
  // effect below, right after mount -- same server/client tradeoff G2-02
  // already accepts for auth state elsewhere in this app: a possible
  // one-frame flash from expanded to collapsed for returning users who'd
  // previously collapsed it, in exchange for a hydration-safe first paint
  // for everyone.
  const [collapsed, setCollapsed] = useState(false);

  // Deliberately reads localStorage in an effect rather than during
  // render: this is the one case react-hooks/set-state-in-effect exists
  // to catch a mistake for, but doesn't apply to -- there's no way to
  // know the saved preference during the server render (no window there)
  // or during the client's first render (has to match the server's to
  // avoid a hydration mismatch), so syncing it in afterward is the
  // correct, not the accidental, place for this setState call.
  useEffect(() => {
    if (loadCollapsedPref()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  function isActive(href: string) {
    const path = href.split('?')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path) && path !== '/series';
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Private browsing / storage quota -- the toggle still works for
        // this session, it just won't persist across visits.
      }
      return next;
    });
  }

  // Closing on route change, same "adjust state during render" pattern
  // Navbar.tsx and AdminSidebar use for their own mobile-menu resets.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Previously there was no mobile fallback at all here -- the
          <aside> below is `hidden lg:flex` with nothing standing in for
          it below that breakpoint, and Navbar.tsx deliberately renders
          nothing on these same routes once a user is signed in (see its
          own DASHBOARD_ROUTES comment) since this sidebar was assumed to
          cover navigation instead. Same FAB + drawer pattern as
          AdminSidebar's D1-01 fix. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center size-12 rounded-full bg-brand-gradient text-white shadow-lg hover:opacity-90 transition-opacity"
      >
        <Menu className="size-5" />
      </button>

      <aside
        className={
          'hidden lg:flex flex-col shrink-0 h-full border-r border-border bg-card px-4 py-5 transition-[width] duration-200 ease-out ' +
          (collapsed ? 'w-[76px]' : 'w-[260px]')
        }
      >
        <div className={'px-1 mb-1 flex items-start ' + (collapsed ? 'flex-col gap-2' : 'justify-between')}>
          <Link href="/" className={collapsed ? 'w-full flex justify-center' : ''}>
            <Logo variant={collapsed ? 'icon' : 'full'} theme="brand" size={30} />
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            className={
              'flex items-center justify-center size-7 rounded-full text-foreground/50 hover:text-primary hover:bg-muted transition-colors shrink-0 ' +
              (collapsed ? '' : 'mt-1')
            }
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <NavContent isActive={isActive} collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="relative flex flex-col w-[280px] max-w-[85vw] h-full bg-card px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between px-1 mb-1">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Logo variant="full" theme="brand" size={30} />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <NavContent
              isActive={isActive}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
