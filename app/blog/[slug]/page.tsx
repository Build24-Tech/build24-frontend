
import { MarkdownRenderer } from '@/components/markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserLanguage } from '@/lib/language-utils';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';
import { ArrowLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // For static export, we need to generate all possible blog post slugs
  try {
    const response = await fetchPublishedPosts();
    const posts: Post[] = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));

    const slugs = posts.map(post => ({
      slug: post.slug
    }));

    console.log('Generated static params for blog posts:', slugs);
    return slugs;
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array on error - this will cause 404 for all blog posts
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

    // First try to find post with matching slug and language
    let post = posts.find(post => post.slug === slug && post.language === language);

    // If not found, fallback to any post with matching slug (default to English)
    if (!post) {
      post = posts.find(post => post.slug === slug);
    }

    return post || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Allow dynamic params for development (will show 404 for non-existent posts)
export const dynamicParams = true;

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const currentLanguage = getUserLanguage(lang);
  const post = await getBlogPost(slug, currentLanguage);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white align-center">
      {/* Back to Blog - Outside header */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0 px-2 cursor-pointer select-none">
            <Link href={`/blog?lang=${currentLanguage}`} className="flex items-center gap-2">
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
          {/* Tags and Meta */}
          <div className="flex flex-wrap justify-between items-center mb-8">
            {/* Tags on the left */}
            <div className="flex-1">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-black/30 text-black bg-transparent hover:bg-black/10 text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Meta info on the right */}
            <div className="flex items-center gap-x-3 text-right">
              <span className="text-black/70">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date ? new Date(post.date).toLocaleDateString() : 'No date'}
                </span>
              </span>
              {post.author && (
                <span className="text-black/70">By {post.author}</span>
              )}
            </div>
          </div>

          {/* Feature Image */}
          {post.coverImage && (
            <div className="rounded-lg overflow-hidden relative aspect-[16/9] max-w-4xl">
              <Image
                src={post.coverImage}
                alt={`Cover image for ${post.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                priority
              />
            </div>
          )}
        </div>
      </header>

      {/* Article Content - Inside container */}
      <article className="container mx-auto px-4 py-12">

        {/* Article Content */}
        {post.content ? (
          <MarkdownRenderer content={post.content} className="prose-lg" />
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium mb-4">Content Unavailable</h3>
            <p>We apologize, but the content for this article is currently unavailable.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-12 mt-12 border-t border-gray-800">
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <Link href={`/blog?lang=${currentLanguage}`}>← Previous Post</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <Link href={`/blog?lang=${currentLanguage}`}>Next Post →</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
