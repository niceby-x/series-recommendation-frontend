'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Logo from '../shared/Logo';
import { ADMIN_NAV_SECTIONS, ADMIN_DASHBOARD_ITEM, type AdminNavItem } from '../../lib/adminContent';

// Desktop rail can be toggled between the full 260px layout (labels,
// section headers, badge counts) and a 76px icon-only rail -- same
// collapsed width as the public DashboardSidebar's rail, for visual
// consistency between the two, though the interaction itself is
// click-to-toggle rather than hover: an admin working through a long
// session benefits more from a state they set once than a rail that
// snaps back open the instant the mouse leaves it. The toggle itself
// lives at the bottom of the nav list, same spot as the public sidebar's
// own toggle -- see NavContent below.
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

// Each section header is now its own toggle -- clicking it collapses just
// that group's rows, chevron rotates to match. Purely a display grouping
// (state lives here, not persisted) -- collapsing "Community" doesn't
// affect whether its links are reachable, same as the reference this
// mirrors. Ignored entirely in the icon-only rail: with no room for a
// section label there's nothing to click, so every row in the rail always
// renders regardless of a section's expanded/collapsed state elsewhere.
function NavSection({
  section,
  pathname,
  pendingCount,
  collapsed,
  onNavigate,
}: {
  section: (typeof ADMIN_NAV_SECTIONS)[number];
  pathname: string;
  pendingCount: number;
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
              active={!!item.href && pathname.startsWith(item.href)}
              badgeCount={item.badgeKey === 'pending' ? pendingCount : undefined}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
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
// no cross-component state) -- the drawer only ever needs to know about
// itself.
function NavContent({
  pathname,
  pendingCount,
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  pathname: string;
  pendingCount: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
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

      <nav className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.label}
            section={section}
            pathname={pathname}
            pendingCount={pendingCount}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Collapse toggle, pinned to the bottom below the nav list -- same
          spot and styling as the public DashboardSidebar's own toggle
          (moved here from AdminShell's top bar, where it briefly lived
          instead). Only passed by the desktop <aside> below; the mobile
          drawer omits onToggleCollapse entirely, same as the public
          sidebar's drawer -- it's a full overlay opened/closed by its own
          X button, collapsing it isn't a meaningful state there. */}
      {onToggleCollapse && (
        <div className="pt-3 mt-auto border-t border-border/60">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
            aria-label={collapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
            className={
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors text-foreground/70 hover:bg-muted hover:text-foreground ' +
              (collapsed ? 'justify-center' : '')
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5 shrink-0" />
            ) : (
              <PanelLeftClose className="size-4.5 shrink-0" />
            )}
            {!collapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>
        </div>
      )}
    </>
  );
}

export default function AdminSidebar({
  pendingCount,
  collapsed,
  onToggleCollapse,
}: {
  pendingCount: number;
  // The boolean itself is still owned by AdminShell (single source of
  // truth for both this width and the toggle button that flips it, which
  // now lives inside this component again -- see onToggleCollapse below).
  // This component just renders at the matching width and passes it down
  // to NavContent for the icon-only layout; it doesn't read localStorage
  // or persist a preference itself.
  collapsed: boolean;
  // Desktop-only: the mobile drawer's own NavContent call below doesn't
  // receive this, since collapsing a full-screen overlay isn't a
  // meaningful state.
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

      {/* h-full + no sticky positioning -- this now lives inside
          AdminShell's bounded, rounded flex row rather than being the
          page's own top-level layout driver, so it just fills its
          parent's height and scrolls its own nav region (see NavContent's
          own overflow-y-auto) instead of the whole viewport. */}
      <aside
        className={
          'hidden lg:flex flex-col shrink-0 h-full border-r border-border bg-card px-4 py-5 transition-[width] duration-200 ease-out ' +
          (collapsed ? 'w-[76px]' : 'w-[260px]')
        }
      >
        {/* "Back to site" used to be its own link here (and again in the
            mobile drawer below) -- moved into AdminAccountMenu's dropdown
            instead, since it's an account-level action like Log out, not
            a nav destination, and belongs next to that rather than
            competing with the real nav items for space up top. The
            account menu is always visible (it's in AdminShell's top bar,
            not gated behind lg:flex like this rail), so it's still
            reachable at every viewport width. */}
        <div className={collapsed ? 'px-1 mb-1 w-full flex justify-center' : 'px-1 mb-1'}>
          <Logo variant={collapsed ? 'icon' : 'full'} theme="brand" size={30} />
          {!collapsed && (
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-brand-blush/40 text-[#8A4A66] px-2 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>

        <NavContent
          pathname={pathname}
          pendingCount={pendingCount}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-[280px] max-w-[85vw] h-full bg-card px-4 py-6 shadow-xl">
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

            <NavContent
              pathname={pathname}
              pendingCount={pendingCount}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
