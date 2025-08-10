'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bookmark, Clock, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

// Mock data for theories - this will be replaced with actual data loading in future tasks
const mockTheories = {
  'cognitive-biases': [
    {
      id: 'anchoring-bias',
      title: 'Anchoring Bias',
      summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
      difficulty: 'beginner',
      readTime: 3,
      relevance: ['marketing', 'ux'],
      isBookmarked: false,
      isPremium: false
    },
    {
      id: 'scarcity-principle',
      title: 'Scarcity Principle',
      summary: 'People value things more when they perceive them as rare or limited in availability.',
      difficulty: 'beginner',
      readTime: 4,
      relevance: ['marketing', 'sales'],
      isBookmarked: false,
      isPremium: false
    }
  ],
  'persuasion-principles': [
    {
      id: 'cialdini-reciprocity',
      title: 'Reciprocity Principle',
      summary: 'People feel obligated to return favors and treat others as they have been treated.',
      difficulty: 'intermediate',
      readTime: 5,
      relevance: ['marketing', 'sales'],
      isBookmarked: false,
      isPremium: false
    }
  ],
  'behavioral-economics': [
    {
      id: 'loss-aversion',
      title: 'Loss Aversion',
      summary: 'People prefer avoiding losses over acquiring equivalent gains - losses feel twice as powerful as gains.',
      difficulty: 'intermediate',
      readTime: 6,
      relevance: ['marketing', 'ux'],
      isBookmarked: false,
      isPremium: true
    }
  ],
  'ux-psychology': [
    {
      id: 'fitts-law',
      title: "Fitts' Law",
      summary: 'The time to acquire a target is a function of the distance to and size of the target.',
      difficulty: 'beginner',
      readTime: 4,
      relevance: ['ux'],
      isBookmarked: false,
      isPremium: false
    }
  ],
  'emotional-triggers': [
    {
      id: 'fear-of-missing-out',
      title: 'Fear of Missing Out (FOMO)',
      summary: 'The anxiety that others might be having rewarding experiences from which one is absent.',
      difficulty: 'beginner',
      readTime: 3,
      relevance: ['marketing', 'sales'],
      isBookmarked: false,
      isPremium: false
    }
  ]
};

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

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];
  const theories = mockTheories[categoryId as keyof typeof mockTheories] || [];

  const filteredTheories = useMemo(() => {
    return theories.filter(theory => {
      const matchesSearch = theory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theory.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || theory.difficulty === difficultyFilter;
      const matchesRelevance = relevanceFilter === 'all' || theory.relevance.includes(relevanceFilter);

      return matchesSearch && matchesDifficulty && matchesRelevance;
    });
  }, [theories, searchQuery, difficultyFilter, relevanceFilter]);

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

      {/* Theories Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTheories.map((theory) => (
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
                    {theory.isPremium && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 text-xs">
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
                  size="sm"
                  className={`ml-2 ${theory.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                >
                  <Bookmark className="w-4 h-4" />
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
                    <span>{theory.readTime} min read</span>
                  </div>
                  <div className="flex space-x-1">
                    {theory.relevance.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                        {tag}
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
        ))}
      </div>

      {/* No Results */}
      {filteredTheories.length === 0 && (
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
