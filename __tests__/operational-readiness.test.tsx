import { OperationalReadiness, OperationalReadinessData } from '@/app/launch-essentials/components/OperationalReadiness';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the child components
jest.mock('@/app/launch-essentials/components/operational/TeamStructurePlanning', () => ({
  TeamStructurePlanning: ({ data, onChange }: any) => (
    <div data-testid="team-structure-planning">
      Team Structure Planning - {data.completionPercentage}%
      <button onClick={() => onChange({ ...data, completionPercentage: 75 })}>
        Update Team
      </button>
    </div>
  )
}));

jest.mock('@/app/launch-essentials/components/operational/ProcessSetupTemplates', () => ({
  ProcessSetupTemplates: ({ data, onChange }: any) => (
    <div data-testid="process-setup-templates">
      Process Setup Templates - {data.completionPercentage}%
      <button onClick={() => onChange({ ...data, completionPercentage: 80 })}>
        Update Processes
      </button>
    </div>
  )
}));

jest.mock('@/app/launch-essentials/components/operational/CustomerSupportPlanning', () => ({
  CustomerSupportPlanning: ({ data, onChange }: any) => (
    <div data-testid="customer-support-planning">
      Customer Support Planning - {data.completionPercentage}%
      <button onClick={() => onChange({ ...data, completionPercentage: 60 })}>
        Update Support
      </button>
    </div>
  )
}));

jest.mock('@/app/launch-essentials/components/operational/LegalRequirementsChecklist', () => ({
  LegalRequirementsChecklist: ({ data, onChange }: any) => (
    <div data-testid="legal-requirements-checklist">
      Legal Requirements Checklist - {data.completionPercentage}%
      <button onClick={() => onChange({ ...data, completionPercentage: 90 })}>
        Update Legal
      </button>
    </div>
  )
}));

jest.mock('@/app/launch-essentials/components/operational/OperationalGapAnalysis', () => ({
  OperationalGapAnalysis: ({ data, onChange }: any) => (
    <div data-testid="operational-gap-analysis">
      Operational Gap Analysis - {data.overallReadiness}%
      <button onClick={() => onChange({ ...data, overallReadiness: 85 })}>
        Update Gaps
      </button>
    </div>
  )
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  )
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}>Progress: {value}%</div>
  )
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-description">{children}</div>
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      <div data-testid="tabs-trigger-team" onClick={() => onValueChange('team')}>Team</div>
      <div data-testid="tabs-trigger-processes" onClick={() => onValueChange('processes')}>Processes</div>
      <div data-testid="tabs-trigger-support" onClick={() => onValueChange('support')}>Support</div>
      <div data-testid="tabs-trigger-legal" onClick={() => onValueChange('legal')}>Legal</div>
      <div data-testid="tabs-trigger-gaps" onClick={() => onValueChange('gaps')}>Gaps</div>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <div data-testid="tabs-trigger" data-value={value}>{children}</div>
  )
}));

