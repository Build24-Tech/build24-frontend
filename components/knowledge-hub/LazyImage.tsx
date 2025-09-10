'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/images/theory-placeholder.svg',
  blurDataURL,
  onLoad,
  onError,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
    >
      {/* Placeholder/blur background */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              aria-hidden="true"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
          )}
        </div>
      )}

      {/* Loading spinner */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Error fallback */}
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Progressive image loading with multiple sizes
interface ProgressiveImageProps extends LazyImageProps {
  srcSet?: string;
  lowQualitySrc?: string;
}

export function ProgressiveImage({
  src,
  srcSet,
  lowQualitySrc,
  alt,
  className,
  onLoad,
  onError,
  priority = false,
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (!lowQualitySrc || priority) return;

    // Preload high quality image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsHighQualityLoaded(true);
      onLoad?.();
    };
    img.onerror = onError;
    img.src = src;
    if (srcSet) img.srcset = srcSet;
  }, [src, srcSet, lowQualitySrc, priority, onLoad, onError]);

  return (
    <LazyImage
      src={currentSrc}
      alt={alt}
      className={cn(
        className,
        !isHighQualityLoaded && lowQualitySrc && 'filter blur-sm'
      )}
      priority={priority}
      onLoad={priority ? onLoad : undefined}
      onError={onError}
      {...props}
    />
  );
}
