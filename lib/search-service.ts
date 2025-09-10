import {
  FilterState,
  SearchResult,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import { theoryService } from './theories';

export class SearchService {
  private searchCache: Map<string, SearchResult[]> = new Map();
  private cacheExpiry: number = 1000 * 60 * 10; // 10 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  /**
   * Search theories with advanced filtering and relevance scoring
   */
  async searchTheories(filters: FilterState): Promise<SearchResult[]> {
    try {
      // Create cache key from filters
      const cacheKey = this.createCacheKey(filters);

      // Check cache first
      const cachedResults = this.getCachedResults(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }

      // Load theories based on category filters
      const theories = filters.categories.length > 0
        ? await this.loadTheoriesByCategories(filters.categories)
        : await theoryService.loadAllTheories();

      // Apply filters and create search results
      let filteredTheories = this.applyFilters(theories, filters);

      // Create search results with relevance scoring
      const searchResults = filteredTheories.map(theory => ({
        theory,
        relevanceScore: this.calculateRelevanceScore(theory, filters.searchQuery),
        matchedFields: this.getMatchedFields(theory, filters.searchQuery)
      }));

      // Sort by relevance score
      searchResults.sort((a, b) => {
        // If there's a search query, sort by relevance score
        if (filters.searchQuery.trim()) {
          return b.relevanceScore - a.relevanceScore;
        }
        // Otherwise, sort alphabetically by title
        return a.theory.title.localeCompare(b.theory.title);
      });

      // Cache the results
      this.cacheResults(cacheKey, searchResults);

      return searchResults;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('Failed to search theories');
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const allTheories = await theoryService.loadAllTheories();
      const suggestions = new Set<string>();

      const searchTerm = query.toLowerCase().trim();

      // Collect suggestions from titles, tags, and content
      allTheories.forEach(theory => {
        // Title suggestions
        if (theory.title.toLowerCase().includes(searchTerm)) {
          suggestions.add(theory.title);
        }

        // Tag suggestions
        theory.metadata.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchTerm)) {
            suggestions.add(tag);
          }
        });

        // Category suggestions
        const categoryName = this.getCategoryDisplayName(theory.category);
        if (categoryName.toLowerCase().includes(searchTerm)) {
          suggestions.add(categoryName);
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  getPopularSearchTerms(): string[] {
    // In a real implementation, this would come from analytics
    return [
      'anchoring bias',
      'social proof',
      'scarcity',
      'loss aversion',
      'reciprocity',
      'authority',
      'commitment',
      'liking',
      'consensus',
      'framing effect'
    ];
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.cacheTimestamps.clear();
  }

  // Private methods

  private async loadTheoriesByCategories(categories: TheoryCategory[]): Promise<Theory[]> {
    const allTheories: Theory[] = [];

    for (const category of categories) {
      try {
        const categoryTheories = await theoryService.loadTheoriesByCategory(category);
        allTheories.push(...categoryTheories);
      } catch (error) {
        console.warn(`Failed to load theories for category ${category}:`, error);
      }
    }

    return allTheories;
  }

  private applyFilters(theories: Theory[], filters: FilterState): Theory[] {
    let filtered = [...theories];

    // Apply search query filter
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(theory => {
        return this.matchesSearchQuery(theory, searchTerm);
      });
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

    return filtered;
  }

  private matchesSearchQuery(theory: Theory, searchTerm: string): boolean {
    const searchableFields = [
      theory.title,
      theory.summary,
      theory.content.description,
      theory.content.applicationGuide,
      ...theory.metadata.tags,
      this.getCategoryDisplayName(theory.category)
    ];

    return searchableFields.some(field =>
      field.toLowerCase().includes(searchTerm)
    );
  }

  private calculateRelevanceScore(theory: Theory, searchQuery: string): number {
    if (!searchQuery.trim()) {
      return 0;
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    let score = 0;

    // Title match (highest weight)
    if (theory.title.toLowerCase().includes(searchTerm)) {
      score += 10;
      // Exact title match gets bonus
      if (theory.title.toLowerCase() === searchTerm) {
        score += 20;
      }
      // Title starts with search term gets bonus
      if (theory.title.toLowerCase().startsWith(searchTerm)) {
        score += 5;
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

    // Exact tag match gets bonus
    const exactTagMatch = theory.metadata.tags.some(tag =>
      tag.toLowerCase() === searchTerm
    );
    if (exactTagMatch) {
      score += 5;
    }

    // Content description match (lower weight)
    if (theory.content.description.toLowerCase().includes(searchTerm)) {
      score += 2;
    }

    // Application guide match (lower weight)
    if (theory.content.applicationGuide.toLowerCase().includes(searchTerm)) {
      score += 1;
    }

    // Category match (medium weight)
    const categoryName = this.getCategoryDisplayName(theory.category);
    if (categoryName.toLowerCase().includes(searchTerm)) {
      score += 4;
    }

    return score;
  }

  private getMatchedFields(theory: Theory, searchQuery: string): ('title' | 'summary' | 'tags' | 'content')[] {
    if (!searchQuery.trim()) {
      return [];
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    const matchedFields: ('title' | 'summary' | 'tags' | 'content')[] = [];

    if (theory.title.toLowerCase().includes(searchTerm)) {
      matchedFields.push('title');
    }

    if (theory.summary.toLowerCase().includes(searchTerm)) {
      matchedFields.push('summary');
    }

    if (theory.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      matchedFields.push('tags');
    }

    if (
      theory.content.description.toLowerCase().includes(searchTerm) ||
      theory.content.applicationGuide.toLowerCase().includes(searchTerm)
    ) {
      matchedFields.push('content');
    }

    return matchedFields;
  }

  private getCategoryDisplayName(category: TheoryCategory): string {
    const categoryNames: Record<TheoryCategory, string> = {
      [TheoryCategory.COGNITIVE_BIASES]: 'Cognitive Biases',
      [TheoryCategory.PERSUASION_PRINCIPLES]: 'Persuasion Principles',
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: 'Behavioral Economics',
      [TheoryCategory.UX_PSYCHOLOGY]: 'UX Psychology',
      [TheoryCategory.EMOTIONAL_TRIGGERS]: 'Emotional Triggers'
    };

    return categoryNames[category] || category;
  }

  private createCacheKey(filters: FilterState): string {
    return JSON.stringify({
      searchQuery: filters.searchQuery.toLowerCase().trim(),
      categories: [...filters.categories].sort(),
      difficulty: [...filters.difficulty].sort(),
      relevance: [...filters.relevance].sort()
    });
  }

  private getCachedResults(cacheKey: string): SearchResult[] | null {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp || Date.now() - timestamp > this.cacheExpiry) {
      return null;
    }

    return this.searchCache.get(cacheKey) || null;
  }

  private cacheResults(cacheKey: string, results: SearchResult[]): void {
    this.searchCache.set(cacheKey, results);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }
}

// Singleton instance
export const searchService = new SearchService();

// Utility functions for external use

/**
 * Search theories with filters
 */
export async function searchTheories(filters: FilterState): Promise<SearchResult[]> {
  return searchService.searchTheories(filters);
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(query: string, limit?: number): Promise<string[]> {
  return searchService.getSearchSuggestions(query, limit);
}

/**
 * Get popular search terms
 */
export function getPopularSearchTerms(): string[] {
  return searchService.getPopularSearchTerms();
}

/**
 * Clear search cache
 */
export function clearSearchCache(): void {
  searchService.clearCache();
}
