'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebounceSearchOptions {
  delay?: number;
  minLength?: number;
  maxResults?: number;
}

interface SearchResult<T> {
  results: T[];
  isLoading: boolean;
  error: string | null;
  query: string;
  totalCount: number;
}

export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: UseDebounceSearchOptions = {}
): [SearchResult<T>, (query: string) => void, () => void] {
  const {
    delay = 300,
    minLength = 2,
    maxResults = 50
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const cacheRef = useRef<Map<string, { results: T[]; timestamp: number }>>(new Map());

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const performSearch = useCallback(async (searchQuery: string) => {
    // Check cache first
    const cached = cacheRef.current.get(searchQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.results);
      setTotalCount(cached.results.length);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchFunction(searchQuery);

      // Limit results
      const limitedResults = searchResults.slice(0, maxResults);

      // Cache results
      cacheRef.current.set(searchQuery, {
        results: limitedResults,
        timestamp: Date.now()
      });

      // Clean old cache entries
      if (cacheRef.current.size > 100) {
        const entries = Array.from(cacheRef.current.entries());
        const sortedEntries = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        cacheRef.current.clear();
        sortedEntries.slice(0, 50).forEach(([key, value]) => {
          cacheRef.current.set(key, value);
        });
      }

      setResults(limitedResults);
      setTotalCount(searchResults.length);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction, maxResults]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear results if query is too short
    if (searchQuery.length < minLength) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Set loading state immediately for better UX
    setIsLoading(true);

    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, delay);
  }, [performSearch, delay, minLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalCount(0);
    setIsLoading(false);
    setError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchResult: SearchResult<T> = {
    results,
    isLoading,
    error,
    query,
    totalCount
  };

  return [searchResult, debouncedSearch, clearSearch];
}

// Specialized hook for theory search
export function useTheorySearch() {
  const searchTheories = useCallback(async (query: string) => {
    // This would typically call your search service
    const response = await fetch(`/api/theories/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return response.json();
  }, []);

  return useDebouncedSearch(searchTheories, {
    delay: 250,
    minLength: 2,
    maxResults: 20
  });
}

// Hook for search suggestions/autocomplete
export function useSearchSuggestions(
  getSuggestions: (query: string) => Promise<string[]>
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  const getSuggestionsDebounced = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache
    const cached = cacheRef.current.get(query);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const results = await getSuggestions(query);
        cacheRef.current.set(query, results);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 150); // Faster for suggestions
  }, [getSuggestions]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    getSuggestions: getSuggestionsDebounced,
    clearSuggestions: () => setSuggestions([])
  };
}
