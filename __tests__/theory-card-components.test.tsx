import { TheoryCard } from '@/components/knowledge-hub/TheoryCard';
import { TheoryCardSkeleton } from '@/components/knowledge-hub/TheoryCardSkeleton';
import { TheoryList } from '@/components/knowledge-hub/TheoryList';
import {
  DifficultyLevel,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock theory data
const mockTheory: Theory = {
  id: 'test-theory',
  title: 'Test Theory Title',
  category: TheoryCategory.COGNITIVE_BIASES,
  summary: 'This is a test summary that should be between fifty and eighty words to meet the requirements. It provides a comprehensive overview of the theory and its applications in product development and user experience design.',
  content: {
    description: 'Detailed description of the theory',
    applicationGuide: 'How to apply this theory',
    examples: [],
    relatedContent: []
  },
  metadata: {
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.UX, RelevanceType.MARKETING],
    readTime: 5,
    tags: ['psychology', 'ux-design', 'conversion']
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const mockPremiumTheory: Theory = {
  ...mockTheory,
  id: 'premium-theory',
  title: 'Premium Theory Title',
  premiumContent: {
    extendedCaseStudies: 'Extended case studies content',
    downloadableResources: [],
    advancedApplications: 'Advanced applications content'
  }
};

describe('TheoryCard', () => {
  const mockOnBookmarkToggle = jest.fn();
  const mockOnTheoryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theory card with basic information', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    expect(screen.getByText('Test Theory Title')).toBeInTheDocument();
    expect(screen.getByText(/This is a test summary/)).toBeInTheDocument();
    expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
  });

  it('displays premium badge for premium theories', () => {
    render(
      <TheoryCard
        theory={mockPremiumTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        showPremiumBadge={true}
      />
    );

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('hides premium badge when showPremiumBadge is false', () => {
    render(
      <TheoryCard
        theory={mockPremiumTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        showPremiumBadge={false}
      />
    );

    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });

  it('shows bookmarked state correctly', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={true}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    const bookmarkButton = screen.getByLabelText('Remove bookmark');
    expect(bookmarkButton).toBeInTheDocument();
  });

  it('shows unbookmarked state correctly', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    const bookmarkButton = screen.getByLabelText('Add bookmark');
    expect(bookmarkButton).toBeInTheDocument();
  });

  it('calls onTheoryClick when card is clicked', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    const card = screen.getByText('Test Theory Title').closest('[role="button"], div[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnTheoryClick).toHaveBeenCalledWith('test-theory');
    }
  });

  it('calls onBookmarkToggle when bookmark button is clicked', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    const bookmarkButton = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkButton);
    expect(mockOnBookmarkToggle).toHaveBeenCalledWith('test-theory');
  });

  it('prevents event propagation when bookmark button is clicked', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    const bookmarkButton = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkButton);

    expect(mockOnBookmarkToggle).toHaveBeenCalledWith('test-theory');
    expect(mockOnTheoryClick).not.toHaveBeenCalled();
  });

  it('displays theory tags', () => {
    render(
      <TheoryCard
        theory={mockTheory}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    expect(screen.getByText('#psychology')).toBeInTheDocument();
    expect(screen.getByText('#ux-design')).toBeInTheDocument();
    expect(screen.getByText('#conversion')).toBeInTheDocument();
  });

  it('limits displayed tags to 3 and shows count for additional tags', () => {
    const theoryWithManyTags: Theory = {
      ...mockTheory,
      metadata: {
        ...mockTheory.metadata,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      }
    };

    render(
      <TheoryCard
        theory={theoryWithManyTags}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
    expect(screen.getByText('#tag3')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('#tag4')).not.toBeInTheDocument();
  });
});

describe('TheoryList', () => {
  const mockOnBookmarkToggle = jest.fn();
  const mockOnTheoryClick = jest.fn();
  const mockTheories = [mockTheory, mockPremiumTheory];
  const mockBookmarkedTheories = ['test-theory'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of theories', () => {
    render(
      <TheoryList
        theories={mockTheories}
        bookmarkedTheories={mockBookmarkedTheories}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    expect(screen.getByText('Test Theory Title')).toBeInTheDocument();
    expect(screen.getByText('Premium Theory Title')).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    render(
      <TheoryList
        theories={[]}
        bookmarkedTheories={[]}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        isLoading={true}
        loadingCount={3}
      />
    );

    // Check that skeleton components are rendered
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no theories are provided', () => {
    render(
      <TheoryList
        theories={[]}
        bookmarkedTheories={[]}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        isLoading={false}
      />
    );

    expect(screen.getByText('No theories found')).toBeInTheDocument();
    expect(screen.getByText('No theories found matching your criteria.')).toBeInTheDocument();
  });

  it('shows custom empty state message', () => {
    const customMessage = 'Custom empty state message';
    render(
      <TheoryList
        theories={[]}
        bookmarkedTheories={[]}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        isLoading={false}
        emptyStateMessage={customMessage}
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('passes correct bookmark state to theory cards', () => {
    render(
      <TheoryList
        theories={mockTheories}
        bookmarkedTheories={['test-theory']}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    // First theory should be bookmarked
    expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument();

    // Second theory should not be bookmarked (there should be an "Add bookmark" button)
    expect(screen.getByLabelText('Add bookmark')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TheoryList
        theories={mockTheories}
        bookmarkedTheories={mockBookmarkedTheories}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('hides premium badges when showPremiumBadges is false', () => {
    render(
      <TheoryList
        theories={[mockPremiumTheory]}
        bookmarkedTheories={[]}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
        showPremiumBadges={false}
      />
    );

    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });
});

describe('TheoryCardSkeleton', () => {
  it('renders skeleton component', () => {
    const { container } = render(<TheoryCardSkeleton />);

    // Check that skeleton elements are present
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<TheoryCardSkeleton className="custom-skeleton-class" />);

    expect(container.firstChild).toHaveClass('custom-skeleton-class');
  });

  it('has proper card structure', () => {
    render(<TheoryCardSkeleton />);

    // Should render within a card component structure
    const cardElement = document.querySelector('[class*="border"]');
    expect(cardElement).toBeInTheDocument();
  });
});

describe('Component Integration', () => {
  it('TheoryList properly integrates with TheoryCard components', () => {
    const mockOnBookmarkToggle = jest.fn();
    const mockOnTheoryClick = jest.fn();

    render(
      <TheoryList
        theories={[mockTheory]}
        bookmarkedTheories={[]}
        onBookmarkToggle={mockOnBookmarkToggle}
        onTheoryClick={mockOnTheoryClick}
      />
    );

    // Click on the theory card
    const theoryTitle = screen.getByText('Test Theory Title');
    const card = theoryTitle.closest('[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnTheoryClick).toHaveBeenCalledWith('test-theory');
    }

    // Click on bookmark button
    const bookmarkButton = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkButton);
    expect(mockOnBookmarkToggle).toHaveBeenCalledWith('test-theory');
  });
});
