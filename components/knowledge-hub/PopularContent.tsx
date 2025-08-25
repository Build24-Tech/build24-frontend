'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingTheories } from '@/hooks/use-analytics';
import {
  ArrowRight,
  Bookmark,
  Clock,
  Eye,
  Flame,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface PopularContentProps {
  className?: string;
  showTitle?: boolean;
  limit?: number;
}

export function PopularContent({
  className = '',
  showTitle = true,
  limit = 5
}: PopularContentProps) {
  const { trending, loading, error } = useTrendingTheories(limit);

  if (loading) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Now
            </CardTitle>
            <CardDescription>
              Most popular theories this week
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load trending content. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (trending.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No trending content available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
          <CardDescription>
            Most popular theories this week
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {trending.map((theory, index) => (
          <div key={theory.theoryId} className="group">
            <Link
              href={`/dashboard/knowledge-hub/theory/${theory.theoryId}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                  {theory.title || formatTheoryId(theory.theoryId)}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {theory.category || 'Psychology'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {theory.viewCount}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.round(theory.trendScore)}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PopularContentSidebar() {
  return (
    <div className="space-y-6">
      <PopularContent limit={5} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Quick Reads
          </CardTitle>
          <CardDescription>
            Theories you can read in under 3 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mock quick read theories */}
          <Link
            href="/dashboard/knowledge-hub/theory/scarcity-principle"
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <p className="text-sm font-medium group-hover:text-primary transition-colors">
              Scarcity Principle
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                2 min read
              </Badge>
              <span className="text-xs text-muted-foreground">
                Persuasion
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/knowledge-hub/theory/social-proof"
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <p className="text-sm font-medium group-hover:text-primary transition-colors">
              Social Proof
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                3 min read
              </Badge>
              <span className="text-xs text-muted-foreground">
                Behavioral Economics
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/knowledge-hub/theory/loss-aversion"
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <p className="text-sm font-medium group-hover:text-primary transition-colors">
              Loss Aversion
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                2 min read
              </Badge>
              <span className="text-xs text-muted-foreground">
                Cognitive Biases
              </span>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-green-500" />
            Most Bookmarked
          </CardTitle>
          <CardDescription>
            Theories saved by the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mock most bookmarked theories */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/knowledge-hub/theory/anchoring-bias"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Anchoring Bias
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              142
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/knowledge-hub/theory/reciprocity"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Reciprocity Principle
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              128
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/knowledge-hub/theory/commitment-consistency"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Commitment & Consistency
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              97
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format theory IDs into readable titles
function formatTheoryId(theoryId: string): string {
  return theoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
