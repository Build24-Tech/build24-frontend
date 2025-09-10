'use client';

import {
  DEFAULT_FILTER_STATE,
  DifficultyLevel,
  FilterState,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

interface UseSearchFiltersOptions {
  theories: Theory[];
  isLoading?: boolean;
}

interface UseSearchFiltersReturn {
  filters: FilterState;
  filteredTheories: Theory[];
  resultCount: number;
  isSearching: boolean;
  updateFilters: (newFilters: FilterState) => void;
  clearFilters: () => void;
}

export function useSearchFilters({
  theories,
  isLoading = false
}: UseSearchFiltersOptions): UseSearchFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  // Initialize filters from URL parameters
  const initialFilters = useMemo(() => {
    const urlFilters: FilterState = {
      searchQuery: searchParams.get('q') || '',
      categories: parseArrayParam(searchParams.get('categories')) as TheoryCategory[],
      difficulty: parseArrayParam(searchParams.get('difficulty')) as DifficultyLevel[],
      relevance: parseArrayParam(searchParams.get('relevance')) as RelevanceType[]
    };

    // Validate enum values
    urlFilters.categories = urlFilters.categories.filter(cat =>
      Object.values(TheoryCategory).includes(cat)
    );
    urlFilters.difficulty = urlFilters.difficulty.filter(diff =>
      Object.values(DifficultyLevel).includes(diff)
    );
    urlFilters.relevance = urlFilters.relevance.filter(rel =>
      Object.values(RelevanceType).includes(rel)
    );

    return urlFilters;
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.searchQuery) {
      params.set('q', newFilters.searchQuery);
    }

    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    }

    if (newFilters.difficulty.length > 0) {
      params.set('difficulty', newFilters.difficulty.join(','));
    }

    if (newFilters.relevance.length > 0) {
      params.set('relevance', newFilters.relevance.join(','));
    }

    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentURL = window.location.search;

    if (newURL !== currentURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [router]);

  // Update filters and URL
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    router.replace('', { scroll: false });
  }, [router]);

  // Filter theories based on current filters
  const filteredTheories = useMemo(() => {
    if (isLoading) {
      return [];
    }

    let filtered = [...theories];

    // Apply search query filter
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(theory => {
        const searchableText = [
          theory.title,
          theory.summary,
          theory.content.description,
          theory.content.applicationGuide,
          ...theory.metadata.tags
        ].join(' ').toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(theory =>
        filters.categories.includes(theory.category)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(theory =>
        filters.difficulty.includes(theory.metadata.difficulty)
      );
    }

    // Apply relevance filter
    if (filters.relevance.length > 0) {
      filtered = filtered.filter(theory =>
        theory.metadata.relevance.some(rel =>
          filters.relevance.includes(rel)
        )
      );
    }

    // Sort results by relevance if there's a search query
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase().trim();
      filtered.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, searchTerm);
        const bScore = calculateRelevanceScore(b, searchTerm);
        return bScore - aScore;
      });
    } else {
      // Default sort by title
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [theories, filters, isLoading]);

  // Note: URL sync is handled by updateFilters function, not by watching searchParams

  return {
    filters,
    filteredTheories,
    resultCount: filteredTheories.length,
    isSearching: isLoading,
    updateFilters,
    clearFilters
  };
}

// Helper function to parse comma-separated array parameters
function parseArrayParam(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').filter(Boolean);
}

// Helper function to calculate relevance score for search results
function calculateRelevanceScore(theory: Theory, searchTerm: string): number {
  let score = 0;

  // Title match (highest weight)
  if (theory.title.toLowerCase().includes(searchTerm)) {
    score += 10;
    // Exact title match gets bonus
    if (theory.title.toLowerCase() === searchTerm) {
      score += 20;
    }
  }

  // Summary match (high weight)
  if (theory.summary.toLowerCase().includes(searchTerm)) {
    score += 5;
  }

  // Tags match (medium weight)
  const matchingTags = theory.metadata.tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm)
  );
  score += matchingTags.length * 3;

  // Content description match (lower weight)
  if (theory.content.description.toLowerCase().includes(searchTerm)) {
    score += 2;
  }

  // Application guide match (lower weight)
  if (theory.content.applicationGuide.toLowerCase().includes(searchTerm)) {
    score += 1;
  }

  return score;
}
