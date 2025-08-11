import { db } from '@/lib/firebase';
import {
  Badge,
  BADGE_THRESHOLDS,
  BadgeCategory,
  TheoryCategory,
  UserProgress,
  UserStats
} from '@/types/knowledge-hub';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

export class ProgressTrackerService {
  private static instance: ProgressTrackerService;

  static getInstance(): ProgressTrackerService {
    if (!ProgressTrackerService.instance) {
      ProgressTrackerService.instance = new ProgressTrackerService();
    }
    return ProgressTrackerService.instance;
  }

  /**
   * Initialize user progress document if it doesn't exist
   */
  async initializeUserProgress(userId: string): Promise<UserProgress> {
    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressDoc = await getDoc(userProgressRef);

    if (!userProgressDoc.exists()) {
      const initialProgress: Omit<UserProgress, 'createdAt' | 'updatedAt'> = {
        userId,
        readTheories: [],
        bookmarkedTheories: [],
        badges: [],
        stats: {
          totalReadTime: 0,
          theoriesRead: 0,
          categoriesExplored: [],
          lastActiveDate: new Date(),
          streakDays: 1,
          averageSessionTime: 0
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: true
        }
      };

      await setDoc(userProgressRef, {
        ...initialProgress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        ...initialProgress,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const data = userProgressDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      stats: {
        ...data.stats,
        lastActiveDate: data.stats.lastActiveDate?.toDate() || new Date()
      },
      badges: data.badges?.map((badge: any) => ({
        ...badge,
        earnedAt: badge.earnedAt?.toDate() || new Date()
      })) || []
    } as UserProgress;
  }

  /**
   * Get user progress from Firestore
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);

      if (!userProgressDoc.exists()) {
        return null;
      }

      const data = userProgressDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        stats: {
          ...data.stats,
          lastActiveDate: data.stats.lastActiveDate?.toDate() || new Date()
        },
        badges: data.badges?.map((badge: any) => ({
          ...badge,
          earnedAt: badge.earnedAt?.toDate() || new Date()
        })) || []
      } as UserProgress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  /**
   * Mark a theory as read and update progress
   */
  async markTheoryAsRead(
    userId: string,
    theoryId: string,
    category: TheoryCategory,
    readTime: number
  ): Promise<{ newBadges: Badge[]; updatedProgress: UserProgress }> {
    const userProgress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);

    // Don't add if already read
    if (userProgress.readTheories.includes(theoryId)) {
      return { newBadges: [], updatedProgress: userProgress };
    }

    // Update read theories
    const updatedReadTheories = [...userProgress.readTheories, theoryId];

    // Update categories explored
    const updatedCategoriesExplored = userProgress.stats.categoriesExplored.includes(category)
      ? userProgress.stats.categoriesExplored
      : [...userProgress.stats.categoriesExplored, category];

    // Update stats
    const updatedStats: UserStats = {
      ...userProgress.stats,
      totalReadTime: userProgress.stats.totalReadTime + readTime,
      theoriesRead: updatedReadTheories.length,
      categoriesExplored: updatedCategoriesExplored,
      lastActiveDate: new Date(),
      streakDays: this.calculateStreakDays(userProgress.stats.lastActiveDate),
      averageSessionTime: this.calculateAverageSessionTime(
        userProgress.stats.totalReadTime + readTime,
        userProgress.stats.theoriesRead + 1
      )
    };

    // Check for new badges
    const newBadges = this.checkForNewBadges(userProgress, {
      readTheories: updatedReadTheories,
      stats: updatedStats,
      bookmarkedTheories: userProgress.bookmarkedTheories
    });

    // Update progress object
    const updatedProgress: UserProgress = {
      ...userProgress,
      readTheories: updatedReadTheories,
      stats: updatedStats,
      badges: [...userProgress.badges, ...newBadges],
      updatedAt: new Date()
    };

    // Save to Firestore
    await this.saveUserProgress(updatedProgress);

    return { newBadges, updatedProgress };
  }

  /**
   * Add or remove bookmark and update progress
   */
  async updateBookmark(
    userId: string,
    theoryId: string,
    isBookmarked: boolean
  ): Promise<{ newBadges: Badge[]; updatedProgress: UserProgress }> {
    const userProgress = await this.getUserProgress(userId) || await this.initializeUserProgress(userId);

    let updatedBookmarks: string[];
    if (isBookmarked) {
      updatedBookmarks = userProgress.bookmarkedTheories.includes(theoryId)
        ? userProgress.bookmarkedTheories
        : [...userProgress.bookmarkedTheories, theoryId];
    } else {
      updatedBookmarks = userProgress.bookmarkedTheories.filter(id => id !== theoryId);
    }

    // Check for new badges
    const newBadges = this.checkForNewBadges(userProgress, {
      readTheories: userProgress.readTheories,
      stats: userProgress.stats,
      bookmarkedTheories: updatedBookmarks
    });

    // Update progress object
    const updatedProgress: UserProgress = {
      ...userProgress,
      bookmarkedTheories: updatedBookmarks,
      badges: [...userProgress.badges, ...newBadges],
      updatedAt: new Date()
    };

    // Save to Firestore
    await this.saveUserProgress(updatedProgress);

    return { newBadges, updatedProgress };
  }

  /**
   * Save user progress to Firestore
   */
  private async saveUserProgress(userProgress: UserProgress): Promise<void> {
    const userProgressRef = doc(db, 'userProgress', userProgress.userId);
    await updateDoc(userProgressRef, {
      ...userProgress,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Check for new badges based on updated progress
   */
  private checkForNewBadges(
    currentProgress: UserProgress,
    updatedData: {
      readTheories: string[];
      stats: UserStats;
      bookmarkedTheories: string[];
    }
  ): Badge[] {
    const newBadges: Badge[] = [];
    const existingBadgeIds = new Set(currentProgress.badges.map(badge => badge.id));

    // Reading badges
    const theoriesReadCount = updatedData.readTheories.length;
    const readingBadges = [
      {
        id: 'first-theory',
        name: 'First Steps',
        description: 'Read your first theory',
        category: BadgeCategory.READING,
        threshold: BADGE_THRESHOLDS.FIRST_THEORY
      },
      {
        id: 'theory-explorer',
        name: 'Theory Explorer',
        description: 'Read 5 theories',
        category: BadgeCategory.READING,
        threshold: BADGE_THRESHOLDS.THEORY_EXPLORER
      },
      {
        id: 'theory-enthusiast',
        name: 'Theory Enthusiast',
        description: 'Read 15 theories',
        category: BadgeCategory.READING,
        threshold: BADGE_THRESHOLDS.THEORY_ENTHUSIAST
      },
      {
        id: 'theory-master',
        name: 'Theory Master',
        description: 'Read 50 theories',
        category: BadgeCategory.READING,
        threshold: BADGE_THRESHOLDS.THEORY_MASTER
      }
    ];

    for (const badgeTemplate of readingBadges) {
      if (theoriesReadCount >= badgeTemplate.threshold && !existingBadgeIds.has(badgeTemplate.id)) {
        newBadges.push({
          ...badgeTemplate,
          earnedAt: new Date(),
          requirements: {
            type: 'theories_read',
            threshold: badgeTemplate.threshold
          }
        });
      }
    }

    // Exploration badges
    const categoriesExploredCount = updatedData.stats.categoriesExplored.length;
    const explorationBadges = [
      {
        id: 'category-explorer',
        name: 'Category Explorer',
        description: 'Explore 3 different categories',
        category: BadgeCategory.EXPLORATION,
        threshold: BADGE_THRESHOLDS.CATEGORY_EXPLORER
      },
      {
        id: 'category-master',
        name: 'Category Master',
        description: 'Explore all 5 categories',
        category: BadgeCategory.EXPLORATION,
        threshold: BADGE_THRESHOLDS.CATEGORY_MASTER
      }
    ];

    for (const badgeTemplate of explorationBadges) {
      if (categoriesExploredCount >= badgeTemplate.threshold && !existingBadgeIds.has(badgeTemplate.id)) {
        newBadges.push({
          ...badgeTemplate,
          earnedAt: new Date(),
          requirements: {
            type: 'categories_explored',
            threshold: badgeTemplate.threshold
          }
        });
      }
    }

    // Time spent badges
    const totalReadTime = updatedData.stats.totalReadTime;
    const timeSpentBadges = [
      {
        id: 'hour-scholar',
        name: 'Hour Scholar',
        description: 'Spend 1 hour reading theories',
        category: BadgeCategory.ENGAGEMENT,
        threshold: BADGE_THRESHOLDS.TIME_SPENT_HOUR
      },
      {
        id: 'day-scholar',
        name: 'Day Scholar',
        description: 'Spend 8 hours reading theories',
        category: BadgeCategory.ENGAGEMENT,
        threshold: BADGE_THRESHOLDS.TIME_SPENT_DAY
      }
    ];

    for (const badgeTemplate of timeSpentBadges) {
      if (totalReadTime >= badgeTemplate.threshold && !existingBadgeIds.has(badgeTemplate.id)) {
        newBadges.push({
          ...badgeTemplate,
          earnedAt: new Date(),
          requirements: {
            type: 'time_spent',
            threshold: badgeTemplate.threshold
          }
        });
      }
    }

    // Bookmark badges
    const bookmarkCount = updatedData.bookmarkedTheories.length;
    const bookmarkBadges = [
      {
        id: 'bookmark-collector',
        name: 'Bookmark Collector',
        description: 'Bookmark 10 theories',
        category: BadgeCategory.ENGAGEMENT,
        threshold: BADGE_THRESHOLDS.BOOKMARK_COLLECTOR
      },
      {
        id: 'bookmark-curator',
        name: 'Bookmark Curator',
        description: 'Bookmark 25 theories',
        category: BadgeCategory.ENGAGEMENT,
        threshold: BADGE_THRESHOLDS.BOOKMARK_CURATOR
      }
    ];

    for (const badgeTemplate of bookmarkBadges) {
      if (bookmarkCount >= badgeTemplate.threshold && !existingBadgeIds.has(badgeTemplate.id)) {
        newBadges.push({
          ...badgeTemplate,
          earnedAt: new Date(),
          requirements: {
            type: 'bookmarks_created',
            threshold: badgeTemplate.threshold
          }
        });
      }
    }

    return newBadges;
  }

  /**
   * Calculate streak days based on last active date
   */
  private calculateStreakDays(lastActiveDate: Date): number {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastActive = new Date(lastActiveDate);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, maintain streak
      return 1;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      return 1; // This would need to be calculated based on existing streak
    } else {
      // Streak broken, reset to 1
      return 1;
    }
  }

  /**
   * Calculate average session time
   */
  private calculateAverageSessionTime(totalReadTime: number, theoriesRead: number): number {
    return theoriesRead > 0 ? Math.round(totalReadTime / theoriesRead) : 0;
  }

  /**
   * Get badge by ID
   */
  getBadgeById(badgeId: string): Badge | null {
    // This would typically come from a badges configuration
    const badgeTemplates: Record<string, Omit<Badge, 'earnedAt'>> = {
      'first-theory': {
        id: 'first-theory',
        name: 'First Steps',
        description: 'Read your first theory',
        category: BadgeCategory.READING,
        requirements: { type: 'theories_read', threshold: 1 }
      },
      'theory-explorer': {
        id: 'theory-explorer',
        name: 'Theory Explorer',
        description: 'Read 5 theories',
        category: BadgeCategory.READING,
        requirements: { type: 'theories_read', threshold: 5 }
      },
      'theory-enthusiast': {
        id: 'theory-enthusiast',
        name: 'Theory Enthusiast',
        description: 'Read 15 theories',
        category: BadgeCategory.READING,
        requirements: { type: 'theories_read', threshold: 15 }
      },
      'theory-master': {
        id: 'theory-master',
        name: 'Theory Master',
        description: 'Read 50 theories',
        category: BadgeCategory.READING,
        requirements: { type: 'theories_read', threshold: 50 }
      },
      'category-explorer': {
        id: 'category-explorer',
        name: 'Category Explorer',
        description: 'Explore 3 different categories',
        category: BadgeCategory.EXPLORATION,
        requirements: { type: 'categories_explored', threshold: 3 }
      },
      'category-master': {
        id: 'category-master',
        name: 'Category Master',
        description: 'Explore all 5 categories',
        category: BadgeCategory.EXPLORATION,
        requirements: { type: 'categories_explored', threshold: 5 }
      },
      'hour-scholar': {
        id: 'hour-scholar',
        name: 'Hour Scholar',
        description: 'Spend 1 hour reading theories',
        category: BadgeCategory.ENGAGEMENT,
        requirements: { type: 'time_spent', threshold: 60 }
      },
      'day-scholar': {
        id: 'day-scholar',
        name: 'Day Scholar',
        description: 'Spend 8 hours reading theories',
        category: BadgeCategory.ENGAGEMENT,
        requirements: { type: 'time_spent', threshold: 480 }
      },
      'bookmark-collector': {
        id: 'bookmark-collector',
        name: 'Bookmark Collector',
        description: 'Bookmark 10 theories',
        category: BadgeCategory.ENGAGEMENT,
        requirements: { type: 'bookmarks_created', threshold: 10 }
      },
      'bookmark-curator': {
        id: 'bookmark-curator',
        name: 'Bookmark Curator',
        description: 'Bookmark 25 theories',
        category: BadgeCategory.ENGAGEMENT,
        requirements: { type: 'bookmarks_created', threshold: 25 }
      }
    };

    const template = badgeTemplates[badgeId];
    return template ? { ...template, earnedAt: new Date() } : null;
  }
}

export const progressTracker = ProgressTrackerService.getInstance();
