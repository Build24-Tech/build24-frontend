import InteractiveExample, {
  BeforeAfterView,
  CaseStudyView,
  ExampleNavigation,
  InteractiveDemo
} from '@/components/knowledge-hub/InteractiveExample';
import { ExampleType, InteractiveExample as InteractiveExampleType } from '@/types/knowledge-hub';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the MarkdownRenderer component
jest.mock('@/components/markdown', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div data-testid="markdown-content">{content}</div>
}));

// Mock the DynamicComponentLoader
jest.mock('@/components/knowledge-hub/DynamicComponentLoader', () => {
  return function MockDynamicComponentLoader({ componentName, isPlaying }: any) {
    return (
      <div data-testid="dynamic-component">
        <span>Component: {componentName}</span>
        <span>Playing: {isPlaying ? 'true' : 'false'}</span>
      </div>
    );
  };
});

const mockBeforeAfterExample: InteractiveExampleType = {
  id: 'before-after-1',
  type: ExampleType.BEFORE_AFTER,
  title: 'UI Improvement Example',
  description: 'See how applying this principle improves the user interface',
  beforeImage: 'https://example.com/before.jpg',
  afterImage: 'https://example.com/after.jpg'
};

const mockInteractiveDemoExample: InteractiveExampleType = {
  id: 'demo-1',
  type: ExampleType.INTERACTIVE_DEMO,
  title: 'Interactive Demonstration',
  description: 'Try this interactive demo to understand the concept',
  interactiveComponent: 'anchoring-bias-demo'
};

const mockCaseStudyExample: InteractiveExampleType = {
  id: 'case-study-1',
  type: ExampleType.CASE_STUDY,
  title: 'Real-World Case Study',
  description: 'Learn from a real implementation',
  caseStudyContent: '# Case Study\n\nThis is a detailed case study about implementing the principle.'
};

const mockExamples = [mockBeforeAfterExample, mockInteractiveDemoExample, mockCaseStudyExample];

