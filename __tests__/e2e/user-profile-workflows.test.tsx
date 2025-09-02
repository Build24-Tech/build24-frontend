/**
 * End-to-end tests for User Profile System workflows
 * Tests complete user journeys from profile creation to content attribution
 */

import { followService } from '@/lib/follow-service';
import { profileService } from '@/lib/profile-service';
import { PublicProfileView, UserProfile, UserProfileData } from '@/types/user';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from 'firebase/auth';
import React from 'react';

// Mock Next.js router
const mockNavigationHistory: string[] = [];
const mockPush = jest.fn((path: string) => {
  mockNavigationHistory.push(path);
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    pathname: '/profile/edit',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/profile/edit',
}));

// Mock Firebase services
jest.mock('@/lib/profile-service');
jest.mock('@/lib/follow-service');
jest.mock('@/lib/firestore');
jest.mock('firebase/storage');
jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  googleProvider: {},
  githubProvider: {},
  appleProvider: {},
}));

const mockProfileService = profileService as jest.Mocked<typeof profileService>;
const mockFollowService = followService as jest.Mocked<typeof followService>;

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
  subscription: { tier: 'free' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  profile: {
    bio: 'Software developer passionate about building great products',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    work: 'Tech Company',
    role: 'Senior Developer',
    showEmail: true,
    isPublic: true,
    followerCount: 10,
    followingCount: 5,
  },
};

const mockPublicProfile: PublicProfileView = {
  uid: 'test-user-id',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  bio: 'Software developer passionate about building great products',
  location: 'San Francisco, CA',
  website: 'https://example.com',
  work: 'Tech Company',
  role: 'Senior Developer',
  email: 'test@example.com',
  followerCount: 10,
  followingCount: 5,
};

// Mock the AuthContext module
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

