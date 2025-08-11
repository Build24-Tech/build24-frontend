import { PremiumContentPreview } from '@/components/knowledge-hub/PremiumContentPreview';
import { PremiumContent } from '@/types/knowledge-hub';
import { render, screen } from '@testing-library/react';

describe('PremiumContentPreview', () => {
  const mockPremiumContent: PremiumContent = {
    extendedCaseStudies: 'This is a detailed case study that shows how the theory applies in real-world scenarios. It includes multiple examples and detailed analysis of the implementation process.',
    downloadableResources: [
      {
        id: 'resource-1',
        title: 'Implementation Template',
        description: 'A comprehensive template for implementing this theory',
        fileUrl: 'https://example.com/template.pdf',
        fileType: 'template',
        fileSize: 1024000
      },
      {
        id: 'resource-2',
        title: 'A/B Test Script',
        description: 'Ready-to-use script for A/B testing this theory',
        fileUrl: 'https://example.com/script.js',
        fileType: 'script',
        fileSize: 512000
      },
      {
        id: 'resource-3',
        title: 'Checklist Guide',
        description: 'Step-by-step checklist for implementation',
        fileUrl: 'https://example.com/checklist.pdf',
        fileType: 'checklist',
        fileSize: 256000
      },
      {
        id: 'resource-4',
        title: 'Additional Resource',
        description: 'Extra resource for testing',
        fileUrl: 'https://example.com/extra.pdf',
        fileType: 'pdf',
        fileSize: 128000
      }
    ],
    advancedApplications: 'Advanced techniques for implementing this theory include sophisticated approaches that require deeper understanding and more complex implementation strategies.'
  };

  it('should render extended case studies preview', () => {
    render(<PremiumContentPreview premiumContent={mockPremiumContent} />);

    expect(screen.getByText('Extended Case Studies')).toBeInTheDocument();
    expect(screen.getByText(/This is a detailed case study that shows how the theory applies/)).toBeInTheDocument();
    expect(screen.getAllByText('Premium')).toHaveLength(2); // Extended Case Studies and Advanced Applications
  });

  it('should render downloadable resources preview', () => {
    render(<PremiumContentPreview premiumContent={mockPremiumContent} />);

    expect(screen.getByText('Downloadable Resources')).toBeInTheDocument();
    expect(screen.getByText('4 files')).toBeInTheDocument();

    // Should show first 3 resources
    expect(screen.getByText('Implementation Template')).toBeInTheDocument();
    expect(screen.getByText('A/B Test Script')).toBeInTheDocument();
    expect(screen.getByText('Checklist Guide')).toBeInTheDocument();

    // Should show file types
    expect(screen.getByText('TEMPLATE')).toBeInTheDocument();
    expect(screen.getByText('SCRIPT')).toBeInTheDocument();
    expect(screen.getByText('CHECKLIST')).toBeInTheDocument();

    // Should show "more resources" indicator
    expect(screen.getByText('+ 1 more resources')).toBeInTheDocument();
  });

  it('should render advanced applications preview', () => {
    render(<PremiumContentPreview premiumContent={mockPremiumContent} />);

    expect(screen.getByText('Advanced Applications')).toBeInTheDocument();
    expect(screen.getByText(/Advanced techniques for implementing this theory include/)).toBeInTheDocument();
  });

  it('should truncate long text content', () => {
    const longContent: PremiumContent = {
      extendedCaseStudies: 'A'.repeat(200), // 200 characters
      downloadableResources: [],
      advancedApplications: 'B'.repeat(200) // 200 characters
    };

    render(<PremiumContentPreview premiumContent={longContent} />);

    // Should show truncated text with ellipsis
    const caseStudyText = screen.getByText(/A{150}\.\.\.$/);
    expect(caseStudyText).toBeInTheDocument();

    const advancedText = screen.getByText(/B{150}\.\.\.$/);
    expect(advancedText).toBeInTheDocument();

    // Should show character count indicators
    expect(screen.getByText('+ 50 more characters of detailed analysis')).toBeInTheDocument();
    expect(screen.getByText('+ 50 more characters of advanced techniques')).toBeInTheDocument();
  });

  it('should handle short content without truncation', () => {
    const shortContent: PremiumContent = {
      extendedCaseStudies: 'Short case study content.',
      downloadableResources: [],
      advancedApplications: 'Short advanced content.'
    };

    render(<PremiumContentPreview premiumContent={shortContent} />);

    expect(screen.getByText('Short case study content.')).toBeInTheDocument();
    expect(screen.getByText('Short advanced content.')).toBeInTheDocument();

    // Should not show character count indicators for short content
    expect(screen.queryByText(/more characters/)).not.toBeInTheDocument();
  });

  it('should handle empty downloadable resources', () => {
    const contentWithoutResources: PremiumContent = {
      extendedCaseStudies: 'Case study content',
      downloadableResources: [],
      advancedApplications: 'Advanced content'
    };

    render(<PremiumContentPreview premiumContent={contentWithoutResources} />);

    expect(screen.queryByText('Downloadable Resources')).not.toBeInTheDocument();
    expect(screen.getByText('Extended Case Studies')).toBeInTheDocument();
    expect(screen.getByText('Advanced Applications')).toBeInTheDocument();
  });

  it('should handle exactly 3 resources without showing more indicator', () => {
    const contentWith3Resources: PremiumContent = {
      extendedCaseStudies: 'Case study content',
      downloadableResources: mockPremiumContent.downloadableResources.slice(0, 3),
      advancedApplications: 'Advanced content'
    };

    render(<PremiumContentPreview premiumContent={contentWith3Resources} />);

    expect(screen.getByText('3 files')).toBeInTheDocument();
    expect(screen.queryByText(/more resources/)).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PremiumContentPreview
        premiumContent={mockPremiumContent}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show premium badges on all sections', () => {
    render(<PremiumContentPreview premiumContent={mockPremiumContent} />);

    const premiumBadges = screen.getAllByText('Premium');
    expect(premiumBadges).toHaveLength(2); // Extended Case Studies and Advanced Applications (not downloadable resources)
  });
});
