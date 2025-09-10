'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Theory, THEORY_CATEGORY_LABELS, TheoryCategory } from '@/types/knowledge-hub';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code,
  ExternalLink,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface CrossLinkNavigationProps {
  currentTheory: Theory;
  previousTheory?: Theory;
  nextTheory?: Theory;
  relatedTheories?: Theory[];
  showBreadcrumb?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export function CrossLinkNavigation({
  currentTheory,
  previousTheory,
  nextTheory,
  relatedTheories = [],
  showBreadcrumb = true,
  className = ''
}: CrossLinkNavigationProps) {
  const categoryLabel = THEORY_CATEGORY_LABELS[currentTheory.category];

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Knowledge Hub',
      href: '/dashboard/knowledge-hub'
    },
    {
      label: categoryLabel,
      href: `/dashboard/knowledge-hub/category/${currentTheory.category}`
    },
    {
      label: currentTheory.title,
      href: `/dashboard/knowledge-hub/theory/${currentTheory.id}`,
      isActive: true
    }
  ];

  const getContentIcon = (type: 'theory' | 'blog-post' | 'project') => {
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              {index > 0 && (
                <span className="text-gray-500">/</span>
              )}
              {item.isActive ? (
                <span className="text-yellow-400 font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Previous/Next Navigation */}
      {(previousTheory || nextTheory) && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {previousTheory && (
              <Link href={`/dashboard/knowledge-hub/theory/${previousTheory.id}`}>
                <Button variant="ghost" className="h-auto p-4 text-left">
                  <div className="flex items-center space-x-3">
                    <ArrowLeft className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Previous
                      </p>
                      <p className="font-medium text-white">
                        {previousTheory.title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {THEORY_CATEGORY_LABELS[previousTheory.category]}
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>
            )}
          </div>

          <div className="flex-1 text-right">
            {nextTheory && (
              <Link href={`/dashboard/knowledge-hub/theory/${nextTheory.id}`}>
                <Button variant="ghost" className="h-auto p-4 text-right">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Next
                      </p>
                      <p className="font-medium text-white">
                        {nextTheory.title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {THEORY_CATEGORY_LABELS[nextTheory.category]}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Related Theories */}
      {relatedTheories.length > 0 && (
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-yellow-400" />
            Continue Learning
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedTheories.slice(0, 4).map((theory) => (
              <Link
                key={theory.id}
                href={`/dashboard/knowledge-hub/theory/${theory.id}`}
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-700 text-gray-400"
                  >
                    {THEORY_CATEGORY_LABELS[theory.category]}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {theory.metadata.readTime} min
                  </span>
                </div>
                <h4 className="font-medium text-white mb-2 line-clamp-2">
                  {theory.title}
                </h4>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {theory.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="border-t border-gray-800 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Explore {categoryLabel}
            </h3>
            <p className="text-sm text-gray-400">
              Discover more theories in this category
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/knowledge-hub/category/${currentTheory.category}`}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper component for theory navigation within a category
interface TheoryNavigationProps {
  theories: Theory[];
  currentTheoryId: string;
  category: TheoryCategory;
}

export function TheoryNavigation({
  theories,
  currentTheoryId,
  category
}: TheoryNavigationProps) {
  const currentIndex = theories.findIndex(theory => theory.id === currentTheoryId);
  const previousTheory = currentIndex > 0 ? theories[currentIndex - 1] : undefined;
  const nextTheory = currentIndex < theories.length - 1 ? theories[currentIndex + 1] : undefined;
  const currentTheory = theories[currentIndex];

  if (!currentTheory) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
            {currentIndex + 1} of {theories.length}
          </Badge>
          <span className="text-sm text-gray-400">
            in {THEORY_CATEGORY_LABELS[category]}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {previousTheory && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/knowledge-hub/theory/${previousTheory.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Link>
            </Button>
          )}

          {nextTheory && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/knowledge-hub/theory/${nextTheory.id}`}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / theories.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
