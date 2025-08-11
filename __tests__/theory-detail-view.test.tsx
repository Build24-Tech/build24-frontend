import { TheoryDetailView } from '@/components/knowledge-hub/TheoryDetailView';
import { AccessLevel, DifficultyLevel, ExampleType, RelevanceType, Theory, TheoryCategory } from '@/types/knowledge-hub';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the MarkdownRenderer component
jest.mock('@/components/markdown/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown-content">{content}</div>
  ),
}));

const mockTheory: Theory = {
  id: 'test-theory',
  title: 'Test Theory',
  category: TheoryCategory.COGNITIVE_BIASES,
  summary: 'This is a test theory summary that contains exactly fifty words to meet the minimum requirement for theory summaries in the knowledge hub system. It provides a comprehensive overview of the psychological concept being discussed and its relevance to product development and user experience design.',
  content: {
    description: 'This is a detailed description of the test theory.',
    visualDiagram: '/images/test-diagram.svg',
    applicationGuide: '## How to Apply\n\nThis is how you apply the theory.',
    examples: [
      {
        id: 'example-1',
        type: ExampleType.BEFORE_AFTER,
        title: 'Before/After Example',
        description: 'This shows the difference',
        beforeImage: '/images/before.png',
        afterImage: '/images/after.png',
      },
      {
        id: 'example-2',
        type: ExampleType.CASE_STUDY,
        title: 'Case Study Example',
        description: 'This is a case study',
        caseStudyContent: '# Case Study\n\nThis is the case study content.',
      },
    ],
    relatedContent: [
      {
        id: 'related-1',
        title: 'Related Blog Post',
        type: 'blog-post',
        url: '/blog/related-post',
        description: 'A related blog post',
      },
    ],
  },
  metadata: {
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.UX, RelevanceType.MARKETING],
    readTime: 5,
    tags: ['test', 'psychology', 'ux'],
  },
  premiumContent: {
    extendedCaseStudies: '# Extended Case Studies\n\nPremium content here.',
    downloadableResources: [
      {
        id: 'resource-1',
        title: 'Test Template',
        description: 'A test template',
        fileUrl: '/downloads/template.pdf',
        fileType: 'pdf',
        fileSize: 1024,
      },
    ],
    advancedApplications: '# Advanced Applications\n\nAdvanced content here.',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TheoryDetailView', () => {
  const defaultProps = {
    theory: mockTheory,
    userAccess: AccessLevel.FREE,
    isBookmarked: false,
    onBookmarkToggle: jest.fn(),
    onShare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theory information correctly', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Test Theory')).toBeInTheDocument();
    expect(screen.getByText(/This is a test theory summary/)).toBeInTheDocument();
    expect(screen.getAllByText('Beginner')).toHaveLength(2); // Badge and sidebar
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getAllByText('User Experience')).toHaveLength(2); // Header and sidebar
    expect(screen.getAllByText('Marketing')).toHaveLength(2); // Header and sidebar
  });

  it('displays loading skeleton when isLoading is true', () => {
    render(<TheoryDetailView {...defaultProps} isLoading={true} />);

    // Check that skeleton elements are present (they use animate-pulse class)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Check that the main content is not rendered
    expect(screen.queryByText('Test Theory')).not.toBeInTheDocument();
  });

  it('renders markdown content using MarkdownRenderer', () => {
    render(<TheoryDetailView {...defaultProps} />);

    const markdownElements = screen.getAllByTestId('markdown-content');
    expect(markdownElements.length).toBeGreaterThan(0);
    expect(markdownElements[0]).toHaveTextContent('This is a detailed description of the test theory.');
  });

  it('displays visual diagram when available', () => {
    render(<TheoryDetailView {...defaultProps} />);

    const diagramImage = screen.getByAltText('Test Theory visual diagram');
    expect(diagramImage).toBeInTheDocument();
    expect(diagramImage).toHaveAttribute('src', '/images/test-diagram.svg');
  });

  it('renders interactive examples correctly', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Before/After Example')).toBeInTheDocument();
    expect(screen.getByText('Case Study Example')).toBeInTheDocument();
    expect(screen.getByText('This shows the difference')).toBeInTheDocument();
    expect(screen.getByText('This is a case study')).toBeInTheDocument();
  });

  it('displays before/after images for before-after examples', () => {
    render(<TheoryDetailView {...defaultProps} />);

    const beforeImage = screen.getByAltText('Before example');
    const afterImage = screen.getByAltText('After example');

    expect(beforeImage).toBeInTheDocument();
    expect(afterImage).toBeInTheDocument();
    expect(beforeImage).toHaveAttribute('src', '/images/before.png');
    expect(afterImage).toHaveAttribute('src', '/images/after.png');
  });

  it('handles bookmark toggle correctly', () => {
    const onBookmarkToggle = jest.fn();
    render(<TheoryDetailView {...defaultProps} onBookmarkToggle={onBookmarkToggle} />);

    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
    fireEvent.click(bookmarkButton);

    expect(onBookmarkToggle).toHaveBeenCalledWith('test-theory');
  });

  it('shows bookmarked state when isBookmarked is true', () => {
    render(<TheoryDetailView {...defaultProps} isBookmarked={true} />);

    expect(screen.getByRole('button', { name: /bookmarked/i })).toBeInTheDocument();
  });

  it('handles share functionality', () => {
    const onShare = jest.fn();
    render(<TheoryDetailView {...defaultProps} onShare={onShare} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(onShare).toHaveBeenCalledWith(mockTheory);
  });

  it('displays premium content for premium users', () => {
    render(<TheoryDetailView {...defaultProps} userAccess={AccessLevel.PREMIUM} />);

    expect(screen.getByText('Premium Content')).toBeInTheDocument();
    expect(screen.getByText('Extended Case Studies')).toBeInTheDocument();
    expect(screen.getByText('Advanced Applications')).toBeInTheDocument();
    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('shows premium gate for free users when premium content exists', () => {
    render(<TheoryDetailView {...defaultProps} userAccess={AccessLevel.FREE} />);

    expect(screen.getAllByText('Premium Content')).toHaveLength(2); // Badge and section title
    expect(screen.getByText(/unlock extended case studies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade to premium/i })).toBeInTheDocument();
  });

  it('displays related content links', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Related Content')).toBeInTheDocument();
    expect(screen.getByText('Related Blog Post')).toBeInTheDocument();

    const relatedLink = screen.getByRole('link', { name: /related blog post/i });
    expect(relatedLink).toHaveAttribute('href', '/blog/related-post');
  });

  it('displays theory tags', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#psychology')).toBeInTheDocument();
    expect(screen.getByText('#ux')).toBeInTheDocument();
  });

  it('shows back navigation link', () => {
    render(<TheoryDetailView {...defaultProps} />);

    const backLink = screen.getByRole('link', { name: /back to cognitive biases/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/dashboard/knowledge-hub/category/cognitive-biases');
  });

  it('displays quick info sidebar', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Quick Info')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Read Time')).toBeInTheDocument();
    expect(screen.getByText('Best For')).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();
  });

  it('handles image loading errors gracefully', async () => {
    render(<TheoryDetailView {...defaultProps} />);

    const diagramImage = screen.getByAltText('Test Theory visual diagram');

    // Simulate image load error
    fireEvent.error(diagramImage);

    await waitFor(() => {
      expect(screen.getByText('Visual diagram will be displayed here')).toBeInTheDocument();
    });
  });

  it('renders case study content with markdown', () => {
    render(<TheoryDetailView {...defaultProps} />);

    // Find the case study example section
    expect(screen.getByText('Case Study Example')).toBeInTheDocument();

    // Check that markdown content is rendered for case study
    const markdownElements = screen.getAllByTestId('markdown-content');
    const caseStudyMarkdown = markdownElements.find(el =>
      el.textContent?.includes('Case Study')
    );
    expect(caseStudyMarkdown).toBeInTheDocument();
  });

  it('shows premium badge when theory has premium content', () => {
    render(<TheoryDetailView {...defaultProps} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('does not show premium badge when theory has no premium content', () => {
    const theoryWithoutPremium = { ...mockTheory, premiumContent: undefined };
    render(<TheoryDetailView {...defaultProps} theory={theoryWithoutPremium} />);

    expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  });
});
