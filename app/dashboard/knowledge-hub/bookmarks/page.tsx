'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  // Mock bookmarked theories - this will be replaced with actual user data in future tasks
  const bookmarkedTheories = [
    {
      id: 'anchoring-bias',
      title: 'Anchoring Bias',
      category: 'cognitive-biases',
      categoryName: 'Cognitive Biases',
      summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
      difficulty: 'beginner',
      readTime: 3,
      relevance: ['marketing', 'ux'],
      bookmarkedAt: new Date('2024-01-20')
    }
  ];

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
      {bookmarkedTheories.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {bookmarkedTheories.map((theory) => (
            <Card key={theory.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${theory.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                            theory.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-red-500/10 text-red-400'
                          }`}
                      >
                        {theory.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                        {theory.categoryName}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-yellow-400 transition-colors">
                      {theory.title}
                    </CardTitle>
                  </div>
                  <Bookmark className="w-5 h-5 text-yellow-400 ml-2" />
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
                      <span>{theory.readTime} min read</span>
                    </div>
                    <span>Saved {theory.bookmarkedAt.toLocaleDateString()}</span>
                  </div>

                  <Button asChild size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                    <Link href={`/dashboard/knowledge-hub/theory/${theory.id}`}>
                      Read Theory
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
