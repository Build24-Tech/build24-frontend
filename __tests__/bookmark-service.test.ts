import { BookmarkService } from '@/lib/bookmark-service';
import { UserProgress } from '@/types/knowledge-hub';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

describe('BookmarkService', () => {
  const mockUserId = 'test-user-id';
  const mockTheoryId = 'test-theory-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBookmarks', () => {
    it('should return user bookmarks when document exists', async () => {
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: ['theory-1', 'theory-2'],
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await BookmarkService.getUserBookmarks(mockUserId);

      expect(result).toEqual(['theory-1', 'theory-2']);
      expect(mockDoc).toHaveBeenCalledWith({}, 'userProgress', mockUserId);
      expect(mockGetDoc).toHaveBeenCalled();
    });

    it('should return empty array when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await BookmarkService.getUserBookmarks(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle errors and throw appropriate message', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(BookmarkService.getUserBookmarks(mockUserId)).rejects.toThrow('Failed to fetch bookmarks');
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark to existing user progress', async () => {
      const existingBookmarks = ['theory-1'];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await BookmarkService.addBookmark(mockUserId, mockTheoryId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        bookmarkedTheories: ['theory-1', mockTheoryId],
        updatedAt: expect.any(Date),
      });
    });

    it('should not add duplicate bookmark', async () => {
      const existingBookmarks = ['theory-1', mockTheoryId];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      await BookmarkService.addBookmark(mockUserId, mockTheoryId);

      // Should not call updateDoc since bookmark already exists
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should create new user progress document when none exists', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockSetDoc.mockResolvedValue(undefined);

      await BookmarkService.addBookmark(mockUserId, mockTheoryId);

      expect(mockSetDoc).toHaveBeenCalledWith({}, expect.objectContaining({
        userId: mockUserId,
        bookmarkedTheories: [mockTheoryId],
        readTheories: [],
        badges: [],
        quizResults: [],
        stats: expect.any(Object),
        preferences: expect.any(Object),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
    });

    it('should handle errors and throw appropriate message', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(BookmarkService.addBookmark(mockUserId, mockTheoryId)).rejects.toThrow('Failed to add bookmark');
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark from user progress', async () => {
      const existingBookmarks = ['theory-1', mockTheoryId, 'theory-3'];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await BookmarkService.removeBookmark(mockUserId, mockTheoryId);

      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        bookmarkedTheories: ['theory-1', 'theory-3'],
        updatedAt: expect.any(Date),
      });
    });

    it('should handle case when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      // Should not throw error, just do nothing
      await expect(BookmarkService.removeBookmark(mockUserId, mockTheoryId)).resolves.toBeUndefined();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors and throw appropriate message', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(BookmarkService.removeBookmark(mockUserId, mockTheoryId)).rejects.toThrow('Failed to remove bookmark');
    });
  });

  describe('toggleBookmark', () => {
    it('should add bookmark when not currently bookmarked', async () => {
      const existingBookmarks = ['theory-1'];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await BookmarkService.toggleBookmark(mockUserId, mockTheoryId);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        bookmarkedTheories: ['theory-1', mockTheoryId],
        updatedAt: expect.any(Date),
      });
    });

    it('should remove bookmark when currently bookmarked', async () => {
      const existingBookmarks = ['theory-1', mockTheoryId];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await BookmarkService.toggleBookmark(mockUserId, mockTheoryId);

      expect(result).toBe(false);
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        bookmarkedTheories: ['theory-1'],
        updatedAt: expect.any(Date),
      });
    });

    it('should handle errors and throw appropriate message', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(BookmarkService.toggleBookmark(mockUserId, mockTheoryId)).rejects.toThrow('Failed to toggle bookmark');
    });
  });

  describe('isBookmarked', () => {
    it('should return true when theory is bookmarked', async () => {
      const existingBookmarks = ['theory-1', mockTheoryId];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await BookmarkService.isBookmarked(mockUserId, mockTheoryId);

      expect(result).toBe(true);
    });

    it('should return false when theory is not bookmarked', async () => {
      const existingBookmarks = ['theory-1'];
      const mockUserProgress: UserProgress = {
        userId: mockUserId,
        readTheories: [],
        bookmarkedTheories: existingBookmarks,
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 0,
          averageSessionTime: 0,
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockUserProgress,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await BookmarkService.isBookmarked(mockUserId, mockTheoryId);

      expect(result).toBe(false);
    });

    it('should return false when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await BookmarkService.isBookmarked(mockUserId, mockTheoryId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await BookmarkService.isBookmarked(mockUserId, mockTheoryId);

      expect(result).toBe(false);
    });
  });
});
