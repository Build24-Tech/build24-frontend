'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCrossLinkingService } from '@/lib/cross-linking-service';
import { ContentRecommendation } from '@/lib/recommendation-engine';
import { TheoryCategory, UserProgress } from '@/types/knowledge-hub';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Code,
  FileText,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ContentRecommendationPanelProps {
  userProgress?: UserProgress;
  categories?: TheoryCategory[];
  maxRecommendations?: number;
  showTrending?: boolean;
  className?: string;
}

interface RecommendationGroup {
  title: string;
  icon: React.ReactNode;
  recommendations: ContentRecommendation[];
  description: string;
}

export function ContentRecommendationPanel({
  userProgress,
  categories = [],
  maxRecommendations = 8,
  showTrending = true,
  className = ''
}: ContentRecommendationPanelProps) {
  const [recommendationGroups, setRecommendationGroups] = useState<RecommendationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userProgress?.userId, categories.length]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const crossLinkingService = getCrossLinkingService();
      const groups: RecommendationGroup[] = [];

      // Personalized recommendations based on user progress
      if (userProgress) {
        const personalizedRecs = await crossLinkingService.getPersonalizedRecommendations(
          userProgress,
          Math.ceil(maxRecommendations * 0.6)
        );

        if (personalizedRecs.length > 0) {
          groups.push({
            title: 'Recommended for You',
            icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
            recommendations: personalizedRecs,
            description: 'Based on your reading history and preferences'
          });
        }
      }

      // Category-based recommendations
      if (categories.length > 0) {
        const categoryRecs = await crossLinkingService.getPersonalizedRecommendations(
          userProgress || {
            userId: 'anonymous',
            readTheories: [],
            bookmarkedTheories: [],
            badges: [],
            stats: {
              totalReadTime: 0,
              theoriesRead: 0,
              categoriesExplored: categories,
              lastActiveDate: new Date(),
              streakDays: 0,
              averageSessionTime: 0
            },
            quizResults: [],
            preferences: {
              emailNotifications: false,
              progressReminders: false
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          Math.ceil(maxRecommendations * 0.4)
        );

        if (categoryRecs.length > 0) {
          groups.push({
            title: 'Explore These Categories',
            icon: <BookOpen className="h-5 w-5 text-blue-500" />,
            recommendations: categoryRecs,
            description: 'Content matching your selected interests'
          });
        }
      }

      // Trending content
      if (showTrending) {
        const trendingRecs = await crossLinkingService.getTrendingContent(
          Math.ceil(maxRecommendations * 0.3)
        );

        if (trendingRecs.length > 0) {
          groups.push({
            title: 'Trending Now',
            icon: <TrendingUp className="h-5 w-5 text-green-500" />,
            recommendations: trendingRecs,
            description: 'Popular content from the community'
          });
        }
      }

      setRecommendationGroups(groups);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <BookOpen className="h-4 w-4" />;
      case 'blog-post':
        return <FileText className="h-4 w-4" />;
      case 'project':
        return <Code className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'blog-post':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'project':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getContentUrl = (rec: ContentRecommendation): string => {
    if (rec.theory) {
      return `/dashboard/knowledge-hub/theory/${rec.theory.id}`;
    }
    if (rec.blogPost) {
      return `/blog/${rec.blogPost.slug}`;
    }
    if (rec.project) {
      return `/projects#${rec.project.id}`;
    }
    return '#';
  };

  const getContentTitle = (rec: ContentRecommendation): string => {
    if (rec.theory) return rec.theory.title;
    if (rec.blogPost) return rec.blogPost.title;
    if (rec.project) return rec.project.title;
    return 'Unknown Content';
  };

  const getContentDescription = (rec: ContentRecommendation): string => {
    if (rec.theory) return rec.theory.summary;
    if (rec.blogPost) return rec.blogPost.excerpt;
    if (rec.project) return rec.project.description;
    return '';
  };

  const getContentMetadata = (rec: ContentRecommendation): string => {
    if (rec.theory) {
      return `${rec.theory.metadata.readTime} min read`;
    }
    if (rec.blogPost) {
      return `${rec.blogPost.readTime} min read`;
    }
    if (rec.project) {
      return `${rec.project.technologies.length} technologies`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadRecommendations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (recommendationGroups.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No recommendations available</p>
        <p className="text-sm text-gray-500">
          Start reading theories to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Recommendations</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button onClick={loadRecommendations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Recommendation Groups */}
      <div className="space-y-6">
        {recommendationGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {group.icon}
                {group.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{group.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {group.recommendations.map((rec, recIndex) => (
                  <div
                    key={recIndex}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getContentIcon(rec.type)}
                        <Badge
                          variant="outline"
                          className={getContentTypeColor(rec.type)}
                        >
                          {rec.type === 'blog-post' ? 'Blog' : rec.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <TrendingUp className="h-3 w-3" />
                        {Math.round(rec.score * 100)}%
                      </div>
                    </div>

                    <Link href={getContentUrl(rec)} className="block">
                      <h4 className="font-medium group-hover:text-yellow-600 transition-colors mb-2">
                        {getContentTitle(rec)}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {getContentDescription(rec)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getContentMetadata(rec)}
                        </span>
                        <div className="flex items-center text-sm text-yellow-600 group-hover:text-yellow-700">
                          <span>Read</span>
                          <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {group.recommendations.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No recommendations in this category
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
