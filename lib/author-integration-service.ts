import { Post } from './notion';
import { profileService } from './profile-service';

/**
 * Author mapping configuration
 * Maps Notion author names to Firebase user IDs
 */
const AUTHOR_MAPPING: Record<string, string> = {
  // Add mappings here as needed
  // Example: 'John Doe': 'firebase-user-id-123'
};

/**
 * Service for integrating author profiles with blog posts
 */
export class AuthorIntegrationService {
  /**
   * Get author ID from author name using the mapping
   */
  private getAuthorIdFromName(authorName: string): string | undefined {
    return AUTHOR_MAPPING[authorName];
  }

  /**
   * Enhance a single post with author profile information
   */
  async enhancePostWithAuthorProfile(post: Post): Promise<Post> {
    // If post doesn't have an author, return as-is
    if (!post.author) {
      return post;
    }

    // Try to get author ID from mapping
    const authorId = this.getAuthorIdFromName(post.author);
    if (!authorId) {
      // No mapping found, return post with just the author name
      return post;
    }

    try {
      // Fetch author profile
      const authorProfile = await profileService.getPublicProfile(authorId);
      if (!authorProfile) {
        // Profile not found or private, return post with just author ID
        return {
          ...post,
          authorId
        };
      }

      // Return post with enhanced author information
      return {
        ...post,
        authorId,
        authorProfile: {
          uid: authorProfile.uid,
          displayName: authorProfile.displayName,
          photoURL: authorProfile.photoURL,
          bio: authorProfile.bio,
          location: authorProfile.location,
          work: authorProfile.work,
          role: authorProfile.role,
          website: authorProfile.website
        }
      };
    } catch (error) {
      console.warn(`Failed to fetch author profile for ${post.author}:`, error);
      // Return post with author ID but no profile data
      return {
        ...post,
        authorId
      };
    }
  }

  /**
   * Enhance multiple posts with author profile information
   */
  async enhancePostsWithAuthorProfiles(posts: Post[]): Promise<Post[]> {
    // Process posts in parallel but limit concurrency to avoid overwhelming the database
    const batchSize = 5;
    const enhancedPosts: Post[] = [];

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const enhancedBatch = await Promise.all(
        batch.map(post => this.enhancePostWithAuthorProfile(post))
      );
      enhancedPosts.push(...enhancedBatch);
    }

    return enhancedPosts;
  }

  /**
   * Add or update author mapping
   */
  addAuthorMapping(authorName: string, userId: string): void {
    AUTHOR_MAPPING[authorName] = userId;
  }

  /**
   * Get all current author mappings
   */
  getAuthorMappings(): Record<string, string> {
    return { ...AUTHOR_MAPPING };
  }

  /**
   * Check if an author has a profile mapping
   */
  hasAuthorMapping(authorName: string): boolean {
    return authorName in AUTHOR_MAPPING;
  }
}

// Export singleton instance
export const authorIntegrationService = new AuthorIntegrationService();

/**
 * Helper function to get author profile data for display
 */
export const getAuthorDisplayData = (post: Post) => {
  return {
    authorId: post.authorId,
    authorName: post.authorProfile?.displayName || post.author,
    authorPhotoURL: post.authorProfile?.photoURL,
    bio: post.authorProfile?.bio,
    location: post.authorProfile?.location,
    work: post.authorProfile?.work,
    role: post.authorProfile?.role,
    website: post.authorProfile?.website
  };
};