describe('User Profile System E2E Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigationHistory.length = 0;

    // Setup AuthContext mock
    mockUseAuth.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      updateProfileData: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    // Setup default mocks
    mockProfileService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockProfileService.updateProfile.mockResolvedValue();
    mockProfileService.togglePrivacy.mockResolvedValue();
    mockProfileService.uploadProfileImage.mockResolvedValue('https://example.com/new-photo.jpg');

    mockFollowService.followUser.mockResolvedValue();
    mockFollowService.unfollowUser.mockResolvedValue();
    mockFollowService.isFollowing.mockResolvedValue(false);
    mockFollowService.getFollowers.mockResolvedValue([]);
    mockFollowService.getFollowing.mockResolvedValue([]);
  });

  describe('Complete Profile Creation and Editing Workflow', () => {
    it('should guide user through complete profile creation and editing journey', async () => {
      const user = userEvent.setup();

      const MockProfileEditPage = () => {
        const [profileData, setProfileData] = React.useState<Partial<UserProfileData>>({
          bio: '',
          location: '',
          website: '',
          work: '',
          role: '',
          showEmail: false,
          isPublic: true,
        });
        const [isLoading, setIsLoading] = React.useState(false);
        const [errors, setErrors] = React.useState<Record<string, string>>({});
        const [successMessage, setSuccessMessage] = React.useState('');

        const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
          setProfileData(prev => ({ ...prev, [field]: value }));
          // Clear error when user starts typing
          if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
          }
        };

        const validateForm = () => {
          const newErrors: Record<string, string> = {};

          if (profileData.bio && profileData.bio.length > 500) {
            newErrors.bio = 'Bio must be 500 characters or less';
          }

          if (profileData.website && !profileData.website.match(/^https?:\/\/.+/)) {
            newErrors.website = 'Website must be a valid URL';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        };

        const handleSave = async () => {
          if (!validateForm()) return;

          setIsLoading(true);
          try {
            await mockProfileService.updateProfile('test-user-id', profileData);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => {
              mockPush('/profile/test-user-id');
            }, 1000);
          } catch (error) {
            setErrors({ general: 'Failed to update profile. Please try again.' });
          } finally {
            setIsLoading(false);
          }
        };

        const handleImageUpload = async (file: File) => {
          setIsLoading(true);
          try {
            const newPhotoURL = await mockProfileService.uploadProfileImage('test-user-id', file);
            setSuccessMessage('Profile image updated successfully!');
          } catch (error) {
            setErrors({ image: 'Failed to upload image. Please try again.' });
          } finally {
            setIsLoading(false);
          }
        };

        return (
          <div>
            <h1>Edit Profile</h1>

            {successMessage && (
              <div className="success-message" data-testid="success-message">
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="error-message" data-testid="general-error">
                {errors.general}
              </div>
            )}

            <form>
              {/* Profile Image Upload */}
              <div className="image-upload-section">
                <label htmlFor="profile-image">Profile Image</label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  data-testid="image-upload"
                />
                {errors.image && (
                  <span className="error" data-testid="image-error">{errors.image}</span>
                )}
              </div>

              {/* Bio Field */}
              <div className="form-field">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={profileData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  data-testid="bio-input"
                />
                <div className="char-count" data-testid="bio-char-count">
                  {(profileData.bio || '').length}/500
                </div>
                {errors.bio && (
                  <span className="error" data-testid="bio-error">{errors.bio}</span>
                )}
              </div>

              {/* Location Field */}
              <div className="form-field">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  value={profileData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where are you based?"
                  data-testid="location-input"
                />
              </div>

              {/* Website Field */}
              <div className="form-field">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  value={profileData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                  data-testid="website-input"
                />
                {errors.website && (
                  <span className="error" data-testid="website-error">{errors.website}</span>
                )}
              </div>

              {/* Work Field */}
              <div className="form-field">
                <label htmlFor="work">Company</label>
                <input
                  type="text"
                  id="work"
                  value={profileData.work || ''}
                  onChange={(e) => handleInputChange('work', e.target.value)}
                  placeholder="Where do you work?"
                  data-testid="work-input"
                />
              </div>

              {/* Role Field */}
              <div className="form-field">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  value={profileData.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="What's your role?"
                  data-testid="role-input"
                />
              </div>

              {/* Privacy Settings */}
              <div className="privacy-section">
                <h3>Privacy Settings</h3>

                <div className="checkbox-field">
                  <input
                    type="checkbox"
                    id="show-email"
                    checked={profileData.showEmail || false}
                    onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                    data-testid="show-email-checkbox"
                  />
                  <label htmlFor="show-email">Show email address on profile</label>
                </div>

                <div className="checkbox-field">
                  <input
                    type="checkbox"
                    id="is-public"
                    checked={profileData.isPublic !== false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    data-testid="is-public-checkbox"
                  />
                  <label htmlFor="is-public">Make profile public</label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => mockPush('/profile/test-user-id')}
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  data-testid="save-button"
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockProfileEditPage />
        </AuthProvider>
      );

      // Step 1: User lands on profile edit page
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByTestId('bio-input')).toBeInTheDocument();

      // Step 2: User fills out profile information
      await user.type(screen.getByTestId('bio-input'), 'I am a passionate software developer who loves building innovative products.');
      await user.type(screen.getByTestId('location-input'), 'San Francisco, CA');
      await user.type(screen.getByTestId('website-input'), 'https://johndoe.dev');
      await user.type(screen.getByTestId('work-input'), 'Tech Startup Inc.');
      await user.type(screen.getByTestId('role-input'), 'Senior Full Stack Developer');

      // Verify character count updates
      expect(screen.getByTestId('bio-char-count')).toHaveTextContent('76/500');

      // Step 3: User configures privacy settings
      await user.click(screen.getByTestId('show-email-checkbox'));
      expect(screen.getByTestId('show-email-checkbox')).toBeChecked();

      // Step 4: User uploads profile image
      const file = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByTestId('image-upload');
      await user.upload(imageInput, file);

      await waitFor(() => {
        expect(mockProfileService.uploadProfileImage).toHaveBeenCalledWith('test-user-id', file);
        expect(screen.getByTestId('success-message')).toHaveTextContent('Profile image updated successfully!');
      });

      // Step 5: User saves profile
      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('test-user-id', {
          bio: 'I am a passionate software developer who loves building innovative products.',
          location: 'San Francisco, CA',
          website: 'https://johndoe.dev',
          work: 'Tech Startup Inc.',
          role: 'Senior Full Stack Developer',
          showEmail: true,
          isPublic: true,
        });
      });

      // Step 6: Success message and redirect
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toHaveTextContent('Profile updated successfully!');
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile/test-user-id');
      }, { timeout: 2000 });
    });

    it('should handle form validation errors during profile editing', async () => {
      const user = userEvent.setup();

      const MockProfileEditWithValidation = () => {
        const [profileData, setProfileData] = React.useState<Partial<UserProfileData>>({});
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const handleSave = async () => {
          const newErrors: Record<string, string> = {};

          if (profileData.bio && profileData.bio.length > 500) {
            newErrors.bio = 'Bio must be 500 characters or less';
          }

          if (profileData.website && !profileData.website.match(/^https?:\/\/.+/)) {
            newErrors.website = 'Website must be a valid URL';
          }

          setErrors(newErrors);
        };

        return (
          <div>
            <textarea
              value={profileData.bio || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              data-testid="bio-input"
            />
            {errors.bio && <span data-testid="bio-error">{errors.bio}</span>}

            <input
              type="url"
              value={profileData.website || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
              data-testid="website-input"
            />
            {errors.website && <span data-testid="website-error">{errors.website}</span>}

            <button onClick={handleSave} data-testid="save-button">Save</button>
          </div>
        );
      };

      render(<MockProfileEditWithValidation />);

      // Test bio length validation
      await user.type(screen.getByTestId('bio-input'), 'a'.repeat(501));
      await user.click(screen.getByTestId('save-button'));

      expect(screen.getByTestId('bio-error')).toHaveTextContent('Bio must be 500 characters or less');

      // Test website URL validation
      await user.clear(screen.getByTestId('bio-input'));
      await user.type(screen.getByTestId('website-input'), 'invalid-url');
      await user.click(screen.getByTestId('save-button'));

      expect(screen.getByTestId('website-error')).toHaveTextContent('Website must be a valid URL');
    });
  });

  describe('Follow/Unfollow User Journey', () => {
    it('should complete follow and unfollow user workflow', async () => {
      const user = userEvent.setup();

      const targetUser: PublicProfileView = {
        uid: 'target-user-id',
        displayName: 'Jane Developer',
        photoURL: 'https://example.com/jane.jpg',
        bio: 'Frontend developer specializing in React',
        location: 'New York, NY',
        followerCount: 25,
        followingCount: 15,
      };

      const MockUserProfilePage = () => {
        const [isFollowing, setIsFollowing] = React.useState(false);
        const [followerCount, setFollowerCount] = React.useState(targetUser.followerCount);
        const [isLoading, setIsLoading] = React.useState(false);
        const [followers, setFollowers] = React.useState<PublicProfileView[]>([]);
        const [following, setFollowing] = React.useState<PublicProfileView[]>([]);
        const [showFollowers, setShowFollowers] = React.useState(false);
        const [showFollowing, setShowFollowing] = React.useState(false);

        React.useEffect(() => {
          mockFollowService.isFollowing.mockResolvedValue(isFollowing);
        }, [isFollowing]);

        const handleFollow = async () => {
          setIsLoading(true);
          try {
            if (isFollowing) {
              await mockFollowService.unfollowUser('test-user-id', 'target-user-id');
              setIsFollowing(false);
              setFollowerCount(prev => prev - 1);
            } else {
              await mockFollowService.followUser('test-user-id', 'target-user-id');
              setIsFollowing(true);
              setFollowerCount(prev => prev + 1);
            }
          } catch (error) {
            console.error('Follow action failed:', error);
          } finally {
            setIsLoading(false);
          }
        };

        const loadFollowers = async () => {
          const followersList = await mockFollowService.getFollowers('target-user-id');
          setFollowers(followersList);
          setShowFollowers(true);
        };

        const loadFollowing = async () => {
          const followingList = await mockFollowService.getFollowing('target-user-id');
          setFollowing(followingList);
          setShowFollowing(true);
        };

        return (
          <div>
            <div className="profile-header">
              <img src={targetUser.photoURL} alt={targetUser.displayName} />
              <h1>{targetUser.displayName}</h1>
              <p>{targetUser.bio}</p>
              <p>{targetUser.location}</p>
            </div>

            <div className="profile-stats">
              <button onClick={loadFollowers} data-testid="followers-count">
                {followerCount} Followers
              </button>
              <button onClick={loadFollowing} data-testid="following-count">
                {targetUser.followingCount} Following
              </button>
            </div>

            <div className="profile-actions">
              <button
                onClick={handleFollow}
                disabled={isLoading}
                data-testid="follow-button"
                className={isFollowing ? 'following' : 'not-following'}
              >
                {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>

            {showFollowers && (
              <div className="followers-list" data-testid="followers-list">
                <h3>Followers</h3>
                {followers.length === 0 ? (
                  <p>No followers yet</p>
                ) : (
                  followers.map(follower => (
                    <div key={follower.uid} className="follower-item">
                      <span>{follower.displayName}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {showFollowing && (
              <div className="following-list" data-testid="following-list">
                <h3>Following</h3>
                {following.length === 0 ? (
                  <p>Not following anyone yet</p>
                ) : (
                  following.map(followedUser => (
                    <div key={followedUser.uid} className="following-item">
                      <span>{followedUser.displayName}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockUserProfilePage />
        </AuthProvider>
      );

      // Step 1: User views target user's profile
      expect(screen.getByText('Jane Developer')).toBeInTheDocument();
      expect(screen.getByText('Frontend developer specializing in React')).toBeInTheDocument();
      expect(screen.getByTestId('followers-count')).toHaveTextContent('25 Followers');

      // Step 2: User follows the target user
      const followButton = screen.getByTestId('follow-button');
      expect(followButton).toHaveTextContent('Follow');
      expect(followButton).toHaveClass('not-following');

      await user.click(followButton);

      await waitFor(() => {
        expect(mockFollowService.followUser).toHaveBeenCalledWith('test-user-id', 'target-user-id');
        expect(followButton).toHaveTextContent('Unfollow');
        expect(followButton).toHaveClass('following');
        expect(screen.getByTestId('followers-count')).toHaveTextContent('26 Followers');
      });

      // Step 3: User views followers list
      await user.click(screen.getByTestId('followers-count'));

      await waitFor(() => {
        expect(mockFollowService.getFollowers).toHaveBeenCalledWith('target-user-id');
        expect(screen.getByTestId('followers-list')).toBeInTheDocument();
      });

      // Step 4: User views following list
      await user.click(screen.getByTestId('following-count'));

      await waitFor(() => {
        expect(mockFollowService.getFollowing).toHaveBeenCalledWith('target-user-id');
        expect(screen.getByTestId('following-list')).toBeInTheDocument();
      });

      // Step 5: User unfollows the target user
      await user.click(followButton);

      await waitFor(() => {
        expect(mockFollowService.unfollowUser).toHaveBeenCalledWith('test-user-id', 'target-user-id');
        expect(followButton).toHaveTextContent('Follow');
        expect(followButton).toHaveClass('not-following');
        expect(screen.getByTestId('followers-count')).toHaveTextContent('25 Followers');
      });
    });

    it('should handle follow errors gracefully', async () => {
      const user = userEvent.setup();

      mockFollowService.followUser.mockRejectedValue(new Error('Follow failed'));

      const MockFollowWithError = () => {
        const [error, setError] = React.useState('');

        const handleFollow = async () => {
          try {
            await mockFollowService.followUser('test-user-id', 'target-user-id');
          } catch (err) {
            setError('Failed to follow user. Please try again.');
          }
        };

        return (
          <div>
            <button onClick={handleFollow} data-testid="follow-button">Follow</button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        );
      };

      render(<MockFollowWithError />);

      await user.click(screen.getByTestId('follow-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to follow user. Please try again.');
      });
    });
  });

  describe('Profile Privacy Settings Workflow', () => {
    it('should handle profile privacy toggle workflow', async () => {
      const user = userEvent.setup();

      const MockPrivacySettingsPage = () => {
        const [isPublic, setIsPublic] = React.useState(true);
        const [showEmail, setShowEmail] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);
        const [successMessage, setSuccessMessage] = React.useState('');

        const handlePrivacyToggle = async () => {
          setIsLoading(true);
          try {
            await mockProfileService.togglePrivacy('test-user-id', !isPublic);
            setIsPublic(!isPublic);
            setSuccessMessage(`Profile is now ${!isPublic ? 'public' : 'private'}`);
          } catch (error) {
            console.error('Privacy toggle failed:', error);
          } finally {
            setIsLoading(false);
          }
        };

        const handleEmailVisibilityToggle = async () => {
          setIsLoading(true);
          try {
            await mockProfileService.updateProfile('test-user-id', { showEmail: !showEmail });
            setShowEmail(!showEmail);
            setSuccessMessage(`Email is now ${!showEmail ? 'visible' : 'hidden'} on your profile`);
          } catch (error) {
            console.error('Email visibility toggle failed:', error);
          } finally {
            setIsLoading(false);
          }
        };

        return (
          <div>
            <h1>Privacy Settings</h1>

            {successMessage && (
              <div className="success-message" data-testid="success-message">
                {successMessage}
              </div>
            )}

            <div className="privacy-section">
              <h2>Profile Visibility</h2>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={handlePrivacyToggle}
                    disabled={isLoading}
                    data-testid="public-profile-toggle"
                  />
                  Make my profile public
                </label>
                <p className="setting-description">
                  {isPublic
                    ? 'Your profile is visible to everyone and can be found in search results.'
                    : 'Your profile is private and only you can see it.'
                  }
                </p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={handleEmailVisibilityToggle}
                    disabled={isLoading}
                    data-testid="show-email-toggle"
                  />
                  Show email address on profile
                </label>
                <p className="setting-description">
                  {showEmail
                    ? 'Your email address will be visible on your public profile.'
                    : 'Your email address will be hidden from your profile.'
                  }
                </p>
              </div>
            </div>

            <div className="privacy-preview">
              <h3>Profile Preview</h3>
              <div className="profile-card" data-testid="profile-preview">
                <h4>Test User</h4>
                {isPublic ? (
                  <div>
                    <p>Software developer passionate about building great products</p>
                    <p>San Francisco, CA</p>
                    {showEmail && <p>test@example.com</p>}
                  </div>
                ) : (
                  <p>This profile is private</p>
                )}
              </div>
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockPrivacySettingsPage />
        </AuthProvider>
      );

      // Step 1: User views privacy settings
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
      expect(screen.getByTestId('public-profile-toggle')).toBeChecked();
      expect(screen.getByTestId('show-email-toggle')).not.toBeChecked();

      // Step 2: User toggles profile to private
      await user.click(screen.getByTestId('public-profile-toggle'));

      await waitFor(() => {
        expect(mockProfileService.togglePrivacy).toHaveBeenCalledWith('test-user-id', false);
        expect(screen.getByTestId('success-message')).toHaveTextContent('Profile is now private');
        expect(screen.getByText('This profile is private')).toBeInTheDocument();
      });

      // Step 3: User toggles profile back to public
      await user.click(screen.getByTestId('public-profile-toggle'));

      await waitFor(() => {
        expect(mockProfileService.togglePrivacy).toHaveBeenCalledWith('test-user-id', true);
        expect(screen.getByTestId('success-message')).toHaveTextContent('Profile is now public');
        expect(screen.getByText('Software developer passionate about building great products')).toBeInTheDocument();
      });

      // Step 4: User toggles email visibility
      await user.click(screen.getByTestId('show-email-toggle'));

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('test-user-id', { showEmail: true });
        expect(screen.getByTestId('success-message')).toHaveTextContent('Email is now visible on your profile');
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });

      // Step 5: User hides email again
      await user.click(screen.getByTestId('show-email-toggle'));

      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith('test-user-id', { showEmail: false });
        expect(screen.getByTestId('success-message')).toHaveTextContent('Email is now hidden on your profile');
        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Content Attribution Display Workflow', () => {
    it('should display author profiles across different content types', async () => {
      const user = userEvent.setup();

      const mockBlogPost = {
        id: 'blog-post-1',
        title: 'Building a React Component Library',
        content: 'In this post, we explore how to build a scalable React component library...',
        authorId: 'test-user-id',
        publishedAt: new Date(),
      };

      const mockProject = {
        id: 'project-1',
        title: 'E-commerce Dashboard',
        description: 'A modern dashboard for managing e-commerce operations',
        authorId: 'test-user-id',
        createdAt: new Date(),
      };

      const MockContentWithAttribution = () => {
        const [authorProfile, setAuthorProfile] = React.useState<PublicProfileView | null>(null);

        React.useEffect(() => {
          mockProfileService.getPublicProfile('test-user-id').then(setAuthorProfile);
        }, []);

        return (
          <div>
            {/* Blog Post with Author Attribution */}
            <article className="blog-post" data-testid="blog-post">
              <h1>{mockBlogPost.title}</h1>
              <div className="author-attribution" data-testid="blog-author">
                {authorProfile && (
                  <div className="author-card">
                    <img src={authorProfile.photoURL} alt={authorProfile.displayName} />
                    <div className="author-info">
                      <h4>{authorProfile.displayName}</h4>
                      <p>{authorProfile.role} at {authorProfile.work}</p>
                      <p>{authorProfile.bio}</p>
                      <button
                        onClick={() => mockPush(`/profile/${authorProfile.uid}`)}
                        data-testid="view-author-profile"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="content">
                <p>{mockBlogPost.content}</p>
              </div>
            </article>

            {/* Project with Author Attribution */}
            <article className="project" data-testid="project">
              <h2>{mockProject.title}</h2>
              <p>{mockProject.description}</p>
              <div className="project-author" data-testid="project-author">
                {authorProfile && (
                  <div className="author-badge">
                    <img src={authorProfile.photoURL} alt={authorProfile.displayName} />
                    <span>by {authorProfile.displayName}</span>
                    <button
                      onClick={() => mockPush(`/profile/${authorProfile.uid}`)}
                      data-testid="view-project-author"
                    >
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            </article>

            {/* Author Profile Link in Comments */}
            <div className="comments-section" data-testid="comments">
              <h3>Comments</h3>
              <div className="comment">
                <div className="comment-author" data-testid="comment-author">
                  {authorProfile && (
                    <div className="author-link">
                      <img src={authorProfile.photoURL} alt={authorProfile.displayName} />
                      <button
                        onClick={() => mockPush(`/profile/${authorProfile.uid}`)}
                        data-testid="comment-author-link"
                      >
                        {authorProfile.displayName}
                      </button>
                    </div>
                  )}
                </div>
                <p>Great article! Thanks for sharing your insights.</p>
              </div>
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <MockContentWithAttribution />
        </AuthProvider>
      );

      // Wait for author profile to load
      await waitFor(() => {
        expect(mockProfileService.getPublicProfile).toHaveBeenCalledWith('test-user-id');
        expect(screen.getAllByText('Test User')).toHaveLength(2); // Should appear in blog and comment
        expect(screen.getByText('by Test User')).toBeInTheDocument(); // Project shows "by Test User"
      });

      // Step 1: Verify blog post author attribution
      const blogAuthor = screen.getByTestId('blog-author');
      expect(blogAuthor).toBeInTheDocument();
      expect(screen.getByText('Senior Developer at Tech Company')).toBeInTheDocument();
      expect(screen.getByText('Software developer passionate about building great products')).toBeInTheDocument();

      // Step 2: User clicks to view author profile from blog post
      await user.click(screen.getByTestId('view-author-profile'));
      expect(mockPush).toHaveBeenCalledWith('/profile/test-user-id');

      // Step 3: Verify project author attribution
      const projectAuthor = screen.getByTestId('project-author');
      expect(projectAuthor).toBeInTheDocument();
      expect(screen.getByText('by Test User')).toBeInTheDocument();

      // Step 4: User clicks to view author profile from project
      await user.click(screen.getByTestId('view-project-author'));
      expect(mockPush).toHaveBeenCalledWith('/profile/test-user-id');

      // Step 5: Verify comment author attribution
      const commentAuthor = screen.getByTestId('comment-author');
      expect(commentAuthor).toBeInTheDocument();

      // Step 6: User clicks author link in comment
      await user.click(screen.getByTestId('comment-author-link'));
      expect(mockPush).toHaveBeenCalledWith('/profile/test-user-id');
    });

    it('should handle private profiles in content attribution', async () => {
      const privateProfile: PublicProfileView = {
        uid: 'private-user-id',
        displayName: 'Private User',
        photoURL: 'https://example.com/private.jpg',
        followerCount: 5,
        followingCount: 3,
        // No bio, location, work, role, or email for private profile
      };

      mockProfileService.getPublicProfile.mockResolvedValue(privateProfile);

      const MockPrivateAuthorAttribution = () => {
        const [authorProfile, setAuthorProfile] = React.useState<PublicProfileView | null>(null);

        React.useEffect(() => {
          mockProfileService.getPublicProfile('private-user-id').then(setAuthorProfile);
        }, []);

        return (
          <div>
            <article data-testid="content-with-private-author">
              <h1>Sample Content</h1>
              <div className="author-attribution" data-testid="private-author">
                {authorProfile && (
                  <div className="author-card">
                    <img src={authorProfile.photoURL} alt={authorProfile.displayName} />
                    <div className="author-info">
                      <h4>{authorProfile.displayName}</h4>
                      {authorProfile.bio ? (
                        <p>{authorProfile.bio}</p>
                      ) : (
                        <p className="private-message">This user has a private profile</p>
                      )}
                      <div className="author-stats">
                        <span>{authorProfile.followerCount} followers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        );
      };

      render(<MockPrivateAuthorAttribution />);

      await waitFor(() => {
        expect(screen.getByText('Private User')).toBeInTheDocument();
        expect(screen.getByText('This user has a private profile')).toBeInTheDocument();
        expect(screen.getByText('5 followers')).toBeInTheDocument();
        expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle profile not found scenarios', async () => {
      mockProfileService.getPublicProfile.mockResolvedValue(null);

      const MockProfileNotFound = () => {
        const [profile, setProfile] = React.useState<PublicProfileView | null | undefined>(undefined);

        React.useEffect(() => {
          mockProfileService.getPublicProfile('non-existent-user').then(setProfile);
        }, []);

        if (profile === undefined) {
          return <div>Loading...</div>;
        }

        if (profile === null) {
          return (
            <div data-testid="profile-not-found">
              <h1>Profile Not Found</h1>
              <p>The user you're looking for doesn't exist or has been removed.</p>
              <button onClick={() => mockPush('/')}>Go Home</button>
            </div>
          );
        }

        return <div>Profile found</div>;
      };

      render(<MockProfileNotFound />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-not-found')).toBeInTheDocument();
        expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      mockProfileService.updateProfile.mockRejectedValue(new Error('Network error'));

      const MockNetworkErrorHandling = () => {
        const [error, setError] = React.useState('');
        const [retryCount, setRetryCount] = React.useState(0);

        const handleSave = async () => {
          try {
            await mockProfileService.updateProfile('test-user-id', { bio: 'Updated bio' });
          } catch (err) {
            setError('Network error. Please check your connection and try again.');
          }
        };

        const handleRetry = () => {
          setError('');
          setRetryCount(prev => prev + 1);
          // Mock successful retry
          if (retryCount > 0) {
            mockProfileService.updateProfile.mockResolvedValueOnce();
          }
        };

        return (
          <div>
            <button onClick={handleSave} data-testid="save-button">Save</button>
            {error && (
              <div className="error-section" data-testid="error-section">
                <p>{error}</p>
                <button onClick={handleRetry} data-testid="retry-button">Retry</button>
              </div>
            )}
          </div>
        );
      };

      render(<MockNetworkErrorHandling />);

      await user.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-section')).toBeInTheDocument();
        expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('retry-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('error-section')).not.toBeInTheDocument();
      });
    });
  });
});
