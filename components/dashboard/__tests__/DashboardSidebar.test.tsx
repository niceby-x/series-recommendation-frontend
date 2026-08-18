import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardSidebar from '../DashboardSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const COLLAPSE_STORAGE_KEY = 'dashboard-sidebar-collapsed';

// Regression test for a hydration mismatch: the sidebar's collapsed width
// used to be read straight out of localStorage via useState's lazy
// initializer, which returns different values on the server (no window,
// always false) vs. a client with a saved '1' preference (true) -- same
// class of bug the Next.js hydration error screen flags for any
// server/client branch. The fix always starts at the server's default
// (expanded) and syncs the real preference in an effect after mount.
//
// Note: React Testing Library's render() flushes effects synchronously
// (it wraps mount in act()), so there's no way to observe the pre-effect
// "first paint" state here the way a real hydration would show it for a
// split second -- these two assert the effect actually applies the saved
// preference (rather than never reading it at all), which is what the fix
// changes; the "server and client agree on the very first render" half of
// the fix is a static property of the code (both start from the same
// literal `false`), not something this test harness can observe directly.
describe('DashboardSidebar collapse preference (hydration-safe read)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('applies a saved collapsed preference shortly after mount', async () => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, '1');

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[76px]');
    });
  });

  it('stays expanded when nothing is saved', async () => {
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[260px]');
    });
  });
});
