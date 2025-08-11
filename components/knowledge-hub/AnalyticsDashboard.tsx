'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrendingTheories } from '@/hooks/use-analytics';
import { analyticsService, TheoryAnalytics } from '@/lib/analytics-service';
import {
  BookOpen,
  Calendar,
  Eye,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsSummary {
  totalViews: number;
  totalTheories: number;
  averageEngagement: number;
  topCategories: Record<string, number>;
}

interface TopTheory {
  theoryId: string;
  title: string;
  category: string;
  analytics: TheoryAnalytics;
}

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topTheories, setTopTheories] = useState<TopTheory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { trending, loading: trendingLoading, refresh: refreshTrending } = useTrendingTheories(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryData = await analyticsService.getAnalyticsSummary();
      setSummary(summaryData);

      // Fetch top theories (mock data for now - would need theory service integration)
      const mockTopTheories: TopTheory[] = [
        {
          theoryId: 'anchoring-bias',
          title: 'Anchoring Bias',
          category: 'Cognitive Biases',
          analytics: {
            theoryId: 'anchoring-bias',
            viewCount: 245,
            totalReadTime: 3680,
            bookmarkCount: 42,
            averageReadTime: 15,
            popularityScore: 371,
            lastUpdated: new Date() as any,
            dailyViews: {},
            userEngagement: {
              uniqueViewers: 198,
              returningViewers: 47,
              completionRate: 0.78
            }
          }
        }
      ];
      setTopTheories(mockTopTheories);

    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), refreshTrending()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <Button disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all theories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Theories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalTheories || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.averageEngagement || 0}</div>
            <p className="text-xs text-muted-foreground">
              Popularity score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Theories</CardTitle>
              <CardDescription>
                Theories with the highest recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendingLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                      <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : trending.length > 0 ? (
                <div className="space-y-3">
                  {trending.map((theory, index) => (
                    <div key={theory.theoryId} className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {theory.title || theory.theoryId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {theory.category} • {theory.viewCount} views
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(theory.trendScore)} trend
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No trending data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Theories</CardTitle>
              <CardDescription>
                Theories with the highest overall engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTheories.map((theory, index) => (
                  <div key={theory.theoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{theory.title}</p>
                          <p className="text-xs text-muted-foreground">{theory.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{theory.analytics.viewCount} views</p>
                        <p className="text-xs text-muted-foreground">
                          {theory.analytics.bookmarkCount} bookmarks
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Engagement Rate</span>
                        <span>{Math.round(theory.analytics.userEngagement.completionRate * 100)}%</span>
                      </div>
                      <Progress
                        value={theory.analytics.userEngagement.completionRate * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                View distribution across theory categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary?.topCategories || {}).map(([category, views]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{views} views</span>
                    </div>
                    <Progress
                      value={(views / (summary?.totalViews || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
                {Object.keys(summary?.topCategories || {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">No category data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reading Patterns</CardTitle>
                <CardDescription>User engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Read Time</span>
                  <span className="text-sm font-medium">4.2 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">73%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bookmark Rate</span>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Return Rate</span>
                  <span className="text-sm font-medium">34%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">Today</p>
                      <p className="text-xs text-muted-foreground">142 views, 23 bookmarks</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">Yesterday</p>
                      <p className="text-xs text-muted-foreground">198 views, 31 bookmarks</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">This Week</p>
                      <p className="text-xs text-muted-foreground">1,247 views, 189 bookmarks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
