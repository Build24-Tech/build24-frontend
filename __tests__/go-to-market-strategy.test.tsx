import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoToMarketData, GoToMarketStrategy } from '../app/launch-essentials/components/GoToMarketStrategy';

// Mock the sub-components
jest.mock('../app/launch-essentials/components/go-to-market/PricingStrategy', () => ({
  PricingStrategy: ({ data, onDataChange }: any) => (
    <div data-testid="pricing-strategy">
      <span>Pricing Strategy Component</span>
      <button onClick={() => onDataChange && onDataChange({ strategy: 'value-based', model: 'subscription' })}>
        Update Pricing
      </button>
    </div>
  )
}));

jest.mock('../app/launch-essentials/components/go-to-market/MarketingChannels', () => ({
  MarketingChannels: ({ data, onDataChange }: any) => (
    <div data-testid="marketing-channels">
      <span>Marketing Channels Component</span>
      <button onClick={() => onDataChange && onDataChange({ channels: [{ channel: 'social-media', budget: 5000 }], totalBudget: 5000 })}>
        Update Marketing
      </button>
    </div>
  )
}));

jest.mock('../app/launch-essentials/components/go-to-market/LaunchTimeline', () => ({
  LaunchTimeline: ({ data, onDataChange }: any) => (
    <div data-testid="launch-timeline">
      <span>Launch Timeline Component</span>
      <button onClick={() => onDataChange && onDataChange({ phases: [{ name: 'Launch', duration: 30, milestones: [] }] })}>
        Update Timeline
      </button>
    </div>
  )
}));

jest.mock('../app/launch-essentials/components/go-to-market/MetricsDefinition', () => ({
  MetricsDefinition: ({ data, onDataChange }: any) => (
    <div data-testid="metrics-definition">
      <span>Metrics Definition Component</span>
      <button onClick={() => onDataChange && onDataChange({ acquisition: [{ metric: 'CAC', target: 50, measurement: 'USD' }] })}>
        Update Metrics
      </button>
    </div>
  )
}));

jest.mock('../app/launch-essentials/components/go-to-market/PostLaunchPlanning', () => ({
  PostLaunchPlanning: ({ data, onDataChange }: any) => (
    <div data-testid="post-launch-planning">
      <span>Post Launch Planning Component</span>
      <button onClick={() => onDataChange && onDataChange({ feedbackChannels: ['surveys'], iterationCycle: 'weekly' })}>
        Update Post-Launch
      </button>
    </div>
  )
}));

describe('GoToMarketStrategy', () => {
  const mockOnDataChange = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main component with all tabs', () => {
    render(<GoToMarketStrategy onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    expect(screen.getByText('Go-to-Market Strategy')).toBeInTheDocument();
    expect(screen.getByText('Pricing Strategy')).toBeInTheDocument();
    expect(screen.getByText('Marketing Channels')).toBeInTheDocument();
    expect(screen.getByText('Launch Timeline')).toBeInTheDocument();
    expect(screen.getByText('Success Metrics')).toBeInTheDocument();
    expect(screen.getByText('Post-Launch')).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    const data: GoToMarketData = {
      pricing: { strategy: 'value-based', model: 'subscription', tiers: [], competitiveAnalysis: [] },
      marketing: { channels: [], totalBudget: 0, primaryChannels: [] }
    };

    render(<GoToMarketStrategy data={data} onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    // Should show 40% progress (2 out of 5 sections completed)
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows completion badges correctly', () => {
    const data: GoToMarketData = {
      pricing: { strategy: 'value-based', model: 'subscription', tiers: [], competitiveAnalysis: [] }
    };

    render(<GoToMarketStrategy data={data} onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).toHaveLength(4); // 4 incomplete sections
  });

  it('handles tab navigation', async () => {
    const user = userEvent.setup();
    render(<GoToMarketStrategy onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    // Click on marketing tab
    await user.click(screen.getByRole('tab', { name: /marketing channels/i }));
    expect(screen.getByTestId('marketing-channels')).toBeInTheDocument();

    // Click on timeline tab
    await user.click(screen.getByRole('tab', { name: /launch timeline/i }));
    expect(screen.getByTestId('launch-timeline')).toBeInTheDocument();
  });

  it('handles data updates from sub-components', async () => {
    const user = userEvent.setup();
    render(<GoToMarketStrategy onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    // Update pricing data
    await user.click(screen.getByText('Update Pricing'));

    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pricing: { strategy: 'value-based', model: 'subscription' }
        })
      );
    });
  });

  it('disables save button when progress is incomplete', () => {
    render(<GoToMarketStrategy onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Strategy');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when all sections are complete', () => {
    const completeData: GoToMarketData = {
      pricing: { strategy: 'value-based', model: 'subscription', tiers: [], competitiveAnalysis: [] },
      marketing: { channels: [], totalBudget: 0, primaryChannels: [] },
      timeline: { phases: [], launchDate: '', criticalPath: [] },
      metrics: { acquisition: [], activation: [], retention: [], revenue: [] },
      postLaunch: { feedbackChannels: [], iterationCycle: '', successCriteria: [], contingencyPlans: [] }
    };

    render(<GoToMarketStrategy data={completeData} onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Strategy');
    expect(saveButton).not.toBeDisabled();
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    const completeData: GoToMarketData = {
      pricing: { strategy: 'value-based', model: 'subscription', tiers: [], competitiveAnalysis: [] },
      marketing: { channels: [], totalBudget: 0, primaryChannels: [] },
      timeline: { phases: [], launchDate: '', criticalPath: [] },
      metrics: { acquisition: [], activation: [], retention: [], revenue: [] },
      postLaunch: { feedbackChannels: [], iterationCycle: '', successCriteria: [], contingencyPlans: [] }
    };

    render(<GoToMarketStrategy data={completeData} onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    await user.click(screen.getByText('Save Strategy'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('shows alert when progress is incomplete', () => {
    render(<GoToMarketStrategy onDataChange={mockOnDataChange} onSave={mockOnSave} />);

    expect(screen.getByText(/complete all sections to finalize/i)).toBeInTheDocument();
  });

  it('updates local data when props change', () => {
    const initialData: GoToMarketData = {
      pricing: { strategy: 'cost-plus', model: 'one-time', tiers: [], competitiveAnalysis: [] }
    };

    const { rerender } = render(
      <GoToMarketStrategy data={initialData} onDataChange={mockOnDataChange} onSave={mockOnSave} />
    );

    const updatedData: GoToMarketData = {
      pricing: { strategy: 'value-based', model: 'subscription', tiers: [], competitiveAnalysis: [] }
    };

    rerender(
      <GoToMarketStrategy data={updatedData} onDataChange={mockOnDataChange} onSave={mockOnSave} />
    );

    // Component should reflect the updated data
    expect(screen.getByText('20%')).toBeInTheDocument(); // Still 1 out of 5 sections
  });
});
