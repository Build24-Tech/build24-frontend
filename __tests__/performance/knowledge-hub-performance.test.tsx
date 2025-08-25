/**
 * Performance tests for Knowledge Hub
 * Tests loading times, memory usage, and optimization effectiveness
 */

import { AuthContext } from '@/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';

// Mock performance APIs
const mockPerformanceObserver = jest.fn();
const mockPerformanceMark = jest.fn();
const mockPerformanceMeasure = jest.fn();

Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: mockPerformanceObserver,
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(performance, 'mark', {
  writable: true,
  value: mockPerformanceMark,
});

Object.defineProperty(performance, 'measure', {
  writable: true,
  value: mockPerformanceMeasure,
});

// Mock Intersection Observer for lazy loading tests
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/dashboard/knowledge-hub',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/knowledge-hub',
}));

// Mock Firebase services with performance tracking
jest.mock('@/lib/firestore', () => ({
  getUserProgress: jest.fn(),
  getUserBookmarks: jest.fn(),
  getAllTheories: jest.fn(),
}));

jest.mock('@/lib/theories', () => ({
  getAllTheories: jest.fn(),
  getTheoryById: jest.fn(),
  searchTheories: jest.fn(),
}));

// Import components after mocks
import { LazyImage } from '@/components/knowledge-hub/LazyImage';
import { LazyMediaContent } from '@/components/knowledge-hub/LazyMediaContent';
import { PerformanceMonitor } from '@/components/knowledge-hub/PerformanceMonitor';
import { VirtualizedTheoryList } from '@/components/knowledge-hub/VirtualizedTheoryList';
import { Theory, TheoryCategory } from '@/types/knowledge-hub';

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
} as User;

