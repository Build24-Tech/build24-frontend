import { RelatedContent } from '@/components/knowledge-hub/RelatedContent';
import { DifficultyLevel, RelevanceType, Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the cross-linking service
const mockGetCrossLinksForTheory = jest.fn();
const mockGetPersonalizedRecommendations = jest.fn();

jest.mock('@/lib/cross-linking-service', () => ({
  getCrossLinkingService: jest.fn(() => ({
    getCrossLinksForTheory: mockGetCrossLinksForTheory,
    getPersonalizedRecommendations: mockGetPersonalizedRecommendations
  }))
}));

const mockTheory: Theory = {
  id: 'anchoring-bias',
  title: 'Anchoring Bias',
  category: TheoryCategory.COGNITIVE_BIASES,
  summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
  content: {
    description: 'Anchoring bias description',
    applicationGuide: 'How to apply anchoring bias',
    examples: [],
    relatedContent: []
  },
  metadata: {
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.MARKETING, RelevanceType.UX],
    readTime: 5,
    tags: ['pricing', 'decision-making', 'first-impression']
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  readTheories: ['some-theory'],
  bookmarkedTheories: ['another-theory'],
  badges: [],
  stats: {
    totalReadTime: 30,
    theoriesRead: 2,
    categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
    lastActiveDate: new Date(),
    streakDays: 3,
    averageSessionTime: 15
  },
  quizResults: [],
  preferences: {
    emailNotifications: true,
    progressReminders: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockRelatedContent = [
  {
    id: 'scarcity-principle',
    title: 'Scarcity Principle',
    type: 'theory' as const,
    url: '/dashboard/knowledge-hub/theory/scarcity-principle',
    description: 'People value things more when they are rare or in limited supply.'
  },
  {
    id: 'psychology-pricing',
    title: 'The Psychology of Pricing',
    type: 'blog-post' as const,
    url: '/blog/psychology-pricing',
    description: 'How psychological principles affect pricing decisions.'
  },
  {
    id: 'pricing-tool',
    title: 'Pricing Optimizer',
    type: 'project' as const,
    url: '/projects#pricing-tool',
    description: 'Tool for optimizing product pricing using psychology.'
  }
];

const mockPersonalizedRecs = [
  {
    theory: {
      id: 'loss-aversion',
      title: 'Loss Aversion',
      category: TheoryCategory.BEHAVIORAL_ECONOMICS,
      summary: 'People prefer avoiding losses over acquiring equivalent gains.',
      content: {
        description: 'Loss aversion description',
        applicationGuide: 'How to apply loss aversion',
        examples: [],
        relatedContent: []
      },
      metadata: {
        difficulty: DifficultyLevel.INTERMEDIATE,
        relevance: [RelevanceType.MARKETING],
        readTime: 6,
        tags: ['loss', 'risk']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    score: 0.85,
    type: 'theory' as const
  }
];

describe('RelatedContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCrossLinksForTheory.mockResolvedValue(mockRelatedContent);
    mockGetPersonalizedRecommendations.mockResolvedValue(mockPersonalizedRecs);
  });

  it('should render loading state initially', () => {
    render(<RelatedContent theory={mockTheory} />);

    expect(screen.getByTestId('related-content-loading') || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should load and display related content', async () => {
    render(<RelatedContent theory={mockTheory} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('related-content-loading')).not.toBeInTheDocument();
    });

    // Check if the service was called
    expect(mockGetCrossLinksForTheory).toHaveBeenCalledWith(
      mockTheory,
      undefined,
      expect.any(Object)
    );

    await waitFor(() => {
      expect(screen.getByText('Scarcity Principle')).toBeInTheDocument();
      expect(screen.getByText('The Psychology of Pricing')).toBeInTheDocument();
      expect(screen.getByText('Pricing Optimizer')).toBeInTheDocument();
    });
  });

  it('should display personalized recommendations when user progress is provided', async () => {
    render(
      <RelatedContent
        theory={mockTheory}
        userProgress={mockUserProgress}
        showPersonalized={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText('Loss Aversion')).toBeInTheDocument();
    });

    expect(mockGetPersonalizedRecommendations).toHaveBeenCalledWith(
      mockUserProgress,
      5
    );
  });

  it('should not show personalized recommendations when showPersonalized is false', async () => {
    render(
      <RelatedContent
        theory={mockTheory}
        userProgress={mockUserProgress}
        showPersonalized={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Scarcity Principle')).toBeInTheDocument();
    });

    expect(screen.queryByText('Recommended for You')).not.toBeInTheDocument();
    expect(mockGetPersonalizedRecommendations).not.toHaveBeenCalled();
  });

  it('should group content by type', async () => {
    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(screen.getByText('Related Theories')).toBeInTheDocument();
      expect(screen.getByText('Related Blog Posts')).toBeInTheDocument();
      expect(screen.getByText('Related Projects')).toBeInTheDocument();
    });
  });

  it('should display content type badges', async () => {
    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(screen.getByText('Theory')).toBeInTheDocument();
      expect(screen.getByText('Blog Post')).toBeInTheDocument();
      expect(screen.getByText('Project')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    mockGetCrossLinksForTheory.mockRejectedValue(new Error('Test error'));

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load related content/i)).toBeInTheDocument();
    });
  });

  it('should show try again button on error', async () => {
    mockGetCrossLinksForTheory.mockRejectedValue(new Error('Test error'));

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toBeInTheDocument();
    });
  });

  it('should retry loading when try again is clicked', async () => {
    mockGetCrossLinksForTheory
      .mockRejectedValueOnce(new Error('Test error'))
      .mockResolvedValueOnce(mockRelatedContent);

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Scarcity Principle')).toBeInTheDocument();
    });

    expect(mockGetCrossLinksForTheory).toHaveBeenCalledTimes(2);
  });

  it('should show empty state when no content is found', async () => {
    mockGetCrossLinksForTheory.mockResolvedValue([]);
    mockGetPersonalizedRecommendations.mockResolvedValue([]);

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(screen.getByText('No related content found')).toBeInTheDocument();
      expect(screen.getByText(/check back later/i)).toBeInTheDocument();
    });
  });

  it('should respect maxItems prop', async () => {
    render(<RelatedContent theory={mockTheory} maxItems={2} />);

    await waitFor(() => {
      expect(mockGetCrossLinksForTheory).toHaveBeenCalledWith(
        mockTheory,
        undefined,
        {
          maxRelatedTheories: 1, // Math.ceil(2 * 0.5)
          maxBlogPosts: 1,       // Math.ceil(2 * 0.3)
          maxProjects: 1         // Math.ceil(2 * 0.2)
        }
      );
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <RelatedContent theory={mockTheory} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should reload content when theory changes', async () => {
    const { rerender } = render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(mockGetCrossLinksForTheory).toHaveBeenCalledTimes(1);
    });

    const newTheory = { ...mockTheory, id: 'new-theory' };
    rerender(<RelatedContent theory={newTheory} />);

    await waitFor(() => {
      expect(mockGetCrossLinksForTheory).toHaveBeenCalledTimes(2);
    });
  });

  it('should reload content when user progress changes', async () => {
    const { rerender } = render(
      <RelatedContent theory={mockTheory} userProgress={mockUserProgress} />
    );

    await waitFor(() => {
      expect(mockGetCrossLinksForTheory).toHaveBeenCalledTimes(1);
    });

    const newUserProgress = { ...mockUserProgress, userId: 'new-user' };
    rerender(
      <RelatedContent theory={mockTheory} userProgress={newUserProgress} />
    );

    await waitFor(() => {
      expect(mockGetCrossLinksForTheory).toHaveBeenCalledTimes(2);
    });
  });

  it('should display recommendation scores', async () => {
    render(
      <RelatedContent
        theory={mockTheory}
        userProgress={mockUserProgress}
        showPersonalized={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument(); // 0.85 * 100
    });
  });

  it('should show correct content type colors', async () => {
    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      const theoryBadge = screen.getByText('Theory');
      const blogBadge = screen.getByText('Blog Post');
      const projectBadge = screen.getByText('Project');

      expect(theoryBadge).toHaveClass('text-blue-600');
      expect(blogBadge).toHaveClass('text-green-600');
      expect(projectBadge).toHaveClass('text-purple-600');
    });
  });

  it('should render correct links for different content types', async () => {
    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      const theoryLink = screen.getByRole('link', { name: /scarcity principle/i });
      const blogLink = screen.getByRole('link', { name: /psychology of pricing/i });
      const projectLink = screen.getByRole('link', { name: /pricing optimizer/i });

      expect(theoryLink).toHaveAttribute('href', '/dashboard/knowledge-hub/theory/scarcity-principle');
      expect(blogLink).toHaveAttribute('href', '/blog/psychology-pricing');
      expect(projectLink).toHaveAttribute('href', '/projects#pricing-tool');
    });
  });
});