describe('OperationalReadiness', () => {
  const mockData: OperationalReadinessData = {
    teamStructure: {
      roles: [
        {
          id: '1',
          title: 'CTO',
          department: 'Engineering',
          responsibilities: ['Technical leadership'],
          requiredSkills: ['Leadership'],
          experienceLevel: 'senior',
          priority: 'critical',
          status: 'filled'
        }
      ],
      orgChart: { departments: [], reportingLines: [] },
      hiringPlan: { phases: [], budget: { total: 0, allocated: 0, currency: 'USD' }, timeline: '' },
      completionPercentage: 50
    },
    processes: {
      development: [
        {
          id: '1',
          name: 'Development Process',
          category: 'development',
          steps: [],
          tools: ['Git'],
          responsibilities: ['Developer'],
          timeline: '1 week',
          status: 'completed'
        }
      ],
      testing: [],
      deployment: [],
      completionPercentage: 60
    },
    customerSupport: {
      channels: [
        {
          id: '1',
          type: 'email',
          name: 'Email Support',
          availability: '24/7',
          responseTime: '24 hours',
          staffing: 2,
          tools: ['Zendesk'],
          status: 'active'
        }
      ],
      knowledgeBase: { categories: [], articles: [], searchEnabled: false, selfServiceEnabled: false },
      supportTeam: { tiers: [], escalationMatrix: [], workingHours: { timezone: '', schedule: [], holidays: [], coverage: '' }, slaTargets: [] },
      completionPercentage: 70
    },
    legal: {
      requirements: [
        {
          id: '1',
          category: 'privacy',
          requirement: 'Privacy Policy',
          description: 'Create privacy policy',
          priority: 'critical',
          status: 'completed'
        }
      ],
      compliance: [],
      policies: [],
      completionPercentage: 80
    },
    gapAnalysis: {
      identifiedGaps: [
        {
          id: '1',
          category: 'team',
          title: 'Critical Role Missing',
          description: 'Need to hire lead developer',
          impact: 'high',
          effort: 'high',
          priority: 1,
          status: 'identified'
        }
      ],
      prioritizedActions: [],
      overallReadiness: 65
    }
  };

  const mockOnDataChange = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render operational readiness header', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Operational Readiness')).toBeInTheDocument();
    expect(screen.getByText('Ensure your organization is prepared to support and scale your product')).toBeInTheDocument();
  });

  it('should display overall progress correctly', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Should calculate overall progress from section percentages
    const expectedProgress = Math.round((50 + 60 + 70 + 80) / 4); // 65%
    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', expectedProgress.toString());
  });

  it('should show readiness level based on progress', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // With 65% progress, should show "Fair" readiness level
    expect(screen.getByText(/Overall Readiness:/)).toBeInTheDocument();
  });

  it('should display section completion percentages', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument(); // Team Structure
    expect(screen.getByText('60%')).toBeInTheDocument(); // Processes
    expect(screen.getByText('70%')).toBeInTheDocument(); // Support
    expect(screen.getByText('80%')).toBeInTheDocument(); // Legal
  });

  it('should show critical gaps alert when high impact gaps exist', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText(/1 critical operational gaps/)).toBeInTheDocument();
  });

  it('should not show critical gaps alert when no high impact gaps exist', () => {
    const dataWithoutCriticalGaps = {
      ...mockData,
      gapAnalysis: {
        ...mockData.gapAnalysis,
        identifiedGaps: [
          {
            ...mockData.gapAnalysis.identifiedGaps[0],
            impact: 'low' as const
          }
        ]
      }
    };

    render(
      <OperationalReadiness
        data={dataWithoutCriticalGaps}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('should handle tab switching correctly', async () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Default tab should be team
    expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'team');
    expect(screen.getByTestId('team-structure-planning')).toBeInTheDocument();

    // Switch to processes tab
    fireEvent.click(screen.getByTestId('tabs-trigger-processes'));
    await waitFor(() => {
      expect(screen.getByTestId('process-setup-templates')).toBeInTheDocument();
    });

    // Switch to support tab
    fireEvent.click(screen.getByTestId('tabs-trigger-support'));
    await waitFor(() => {
      expect(screen.getByTestId('customer-support-planning')).toBeInTheDocument();
    });

    // Switch to legal tab
    fireEvent.click(screen.getByTestId('tabs-trigger-legal'));
    await waitFor(() => {
      expect(screen.getByTestId('legal-requirements-checklist')).toBeInTheDocument();
    });

    // Switch to gaps tab
    fireEvent.click(screen.getByTestId('tabs-trigger-gaps'));
    await waitFor(() => {
      expect(screen.getByTestId('operational-gap-analysis')).toBeInTheDocument();
    });
  });

  it('should handle data changes from child components', async () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Update team data
    fireEvent.click(screen.getByText('Update Team'));
    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalledWith({
        ...mockData,
        teamStructure: {
          ...mockData.teamStructure,
          completionPercentage: 75
        }
      });
    });
  });

  it('should handle save button click', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('Save Progress'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should recalculate overall progress when data changes', () => {
    const { rerender } = render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Initial progress should be 65%
    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '65');

    // Update data with higher completion percentages
    const updatedData = {
      ...mockData,
      teamStructure: { ...mockData.teamStructure, completionPercentage: 90 },
      processes: { ...mockData.processes, completionPercentage: 90 },
      customerSupport: { ...mockData.customerSupport, completionPercentage: 90 },
      legal: { ...mockData.legal, completionPercentage: 90 }
    };

    rerender(
      <OperationalReadiness
        data={updatedData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Progress should now be 90%
    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '90');
  });

  it('should display correct readiness level colors and badges', () => {
    // Test with high readiness (90%)
    const highReadinessData = {
      ...mockData,
      teamStructure: { ...mockData.teamStructure, completionPercentage: 90 },
      processes: { ...mockData.processes, completionPercentage: 90 },
      customerSupport: { ...mockData.customerSupport, completionPercentage: 90 },
      legal: { ...mockData.legal, completionPercentage: 90 }
    };

    const { rerender } = render(
      <OperationalReadiness
        data={highReadinessData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Should show default badge variant for high readiness
    const badge = screen.getByText('90% Complete');
    expect(badge).toHaveAttribute('data-variant', 'default');

    // Test with low readiness (40%)
    const lowReadinessData = {
      ...mockData,
      teamStructure: { ...mockData.teamStructure, completionPercentage: 40 },
      processes: { ...mockData.processes, completionPercentage: 40 },
      customerSupport: { ...mockData.customerSupport, completionPercentage: 40 },
      legal: { ...mockData.legal, completionPercentage: 40 }
    };

    rerender(
      <OperationalReadiness
        data={lowReadinessData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Should show secondary badge variant for low readiness
    const lowBadge = screen.getByText('40% Complete');
    expect(lowBadge).toHaveAttribute('data-variant', 'secondary');
  });

  it('should handle empty data gracefully', () => {
    const emptyData: OperationalReadinessData = {
      teamStructure: {
        roles: [],
        orgChart: { departments: [], reportingLines: [] },
        hiringPlan: { phases: [], budget: { total: 0, allocated: 0, currency: 'USD' }, timeline: '' },
        completionPercentage: 0
      },
      processes: {
        development: [],
        testing: [],
        deployment: [],
        completionPercentage: 0
      },
      customerSupport: {
        channels: [],
        knowledgeBase: { categories: [], articles: [], searchEnabled: false, selfServiceEnabled: false },
        supportTeam: { tiers: [], escalationMatrix: [], workingHours: { timezone: '', schedule: [], holidays: [], coverage: '' }, slaTargets: [] },
        completionPercentage: 0
      },
      legal: {
        requirements: [],
        compliance: [],
        policies: [],
        completionPercentage: 0
      },
      gapAnalysis: {
        identifiedGaps: [],
        prioritizedActions: [],
        overallReadiness: 0
      }
    };

    render(
      <OperationalReadiness
        data={emptyData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '0');
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('should pass correct props to child components', () => {
    render(
      <OperationalReadiness
        data={mockData}
        onDataChange={mockOnDataChange}
        onSave={mockOnSave}
      />
    );

    // Check that child components receive the correct data
    expect(screen.getByText('Team Structure Planning - 50%')).toBeInTheDocument();
    expect(screen.getByText('Process Setup Templates - 60%')).toBeInTheDocument();
    expect(screen.getByText('Customer Support Planning - 70%')).toBeInTheDocument();
    expect(screen.getByText('Legal Requirements Checklist - 80%')).toBeInTheDocument();
    expect(screen.getByText('Operational Gap Analysis - 65%')).toBeInTheDocument();
  });
});
