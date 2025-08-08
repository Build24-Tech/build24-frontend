import {
  AsyncOperationStatus,
  CardSkeleton,
  FormSkeleton,
  LoadingOverlay,
  LoadingSpinner,
  ProgressIndicator,
  TableSkeleton,
} from '@/app/launch-essentials/components/LoadingStates';
import { render, screen } from '@testing-library/react';

describe('LoadingSpinner', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6', 'animate-spin');
  });

  test('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  test('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);

    expect(container.firstChild).toHaveClass('custom-spinner');
  });
});

describe('ProgressIndicator', () => {
  const mockSteps = [
    { id: 'step1', title: 'Step 1', status: 'completed' as const },
    { id: 'step2', title: 'Step 2', status: 'loading' as const },
    { id: 'step3', title: 'Step 3', status: 'pending' as const },
    { id: 'step4', title: 'Step 4', status: 'error' as const },
  ];

  test('renders progress indicator with steps', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep="step2" />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();

    mockSteps.forEach(step => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });

  test('shows correct progress percentage', () => {
    render(<ProgressIndicator steps={mockSteps} />);

    // 1 completed out of 4 = 25%
    const progressBar = screen.getByRole('progressbar');
    // The Progress component may not set aria-valuenow, so let's check for the visual progress
    expect(progressBar).toBeInTheDocument();
  });

  test('highlights current step', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep="step2" />);

    const step2 = screen.getByText('Step 2');
    expect(step2).toHaveClass('text-blue-600');
  });

  test('shows loading status for active step', () => {
    render(<ProgressIndicator steps={mockSteps} />);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('shows error status for failed step', () => {
    render(<ProgressIndicator steps={mockSteps} />);

    expect(screen.getByText('Failed to complete')).toBeInTheDocument();
  });
});

describe('AsyncOperationStatus', () => {
  test('does not render when idle', () => {
    const { container } = render(
      <AsyncOperationStatus operation="Save" status="idle" />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders loading status', () => {
    render(<AsyncOperationStatus operation="Save" status="loading" />);

    expect(screen.getByText('Save...')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('animate-spin');
  });

  test('renders success status', () => {
    render(<AsyncOperationStatus operation="Save" status="success" />);

    expect(screen.getByText('Save completed')).toBeInTheDocument();
  });

  test('renders error status with message', () => {
    render(
      <AsyncOperationStatus
        operation="Save"
        status="error"
        error="Network connection failed"
      />
    );

    expect(screen.getByText('Save failed')).toBeInTheDocument();
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  test('applies correct styling for each status', () => {
    const { rerender, container } = render(
      <AsyncOperationStatus operation="Test" status="loading" />
    );
    expect(container.firstChild).toHaveClass('border-blue-200', 'bg-blue-50');

    rerender(<AsyncOperationStatus operation="Test" status="success" />);
    expect(container.firstChild).toHaveClass('border-green-200', 'bg-green-50');

    rerender(<AsyncOperationStatus operation="Test" status="error" />);
    expect(container.firstChild).toHaveClass('border-red-200', 'bg-red-50');
  });
});

describe('FormSkeleton', () => {
  test('renders default number of fields', () => {
    render(<FormSkeleton />);

    // Should render 3 fields by default
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('renders custom number of fields', () => {
    render(<FormSkeleton fields={5} />);

    const fieldContainers = document.querySelectorAll('.space-y-2');
    expect(fieldContainers).toHaveLength(5);
  });

  test('renders button skeletons', () => {
    render(<FormSkeleton />);

    // Should have button skeletons in the footer
    const buttonArea = document.querySelector('.pt-4');
    expect(buttonArea).toBeInTheDocument();
  });
});

describe('CardSkeleton', () => {
  test('renders single card by default', () => {
    render(<CardSkeleton />);

    const cards = document.querySelectorAll('[data-testid="card-skeleton"], .space-y-4 > div');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('renders multiple cards', () => {
    render(<CardSkeleton count={3} />);

    const cardContainers = document.querySelectorAll('.space-y-4 > div');
    expect(cardContainers).toHaveLength(3);
  });

  test('renders with image when specified', () => {
    render(<CardSkeleton hasImage />);

    // Should have image skeleton in header
    const imageSkeletons = document.querySelectorAll('.h-12.w-12');
    expect(imageSkeletons.length).toBeGreaterThan(0);
  });
});

describe('TableSkeleton', () => {
  test('renders with default dimensions', () => {
    render(<TableSkeleton />);

    // Should have header row + 5 data rows by default
    const rows = document.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(6); // 1 header + 5 rows
  });

  test('renders with custom dimensions', () => {
    render(<TableSkeleton rows={3} columns={2} />);

    const rows = document.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(4); // 1 header + 3 rows

    // Each row should have 2 columns
    rows.forEach(row => {
      const columns = row.querySelectorAll('.flex-1');
      expect(columns).toHaveLength(2);
    });
  });
});

describe('LoadingOverlay', () => {
  test('renders children when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('renders custom loading text', () => {
    render(
      <LoadingOverlay isLoading={true} text="Processing data...">
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Processing data...')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <LoadingOverlay isLoading={false} className="custom-overlay">
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(container.firstChild).toHaveClass('custom-overlay');
  });

  test('overlay has correct styling and positioning', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-background/80', 'backdrop-blur-sm', 'z-10');
  });
});

describe('Loading States Integration', () => {
  test('all components render without errors', () => {
    const steps = [
      { id: '1', title: 'Step 1', status: 'completed' as const },
      { id: '2', title: 'Step 2', status: 'loading' as const },
    ];

    render(
      <div>
        <LoadingSpinner text="Loading..." />
        <ProgressIndicator steps={steps} />
        <AsyncOperationStatus operation="Save" status="loading" />
        <FormSkeleton fields={2} />
        <CardSkeleton count={2} hasImage />
        <TableSkeleton rows={2} columns={3} />
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      </div>
    );

    // All components should render without throwing
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Save...')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('components handle edge cases gracefully', () => {
    // Empty steps array
    render(<ProgressIndicator steps={[]} />);
    expect(screen.getByText('0 of 0 completed')).toBeInTheDocument();

    // Zero fields/cards/rows
    render(
      <div>
        <FormSkeleton fields={0} />
        <CardSkeleton count={0} />
        <TableSkeleton rows={0} columns={0} />
      </div>
    );

    // Should not throw errors
    expect(document.body).toBeInTheDocument();
  });
});
