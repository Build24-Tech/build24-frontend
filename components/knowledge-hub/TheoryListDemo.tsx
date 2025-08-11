'use client';

import { Button } from '@/components/ui/button';
import {
  DifficultyLevel,
  RelevanceType,
  Theory,
  TheoryCategory
} from '@/types/knowledge-hub';
import { useState } from 'react';
import { TheoryList } from './TheoryList';

// Mock theory data for demonstration
const mockTheories: Theory[] = [
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    summary: 'The anchoring bias describes the common human tendency to rely too heavily on the first piece of information encountered when making decisions. This cognitive bias significantly impacts how users perceive pricing, product features, and value propositions in digital products.',
    content: {
      description: 'Detailed description of anchoring bias',
      applicationGuide: 'How to apply anchoring bias in product design',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.BEGINNER,
      relevance: [RelevanceType.MARKETING, RelevanceType.UX],
      readTime: 3,
      tags: ['pricing', 'decision-making', 'first-impression']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'scarcity-principle',
    title: 'Scarcity Principle',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'The scarcity principle suggests that people place higher value on things that are rare or limited in availability. This psychological trigger can be effectively used in product design to increase conversion rates and user engagement through strategic implementation.',
    content: {
      description: 'Detailed description of scarcity principle',
      applicationGuide: 'How to apply scarcity in product design',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.INTERMEDIATE,
      relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
      readTime: 4,
      tags: ['conversion', 'urgency', 'limited-time']
    },
    premiumContent: {
      extendedCaseStudies: 'Extended case studies for premium users',
      downloadableResources: [],
      advancedApplications: 'Advanced applications content'
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'loss-aversion',
    title: 'Loss Aversion',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    summary: 'Loss aversion is the tendency for people to prefer avoiding losses over acquiring equivalent gains. This powerful psychological principle suggests that the pain of losing is psychologically twice as powerful as the pleasure of gaining something of equal value.',
    content: {
      description: 'Detailed description of loss aversion',
      applicationGuide: 'How to apply loss aversion in product design',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.ADVANCED,
      relevance: [RelevanceType.UX, RelevanceType.MARKETING],
      readTime: 6,
      tags: ['psychology', 'risk', 'decision-making']
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export function TheoryListDemo() {
  const [bookmarkedTheories, setBookmarkedTheories] = useState<string[]>(['anchoring-bias']);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const handleBookmarkToggle = (theoryId: string) => {
    setBookmarkedTheories(prev =>
      prev.includes(theoryId)
        ? prev.filter(id => id !== theoryId)
        : [...prev, theoryId]
    );
  };

  const handleTheoryClick = (theoryId: string) => {
    console.log('Theory clicked:', theoryId);
    // In a real app, this would navigate to the theory detail page
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const toggleEmpty = () => {
    setShowEmpty(!showEmpty);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={simulateLoading} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Simulate Loading'}
        </Button>
        <Button onClick={toggleEmpty} variant="outline">
          {showEmpty ? 'Show Theories' : 'Show Empty State'}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Theory List Demo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bookmarked theories: {bookmarkedTheories.join(', ') || 'None'}
          </p>
        </div>

        <TheoryList
          theories={showEmpty ? [] : mockTheories}
          bookmarkedTheories={bookmarkedTheories}
          onBookmarkToggle={handleBookmarkToggle}
          onTheoryClick={handleTheoryClick}
          isLoading={isLoading}
          showPremiumBadges={true}
          emptyStateMessage="Try adjusting your search criteria or browse different categories."
        />
      </div>
    </div>
  );
}
