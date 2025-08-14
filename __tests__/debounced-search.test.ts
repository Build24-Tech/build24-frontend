import { useDebouncedSearch, useSearchSuggestions, useTheorySearch } from '@/hooks/use-debounced-search';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce search queries', async () => {
    const mockSearchFunction = jest.fn().mockResolvedValue([
      { id: '1', title: 'Test Result' }
    ]);

    const { result } = renderHook(() =>
      useDebouncedSearch(mockSearchFunction, { delay: 300 })
    );

    const [, search] = result.current;

    // Trigger multiple searches quickly
    act(() => {
      search('test');
      search('test query');
      search('test query final');
    });

    // Should not have called the search function yet
    expect(mockSearchFunction).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockSearchFunction).toHaveBeenCalledTimes(1);
      expect(mockSearchFunction).toHaveBeenCalledWith('test query final');
    });
  });

  it('should respect minimum query length', () => {
    const mockSearchFunction = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() =>
      useDebouncedSearch(mockSearchFunction, { minLength: 3 })
    );

    const [searchResult, search] = result.current;

    act(() => {
      search('ab'); // Too short
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockSearchFunction).not.toHaveBeenCalled();
    expect(searchResult.results).toEqual([]);
    expect(searchResult.isLoading).toBe(false);
  });

  it('should limit results to maxResults', async () => {
    const mockResults = Array.from({ length: 100 }, (_, i) => ({
      id: i.toString(),
      title: `Result ${i}`
    }));

    const mockSearchFunction = jest.fn().mockResolvedValue(mockResults);

    const { result } = renderHook(() =>
      useDebouncedSearch(mockSearchFunction, { maxResults: 10 })
    );

    const [, search] = result.current;

    act(() => {
      search('test query');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const [searchResult] = result.current;
      expect(searchResult.results).toHaveLength(10);
      expect(searchResult.totalCount).toBe(100);
    });
  });

  it('should handle search errors gracefully', async () => {
    const mockSearchFunction = jest.fn().mockRejectedValue(
      new Error('Search failed')
    );

    const { result } = renderHook(() =>
      useDebouncedSearch(mockSearchFunction)
    );

    const [, search] = result.current;

    act(() => {
      search('test query');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const [searchResult] = result.current;
      expect(searchResult.error).toBe('Search failed');
      expect(searchResult.results).toEqual([]);
      expect(searchResult.isLoading).toBe(false);
    });
  });

  it('should clear search results', () => {
    const mockSearchFunction = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() =>
      useDebouncedSearch(mockSearchFunction)
    );

    const [, search, clearSearch] = result.current;

    act(() => {
      search('test query');
    });

    act(() => {
      clearSearch();
    });

    const [searchResult] = result.current;
    expect(searchResult.query).toBe('');
    expect(searchResult.results).toEqual([]);
    expect(searchResult.isLoading).toBe(false);
    expect(searchResult.error).toBeNull();
  });
});

describe('useTheorySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should make API calls to search theories', async () => {
    const mockResults = [
      { id: '1', title: 'Anchoring Bias' },
      { id: '2', title: 'Social Proof' }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    } as Response);

    const { result } = renderHook(() => useTheorySearch());
    const [, search] = result.current;

    act(() => {
      search('bias');
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/theories/search?q=bias');
    });

    await waitFor(() => {
      const [searchResult] = result.current;
      expect(searchResult.results).toEqual(mockResults);
    });
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response);

    const { result } = renderHook(() => useTheorySearch());
    const [, search] = result.current;

    act(() => {
      search('test');
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    await waitFor(() => {
      const [searchResult] = result.current;
      expect(searchResult.error).toBe('Search failed');
    });
  });
});

describe('useSearchSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should provide search suggestions', async () => {
    const mockSuggestions = ['anchoring bias', 'availability bias', 'confirmation bias'];
    const mockGetSuggestions = jest.fn().mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() =>
      useSearchSuggestions(mockGetSuggestions)
    );

    act(() => {
      result.current.getSuggestions('bias');
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
      expect(mockGetSuggestions).toHaveBeenCalledWith('bias');
    });
  });

  it('should not provide suggestions for short queries', () => {
    const mockGetSuggestions = jest.fn();

    const { result } = renderHook(() =>
      useSearchSuggestions(mockGetSuggestions)
    );

    act(() => {
      result.current.getSuggestions('a'); // Too short
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockGetSuggestions).not.toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
  });

  it('should clear suggestions', () => {
    const mockGetSuggestions = jest.fn().mockResolvedValue(['test']);

    const { result } = renderHook(() =>
      useSearchSuggestions(mockGetSuggestions)
    );

    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestions).toEqual([]);
  });

  it('should handle suggestion errors gracefully', async () => {
    const mockGetSuggestions = jest.fn().mockRejectedValue(
      new Error('Suggestions failed')
    );

    const { result } = renderHook(() =>
      useSearchSuggestions(mockGetSuggestions)
    );

    act(() => {
      result.current.getSuggestions('test');
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
