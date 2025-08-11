'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumContent } from '@/types/knowledge-hub';
import { BookOpen, Download, FileText } from 'lucide-react';

interface PremiumContentPreviewProps {
  premiumContent: PremiumContent;
  className?: string;
}

export function PremiumContentPreview({ premiumContent, className = '' }: PremiumContentPreviewProps) {
  // Extract preview text (first 150 characters)
  const getPreviewText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Extended Case Studies Preview */}
      <Card className="border-dashed border-yellow-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-yellow-500" />
            Extended Case Studies
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getPreviewText(premiumContent.extendedCaseStudies)}
          </p>
          {premiumContent.extendedCaseStudies.length > 150 && (
            <div className="mt-3 text-xs text-yellow-500 font-medium">
              + {premiumContent.extendedCaseStudies.length - 150} more characters of detailed analysis
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloadable Resources Preview */}
      {premiumContent.downloadableResources.length > 0 && (
        <Card className="border-dashed border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-yellow-500" />
              Downloadable Resources
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                {premiumContent.downloadableResources.length} files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {premiumContent.downloadableResources.slice(0, 3).map((resource, index) => (
                <div key={resource.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {resource.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {resource.fileType.toUpperCase()}
                  </Badge>
                </div>
              ))}
              {premiumContent.downloadableResources.length > 3 && (
                <div className="text-xs text-yellow-500 font-medium text-center py-2">
                  + {premiumContent.downloadableResources.length - 3} more resources
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Applications Preview */}
      <Card className="border-dashed border-yellow-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-yellow-500" />
            Advanced Applications
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getPreviewText(premiumContent.advancedApplications)}
          </p>
          {premiumContent.advancedApplications.length > 150 && (
            <div className="mt-3 text-xs text-yellow-500 font-medium">
              + {premiumContent.advancedApplications.length - 150} more characters of advanced techniques
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
