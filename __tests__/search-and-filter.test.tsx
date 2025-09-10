import { SearchAndFilter } from '@/components/knowledge-hub/SearchAndFilter';
import {
  DEFAULT_FILTER_STATE,
  DifficultyLevel,
  FilterState,
  RelevanceType,
  TheoryCategory
} from '@/types/knowledge-hub';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the next/navigation hooks
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

describe('SearchAndFilter', () => {
  const mockOnFiltersChange = jest.fn();

  const defaultProps = {
    filters: DEFAULT_FILTER_STATE,
    onFiltersChange: mockOnFiltersChange,
    isLoading: false,
    resultCount: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Input', () => {
    it('renders search input with placeholder', () => {
      render(<SearchAndFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search theories, concepts, or tags...');
      expect(searchInput).toBeInTheDocument();
    });

    it('displays current search query', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'anchoring bias'
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const searchInput = screen.getByDisplayValue('anchoring bias');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onFiltersChange with debounced search query', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search theories, concepts, or tags...');

      await user.type(searchInput, 'social proof');

      // Wait for debounce
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'social proof'
        });
      }, { timeout: 500 });
    });

    it('shows clear button when search query exists', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'test query'
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('clears search query when clear button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'test query'
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      // Wait for debounced call
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...DEFAULT_FILTER_STATE,
          searchQuery: ''
        });
      }, { timeout: 500 });
    });

    it('disables search input when loading', () => {
      render(<SearchAndFilter {...defaultProps} isLoading={true} />);

      const searchInput = screen.getByPlaceholderText('Search theories, concepts, or tags...');
      expect(searchInput).toBeDisabled();
    });
  });

  describe('Filter Controls', () => {
    it('renders filter button with count when filters are active', () => {
      const filters: FilterState = {
        searchQuery: 'test',
        categories: [TheoryCategory.COGNITIVE_BIASES],
        difficulty: [DifficultyLevel.BEGINNER],
        relevance: [RelevanceType.MARKETING]
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // Filter count badge
    });

    it('opens filter popover when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Relevance')).toBeInTheDocument();
    });

    it('shows clear all button in popover when filters are active', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: [TheoryCategory.COGNITIVE_BIASES]
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      expect(screen.getAllByRole('button', { name: /clear all/i })).toHaveLength(2); // One in popover, one outside
    });
  });

  describe('Category Filters', () => {
    it('renders all category options', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
      expect(screen.getByText('Persuasion Principles')).toBeInTheDocument();
      expect(screen.getByText('Behavioral Economics')).toBeInTheDocument();
      expect(screen.getByText('UX Psychology')).toBeInTheDocument();
      expect(screen.getByText('Emotional Triggers')).toBeInTheDocument();
    });

    it('toggles category selection', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      const cognitiveButton = screen.getByRole('button', { name: 'Cognitive Biases' });
      await user.click(cognitiveButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...DEFAULT_FILTER_STATE,
        categories: [TheoryCategory.COGNITIVE_BIASES]
      });
    });

    it('shows selected categories as active badges', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: [TheoryCategory.COGNITIVE_BIASES, TheoryCategory.UX_PSYCHOLOGY]
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      expect(screen.getByText('Cognitive Biases')).toBeInTheDocument();
      expect(screen.getByText('UX Psychology')).toBeInTheDocument();
    });

    it('removes category when badge close button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: [TheoryCategory.COGNITIVE_BIASES]
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const badge = screen.getByText('Cognitive Biases').closest('.bg-blue-500\\/20');
      const closeButton = badge?.querySelector('button');

      if (closeButton) {
        await user.click(closeButton);
      }

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...DEFAULT_FILTER_STATE,
        categories: []
      });
    });
  });

  describe('Difficulty Filters', () => {
    it('renders all difficulty options', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('toggles difficulty selection', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      const beginnerButton = screen.getByRole('button', { name: 'Beginner' });
      await user.click(beginnerButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...DEFAULT_FILTER_STATE,
        difficulty: [DifficultyLevel.BEGINNER]
      });
    });
  });

  describe('Relevance Filters', () => {
    it('renders all relevance options', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('User Experience')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
    });

    it('toggles relevance selection', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);

      const marketingButton = screen.getByRole('button', { name: 'Marketing' });
      await user.click(marketingButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...DEFAULT_FILTER_STATE,
        relevance: [RelevanceType.MARKETING]
      });
    });
  });

  describe('Clear All Functionality', () => {
    it('shows clear all button when filters are active', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'test'
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('clears all filters when clear all button is clicked', async () => {
      const user = userEvent.setup();
      const filters: FilterState = {
        searchQuery: 'test',
        categories: [TheoryCategory.COGNITIVE_BIASES],
        difficulty: [DifficultyLevel.BEGINNER],
        relevance: [RelevanceType.MARKETING]
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} />);

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(DEFAULT_FILTER_STATE);
    });
  });

  describe('Results Count', () => {
    it('displays result count', () => {
      render(<SearchAndFilter {...defaultProps} resultCount={5} />);

      expect(screen.getByText('5 theories found')).toBeInTheDocument();
    });

    it('displays singular form for one result', () => {
      render(<SearchAndFilter {...defaultProps} resultCount={1} />);

      expect(screen.getByText('1 theory found')).toBeInTheDocument();
    });

    it('shows searching state when loading', () => {
      render(<SearchAndFilter {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('shows filter context in result count when filters are active', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'test'
      };

      render(<SearchAndFilter {...defaultProps} filters={filters} resultCount={3} />);

      expect(screen.getByText('3 theories found matching your filters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<SearchAndFilter {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'Search theories, concepts, or tags...');

      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.tab();
      expect(searchInput).toHaveFocus();

      await user.tab();
      const filterButton = screen.getByRole('button', { name: /filters/i });
      expect(filterButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('debounces search input changes', async () => {
      const user = userEvent.setup();
      render(<SearchAndFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search theories, concepts, or tags...');

      // Type multiple characters quickly
      await user.type(searchInput, 'abc');

      // Should not call onFiltersChange immediately
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...DEFAULT_FILTER_STATE,
          searchQuery: 'abc'
        });
      }, { timeout: 500 });

      // Should only be called once after debounce
      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    });
  });
});
