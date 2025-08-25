'use client';

import { cn } from '@/lib/utils';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { LazyImage } from './LazyImage';

interface LazyMediaContentProps {
  type: 'image' | 'video' | 'interactive' | 'diagram';
  src: string;
  alt?: string;
  className?: string;
  placeholder?: React.ReactNode;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyMediaContent({
  type,
  src,
  alt = '',
  className,
  placeholder,
  priority = false,
  onLoad,
  onError
}: LazyMediaContentProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const renderContent = () => {
    if (!isInView) {
      return placeholder || <MediaPlaceholder type={type} />;
    }

    switch (type) {
      case 'image':
        return (
          <LazyImage
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
            priority={priority}
          />
        );

      case 'video':
        return (
          <LazyVideo
            src={src}
            className="w-full h-full"
            onLoad={handleLoad}
            onError={handleError}
          />
        );

      case 'interactive':
        return (
          <Suspense fallback={<MediaPlaceholder type="interactive" />}>
            <LazyInteractiveContent
              src={src}
              onLoad={handleLoad}
              onError={handleError}
            />
          </Suspense>
        );

      case 'diagram':
        return (
          <LazyDiagram
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
          />
        );

      default:
        return <MediaPlaceholder type={type} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted',
        className
      )}
    >
      {renderContent()}

      {/* Loading overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading {type}...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm">Failed to load {type}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Placeholder component for different media types
function MediaPlaceholder({ type }: { type: string }) {
  const getIcon = () => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'interactive':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'diagram':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-center h-48 bg-muted text-muted-foreground">
      <div className="text-center">
        {getIcon()}
        <p className="mt-2 text-sm capitalize">{type} content</p>
      </div>
    </div>
  );
}

// Lazy video component
function LazyVideo({
  src,
  className,
  onLoad,
  onError
}: {
  src: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <video
      className={className}
      controls
      preload="metadata"
      onLoadedData={onLoad}
      onError={onError}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

// Lazy interactive content component
function LazyInteractiveContent({
  src,
  onLoad,
  onError
}: {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  useEffect(() => {
    // Simulate loading interactive content
    const timer = setTimeout(() => {
      onLoad?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onLoad]);

  return (
    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Interactive Example</p>
      </div>
    </div>
  );
}

// Lazy diagram component
function LazyDiagram({
  src,
  alt,
  onLoad,
  onError
}: {
  src: string;
  alt?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  if (src.endsWith('.svg')) {
    return (
      <object
        data={src}
        type="image/svg+xml"
        className="w-full h-full"
        onLoad={onLoad}
        onError={onError}
      >
        <LazyImage
          src={src}
          alt={alt || 'Diagram'}
          className="w-full h-full"
          onLoad={onLoad}
          onError={onError}
        />
      </object>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt || 'Diagram'}
      className="w-full h-full"
      onLoad={onLoad}
      onError={onError}
    />
  );
}
