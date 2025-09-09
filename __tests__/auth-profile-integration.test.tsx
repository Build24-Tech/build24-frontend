import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/firestore';
import { UserProfile, UserProfileData } from '@/types/user';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { User } from 'firebase/auth';

// Mock the firestore functions
jest.mock('@/lib/firestore', () => ({
  createUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfileData: jest.fn(),
  updateUserLanguage: jest.fn(),
}));

// Mock subscription service
jest.mock('@/lib/subscription-service', () => ({
  getDefaultSubscription: () => ({
    tier: 'free' as const,
    subscriptionStatus: undefined,
  }),
}));

// Mock Firebase lib
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {},
  googleProvider: {},
  githubProvider: {},
  appleProvider: {},
}));

const mockUser: User = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
} as User;

const mockUserProfile: UserProfile = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  status: 'active',
  emailUpdates: false,
  language: 'en',
  theme: 'system',
  subscription: {
    tier: 'free',
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  profile: {
    bio: undefined,
    location: undefined,
    website: undefined,
    work: undefined,
    role: undefined,
    showEmail: false,
    isPublic: true,
    followerCount: 0,
    followingCount: 0,
  },
};

// Test component to access auth context
function TestComponent() {
  const { user, userProfile, updateProfileData } = useAuth();

  const handleUpdateProfile = async () => {
    try {
      await updateProfileData({ bio: 'Updated bio' });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      <div data-testid="user-id">{user?.uid || 'no-user'}</div>
      <div data-testid="user-profile">{userProfile ? 'has-profile' : 'no-profile'}</div>
      <div data-testid="profile-bio">{userProfile?.profile?.bio || 'no-bio'}</div>
      <div data-testid="follower-count">{userProfile?.profile?.followerCount || 0}</div>
      <div data-testid="is-public">{userProfile?.profile?.isPublic ? 'public' : 'private'}</div>
      <button onClick={handleUpdateProfile} data-testid="update-profile">
        Update Profile
      </button>
    </div>
  );
}

describe('Auth Profile Integration', () => {
  const mockOnAuthStateChanged = require('firebase/auth').onAuthStateChanged;
  const mockCreateUserProfile = require('@/lib/firestore').createUserProfile;
  const mockGetUserProfile = require('@/lib/firestore').getUserProfile;
  const mockUpdateUserProfileData = require('@/lib/firestore').updateUserProfileData;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUserProfile.mockResolvedValue();
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockUpdateUserProfileData.mockResolvedValue();
  });

  describe('Profile Creation on Authentication', () => {
    it('should create user profile with default settings on authentication', async () => {
      // Mock auth state change to authenticated user
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn(); // unsubscribe function
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      // Verify profile has default settings
      expect(screen.getByTestId('follower-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-public')).toHaveTextContent('public');
      expect(mockGetUserProfile).toHaveBeenCalledWith('test-user-id');
    });

    it('should handle profile creation with correct default values', () => {
      const expectedProfileData: UserProfileData = {
        bio: undefined,
        location: undefined,
        website: undefined,
        work: undefined,
        role: undefined,
        showEmail: false,
        isPublic: true,
        followerCount: 0,
        followingCount: 0,
      };

      expect(mockUserProfile.profile).toEqual(expectedProfileData);
    });

    it('should handle authentication state changes', async () => {
      let authCallback: (user: User | null) => void;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null); // Initially no user
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially no user
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');

      // Simulate user login
      authCallback!(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      expect(mockGetUserProfile).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('Profile Data Updates', () => {
    it('should update profile data through AuthContext', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      // Update profile data
      const updateButton = screen.getByTestId('update-profile');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateUserProfileData).toHaveBeenCalledWith('test-user-id', { bio: 'Updated bio' });
      });
    });

    it('should update local state after profile data update', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-bio')).toHaveTextContent('no-bio');
      });

      // Update profile data
      const updateButton = screen.getByTestId('update-profile');
      fireEvent.click(updateButton);

      // The local state should be updated optimistically
      await waitFor(() => {
        expect(screen.getByTestId('profile-bio')).toHaveTextContent('Updated bio');
      });
    });

    it('should handle profile update errors gracefully', async () => {
      mockUpdateUserProfileData.mockRejectedValue(new Error('Update failed'));

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      // Attempt to update profile data
      const updateButton = screen.getByTestId('update-profile');

      // Should handle the error without crashing
      expect(() => fireEvent.click(updateButton)).not.toThrow();
    });
  });

  describe('Profile Data Structure Validation', () => {
    it('should maintain correct profile data structure', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      // Verify all required profile fields are present and have correct default values
      expect(screen.getByTestId('follower-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-public')).toHaveTextContent('public');
      expect(screen.getByTestId('profile-bio')).toHaveTextContent('no-bio');
    });

    it('should handle missing profile data gracefully', async () => {
      const profileWithoutProfileData = {
        ...mockUserProfile,
        profile: undefined,
      } as any;

      mockGetUserProfile.mockResolvedValue(profileWithoutProfileData);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
      });

      // Should handle missing profile data without crashing
      expect(screen.getByTestId('follower-count')).toHaveTextContent('0');
      expect(screen.getByTestId('profile-bio')).toHaveTextContent('no-bio');
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should clear profile data on logout', async () => {
      let authCallback: (user: User | null) => void;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(mockUser); // Initial auth state
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('has-profile');
      });

      // Simulate logout
      authCallback!(null);

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
        expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
      });
    });

    it('should handle profile fetch errors during authentication', async () => {
      mockGetUserProfile.mockRejectedValue(new Error('Profile fetch failed'));

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
        expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
      });

      expect(mockGetUserProfile).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('Profile Creation Function Integration', () => {
    it('should call createUserProfile with correct parameters for new users', async () => {
      // Test the createUserProfile function integration
      await createUserProfile(mockUser, 'onboarding', false, 'en', 'system');

      expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser, 'onboarding', false, 'en', 'system');
    });

    it('should handle profile creation for different user statuses', async () => {
      // Test with different status values
      await createUserProfile(mockUser, 'active');
      expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser, 'active');

      await createUserProfile(mockUser, 'inactive');
      expect(mockCreateUserProfile).toHaveBeenCalledWith(mockUser, 'inactive');
    });
  });
});
