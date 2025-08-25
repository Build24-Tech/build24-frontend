import { useSearchFilters } from '@/hooks/use-search-filters';
import {
  DEFAULT_FILTER_STATE,
  DifficultyLevel,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

// Mock next/navigation
const mockReplace = jest.fn();
const mockSearchParams = new Map();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null
  })
}));

describe('useSearchFilters', () => {
  const mockTheories: Theory[] = [
    {
      id: 'anchoring-bias',
      title: 'Anchoring Bias',
      category: TheoryCategory.COGNITIVE_BIASES,
      summary: 'People rely heavily on the first piece of information they receive when making decisions.',
      content: {
        description: 'Anchoring bias is a cognitive bias that describes the tendency to rely heavily on the first piece of information encountered.',
        applicationGuide: 'Use anchoring in pricing strategies by showing a high-priced option first.',
        examples: [],
        relatedContent: []
      },
      metadata: {
        difficulty: DifficultyLevel.BEGINNER,
        relevance: [RelevanceType.MARKETING, RelevanceType.UX],
        readTime: 3,
        tags: ['pricing', 'decision-making', 'first-impression']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'social-proof',
      title: 'Social Proof',
      category: TheoryCategory.PERSUASION_PRINCIPLES,
      summary: 'People look to others for guidance on how to behave in uncertain situations.',
      content: {
        description: 'Social proof is a psychological phenomenon where people assume the actions of others reflect correct behavior.',
        applicationGuide: 'Show testimonials, user counts, and social media mentions to build credibility.',
        examples: [],
        relatedContent: []
      },
      metadata: {
        difficulty: DifficultyLevel.INTERMEDIATE,
        relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
        readTime: 5,
        tags: ['testimonials', 'credibility', 'influence']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'loss-aversion',
      title: 'Loss Aversion',
      category: TheoryCategory.BEHAVIORAL_ECONOMICS,
      summary: 'People feel the pain of losing something more strongly than the pleasure of gaining something equivalent.',
      content: {
        description: 'Loss aversion is the tendency to prefer avoiding losses over acquiring equivalent gains.',
        applicationGuide: 'Frame offers in terms of what users might lose rather than what they might gain.',
        examples: [],
        relatedContent: []
      },
      metadata: {
        difficulty: DifficultyLevel.ADVANCED,
        relevance: [RelevanceType.UX, RelevanceType.SALES],
        readTime: 7,
        tags: ['psychology', 'framing', 'motivation']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.clear();
  });

  describe('initialization', () => {
    it('initializes with default filters when no URL parameters', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
      expect(result.current.filteredTheories).toHaveLength(3);
      expect(result.current.resultCount).toBe(3);
    });

    it('initializes with URL parameters', () => {
      mockSearchParams.set('q', 'anchoring');
      mockSearchParams.set('categories', 'cognitive-biases');
      mockSearchParams.set('difficulty', 'beginner');
      mockSearchParams.set('relevance', 'marketing');

      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      expect(result.current.filters.searchQuery).toBe('anchoring');
      expect(result.current.filters.categories).toContain(TheoryCategory.COGNITIVE_BIASES);
      expect(result.current.filters.difficulty).toContain(DifficultyLevel.BEGINNER);
      expect(result.current.filters.relevance).toContain(RelevanceType.MARKETING);
    });

    it('filters invalid enum values from URL parameters', () => {
      mockSearchParams.set('categories', 'invalid-category,cognitive-biases');
      mockSearchParams.set('difficulty', 'invalid-difficulty,beginner');
      mockSearchParams.set('relevance', 'invalid-relevance,marketing');

      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      expect(result.current.filters.categories).toEqual([TheoryCategory.COGNITIVE_BIASES]);
      expect(result.current.filters.difficulty).toEqual([DifficultyLevel.BEGINNER]);
      expect(result.current.filters.relevance).toEqual([RelevanceType.MARKETING]);
    });
  });

  describe('filtering', () => {
    it('filters theories by search query', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'anchoring'
        });
      });

      expect(result.current.filteredTheories).toHaveLength(1);
      expect(result.current.filteredTheories[0].id).toBe('anchoring-bias');
    });

    it('filters theories by category', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          categories: [TheoryCategory.COGNITIVE_BIASES]
        });
      });

      expect(result.current.filteredTheories).toHaveLength(1);
      expect(result.current.filteredTheories[0].category).toBe(TheoryCategory.COGNITIVE_BIASES);
    });

    it('filters theories by difficulty', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          difficulty: [DifficultyLevel.BEGINNER]
        });
      });

      expect(result.current.filteredTheories).toHaveLength(1);
      expect(result.current.filteredTheories[0].metadata.difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('filters theories by relevance', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          relevance: [RelevanceType.MARKETING]
        });
      });

      expect(result.current.filteredTheories).toHaveLength(2);
      expect(result.current.filteredTheories.every(theory =>
        theory.metadata.relevance.includes(RelevanceType.MARKETING)
      )).toBe(true);
    });

    it('combines multiple filters', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          searchQuery: 'social',
          categories: [TheoryCategory.PERSUASION_PRINCIPLES],
          difficulty: [DifficultyLevel.INTERMEDIATE],
          relevance: [RelevanceType.MARKETING]
        });
      });

      expect(result.current.filteredTheories).toHaveLength(1);
      expect(result.current.filteredTheories[0].id).toBe('social-proof');
    });

    it('returns empty array when loading', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories, isLoading: true })
      );

      expect(result.current.filteredTheories).toHaveLength(0);
      expect(result.current.isSearching).toBe(true);
    });
  });

  describe('sorting', () => {
    it('sorts by relevance when search query is provided', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'decision'
        });
      });

      // Should find anchoring bias (has 'decision-making' tag)
      expect(result.current.filteredTheories).toHaveLength(1);
      expect(result.current.filteredTheories[0].id).toBe('anchoring-bias');
    });

    it('sorts alphabetically when no search query', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      const titles = result.current.filteredTheories.map(theory => theory.title);
      expect(titles).toEqual(['Anchoring Bias', 'Loss Aversion', 'Social Proof']);
    });
  });

  describe('URL synchronization', () => {
    it('updates URL when filters change', async () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'test'
        });
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('?q=test', { scroll: false });
      });
    });

    it('updates URL with multiple parameters', async () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          searchQuery: 'test',
          categories: [TheoryCategory.COGNITIVE_BIASES],
          difficulty: [DifficultyLevel.BEGINNER],
          relevance: [RelevanceType.MARKETING]
        });
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '?q=test&categories=cognitive-biases&difficulty=beginner&relevance=marketing',
          { scroll: false }
        );
      });
    });

    it('clears URL when clearing filters', async () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.clearFilters();
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('', { scroll: false });
      });
    });

    it('does not update URL if it has not changed', async () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'test'
        });
      });

      // Should call replace with the new URL
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('?q=test', { scroll: false });
      });
    });
  });

  describe('result count', () => {
    it('returns correct result count', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      expect(result.current.resultCount).toBe(3);

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'anchoring'
        });
      });

      expect(result.current.resultCount).toBe(1);
    });
  });

  describe('loading states', () => {
    it('sets isSearching to true during filtering', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories })
      );

      act(() => {
        result.current.updateFilters({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'test'
        });
      });

      // isSearching should eventually be false after filtering completes
      expect(result.current.isSearching).toBe(false);
    });

    it('returns isSearching true when isLoading is true', () => {
      const { result } = renderHook(() =>
        useSearchFilters({ theories: mockTheories, isLoading: true })
      );

      expect(result.current.isSearching).toBe(true);
    });
  });
});
