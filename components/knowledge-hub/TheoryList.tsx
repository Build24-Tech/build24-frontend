'use client';

import { cn } from '@/lib/utils';
import { Theory } from '@/types/knowledge-hub';
import { TheoryCard } from './TheoryCard';
import { TheoryCardSkeleton } from './TheoryCardSkeleton';

interface TheoryListProps {
  theories: Theory[];
  bookmarkedTheories: string[];
  onBookmarkToggle: (theoryId: string) => void;
  onTheoryClick: (theoryId: string) => void;
  isLoading?: boolean;
  showPremiumBadges?: boolean;
  className?: string;
  emptyStateMessage?: string;
  loadingCount?: number;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export function TheoryList({
  theories,
  bookmarkedTheories,
  onBookmarkToggle,
  onTheoryClick,
  isLoading = false,
  showPremiumBadges = true,
  className,
  emptyStateMessage = "No theories found matching your criteria.",
  loadingCount = 6,
  enableVirtualization = true,
  virtualizationThreshold = 50
}: TheoryListProps) {
  // Use virtualization for large lists
  if (enableVirtualization && theories.length > virtualizationThreshold && !isLoading) {
    return (
      <VirtualizedTheoryList
        theories={theories}
        isLoading={isLoading}
        onTheoryClick={(theory) => onTheoryClick(theory.id)}
        className={className}
      />
    );
  }

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <TheoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (theories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No theories found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  // Show theory grid
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      className
    )}>
      {theories.map((theory) => (
        <TheoryCard
          key={theory.id}
          theory={theory}
          isBookmarked={bookmarkedTheories.includes(theory.id)}
          onBookmarkToggle={onBookmarkToggle}
          onTheoryClick={onTheoryClick}
          showPremiumBadge={showPremiumBadges}
        />
      ))}
    </div>
  );
}
