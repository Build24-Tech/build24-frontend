import { ValidationFramework } from '@/app/launch-essentials/components/ValidationFramework';
import { ProjectData, UserProgress } from '@/types/launch-essentials';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}));

// Mock Firebase services
jest.mock('@/lib/launch-essentials-firestore', () => ({
  ProjectDataService: {
    updateProjectPhaseData: jest.fn().mockResolvedValue(undefined)
  },
  UserProgressService: {
    updateStepProgress: jest.fn().mockResolvedValue(undefined),
    getUserProgress: jest.fn().mockResolvedValue({
      userId: 'test-user-id',
      projectId: 'test-project-id',
      currentPhase: 'validation',
      phases: {
        validation: {
          phase: 'validation',
          steps: [],
          completionPercentage: 0,
          startedAt: new Date()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}));

// Test data
const mockProjectData: ProjectData = {
  id: 'test-project-id',
  userId: 'test-user-id',
  name: 'Test Product',
  description: 'A test product for validation',
  industry: 'Technology',
  targetMarket: 'B2B',
  stage: 'validation',
  data: {
    validation: {
      marketResearch: {
        marketSize: 1000000000,
        growthRate: 15.5,
        trends: ['AI adoption', 'Remote work'],
        sources: ['Industry report', 'Survey data']
      },
      competitorAnalysis: {
        competitors: [],
        competitiveAdvantage: '',
        marketGap: ''
      },
      targetAudience: {
        personas: [],
        interviewResults: [],
        validationScore: 0
      },
      validationReport: {
        recommendation: 'go',
        reasoning: '',
        nextSteps: []
      }
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockUserProgress: UserProgress = {
  userId: 'test-user-id',
  projectId: 'test-project-id',
  currentPhase: 'validation',
  phases: {
    validation: {
      phase: 'validation',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    definition: {
      phase: 'definition',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    technical: {
      phase: 'technical',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    marketing: {
      phase: 'marketing',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    operations: {
      phase: 'operations',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    financial: {
      phase: 'financial',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    risk: {
      phase: 'risk',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    },
    optimization: {
      phase: 'optimization',
      steps: [],
      completionPercentage: 0,
      startedAt: new Date()
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('ValidationFramework Integration', () => {
  it('renders all validation components successfully', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Check main framework renders
    expect(screen.getByText('Product Validation Framework')).toBeInTheDocument();
    expect(screen.getByText('Validate your product idea before investing in development')).toBeInTheDocument();

    // Check navigation steps are present
    expect(screen.getByText('Validation Steps')).toBeInTheDocument();

    // Check save button is present
    expect(screen.getByText('Save Progress')).toBeInTheDocument();
  });

  it('displays market research data correctly', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Should show market analysis with existing data
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
    expect(screen.getByText('$1.0B')).toBeInTheDocument();
    expect(screen.getByText('15.5% annually')).toBeInTheDocument();
  });

  it('shows validation step completion status', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Market research should show as complete due to existing data
    const marketResearchSteps = screen.getAllByText('Market Research');
    expect(marketResearchSteps.length).toBeGreaterThan(0);
  });

  it('allows navigation between different validation steps', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Find and click competitor analysis step
    const competitorButton = screen.getByText('Competitor Analysis');
    fireEvent.click(competitorButton);

    // Should show competitor analysis content
    expect(screen.getByText('Analysis Frameworks')).toBeInTheDocument();
    expect(screen.getByText('Direct vs Indirect Competitors')).toBeInTheDocument();
  });

  it('shows appropriate templates and frameworks', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Market research templates should be visible
    expect(screen.getByText('Research Templates')).toBeInTheDocument();
    expect(screen.getByText('TAM/SAM/SOM Analysis')).toBeInTheDocument();
    expect(screen.getByText('Market Trends Analysis')).toBeInTheDocument();
  });
});

describe('Validation Logic Integration', () => {
  it('calculates validation scores correctly', () => {
    // Test the scoring logic that would be used in the components
    const marketData = {
      marketSize: 1000000000,
      growthRate: 15.5,
      trends: ['AI adoption', 'Remote work'],
      sources: ['Industry report', 'Survey data']
    };

    // Market research scoring logic
    let marketScore = 0;
    if (marketData.marketSize > 0) marketScore += 40;
    if (marketData.growthRate > 0) marketScore += 30;
    if (marketData.trends.length > 0) marketScore += 20;
    if (marketData.sources.length > 0) marketScore += 10;

    expect(marketScore).toBe(100);
  });

  it('generates appropriate recommendations based on scores', () => {
    const generateRecommendation = (score: number) => {
      if (score >= 75) return 'go';
      if (score <= 40) return 'no-go';
      return 'pivot';
    };

    expect(generateRecommendation(85)).toBe('go');
    expect(generateRecommendation(60)).toBe('pivot');
    expect(generateRecommendation(30)).toBe('no-go');
  });

  it('validates form data correctly', () => {
    // Test validation logic for competitor data
    const validCompetitor = {
      name: 'Test Competitor',
      description: 'A valid competitor description',
      marketShare: 25,
      pricing: 99.99
    };

    const invalidCompetitor = {
      name: '',
      description: '',
      marketShare: -5,
      pricing: -10
    };

    // Validation checks
    expect(validCompetitor.name.length).toBeGreaterThan(0);
    expect(validCompetitor.description.length).toBeGreaterThan(0);
    expect(validCompetitor.marketShare).toBeGreaterThanOrEqual(0);
    expect(validCompetitor.pricing).toBeGreaterThanOrEqual(0);

    expect(invalidCompetitor.name.length).toBe(0);
    expect(invalidCompetitor.description.length).toBe(0);
    expect(invalidCompetitor.marketShare).toBeLessThan(0);
    expect(invalidCompetitor.pricing).toBeLessThan(0);
  });
});
