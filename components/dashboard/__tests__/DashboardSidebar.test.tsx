import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardSidebar from '../DashboardSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// DashboardSidebar no longer owns collapse state or reads localStorage
// itself -- that lives up in DashboardShell (see DashboardShell.tsx and
// its own test file). This component is purely presentational about the
// value: it renders at the width matching whatever `collapsed` prop it's
// given, and calls onToggleCollapse when its own pinned bottom toggle
// button is clicked. Settings lives here too, as a regular row in My
// Library alongside Watchlist/Favorites/etc. -- it briefly lived in
// DashboardHeader's account dropdown instead, moved back.
describe('DashboardSidebar (presentational collapse width)', () => {
  it('renders at the collapsed width when passed collapsed', () => {
    render(<DashboardSidebar collapsed={true} onToggleCollapse={vi.fn()} />);

    expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[76px]');
  });

  it('renders at the expanded width when passed collapsed=false', () => {
    render(<DashboardSidebar collapsed={false} onToggleCollapse={vi.fn()} />);

    expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[260px]');
  });

  it('calls onToggleCollapse when the pinned bottom toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();
    render(<DashboardSidebar collapsed={false} onToggleCollapse={onToggleCollapse} />);

    await user.click(screen.getByRole('button', { name: /collapse navigation/i }));

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('renders a Settings link in the My Library section, alongside the other nav icons', () => {
    render(<DashboardSidebar collapsed={false} onToggleCollapse={vi.fn()} />);

    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });
});
