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
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
              {theory.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showPremiumBadge && isPremium && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-2 py-1"
              >
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-current" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'text-xs px-2 py-1 border-current',
              categoryColor.replace('bg-', 'text-').replace('-500', '-600'),
              `dark:${categoryColor.replace('bg-', 'text-').replace('-500', '-400')}`
            )}
          >
            {THEORY_CATEGORY_LABELS[theory.category]}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              'text-xs px-2 py-1 border-current',
              difficultyColor.replace('bg-', 'text-').replace('-500', '-600'),
              `dark:${difficultyColor.replace('bg-', 'text-').replace('-500', '-400')}`
            )}
          >
            {DIFFICULTY_LEVEL_LABELS[theory.metadata.difficulty]}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{theory.metadata.readTime} min</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {theory.summary}
        </p>

        {theory.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {theory.metadata.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {theory.metadata.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
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
