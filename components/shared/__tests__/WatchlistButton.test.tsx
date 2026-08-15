import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WatchlistButton from '../WatchlistButton';

const openAuthModal = vi.fn();
const useSessionMock = vi.fn();

vi.mock('@/lib/AuthModalContext', () => ({
  useAuthModal: () => ({ open: openAuthModal }),
}));

vi.mock('@/lib/SessionContext', () => ({
  useSession: () => useSessionMock(),
}));

function mockSession(overrides: Partial<ReturnType<typeof useSessionMock>> = {}) {
  useSessionMock.mockReturnValue({
    user: { id: 'user-1' },
    session: { access_token: 'token-123' },
    checkingSession: false,
    ...overrides,
  });
}

describe('WatchlistButton', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    openAuthModal.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing while checking the session or loading status', () => {
    mockSession({ checkingSession: true, user: null, session: null });
    const { container } = render(<WatchlistButton seriesId={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prompts sign-in when there is no user', async () => {
    mockSession({ user: null, session: null });
    render(<WatchlistButton seriesId={1} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(signInButton);
    expect(openAuthModal).toHaveBeenCalledWith('login');
  });

  it('sets a status and reflects the server response', async () => {
    mockSession();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { status: 'watching' } }),
          });
        }
        // Initial GET /watchlist/:seriesId status fetch (no method set -- GET).
        return Promise.resolve({ ok: true, json: async () => ({ status: null }) });
      })
    );

    render(<WatchlistButton seriesId={7} />);

    const addButton = await screen.findByRole('button', { name: '+ Add to List' });
    await userEvent.click(addButton);

    const watchingOption = await screen.findByRole('menuitem', { name: 'Watching' });
    await userEvent.click(watchingOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Watching' })).toBeInTheDocument();
    });
  });

  it('removes an existing status via the Remove option', async () => {
    mockSession();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === 'DELETE') {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        // Initial GET /watchlist/:seriesId status fetch (no method set -- GET).
        return Promise.resolve({ ok: true, json: async () => ({ status: 'completed' }) });
      })
    );

    render(<WatchlistButton seriesId={7} />);

    const statusButton = await screen.findByRole('button', { name: 'Completed' });
    await userEvent.click(statusButton);

    const removeOption = await screen.findByRole('menuitem', { name: /remove from list/i });
    await userEvent.click(removeOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+ Add to List' })).toBeInTheDocument();
    });
  });

  it('shows an inline error when the status update fails', async () => {
    mockSession();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Could not update watchlist.' }),
          });
        }
        // Initial GET /watchlist/:seriesId status fetch (no method set -- GET).
        return Promise.resolve({ ok: true, json: async () => ({ status: null }) });
      })
    );

    render(<WatchlistButton seriesId={7} />);

    const addButton = await screen.findByRole('button', { name: '+ Add to List' });
    await userEvent.click(addButton);
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Plan to Watch' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Could not update watchlist.');
    });
  });
});
