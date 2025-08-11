'use client';

import { useProgressTracker } from '@/hooks/use-progress-tracker';
import { useToast } from '@/hooks/use-toast';
import { TheoryCategory } from '@/types/knowledge-hub';
import { useCallback } from 'react';

interface ProgressIntegrationProps {
  children: (props: {
    bookmarkedTheories: string[];
    isBookmarked: (theoryId: string) => boolean;
    toggleBookmark: (theoryId: string) => Promise<void>;
    markTheoryAsRead: (theoryId: string, category: TheoryCategory, readTime: number) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

/**
 * ProgressIntegration component that provides unified progress tracking and bookmark functionality
 * This replaces the separate BookmarkManager and integrates everything through the progress tracker
 */
export function ProgressIntegration({ children }: ProgressIntegrationProps) {
  const {
    userProgress,
    isLoading,
    error,
    markTheoryAsRead: progressMarkAsRead,
    updateBookmark: progressUpdateBookmark
  } = useProgressTracker();

  const { toast } = useToast();

  // Check if a theory is bookmarked
  const isBookmarked = useCallback((theoryId: string): boolean => {
    return userProgress?.bookmarkedTheories.includes(theoryId) || false;
  }, [userProgress?.bookmarkedTheories]);

  // Toggle bookmark status with toast notifications
  const toggleBookmark = useCallback(async (theoryId: string): Promise<void> => {
    try {
      const wasBookmarked = isBookmarked(theoryId);

      await progressUpdateBookmark(theoryId, !wasBookmarked);

      toast({
        title: wasBookmarked ? 'Bookmark removed' : 'Theory bookmarked',
        description: wasBookmarked
          ? 'Theory removed from your bookmarks'
          : 'Theory added to your bookmarks',
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      });
    }
  }, [isBookmarked, progressUpdateBookmark, toast]);

  // Mark theory as read with toast notifications
  const markTheoryAsRead = useCallback(async (
    theoryId: string,
    category: TheoryCategory,
    readTime: number
  ): Promise<void> => {
    try {
      await progressMarkAsRead(theoryId, category, readTime);
    } catch (err) {
      console.error('Failed to mark theory as read:', err);
      // Don't show error toast for reading progress as it's less critical
    }
  }, [progressMarkAsRead]);

  return (
    <>
      {children({
        bookmarkedTheories: userProgress?.bookmarkedTheories || [],
        isBookmarked,
        toggleBookmark,
        markTheoryAsRead,
        isLoading,
        error
      })}
    </>
  );
}

// Hook version for easier usage in components
export function useProgressIntegration() {
  const {
    userProgress,
    isLoading,
    error,
    markTheoryAsRead: progressMarkAsRead,
    updateBookmark: progressUpdateBookmark
  } = useProgressTracker();

  const { toast } = useToast();

  // Check if a theory is bookmarked
  const isBookmarked = useCallback((theoryId: string): boolean => {
    return userProgress?.bookmarkedTheories.includes(theoryId) || false;
  }, [userProgress?.bookmarkedTheories]);

  // Toggle bookmark status with toast notifications
  const toggleBookmark = useCallback(async (theoryId: string): Promise<void> => {
    try {
      const wasBookmarked = isBookmarked(theoryId);

      await progressUpdateBookmark(theoryId, !wasBookmarked);

      toast({
        title: wasBookmarked ? 'Bookmark removed' : 'Theory bookmarked',
        description: wasBookmarked
          ? 'Theory removed from your bookmarks'
          : 'Theory added to your bookmarks',
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      });
    }
  }, [isBookmarked, progressUpdateBookmark, toast]);

  // Mark theory as read with toast notifications
  const markTheoryAsRead = useCallback(async (
    theoryId: string,
    category: TheoryCategory,
    readTime: number
  ): Promise<void> => {
    try {
      await progressMarkAsRead(theoryId, category, readTime);
    } catch (err) {
      console.error('Failed to mark theory as read:', err);
      // Don't show error toast for reading progress as it's less critical
    }
  }, [progressMarkAsRead]);

  return {
    userProgress,
    bookmarkedTheories: userProgress?.bookmarkedTheories || [],
    isBookmarked,
    toggleBookmark,
    markTheoryAsRead,
    isLoading,
    error
  };
}
