import {
  LaunchEssentialsUtils,
  ProjectDataService,
  UserProgressService
} from '@/lib/launch-essentials-firestore';
import {
  LaunchPhase,
  ProjectData,
  ProjectStage,
  StepStatus,
  UserProgress
} from '@/types/launch-essentials';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
  writeBatch: jest.fn(),
  onSnapshot: jest.fn()
}));

describe('UserProgressService', () => {
  const mockUserId = 'test-user-123';
  const mockProjectId = 'test-project-456';
  const mockProgressId = `${mockUserId}_${mockProjectId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProgress', () => {
    it('should create user progress with all phases initialized', async () => {
      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockResolvedValue(undefined);

      const result = await UserProgressService.createUserProgress(
        mockUserId,
        mockProjectId,
        'validation'
      );

      expect(result.userId).toBe(mockUserId);
      expect(result.projectId).toBe(mockProjectId);
      expect(result.currentPhase).toBe('validation');
      expect(Object.keys(result.phases)).toHaveLength(8);
      expect(result.phases.validation).toBeDefined();
      expect(result.phases.validation.completionPercentage).toBe(0);
    });

    it('should handle errors during creation', async () => {
      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        UserProgressService.createUserProgress(mockUserId, mockProjectId)
      ).rejects.toThrow('Failed to create user progress');
    });
  });

  describe('updateStepProgress', () => {
    it('should update step progress and recalculate completion percentage', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockUpdateDoc = require('firebase/firestore').updateDoc;

      const mockExistingProgress: UserProgress = {
        userId: mockUserId,
        projectId: mockProjectId,
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: {
            phase: 'validation' as LaunchPhase,
            steps: [
              {
                stepId: 'step1',
                status: 'completed' as StepStatus,
                data: {}
              }
            ],
            completionPercentage: 50,
            startedAt: new Date()
          }
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockExistingProgress
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      await UserProgressService.updateStepProgress(
        mockUserId,
        mockProjectId,
        'validation',
        'step2',
        'completed',
        { test: 'data' },
        'Test notes'
      );

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should handle non-existent progress', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(
        UserProgressService.updateStepProgress(
          mockUserId,
          mockProjectId,
          'validation',
          'step1',
          'completed'
        )
      ).rejects.toThrow('User progress not found');
    });
  });
});

describe('ProjectDataService', () => {
  const mockUserId = 'test-user-123';
  const mockProjectData = {
    userId: mockUserId,
    name: 'Test Project',
    description: 'A test project',
    industry: 'Technology',
    targetMarket: 'Developers',
    stage: 'concept' as ProjectStage,
    data: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      const mockDocRef = { id: 'new-project-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);

      const result = await ProjectDataService.createProject(mockProjectData);

      expect(result.id).toBe('new-project-id');
      expect(result.name).toBe(mockProjectData.name);
      expect(result.userId).toBe(mockUserId);
    });

    it('should handle creation errors', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        ProjectDataService.createProject(mockProjectData)
      ).rejects.toThrow('Failed to create project');
    });
  });

  describe('getProject', () => {
    it('should retrieve an existing project', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockProjectId = 'test-project-123';

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: mockProjectId,
        data: () => ({
          ...mockProjectData,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        })
      });

      const result = await ProjectDataService.getProject(mockProjectId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockProjectId);
      expect(result?.name).toBe(mockProjectData.name);
    });

    it('should return null for non-existent project', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await ProjectDataService.getProject('non-existent');

      expect(result).toBeNull();
    });
  });
});

describe('LaunchEssentialsUtils', () => {
  describe('calculateOverallProgress', () => {
    it('should calculate correct overall progress', () => {
      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: { phase: 'validation' as LaunchPhase, steps: [], completionPercentage: 100, startedAt: new Date() },
          definition: { phase: 'definition' as LaunchPhase, steps: [], completionPercentage: 50, startedAt: new Date() },
          technical: { phase: 'technical' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() },
          marketing: { phase: 'marketing' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() },
          operations: { phase: 'operations' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() },
          financial: { phase: 'financial' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() },
          risk: { phase: 'risk' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() },
          optimization: { phase: 'optimization' as LaunchPhase, steps: [], completionPercentage: 0, startedAt: new Date() }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.calculateOverallProgress(mockProgress);

      // (100 + 50 + 0 + 0 + 0 + 0 + 0 + 0) / 8 = 18.75, rounded = 19
      expect(result).toBe(19);
    });

    it('should return 0 for empty phases', () => {
      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {} as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.calculateOverallProgress(mockProgress);
      expect(result).toBe(0);
    });
  });

  describe('getNextRecommendedPhase', () => {
    it('should return next phase when current is completed', () => {
      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: {
            phase: 'validation' as LaunchPhase,
            steps: [],
            completionPercentage: 100,
            startedAt: new Date()
          }
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.getNextRecommendedPhase(mockProgress);
      expect(result).toBe('definition');
    });

    it('should return current phase when not completed', () => {
      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: {
            phase: 'validation' as LaunchPhase,
            steps: [],
            completionPercentage: 50,
            startedAt: new Date()
          }
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.getNextRecommendedPhase(mockProgress);
      expect(result).toBe('validation');
    });

    it('should return null when all phases are completed', () => {
      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'optimization' as LaunchPhase,
        phases: {
          optimization: {
            phase: 'optimization' as LaunchPhase,
            steps: [],
            completionPercentage: 100,
            startedAt: new Date()
          }
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.getNextRecommendedPhase(mockProgress);
      expect(result).toBeNull();
    });
  });

  describe('validateProjectData', () => {
    it('should validate complete project data', () => {
      const validProject = {
        name: 'Test Project',
        description: 'A valid project',
        industry: 'Technology',
        targetMarket: 'Developers',
        stage: 'concept' as ProjectStage
      };

      const result = LaunchEssentialsUtils.validateProjectData(validProject);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify missing required fields', () => {
      const invalidProject = {
        name: '',
        description: 'A project with missing fields'
      };

      const result = LaunchEssentialsUtils.validateProjectData(invalidProject);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Project name is required');
      expect(result.errors).toContain('Industry is required');
      expect(result.errors).toContain('Target market is required');
      expect(result.errors).toContain('Project stage is required');
    });
  });

  describe('generateProjectSummary', () => {
    it('should generate correct project summary', () => {
      const mockProject: ProjectData = {
        id: 'test-project',
        userId: 'test-user',
        name: 'Test Project',
        description: 'A test project',
        industry: 'Technology',
        targetMarket: 'Developers',
        stage: 'concept' as ProjectStage,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockProgress: UserProgress = {
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: {
            phase: 'validation' as LaunchPhase,
            steps: [
              { stepId: 'step1', status: 'completed' as StepStatus, data: {} },
              { stepId: 'step2', status: 'in_progress' as StepStatus, data: {} }
            ],
            completionPercentage: 50,
            startedAt: new Date()
          }
        } as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = LaunchEssentialsUtils.generateProjectSummary(mockProject, mockProgress);

      expect(result.currentPhase).toBe('validation');
      expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(result.nextSteps).toContain('Complete step: step2');
    });
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Firestore connection errors', async () => {
    const mockGetDoc = require('firebase/firestore').getDoc;
    mockGetDoc.mockRejectedValue(new Error('Network error'));

    await expect(
      UserProgressService.getUserProgress('user123', 'project456')
    ).rejects.toThrow('Failed to get user progress');
  });

  it('should handle invalid data structures', async () => {
    const mockGetDoc = require('firebase/firestore').getDoc;
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => null // Invalid data
    });

    await expect(
      UserProgressService.updateStepProgress(
        'user123',
        'project456',
        'validation',
        'step1',
        'completed'
      )
    ).rejects.toThrow();
  });
});

describe('Real-time Subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set up progress subscription correctly', () => {
    const mockOnSnapshot = require('firebase/firestore').onSnapshot;
    const mockCallback = jest.fn();
    const mockUnsubscribe = jest.fn();

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const unsubscribe = UserProgressService.subscribeToUserProgress(
      'user123',
      'project456',
      mockCallback
    );

    expect(mockOnSnapshot).toHaveBeenCalled();
    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it('should set up project subscription correctly', () => {
    const mockOnSnapshot = require('firebase/firestore').onSnapshot;
    const mockCallback = jest.fn();
    const mockUnsubscribe = jest.fn();

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const unsubscribe = ProjectDataService.subscribeToProject(
      'project123',
      mockCallback
    );

    expect(mockOnSnapshot).toHaveBeenCalled();
    expect(unsubscribe).toBe(mockUnsubscribe);
  });
});
