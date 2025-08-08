/**
 * Mobile optimization utilities for Launch Essentials
 * Provides responsive design helpers, touch interactions, and performance optimizations
 */

import { useEffect, useState } from 'react';

// Device detection and responsive utilities
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  touchSupported: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: 'slow' | 'fast' | 'unknown';
}

// Responsive breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Hook for device detection
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    touchSupported: false,
    orientation: 'landscape',
    connectionType: 'unknown',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determine screen size
      let screenSize: DeviceInfo['screenSize'] = 'xs';
      if (width >= BREAKPOINTS['2xl']) screenSize = '2xl';
      else if (width >= BREAKPOINTS.xl) screenSize = 'xl';
      else if (width >= BREAKPOINTS.lg) screenSize = 'lg';
      else if (width >= BREAKPOINTS.md) screenSize = 'md';
      else if (width >= BREAKPOINTS.sm) screenSize = 'sm';

      // Device type detection
      const isMobile = width < BREAKPOINTS.md;
      const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
      const isDesktop = width >= BREAKPOINTS.lg;

      // Touch support detection
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape';

      // Connection type detection (if available)
      let connectionType: DeviceInfo['connectionType'] = 'unknown';
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          connectionType = effectiveType === '4g' || effectiveType === '5g' ? 'fast' : 'slow';
        }
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        touchSupported,
        orientation,
        connectionType,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for changes
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Touch gesture utilities
export interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });

    // Start long press timer
    if (handlers.onLongPress) {
      const timer = setTimeout(() => {
        handlers.onLongPress?.();
        setLongPressTimer(null);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    // Check for tap
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      handlers.onTap?.();
      setTouchStart(null);
      return;
    }

    // Check for swipe
    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (Math.abs(deltaY) > minSwipeDistance) {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    setTouchStart(null);
  };

  const handleTouchMove = () => {
    // Clear long press timer on move
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}

// Performance optimization utilities
export function usePerformanceOptimization() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceAnimations(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceAnimations(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for low power mode indicators
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updatePowerMode = () => {
          setIsLowPowerMode(battery.level < 0.2 || !battery.charging);
        };

        updatePowerMode();
        battery.addEventListener('levelchange', updatePowerMode);
        battery.addEventListener('chargingchange', updatePowerMode);
      });
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    isLowPowerMode,
    shouldReduceAnimations,
    shouldLazyLoad: isLowPowerMode,
    shouldPreloadImages: !isLowPowerMode,
  };
}

// Responsive grid utilities
export function getResponsiveGridCols(
  deviceInfo: DeviceInfo,
  options: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  } = {}
): string {
  const { mobile = 1, tablet = 2, desktop = 3 } = options;

  if (deviceInfo.isMobile) return `grid-cols-${mobile}`;
  if (deviceInfo.isTablet) return `grid-cols-${tablet}`;
  return `grid-cols-${desktop}`;
}

// Adaptive UI complexity
export function getAdaptiveComplexity(deviceInfo: DeviceInfo): 'simple' | 'standard' | 'complex' {
  if (deviceInfo.isMobile) return 'simple';
  if (deviceInfo.isTablet) return 'standard';
  return 'complex';
}

// Progressive Web App utilities
export function usePWAFeatures() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Handle online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }

    return false;
  };

  return {
    isInstallable,
    isOffline,
    installPWA,
  };
}

// Responsive text sizing
export function getResponsiveTextSize(
  deviceInfo: DeviceInfo,
  baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
): string {
  const sizeMap = {
    xs: { mobile: 'text-xs', tablet: 'text-sm', desktop: 'text-xs' },
    sm: { mobile: 'text-sm', tablet: 'text-base', desktop: 'text-sm' },
    base: { mobile: 'text-base', tablet: 'text-lg', desktop: 'text-base' },
    lg: { mobile: 'text-lg', tablet: 'text-xl', desktop: 'text-lg' },
    xl: { mobile: 'text-xl', tablet: 'text-2xl', desktop: 'text-xl' },
    '2xl': { mobile: 'text-xl', tablet: 'text-2xl', desktop: 'text-2xl' },
    '3xl': { mobile: 'text-2xl', tablet: 'text-3xl', desktop: 'text-3xl' },
    '4xl': { mobile: 'text-2xl', tablet: 'text-3xl', desktop: 'text-4xl' },
  };

  const sizes = sizeMap[baseSize];

  if (deviceInfo.isMobile) return sizes.mobile;
  if (deviceInfo.isTablet) return sizes.tablet;
  return sizes.desktop;
}

// Responsive spacing utilities
export function getResponsiveSpacing(
  deviceInfo: DeviceInfo,
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
): string {
  const spacingMap = {
    xs: { mobile: 'p-2', tablet: 'p-3', desktop: 'p-2' },
    sm: { mobile: 'p-3', tablet: 'p-4', desktop: 'p-3' },
    md: { mobile: 'p-4', tablet: 'p-6', desktop: 'p-4' },
    lg: { mobile: 'p-6', tablet: 'p-8', desktop: 'p-6' },
    xl: { mobile: 'p-8', tablet: 'p-10', desktop: 'p-8' },
  };

  const spaces = spacingMap[spacing];

  if (deviceInfo.isMobile) return spaces.mobile;
  if (deviceInfo.isTablet) return spaces.tablet;
  return spaces.desktop;
}
