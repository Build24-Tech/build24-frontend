'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DIFFICULTY_LEVEL_COLORS,
  DIFFICULTY_LEVEL_LABELS,
  Theory,
  THEORY_CATEGORY_COLORS,
  THEORY_CATEGORY_LABELS
} from '@/types/knowledge-hub';
import { Bookmark, BookmarkCheck, Clock, Star } from 'lucide-react';
import React from 'react';

interface TheoryCardProps {
  theory: Theory;
  isBookmarked: boolean;
  onBookmarkToggle: (theoryId: string) => void;
  onTheoryClick: (theoryId: string) => void;
  showPremiumBadge?: boolean;
  className?: string;
}

export function TheoryCard({
  theory,
  isBookmarked,
  onBookmarkToggle,
  onTheoryClick,
  showPremiumBadge = true,
  className
}: TheoryCardProps) {
  const { trackBookmark } = useAnalytics();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle(theory.id);

    // Track bookmark analytics
    trackBookmark(theory.id, isBookmarked ? 'unbookmark' : 'bookmark');
  };

  const handleCardClick = () => {
    onTheoryClick(theory.id);
  };

  const isPremium = !!theory.premiumContent;
  const categoryColor = THEORY_CATEGORY_COLORS[theory.category];
  const difficultyColor = DIFFICULTY_LEVEL_COLORS[theory.metadata.difficulty];

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-gray-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-yellow-400 focus-within:ring-offset-2 focus-within:ring-offset-black touch-manipulation',
        'bg-white dark:bg-gray-900',
        className
      )}
      onClick={handleCardClick}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Theory: ${theory.title}`}
    >
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
              {theory.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {showPremiumBadge && isPremium && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-1.5 sm:px-2 py-1"
                aria-label="Premium content"
              >
                <Star className="w-3 h-3 mr-0.5 sm:mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Premium</span>
                <span className="sm:hidden">Pro</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 touch-manipulation"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'text-xs px-1.5 sm:px-2 py-1 border-current',
              categoryColor.replace('bg-', 'text-').replace('-500', '-600'),
              `dark:${categoryColor.replace('bg-', 'text-').replace('-500', '-400')}`
            )}
            aria-label={`Category: ${THEORY_CATEGORY_LABELS[theory.category]}`}
          >
            {THEORY_CATEGORY_LABELS[theory.category]}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              'text-xs px-1.5 sm:px-2 py-1 border-current',
              difficultyColor.replace('bg-', 'text-').replace('-500', '-600'),
              `dark:${difficultyColor.replace('bg-', 'text-').replace('-500', '-400')}`
            )}
            aria-label={`Difficulty: ${DIFFICULTY_LEVEL_LABELS[theory.metadata.difficulty]}`}
          >
            {DIFFICULTY_LEVEL_LABELS[theory.metadata.difficulty]}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" aria-label={`Reading time: ${theory.metadata.readTime} minutes`}>
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{theory.metadata.readTime} min</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-4 sm:p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {theory.summary}
        </p>

        {theory.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3" role="list" aria-label="Theory tags">
            {theory.metadata.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-1.5 sm:px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md"
                role="listitem"
              >
                #{tag}
              </span>
            ))}
            {theory.metadata.tags.length > 3 && (
              <span className="inline-block px-1.5 sm:px-2 py-1 text-xs text-gray-500 dark:text-gray-400" role="listitem">
                +{theory.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Analytics */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <TheoryAnalyticsCompact theoryId={theory.id} />
        </div>
      </CardContent>
    </Card>
  );
}
