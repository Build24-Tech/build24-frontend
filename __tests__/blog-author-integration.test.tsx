import BlogGrid from '@/components/blog/BlogGrid';
import { AuthorCard } from '@/components/profile/AuthorCard';
import { AuthorProfileLink } from '@/components/profile/AuthorProfileLink';
import { authorIntegrationService, getAuthorDisplayData } from '@/lib/author-integration-service';
import { getPostsWithAuthorProfiles, getPostWithAuthorProfile, Post } from '@/lib/notion';
import { profileService } from '@/lib/profile-service';
import { PublicProfileView } from '@/types/user';
import { render, screen } from '@testing-library/react';

// Mock the services
jest.mock('@/lib/profile-service');
jest.mock('@/lib/notion');

const mockProfileService = profileService as jest.Mocked<typeof profileService>;
const mockGetPostsWithAuthorProfiles = getPostsWithAuthorProfiles as jest.MockedFunction<typeof getPostsWithAuthorProfiles>;
const mockGetPostWithAuthorProfile = getPostWithAuthorProfile as jest.MockedFunction<typeof getPostWithAuthorProfile>;

describe('Blog Author Integration', () => {
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
    },
    tags: ['tech', 'development'],
    category: 'Technology',
    language: 'en'
  };

  const mockPostWithoutProfile: Post = {
    id: 'post-456',
    title: 'Another Test Post',
    slug: 'another-test-post',
    description: 'Another test post',
    date: '2024-01-02',
    content: '# Another Test',
    author: 'Jane Smith',
    tags: ['design'],
    category: 'Design',
    language: 'en'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthorIntegrationService', () => {
    it('should enhance post with author profile when mapping exists', async () => {
      // Add author mapping
      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');

      mockProfileService.getPublicProfile.mockResolvedValue(mockAuthorProfile);

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(mockPostWithoutProfile);

      expect(mockProfileService.getPublicProfile).toHaveBeenCalledWith('test-user-123');
      expect(enhancedPost.authorId).toBe('test-user-123');
      expect(enhancedPost.authorProfile).toBeDefined();
      expect(enhancedPost.authorProfile?.displayName).toBe('John Doe');
    });

    it('should return post unchanged when no author mapping exists', async () => {
      const postWithoutMapping = { ...mockPostWithoutProfile, author: 'Unknown Author' };

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(postWithoutMapping);

      expect(mockProfileService.getPublicProfile).not.toHaveBeenCalled();
      expect(enhancedPost).toEqual(postWithoutMapping);
    });

    it('should handle profile service errors gracefully', async () => {
      authorIntegrationService.addAuthorMapping('John Doe', 'test-user-123');
      mockProfileService.getPublicProfile.mockRejectedValue(new Error('Profile not found'));

      const enhancedPost = await authorIntegrationService.enhancePostWithAuthorProfile(mockPostWithoutProfile);

      expect(enhancedPost.authorId).toBe('test-user-123');
      expect(enhancedPost.authorProfile).toBeUndefined();
    });

    it('should enhance multiple posts in batches', async () => {
      const posts = [mockPostWithoutProfile, { ...mockPostWithoutProfile, id: 'post-789' }];
      authorIntegrationService.addAuthorMapping('Jane Smith', 'test-user-456');

      mockProfileService.getPublicProfile.mockResolvedValue(mockAuthorProfile);

      const enhancedPosts = await authorIntegrationService.enhancePostsWithAuthorProfiles(posts);

      expect(enhancedPosts).toHaveLength(2);
      expect(mockProfileService.getPublicProfile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAuthorDisplayData', () => {
    it('should extract author display data from post with profile', () => {
      const displayData = getAuthorDisplayData(mockPost);

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
      const displayData = getAuthorDisplayData(mockPostWithoutProfile);

      expect(displayData).toEqual({
        authorId: undefined,
        authorName: 'Jane Smith',
        authorPhotoURL: undefined,
        bio: undefined,
        location: undefined,
        work: undefined,
        role: undefined,
        website: undefined
      });
    });
  });

  describe('AuthorProfileLink Component', () => {
    it('should render author link with profile information', () => {
      const displayData = getAuthorDisplayData(mockPost);

      render(
        <AuthorProfileLink
          {...displayData}
          showAvatar={true}
          size="md"
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/profile/test-user-123');
    });

    it('should render author name without link when no authorId', () => {
      const displayData = getAuthorDisplayData(mockPostWithoutProfile);

      render(
        <AuthorProfileLink
          {...displayData}
          showAvatar={true}
          size="md"
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should not render when no author information is provided', () => {
      render(
        <AuthorProfileLink
          authorId={undefined}
          authorName={undefined}
          showAvatar={true}
          size="md"
        />
      );

      expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });
  });

  describe('AuthorCard Component', () => {
    it('should render full author card with profile information', () => {
      const displayData = getAuthorDisplayData(mockPost);

      render(
        <AuthorCard
          {...displayData}
          followerCount={150}
          followingCount={75}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Software developer and writer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('150 followers')).toBeInTheDocument();
      expect(screen.getByText('75 following')).toBeInTheDocument();
    });

    it('should render compact author card', () => {
      const displayData = getAuthorDisplayData(mockPost);

      render(
        <AuthorCard
          {...displayData}
          compact={true}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      // Bio should not be shown in compact mode
      expect(screen.queryByText('Software developer and writer')).not.toBeInTheDocument();
    });
  });

  describe('BlogGrid Integration', () => {
    it('should render blog posts with author profile links', () => {
      const posts = [mockPost, mockPostWithoutProfile];

      render(<BlogGrid posts={posts} currentLanguage="en" />);

      // Check that author links are rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      // Check that the post with profile has a link
      const johnDoeLink = screen.getByText('John Doe').closest('a');
      expect(johnDoeLink).toHaveAttribute('href', '/profile/test-user-123');

      // Check that the post without profile doesn't have a link
      const janeSmithElement = screen.getByText('Jane Smith');
      expect(janeSmithElement.closest('a')).toBeNull();
    });
  });

  describe('Notion API Integration', () => {
    it('should fetch posts with author profiles', async () => {
      const mockPosts = [mockPost, mockPostWithoutProfile];
      mockGetPostsWithAuthorProfiles.mockResolvedValue(mockPosts);

      const posts = await getPostsWithAuthorProfiles();

      expect(posts).toEqual(mockPosts);
      expect(mockGetPostsWithAuthorProfiles).toHaveBeenCalledTimes(1);
    });

    it('should fetch single post with author profile', async () => {
      mockGetPostWithAuthorProfile.mockResolvedValue(mockPost);

      const post = await getPostWithAuthorProfile('post-123');

      expect(post).toEqual(mockPost);
      expect(mockGetPostWithAuthorProfile).toHaveBeenCalledWith('post-123');
    });

    it('should handle errors when fetching posts with author profiles', async () => {
      mockGetPostsWithAuthorProfiles.mockRejectedValue(new Error('API Error'));

      // Should not throw, but return empty array or fallback
      await expect(getPostsWithAuthorProfiles()).resolves.toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing author information gracefully', () => {
      const postWithoutAuthor: Post = {
        ...mockPost,
        author: undefined,
        authorId: undefined,
        authorProfile: undefined
      };

      const displayData = getAuthorDisplayData(postWithoutAuthor);

      expect(displayData.authorName).toBeUndefined();
      expect(displayData.authorId).toBeUndefined();
    });

    it('should handle partial author profile data', () => {
      const postWithPartialProfile: Post = {
        ...mockPost,
        authorProfile: {
          uid: 'test-user-123',
          displayName: 'John Doe',
          // Missing other fields
        }
      };

      const displayData = getAuthorDisplayData(postWithPartialProfile);

      expect(displayData.authorName).toBe('John Doe');
      expect(displayData.bio).toBeUndefined();
      expect(displayData.location).toBeUndefined();
    });
  });

  describe('Performance Considerations', () => {
    it('should batch process multiple posts efficiently', async () => {
      const manyPosts = Array.from({ length: 15 }, (_, i) => ({
        ...mockPostWithoutProfile,
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
