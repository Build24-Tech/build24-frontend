import { SUPPORTED_LANGUAGES } from '@/lib/language-utils';
import { fetchPublishedPosts, getPost } from '@/lib/notion';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // Get all posts
    const postsResponse = await fetchPublishedPosts();
    const allPosts = await Promise.all(
      postsResponse.results.map((p) => getPost(p.id))
    );

    const validPosts = allPosts.filter((post) => post !== null);

    // Language-specific post entries - only include posts that match the language
    const langPostEntries: MetadataRoute.Sitemap = SUPPORTED_LANGUAGES.flatMap((lang) =>
      validPosts
        .filter((post) => post!.language === lang) // Only include posts that match the language
        .map((post) => ({
          url: `${baseUrl}/${lang}/blog/${post!.customUrl || post!.slug}`,
          lastModified: new Date(post!.date),
          changeFrequency: 'daily',
          priority: 0.8,
        }))
    );

    // Static pages
    const staticPages = [
      '', // Home page
      '/about',
      '/blog',
      '/projects',
      '/subscribe',
      '/login',
      '/signup',
      '/dashboard',
      '/privacy',
      '/terms',
    ];

    // Legacy static entries (non-language-prefixed)
    const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1.0 : 0.7,
    }));

    // Language-specific static entries
    const langStaticEntries: MetadataRoute.Sitemap = SUPPORTED_LANGUAGES.flatMap((lang) =>
      staticPages.map((page) => ({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.7,
      }))
    );

    const allEntries = [...staticEntries, ...langStaticEntries, ...langPostEntries];

    console.log(`Generated sitemap with ${allEntries.length} entries:`);
    console.log(`- ${staticEntries.length} legacy static pages`);
    console.log(`- ${langStaticEntries.length} language-specific static pages (${SUPPORTED_LANGUAGES.length} languages × ${staticPages.length} pages)`);
    console.log(`- ${langPostEntries.length} language-specific blog posts (${SUPPORTED_LANGUAGES.length} languages × ${validPosts.length} posts)`);

    return allEntries;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic entries on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }
}
