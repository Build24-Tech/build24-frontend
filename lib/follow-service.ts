import {
  FollowError,
  FollowService,
  PublicProfileView,
  UserFollow,
  UserProfile
} from '@/types/user';
import {
  collection,
  doc,
  limit as firestoreLimit,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Follow Service Implementation
 * Handles all follow/unfollow operations and relationship management
 */
export class FollowServiceImpl implements FollowService {

  /**
   * Follow a user
   * Creates a follow relationship and updates follower counts
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    // Validation checks
    if (followerId === followingId) {
      throw new Error(FollowError.CANNOT_FOLLOW_SELF);
    }

    // Check if already following
    const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
    if (isAlreadyFollowing) {
      throw new Error(FollowError.ALREADY_FOLLOWING);
    }

    // Check if target user exists
    const targetUserExists = await this.userExists(followingId);
    if (!targetUserExists) {
      throw new Error(FollowError.USER_NOT_FOUND);
    }

    try {
      const batch = writeBatch(db);
      const timestamp = Date.now();

      // Create follow relationship document
      const followId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'userFollows', followId);
      const followData: UserFollow = {
        followerId,
        followingId,
        createdAt: timestamp,
        status: 'active'
      };
      batch.set(followRef, followData);

      // Update follower count for the user being followed
      const followingUserRef = doc(db, 'users', followingId);
      batch.update(followingUserRef, {
        'profile.followerCount': increment(1),
        updatedAt: timestamp
      });

      // Update following count for the user doing the following
      const followerUserRef = doc(db, 'users', followerId);
      batch.update(followerUserRef, {
        'profile.followingCount': increment(1),
        updatedAt: timestamp
      });

      await batch.commit();
      console.log(`User ${followerId} successfully followed user ${followingId}`);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  /**
   * Unfollow a user
   * Removes follow relationship and updates follower counts
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // Validation checks
    if (followerId === followingId) {
      throw new Error(FollowError.CANNOT_FOLLOW_SELF);
    }

    // Check if currently following
    const isCurrentlyFollowing = await this.isFollowing(followerId, followingId);
    if (!isCurrentlyFollowing) {
      // Silently return if not following (idempotent operation)
      return;
    }

    try {
      const batch = writeBatch(db);
      const timestamp = Date.now();

      // Delete follow relationship document
      const followId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'userFollows', followId);
      batch.delete(followRef);

      // Update follower count for the user being unfollowed
      const followingUserRef = doc(db, 'users', followingId);
      batch.update(followingUserRef, {
        'profile.followerCount': increment(-1),
        updatedAt: timestamp
      });

      // Update following count for the user doing the unfollowing
      const followerUserRef = doc(db, 'users', followerId);
      batch.update(followerUserRef, {
        'profile.followingCount': increment(-1),
        updatedAt: timestamp
      });

      await batch.commit();
      console.log(`User ${followerId} successfully unfollowed user ${followingId}`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  /**
   * Get followers of a user with pagination
   */
  async getFollowers(userId: string, limit: number = 20): Promise<PublicProfileView[]> {
    try {
      // Query follow relationships where this user is being followed
      const followsQuery = query(
        collection(db, 'userFollows'),
        where('followingId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      const followsSnapshot = await getDocs(followsQuery);
      const followerIds = followsSnapshot.docs.map(doc => doc.data().followerId);

      if (followerIds.length === 0) {
        return [];
      }

      // Get public profiles for all followers
      const followers = await Promise.all(
        followerIds.map(followerId => this.getPublicProfileById(followerId))
      );

      // Filter out null results and return
      return followers.filter((profile): profile is PublicProfileView => profile !== null);
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  /**
   * Get users that a user is following with pagination
   */
  async getFollowing(userId: string, limit: number = 20): Promise<PublicProfileView[]> {
    try {
      // Query follow relationships where this user is the follower
      const followsQuery = query(
        collection(db, 'userFollows'),
        where('followerId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      const followsSnapshot = await getDocs(followsQuery);
      const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);

      if (followingIds.length === 0) {
        return [];
      }

      // Get public profiles for all users being followed
      const following = await Promise.all(
        followingIds.map(followingId => this.getPublicProfileById(followingId))
      );

      // Filter out null results and return
      return following.filter((profile): profile is PublicProfileView => profile !== null);
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }

  /**
   * Check if a user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'userFollows', followId);
      const followSnap = await getDoc(followRef);

      return followSnap.exists() && followSnap.data()?.status === 'active';
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  }

  /**
   * Helper method to check if a user exists
   */
  private async userExists(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  /**
   * Helper method to get a public profile by user ID
   */
  private async getPublicProfileById(userId: string): Promise<PublicProfileView | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data() as UserProfile;

      // Only return profile if it's public or if it's a basic view
      if (!userData.profile.isPublic) {
        // Return minimal info for private profiles
        return {
          uid: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          followerCount: userData.profile.followerCount,
          followingCount: userData.profile.followingCount
        };
      }

      // Return full public profile
      const publicProfile: PublicProfileView = {
        uid: userData.uid,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.profile.bio,
        location: userData.profile.location,
        website: userData.profile.website,
        work: userData.profile.work,
        role: userData.profile.role,
        email: userData.profile.showEmail ? userData.email : undefined,
        followerCount: userData.profile.followerCount,
        followingCount: userData.profile.followingCount
      };

      return publicProfile;
    } catch (error) {
      console.error('Error getting public profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const followService = new FollowServiceImpl();
