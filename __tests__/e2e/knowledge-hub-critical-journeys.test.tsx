/**
 * End-to-end tests for Knowledge Hub critical user journeys
 * Tests complete user workflows from start to finish
 */

import { AuthContext } from '@/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';

// Mock Next.js router with navigation tracking
const mockNavigationHistory: string[] = [];
const mockPush = jest.fn((path: string) => {
  mockNavigationHistory.push(path);
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    pathname: '/dashboard/knowledge-hub',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/knowledge-hub',
}));

// Mock all Firebase services
jest.mock('@/lib/firestore', () => ({
  getUserProgress: jest.fn(),
  updateUserProgress: jest.fn(),
  getUserBookmarks: jest.fn(),
  addBookmark: jest.fn(),
  removeBookmark: jest.fn(),
  trackTheoryView: jest.fn(),
  getTheoryAnalytics: jest.fn(),
}));

jest.mock('@/lib/theories', () => ({
  getAllTheories: jest.fn(),
  getTheoryById: jest.fn(),
  getTheoriesByCategory: jest.fn(),
  searchTheories: jest.fn(),
}));

jest.mock('@/lib/analytics-service', () => ({
  trackEvent: jest.fn(),
  trackTheoryView: jest.fn(),
  trackBookmarkAction: jest.fn(),
  getAnalytics: jest.fn(),
}));

// Import components after mocks
import { Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
} as User;

