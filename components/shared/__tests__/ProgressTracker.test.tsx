import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressTracker from '../ProgressTracker';

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

describe('ProgressTracker', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    openAuthModal.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ progress: null }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing while the session is still being checked', () => {
    mockSession({ checkingSession: true, user: null, session: null });
    const { container } = render(<ProgressTracker seriesId={1} episodeCount={12} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prompts sign-in when there is no user', async () => {
    mockSession({ user: null, session: null });
    render(<ProgressTracker seriesId={1} episodeCount={12} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(signInButton);
    expect(openAuthModal).toHaveBeenCalledWith('login');
  });

  it('rejects an invalid episode number before submitting', async () => {
    mockSession();
    render(<ProgressTracker seriesId={1} episodeCount={12} />);

    const episodeInput = screen.getByLabelText(/current episode/i);
    await userEvent.type(episodeInput, '0');
    await userEvent.click(screen.getByRole('button', { name: /save progress/i }));

    expect(
      await screen.findByText('Enter a valid episode number (1 or higher).')
    ).toBeInTheDocument();

    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('saves valid progress and shows the confirmation', async () => {
    mockSession();
    render(<ProgressTracker seriesId={1} episodeCount={12} />);

    await userEvent.type(screen.getByLabelText(/current episode/i), '5');
    await userEvent.type(screen.getByLabelText(/minutes left/i), '10');
    await userEvent.click(screen.getByRole('button', { name: /save progress/i }));

    await waitFor(() => {
      expect(screen.getByText('Progress saved!')).toBeInTheDocument();
    });

    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(putCall).toBeTruthy();
    expect(JSON.parse(putCall![1].body)).toEqual({
      current_episode: 5,
      minutes_remaining: 10,
    });
  });

  it('prefills existing progress and switches to update copy', async () => {
    mockSession();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ progress: { current_episode: 3, minutes_remaining: null } }),
    });

    render(<ProgressTracker seriesId={1} episodeCount={12} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update your progress/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/current episode/i)).toHaveValue(3);
  });
});
