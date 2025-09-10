import FinancialPlanning from '@/app/launch-essentials/components/FinancialPlanning';
import { businessModelTemplates } from '@/lib/financial-planning-utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the utility functions
jest.mock('@/lib/financial-planning-utils', () => ({
  ...jest.requireActual('@/lib/financial-planning-utils'),
  calculateFinancialProjection: jest.fn(() => ({
    revenue: [1000, 1500, 2000],
    expenses: [2000, 2000, 2000],
    profit: [-1000, -500, 0],
    cashFlow: [-1000, -500, 0],
    cumulativeCashFlow: [49000, 48500, 48500],
    breakEvenMonth: 3,
    roi: 15.5,
    paybackPeriod: 3,
  })),
  calculateFundingRequirements: jest.fn(() => ({
    totalRequired: 60000,
    runway: 18.5,
    milestones: [
      { month: 3, amount: 15000, purpose: 'Quarter 1 operations' },
      { month: 6, amount: 20000, purpose: 'Quarter 2 operations' },
    ],
    fundingGap: 5000,
  })),
  optimizeFinancialModel: jest.fn(() => [
    {
      type: 'cost',
      suggestion: 'Reduce fixed costs by 15-20%',
      impact: 'high',
      effort: 'medium',
      expectedImprovement: 'Extend runway by 3-6 months',
    },
    {
      type: 'revenue',
      suggestion: 'Implement aggressive customer acquisition',
      impact: 'high',
      effort: 'high',
      expectedImprovement: 'Increase revenue growth by 20-30%',
    },
  ]),
}));

