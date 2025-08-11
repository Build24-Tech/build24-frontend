import ProgressTracker from '@/components/knowledge-hub/ProgressTracker';
import {
  Badge,
  BadgeCategory,
  TheoryCategory,
  UserProgress
} from '@/types/knowledge-hub';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div
      className={`progress ${className}`}
      data-value={value}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: `${value}%` }} />
    </div>
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} className={`button ${variant} ${className}`}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? <div data-testid="dialog" onClick={() => onOpenChange(false)}>{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default={defaultValue}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>
}));

describe('ProgressTracker', () => {
  const mockBadge: Badge = {
    id: 'first-theory',
    name: 'First Steps',
    description: 'Read your first theory',
    category: BadgeCategory.READING,
    earnedAt: new Date('2024-01-20'),
    requirements: {
      type: 'theories_read',
      threshold: 1
    }
  };

  const mockUserProgress: UserProgress = {
    userId: 'test-user-123',
    readTheories: ['theory-1', 'theory-2', 'theory-3'],
    bookmarkedTheories: ['theory-1', 'theory-2'],
    badges: [mockBadge],
    stats: {
      totalReadTime: 45,
      theoriesRead: 3,
      categoriesExplored: [TheoryCategory.COGNITIVE_BIASES, TheoryCategory.PERSUASION_PRINCIPLES],
      lastActiveDate: new Date('2024-01-20'),
      streakDays: 5,
      averageSessionTime: 15
    },
    quizResults: [],
    preferences: {
      emailNotifications: true,
      progressReminders: true
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  };

  const mockOnBadgeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render progress overview stats', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // Theories read
    expect(screen.getByText('45m')).toBeInTheDocument(); // Time spent
    expect(screen.getByText('1')).toBeInTheDocument(); // Badges earned
    expect(screen.getByText('2')).toBeInTheDocument(); // Bookmarks
  });

  it('should display progress to next milestone', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    expect(screen.getByText('Progress to Next Milestone')).toBeInTheDocument();
    expect(screen.getByText('3 theories read')).toBeInTheDocument();
    expect(screen.getByText('Goal: 5 theories')).toBeInTheDocument();
  });

  it('should show categories explored', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    expect(screen.getByText('Categories Explored')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
    expect(screen.getByText('Persuasion Principles')).toBeInTheDocument();
  });

  it('should display earned badges', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getAllByText('First Steps')).toHaveLength(2); // Appears in both tabs
    expect(screen.getAllByText('1/20/2024')).toHaveLength(2); // Badge date appears twice
  });

  it('should handle badge click and open dialog', async () => {
    render(
      <ProgressTracker
        userProgress={mockUserProgress}
        onBadgeClick={mockOnBadgeClick}
      />
    );

    const badgeButtons = screen.getAllByText('First Steps');
    const badgeButton = badgeButtons[0].closest('button');
    expect(badgeButton).toBeInTheDocument();

    fireEvent.click(badgeButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('First Steps');
    });

    expect(mockOnBadgeClick).toHaveBeenCalledWith(mockBadge);
  });

  it('should show detailed stats when enabled', () => {
    render(
      <ProgressTracker
        userProgress={mockUserProgress}
        showDetailedStats={true}
      />
    );

    expect(screen.getByText('Detailed Statistics')).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument(); // Average session time
    expect(screen.getByText('5 days')).toBeInTheDocument(); // Current streak
    expect(screen.getAllByText('1/20/2024')).toHaveLength(3); // Last active + badge dates
  });

  it('should not show detailed stats when disabled', () => {
    render(
      <ProgressTracker
        userProgress={mockUserProgress}
        showDetailedStats={false}
      />
    );

    expect(screen.queryByText('Detailed Statistics')).not.toBeInTheDocument();
  });

  it('should handle empty progress state', () => {
    const emptyProgress: UserProgress = {
      ...mockUserProgress,
      readTheories: [],
      bookmarkedTheories: [],
      badges: [],
      stats: {
        ...mockUserProgress.stats,
        totalReadTime: 0,
        theoriesRead: 0,
        categoriesExplored: []
      }
    };

    render(<ProgressTracker userProgress={emptyProgress} />);

    // Check for specific stats in their context
    expect(screen.getByText('Theories Read').previousElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Time Spent').previousElementSibling).toHaveTextContent('0m');
    expect(screen.getByText('Start reading theories to earn your first badge!')).toBeInTheDocument();
    expect(screen.getByText('Start reading theories to explore different categories!')).toBeInTheDocument();
  });

  it('should format time correctly for hours', () => {
    const progressWithHours: UserProgress = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        totalReadTime: 125, // 2 hours 5 minutes
        averageSessionTime: 90 // 1 hour 30 minutes
      }
    };

    render(
      <ProgressTracker
        userProgress={progressWithHours}
        showDetailedStats={true}
      />
    );

    expect(screen.getByText('2h 5m')).toBeInTheDocument(); // Total time
    expect(screen.getByText('1h 30m')).toBeInTheDocument(); // Average session time
  });

  it('should show progress bar with correct percentage', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    const progressBar = screen.getByRole('progressbar');
    // With 3 theories read, next milestone is 5, previous is 1
    // Progress = (3-1)/(5-1) * 100 = 2/4 * 100 = 50%
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should handle badge categories in tabs', () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    expect(screen.getByTestId('tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('tab-reading')).toBeInTheDocument();
    expect(screen.getByTestId('tab-exploration')).toBeInTheDocument();
    expect(screen.getByTestId('tab-engagement')).toBeInTheDocument();
    expect(screen.getByTestId('tab-mastery')).toBeInTheDocument();
  });

  it('should close badge dialog when clicked outside', async () => {
    render(<ProgressTracker userProgress={mockUserProgress} />);

    const badgeButtons = screen.getAllByText('First Steps');
    const badgeButton = badgeButtons[0].closest('button');
    fireEvent.click(badgeButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('dialog'));

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProgressTracker
        userProgress={mockUserProgress}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should calculate milestone progress correctly for different theory counts', () => {
    const progressWith15Theories: UserProgress = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        theoriesRead: 15
      }
    };

    render(<ProgressTracker userProgress={progressWith15Theories} />);

    expect(screen.getByText('15 theories read')).toBeInTheDocument();
    expect(screen.getByText('Goal: 50 theories')).toBeInTheDocument();
  });

  it('should show correct message for milestone completion', () => {
    const progressWith100Theories: UserProgress = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        theoriesRead: 100
      }
    };

    render(<ProgressTracker userProgress={progressWith100Theories} />);

    // Should show 100% progress when at or above highest milestone
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});
