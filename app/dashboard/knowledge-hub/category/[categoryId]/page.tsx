'use client';

import { useBookmarkManager } from '@/components/knowledge-hub/BookmarkManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTheories } from '@/lib/theories';
import { DIFFICULTY_LEVEL_LABELS, Theory, TheoryCategory } from '@/types/knowledge-hub';
import { Bookmark, BookmarkCheck, Clock, Filter, Search, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const categoryInfo = {
  'cognitive-biases': {
    name: 'Cognitive Biases',
    description: 'Understanding how the mind makes decisions and shortcuts',
    color: 'text-blue-400'
  },
  'persuasion-principles': {
    name: 'Persuasion Principles',
    description: 'Proven techniques for influencing behavior and decisions',
    color: 'text-green-400'
  },
  'behavioral-economics': {
    name: 'Behavioral Economics',
    description: 'How psychology affects economic decisions',
    color: 'text-purple-400'
  },
  'ux-psychology': {
    name: 'UX Psychology',
    description: 'Psychological principles for better user experiences',
    color: 'text-yellow-400'
  },
  'emotional-triggers': {
    name: 'Emotional Triggers',
    description: 'Understanding and leveraging emotional responses',
    color: 'text-red-400'
  }
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [relevanceFilter, setRelevanceFilter] = useState('all');
  const [theories, setTheories] = useState<Theory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isBookmarked, toggleBookmark } = useBookmarkManager();

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];

  // Load theories for this category
  useEffect(() => {
    const loadCategoryTheories = async () => {
      try {
        setIsLoading(true);
        const allTheories = await getAllTheories();
        const categoryTheories = allTheories.filter(
          theory => theory.category === categoryId as TheoryCategory
        );
        setTheories(categoryTheories);
      } catch (error) {
        console.error('Failed to load theories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategoryTheories();
    }
  }, [categoryId]);

  const filteredTheories = useMemo(() => {
    return theories.filter(theory => {
      const matchesSearch = theory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theory.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || theory.metadata.difficulty === difficultyFilter;
      const matchesRelevance = relevanceFilter === 'all' || theory.metadata.relevance.includes(relevanceFilter as any);

      return matchesSearch && matchesDifficulty && matchesRelevance;
    });
  }, [theories, searchQuery, difficultyFilter, relevanceFilter]);

  const handleBookmarkToggle = async (theoryId: string) => {
    await toggleBookmark(theoryId);
  };

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Category Not Found</h1>
        <p className="text-gray-400">The requested category does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          <span className={category.color}>{category.name}</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {category.description}
        </p>
        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
          {theories.length} theories available
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search theories in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 focus:border-yellow-400"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Relevance Filter */}
            <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="ux">UX Design</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 bg-gray-700 rounded animate-pulse" />
                      <div className="h-5 w-12 bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Theories Grid */
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTheories.map((theory) => {
            const theoryIsBookmarked = isBookmarked(theory.id);
            const isPremium = !!theory.premiumContent;

            return (
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
                        {isPremium && (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-yellow-400 transition-colors">
                        {theory.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ml-2 ${theoryIsBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      onClick={() => handleBookmarkToggle(theory.id)}
                      aria-label={theoryIsBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {theoryIsBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
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
                      <div className="flex space-x-1">
                        {theory.metadata.relevance.slice(0, 2).map((relevanceType) => (
                          <Badge key={relevanceType} variant="outline" className="text-xs border-gray-700 text-gray-400">
                            {relevanceType}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button asChild size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                      <Link href={`/dashboard/knowledge-hub/theory/${theory.id}`}>
                        Read Theory
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredTheories.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No theories found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or filters to find more theories.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('all');
                setRelevanceFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
