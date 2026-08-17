import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminAccountMenu from '../AdminAccountMenu';

const signOut = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: () => signOut(),
    },
  },
}));

describe('AdminAccountMenu (unified account control)', () => {
  beforeEach(() => {
    signOut.mockReset();
    signOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the avatar initial and name derived from the signed-in email, closed by default', () => {
    render(<AdminAccountMenu email="nice@blumi.dev" />);

    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('Nice')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText(/signed in as/i)).not.toBeInTheDocument();
  });

  it('falls back to a generic label when there is no email yet', () => {
    render(<AdminAccountMenu email={null} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getAllByText('Admin').length).toBe(2);
  });

  it('opens a dropdown with the signed-in email and a working Log out action on click', async () => {
    render(<AdminAccountMenu email="nice@blumi.dev" />);

    await userEvent.click(screen.getByRole('button', { name: /nice/i }));

    expect(await screen.findByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByText('nice@blumi.dev')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /log out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('closes the dropdown on an outside click', async () => {
    render(
      <div>
        <AdminAccountMenu email="nice@blumi.dev" />
        <button type="button">outside</button>
      </div>
    );

    await userEvent.click(screen.getByRole('button', { name: /nice/i }));
    expect(await screen.findByText(/signed in as/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'outside' }));

    await waitFor(() => {
      expect(screen.queryByText(/signed in as/i)).not.toBeInTheDocument();
    });
  });
});
