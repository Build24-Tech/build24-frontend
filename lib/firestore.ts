import { ThemePreference, UserLanguage, UserProfile, UserStatus } from '@/types/user';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getDefaultSubscription } from './subscription-service';

/**
 * Creates or updates a user profile in Firestore
 */
export const createUserProfile = async (user: User, status: UserStatus = 'onboarding', emailUpdates: boolean = false, language: UserLanguage = 'en', theme: ThemePreference = 'system'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const timestamp = Date.now();

    if (!userSnap.exists()) {
      // Create new user profile
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
      };

      await setDoc(userRef, userData);
      console.log('User profile created');
    } else {
      // Update existing user profile
      await updateDoc(userRef, {
        email: user.email || '',
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        updatedAt: timestamp,
      });
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
