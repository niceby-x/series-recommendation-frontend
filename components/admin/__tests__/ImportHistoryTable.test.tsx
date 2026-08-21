import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportHistoryTable from '../ImportHistoryTable';

// IMP3-03: covers the run history tab's own fetch/auth/pagination --
// loading, the empty state, rendering rows with status/dry-run/queued
// info, "Load more" appending the next page, and the signed-out/error
// paths. This component owns its data fetching independently of the
// Import & Sync page (see that page's own header comment on why), so it
// gets its own test file rather than being covered through the page.

const getSession = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: () => getSession() } },
}));

const session = {
  access_token: 'token-123',
  user: { id: 'admin-1', email: 'admin@blumi.dev' },
};

function page1Response(overrides: Partial<{ data: unknown[]; pagination: unknown }> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      message: 'Import run history',
      data: overrides.data ?? [
        {
          id: 2,
          status: 'success',
          startedAt: '2026-08-20T10:00:00.000Z',
          finishedAt: '2026-08-20T10:05:30.000Z',
          exitCode: 0,
          limit: 150,
          keyword: "boys' love (bl)",
          dryRun: false,
          summary: { added: 12, mediaTypeTally: { tv: 8, movie: 4 }, countryTally: { Thailand: 9 } },
        },
      ],
      pagination: overrides.pagination ?? { page: 1, limit: 20, total: 1, has_more: false },
    }),
  };
}

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('ImportHistoryTable', () => {
  it('renders a row with its status, keyword, limit, and queued count once loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(page1Response()));

    render(<ImportHistoryTable />);

    expect(await screen.findByText('Success')).toBeInTheDocument();
    expect(screen.getByText("boys' love (bl)")).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows a "Dry run" pill alongside the real status, not instead of it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        page1Response({
          data: [
            {
              id: 3,
              status: 'error',
              startedAt: '2026-08-20T10:00:00.000Z',
              finishedAt: '2026-08-20T10:01:00.000Z',
              exitCode: 1,
              limit: 50,
              keyword: 'test keyword',
              dryRun: true,
              summary: null,
            },
          ],
        })
      )
    );

    render(<ImportHistoryTable />);

    // Both the real outcome (Error) and the dry-run pill should be
    // visible -- a failed dry run must not be indistinguishable from a
    // successful one, or from a real run that also happened to error.
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText('Dry run')).toBeInTheDocument();
  });

  it('shows the empty state when there are no runs yet', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(page1Response({ data: [], pagination: { page: 1, limit: 20, total: 0, has_more: false } })));

    render(<ImportHistoryTable />);

    expect(await screen.findByText(/no import runs yet/i)).toBeInTheDocument();
  });

  it('shows an inline error and no crash when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    render(<ImportHistoryTable />);

    expect(await screen.findByText(/could not load import history/i)).toBeInTheDocument();
  });

  it('shows a signed-out message rather than fetching when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportHistoryTable />);

    expect(await screen.findByText(/must be signed in/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads the next page and appends it when "Load more" is clicked', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('page=2')) {
        return Promise.resolve(
          page1Response({
            data: [
              {
                id: 1,
                status: 'error',
                startedAt: '2026-08-19T10:00:00.000Z',
                finishedAt: '2026-08-19T10:01:00.000Z',
                exitCode: 1,
                limit: 150,
                keyword: "boys' love (bl)",
                dryRun: false,
                summary: null,
              },
            ],
            pagination: { page: 2, limit: 20, total: 2, has_more: false },
          })
        );
      }
      return Promise.resolve(
        page1Response({ pagination: { page: 1, limit: 20, total: 2, has_more: true } })
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportHistoryTable />);

    expect(await screen.findByText('Success')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    // Both rows present now -- the second page appended, not replaced.
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
