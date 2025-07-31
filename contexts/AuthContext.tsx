'use client';

import { appleProvider, auth, githubProvider, googleProvider } from '@/lib/firebase';
import { createUserProfile, getUserProfile, updateUserLanguage } from '@/lib/firestore';
import { UserLanguage, UserProfile } from '@/types/user';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithGithub: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateLanguage: (language: UserLanguage) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }

      // Store user information in Firestore with status 'onboarding'
      await createUserProfile(result.user, 'onboarding');

      return result.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Store or update user information in Firestore
      await createUserProfile(result.user);

      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithGithub = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, githubProvider);

      // Store or update user information in Firestore
      await createUserProfile(result.user);

      return result.user;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const signInWithApple = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, appleProvider);

      // Store or update user information in Firestore
      await createUserProfile(result.user);

      return result.user;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updateLanguage = async (language: UserLanguage): Promise<void> => {
    if (user) {
      await updateUserLanguage(user.uid, language);
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, language });
      }
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signInWithApple,
    logout,
    resetPassword,
    updateLanguage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
