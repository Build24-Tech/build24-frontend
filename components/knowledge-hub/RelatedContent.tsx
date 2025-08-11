'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCrossLinkingService } from '@/lib/cross-linking-service';
import { ContentRecommendation } from '@/lib/recommendation-engine';
import { RelatedContent as RelatedContentType, Theory, UserProgress } from '@/types/knowledge-hub';
import {
  ArrowRight,
  BookOpen,
  Code,
  ExternalLink,
  FileText,
  Star,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface RelatedContentProps {
  theory: Theory;
  userProgress?: UserProgress;
  maxItems?: number;
  showPersonalized?: boolean;
  className?: string;
}

interface RelatedContentSectionProps {
  title: string;
  items: RelatedContentType[];
  icon: React.ReactNode;
  emptyMessage: string;
  maxDisplay?: number;
}

export function RelatedContent({
  theory,
  userProgress,
  maxItems = 6,
  showPersonalized = true,
  className = ''
}: RelatedContentProps) {
  const [relatedContent, setRelatedContent] = useState<RelatedContentType[]>([]);
  const [personalizedRecs, setPersonalizedRecs] = useState<ContentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRelatedContent();
  }, [theory.id, userProgress?.userId]);

  const loadRelatedContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const crossLinkingService = getCrossLinkingService();

      // Get cross-links for the current theory
      const crossLinks = await crossLinkingService.getCrossLinksForTheory(
        theory,
        userProgress,
        {
          maxRelatedTheories: Math.ceil(maxItems * 0.5),
          maxBlogPosts: Math.ceil(maxItems * 0.3),
          maxProjects: Math.ceil(maxItems * 0.2)
        }
      );

      setRelatedContent(crossLinks);

      // Get personalized recommendations if user progress is available
      if (showPersonalized && userProgress) {
        const recommendations = await crossLinkingService.getPersonalizedRecommendations(
          userProgress,
          5
        );
        setPersonalizedRecs(recommendations);
      }
    } catch (err) {
      console.error('Error loading related content:', err);
      setError('Failed to load related content');
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
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'theory':
        return 'Theory';
      case 'blog-post':
        return 'Blog Post';
      case 'project':
        return 'Project';
      default:
        return 'Content';
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

  // Group content by type
  const groupedContent = (relatedContent || []).reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, RelatedContentType[]>);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`} data-testid="related-content-loading">
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadRelatedContent} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Related Content Sections */}
      {Object.entries(groupedContent).map(([type, items]) => (
        <RelatedContentSection
          key={type}
          title={`Related ${getContentTypeLabel(type)}s`}
          items={items}
          icon={getContentIcon(type)}
          emptyMessage={`No related ${type}s found`}
          maxDisplay={type === 'theory' ? 3 : 2}
        />
      ))}

      {/* Personalized Recommendations */}
      {showPersonalized && personalizedRecs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Recommended for You</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {personalizedRecs.slice(0, 4).map((rec, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getContentIcon(rec.type)}
                      <Badge
                        variant="outline"
                        className={getContentTypeColor(rec.type)}
                      >
                        {getContentTypeLabel(rec.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(rec.score * 100)}%
                    </div>
                  </div>

                  {rec.theory && (
                    <Link
                      href={`/dashboard/knowledge-hub/theory/${rec.theory.id}`}
                      className="block group"
                    >
                      <h4 className="font-medium group-hover:text-yellow-600 transition-colors mb-1">
                        {rec.theory.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {rec.theory.summary}
                      </p>
                    </Link>
                  )}

                  {rec.blogPost && (
                    <Link
                      href={`/blog/${rec.blogPost.slug}`}
                      className="block group"
                    >
                      <h4 className="font-medium group-hover:text-yellow-600 transition-colors mb-1">
                        {rec.blogPost.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {rec.blogPost.excerpt}
                      </p>
                    </Link>
                  )}

                  {rec.project && (
                    <Link
                      href={`/projects#${rec.project.id}`}
                      className="block group"
                    >
                      <h4 className="font-medium group-hover:text-yellow-600 transition-colors mb-1">
                        {rec.project.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {rec.project.description}
                      </p>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {relatedContent.length === 0 && personalizedRecs.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No related content found</p>
          <p className="text-sm text-gray-500">
            Check back later as we add more theories and content!
          </p>
        </div>
      )}
    </div>
  );
}

function RelatedContentSection({
  title,
  items,
  icon,
  emptyMessage,
  maxDisplay = 3
}: RelatedContentSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? items : items.slice(0, maxDisplay);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {items.length}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="outline"
                  className={getContentTypeColor(item.type)}
                >
                  {getContentTypeLabel(item.type)}
                </Badge>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>

              <Link href={item.url} className="block group">
                <h4 className="font-medium group-hover:text-yellow-600 transition-colors mb-2">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center text-sm text-yellow-600 group-hover:text-yellow-700">
                  <span>Read more</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length > maxDisplay && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${items.length} Items`}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper functions (moved outside component to avoid re-creation)
function getContentTypeColor(type: string) {
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
}

function getContentTypeLabel(type: string) {
  switch (type) {
    case 'theory':
      return 'Theory';
    case 'blog-post':
      return 'Blog Post';
    case 'project':
      return 'Project';
    default:
      return 'Content';
  }
}
