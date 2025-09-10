import { searchService } from '@/lib/search-service';
import {
  DEFAULT_FILTER_STATE,
  DifficultyLevel,
  FilterState,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';

// Mock the theory service
jest.mock('@/lib/theories', () => ({
  theoryService: {
    loadAllTheories: jest.fn(),
    loadTheoriesByCategory: jest.fn()
  }
}));

import { theoryService } from '@/lib/theories';

const mockTheoryService = theoryService as jest.Mocked<typeof theoryService>;

describe('SearchService', () => {
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
    searchService.clearCache();
    mockTheoryService.loadAllTheories.mockResolvedValue(mockTheories);
    mockTheoryService.loadTheoriesByCategory.mockImplementation((category) => {
      return Promise.resolve(mockTheories.filter(theory => theory.category === category));
    });
  });

  describe('searchTheories', () => {
    it('returns all theories when no filters are applied', async () => {
      const results = await searchService.searchTheories(DEFAULT_FILTER_STATE);

      expect(results).toHaveLength(3);
      expect(results.map(r => r.theory.id)).toEqual(['anchoring-bias', 'loss-aversion', 'social-proof']);
    });

    it('filters theories by search query', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'anchoring'
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].theory.id).toBe('anchoring-bias');
      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('filters theories by category', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: [TheoryCategory.COGNITIVE_BIASES]
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].theory.category).toBe(TheoryCategory.COGNITIVE_BIASES);
    });

    it('filters theories by difficulty', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        difficulty: [DifficultyLevel.BEGINNER]
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].theory.metadata.difficulty).toBe(DifficultyLevel.BEGINNER);
    });

    it('filters theories by relevance', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        relevance: [RelevanceType.MARKETING]
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.theory.metadata.relevance.includes(RelevanceType.MARKETING))).toBe(true);
    });

    it('combines multiple filters', async () => {
      const filters: FilterState = {
        searchQuery: 'social',
        categories: [TheoryCategory.PERSUASION_PRINCIPLES],
        difficulty: [DifficultyLevel.INTERMEDIATE],
        relevance: [RelevanceType.MARKETING]
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].theory.id).toBe('social-proof');
    });

    it('sorts results by relevance score when search query is provided', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'decision'
      };

      const results = await searchService.searchTheories(filters);

      // Should find anchoring bias (has 'decision-making' tag)
      expect(results).toHaveLength(1);
      expect(results[0].theory.id).toBe('anchoring-bias');
    });

    it('sorts results alphabetically when no search query', async () => {
      const results = await searchService.searchTheories(DEFAULT_FILTER_STATE);

      const titles = results.map(r => r.theory.title);
      expect(titles).toEqual(['Anchoring Bias', 'Loss Aversion', 'Social Proof']);
    });

    it('calculates relevance scores correctly', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'anchoring bias'
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].relevanceScore).toBeGreaterThan(20); // Exact title match should get high score
    });

    it('identifies matched fields correctly', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'pricing'
      };

      const results = await searchService.searchTheories(filters);

      expect(results).toHaveLength(1);
      expect(results[0].matchedFields).toContain('tags');
    });

    it('caches search results', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'test'
      };

      // First call
      await searchService.searchTheories(filters);
      expect(mockTheoryService.loadAllTheories).toHaveBeenCalledTimes(1);

      // Second call with same filters should use cache
      await searchService.searchTheories(filters);
      expect(mockTheoryService.loadAllTheories).toHaveBeenCalledTimes(1);
    });

    it('handles errors gracefully', async () => {
      mockTheoryService.loadAllTheories.mockRejectedValue(new Error('Network error'));

      await expect(searchService.searchTheories(DEFAULT_FILTER_STATE))
        .rejects.toThrow('Failed to search theories');
    });
  });

  describe('getSearchSuggestions', () => {
    it('returns empty array for short queries', async () => {
      const suggestions = await searchService.getSearchSuggestions('a');
      expect(suggestions).toEqual([]);
    });

    it('returns suggestions based on theory titles', async () => {
      const suggestions = await searchService.getSearchSuggestions('anchor');
      expect(suggestions).toContain('Anchoring Bias');
    });

    it('returns suggestions based on tags', async () => {
      const suggestions = await searchService.getSearchSuggestions('pricing');
      expect(suggestions).toContain('pricing');
    });

    it('limits number of suggestions', async () => {
      const suggestions = await searchService.getSearchSuggestions('a', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('handles errors gracefully', async () => {
      mockTheoryService.loadAllTheories.mockRejectedValue(new Error('Network error'));

      const suggestions = await searchService.getSearchSuggestions('test');
      expect(suggestions).toEqual([]);
    });
  });

  describe('getPopularSearchTerms', () => {
    it('returns array of popular search terms', () => {
      const terms = searchService.getPopularSearchTerms();
      expect(Array.isArray(terms)).toBe(true);
      expect(terms.length).toBeGreaterThan(0);
      expect(terms).toContain('anchoring bias');
    });
  });

  describe('clearCache', () => {
    it('clears the search cache', async () => {
      // Populate cache
      await searchService.searchTheories(DEFAULT_FILTER_STATE);
      expect(mockTheoryService.loadAllTheories).toHaveBeenCalledTimes(1);

      // Clear cache
      searchService.clearCache();

      // Next call should hit the service again
      await searchService.searchTheories(DEFAULT_FILTER_STATE);
      expect(mockTheoryService.loadAllTheories).toHaveBeenCalledTimes(2);
    });
  });

  describe('relevance scoring', () => {
    it('gives higher scores to exact title matches', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'anchoring bias'
      };

      const results = await searchService.searchTheories(filters);
      expect(results[0].relevanceScore).toBeGreaterThan(20);
    });

    it('gives medium scores to tag matches', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'pricing'
      };

      const results = await searchService.searchTheories(filters);
      expect(results[0].relevanceScore).toBeGreaterThan(0);
      expect(results[0].relevanceScore).toBeLessThan(10);
    });

    it('gives lower scores to content matches', async () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'tendency'
      };

      const results = await searchService.searchTheories(filters);
      expect(results[0].relevanceScore).toBeGreaterThan(0);
      expect(results[0].relevanceScore).toBeLessThan(5);
    });
  });
});
