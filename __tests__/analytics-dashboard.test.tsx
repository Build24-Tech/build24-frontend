import { AnalyticsDashboard } from '@/components/knowledge-hub/AnalyticsDashboard';
import { analyticsService } from '@/lib/analytics-service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the analytics service
jest.mock('@/lib/analytics-service');

// Mock the hooks
jest.mock('@/hooks/use-analytics', () => ({
  useTrendingTheories: jest.fn(() => ({
    trending: [
      {
        theoryId: 'trending-theory',
        title: 'Trending Theory',
        category: 'Cognitive Biases',
        viewCount: 150,
        popularityScore: 300,
        trendScore: 45
      }
    ],
    loading: false,
    error: null,
    refresh: jest.fn()
  }))
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock analytics service methods
    jest.spyOn(analyticsService, 'getAnalyticsSummary').mockResolvedValue({
      totalViews: 1500,
      totalTheories: 25,
      averageEngagement: 120,
      topCategories: {
        'Cognitive Biases': 600,
        'Persuasion Principles': 450,
        'UX Psychology': 300
      }
    });
  });

  it('should render analytics dashboard', async () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument(); // Total views
      expect(screen.getByText('25')).toBeInTheDocument(); // Total theories
      expect(screen.getByText('120')).toBeInTheDocument(); // Average engagement
    });
  });

  it('should show loading state initially', () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('should display trending theories', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Trending Theory')).toBeInTheDocument();
      expect(screen.getByText('Cognitive Biases • 150 views')).toBeInTheDocument();
      expect(screen.getByText('45 trend')).toBeInTheDocument();
    });
  });

  it('should handle refresh functionality', async () => {
    const mockRefresh = jest.fn();
    const mockUseTrendingTheories = require('@/hooks/use-analytics').useTrendingTheories;
    mockUseTrendingTheories.mockReturnValue({
      trending: [],
      loading: false,
      error: null,
      refresh: mockRefresh
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should switch between tabs', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check default tab
    expect(screen.getByText('Trending Theories')).toBeInTheDocument();

    // Switch to popular tab
    fireEvent.click(screen.getByRole('tab', { name: 'Most Popular' }));
    expect(screen.getByText('Most Popular Theories')).toBeInTheDocument();

    // Switch to categories tab
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));
    expect(screen.getByText('Category Performance')).toBeInTheDocument();

    // Switch to engagement tab
    fireEvent.click(screen.getByRole('tab', { name: 'Engagement' }));
    expect(screen.getByText('Reading Patterns')).toBeInTheDocument();
  });

  it('should display category performance data', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));

    // Note: The actual category data display would depend on the implementation
    expect(screen.getByText('Category Performance')).toBeInTheDocument();
  });

  it('should handle analytics service errors', async () => {
    jest.spyOn(analyticsService, 'getAnalyticsSummary').mockRejectedValue(new Error('Service error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should still render with default values
    expect(screen.getByText('0')).toBeInTheDocument(); // Default values

    consoleSpy.mockRestore();
  });

  it('should display engagement metrics', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Engagement' }));

    expect(screen.getByText('Reading Patterns')).toBeInTheDocument();
    expect(screen.getByText('Average Read Time')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Bookmark Rate')).toBeInTheDocument();
    expect(screen.getByText('Return Rate')).toBeInTheDocument();
  });

  it('should show recent activity', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Engagement' }));

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
  });
});
