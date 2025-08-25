import { analyticsService, TheoryAnalytics, UserInteraction } from '@/lib/analytics-service';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  increment: jest.fn((value) => ({ _increment: value })),
  serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() }))
  }
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackTheoryView', () => {
    it('should track a theory view for new theory', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockSetDoc = require('firebase/firestore').setDoc;

      mockGetDoc.mockResolvedValue({ exists: () => false });

      await analyticsService.trackTheoryView('test-theory', 'user123', 120);

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should update existing theory analytics', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockUpdateDoc = require('firebase/firestore').updateDoc;

      const existingData: TheoryAnalytics = {
        theoryId: 'test-theory',
        viewCount: 10,
        totalReadTime: 600,
        bookmarkCount: 2,
        averageReadTime: 60,
        popularityScore: 50,
        lastUpdated: { toMillis: () => Date.now() } as any,
        dailyViews: { '2024-01-01': 5 },
        userEngagement: {
          uniqueViewers: 8,
          returningViewers: 2,
          completionRate: 0.8
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingData
      });

      await analyticsService.trackTheoryView('test-theory', 'user123', 120);

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockGetDoc.mockRejectedValue(new Error('Database error'));

      await expect(analyticsService.trackTheoryView('test-theory', 'user123', 120))
        .resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error tracking theory view:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('trackBookmark', () => {
    it('should track bookmark addition', async () => {
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      const mockIncrement = require('firebase/firestore').increment;

      await analyticsService.trackBookmark('test-theory', 'user123', 'bookmark');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockIncrement).toHaveBeenCalledWith(1);
    });

    it('should track bookmark removal', async () => {
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      const mockIncrement = require('firebase/firestore').increment;

      await analyticsService.trackBookmark('test-theory', 'user123', 'unbookmark');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockIncrement).toHaveBeenCalledWith(-1);
    });
  });

  describe('trackReadingCompletion', () => {
    it('should track reading completion', async () => {
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      const mockIncrement = require('firebase/firestore').increment;

      await analyticsService.trackReadingCompletion('test-theory', 'user123', 300);

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockIncrement).toHaveBeenCalledWith(300);
    });
  });

  describe('getTrendingTheories', () => {
    it('should return trending theories', async () => {
      const mockGetDocs = require('firebase/firestore').getDocs;
      const mockQuery = require('firebase/firestore').query;
      const mockOrderBy = require('firebase/firestore').orderBy;
      const mockLimit = require('firebase/firestore').limit;

      const mockAnalyticsData: TheoryAnalytics = {
        theoryId: 'trending-theory',
        viewCount: 100,
        totalReadTime: 3000,
        bookmarkCount: 15,
        averageReadTime: 30,
        popularityScore: 200,
        lastUpdated: { toMillis: () => Date.now() } as any,
        dailyViews: {
          [new Date().toISOString().split('T')[0]]: 20,
          [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 15
        },
        userEngagement: {
          uniqueViewers: 80,
          returningViewers: 20,
          completionRate: 0.75
        }
      };

      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback({ data: () => mockAnalyticsData });
        }
      });

      const trending = await analyticsService.getTrendingTheories(5);

      expect(trending).toHaveLength(1);
      expect(trending[0]).toMatchObject({
        theoryId: 'trending-theory',
        viewCount: 100,
        popularityScore: 200
      });
      expect(trending[0].trendScore).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const mockGetDocs = require('firebase/firestore').getDocs;

      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          // No documents
        }
      });

      const trending = await analyticsService.getTrendingTheories(5);

      expect(trending).toEqual([]);
    });
  });

  describe('getTheoryAnalytics', () => {
    it('should return theory analytics', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;

      const mockAnalytics: TheoryAnalytics = {
        theoryId: 'test-theory',
        viewCount: 50,
        totalReadTime: 1500,
        bookmarkCount: 8,
        averageReadTime: 30,
        popularityScore: 100,
        lastUpdated: { toMillis: () => Date.now() } as any,
        dailyViews: {},
        userEngagement: {
          uniqueViewers: 40,
          returningViewers: 10,
          completionRate: 0.8
        }
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockAnalytics
      });

      const analytics = await analyticsService.getTheoryAnalytics('test-theory');

      expect(analytics).toEqual(mockAnalytics);
    });

    it('should return null for non-existent theory', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;

      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const analytics = await analyticsService.getTheoryAnalytics('non-existent');

      expect(analytics).toBeNull();
    });
  });

  describe('getUserInteractions', () => {
    it('should return user interactions', async () => {
      const mockGetDocs = require('firebase/firestore').getDocs;

      const mockInteraction: UserInteraction = {
        userId: 'user123',
        theoryId: 'test-theory',
        action: 'view',
        timestamp: { toMillis: () => Date.now() } as any,
        sessionDuration: 120,
        metadata: { userAgent: 'test-agent' }
      };

      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback({ data: () => mockInteraction });
        }
      });

      const interactions = await analyticsService.getUserInteractions('user123', 10);

      expect(interactions).toHaveLength(1);
      expect(interactions[0]).toEqual(mockInteraction);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return analytics summary', async () => {
      const mockGetDocs = require('firebase/firestore').getDocs;

      const mockAnalytics1: TheoryAnalytics = {
        theoryId: 'theory1',
        viewCount: 100,
        totalReadTime: 3000,
        bookmarkCount: 15,
        averageReadTime: 30,
        popularityScore: 200,
        lastUpdated: { toMillis: () => Date.now() } as any,
        dailyViews: {},
        userEngagement: {
          uniqueViewers: 80,
          returningViewers: 20,
          completionRate: 0.75
        }
      };

      const mockAnalytics2: TheoryAnalytics = {
        theoryId: 'theory2',
        viewCount: 50,
        totalReadTime: 1500,
        bookmarkCount: 8,
        averageReadTime: 30,
        popularityScore: 100,
        lastUpdated: { toMillis: () => Date.now() } as any,
        dailyViews: {},
        userEngagement: {
          uniqueViewers: 40,
          returningViewers: 10,
          completionRate: 0.8
        }
      };

      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback({ data: () => mockAnalytics1 });
          callback({ data: () => mockAnalytics2 });
        }
      });

      const summary = await analyticsService.getAnalyticsSummary();

      expect(summary).toEqual({
        totalViews: 150,
        totalTheories: 2,
        averageEngagement: 150, // (200 + 100) / 2
        topCategories: {}
      });
    });
  });
});
