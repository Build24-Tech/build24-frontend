import {
  BookmarkLoading,
  InlineLoading,
  LoadingSpinner,
  PageLoading,
  ProgressLoading,
  SearchLoading,
  TheoryContentLoading,
  TheoryListLoading
} from '@/components/knowledge-hub/LoadingStates';
import { render, screen } from '@testing-library/react';

describe('LoadingStates', () => {
  describe('LoadingSpinner', () => {
    it('should render with default size', () => {
      render(<LoadingSpinner />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<LoadingSpinner text="Loading content..." />);
      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('should apply correct size classes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(document.querySelector('.h-4.w-4')).toBeInTheDocument();

      rerender(<LoadingSpinner size="lg" />);
      expect(document.querySelector('.h-8.w-8')).toBeInTheDocument();
    });
  });

  describe('TheoryContentLoading', () => {
    it('should render theory content skeleton', () => {
      render(<TheoryContentLoading />);

      // Should have multiple skeleton elements
      const skeletons = document.querySelectorAll('[data-testid="skeleton"], .animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('TheoryListLoading', () => {
    it('should render default number of theory card skeletons', () => {
      render(<TheoryListLoading />);

      // Should render 6 cards by default - look for card containers
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.children.length).toBe(6);
    });

    it('should render custom number of theory card skeletons', () => {
      render(<TheoryListLoading count={3} />);

      // Should render 3 cards
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer?.children.length).toBe(3);
    });
  });

  describe('SearchLoading', () => {
    it('should render search loading state', () => {
      render(<SearchLoading />);
      expect(screen.getByText('Searching theories...')).toBeInTheDocument();
    });

    it('should have search icon', () => {
      render(<SearchLoading />);
      const searchIcon = document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('BookmarkLoading', () => {
    it('should render bookmark loading state', () => {
      render(<BookmarkLoading />);
      expect(screen.getByText('Loading bookmarks...')).toBeInTheDocument();
    });

    it('should have bookmark icon', () => {
      render(<BookmarkLoading />);
      const bookmarkIcon = document.querySelector('svg');
      expect(bookmarkIcon).toBeInTheDocument();
    });
  });

  describe('ProgressLoading', () => {
    it('should render progress loading state', () => {
      render(<ProgressLoading />);
      expect(screen.getByText('Loading progress...')).toBeInTheDocument();
    });

    it('should have user icon', () => {
      render(<ProgressLoading />);
      const userIcon = document.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
    });

    it('should render skeleton elements', () => {
      render(<ProgressLoading />);
      const skeletons = document.querySelectorAll('[data-testid="skeleton"], .animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('PageLoading', () => {
    it('should render with default message', () => {
      render(<PageLoading />);
      expect(screen.getByText('Loading Knowledge Hub...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<PageLoading message="Loading theories..." />);
      expect(screen.getByText('Loading theories...')).toBeInTheDocument();
    });

    it('should have loading spinner', () => {
      render(<PageLoading />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('InlineLoading', () => {
    it('should render without text', () => {
      render(<InlineLoading />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<InlineLoading text="Saving..." />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should have inline layout', () => {
      render(<InlineLoading text="Loading..." />);
      const container = document.querySelector('.flex.items-center');
      expect(container).toBeInTheDocument();
    });
  });
});
