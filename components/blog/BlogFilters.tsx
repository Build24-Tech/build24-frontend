'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/lib/notion';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOption = 'newest' | 'oldest' | 'author' | 'category';

type FilterOption = {
  type: 'tag' | 'author' | 'category';
  value: string;
};

interface BlogFiltersProps {
  posts: Post[];
  onFilterChange: (posts: Post[]) => void;
}

export default function BlogFilters({ posts, onFilterChange }: BlogFiltersProps) {
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  
  // Extract unique tags, authors, and categories from posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));
  const allAuthors = Array.from(new Set(posts.map(post => post.author).filter(Boolean) as string[]));
  const allCategories = Array.from(new Set(posts.map(post => post.category).filter(Boolean) as string[]));

  // Apply sorting and filtering whenever options change
  useEffect(() => {
    let filteredPosts = [...posts];
    
    // Apply filters
    if (activeFilters.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case 'tag':
              return post.tags?.includes(filter.value);
            case 'author':
              return post.author === filter.value;
            case 'category':
              return post.category === filter.value;
            default:
              return true;
          }
        });
      });
    }
    
    // Apply sorting
    filteredPosts.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
    
    onFilterChange(filteredPosts);
  }, [sortOption, activeFilters, posts, onFilterChange]);

  // Toggle a filter on/off
  const toggleFilter = (filter: FilterOption) => {
    setActiveFilters(prev => {
      const filterExists = prev.some(
        f => f.type === filter.type && f.value === filter.value
      );
      
      if (filterExists) {
        return prev.filter(
          f => !(f.type === filter.type && f.value === filter.value)
        );
      } else {
        return [...prev, filter];
      }
    });
  };

  // Check if a filter is active
  const isFilterActive = (filter: FilterOption) => {
    return activeFilters.some(
      f => f.type === filter.type && f.value === filter.value
    );
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Sort by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 bg-gray-900">
                {sortOption === 'newest' && 'Newest'}
                {sortOption === 'oldest' && 'Oldest'}
                {sortOption === 'author' && 'Author'}
                {sortOption === 'category' && 'Category'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <DropdownMenuRadioItem value="newest" className="text-white hover:bg-gray-800">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest" className="text-white hover:bg-gray-800">Oldest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="author" className="text-white hover:bg-gray-800">Author</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="category" className="text-white hover:bg-gray-800">Category</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={() => setActiveFilters([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Filter sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categories filter */}
        {allCategories.length > 0 && (
          <div>
            <h3 className="text-gray-400 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Button
                  key={`category-${category}`}
                  variant={isFilterActive({type: 'category', value: category}) ? "default" : "outline"}
                  size="sm"
                  className={
                    isFilterActive({type: 'category', value: category})
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }
                  onClick={() => toggleFilter({type: 'category', value: category})}
                >
                  {isFilterActive({type: 'category', value: category}) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Authors filter */}
        {allAuthors.length > 0 && (
          <div>
            <h3 className="text-gray-400 mb-2">Authors</h3>
            <div className="flex flex-wrap gap-2">
              {allAuthors.map((author) => (
                <Button
                  key={`author-${author}`}
                  variant={isFilterActive({type: 'author', value: author}) ? "default" : "outline"}
                  size="sm"
                  className={
                    isFilterActive({type: 'author', value: author})
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }
                  onClick={() => toggleFilter({type: 'author', value: author})}
                >
                  {isFilterActive({type: 'author', value: author}) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {author}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-gray-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Button
                  key={`tag-${tag}`}
                  variant={isFilterActive({type: 'tag', value: tag}) ? "default" : "outline"}
                  size="sm"
                  className={
                    isFilterActive({type: 'tag', value: tag})
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }
                  onClick={() => toggleFilter({type: 'tag', value: tag})}
                >
                  {isFilterActive({type: 'tag', value: tag}) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
