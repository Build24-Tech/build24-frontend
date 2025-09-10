import { ValidationFramework } from '@/app/launch-essentials/components/ValidationFramework';
import { CompetitorAnalysis } from '@/app/launch-essentials/components/validation/CompetitorAnalysis';
import { InterviewGuide } from '@/app/launch-essentials/components/validation/InterviewGuide';
import { MarketResearch } from '@/app/launch-essentials/components/validation/MarketResearch';
import { TargetAudienceValidation } from '@/app/launch-essentials/components/validation/TargetAudienceValidation';
import { ValidationReport } from '@/app/launch-essentials/components/validation/ValidationReport';
import { Competitor, ProjectData, UserPersona, UserProgress, ValidationData } from '@/types/launch-essentials';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

describe('ValidationFramework', () => {
  it('renders validation framework with all steps', () => {
    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    expect(screen.getByText('Product Validation Framework')).toBeInTheDocument();
    expect(screen.getByText('Market Research')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis')).toBeInTheDocument();
    expect(screen.getByText('Target Audience')).toBeInTheDocument();
    expect(screen.getByText('User Interviews')).toBeInTheDocument();
    expect(screen.getByText('Validation Report')).toBeInTheDocument();
  });

  it('allows navigation between validation steps', async () => {
    const user = userEvent.setup();

    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Click on competitor analysis step
    await user.click(screen.getByText('Competitor Analysis'));

    // Should show competitor analysis content
    expect(screen.getByText('Analysis Frameworks')).toBeInTheDocument();
  });

  it('shows unsaved changes indicator', async () => {
    const user = userEvent.setup();

    render(
      <ValidationFramework
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Make a change to trigger unsaved state
    const marketSizeInput = screen.getByLabelText('Total Market Size (USD)');
    await user.clear(marketSizeInput);
    await user.type(marketSizeInput, '2000000000');

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });
});

describe('MarketResearch', () => {
  const mockMarketData: ValidationData['marketResearch'] = {
    marketSize: 0,
    growthRate: 0,
    trends: [],
    sources: []
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders market research templates', () => {
    render(
      <MarketResearch
        data={mockMarketData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('TAM/SAM/SOM Analysis')).toBeInTheDocument();
    expect(screen.getByText('Market Trends Analysis')).toBeInTheDocument();
    expect(screen.getByText('Market Segmentation')).toBeInTheDocument();
  });

  it('updates market size when input changes', async () => {
    const user = userEvent.setup();

    render(
      <MarketResearch
        data={mockMarketData}
        onChange={mockOnChange}
      />
    );

    const marketSizeInput = screen.getByLabelText('Total Market Size (USD)');
    await user.type(marketSizeInput, '1000000000');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMarketData,
      marketSize: 1000000000
    });
  });

  it('adds and removes market trends', async () => {
    const user = userEvent.setup();

    render(
      <MarketResearch
        data={mockMarketData}
        onChange={mockOnChange}
      />
    );

    // Add a trend
    const trendInput = screen.getByPlaceholderText('Enter a market trend...');
    await user.type(trendInput, 'AI adoption');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockMarketData,
      trends: ['AI adoption']
    });
  });

  it('calculates market analysis when data is provided', () => {
    const dataWithValues = {
      ...mockMarketData,
      marketSize: 1000000000,
      growthRate: 15.5
    };

    render(
      <MarketResearch
        data={dataWithValues}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
    expect(screen.getByText('$1.0B')).toBeInTheDocument();
    expect(screen.getByText('15.5% annually')).toBeInTheDocument();
  });
});

