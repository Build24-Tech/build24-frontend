import { useAnalytics, useReadingTimer, useTheoryAnalytics, useTrendingTheories } from '@/hooks/use-analytics';
import { analyticsService } from '@/lib/analytics-service';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mock the analytics service
jest.mock('@/lib/analytics-service');

// Mock the auth context
const mockUser = { uid: 'test-user-123' };
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track view with user ID', async () => {
    const mockTrackTheoryView = jest.spyOn(analyticsService, 'trackTheoryView').mockResolvedValue();

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackView('test-theory', 120);
    });

    expect(mockTrackTheoryView).toHaveBeenCalledWith('test-theory', 'test-user-123', 120);
  });

  it('should track bookmark with user ID', async () => {
    const mockTrackBookmark = jest.spyOn(analyticsService, 'trackBookmark').mockResolvedValue();

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackBookmark('test-theory', 'bookmark');
    });

    expect(mockTrackBookmark).toHaveBeenCalledWith('test-theory', 'test-user-123', 'bookmark');
  });

  it('should track reading completion with user ID', async () => {
    const mockTrackReadingCompletion = jest.spyOn(analyticsService, 'trackReadingCompletion').mockResolvedValue();

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackReadingCompletion('test-theory', 300);
    });

    expect(mockTrackReadingCompletion).toHaveBeenCalledWith('test-theory', 'test-user-123', 300);
  });

  it('should handle tracking state', async () => {
    const mockTrackTheoryView = jest.spyOn(analyticsService, 'trackTheoryView')
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useAnalytics());

    expect(result.current.isTracking).toBe(false);

    act(() => {
      result.current.trackView('test-theory', 120);
    });

    expect(result.current.isTracking).toBe(true);

    await waitFor(() => {
      expect(result.current.isTracking).toBe(false);
    });
  });

  it('should not track when user is not authenticated', async () => {
    // Mock no user
    jest.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({ user: null });

    const mockTrackTheoryView = jest.spyOn(analyticsService, 'trackTheoryView').mockResolvedValue();

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackView('test-theory', 120);
    });

    expect(mockTrackTheoryView).not.toHaveBeenCalled();
  });
});

describe('useTheoryAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch theory analytics', async () => {
    const mockAnalytics = {
      theoryId: 'test-theory',
      viewCount: 100,
      totalReadTime: 3000,
      bookmarkCount: 15,
      averageReadTime: 30,
      popularityScore: 200,
      lastUpdated: new Date() as any,
      dailyViews: {},
      userEngagement: {
        uniqueViewers: 80,
        returningViewers: 20,
        completionRate: 0.75
      }
    };

    const mockGetTheoryAnalytics = jest.spyOn(analyticsService, 'getTheoryAnalytics')
      .mockResolvedValue(mockAnalytics);

    const { result } = renderHook(() => useTheoryAnalytics('test-theory'));

    expect(result.current.loading).toBe(true);
    expect(result.current.analytics).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.analytics).toEqual(mockAnalytics);
    expect(result.current.error).toBeNull();
    expect(mockGetTheoryAnalytics).toHaveBeenCalledWith('test-theory');
  });

  it('should handle analytics fetch error', async () => {
    const mockGetTheoryAnalytics = jest.spyOn(analyticsService, 'getTheoryAnalytics')
      .mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useTheoryAnalytics('test-theory'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.analytics).toBeNull();
    expect(result.current.error).toBe('Failed to fetch');
  });

  it('should not fetch when theoryId is empty', () => {
    const mockGetTheoryAnalytics = jest.spyOn(analyticsService, 'getTheoryAnalytics');

    renderHook(() => useTheoryAnalytics(''));

    expect(mockGetTheoryAnalytics).not.toHaveBeenCalled();
  });
});

describe('useTrendingTheories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch trending theories', async () => {
    const mockTrending = [
      {
        theoryId: 'theory1',
        title: 'Theory 1',
        category: 'Cognitive Biases',
        viewCount: 100,
        popularityScore: 200,
        trendScore: 25
      },
      {
        theoryId: 'theory2',
        title: 'Theory 2',
        category: 'Persuasion',
        viewCount: 80,
        popularityScore: 150,
        trendScore: 20
      }
    ];

    const mockGetTrendingTheories = jest.spyOn(analyticsService, 'getTrendingTheories')
      .mockResolvedValue(mockTrending);

    const { result } = renderHook(() => useTrendingTheories(5));

    expect(result.current.loading).toBe(true);
    expect(result.current.trending).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trending).toEqual(mockTrending);
    expect(result.current.error).toBeNull();
    expect(mockGetTrendingTheories).toHaveBeenCalledWith(5);
  });

  it('should refresh trending theories', async () => {
    const mockTrending = [
      {
        theoryId: 'theory1',
        title: 'Theory 1',
        category: 'Cognitive Biases',
        viewCount: 100,
        popularityScore: 200,
        trendScore: 25
      }
    ];

    const mockGetTrendingTheories = jest.spyOn(analyticsService, 'getTrendingTheories')
      .mockResolvedValue(mockTrending);

    const { result } = renderHook(() => useTrendingTheories(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetTrendingTheories).toHaveBeenCalledTimes(2);
  });
});

describe('useReadingTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start and stop reading timer', async () => {
    const mockTrackView = jest.fn();
    const mockTrackReadingCompletion = jest.fn();

    // Mock useAnalytics hook
    jest.mocked(require('@/hooks/use-analytics').useAnalytics).mockReturnValue({
      trackView: mockTrackView,
      trackReadingCompletion: mockTrackReadingCompletion
    });

    const { result } = renderHook(() => useReadingTimer('test-theory'));

    expect(result.current.isReading).toBe(false);
    expect(result.current.sessionDuration).toBe(0);

    act(() => {
      result.current.startReading();
    });

    expect(result.current.isReading).toBe(true);
    expect(mockTrackView).toHaveBeenCalledWith('test-theory');

    // Simulate 60 seconds passing
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.sessionDuration).toBe(60);

    act(() => {
      result.current.stopReading();
    });

    expect(result.current.isReading).toBe(false);
    expect(mockTrackReadingCompletion).toHaveBeenCalledWith('test-theory', 60);
  });

  it('should pause reading timer', async () => {
    const mockTrackView = jest.fn();

    jest.mocked(require('@/hooks/use-analytics').useAnalytics).mockReturnValue({
      trackView: mockTrackView,
      trackReadingCompletion: jest.fn()
    });

    const { result } = renderHook(() => useReadingTimer('test-theory'));

    act(() => {
      result.current.startReading();
    });

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    act(() => {
      result.current.pauseReading();
    });

    expect(result.current.isReading).toBe(false);
    expect(mockTrackView).toHaveBeenCalledWith('test-theory', 30);
  });

  it('should not track completion for short sessions', async () => {
    const mockTrackReadingCompletion = jest.fn();

    jest.mocked(require('@/hooks/use-analytics').useAnalytics).mockReturnValue({
      trackView: jest.fn(),
      trackReadingCompletion: mockTrackReadingCompletion
    });

    const { result } = renderHook(() => useReadingTimer('test-theory'));

    act(() => {
      result.current.startReading();
    });

    // Only 20 seconds
    act(() => {
      jest.advanceTimersByTime(20000);
    });

    act(() => {
      result.current.stopReading();
    });

    expect(mockTrackReadingCompletion).not.toHaveBeenCalled();
  });
});
