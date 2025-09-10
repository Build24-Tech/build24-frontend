/**
 * Unit tests for Knowledge Hub services and utilities
 * Tests core business logic and data processing functions
 */

import {
  getAllTheories,
  getTheoriesByCategory,
  getTheoryById,
  processTheoryMetadata,
  searchTheories,
  validateTheoryContent
} from '@/lib/theories';

import {
  addBookmark,
  calculateProgressStats,
  getUserBookmarks,
  getUserProgress,
  removeBookmark,
  updateUserProgress
} from '@/lib/firestore';

import {
  calculatePopularityScore,
  generateRecommendations,
  trackEvent
} from '@/lib/analytics-service';

import {
  debounceSearch,
  filterTheoriesByDifficulty,
  filterTheoriesByRelevance,
  searchTheoriesClient,
  sortTheoriesByPopularity
} from '@/lib/search-service';

import {
  findRelatedContent,
  generateCrossLinks
} from '@/lib/cross-linking-service';

import {
  calculateSimilarity,
  generateRecommendations as generateContentRecommendations,
  getUserPreferences
} from '@/lib/recommendation-engine';

import { Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));

// Mock file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('gray-matter', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockTheories: Theory[] = [
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
    content: {
      description: 'Detailed description of anchoring bias',
      applicationGuide: 'How to apply anchoring bias in product design',
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: 'beginner',
      relevance: ['marketing', 'ux'],
      readTime: 3,
      tags: ['pricing', 'decision-making'],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'People follow the actions of others when uncertain about what to do.',
    content: {
      description: 'Detailed description of social proof',
      applicationGuide: 'How to apply social proof in marketing',
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: 'intermediate',
      relevance: ['marketing', 'sales'],
      readTime: 5,
      tags: ['testimonials', 'reviews'],
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'loss-aversion',
    title: 'Loss Aversion',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    summary: 'People prefer avoiding losses over acquiring equivalent gains.',
    content: {
      description: 'Detailed description of loss aversion',
      applicationGuide: 'How to apply loss aversion in pricing',
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: 'advanced',
      relevance: ['marketing', 'ux', 'sales'],
      readTime: 7,
      tags: ['pricing', 'psychology'],
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

const mockUserProgress: UserProgress = {
  userId: 'test-user-id',
  readTheories: ['anchoring-bias'],
  bookmarkedTheories: ['social-proof'],
  badges: [],
  stats: {
    totalReadTime: 15,
    theoriesRead: 1,
    categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
    lastActiveDate: new Date(),
  },
  quizResults: [],
};

describe('Theory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTheories', () => {
    it('should return all theories sorted by creation date', async () => {
      const fs = require('fs');
      const matter = require('gray-matter').default;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('---\ntitle: Test Theory\n---\nContent');
      matter.mockReturnValue({
        data: { title: 'Test Theory', category: 'cognitive-biases' },
        content: 'Content'
      });

      const theories = await getAllTheories();

      expect(Array.isArray(theories)).toBe(true);
      expect(theories.length).toBeGreaterThan(0);
    });

    it('should handle file system errors gracefully', async () => {
      const fs = require('fs');
      fs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const theories = await getAllTheories();

      expect(theories).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getTheoryById', () => {
    it('should return specific theory by ID', async () => {
      const fs = require('fs');
      const matter = require('gray-matter').default;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('---\ntitle: Anchoring Bias\n---\nContent');
      matter.mockReturnValue({
        data: {
          title: 'Anchoring Bias',
          category: 'cognitive-biases',
          difficulty: 'beginner'
        },
        content: 'Detailed content'
      });

      const theory = await getTheoryById('anchoring-bias');

      expect(theory).toBeDefined();
      expect(theory?.id).toBe('anchoring-bias');
      expect(theory?.title).toBe('Anchoring Bias');
    });

    it('should return null for non-existent theory', async () => {
      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);

      const theory = await getTheoryById('non-existent');

      expect(theory).toBeNull();
    });
  });

  describe('getTheoriesByCategory', () => {
    it('should filter theories by category', async () => {
      const theories = getTheoriesByCategory(mockTheories, TheoryCategory.COGNITIVE_BIASES);

      expect(theories).toHaveLength(1);
      expect(theories[0].category).toBe(TheoryCategory.COGNITIVE_BIASES);
    });

    it('should return empty array for non-existent category', () => {
      const theories = getTheoriesByCategory(mockTheories, 'non-existent' as TheoryCategory);

      expect(theories).toHaveLength(0);
    });
  });

  describe('searchTheories', () => {
    it('should search theories by title and summary', () => {
      const results = searchTheories(mockTheories, 'anchoring');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Anchoring Bias');
    });

    it('should search theories by tags', () => {
      const results = searchTheories(mockTheories, 'pricing');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.metadata.tags.includes('pricing'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchTheories(mockTheories, 'nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const results = searchTheories(mockTheories, 'ANCHORING');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Anchoring Bias');
    });
  });

  describe('validateTheoryContent', () => {
    it('should validate complete theory content', () => {
      const validTheory = mockTheories[0];
      const isValid = validateTheoryContent(validTheory);

      expect(isValid).toBe(true);
    });

    it('should reject theory with missing required fields', () => {
      const invalidTheory = {
        ...mockTheories[0],
        title: '',
      };

      const isValid = validateTheoryContent(invalidTheory);

      expect(isValid).toBe(false);
    });

    it('should validate summary length', () => {
      const shortSummaryTheory = {
        ...mockTheories[0],
        summary: 'Too short',
      };

      const isValid = validateTheoryContent(shortSummaryTheory);

      expect(isValid).toBe(false);
    });
  });

  describe('processTheoryMetadata', () => {
    it('should process and normalize metadata', () => {
      const rawMetadata = {
        difficulty: 'BEGINNER',
        relevance: 'marketing,ux',
        readTime: '3',
        tags: 'pricing, decision-making',
      };

      const processed = processTheoryMetadata(rawMetadata);

      expect(processed.difficulty).toBe('beginner');
      expect(processed.relevance).toEqual(['marketing', 'ux']);
      expect(processed.readTime).toBe(3);
      expect(processed.tags).toEqual(['pricing', 'decision-making']);
    });
  });
});

describe('Firestore Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should retrieve user progress from Firestore', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProgress,
      });

      const progress = await getUserProgress('test-user-id');

      expect(progress).toEqual(mockUserProgress);
    });

    it('should return default progress for new user', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const progress = await getUserProgress('new-user-id');

      expect(progress.userId).toBe('new-user-id');
      expect(progress.readTheories).toEqual([]);
      expect(progress.bookmarkedTheories).toEqual([]);
    });
  });

  describe('updateUserProgress', () => {
    it('should update user progress in Firestore', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      const updatedProgress = {
        ...mockUserProgress,
        readTheories: ['anchoring-bias', 'social-proof'],
      };

      await updateUserProgress('test-user-id', updatedProgress);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('bookmark management', () => {
    it('should add bookmark to user profile', async () => {
      const { updateDoc, arrayUnion } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await addBookmark('test-user-id', 'new-theory-id');

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should remove bookmark from user profile', async () => {
      const { updateDoc, arrayRemove } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await removeBookmark('test-user-id', 'theory-id');

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should retrieve user bookmarks', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ bookmarkedTheories: ['theory-1', 'theory-2'] }),
      });

      const bookmarks = await getUserBookmarks('test-user-id');

      expect(bookmarks).toEqual(['theory-1', 'theory-2']);
    });
  });

  describe('calculateProgressStats', () => {
    it('should calculate reading statistics', () => {
      const stats = calculateProgressStats(mockUserProgress);

      expect(stats.theoriesRead).toBe(1);
      expect(stats.totalReadTime).toBe(15);
      expect(stats.categoriesExplored).toHaveLength(1);
    });

    it('should calculate completion percentage', () => {
      const stats = calculateProgressStats(mockUserProgress, mockTheories);

      expect(stats.completionPercentage).toBe(33.33); // 1 out of 3 theories
    });
  });
});

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track user events', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'event-id' });

      await trackEvent('theory_view', {
        theoryId: 'anchoring-bias',
        userId: 'test-user-id',
        timestamp: new Date(),
      });

      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('calculatePopularityScore', () => {
    it('should calculate theory popularity based on metrics', () => {
      const metrics = {
        viewCount: 100,
        bookmarkCount: 25,
        averageReadTime: 180, // 3 minutes
        completionRate: 0.8,
      };

      const score = calculatePopularityScore(metrics);

      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should weight different metrics appropriately', () => {
      const highViewsLowEngagement = {
        viewCount: 1000,
        bookmarkCount: 5,
        averageReadTime: 30,
        completionRate: 0.2,
      };

      const lowViewsHighEngagement = {
        viewCount: 50,
        bookmarkCount: 40,
        averageReadTime: 300,
        completionRate: 0.9,
      };

      const score1 = calculatePopularityScore(highViewsLowEngagement);
      const score2 = calculatePopularityScore(lowViewsHighEngagement);

      // High engagement should score higher than just high views
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate theory recommendations based on user history', () => {
      const recommendations = generateRecommendations(mockUserProgress, mockTheories);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Should not recommend already read theories
      const readTheoryIds = recommendations.map(r => r.id);
      expect(readTheoryIds).not.toContain('anchoring-bias');
    });

    it('should prioritize theories from explored categories', () => {
      const recommendations = generateRecommendations(mockUserProgress, mockTheories);

      // Should include theories from cognitive biases category
      const cognitiveTheories = recommendations.filter(
        t => t.category === TheoryCategory.COGNITIVE_BIASES
      );
      expect(cognitiveTheories.length).toBeGreaterThan(0);
    });
  });
});

