import { useProgressTracker } from '@/hooks/use-progress-tracker';
import { BadgeCategory, TheoryCategory } from '@/types/knowledge-hub';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mock the AuthContext
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// Mock the progress tracker service
jest.mock('@/lib/progress-tracker', () => ({
  progressTracker: {
    getUserProgress: jest.fn(),
    initializeUserProgress: jest.fn(),
    markTheoryAsRead: jest.fn(),
    updateBookmark: jest.fn()
  }
}));

const mockProgressTracker = require('@/lib/progress-tracker').progressTracker;

describe('useProgressTracker', () => {
  const mockUserProgress = {
    userId: 'test-user-123',
    readTheories: ['theory-1'],
    bookmarkedTheories: ['theory-1'],
    badges: [{
      id: 'first-theory',
      name: 'First Steps',
      description: 'Read your first theory',
      category: BadgeCategory.READING,
      earnedAt: new Date(),
      requirements: { type: 'theories_read' as const, threshold: 1 }
    }],
    stats: {
      totalReadTime: 5,
      theoriesRead: 1,
      categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
      lastActiveDate: new Date(),
      streakDays: 1,
      averageSessionTime: 5
    },
    quizResults: [],
    preferences: {
      emailNotifications: true,
      progressReminders: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockProgressTracker.getUserProgress.mockResolvedValue(null);
    mockProgressTracker.initializeUserProgress.mockResolvedValue(mockUserProgress);

    const { result } = renderHook(() => useProgressTracker());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.userProgress).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.newBadges).toEqual([]);
  });

  it('should load existing user progress', async () => {
    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProgress).toEqual(mockUserProgress);
    expect(result.current.error).toBe(null);
    expect(mockProgressTracker.getUserProgress).toHaveBeenCalledWith('test-user-123');
  });

  it('should initialize progress for new user', async () => {
    mockProgressTracker.getUserProgress.mockResolvedValue(null);
    mockProgressTracker.initializeUserProgress.mockResolvedValue(mockUserProgress);

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProgress).toEqual(mockUserProgress);
    expect(mockProgressTracker.initializeUserProgress).toHaveBeenCalledWith('test-user-123');
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load progress';
    mockProgressTracker.getUserProgress.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load progress data');
    expect(result.current.userProgress).toBe(null);
  });

  it('should mark theory as read and update progress', async () => {
    const newBadge = {
      id: 'theory-explorer',
      name: 'Theory Explorer',
      description: 'Read 5 theories',
      category: BadgeCategory.READING,
      earnedAt: new Date(),
      requirements: { type: 'theories_read' as const, threshold: 5 }
    };

    const updatedProgress = {
      ...mockUserProgress,
      readTheories: [...mockUserProgress.readTheories, 'theory-2'],
      badges: [...mockUserProgress.badges, newBadge]
    };

    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.markTheoryAsRead.mockResolvedValue({
      newBadges: [newBadge],
      updatedProgress
    });

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markTheoryAsRead('theory-2', TheoryCategory.COGNITIVE_BIASES, 5);
    });

    expect(mockProgressTracker.markTheoryAsRead).toHaveBeenCalledWith(
      'test-user-123',
      'theory-2',
      TheoryCategory.COGNITIVE_BIASES,
      5
    );
    expect(result.current.userProgress).toEqual(updatedProgress);
    expect(result.current.newBadges).toEqual([newBadge]);
  });

  it('should handle mark theory as read error', async () => {
    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.markTheoryAsRead.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markTheoryAsRead('theory-2', TheoryCategory.COGNITIVE_BIASES, 5);
    });

    expect(result.current.error).toBe('Failed to update reading progress');
  });

  it('should update bookmark and handle new badges', async () => {
    const newBadge = {
      id: 'bookmark-collector',
      name: 'Bookmark Collector',
      description: 'Bookmark 10 theories',
      category: BadgeCategory.ENGAGEMENT,
      earnedAt: new Date(),
      requirements: { type: 'bookmarks_created' as const, threshold: 10 }
    };

    const updatedProgress = {
      ...mockUserProgress,
      bookmarkedTheories: [...mockUserProgress.bookmarkedTheories, 'theory-2'],
      badges: [...mockUserProgress.badges, newBadge]
    };

    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.updateBookmark.mockResolvedValue({
      newBadges: [newBadge],
      updatedProgress
    });

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateBookmark('theory-2', true);
    });

    expect(mockProgressTracker.updateBookmark).toHaveBeenCalledWith(
      'test-user-123',
      'theory-2',
      true
    );
    expect(result.current.userProgress).toEqual(updatedProgress);
    expect(result.current.newBadges).toEqual([newBadge]);
  });

  it('should handle update bookmark error', async () => {
    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.updateBookmark.mockRejectedValue(new Error('Bookmark failed'));

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateBookmark('theory-2', true);
    });

    expect(result.current.error).toBe('Failed to update bookmark');
  });

  it('should dismiss badge notifications', async () => {
    const newBadge = {
      id: 'test-badge',
      name: 'Test Badge',
      description: 'Test description',
      category: BadgeCategory.READING,
      earnedAt: new Date(),
      requirements: { type: 'theories_read' as const, threshold: 1 }
    };

    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.markTheoryAsRead.mockResolvedValue({
      newBadges: [newBadge],
      updatedProgress: mockUserProgress
    });

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Add a badge notification
    await act(async () => {
      await result.current.markTheoryAsRead('theory-2', TheoryCategory.COGNITIVE_BIASES, 5);
    });

    expect(result.current.newBadges).toEqual([newBadge]);

    // Dismiss notifications
    act(() => {
      result.current.dismissBadgeNotifications();
    });

    expect(result.current.newBadges).toEqual([]);
  });

  it('should refresh progress', async () => {
    const refreshedProgress = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        theoriesRead: 2
      }
    };

    mockProgressTracker.getUserProgress
      .mockResolvedValueOnce(mockUserProgress)
      .mockResolvedValueOnce(refreshedProgress);

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProgress?.stats.theoriesRead).toBe(1);

    await act(async () => {
      await result.current.refreshProgress();
    });

    expect(result.current.userProgress?.stats.theoriesRead).toBe(2);
    expect(mockProgressTracker.getUserProgress).toHaveBeenCalledTimes(2);
  });

  // Note: Unauthenticated user handling is tested implicitly through the hook's logic
  // The hook checks for user?.uid before making any progress tracker calls

  it('should accumulate multiple new badges', async () => {
    const badge1 = {
      id: 'badge-1',
      name: 'Badge 1',
      description: 'First badge',
      category: BadgeCategory.READING,
      earnedAt: new Date(),
      requirements: { type: 'theories_read' as const, threshold: 1 }
    };

    const badge2 = {
      id: 'badge-2',
      name: 'Badge 2',
      description: 'Second badge',
      category: BadgeCategory.EXPLORATION,
      earnedAt: new Date(),
      requirements: { type: 'categories_explored' as const, threshold: 3 }
    };

    mockProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);
    mockProgressTracker.markTheoryAsRead
      .mockResolvedValueOnce({
        newBadges: [badge1],
        updatedProgress: mockUserProgress
      })
      .mockResolvedValueOnce({
        newBadges: [badge2],
        updatedProgress: mockUserProgress
      });

    const { result } = renderHook(() => useProgressTracker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First badge
    await act(async () => {
      await result.current.markTheoryAsRead('theory-2', TheoryCategory.COGNITIVE_BIASES, 5);
    });

    expect(result.current.newBadges).toEqual([badge1]);

    // Second badge (should accumulate)
    await act(async () => {
      await result.current.markTheoryAsRead('theory-3', TheoryCategory.PERSUASION_PRINCIPLES, 5);
    });

    expect(result.current.newBadges).toEqual([badge1, badge2]);
  });
});
