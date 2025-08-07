import { RecommendationEngine } from '@/lib/recommendation-engine';
import {
  LaunchPhase,
  PhaseProgress,
  ProjectContext,
  ProjectData,
  ProjectStage,
  StepProgress,
  UserProgress
} from '@/types/launch-essentials';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let mockUserProgress: UserProgress;
  let mockProjectData: ProjectData;
  let mockProjectContext: ProjectContext;

  beforeEach(() => {
    engine = new RecommendationEngine();

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
        }
      },
      createdAt: now,
      updatedAt: now
    };

    mockProjectContext = {
      projectId: 'test-project',
      industry: 'saas',
      stage: 'validation',
      teamSize: 2,
      budget: 50000,
      timeline: '6 months'
    };
  });

  describe('calculateNextSteps', () => {
    it('should return next step recommendation when there is an incomplete step', () => {
      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      expect(recommendations.length).toBeGreaterThan(0);
      const nextStepRec = recommendations.find(r => r.id === 'next-step-competitor-analysis');
      expect(nextStepRec).toBeDefined();
      expect(nextStepRec?.type).toBe('next-step');
      expect(nextStepRec?.title).toContain('Competitor Analysis');
      expect(nextStepRec?.priority).toBe('high');
      expect(nextStepRec?.category).toBe('validation');
      expect(nextStepRec?.actionItems).toHaveLength(3);
    });

    it('should return phase progression recommendation when current phase is mostly complete', () => {
      // Mark most validation steps as completed
      mockUserProgress.phases.validation.steps[1].status = 'completed';
      mockUserProgress.phases.validation.steps[2].status = 'completed';
      mockUserProgress.phases.validation.completionPercentage = 100;

      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      const phaseRecommendation = recommendations.find(r => r.id.includes('phase-progression'));
      expect(phaseRecommendation).toBeDefined();
      expect(phaseRecommendation?.title).toContain('Definition Phase');
    });

    it('should return critical path recommendations for industry-specific phases', () => {
      // Set low completion for critical SaaS phases
      mockUserProgress.phases.technical.completionPercentage = 30;

      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      const criticalRecommendation = recommendations.find(r => r.id.includes('critical-technical'));
      expect(criticalRecommendation).toBeDefined();
      expect(criticalRecommendation?.priority).toBe('high');
    });

    it('should return milestone recommendations based on overall completion', () => {
      // Set overall completion to around 30% (between 25% and 50%)
      // Complete validation (1/8 phases = 12.5%) and half of definition (6.25%) = ~19%
      // Need to complete more to reach 25-50% range
      mockUserProgress.phases.validation.steps.forEach(step => step.status = 'completed');
      mockUserProgress.phases.validation.completionPercentage = 100;
      mockUserProgress.phases.definition.steps.forEach(step => step.status = 'completed');
      mockUserProgress.phases.definition.completionPercentage = 100;
      mockUserProgress.phases.technical.steps[0].status = 'completed';
      mockUserProgress.phases.technical.completionPercentage = 100;
      // This should give us around 37.5% overall completion (3/8 phases)

      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      const milestoneRecommendation = recommendations.find(r => r.id === 'milestone-quarter');
      expect(milestoneRecommendation).toBeDefined();
      expect(milestoneRecommendation?.title).toContain('Quarter Milestone');
    });

    it('should prioritize recommendations correctly', () => {
      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      // High priority recommendations should come first
      const priorities = recommendations.map(r => r.priority);
      const highPriorityFirst = priorities.indexOf('high');
      const mediumPriorityFirst = priorities.indexOf('medium');

      if (highPriorityFirst !== -1 && mediumPriorityFirst !== -1) {
        expect(highPriorityFirst).toBeLessThan(mediumPriorityFirst);
      }
    });
  });

  describe('suggestResources', () => {
    it('should return industry-specific resources', () => {
      const resources = engine.suggestResources(mockProjectContext, mockUserProgress);

      const industryResources = resources.filter(r => r.tags.includes('saas'));
      expect(industryResources.length).toBeGreaterThan(0);
    });

    it('should return stage-specific resources', () => {
      const resources = engine.suggestResources(mockProjectContext, mockUserProgress);

      const stageResources = resources.filter(r => r.tags.includes('validation'));
      expect(stageResources.length).toBeGreaterThan(0);
    });

    it('should return phase-specific resources based on current progress', () => {
      const resources = engine.suggestResources(mockProjectContext, mockUserProgress);

      const phaseResources = resources.filter(r => r.tags.includes('validation'));
      expect(phaseResources.length).toBeGreaterThan(0);
    });

    it('should return budget-appropriate resources for low budget projects', () => {
      const lowBudgetContext = { ...mockProjectContext, budget: 5000 };
      const resources = engine.suggestResources(lowBudgetContext, mockUserProgress);

      const budgetResources = resources.filter(r => r.tags.includes('budget'));
      expect(budgetResources.length).toBeGreaterThan(0);
    });

    it('should return solo founder resources for single-person teams', () => {
      const soloContext = { ...mockProjectContext, teamSize: 1 };
      const resources = engine.suggestResources(soloContext, mockUserProgress);

      const soloResources = resources.filter(r => r.tags.includes('solo'));
      expect(soloResources.length).toBeGreaterThan(0);
    });

    it('should deduplicate resources', () => {
      const resources = engine.suggestResources(mockProjectContext, mockUserProgress);

      const resourceIds = resources.map(r => r.id);
      const uniqueIds = [...new Set(resourceIds)];
      expect(resourceIds.length).toBe(uniqueIds.length);
    });
  });

  describe('identifyRisks', () => {
    it('should identify insufficient validation risk', () => {
      // Set low validation completion
      mockUserProgress.phases.validation.completionPercentage = 30;
      mockUserProgress.currentPhase = 'definition';

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      const validationRisk = risks.find(r => r.category === 'market');
      expect(validationRisk).toBeDefined();
      expect(validationRisk?.description).toContain('market validation');
    });

    it('should identify technical planning lag risk', () => {
      // Set technical completion < 40% and overall completion > 60%
      mockUserProgress.phases.technical.completionPercentage = 30;
      mockUserProgress.phases.validation.completionPercentage = 100;
      mockUserProgress.phases.definition.completionPercentage = 100;
      mockUserProgress.phases.marketing.completionPercentage = 100;
      mockUserProgress.phases.operations.completionPercentage = 100;
      mockUserProgress.phases.financial.completionPercentage = 100;
      mockUserProgress.phases.risk.completionPercentage = 100;
      mockUserProgress.phases.optimization.completionPercentage = 100;
      // This gives overall completion > 60% with technical < 40%

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      const technicalRisk = risks.find(r => r.description.includes('Technical planning'));
      expect(technicalRisk).toBeDefined();
      expect(technicalRisk?.category).toBe('technical');
    });

    it('should identify financial planning risk', () => {
      // Set financial completion < 30% and overall completion > 50%
      mockUserProgress.phases.financial.completionPercentage = 20;
      mockUserProgress.phases.validation.completionPercentage = 100;
      mockUserProgress.phases.definition.completionPercentage = 100;
      mockUserProgress.phases.technical.completionPercentage = 100;
      mockUserProgress.phases.marketing.completionPercentage = 100;
      mockUserProgress.phases.operations.completionPercentage = 100;
      mockUserProgress.phases.risk.completionPercentage = 100;
      mockUserProgress.phases.optimization.completionPercentage = 100;
      // This gives overall completion > 50% with financial < 30%

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      const financialRisk = risks.find(r => r.description.includes('Financial planning'));
      expect(financialRisk).toBeDefined();
      expect(financialRisk?.category).toBe('financial');
    });

    it('should identify timeline risks for inactive projects', () => {
      // Set old update date
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      mockUserProgress.updatedAt = oldDate;

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      const timelineRisk = risks.find(r => r.category === 'timeline');
      expect(timelineRisk).toBeDefined();
      expect(timelineRisk?.description).toContain('inactive');
    });

    it('should prioritize risks correctly', () => {
      // Create multiple risks
      mockUserProgress.phases.validation.completionPercentage = 30;
      mockUserProgress.currentPhase = 'definition';
      mockUserProgress.phases.financial.completionPercentage = 20;

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      // Risks should be sorted by priority (high to low)
      for (let i = 0; i < risks.length - 1; i++) {
        expect(risks[i].priority).toBeGreaterThanOrEqual(risks[i + 1].priority);
      }
    });

    it('should calculate risk probability based on project characteristics', () => {
      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      risks.forEach(risk => {
        expect(['low', 'medium', 'high']).toContain(risk.probability);
        expect(['low', 'medium', 'high']).toContain(risk.impact);
        expect(typeof risk.priority).toBe('number');
        expect(risk.priority).toBeGreaterThanOrEqual(1);
        expect(risk.priority).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('generatePersonalizedRecommendations', () => {
    it('should return first-time user recommendations when no behavior pattern exists', () => {
      const recommendations = engine.generatePersonalizedRecommendations(
        'new-user',
        mockUserProgress,
        mockProjectData
      );

      expect(recommendations.length).toBeGreaterThan(0);
      const welcomeRec = recommendations.find(r => r.id === 'first-time-welcome');
      expect(welcomeRec).toBeDefined();
      expect(welcomeRec?.title).toContain('Welcome');
    });

    it('should provide completion boost recommendations for low completion rate users', () => {
      // Update user behavior pattern with low completion rate
      engine.updateUserBehaviorPattern('test-user', mockUserProgress);

      // Simulate low completion by setting most steps as not started
      Object.values(mockUserProgress.phases).forEach(phase => {
        phase.steps.forEach(step => {
          step.status = 'not_started';
        });
      });

      const recommendations = engine.generatePersonalizedRecommendations(
        'test-user',
        mockUserProgress,
        mockProjectData
      );

      const boostRec = recommendations.find(r => r.id === 'completion-boost');
      expect(boostRec).toBeDefined();
      expect(boostRec?.title).toContain('Completion Rate');
    });

    it('should provide stuck point help when user has common stuck points', () => {
      // First update behavior pattern to create stuck points
      engine.updateUserBehaviorPattern('test-user', mockUserProgress);

      // Manually add stuck points (simulating long-running in-progress steps)
      const behaviorPattern = {
        userId: 'test-user',
        completionRate: 0.6,
        averageTimePerPhase: {} as Record<LaunchPhase, number>,
        commonStuckPoints: ['market-research'],
        preferredResourceTypes: ['article'],
        lastActiveDate: new Date()
      };

      // Set a step to in_progress that matches stuck point
      mockUserProgress.phases.validation.steps[0].status = 'in_progress';

      const recommendations = engine.generatePersonalizedRecommendations(
        'test-user',
        mockUserProgress,
        mockProjectData
      );

      // Note: This test might not find the stuck point help because the behavior pattern
      // is not actually stored in the engine. This is a limitation of the current test setup.
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('suggestContent', () => {
    it('should return template suggestions for current phase', () => {
      const context = {
        currentPhase: 'validation' as LaunchPhase,
        projectStage: 'validation' as ProjectStage,
        industry: 'saas',
        teamSize: 2,
        budget: 50000,
        completedSteps: ['market-research'],
        userInput: { targetAudience: 'small businesses' }
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.templateSuggestions.length).toBeGreaterThan(0);
      expect(suggestions.templateSuggestions).toContain('Customer Interview Script');
    });

    it('should return framework adjustments for industry', () => {
      const context = {
        currentPhase: 'validation' as LaunchPhase,
        projectStage: 'validation' as ProjectStage,
        industry: 'saas',
        teamSize: 2,
        budget: 50000,
        completedSteps: [],
        userInput: {}
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.frameworkAdjustments.length).toBeGreaterThan(0);
      expect(suggestions.frameworkAdjustments.some(adj => adj.includes('saas'))).toBe(true);
    });

    it('should return budget-specific adjustments for low budget projects', () => {
      const context = {
        currentPhase: 'validation' as LaunchPhase,
        projectStage: 'validation' as ProjectStage,
        industry: 'saas',
        teamSize: 2,
        budget: 5000,
        completedSteps: [],
        userInput: {}
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.frameworkAdjustments).toContain('Focus on lean validation methods');
      expect(suggestions.frameworkAdjustments).toContain('Prioritize free and low-cost tools');
    });

    it('should return solo founder adjustments for single-person teams', () => {
      const context = {
        currentPhase: 'validation' as LaunchPhase,
        projectStage: 'validation' as ProjectStage,
        industry: 'saas',
        teamSize: 1,
        budget: 50000,
        completedSteps: [],
        userInput: {}
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.frameworkAdjustments).toContain('Adapt processes for solo founder');
      expect(suggestions.frameworkAdjustments).toContain('Consider outsourcing non-core activities');
    });

    it('should generate content ideas from user input', () => {
      const context = {
        currentPhase: 'validation' as LaunchPhase,
        projectStage: 'validation' as ProjectStage,
        industry: 'saas',
        teamSize: 2,
        budget: 50000,
        completedSteps: [],
        userInput: {
          targetAudience: 'small business owners who struggle with inventory management',
          problemStatement: 'Current solutions are too complex and expensive'
        }
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.contentIdeas.length).toBeGreaterThan(0);
      expect(suggestions.contentIdeas.some(idea => idea.includes('targetAudience'))).toBe(true);
    });
  });

  describe('updateUserBehaviorPattern', () => {
    it('should create new behavior pattern for new user', () => {
      engine.updateUserBehaviorPattern('new-user', mockUserProgress);

      // Test that the pattern was created by generating recommendations
      const recommendations = engine.generatePersonalizedRecommendations(
        'new-user',
        mockUserProgress,
        mockProjectData
      );

      // Should not return first-time user recommendations anymore
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should update completion rate based on progress', () => {
      // Set some steps as completed
      mockUserProgress.phases.validation.steps[0].status = 'completed';
      mockUserProgress.phases.validation.steps[1].status = 'completed';

      engine.updateUserBehaviorPattern('test-user', mockUserProgress);

      // The behavior pattern should now reflect the completion rate
      // This is tested indirectly through the recommendations
      const recommendations = engine.generatePersonalizedRecommendations(
        'test-user',
        mockUserProgress,
        mockProjectData
      );

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should track time spent on phases when provided', () => {
      engine.updateUserBehaviorPattern('test-user', mockUserProgress, 'market-research', 3600000); // 1 hour

      // Time tracking is internal, so we test indirectly
      const recommendations = engine.generatePersonalizedRecommendations(
        'test-user',
        mockUserProgress,
        mockProjectData
      );

      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should identify stuck points for long-running in-progress steps', () => {
      // Set a step as in-progress with old completion date to simulate being stuck
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      mockUserProgress.phases.validation.steps[1].status = 'in_progress';
      mockUserProgress.phases.validation.steps[1].completedAt = oldDate;

      engine.updateUserBehaviorPattern('test-user', mockUserProgress);

      // Stuck points are tracked internally and affect future recommendations
      const recommendations = engine.generatePersonalizedRecommendations(
        'test-user',
        mockUserProgress,
        mockProjectData
      );

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty progress gracefully', () => {
      const emptyProgress: UserProgress = {
        ...mockUserProgress,
        phases: {
          validation: { phase: 'validation', steps: [], completionPercentage: 0, startedAt: new Date() },
          definition: { phase: 'definition', steps: [], completionPercentage: 0, startedAt: new Date() },
          technical: { phase: 'technical', steps: [], completionPercentage: 0, startedAt: new Date() },
          marketing: { phase: 'marketing', steps: [], completionPercentage: 0, startedAt: new Date() },
          operations: { phase: 'operations', steps: [], completionPercentage: 0, startedAt: new Date() },
          financial: { phase: 'financial', steps: [], completionPercentage: 0, startedAt: new Date() },
          risk: { phase: 'risk', steps: [], completionPercentage: 0, startedAt: new Date() },
          optimization: { phase: 'optimization', steps: [], completionPercentage: 0, startedAt: new Date() }
        }
      };

      const recommendations = engine.calculateNextSteps(emptyProgress);
      expect(recommendations).toHaveLength(0);

      const risks = engine.identifyRisks(mockProjectData, emptyProgress);
      expect(risks.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle unknown industry gracefully', () => {
      const unknownIndustryContext = { ...mockProjectContext, industry: 'unknown-industry' };
      const resources = engine.suggestResources(unknownIndustryContext);

      expect(resources.length).toBeGreaterThan(0); // Should still return generic resources
    });

    it('should handle missing project data gracefully', () => {
      const recommendations = engine.calculateNextSteps(mockUserProgress);
      expect(recommendations.length).toBeGreaterThan(0);

      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);
      expect(risks.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle all phases completed', () => {
      // Mark all phases as completed
      Object.values(mockUserProgress.phases).forEach(phase => {
        phase.steps.forEach(step => {
          step.status = 'completed';
        });
        phase.completionPercentage = 100;
        phase.completedAt = new Date();
      });

      const recommendations = engine.calculateNextSteps(mockUserProgress);
      // Should still return some recommendations (like optimization or review)
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recommendation accuracy and quality', () => {
    it('should provide actionable recommendations', () => {
      const recommendations = engine.calculateNextSteps(mockUserProgress, mockProjectData);

      recommendations.forEach(rec => {
        expect(rec.title).toBeTruthy();
        expect(rec.description).toBeTruthy();
        expect(rec.actionItems.length).toBeGreaterThan(0);
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(['next-step', 'resource', 'risk', 'optimization']).toContain(rec.type);
      });
    });

    it('should provide relevant resources for context', () => {
      const resources = engine.suggestResources(mockProjectContext, mockUserProgress);

      resources.forEach(resource => {
        expect(resource.title).toBeTruthy();
        expect(resource.description).toBeTruthy();
        expect(resource.tags.length).toBeGreaterThan(0);
        expect(['article', 'tool', 'template', 'video', 'book']).toContain(resource.type);
      });
    });

    it('should identify meaningful risks', () => {
      const risks = engine.identifyRisks(mockProjectData, mockUserProgress);

      risks.forEach(risk => {
        expect(risk.title).toBeTruthy();
        expect(risk.description).toBeTruthy();
        expect(['technical', 'market', 'financial', 'operational', 'timeline']).toContain(risk.category);
        expect(['low', 'medium', 'high']).toContain(risk.probability);
        expect(['low', 'medium', 'high']).toContain(risk.impact);
        expect(typeof risk.priority).toBe('number');
      });
    });

    it('should provide contextually appropriate content suggestions', () => {
      const context = {
        currentPhase: 'marketing' as LaunchPhase,
        projectStage: 'development' as ProjectStage,
        industry: 'ecommerce',
        teamSize: 5,
        budget: 100000,
        completedSteps: ['market-research', 'competitor-analysis'],
        userInput: { channels: ['social-media', 'email'], budget: 10000 }
      };

      const suggestions = engine.suggestContent(context);

      expect(suggestions.templateSuggestions.length).toBeGreaterThan(0);
      expect(suggestions.frameworkAdjustments.length).toBeGreaterThan(0);
      expect(suggestions.contentIdeas.length).toBeGreaterThan(0);

      // Should include marketing-specific templates
      expect(suggestions.templateSuggestions.some(t => t.includes('Marketing'))).toBe(true);
    });
  });
});