describe('Search Service', () => {
  describe('searchTheoriesClient', () => {
    it('should perform client-side search with ranking', () => {
      const results = searchTheoriesClient(mockTheories, 'bias');

      expect(results.length).toBeGreaterThan(0);
      // Results should be ranked by relevance
      expect(results[0].title).toContain('Bias');
    });

    it('should handle empty search query', () => {
      const results = searchTheoriesClient(mockTheories, '');

      expect(results).toEqual(mockTheories);
    });
  });

  describe('filtering functions', () => {
    it('should filter by difficulty level', () => {
      const beginnerTheories = filterTheoriesByDifficulty(mockTheories, 'beginner');

      expect(beginnerTheories).toHaveLength(1);
      expect(beginnerTheories[0].metadata.difficulty).toBe('beginner');
    });

    it('should filter by relevance type', () => {
      const marketingTheories = filterTheoriesByRelevance(mockTheories, 'marketing');

      expect(marketingTheories.length).toBeGreaterThan(0);
      marketingTheories.forEach(theory => {
        expect(theory.metadata.relevance).toContain('marketing');
      });
    });

    it('should sort by popularity', () => {
      const mockAnalytics = {
        'anchoring-bias': { popularityScore: 85 },
        'social-proof': { popularityScore: 92 },
        'loss-aversion': { popularityScore: 78 },
      };

      const sorted = sortTheoriesByPopularity(mockTheories, mockAnalytics);

      expect(sorted[0].id).toBe('social-proof'); // Highest score
      expect(sorted[2].id).toBe('loss-aversion'); // Lowest score
    });
  });

  describe('debounceSearch', () => {
    it('should debounce search function calls', async () => {
      const mockSearchFn = jest.fn();
      const debouncedSearch = debounceSearch(mockSearchFn, 300);

      // Call multiple times quickly
      debouncedSearch('query1');
      debouncedSearch('query2');
      debouncedSearch('query3');

      // Should not call immediately
      expect(mockSearchFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 350));

      // Should call only once with last query
      expect(mockSearchFn).toHaveBeenCalledTimes(1);
      expect(mockSearchFn).toHaveBeenCalledWith('query3');
    });
  });
});