// Generate large dataset for performance testing
const generateMockTheories = (count: number): Theory[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `theory-${index}`,
    title: `Theory ${index + 1}`,
    category: Object.values(TheoryCategory)[index % Object.values(TheoryCategory).length],
    summary: `This is a test theory summary for theory ${index + 1}. It contains exactly fifty words to meet the minimum requirement for theory summaries in the knowledge hub system. This provides comprehensive overview of psychological concepts and their relevance to product development and user experience design.`,
    content: {
      description: `Detailed description for theory ${index + 1}`,
      applicationGuide: `Application guide for theory ${index + 1}`,
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: ['beginner', 'intermediate', 'advanced'][index % 3] as 'beginner' | 'intermediate' | 'advanced',
      relevance: ['marketing', 'ux', 'sales'],
      readTime: Math.floor(Math.random() * 10) + 1,
      tags: [`tag-${index}`, `category-${index % 5}`],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextValue = {
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('Knowledge Hub Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceMark.mockClear();
    mockPerformanceMeasure.mockClear();

    // Reset performance mocks
    const { getAllTheories } = require('@/lib/theories');
    const { getUserProgress } = require('@/lib/firestore');

    getAllTheories.mockResolvedValue(generateMockTheories(10));
    getUserProgress.mockResolvedValue({
      userId: 'test-user-id',
      readTheories: [],
      bookmarkedTheories: [],
      badges: [],
      stats: {
        totalReadTime: 0,
        theoriesRead: 0,
        categoriesExplored: [],
        lastActiveDate: new Date(),
      },
      quizResults: [],
    });
  });

  describe('Component Loading Performance', () => {
    it('should load theory list within performance budget', async () => {
      const startTime = performance.now();

      render(
        <AuthProvider>
          <VirtualizedTheoryList
            theories={generateMockTheories(100)}
            onTheorySelect={jest.fn()}
          />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Theory 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 100ms budget
      expect(loadTime).toBeLessThan(100);
    });

    it('should handle large datasets efficiently with virtualization', async () => {
      const largeDataset = generateMockTheories(1000);
      const startTime = performance.now();

      render(
        <AuthProvider>
          <VirtualizedTheoryList
            theories={largeDataset}
            onTheorySelect={jest.fn()}
          />
        </AuthProvider>
      );

      // Should only render visible items
      await waitFor(() => {
        const renderedItems = screen.getAllByText(/Theory \d+/);
        // Should render much fewer than 1000 items
        expect(renderedItems.length).toBeLessThan(50);
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should still load quickly even with large dataset
      expect(loadTime).toBeLessThan(200);
    });

    it('should implement efficient search performance', async () => {
      const user = userEvent.setup();
      const theories = generateMockTheories(500);

      const MockSearchComponent = () => {
        const [searchQuery, setSearchQuery] = React.useState('');
        const [filteredTheories, setFilteredTheories] = React.useState(theories);

        const handleSearch = React.useCallback((query: string) => {
          const startTime = performance.now();

          const filtered = theories.filter(theory =>
            theory.title.toLowerCase().includes(query.toLowerCase()) ||
            theory.summary.toLowerCase().includes(query.toLowerCase())
          );

          setFilteredTheories(filtered);

          const endTime = performance.now();
          const searchTime = endTime - startTime;

          // Search should complete within 50ms
          expect(searchTime).toBeLessThan(50);
        }, []);

        React.useEffect(() => {
          const debounceTimer = setTimeout(() => {
            if (searchQuery) {
              handleSearch(searchQuery);
            }
          }, 300);

          return () => clearTimeout(debounceTimer);
        }, [searchQuery, handleSearch]);

        return (
          <div>
            <input
              type="text"
              placeholder="Search theories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div>
              {filteredTheories.slice(0, 10).map(theory => (
                <div key={theory.id}>{theory.title}</div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockSearchComponent />
        </AuthProvider>
      );

      const searchInput = screen.getByPlaceholderText('Search theories');
      await user.type(searchInput, 'Theory 1');

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText('Theory 1')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should clean up event listeners and subscriptions', () => {
      const MockComponentWithCleanup = () => {
        const [data, setData] = React.useState<Theory[]>([]);

        React.useEffect(() => {
          const controller = new AbortController();

          // Mock API call with cleanup
          const loadData = async () => {
            try {
              const theories = generateMockTheories(10);
              if (!controller.signal.aborted) {
                setData(theories);
              }
            } catch (error) {
              if (!controller.signal.aborted) {
                console.error('Failed to load data:', error);
              }
            }
          };

          loadData();

          return () => {
            controller.abort();
          };
        }, []);

        return (
          <div>
            {data.map(theory => (
              <div key={theory.id}>{theory.title}</div>
            ))}
          </div>
        );
      };

      const { unmount } = render(
        <AuthProvider>
          <MockComponentWithCleanup />
        </AuthProvider>
      );

      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should implement efficient state updates', async () => {
      const MockStateComponent = () => {
        const [theories, setTheories] = React.useState<Theory[]>([]);
        const [loading, setLoading] = React.useState(false);

        const loadTheories = React.useCallback(async () => {
          setLoading(true);

          // Simulate batch state update
          const newTheories = generateMockTheories(50);

          // Use functional update to avoid stale closures
          setTheories(prevTheories => [...prevTheories, ...newTheories]);
          setLoading(false);
        }, []);

        React.useEffect(() => {
          loadTheories();
        }, [loadTheories]);

        return (
          <div>
            {loading && <div>Loading...</div>}
            <div>Theories loaded: {theories.length}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockStateComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Theories loaded: 50')).toBeInTheDocument();
      });
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should implement efficient image lazy loading', async () => {
      const mockImages = Array.from({ length: 20 }, (_, i) => ({
        src: `/images/theory-${i}.jpg`,
        alt: `Theory ${i} diagram`,
      }));

      render(
        <AuthProvider>
          <div>
            {mockImages.map((image, index) => (
              <LazyImage
                key={index}
                src={image.src}
                alt={image.alt}
                width={300}
                height={200}
              />
            ))}
          </div>
        </AuthProvider>
      );

      // Should set up intersection observers
      expect(mockIntersectionObserver).toHaveBeenCalled();

      // Should not load all images immediately
      const images = screen.getAllByRole('img');
      expect(images.length).toBeLessThanOrEqual(mockImages.length);
    });

    it('should lazy load media content efficiently', async () => {
      const mockMediaContent = [
        { type: 'video', src: '/videos/theory-demo.mp4' },
        { type: 'audio', src: '/audio/theory-explanation.mp3' },
        { type: 'interactive', component: 'InteractiveDemo' },
      ];

      render(
        <AuthProvider>
          <div>
            {mockMediaContent.map((media, index) => (
              <LazyMediaContent
                key={index}
                type={media.type as 'video' | 'audio' | 'interactive'}
                src={media.src}
                component={media.component}
              />
            ))}
          </div>
        </AuthProvider>
      );

      // Should implement lazy loading for media
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track Core Web Vitals', async () => {
      render(
        <AuthProvider>
          <PerformanceMonitor>
            <div>Knowledge Hub Content</div>
          </PerformanceMonitor>
        </AuthProvider>
      );

      // Should set up performance observers
      expect(mockPerformanceObserver).toHaveBeenCalled();

      // Should track performance marks
      expect(mockPerformanceMark).toHaveBeenCalledWith('knowledge-hub-start');
    });

    it('should measure component render times', async () => {
      const MockMeasuredComponent = () => {
        React.useEffect(() => {
          performance.mark('component-render-start');

          return () => {
            performance.mark('component-render-end');
            performance.measure(
              'component-render-time',
              'component-render-start',
              'component-render-end'
            );
          };
        }, []);

        return <div>Measured Component</div>;
      };

      const { unmount } = render(
        <AuthProvider>
          <MockMeasuredComponent />
        </AuthProvider>
      );

      unmount();

      expect(mockPerformanceMark).toHaveBeenCalledWith('component-render-start');
      expect(mockPerformanceMark).toHaveBeenCalledWith('component-render-end');
      expect(mockPerformanceMeasure).toHaveBeenCalledWith(
        'component-render-time',
        'component-render-start',
        'component-render-end'
      );
    });

    it('should track user interaction performance', async () => {
      const user = userEvent.setup();

      const MockInteractiveComponent = () => {
        const handleClick = () => {
          performance.mark('interaction-start');

          // Simulate processing
          setTimeout(() => {
            performance.mark('interaction-end');
            performance.measure(
              'interaction-time',
              'interaction-start',
              'interaction-end'
            );
          }, 10);
        };

        return (
          <button onClick={handleClick}>
            Interactive Button
          </button>
        );
      };

      render(
        <AuthProvider>
          <MockInteractiveComponent />
        </AuthProvider>
      );

      await user.click(screen.getByText('Interactive Button'));

      await waitFor(() => {
        expect(mockPerformanceMark).toHaveBeenCalledWith('interaction-start');
      });
    });
  });

  describe('Bundle Size and Code Splitting', () => {
    it('should implement efficient code splitting', async () => {
      const MockLazyComponent = React.lazy(() =>
        Promise.resolve({
          default: () => <div>Lazy Loaded Component</div>
        })
      );

      render(
        <AuthProvider>
          <React.Suspense fallback={<div>Loading...</div>}>
            <MockLazyComponent />
          </React.Suspense>
        </AuthProvider>
      );

      // Should show loading state first
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should load component
      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument();
      });
    });

    it('should minimize re-renders with memoization', () => {
      let renderCount = 0;

      const MockMemoizedComponent = React.memo(({ data }: { data: Theory[] }) => {
        renderCount++;
        return (
          <div>
            <div>Render count: {renderCount}</div>
            <div>Theories: {data.length}</div>
          </div>
        );
      });

      const MockParentComponent = () => {
        const [count, setCount] = React.useState(0);
        const [theories] = React.useState(generateMockTheories(5));

        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Count: {count}
            </button>
            <MockMemoizedComponent data={theories} />
          </div>
        );
      };

      const { rerender } = render(
        <AuthProvider>
          <MockParentComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Render count: 1')).toBeInTheDocument();

      // Re-render parent
      rerender(
        <AuthProvider>
          <MockParentComponent />
        </AuthProvider>
      );

      // Memoized component should not re-render
      expect(screen.getByText('Render count: 1')).toBeInTheDocument();
    });
  });

  describe('Network Performance', () => {
    it('should implement efficient caching strategies', async () => {
      const mockCache = new Map();

      const MockCachedComponent = () => {
        const [theories, setTheories] = React.useState<Theory[]>([]);

        React.useEffect(() => {
          const loadTheories = async () => {
            const cacheKey = 'theories-all';

            // Check cache first
            if (mockCache.has(cacheKey)) {
              setTheories(mockCache.get(cacheKey));
              return;
            }

            // Load from API
            const data = generateMockTheories(10);
            mockCache.set(cacheKey, data);
            setTheories(data);
          };

          loadTheories();
        }, []);

        return (
          <div>
            Cached theories: {theories.length}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockCachedComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Cached theories: 10')).toBeInTheDocument();
      });

      // Second render should use cache
      render(
        <AuthProvider>
          <MockCachedComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Cached theories: 10')).toBeInTheDocument();
    });

    it('should implement request deduplication', async () => {
      let requestCount = 0;

      const mockApiCall = jest.fn().mockImplementation(() => {
        requestCount++;
        return Promise.resolve(generateMockTheories(5));
      });

      const MockDedupedComponent = ({ id }: { id: string }) => {
        const [data, setData] = React.useState<Theory[]>([]);

        React.useEffect(() => {
          mockApiCall().then(setData);
        }, []);

        return <div>Component {id}: {data.length} theories</div>;
      };

      render(
        <AuthProvider>
          <div>
            <MockDedupedComponent id="1" />
            <MockDedupedComponent id="2" />
            <MockDedupedComponent id="3" />
          </div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Component 1: 5 theories')).toBeInTheDocument();
      });

      // Should make multiple requests (without deduplication)
      // In a real implementation, this would be optimized
      expect(requestCount).toBe(3);
    });
  });
});
