import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSidebar from '../AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

// AdminSidebar no longer owns the account menu / Log out control -- that
// moved to AdminAccountMenu (mounted once in AdminShell for every admin
// page), so there's no supabase dependency here to mock anymore.

describe('AdminSidebar mobile navigation (D1-01)', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders a mobile menu trigger that opens a drawer with the same nav items as the desktop sidebar', async () => {
    render(<AdminSidebar pendingCount={3} />);

    // Not open yet -- only the desktop aside's nav items exist, and the
    // drawer's close button shouldn't be in the document.
    expect(screen.queryByRole('button', { name: /close admin navigation/i })).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /open admin navigation/i });
    await userEvent.click(trigger);

    expect(await screen.findByRole('button', { name: /close admin navigation/i })).toBeInTheDocument();
    // Editorial Queue is a real destination (see lib/adminContent.ts) --
    // should now appear twice: once in the always-rendered desktop aside,
    // once in the newly-opened drawer.
    expect(screen.getAllByRole('link', { name: /editorial queue/i }).length).toBeGreaterThanOrEqual(2);
  });

  it('locks body scroll while open and restores it on close', async () => {
    render(<AdminSidebar pendingCount={0} />);

    expect(document.body.style.overflow).toBe('');

    await userEvent.click(screen.getByRole('button', { name: /open admin navigation/i }));
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    await userEvent.click(screen.getByRole('button', { name: /close admin navigation/i }));
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('closes when a nav link inside the drawer is clicked', async () => {
    render(<AdminSidebar pendingCount={0} />);

    await userEvent.click(screen.getByRole('button', { name: /open admin navigation/i }));
    const drawerCloseButton = await screen.findByRole('button', { name: /close admin navigation/i });
    expect(drawerCloseButton).toBeInTheDocument();

    const drawerLinks = screen.getAllByRole('link', { name: /editorial queue/i });
    // The second match is the drawer's copy (desktop aside renders first
    // in the DOM, drawer renders after it).
    await userEvent.click(drawerLinks[drawerLinks.length - 1]);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close admin navigation/i })).not.toBeInTheDocument();
    });
  });

  it('closes on Escape', async () => {
    render(<AdminSidebar pendingCount={0} />);

    await userEvent.click(screen.getByRole('button', { name: /open admin navigation/i }));
    expect(await screen.findByRole('button', { name: /close admin navigation/i })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close admin navigation/i })).not.toBeInTheDocument();
    });
  });

  it('closes when the backdrop is clicked', async () => {
    const { container } = render(<AdminSidebar pendingCount={0} />);

    await userEvent.click(screen.getByRole('button', { name: /open admin navigation/i }));
    expect(await screen.findByRole('button', { name: /close admin navigation/i })).toBeInTheDocument();

    const backdrop = container.querySelector('[aria-hidden="true"].absolute.inset-0');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop as Element);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close admin navigation/i })).not.toBeInTheDocument();
    });
  });

  it('shows the pending-count badge on the same nav item in both the desktop aside and the drawer', async () => {
    render(<AdminSidebar pendingCount={7} />);

    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);

    await userEvent.click(screen.getByRole('button', { name: /open admin navigation/i }));

    await waitFor(() => {
      expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(2);
    });
  });
});
