import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createLanguageUrl } from '@/lib/language-utils';
import { Post } from '@/lib/notion';
import { UserLanguage } from '@/types/user';
import { ArrowRight, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogGridProps {
  posts: Post[];
  currentLanguage: UserLanguage;
}

export default function BlogGrid({ posts, currentLanguage }: BlogGridProps) {
  return (
    <>
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => (
            <Link href={createLanguageUrl(post.slug || 'not-found', currentLanguage, post.customUrl)} key={post.id} className="block h-full">
              <Card className="dark:bg-gray-900 bg-gray-100 dark:border-gray-700 border-gray-300 hover:dark:border-gray-600 hover:border-gray-400 transition-all duration-300 group h-full flex flex-col">
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
                    <div className="w-full h-full flex items-center justify-center dark:bg-gray-800 bg-gray-200">
                      <span className="dark:text-gray-500 text-gray-600">No image</span>
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
                  <CardTitle className="dark:text-white text-black group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {post.title || 'Untitled Post'}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400 text-gray-600 line-clamp-3">
                    {post.description || 'No description available'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm dark:text-gray-500 text-gray-600 mb-4">
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
                          className="dark:border-gray-600 border-gray-400 dark:text-gray-300 text-gray-700 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : null}
                  </div>

                  <div className="mt-auto">
                    <Button className="dark:bg-black bg-gray-800 text-white hover:bg-gray-700 dark:hover:bg-gray-800 w-full cursor-pointer select-none">
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
        <div className="text-center py-20 dark:bg-gray-900 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-medium mb-4">No Blog Posts Available</h3>
          <p className="dark:text-gray-400 text-gray-600">Try changing your filters or check back later for new content.</p>
        </div>
      )}
    </>
  );
}
