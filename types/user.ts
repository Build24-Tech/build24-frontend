export type UserStatus = 'active' | 'inactive' | 'onboarding';

export type UserLanguage = 'en' | 'cn' | 'jp' | 'vn';

export type ThemePreference = 'light' | 'dark' | 'system';

export type UserTier = 'free' | 'premium';

export interface UserSubscription {
  tier: UserTier;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: UserStatus;
  emailUpdates: boolean;
  language: UserLanguage;
  theme: ThemePreference;
  subscription: UserSubscription;
  createdAt: number;
  updatedAt: number;
}
