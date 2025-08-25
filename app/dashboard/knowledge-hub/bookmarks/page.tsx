'use client';

import { useBookmarkManager } from '@/components/knowledge-hub/BookmarkManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTheories } from '@/lib/theories';
import { DIFFICULTY_LEVEL_LABELS, Theory, THEORY_CATEGORY_LABELS } from '@/types/knowledge-hub';
import { Bookmark, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BookmarkedTheory extends Theory {
  bookmarkedAt?: Date;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const { bookmarkedTheories, isLoading: bookmarksLoading, toggleBookmark } = useBookmarkManager();
  const [theories, setTheories] = useState<BookmarkedTheory[]>([]);
  const [isLoadingTheories, setIsLoadingTheories] = useState(false);

  // Load theory details for bookmarked theories
  useEffect(() => {
    const loadBookmarkedTheories = async () => {
      if (bookmarkedTheories.length === 0) {
        setTheories([]);
        return;
      }

      setIsLoadingTheories(true);
      try {
        // Get all theories and filter by bookmarked IDs
        const allTheories = await getAllTheories();
        const bookmarkedTheoryObjects = allTheories.filter(theory =>
          bookmarkedTheories.includes(theory.id)
        ).map(theory => ({
          ...theory,
          bookmarkedAt: new Date() // In a real app, this would come from the bookmark timestamp
        }));

        setTheories(bookmarkedTheoryObjects);
      } catch (error) {
        console.error('Failed to load bookmarked theories:', error);
      } finally {
        setIsLoadingTheories(false);
      }
    };

    loadBookmarkedTheories();
  }, [bookmarkedTheories]);

  const handleRemoveBookmark = async (theoryId: string) => {
    await toggleBookmark(theoryId);
  };

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Your <span className="text-yellow-400">Bookmarks</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please sign in to view your bookmarked theories.
          </p>
        </div>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
            <p className="text-gray-400 mb-6">
              Sign in to bookmark theories and access them from anywhere.
            </p>
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-300">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookmarksLoading || isLoadingTheories) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Your <span className="text-yellow-400">Bookmarks</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Loading your bookmarked theories...
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <BookmarkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Your <span className="text-yellow-400">Bookmarks</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Quick access to your saved theories and concepts for easy reference during your building sessions.
        </p>
      </div>

      {/* Bookmarks List */}
      {theories.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {theories.length} bookmarked {theories.length === 1 ? 'theory' : 'theories'}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {theories.map((theory) => (
              <Card key={theory.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${theory.metadata.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                            theory.metadata.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-red-500/10 text-red-400'
                            }`}
                        >
                          {DIFFICULTY_LEVEL_LABELS[theory.metadata.difficulty]}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                          {THEORY_CATEGORY_LABELS[theory.category]}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-yellow-400 transition-colors">
                        {theory.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-yellow-400 hover:text-yellow-300 ml-2"
                      onClick={() => handleRemoveBookmark(theory.id)}
                      aria-label="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-400 line-clamp-3">
                    {theory.summary}
                  </CardDescription>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{theory.metadata.readTime} min read</span>
                      </div>
                      {theory.bookmarkedAt && (
                        <span>Saved {theory.bookmarkedAt.toLocaleDateString()}</span>
                      )}
                    </div>

                    <Button asChild size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                      <Link href={`/dashboard/knowledge-hub/theory/${theory.id}`}>
                        Read Theory
                      </Link>
                    </Button>
                  </div>

                  {/* Tags */}
                  {theory.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {theory.metadata.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {theory.metadata.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs text-gray-500">
                          +{theory.metadata.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 mb-6">
              Start exploring theories and bookmark the ones you find most useful for your projects.
            </p>
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-300">
              <Link href="/dashboard/knowledge-hub">
                Explore Knowledge Hub
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading skeleton component
function BookmarkCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
