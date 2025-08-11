import { BookmarkManager, useBookmarkManager } from '@/components/knowledge-hub/BookmarkManager';
import { BookmarkService } from '@/lib/bookmark-service';
import { UserProfile } from '@/types/user';
import { act, renderHook, waitFor } from '@testing-library/react';
import { User } from 'firebase/auth';
import React from 'react';
import { createContext } from 'vm';

// Mock the BookmarkService
jest.mock('@/lib/bookmark-service');
const mockBookmarkService = BookmarkService as jest.Mocked<typeof BookmarkService>;

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock user and auth context
const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockUserProfile: UserProfile = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  status: 'active',
  emailUpdates: true,
  language: 'en',
  theme: 'system',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Create a mock AuthContext
const AuthContext = createContext<any>(null);

const mockAuthContextValue = {
  user: mockUser as User,
  userProfile: mockUserProfile,
  loading: false,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithGithub: jest.fn(),
  signInWithApple: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  updateLanguage: jest.fn(),
  refreshUserProfile: jest.fn(),
};

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
}));

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={mockAuthContextValue}>
    {children}
  </AuthContext.Provider>
);

describe('BookmarkManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useBookmarkManager hook', () => {
    it('should load bookmarks on mount when user is authenticated', async () => {
      const mockBookmarks = ['theory-1', 'theory-2'];
      mockBookmarkService.getUserBookmarks.mockResolvedValue(mockBookmarks);

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockBookmarkService.getUserBookmarks).toHaveBeenCalledWith('test-user-id');
      expect(result.current.bookmarkedTheories).toEqual(mockBookmarks);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty bookmarks list', async () => {
      mockBookmarkService.getUserBookmarks.mockResolvedValue([]);

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bookmarkedTheories).toEqual([]);
      expect(result.current.isBookmarked('theory-1')).toBe(false);
    });

    it('should handle bookmark loading error', async () => {
      const errorMessage = 'Failed to load bookmarks';
      mockBookmarkService.getUserBookmarks.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load bookmarks');
      expect(result.current.bookmarkedTheories).toEqual([]);
    });

    it('should correctly identify bookmarked theories', async () => {
      const mockBookmarks = ['theory-1', 'theory-3'];
      mockBookmarkService.getUserBookmarks.mockResolvedValue(mockBookmarks);

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isBookmarked('theory-1')).toBe(true);
      expect(result.current.isBookmarked('theory-2')).toBe(false);
      expect(result.current.isBookmarked('theory-3')).toBe(true);
    });

    it('should toggle bookmark successfully', async () => {
      const mockBookmarks = ['theory-1'];
      mockBookmarkService.getUserBookmarks.mockResolvedValue(mockBookmarks);
      mockBookmarkService.toggleBookmark.mockResolvedValue(true);

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially theory-2 is not bookmarked
      expect(result.current.isBookmarked('theory-2')).toBe(false);

      // Toggle bookmark for theory-2
      await act(async () => {
        await result.current.toggleBookmark('theory-2');
      });

      expect(mockBookmarkService.toggleBookmark).toHaveBeenCalledWith('test-user-id', 'theory-2');

      // Should optimistically update the UI
      expect(result.current.isBookmarked('theory-2')).toBe(true);
    });

    it('should remove bookmark successfully', async () => {
      const mockBookmarks = ['theory-1', 'theory-2'];
      mockBookmarkService.getUserBookmarks.mockResolvedValue(mockBookmarks);
      mockBookmarkService.toggleBookmark.mockResolvedValue(false);

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially theory-1 is bookmarked
      expect(result.current.isBookmarked('theory-1')).toBe(true);

      // Toggle bookmark for theory-1 (remove it)
      await act(async () => {
        await result.current.toggleBookmark('theory-1');
      });

      expect(mockBookmarkService.toggleBookmark).toHaveBeenCalledWith('test-user-id', 'theory-1');

      // Should optimistically update the UI
      expect(result.current.isBookmarked('theory-1')).toBe(false);
    });

    it('should handle bookmark toggle error and revert optimistic update', async () => {
      const mockBookmarks = ['theory-1'];
      mockBookmarkService.getUserBookmarks
        .mockResolvedValueOnce(mockBookmarks) // Initial load
        .mockResolvedValueOnce(mockBookmarks); // Revert call
      mockBookmarkService.toggleBookmark.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially theory-2 is not bookmarked
      expect(result.current.isBookmarked('theory-2')).toBe(false);

      // Try to toggle bookmark for theory-2 (should fail)
      await act(async () => {
        await result.current.toggleBookmark('theory-2');
      });

      // Should revert the optimistic update
      await waitFor(() => {
        expect(result.current.isBookmarked('theory-2')).toBe(false);
      });

      expect(mockBookmarkService.getUserBookmarks).toHaveBeenCalledTimes(2);
    });

    it('should not allow bookmarking when user is not authenticated', async () => {
      const unauthenticatedAuthValue = {
        ...mockAuthContextValue,
        user: null,
      };

      const UnauthenticatedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <AuthContext.Provider value={unauthenticatedAuthValue}>
          {children}
        </AuthContext.Provider>
      );

      const { result } = renderHook(() => useBookmarkManager(), {
        wrapper: UnauthenticatedWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bookmarkedTheories).toEqual([]);
      expect(result.current.user).toBeNull();

      // Try to toggle bookmark without authentication
      await act(async () => {
        await result.current.toggleBookmark('theory-1');
      });

      // Should not call the service
      expect(mockBookmarkService.toggleBookmark).not.toHaveBeenCalled();
    });
  });

  describe('BookmarkManager render prop component', () => {
    it('should provide bookmark functionality through render props', async () => {
      const mockBookmarks = ['theory-1'];
      mockBookmarkService.getUserBookmarks.mockResolvedValue(mockBookmarks);

      const mockChildren = jest.fn().mockReturnValue(<div>Test Content</div>);

      const { rerender } = renderHook(() => (
        <AuthWrapper>
          <BookmarkManager>{mockChildren}</BookmarkManager>
        </AuthWrapper>
      ));

      await waitFor(() => {
        expect(mockChildren).toHaveBeenCalledWith(
          expect.objectContaining({
            bookmarkedTheories: ['theory-1'],
            isBookmarked: expect.any(Function),
            toggleBookmark: expect.any(Function),
            isLoading: false,
            error: null,
          })
        );
      });

      // Test the isBookmarked function
      const lastCall = mockChildren.mock.calls[mockChildren.mock.calls.length - 1];
      const { isBookmarked } = lastCall[0];

      expect(isBookmarked('theory-1')).toBe(true);
      expect(isBookmarked('theory-2')).toBe(false);
    });
  });
});
