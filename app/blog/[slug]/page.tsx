import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { notFound } from 'next/navigation';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';

export async function generateStaticParams() {
  // Fetch all published posts from Notion to generate static params
  try {
    const response = await fetchPublishedPosts();
    const posts: Post[] = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));
    
    return posts.map(post => ({
      slug: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
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

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <article className="container mx-auto px-4 py-12">
        {/* Back to Blog */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0">
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
        <div 
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

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