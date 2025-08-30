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

// Extended profile data for social features
export interface UserProfileData {
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  role?: string;
  showEmail: boolean;
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
}

// Extended UserProfile interface with profile data
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
  profile: UserProfileData;
}

// Follow relationship types
export interface UserFollow {
  followerId: string;
  followingId: string;
  createdAt: number;
  status: 'active' | 'blocked';
}

// Public profile view interface (for displaying profiles to other users)
export interface PublicProfileView {
  uid: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  role?: string;
  email?: string; // Only if showEmail is true
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean; // For authenticated users viewing other profiles
}
// Profile error types
export enum ProfileError {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_PRIVATE = 'PROFILE_PRIVATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

// Follow system error types
export enum FollowError {
  CANNOT_FOLLOW_SELF = 'CANNOT_FOLLOW_SELF',
  ALREADY_FOLLOWING = 'ALREADY_FOLLOWING',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FOLLOW_LIMIT_EXCEEDED = 'FOLLOW_LIMIT_EXCEEDED'
}

// Service interfaces for type safety
export interface ProfileService {
  getPublicProfile(userId: string): Promise<PublicProfileView | null>;
  updateProfile(userId: string, data: Partial<UserProfileData>): Promise<void>;
  togglePrivacy(userId: string, isPublic: boolean): Promise<void>;
  uploadProfileImage(userId: string, file: File): Promise<string>;
}

export interface FollowService {
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string, limit?: number): Promise<PublicProfileView[]>;
  getFollowing(userId: string, limit?: number): Promise<PublicProfileView[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}

// Component prop interfaces
export interface ProfilePageProps {
  userId: string;
  currentUserId?: string;
}

export interface ProfileEditFormProps {
  initialData: UserProfileData;
  onSave: (data: UserProfileData) => Promise<void>;
  onCancel: () => void;
}

export interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialFollowState: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export interface AuthorProfileLinkProps {
  authorId?: string;
  authorName?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
