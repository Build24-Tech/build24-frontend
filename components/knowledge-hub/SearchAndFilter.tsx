'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search suggestions
  const { suggestions, isLoading: suggestionsLoading, getSuggestions, clearSuggestions } = useSearchSuggestions(
    async (query: string) => {
      // Mock suggestions - in real app, this would call an API
      const mockSuggestions = [
        'anchoring bias',
        'social proof',
        'scarcity principle',
        'loss aversion',
        'cognitive bias',
        'persuasion techniques',
        'behavioral economics',
        'ux psychology'
      ];
      return mockSuggestions.filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  );

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

    // Get suggestions for non-empty queries
    if (localSearchQuery.length >= 2) {
      getSuggestions(localSearchQuery);
    } else {
      clearSuggestions();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [localSearchQuery, getSuggestions, clearSuggestions]);

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Search theories, concepts, or tags..."
          value={localSearchQuery}
          onChange={(e) => {
            setLocalSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400 text-sm sm:text-base"
          disabled={isLoading}
          aria-label="Search theories"
          autoComplete="off"
        />
        {localSearchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearchQuery('');
              clearSuggestions();
              setShowSuggestions(false);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 touch-manipulation"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none first:rounded-t-md last:rounded-b-md"
                onClick={() => {
                  setLocalSearchQuery(suggestion);
                  setShowSuggestions(false);
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
              >
                <Search className="inline w-3 h-3 mr-2 text-gray-500" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black text-xs sm:text-sm touch-manipulation"
              aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 bg-yellow-400 text-black text-xs" aria-hidden="true">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-80 bg-gray-900 border-gray-700" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white text-sm sm:text-base">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-white h-auto p-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Clear all filters"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-300">Categories</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Category filters">
                  {Object.entries(THEORY_CATEGORY_LABELS).map(([key, label]) => {
                    const category = key as TheoryCategory;
                    const isSelected = filters.categories.includes(category);
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className={cn(
                          "text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900",
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${label} category filter`}
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
                <Label className="text-xs sm:text-sm font-medium text-gray-300">Difficulty</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Difficulty filters">
                  {Object.entries(DIFFICULTY_LEVEL_LABELS).map(([key, label]) => {
                    const difficulty = key as DifficultyLevel;
                    const isSelected = filters.difficulty.includes(difficulty);
                    return (
                      <Button
                        key={difficulty}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDifficultyToggle(difficulty)}
                        className={cn(
                          "text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900",
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${label} difficulty filter`}
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
                <Label className="text-xs sm:text-sm font-medium text-gray-300">Relevance</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Relevance filters">
                  {Object.entries(RELEVANCE_TYPE_LABELS).map(([key, label]) => {
                    const relevance = key as RelevanceType;
                    const isSelected = filters.relevance.includes(relevance);
                    return (
                      <Button
                        key={relevance}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRelevanceToggle(relevance)}
                        className={cn(
                          "text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900",
                          isSelected
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${label} relevance filter`}
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
            className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{THEORY_CATEGORY_LABELS[category]}</span>
            <span className="sm:hidden">{THEORY_CATEGORY_LABELS[category].split(' ')[0]}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryToggle(category)}
              className="ml-1 h-auto p-0 text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 touch-manipulation"
              aria-label={`Remove ${THEORY_CATEGORY_LABELS[category]} category filter`}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {filters.difficulty.map(difficulty => (
          <Badge
            key={`difficulty-${difficulty}`}
            variant="secondary"
            className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm"
          >
            {DIFFICULTY_LEVEL_LABELS[difficulty]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDifficultyToggle(difficulty)}
              className="ml-1 h-auto p-0 text-green-400 hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 touch-manipulation"
              aria-label={`Remove ${DIFFICULTY_LEVEL_LABELS[difficulty]} difficulty filter`}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {filters.relevance.map(relevance => (
          <Badge
            key={`relevance-${relevance}`}
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs sm:text-sm"
          >
            {RELEVANCE_TYPE_LABELS[relevance]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRelevanceToggle(relevance)}
              className="ml-1 h-auto p-0 text-purple-400 hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 touch-manipulation"
              aria-label={`Remove ${RELEVANCE_TYPE_LABELS[relevance]} relevance filter`}
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
            className="text-gray-400 hover:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black touch-manipulation"
            aria-label="Clear all active filters"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Results Count */}
      {resultCount !== undefined && (
        <div className="text-xs sm:text-sm text-gray-400" role="status" aria-live="polite">
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
