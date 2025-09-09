import { FollowServiceImpl } from '@/lib/follow-service';
import { FollowError, UserProfile } from '@/types/user';
import {
  collection,
  deleteDoc,
  doc,
  limit as firestoreLimit,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = firestoreLimit as jest.MockedFunction<typeof firestoreLimit>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>;
const mockIncrement = increment as jest.MockedFunction<typeof increment>;

describe('FollowService', () => {
  let followService: FollowServiceImpl;
  let mockBatch: any;
  let mockDocRef: any;

  beforeEach(() => {
    followService = new FollowServiceImpl();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock document reference
    mockDocRef = { id: 'mock-doc-ref' };
    mockDoc.mockReturnValue(mockDocRef);

    // Setup mock batch
    mockBatch = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined)
    };
    mockWriteBatch.mockReturnValue(mockBatch);
    mockIncrement.mockImplementation((value) => ({ increment: value }));

    // Setup mock query functions
    mockCollection.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
    mockOrderBy.mockReturnValue({} as any);
    mockLimit.mockReturnValue({} as any);
  });

  describe('followUser', () => {
    const followerId = 'user1';
    const followingId = 'user2';

    it('should successfully follow a user', async () => {
      // Mock user existence check
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false } as any) // isFollowing check
        .mockResolvedValueOnce({ exists: () => true } as any); // userExists check

      await followService.followUser(followerId, followingId);

      expect(mockBatch.set).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          followerId,
          followingId,
          status: 'active',
          createdAt: expect.any(Number)
        })
      );
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should throw error when trying to follow self', async () => {
      await expect(followService.followUser(followerId, followerId))
        .rejects.toThrow(FollowError.CANNOT_FOLLOW_SELF);
    });

    it('should throw error when already following', async () => {
      // Mock already following
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'active' })
      } as any);

      await expect(followService.followUser(followerId, followingId))
        .rejects.toThrow(FollowError.ALREADY_FOLLOWING);
    });

    it('should throw error when target user does not exist', async () => {
      // Mock not following and user doesn't exist
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false } as any) // isFollowing check
        .mockResolvedValueOnce({ exists: () => false } as any); // userExists check

      await expect(followService.followUser(followerId, followingId))
        .rejects.toThrow(FollowError.USER_NOT_FOUND);
    });

    it('should handle database errors gracefully', async () => {
      // Mock user existence check
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false } as any) // isFollowing check
        .mockResolvedValueOnce({ exists: () => true } as any); // userExists check

      // Mock batch commit failure
      mockBatch.commit.mockRejectedValueOnce(new Error('Database error'));

      await expect(followService.followUser(followerId, followingId))
        .rejects.toThrow('Database error');
    });
  });

  describe('unfollowUser', () => {
    const followerId = 'user1';
    const followingId = 'user2';

    it('should successfully unfollow a user', async () => {
      // Mock currently following
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'active' })
      } as any);

      await followService.unfollowUser(followerId, followingId);

      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle unfollowing when not following (idempotent)', async () => {
      // Mock not following
      mockGetDoc.mockResolvedValueOnce({ exists: () => false } as any);

      await followService.unfollowUser(followerId, followingId);

      expect(mockBatch.delete).not.toHaveBeenCalled();
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });

    it('should throw error when trying to unfollow self', async () => {
      await expect(followService.unfollowUser(followerId, followerId))
        .rejects.toThrow(FollowError.CANNOT_FOLLOW_SELF);
    });

    it('should handle database errors gracefully', async () => {
      // Mock currently following
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'active' })
      } as any);

      // Mock batch commit failure
      mockBatch.commit.mockRejectedValueOnce(new Error('Database error'));

      await expect(followService.unfollowUser(followerId, followingId))
        .rejects.toThrow('Database error');
    });
  });

  describe('getFollowers', () => {
    const userId = 'user1';

    it('should return followers list', async () => {
      const mockFollowsSnapshot = {
        docs: [
          { data: () => ({ followerId: 'follower1', followingId: userId }) },
          { data: () => ({ followerId: 'follower2', followingId: userId }) }
        ]
      };

      const mockUserProfile1: UserProfile = {
        uid: 'follower1',
        email: 'follower1@test.com',
        displayName: 'Follower One',
        photoURL: 'photo1.jpg',
        status: 'active',
        emailUpdates: false,
        language: 'en',
        theme: 'system',
        subscription: { tier: 'free' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profile: {
          bio: 'Bio 1',
          isPublic: true,
          showEmail: false,
          followerCount: 0,
          followingCount: 1
        }
      };

      const mockUserProfile2: UserProfile = {
        uid: 'follower2',
        email: 'follower2@test.com',
        displayName: 'Follower Two',
        photoURL: 'photo2.jpg',
        status: 'active',
        emailUpdates: false,
        language: 'en',
        theme: 'system',
        subscription: { tier: 'free' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profile: {
          bio: 'Bio 2',
          isPublic: true,
          showEmail: true,
          followerCount: 0,
          followingCount: 1
        }
      };

      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => true, data: () => mockUserProfile1 } as any)
        .mockResolvedValueOnce({ exists: () => true, data: () => mockUserProfile2 } as any);

      const followers = await followService.getFollowers(userId);

      expect(followers).toHaveLength(2);
      expect(followers[0].uid).toBe('follower1');
      expect(followers[0].bio).toBe('Bio 1');
      expect(followers[0].email).toBeUndefined(); // showEmail is false
      expect(followers[1].uid).toBe('follower2');
      expect(followers[1].email).toBe('follower2@test.com'); // showEmail is true
    });

    it('should return empty array when no followers', async () => {
      const mockFollowsSnapshot = { docs: [] };
      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);

      const followers = await followService.getFollowers(userId);

      expect(followers).toHaveLength(0);
    });

    it('should handle private profiles in followers list', async () => {
      const mockFollowsSnapshot = {
        docs: [
          { data: () => ({ followerId: 'follower1', followingId: userId }) }
        ]
      };

      const mockPrivateUserProfile: UserProfile = {
        uid: 'follower1',
        email: 'follower1@test.com',
        displayName: 'Private User',
        photoURL: 'photo1.jpg',
        status: 'active',
        emailUpdates: false,
        language: 'en',
        theme: 'system',
        subscription: { tier: 'free' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profile: {
          bio: 'Private bio',
          isPublic: false, // Private profile
          showEmail: false,
          followerCount: 5,
          followingCount: 10
        }
      };

      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockPrivateUserProfile
      } as any);

      const followers = await followService.getFollowers(userId);

      expect(followers).toHaveLength(1);
      expect(followers[0].uid).toBe('follower1');
      expect(followers[0].displayName).toBe('Private User');
      expect(followers[0].bio).toBeUndefined(); // Private profile, no bio
      expect(followers[0].email).toBeUndefined();
      expect(followers[0].followerCount).toBe(5);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const mockFollowsSnapshot = { docs: [] };
      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);

      await followService.getFollowers(userId, limit);

      expect(mockLimit).toHaveBeenCalledWith(limit);
    });
  });

  describe('getFollowing', () => {
    const userId = 'user1';

    it('should return following list', async () => {
      const mockFollowsSnapshot = {
        docs: [
          { data: () => ({ followerId: userId, followingId: 'following1' }) },
          { data: () => ({ followerId: userId, followingId: 'following2' }) }
        ]
      };

      const mockUserProfile1: UserProfile = {
        uid: 'following1',
        email: 'following1@test.com',
        displayName: 'Following One',
        photoURL: 'photo1.jpg',
        status: 'active',
        emailUpdates: false,
        language: 'en',
        theme: 'system',
        subscription: { tier: 'free' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profile: {
          bio: 'Bio 1',
          isPublic: true,
          showEmail: false,
          followerCount: 1,
          followingCount: 0
        }
      };

      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => true, data: () => mockUserProfile1 } as any)
        .mockResolvedValueOnce({ exists: () => false } as any); // Second user doesn't exist

      const following = await followService.getFollowing(userId);

      expect(following).toHaveLength(1);
      expect(following[0].uid).toBe('following1');
      expect(following[0].bio).toBe('Bio 1');
    });

    it('should return empty array when not following anyone', async () => {
      const mockFollowsSnapshot = { docs: [] };
      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);

      const following = await followService.getFollowing(userId);

      expect(following).toHaveLength(0);
    });
  });

  describe('isFollowing', () => {
    const followerId = 'user1';
    const followingId = 'user2';

    it('should return true when following', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'active' })
      } as any);

      const result = await followService.isFollowing(followerId, followingId);

      expect(result).toBe(true);
    });

    it('should return false when not following', async () => {
      mockGetDoc.mockResolvedValueOnce({ exists: () => false } as any);

      const result = await followService.isFollowing(followerId, followingId);

      expect(result).toBe(false);
    });

    it('should return false when follow relationship is blocked', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'blocked' })
      } as any);

      const result = await followService.isFollowing(followerId, followingId);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Database error'));

      await expect(followService.isFollowing(followerId, followingId))
        .rejects.toThrow('Database error');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle concurrent follow/unfollow operations', async () => {
      const followerId = 'user1';
      const followingId = 'user2';

      // Mock the scenario where user is followed between the check and the operation
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false } as any) // First check: not following
        .mockResolvedValueOnce({ exists: () => true } as any); // User exists check

      // Mock batch commit to simulate concurrent modification
      mockBatch.commit.mockRejectedValueOnce(new Error('Document already exists'));

      await expect(followService.followUser(followerId, followingId))
        .rejects.toThrow('Document already exists');
    });

    it('should handle malformed follow documents', async () => {
      const userId = 'user1';
      const mockFollowsSnapshot = {
        docs: [
          { data: () => ({ followerId: 'invalid' }) }, // Missing followingId
          { data: () => ({ followerId: 'valid', followingId: userId }) }
        ]
      };

      mockGetDocs.mockResolvedValueOnce(mockFollowsSnapshot as any);
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false } as any) // First user doesn't exist
        .mockResolvedValueOnce({ exists: () => false } as any); // Second user doesn't exist

      const followers = await followService.getFollowers(userId);

      expect(followers).toHaveLength(0); // Should filter out invalid entries
    });
  });
});
