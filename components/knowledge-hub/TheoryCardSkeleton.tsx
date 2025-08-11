'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TheoryCardSkeletonProps {
  className?: string;
}

export function TheoryCardSkeleton({ className }: TheoryCardSkeletonProps) {
  return (
    <Card className={cn('border-gray-200 dark:border-gray-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Premium badge skeleton */}
            <Skeleton className="h-6 w-16" />
            {/* Bookmark button skeleton */}
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {/* Category badge skeleton */}
          <Skeleton className="h-5 w-20" />
          {/* Difficulty badge skeleton */}
          <Skeleton className="h-5 w-16" />
          {/* Read time skeleton */}
          <Skeleton className="h-4 w-12" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Summary skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}
