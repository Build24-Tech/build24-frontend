import PostLaunchOptimization from '@/app/launch-essentials/components/PostLaunchOptimization';
import { OptimizationData } from '@/lib/post-launch-optimization-utils';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the utility functions
jest.mock('@/lib/post-launch-optimization-utils', () => ({
  ...jest.requireActual('@/lib/post-launch-optimization-utils'),
  calculateOptimizationMetrics: jest.fn(() => ({
    overallHealth: 75,
    analyticsScore: 80,
    feedbackScore: 70,
    improvementVelocity: 65,
    kpiProgress: 85,
    recommendations: ['Test recommendation']
  })),
  analyzeFeedback: jest.fn(() => ({
    sentiment: 'positive',
    confidence: 85,
    keywords: ['great', 'excellent'],
    category: 'General',
    overallSentiment: { positive: 70, neutral: 20, negative: 10 }
  })),
  prioritizeImprovements: jest.fn((improvements) =>
    improvements.map((imp: any) => ({ ...imp, priority: 8 }))
  ),
  generateSprintPlan: jest.fn(() => ({
    id: 'test-sprint',
    name: 'Test Sprint',
    duration: 2,
    startDate: new Date(),
    endDate: new Date(),
    status: 'planned',
    items: [],
    progress: 0,
    velocity: 5,
    burndownData: []
  }))
}));

const mockInitialData: OptimizationData = {
  analytics: {
    setupComplete: false,
    tools: ['Google Analytics'],
    kpis: [],
    dashboards: []
  },
  feedback: {
    methods: ['survey'],
    responses: [],
    sentiment: { positive: 60, neutral: 30, negative: 10 }
  },
  improvements: [],
  sprints: [],
  successMetrics: {
    kpis: [],
    targets: {},
    achievements: {}
  }
};

const mockOnSave = jest.fn();

describe('PostLaunchOptimization Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main component', () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByText('Post-Launch Optimization')).toBeInTheDocument();
    expect(screen.getByText(/continuously improve your product/i)).toBeInTheDocument();
  });

  it('displays health score badge', () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByText('Health Score: 75%')).toBeInTheDocument();
  });

  it('shows overview cards with metrics', () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByText('Analytics Tools')).toBeInTheDocument();
    expect(screen.getByText('Feedback Items')).toBeInTheDocument();
    expect(screen.getByText('Active Sprints')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByRole('tab', { name: /analytics setup/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /feedback collection/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sprint planning/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /success metrics/i })).toBeInTheDocument();
  });

  it('calls onSave when component mounts', async () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={mockInitialData}
      />
    );

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        analytics: expect.any(Object),
        feedback: expect.any(Object),
        improvements: expect.any(Array),
        sprints: expect.any(Array),
        successMetrics: expect.any(Object)
      }));
    });
  });

  it('uses provided initial data', () => {
    const customData: OptimizationData = {
      ...mockInitialData,
      analytics: {
        ...mockInitialData.analytics,
        tools: ['Google Analytics', 'Mixpanel']
      }
    };

    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
        initialData={customData}
      />
    );

    // Should show 2 tools instead of 1
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles missing initial data gracefully', () => {
    render(
      <PostLaunchOptimization
        projectId="test-project"
        onSave={mockOnSave}
      />
    );

    // Should still render without errors
    expect(screen.getByText('Post-Launch Optimization')).toBeInTheDocument();
    expect(screen.getByText('Health Score: 75%')).toBeInTheDocument();
  });
});
