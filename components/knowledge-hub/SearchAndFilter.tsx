'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  DEFAULT_FILTER_STATE,
  DIFFICULTY_LEVEL_LABELS,
  DifficultyLevel,
  RELEVANCE_TYPE_LABELS,
  RelevanceType,
  SearchAndFilterProps,
  THEORY_CATEGORY_LABELS,
  TheoryCategory
} from '@/types/knowledge-hub';
import { Filter, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function SearchAndFilter({
  filters,
  onFiltersChange,
  isLoading = false,
  resultCount
}: SearchAndFilterProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced search handling
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      if (localSearchQuery !== filters.searchQuery) {
        onFiltersChange({
          ...filters,
          searchQuery: localSearchQuery
        });
      }
    }, 300);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [localSearchQuery]);

  // Update local search when filters change externally
  useEffect(() => {
    setLocalSearchQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleCategoryToggle = useCallback((category: TheoryCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  }, [filters, onFiltersChange]);

  const handleDifficultyToggle = useCallback((difficulty: DifficultyLevel) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];

    onFiltersChange({
      ...filters,
      difficulty: newDifficulty
    });
  }, [filters, onFiltersChange]);

  const handleRelevanceToggle = useCallback((relevance: RelevanceType) => {
    const newRelevance = filters.relevance.includes(relevance)
      ? filters.relevance.filter(r => r !== relevance)
      : [...filters.relevance, relevance];

    onFiltersChange({
      ...filters,
      relevance: newRelevance
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setLocalSearchQuery('');
    onFiltersChange(DEFAULT_FILTER_STATE);
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.searchQuery.length > 0 ||
    filters.categories.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.relevance.length > 0;

  const activeFilterCount =
    (filters.searchQuery.length > 0 ? 1 : 0) +
    filters.categories.length +
    filters.difficulty.length +
    filters.relevance.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search theories, concepts, or tags..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
          disabled={isLoading}
        />
        {localSearchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocalSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-yellow-400 text-black text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-900 border-gray-700" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-white h-auto p-1"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(THEORY_CATEGORY_LABELS).map(([key, label]) => {
                    const category = key as TheoryCategory;
                    const isSelected = filters.categories.includes(category);
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className={
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Difficulty</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DIFFICULTY_LEVEL_LABELS).map(([key, label]) => {
                    const difficulty = key as DifficultyLevel;
                    const isSelected = filters.difficulty.includes(difficulty);
                    return (
                      <Button
                        key={difficulty}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDifficultyToggle(difficulty)}
                        className={
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Relevance */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Relevance</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(RELEVANCE_TYPE_LABELS).map(([key, label]) => {
                    const relevance = key as RelevanceType;
                    const isSelected = filters.relevance.includes(relevance);
                    return (
                      <Button
                        key={relevance}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRelevanceToggle(relevance)}
                        className={
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {filters.categories.map(category => (
          <Badge
            key={`category-${category}`}
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            {THEORY_CATEGORY_LABELS[category]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryToggle(category)}
              className="ml-1 h-auto p-0 text-blue-400 hover:text-blue-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {filters.difficulty.map(difficulty => (
          <Badge
            key={`difficulty-${difficulty}`}
            variant="secondary"
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            {DIFFICULTY_LEVEL_LABELS[difficulty]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDifficultyToggle(difficulty)}
              className="ml-1 h-auto p-0 text-green-400 hover:text-green-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {filters.relevance.map(relevance => (
          <Badge
            key={`relevance-${relevance}`}
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-purple-500/30"
          >
            {RELEVANCE_TYPE_LABELS[relevance]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRelevanceToggle(relevance)}
              className="ml-1 h-auto p-0 text-purple-400 hover:text-purple-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {/* Clear All Button (when filters are active) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Results Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-400">
          {isLoading ? (
            <span>Searching...</span>
          ) : (
            <span>
              {resultCount} {resultCount === 1 ? 'theory' : 'theories'} found
              {hasActiveFilters && ' matching your filters'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
