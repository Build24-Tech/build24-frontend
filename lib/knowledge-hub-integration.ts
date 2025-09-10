import { UserProgress } from '@/types/knowledge-hub';
import { UserProfile } from '@/types/user';
import { User } from 'firebase/auth';
import { getUserProfile, updateUserProfile } from './firestore';

/**
 * Service for integrating Knowledge Hub with existing Build24 systems
 */
export class KnowledgeHubIntegrationService {
  /**
   * Sync Knowledge Hub progress with user profile
   */
  static async syncProgressWithProfile(
    user: User,
    knowledgeHubProgress: UserProgress
  ): Promise<void> {
    try {
      const userProfile = await getUserProfile(user.uid);

      // Update user profile with Knowledge Hub stats
      const updatedProfile: Partial<UserProfile> = {
        ...userProfile,
        knowledgeHub: {
          theoriesRead: knowledgeHubProgress.stats.theoriesRead,
          totalReadTime: knowledgeHubProgress.stats.totalReadTime,
          badgesEarned: knowledgeHubProgress.badges.length,
          lastActiveDate: knowledgeHubProgress.stats.lastActiveDate,
          favoriteCategories: knowledgeHubProgress.stats.categoriesExplored.slice(0, 3),
          completionRate: this.calculateCompletionRate(knowledgeHubProgress)
        }
      };

      await updateUserProfile(user.uid, updatedProfile);
    } catch (error) {
      console.error('Error syncing Knowledge Hub progress with profile:', error);
    }
  }

