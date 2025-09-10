'use client';

import { SearchAndFilter } from '@/components/knowledge-hub/SearchAndFilter';
import { TheoryCard } from '@/components/knowledge-hub/TheoryCard';
import { useSearchFilters } from '@/hooks/use-search-filters';
import {
  DifficultyLevel,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import { useState } from 'react';

// Mock theories for demo
const mockTheories: Theory[] = [
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    summary: 'People rely heavily on the first piece of information they receive when making decisions. This cognitive bias affects pricing, negotiations, and user interface design.',
    content: {
      description: 'Anchoring bias is a cognitive bias that describes the tendency to rely heavily on the first piece of information encountered.',
      applicationGuide: 'Use anchoring in pricing strategies by showing a high-priced option first.',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.BEGINNER,
      relevance: [RelevanceType.MARKETING, RelevanceType.UX],
      readTime: 3,
      tags: ['pricing', 'decision-making', 'first-impression']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'People look to others for guidance on how to behave in uncertain situations. This principle is fundamental to building trust and credibility.',
    content: {
      description: 'Social proof is a psychological phenomenon where people assume the actions of others reflect correct behavior.',
      applicationGuide: 'Show testimonials, user counts, and social media mentions to build credibility.',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.INTERMEDIATE,
      relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
      readTime: 5,
      tags: ['testimonials', 'credibility', 'influence']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'loss-aversion',
    title: 'Loss Aversion',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    summary: 'People feel the pain of losing something more strongly than the pleasure of gaining something equivalent. This affects user behavior and decision-making.',
    content: {
      description: 'Loss aversion is the tendency to prefer avoiding losses over acquiring equivalent gains.',
      applicationGuide: 'Frame offers in terms of what users might lose rather than what they might gain.',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.ADVANCED,
      relevance: [RelevanceType.UX, RelevanceType.SALES],
      readTime: 7,
      tags: ['psychology', 'framing', 'motivation']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fitts-law',
    title: "Fitts' Law",
    category: TheoryCategory.UX_PSYCHOLOGY,
    summary: 'The time to acquire a target is a function of the distance to and size of the target. Essential for interface design and user experience optimization.',
    content: {
      description: "Fitts' Law predicts that the time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target.",
      applicationGuide: 'Make important buttons larger and place them closer to where users are likely to be looking.',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.INTERMEDIATE,
      relevance: [RelevanceType.UX],
      readTime: 4,
      tags: ['interface-design', 'usability', 'interaction']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fear-of-missing-out',
    title: 'Fear of Missing Out (FOMO)',
    category: TheoryCategory.EMOTIONAL_TRIGGERS,
    summary: 'The anxiety that an exciting or interesting event may currently be happening elsewhere, often aroused by posts seen on social media.',
    content: {
      description: 'FOMO is a form of social anxiety stemming from the belief that others might be having rewarding experiences from which one is absent.',
      applicationGuide: 'Use limited-time offers, countdown timers, and exclusive access to create urgency.',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.BEGINNER,
      relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
      readTime: 3,
      tags: ['urgency', 'scarcity', 'social-media']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function SearchAndFilterDemo() {
  const [bookmarkedTheories, setBookmarkedTheories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    filters,
    filteredTheories,
    resultCount,
    isSearching,
    updateFilters,
    clearFilters
  } = useSearchFilters({
    theories: mockTheories,
    isLoading
  });

  const handleBookmarkToggle = (theoryId: string) => {
    setBookmarkedTheories(prev =>
      prev.includes(theoryId)
        ? prev.filter(id => id !== theoryId)
        : [...prev, theoryId]
    );
  };

  const handleTheoryClick = (theoryId: string) => {
    console.log('Navigate to theory:', theoryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Search & Filter <span className="text-yellow-400">Demo</span>
        </h1>
        <p className="text-gray-400">
          Try searching for theories, filtering by category, difficulty, or relevance.
        </p>
      </div>

      {/* Search and Filter Component */}
      <SearchAndFilter
        filters={filters}
        onFiltersChange={updateFilters}
        isLoading={isSearching}
        resultCount={resultCount}
      />

      {/* Loading State */}
      {isSearching && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Results */}
      {!isSearching && (
        <>
          {filteredTheories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheories.map((theory) => (
                <TheoryCard
                  key={theory.id}
                  theory={theory}
                  isBookmarked={bookmarkedTheories.includes(theory.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                  onTheoryClick={handleTheoryClick}
                  showPremiumBadge={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                No theories found matching your criteria
              </div>
              <button
                onClick={clearFilters}
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Demo Controls */}
      <div className="mt-12 p-6 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Demo Controls</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
          >
            Toggle Loading: {isLoading ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
          >
            Clear All Filters
          </button>
          <button
            onClick={() => updateFilters({
              ...filters,
              searchQuery: 'bias'
            })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm"
          >
            Search "bias"
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Current filters: {JSON.stringify(filters, null, 2)}</p>
        </div>
      </div>
    </div>
  );
}
