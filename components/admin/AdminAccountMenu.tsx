'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// D-series follow-up: there used to be two separate "who's signed in"
// avatars -- a static, non-interactive one in AdminHeader (dashboard-only,
// no dropdown) and a functional one with a Signed-in-as/Log-out dropdown
// tucked into the sidebar footer (previously AdminSidebar's UserFooter,
// only reachable via the sidebar/mobile drawer). Unified into this single
// component, mounted once in AdminShell so every admin page -- not just
// the dashboard -- gets the same control in the same place, and there's
// only one identity/logout affordance instead of two.
export default function AdminAccountMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = email ? email.split('@')[0] : 'Admin';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const initial = capitalizedName.charAt(0).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gradient text-white text-sm font-semibold font-heading shrink-0">
          {initial}
        </span>
        <span className="hidden sm:block text-left">
          <span className="block text-[13.5px] font-semibold text-foreground leading-tight">{capitalizedName}</span>
          <span className="block text-[11.5px] text-muted-foreground leading-tight">Admin</span>
        </span>
        <ChevronDown className="size-3.5 text-foreground/60 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="px-3.5 py-3 border-b border-border">
            <p className="text-[11px] text-muted-foreground">Signed in as</p>
            <p className="text-[13px] font-medium text-popover-foreground truncate">{email ?? 'Not signed in'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
