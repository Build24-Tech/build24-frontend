import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface TheoryAnalytics {
  theoryId: string;
  viewCount: number;
  totalReadTime: number;
  bookmarkCount: number;
  averageReadTime: number;
  popularityScore: number;
  lastUpdated: Timestamp;
  dailyViews: Record<string, number>;
  userEngagement: {
    uniqueViewers: number;
    returningViewers: number;
    completionRate: number;
  };
}

export interface UserInteraction {
  userId: string;
  theoryId: string;
  action: 'view' | 'bookmark' | 'unbookmark' | 'complete_reading';
  timestamp: Timestamp;
  sessionDuration?: number;
  metadata?: Record<string, any>;
}

export interface TrendingTheory {
  theoryId: string;
  title: string;
  category: string;
  viewCount: number;
  popularityScore: number;
  trendScore: number;
}

class AnalyticsService {
  private readonly ANALYTICS_COLLECTION = 'theoryAnalytics';
  private readonly INTERACTIONS_COLLECTION = 'userInteractions';
  private readonly TRENDING_COLLECTION = 'trendingTheories';

  /**
   * Track a theory view event
   */
  async trackTheoryView(theoryId: string, userId: string, sessionDuration?: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, theoryId);

      // Update theory analytics
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const currentData = analyticsDoc.data() as TheoryAnalytics;
        const dailyViews = currentData.dailyViews || {};
        dailyViews[today] = (dailyViews[today] || 0) + 1;

