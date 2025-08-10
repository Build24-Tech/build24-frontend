import { CategoryNavigation } from '@/components/knowledge-hub/CategoryNavigation';
import { TheoryCategory } from '@/types/knowledge-hub';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <div data-testid="badge" className={className} {...props}>
      {children}
    </div>
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  )
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Brain: ({ className }: any) => <div data-testid="brain-icon" className={className} />,
  Users: ({ className }: any) => <div data-testid="users-icon" className={className} />,
  TrendingUp: ({ className }: any) => <div data-testid="trending-up-icon" className={className} />,
  Zap: ({ className }: any) => <div data-testid="zap-icon" className={className} />,
  BookOpen: ({ className }: any) => <div data-testid="book-open-icon" className={className} />,
  Grid3X3: ({ className }: any) => <div data-testid="grid-icon" className={className} />
}));

describe('CategoryNavigation', () => {
  const mockTheoryCounts = {
    [TheoryCategory.COGNITIVE_BIASES]: 8,
    [TheoryCategory.PERSUASION_PRINCIPLES]: 6,
    [TheoryCategory.BEHAVIORAL_ECONOMICS]: 5,
    [TheoryCategory.UX_PSYCHOLOGY]: 7,
    [TheoryCategory.EMOTIONAL_TRIGGERS]: 4
  };

  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it('renders all theory categories', () => {
    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
    expect(screen.getByText('Persuasion Principles')).toBeInTheDocument();
    expect(screen.getByText('Behavioral Economics')).toBeInTheDocument();
    expect(screen.getByText('UX Psychology')).toBeInTheDocument();
    expect(screen.getByText('Emotional Triggers')).toBeInTheDocument();
  });

  it('displays correct theory counts for each category', () => {
    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    expect(screen.getByText('8 theories')).toBeInTheDocument();
    expect(screen.getByText('6 theories')).toBeInTheDocument();
    expect(screen.getByText('5 theories')).toBeInTheDocument();
    expect(screen.getByText('7 theories')).toBeInTheDocument();
    expect(screen.getByText('4 theories')).toBeInTheDocument();
  });

  it('displays total count correctly', () => {
    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    expect(screen.getByText('Total: 30 theories')).toBeInTheDocument();
  });

  it('calls onCategoryChange when a category is clicked', () => {
    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    const cognitiveButton = screen.getByText('Cognitive Biases').closest('button');
    fireEvent.click(cognitiveButton!);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(TheoryCategory.COGNITIVE_BIASES);
  });

  it('shows selected category state correctly', () => {
    render(
      <CategoryNavigation
        selectedCategory={TheoryCategory.COGNITIVE_BIASES}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    expect(screen.getByText('Cognitive Biases selected • 8 theories available')).toBeInTheDocument();
  });

  it('deselects category when clicking selected category', () => {
    render(
      <CategoryNavigation
        selectedCategory={TheoryCategory.COGNITIVE_BIASES}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    const cognitiveButton = screen.getByText('Cognitive Biases').closest('button');
    fireEvent.click(cognitiveButton!);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onCategoryChange with undefined when Show All is clicked', () => {
    render(
      <CategoryNavigation
        selectedCategory={TheoryCategory.COGNITIVE_BIASES}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    const showAllButton = screen.getByText('Show All');
    fireEvent.click(showAllButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
  });

  it('renders appropriate icons for each category', () => {
    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={mockTheoryCounts}
      />
    );

    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
  });

  it('handles zero theory counts gracefully', () => {
    const zeroCountsData = {
      [TheoryCategory.COGNITIVE_BIASES]: 0,
      [TheoryCategory.PERSUASION_PRINCIPLES]: 0,
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: 0,
      [TheoryCategory.UX_PSYCHOLOGY]: 0,
      [TheoryCategory.EMOTIONAL_TRIGGERS]: 0
    };

    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={zeroCountsData}
      />
    );

    expect(screen.getByText('0 theories')).toBeInTheDocument();
    expect(screen.getByText('Total: 0 theories')).toBeInTheDocument();
  });

  it('handles singular theory count correctly', () => {
    const singleCountData = {
      [TheoryCategory.COGNITIVE_BIASES]: 1,
      [TheoryCategory.PERSUASION_PRINCIPLES]: 0,
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: 0,
      [TheoryCategory.UX_PSYCHOLOGY]: 0,
      [TheoryCategory.EMOTIONAL_TRIGGERS]: 0
    };

    render(
      <CategoryNavigation
        selectedCategory={undefined}
        onCategoryChange={mockOnCategoryChange}
        theoryCounts={singleCountData}
      />
    );

    expect(screen.getByText('1 theory')).toBeInTheDocument();
  });
});
