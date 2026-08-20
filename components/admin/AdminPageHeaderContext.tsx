'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface AdminPageHeaderValue {
  title: ReactNode;
  subtitle: ReactNode;
  search: ReactNode;
  // S1-03: page-specific header buttons (e.g. Series & Movies' "Filters"
  // and "+ Add title") -- rendered between `search` and the account pill.
  // Optional/defaults to null so every page that predates this (none of
  // which pass it) keeps rendering exactly as before.
  actions: ReactNode;
}

const EMPTY: AdminPageHeaderValue = { title: null, subtitle: null, search: null, actions: null };

// Two contexts rather than one: pages only ever need the setter (they
// never read the current value, they just publish their own), and
// AdminPageTopBar only ever needs the value (it never sets it). Splitting
// them means a page publishing a new value doesn't also hand it a reason
// to re-render on its own update -- it already re-rendered to produce the
// new value in the first place.
const ValueContext = createContext<AdminPageHeaderValue>(EMPTY);
const SetterContext = createContext<((value: AdminPageHeaderValue) => void) | null>(null);

// Mounted once by AdminShell, wrapping its entire return value -- both the
// top-bar slot that reads the value (AdminPageTopBar, a descendant even
// though it visually sits "above" <main>) and the actual page content
// passed in as `children` (which calls the setter below) are inside this
// same provider, so context can flow to both without threading anything
// through AdminShell's own props.
export function AdminPageHeaderProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AdminPageHeaderValue>(EMPTY);
  return (
    <SetterContext.Provider value={setValue}>
      <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
    </SetterContext.Provider>
  );
}

export function useAdminPageHeaderValue(): AdminPageHeaderValue {
  return useContext(ValueContext);
}

// Called by each admin page (not the dashboard itself, which keeps its
// own AdminHeader) near the top of its render. No dependency array on the
// effect -- deliberately runs after every render rather than only when
// some memoized subset of inputs changes: `search` is typically JSX that
// closes over per-keystroke local state (an <input value onChange>), so
// the only way to keep the top bar's copy in sync while typing is to
// re-publish it every render. This is cheap enough for an admin panel's
// page-navigation frequency; it would be worth memoizing for something
// rendering far more often.
export function useAdminPageHeader({
  title,
  subtitle,
  search,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
}) {
  const setValue = useContext(SetterContext);
  useEffect(() => {
    setValue?.({ title, subtitle: subtitle ?? null, search: search ?? null, actions: actions ?? null });
    // Clear on unmount so a lingering title/search doesn't flash for a
    // moment while navigating to a page that doesn't call this hook (none
    // currently exist among the admin routes, but nothing stops a future
    // one, e.g. a raw redirect page).
    return () => setValue?.(EMPTY);
  });
}
