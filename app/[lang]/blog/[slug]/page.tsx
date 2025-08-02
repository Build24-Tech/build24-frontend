import LanguageSwitcher from '@/components/blog/LanguageSwitcher';
import { MarkdownRenderer } from '@/components/markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserLanguage } from '@/lib/language-utils';
import { fetchPublishedPosts, getPost, getPosts, Post } from '@/lib/notion';
import { UserLanguage } from '@/types/user';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    const params: { lang: UserLanguage; slug: string }[] = [];

    for (const post of posts) {
      // Generate static params for all supported languages
      // The getBlogPost function will handle finding the correct post for each language
      const urlPath = post.customUrl || post.slug;

      // Ensure urlPath is a valid string
      if (typeof urlPath === 'string' && urlPath.trim() !== '') {
        params.push({
          lang: post.language,
          slug: urlPath,
        });
      } else {
        console.warn(`Skipping post "${post.title}" - invalid URL path:`, urlPath);
      }
    }

    console.log(`Generated ${params.length} static params for blog posts (${posts.length} posts with their actual languages)`);
    return params;
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    return [];
  }
}

// Fetch blog post from Notion API
async function getBlogPost(slug: string, language?: string): Promise<Post | null> {
  try {
    const response = await fetchPublishedPosts();
    const posts: Post[] = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));

    // First try to find post with matching custom URL and language
    let post = posts.find(post => post.customUrl === slug && post.language === language);

    // If not found, try to find post with matching slug and language
    if (!post) {
      post = posts.find(post => post.slug === slug && post.language === language);
    }

    return post || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Allow dynamic params for development (will show 404 for non-existent posts)
export const dynamicParams = true;

export default async function LangBlogPost({
  params,
}: {
  params: Promise<{ lang: UserLanguage; slug: string }>;
}) {
  const { lang, slug } = await params;
  const currentLanguage = getUserLanguage(lang);
  const post = await getBlogPost(slug, currentLanguage);

  if (!post) {
    notFound();
  }

  // Fetch all posts for language switching functionality
  const allPosts = await getPosts();



  return (
    <div className="min-h-screen bg-black text-white align-center">
      {/* Back to Blog - Outside header */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0 px-2 cursor-pointer select-none">
            <Link href={`/${currentLanguage}/blog`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* Article Header - Full width yellow background */}
      <header className="bg-yellow-300 text-black py-12 relative flex flex-col items-center justify-center h-auto border-b border-black bg-yellow text-center gap-20 px-8 pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-28 lg:pb-36">
        <div className="container mx-auto px-4 text-center">
          {/* Category */}
          {post.category && (
            <div className="mb-6">
              <Badge className="bg-black/10 text-black border-black/20 text-sm font-medium">
                {post.category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-medium md:text-6xl md:leading-[0.9] lg:text-8xl mb-8">
            {post.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
            {post.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString()}
              </div>
            )}
            {post.author && (
              <div>By {post.author}</div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="mt-8">
            <LanguageSwitcher
              currentPost={post}
              allPosts={allPosts}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>
    </div>
  );
}