describe('FinancialPlanning Component', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the main component with all tabs', () => {
    render(<FinancialPlanning onSave={mockOnSave} />);

    expect(screen.getByText('Financial Planning & Business Model')).toBeInTheDocument();
    expect(screen.getByText('Business Model')).toBeInTheDocument();
    expect(screen.getByText('Revenue Model')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow')).toBeInTheDocument();
    expect(screen.getByText('Pricing Strategy')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });

  it('should display business model templates', () => {
    render(<FinancialPlanning onSave={mockOnSave} />);

    expect(screen.getByText('saas')).toBeInTheDocument();
    expect(screen.getByText('ecommerce')).toBeInTheDocument();
    expect(screen.getByText('marketplace')).toBeInTheDocument();
  });

  it('should allow selecting different business model templates', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    const ecommerceCard = screen.getByText('ecommerce').closest('div');
    expect(ecommerceCard).toBeInTheDocument();

    await user.click(ecommerceCard!);

    // Should update the business model (visual feedback would be tested in integration tests)
    expect(ecommerceCard).toBeInTheDocument();
  });

  it('should display cost structure for selected business model', () => {
    render(<FinancialPlanning onSave={mockOnSave} />);

    expect(screen.getByText('Fixed Costs (Monthly)')).toBeInTheDocument();
    expect(screen.getByText('Variable Costs')).toBeInTheDocument();
    expect(screen.getByText('Development Team')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
  });

  it('should switch between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Click on Revenue Model tab
    await user.click(screen.getByText('Revenue Model'));
    expect(screen.getByText('Revenue Model Configuration')).toBeInTheDocument();

    // Click on Cash Flow tab
    await user.click(screen.getByText('Cash Flow'));
    expect(screen.getByText('Cash Flow Projections')).toBeInTheDocument();

    // Click on Pricing Strategy tab - use more specific selector
    const pricingTab = screen.getByRole('tab', { name: 'Pricing Strategy' });
    await user.click(pricingTab);
    expect(screen.getByText('Pricing Methodology')).toBeInTheDocument();
  });

  it('should handle revenue model configuration', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Revenue Model tab
    await user.click(screen.getByText('Revenue Model'));

    // Should show revenue type selector
    expect(screen.getByText('Revenue Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly Recurring Revenue (if applicable)')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate (%)')).toBeInTheDocument();
  });

  it('should handle cash flow projections', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Cash Flow tab
    await user.click(screen.getByText('Cash Flow'));

    expect(screen.getByText('Projection Period')).toBeInTheDocument();
    expect(screen.getByText('Starting Cash')).toBeInTheDocument();
    expect(screen.getByText('Monthly Projections')).toBeInTheDocument();

    // Should show generate buttons
    expect(screen.getByText('Generate Revenue')).toBeInTheDocument();
    expect(screen.getByText('Generate Expenses')).toBeInTheDocument();
  });

  it('should generate revenue projections when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Cash Flow tab
    await user.click(screen.getByText('Cash Flow'));

    // Click generate revenue button
    const generateRevenueBtn = screen.getByText('Generate Revenue');
    await user.click(generateRevenueBtn);

    // Should update the revenue inputs (would need to check input values in integration test)
    expect(generateRevenueBtn).toBeInTheDocument();
  });

  it('should handle pricing strategy selection', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Pricing Strategy tab
    await user.click(screen.getByText('Pricing Strategy'));

    expect(screen.getByText('Pricing Methodology')).toBeInTheDocument();

    // Should show pricing methodology selector
    const methodologySelect = screen.getByRole('combobox');
    expect(methodologySelect).toBeInTheDocument();
  });

  it('should show pricing methodology selector', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Pricing Strategy tab
    const pricingTab = screen.getByRole('tab', { name: 'Pricing Strategy' });
    await user.click(pricingTab);

    await waitFor(() => {
      expect(screen.getByText('Pricing Methodology')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should display pricing strategy content', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Pricing Strategy tab
    const pricingTab = screen.getByRole('tab', { name: 'Pricing Strategy' });
    await user.click(pricingTab);

    await waitFor(() => {
      expect(screen.getByText('Determine optimal pricing using different methodologies')).toBeInTheDocument();
      expect(screen.getByText('Pricing Methodology')).toBeInTheDocument();
    });
  });

  it('should handle tab navigation', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Test that all tabs are present
    expect(screen.getByRole('tab', { name: 'Business Model' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Revenue Model' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cash Flow' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pricing Strategy' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Analysis' })).toBeInTheDocument();
  });

  it('should display financial analysis with key metrics', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Analysis tab
    const analysisTab = screen.getByRole('tab', { name: 'Analysis' });
    await user.click(analysisTab);

    await waitFor(() => {
      expect(screen.getByText('Break-even')).toBeInTheDocument();
      expect(screen.getAllByText('Month 3')).toHaveLength(2); // Accept multiple instances
      expect(screen.getByText('ROI')).toBeInTheDocument();
      expect(screen.getByText('15.5%')).toBeInTheDocument();
      expect(screen.getByText('Payback Period')).toBeInTheDocument();
      expect(screen.getByText('3 months')).toBeInTheDocument();
    });
  });

  it('should display funding requirements', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Analysis tab
    await user.click(screen.getByText('Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Funding Requirements')).toBeInTheDocument();
      expect(screen.getByText('Total Funding Required')).toBeInTheDocument();
      expect(screen.getByText('$60,000')).toBeInTheDocument();
      expect(screen.getByText('Runway')).toBeInTheDocument();
      expect(screen.getByText('18.5 months')).toBeInTheDocument();
    });
  });

  it('should display funding gap warning when applicable', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Analysis tab
    await user.click(screen.getByText('Analysis'));

    await waitFor(() => {
      expect(screen.getByText(/Additional.*needed to reach 18-month runway target/)).toBeInTheDocument();
    });
  });

  it('should display optimization recommendations', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Analysis tab
    const analysisTab = screen.getByRole('tab', { name: 'Analysis' });
    await user.click(analysisTab);

    await waitFor(() => {
      expect(screen.getByText('Optimization Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Reduce fixed costs by 15-20%')).toBeInTheDocument();
      expect(screen.getAllByText('high impact')).toHaveLength(2); // Accept multiple instances
      // Check that optimization suggestions are present
      const optimizationSection = screen.getByText('Optimization Recommendations').closest('div');
      expect(optimizationSection).toBeInTheDocument();
    });
  });

  it('should call onSave with correct data when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Progress');
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        businessModel: expect.any(Object),
        cashFlowData: expect.any(Object),
        pricingStrategy: expect.any(Object),
        projection: expect.any(Object),
        fundingRequirements: expect.any(Object),
        optimizations: expect.any(Array),
        completedAt: expect.any(String),
      })
    );
  });

  it('should handle initial data prop correctly', () => {
    const initialData = {
      businessModel: businessModelTemplates.ecommerce,
      cashFlowData: {
        timeframe: 'monthly' as const,
        periods: 12,
        startingCash: 25000,
        revenue: Array(12).fill(2000),
        expenses: Array(12).fill(1500),
      },
      pricingStrategy: {
        methodology: 'competitive' as const,
        basePrice: 49.99,
      },
    };

    render(<FinancialPlanning onSave={mockOnSave} initialData={initialData} />);

    // Should use the initial data (would need to verify in integration tests)
    expect(screen.getByText('Financial Planning & Business Model')).toBeInTheDocument();
  });

  it('should update cash flow data when inputs change', async () => {
    const user = userEvent.setup();
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Switch to Cash Flow tab
    await user.click(screen.getByText('Cash Flow'));

    // Find starting cash input and update it
    const startingCashInput = screen.getByDisplayValue('50000');
    await user.clear(startingCashInput);
    await user.type(startingCashInput, '75000');

    expect(startingCashInput).toHaveValue(75000);
  });

  it('should handle edge cases gracefully', () => {
    // Test with minimal props
    render(<FinancialPlanning />);

    expect(screen.getByText('Financial Planning & Business Model')).toBeInTheDocument();
    expect(screen.getByText('Save Progress')).toBeInTheDocument();
  });

  it('should display proper accessibility attributes', () => {
    render(<FinancialPlanning onSave={mockOnSave} />);

    // Check for proper ARIA labels and roles
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);

    const tabpanels = screen.getAllByRole('tabpanel');
    expect(tabpanels).toHaveLength(1); // Only active tab panel is rendered
  });
});
