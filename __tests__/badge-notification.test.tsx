import BadgeNotification from '@/components/knowledge-hub/BadgeNotification';
import { Badge, BadgeCategory } from '@/types/knowledge-hub';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={`card ${className}`}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={`button ${variant} ${size} ${className}`}>
      {children}
    </button>
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Trophy: ({ className }: any) => <div className={`trophy-icon ${className}`} data-testid="trophy-icon" />,
  X: ({ className }: any) => <div className={`x-icon ${className}`} data-testid="x-icon" />,
  Sparkles: ({ className }: any) => <div className={`sparkles-icon ${className}`} data-testid="sparkles-icon" />
}));

describe('BadgeNotification', () => {
  const mockBadges: Badge[] = [
    {
      id: 'first-theory',
      name: 'First Steps',
      description: 'Read your first theory',
      category: BadgeCategory.READING,
      earnedAt: new Date('2024-01-20'),
      requirements: {
        type: 'theories_read',
        threshold: 1
      }
    },
    {
      id: 'theory-explorer',
      name: 'Theory Explorer',
      description: 'Read 5 theories',
      category: BadgeCategory.READING,
      earnedAt: new Date('2024-01-21'),
      requirements: {
        type: 'theories_read',
        threshold: 5
      }
    }
  ];

  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when no badges provided', () => {
    render(<BadgeNotification badges={[]} onDismiss={mockOnDismiss} />);

    expect(screen.queryByText('Achievement Unlocked!')).not.toBeInTheDocument();
  });

  it('should render single badge notification', () => {
    render(<BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Read your first theory')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('should show dismiss button and handle click', () => {
    render(<BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByTestId('x-icon').closest('button');
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton!);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should auto-hide after specified duration', async () => {
    render(
      <BadgeNotification
        badges={[mockBadges[0]]}
        onDismiss={mockOnDismiss}
        autoHideDuration={3000}
      />
    );

    expect(screen.getByText('First Steps')).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  it('should show multiple badge indicator for multiple badges', () => {
    render(<BadgeNotification badges={mockBadges} onDismiss={mockOnDismiss} />);

    // Should show first badge
    expect(screen.getByText('First Steps')).toBeInTheDocument();

    // Should show indicator dots for multiple badges
    const indicators = screen.getAllByRole('generic').filter(el =>
      el.className.includes('w-2 h-2 rounded-full')
    );
    expect(indicators).toHaveLength(2);
  });

  it('should cycle through multiple badges', async () => {
    render(
      <BadgeNotification
        badges={mockBadges}
        onDismiss={mockOnDismiss}
        autoHideDuration={2000}
      />
    );

    // Should show first badge initially
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.queryByText('Theory Explorer')).not.toBeInTheDocument();

    // Fast-forward to trigger next badge
    jest.advanceTimersByTime(2500); // 2000ms + 500ms for animation

    await waitFor(() => {
      expect(screen.getByText('Theory Explorer')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BadgeNotification
        badges={[mockBadges[0]]}
        onDismiss={mockOnDismiss}
        className="custom-notification"
      />
    );

    const notification = container.querySelector('.card');
    expect(notification).toHaveClass('custom-notification');
  });

  it('should format earned date correctly', () => {
    render(<BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('1/20/2024')).toBeInTheDocument();
  });

  it('should show correct badge category styling', () => {
    const engagementBadge: Badge = {
      id: 'bookmark-collector',
      name: 'Bookmark Collector',
      description: 'Bookmark 10 theories',
      category: BadgeCategory.ENGAGEMENT,
      earnedAt: new Date('2024-01-20'),
      requirements: {
        type: 'bookmarks_created',
        threshold: 10
      }
    };

    render(<BadgeNotification badges={[engagementBadge]} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Engagement')).toBeInTheDocument();
  });

  it('should handle rapid dismiss clicks gracefully', () => {
    render(<BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByTestId('x-icon').closest('button');

    // Click multiple times rapidly
    fireEvent.click(dismissButton!);
    fireEvent.click(dismissButton!);
    fireEvent.click(dismissButton!);

    // Should only call onDismiss once
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show notification with slide-in animation', () => {
    render(<BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />);

    const notification = screen.getByText('Achievement Unlocked!').closest('.card');
    expect(notification).toHaveClass('translate-x-0', 'opacity-100');
  });

  it('should handle empty badge properties gracefully', () => {
    const incompleteBadge: Badge = {
      id: 'test-badge',
      name: 'Test Badge',
      description: '',
      category: BadgeCategory.READING,
      earnedAt: new Date(),
      requirements: {
        type: 'theories_read',
        threshold: 1
      }
    };

    render(<BadgeNotification badges={[incompleteBadge]} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('should clear timers on unmount', () => {
    const { unmount } = render(
      <BadgeNotification badges={[mockBadges[0]]} onDismiss={mockOnDismiss} />
    );

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