describe('InteractiveExample', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Component', () => {
    it('renders without examples', () => {
      render(<InteractiveExample examples={[]} />);
      expect(screen.getByText('No interactive examples available')).toBeInTheDocument();
    });

    it('renders with examples', () => {
      render(<InteractiveExample examples={mockExamples} />);
      expect(screen.getByText('UI Improvement Example')).toBeInTheDocument();
      expect(screen.getAllByText('See how applying this principle improves the user interface')).toHaveLength(2);
    });

    it('shows navigation when multiple examples exist', () => {
      render(<InteractiveExample examples={mockExamples} showNavigation={true} />);
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('hides navigation when showNavigation is false', () => {
      render(<InteractiveExample examples={mockExamples} showNavigation={false} />);
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('calls onExampleChange when example changes', () => {
      const onExampleChange = jest.fn();
      render(
        <InteractiveExample
          examples={mockExamples}
          onExampleChange={onExampleChange}
          showNavigation={true}
        />
      );

      fireEvent.click(screen.getByText('Next'));
      expect(onExampleChange).toHaveBeenCalledWith('demo-1');
    });
  });

  describe('ExampleNavigation', () => {
    const mockOnIndexChange = jest.fn();

    beforeEach(() => {
      mockOnIndexChange.mockClear();
    });

    it('renders navigation controls', () => {
      render(
        <ExampleNavigation
          examples={mockExamples}
          currentIndex={1}
          onIndexChange={mockOnIndexChange}
        />
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('disables previous button at first index', () => {
      render(
        <ExampleNavigation
          examples={mockExamples}
          currentIndex={0}
          onIndexChange={mockOnIndexChange}
        />
      );

      expect(screen.getByText('Previous')).toBeDisabled();
      expect(screen.getByText('Next')).not.toBeDisabled();
    });

    it('disables next button at last index', () => {
      render(
        <ExampleNavigation
          examples={mockExamples}
          currentIndex={2}
          onIndexChange={mockOnIndexChange}
        />
      );

      expect(screen.getByText('Previous')).not.toBeDisabled();
      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('calls onIndexChange when navigation buttons are clicked', () => {
      render(
        <ExampleNavigation
          examples={mockExamples}
          currentIndex={1}
          onIndexChange={mockOnIndexChange}
        />
      );

      fireEvent.click(screen.getByText('Previous'));
      expect(mockOnIndexChange).toHaveBeenCalledWith(0);

      fireEvent.click(screen.getByText('Next'));
      expect(mockOnIndexChange).toHaveBeenCalledWith(2);
    });

    it('renders dot indicators', () => {
      render(
        <ExampleNavigation
          examples={mockExamples}
          currentIndex={1}
          onIndexChange={mockOnIndexChange}
        />
      );

      const dots = screen.getAllByRole('button', { name: /Go to example \d+/ });
      expect(dots).toHaveLength(3);
    });
  });

  describe('BeforeAfterView', () => {
    it('renders before and after images', () => {
      render(<BeforeAfterView example={mockBeforeAfterExample} />);

      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByAltText('Before example')).toBeInTheDocument();
      expect(screen.getByAltText('After example')).toBeInTheDocument();
    });

    it('shows comparison overlay toggle', () => {
      render(<BeforeAfterView example={mockBeforeAfterExample} />);

      expect(screen.getByText('Show Overlay')).toBeInTheDocument();
    });

    it('toggles comparison overlay', () => {
      render(<BeforeAfterView example={mockBeforeAfterExample} />);

      const toggleButton = screen.getByText('Show Overlay');
      fireEvent.click(toggleButton);

      expect(screen.getByText('Hide Overlay')).toBeInTheDocument();
    });

    it('shows fullscreen toggle when handler provided', () => {
      const onToggleFullscreen = jest.fn();
      render(
        <BeforeAfterView
          example={mockBeforeAfterExample}
          onToggleFullscreen={onToggleFullscreen}
        />
      );

      const fullscreenButton = screen.getByRole('button', { name: '' });
      expect(fullscreenButton).toBeInTheDocument();
    });

    it('handles image loading errors', async () => {
      render(<BeforeAfterView example={mockBeforeAfterExample} />);

      const beforeImage = screen.getByAltText('Before example');
      fireEvent.error(beforeImage);

      await waitFor(() => {
        expect(screen.getByText('Before image not available')).toBeInTheDocument();
      });
    });
  });

  describe('InteractiveDemo', () => {
    const mockOnTogglePlay = jest.fn();
    const mockOnReset = jest.fn();

    beforeEach(() => {
      mockOnTogglePlay.mockClear();
      mockOnReset.mockClear();
    });

    it('renders demo controls', () => {
      render(
        <InteractiveDemo
          example={mockInteractiveDemoExample}
          isPlaying={false}
          onTogglePlay={mockOnTogglePlay}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Play')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('shows pause when playing', () => {
      render(
        <InteractiveDemo
          example={mockInteractiveDemoExample}
          isPlaying={true}
          onTogglePlay={mockOnTogglePlay}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('calls onTogglePlay when play button clicked', async () => {
      render(
        <InteractiveDemo
          example={mockInteractiveDemoExample}
          isPlaying={false}
          onTogglePlay={mockOnTogglePlay}
          onReset={mockOnReset}
        />
      );

      fireEvent.click(screen.getByText('Play'));

      // Wait for loading state to complete
      await waitFor(() => {
        expect(mockOnTogglePlay).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('calls onReset when reset button clicked', () => {
      render(
        <InteractiveDemo
          example={mockInteractiveDemoExample}
          isPlaying={false}
          onTogglePlay={mockOnTogglePlay}
          onReset={mockOnReset}
        />
      );

      fireEvent.click(screen.getByText('Reset'));
      expect(mockOnReset).toHaveBeenCalled();
    });

    it('renders dynamic component when available', () => {
      render(
        <InteractiveDemo
          example={mockInteractiveDemoExample}
          isPlaying={true}
          onTogglePlay={mockOnTogglePlay}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
      expect(screen.getByText('Component: anchoring-bias-demo')).toBeInTheDocument();
      expect(screen.getByText('Playing: true')).toBeInTheDocument();
    });
  });

  describe('CaseStudyView', () => {
    const mockOnToggleContent = jest.fn();

    beforeEach(() => {
      mockOnToggleContent.mockClear();
    });

    it('renders case study content', () => {
      render(<CaseStudyView example={mockCaseStudyExample} />);

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('shows content toggle when handler provided', () => {
      render(
        <CaseStudyView
          example={mockCaseStudyExample}
          onToggleContent={mockOnToggleContent}
        />
      );

      expect(screen.getByText('Show Full Study')).toBeInTheDocument();
    });

    it('toggles content display', () => {
      render(
        <CaseStudyView
          example={mockCaseStudyExample}
          showFullContent={false}
          onToggleContent={mockOnToggleContent}
        />
      );

      fireEvent.click(screen.getByText('Show Full Study'));
      expect(mockOnToggleContent).toHaveBeenCalled();
    });

    it('shows summary toggle when full content displayed', () => {
      render(
        <CaseStudyView
          example={mockCaseStudyExample}
          showFullContent={true}
          onToggleContent={mockOnToggleContent}
        />
      );

      expect(screen.getByText('Show Summary')).toBeInTheDocument();
    });

    it('handles missing case study content', () => {
      const exampleWithoutContent = {
        ...mockCaseStudyExample,
        caseStudyContent: undefined
      };

      render(<CaseStudyView example={exampleWithoutContent} />);

      expect(screen.getAllByText('Case Study')).toHaveLength(2);
      expect(screen.getByText('Learn from a real implementation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for navigation', () => {
      render(<InteractiveExample examples={mockExamples} showNavigation={true} />);

      const dots = screen.getAllByLabelText(/Go to example \d+/);
      expect(dots).toHaveLength(3);
    });

    it('has proper button roles', () => {
      render(<InteractiveExample examples={mockExamples} showNavigation={true} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('handles keyboard navigation', () => {
      render(<InteractiveExample examples={mockExamples} showNavigation={true} />);

      const nextButton = screen.getByText('Next');
      nextButton.focus();
      expect(nextButton).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles empty examples array gracefully', () => {
      render(<InteractiveExample examples={[]} />);
      expect(screen.getByText('No interactive examples available')).toBeInTheDocument();
    });

    it('handles invalid example types gracefully', () => {
      const invalidExample = {
        ...mockBeforeAfterExample,
        type: 'invalid-type' as ExampleType
      };

      // Should not crash and should render something
      render(<InteractiveExample examples={[invalidExample]} />);
      expect(screen.getByText('UI Improvement Example')).toBeInTheDocument();
    });

    it('handles missing images in before/after view', () => {
      const exampleWithoutImages = {
        ...mockBeforeAfterExample,
        beforeImage: undefined,
        afterImage: undefined
      };

      render(<BeforeAfterView example={exampleWithoutImages} />);
      expect(screen.getByText('Before image not available')).toBeInTheDocument();
      expect(screen.getByText('After image not available')).toBeInTheDocument();
    });
  });
});
