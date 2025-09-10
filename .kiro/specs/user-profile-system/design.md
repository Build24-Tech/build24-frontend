# Design Document

## Overview

The User Profile System extends the existing Firebase authentication and Firestore infrastructure to provide comprehensive user profiles with privacy controls and social networking features. The system integrates seamlessly with the current authentication flow and enhances content attribution across blog posts and projects.

## Architecture

### Data Layer Architecture

The system leverages the existing Firebase/Firestore infrastructure with the following collections:

```
users/ (existing - extended)
├── {userId}/
│   ├── uid: string
│   ├── email: string
│   ├── displayName?: string
│   ├── photoURL?: string
│   ├── status: UserStatus
│   ├── emailUpdates: boolean
│   ├── language: UserLanguage
│   ├── theme: ThemePreference
│   ├── subscription: UserSubscription
│   ├── createdAt: number
│   ├── updatedAt: number
│   └── profile: UserProfileData (new)

userProfiles/ (new collection)
├── {userId}/
│   ├── userId: string
│   ├── isPublic: boolean
│   ├── bio?: string
│   ├── location?: string
│   ├── website?: string
│   ├── work?: string
│   ├── role?: string
│   ├── showEmail: boolean
│   ├── followerCount: number
│   ├── followingCount: number
│   ├── createdAt: number
│   └── updatedAt: number

userFollows/ (new collection)
├── {followerId}_{followingId}/
│   ├── followerId: string
│   ├── followingId: string
│   ├── createdAt: number
│   └── status: 'active' | 'blocked'
```

### Component Architecture

```
Profile System Components
├── ProfilePage/
│   ├── PublicProfileView
│   ├── PrivateProfileMessage
│   └── ProfileNotFound
├── ProfileManagement/
│   ├── ProfileEditForm
│   ├── PrivacySettings
│   └── ProfileImageUpload
├── SocialFeatures/
│   ├── FollowButton
│   ├── FollowersList
│   ├── FollowingList
│   └── FollowStats
└── ContentAttribution/
    ├── AuthorProfileLink
    ├── AuthorCard
    └── AuthorBadge
```

## Components and Interfaces

### Core Types

```typescript
// Extend existing UserProfile type
interface UserProfileData {
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

interface ExtendedUserProfile extends UserProfile {
  profile: UserProfileData;
}

interface UserFollow {
  followerId: string;
  followingId: string;
  createdAt: number;
  status: 'active' | 'blocked';
}

interface PublicProfileView {
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
  isFollowing?: boolean; // For authenticated users
}
```

### Service Layer

```typescript
// Profile Service
interface ProfileService {
  getPublicProfile(userId: string): Promise<PublicProfileView | null>;
  updateProfile(userId: string, data: Partial<UserProfileData>): Promise<void>;
  togglePrivacy(userId: string, isPublic: boolean): Promise<void>;
  uploadProfileImage(userId: string, file: File): Promise<string>;
}

// Follow Service
interface FollowService {
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string, limit?: number): Promise<PublicProfileView[]>;
  getFollowing(userId: string, limit?: number): Promise<PublicProfileView[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}
```

### Component Interfaces

```typescript
// Profile Page Components
interface ProfilePageProps {
  userId: string;
  currentUserId?: string;
}

interface ProfileEditFormProps {
  initialData: UserProfileData;
  onSave: (data: UserProfileData) => Promise<void>;
  onCancel: () => void;
}

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialFollowState: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

// Content Attribution Components
interface AuthorProfileLinkProps {
  authorId?: string;
  authorName?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

## Data Models

### Extended User Profile Schema

```typescript
// Firestore document structure for users/{userId}
{
  // Existing fields
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
  
  // New profile fields
  profile: {
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
}
```

### Follow Relationship Schema

```typescript
// Firestore document structure for userFollows/{followerId}_{followingId}
{
  followerId: string;
  followingId: string;
  createdAt: number;
  status: 'active' | 'blocked';
}
```

### Content Attribution Integration

```typescript
// Enhanced Post interface (extends existing)
interface EnhancedPost extends Post {
  authorId?: string; // Firebase user ID
  authorProfile?: PublicProfileView; // Populated profile data
}

// Enhanced Project interface (new)
interface Project {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorProfile?: PublicProfileView;
  createdAt: number;
  updatedAt: number;
  // ... other project fields
}
```

## Error Handling

### Profile Access Errors

```typescript
enum ProfileError {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_PRIVATE = 'PROFILE_PRIVATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

interface ProfileErrorHandler {
  handleProfileNotFound(): JSX.Element;
  handlePrivateProfile(): JSX.Element;
  handleUnauthorized(): JSX.Element;
  handleValidationError(errors: string[]): JSX.Element;
}
```

### Follow System Errors

```typescript
enum FollowError {
  CANNOT_FOLLOW_SELF = 'CANNOT_FOLLOW_SELF',
  ALREADY_FOLLOWING = 'ALREADY_FOLLOWING',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FOLLOW_LIMIT_EXCEEDED = 'FOLLOW_LIMIT_EXCEEDED'
}
```

## Testing Strategy

### Unit Testing

1. **Profile Service Tests**
   - Profile CRUD operations
   - Privacy setting validation
   - Image upload functionality
   - Data validation and sanitization

2. **Follow Service Tests**
   - Follow/unfollow operations
   - Follower count updates
   - Duplicate follow prevention
   - Self-follow prevention

3. **Component Tests**
   - Profile form validation
   - Follow button state management
   - Author link rendering
   - Privacy setting toggles

### Integration Testing

1. **Profile Flow Tests**
   - Complete profile creation flow
   - Profile update and privacy changes
   - Profile viewing with different access levels

2. **Social Features Tests**
   - Follow/unfollow user journeys
   - Follower/following list display
   - Content attribution display

3. **Content Integration Tests**
   - Author profile links in blog posts
   - Author profile links in projects
   - Profile data consistency across content

### Security Testing

1. **Privacy Controls**
   - Private profile access restrictions
   - Email visibility controls
   - Profile data exposure validation

2. **Follow System Security**
   - Unauthorized follow attempts
   - Follow relationship integrity
   - User blocking functionality

## Performance Considerations

### Database Optimization

1. **Firestore Indexes**
   - Composite index for userFollows queries
   - Index on profile.isPublic for public profile queries
   - Index on followerCount/followingCount for sorting

2. **Query Optimization**
   - Paginated follower/following lists
   - Cached profile data for content attribution
   - Optimistic updates for follow actions

3. **Image Handling**
   - Firebase Storage for profile images
   - Image compression and resizing
   - CDN integration for fast loading

### Caching Strategy

1. **Profile Data Caching**
   - Cache public profiles for content attribution
   - Cache follow relationships for UI state
   - Invalidate cache on profile updates

2. **Content Attribution Caching**
   - Cache author profile data with blog posts
   - Batch profile lookups for content lists
   - Background profile data refresh

## Security Considerations

### Firestore Security Rules

```javascript
// Enhanced security rules for user profiles
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection (existing + profile extension)
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         resource.data.profile.isPublic == true);
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // User follows collection
    match /userFollows/{followId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.followerId &&
        request.auth.uid != resource.data.followingId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.followerId;
    }
  }
}
```

### Data Privacy

1. **Profile Privacy Controls**
   - Granular visibility settings
   - Email address protection
   - Private profile enforcement

2. **Follow System Privacy**
   - Follower list privacy options
   - Block user functionality
   - Follow notification controls

3. **Content Attribution Privacy**
   - Respect profile privacy in content
   - Fallback to basic info for private profiles
   - User consent for profile linking
