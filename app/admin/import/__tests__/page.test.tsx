import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminImportPage from '../page';

// IMP3-03: covers the new Run Import / History tab switch on the Import &
// Sync page. ImportHistoryTable itself is stubbed out here (it has its
// own full test file at components/admin/__tests__/ImportHistoryTable.test.tsx)
// so this file only has to prove the switch renders the right thing, not
// re-verify the history tab's own fetch/pagination logic.

// jsdom doesn't implement Element.scrollTo -- the page's log-panel
// autoscroll effect (unrelated to what's under test here) calls it on
// every status update, so it needs a no-op stub or these tests throw.
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = function scrollTo() {};
}

vi.mock('@/components/admin/ImportHistoryTable', () => ({
  default: () => <div data-testid="import-history-stub">history tab content</div>,
}));

const getSession = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: () => getSession() } },
}));

vi.mock('@/lib/AuthModalContext', () => ({
  useAuthModal: () => ({ open: vi.fn(), close: vi.fn() }),
}));
vi.mock('@/components/admin/AdminPageHeaderContext', () => ({
  useAdminPageHeader: () => {},
}));

const session = {
  access_token: 'token-123',
  user: { id: 'admin-1', email: 'admin@blumi.dev' },
};

function mockFetchResponses() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/import/status')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            message: 'Import status',
            running: false,
            startedAt: null,
            finishedAt: null,
            exitCode: null,
            limit: null,
            logTail: [],
            error: null,
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    })
  );
}

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session } });
  mockFetchResponses();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('AdminImportPage tabs (IMP3-03)', () => {
  it('shows the Run Import content by default and not the history stub', async () => {
    render(<AdminImportPage />);

    expect(await screen.findByLabelText(/limit per media type/i)).toBeInTheDocument();
    expect(screen.queryByTestId('import-history-stub')).not.toBeInTheDocument();
  });

  it('switches to the History tab and hides the Run Import content', async () => {
    render(<AdminImportPage />);

    await screen.findByLabelText(/limit per media type/i);
    await userEvent.click(screen.getByRole('tab', { name: /history/i }));

    await waitFor(() => {
      expect(screen.getByTestId('import-history-stub')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/limit per media type/i)).not.toBeInTheDocument();
  });

  it('switches back to Run Import from History', async () => {
    render(<AdminImportPage />);

    await screen.findByLabelText(/limit per media type/i);
    await userEvent.click(screen.getByRole('tab', { name: /history/i }));
    await screen.findByTestId('import-history-stub');

    await userEvent.click(screen.getByRole('tab', { name: /run import/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/limit per media type/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('import-history-stub')).not.toBeInTheDocument();
  });
});