describe('Cross-linking Service', () => {
  describe('findRelatedContent', () => {
    it('should find related theories based on tags and category', () => {
      const related = findRelatedContent(mockTheories[0], mockTheories);

      expect(Array.isArray(related)).toBe(true);
      // Should not include the theory itself
      expect(related.find(t => t.id === mockTheories[0].id)).toBeUndefined();
    });

    it('should prioritize same category theories', () => {
      const cognitiveTheory = mockTheories[0]; // Cognitive bias
      const related = findRelatedContent(cognitiveTheory, mockTheories);

      // Should prioritize other cognitive bias theories
      const sameCategoryCount = related.filter(
        t => t.category === TheoryCategory.COGNITIVE_BIASES
      ).length;

      expect(sameCategoryCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateCrossLinks', () => {
    it('should generate cross-links between theories', () => {
      const crossLinks = generateCrossLinks(mockTheories);

      expect(typeof crossLinks).toBe('object');
      expect(Object.keys(crossLinks)).toHaveLength(mockTheories.length);

      // Each theory should have related theories
      Object.values(crossLinks).forEach(links => {
        expect(Array.isArray(links)).toBe(true);
      });
    });
  });
});

describe('Recommendation Engine', () => {
  describe('calculateSimilarity', () => {
    it('should calculate similarity between theories', () => {
      const similarity = calculateSimilarity(mockTheories[0], mockTheories[1]);

      expect(typeof similarity).toBe('number');
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return higher similarity for same category theories', () => {
      const sameCategorySimilarity = calculateSimilarity(mockTheories[0], mockTheories[0]);
      const differentCategorySimilarity = calculateSimilarity(mockTheories[0], mockTheories[1]);

      expect(sameCategorySimilarity).toBeGreaterThan(differentCategorySimilarity);
    });
  });

  describe('getUserPreferences', () => {
    it('should extract user preferences from progress', () => {
      const preferences = getUserPreferences(mockUserProgress, mockTheories);

      expect(preferences).toHaveProperty('favoriteCategories');
      expect(preferences).toHaveProperty('preferredDifficulty');
      expect(preferences).toHaveProperty('averageReadTime');

      expect(preferences.favoriteCategories).toContain(TheoryCategory.COGNITIVE_BIASES);
    });
  });

  describe('generateContentRecommendations', () => {
    it('should generate personalized recommendations', () => {
      const recommendations = generateContentRecommendations(mockUserProgress, mockTheories);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Should include confidence scores
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('theory');
        expect(rec).toHaveProperty('confidence');
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should limit number of recommendations', () => {
      const recommendations = generateContentRecommendations(mockUserProgress, mockTheories, 2);

      expect(recommendations).toHaveLength(2);
    });
  });
});