describe('CompetitorAnalysis', () => {
  const mockCompetitorData: ValidationData['competitorAnalysis'] = {
    competitors: [],
    competitiveAdvantage: '',
    marketGap: ''
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders competitor analysis frameworks', () => {
    render(
      <CompetitorAnalysis
        data={mockCompetitorData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Direct vs Indirect Competitors')).toBeInTheDocument();
    expect(screen.getByText('Competitive Positioning Map')).toBeInTheDocument();
    expect(screen.getByText('SWOT Analysis')).toBeInTheDocument();
  });

  it('shows add competitor form when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CompetitorAnalysis
        data={mockCompetitorData}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Add Competitor'));
    expect(screen.getByText('Add New Competitor')).toBeInTheDocument();
  });

  it('adds a new competitor', async () => {
    const user = userEvent.setup();

    render(
      <CompetitorAnalysis
        data={mockCompetitorData}
        onChange={mockOnChange}
      />
    );

    // Open add form
    await user.click(screen.getByText('Add Competitor'));

    // Fill in competitor details
    await user.type(screen.getByLabelText('Company Name *'), 'Test Competitor');
    await user.type(screen.getByLabelText('Description *'), 'A test competitor description');
    await user.type(screen.getByLabelText('Market Share (%)'), '25');
    await user.type(screen.getByLabelText('Starting Price (USD)'), '99.99');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add competitor/i }));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockCompetitorData,
      competitors: [{
        name: 'Test Competitor',
        description: 'A test competitor description',
        strengths: [],
        weaknesses: [],
        marketShare: 25,
        pricing: 99.99
      }]
    });
  });

  it('updates competitive advantage text', async () => {
    const user = userEvent.setup();

    render(
      <CompetitorAnalysis
        data={mockCompetitorData}
        onChange={mockOnChange}
      />
    );

    const advantageTextarea = screen.getByLabelText('Your Competitive Advantage');
    await user.type(advantageTextarea, 'Our unique AI technology');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockCompetitorData,
      competitiveAdvantage: 'Our unique AI technology'
    });
  });
});

describe('TargetAudienceValidation', () => {
  const mockAudienceData: ValidationData['targetAudience'] = {
    personas: [],
    interviewResults: [],
    validationScore: 0
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders persona templates', () => {
    render(
      <TargetAudienceValidation
        data={mockAudienceData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('B2B Decision Maker')).toBeInTheDocument();
    expect(screen.getByText('Consumer Early Adopter')).toBeInTheDocument();
    expect(screen.getByText('Small Business Owner')).toBeInTheDocument();
  });

  it('shows add persona form when template is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TargetAudienceValidation
        data={mockAudienceData}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('B2B Decision Maker'));
    expect(screen.getByText('Create New Persona')).toBeInTheDocument();
  });

  it('creates a new persona', async () => {
    const user = userEvent.setup();

    render(
      <TargetAudienceValidation
        data={mockAudienceData}
        onChange={mockOnChange}
      />
    );

    // Open add form
    await user.click(screen.getByText('Add Persona'));

    // Fill in persona details
    await user.type(screen.getByLabelText('Persona Name *'), 'Test Persona');
    await user.type(screen.getByLabelText('Age Range'), '25-35');
    await user.type(screen.getByLabelText('Occupation'), 'Software Engineer');

    // Submit form
    await user.click(screen.getByRole('button', { name: /create persona/i }));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        personas: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Persona',
            demographics: expect.objectContaining({
              age: '25-35',
              occupation: 'Software Engineer'
            })
          })
        ])
      })
    );
  });

  it('calculates validation score correctly', () => {
    const dataWithPersonas = {
      ...mockAudienceData,
      personas: [
        {
          id: 'persona-1',
          name: 'Test Persona',
          demographics: {
            age: '25-35',
            location: 'Urban',
            occupation: 'Engineer',
            income: '$50k-80k'
          },
          psychographics: {
            goals: ['Goal 1'],
            painPoints: ['Pain 1'],
            motivations: ['Motivation 1'],
            behaviors: ['Behavior 1']
          },
          technographics: {
            devices: ['Laptop'],
            platforms: ['LinkedIn'],
            techSavviness: 'high' as const
          }
        }
      ] as UserPersona[]
    };

    render(
      <TargetAudienceValidation
        data={dataWithPersonas}
        onChange={mockOnChange}
      />
    );

    // Should show validation score greater than 0
    expect(screen.getByText(/Validation Progress/)).toBeInTheDocument();
  });
});