        await updateDoc(analyticsRef, {
          viewCount: increment(1),
          totalReadTime: increment(sessionDuration || 0),
          dailyViews,
          lastUpdated: serverTimestamp(),
          'userEngagement.uniqueViewers': increment(1)
        });
      } else {
        const initialData: Partial<TheoryAnalytics> = {
          theoryId,
          viewCount: 1,
          totalReadTime: sessionDuration || 0,
          bookmarkCount: 0,
          averageReadTime: sessionDuration || 0,
          popularityScore: 1,
          lastUpdated: serverTimestamp() as Timestamp,
          dailyViews: { [today]: 1 },
          userEngagement: {
            uniqueViewers: 1,
            returningViewers: 0,
            completionRate: 0
          }
        };

        await setDoc(analyticsRef, initialData);
      }

      // Log user interaction
      await this.logUserInteraction(userId, theoryId, 'view', sessionDuration);

      // Update popularity score
      await this.updatePopularityScore(theoryId);

    } catch (error) {
      console.error('Error tracking theory view:', error);
    }
  }

  /**
   * Track bookmark events
   */
  async trackBookmark(theoryId: string, userId: string, action: 'bookmark' | 'unbookmark'): Promise<void> {
    try {
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, theoryId);
      const increment_value = action === 'bookmark' ? 1 : -1;

      await updateDoc(analyticsRef, {
        bookmarkCount: increment(increment_value),
        lastUpdated: serverTimestamp()
      });

      await this.logUserInteraction(userId, theoryId, action);
      await this.updatePopularityScore(theoryId);

    } catch (error) {
      console.error('Error tracking bookmark:', error);
    }
  }

  /**
   * Track reading completion
   */
  async trackReadingCompletion(theoryId: string, userId: string, readTime: number): Promise<void> {
    try {
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, theoryId);

      await updateDoc(analyticsRef, {
        totalReadTime: increment(readTime),
        'userEngagement.completionRate': increment(0.01), // Simplified increment
        lastUpdated: serverTimestamp()
      });

      await this.logUserInteraction(userId, theoryId, 'complete_reading', readTime);

    } catch (error) {
      console.error('Error tracking reading completion:', error);
    }
  }

  /**
   * Log individual user interactions
   */
  private async logUserInteraction(
    userId: string,
    theoryId: string,
    action: UserInteraction['action'],
    sessionDuration?: number
  ): Promise<void> {
    try {
      const interactionRef = doc(collection(db, this.INTERACTIONS_COLLECTION));

      const interaction: UserInteraction = {
        userId,
        theoryId,
        action,
        timestamp: serverTimestamp() as Timestamp,
        sessionDuration,
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          referrer: typeof window !== 'undefined' ? document.referrer : null
        }
      };

      await setDoc(interactionRef, interaction);

    } catch (error) {
      console.error('Error logging user interaction:', error);
    }
  }

  /**
   * Calculate and update popularity score
   */
  private async updatePopularityScore(theoryId: string): Promise<void> {
    try {
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, theoryId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data() as TheoryAnalytics;

        // Calculate popularity score based on views, bookmarks, and recency
        const viewWeight = 1;
        const bookmarkWeight = 3;
        const recencyWeight = 0.1;

        const daysSinceUpdate = data.lastUpdated
          ? Math.floor((Date.now() - data.lastUpdated.toMillis()) / (1000 * 60 * 60 * 24))
          : 0;

        const recencyFactor = Math.max(0.1, 1 - (daysSinceUpdate * recencyWeight));

        const popularityScore = Math.round(
          (data.viewCount * viewWeight + data.bookmarkCount * bookmarkWeight) * recencyFactor
        );

        await updateDoc(analyticsRef, {
          popularityScore,
          averageReadTime: data.viewCount > 0 ? Math.round(data.totalReadTime / data.viewCount) : 0
        });
      }

    } catch (error) {
      console.error('Error updating popularity score:', error);
    }
  }

  /**
   * Get trending theories
   */
  async getTrendingTheories(limitCount: number = 10): Promise<TrendingTheory[]> {
    try {
      const analyticsQuery = query(
        collection(db, this.ANALYTICS_COLLECTION),
        orderBy('popularityScore', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(analyticsQuery);
      const trending: TrendingTheory[] = [];

      snapshot.forEach(doc => {
        const data = doc.data() as TheoryAnalytics;

        // Calculate trend score based on recent activity
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const todayViews = data.dailyViews?.[today] || 0;
        const yesterdayViews = data.dailyViews?.[yesterday] || 0;

        const trendScore = todayViews + (todayViews - yesterdayViews) * 0.5;

        trending.push({
          theoryId: data.theoryId,
          title: '', // Will be populated by caller
          category: '', // Will be populated by caller
          viewCount: data.viewCount,
          popularityScore: data.popularityScore,
          trendScore
        });
      });

      return trending.sort((a, b) => b.trendScore - a.trendScore);

    } catch (error) {
      console.error('Error getting trending theories:', error);
      return [];
    }
  }

  /**
   * Get theory analytics
   */
  async getTheoryAnalytics(theoryId: string): Promise<TheoryAnalytics | null> {
    try {
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, theoryId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        return analyticsDoc.data() as TheoryAnalytics;
      }

      return null;

    } catch (error) {
      console.error('Error getting theory analytics:', error);
      return null;
    }
  }

  /**
   * Get user interaction history
   */
  async getUserInteractions(userId: string, limitCount: number = 50): Promise<UserInteraction[]> {
    try {
      const interactionsQuery = query(
        collection(db, this.INTERACTIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(interactionsQuery);
      const interactions: UserInteraction[] = [];

      snapshot.forEach(doc => {
        interactions.push(doc.data() as UserInteraction);
      });

      return interactions;

    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  }

  /**
   * Get analytics summary for admin dashboard
   */
  async getAnalyticsSummary(): Promise<{
    totalViews: number;
    totalTheories: number;
    averageEngagement: number;
    topCategories: Record<string, number>;
  }> {
    try {
      const analyticsQuery = query(collection(db, this.ANALYTICS_COLLECTION));
      const snapshot = await getDocs(analyticsQuery);

      let totalViews = 0;
      let totalTheories = 0;
      let totalEngagement = 0;
      const categoryViews: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data() as TheoryAnalytics;
        totalViews += data.viewCount;
        totalTheories += 1;
        totalEngagement += data.popularityScore;
      });

      return {
        totalViews,
        totalTheories,
        averageEngagement: totalTheories > 0 ? Math.round(totalEngagement / totalTheories) : 0,
        topCategories: categoryViews
      };

    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalViews: 0,
        totalTheories: 0,
        averageEngagement: 0,
        topCategories: {}
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
