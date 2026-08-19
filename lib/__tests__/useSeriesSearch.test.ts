import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useSeriesSearch } from '../useSeriesSearch';

function mockSeriesFetch(data: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/series?q=')) {
        return Promise.resolve({ ok: true, json: async () => ({ data }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    })
  );
}

describe('useSeriesSearch (shared debounced search, used by AdminHeader/DashboardHeader/Navbar)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch below the minimum query length', async () => {
    mockSeriesFetch([{ id: 1, title: 'Semantic Error', year: 2022, poster_url: null }]);
    const { result } = renderHook(() => useSeriesSearch());

    act(() => {
      result.current.setQuery('a');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('debounces and fetches once the query reaches the minimum length', async () => {
    mockSeriesFetch([{ id: 1, title: 'Semantic Error', year: 2022, poster_url: null }]);
    const { result } = renderHook(() => useSeriesSearch());

    act(() => {
      result.current.setQuery('se');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.results).toEqual([{ id: 1, title: 'Semantic Error', year: 2022, poster_url: null }]);
    });
    expect(result.current.loading).toBe(false);

    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/series?q=se');
  });

  it('clears results immediately when the query drops back below the minimum length', async () => {
    mockSeriesFetch([{ id: 1, title: 'Semantic Error', year: 2022, poster_url: null }]);
    const { result } = renderHook(() => useSeriesSearch());

    act(() => {
      result.current.setQuery('se');
    });
    await waitFor(() => {
      expect(result.current.results.length).toBe(1);
    });

    act(() => {
      result.current.setQuery('s');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('reset clears the query, results, and loading state', async () => {
    mockSeriesFetch([{ id: 1, title: 'Semantic Error', year: 2022, poster_url: null }]);
    const { result } = renderHook(() => useSeriesSearch());

    act(() => {
      result.current.setQuery('se');
    });
    await waitFor(() => {
      expect(result.current.results.length).toBe(1);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
