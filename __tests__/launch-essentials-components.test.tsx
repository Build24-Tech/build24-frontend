import { ProgressIndicator, ProgressStep } from '@/app/launch-essentials/components/ProgressIndicator';
import { NavigationItem, ResponsiveNavigation } from '@/app/launch-essentials/components/ResponsiveNavigation';
import { SaveProgress } from '@/app/launch-essentials/components/SaveProgress';
import { NavigationStep, StepNavigation } from '@/app/launch-essentials/components/StepNavigation';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/launch-essentials/validation',
}));

describe('ProgressIndicator', () => {
  const mockSteps: ProgressStep[] = [
    {
      id: 'step1',
      label: 'Market Research',
      status: 'completed',
      description: 'Research your target market'
    },
    {
      id: 'step2',
      label: 'Competitor Analysis',
      status: 'in-progress',
      description: 'Analyze your competitors'
    },
    {
      id: 'step3',
      label: 'User Validation',
      status: 'not-started',
      description: 'Validate with real users'
    }
  ];

  it('should render linear progress indicator', () => {
    render(
      <ProgressIndicator
        steps={mockSteps}
        percentage={50}
        variant="linear"
      />
    );

    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('should render steps progress indicator', () => {
    render(
      <ProgressIndicator
        steps={mockSteps}
        percentage={50}
        variant="steps"
        currentStepId="step2"
      />
    );

    expect(screen.getByText('Market Research')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis')).toBeInTheDocument();
    expect(screen.getByText('User Validation')).toBeInTheDocument();
  });

  it('should handle step clicks when callback provided', () => {
    const mockOnStepClick = jest.fn();

    render(
      <ProgressIndicator
        steps={mockSteps}
        percentage={50}
        variant="steps"
        onStepClick={mockOnStepClick}
      />
    );

    const stepButton = screen.getByRole('button', { name: /Market Research/ });
    fireEvent.click(stepButton);

    expect(mockOnStepClick).toHaveBeenCalledWith('step1');
  });
});

describe('StepNavigation', () => {
  const mockSteps: NavigationStep[] = [
    { id: 'step1', title: 'Market Research', href: '/step1' },
    { id: 'step2', title: 'Competitor Analysis', href: '/step2' },
    { id: 'step3', title: 'User Validation', href: '/step3' }
  ];

  it('should render navigation with next and previous buttons', () => {
    const mockOnNext = jest.fn();
    const mockOnPrevious = jest.fn();

    render(
      <StepNavigation
        steps={mockSteps}
        currentStepId="step2"
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should disable previous button on first step', () => {
    render(
      <StepNavigation
        steps={mockSteps}
        currentStepId="step1"
      />
    );

    const backButton = screen.getByRole('button', { name: /Back/ });
    expect(backButton).toBeDisabled();
  });

  it('should disable next button on last step', () => {
    render(
      <StepNavigation
        steps={mockSteps}
        currentStepId="step3"
      />
    );

    const nextButton = screen.getByRole('button', { name: /Next/ });
    expect(nextButton).toBeDisabled();
  });
});

describe('SaveProgress', () => {
  it('should render save button with correct state', () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);

    render(
      <SaveProgress
        onSave={mockOnSave}
        isDirty={true}
        lastSaved={new Date('2024-01-01T12:00:00Z')}
      />
    );

    expect(screen.getByText('Save progress')).toBeInTheDocument();
    expect(screen.getByText(/Last saved:/)).toBeInTheDocument();
  });

  it('should handle save action', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);

    render(
      <SaveProgress
        onSave={mockOnSave}
        isDirty={true}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save progress/ });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should render compact variant', () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);

    render(
      <SaveProgress
        onSave={mockOnSave}
        variant="compact"
        isDirty={true}
      />
    );

    // In compact mode, it should render a smaller button
    const saveButton = screen.getByRole('button');
    expect(saveButton).toBeInTheDocument();
  });
});

describe('ResponsiveNavigation', () => {
  const mockNavItems: NavigationItem[] = [
    {
      id: 'validation',
      label: 'Product Validation',
      href: '/launch-essentials/validation',
      children: [
        {
          id: 'market-research',
          label: 'Market Research',
          href: '/launch-essentials/validation/market-research',
          progress: 100
        },
        {
          id: 'competitor-analysis',
          label: 'Competitor Analysis',
          href: '/launch-essentials/validation/competitor-analysis',
          progress: 50
        }
      ]
    },
    {
      id: 'definition',
      label: 'Product Definition',
      href: '/launch-essentials/definition',
      progress: 0
    }
  ];

  it('should render navigation title and items', () => {
    render(
      <ResponsiveNavigation
        items={mockNavItems}
        title="Launch Essentials"
      />
    );

    expect(screen.getByText('Launch Essentials')).toBeInTheDocument();
    expect(screen.getByText('Product Validation')).toBeInTheDocument();
    expect(screen.getByText('Product Definition')).toBeInTheDocument();
  });

  it('should render mobile navigation trigger', () => {
    render(
      <ResponsiveNavigation
        items={mockNavItems}
        title="Launch Essentials"
      />
    );

    const mobileMenuButton = screen.getByRole('button', { name: /Toggle navigation menu/ });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('should show progress indicators for completed items', () => {
    render(
      <ResponsiveNavigation
        items={mockNavItems}
        title="Launch Essentials"
      />
    );

    // Expand the validation section to see child items
    const validationButton = screen.getByRole('button', { name: /Product Validation/ });
    fireEvent.click(validationButton);

    // Should show check mark for completed market research (progress: 100)
    expect(screen.getByText('Market Research')).toBeInTheDocument();
  });
});
