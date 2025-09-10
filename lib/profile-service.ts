import {
  ProfileError,
  ProfileService,
  PublicProfileView,
  UserProfile,
  UserProfileData
} from '@/types/user';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from 'firebase/storage';
import { storage } from './firebase';
import { getUserProfile, updateUserProfile } from './firestore';

/**
 * Profile validation schema
 */
const validateProfileData = (data: Partial<UserProfileData>): string[] => {
  const errors: string[] = [];

  // Validate bio length
  if (data.bio && data.bio.length > 500) {
    errors.push('Bio must be 500 characters or less');
  }

  // Validate website URL format
  if (data.website && data.website.trim()) {
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(data.website)) {
      errors.push('Website must be a valid URL starting with http:// or https://');
    }
  }

  // Validate location length
  if (data.location && data.location.length > 100) {
    errors.push('Location must be 100 characters or less');
  }

  // Validate work length
  if (data.work && data.work.length > 100) {
    errors.push('Work must be 100 characters or less');
  }

  // Validate role length
  if (data.role && data.role.length > 100) {
    errors.push('Role must be 100 characters or less');
  }

  return errors;
};

/**
 * Sanitize profile data by trimming whitespace and removing empty strings
 */
const sanitizeProfileData = (data: Partial<UserProfileData>): Partial<UserProfileData> => {
  const sanitized: Partial<UserProfileData> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        sanitized[key as keyof UserProfileData] = trimmed;
      }
    } else {
      sanitized[key as keyof UserProfileData] = value;
    }
  });

  return sanitized;
};

/**
 * Convert UserProfile to PublicProfileView based on privacy settings
 */
const convertToPublicView = (
  userProfile: UserProfile,
  isFollowing?: boolean
): PublicProfileView => {
  const publicView: PublicProfileView = {
    uid: userProfile.uid,
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    followerCount: userProfile.profile.followerCount,
    followingCount: userProfile.profile.followingCount,
    isFollowing
  };

  // Only include profile data if profile is public
  if (userProfile.profile.isPublic) {
    publicView.bio = userProfile.profile.bio;
    publicView.location = userProfile.profile.location;
    publicView.website = userProfile.profile.website;
    publicView.work = userProfile.profile.work;
    publicView.role = userProfile.profile.role;

    // Only include email if user chose to show it
    if (userProfile.profile.showEmail) {
      publicView.email = userProfile.email;
    }
  }

  return publicView;
};

/**
 * Profile Service Implementation
 */
export const profileService: ProfileService = {
  /**
   * Get a user's public profile
   */
  async getPublicProfile(userId: string): Promise<PublicProfileView | null> {
    return ProfileRetryManager.withRetry(async () => {
      const userProfile = await getUserProfile(userId);

      if (!userProfile) {
        throw new ProfileErrorClass(
          ProfileErrorType.PROFILE_NOT_FOUND,
          'Profile not found',
          undefined,
          { userId },
          false
        );
      }

      return convertToPublicView(userProfile);
    }, `get_public_profile_${userId}`);
  },

  /**
   * Update user profile data
   */
  async updateProfile(userId: string, data: Partial<UserProfileData>): Promise<void> {
    return ProfileRetryManager.withRetry(async () => {
      // Validate the data
      const validationErrors = validateProfileData(data);
      if (validationErrors.length > 0) {
        throw new ProfileErrorClass(
          ProfileErrorType.VALIDATION_ERROR,
          validationErrors.join(', '),
          undefined,
          { userId, validationErrors },
          false
        );
      }

      // Sanitize the data
      const sanitizedData = sanitizeProfileData(data);

      // Get current user profile to merge with updates
      const currentProfile = await getUserProfile(userId);
      if (!currentProfile) {
        throw new ProfileErrorClass(
          ProfileErrorType.PROFILE_NOT_FOUND,
          'Profile not found',
          undefined,
          { userId },
          false
        );
      }

      // Merge the updates with existing profile data
      const updatedProfile: Partial<UserProfile> = {
        profile: {
          ...currentProfile.profile,
          ...sanitizedData
        }
      };

      await updateUserProfile(userId, updatedProfile);
    }, `update_profile_${userId}`);
  },

  /**
   * Toggle profile privacy setting
   */
  async togglePrivacy(userId: string, isPublic: boolean): Promise<void> {
    try {
      const currentProfile = await getUserProfile(userId);
      if (!currentProfile) {
        throw new Error(ProfileError.PROFILE_NOT_FOUND);
      }

      const updatedProfile: Partial<UserProfile> = {
        profile: {
          ...currentProfile.profile,
          isPublic
        }
      };

      await updateUserProfile(userId, updatedProfile);
    } catch (error) {
      console.error('Error toggling privacy:', error);
      if (error instanceof Error && error.message.includes(ProfileError.PROFILE_NOT_FOUND)) {
        throw error;
      }
      throw new Error(ProfileError.VALIDATION_ERROR);
    }
  },

  /**
   * Upload profile image to Firebase Storage
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, and WebP images are allowed');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image must be smaller than 5MB');
      }

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `profile-images/${userId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      // Delete existing profile image if it exists
      const currentProfile = await getUserProfile(userId);
      if (currentProfile?.photoURL) {
        try {
          // Extract file path from URL to delete old image
          const oldImageRef = ref(storage, currentProfile.photoURL);
          await deleteObject(oldImageRef);
        } catch (deleteError) {
          // Log but don't fail if old image deletion fails
          console.warn('Could not delete old profile image:', deleteError);
        }
      }

      // Upload new image
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new image URL
      await updateUserProfile(userId, {
        photoURL: downloadURL
      });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(`${ProfileError.UPLOAD_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Helper function to check if a user profile exists
 */
export const profileExists = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    return profile !== null;
  } catch (error) {
    console.error('Error checking profile existence:', error);
    return false;
  }
};

/**
 * Helper function to get multiple public profiles (for followers/following lists)
 */
export const getMultiplePublicProfiles = async (
  userIds: string[]
): Promise<PublicProfileView[]> => {
  try {
    const profiles: PublicProfileView[] = [];

    // Process in batches to avoid Firestore limits
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchProfiles = await Promise.all(
        batch.map(async (userId) => {
          try {
            return await profileService.getPublicProfile(userId);
          } catch (error) {
            console.warn(`Could not fetch profile for user ${userId}:`, error);
            return null;
          }
        })
      );

      // Filter out null results
      profiles.push(...batchProfiles.filter((profile): profile is PublicProfileView => profile !== null));
    }

    return profiles;
  } catch (error) {
    console.error('Error getting multiple public profiles:', error);
    throw error;
  }
};
