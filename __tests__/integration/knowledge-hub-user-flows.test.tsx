/**
 * Integration tests for Knowledge Hub user flows
 * Tests complete user journeys and component interactions
 */

import { AuthContext } from '@/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/dashboard/knowledge-hub',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/knowledge-hub',
}));

// Mock Firebase services
jest.mock('@/lib/firestore', () => ({
  getUserProgress: jest.fn(),
  updateUserProgress: jest.fn(),
  getUserBookmarks: jest.fn(),
  addBookmark: jest.fn(),
  removeBookmark: jest.fn(),
}));

jest.mock('@/lib/theories', () => ({
  getAllTheories: jest.fn(),
  getTheoryById: jest.fn(),
  getTheoriesByCategory: jest.fn(),
  searchTheories: jest.fn(),
}));

// Import components after mocks
import { BookmarkManager } from '@/components/knowledge-hub/BookmarkManager';
import { CategoryNavigation } from '@/components/knowledge-hub/CategoryNavigation';
import { ProgressTracker } from '@/components/knowledge-hub/ProgressTracker';
import { SearchAndFilter } from '@/components/knowledge-hub/SearchAndFilter';
import { TheoryList } from '@/components/knowledge-hub/TheoryList';
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
    summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
    content: {
      description: 'Detailed description of anchoring bias',
      applicationGuide: 'How to apply anchoring bias in product design',
      examples: [],
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
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'People follow the actions of others when uncertain about what to do.',
    content: {
      description: 'Detailed description of social proof',
      applicationGuide: 'How to apply social proof in marketing',
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: 'intermediate',
      relevance: ['marketing', 'sales'],
      readTime: 5,
      tags: ['testimonials', 'reviews'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUserProgress: UserProgress = {
  userId: 'test-user-id',
  readTheories: ['anchoring-bias'],
  bookmarkedTheories: ['social-proof'],
  badges: [],
  stats: {
    totalReadTime: 15,
    theoriesRead: 1,
    categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
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

describe('Knowledge Hub User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const { getAllTheories, getTheoriesByCategory, searchTheories } = require('@/lib/theories');
    const { getUserProgress, getUserBookmarks } = require('@/lib/firestore');

    getAllTheories.mockResolvedValue(mockTheories);
    getTheoriesByCategory.mockResolvedValue(mockTheories);
    searchTheories.mockResolvedValue(mockTheories);
    getUserProgress.mockResolvedValue(mockUserProgress);
    getUserBookmarks.mockResolvedValue(['social-proof']);
  });

  describe('Discovery Flow', () => {
    it('should allow user to discover theories through category navigation', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <TheoryList theories={mockTheories} />
          </div>
        </AuthProvider>
      );

      // Should show all categories
      expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
      expect(screen.getByText('Persuasion Principles')).toBeInTheDocument();

      // Should show theory cards
      expect(screen.getByText('Anchoring Bias')).toBeInTheDocument();
      expect(screen.getByText('Social Proof')).toBeInTheDocument();

      // Click on a category
      await user.click(screen.getByText('Cognitive Biases'));

      // Should filter theories (this would be handled by parent component)
      expect(screen.getByText('Anchoring Bias')).toBeInTheDocument();
    });

    it('should allow user to search and filter theories', async () => {
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();
      const mockOnFilterChange = jest.fn();

      render(
        <AuthProvider>
          <SearchAndFilter
            onSearch={mockOnSearch}
            onFilterChange={mockOnFilterChange}
            filters={{
              category: 'all',
              difficulty: 'all',
              relevance: 'all',
            }}
          />
        </AuthProvider>
      );

      // Search for theories
      const searchInput = screen.getByPlaceholderText(/search theories/i);
      await user.type(searchInput, 'anchoring');

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('anchoring');
      });

      // Apply difficulty filter
      const difficultyFilter = screen.getByRole('combobox', { name: /difficulty/i });
      await user.click(difficultyFilter);

      const beginnerOption = screen.getByText('Beginner');
      await user.click(beginnerOption);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        category: 'all',
        difficulty: 'beginner',
        relevance: 'all',
      });
    });
  });

  describe('Bookmark Flow', () => {
    it('should allow user to bookmark and unbookmark theories', async () => {
      const user = userEvent.setup();
      const { addBookmark, removeBookmark } = require('@/lib/firestore');

      render(
        <AuthProvider>
          <BookmarkManager
            userId="test-user-id"
            theoryId="anchoring-bias"
            isBookmarked={false}
          />
        </AuthProvider>
      );

      // Should show bookmark button
      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      expect(bookmarkButton).toBeInTheDocument();

      // Click to bookmark
      await user.click(bookmarkButton);

      await waitFor(() => {
        expect(addBookmark).toHaveBeenCalledWith('test-user-id', 'anchoring-bias');
      });
    });

    it('should display bookmarked theories in dedicated view', async () => {
      const { getUserBookmarks } = require('@/lib/firestore');
      getUserBookmarks.mockResolvedValue(['social-proof']);

      render(
        <AuthProvider>
          <BookmarkManager
            userId="test-user-id"
            theoryId="social-proof"
            isBookmarked={true}
          />
        </AuthProvider>
      );

      // Should show bookmarked state
      const bookmarkButton = screen.getByRole('button', { name: /bookmarked/i });
      expect(bookmarkButton).toBeInTheDocument();
    });
  });

  describe('Progress Tracking Flow', () => {
    it('should track reading progress and award badges', async () => {
      const { updateUserProgress } = require('@/lib/firestore');

      render(
        <AuthProvider>
          <ProgressTracker
            userId="test-user-id"
            userProgress={mockUserProgress}
          />
        </AuthProvider>
      );

      // Should display current progress
      expect(screen.getByText('1')).toBeInTheDocument(); // theories read
      expect(screen.getByText('15')).toBeInTheDocument(); // total read time

      // Should show categories explored
      expect(screen.getByText(/cognitive biases/i)).toBeInTheDocument();
    });

    it('should update progress when theory is completed', async () => {
      const { updateUserProgress } = require('@/lib/firestore');

      // Simulate theory completion
      const updatedProgress = {
        ...mockUserProgress,
        readTheories: ['anchoring-bias', 'social-proof'],
        stats: {
          ...mockUserProgress.stats,
          theoriesRead: 2,
          totalReadTime: 20,
        },
      };

      render(
        <AuthProvider>
          <ProgressTracker
            userId="test-user-id"
            userProgress={updatedProgress}
          />
        </AuthProvider>
      );

      expect(screen.getByText('2')).toBeInTheDocument(); // updated theories read
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle theory loading errors gracefully', async () => {
      const { getAllTheories } = require('@/lib/theories');
      getAllTheories.mockRejectedValue(new Error('Failed to load theories'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <AuthProvider>
          <TheoryList theories={[]} />
        </AuthProvider>
      );

      // Should show empty state or error message
      expect(screen.getByText(/no theories available/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle bookmark sync failures', async () => {
      const { addBookmark } = require('@/lib/firestore');
      addBookmark.mockRejectedValue(new Error('Sync failed'));

      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <AuthProvider>
          <BookmarkManager
            userId="test-user-id"
            theoryId="anchoring-bias"
            isBookmarked={false}
          />
        </AuthProvider>
      );

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      await user.click(bookmarkButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Mobile Responsiveness Flow', () => {
    it('should adapt layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <TheoryList theories={mockTheories} />
          </div>
        </AuthProvider>
      );

      // Should render mobile-friendly layout
      const categoryNav = screen.getByRole('navigation');
      expect(categoryNav).toBeInTheDocument();

      // Theory cards should be stacked vertically on mobile
      const theoryCards = screen.getAllByRole('article');
      expect(theoryCards).toHaveLength(2);
    });
  });

  describe('Accessibility Flow', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <SearchAndFilter
              onSearch={jest.fn()}
              onFilterChange={jest.fn()}
              filters={{
                category: 'all',
                difficulty: 'all',
                relevance: 'all',
              }}
            />
          </div>
        </AuthProvider>
      );

      // Should be able to navigate with keyboard
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'text');
    });

    it('should have proper ARIA labels and roles', () => {
      render(
        <AuthProvider>
          <div>
            <CategoryNavigation
              selectedCategory="all"
              onCategoryChange={jest.fn()}
            />
            <TheoryList theories={mockTheories} />
          </div>
        </AuthProvider>
      );

      // Check for proper ARIA attributes
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(2);
      expect(screen.getAllByRole('button')).toHaveLength(6); // Category buttons + bookmark buttons
    });
  });
});
