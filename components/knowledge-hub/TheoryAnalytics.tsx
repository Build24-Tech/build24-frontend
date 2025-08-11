'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheoryAnalytics } from '@/hooks/use-analytics';
import {
  BarChart3,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface TheoryAnalyticsProps {
  theoryId: string;
  showDetailed?: boolean;
  className?: string;
}

export function TheoryAnalytics({
  theoryId,
  showDetailed = false,
  className = ''
}: TheoryAnalyticsProps) {
  const { analytics, loading, error } = useTheoryAnalytics(theoryId);
  const [expanded, setExpanded] = useState(showDetailed);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analytics data is not available for this theory.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Performance metrics for this theory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{analytics.viewCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bookmark className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{analytics.bookmarkCount}</div>
            <div className="text-xs text-muted-foreground">Bookmarks</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{analytics.averageReadTime}m</div>
            <div className="text-xs text-muted-foreground">Avg Read</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{analytics.popularityScore}</div>
            <div className="text-xs text-muted-foreground">Popularity</div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Engagement Rate</span>
            <span>{Math.round(analytics.userEngagement.completionRate * 100)}%</span>
          </div>
          <Progress
            value={analytics.userEngagement.completionRate * 100}
            className="h-2"
          />
        </div>

        {/* Bookmark Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Bookmark Rate</span>
            <span>{analytics.viewCount > 0 ? Math.round((analytics.bookmarkCount / analytics.viewCount) * 100) : 0}%</span>
          </div>
          <Progress
            value={analytics.viewCount > 0 ? (analytics.bookmarkCount / analytics.viewCount) * 100 : 0}
            className="h-2"
          />
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Engagement
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Viewers</span>
                    <span className="font-medium">{analytics.userEngagement.uniqueViewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Returning Viewers</span>
                    <span className="font-medium">{analytics.userEngagement.returningViewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Read Time</span>
                    <span className="font-medium">{Math.round(analytics.totalReadTime / 60)}h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.dailyViews || {})
                    .slice(-7)
                    .map(([date, views]) => (
                      <div key={date} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="font-medium">{views} views</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex flex-wrap gap-2">
              {analytics.popularityScore > 100 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  High Engagement
                </Badge>
              )}
              {analytics.userEngagement.completionRate > 0.7 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  High Completion
                </Badge>
              )}
              {(analytics.bookmarkCount / Math.max(analytics.viewCount, 1)) > 0.15 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                  Highly Bookmarked
                </Badge>
              )}
              {analytics.averageReadTime > 5 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                  Deep Read
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TheoryAnalyticsCompact({ theoryId, className = '' }: { theoryId: string; className?: string }) {
  const { analytics, loading } = useTheoryAnalytics(theoryId);

  if (loading || !analytics) {
    return (
      <div className={`flex items-center gap-4 text-xs text-muted-foreground ${className}`}>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>--</span>
        </div>
        <div className="flex items-center gap-1">
          <Bookmark className="h-3 w-3" />
          <span>--</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>--</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        <span>{analytics.viewCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Bookmark className="h-3 w-3" />
        <span>{analytics.bookmarkCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{analytics.averageReadTime}m</span>
      </div>
    </div>
  );
}
