import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminShell from '../AdminShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/series',
}));

// AdminShell fetches its own session (for the pending-count badge and
// account email) -- returning no session here keeps that fetch a no-op,
// same minimal-mock approach AdminAccountMenu.test.tsx uses.
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));

const COLLAPSE_STORAGE_KEY = 'admin-sidebar-collapsed';

// Regression test for a hydration mismatch: the sidebar's collapsed width
// used to be read straight out of localStorage via AdminSidebar's own
// useState lazy initializer, which returns different values on the server
// (no window, always false) vs. a client with a saved '1' preference
// (true). That state now lives up in AdminShell (this file), passed down
// to AdminSidebar as a prop -- the toggle button itself lives back inside
// AdminSidebar (bottom of the nav list, matching the public sidebar; see
// AdminSidebar.test.tsx for its own presentational tests), but the
// boolean's source of truth and the localStorage sync both stay here.
// The fix always starts at the server's default (expanded) and syncs the
// real preference in an effect after mount.
describe('AdminShell collapse preference (hydration-safe read)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('applies a saved collapsed preference shortly after mount', async () => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, '1');

    render(<AdminShell>content</AdminShell>);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /dashboard/i }).closest('aside')).toHaveClass('w-[76px]');
    });
  });

  it('stays expanded when nothing is saved', async () => {
    render(<AdminShell>content</AdminShell>);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /dashboard/i }).closest('aside')).toHaveClass('w-[260px]');
    });
  });
});

describe('AdminShell collapse toggle (rendered by AdminSidebar, driven by state owned here)', () => {
  it('collapses and expands the sidebar when the top-bar toggle button is clicked', async () => {
    render(<AdminShell>content</AdminShell>);

    const toggle = screen.getByRole('button', { name: /collapse admin navigation/i });
    const aside = screen.getByRole('link', { name: /dashboard/i }).closest('aside');
    expect(aside).toHaveClass('w-[260px]');

    await userEvent.click(toggle);
    expect(aside).toHaveClass('w-[76px]');
    expect(screen.getByRole('button', { name: /expand admin navigation/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /expand admin navigation/i }));
    expect(aside).toHaveClass('w-[260px]');
  });

  it('persists the preference to localStorage', async () => {
    render(<AdminShell>content</AdminShell>);

    await userEvent.click(screen.getByRole('button', { name: /collapse admin navigation/i }));

    expect(window.localStorage.getItem(COLLAPSE_STORAGE_KEY)).toBe('1');
  });
});
