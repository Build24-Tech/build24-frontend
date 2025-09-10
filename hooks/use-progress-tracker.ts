'use client';

import { useAuth } from '@/contexts/AuthContext';
import { progressTracker } from '@/lib/progress-tracker';
import {
  Badge,
  TheoryCategory,
  UserProgress
} from '@/types/knowledge-hub';
import { useCallback, useEffect, useState } from 'react';

interface UseProgressTrackerReturn {
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  newBadges: Badge[];
  markTheoryAsRead: (theoryId: string, category: TheoryCategory, readTime: number) => Promise<void>;
  updateBookmark: (theoryId: string, isBookmarked: boolean) => Promise<void>;
  dismissBadgeNotifications: () => void;
  refreshProgress: () => Promise<void>;
}

export const useProgressTracker = (): UseProgressTrackerReturn => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  // Load user progress on mount and when user changes
  useEffect(() => {
    if (!user?.uid) {
      setUserProgress(null);
      setIsLoading(false);
      return;
    }

    loadUserProgress();
  }, [user?.uid]);

  const loadUserProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);

      let progress = await progressTracker.getUserProgress(user.uid);

      // Initialize progress if it doesn't exist
      if (!progress) {
        progress = await progressTracker.initializeUserProgress(user.uid);
      }

      setUserProgress(progress);
    } catch (err) {
      console.error('Error loading user progress:', err);
      setError('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const markTheoryAsRead = useCallback(async (
    theoryId: string,
    category: TheoryCategory,
    readTime: number
  ) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);

      const result = await progressTracker.markTheoryAsRead(
        user.uid,
        theoryId,
        category,
        readTime
      );

      setUserProgress(result.updatedProgress);

      // Sync with user profile
      await KnowledgeHubIntegrationService.syncProgressWithProfile(user, result.updatedProgress);

      // Track engagement
      await KnowledgeHubIntegrationService.trackEngagement(
        user,
        'theory_view',
        { theoryId, category, readTime }
      );

      // Show badge notifications if new badges were earned
      if (result.newBadges.length > 0) {
        setNewBadges(prev => [...prev, ...result.newBadges]);
      }
    } catch (err) {
      console.error('Error marking theory as read:', err);
      setError('Failed to update reading progress');
    }
  }, [user?.uid]);

  const updateBookmark = useCallback(async (theoryId: string, isBookmarked: boolean) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);

      const result = await progressTracker.updateBookmark(
        user.uid,
        theoryId,
        isBookmarked
      );

      setUserProgress(result.updatedProgress);

      // Sync with user profile
      await KnowledgeHubIntegrationService.syncProgressWithProfile(user, result.updatedProgress);

      // Track engagement
      await KnowledgeHubIntegrationService.trackEngagement(
        user,
        isBookmarked ? 'bookmark_add' : 'bookmark_remove',
        { theoryId }
      );

      // Show badge notifications if new badges were earned
      if (result.newBadges.length > 0) {
        setNewBadges(prev => [...prev, ...result.newBadges]);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
      setError('Failed to update bookmark');
    }
  }, [user?.uid]);

  const dismissBadgeNotifications = useCallback(() => {
    setNewBadges([]);
  }, []);

  const refreshProgress = useCallback(async () => {
    await loadUserProgress();
  }, [loadUserProgress]);

  return {
    userProgress,
    isLoading,
    error,
    newBadges,
    markTheoryAsRead,
    updateBookmark,
    dismissBadgeNotifications,
    refreshProgress
  };
};