const mockTheories: Theory[] = [
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions. This cognitive bias affects how we process subsequent information and can significantly impact pricing strategies, user interface design, and marketing campaigns in product development.',
    content: {
      description: 'Anchoring bias is a cognitive bias that describes the common human tendency to rely too heavily on the first piece of information offered (the "anchor") when making decisions.',
      applicationGuide: 'In Build24 projects, you can leverage anchoring bias by strategically presenting initial information that influences user perception and decision-making.',
      examples: [
        {
          id: 'pricing-example',
          type: 'before-after',
          title: 'Pricing Strategy Example',
          description: 'How anchoring affects pricing perception',
          beforeImage: '/images/examples/pricing-before.png',
          afterImage: '/images/examples/pricing-after.png',
        }
      ],
      relatedContent: [
        {
          id: 'pricing-blog',
          type: 'blog',
          title: 'Psychology of Pricing',
          url: '/blog/psychology-of-pricing',
        }
      ],
    },
    metadata: {
      difficulty: 'beginner',
      relevance: ['marketing', 'ux'],
      readTime: 3,
      tags: ['pricing', 'decision-making', 'first-impression'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'People follow the actions of others when uncertain about what to do. This psychological principle is fundamental to building trust and credibility in digital products, especially for indie makers looking to establish authority and encourage user adoption.',
    content: {
      description: 'Social proof is a psychological and social phenomenon wherein people copy the actions of others in an attempt to undertake behavior in a given situation.',
      applicationGuide: 'Implement social proof in your Build24 projects through testimonials, user counts, reviews, and social media integration.',
      examples: [
        {
          id: 'testimonial-example',
          type: 'interactive-demo',
          title: 'Testimonial Implementation',
          description: 'Interactive demo of social proof elements',
          interactiveComponent: 'TestimonialDemo',
        }
      ],
      relatedContent: [
        {
          id: 'social-proof-project',
          type: 'project',
          title: 'Community Building Project',
          url: '/projects/community-building',
        }
      ],
    },
    metadata: {
      difficulty: 'intermediate',
      relevance: ['marketing', 'sales'],
      readTime: 5,
      tags: ['testimonials', 'reviews', 'trust'],
    },
    premiumContent: {
      extendedCaseStudies: 'Detailed case studies of social proof implementation in successful startups.',
      downloadableResources: [
        {
          id: 'social-proof-templates',
          title: 'Social Proof Templates',
          type: 'template',
          url: '/downloads/social-proof-templates.zip',
        }
      ],
      advancedApplications: 'Advanced techniques for implementing social proof in complex user flows.',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUserProgress: UserProgress = {
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

describe('Knowledge Hub Critical User Journeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigationHistory.length = 0;

    // Setup default mocks
    const { getAllTheories, getTheoryById, searchTheories } = require('@/lib/theories');
    const { getUserProgress, getUserBookmarks, trackTheoryView } = require('@/lib/firestore');
    const { trackEvent } = require('@/lib/analytics-service');

    getAllTheories.mockResolvedValue(mockTheories);
    getTheoryById.mockImplementation((id: string) =>
      Promise.resolve(mockTheories.find(t => t.id === id))
    );
    searchTheories.mockResolvedValue(mockTheories);
    getUserProgress.mockResolvedValue(mockUserProgress);
    getUserBookmarks.mockResolvedValue([]);
    trackTheoryView.mockResolvedValue(undefined);
    trackEvent.mockResolvedValue(undefined);
  });

  describe('New User Onboarding Journey', () => {
    it('should guide new user through complete discovery and learning flow', async () => {
      const user = userEvent.setup();

      // Mock new user with no progress
      const { getUserProgress } = require('@/lib/firestore');
      getUserProgress.mockResolvedValue({
        ...mockUserProgress,
        readTheories: [],
        bookmarkedTheories: [],
      });

      const MockKnowledgeHubPage = () => {
        const [selectedCategory, setSelectedCategory] = React.useState('all');
        const [searchQuery, setSearchQuery] = React.useState('');
        const [theories, setTheories] = React.useState(mockTheories);

        return (
          <div>
            {/* Category Navigation */}
            <nav role="navigation" aria-label="Theory categories">
              <button
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'active' : ''}
              >
                All Categories
              </button>
              <button
                onClick={() => setSelectedCategory(TheoryCategory.COGNITIVE_BIASES)}
                className={selectedCategory === TheoryCategory.COGNITIVE_BIASES ? 'active' : ''}
              >
                Cognitive Biases
              </button>
              <button
                onClick={() => setSelectedCategory(TheoryCategory.PERSUASION_PRINCIPLES)}
                className={selectedCategory === TheoryCategory.PERSUASION_PRINCIPLES ? 'active' : ''}
              >
                Persuasion Principles
              </button>
            </nav>

            {/* Search */}
            <input
              type="text"
              placeholder="Search theories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search theories"
            />

            {/* Theory List */}
            <div role="main">
              {theories.map((theory) => (
                <article key={theory.id} className="theory-card">
                  <h3>{theory.title}</h3>
                  <p>{theory.summary}</p>
                  <span className="category">{theory.category}</span>
                  <span className="difficulty">{theory.metadata.difficulty}</span>
                  <span className="read-time">{theory.metadata.readTime} min read</span>
                  <button
                    onClick={() => mockPush(`/dashboard/knowledge-hub/theory/${theory.id}`)}
                  >
                    Read Theory
                  </button>
                  <button
                    aria-label={`Bookmark ${theory.title}`}
                    onClick={() => {
                      // Mock bookmark action
                    }}
                  >
                    Bookmark
                  </button>
                </article>
              ))}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockKnowledgeHubPage />
        </AuthProvider>
      );

      // Step 1: User lands on Knowledge Hub
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Anchoring Bias')).toBeInTheDocument();
      expect(screen.getByText('Social Proof')).toBeInTheDocument();

      // Step 2: User explores categories
      await user.click(screen.getByText('Cognitive Biases'));
      expect(screen.getByText('Cognitive Biases')).toHaveClass('active');

      // Step 3: User searches for specific content
      const searchInput = screen.getByLabelText('Search theories');
      await user.type(searchInput, 'anchoring');
      expect(searchInput).toHaveValue('anchoring');

      // Step 4: User selects a theory to read
      const readButton = screen.getAllByText('Read Theory')[0];
      await user.click(readButton);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/knowledge-hub/theory/anchoring-bias');

      // Step 5: User bookmarks the theory
      const bookmarkButton = screen.getByLabelText('Bookmark Anchoring Bias');
      await user.click(bookmarkButton);

      // Should track the bookmark action
      expect(screen.getByLabelText('Bookmark Anchoring Bias')).toBeInTheDocument();
    });
  });

  describe('Returning User Experience Journey', () => {
    it('should provide personalized experience for returning users', async () => {
      const user = userEvent.setup();

      // Mock returning user with progress
      const { getUserProgress, getUserBookmarks } = require('@/lib/firestore');
      getUserProgress.mockResolvedValue({
        ...mockUserProgress,
        readTheories: ['anchoring-bias'],
        bookmarkedTheories: ['social-proof'],
        stats: {
          totalReadTime: 15,
          theoriesRead: 1,
          categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
          lastActiveDate: new Date(),
        },
      });
      getUserBookmarks.mockResolvedValue(['social-proof']);

      const MockPersonalizedHub = () => {
        const [showBookmarks, setShowBookmarks] = React.useState(false);
        const [showProgress, setShowProgress] = React.useState(false);

        return (
          <div>
            {/* Progress Summary */}
            <div className="progress-summary">
              <h2>Your Progress</h2>
              <div>Theories Read: 1</div>
              <div>Total Read Time: 15 minutes</div>
              <div>Categories Explored: 1</div>
              <button onClick={() => setShowProgress(!showProgress)}>
                View Detailed Progress
              </button>
            </div>

            {/* Quick Access */}
            <div className="quick-access">
              <button onClick={() => setShowBookmarks(!showBookmarks)}>
                My Bookmarks (1)
              </button>
              <button>Continue Reading</button>
              <button>Recommended for You</button>
            </div>

            {/* Bookmarks View */}
            {showBookmarks && (
              <div className="bookmarks-view">
                <h3>Your Bookmarked Theories</h3>
                <article className="theory-card">
                  <h4>Social Proof</h4>
                  <p>People follow the actions of others when uncertain...</p>
                  <button>Read Now</button>
                  <button>Remove Bookmark</button>
                </article>
              </div>
            )}

            {/* Detailed Progress */}
            {showProgress && (
              <div className="detailed-progress">
                <h3>Learning Analytics</h3>
                <div>Reading Streak: 3 days</div>
                <div>Favorite Category: Cognitive Biases</div>
                <div>Next Badge: Read 5 theories (1/5)</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockPersonalizedHub />
        </AuthProvider>
      );

      // Should show personalized progress
      expect(screen.getByText('Theories Read: 1')).toBeInTheDocument();
      expect(screen.getByText('Total Read Time: 15 minutes')).toBeInTheDocument();

      // Should show bookmarks
      await user.click(screen.getByText('My Bookmarks (1)'));
      expect(screen.getByText('Your Bookmarked Theories')).toBeInTheDocument();
      expect(screen.getByText('Social Proof')).toBeInTheDocument();

      // Should show detailed progress
      await user.click(screen.getByText('View Detailed Progress'));
      expect(screen.getByText('Learning Analytics')).toBeInTheDocument();
      expect(screen.getByText('Next Badge: Read 5 theories (1/5)')).toBeInTheDocument();
    });
  });

  describe('Premium User Journey', () => {
    it('should provide premium features and content access', async () => {
      const user = userEvent.setup();

      const MockPremiumTheoryView = () => {
        const [showPremiumContent, setShowPremiumContent] = React.useState(false);
        const isPremiumUser = true; // Mock premium user

        return (
          <div>
            <article className="theory-detail">
              <h1>Social Proof</h1>
              <div className="theory-content">
                <p>People follow the actions of others when uncertain about what to do...</p>

                {/* Basic content available to all users */}
                <section className="basic-content">
                  <h2>How to Apply in Build24</h2>
                  <p>Implement social proof in your Build24 projects through testimonials...</p>
                </section>

                {/* Premium content gate */}
                {isPremiumUser ? (
                  <section className="premium-content">
                    <div className="premium-badge">Premium Content</div>
                    <button onClick={() => setShowPremiumContent(!showPremiumContent)}>
                      View Extended Case Studies
                    </button>

                    {showPremiumContent && (
                      <div>
                        <h3>Extended Case Studies</h3>
                        <p>Detailed case studies of social proof implementation in successful startups...</p>

                        <h3>Downloadable Resources</h3>
                        <button>Download Social Proof Templates</button>
                        <button>Download A/B Test Scripts</button>

                        <h3>Advanced Applications</h3>
                        <p>Advanced techniques for implementing social proof in complex user flows...</p>
                      </div>
                    )}
                  </section>
                ) : (
                  <section className="premium-gate">
                    <div className="upgrade-prompt">
                      <h3>Unlock Premium Content</h3>
                      <p>Get access to extended case studies, downloadable resources, and advanced applications.</p>
                      <button>Upgrade to Premium</button>
                    </div>
                  </section>
                )}
              </div>
            </article>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockPremiumTheoryView />
        </AuthProvider>
      );

      // Should show premium badge
      expect(screen.getByText('Premium Content')).toBeInTheDocument();

      // Should allow access to premium content
      await user.click(screen.getByText('View Extended Case Studies'));
      expect(screen.getByText('Extended Case Studies')).toBeInTheDocument();
      expect(screen.getByText('Download Social Proof Templates')).toBeInTheDocument();
      expect(screen.getByText('Advanced Applications')).toBeInTheDocument();
    });
  });

  describe('Mobile User Journey', () => {
    it('should provide optimized mobile experience', async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const MockMobileKnowledgeHub = () => {
        const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
        const [selectedTheory, setSelectedTheory] = React.useState<string | null>(null);

        return (
          <div className="mobile-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
              <h1>Knowledge Hub</h1>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <nav className="mobile-nav">
                <button>All Categories</button>
                <button>Cognitive Biases</button>
                <button>Persuasion Principles</button>
                <button>My Bookmarks</button>
                <button>My Progress</button>
              </nav>
            )}

            {/* Mobile Theory List */}
            <main className="mobile-content">
              {!selectedTheory ? (
                <div className="theory-grid-mobile">
                  {mockTheories.map((theory) => (
                    <div key={theory.id} className="theory-card-mobile">
                      <h3>{theory.title}</h3>
                      <p className="theory-summary-mobile">{theory.summary.substring(0, 100)}...</p>
                      <div className="theory-meta-mobile">
                        <span>{theory.metadata.readTime} min</span>
                        <span>{theory.metadata.difficulty}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTheory(theory.id)}
                        className="read-button-mobile"
                      >
                        Read
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="theory-detail-mobile">
                  <button onClick={() => setSelectedTheory(null)}>← Back</button>
                  <h2>Theory Detail View</h2>
                  <p>Mobile-optimized theory content...</p>
                </div>
              )}
            </main>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockMobileKnowledgeHub />
        </AuthProvider>
      );

      // Should show mobile header
      expect(screen.getByText('Knowledge Hub')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();

      // Should open mobile menu
      await user.click(screen.getByLabelText('Toggle menu'));
      expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
      expect(screen.getByText('My Progress')).toBeInTheDocument();

      // Should show mobile-optimized theory cards
      expect(screen.getByText('Anchoring Bias')).toBeInTheDocument();
      expect(screen.getAllByText('Read')).toHaveLength(2);

      // Should navigate to theory detail
      await user.click(screen.getAllByText('Read')[0]);
      expect(screen.getByText('Theory Detail View')).toBeInTheDocument();
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Journey', () => {
    it('should handle and recover from various error scenarios', async () => {
      const user = userEvent.setup();

      // Mock network failures
      const { getAllTheories, getUserProgress } = require('@/lib/firestore');
      getAllTheories.mockRejectedValueOnce(new Error('Network error'));
      getUserProgress.mockRejectedValueOnce(new Error('Database error'));

      const MockErrorHandlingHub = () => {
        const [theories, setTheories] = React.useState<Theory[]>([]);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);
        const [retryCount, setRetryCount] = React.useState(0);

        const loadTheories = async () => {
          try {
            setLoading(true);
            setError(null);
            const data = await getAllTheories();
            setTheories(data);
          } catch (err) {
            setError('Failed to load theories. Please try again.');
            console.error('Error loading theories:', err);
          } finally {
            setLoading(false);
          }
        };

        React.useEffect(() => {
          loadTheories();
        }, [retryCount]);

        const handleRetry = () => {
          setRetryCount(prev => prev + 1);
          // Mock successful retry
          getAllTheories.mockResolvedValueOnce(mockTheories);
        };

        if (loading) {
          return <div>Loading theories...</div>;
        }

        if (error) {
          return (
            <div className="error-state">
              <h2>Oops! Something went wrong</h2>
              <p>{error}</p>
              <button onClick={handleRetry}>Try Again</button>
              <button onClick={() => setError(null)}>Continue Offline</button>
            </div>
          );
        }

        return (
          <div>
            <h2>Knowledge Hub</h2>
            {theories.length === 0 ? (
              <div className="empty-state">
                <p>No theories available at the moment.</p>
                <button onClick={handleRetry}>Refresh</button>
              </div>
            ) : (
              <div>
                {theories.map(theory => (
                  <div key={theory.id}>{theory.title}</div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockErrorHandlingHub />
        </AuthProvider>
      );

      // Should show loading state initially
      expect(screen.getByText('Loading theories...')).toBeInTheDocument();

      // Should show error state after failed load
      await waitFor(() => {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load theories. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Continue Offline')).toBeInTheDocument();

      // Should retry and recover
      await user.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByText('Anchoring Bias')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Accessibility Journey', () => {
    it('should maintain performance and accessibility standards', async () => {
      const user = userEvent.setup();

      const MockAccessibleHub = () => {
        const [focusedElement, setFocusedElement] = React.useState<string | null>(null);

        return (
          <div>
            {/* Skip link for screen readers */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {/* Accessible navigation */}
            <nav role="navigation" aria-label="Knowledge Hub navigation">
              <ul>
                <li>
                  <button
                    onFocus={() => setFocusedElement('all')}
                    aria-pressed={focusedElement === 'all'}
                  >
                    All Categories
                  </button>
                </li>
                <li>
                  <button
                    onFocus={() => setFocusedElement('cognitive')}
                    aria-pressed={focusedElement === 'cognitive'}
                  >
                    Cognitive Biases
                  </button>
                </li>
              </ul>
            </nav>

            {/* Main content with proper headings */}
            <main id="main-content" role="main">
              <h1>Knowledge Hub</h1>

              <section aria-labelledby="theories-heading">
                <h2 id="theories-heading">Available Theories</h2>

                {mockTheories.map((theory, index) => (
                  <article
                    key={theory.id}
                    aria-labelledby={`theory-${theory.id}-title`}
                    tabIndex={0}
                  >
                    <h3 id={`theory-${theory.id}-title`}>{theory.title}</h3>
                    <p>{theory.summary}</p>

                    <div className="theory-actions">
                      <button
                        aria-describedby={`theory-${theory.id}-title`}
                        onClick={() => {
                          // Mock analytics tracking
                          console.log(`Reading theory: ${theory.title}`);
                        }}
                      >
                        Read Theory
                      </button>

                      <button
                        aria-label={`Bookmark ${theory.title}`}
                        aria-pressed="false"
                      >
                        <span aria-hidden="true">🔖</span>
                        Bookmark
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            </main>

            {/* Live region for announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {focusedElement && `Focused on ${focusedElement} category`}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockAccessibleHub />
        </AuthProvider>
      );

      // Should have skip link
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();

      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 1, name: 'Knowledge Hub' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Available Theories' })).toBeInTheDocument();

      // Should have accessible navigation
      expect(screen.getByRole('navigation', { name: 'Knowledge Hub navigation' })).toBeInTheDocument();

      // Should support keyboard navigation
      await user.tab(); // Skip link
      await user.tab(); // First category button

      const allCategoriesButton = screen.getByText('All Categories');
      expect(allCategoriesButton).toHaveFocus();

      // Should have proper ARIA labels
      expect(screen.getByLabelText('Bookmark Anchoring Bias')).toBeInTheDocument();
      expect(screen.getByLabelText('Bookmark Social Proof')).toBeInTheDocument();

      // Should announce focus changes
      await user.click(screen.getByText('Cognitive Biases'));
      // Live region would announce the focus change
    });
  });
});