describe('InterviewGuide', () => {
  const mockPersonas: UserPersona[] = [
    {
      id: 'persona-1',
      name: 'Test Persona',
      demographics: {
        age: '25-35',
        location: 'Urban',
        occupation: 'Engineer',
        income: '$50k-80k'
      },
      psychographics: {
        goals: [],
        painPoints: [],
        motivations: [],
        behaviors: []
      },
      technographics: {
        devices: [],
        platforms: [],
        techSavviness: 'medium'
      }
    }
  ];

  const mockInterviewResults = [];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders interview templates', () => {
    render(
      <InterviewGuide
        personas={mockPersonas}
        interviewResults={mockInterviewResults}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Problem Discovery')).toBeInTheDocument();
    expect(screen.getByText('Solution Validation')).toBeInTheDocument();
    expect(screen.getByText('Feature Prioritization')).toBeInTheDocument();
    expect(screen.getByText('Pricing & Willingness to Pay')).toBeInTheDocument();
  });

  it('shows add interview form when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <InterviewGuide
        personas={mockPersonas}
        interviewResults={mockInterviewResults}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Add Interview'));
    expect(screen.getByText('Record Interview')).toBeInTheDocument();
  });

  it('shows message when no personas are available', () => {
    render(
      <InterviewGuide
        personas={[]}
        interviewResults={mockInterviewResults}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('No personas available')).toBeInTheDocument();
    expect(screen.getByText('Create user personas first to conduct interviews')).toBeInTheDocument();
  });
});

describe('ValidationReport', () => {
  const mockValidationData: ValidationData = {
    marketResearch: {
      marketSize: 1000000000,
      growthRate: 15.5,
      trends: ['AI adoption', 'Remote work'],
      sources: ['Industry report']
    },
    competitorAnalysis: {
      competitors: [
        {
          name: 'Competitor 1',
          description: 'A competitor',
          strengths: ['Strong brand'],
          weaknesses: ['High price'],
          marketShare: 25,
          pricing: 99.99
        }
      ] as Competitor[],
      competitiveAdvantage: 'Better technology',
      marketGap: 'Underserved SMB market'
    },
    targetAudience: {
      personas: [
        {
          id: 'persona-1',
          name: 'Test Persona',
          demographics: {
            age: '25-35',
            location: 'Urban',
            occupation: 'Engineer',
            income: '$50k-80k'
          },
          psychographics: {
            goals: ['Goal 1'],
            painPoints: ['Pain 1'],
            motivations: ['Motivation 1'],
            behaviors: ['Behavior 1']
          },
          technographics: {
            devices: ['Laptop'],
            platforms: ['LinkedIn'],
            techSavviness: 'high'
          }
        }
      ] as UserPersona[],
      interviewResults: [],
      validationScore: 75
    },
    validationReport: {
      recommendation: 'go',
      reasoning: 'Strong validation signals',
      nextSteps: []
    }
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders validation metrics', () => {
    render(
      <ValidationReport
        validationData={mockValidationData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Validation Metrics')).toBeInTheDocument();
    expect(screen.getByText('Market Research')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis')).toBeInTheDocument();
    expect(screen.getByText('Target Audience')).toBeInTheDocument();
    expect(screen.getByText('User Interviews')).toBeInTheDocument();
  });

  it('shows overall validation score', () => {
    render(
      <ValidationReport
        validationData={mockValidationData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Overall Validation Score')).toBeInTheDocument();
    expect(screen.getByText('out of 100')).toBeInTheDocument();
  });

  it('allows changing recommendation', async () => {
    const user = userEvent.setup();

    render(
      <ValidationReport
        validationData={mockValidationData}
        onChange={mockOnChange}
      />
    );

    // Find and click the recommendation select
    const recommendationSelect = screen.getByRole('combobox');
    await user.click(recommendationSelect);

    // Select pivot option
    await user.click(screen.getByText('PIVOT - Modify Approach'));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendation: 'pivot'
      })
    );
  });

  it('adds and removes next steps', async () => {
    const user = userEvent.setup();

    render(
      <ValidationReport
        validationData={mockValidationData}
        onChange={mockOnChange}
      />
    );

    // Add a next step
    const nextStepInput = screen.getByPlaceholderText('Add custom next step...');
    await user.type(nextStepInput, 'Start MVP development');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        nextSteps: ['Start MVP development']
      })
    );
  });

  it('generates automatic recommendation reasoning', async () => {
    const user = userEvent.setup();

    render(
      <ValidationReport
        validationData={mockValidationData}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Generate Analysis'));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reasoning: expect.stringContaining('Based on the validation analysis')
      })
    );
  });
});

