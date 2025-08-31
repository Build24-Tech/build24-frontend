import { ThemePreference, UserLanguage, UserProfile, UserProfileData, UserStatus } from '@/types/user';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getDefaultSubscription } from './subscription-service';

/**
 * Creates or updates a user profile in Firestore with complete profile data
 */
export const createUserProfile = async (
  user: User,
  status: UserStatus = 'onboarding',
  emailUpdates: boolean = false,
  language: UserLanguage = 'en',
  theme: ThemePreference = 'system'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const timestamp = Date.now();

    if (!userSnap.exists()) {
      // Create new user profile with complete default profile data
      const userData: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        status,
        emailUpdates,
        language,
        theme,
        subscription: getDefaultSubscription(),
        createdAt: timestamp,
        updatedAt: timestamp,
        profile: {
          bio: undefined,
          location: undefined,
          website: undefined,
          work: undefined,
          role: undefined,
          showEmail: false,
          isPublic: true,
          followerCount: 0,
          followingCount: 0,
        },
      };

      await setDoc(userRef, userData);
      console.log('User profile created with default profile data');
    } else {
      // Update existing user profile, preserving profile data if it exists
      const existingData = userSnap.data() as UserProfile;
      const updateData: Partial<UserProfile> = {
        email: user.email || '',
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        updatedAt: timestamp,
      };

      // If profile data doesn't exist, add default profile data
      if (!existingData.profile) {
        updateData.profile = {
          bio: undefined,
          location: undefined,
          website: undefined,
          work: undefined,
          role: undefined,
          showEmail: false,
          isPublic: true,
          followerCount: 0,
          followingCount: 0,
        };
      }

      await updateDoc(userRef, updateData);
      console.log('User profile updated');
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

/**
 * Updates a user's status in Firestore
 */
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      updatedAt: Date.now()
    });
    console.log(`User status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Updates a user's language preference in Firestore
 */
export const updateUserLanguage = async (userId: string, language: UserLanguage): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      language,
      updatedAt: Date.now()
    });
    console.log(`User language updated to: ${language}`);
  } catch (error) {
    console.error('Error updating user language:', error);
    throw error;
  }
};

/**
 * Gets a user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
/**
 * Updates a user profile in Firestore
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now()
    });
    console.log('User profile updated');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Updates user profile data (the profile sub-object) in Firestore
 */
export const updateUserProfileData = async (userId: string, profileData: Partial<UserProfileData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }

    const existingData = userSnap.data() as UserProfile;
    const updatedProfile = {
      ...existingData.profile,
      ...profileData,
    };

    await updateDoc(userRef, {
      profile: updatedProfile,
      updatedAt: Date.now()
    });
    console.log('User profile data updated');
  } catch (error) {
    console.error('Error updating user profile data:', error);
    throw error;
  }
};
