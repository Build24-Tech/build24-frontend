'use client';

import { useAuth } from '@/contexts/AuthContext';
import { analyticsService, TheoryAnalytics, TrendingTheory } from '@/lib/analytics-service';
import { useCallback, useEffect, useState } from 'react';

export function useAnalytics() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);

  const trackView = useCallback(async (theoryId: string, sessionDuration?: number) => {
    if (!user?.uid) return;

    setIsTracking(true);
    try {
      await analyticsService.trackTheoryView(theoryId, user.uid, sessionDuration);
    } catch (error) {
      console.error('Failed to track view:', error);
    } finally {
      setIsTracking(false);
    }
  }, [user?.uid]);

  const trackBookmark = useCallback(async (theoryId: string, action: 'bookmark' | 'unbookmark') => {
    if (!user?.uid) return;

    try {
      await analyticsService.trackBookmark(theoryId, user.uid, action);
    } catch (error) {
      console.error('Failed to track bookmark:', error);
    }
  }, [user?.uid]);

  const trackReadingCompletion = useCallback(async (theoryId: string, readTime: number) => {
    if (!user?.uid) return;

    try {
      await analyticsService.trackReadingCompletion(theoryId, user.uid, readTime);
    } catch (error) {
      console.error('Failed to track reading completion:', error);
    }
  }, [user?.uid]);

  return {
    trackView,
    trackBookmark,
    trackReadingCompletion,
    isTracking
  };
}

export function useTheoryAnalytics(theoryId: string) {
  const [analytics, setAnalytics] = useState<TheoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!theoryId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getTheoryAnalytics(theoryId);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [theoryId]);

  return { analytics, loading, error };
}

export function useTrendingTheories(limit: number = 10) {
  const [trending, setTrending] = useState<TrendingTheory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getTrendingTheories(limit);
        setTrending(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending theories');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  const refresh = useCallback(async () => {
    try {
      const data = await analyticsService.getTrendingTheories(limit);
      setTrending(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh trending theories');
    }
  }, [limit]);

  return { trending, loading, error, refresh };
}

export function useReadingTimer(theoryId: string) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);
  const { trackView, trackReadingCompletion } = useAnalytics();

  const startReading = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setIsReading(true);

    // Track initial view
    trackView(theoryId);
  }, [theoryId, trackView]);

  const stopReading = useCallback(() => {
    if (!startTime || !isReading) return;

    const sessionDuration = Math.round((Date.now() - startTime) / 1000); // in seconds
    setIsReading(false);
    setStartTime(null);

    // Track completion with session duration
    if (sessionDuration > 30) { // Only track if read for more than 30 seconds
      trackReadingCompletion(theoryId, sessionDuration);
    }
  }, [startTime, isReading, theoryId, trackReadingCompletion]);

  const pauseReading = useCallback(() => {
    if (!startTime || !isReading) return;

    const sessionDuration = Math.round((Date.now() - startTime) / 1000);
    setIsReading(false);

    // Track view with current session duration
    trackView(theoryId, sessionDuration);
  }, [startTime, isReading, theoryId, trackView]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (isReading) {
        stopReading();
      }
    };
  }, [isReading, stopReading]);

  return {
    startReading,
    stopReading,
    pauseReading,
    isReading,
    sessionDuration: startTime ? Math.round((Date.now() - startTime) / 1000) : 0
  };
}
