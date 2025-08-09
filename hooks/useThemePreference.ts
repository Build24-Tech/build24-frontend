'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { ThemePreference } from '@/types/user';
import { doc, updateDoc } from 'firebase/firestore';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react';

export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const { user, userProfile, refreshUserProfile } = useAuth();

  // Sync theme with user profile when user logs in or profile changes
  useEffect(() => {
    if (userProfile?.theme && userProfile.theme !== theme) {
      setTheme(userProfile.theme);
    }
  }, [userProfile?.theme, theme, setTheme]);

  // Update theme preference in Firestore and local storage
  const updateThemePreference = useCallback(
    async (newTheme: ThemePreference) => {
      try {
        // Update local theme immediately
        setTheme(newTheme);

        // Update user profile in Firestore if user is authenticated
        if (user && userProfile) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            theme: newTheme,
            updatedAt: Date.now(),
          });

          // Refresh user profile to get updated data
          await refreshUserProfile();
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
        // Revert theme if Firestore update fails
        if (userProfile?.theme) {
          setTheme(userProfile.theme);
        }
      }
    },
    [user, userProfile, setTheme, refreshUserProfile]
  );

  return {
    theme: theme as ThemePreference,
    setTheme: updateThemePreference,
    isLoading: !theme, // theme is undefined during hydration
  };
}
