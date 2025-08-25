'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServiceWorker } from '@/lib/service-worker';
import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  searchTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  scrollFPS: number;
  totalTheories: number;
  visibleTheories: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function PerformanceMonitor({
  isVisible = false,
  onToggle
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    searchTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    scrollFPS: 60,
    totalTheories: 0,
    visibleTheories: 0
  });

  const { cacheStats, isSupported } = useServiceWorker();
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTime.current;

      frameTimeRef.current.push(frameTime);
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }

      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);

      // Get memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ?
        Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

      setMetrics(prev => ({
        ...prev,
        scrollFPS: fps,
        memoryUsage,
        renderTime: frameTime
      }));

      lastFrameTime.current = now;
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        📊 Performance
      </Button>
    );
  }

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'bg-green-500';
    if (value >= thresholds[0]) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Rendering Performance */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Scroll FPS</span>
            <Badge
              className={`${getPerformanceColor(metrics.scrollFPS, [30, 50])} text-white`}
            >
              {metrics.scrollFPS}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Render Time</span>
            <Badge
              className={`${getPerformanceColor(100 - metrics.renderTime, [80, 90])} text-white`}
            >
              {metrics.renderTime.toFixed(1)}ms
            </Badge>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Memory Usage</span>
            <Badge
              className={`${getPerformanceColor(100 - metrics.memoryUsage, [50, 80])} text-white`}
            >
              {metrics.memoryUsage}MB
            </Badge>
          </div>
        </div>

        {/* Cache Performance */}
        {isSupported && cacheStats && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span>Theory Cache</span>
              <Badge variant="outline">
                {cacheStats.theoryCacheSize} items
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Media Cache</span>
              <Badge variant="outline">
                {cacheStats.mediaCacheSize} items
              </Badge>
            </div>
          </div>
        )}

        {/* Content Stats */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Theories</span>
            <Badge variant="outline">
              {metrics.totalTheories}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Visible Theories</span>
            <Badge variant="outline">
              {metrics.visibleTheories}
            </Badge>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {metrics.scrollFPS < 30 && (
              <div className="text-yellow-600">⚠️ Low FPS detected</div>
            )}
            {metrics.memoryUsage > 100 && (
              <div className="text-red-600">⚠️ High memory usage</div>
            )}
            {metrics.scrollFPS >= 50 && metrics.memoryUsage < 50 && (
              <div className="text-green-600">✅ Performance optimal</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to track component performance
export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    }
  });

  return { renderTime };
}

// Performance context for sharing metrics across components
export const PerformanceContext = React.createContext<{
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  metrics: PerformanceMetrics;
}>({
  updateMetrics: () => { },
  metrics: {
    renderTime: 0,
    searchTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    scrollFPS: 60,
    totalTheories: 0,
    visibleTheories: 0
  }
});

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    searchTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    scrollFPS: 60,
    totalTheories: 0,
    visibleTheories: 0
  });

  const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  return (
    <PerformanceContext.Provider value={{ metrics, updateMetrics }}>
      {children}
    </PerformanceContext.Provider>
  );
}