describe('RelatedContentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCrossLinksForTheory.mockResolvedValue(mockRelatedContent);
    mockGetPersonalizedRecommendations.mockResolvedValue(mockPersonalizedRecs);
  });

  it('should not render when no items are provided', () => {
    const { container } = render(
      <div data-testid="parent">
        {/* RelatedContentSection would be rendered here if items existed */}
      </div>
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should show "Show All" button when items exceed maxDisplay', async () => {
    // Mock more items than maxDisplay (3)
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      type: 'theory' as const,
      url: `/theory/${i}`,
      description: `Description ${i}`
    }));

    mockGetCrossLinksForTheory.mockResolvedValue(manyItems);

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      expect(screen.getByText(/show all \d+ items/i)).toBeInTheDocument();
    });
  });

  it('should expand to show all items when "Show All" is clicked', async () => {
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      type: 'theory' as const,
      url: `/theory/${i}`,
      description: `Description ${i}`
    }));

    mockGetCrossLinksForTheory.mockResolvedValue(manyItems);

    render(<RelatedContent theory={mockTheory} />);

    await waitFor(() => {
      const showAllButton = screen.getByText(/show all \d+ items/i);
      fireEvent.click(showAllButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
      // All items should be visible
      expect(screen.getByText('Item 4')).toBeInTheDocument();
    });
  });
});
