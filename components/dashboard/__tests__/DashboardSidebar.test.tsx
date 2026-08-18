import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardSidebar from '../DashboardSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// DashboardSidebar no longer owns collapse state or reads localStorage
// itself -- that moved up into DashboardShell (see DashboardShell.tsx and
// its own test file), since the toggle button that flips it now lives in
// the top bar rather than inside this sidebar's own header row. This
// component is purely presentational about the value now: it just renders
// at the width matching whatever `collapsed` prop it's given.
describe('DashboardSidebar (presentational collapse width)', () => {
  it('renders at the collapsed width when passed collapsed', () => {
    render(<DashboardSidebar collapsed={true} />);

    expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[76px]');
  });

  it('renders at the expanded width when passed collapsed=false', () => {
    render(<DashboardSidebar collapsed={false} />);

    expect(screen.getByRole('link', { name: /home/i }).closest('aside')).toHaveClass('w-[260px]');
  });
});
