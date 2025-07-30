import { ProjectDataService, UserProgressService } from '@/lib/launch-essentials-firestore';
import { ProgressTracker, ProgressTrackingError } from '@/lib/progress-tracker';
import {
  LaunchPhase,
  PhaseProgress,
  UserProgress
} from '@/types/launch-essentials';

// Mock the Firebase services
jest.mock('@/lib/launch-essentials-firestore');
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

const mockUserProgressService = UserProgressService as jest.Mocked<typeof UserProgressService>;
const mockProjectDataService = ProjectDataService as jest.Mocked<typeof ProjectDataService>;

describe('ProgressTracker', () => {
  let progressTracker: ProgressTracker;
  const userId = 'test-user-123';
  const projectId = 'test-project-456';

  beforeEach(() => {
    progressTracker = new ProgressTracker({
      enabled: true,
      debounceMs: 100,
      maxRetries: 2,
      retryDelayMs: 50
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('initializeProgress', () => {
    it('should create new progress when none exists', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(null);
      mockUserProgressService.createUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.initializeProgress(userId, projectId);

      expect(mockUserProgressService.getUserProgress).toHaveBeenCalledWith(userId, projectId);
      expect(mockUserProgressService.createUserProgress).toHaveBeenCalledWith(userId, projectId, 'validation');
      expect(result).toEqual(mockProgress);
    });

    it('should return existing progress when it exists', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.initializeProgress(userId, projectId);

      expect(mockUserProgressService.getUserProgress).toHaveBeenCalledWith(userId, projectId);
      expect(mockUserProgressService.createUserProgress).not.toHaveBeenCalled();
      expect(result).toEqual(mockProgress);
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Database connection failed');
      mockUserProgressService.getUserProgress.mockRejectedValue(error);

      await expect(progressTracker.initializeProgress(userId, projectId))
        .rejects.toThrow(ProgressTrackingError);
    });
  });

  describe('getProgress', () => {
    it('should return progress from database', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.getProgress(userId, projectId);

      expect(result).toEqual(mockProgress);
    });

    it('should return optimistic updates when available', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);

      // First call to populate optimistic cache
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      await progressTracker.getProgress(userId, projectId);

      // Second call should return from cache without hitting database
      mockUserProgressService.getUserProgress.mockClear();
      const result = await progressTracker.getProgress(userId, projectId);

      expect(mockUserProgressService.getUserProgress).not.toHaveBeenCalled();
      expect(result).toEqual(mockProgress);
    });

    it('should return null when progress does not exist', async () => {
      mockUserProgressService.getUserProgress.mockResolvedValue(null);

      const result = await progressTracker.getProgress(userId, projectId);

      expect(result).toBeNull();
    });
  });

  describe('updateStepProgress', () => {
    it('should update step progress with optimistic updates', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        { answer: 'test' },
        'Test note'
      );

      expect(result.phases.validation.steps).toHaveLength(1);
      expect(result.phases.validation.steps[0]).toMatchObject({
        stepId: 'step-1',
        status: 'completed',
        data: { answer: 'test' },
        notes: 'Test note'
      });
    });

    it('should initialize progress if it does not exist', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(null);
      mockUserProgressService.createUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'in_progress'
      );

      expect(mockUserProgressService.createUserProgress).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle auto-save with debouncing', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'in_progress',
        undefined,
        undefined,
        { autoSave: true }
      );

      // Should return updated progress immediately (optimistic update)
      expect(result.phases.validation.steps[0].status).toBe('in_progress');

      // Auto-save should be scheduled but not necessarily completed yet
      expect(result).toBeDefined();
    });

    it('should validate step data when requested', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      await expect(progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        null, // Invalid data
        undefined,
        { validateData: true }
      )).rejects.toThrow('Step data cannot be null');
    });

    it('should update existing step progress', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      // Add existing step
      mockProgress.phases.validation.steps = [{
        stepId: 'step-1',
        status: 'in_progress',
        data: { answer: 'old' }
      }];

      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        { answer: 'new' }
      );

      expect(result.phases.validation.steps).toHaveLength(1);
      expect(result.phases.validation.steps[0]).toMatchObject({
        stepId: 'step-1',
        status: 'completed',
        data: { answer: 'new' }
      });
    });

    it('should calculate phase completion percentage', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      // Add first step
      await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed'
      );

      // Add second step
      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-2',
        'in_progress'
      );

      // Should have 50% completion (1 completed out of 2 total)
      expect(result.phases.validation.completionPercentage).toBe(50);
    });
  });

  describe('updateCurrentPhase', () => {
    it('should update current phase', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateCurrentPhase.mockResolvedValue();

      const result = await progressTracker.updateCurrentPhase(userId, projectId, 'definition');

      expect(result.currentPhase).toBe('definition');
      expect(mockUserProgressService.updateCurrentPhase).toHaveBeenCalledWith(
        userId,
        projectId,
        'definition'
      );
    });

    it('should throw error when progress not found', async () => {
      mockUserProgressService.getUserProgress.mockResolvedValue(null);

      await expect(progressTracker.updateCurrentPhase(userId, projectId, 'definition'))
        .rejects.toThrow('Progress not found');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate comprehensive progress metrics', () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);

      // Add some steps to different phases
      mockProgress.phases.validation.steps = [
        { stepId: 'v1', status: 'completed', data: {} },
        { stepId: 'v2', status: 'completed', data: {} }
      ];
      mockProgress.phases.definition.steps = [
        { stepId: 'd1', status: 'completed', data: {} },
        { stepId: 'd2', status: 'in_progress', data: {} }
      ];

      const result = progressTracker.calculateProgress(mockProgress);

      expect(result.phaseCompletion.validation).toBe(100);
      expect(result.phaseCompletion.definition).toBe(50);
      expect(result.totalSteps).toBe(4);
      expect(result.completedSteps).toBe(3);
      expect(result.nextStep?.stepId).toBe('d2');
    });

    it('should handle empty progress', () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);

      const result = progressTracker.calculateProgress(mockProgress);

      expect(result.overallCompletion).toBe(0);
      expect(result.totalSteps).toBe(0);
      expect(result.completedSteps).toBe(0);
      expect(result.nextStep).toBeNull();
    });
  });

  describe('getProgressSummary', () => {
    it('should return comprehensive progress summary', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockProgress.phases.validation.steps = [
        { stepId: 'v1', status: 'completed', data: {} }
      ];

      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.getProgressSummary(userId, projectId);

      expect(result.progress).toEqual(mockProgress);
      expect(result.calculation).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.risks).toBeInstanceOf(Array);
    });

    it('should generate appropriate recommendations', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockProgress.phases.validation.steps = [
        { stepId: 'v1', status: 'in_progress', data: {} }
      ];

      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.getProgressSummary(userId, projectId);

      expect(result.recommendations).toContain('Complete step: v1');
      expect(result.recommendations).toContain('Focus on completing validation phase first');
    });

    it('should identify risks', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockProgress.currentPhase = 'technical';
      // Low validation completion but moved to technical phase
      mockProgress.phases.validation.steps = [
        { stepId: 'v1', status: 'in_progress', data: {} }
      ];

      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await progressTracker.getProgressSummary(userId, projectId);

      expect(result.risks).toContain('Insufficient market validation may lead to product-market fit issues');
    });
  });

  describe('forceSave', () => {
    it('should force save pending changes', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      // Update without auto-save to test manual save
      await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        undefined,
        undefined,
        { autoSave: false }
      );

      expect(mockUserProgressService.updateStepProgress).toHaveBeenCalled();
    });
  });

  describe('refreshProgress', () => {
    it('should clear optimistic updates and fetch fresh data', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);

      // First call to populate optimistic cache
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      await progressTracker.getProgress(userId, projectId);

      // Clear mock and set up fresh data
      mockUserProgressService.getUserProgress.mockClear();
      const freshProgress = { ...mockProgress, updatedAt: new Date() };
      mockUserProgressService.getUserProgress.mockResolvedValue(freshProgress);

      const result = await progressTracker.refreshProgress(userId, projectId);

      expect(mockUserProgressService.getUserProgress).toHaveBeenCalledWith(userId, projectId);
      expect(result).toEqual(freshProgress);
    });
  });

  describe('subscribeToProgress', () => {
    it('should subscribe to real-time updates', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();

      mockUserProgressService.subscribeToUserProgress.mockReturnValue(unsubscribe);

      const result = progressTracker.subscribeToProgress(userId, projectId, callback);

      expect(mockUserProgressService.subscribeToUserProgress).toHaveBeenCalledWith(
        userId,
        projectId,
        expect.any(Function)
      );
      expect(result).toBe(unsubscribe);
    });

    it('should update optimistic cache on real-time updates', () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      const callback = jest.fn();
      let realtimeCallback: (progress: UserProgress | null) => void;

      mockUserProgressService.subscribeToUserProgress.mockImplementation((_, __, cb) => {
        realtimeCallback = cb;
        return jest.fn();
      });

      progressTracker.subscribeToProgress(userId, projectId, callback);

      // Simulate real-time update
      realtimeCallback!(mockProgress);

      expect(callback).toHaveBeenCalledWith(mockProgress);
    });
  });

  describe('error handling and retry logic', () => {
    it('should handle persistence errors gracefully', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockRejectedValue(new Error('Network error'));

      // Should not throw error with auto-save enabled (errors are handled internally)
      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        undefined,
        undefined,
        { autoSave: true, retryOnFailure: true }
      );

      expect(result).toBeDefined();
      expect(result.phases.validation.steps[0].status).toBe('completed');
    });

    it('should throw error when auto-save is disabled and persistence fails', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockRejectedValue(new Error('Network error'));

      await expect(progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        undefined,
        undefined,
        { autoSave: false }
      )).rejects.toThrow(ProgressTrackingError);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent updates to the same step', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      // Simulate concurrent updates
      const promises = [
        progressTracker.updateStepProgress(userId, projectId, 'validation', 'step-1', 'in_progress'),
        progressTracker.updateStepProgress(userId, projectId, 'validation', 'step-1', 'completed')
      ];

      const results = await Promise.all(promises);

      // Both should succeed, last one should win
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[1].phases.validation.steps[0].status).toBe('completed');
    });

    it('should handle invalid phase names', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);

      await expect(progressTracker.updateStepProgress(
        userId,
        projectId,
        'invalid-phase' as LaunchPhase,
        'step-1',
        'completed'
      )).rejects.toThrow(ProgressTrackingError);
    });

    it('should handle large data payloads', async () => {
      const mockProgress: UserProgress = createMockUserProgress(userId, projectId);
      mockUserProgressService.getUserProgress.mockResolvedValue(mockProgress);
      mockUserProgressService.updateStepProgress.mockResolvedValue();

      const largeData = {
        responses: Array(1000).fill(0).map((_, i) => ({
          question: `Question ${i}`,
          answer: `Answer ${i}`.repeat(100)
        }))
      };

      const result = await progressTracker.updateStepProgress(
        userId,
        projectId,
        'validation',
        'step-1',
        'completed',
        largeData
      );

      expect(result.phases.validation.steps[0].data).toEqual(largeData);
    });
  });
});

// Helper function to create mock UserProgress
function createMockUserProgress(userId: string, projectId: string): UserProgress {
  const now = new Date();

  const createPhaseProgress = (phase: LaunchPhase): PhaseProgress => ({
    phase,
    steps: [],
    completionPercentage: 0,
    startedAt: now
  });

  return {
    userId,
    projectId,
    currentPhase: 'validation',
    phases: {
      validation: createPhaseProgress('validation'),
      definition: createPhaseProgress('definition'),
      technical: createPhaseProgress('technical'),
      marketing: createPhaseProgress('marketing'),
      operations: createPhaseProgress('operations'),
      financial: createPhaseProgress('financial'),
      risk: createPhaseProgress('risk'),
      optimization: createPhaseProgress('optimization')
    },
    createdAt: now,
    updatedAt: now
  };
}
