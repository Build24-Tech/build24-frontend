import { MetadataRoute } from 'next';
import { fetchPublishedPosts, getPost } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Get all posts
  const postsResponse = await fetchPublishedPosts();
  const allPosts = await Promise.all(
    postsResponse.results.map((p) => getPost(p.id))
  );

  const postEntries: MetadataRoute.Sitemap = allPosts
    .filter((post) => post !== null)
    .map((post) => ({
      url: `${baseUrl}/blog/${post!.slug}`,
      lastModified: new Date(post!.date),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Get all static pages
  const staticPages = [
    '', // Home page
    '/about',
    '/blog',
    '/projects',
    '/subscribe',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: page === '' ? 1.0 : 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
