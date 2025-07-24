import Header from '@/components/Header';
import Hero from '@/components/blog/Hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';
import { ArrowRight, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function BlogPage() {
  // Fetch real data from Notion
  let blogPosts: Post[] = [];
  
  try {
    const response = await fetchPublishedPosts();
    blogPosts = await Promise.all(
      response.results.map((page: any) => getPost(page.id))
    ).then(posts => posts.filter((post): post is Post => post !== null));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Will render the page with an empty array of posts
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="w-full h-[400px]">
        <Hero />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Blog Posts Grid */}
        {blogPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post: Post) => (
              <Link href={`/blog/${post.slug || 'not-found'}`} key={post.id} className="block h-full">
                <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 group h-full flex flex-col">
                  {/* Feature Image */}
                  <div className="w-full aspect-video overflow-hidden relative">
                    {post.coverImage ? (
                      <Image 
                        src={post.coverImage}
                        alt={`Feature image for ${post.title}`}
                        className="transition-transform duration-300 group-hover:scale-105 object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {post.category && (
                        <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {post.title || 'Untitled Post'}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {post.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date ? new Date(post.date).toLocaleDateString() : 'No date'}
                      </div>
                      {post.author && (
                        <div className="flex items-center gap-1">
                          <span>By {post.author}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags && post.tags.length > 0 ? (
                        post.tags.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-gray-600 text-gray-300 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : null}
                    </div>

                    <div className="mt-auto">
                      <Button className="bg-black text-white hover:bg-gray-800 w-full">
                        <span className="flex items-center gap-2">
                          Read More <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-medium mb-4">No Blog Posts Available</h3>
            <p className="text-gray-400">Check back later for new content.</p>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}