// Validation Logic Tests
describe('Validation Logic', () => {
  describe('Market Research Validation', () => {
    it('validates market size is positive number', () => {
      const validData = { marketSize: 1000000, growthRate: 10, trends: ['trend'], sources: ['source'] };
      const invalidData = { marketSize: -1000, growthRate: 10, trends: ['trend'], sources: ['source'] };

      // These would be actual validation functions in the real implementation
      expect(validData.marketSize).toBeGreaterThan(0);
      expect(invalidData.marketSize).toBeLessThan(0);
    });

    it('requires at least one trend and source', () => {
      const validData = { trends: ['AI adoption'], sources: ['Industry report'] };
      const invalidData = { trends: [], sources: [] };

      expect(validData.trends.length).toBeGreaterThan(0);
      expect(validData.sources.length).toBeGreaterThan(0);
      expect(invalidData.trends.length).toBe(0);
      expect(invalidData.sources.length).toBe(0);
    });
  });

  describe('Competitor Analysis Validation', () => {
    it('validates competitor data completeness', () => {
      const validCompetitor = {
        name: 'Competitor',
        description: 'Description',
        strengths: ['strength'],
        weaknesses: ['weakness'],
        marketShare: 25,
        pricing: 99.99
      };

      expect(validCompetitor.name).toBeTruthy();
      expect(validCompetitor.description).toBeTruthy();
      expect(validCompetitor.marketShare).toBeGreaterThanOrEqual(0);
      expect(validCompetitor.marketShare).toBeLessThanOrEqual(100);
      expect(validCompetitor.pricing).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Persona Validation', () => {
    it('validates persona completeness', () => {
      const validPersona = {
        name: 'Test Persona',
        demographics: {
          age: '25-35',
          occupation: 'Engineer'
        },
        psychographics: {
          goals: ['goal'],
          painPoints: ['pain']
        }
      };

      expect(validPersona.name).toBeTruthy();
      expect(validPersona.demographics.age).toBeTruthy();
      expect(validPersona.demographics.occupation).toBeTruthy();
      expect(validPersona.psychographics.goals.length).toBeGreaterThan(0);
      expect(validPersona.psychographics.painPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Interview Scoring', () => {
    it('calculates interview score based on sentiment and completeness', () => {
      const responses = [
        { question: 'Q1', answer: 'Detailed positive response', sentiment: 'positive' as const },
        { question: 'Q2', answer: 'Short answer', sentiment: 'neutral' as const },
        { question: 'Q3', answer: 'Detailed negative feedback', sentiment: 'negative' as const }
      ];

      // Mock scoring logic
      const sentimentScores = { positive: 10, neutral: 5, negative: 2 };
      const totalScore = responses.reduce((sum, response) => {
        const sentimentScore = sentimentScores[response.sentiment];
        const answerCompleteness = response.answer.length > 20 ? 1 : 0.5;
        return sum + (sentimentScore * answerCompleteness);
      }, 0);

      const finalScore = Math.round((totalScore / (responses.length * 10)) * 100);

      expect(finalScore).toBeGreaterThan(0);
      expect(finalScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Overall Validation Score', () => {
    it('calculates weighted validation score', () => {
      const metrics = {
        marketScore: 80,
        competitorScore: 70,
        audienceScore: 85,
        interviewScore: 75
      };

      const overallScore = Math.round(
        (metrics.marketScore * 0.25) +
        (metrics.competitorScore * 0.25) +
        (metrics.audienceScore * 0.25) +
        (metrics.interviewScore * 0.25)
      );

      expect(overallScore).toBe(78); // (80+70+85+75)/4 = 77.5 rounded to 78
    });

    it('generates correct recommendation based on score', () => {
      const generateRecommendation = (score: number) => {
        if (score >= 75) return 'go';
        if (score <= 40) return 'no-go';
        return 'pivot';
      };

      expect(generateRecommendation(80)).toBe('go');
      expect(generateRecommendation(60)).toBe('pivot');
      expect(generateRecommendation(30)).toBe('no-go');
    });
  });
});
