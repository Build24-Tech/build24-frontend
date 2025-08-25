import { VirtualizedTheoryList, useVirtualScroll, useVirtualScrollPerformance } from '@/components/knowledge-hub/VirtualizedTheoryList';
import { DifficultyLevel, Theory, TheoryCategory } from '@/types/knowledge-hub';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock TheoryCard component
jest.mock('@/components/knowledge-hub/TheoryCard', () => ({
  TheoryCard: ({ theory, onClick, className }: any) => (
    <div
      className={className}
      data-testid={`theory-card-${theory.id}`}
      onClick={() => onClick?.(theory)}
    >
      {theory.title}
    </div>
  )
}));

// Mock TheoryCardSkeleton component
jest.mock('@/components/knowledge-hub/TheoryCardSkeleton', () => ({
  TheoryCardSkeleton: () => <div data-testid="theory-skeleton">Loading...</div>
}));

const createMockTheory = (id: string, title: string): Theory => ({
  id,
  title,
  category: TheoryCategory.COGNITIVE_BIASES,
  summary: `Summary for ${title}`,
  content: {
    description: `Description for ${title}`,
    applicationGuide: 'Application guide',
    examples: [],
    relatedContent: []
  },
  metadata: {
    difficulty: DifficultyLevel.BEGINNER,
    relevance: ['marketing'],
    readTime: 5,
    tags: ['test']
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

describe('VirtualizedTheoryList', () => {
  const mockTheories = Array.from({ length: 100 }, (_, i) =>
    createMockTheory(`theory-${i}`, `Theory ${i}`)
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    render(
      <VirtualizedTheoryList
        theories={[]}
        isLoading={true}
      />
    );

    expect(screen.getAllByTestId('theory-skeleton')).toHaveLength(6);
  });

  it('should render empty state when no theories', () => {
    render(
      <VirtualizedTheoryList
        theories={[]}
        isLoading={false}
      />
    );

    expect(screen.getByText('No theories found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms or filters to find relevant theories.')).toBeInTheDocument();
  });

  it('should use regular grid for small lists', () => {
    const smallList = mockTheories.slice(0, 10);

    render(
      <VirtualizedTheoryList
        theories={smallList}
        isLoading={false}
      />
    );

    // Should render all theories in regular grid
    smallList.forEach(theory => {
      expect(screen.getByTestId(`theory-card-${theory.id}`)).toBeInTheDocument();
    });
  });

  it('should handle theory click events', () => {
    const onTheoryClick = jest.fn();
    const smallList = mockTheories.slice(0, 5);

    render(
      <VirtualizedTheoryList
        theories={smallList}
        onTheoryClick={onTheoryClick}
        isLoading={false}
      />
    );

    const firstCard = screen.getByTestId('theory-card-theory-0');
    fireEvent.click(firstCard);

    expect(onTheoryClick).toHaveBeenCalledWith(smallList[0]);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VirtualizedTheoryList
        theories={mockTheories.slice(0, 5)}
        className="custom-class"
        isLoading={false}
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('useVirtualScroll', () => {
  it('should calculate visible range correctly', () => {
    const itemCount = 100;
    const itemHeight = 200;
    const containerHeight = 800;
    const overscan = 2;

    const { result } = renderHook(() =>
      useVirtualScroll(itemCount, itemHeight, containerHeight, overscan)
    );

    // With scrollTop = 0, should show first few items
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBeGreaterThan(0);
    expect(result.current.totalHeight).toBe(itemCount * itemHeight);
  });

  it('should update visible range when scrolling', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(100, 200, 800, 2)
    );

    act(() => {
      result.current.setScrollTop(1000);
    });

    expect(result.current.scrollTop).toBe(1000);
    expect(result.current.visibleRange.start).toBeGreaterThan(0);
  });

  it('should scroll to specific index', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(100, 200, 800, 2)
    );

    act(() => {
      const targetScrollTop = result.current.scrollToIndex(10);
      expect(targetScrollTop).toBe(10 * 200);
      expect(result.current.scrollTop).toBe(10 * 200);
    });
  });

  it('should scroll to top', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(100, 200, 800, 2)
    );

    // First scroll down
    act(() => {
      result.current.setScrollTop(1000);
    });

    expect(result.current.scrollTop).toBe(1000);

    // Then scroll to top
    act(() => {
      result.current.scrollToTop();
    });

    expect(result.current.scrollTop).toBe(0);
  });

  it('should handle edge cases', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(0, 200, 0, 2)
    );

    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBe(0);
    expect(result.current.totalHeight).toBe(0);
  });
});

describe('useVirtualScrollPerformance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should track performance metrics', () => {
    const { result } = renderHook(() => useVirtualScrollPerformance());

    expect(result.current.metrics).toEqual({
      renderTime: 0,
      visibleItems: 0,
      totalItems: 0,
      scrollFPS: 0
    });
  });

  it('should update metrics when called', () => {
    const { result } = renderHook(() => useVirtualScrollPerformance());

    act(() => {
      jest.spyOn(performance, 'now').mockReturnValue(1016); // 16ms later
      result.current.updateMetrics(5, 100);
    });

    expect(result.current.metrics.visibleItems).toBe(5);
    expect(result.current.metrics.totalItems).toBe(100);
    expect(result.current.metrics.renderTime).toBe(16);
  });
});
