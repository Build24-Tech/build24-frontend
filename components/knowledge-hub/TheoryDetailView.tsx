'use client';

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgressTracker } from '@/hooks/use-progress-tracker';
import {
  AccessLevel,
  DIFFICULTY_LEVEL_COLORS,
  DIFFICULTY_LEVEL_LABELS,
  RELEVANCE_TYPE_LABELS,
  Theory,
  THEORY_CATEGORY_LABELS
} from '@/types/knowledge-hub';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Clock,
  Crown,
  ExternalLink,
  FileText,
  Lightbulb,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import InteractiveExample from './InteractiveExample';
import { PremiumContentPreview } from './PremiumContentPreview';
import { PremiumGate } from './PremiumGate';
import { RelatedContent } from './RelatedContent';

interface TheoryDetailViewProps {
  theory: Theory;
  userAccess: AccessLevel;
  isBookmarked?: boolean;
  onBookmarkToggle?: (theoryId: string) => void;
  onShare?: (theory: Theory) => void;
  isLoading?: boolean;
}

export function TheoryDetailView({
  theory,
  userAccess,
  isBookmarked = false,
  onBookmarkToggle,
  onShare,
  isLoading = false
}: TheoryDetailViewProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  const { markTheoryAsRead, updateBookmark } = useProgressTracker();
  const { trackBookmark } = useAnalytics();
  const { startReading, stopReading, isReading } = useReadingTimer(theory.id);

  // Check if user has premium access based on userAccess prop
  const hasPremiumAccess = userAccess === AccessLevel.PREMIUM;

  const categoryLabel = THEORY_CATEGORY_LABELS[theory.category];
  const difficultyLabel = DIFFICULTY_LEVEL_LABELS[theory.metadata.difficulty];
  const difficultyColor = DIFFICULTY_LEVEL_COLORS[theory.metadata.difficulty];

  // Start reading timer when component mounts
  useEffect(() => {
    if (theory) {
      startReading();
    }

    return () => {
      if (isReading) {
        stopReading();
      }
    };
  }, [theory, startReading, stopReading, isReading]);

  // Mark theory as read when component mounts (with a delay to simulate reading time)
  useEffect(() => {
    if (!hasMarkedAsRead && theory) {
      const timer = setTimeout(() => {
        markTheoryAsRead(theory.id, theory.category, theory.metadata.readTime);
        setHasMarkedAsRead(true);
      }, 3000); // Mark as read after 3 seconds of viewing

      return () => clearTimeout(timer);
    }
  }, [theory, hasMarkedAsRead, markTheoryAsRead]);

  const handleBookmarkToggle = () => {
    // Update progress tracker
    updateBookmark(theory.id, !isBookmarked);

    // Track bookmark analytics
    trackBookmark(theory.id, isBookmarked ? 'unbookmark' : 'bookmark');

    // Call the original callback if provided
    if (onBookmarkToggle) {
      onBookmarkToggle(theory.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(theory);
    } else {
      // Fallback to native sharing
      if (navigator.share) {
        navigator.share({
          title: theory.title,
          text: theory.summary,
          url: window.location.href,
        });
      } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  if (isLoading) {
    return <TheoryDetailViewSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-400 hover:text-white self-start focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
          aria-label={`Back to ${categoryLabel} category`}
        >
          <Link href={`/dashboard/knowledge-hub/category/${theory.category}`}>
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Back to {categoryLabel}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className={`${isBookmarked
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-gray-400 hover:text-yellow-400'
              } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black touch-manipulation`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            ) : (
              <Bookmark className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            <span className="sm:hidden">{isBookmarked ? 'Saved' : 'Save'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black touch-manipulation"
            aria-label="Share this theory"
          >
            <Share2 className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* Theory Header */}
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`${difficultyColor.replace('bg-', 'bg-').replace('-500', '-500/10')} ${difficultyColor.replace('bg-', 'text-').replace('-500', '-400')} text-xs sm:text-sm`}
              aria-label={`Difficulty level: ${difficultyLabel}`}
            >
              {difficultyLabel}
            </Badge>

            {theory.premiumContent && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 text-xs sm:text-sm" aria-label="Premium content">
                <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
                Premium
              </Badge>
            )}

            <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500" aria-label={`Reading time: ${theory.metadata.readTime} minutes`}>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <span>{theory.metadata.readTime} min read</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {theory.title}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed">
            {theory.summary}
          </p>

          <div className="flex flex-wrap gap-1.5 sm:gap-2" role="list" aria-label="Theory relevance tags">
            {theory.metadata.relevance.map((relevanceType) => (
              <Badge
                key={relevanceType}
                variant="outline"
                className="border-gray-700 text-gray-400 text-xs sm:text-sm"
                role="listitem"
              >
                {RELEVANCE_TYPE_LABELS[relevanceType]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8" role="main">
          {/* Theory Description */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Understanding the Theory</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer
                content={theory.content.description}
                className="prose-lg"
              />
            </CardContent>
          </Card>

          {/* Visual Diagram */}
          {theory.content.visualDiagram && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Visual Representation</CardTitle>
              </CardHeader>
              <CardContent>
                {!imageError ? (
                  <div className="relative">
                    <img
                      src={theory.content.visualDiagram}
                      alt={`${theory.title} visual diagram`}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageLoaded(true)}
                      className={`w-full h-auto max-h-96 object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                    {!imageLoaded && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                        <div className="animate-pulse w-full h-64 bg-gray-700 rounded-lg"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <Lightbulb className="w-12 h-12 mx-auto mb-2" />
                      Visual diagram will be displayed here
                    </div>
                    <p className="text-sm text-gray-500">
                      Interactive diagram showing {theory.title} in action
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* How to Apply in Build24 Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                How to Apply in Build24
              </CardTitle>
              <CardDescription>
                Practical ways to implement this theory in your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer
                content={theory.content.applicationGuide}
                className="prose-lg"
              />
            </CardContent>
          </Card>

          {/* Interactive Examples */}
          {theory.content.examples.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Interactive Examples</CardTitle>
                <CardDescription>
                  See this theory in action with real-world examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InteractiveExample
                  examples={theory.content.examples}
                  showNavigation={theory.content.examples.length > 1}
                  onExampleChange={(exampleId) => {
                    // Track example interaction for analytics
                    console.log('Example viewed:', exampleId);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Premium Content */}
          {theory.premiumContent && (
            <PremiumGate
              showPreview={true}
              previewContent={<PremiumContentPreview premiumContent={theory.premiumContent} />}
              upgradePrompt={{
                title: `Unlock ${theory.title} Premium Content`,
                description: 'Get access to extended case studies, downloadable resources, and advanced implementation guides.',
                features: [
                  'Extended case studies with real-world examples',
                  'Downloadable templates and A/B test scripts',
                  'Advanced implementation techniques',
                  'Expert insights and best practices',
                  'Priority access to new content updates'
                ]
              }}
            >
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Premium Content
                  </CardTitle>
                  <CardDescription>
                    Extended case studies and advanced applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Extended Case Studies */}
                    {theory.premiumContent.extendedCaseStudies && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Extended Case Studies</h4>
                        <MarkdownRenderer
                          content={theory.premiumContent.extendedCaseStudies}
                        />
                      </div>
                    )}

                    {/* Advanced Applications */}
                    {theory.premiumContent.advancedApplications && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Advanced Applications</h4>
                        <MarkdownRenderer
                          content={theory.premiumContent.advancedApplications}
                        />
                      </div>
                    )}

                    {/* Downloadable Resources */}
                    {theory.premiumContent.downloadableResources.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Downloadable Resources</h4>
                        <div className="grid gap-3">
                          {theory.premiumContent.downloadableResources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-medium">{resource.title}</p>
                                  <p className="text-sm text-gray-400">{resource.description}</p>
                                </div>
                              </div>
                              <Button size="sm" asChild>
                                <a href={resource.fileUrl} download>
                                  Download
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </PremiumGate>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4 sm:space-y-6" role="complementary" aria-label="Theory information and related content">
          {/* Quick Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Category</p>
                <Link
                  href={`/dashboard/knowledge-hub/category/${theory.category}`}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                  aria-label={`View all theories in ${categoryLabel} category`}
                >
                  {categoryLabel}
                </Link>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Difficulty</p>
                <p className="capitalize text-sm sm:text-base">{difficultyLabel}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Read Time</p>
                <p className="text-sm sm:text-base">{theory.metadata.readTime} minutes</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Best For</p>
                <div className="flex flex-wrap gap-1" role="list" aria-label="Best use cases">
                  {theory.metadata.relevance.map((relevanceType) => (
                    <Badge
                      key={relevanceType}
                      variant="outline"
                      className="text-xs border-gray-700 text-gray-400"
                      role="listitem"
                    >
                      {RELEVANCE_TYPE_LABELS[relevanceType]}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Content */}
          {theory.content.relatedContent.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Related Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {theory.content.relatedContent.map((item, index) => (
                  <div key={index}>
                    <Link
                      href={item.url}
                      className="block p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Analytics */}
          <TheoryAnalytics theoryId={theory.id} />

          {/* Tags */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {theory.metadata.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-gray-700 text-gray-400"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>

      {/* Cross-Linked Related Content */ }
  <div className="mt-12">
    <RelatedContent
      theory={theory}
      maxItems={8}
      showPersonalized={true}
      className="border-t border-gray-800 pt-8"
    />
  </div>
    </div >
  );
}





// Loading Skeleton
function TheoryDetailViewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Title Section Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
