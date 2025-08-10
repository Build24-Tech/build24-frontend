'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CategoryNavigationProps,
  THEORY_CATEGORY_LABELS,
  TheoryCategory
} from '@/types/knowledge-hub';
import {
  BookOpen,
  Brain,
  Grid3X3,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

// Category icon mapping
const CATEGORY_ICONS: Record<TheoryCategory, React.ComponentType<{ className?: string }>> = {
  [TheoryCategory.COGNITIVE_BIASES]: Brain,
  [TheoryCategory.PERSUASION_PRINCIPLES]: Users,
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: TrendingUp,
  [TheoryCategory.UX_PSYCHOLOGY]: Zap,
  [TheoryCategory.EMOTIONAL_TRIGGERS]: BookOpen
};

// Category color mapping for Build24 theme
const CATEGORY_THEME_COLORS: Record<TheoryCategory, string> = {
  [TheoryCategory.COGNITIVE_BIASES]: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  [TheoryCategory.PERSUASION_PRINCIPLES]: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  [TheoryCategory.UX_PSYCHOLOGY]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
  [TheoryCategory.EMOTIONAL_TRIGGERS]: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
};

// Active category colors
const ACTIVE_CATEGORY_COLORS: Record<TheoryCategory, string> = {
  [TheoryCategory.COGNITIVE_BIASES]: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  [TheoryCategory.PERSUASION_PRINCIPLES]: 'bg-green-500/20 text-green-300 border-green-500/40',
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  [TheoryCategory.UX_PSYCHOLOGY]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  [TheoryCategory.EMOTIONAL_TRIGGERS]: 'bg-red-500/20 text-red-300 border-red-500/40'
};

export function CategoryNavigation({
  selectedCategory,
  onCategoryChange,
  theoryCounts
}: CategoryNavigationProps) {
  const categories = Object.values(TheoryCategory);

  const handleCategoryClick = (category: TheoryCategory) => {
    // Toggle category selection - if already selected, deselect it
    if (selectedCategory === category) {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(category);
    }
  };

  const handleShowAllClick = () => {
    onCategoryChange(undefined);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Categories</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAllClick}
            className={cn(
              "text-sm transition-colors",
              !selectedCategory
                ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Show All
          </Button>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {categories.map((category) => {
            const IconComponent = CATEGORY_ICONS[category];
            const isSelected = selectedCategory === category;
            const count = theoryCounts[category] || 0;

            const baseColors = CATEGORY_THEME_COLORS[category];
            const activeColors = ACTIVE_CATEGORY_COLORS[category];

            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                  isSelected ? activeColors : baseColors
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-md",
                    isSelected ? "bg-current/20" : "bg-current/10"
                  )}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {THEORY_CATEGORY_LABELS[category]}
                    </div>
                    <div className="text-xs opacity-75">
                      {count} {count === 1 ? 'theory' : 'theories'}
                    </div>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-semibold",
                    isSelected
                      ? "bg-current/20 text-current border-current/30"
                      : "bg-gray-800 text-gray-300 border-gray-700"
                  )}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Selected Category Info */}
        {selectedCategory && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-300">
              <span className="text-yellow-400 font-medium">
                {THEORY_CATEGORY_LABELS[selectedCategory]}
              </span>
              {' '}selected • {theoryCounts[selectedCategory] || 0} theories available
            </div>
          </div>
        )}

        {/* Total Count */}
        <div className="pt-2 border-t border-gray-800">
          <div className="text-xs text-gray-500 text-center">
            Total: {Object.values(theoryCounts).reduce((sum, count) => sum + count, 0)} theories
          </div>
        </div>
      </div>
    </Card>
  );
}
