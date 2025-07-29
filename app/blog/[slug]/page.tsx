
import { MarkdownRenderer } from '@/components/markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
async function getBlogPost(slug: string): Promise<Post | null> {
  try {
    const response = await fetchPublishedPosts();
    const posts: Post[] = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));

    return posts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Allow dynamic params for development (will show 404 for non-existent posts)
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <article className="container mx-auto px-4 py-8">
        {/* Back to Blog */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0 px-2 cursor-pointer select-none">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            {post.category && (
              <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                {post.category}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Feature Image */}
          {post.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden relative aspect-[16/9]">
              <Image
                src={post.coverImage}
                alt={`Cover image for ${post.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString()}
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <span>By {post.author}</span>
              </div>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

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
            <Link href="/blog">← Previous Post</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <Link href="/blog">Next Post →</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
