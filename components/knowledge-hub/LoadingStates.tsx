import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Loader2, Search, User } from 'lucide-react';
import React from 'react';

// Generic loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Theory content loading state
export const TheoryContentLoading: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-6">
    {/* Header skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>

    {/* Content skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>

    {/* Application guide skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  </div>
);

// Theory list loading state
export const TheoryListLoading: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Search loading state
export const SearchLoading: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center gap-2">
      <Search className="h-5 w-5 animate-pulse" />
      <span className="text-sm text-muted-foreground">Searching theories...</span>
    </div>
  </div>
);

// Bookmark loading state
export const BookmarkLoading: React.FC = () => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-2">
      <BookOpen className="h-4 w-4 animate-pulse" />
      <span className="text-sm text-muted-foreground">Loading bookmarks...</span>
    </div>
  </div>
);

// Progress loading state
export const ProgressLoading: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <User className="h-5 w-5 animate-pulse" />
      <span className="text-sm text-muted-foreground">Loading progress...</span>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

// Full page loading state
export const PageLoading: React.FC<{ message?: string }> = ({
  message = "Loading Knowledge Hub..."
}) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Inline loading state for buttons and small components
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    {text && <span className="text-sm">{text}</span>}
  </div>
);
