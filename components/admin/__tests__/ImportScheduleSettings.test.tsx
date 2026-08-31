import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportScheduleSettings from '../ImportScheduleSettings';

// IMP4-01: covers the Schedule tab's own fetch/save/auth -- loading the
// current config, rendering enabled/runHourUtc/keyword/limitPerType,
// saving with the values as entered (including converting a blank
// keyword/limit to null rather than an empty string/NaN), the signed-out
// and load-error paths, and a save-time validation error surfaced from
// the backend. Self-contained the same way ImportHistoryTable is, so it
// gets its own test file rather than being covered through the page.

const getSession = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: () => getSession() } },
}));

const session = {
  access_token: 'token-123',
  user: { id: 'admin-1', email: 'admin@blumi.dev' },
};

function scheduleResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      message: 'Import schedule',
      data: {
        enabled: false,
        runHourUtc: 3,
        keyword: null,
        limitPerType: null,
        lastTriggeredAt: null,
        updatedAt: '2026-08-19T00:00:00.000Z',
        missedLastScheduled: false,
        ...overrides,
      },
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

describe('ImportScheduleSettings', () => {
  it('loads and renders the current config', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        scheduleResponse({ enabled: true, runHourUtc: 6, keyword: 'boys love', limitPerType: 250 })
      )
    );

    render(<ImportScheduleSettings />);

    expect(await screen.findByLabelText(/enabled/i)).toBeChecked();
    expect(screen.getByLabelText(/run time/i)).toHaveValue('6');
    expect(screen.getByLabelText(/discovery keyword/i)).toHaveValue('boys love');
    expect(screen.getByLabelText(/limit per media type/i)).toHaveValue(250);
  });

  it('shows "Never triggered yet" when lastTriggeredAt is null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(scheduleResponse()));

    render(<ImportScheduleSettings />);

    expect(await screen.findByText(/never triggered yet/i)).toBeInTheDocument();
  });

  it('shows the last triggered time when set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(scheduleResponse({ lastTriggeredAt: '2026-08-20T03:00:00.000Z' }))
    );

    render(<ImportScheduleSettings />);

    expect(await screen.findByText(/last triggered/i)).toBeInTheDocument();
  });

  // IMP7-02
  it('shows a missed-run warning when the backend reports missedLastScheduled: true', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        scheduleResponse({ enabled: true, lastTriggeredAt: '2026-08-20T03:00:00.000Z', missedLastScheduled: true })
      )
    );

    render(<ImportScheduleSettings />);

    expect(await screen.findByText(/missed/i)).toBeInTheDocument();
  });

  // IMP7-02
  it('does not show a missed-run warning when missedLastScheduled is false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        scheduleResponse({ enabled: true, lastTriggeredAt: '2026-08-20T03:00:00.000Z', missedLastScheduled: false })
      )
    );

    render(<ImportScheduleSettings />);
    await screen.findByText(/last triggered/i);

    expect(screen.queryByText(/missed/i)).not.toBeInTheDocument();
  });

  it('shows a sign-in error instead of fetching when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    vi.stubGlobal('fetch', vi.fn());

    render(<ImportScheduleSettings />);

    expect(await screen.findByText(/you must be signed in/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a load error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    render(<ImportScheduleSettings />);

    expect(await screen.findByText(/could not load the import schedule/i)).toBeInTheDocument();
  });

  it('saves enabled/runHourUtc/keyword/limitPerType as entered', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve(
          scheduleResponse({ enabled: true, runHourUtc: 9, keyword: 'thai bl', limitPerType: 300 })
        );
      }
      return Promise.resolve(scheduleResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportScheduleSettings />);
    await screen.findByLabelText(/enabled/i);

    await userEvent.click(screen.getByLabelText(/enabled/i));
    await userEvent.selectOptions(screen.getByLabelText(/run time/i), '9');
    await userEvent.type(screen.getByLabelText(/discovery keyword/i), 'thai bl');
    await userEvent.type(screen.getByLabelText(/limit per media type/i), '300');
    await userEvent.click(screen.getByRole('button', { name: /save schedule/i }));

    await waitFor(() => {
      expect(screen.getByText(/schedule saved/i)).toBeInTheDocument();
    });

    const putCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'PUT');
    expect(putCall).toBeTruthy();
    const body = JSON.parse((putCall![1] as RequestInit).body as string);
    expect(body).toEqual({ enabled: true, runHourUtc: 9, keyword: 'thai bl', limitPerType: 300 });
  });

  it('sends null for keyword and limitPerType when both are left blank', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'PUT') return Promise.resolve(scheduleResponse());
      return Promise.resolve(scheduleResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportScheduleSettings />);
    await screen.findByLabelText(/enabled/i);
    await userEvent.click(screen.getByRole('button', { name: /save schedule/i }));

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });

    const putCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'PUT');
    const body = JSON.parse((putCall![1] as RequestInit).body as string);
    expect(body.keyword).toBeNull();
    expect(body.limitPerType).toBeNull();
  });

  it('surfaces a validation error message from the backend on save failure', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ message: 'runHourUtc must be an integer between 0 and 23.' }),
        });
      }
      return Promise.resolve(scheduleResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportScheduleSettings />);
    await screen.findByLabelText(/enabled/i);
    await userEvent.click(screen.getByRole('button', { name: /save schedule/i }));

    expect(await screen.findByText(/runHourUtc must be an integer between 0 and 23\./i)).toBeInTheDocument();
  });
});
