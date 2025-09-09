import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { getMultiplePublicProfiles, profileExists, profileService } from '@/lib/profile-service';
import { ProfileError, UserProfile, UserProfileData } from '@/types/user';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

// Mock Firebase modules
jest.mock('@/lib/firestore');
jest.mock('firebase/storage');
jest.mock('@/lib/firebase', () => ({
  db: {},
  storage: {}
}));

const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>;
const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;
const mockDeleteObject = deleteObject as jest.MockedFunction<typeof deleteObject>;
const mockRef = ref as jest.MockedFunction<typeof ref>;

describe('Profile Service', () => {
  const mockUserId = 'test-user-id';
  const mockUserProfile: UserProfile = {
    uid: mockUserId,
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    status: 'active',
    emailUpdates: true,
    language: 'en',
    theme: 'system',
    subscription: {
      tier: 'free'
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    profile: {
      bio: 'Test bio',
      location: 'Test Location',
      website: 'https://example.com',
      work: 'Test Company',
      role: 'Developer',
      showEmail: true,
      isPublic: true,
      followerCount: 10,
      followingCount: 5
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicProfile', () => {
    it('should return public profile view for public profile', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);

      const result = await profileService.getPublicProfile(mockUserId);

      expect(result).toEqual({
        uid: mockUserId,
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        location: 'Test Location',
        website: 'https://example.com',
        work: 'Test Company',
        role: 'Developer',
        email: 'test@example.com',
        followerCount: 10,
        followingCount: 5
      });
    });

    it('should return limited profile view for private profile', async () => {
      const privateProfile = {
        ...mockUserProfile,
        profile: {
          ...mockUserProfile.profile,
          isPublic: false
        }
      };
      mockGetUserProfile.mockResolvedValue(privateProfile);

      const result = await profileService.getPublicProfile(mockUserId);

      expect(result).toEqual({
        uid: mockUserId,
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        followerCount: 10,
        followingCount: 5
      });
      expect(result?.bio).toBeUndefined();
      expect(result?.email).toBeUndefined();
    });

    it('should not include email if showEmail is false', async () => {
      const profileWithoutEmail = {
        ...mockUserProfile,
        profile: {
          ...mockUserProfile.profile,
          showEmail: false
        }
      };
      mockGetUserProfile.mockResolvedValue(profileWithoutEmail);

      const result = await profileService.getPublicProfile(mockUserId);

      expect(result?.email).toBeUndefined();
    });

    it('should return null if profile does not exist', async () => {
      mockGetUserProfile.mockResolvedValue(null);

      const result = await profileService.getPublicProfile(mockUserId);

      expect(result).toBeNull();
    });

    it('should throw error if database error occurs', async () => {
      mockGetUserProfile.mockRejectedValue(new Error('Database error'));

      await expect(profileService.getPublicProfile(mockUserId))
        .rejects.toThrow(ProfileError.PROFILE_NOT_FOUND);
    });
  });

  describe('updateProfile', () => {
    const validProfileData: Partial<UserProfileData> = {
      bio: 'Updated bio',
      location: 'New Location',
      website: 'https://newsite.com'
    };

    it('should update profile with valid data', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockUpdateUserProfile.mockResolvedValue();

      await profileService.updateProfile(mockUserId, validProfileData);

      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockUserId, {
        profile: {
          ...mockUserProfile.profile,
          ...validProfileData
        }
      });
    });

    it('should sanitize profile data by trimming whitespace', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockUpdateUserProfile.mockResolvedValue();

      const dataWithWhitespace = {
        bio: '  Updated bio  ',
        location: '  New Location  '
      };

      await profileService.updateProfile(mockUserId, dataWithWhitespace);

      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockUserId, {
        profile: {
          ...mockUserProfile.profile,
          bio: 'Updated bio',
          location: 'New Location'
        }
      });
    });

    it('should validate bio length', async () => {
      const longBio = 'a'.repeat(501);

      await expect(profileService.updateProfile(mockUserId, { bio: longBio }))
        .rejects.toThrow('Bio must be 500 characters or less');
    });

    it('should validate website URL format', async () => {
      await expect(profileService.updateProfile(mockUserId, { website: 'invalid-url' }))
        .rejects.toThrow('Website must be a valid URL');
    });

    it('should validate location length', async () => {
      const longLocation = 'a'.repeat(101);

      await expect(profileService.updateProfile(mockUserId, { location: longLocation }))
        .rejects.toThrow('Location must be 100 characters or less');
    });

    it('should validate work length', async () => {
      const longWork = 'a'.repeat(101);

      await expect(profileService.updateProfile(mockUserId, { work: longWork }))
        .rejects.toThrow('Work must be 100 characters or less');
    });

    it('should validate role length', async () => {
      const longRole = 'a'.repeat(101);

      await expect(profileService.updateProfile(mockUserId, { role: longRole }))
        .rejects.toThrow('Role must be 100 characters or less');
    });

    it('should throw error if profile does not exist', async () => {
      mockGetUserProfile.mockResolvedValue(null);

      await expect(profileService.updateProfile(mockUserId, validProfileData))
        .rejects.toThrow(ProfileError.PROFILE_NOT_FOUND);
    });
  });

  describe('togglePrivacy', () => {
    it('should toggle privacy to public', async () => {
      const privateProfile = {
        ...mockUserProfile,
        profile: {
          ...mockUserProfile.profile,
          isPublic: false
        }
      };
      mockGetUserProfile.mockResolvedValue(privateProfile);
      mockUpdateUserProfile.mockResolvedValue();

      await profileService.togglePrivacy(mockUserId, true);

      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockUserId, {
        profile: {
          ...privateProfile.profile,
          isPublic: true
        }
      });
    });

    it('should toggle privacy to private', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockUpdateUserProfile.mockResolvedValue();

      await profileService.togglePrivacy(mockUserId, false);

      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockUserId, {
        profile: {
          ...mockUserProfile.profile,
          isPublic: false
        }
      });
    });

    it('should throw error if profile does not exist', async () => {
      mockGetUserProfile.mockResolvedValue(null);

      await expect(profileService.togglePrivacy(mockUserId, true))
        .rejects.toThrow(ProfileError.PROFILE_NOT_FOUND);
    });
  });

  describe('uploadProfileImage', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockDownloadURL = 'https://storage.example.com/new-image.jpg';

    beforeEach(() => {
      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);
      mockDeleteObject.mockResolvedValue();
    });

    it('should upload image and update profile', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockUpdateUserProfile.mockResolvedValue();

      const result = await profileService.uploadProfileImage(mockUserId, mockFile);

      expect(mockUploadBytes).toHaveBeenCalled();
      expect(mockGetDownloadURL).toHaveBeenCalled();
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(mockUserId, {
        photoURL: mockDownloadURL
      });
      expect(result).toBe(mockDownloadURL);
    });

    it('should delete old profile image before uploading new one', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);
      mockUpdateUserProfile.mockResolvedValue();

      await profileService.uploadProfileImage(mockUserId, mockFile);

      expect(mockDeleteObject).toHaveBeenCalled();
    });

    it('should validate file type', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(profileService.uploadProfileImage(mockUserId, invalidFile))
        .rejects.toThrow('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should validate file size', async () => {
      // Create a mock file that's too large (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      await expect(profileService.uploadProfileImage(mockUserId, largeFile))
        .rejects.toThrow('Image must be smaller than 5MB');
    });

    it('should handle upload errors', async () => {
      mockUploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(profileService.uploadProfileImage(mockUserId, mockFile))
        .rejects.toThrow(ProfileError.UPLOAD_FAILED);
    });
  });

  describe('profileExists', () => {
    it('should return true if profile exists', async () => {
      mockGetUserProfile.mockResolvedValue(mockUserProfile);

      const result = await profileExists(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false if profile does not exist', async () => {
      mockGetUserProfile.mockResolvedValue(null);

      const result = await profileExists(mockUserId);

      expect(result).toBe(false);
    });

    it('should return false if error occurs', async () => {
      mockGetUserProfile.mockRejectedValue(new Error('Database error'));

      const result = await profileExists(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getMultiplePublicProfiles', () => {
    const userIds = ['user1', 'user2', 'user3'];
    const mockProfiles = userIds.map((id, index) => ({
      uid: id,
      displayName: `User ${index + 1}`,
      followerCount: index,
      followingCount: index
    }));

    it('should return multiple public profiles', async () => {
      // Mock the profileService.getPublicProfile calls
      jest.spyOn(profileService, 'getPublicProfile')
        .mockImplementation(async (userId) => {
          const index = userIds.indexOf(userId);
          return index >= 0 ? mockProfiles[index] : null;
        });

      const result = await getMultiplePublicProfiles(userIds);

      expect(result).toEqual(mockProfiles);
      expect(profileService.getPublicProfile).toHaveBeenCalledTimes(3);
    });

    it('should filter out null results', async () => {
      jest.spyOn(profileService, 'getPublicProfile')
        .mockImplementation(async (userId) => {
          if (userId === 'user2') return null; // Simulate missing profile
          const index = userIds.indexOf(userId);
          return mockProfiles[index];
        });

      const result = await getMultiplePublicProfiles(userIds);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.uid)).toEqual(['user1', 'user3']);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(profileService, 'getPublicProfile')
        .mockImplementation(async (userId) => {
          if (userId === 'user2') throw new Error('Profile error');
          const index = userIds.indexOf(userId);
          return mockProfiles[index];
        });

      const result = await getMultiplePublicProfiles(userIds);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.uid)).toEqual(['user1', 'user3']);
    });
  });
});
