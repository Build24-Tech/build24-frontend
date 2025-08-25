import { RecommendationEngine } from '@/lib/recommendation-engine';
import { LaunchPhase, ProjectData, ProjectStage, StepStatus, UserProgress } from '@/types/launch-essentials';

describe('RecommendationEngine', () => {
  const mockUserProgress: UserProgress = {
    userId: 'test-user',
    projectId: 'test-project',
    currentPhase: 'validation' as LaunchPhase,
    phases: {
      validation: {
        phase: 'validation' as LaunchPhase,
        steps: [
          { stepId: 'market-research', status: 'completed' as StepStatus, data: { marketSize: 'large' } },
          { stepId: 'competitor-analysis', status: 'in_progress' as StepStatus, data: {} },
          { stepId: 'user-validation', status: 'not_started' as StepStatus, data: {} }
        ],
        completionPercentage: 33,
        startedAt: new Date()
      },
      definition: {
        phase: 'definition' as LaunchPhase,
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      }
    } as any,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProjectData: ProjectData = {
    id: 'test-project',
    userId: 'test-user',
    name: 'Test Project',
    description: 'A test project',
    industry: 'Technology',
    targetMarket: 'Developers',
    stage: 'concept' as ProjectStage,
    data: {
      validation: {
        marketResearch: { marketSize: 'large', growthRate: 15 }
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('getNextSteps', () => {
    it('should recommend next steps based on current progress', () => {
      const recommendations = RecommendationEngine.getNextSteps(mockUserProgress);

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toEqual({
        id: 'complete-competitor-analysis',
        title: 'Complete Competitor Analysis',
        description: 'Finish analyzing your competitors to understand the competitive landscape',
        priority: 'high',
        phase: 'validation',
        estimatedTime: '2-4 hours',
        category: 'immediate'
      });
    });

    it('should recommend phase transition when current phase is complete', () => {
      const completedValidationProgress = {
        ...mockUserProgress,
        phases: {
          ...mockUserProgress.phases,
          validation: {
            ...mockUserProgress.phases.validation,
            completionPercentage: 100,
            steps: [
              { stepId: 'market-research', status: 'completed' as StepStatus, data: {} },
              { stepId: 'competitor-analysis', status: 'completed' as StepStatus, data: {} },
              { stepId: 'user-validation', status: 'completed' as StepStatus, data: {} }
            ]
          }
        }
      };

      const recommendations = RecommendationEngine.getNextSteps(completedValidationProgress);

      expect(recommendations).toContainEqual(
        expect.objectContaining({
          id: 'start-definition-phase',
          title: 'Start Product Definition Phase',
          phase: 'definition',
          category: 'phase-transition'
        })
      );
    });

    it('should handle empty progress gracefully', () => {
      const emptyProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {} as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const recommendations = RecommendationEngine.getNextSteps(emptyProgress);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toEqual({
        id: 'start-validation',
        title: 'Start Product Validation',
        description: 'Begin validating your product idea with market research',
        priority: 'high',
        phase: 'validation',
        estimatedTime: '1-2 hours',
        category: 'getting-started'
      });
    });
  });

  describe('suggestResources', () => {
    it('should suggest relevant resources based on project context', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        industry: 'Technology',
        targetMarket: 'Developers',
        currentStep: 'market-research'
      };

      const resources = RecommendationEngine.suggestResources(context);

      expect(resources).toContainEqual(
        expect.objectContaining({
          id: 'market-research-guide',
          title: 'Market Research for Tech Products',
          type: 'guide',
          category: 'validation',
          relevanceScore: expect.any(Number)
        })
      );

      expect(resources).toContainEqual(
        expect.objectContaining({
          id: 'developer-survey-tools',
          title: 'Developer Survey Tools',
          type: 'tool',
          category: 'validation'
        })
      );
    });

    it('should prioritize resources by relevance score', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        industry: 'Technology',
        targetMarket: 'Developers',
        currentStep: 'competitor-analysis'
      };

      const resources = RecommendationEngine.suggestResources(context);

      // Resources should be sorted by relevance score (descending)
      for (let i = 0; i < resources.length - 1; i++) {
        expect(resources[i].relevanceScore).toBeGreaterThanOrEqual(resources[i + 1].relevanceScore);
      }
    });

    it('should limit number of suggested resources', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        industry: 'Technology',
        targetMarket: 'Developers',
        currentStep: 'market-research'
      };

      const resources = RecommendationEngine.suggestResources(context, 3);

      expect(resources).toHaveLength(3);
    });
  });

  describe('identifyRisks', () => {
    it('should identify risks based on project data', () => {
      const risks = RecommendationEngine.identifyRisks(mockProjectData, mockUserProgress);

      expect(risks).toContainEqual(
        expect.objectContaining({
          id: 'incomplete-validation',
          title: 'Incomplete Market Validation',
          description: 'Validation phase is not complete, which may lead to building the wrong product',
          severity: 'medium',
          category: 'validation',
          impact: 'Product-market fit issues'
        })
      );
    });

    it('should identify technical risks for tech projects', () => {
      const techProject = {
        ...mockProjectData,
        industry: 'Technology',
        data: {
          technical: {
            complexity: 'high',
            teamExperience: 'low'
          }
        }
      };

      const risks = RecommendationEngine.identifyRisks(techProject, mockUserProgress);

      expect(risks).toContainEqual(
        expect.objectContaining({
          id: 'technical-complexity',
          title: 'High Technical Complexity',
          severity: 'high',
          category: 'technical'
        })
      );
    });

    it('should identify market risks based on validation data', () => {
      const projectWithSmallMarket = {
        ...mockProjectData,
        data: {
          validation: {
            marketResearch: { marketSize: 'small', growthRate: -5 }
          }
        }
      };

      const risks = RecommendationEngine.identifyRisks(projectWithSmallMarket, mockUserProgress);

      expect(risks).toContainEqual(
        expect.objectContaining({
          id: 'small-market-size',
          title: 'Limited Market Size',
          severity: 'high',
          category: 'market'
        })
      );
    });

    it('should prioritize risks by severity', () => {
      const risks = RecommendationEngine.identifyRisks(mockProjectData, mockUserProgress);

      const severityOrder = ['high', 'medium', 'low'];
      for (let i = 0; i < risks.length - 1; i++) {
        const currentIndex = severityOrder.indexOf(risks[i].severity);
        const nextIndex = severityOrder.indexOf(risks[i + 1].severity);
        expect(currentIndex).toBeLessThanOrEqual(nextIndex);
      }
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should provide personalized recommendations based on user behavior', () => {
      const userBehavior = {
        completedPhases: ['validation'],
        averageTimePerStep: 120, // minutes
        preferredWorkingHours: 'evening',
        strugglingAreas: ['financial-planning']
      };

      const recommendations = RecommendationEngine.getPersonalizedRecommendations(
        mockUserProgress,
        mockProjectData,
        userBehavior
      );

      expect(recommendations).toContainEqual(
        expect.objectContaining({
          id: 'financial-planning-help',
          title: 'Financial Planning Assistance',
          description: expect.stringContaining('struggling'),
          category: 'personalized'
        })
      );
    });

    it('should suggest time management based on user patterns', () => {
      const userBehavior = {
        completedPhases: [],
        averageTimePerStep: 300, // 5 hours - very slow
        preferredWorkingHours: 'morning',
        strugglingAreas: []
      };

      const recommendations = RecommendationEngine.getPersonalizedRecommendations(
        mockUserProgress,
        mockProjectData,
        userBehavior
      );

      expect(recommendations).toContainEqual(
        expect.objectContaining({
          id: 'time-management',
          title: 'Time Management Tips',
          category: 'productivity'
        })
      );
    });
  });

  describe('getContentSuggestions', () => {
    it('should suggest relevant content based on current context', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        step: 'market-research',
        industry: 'Technology',
        userInput: 'mobile app for developers'
      };

      const suggestions = RecommendationEngine.getContentSuggestions(context);

      expect(suggestions).toContainEqual(
        expect.objectContaining({
          id: 'mobile-app-market-research',
          title: 'Mobile App Market Research Template',
          type: 'template',
          relevanceScore: expect.any(Number)
        })
      );

      expect(suggestions).toContainEqual(
        expect.objectContaining({
          id: 'developer-tools-analysis',
          title: 'Developer Tools Market Analysis',
          type: 'example'
        })
      );
    });

    it('should handle empty or minimal context', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        step: 'market-research'
      };

      const suggestions = RecommendationEngine.getContentSuggestions(context);

      expect(suggestions).toHaveLength(0);
    });

    it('should rank suggestions by relevance', () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        step: 'market-research',
        industry: 'Technology',
        userInput: 'AI-powered mobile app for developers'
      };

      const suggestions = RecommendationEngine.getContentSuggestions(context);

      // Should be sorted by relevance score
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].relevanceScore).toBeGreaterThanOrEqual(suggestions[i + 1].relevanceScore);
      }
    });
  });

  describe('calculateRecommendationScore', () => {
    it('should calculate accurate recommendation scores', () => {
      const recommendation = {
        id: 'test-rec',
        title: 'Test Recommendation',
        description: 'A test recommendation',
        priority: 'high' as const,
        phase: 'validation' as LaunchPhase,
        category: 'immediate' as const
      };

      const context = {
        currentPhase: 'validation' as LaunchPhase,
        completionPercentage: 50,
        urgentAreas: ['validation'],
        userPreferences: { focusAreas: ['market-research'] }
      };

      const score = RecommendationEngine.calculateRecommendationScore(recommendation, context);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores to urgent recommendations', () => {
      const urgentRec = {
        id: 'urgent-rec',
        title: 'Urgent Recommendation',
        description: 'An urgent recommendation',
        priority: 'high' as const,
        phase: 'validation' as LaunchPhase,
        category: 'immediate' as const
      };

      const normalRec = {
        id: 'normal-rec',
        title: 'Normal Recommendation',
        description: 'A normal recommendation',
        priority: 'low' as const,
        phase: 'validation' as LaunchPhase,
        category: 'future' as const
      };

      const context = {
        currentPhase: 'validation' as LaunchPhase,
        completionPercentage: 50,
        urgentAreas: ['validation'],
        userPreferences: {}
      };

      const urgentScore = RecommendationEngine.calculateRecommendationScore(urgentRec, context);
      const normalScore = RecommendationEngine.calculateRecommendationScore(normalRec, context);

      expect(urgentScore).toBeGreaterThan(normalScore);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null or undefined inputs gracefully', () => {
      expect(() => {
        RecommendationEngine.getNextSteps(null as any);
      }).not.toThrow();

      expect(() => {
        RecommendationEngine.suggestResources(null as any);
      }).not.toThrow();

      expect(() => {
        RecommendationEngine.identifyRisks(null as any, null as any);
      }).not.toThrow();
    });

    it('should handle malformed data structures', () => {
      const malformedProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'invalid-phase' as any,
        phases: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        RecommendationEngine.getNextSteps(malformedProgress);
      }).not.toThrow();
    });

    it('should return empty arrays for invalid inputs', () => {
      const recommendations = RecommendationEngine.getNextSteps({} as any);
      const resources = RecommendationEngine.suggestResources({} as any);
      const risks = RecommendationEngine.identifyRisks({} as any, {} as any);

      expect(recommendations).toEqual([]);
      expect(resources).toEqual([]);
      expect(risks).toEqual([]);
    });
  });
});