  /**
   * Get user's Knowledge Hub preferences based on their profile
   */
  static async getUserPreferences(user: User): Promise<{
    preferredCategories: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    contentTypes: string[];
  }> {
    try {
      const userProfile = await getUserProfile(user.uid);

      // Infer preferences from user profile and activity
      const preferences = {
        preferredCategories: userProfile.knowledgeHub?.favoriteCategories || [],
        difficultyLevel: this.inferDifficultyLevel(userProfile),
        contentTypes: this.inferContentTypes(userProfile)
      };

      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        preferredCategories: [],
        difficultyLevel: 'beginner',
        contentTypes: ['theory', 'example']
      };
    }
  }

  /**
   * Track user engagement for analytics
   */
  static async trackEngagement(
    user: User,
    action: 'theory_view' | 'bookmark_add' | 'bookmark_remove' | 'search' | 'category_browse',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // This would integrate with your existing analytics system
      const engagementData = {
        userId: user.uid,
        action,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      };

      // Send to analytics service (Firebase Analytics, Google Analytics, etc.)
      console.log('Knowledge Hub engagement tracked:', engagementData);
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  /**
   * Get personalized dashboard data
   */
  static async getDashboardData(user: User): Promise<{
    recentActivity: any[];
    recommendations: any[];
    progressSummary: any;
    achievements: any[];
  }> {
    try {
      const userProfile = await getUserProfile(user.uid);

      return {
        recentActivity: this.getRecentActivity(userProfile),
        recommendations: await this.getPersonalizedRecommendations(userProfile),
        progressSummary: this.getProgressSummary(userProfile),
        achievements: this.getRecentAchievements(userProfile)
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return {
        recentActivity: [],
        recommendations: [],
        progressSummary: {},
        achievements: []
      };
    }
  }

  /**
   * Check if user has access to premium Knowledge Hub features
   */
  static async checkPremiumAccess(user: User): Promise<boolean> {
    try {
      const userProfile = await getUserProfile(user.uid);

      // Check subscription status, user tier, or other premium indicators
      return userProfile.subscription?.status === 'active' ||
        userProfile.tier === 'premium' ||
        userProfile.tier === 'pro';
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  /**
   * Update user's Knowledge Hub onboarding status
   */
  static async updateOnboardingStatus(
    user: User,
    step: 'welcome' | 'categories' | 'first_theory' | 'bookmark' | 'completed'
  ): Promise<void> {
    try {
      const userProfile = await getUserProfile(user.uid);

      const updatedProfile: Partial<UserProfile> = {
        ...userProfile,
        knowledgeHub: {
          ...userProfile.knowledgeHub,
          onboardingStep: step,
          onboardingCompletedAt: step === 'completed' ? new Date() : undefined
        }
      };

      await updateUserProfile(user.uid, updatedProfile);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  }

  // Private helper methods

  private static calculateCompletionRate(progress: UserProgress): number {
    const totalTheories = 30; // Approximate total theories available
    return Math.min((progress.stats.theoriesRead / totalTheories) * 100, 100);
  }

  private static inferDifficultyLevel(userProfile: UserProfile): 'beginner' | 'intermediate' | 'advanced' {
    const theoriesRead = userProfile.knowledgeHub?.theoriesRead || 0;

    if (theoriesRead < 5) return 'beginner';
    if (theoriesRead < 15) return 'intermediate';
    return 'advanced';
  }

  private static inferContentTypes(userProfile: UserProfile): string[] {
    const baseTypes = ['theory', 'example'];

    // Add premium content types if user has access
    if (userProfile.subscription?.status === 'active') {
      baseTypes.push('case-study', 'template', 'advanced-guide');
    }

    return baseTypes;
  }

  private static getRecentActivity(userProfile: UserProfile): any[] {
    // Mock recent activity - in real implementation, this would query activity logs
    return [
      {
        type: 'theory_read',
        title: 'Anchoring Bias',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: 'cognitive-biases'
      },
      {
        type: 'bookmark_added',
        title: 'Social Proof',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        category: 'persuasion-principles'
      }
    ];
  }

  private static async getPersonalizedRecommendations(userProfile: UserProfile): Promise<any[]> {
    // Mock recommendations based on user profile
    const favoriteCategories = userProfile.knowledgeHub?.favoriteCategories || [];

    return [
      {
        type: 'theory',
        title: 'Loss Aversion',
        category: 'behavioral-economics',
        reason: 'Based on your interest in cognitive biases',
        readTime: 4
      },
      {
        type: 'blog-post',
        title: 'Psychology in Product Design',
        reason: 'Complements your recent reading',
        readTime: 8
      }
    ];
  }

  private static getProgressSummary(userProfile: UserProfile): any {
    return {
      theoriesRead: userProfile.knowledgeHub?.theoriesRead || 0,
      totalReadTime: userProfile.knowledgeHub?.totalReadTime || 0,
      badgesEarned: userProfile.knowledgeHub?.badgesEarned || 0,
      completionRate: userProfile.knowledgeHub?.completionRate || 0,
      streak: this.calculateReadingStreak(userProfile),
      nextMilestone: this.getNextMilestone(userProfile)
    };
  }

  private static getRecentAchievements(userProfile: UserProfile): any[] {
    // Mock recent achievements
    return [
      {
        id: 'first-theory',
        name: 'First Steps',
        description: 'Read your first theory',
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: '🎯'
      }
    ];
  }

  private static calculateReadingStreak(userProfile: UserProfile): number {
    // Mock streak calculation
    return 3; // 3 days
  }

  private static getNextMilestone(userProfile: UserProfile): any {
    const theoriesRead = userProfile.knowledgeHub?.theoriesRead || 0;

    if (theoriesRead < 5) {
      return { target: 5, current: theoriesRead, name: 'Theory Explorer' };
    } else if (theoriesRead < 10) {
      return { target: 10, current: theoriesRead, name: 'Psychology Student' };
    } else if (theoriesRead < 20) {
      return { target: 20, current: theoriesRead, name: 'Behavioral Expert' };
    }

    return { target: 30, current: theoriesRead, name: 'Psychology Master' };
  }
}

// Extend UserProfile type to include Knowledge Hub data
declare module '@/types/user' {
  interface UserProfile {
    knowledgeHub?: {
      theoriesRead: number;
      totalReadTime: number;
      badgesEarned: number;
      lastActiveDate: Date;
      favoriteCategories: string[];
      completionRate: number;
      onboardingStep?: 'welcome' | 'categories' | 'first_theory' | 'bookmark' | 'completed';
      onboardingCompletedAt?: Date;
    };
  }
}
