'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BookmarkService } from '@/lib/bookmark-service';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BookmarkManagerProps {
  children: (props: {
    bookmarkedTheories: string[];
    isBookmarked: (theoryId: string) => boolean;
    toggleBookmark: (theoryId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

/**
 * BookmarkManager component that provides bookmark functionality through render props pattern
 * Handles all bookmark state management and Firestore synchronization
 */
export function BookmarkManager({ children }: BookmarkManagerProps) {
  const { user } = useAuth();
  const [bookmarkedTheories, setBookmarkedTheories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's bookmarks on mount and when user changes
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) {
        setBookmarkedTheories([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const bookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(bookmarks);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Failed to load bookmarks');
        toast.error('Failed to load your bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  // Check if a theory is bookmarked
  const isBookmarked = useCallback((theoryId: string): boolean => {
    return bookmarkedTheories.includes(theoryId);
  }, [bookmarkedTheories]);

  // Toggle bookmark status
  const toggleBookmark = useCallback(async (theoryId: string): Promise<void> => {
    if (!user) {
      toast.error('Please sign in to bookmark theories');
      return;
    }

    try {
      const wasBookmarked = isBookmarked(theoryId);

      // Optimistically update UI
      if (wasBookmarked) {
        setBookmarkedTheories(prev => prev.filter(id => id !== theoryId));
        toast.success('Bookmark removed');
      } else {
        setBookmarkedTheories(prev => [...prev, theoryId]);
        toast.success('Theory bookmarked');
      }

      // Update in Firestore
      const newBookmarkStatus = await BookmarkService.toggleBookmark(user.uid, theoryId);

      // Verify the optimistic update was correct
      if (newBookmarkStatus !== !wasBookmarked) {
        // Revert if there was a mismatch
        const actualBookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(actualBookmarks);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);

      // Revert optimistic update on error
      try {
        const actualBookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(actualBookmarks);
      } catch (revertErr) {
        console.error('Failed to revert bookmark state:', revertErr);
      }

      toast.error('Failed to update bookmark');
    }
  }, [user, isBookmarked]);

  return (
    <>
      {children({
        bookmarkedTheories,
        isBookmarked,
        toggleBookmark,
        isLoading,
        error
      })}
    </>
  );
}

// Hook version for easier usage in components
export function useBookmarkManager() {
  const { user } = useAuth();
  const [bookmarkedTheories, setBookmarkedTheories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's bookmarks on mount and when user changes
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) {
        setBookmarkedTheories([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const bookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(bookmarks);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [user]);

  // Check if a theory is bookmarked
  const isBookmarked = useCallback((theoryId: string): boolean => {
    return bookmarkedTheories.includes(theoryId);
  }, [bookmarkedTheories]);

  // Toggle bookmark status
  const toggleBookmark = useCallback(async (theoryId: string): Promise<void> => {
    if (!user) {
      toast.error('Please sign in to bookmark theories');
      return;
    }

    try {
      const wasBookmarked = isBookmarked(theoryId);

      // Optimistically update UI
      if (wasBookmarked) {
        setBookmarkedTheories(prev => prev.filter(id => id !== theoryId));
        toast.success('Bookmark removed');
      } else {
        setBookmarkedTheories(prev => [...prev, theoryId]);
        toast.success('Theory bookmarked');
      }

      // Update in Firestore
      const newBookmarkStatus = await BookmarkService.toggleBookmark(user.uid, theoryId);

      // Verify the optimistic update was correct
      if (newBookmarkStatus !== !wasBookmarked) {
        // Revert if there was a mismatch
        const actualBookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(actualBookmarks);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);

      // Revert optimistic update on error
      try {
        const actualBookmarks = await BookmarkService.getUserBookmarks(user.uid);
        setBookmarkedTheories(actualBookmarks);
      } catch (revertErr) {
        console.error('Failed to revert bookmark state:', revertErr);
      }

      toast.error('Failed to update bookmark');
    }
  }, [user, isBookmarked]);

  return {
    bookmarkedTheories,
    isBookmarked,
    toggleBookmark,
    isLoading,
    error,
    user
  };
}
