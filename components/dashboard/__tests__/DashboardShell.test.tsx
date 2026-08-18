import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardShell from '../DashboardShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const COLLAPSE_STORAGE_KEY = 'dashboard-sidebar-collapsed';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

// Regression test for a hydration mismatch: the sidebar's collapsed width
// used to be read straight out of localStorage via DashboardSidebar's own
// useState lazy initializer, which returns different values on the server
// (no window, always false) vs. a client with a saved '1' preference
// (true). That state lives up in DashboardShell -- see DashboardShell.tsx
// -- and is passed down as the `collapsed` prop, with the toggle button
// itself now rendered inside DashboardSidebar's own pinned bottom slot
// (the one Settings used to occupy). The fix always starts at the
// server's default (expanded) and syncs the real preference in an effect
// after mount.
describe('DashboardShell collapse preference (hydration-safe read)', () => {
  it('applies a saved collapsed preference shortly after mount', async () => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, '1');

    render(<DashboardShell header={<div>Header</div>}>content</DashboardShell>);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[76px]');
    });
  });

  it('stays expanded when nothing is saved', async () => {
    render(<DashboardShell header={<div>Header</div>}>content</DashboardShell>);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[260px]');
    });
  });
});

describe('DashboardShell collapse toggle (pinned bottom slot in DashboardSidebar)', () => {
  it('collapses and expands the sidebar when the pinned toggle button is clicked', async () => {
    render(<DashboardShell header={<div>Header</div>}>content</DashboardShell>);

    const toggle = screen.getByRole('button', { name: /collapse navigation/i });
    const aside = screen.getByRole('link', { name: /home/i }).closest('aside');
    expect(aside).toHaveClass('w-[260px]');

    await userEvent.click(toggle);
    expect(aside).toHaveClass('w-[76px]');
    expect(screen.getByRole('button', { name: /expand navigation/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /expand navigation/i }));
    expect(aside).toHaveClass('w-[260px]');
  });

  it('persists the preference to localStorage', async () => {
    render(<DashboardShell header={<div>Header</div>}>content</DashboardShell>);

    await userEvent.click(screen.getByRole('button', { name: /collapse navigation/i }));

    expect(window.localStorage.getItem(COLLAPSE_STORAGE_KEY)).toBe('1');
  });

  it('still renders the toggle button when no header is passed -- it lives in the sidebar, not the top bar', () => {
    render(<DashboardShell>content</DashboardShell>);

    expect(screen.getByRole('button', { name: /collapse navigation/i })).toBeInTheDocument();
  });
});
