import {
  calculateYearlySavings,
  generateUpgradeUrl,
  getDefaultSubscription,
  getSubscriptionPlan,
  getSubscriptionStatusText,
  getUserTier,
  handleSubscriptionWebhook,
  hasPremiumAccess,
  isSubscriptionActive,
  isSubscriptionExpiringSoon,
  SUBSCRIPTION_PLANS,
  updateUserSubscription
} from '@/lib/subscription-service';
import { UserProfile, UserSubscription } from '@/types/user';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;

describe('Subscription Service', () => {
  const mockUserProfile: UserProfile = {
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    status: 'active',
    emailUpdates: false,
    language: 'en',
    theme: 'dark',
    subscription: {
      tier: 'free',
      subscriptionStatus: 'active'
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPremiumAccess', () => {
    it('should return false for null user profile', () => {
      expect(hasPremiumAccess(null)).toBe(false);
    });

    it('should return false for free tier users', () => {
      expect(hasPremiumAccess(mockUserProfile)).toBe(false);
    });

    it('should return true for premium tier with active subscription', () => {
      const premiumUser = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const,
          subscriptionStatus: 'active' as const
        }
      };
      expect(hasPremiumAccess(premiumUser)).toBe(true);
    });

    it('should return true for premium tier with trialing subscription', () => {
      const trialingUser = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const,
          subscriptionStatus: 'trialing' as const
        }
      };
      expect(hasPremiumAccess(trialingUser)).toBe(true);
    });

    it('should return false for premium tier with canceled subscription', () => {
      const canceledUser = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const,
          subscriptionStatus: 'canceled' as const
        }
      };
      expect(hasPremiumAccess(canceledUser)).toBe(false);
    });

    it('should return true for premium tier with no subscription status', () => {
      const premiumUser = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const
        }
      };
      expect(hasPremiumAccess(premiumUser)).toBe(true);
    });
  });

  describe('getUserTier', () => {
    it('should return free for null user profile', () => {
      expect(getUserTier(null)).toBe('free');
    });

    it('should return user subscription tier', () => {
      const premiumUser = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const,
          subscriptionStatus: 'active' as const
        }
      };
      expect(getUserTier(premiumUser)).toBe('premium');
    });

    it('should default to free if no subscription', () => {
      const userWithoutSubscription = {
        ...mockUserProfile,
        subscription: undefined as any
      };
      expect(getUserTier(userWithoutSubscription)).toBe('free');
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true for free tier', () => {
      const freeSubscription: UserSubscription = {
        tier: 'free'
      };
      expect(isSubscriptionActive(freeSubscription)).toBe(true);
    });

    it('should return true for active premium subscription within period', () => {
      const activeSubscription: UserSubscription = {
        tier: 'premium',
        subscriptionStatus: 'active',
        currentPeriodEnd: Date.now() + 86400000 // 1 day from now
      };
      expect(isSubscriptionActive(activeSubscription)).toBe(true);
    });

    it('should return false for expired subscription', () => {
      const expiredSubscription: UserSubscription = {
        tier: 'premium',
        subscriptionStatus: 'active',
        currentPeriodEnd: Date.now() - 86400000 // 1 day ago
      };
      expect(isSubscriptionActive(expiredSubscription)).toBe(false);
    });

    it('should return false for canceled subscription', () => {
      const canceledSubscription: UserSubscription = {
        tier: 'premium',
        subscriptionStatus: 'canceled',
        currentPeriodEnd: Date.now() + 86400000
      };
      expect(isSubscriptionActive(canceledSubscription)).toBe(false);
    });
  });

  describe('updateUserSubscription', () => {
    it('should update user subscription in Firestore', async () => {
      const userId = 'test-user';
      const subscriptionUpdate = {
        tier: 'premium' as const,
        subscriptionStatus: 'active' as const
      };

      const mockDocRef = { id: userId };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateUserSubscription(userId, subscriptionUpdate);

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', userId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          subscription: subscriptionUpdate,
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-user' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(updateUserSubscription('test-user', {})).rejects.toThrow('Failed to update subscription');
    });
  });

  describe('getSubscriptionPlan', () => {
    it('should return correct plan for valid ID', () => {
      const freePlan = getSubscriptionPlan('free');
      expect(freePlan).toEqual(SUBSCRIPTION_PLANS[0]);

      const premiumPlan = getSubscriptionPlan('premium');
      expect(premiumPlan).toEqual(SUBSCRIPTION_PLANS[1]);
    });

    it('should return null for invalid plan ID', () => {
      expect(getSubscriptionPlan('invalid')).toBeNull();
    });
  });

  describe('calculateYearlySavings', () => {
    it('should calculate correct yearly savings', () => {
      const premiumPlan = SUBSCRIPTION_PLANS[1];
      const monthlyTotal = premiumPlan.price.monthly * 12;
      const expectedSavings = monthlyTotal - premiumPlan.price.yearly;

      expect(calculateYearlySavings(premiumPlan)).toBe(expectedSavings);
    });
  });

  describe('getSubscriptionStatusText', () => {
    it('should return correct status text for different subscription states', () => {
      expect(getSubscriptionStatusText({ tier: 'free' })).toBe('Free Plan');
      expect(getSubscriptionStatusText({ tier: 'premium', subscriptionStatus: 'active' })).toBe('Active Premium');
      expect(getSubscriptionStatusText({ tier: 'premium', subscriptionStatus: 'trialing' })).toBe('Premium Trial');
      expect(getSubscriptionStatusText({ tier: 'premium', subscriptionStatus: 'past_due' })).toBe('Payment Past Due');
      expect(getSubscriptionStatusText({ tier: 'premium', subscriptionStatus: 'canceled', cancelAtPeriodEnd: true })).toBe('Canceling at Period End');
      expect(getSubscriptionStatusText({ tier: 'premium', subscriptionStatus: 'canceled', cancelAtPeriodEnd: false })).toBe('Canceled');
      expect(getSubscriptionStatusText({ tier: 'premium' })).toBe('Premium');
    });
  });

  describe('isSubscriptionExpiringSoon', () => {
    it('should return false for free tier', () => {
      expect(isSubscriptionExpiringSoon({ tier: 'free' })).toBe(false);
    });

    it('should return false for subscription without end date', () => {
      expect(isSubscriptionExpiringSoon({ tier: 'premium' })).toBe(false);
    });

    it('should return true for subscription expiring within 7 days', () => {
      const subscription: UserSubscription = {
        tier: 'premium',
        currentPeriodEnd: Date.now() + (5 * 24 * 60 * 60 * 1000) // 5 days from now
      };
      expect(isSubscriptionExpiringSoon(subscription)).toBe(true);
    });

    it('should return false for subscription expiring after 7 days', () => {
      const subscription: UserSubscription = {
        tier: 'premium',
        currentPeriodEnd: Date.now() + (10 * 24 * 60 * 60 * 1000) // 10 days from now
      };
      expect(isSubscriptionExpiringSoon(subscription)).toBe(false);
    });
  });

  describe('generateUpgradeUrl', () => {
    it('should generate correct upgrade URL with default parameters', () => {
      const url = generateUpgradeUrl('monthly');
      expect(url).toBe('/subscribe?plan=monthly&source=knowledge-hub');
    });

    it('should generate correct upgrade URL with custom parameters', () => {
      const url = generateUpgradeUrl('yearly', 'theory-detail', 'user-123');
      expect(url).toBe('/subscribe?plan=yearly&source=theory-detail&userId=user-123');
    });
  });

  describe('handleSubscriptionWebhook', () => {
    it('should handle subscription webhook successfully', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => mockUserProfile
      };

      const mockDocRef = { id: 'test-user' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockUserDoc as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const webhookEvent = {
        type: 'subscription.updated' as const,
        userId: 'test-user',
        subscriptionId: 'sub_123',
        subscriptionData: {
          tier: 'premium' as const,
          subscriptionStatus: 'active' as const
        }
      };

      await handleSubscriptionWebhook(webhookEvent);

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          subscription: expect.objectContaining({
            tier: 'premium',
            subscriptionStatus: 'active',
            subscriptionId: 'sub_123'
          }),
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should throw error for non-existent user', async () => {
      const mockUserDoc = {
        exists: () => false
      };

      const mockDocRef = { id: 'non-existent-user' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockUserDoc as any);

      const webhookEvent = {
        type: 'subscription.updated' as const,
        userId: 'non-existent-user',
        subscriptionId: 'sub_123',
        subscriptionData: {}
      };

      await expect(handleSubscriptionWebhook(webhookEvent)).rejects.toThrow('User non-existent-user not found');
    });
  });

  describe('getDefaultSubscription', () => {
    it('should return default free subscription', () => {
      const defaultSub = getDefaultSubscription();
      expect(defaultSub).toEqual({
        tier: 'free',
        subscriptionStatus: 'active'
      });
    });
  });

  describe('SUBSCRIPTION_PLANS', () => {
    it('should have correct plan structure', () => {
      expect(SUBSCRIPTION_PLANS).toHaveLength(2);

      const freePlan = SUBSCRIPTION_PLANS[0];
      expect(freePlan.id).toBe('free');
      expect(freePlan.tier).toBe('free');
      expect(freePlan.price.monthly).toBe(0);
      expect(freePlan.price.yearly).toBe(0);

      const premiumPlan = SUBSCRIPTION_PLANS[1];
      expect(premiumPlan.id).toBe('premium');
      expect(premiumPlan.tier).toBe('premium');
      expect(premiumPlan.popular).toBe(true);
      expect(premiumPlan.price.monthly).toBeGreaterThan(0);
      expect(premiumPlan.price.yearly).toBeGreaterThan(0);
    });
  });
});
