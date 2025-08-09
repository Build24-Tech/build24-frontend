import { LaunchEssentialsUtils } from '@/lib/launch-essentials-firestore';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import { calculateFinancialProjection } from '@/lib/financial-planning-utils';
import { LaunchPhase, ProjectData, ProjectStage, UserProgress } from '@/types/launch-essentials';

// Performance testing utilities
const measurePerformance = async (fn: () => Promise<any> | any, iterations = 100) => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
  };
};

const generateLargeUserProgress = (phases: number = stepsPerPhase: number = 10): UserProgress => {
  const phaseNames: LaunchPhase[] = ['validation', 'definition', 'technical', 'marketing', 'operations', 'financial', 'risk', 'optimization'];
  const phases_data: any = {};

  for (let i = 0; i < phases; i++) {
    const phaseName = phaseNames[i] || `phase${i}` as LaunchPhase;
    phases_data[phaseName] = {
      phase: phaseName,
      steps: Array.from({ length: stepsPerPhase }, (_, j) => ({
        stepId: `step${j}`,
        status: Math.random() > 0.5 ? 'completed' : 'in_progress',
        data: {
          field1: `value${j}`,
          field2: Math.random() * 100,
          field3: Array.from({ length: 10 }, (_, k) => `item${k}`)
        }
      })),
      completionPercentage: Math.floor(Math.random() * 100),
      startedAt: new Date()
    };
  }

  return {
    userId: 'perf-test-user',
    projectId: 'perf-test-project',
    currentPhase: 'validation',
    phases: phases_data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

const generateLargeProjectData = (dataSize: number = 1000): ProjectData => {
  return {
    id: 'perf-test-project',
    userId: 'perf-test-user',
    name: 'Performance Test Project',
    description: 'A project for performance testing',
    industry: 'Technology',
    targetMarket: 'Developers',
    stage: 'concept' as ProjectStage,
    data: {
      validation: {
        marketResearch: {
          data: Array.from({ length: dataSize }, (_, i) => ({
            id: i,
            value: `market_data_${i}`,
            metrics: Array.from({ length: 10 }, (_, j) => Math.random() * 100)
          }))
        }
      },
      definition: {
        features: Array.from({ length: dataSize }, (_, i) => ({
          id: i,
          name: `feature_${i}`,
          priority: Math.floor(Math.random() * 5),
          complexity: Math.floor(Math.random() * 10)
        }))
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

describe('Performance Tests', () => {
  describe('Data Processing Performance', () => {
    it('should calculate overall progress efficiently with large datasets', async () => {
      const largeProgress = generateLargeUserProgress(8, 50); // 8 phases, 50 steps each

      const performance = await measurePerformance(() => {
        return LaunchEssentialsUtils.calculateOverallProgress(largeProgress);
      }, 1000);

      expect(performance.average).toBeLessThan(5); // Should complete in < 5ms on average
      expect(performance.max).toBeLessThan(20); // No single execution should take > 20ms
    });

    it('should handle progress calculations with varying data sizes', async () => {
      const dataSizes = [10, 50, 100, 500, 1000];
      const results: { size: number; performance: any }[] = [];

      for (const size of dataSizes) {
        const progress = generateLargeUserProgress(8, size);
        const perf = await measurePerformance(() => {
          return LaunchEssentialsUtils.calculateOverallProgress(progress);
        }, 100);

        results.push({ size, performance: perf });
      }

      // Performance should scale linearly or better
      for (let i = 1; i < results.length; i++) {
        const prevResult = results[i - 1];
        const currentResult = results[i];
        const sizeRatio = currentResult.size / prevResult.size;
        const timeRatio = currentResult.performance.average / prevResult.performance.average;

        // Time increase should not be more than 2x the size increase
        expect(timeRatio).toBeLessThan(sizeRatio * 2);
      }
    });

    it('should validate project data efficiently', async () => {
      const largeProject = generateLargeProjectData(1000);

      const performance = await measurePerformance(() => {
        return LaunchEssentialsUtils.validateProjectData(largeProject);
      }, 100);

      expect(performance.average).toBeLessThan(10); // Should complete in < 10ms on average
    });

    it('should generate project summaries quickly', async () => {
      const largeProject = generateLargeProjectData(500);
      const largeProgress = generateLargeUserProgress(8, 25);

      const performance = await measurePerformance(() => {
        return LaunchEssentialsUtils.generateProjectSummary(largeProject, largeProgress);
      }, 100);

      expect(performance.average).toBeLessThan(15); // Should complete in < 15ms on average
    });
  });

  describe('Recommendation Engine Performance', () => {
    it('should generate recommendations efficiently', async () => {
      const largeProgress = generateLargeUserProgress(8, 30);

      const performance = await measurePerformance(() => {
        return RecommendationEngine.getNextSteps(largeProgress);
      }, 100);

      expect(performance.average).toBeLessThan(20); // Should complete in < 20ms on average
    });

    it('should suggest resources without performance degradation', async () => {
      const context = {
        phase: 'validation' as LaunchPhase,
        industry: 'Technology',
        targetMarket: 'Developers',
        currentStep: 'market-research'
      };

      const performance = await measurePerformance(() => {
        return RecommendationEngine.suggestResources(context, 50); // Request 50 resources
      }, 100);

      expect(performance.average).toBeLessThan(25); // Should complete in < 25ms on average
    });

    it('should identify risks efficiently with large datasets', async () => {
      const largeProject = generateLargeProjectData(1000);
      const largeProgress = generateLargeUserProgress(8, 50);

      const performance = await measurePerformance(() => {
        return RecommendationEngine.identifyRisks(largeProject, largeProgress);
      }, 100);

      expect(performance.average).toBeLessThan(30); // Should complete in < 30ms on average
    });

    it('should handle concurrent recommendation requests', async () => {
      const largeProgress = generateLargeUserProgress(8, 20);
      const concurrentRequests = 10;

      const startTime = performance.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        RecommendationEngine.getNextSteps(largeProgress)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Concurrent requests should not take significantly longer than sequential
      expect(totalTime).toBeLessThan(200); // Should complete all in < 200ms
    });
  });

  describe('Financial Calculations Performance', () => {
    it('should calculate financial projections efficiently', async () => {
      const largeFinancialData = {
        timeframe: 'monthly' as const,
        periods: 60, // 5 years of monthly data
        startingCash: 100000,
        revenue: Array.from({ length: 60 }, (_, i) => 10000 + (i * 500)),
        expenses: Array.from({ length: 60 }, (_, i) => 8000 + (i * 200)),
        growthRate: 0.05,
        churnRate: 0.02
      };

      const performance = await measurePerformance(() => {
        return calculateFinancialProjection(largeFinancialData);
      }, 100);

      expect(performance.average).toBeLessThan(15); // Should complete in < 15ms on average
    });

    it('should handle complex financial models', async () => {
      const complexModel = {
        timeframe: 'monthly' as const,
        periods: 120, // 10 years
        startingCash: 500000,
        revenue: Array.from({ length: 120 }, (_, i) => {
          // Complex revenue model with seasonality
          const base = 20000;
          const growth = i * 1000;
          const seasonality = Math.sin((i % 12) * Math.PI / 6) * 5000;
          return base + growth + seasonality;
        }),
        expenses: Array.from({ length: 120 }, (_, i) => {
          // Complex expense model
          const fixed = 15000;
          const variable = i * 500;
          const oneTime = (i % 12 === 0) ? 10000 : 0; // Annual expenses
          return fixed + variable + oneTime;
        }),
        scenarios: ['optimistic', 'realistic', 'pessimistic']
      };

      const performance = await measurePerformance(() => {
        return calculateFinancialProjection(complexModel);
      }, 50);

      expect(performance.average).toBeLessThan(50); // Should complete in < 50ms on average
    });
  });

  describe('Memory Usage and Garbage Collection', () => {
    it('should not cause memory leaks with repeated operations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many operations that could potentially leak memory
      for (let i = 0; i < 1000; i++) {
        const progress = generateLargeUserProgress(8, 10);
        LaunchEssentialsUtils.calculateOverallProgress(progress);

        const project = generateLargeProjectData(100);
        LaunchEssentialsUtils.validateProjectData(project);

        RecommendationEngine.getNextSteps(progress);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large object creation and cleanup', async () => {
      const createLargeObjects = () => {
        const objects = [];
        for (let i = 0; i < 100; i++) {
          objects.push(generateLargeProjectData(1000));
        }
        return objects;
      };

      const performance = await measurePerformance(() => {
        const objects = createLargeObjects();
        // Process objects
        objects.forEach(obj => LaunchEssentialsUtils.validateProjectData(obj));
        // Objects should be eligible for GC after this
      }, 10);

      expect(performance.average).toBeLessThan(500); // Should complete in < 500ms on average
    });
  });

  describe('UI Responsiveness Simulation', () => {
    it('should maintain 60fps during heavy calculations', async () => {
      const frameTime = 16.67; // 60fps = 16.67ms per frame
      let frameCount = 0;
      let totalFrameTime = 0;

      const simulateFrameLoop = async () => {
        const frameStart = performance.now();

        // Simulate typical UI operations during heavy calculation
        const progress = generateLargeUserProgress(8, 20);
        LaunchEssentialsUtils.calculateOverallProgress(progress);
        RecommendationEngine.getNextSteps(progress);

        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;

        totalFrameTime += frameTime;
        frameCount++;

        return frameTime;
      };

      // Simulate 60 frames (1 second at 60fps)
      const frameTimes = [];
      for (let i = 0; i < 60; i++) {
        const frameTime = await simulateFrameLoop();
        frameTimes.push(frameTime);
      }

      const averageFrameTime = totalFrameTime / frameCount;
      const droppedFrames = frameTimes.filter(time => time > frameTime).length;

      expect(averageFrameTime).toBeLessThan(frameTime); // Average should be under 16.67ms
      expect(droppedFrames).toBeLessThan(6); // Less than 10% dropped frames
    });

    it('should handle user interactions without blocking', async () => {
      const simulateUserInteraction = async () => {
        const interactionStart = performance.now();

        // Simulate user clicking through phases while calculations happen
        const progress = generateLargeUserProgress(8, 30);
        const project = generateLargeProjectData(500);

        // These operations should not block user interactions
        LaunchEssentialsUtils.calculateOverallProgress(progress);
        LaunchEssentialsUtils.generateProjectSummary(project, progress);
        RecommendationEngine.getNextSteps(progress);

        const interactionEnd = performance.now();
        return interactionEnd - interactionStart;
      };

      const performance = await measurePerformance(simulateUserInteraction, 50);

      // User interactions should feel responsive (< 100ms)
      expect(performance.average).toBeLessThan(100);
      expect(performance.max).toBeLessThan(200);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle increasing user counts efficiently', async () => {
      const userCounts = [1, 10, 50, 100, 500];
      const results: { users: number; time: number }[] = [];

      for (const userCount of userCounts) {
        const startTime = performance.now();

        // Simulate operations for multiple users
        const promises = Array.from({ length: userCount }, (_, i) => {
          const progress = generateLargeUserProgress(8, 10);
          progress.userId = `user${i}`;
          return LaunchEssentialsUtils.calculateOverallProgress(progress);
        });

        await Promise.all(promises);

        const endTime = performance.now();
        results.push({ users: userCount, time: endTime - startTime });
      }

      // Performance should scale reasonably with user count
      for (let i = 1; i < results.length; i++) {
        const prevResult = results[i - 1];
        const currentResult = results[i];
        const userRatio = currentResult.users / prevResult.users;
        const timeRatio = currentResult.time / prevResult.time;

        // Time increase should not be more than 1.5x the user increase
        expect(timeRatio).toBeLessThan(userRatio * 1.5);
      }
    });

    it('should handle large project portfolios', async () => {
      const portfolioSizes = [10, 50, 100, 200];

      for (const size of portfolioSizes) {
        const projects = Array.from({ length: size }, (_, i) =>
          generateLargeProjectData(100)
        );

        const startTime = performance.now();

        // Process entire portfolio
        projects.forEach(project => {
          LaunchEssentialsUtils.validateProjectData(project);
        });

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // Should process 200 projects in under 2 seconds
        if (size === 200) {
          expect(processingTime).toBeLessThan(2000);
        }
      }
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle empty data structures efficiently', async () => {
      const emptyProgress: UserProgress = {
        userId: 'empty-user',
        projectId: 'empty-project',
        currentPhase: 'validation',
        phases: {} as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const performance = await measurePerformance(() => {
        LaunchEssentialsUtils.calculateOverallProgress(emptyProgress);
        RecommendationEngine.getNextSteps(emptyProgress);
      }, 1000);

      expect(performance.average).toBeLessThan(1); // Should be very fast for empty data
    });

    it('should handle malformed data without performance degradation', async () => {
      const malformedData = {
        userId: null,
        projectId: undefined,
        currentPhase: 'invalid-phase',
        phases: null,
        createdAt: 'invalid-date',
        updatedAt: new Date()
      } as any;

      const performance = await measurePerformance(() => {
        try {
          LaunchEssentialsUtils.calculateOverallProgress(malformedData);
          RecommendationEngine.getNextSteps(malformedData);
        } catch (error) {
          // Expected to handle errors gracefully
        }
      }, 100);

      expect(performance.average).toBeLessThan(5); // Should fail fast
    });
  });
});
