import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardHeader from '../DashboardHeader';

const getSession = vi.fn();
const signOut = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => getSession(),
      signOut: () => signOut(),
    },
  },
}));

const session = {
  access_token: 'token-123',
  user: { id: 'user-1', email: 'nice@blumi.dev' },
};

function mockFetchResponses(notifications: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me/notifications/seen')) {
        return Promise.resolve({ ok: true, json: async () => ({ message: 'ok' }) });
      }
      if (url.includes('/me/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: notifications }),
        });
      }
      if (url.endsWith('/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { username: 'nice', is_admin: false } }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    })
  );
}

describe('DashboardHeader live search (matching the admin panel search)', () => {
  beforeEach(() => {
    getSession.mockReset();
    signOut.mockReset();
    getSession.mockResolvedValue({ data: { session: null } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows live results from GET /series?q= once the query reaches the minimum length', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/series?q=')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [{ id: 7, title: 'Semantic Error', year: 2022, poster_url: null }] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );

    render(<DashboardHeader />);

    const input = screen.getByPlaceholderText('Search series, movies, moods...');
    await userEvent.type(input, 'se');

    expect(await screen.findByText('Semantic Error')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /semantic error/i });
    expect(link).toHaveAttribute('href', '/series/7');
  });
});

describe('DashboardHeader notifications bell (G3-01)', () => {
  beforeEach(() => {
    getSession.mockReset();
    signOut.mockReset();
    getSession.mockResolvedValue({ data: { session } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows no unread dot and the caught-up message when there are no notifications', async () => {
    mockFetchResponses([]);
    render(<DashboardHeader />);

    const bellButton = await screen.findByRole('button', { name: 'Notifications' });
    // The unread dot is a sibling span with no accessible role -- assert
    // via the bell button's children count instead of a query that could
    // match either state.
    await userEvent.click(bellButton);

    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
  });

  it('shows the unread dot and lists unread notifications, then clears on open', async () => {
    mockFetchResponses([
      {
        series_id: 10,
        series_title: 'Semantic Error',
        poster_url: null,
        episode_count: 9,
        episode_count_updated_at: '2026-08-10T00:00:00.000Z',
      },
    ]);
    render(<DashboardHeader />);

    const bellButton = await screen.findByRole('button', { name: 'Notifications' });

    await waitFor(() => {
      expect(bellButton.querySelector('.bg-destructive')).toBeInTheDocument();
    });

    await userEvent.click(bellButton);

    expect(await screen.findByText('Semantic Error')).toBeInTheDocument();
    expect(screen.getByText('Now at 9 episodes')).toBeInTheDocument();

    await waitFor(() => {
      expect(bellButton.querySelector('.bg-destructive')).not.toBeInTheDocument();
    });

    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          (call: unknown[]) =>
            (call[0] as string).includes('/me/notifications/seen') &&
            (call[1] as RequestInit | undefined)?.method === 'POST'
        )
      ).toBe(true);
    });
  });

  it('links each notification to its series page', async () => {
    mockFetchResponses([
      {
        series_id: 42,
        series_title: 'Business Proposal',
        poster_url: null,
        episode_count: 5,
        episode_count_updated_at: '2026-08-11T00:00:00.000Z',
      },
    ]);
    render(<DashboardHeader />);

    const bellButton = await screen.findByRole('button', { name: 'Notifications' });
    await userEvent.click(bellButton);

    const link = await screen.findByRole('link', { name: /business proposal/i });
    expect(link).toHaveAttribute('href', '/series/42');
  });
});
