import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { TestDataGenerators } from './test-data-generators';

/**
 * Mock services for consistent testing across the application
 */

export class MockFirebaseService {
  private static userProgressData = new Map<string, UserProgress>();
  private static projectData = new Map<string, ProjectData>();
  private static subscriptions = new Map<string, Function[]>();

  static reset() {
    this.userProgressData.clear();
    this.projectData.clear();
    this.subscriptions.clear();
  }

  static seedTestData() {
    // Seed with some test data
    const testUsers = ['user1', 'user2', 'user3'];

    testUsers.forEach(userId => {
      const projects = TestDataGenerators.generateUserPortfolio(userId, 3);

      projects.forEach(project => {
        this.projectData.set(project.id, project);

        const progress = TestDataGenerators.generateUserProgress({
          userId,
          projectId: project.id,
          completionLevel: 'partial'
        });

        this.userProgressData.set(`${userId}_${project.id}`, progress);
      });
    });
  }

  // User Progress Service Mocks
  static mockUserProgressService = {
    createUserProgress: jest.fn().mockImplementation(async (userId: string, projectId: string, currentPhase?: LaunchPhase) => {
      const progress = TestDataGenerators.generateUserProgress({
        userId,
        projectId,
        currentPhase,
        completionLevel: 'empty'
      });

      MockFirebaseService.userProgressData.set(`${userId}_${projectId}`, progress);
      return progress;
    }),

    getUserProgress: jest.fn().mockImplementation(async (userId: string, projectId: string) => {
      const key = `${userId}_${projectId}`;
      return MockFirebaseService.userProgressData.get(key) || null;
    }),

    updateStepProgress: jest.fn().mockImplementation(async (
      userId: string,
      projectId: string,
      phase: LaunchPhase,
      stepId: string,
      status: string,
      data?: any,
      notes?: string
    ) => {
      const key = `${userId}_${projectId}`;
      const progress = MockFirebaseService.userProgressData.get(key);

      if (progress && progress.phases[phase]) {
        const step = progress.phases[phase].steps.find(s => s.stepId === stepId);
        if (step) {
          step.status = status as any;
          step.data = { ...step.data, ...data };
          step.notes = notes;
          step.completedAt = status === 'completed' ? new Date() : undefined;
        }

        // Recalculate completion percentage
        const completedSteps = progress.phases[phase].steps.filter(s => s.status === 'completed').length;
        const totalSteps = progress.phases[phase].steps.length;
        progress.phases[phase].completionPercentage = Math.round((completedSteps / totalSteps) * 100);

        progress.updatedAt = new Date();
        MockFirebaseService.userProgressData.set(key, progress);
      }
    }),

    subscribeToUserProgress: jest.fn().mockImplementation((userId: string, projectId: string, callback: Function) => {
      const key = `${userId}_${projectId}`;

      if (!MockFirebaseService.subscriptions.has(key)) {
        MockFirebaseService.subscriptions.set(key, []);
      }

      MockFirebaseService.subscriptions.get(key)!.push(callback);

      // Immediately call with current data
      const progress = MockFirebaseService.userProgressData.get(key);
      if (progress) {
        setTimeout(() => callback(progress), 0);
      }

      // Return unsubscribe function
      return () => {
        const callbacks = MockFirebaseService.subscriptions.get(key) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    }),

    // Simulate network delays
    createUserProgressWithDelay: jest.fn().mockImplementation(async (userId: string, projectId: string, delay: number = 1000) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return MockFirebaseService.mockUserProgressService.createUserProgress(userId, projectId);
    }),

    // Simulate network errors
    createUserProgressWithError: jest.fn().mockImplementation(async (userId: string, projectId: string, errorType: string = 'network') => {
      const errors = {
        network: new Error('Network error'),
        permission: new Error('Permission denied'),
        quota: new Error('Quota exceeded')
      };

      throw errors[errorType as keyof typeof errors] || errors.network;
    }),

    // Simulate offline behavior
    createUserProgressOffline: jest.fn().mockImplementation(async (userId: string, projectId: string) => {
      // Store in offline queue
      const offlineQueue = MockFirebaseService.getOfflineQueue();
      offlineQueue.push({
        type: 'createUserProgress',
        userId,
        projectId,
        timestamp: Date.now()
      });

      // Return optimistic result
      return TestDataGenerators.generateUserProgress({ userId, projectId });
    }),

    getOfflineQueue: jest.fn().mockReturnValue([])
  };

