import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPublishedPosts, getPost, Post } from '@/lib/notion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function BlogPage() {
  // Fetch real data from Notion
  console.log('~~~~ blogPosts');
  const response = await fetchPublishedPosts();
  const blogPosts: Post[] = await Promise.all(
    response.results.map((page: any) => getPost(page.id))
  ).then(posts => posts.filter((post): post is Post => post !== null));
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The Build24 <span className="text-yellow-400">Journey</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Follow along as I build 24 unique projects in 24 hours. Each post documents
            the process, challenges, and learnings from every hour.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post: Post) => (
            <Card key={post.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  {post.category && (
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                      {post.category}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {post.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <span>By {post.author}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-gray-600 text-gray-300 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button asChild className="bg-black text-white hover:bg-gray-800">
                  <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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
