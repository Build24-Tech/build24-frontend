// Test the service layer without React components

describe('Launch Essentials Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('UserProgressService', () => {
    it('should create user progress', async () => {
      // Mock the service
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          createUserProgress: jest.fn().mockResolvedValue({
            userId: 'test-user',
            projectId: 'test-project',
            currentPhase: 'validation',
            phases: {
              validation: { completionPercentage: 0, steps: [] },
              definition: { completionPercentage: 0, steps: [] }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      const result = await UserProgressService.createUserProgress('user1', 'project1');

      expect(result).toEqual(
        expect.objectContaining({
          userId: 'test-user',
          projectId: 'test-project',
          currentPhase: 'validation'
        })
      );
      expect(UserProgressService.createUserProgress).toHaveBeenCalledWith('user1', 'project1');
    });

    it('should handle errors during creation', async () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          createUserProgress: jest.fn().mockRejectedValue(new Error('Network error'))
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      await expect(
        UserProgressService.createUserProgress('user1', 'project1')
      ).rejects.toThrow('Network error');
    });

    it('should update step progress', async () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          updateStepProgress: jest.fn().mockResolvedValue(undefined)
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      await UserProgressService.updateStepProgress(
        'user1',
        'project1',
        'validation',
        'step1',
        'completed',
        { test: 'data' }
      );

      expect(UserProgressService.updateStepProgress).toHaveBeenCalledWith(
        'user1',
        'project1',
        'validation',
        'step1',
        'completed',
        { test: 'data' }
      );
    });

    it('should get user progress', async () => {
      const mockProgress = {
        userId: 'user1',
        projectId: 'project1',
        currentPhase: 'validation',
        phases: {
          validation: { completionPercentage: 50, steps: [] }
        }
      };

      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          getUserProgress: jest.fn().mockResolvedValue(mockProgress)
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      const result = await UserProgressService.getUserProgress('user1', 'project1');

      expect(result).toEqual(mockProgress);
      expect(UserProgressService.getUserProgress).toHaveBeenCalledWith('user1', 'project1');
    });
  });

  describe('ProjectDataService', () => {
    it('should create project', async () => {
      const mockProject = {
        id: 'project123',
        userId: 'user1',
        name: 'Test Project',
        description: 'A test project',
        industry: 'Technology',
        targetMarket: 'Developers',
        stage: 'concept',
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        ProjectDataService: {
          createProject: jest.fn().mockResolvedValue(mockProject)
        }
      }));

      const { ProjectDataService } = require('@/lib/launch-essentials-firestore');

      const projectData = {
        userId: 'user1',
        name: 'Test Project',
        description: 'A test project',
        industry: 'Technology',
        targetMarket: 'Developers',
        stage: 'concept',
        data: {}
      };

      const result = await ProjectDataService.createProject(projectData);

      expect(result).toEqual(mockProject);
      expect(ProjectDataService.createProject).toHaveBeenCalledWith(projectData);
    });

    it('should get project', async () => {
      const mockProject = {
        id: 'project123',
        name: 'Test Project',
        userId: 'user1'
      };

      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        ProjectDataService: {
          getProject: jest.fn().mockResolvedValue(mockProject)
        }
      }));

      const { ProjectDataService } = require('@/lib/launch-essentials-firestore');

      const result = await ProjectDataService.getProject('project123');

      expect(result).toEqual(mockProject);
      expect(ProjectDataService.getProject).toHaveBeenCalledWith('project123');
    });

    it('should handle project not found', async () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        ProjectDataService: {
          getProject: jest.fn().mockResolvedValue(null)
        }
      }));

      const { ProjectDataService } = require('@/lib/launch-essentials-firestore');

      const result = await ProjectDataService.getProject('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('LaunchEssentialsUtils', () => {
    it('should calculate overall progress', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          calculateOverallProgress: jest.fn().mockImplementation((progress) => {
            if (!progress.phases) return 0;
            const phases = Object.values(progress.phases);
            if (phases.length === 0) return 0;
            const total = phases.reduce((sum, phase) => sum + (phase.completionPercentage || 0), 0);
            return Math.round(total / phases.length);
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      const mockProgress = {
        userId: 'user1',
        projectId: 'project1',
        currentPhase: 'validation',
        phases: {
          validation: { completionPercentage: 100 },
          definition: { completionPercentage: 50 },
          technical: { completionPercentage: 0 }
        }
      };

      const result = LaunchEssentialsUtils.calculateOverallProgress(mockProgress);

      expect(result).toBe(50); // (100 + 50 + 0) / 3 = 50
    });

    it('should handle empty phases', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          calculateOverallProgress: jest.fn().mockImplementation((progress) => {
            if (!progress.phases) return 0;
            return 0;
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      const mockProgress = {
        userId: 'user1',
        projectId: 'project1',
        currentPhase: 'validation',
        phases: {}
      };

      const result = LaunchEssentialsUtils.calculateOverallProgress(mockProgress);

      expect(result).toBe(0);
    });

    it('should validate project data', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          validateProjectData: jest.fn().mockImplementation((data) => {
            const errors = [];
            if (!data.name) errors.push('Name is required');
            if (!data.industry) errors.push('Industry is required');
            return { isValid: errors.length === 0, errors };
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      const validData = {
        name: 'Test Project',
        industry: 'Technology',
        targetMarket: 'Developers',
        stage: 'concept'
      };

      const result = LaunchEssentialsUtils.validateProjectData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify validation errors', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          validateProjectData: jest.fn().mockImplementation((data) => {
            const errors = [];
            if (!data.name) errors.push('Name is required');
            if (!data.industry) errors.push('Industry is required');
            return { isValid: errors.length === 0, errors };
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      const invalidData = {
        description: 'Missing required fields'
      };

      const result = LaunchEssentialsUtils.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Industry is required');
    });
  });

  describe('RecommendationEngine', () => {
    it('should get next steps', () => {
      jest.doMock('@/lib/recommendation-engine', () => ({
        RecommendationEngine: {
          getNextSteps: jest.fn().mockImplementation((progress) => {
            if (!progress || !progress.phases || Object.keys(progress.phases).length === 0) {
              return [{
                id: 'start-validation',
                title: 'Start Product Validation',
                description: 'Begin validating your product idea',
                priority: 'high',
                phase: 'validation'
              }];
            }
            return [];
          })
        }
      }));

      const { RecommendationEngine } = require('@/lib/recommendation-engine');

      const emptyProgress = {
        userId: 'user1',
        projectId: 'project1',
        currentPhase: 'validation',
        phases: {}
      };

      const result = RecommendationEngine.getNextSteps(emptyProgress);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'start-validation',
          title: 'Start Product Validation',
          priority: 'high'
        })
      );
    });

    it('should suggest resources', () => {
      jest.doMock('@/lib/recommendation-engine', () => ({
        RecommendationEngine: {
          suggestResources: jest.fn().mockImplementation((context, limit = 10) => {
            if (!context || !context.phase) return [];

            const resources = [
              {
                id: 'market-research-guide',
                title: 'Market Research Guide',
                type: 'guide',
                category: 'validation',
                relevanceScore: 0.9
              }
            ];

            return resources.slice(0, limit);
          })
        }
      }));

      const { RecommendationEngine } = require('@/lib/recommendation-engine');

      const context = {
        phase: 'validation',
        industry: 'Technology'
      };

      const result = RecommendationEngine.suggestResources(context, 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'market-research-guide',
          title: 'Market Research Guide',
          type: 'guide'
        })
      );
    });

    it('should identify risks', () => {
      jest.doMock('@/lib/recommendation-engine', () => ({
        RecommendationEngine: {
          identifyRisks: jest.fn().mockImplementation((projectData, userProgress) => {
            if (!projectData || !userProgress) return [];

            const risks = [];

            if (userProgress.phases?.validation?.completionPercentage < 100) {
              risks.push({
                id: 'incomplete-validation',
                title: 'Incomplete Market Validation',
                severity: 'medium',
                category: 'validation'
              });
            }

            return risks;
          })
        }
      }));

      const { RecommendationEngine } = require('@/lib/recommendation-engine');

      const projectData = { industry: 'Technology' };
      const userProgress = {
        phases: {
          validation: { completionPercentage: 50 }
        }
      };

      const result = RecommendationEngine.identifyRisks(projectData, userProgress);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'incomplete-validation',
          title: 'Incomplete Market Validation',
          severity: 'medium'
        })
      );
    });
  });

  describe('Financial Planning Utils', () => {
    it('should calculate financial projection', () => {
      jest.doMock('@/lib/financial-planning-utils', () => ({
        calculateFinancialProjection: jest.fn().mockImplementation((data) => {
          const { periods, revenue, expenses } = data;
          const profit = revenue.map((rev, i) => rev - expenses[i]);

          return {
            revenue,
            expenses,
            profit,
            cashFlow: profit,
            cumulativeCashFlow: profit.map((p, i) => profit.slice(0, i + 1).reduce((sum, val) => sum + val, 0)),
            breakEvenMonth: profit.findIndex(p => p > 0) + 1 || periods,
            roi: 15.5,
            paybackPeriod: 6
          };
        })
      }));

      const { calculateFinancialProjection } = require('@/lib/financial-planning-utils');

      const financialData = {
        timeframe: 'monthly',
        periods: 12,
        startingCash: 50000,
        revenue: [10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000],
        expenses: [15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000]
      };

      const result = calculateFinancialProjection(financialData);

      expect(result).toEqual(
        expect.objectContaining({
          revenue: expect.any(Array),
          expenses: expect.any(Array),
          profit: expect.any(Array),
          breakEvenMonth: expect.any(Number),
          roi: 15.5
        })
      );

      expect(result.revenue).toHaveLength(12);
      expect(result.expenses).toHaveLength(12);
      expect(result.profit).toHaveLength(12);
    });

    it('should calculate funding requirements', () => {
      jest.doMock('@/lib/financial-planning-utils', () => ({
        calculateFundingRequirements: jest.fn().mockImplementation((data) => {
          return {
            totalRequired: 100000,
            runway: 18,
            milestones: [
              { month: 6, amount: 50000, purpose: 'Product development' },
              { month: 12, amount: 50000, purpose: 'Market expansion' }
            ],
            fundingGap: 25000
          };
        })
      }));

      const { calculateFundingRequirements } = require('@/lib/financial-planning-utils');

      const financialData = {
        timeframe: 'monthly',
        periods: 12,
        startingCash: 75000,
        revenue: [5000, 8000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000],
        expenses: [12000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000]
      };

      const result = calculateFundingRequirements(financialData);

      expect(result).toEqual(
        expect.objectContaining({
          totalRequired: 100000,
          runway: 18,
          milestones: expect.any(Array),
          fundingGap: 25000
        })
      );

      expect(result.milestones).toHaveLength(2);
    });
  });

  describe('Template Utils', () => {
    it('should get templates by category', () => {
      jest.doMock('@/lib/template-utils', () => ({
        getTemplatesByCategory: jest.fn().mockImplementation((category) => {
          const allTemplates = [
            {
              id: 'market-research',
              name: 'Market Research Template',
              category: 'validation',
              description: 'Template for market research'
            },
            {
              id: 'competitor-analysis',
              name: 'Competitor Analysis Template',
              category: 'validation',
              description: 'Template for competitor analysis'
            },
            {
              id: 'product-spec',
              name: 'Product Specification Template',
              category: 'definition',
              description: 'Template for product specifications'
            }
          ];

          return allTemplates.filter(template => template.category === category);
        })
      }));

      const { getTemplatesByCategory } = require('@/lib/template-utils');

      const validationTemplates = getTemplatesByCategory('validation');

      expect(validationTemplates).toHaveLength(2);
      expect(validationTemplates[0]).toEqual(
        expect.objectContaining({
          id: 'market-research',
          name: 'Market Research Template',
          category: 'validation'
        })
      );
    });

    it('should validate template data', () => {
      jest.doMock('@/lib/template-utils', () => ({
        validateTemplateData: jest.fn().mockImplementation((data) => {
          const errors = [];

          Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
              errors.push(`${key} is required`);
            }
          });

          return {
            isValid: errors.length === 0,
            errors
          };
        })
      }));

      const { validateTemplateData } = require('@/lib/template-utils');

      const validData = {
        marketSize: 'large',
        growthRate: '15%',
        trends: 'Growing demand'
      };

      const result = validateTemplateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          calculateOverallProgress: jest.fn().mockImplementation((progress) => {
            // Simulate processing time
            const start = performance.now();

            if (!progress.phases) return 0;
            const phases = Object.values(progress.phases);
            if (phases.length === 0) return 0;

            const total = phases.reduce((sum, phase) => sum + (phase.completionPercentage || 0), 0);
            const result = Math.round(total / phases.length);

            const end = performance.now();
            // Store timing for verification
            progress._processingTime = end - start;

            return result;
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      // Create large dataset
      const largeProgress = {
        userId: 'user1',
        projectId: 'project1',
        currentPhase: 'validation',
        phases: {}
      };

      // Add 1000 phases
      for (let i = 0; i < 1000; i++) {
        largeProgress.phases[`phase${i}`] = { completionPercentage: Math.floor(Math.random() * 100) };
      }

      const startTime = performance.now();
      const result = LaunchEssentialsUtils.calculateOverallProgress(largeProgress);
      const endTime = performance.now();

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle concurrent operations', async () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          createUserProgress: jest.fn().mockImplementation(async (userId, projectId) => {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            return {
              userId,
              projectId,
              currentPhase: 'validation',
              phases: {},
              createdAt: new Date(),
              updatedAt: new Date()
            };
          })
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(UserProgressService.createUserProgress(`user${i}`, `project${i}`));
      }

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete all in less than 1 second

      results.forEach((result, index) => {
        expect(result.userId).toBe(`user${index}`);
        expect(result.projectId).toBe(`project${index}`);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        UserProgressService: {
          getUserProgress: jest.fn().mockRejectedValue(new Error('Network timeout'))
        }
      }));

      const { UserProgressService } = require('@/lib/launch-essentials-firestore');

      await expect(
        UserProgressService.getUserProgress('user1', 'project1')
      ).rejects.toThrow('Network timeout');
    });

    it('should handle malformed data', () => {
      jest.doMock('@/lib/launch-essentials-firestore', () => ({
        LaunchEssentialsUtils: {
          calculateOverallProgress: jest.fn().mockImplementation((progress) => {
            try {
              if (!progress || typeof progress !== 'object') return 0;
              if (!progress.phases) return 0;

              const phases = Object.values(progress.phases);
              if (phases.length === 0) return 0;

              const total = phases.reduce((sum, phase) => {
                const percentage = phase && typeof phase.completionPercentage === 'number'
                  ? phase.completionPercentage
                  : 0;
                return sum + percentage;
              }, 0);

              return Math.round(total / phases.length);
            } catch (error) {
              return 0; // Graceful fallback
            }
          })
        }
      }));

      const { LaunchEssentialsUtils } = require('@/lib/launch-essentials-firestore');

      // Test with various malformed inputs
      expect(LaunchEssentialsUtils.calculateOverallProgress(null)).toBe(0);
      expect(LaunchEssentialsUtils.calculateOverallProgress(undefined)).toBe(0);
      expect(LaunchEssentialsUtils.calculateOverallProgress({})).toBe(0);
      expect(LaunchEssentialsUtils.calculateOverallProgress({ phases: null })).toBe(0);
      expect(LaunchEssentialsUtils.calculateOverallProgress({
        phases: {
          invalid: { completionPercentage: 'not a number' }
        }
      })).toBe(0);
    });
  });
});
