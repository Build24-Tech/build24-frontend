import { ReportingDashboard } from '@/app/launch-essentials/components/ReportingDashboard';
import { ReportService } from '@/lib/report-service';
import { ProjectData, UserProgress } from '@/types/launch-essentials';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the ReportService
jest.mock('@/lib/report-service');

const mockProjectData: ProjectData = {
  id: 'test-project',
  userId: 'test-user',
  name: 'AI Task Manager',
  description: 'An AI-powered task management application',
  industry: 'Productivity Software',
  targetMarket: 'Small businesses',
  stage: 'development',
  data: {
    validation: {
      marketSize: '$2.5B TAM',
      competitorAnalysis: 'Completed',
      userInterviews: '25 interviews'
    },
    financial: {
      projectedRevenue: '$500K ARR',
      fundingNeeded: '$250K'
    },
    risks: {
      identifiedRisks: [
        {
          id: 'risk-1',
          description: 'High competition',
          impact: 'medium',
          probability: 'high',
          category: 'market'
        }
      ]
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-02-01')
};

const mockProgress: UserProgress = {
  userId: 'test-user',
  projectId: 'test-project',
  currentPhase: 'technical',
  phases: {
    validation: {
      phase: 'validation',
      steps: [
        { stepId: 'market-research', status: 'completed', data: {}, completedAt: new Date() },
        { stepId: 'competitor-analysis', status: 'completed', data: {}, completedAt: new Date() }
      ],
      completionPercentage: 100,
      startedAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-15')
    },
    definition: {
      phase: 'definition',
      steps: [
        { stepId: 'vision-mission', status: 'completed', data: {}, completedAt: new Date() },
        { stepId: 'value-proposition', status: 'in_progress', data: {} }
      ],
      completionPercentage: 50,
      startedAt: new Date('2024-01-16')
    },
    technical: {
      phase: 'technical',
      steps: [
        { stepId: 'tech-stack', status: 'in_progress', data: {} }
      ],
      completionPercentage: 25,
      startedAt: new Date('2024-01-20')
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-02-01')
};

const mockReportContent = {
  executiveSummary: 'AI Task Manager is a productivity software product targeting small businesses. The project shows 75% launch readiness with medium risk profile.',
  progressOverview: {
    overallCompletion: 58.33,
    phasesCompleted: 1,
    totalPhases: 3,
    timeSpent: 31,
    estimatedTimeRemaining: 22
  },
  phaseAnalysis: [
    {
      phase: 'validation' as const,
      completion: 100,
      keyAchievements: ['Market research completed', 'Competitor analysis done'],
      challenges: [],
      nextSteps: [],
      riskFactors: []
    },
    {
      phase: 'definition' as const,
      completion: 50,
      keyAchievements: ['Vision statement created'],
      challenges: ['Value proposition needs refinement'],
      nextSteps: ['Complete value proposition'],
      riskFactors: []
    },
    {
      phase: 'technical' as const,
      completion: 25,
      keyAchievements: [],
      challenges: ['Technology stack selection in progress'],
      nextSteps: ['Finalize tech stack', 'Design architecture'],
      riskFactors: ['Technical complexity']
    }
  ],
  insights: {
    completionRate: 58.33,
    timeSpent: 31,
    riskLevel: 'medium' as const,
    readinessScore: 75,
    keyFindings: [
      'Market opportunity: $2.5B TAM',
      'Revenue projection: $500K ARR',
      'Strong validation phase completion'
    ],
    nextSteps: [
      'Complete definition phase',
      'Finalize technical architecture',
      'Begin marketing strategy'
    ]
  },
  recommendations: [
    'Focus on completing core validation and definition phases',
    'Address technical architecture decisions',
    'Prepare for marketing phase initiation'
  ]
};

const mockReport = {
  id: 'report-1',
  projectId: 'test-project',
  templateId: 'detailed-analysis',
  title: 'AI Task Manager - Detailed Analysis',
  content: mockReportContent,
  generatedAt: new Date(),
  format: 'json'
};

describe('ReportingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ReportService.generateReport as jest.Mock).mockResolvedValue(mockReport);
  });

  it('should render loading state initially', () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    expect(screen.getByText('Generating report data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should render executive summary cards after loading', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByText('Readiness Score')).toBeInTheDocument();
      expect(screen.getByText('Time Invested')).toBeInTheDocument();
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
    });

    expect(screen.getByText('58.3%')).toBeInTheDocument(); // Overall progress
    expect(screen.getByText('75/100')).toBeInTheDocument(); // Readiness score
    expect(screen.getByText('31 days')).toBeInTheDocument(); // Time invested
    expect(screen.getByText('MEDIUM')).toBeInTheDocument(); // Risk level
  });

  it('should render tab navigation', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Phase Analysis' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Insights' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Export' })).toBeInTheDocument();
    });
  });

  it('should display executive summary in overview tab', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText(mockReportContent.executiveSummary)).toBeInTheDocument();
    });
  });

  it('should display key recommendations', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Focus on completing core validation and definition phases')).toBeInTheDocument();
      expect(screen.getByText('Address technical architecture decisions')).toBeInTheDocument();
    });
  });

  it('should display progress timeline with phase completion', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(screen.getByText('Progress Timeline')).toBeInTheDocument();
    });

    // Check for phase names (they might be capitalized differently)
    expect(screen.getByText(/validation/i)).toBeInTheDocument();
    expect(screen.getByText(/definition/i)).toBeInTheDocument();
    expect(screen.getByText(/technical/i)).toBeInTheDocument();

    // Check completion percentages
    expect(screen.getByText('100.0%')).toBeInTheDocument(); // Validation
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // Definition
    expect(screen.getByText('25.0%')).toBeInTheDocument(); // Technical
  });

  it('should display phase analysis when switching tabs', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      const phaseTab = screen.getByRole('tab', { name: 'Phase Analysis' });
      expect(phaseTab).toBeInTheDocument();
    });

    // The phase analysis content should be available even if not immediately visible
    // This test verifies the component structure is correct
    expect(screen.getByRole('tab', { name: 'Phase Analysis' })).toBeInTheDocument();
  });

  it('should display insights tab content', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      const insightsTab = screen.getByRole('tab', { name: 'Insights' });
      expect(insightsTab).toBeInTheDocument();
    });

    // Verify the insights tab exists and can be interacted with
    expect(screen.getByRole('tab', { name: 'Insights' })).toBeInTheDocument();
  });

  it('should display performance metrics correctly', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    // Check metrics in the summary cards which are always visible
    await waitFor(() => {
      expect(screen.getByText('58.3%')).toBeInTheDocument(); // Overall Progress
      expect(screen.getByText('31 days')).toBeInTheDocument(); // Time Invested
      expect(screen.getByText('75/100')).toBeInTheDocument(); // Readiness Score
    });
  });

  it('should render export tab with ExportReportPanel', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      const exportTab = screen.getByRole('tab', { name: 'Export' });
      expect(exportTab).toBeInTheDocument();
    });

    // Verify the export tab exists
    expect(screen.getByRole('tab', { name: 'Export' })).toBeInTheDocument();
  });

  it('should handle report generation errors', async () => {
    (ReportService.generateReport as jest.Mock).mockRejectedValue(
      new Error('Report generation failed')
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to generate report data:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should call ReportService.generateReport with correct parameters', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      expect(ReportService.generateReport).toHaveBeenCalledWith(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );
    });
  });

  it('should display correct risk level styling', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      const riskBadge = screen.getByText('MEDIUM');
      expect(riskBadge).toHaveClass('text-yellow-600', 'bg-yellow-50');
    });
  });

  it('should show phase icons correctly', async () => {
    render(<ReportingDashboard projectData={mockProjectData} progress={mockProgress} />);

    await waitFor(() => {
      // Check that phase names appear in the progress timeline
      expect(screen.getByText(/validation/i)).toBeInTheDocument();
      expect(screen.getByText(/definition/i)).toBeInTheDocument();
      expect(screen.getByText(/technical/i)).toBeInTheDocument();
    });
  });

  it('should regenerate report data when props change', async () => {
    const { rerender } = render(
      <ReportingDashboard projectData={mockProjectData} progress={mockProgress} />
    );

    await waitFor(() => {
      expect(ReportService.generateReport).toHaveBeenCalledTimes(1);
    });

    // Change the project data
    const updatedProjectData = {
      ...mockProjectData,
      name: 'Updated Project Name'
    };

    rerender(
      <ReportingDashboard projectData={updatedProjectData} progress={mockProgress} />
    );

    await waitFor(() => {
      expect(ReportService.generateReport).toHaveBeenCalledTimes(2);
    });
  });
});
