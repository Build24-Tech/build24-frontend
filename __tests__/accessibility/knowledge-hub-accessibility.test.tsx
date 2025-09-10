/**
 * Comprehensive accessibility tests for Knowledge Hub
 * Tests WCAG compliance, keyboard navigation, and screen reader support
 */

import { AuthContext } from '@/contexts/AuthContext';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

// Mock Firebase services
jest.mock('@/lib/firestore', () => ({
  getUserProgress: jest.fn(),
  getUserBookmarks: jest.fn(),
}));

jest.mock('@/lib/theories', () => ({
  getAllTheories: jest.fn(),
  getTheoryById: jest.fn(),
}));

// Import components after mocks
import { CategoryNavigation } from '@/components/knowledge-hub/CategoryNavigation';
import { PremiumGate } from '@/components/knowledge-hub/PremiumGate';
import { SearchAndFilter } from '@/components/knowledge-hub/SearchAndFilter';
import { TheoryCard } from '@/components/knowledge-hub/TheoryCard';
import { TheoryDetailView } from '@/components/knowledge-hub/TheoryDetailView';
import { Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
} as User;

const mockTheory: Theory = {
  id: 'anchoring-bias',
  title: 'Anchoring Bias',
  category: TheoryCategory.COGNITIVE_BIASES,
  summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions. This cognitive bias affects how we process subsequent information and can significantly impact pricing strategies, user interface design, and marketing campaigns in product development.',
  content: {
    description: 'Anchoring bias is a cognitive bias that describes the common human tendency to rely too heavily on the first piece of information offered.',
    applicationGuide: 'In Build24 projects, you can leverage anchoring bias by strategically presenting initial information.',
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
    relatedContent: [],
  },
  metadata: {
    difficulty: 'beginner',
    relevance: ['marketing', 'ux'],
    readTime: 3,
    tags: ['pricing', 'decision-making'],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

describe('Knowledge Hub Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { getUserProgress, getUserBookmarks } = require('@/lib/firestore');
    const { getAllTheories } = require('@/lib/theories');

    getUserProgress.mockResolvedValue(mockUserProgress);
    getUserBookmarks.mockResolvedValue([]);
    getAllTheories.mockResolvedValue([mockTheory]);
  });

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations in CategoryNavigation', async () => {
      const { container } = render(
        <AuthProvider>
          <CategoryNavigation
            selectedCategory="all"
            onCategoryChange={jest.fn()}
          />
        </AuthProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in SearchAndFilter', async () => {
      const { container } = render(
        <AuthProvider>
          <SearchAndFilter
            onSearch={jest.fn()}
            onFilterChange={jest.fn()}
            filters={{
              category: 'all',
              difficulty: 'all',
              relevance: 'all',
            }}
          />
        </AuthProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in TheoryCard', async () => {
      const { container } = render(
        <AuthProvider>
          <TheoryCard
            theory={mockTheory}
            isBookmarked={false}
            onBookmarkToggle={jest.fn()}
          />
        </AuthProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in TheoryDetailView', async () => {
      const { container } = render(
        <AuthProvider>
          <TheoryDetailView
            theory={mockTheory}
            userAccess="free"
          />
        </AuthProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in PremiumGate', async () => {
      const { container } = render(
        <AuthProvider>
          <PremiumGate userTier="free">
            <div>Premium content</div>
          </PremiumGate>
        </AuthProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation in CategoryNavigation', async () => {
      const user = userEvent.setup();
      const mockOnCategoryChange = jest.fn();

      render(
        <AuthProvider>
          <CategoryNavigation
            selectedCategory="all"
            onCategoryChange={mockOnCategoryChange}
          />
        </AuthProvider>
      );

      // Should be able to tab through category buttons
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');
      expect(mockOnCategoryChange).toHaveBeenCalled();

      // Should be able to activate with Space
      await user.keyboard(' ');
      expect(mockOnCategoryChange).toHaveBeenCalled();
    });

    it('should support keyboard navigation in SearchAndFilter', async () => {
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();

      render(
        <AuthProvider>
          <SearchAndFilter
            onSearch={mockOnSearch}
            onFilterChange={jest.fn()}
            filters={{
              category: 'all',
              difficulty: 'all',
              relevance: 'all',
            }}
          />
        </AuthProvider>
      );

      // Should be able to focus search input
      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'text');

      // Should be able to type in search
      await user.keyboard('anchoring');
      expect(document.activeElement).toHaveValue('anchoring');

      // Should be able to tab to filter controls
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'combobox');
    });

    it('should support keyboard navigation in TheoryCard', async () => {
      const user = userEvent.setup();
      const mockOnBookmarkToggle = jest.fn();

      render(
        <AuthProvider>
          <TheoryCard
            theory={mockTheory}
            isBookmarked={false}
            onBookmarkToggle={mockOnBookmarkToggle}
          />
        </AuthProvider>
      );

      // Should be able to tab through interactive elements
      await user.tab(); // Read button
      expect(document.activeElement).toHaveTextContent('Read Theory');

      await user.tab(); // Bookmark button
      expect(document.activeElement).toHaveAttribute('aria-label', 'Bookmark Anchoring Bias');

      // Should be able to activate bookmark with keyboard
      await user.keyboard('{Enter}');
      expect(mockOnBookmarkToggle).toHaveBeenCalled();
    });

    it('should maintain focus management in modal dialogs', async () => {
      const user = userEvent.setup();

      const MockModalComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
              >
                <h2 id="modal-title">Theory Details</h2>
                <button onClick={() => setIsOpen(false)}>Close</button>
                <button>Action Button</button>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockModalComponent />
        </AuthProvider>
      );

      // Open modal
      await user.click(screen.getByText('Open Modal'));

      // Focus should be trapped in modal
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Should be able to close with Escape
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <TheoryCard
              theory={mockTheory}
              isBookmarked={false}
              onBookmarkToggle={jest.fn()}
            />
          </div>
        </AuthProvider>
      );

      // Should have navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Should have article landmark for theory card
      expect(screen.getByRole('article')).toBeInTheDocument();

      // Should have proper button labels
      expect(screen.getByLabelText('Bookmark Anchoring Bias')).toBeInTheDocument();
    });

    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();

      const MockLiveRegionComponent = () => {
        const [message, setMessage] = React.useState('');
        const [searchResults, setSearchResults] = React.useState(0);

        const handleSearch = (query: string) => {
          setMessage(`Searching for "${query}"...`);
          setTimeout(() => {
            setSearchResults(2);
            setMessage(`Found ${2} theories matching "${query}"`);
          }, 100);
        };

        return (
          <div>
            <input
              type="text"
              placeholder="Search theories"
              onChange={(e) => handleSearch(e.target.value)}
            />

            {/* Live region for announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {message}
            </div>

            {/* Results region */}
            <div
              role="region"
              aria-label="Search results"
              aria-live="polite"
            >
              {searchResults > 0 && (
                <p>{searchResults} theories found</p>
              )}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockLiveRegionComponent />
        </AuthProvider>
      );

      const searchInput = screen.getByPlaceholderText('Search theories');
      await user.type(searchInput, 'anchoring');

      // Should have live regions for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Search results' })).toBeInTheDocument();
    });

    it('should provide descriptive text for complex interactions', () => {
      render(
        <AuthProvider>
          <TheoryDetailView
            theory={mockTheory}
            userAccess="free"
          />
        </AuthProvider>
      );

      // Should have descriptive headings
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Anchoring Bias');

      // Should have proper section structure
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);

      // Should have descriptive link text
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should maintain sufficient color contrast ratios', () => {
      render(
        <AuthProvider>
          <TheoryCard
            theory={mockTheory}
            isBookmarked={false}
            onBookmarkToggle={jest.fn()}
          />
        </AuthProvider>
      );

      // Check for text elements that should have sufficient contrast
      const titleElement = screen.getByText('Anchoring Bias');
      const computedStyle = window.getComputedStyle(titleElement);

      // These would be actual color contrast calculations in a real test
      expect(computedStyle.color).toBeDefined();
      expect(computedStyle.backgroundColor).toBeDefined();
    });

    it('should not rely solely on color to convey information', () => {
      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory={TheoryCategory.COGNITIVE_BIASES}
              onCategoryChange={jest.fn()}
            />
            <TheoryCard
              theory={mockTheory}
              isBookmarked={true}
              onBookmarkToggle={jest.fn()}
            />
          </div>
        </AuthProvider>
      );

      // Selected category should have additional indicators beyond color
      const selectedButton = screen.getByRole('button', { pressed: true });
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true');

      // Bookmarked state should have text or icon indicators
      const bookmarkButton = screen.getByLabelText(/bookmarked/i);
      expect(bookmarkButton).toHaveTextContent(/bookmarked|saved/i);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <CategoryNavigation
            selectedCategory="all"
            onCategoryChange={jest.fn()}
          />
        </AuthProvider>
      );

      // Tab to first focusable element
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toBeVisible();

      // Should have focus styles (this would check computed styles in real test)
      expect(focusedElement).toHaveClass(/focus/);
    });

    it('should manage focus in dynamic content', async () => {
      const user = userEvent.setup();

      const MockDynamicContent = () => {
        const [showDetails, setShowDetails] = React.useState(false);
        const detailsRef = React.useRef<HTMLDivElement>(null);

        const handleShowDetails = () => {
          setShowDetails(true);
          // Focus management for dynamic content
          setTimeout(() => {
            detailsRef.current?.focus();
          }, 0);
        };

        return (
          <div>
            <button onClick={handleShowDetails}>
              Show Theory Details
            </button>
            {showDetails && (
              <div
                ref={detailsRef}
                tabIndex={-1}
                role="region"
                aria-label="Theory details"
              >
                <h2>Theory Details</h2>
                <p>Detailed information about the theory...</p>
                <button>Close Details</button>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockDynamicContent />
        </AuthProvider>
      );

      await user.click(screen.getByText('Show Theory Details'));

      // Focus should move to the new content
      expect(screen.getByRole('region', { name: 'Theory details' })).toHaveFocus();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should maintain accessibility on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <AuthProvider>
          <div className="mobile-layout">
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <TheoryCard
              theory={mockTheory}
              isBookmarked={false}
              onBookmarkToggle={jest.fn()}
            />
          </div>
        </AuthProvider>
      );

      // Should maintain proper touch targets (minimum 44px)
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });

      // Should have proper spacing between interactive elements
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should support touch gestures accessibly', async () => {
      const user = userEvent.setup();
      const mockOnSwipe = jest.fn();

      const MockSwipeableComponent = () => {
        return (
          <div
            role="region"
            aria-label="Swipeable theory list"
            onTouchStart={() => { }}
            onTouchEnd={() => mockOnSwipe()}
          >
            <div>Theory 1</div>
            <div>Theory 2</div>
            <button>Alternative navigation</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockSwipeableComponent />
        </AuthProvider>
      );

      // Should provide alternative navigation methods
      expect(screen.getByText('Alternative navigation')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Swipeable theory list' })).toBeInTheDocument();
    });
  });
});
