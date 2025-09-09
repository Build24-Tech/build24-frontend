import { authorIntegrationService, getAuthorDisplayData } from '@/lib/author-integration-service';
import { Post } from '@/lib/notion';
import { profileService } from '@/lib/profile-service';
import { PublicProfileView } from '@/types/user';

// Mock the profile service
jest.mock('@/lib/profile-service', () => ({
  profileService: {
    getPublicProfile: jest.fn()
  }
}));

const mockProfileService = profileService as jest.Mocked<typeof profileService>;

describe('Author Integration Service', () => {
  const mockAuthorProfile: PublicProfileView = {
    uid: 'test-user-123',
    displayName: 'John Doe',
    photoURL: 'https://example.com/photo.jpg',
    bio: 'Software developer and writer',
    location: 'San Francisco, CA',
    work: 'Tech Corp',
    role: 'Senior Developer',
    website: 'https://johndoe.com',
    followerCount: 150,
    followingCount: 75,
    isFollowing: false
  };

  const mockPost: Post = {
    id: 'post-123',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    description: 'A test blog post',
    date: '2024-01-01',
    content: '# Test Content',
    author: 'John Doe',
    tags: ['tech', 'development'],
    category: 'Technology',
    language: 'en'
  };

  const mockPostWithProfile: Post = {
    ...mockPost,
    authorId: 'test-user-123',
    authorProfile: {
      uid: 'test-user-123',
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      bio: 'Software developer and writer',
      location: 'San Francisco, CA',
      work: 'Tech Corp',
      role: 'Senior Developer',
      website: 'https://johndoe.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enhancePostWithAuthorProfile', () => {
    it('should enhance post with author profile when mapping exists', async () => {
      // Add author mapping
      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');

      mockProfileService.getPublicProfile.mockResolvedValue(mockAuthorProfile);

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(mockPost);

      expect(mockProfileService.getPublicProfile).toHaveBeenCalledWith('test-user-123');
      expect(enhancedPost.authorId).toBe('test-user-123');
      expect(enhancedPost.authorProfile).toBeDefined();
      expect(enhancedPost.authorProfile?.displayName).toBe('John Doe');
      expect(enhancedPost.authorProfile?.bio).toBe('Software developer and writer');
    });

    it('should return post unchanged when no author mapping exists', async () => {
      const postWithoutMapping = { ...mockPost, author: 'Unknown Author' };

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(postWithoutMapping);

      expect(mockProfileService.getPublicProfile).not.toHaveBeenCalled();
      expect(enhancedPost).toEqual(postWithoutMapping);
    });

    it('should return post with authorId when profile service fails', async () => {
      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');
      mockProfileService.getPublicProfile.mockRejectedValue(new Error('Profile not found'));

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(mockPost);

      expect(enhancedPost.authorId).toBe('test-user-123');
      expect(enhancedPost.authorProfile).toBeUndefined();
    });

    it('should return post unchanged when no author is provided', async () => {
      const postWithoutAuthor = { ...mockPost, author: undefined };

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(postWithoutAuthor);

      expect(mockProfileService.getPublicProfile).not.toHaveBeenCalled();
      expect(enhancedPost).toEqual(postWithoutAuthor);
    });
  });

  describe('enhancePostsWithAuthorProfiles', () => {
    it('should enhance multiple posts in batches', async () => {
      const posts = [
        mockPost,
        { ...mockPost, id: 'post-456', author: 'Jane Smith' }
      ];

      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');
      authorIntegrationService.addAuthorMapping('Jane Smith', 'test-user-456');

      mockProfileService.getPublicProfile.mockResolvedValue(mockAuthorProfile);

      const enhancedPosts = await authorIntegrationService.enhancePostsWithAuthorProfiles(posts);

      expect(enhancedPosts).toHaveLength(2);
      expect(mockProfileService.getPublicProfile).toHaveBeenCalledTimes(2);
      expect(enhancedPosts[0].authorId).toBe('test-user-123');
      expect(enhancedPosts[1].authorId).toBe('test-user-456');
    });

    it('should handle empty posts array', async () => {
      const enhancedPosts = await authorIntegrationService.enhancePostsWithAuthorProfiles([]);

      expect(enhancedPosts).toEqual([]);
      expect(mockProfileService.getPublicProfile).not.toHaveBeenCalled();
    });
  });

  describe('author mapping management', () => {
    it('should add and retrieve author mappings', () => {
      authorIntegrationService.addAuthorMapping('Test Author', 'test-user-789');

      const mappings = authorIntegrationService.getAuthorMappings();
      expect(mappings['Test Author']).toBe('test-user-789');
    });

    it('should check if author has mapping', () => {
      authorIntegrationService.addAuthorMapping('Mapped Author', 'user-123');

      expect(authorIntegrationService.hasAuthorMapping('Mapped Author')).toBe(true);
      expect(authorIntegrationService.hasAuthorMapping('Unmapped Author')).toBe(false);
    });
  });

  describe('getAuthorDisplayData', () => {
    it('should extract author display data from post with profile', () => {
      const displayData = getAuthorDisplayData(mockPostWithProfile);

      expect(displayData).toEqual({
        authorId: 'test-user-123',
        authorName: 'John Doe',
        authorPhotoURL: 'https://example.com/photo.jpg',
        bio: 'Software developer and writer',
        location: 'San Francisco, CA',
        work: 'Tech Corp',
        role: 'Senior Developer',
        website: 'https://johndoe.com'
      });
    });

    it('should fallback to basic author name when no profile exists', () => {
      const displayData = getAuthorDisplayData(mockPost);

      expect(displayData).toEqual({
        authorId: undefined,
        authorName: 'John Doe',
        authorPhotoURL: undefined,
        bio: undefined,
        location: undefined,
        work: undefined,
        role: undefined,
        website: undefined
      });
    });

    it('should handle post without author information', () => {
      const postWithoutAuthor = { ...mockPost, author: undefined, authorId: undefined };
      const displayData = getAuthorDisplayData(postWithoutAuthor);

      expect(displayData.authorName).toBeUndefined();
      expect(displayData.authorId).toBeUndefined();
    });

    it('should prefer authorProfile displayName over author field', () => {
      const postWithDifferentNames = {
        ...mockPost,
        author: 'Old Name',
        authorProfile: {
          ...mockPostWithProfile.authorProfile!,
          displayName: 'New Name'
        }
      };

      const displayData = getAuthorDisplayData(postWithDifferentNames);
      expect(displayData.authorName).toBe('New Name');
    });
  });

  describe('error handling', () => {
    it('should handle profile service returning null', async () => {
      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');
      mockProfileService.getPublicProfile.mockResolvedValue(null);

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(mockPost);

      expect(enhancedPost.authorId).toBe('test-user-123');
      expect(enhancedPost.authorProfile).toBeUndefined();
    });

    it('should handle partial author profile data', () => {
      const postWithPartialProfile: Post = {
        ...mockPost,
        authorId: 'test-user-123',
        authorProfile: {
          uid: 'test-user-123',
          displayName: 'John Doe'
          // Missing other fields
        }
      };

      const displayData = getAuthorDisplayData(postWithPartialProfile);

      expect(displayData.authorName).toBe('John Doe');
      expect(displayData.bio).toBeUndefined();
      expect(displayData.location).toBeUndefined();
      expect(displayData.work).toBeUndefined();
    });
  });

  describe('performance considerations', () => {
    it('should process large number of posts efficiently', async () => {
      const manyPosts = Array.from({ length: 15 }, (_, i) => ({
        ...mockPost,
        id: `post-${i}`,
        author: `Author ${i}`
      }));

      // Add mappings for some authors
      for (let i = 0; i < 5; i++) {
        authorIntegrationService.addAuthorMapping(`Author ${i}`, `user-${i}`);
      }

      mockProfileService.getPublicProfile.mockResolvedValue(mockAuthorProfile);

      const enhancedPosts = await authorIntegrationService.enhancePostsWithAuthorProfiles(manyPosts);

      expect(enhancedPosts).toHaveLength(15);
      // Should only call profile service for mapped authors
      expect(mockProfileService.getPublicProfile).toHaveBeenCalledTimes(5);
    });
  });
});