  // Project Data Service Mocks
  static mockProjectDataService = {
    createProject: jest.fn().mockImplementation(async (projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>) => {
      const project: ProjectData = {
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockFirebaseService.projectData.set(project.id, project);
      return project;
    }),

    getProject: jest.fn().mockImplementation(async (projectId: string) => {
      return MockFirebaseService.projectData.get(projectId) || null;
    }),

    updateProject: jest.fn().mockImplementation(async (projectId: string, updates: Partial<ProjectData>) => {
      const project = MockFirebaseService.projectData.get(projectId);
      if (project) {
        const updatedProject = { ...project, ...updates, updatedAt: new Date() };
        MockFirebaseService.projectData.set(projectId, updatedProject);
        return updatedProject;
      }
      throw new Error('Project not found');
    }),

    deleteProject: jest.fn().mockImplementation(async (projectId: string) => {
      const deleted = MockFirebaseService.projectData.delete(projectId);
      if (!deleted) {
        throw new Error('Project not found');
      }
    }),

    getUserProjects: jest.fn().mockImplementation(async (userId: string, filters?: any) => {
      const userProjects = Array.from(MockFirebaseService.projectData.values())
        .filter(project => project.userId === userId);

      if (filters) {
        return userProjects.filter(project => {
          if (filters.industry && project.industry !== filters.industry) return false;
          if (filters.stage && project.stage !== filters.stage) return false;
          return true;
        });
      }

      return userProjects;
    }),

    subscribeToProject: jest.fn().mockImplementation((projectId: string, callback: Function) => {
      const key = `project_${projectId}`;

      if (!MockFirebaseService.subscriptions.has(key)) {
        MockFirebaseService.subscriptions.set(key, []);
      }

      MockFirebaseService.subscriptions.get(key)!.push(callback);

      // Immediately call with current data
      const project = MockFirebaseService.projectData.get(projectId);
      if (project) {
        setTimeout(() => callback(project), 0);
      }

      return () => {
        const callbacks = MockFirebaseService.subscriptions.get(key) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    })
  };

  // Utility methods for testing
  static getOfflineQueue() {
    return this.mockUserProgressService.getOfflineQueue();
  }

  static triggerSubscriptionUpdate(userId: string, projectId: string, updatedProgress: UserProgress) {
    const key = `${userId}_${projectId}`;
    this.userProgressData.set(key, updatedProgress);

    const callbacks = this.subscriptions.get(key) || [];
    callbacks.forEach(callback => callback(updatedProgress));
  }

  static triggerProjectSubscriptionUpdate(projectId: string, updatedProject: ProjectData) {
    const key = `project_${projectId}`;
    this.projectData.set(projectId, updatedProject);

    const callbacks = this.subscriptions.get(key) || [];
    callbacks.forEach(callback => callback(updatedProject));
  }

  static simulateNetworkDelay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static simulateNetworkError(errorType: 'network' | 'permission' | 'quota' = 'network') {
    const errors = {
      network: new Error('Network error'),
      permission: new Error('Permission denied'),
      quota: new Error('Quota exceeded')
    };

    throw errors[errorType];
  }
}

export class MockRecommendationEngine {
  static mockRecommendationEngine = {
    getNextSteps: jest.fn().mockImplementation((userProgress: UserProgress) => {
      const recommendations = [];

      // Generate recommendations based on current progress
      if (userProgress.phases.validation?.completionPercentage < 100) {
        recommendations.push({
          id: 'complete-validation',
          title: 'Complete Product Validation',
          description: 'Finish validating your product idea',
          priority: 'high',
          phase: 'validation',
          estimatedTime: '2-4 hours',
          category: 'immediate'
        });
      }

      if (userProgress.phases.validation?.completionPercentage === 100 &&
        userProgress.phases.definition?.completionPercentage < 100) {
        recommendations.push({
          id: 'start-definition',
          title: 'Start Product Definition',
          description: 'Define your product vision and features',
          priority: 'high',
          phase: 'definition',
          estimatedTime: '3-5 hours',
          category: 'next-phase'
        });
      }

      return recommendations;
    }),

    suggestResources: jest.fn().mockImplementation((context: any, limit: number = 10) => {
      const resources = [
        {
          id: 'market-research-guide',
          title: 'Market Research Guide',
          type: 'guide',
          category: 'validation',
          url: 'https://example.com/market-research',
          relevanceScore: 0.9
        },
        {
          id: 'competitor-analysis-template',
          title: 'Competitor Analysis Template',
          type: 'template',
          category: 'validation',
          url: 'https://example.com/competitor-template',
          relevanceScore: 0.8
        }
      ];

      return resources.slice(0, limit);
    }),

    identifyRisks: jest.fn().mockImplementation((projectData: ProjectData, userProgress: UserProgress) => {
      const risks = [];

      // Generate risks based on project data
      if (userProgress.phases.validation?.completionPercentage < 100) {
        risks.push({
          id: 'incomplete-validation',
          title: 'Incomplete Market Validation',
          description: 'Product validation is not complete',
          severity: 'medium',
          category: 'validation',
          impact: 'Product-market fit issues'
        });
      }

      if (projectData.industry === 'Technology') {
        risks.push({
          id: 'technical-complexity',
          title: 'Technical Complexity Risk',
          description: 'High technical complexity may impact delivery',
          severity: 'high',
          category: 'technical',
          impact: 'Delayed launch'
        });
      }

      return risks;
    }),

    getPersonalizedRecommendations: jest.fn().mockImplementation((userProgress: UserProgress, projectData: ProjectData, userBehavior: any) => {
      return [
        {
          id: 'personalized-tip',
          title: 'Personalized Recommendation',
          description: 'Based on your progress pattern',
          category: 'personalized',
          priority: 'medium'
        }
      ];
    }),

    getContentSuggestions: jest.fn().mockImplementation((context: any) => {
      if (!context.userInput) return [];

      return [
        {
          id: 'content-suggestion',
          title: 'Relevant Content',
          type: 'template',
          relevanceScore: 0.7
        }
      ];
    })
  };
}

export class MockAuthService {
  private static currentUser: any = null;
  private static authStateCallbacks: Function[] = [];

  static mockAuthContext = {
    user: null,
    loading: false,
    signInWithGoogle: jest.fn().mockImplementation(async () => {
      const user = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      MockAuthService.currentUser = user;
      MockAuthService.triggerAuthStateChange(user);
      return user;
    }),

    signInWithGitHub: jest.fn().mockImplementation(async () => {
      const user = {
        uid: 'github-user-123',
        email: 'github@example.com',
        displayName: 'GitHub User'
      };

      MockAuthService.currentUser = user;
      MockAuthService.triggerAuthStateChange(user);
      return user;
    }),

    signInWithApple: jest.fn().mockImplementation(async () => {
      const user = {
        uid: 'apple-user-123',
        email: 'apple@example.com',
        displayName: 'Apple User'
      };

      MockAuthService.currentUser = user;
      MockAuthService.triggerAuthStateChange(user);
      return user;
    }),

    signOut: jest.fn().mockImplementation(async () => {
      MockAuthService.currentUser = null;
      MockAuthService.triggerAuthStateChange(null);
    })
  };

  static setCurrentUser(user: any) {
    this.currentUser = user;
    this.mockAuthContext.user = user;
    this.triggerAuthStateChange(user);
  }

  static triggerAuthStateChange(user: any) {
    this.authStateCallbacks.forEach(callback => callback(user));
  }

  static onAuthStateChanged(callback: Function) {
    this.authStateCallbacks.push(callback);

    // Immediately call with current user
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }

  static reset() {
    this.currentUser = null;
    this.authStateCallbacks = [];
    this.mockAuthContext.user = null;
    this.mockAuthContext.loading = false;
  }
}

export class MockUtilityServices {
  static mockFinancialUtils = {
    calculateFinancialProjection: jest.fn().mockImplementation((data: any) => {
      const periods = data.periods || 12;
      const baseRevenue = data.revenue?.[0] || 10000;
      const baseExpenses = data.expenses?.[0] || 8000;

      return {
        revenue: Array.from({ length: periods }, (_, i) => baseRevenue * (1 + i * 0.1)),
        expenses: Array.from({ length: periods }, (_, i) => baseExpenses * (1 + i * 0.05)),
        profit: Array.from({ length: periods }, (_, i) => (baseRevenue * (1 + i * 0.1)) - (baseExpenses * (1 + i * 0.05))),
        cashFlow: Array.from({ length: periods }, (_, i) => (baseRevenue * (1 + i * 0.1)) - (baseExpenses * (1 + i * 0.05))),
        cumulativeCashFlow: Array.from({ length: periods }, (_, i) => data.startingCash + (i * 2000)),
        breakEvenMonth: 6,
        roi: 15.5,
        paybackPeriod: 8
      };
    }),

    calculateFundingRequirements: jest.fn().mockImplementation((data: any) => {
      return {
        totalRequired: 100000,
        runway: 18,
        milestones: [
          { month: 6, amount: 50000, purpose: 'Product development' },
          { month: 12, amount: 50000, purpose: 'Market expansion' }
        ],
        fundingGap: 0
      };
    }),

    optimizeFinancialModel: jest.fn().mockImplementation((data: any) => {
      return [
        {
          type: 'cost',
          suggestion: 'Reduce operational costs',
          impact: 'high',
          effort: 'medium',
          expectedImprovement: 'Extend runway by 3 months'
        }
      ];
    })
  };

  static mockTemplateUtils = {
    getTemplatesByCategory: jest.fn().mockImplementation((category: string) => {
      return [
        {
          id: 'template1',
          name: `${category} Template 1`,
          category,
          description: `Template for ${category}`,
          fields: [
            { id: 'field1', name: 'Field 1', type: 'text', required: true },
            { id: 'field2', name: 'Field 2', type: 'number', required: false }
          ]
        }
      ];
    }),

    saveTemplate: jest.fn().mockResolvedValue(undefined),
    deleteTemplate: jest.fn().mockResolvedValue(undefined),
    exportTemplate: jest.fn().mockResolvedValue('exported-data'),
    validateTemplateData: jest.fn().mockReturnValue({ isValid: true, errors: [] })
  };

  static mockProgressTracker = {
    calculateOverallProgress: jest.fn().mockImplementation((userProgress: UserProgress) => {
      const phases = Object.values(userProgress.phases || {});
      if (phases.length === 0) return 0;

      const totalCompletion = phases.reduce((sum, phase) => sum + (phase.completionPercentage || 0), 0);
      return Math.round(totalCompletion / phases.length);
    }),

    getNextRecommendedPhase: jest.fn().mockImplementation((userProgress: UserProgress) => {
      const phaseOrder: LaunchPhase[] = ['validation', 'definition', 'technical', 'marketing', 'operations', 'financial', 'risk', 'optimization'];

      for (const phase of phaseOrder) {
        if (!userProgress.phases[phase] || userProgress.phases[phase].completionPercentage < 100) {
          return phase;
        }
      }

      return null; // All phases complete
    }),

    validateUserProgress: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    generateProjectSummary: jest.fn().mockImplementation((project: ProjectData, progress: UserProgress) => {
      return {
        projectName: project.name,
        currentPhase: progress.currentPhase,
        completionPercentage: MockUtilityServices.mockProgressTracker.calculateOverallProgress(progress),
        nextSteps: ['Complete current phase', 'Review progress'],
        risks: ['Low risk identified'],
        recommendations: ['Continue with current plan']
      };
    })
  };
}

// Export all mock services as a single object for easy importing
export const MockServices = {
  Firebase: MockFirebaseService,
  Recommendation: MockRecommendationEngine,
  Auth: MockAuthService,
  Utilities: MockUtilityServices
};

// Helper function to setup all mocks for testing
export const setupMockServices = () => {
  MockFirebaseService.reset();
  MockFirebaseService.seedTestData();
  MockAuthService.reset();

  // Set default authenticated user
  MockAuthService.setCurrentUser({
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User'
  });
};

// Helper function to cleanup mocks after testing
export const cleanupMockServices = () => {
  MockFirebaseService.reset();
  MockAuthService.reset();
  jest.clearAllMocks();
};
