'use client';

import { MarkdownRenderer } from '@/components/markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExampleType, type InteractiveExample } from '@/types/knowledge-hub';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Maximize2,
  Minimize2,
  Monitor,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

interface InteractiveExampleProps {
  examples: InteractiveExample[];
  className?: string;
  showNavigation?: boolean;
  autoPlay?: boolean;
  onExampleChange?: (exampleId: string) => void;
}

interface ExampleNavigationProps {
  examples: InteractiveExample[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

interface BeforeAfterViewProps {
  example: InteractiveExample;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface InteractiveDemoProps {
  example: InteractiveExample;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onReset?: () => void;
}

interface CaseStudyViewProps {
  example: InteractiveExample;
  showFullContent?: boolean;
  onToggleContent?: () => void;
}

// Dynamic component loader for interactive demonstrations
const DynamicComponentLoader = lazy(() => import('./DynamicComponentLoader'));

// Example Navigation Component
function ExampleNavigation({ examples, currentIndex, onIndexChange }: ExampleNavigationProps) {
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < examples.length - 1;

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrevious}
          className="border-gray-600 hover:border-yellow-400"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <span className="text-sm text-gray-400">
          {currentIndex + 1} of {examples.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={!canGoNext}
          className="border-gray-600 hover:border-yellow-400"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex space-x-1">
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-yellow-400' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            aria-label={`Go to example ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Before/After View Component
function BeforeAfterView({ example, isFullscreen, onToggleFullscreen }: BeforeAfterViewProps) {
  const [imageError, setImageError] = useState({ before: false, after: false });
  const [showComparison, setShowComparison] = useState(false);

  const handleImageError = useCallback((type: 'before' | 'after') => {
    setImageError(prev => ({ ...prev, [type]: true }));
  }, []);

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-black p-8' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            Before vs After
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="text-gray-400 hover:text-yellow-400"
          >
            {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showComparison ? 'Hide Overlay' : 'Show Overlay'}
          </Button>
        </div>

        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="text-gray-400 hover:text-yellow-400"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-300 flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
            Before
          </h5>
          {!imageError.before && example.beforeImage ? (
            <div className="relative group">
              <img
                src={example.beforeImage}
                alt="Before example"
                onError={() => handleImageError('before')}
                className="w-full h-auto rounded-lg border border-gray-700 transition-transform group-hover:scale-105"
              />
              {showComparison && (
                <div className="absolute inset-0 bg-red-500/20 rounded-lg border-2 border-red-400" />
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Before image not available</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-300 flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            After
          </h5>
          {!imageError.after && example.afterImage ? (
            <div className="relative group">
              <img
                src={example.afterImage}
                alt="After example"
                onError={() => handleImageError('after')}
                className="w-full h-auto rounded-lg border border-gray-700 transition-transform group-hover:scale-105"
              />
              {showComparison && (
                <div className="absolute inset-0 bg-green-500/20 rounded-lg border-2 border-green-400" />
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">After image not available</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h6 className="text-sm font-medium text-yellow-400 mb-2">Key Changes</h6>
        <p className="text-sm text-gray-300">
          {example.description}
        </p>
      </div>
    </div>
  );
}

// Interactive Demo Component
function InteractiveDemo({ example, isPlaying, onTogglePlay, onReset }: InteractiveDemoProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePlay = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onTogglePlay?.();
    }, 500);
  }, [onTogglePlay]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
          Interactive Demo
        </Badge>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="border-gray-600 hover:border-yellow-400"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-400 hover:text-yellow-400"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-[300px] flex items-center justify-center">
        {example.interactiveComponent ? (
          <Suspense fallback={
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading interactive demo...</p>
            </div>
          }>
            <DynamicComponentLoader
              componentName={example.interactiveComponent}
              isPlaying={isPlaying}
              onTogglePlay={onTogglePlay}
            />
          </Suspense>
        ) : (
          <div className="text-center text-gray-400">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Interactive Demo</p>
            <p className="text-sm opacity-75 max-w-md">
              {example.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Case Study View Component
function CaseStudyView({ example, showFullContent, onToggleContent }: CaseStudyViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
          Case Study
        </Badge>

        {onToggleContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleContent}
            className="text-gray-400 hover:text-yellow-400"
          >
            <FileText className="w-4 h-4 mr-2" />
            {showFullContent ? 'Show Summary' : 'Show Full Study'}
          </Button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {example.caseStudyContent ? (
          <div className={showFullContent ? '' : 'max-h-64 overflow-hidden relative'}>
            <MarkdownRenderer content={example.caseStudyContent} />
            {!showFullContent && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800 to-transparent" />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Case Study</p>
            <p className="text-sm opacity-75">
              {example.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main InteractiveExample Component
export default function InteractiveExample({
  examples,
  className = '',
  showNavigation = true,
  autoPlay = false,
  onExampleChange
}: InteractiveExampleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showFullContent, setShowFullContent] = useState(false);

  const currentExample = useMemo(() => examples[currentIndex], [examples, currentIndex]);

  const handleIndexChange = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < examples.length) {
      setCurrentIndex(newIndex);
      setIsPlaying(false);
      setShowFullContent(false);
      onExampleChange?.(examples[newIndex].id);
    }
  }, [examples, onExampleChange]);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    // Additional reset logic can be added here
  }, []);

  const handleToggleContent = useCallback(() => {
    setShowFullContent(!showFullContent);
  }, [showFullContent]);

  if (!examples || examples.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 text-center border border-gray-700 ${className}`}>
        <ExternalLink className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No interactive examples available</p>
      </div>
    );
  }

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          {currentExample.title}
        </CardTitle>
        <p className="text-gray-400 text-sm">{currentExample.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {showNavigation && examples.length > 1 && (
          <ExampleNavigation
            examples={examples}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
          />
        )}

        {currentExample.type === ExampleType.BEFORE_AFTER && (
          <BeforeAfterView
            example={currentExample}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentExample.type === ExampleType.INTERACTIVE_DEMO && (
          <InteractiveDemo
            example={currentExample}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
          />
        )}

        {currentExample.type === ExampleType.CASE_STUDY && (
          <CaseStudyView
            example={currentExample}
            showFullContent={showFullContent}
            onToggleContent={handleToggleContent}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Export additional components for individual use
export { BeforeAfterView, CaseStudyView, ExampleNavigation, InteractiveDemo };
