import { LaunchEssentialsUtils, ProjectDataService, UserProgressService } from '@/lib/launch-essentials-firestore';
import { LaunchPhase, ProjectStage, StepStatus } from '@/types/launch-essentials';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock Firebase with more realistic behavior
const mockFirestore = {
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
  onSnapshot: jest.fn(),
  runTransaction: jest.fn()
};

jest.mock('@/lib/firebase', () => ({
  db: mockFirestore
}));

jest.mock('firebase/firestore', () => mockFirestore);

describe('Firebase Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockFirestore.doc.mockReturnValue({ id: 'mock-doc-id' });
    mockFirestore.collection.mockReturnValue({ id: 'mock-collection-id' });
    mockFirestore.query.mockReturnValue({ id: 'mock-query-id' });
    mockFirestore.where.mockReturnValue({ id: 'mock-where-id' });
    mockFirestore.orderBy.mockReturnValue({ id: 'mock-orderby-id' });
  });

  describe('UserProgressService Integration', () => {
    const mockUserId = 'test-user-123';
    const mockProjectId = 'test-project-456';

    it('should handle complete user progress lifecycle', async () => {
      // Mock successful creation
      mockFirestore.setDoc.mockResolvedValue(undefined);
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: mockUserId,
          projectId: mockProjectId,
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
      });
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      // Create user progress
      const progress = await UserProgressService.createUserProgress(
        mockUserId,
        mockProjectId,
        'validation'
      );

      expect(progress.userId).toBe(mockUserId);
      expect(progress.projectId).toBe(mockProjectId);
      expect(mockFirestore.setDoc).toHaveBeenCalled();

      // Update step progress
      await UserProgressService.updateStepProgress(
        mockUserId,
        mockProjectId,
        'validation',
        'market-research',
        'completed',
        { marketSize: 'large' }
      );

      expect(mockFirestore.getDoc).toHaveBeenCalled();
      expect(mockFirestore.updateDoc).toHaveBeenCalled();

      // Get user progress
      const retrievedProgress = await UserProgressService.getUserProgress(
        mockUserId,
        mockProjectId
      );

      expect(retrievedProgress).toBeDefined();
      expect(retrievedProgress?.userId).toBe(mockUserId);
    });

    it('should handle concurrent updates with transactions', async () => {
      const mockTransaction = {
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      };

      mockFirestore.runTransaction.mockImplementation((callback) => {
        return callback(mockTransaction);
      });

      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          userId: mockUserId,
          projectId: mockProjectId,
          currentPhase: 'validation',
          phases: {
            validation: {
              phase: 'validation',
              steps: [
                { stepId: 'step1', status: 'completed', data: {} }
              ],
              completionPercentage: 50,
              startedAt: new Date()
            }
          }
        })
      });

      await UserProgressService.updateStepProgressWithTransaction(
        mockUserId,
        mockProjectId,
        'validation',
        'step2',
        'completed',
        { test: 'data' }
      );

      expect(mockFirestore.runTransaction).toHaveBeenCalled();
      expect(mockTransaction.get).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should handle network failures and retries', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      // First call fails, second succeeds
      mockFirestore.getDoc
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ userId: mockUserId })
        });

      const result = await UserProgressService.getUserProgressWithRetry(
        mockUserId,
        mockProjectId,
        { maxRetries: 2, retryDelay: 100 }
      );

      expect(mockFirestore.getDoc).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should handle offline scenarios', async () => {
      const offlineError = new Error('Offline');
      offlineError.name = 'OfflineError';

      mockFirestore.setDoc.mockRejectedValue(offlineError);

      // Should queue the operation for when online
      await expect(
        UserProgressService.createUserProgressOffline(mockUserId, mockProjectId)
      ).resolves.toBeDefined();

      // Verify offline queue was used
      expect(UserProgressService.getOfflineQueue()).toHaveLength(1);
    });

    it('should handle real-time subscriptions correctly', (done) => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockFirestore.onSnapshot.mockImplementation((docRef, callback) => {
        // Simulate real-time update
        setTimeout(() => {
          callback({
            exists: () => true,
            data: () => ({
              userId: mockUserId,
              projectId: mockProjectId,
              currentPhase: 'definition',
              updatedAt: new Date()
            })
          });
        }, 100);

        return mockUnsubscribe;
      });

      const unsubscribe = UserProgressService.subscribeToUserProgress(
        mockUserId,
        mockProjectId,
        (progress) => {
          expect(progress).toBeDefined();
          expect(progress?.currentPhase).toBe('definition');
          mockCallback(progress);
          unsubscribe();
          done();
        }
      );

      expect(mockFirestore.onSnapshot).toHaveBeenCalled();
    });
  });

  describe('ProjectDataService Integration', () => {
    const mockProjectData = {
      userId: 'test-user',
      name: 'Integration Test Project',
      description: 'A project for integration testing',
      industry: 'Technology',
      targetMarket: 'Developers',
      stage: 'concept' as ProjectStage,
      data: {}
    };

    it('should handle complete project lifecycle', async () => {
      const mockDocRef = { id: 'new-project-id' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        id: 'new-project-id',
        data: () => ({
          ...mockProjectData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      });
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      // Create project
      const createdProject = await ProjectDataService.createProject(mockProjectData);
      expect(createdProject.id).toBe('new-project-id');
      expect(mockFirestore.addDoc).toHaveBeenCalled();

      // Get project
      const retrievedProject = await ProjectDataService.getProject('new-project-id');
      expect(retrievedProject).toBeDefined();
      expect(retrievedProject?.name).toBe(mockProjectData.name);

      // Update project
      const updateData = { name: 'Updated Project Name' };
      await ProjectDataService.updateProject('new-project-id', updateData);
      expect(mockFirestore.updateDoc).toHaveBeenCalled();

      // Delete project
      await ProjectDataService.deleteProject('new-project-id');
      expect(mockFirestore.deleteDoc).toHaveBeenCalled();
    });

    it('should handle batch operations', async () => {
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      const projects = [
        { ...mockProjectData, name: 'Project 1' },
        { ...mockProjectData, name: 'Project 2' },
        { ...mockProjectData, name: 'Project 3' }
      ];

      await ProjectDataService.createProjectsBatch(projects);

      expect(mockFirestore.writeBatch).toHaveBeenCalled();
      expect(mockBatch.set).toHaveBeenCalledTimes(3);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle complex queries', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'project1',
            data: () => ({ ...mockProjectData, name: 'Project 1' })
          },
          {
            id: 'project2',
            data: () => ({ ...mockProjectData, name: 'Project 2' })
          }
        ]
      };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot);

      const projects = await ProjectDataService.getUserProjects('test-user', {
        industry: 'Technology',
        stage: 'concept',
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      expect(projects).toHaveLength(2);
      expect(mockFirestore.collection).toHaveBeenCalled();
      expect(mockFirestore.query).toHaveBeenCalled();
      expect(mockFirestore.where).toHaveBeenCalledTimes(2); // industry and stage filters
      expect(mockFirestore.orderBy).toHaveBeenCalled();
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain data consistency across operations', async () => {
      const mockUserId = 'consistency-user';
      const mockProjectId = 'consistency-project';

      // Mock consistent data across operations
      const consistentData = {
        userId: mockUserId,
        projectId: mockProjectId,
        currentPhase: 'validation' as LaunchPhase,
        phases: {
          validation: {
            phase: 'validation' as LaunchPhase,
            steps: [
              { stepId: 'step1', status: 'completed' as StepStatus, data: { test: 'data' } }
            ],
            completionPercentage: 100,
            startedAt: new Date()
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockFirestore.setDoc.mockResolvedValue(undefined);
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => consistentData
      });

      // Create and immediately retrieve
      await UserProgressService.createUserProgress(mockUserId, mockProjectId);
      const retrieved = await UserProgressService.getUserProgress(mockUserId, mockProjectId);

      // Validate data consistency
      const validation = LaunchEssentialsUtils.validateUserProgress(retrieved!);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle schema migrations', async () => {
      // Mock old schema data
      const oldSchemaData = {
        userId: 'migration-user',
        projectId: 'migration-project',
        phase: 'validation', // Old field name
        steps: [{ id: 'step1', completed: true }], // Old structure
        createdAt: new Date()
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => oldSchemaData
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      // Should migrate to new schema
      const migrated = await UserProgressService.getUserProgressWithMigration(
        'migration-user',
        'migration-project'
      );

      expect(migrated.currentPhase).toBe('validation'); // Migrated field
      expect(migrated.phases).toBeDefined(); // New structure
      expect(mockFirestore.updateDoc).toHaveBeenCalled(); // Migration update
    });
  });

  describe('Performance and Optimization', () => {
    it('should implement proper caching', async () => {
      const mockUserId = 'cache-user';
      const mockProjectId = 'cache-project';

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: mockUserId, projectId: mockProjectId })
      });

      // First call should hit Firestore
      await UserProgressService.getUserProgressCached(mockUserId, mockProjectId);
      expect(mockFirestore.getDoc).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await UserProgressService.getUserProgressCached(mockUserId, mockProjectId);
      expect(mockFirestore.getDoc).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle pagination correctly', async () => {
      const mockQuerySnapshot = {
        docs: Array.from({ length: 5 }, (_, i) => ({
          id: `project${i}`,
          data: () => ({ name: `Project ${i}` })
        })),
        size: 5
      };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await ProjectDataService.getUserProjectsPaginated('test-user', {
        limit: 5,
        startAfter: null
      });

      expect(result.projects).toHaveLength(5);
      expect(result.hasMore).toBe(false);
      expect(result.lastDoc).toBeDefined();
    });

    it('should optimize batch writes', async () => {
      const mockBatch = {
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      mockFirestore.writeBatch.mockReturnValue(mockBatch);

      const updates = Array.from({ length: 600 }, (_, i) => ({
        id: `doc${i}`,
        data: { value: i }
      }));

      await ProjectDataService.batchUpdateOptimized(updates);

      // Should create multiple batches (Firestore limit is 500 operations per batch)
      expect(mockFirestore.writeBatch).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle permission errors', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'PermissionError';

      mockFirestore.getDoc.mockRejectedValue(permissionError);

      await expect(
        UserProgressService.getUserProgress('unauthorized-user', 'project')
      ).rejects.toThrow('Permission denied');
    });

    it('should handle quota exceeded errors', async () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';

      mockFirestore.setDoc.mockRejectedValue(quotaError);

      // Should implement exponential backoff
      await expect(
        UserProgressService.createUserProgressWithBackoff('user', 'project')
      ).rejects.toThrow('Quota exceeded');
    });

    it('should handle data corruption gracefully', async () => {
      // Mock corrupted data
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => null // Corrupted/null data
      });

      const result = await UserProgressService.getUserProgressSafe('user', 'project');

      expect(result).toBeNull();
      // Should log the corruption for monitoring
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Corrupted data detected')
      );
    });
  });
});
