import { db } from '@/lib/firebase';
import { UserProfile, UserSubscription, UserTier } from '@/types/user';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: UserTier;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      'Access to basic theory summaries',
      'Category browsing and search',
      'Bookmark up to 10 theories',
      'Basic progress tracking'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: [
      'All free features',
      'Extended case studies',
      'Downloadable resources and templates',
      'Advanced implementation guides',
      'Unlimited bookmarks',
      'Detailed analytics and insights',
      'Priority access to new content',
      'Expert tips and best practices'
    ],
    popular: true
  }
];

/**
 * Check if a user has premium access
 */
export function hasPremiumAccess(userProfile: UserProfile | null): boolean {
  if (!userProfile?.subscription) return false;

  const { tier, subscriptionStatus } = userProfile.subscription;

  // Check if user has premium tier and active subscription
  return tier === 'premium' &&
    (!subscriptionStatus || subscriptionStatus === 'active' || subscriptionStatus === 'trialing');
}

/**
 * Get user's current tier
 */
export function getUserTier(userProfile: UserProfile | null): UserTier {
  return userProfile?.subscription?.tier || 'free';
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.tier === 'free') return true;

  const now = Date.now();
  const isWithinPeriod = !subscription.currentPeriodEnd || now < subscription.currentPeriodEnd;
  const isActiveStatus = !subscription.subscriptionStatus ||
    subscription.subscriptionStatus === 'active' ||
    subscription.subscriptionStatus === 'trialing';

  return isWithinPeriod && isActiveStatus;
}

/**
 * Update user subscription in Firestore
 */
export async function updateUserSubscription(
  userId: string,
  subscription: Partial<UserSubscription>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscription: subscription,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

/**
 * Get subscription plan by ID
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
}

/**
 * Calculate subscription savings for yearly plan
 */
export function calculateYearlySavings(plan: SubscriptionPlan): number {
  const monthlyTotal = plan.price.monthly * 12;
  const yearlyPrice = plan.price.yearly;
  return monthlyTotal - yearlyPrice;
}

/**
 * Get subscription status display text
 */
export function getSubscriptionStatusText(subscription: UserSubscription): string {
  if (subscription.tier === 'free') return 'Free Plan';

  switch (subscription.subscriptionStatus) {
    case 'active':
      return 'Active Premium';
    case 'trialing':
      return 'Premium Trial';
    case 'past_due':
      return 'Payment Past Due';
    case 'canceled':
      return subscription.cancelAtPeriodEnd ? 'Canceling at Period End' : 'Canceled';
    default:
      return 'Premium';
  }
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(subscription: UserSubscription): boolean {
  if (subscription.tier === 'free' || !subscription.currentPeriodEnd) return false;

  const now = Date.now();
  const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);

  return subscription.currentPeriodEnd <= sevenDaysFromNow;
}

/**
 * Generate subscription upgrade URL
 */
export function generateUpgradeUrl(
  plan: 'monthly' | 'yearly',
  source: string = 'knowledge-hub',
  userId?: string
): string {
  const baseUrl = '/subscribe';
  const params = new URLSearchParams({
    plan,
    source,
    ...(userId && { userId })
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Handle subscription webhook events (for integration with payment providers)
 */
export interface SubscriptionWebhookEvent {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed';
  userId: string;
  subscriptionId: string;
  subscriptionData: Partial<UserSubscription>;
}

export async function handleSubscriptionWebhook(event: SubscriptionWebhookEvent): Promise<void> {
  try {
    const userRef = doc(db, 'users', event.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error(`User ${event.userId} not found`);
    }

    const currentUser = userDoc.data() as UserProfile;
    const updatedSubscription: UserSubscription = {
      ...currentUser.subscription,
      ...event.subscriptionData,
      subscriptionId: event.subscriptionId
    };

    await updateDoc(userRef, {
      subscription: updatedSubscription,
      updatedAt: Date.now()
    });

    console.log(`Subscription updated for user ${event.userId}:`, updatedSubscription);
  } catch (error) {
    console.error('Error handling subscription webhook:', error);
    throw error;
  }
}

/**
 * Initialize default subscription for new users
 */
export function getDefaultSubscription(): UserSubscription {
  return {
    tier: 'free',
    subscriptionStatus: 'active'
  };
}
