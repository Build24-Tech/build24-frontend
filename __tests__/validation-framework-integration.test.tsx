import ValidationFramework from '@/app/launch-essentials/components/ValidationFramework';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the validation components
jest.mock('@/app/launch-essentials/components/validation/MarketResearch', () => {
  return function MockMarketResearch({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="market-research">
        <h3>Market Research</h3>
        <button onClick={() => onSave({ marketSize: 'large', trends: ['growth'] })}>
          Save Market Research
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/validation/CompetitorAnalysis', () => {
  return function MockCompetitorAnalysis({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="competitor-analysis">
        <h3>Competitor Analysis</h3>
        <button onClick={() => onSave({ competitors: ['competitor1'], strengths: ['feature1'] })}>
          Save Competitor Analysis
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/validation/TargetAudienceValidation', () => {
  return function MockTargetAudienceValidation({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="target-audience">
        <h3>Target Audience Validation</h3>
        <button onClick={() => onSave({ personas: ['persona1'], segments: ['segment1'] })}>
          Save Target Audience
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/validation/ValidationReport', () => {
  return function MockValidationReport({ data }: { data: any }) {
    return (
      <div data-testid="validation-report">
        <h3>Validation Report</h3>
        <div>Market Size: {data?.marketResearch?.marketSize || 'Not set'}</div>
        <div>Competitors: {data?.competitorAnalysis?.competitors?.length || 0}</div>
        <div>Personas: {data?.targetAudience?.personas?.length || 0}</div>
      </div>
    );
  };
});

describe('ValidationFramework Integration', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all validation steps', () => {
    render(<ValidationFramework onSave={mockOnSave} />);

    expect(screen.getByText('Product Validation Framework')).toBeInTheDocument();
    expect(screen.getByTestId('market-research')).toBeInTheDocument();
    expect(screen.getByTestId('competitor-analysis')).toBeInTheDocument();
    expect(screen.getByTestId('target-audience')).toBeInTheDocument();
    expect(screen.getByTestId('validation-report')).toBeInTheDocument();
  });

  it('should handle market research data flow', async () => {
    const user = userEvent.setup();
    render(<ValidationFramework onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Market Research');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Market Size: large')).toBeInTheDocument();
    });
  });

  it('should handle competitor analysis data flow', async () => {
    const user = userEvent.setup();
    render(<ValidationFramework onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Competitor Analysis');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Competitors: 1')).toBeInTheDocument();
    });
  });

  it('should handle target audience data flow', async () => {
    const user = userEvent.setup();
    render(<ValidationFramework onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Target Audience');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Personas: 1')).toBeInTheDocument();
    });
  });

  it('should aggregate all validation data when saving', async () => {
    const user = userEvent.setup();
    render(<ValidationFramework onSave={mockOnSave} />);

    // Save data from each component
    await user.click(screen.getByText('Save Market Research'));
    await user.click(screen.getByText('Save Competitor Analysis'));
    await user.click(screen.getByText('Save Target Audience'));

    // Save the overall framework
    const mainSaveButton = screen.getByText('Save Validation Framework');
    await user.click(mainSaveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        marketResearch: expect.objectContaining({
          marketSize: 'large',
          trends: ['growth']
        }),
        competitorAnalysis: expect.objectContaining({
          competitors: ['competitor1'],
          strengths: ['feature1']
        }),
        targetAudience: expect.objectContaining({
          personas: ['persona1'],
          segments: ['segment1']
        }),
        completedAt: expect.any(String)
      })
    );
  });

  it('should handle initial data correctly', () => {
    const initialData = {
      marketResearch: { marketSize: 'medium', trends: ['stable'] },
      competitorAnalysis: { competitors: ['comp1', 'comp2'], strengths: ['price'] },
      targetAudience: { personas: ['persona1'], segments: ['segment1'] }
    };

    render(<ValidationFramework onSave={mockOnSave} initialData={initialData} />);

    expect(screen.getByText('Market Size: medium')).toBeInTheDocument();
    expect(screen.getByText('Competitors: 2')).toBeInTheDocument();
    expect(screen.getByText('Personas: 1')).toBeInTheDocument();
  });

  it('should show validation progress', async () => {
    const user = userEvent.setup();
    render(<ValidationFramework onSave={mockOnSave} />);

    // Initially no progress
    expect(screen.getByText('Market Size: Not set')).toBeInTheDocument();
    expect(screen.getByText('Competitors: 0')).toBeInTheDocument();
    expect(screen.getByText('Personas: 0')).toBeInTheDocument();

    // After saving market research
    await user.click(screen.getByText('Save Market Research'));
    await waitFor(() => {
      expect(screen.getByText('Market Size: large')).toBeInTheDocument();
    });
  });

  it('should handle validation errors gracefully', async () => {
    const user = userEvent.setup();
    const mockOnSaveWithError = jest.fn().mockRejectedValue(new Error('Save failed'));

    render(<ValidationFramework onSave={mockOnSaveWithError} />);

    const saveButton = screen.getByText('Save Validation Framework');
    await user.click(saveButton);

    // Should handle the error without crashing
    expect(mockOnSaveWithError).toHaveBeenCalled();
  });
});
