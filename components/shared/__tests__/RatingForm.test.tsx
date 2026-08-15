import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingForm from '../RatingForm';

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

describe('RatingForm', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    openAuthModal.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: null }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing while the session is still being checked', () => {
    mockSession({ checkingSession: true, user: null, session: null });
    const { container } = render(<RatingForm seriesId={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prompts sign-in when there is no user, and opens the auth modal on click', async () => {
    mockSession({ user: null, session: null });
    render(<RatingForm seriesId={1} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();

    await userEvent.click(signInButton);
    expect(openAuthModal).toHaveBeenCalledWith('login');
  });

  it('disables submit until a score is chosen, then submits successfully', async () => {
    mockSession();
    render(<RatingForm seriesId={42} />);

    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    expect(submitButton).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: '7' }));
    expect(submitButton).not.toBeDisabled();

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Thanks for rating this series!')).toBeInTheDocument();
    });

    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(postCall).toBeTruthy();
    expect(JSON.parse(postCall![1].body)).toEqual({
      series_id: 42,
      score: 7,
      review_text: null,
    });
  });

  it('shows the update confirmation when submitting over an existing rating', async () => {
    mockSession();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { score: 6, review_text: '' } }),
    });

    render(<RatingForm seriesId={1} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update your rating/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: '9' }));
    await userEvent.click(screen.getByRole('button', { name: /update rating/i }));

    await waitFor(() => {
      expect(screen.getByText('Your rating has been updated!')).toBeInTheDocument();
    });
  });

  it('shows an inline error when the submission fails', async () => {
    mockSession();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Score is required.' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ data: null }) });
    });

    render(<RatingForm seriesId={1} />);
    await userEvent.click(screen.getByRole('button', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /submit rating/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Score is required.');
    });
  });

  it('prefills an existing rating and switches to update copy', async () => {
    mockSession();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { score: 9, review_text: 'Loved it' } }),
    });

    render(<RatingForm seriesId={1} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update your rating/i })).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Loved it')).toBeInTheDocument();
  });
});
