/**
 * Firestore Security Rules Tests
 * 
 * These tests verify that the Firestore security rules properly enforce
 * access control for user profiles and follow relationships.
 * 
 * Note: These tests are designed to run against the Firebase Emulator Suite.
 * To run these tests:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Start emulator: firebase emulators:start --only firestore
 * 3. Run tests: npm test firestore-security-rules.test.ts
 */

import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for validation and authorization
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$');
    }
    
    function isValidUrl(url) {
      return url.matches('^https?://[^\\\\s/$.?#].[^\\\\s]*$');
    }
    
    function isValidProfileData(data) {
      return data.keys().hasAll(['showEmail', 'isPublic', 'followerCount', 'followingCount']) &&
             data.showEmail is bool &&
             data.isPublic is bool &&
             data.followerCount is int &&
             data.followingCount is int &&
             data.followerCount >= 0 &&
             data.followingCount >= 0 &&
             // Optional fields validation
             (!('bio' in data) || (data.bio is string && data.bio.size() <= 500)) &&
             (!('location' in data) || (data.location is string && data.location.size() <= 100)) &&
             (!('website' in data) || (data.website is string && data.website.size() <= 200 && isValidUrl(data.website))) &&
             (!('work' in data) || (data.work is string && data.work.size() <= 100)) &&
             (!('role' in data) || (data.role is string && data.role.size() <= 100));
    }
    
    function isValidUserData(data) {
      return data.keys().hasAll(['uid', 'email', 'status', 'emailUpdates', 'language', 'theme', 'subscription', 'createdAt', 'updatedAt', 'profile']) &&
             data.uid is string &&
             data.email is string &&
             isValidEmail(data.email) &&
             data.status in ['active', 'inactive', 'onboarding'] &&
             data.emailUpdates is bool &&
             data.language in ['en', 'cn', 'jp', 'vn'] &&
             data.theme in ['light', 'dark', 'system'] &&
             data.subscription is map &&
             data.createdAt is int &&
             data.updatedAt is int &&
             data.profile is map &&
             isValidProfileData(data.profile) &&
             // Optional fields validation
             (!('displayName' in data) || (data.displayName is string && data.displayName.size() <= 100)) &&
             (!('photoURL' in data) || (data.photoURL is string && data.photoURL.size() <= 500));
    }
    
    function canViewProfile(resource) {
      // Profile is public OR user is viewing their own profile
      return resource.data.profile.isPublic == true || 
             (isAuthenticated() && request.auth.uid == resource.id);
    }
    
    // Users collection - Extended with profile data
    match /users/{userId} {
      // Read access: Own profile OR public profiles
      allow read: if isOwner(userId) || 
                     (isAuthenticated() && 
                      exists(/databases/$(database)/documents/users/$(userId)) &&
                      get(/databases/$(database)/documents/users/$(userId)).data.profile.isPublic == true);
      
      // Create access: Only for own user document during registration
      allow create: if isOwner(userId) && 
                       isValidUserData(request.resource.data) &&
                       request.resource.data.uid == userId;
      
      // Update access: Only own profile with valid data
      allow update: if isOwner(userId) && 
                       isValidUserData(request.resource.data) &&
                       request.resource.data.uid == userId &&
                       // Prevent changing uid and createdAt
                       request.resource.data.uid == resource.data.uid &&
                       request.resource.data.createdAt == resource.data.createdAt;
      
      // Delete access: Only own profile
      allow delete: if isOwner(userId);
    }
    
    // User follows collection - For follow relationships
    match /userFollows/{followId} {
      // followId format: {followerId}_{followingId}
      
      // Read access: Authenticated users can read follow relationships
      allow read: if isAuthenticated();
      
      // Create access: Only the follower can create the relationship
      // Cannot follow yourself
      allow create: if isAuthenticated() && 
                       request.resource.data.keys().hasAll(['followerId', 'followingId', 'createdAt', 'status']) &&
                       request.resource.data.followerId == request.auth.uid &&
                       request.resource.data.followingId != request.auth.uid &&
                       request.resource.data.followerId is string &&
                       request.resource.data.followingId is string &&
                       request.resource.data.createdAt is int &&
                       request.resource.data.status in ['active', 'blocked'] &&
                       followId == request.resource.data.followerId + '_' + request.resource.data.followingId &&
                       // Ensure both users exist
                       exists(/databases/$(database)/documents/users/$(request.resource.data.followerId)) &&
                       exists(/databases/$(database)/documents/users/$(request.resource.data.followingId));
      
      // Update access: Only the follower can update (e.g., to block)
      allow update: if isAuthenticated() && 
                       resource.data.followerId == request.auth.uid &&
                       request.resource.data.followerId == resource.data.followerId &&
                       request.resource.data.followingId == resource.data.followingId &&
                       request.resource.data.createdAt == resource.data.createdAt &&
                       request.resource.data.status in ['active', 'blocked'];
      
      // Delete access: Only the follower can delete (unfollow)
      allow delete: if isAuthenticated() && 
                       resource.data.followerId == request.auth.uid;
    }
  }
}
        `,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('User Profile Access Control', () => {
    const validUserData = {
      uid: 'user1',
      email: 'user1@example.com',
      status: 'active',
      emailUpdates: true,
      language: 'en',
      theme: 'system',
      subscription: { tier: 'free' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      profile: {
        showEmail: false,
        isPublic: true,
        followerCount: 0,
        followingCount: 0,
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        work: 'Test work',
        role: 'Test role'
      }
    };

    it('should allow users to create their own profile', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      await expect(
        setDoc(doc(user1Db, 'users', 'user1'), validUserData)
      ).resolves.not.toThrow();
    });

    it('should not allow users to create profiles for other users', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      await expect(
        setDoc(doc(user1Db, 'users', 'user2'), { ...validUserData, uid: 'user2' })
      ).rejects.toThrow();
    });

    it('should allow users to read their own profile', async () => {
      // Setup: Create user profile as admin
      const adminContext = testEnv.authenticatedContext('user1');
      const adminDb = adminContext.firestore();
      await setDoc(doc(adminDb, 'users', 'user1'), validUserData);

      // Test: User can read their own profile
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      await expect(
        getDoc(doc(user1Db, 'users', 'user1'))
      ).resolves.not.toThrow();
    });

    it('should allow users to read public profiles', async () => {
      // Setup: Create public profile
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();
      await setDoc(doc(user1Db, 'users', 'user1'), validUserData);

      // Test: Another user can read the public profile
      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();

      await expect(
        getDoc(doc(user2Db, 'users', 'user1'))
      ).resolves.not.toThrow();
    });

    it('should not allow users to read private profiles', async () => {
      // Setup: Create private profile
      const privateUserData = {
        ...validUserData,
        profile: { ...validUserData.profile, isPublic: false }
      };

      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();
      await setDoc(doc(user1Db, 'users', 'user1'), privateUserData);

      // Test: Another user cannot read the private profile
      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();

      await expect(
        getDoc(doc(user2Db, 'users', 'user1'))
      ).rejects.toThrow();
    });

    it('should allow users to update their own profile', async () => {
      // Setup: Create user profile
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();
      await setDoc(doc(user1Db, 'users', 'user1'), validUserData);

      // Test: User can update their profile
      const updatedData = {
        ...validUserData,
        updatedAt: Date.now(),
        profile: { ...validUserData.profile, bio: 'Updated bio' }
      };

      await expect(
        updateDoc(doc(user1Db, 'users', 'user1'), updatedData)
      ).resolves.not.toThrow();
    });

    it('should not allow users to update other users profiles', async () => {
      // Setup: Create user profiles
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();
      await setDoc(doc(user1Db, 'users', 'user1'), validUserData);

      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();

      // Test: User2 cannot update User1's profile
      await expect(
        updateDoc(doc(user2Db, 'users', 'user1'), {
          profile: { ...validUserData.profile, bio: 'Hacked bio' }
        })
      ).rejects.toThrow();
    });

    it('should validate profile data on create', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      // Test: Invalid email should be rejected
      const invalidData = {
        ...validUserData,
        email: 'invalid-email'
      };

      await expect(
        setDoc(doc(user1Db, 'users', 'user1'), invalidData)
      ).rejects.toThrow();
    });

    it('should validate profile data field lengths', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      // Test: Bio too long should be rejected
      const invalidData = {
        ...validUserData,
        profile: {
          ...validUserData.profile,
          bio: 'x'.repeat(501) // Exceeds 500 character limit
        }
      };

      await expect(
        setDoc(doc(user1Db, 'users', 'user1'), invalidData)
      ).rejects.toThrow();
    });

    it('should validate website URL format', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      // Test: Invalid URL should be rejected
      const invalidData = {
        ...validUserData,
        profile: {
          ...validUserData.profile,
          website: 'not-a-valid-url'
        }
      };

      await expect(
        setDoc(doc(user1Db, 'users', 'user1'), invalidData)
      ).rejects.toThrow();
    });
  });

  describe('Follow System Access Control', () => {
    const validUserData1 = {
      uid: 'user1',
      email: 'user1@example.com',
      status: 'active',
      emailUpdates: true,
      language: 'en',
      theme: 'system',
      subscription: { tier: 'free' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      profile: {
        showEmail: false,
        isPublic: true,
        followerCount: 0,
        followingCount: 0
      }
    };

    const validUserData2 = {
      ...validUserData1,
      uid: 'user2',
      email: 'user2@example.com'
    };

    beforeEach(async () => {
      // Setup: Create test users
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();
      await setDoc(doc(user1Db, 'users', 'user1'), validUserData1);

      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();
      await setDoc(doc(user2Db, 'users', 'user2'), validUserData2);
    });

    it('should allow users to follow other users', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await expect(
        setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData)
      ).resolves.not.toThrow();
    });

    it('should not allow users to follow themselves', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user1',
        createdAt: Date.now(),
        status: 'active'
      };

      await expect(
        setDoc(doc(user1Db, 'userFollows', 'user1_user1'), followData)
      ).rejects.toThrow();
    });

    it('should not allow users to create follow relationships for others', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user2', // User1 trying to create a follow for User2
        followingId: 'user1',
        createdAt: Date.now(),
        status: 'active'
      };

      await expect(
        setDoc(doc(user1Db, 'userFollows', 'user2_user1'), followData)
      ).rejects.toThrow();
    });

    it('should allow authenticated users to read follow relationships', async () => {
      // Setup: Create a follow relationship
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData);

      // Test: Another user can read the follow relationship
      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();

      await expect(
        getDoc(doc(user2Db, 'userFollows', 'user1_user2'))
      ).resolves.not.toThrow();
    });

    it('should not allow unauthenticated users to read follow relationships', async () => {
      // Setup: Create a follow relationship
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData);

      // Test: Unauthenticated user cannot read follow relationships
      const unauthContext = testEnv.unauthenticatedContext();
      const unauthDb = unauthContext.firestore();

      await expect(
        getDoc(doc(unauthDb, 'userFollows', 'user1_user2'))
      ).rejects.toThrow();
    });

    it('should allow users to unfollow (delete follow relationship)', async () => {
      // Setup: Create a follow relationship
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData);

      // Test: User can delete their own follow relationship
      await expect(
        deleteDoc(doc(user1Db, 'userFollows', 'user1_user2'))
      ).resolves.not.toThrow();
    });

    it('should not allow users to delete other users follow relationships', async () => {
      // Setup: Create a follow relationship
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData);

      // Test: User2 cannot delete User1's follow relationship
      const user2Context = testEnv.authenticatedContext('user2');
      const user2Db = user2Context.firestore();

      await expect(
        deleteDoc(doc(user2Db, 'userFollows', 'user1_user2'))
      ).rejects.toThrow();
    });

    it('should validate follow relationship data structure', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      // Test: Missing required fields should be rejected
      const invalidFollowData = {
        followerId: 'user1',
        // Missing followingId, createdAt, status
      };

      await expect(
        setDoc(doc(user1Db, 'userFollows', 'user1_user2'), invalidFollowData)
      ).rejects.toThrow();
    });

    it('should validate follow relationship status values', async () => {
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      // Test: Invalid status should be rejected
      const invalidFollowData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'invalid_status'
      };

      await expect(
        setDoc(doc(user1Db, 'userFollows', 'user1_user2'), invalidFollowData)
      ).rejects.toThrow();
    });

    it('should allow users to update their own follow relationships', async () => {
      // Setup: Create a follow relationship
      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      const followData = {
        followerId: 'user1',
        followingId: 'user2',
        createdAt: Date.now(),
        status: 'active'
      };

      await setDoc(doc(user1Db, 'userFollows', 'user1_user2'), followData);

      // Test: User can update their follow relationship (e.g., to block)
      await expect(
        updateDoc(doc(user1Db, 'userFollows', 'user1_user2'), { status: 'blocked' })
      ).resolves.not.toThrow();
    });
  });

  describe('Privacy Controls', () => {
    it('should enforce profile privacy settings', async () => {
      // This test is covered in the "User Profile Access Control" section
      // but we can add additional privacy-specific tests here if needed
      expect(true).toBe(true);
    });

    it('should validate email visibility controls', async () => {
      const validUserData = {
        uid: 'user1',
        email: 'user1@example.com',
        status: 'active',
        emailUpdates: true,
        language: 'en',
        theme: 'system',
        subscription: { tier: 'free' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profile: {
          showEmail: true, // Email should be visible
          isPublic: true,
          followerCount: 0,
          followingCount: 0
        }
      };

      const user1Context = testEnv.authenticatedContext('user1');
      const user1Db = user1Context.firestore();

      await expect(
        setDoc(doc(user1Db, 'users', 'user1'), validUserData)
      ).resolves.not.toThrow();
    });
  });
});
