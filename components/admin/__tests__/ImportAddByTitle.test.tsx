import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportAddByTitle from '../ImportAddByTitle';

// IMP5-01: covers the "Add by Title" tab's own search-on-submit and
// per-row add flow -- rendering results with the already-exists badge,
// adding a new candidate, the 409-already-exists path, a failed add, the
// no-results state, and the signed-out path. This component owns its own
// search/add state independently of the Import & Sync page, same
// reasoning as ImportHistoryTable's own test file.

// next/image requires a real loader/width-height config that isn't
// meaningful in jsdom -- stub it down to a plain img so result rows with
// a poster render without warnings unrelated to what's under test here.
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

const getSession = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: () => getSession() } },
}));

const session = {
  access_token: 'token-123',
  user: { id: 'admin-1', email: 'admin@blumi.dev' },
};

const sampleResult = {
  tmdbId: 12345,
  title: 'Cherry Magic',
  originalTitle: 'Cherry Maho',
  year: 2023,
  mediaType: 'tv' as const,
  posterUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg',
  overview: 'A 30-year-old virgin gains the power to read minds by touch.',
  alreadyExists: false,
};

function searchResponse(results = [sampleResult]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ message: 'Title search results', query: 'cherry magic', results }),
  };
}

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('ImportAddByTitle', () => {
  it('shows no results panel before a search is submitted', () => {
    render(<ImportAddByTitle />);
    expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry Magic')).not.toBeInTheDocument();
  });

  it('searches on submit and renders a result with its title, year, and media type', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(searchResponse()));

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    expect(await screen.findByText('Cherry Magic')).toBeInTheDocument();
    expect(screen.getByText('Cherry Maho')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  it('shows an "Already in catalog" badge and no Add button for an existing result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(searchResponse([{ ...sampleResult, alreadyExists: true }]))
    );

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    expect(await screen.findByText(/already in catalog/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument();
  });

  it('shows the empty state when a search returns no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(searchResponse([])));

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'asdfghjkl');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    expect(await screen.findByText(/no results/i)).toBeInTheDocument();
  });

  it('adds a candidate and flips the row to "Added" on success', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({ ok: true, status: 201, json: async () => ({ message: 'Queued', id: 99, title: 'Cherry Magic' }) });
      }
      return Promise.resolve(searchResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await screen.findByText('Cherry Magic');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText('Added')).toBeInTheDocument();
    });

    const [, postCall] = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    expect(JSON.parse(postCall.body)).toEqual({ tmdbId: 12345, mediaType: 'tv' });
  });

  it('treats a 409 (already exists) as success rather than an error', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 409, json: async () => ({ message: 'Already exists' }) });
      }
      return Promise.resolve(searchResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await screen.findByText('Cherry Magic');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText('In catalog')).toBeInTheDocument();
    });
    expect(screen.queryByText(/could not add/i)).not.toBeInTheDocument();
  });

  it('shows an inline error next to the row and lets the admin retry on a failed add', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 500, json: async () => ({ message: 'TMDB fetch failed' }) });
      }
      return Promise.resolve(searchResponse());
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    await screen.findByText('Cherry Magic');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(await screen.findByText('TMDB fetch failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows a signed-out error and does not call fetch when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<ImportAddByTitle />);
    await userEvent.type(screen.getByLabelText(/search tmdb by title/i), 'cherry magic');
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }));

    expect(await screen.findByText(/must be signed in/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
