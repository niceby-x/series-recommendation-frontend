'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FlowerIcon from '../shared/FlowerIcon';
import Logo from '../shared/Logo';
import { ADMIN_NAV_SECTIONS, ADMIN_DASHBOARD_ITEM, type AdminNavItem } from '../../lib/adminContent';

// Unlike DashboardSidebar (hover-collapse rail for the public app), the
// admin panel sidebar stays permanently expanded -- matches the reference
// mockup and gives room for the section labels/badges an admin actually
// scans, not just icons.
function NavRow({ item, active, badgeCount }: { item: AdminNavItem; active: boolean; badgeCount?: number }) {
  const Icon = item.icon;

  // href: null means the screen doesn't exist yet (see lib/adminContent.ts)
  // -- rendered as a disabled row with a "Soon" pill rather than a link
  // that goes nowhere real, same honest-placeholder convention used
  // elsewhere in the app (DashboardSidebar, MoodFilterChips' empty state).
  if (!item.href) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/35 cursor-default select-none">
        <Icon className="size-4 shrink-0" />
        <span className="text-[13.5px] font-medium flex-1">{item.label}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ' +
        (active ? 'bg-brand-gradient text-white shadow-sm' : 'text-foreground/70 hover:bg-muted hover:text-foreground')
      }
    >
      <Icon className="size-4 shrink-0" />
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
    </Link>
  );
}

export default function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[256px] shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-border bg-card px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="px-1 mb-1">
        <Logo variant="full" theme="brand" size={30} />
        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide bg-brand-blush/40 text-[#8A4A66] px-2 py-1 rounded-full">
          Admin
        </span>
      </div>

      <div className="mt-5 mb-2">
        <NavRow item={ADMIN_DASHBOARD_ITEM} active={pathname === '/admin'} />
      </div>

      <nav className="flex flex-col gap-5">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.label}
                  item={item}
                  active={!!item.href && pathname.startsWith(item.href)}
                  badgeCount={item.badgeKey === 'pending' ? pendingCount : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-blush/30 to-brand-lilac/25 border border-border/60 p-4">
          <FlowerIcon className="size-5 text-primary mb-2" />
          <p className="text-[13px] font-semibold text-foreground leading-snug">BLumi is built with love for stories.</p>
          <p className="text-[12px] text-muted-foreground mt-1 leading-snug">Keep curating beautiful BL stories.</p>
        </div>
      </div>
    </aside>
  );
}
