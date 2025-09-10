import { UserProgress } from '@/types/knowledge-hub';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Service for managing user bookmarks in Firestore
 */
export class BookmarkService {
  private static readonly COLLECTION_NAME = 'userProgress';

  /**
   * Get user's bookmark list
   */
  static async getUserBookmarks(userId: string): Promise<string[]> {
    try {
      const userProgressRef = doc(db, this.COLLECTION_NAME, userId);
      const userProgressSnap = await getDoc(userProgressRef);

      if (userProgressSnap.exists()) {
        const data = userProgressSnap.data() as UserProgress;
        return data.bookmarkedTheories || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      throw new Error('Failed to fetch bookmarks');
    }
  }

  /**
   * Add a theory to user's bookmarks
   */
  static async addBookmark(userId: string, theoryId: string): Promise<void> {
    try {
      const userProgressRef = doc(db, this.COLLECTION_NAME, userId);
      const userProgressSnap = await getDoc(userProgressRef);

      if (userProgressSnap.exists()) {
        const data = userProgressSnap.data() as UserProgress;
        const currentBookmarks = data.bookmarkedTheories || [];

        // Check if already bookmarked
        if (!currentBookmarks.includes(theoryId)) {
          const updatedBookmarks = [...currentBookmarks, theoryId];

          await updateDoc(userProgressRef, {
            bookmarkedTheories: updatedBookmarks,
            updatedAt: new Date()
          });
        }
      } else {
        // Create new user progress document
        const newUserProgress: Partial<UserProgress> = {
          userId,
          readTheories: [],
          bookmarkedTheories: [theoryId],
          badges: [],
          stats: {
            totalReadTime: 0,
            theoriesRead: 0,
            categoriesExplored: [],
            lastActiveDate: new Date(),
            streakDays: 0,
            averageSessionTime: 0
          },
          quizResults: [],
          preferences: {
            emailNotifications: true,
            progressReminders: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(userProgressRef, newUserProgress);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw new Error('Failed to add bookmark');
    }
  }

  /**
   * Remove a theory from user's bookmarks
   */
  static async removeBookmark(userId: string, theoryId: string): Promise<void> {
    try {
      const userProgressRef = doc(db, this.COLLECTION_NAME, userId);
      const userProgressSnap = await getDoc(userProgressRef);

      if (userProgressSnap.exists()) {
        const data = userProgressSnap.data() as UserProgress;
        const currentBookmarks = data.bookmarkedTheories || [];

        const updatedBookmarks = currentBookmarks.filter(id => id !== theoryId);

        await updateDoc(userProgressRef, {
          bookmarkedTheories: updatedBookmarks,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw new Error('Failed to remove bookmark');
    }
  }

  /**
   * Toggle bookmark status for a theory
   */
  static async toggleBookmark(userId: string, theoryId: string): Promise<boolean> {
    try {
      const currentBookmarks = await this.getUserBookmarks(userId);
      const isBookmarked = currentBookmarks.includes(theoryId);

      if (isBookmarked) {
        await this.removeBookmark(userId, theoryId);
        return false;
      } else {
        await this.addBookmark(userId, theoryId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new Error('Failed to toggle bookmark');
    }
  }

  /**
   * Check if a theory is bookmarked by the user
   */
  static async isBookmarked(userId: string, theoryId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      return bookmarks.includes(theoryId);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  /**
   * Get user's complete progress data including bookmarks
   */
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const userProgressRef = doc(db, this.COLLECTION_NAME, userId);
      const userProgressSnap = await getDoc(userProgressRef);

      if (userProgressSnap.exists()) {
        return userProgressSnap.data() as UserProgress;
      }

      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw new Error('Failed to fetch user progress');
    }
  }
}
