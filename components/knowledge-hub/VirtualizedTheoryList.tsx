'use client';

import { cn } from '@/lib/utils';
import { Theory } from '@/types/knowledge-hub';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TheoryCard } from './TheoryCard';
import { TheoryCardSkeleton } from './TheoryCardSkeleton';

interface VirtualizedTheoryListProps {
  theories: Theory[];
  isLoading?: boolean;
  onTheoryClick?: (theory: Theory) => void;
  className?: string;
  itemHeight?: number;
  overscan?: number;
  gap?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

export function VirtualizedTheoryList({
  theories,
  isLoading = false,
  onTheoryClick,
  className,
  itemHeight = 280, // Approximate height of TheoryCard
  overscan = 5,
  gap = 16
}: VirtualizedTheoryListProps) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return theories.length * (itemHeight + gap) - gap;
  }, [theories.length, itemHeight, gap]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: 0 };

    const start = Math.floor(scrollTop / (itemHeight + gap));
    const visibleCount = Math.ceil(containerHeight / (itemHeight + gap));
    const end = Math.min(start + visibleCount + overscan, theories.length);

    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, theories.length]);

  // Calculate virtual items
  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      items.push({
        index: i,
        start: i * (itemHeight + gap),
        end: i * (itemHeight + gap) + itemHeight
      });
    }
    return items;
  }, [visibleRange, itemHeight, gap]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize();
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Scroll to top when theories change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [theories]);

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TheoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (theories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No theories found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search terms or filters to find relevant theories.
        </p>
      </div>
    );
  }

  // For small lists, use regular grid layout
  if (theories.length <= 20) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {theories.map((theory) => (
          <TheoryCard
            key={theory.id}
            theory={theory}
            onClick={() => onTheoryClick?.(theory)}
          />
        ))}
      </div>
    );
  }

  // Virtual scrolling for large lists
  return (
    <div
      ref={containerRef}
      className={cn('h-full overflow-hidden', className)}
    >
      <div
        ref={scrollElementRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
        style={{ scrollbarGutter: 'stable' }}
      >
        <div
          style={{ height: totalHeight, position: 'relative' }}
          className="w-full"
        >
          {virtualItems.map((virtualItem) => {
            const theory = theories[virtualItem.index];
            if (!theory) return null;

            return (
              <div
                key={theory.id}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  left: 0,
                  right: 0,
                  height: itemHeight
                }}
                className="px-2"
              >
                <TheoryCard
                  theory={theory}
                  onClick={() => onTheoryClick?.(theory)}
                  className="h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook for managing virtual scrolling state
export function useVirtualScroll(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: 0 };

    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, itemCount);

    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, itemCount]);

  const totalHeight = itemCount * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
    return targetScrollTop;
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight,
    scrollToIndex,
    scrollToTop
  };
}

// Performance monitoring hook
export function useVirtualScrollPerformance() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    visibleItems: 0,
    totalItems: 0,
    scrollFPS: 0
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());

  const updateMetrics = useCallback((visibleItems: number, totalItems: number) => {
    const now = performance.now();
    const frameTime = now - lastFrameTime.current;

    frameTimeRef.current.push(frameTime);
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift();
    }

    const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
    const fps = Math.round(1000 / avgFrameTime);

    setMetrics({
      renderTime: frameTime,
      visibleItems,
      totalItems,
      scrollFPS: fps
    });

    lastFrameTime.current = now;
  }, []);

  return { metrics, updateMetrics };
}
