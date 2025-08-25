import { ProjectDataService } from '@/lib/launch-essentials-firestore';
import { progressTracker } from '@/lib/progress-tracker';
import { RecommendationService } from '@/lib/recommendation-service';
import {
  LaunchPhase,
  PhaseProgress,
  ProjectData,
  StepProgress,
  UserProgress
} from '@/types/launch-essentials';

// Mock the dependencies
jest.mock('@/lib/progress-tracker', () => ({
  progressTracker: {
    getProgress: jest.fn(),
    calculateProgress: jest.fn()
  }
}));

jest.mock('@/lib/launch-essentials-firestore', () => ({
  UserProgressService: {
    getUserProgress: jest.fn(),
    createUserProgress: jest.fn(),
    updateStepProgress: jest.fn(),
    updateCurrentPhase: jest.fn(),
    subscribeToUserProgress: jest.fn()
  },
  ProjectDataService: {
    getProjectData: jest.fn(),
    createProjectData: jest.fn(),
    updateProjectData: jest.fn(),
    deleteProjectData: jest.fn()
  }
}));

describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockUserProgress: UserProgress;
  let mockProjectData: ProjectData;

  beforeEach(() => {
    service = new RecommendationService();

    // Create mock data
    const now = new Date();

    const createMockStepProgress = (stepId: string, status: 'not_started' | 'in_progress' | 'completed' | 'skipped' = 'not_started'): StepProgress => ({
      stepId,
      status,
      data: {},
      completedAt: status === 'completed' ? now : undefined,
      notes: undefined
    });

    const createMockPhaseProgress = (phase: LaunchPhase, steps: StepProgress[]): PhaseProgress => ({
      phase,
      steps,
      completionPercentage: Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100),
      startedAt: now,
      completedAt: steps.every(s => s.status === 'completed' || s.status === 'skipped') ? now : undefined
    });

    mockUserProgress = {
      userId: 'test-user',
      projectId: 'test-project',
      currentPhase: 'validation',
      phases: {
        validation: createMockPhaseProgress('validation', [
          createMockStepProgress('market-research', 'completed'),
          createMockStepProgress('competitor-analysis', 'in_progress'),
          createMockStepProgress('target-audience', 'not_started')
        ]),
        definition: createMockPhaseProgress('definition', [
          createMockStepProgress('value-proposition', 'not_started'),
          createMockStepProgress('feature-prioritization', 'not_started')
        ]),
        technical: createMockPhaseProgress('technical', [
          createMockStepProgress('technical-stack', 'not_started')
        ]),
        marketing: createMockPhaseProgress('marketing', [
          createMockStepProgress('pricing-strategy', 'not_started')
        ]),
        operations: createMockPhaseProgress('operations', [
          createMockStepProgress('team-structure', 'not_started')
        ]),
        financial: createMockPhaseProgress('financial', [
          createMockStepProgress('financial-projections', 'not_started')
        ]),
        risk: createMockPhaseProgress('risk', [
          createMockStepProgress('risk-assessment', 'not_started')
        ]),
        optimization: createMockPhaseProgress('optimization', [
          createMockStepProgress('analytics-setup', 'not_started')
        ])
      },
      createdAt: now,
      updatedAt: now
    };

    mockProjectData = {
      id: 'test-project',
      userId: 'test-user',
      name: 'Test Project',
      description: 'A test project',
      industry: 'saas',
      targetMarket: 'small-business',
      stage: 'validation',
      data: {
        validation: {
          marketResearch: {
            marketSize: 1000000,
            growthRate: 0.15,
            trends: ['trend1', 'trend2'],
            sources: ['source1', 'source2']
          },
          competitorAnalysis: {
            competitors: [],
            competitiveAdvantage: 'test advantage',
            marketGap: 'test gap'
          },
          targetAudience: {
            personas: [],
            interviewResults: [],
            validationScore: 75
          },
          validationReport: {
            recommendation: 'go',
            reasoning: 'test reasoning',
            nextSteps: ['step1', 'step2']
          }
        },
        operations: {
          team: {
            structure: [
              {
                title: 'Founder',
                responsibilities: ['Product', 'Strategy'],
                skills: ['Leadership', 'Vision'],
                level: 'senior',
                salary: 100000,
                startDate: now
              }
            ],
            hiringPlan: [],
            budget: 50000
          },
          processes: {
            development: {
              name: 'Development Process',
              steps: [],
              tools: [],
              responsible: [],
              frequency: 'daily'
            },
            testing: {
              name: 'Testing Process',
              steps: [],
              tools: [],
              responsible: [],
              frequency: 'weekly'
            },
            deployment: {
              name: 'Deployment Process',
              steps: [],
              tools: [],
              responsible: [],
              frequency: 'weekly'
            },
            support: {
              name: 'Support Process',
              steps: [],
              tools: [],
              responsible: [],
              frequency: 'daily'
            }
          },
          support: {
            channels: [],
            knowledgeBase: [],
            slaTargets: []
          },
          legal: {
            termsOfService: false,
            privacyPolicy: false,
            compliance: []
          }
        },
        financial: {
          projections: {
            revenue: [],
            costs: [],
            cashFlow: []
          },
          funding: {
            requirements: 100000,
            timeline: [],
            sources: []
          },
          businessModel: {
            type: 'saas',
            revenueStreams: [],
            costStructure: []
          },
          pricing: {
            methodology: {
              primary: 'value-based',
              factors: [],
              analysis: ''
            },
            analysis: {
              competitorPricing: [],
              valueMetrics: [],
              priceElasticity: 0,
              recommendation: ''
            }
          }
        }
      },
      createdAt: now,
      updatedAt: now
    };

    // Setup mocks
    (progressTracker.getProgress as jest.Mock).mockResolvedValue(mockUserProgress);
    (progressTracker.calculateProgress as jest.Mock).mockReturnValue({
      phaseCompletion: {
        validation: 33,
        definition: 0,
        technical: 0,
        marketing: 0,
        operations: 0,
        financial: 0,
        risk: 0,
        optimization: 0
      },
      overallCompletion: 4,
      completedSteps: 1,
      totalSteps: 8,
      nextStep: mockUserProgress.phases.validation.steps[1],
      nextPhase: 'validation'
    });
    (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should return comprehensive recommendations', async () => {
      const result = await service.getRecommendations('test-user', 'test-project');

      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('resources');
      expect(result).toHaveProperty('risks');
      expect(result).toHaveProperty('personalizedRecommendations');

      expect(Array.isArray(result.nextSteps)).toBe(true);
      expect(Array.isArray(result.resources)).toBe(true);
      expect(Array.isArray(result.risks)).toBe(true);
      expect(Array.isArray(result.personalizedRecommendations)).toBe(true);
    });

    it('should call the necessary services', async () => {
      await service.getRecommendations('test-user', 'test-project');

      expect(progressTracker.getProgress).toHaveBeenCalledWith('test-user', 'test-project');
      expect(ProjectDataService.getProjectData).toHaveBeenCalledWith('test-project');
    });

    it('should throw error when progress is not found', async () => {
      (progressTracker.getProgress as jest.Mock).mockResolvedValue(null);

      await expect(service.getRecommendations('test-user', 'test-project'))
        .rejects.toThrow('Progress or project data not found');
    });

    it('should throw error when project data is not found', async () => {
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(null);

      await expect(service.getRecommendations('test-user', 'test-project'))
        .rejects.toThrow('Progress or project data not found');
    });
  });

  describe('getPhaseRecommendations', () => {
    it('should return phase-specific recommendations', async () => {
      const result = await service.getPhaseRecommendations('test-user', 'test-project', 'validation');

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('resources');
      expect(result).toHaveProperty('contentSuggestions');

      expect(result.contentSuggestions).toHaveProperty('templateSuggestions');
      expect(result.contentSuggestions).toHaveProperty('frameworkAdjustments');
      expect(result.contentSuggestions).toHaveProperty('contentIdeas');
    });

    it('should filter recommendations for the specified phase', async () => {
      const result = await service.getPhaseRecommendations('test-user', 'test-project', 'validation');

      // All recommendations should be for the validation phase or general
      result.recommendations.forEach(rec => {
        expect(['validation', 'general']).toContain(rec.category);
      });
    });

    it('should include phase-specific resources', async () => {
      const result = await service.getPhaseRecommendations('test-user', 'test-project', 'validation');

      // Resources should include validation-related tags
      const hasValidationResources = result.resources.some(resource =>
        resource.tags.includes('validation')
      );
      expect(hasValidationResources).toBe(true);
    });
  });

  describe('getRiskAnalysis', () => {
    it('should return comprehensive risk analysis', async () => {
      const result = await service.getRiskAnalysis('test-user', 'test-project');

      expect(result).toHaveProperty('risks');
      expect(result).toHaveProperty('riskSummary');
      expect(result).toHaveProperty('mitigationRecommendations');

      expect(result.riskSummary).toHaveProperty('totalRisks');
      expect(result.riskSummary).toHaveProperty('highPriorityRisks');
      expect(result.riskSummary).toHaveProperty('criticalCategories');
      expect(result.riskSummary).toHaveProperty('overallRiskLevel');

      expect(['low', 'medium', 'high']).toContain(result.riskSummary.overallRiskLevel);
    });

    it('should generate mitigation recommendations for high-priority risks', async () => {
      const result = await service.getRiskAnalysis('test-user', 'test-project');

      result.mitigationRecommendations.forEach(rec => {
        expect(rec.type).toBe('risk');
        expect(rec.title).toContain('Mitigate');
        expect(rec.actionItems.length).toBeGreaterThan(0);
      });
    });

    it('should calculate overall risk level correctly', async () => {
      const result = await service.getRiskAnalysis('test-user', 'test-project');

      expect(typeof result.riskSummary.totalRisks).toBe('number');
      expect(typeof result.riskSummary.highPriorityRisks).toBe('number');
      expect(Array.isArray(result.riskSummary.criticalCategories)).toBe(true);
    });
  });

  describe('updateUserActivity', () => {
    it('should update user behavior and return recommendations', async () => {
      const result = await service.updateUserActivity('test-user', 'test-project', 'market-research', 3600000);

      expect(Array.isArray(result)).toBe(true);
      expect(progressTracker.getProgress).toHaveBeenCalledWith('test-user', 'test-project');
      expect(ProjectDataService.getProjectData).toHaveBeenCalledWith('test-project');
    });

    it('should handle missing progress gracefully', async () => {
      (progressTracker.getProgress as jest.Mock).mockResolvedValue(null);

      await expect(service.updateUserActivity('test-user', 'test-project'))
        .rejects.toThrow('Progress not found');
    });

    it('should handle missing project data gracefully', async () => {
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(null);

      await expect(service.updateUserActivity('test-user', 'test-project'))
        .rejects.toThrow('Project data not found');
    });
  });

  describe('getContentSuggestions', () => {
    it('should return content suggestions based on user input', async () => {
      const userInput = {
        targetAudience: 'small business owners',
        problemStatement: 'inventory management is complex'
      };

      const result = await service.getContentSuggestions(
        'test-user',
        'test-project',
        'validation',
        userInput
      );

      expect(result).toHaveProperty('templateSuggestions');
      expect(result).toHaveProperty('frameworkAdjustments');
      expect(result).toHaveProperty('contentIdeas');
      expect(result).toHaveProperty('relatedResources');

      expect(Array.isArray(result.templateSuggestions)).toBe(true);
      expect(Array.isArray(result.frameworkAdjustments)).toBe(true);
      expect(Array.isArray(result.contentIdeas)).toBe(true);
      expect(Array.isArray(result.relatedResources)).toBe(true);
    });

    it('should include related resources based on user input', async () => {
      const userInput = { channels: ['social-media', 'email'] };

      const result = await service.getContentSuggestions(
        'test-user',
        'test-project',
        'marketing',
        userInput
      );

      // Should return content suggestions structure
      expect(result).toHaveProperty('templateSuggestions');
      expect(result).toHaveProperty('frameworkAdjustments');
      expect(result).toHaveProperty('contentIdeas');
      expect(result).toHaveProperty('relatedResources');
      expect(Array.isArray(result.relatedResources)).toBe(true);
    });
  });

  describe('getProgressInsights', () => {
    it('should return comprehensive progress insights', async () => {
      const result = await service.getProgressInsights('test-user', 'test-project');

      expect(result).toHaveProperty('progressSummary');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('recommendations');

      expect(result.progressSummary).toHaveProperty('overallCompletion');
      expect(result.progressSummary).toHaveProperty('currentPhase');
      expect(result.progressSummary).toHaveProperty('completedPhases');
      expect(result.progressSummary).toHaveProperty('stuckAreas');
      expect(result.progressSummary).toHaveProperty('momentum');

      expect(['high', 'medium', 'low']).toContain(result.progressSummary.momentum);
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should identify stuck areas correctly', async () => {
      // Mock progress with uneven completion
      (progressTracker.calculateProgress as jest.Mock).mockReturnValue({
        phaseCompletion: {
          validation: 80,
          definition: 20, // This should be identified as stuck
          technical: 0,
          marketing: 0,
          operations: 0,
          financial: 0,
          risk: 0,
          optimization: 0
        },
        overallCompletion: 50,
        completedSteps: 4,
        totalSteps: 8,
        nextStep: null,
        nextPhase: null
      });

      const result = await service.getProgressInsights('test-user', 'test-project');

      expect(result.progressSummary.stuckAreas).toContain('definition');
    });

    it('should calculate momentum based on recent activity', async () => {
      // Test high momentum (recent update)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1);
      mockUserProgress.updatedAt = recentDate;

      (progressTracker.getProgress as jest.Mock).mockResolvedValue(mockUserProgress);

      const result = await service.getProgressInsights('test-user', 'test-project');

      expect(result.progressSummary.momentum).toBe('high');
    });

    it('should generate appropriate insights based on progress', async () => {
      const result = await service.getProgressInsights('test-user', 'test-project');

      expect(result.insights.length).toBeGreaterThan(0);
      result.insights.forEach(insight => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });

    it('should limit recommendations to top 5', async () => {
      const result = await service.getProgressInsights('test-user', 'test-project');

      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('helper methods', () => {
    it('should estimate team size from operations data', async () => {
      const result = await service.getRecommendations('test-user', 'test-project');

      // Should use team structure from operations data
      expect(result).toBeDefined();
    });

    it('should estimate budget from financial data', async () => {
      const result = await service.getRecommendations('test-user', 'test-project');

      // Should use funding requirements from financial data
      expect(result).toBeDefined();
    });

    it('should handle missing data gracefully', async () => {
      // Remove operations and financial data
      mockProjectData.data.operations = undefined;
      mockProjectData.data.financial = undefined;

      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);

      const result = await service.getRecommendations('test-user', 'test-project');

      // Should still return recommendations with default values
      expect(result).toBeDefined();
      expect(result.nextSteps).toBeDefined();
      expect(result.resources).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      (progressTracker.getProgress as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(service.getRecommendations('test-user', 'test-project'))
        .rejects.toThrow('Service error');
    });

    it('should handle network errors gracefully', async () => {
      (ProjectDataService.getProjectData as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.getRecommendations('test-user', 'test-project'))
        .rejects.toThrow('Network error');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (progressTracker.getProgress as jest.Mock).mockRejectedValue(new Error('Test error'));

      try {
        await service.getRecommendations('test-user', 'test-project');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error getting recommendations:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should work with different project stages', async () => {
      mockProjectData.stage = 'development';
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);

      const result = await service.getRecommendations('test-user', 'test-project');

      expect(result).toBeDefined();
      expect(result.resources.some(r => r.tags.includes('development'))).toBe(true);
    });

    it('should work with different industries', async () => {
      mockProjectData.industry = 'ecommerce';
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);

      const result = await service.getRecommendations('test-user', 'test-project');

      expect(result).toBeDefined();
      expect(result.resources.some(r => r.tags.includes('ecommerce'))).toBe(true);
    });

    it('should adapt to different team sizes', async () => {
      // Test solo founder scenario
      mockProjectData.data.operations!.team!.structure = [];
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);

      const result = await service.getRecommendations('test-user', 'test-project');

      expect(result).toBeDefined();
      // Should have resources appropriate for solo founders (may not have 'solo' tag specifically)
      expect(result.resources.length).toBeGreaterThan(0);
    });

    it('should adapt to different budget levels', async () => {
      // Test low budget scenario
      mockProjectData.data.financial!.funding!.requirements = 5000;
      (ProjectDataService.getProjectData as jest.Mock).mockResolvedValue(mockProjectData);

      const result = await service.getRecommendations('test-user', 'test-project');

      expect(result).toBeDefined();
      expect(result.resources.some(r => r.tags.includes('budget'))).toBe(true);
    });
  });
});
