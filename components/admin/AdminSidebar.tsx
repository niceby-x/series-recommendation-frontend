'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import FlowerIcon from '../shared/FlowerIcon';
import Logo from '../shared/Logo';
import { ADMIN_NAV_SECTIONS, ADMIN_DASHBOARD_ITEM, type AdminNavItem } from '../../lib/adminContent';

const COLLAPSE_STORAGE_KEY = 'admin-sidebar-collapsed';

// Read once via useState's lazy initializer (matches the pattern
// DashboardHeader's recent-searches already use) rather than a useEffect
// that calls setState -- the guard keeps this SSR-safe, and initializing
// state this way avoids the extra render an effect-driven setState would
// cost.
function loadCollapsedPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Desktop rail can now be toggled between the full 256px layout (labels,
// section headers, badge counts) and a 76px icon-only rail -- same
// collapsed width as the public DashboardSidebar's rail, for visual
// consistency between the two, though the interaction itself is
// click-to-toggle rather than hover: an admin working through a long
// session benefits more from a state they set once than a rail that
// snaps back open the instant the mouse leaves it.
function NavRow({
  item,
  active,
  badgeCount,
  collapsed,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  badgeCount?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  // href: null means the screen doesn't exist yet (see lib/adminContent.ts)
  // -- rendered as a disabled row with a "Soon" pill rather than a link
  // that goes nowhere real, same honest-placeholder convention used
  // elsewhere in the app (DashboardSidebar, MoodFilterChips' empty state).
  if (!item.href) {
    return (
      <div
        title={collapsed ? item.label : undefined}
        className={
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/35 cursor-default select-none ' +
          (collapsed ? 'justify-center' : '')
        }
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="text-[13.5px] font-medium flex-1">{item.label}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ' +
        (collapsed ? 'justify-center ' : '') +
        (active ? 'bg-brand-gradient text-white shadow-sm' : 'text-foreground/70 hover:bg-muted hover:text-foreground')
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {badgeCount != null && badgeCount > 0 && (
            <span
              className={
                'text-[11px] font-bold px-2 py-0.5 rounded-full ' +
                (active ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-600')
              }
            >
              {badgeCount}
            </span>
          )}
        </>
      )}
      {/* Collapsed state drops the numeric badge (no room, and it'd
          collide with the centered icon) but keeps a small dot so a
          pending count isn't silently invisible while collapsed. */}
      {collapsed && badgeCount != null && badgeCount > 0 && (
        <span className={'absolute mt-4 ml-4 size-2 rounded-full ' + (active ? 'bg-white' : 'bg-rose-500')} />
      )}
    </Link>
  );
}

// D1-01: below the lg breakpoint, the aside below is `hidden` with no
// substitute at all -- an admin on a tablet, or anyone who resizes a
// window narrow, previously had no way to move between sections once it
// disappeared, and Navbar.tsx (the site's other mobile-nav fallback)
// deliberately renders nothing on any /admin route (see its
// DASHBOARD_PREFIX_ROUTES check), so there was truly no fallback.
//
// Self-contained trigger + drawer, same pattern Navbar.tsx already uses
// for its own mobile menu (button + panel both owned by one component,
// no cross-component state) -- AdminSidebar and AdminHeader are rendered
// as independent siblings by every one of the ~12 admin page files, so a
// shared "drawer open" context split across two components would mean
// either new plumbing through all of those pages or a new context file
// neither the checklist nor this fix actually needs: the drawer only
// ever needs to know about itself.
function NavContent({
  pathname,
  pendingCount,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  pendingCount: number;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mt-5 mb-2">
        <NavRow
          item={ADMIN_DASHBOARD_ITEM}
          active={pathname === '/admin'}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>

      <nav className="flex flex-col gap-5">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.label}
                  item={item}
                  active={!!item.href && pathname.startsWith(item.href)}
                  badgeCount={item.badgeKey === 'pending' ? pendingCount : undefined}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-auto pt-6">
          <div className="rounded-2xl bg-gradient-to-br from-brand-blush/30 to-brand-lilac/25 border border-border/60 p-4">
            <FlowerIcon className="size-5 text-primary mb-2" />
            <p className="text-[13px] font-semibold text-foreground leading-snug">BLumi is built with love for stories.</p>
            <p className="text-[12px] text-muted-foreground mt-1 leading-snug">Keep curating beautiful BL stories.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop-only collapse state, read once at init from localStorage (see
  // loadCollapsedPref above) so there's no extra render/effect involved.
  const [collapsed, setCollapsed] = useState<boolean>(() => loadCollapsedPref());

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
  // Navbar.tsx uses for its own mobileMenuOpen reset -- otherwise the
  // drawer would still be open the moment the new page renders underneath
  // it. Deliberately not a useEffect: a setState synchronously inside an
  // effect just to sync it with a prop/derived value costs an extra
  // render for no benefit over doing it inline during this one.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Body scroll lock while the drawer is open, same as any full-screen
  // overlay -- without it the page behind it still scrolls under a
  // finger/wheel on mobile, which reads as broken.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Escape-to-close, same convention as the search inputs elsewhere in
  // the app (DashboardHeader, Navbar).
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
      {/* Bottom-right FAB rather than anywhere in the top header row --
          AdminHeader's icon cluster stays on the same row as the greeting
          at sm:-and-up widths (sm:flex-nowrap), so a fixed trigger placed
          up top would sit right on top of either the greeting text or the
          bell/avatar icons depending on which corner, at exactly the
          tablet widths this fix is for. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin navigation"
        aria-expanded={mobileOpen}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center size-12 rounded-full bg-brand-gradient text-white shadow-lg hover:opacity-90 transition-opacity"
      >
        <Menu className="size-5" />
      </button>

      <aside
        className={
          'hidden lg:flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-border bg-card px-4 py-6 transition-[width] duration-200 ease-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
          (collapsed ? 'w-[76px]' : 'w-[256px]')
        }
      >
        <Link
          href="/"
          title="Back to site"
          className={
            'flex items-center gap-2 px-2 py-2 mb-1 rounded-lg text-[12.5px] font-semibold text-foreground/55 hover:bg-muted hover:text-foreground transition-colors ' +
            (collapsed ? 'justify-center' : '')
          }
        >
          <ArrowLeft className="size-4 shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </Link>

        <div className={'px-1 mb-1 flex items-start ' + (collapsed ? 'flex-col gap-2' : 'justify-between')}>
          <div className={collapsed ? 'w-full flex justify-center' : ''}>
            <Logo variant={collapsed ? 'icon' : 'full'} theme="brand" size={30} />
            {!collapsed && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-brand-blush/40 text-[#8A4A66] px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
            className={
              'flex items-center justify-center size-7 rounded-full text-foreground/50 hover:text-primary hover:bg-muted transition-colors shrink-0 ' +
              (collapsed ? '' : 'mt-1')
            }
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <NavContent pathname={pathname} pendingCount={pendingCount} collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-[280px] max-w-[85vw] h-full overflow-y-auto bg-card px-4 py-6 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between px-1 mb-1">
              <div>
                <Logo variant="full" theme="brand" size={30} />
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-brand-blush/40 text-[#8A4A66] px-2 py-1 rounded-full">
                  Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin navigation"
                className="flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-primary hover:bg-muted transition-colors shrink-0"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg text-[12.5px] font-semibold text-foreground/55 hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span>Back to site</span>
            </Link>

            <NavContent pathname={pathname} pendingCount={pendingCount} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
