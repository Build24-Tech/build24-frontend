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

/**
 * Mobile optimization utilities for the Knowledge Hub
 * Provides functions to enhance mobile user experience
 */

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

interface TouchInfo {
  isTouchDevice: boolean;
  maxTouchPoints: number;
  supportsHover: boolean;
}

/**
 * Get current viewport information
 */
export function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    orientation: width > height ? 'landscape' : 'portrait'
  };
}

/**
 * Get touch device information
 */
export function getTouchInfo(): TouchInfo {
  return {
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    supportsHover: window.matchMedia('(hover: hover)').matches
  };
}

/**
 * Mobile-specific event handlers
 */
export class MobileEventHandler {
    private touchStartX = 0;
    private touchStartY = 0;
    private touchEndX = 0;
    private touchEndY = 0;
    private minSwipeDistance = 50;

    /**
     * Add swipe gesture support to an element
     */
    addSwipeSupport(
      element: HTMLElement,
      callbacks: {
        onSwipeLeft?: () => void;
        onSwipeRight?: () => void;
        onSwipeUp?: () => void;
        onSwipeDown?: () => void;
      }
    ) {
      const handleTouchStart = (e: TouchEvent) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      };

      const handleTouchEnd = (e: TouchEvent) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe(callbacks);
      };

      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });

      // Return cleanup function
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }

    private handleSwipe(callbacks: {
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      onSwipeUp?: () => void;
      onSwipeDown?: () => void;
    }) {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;

      // Determine if swipe is horizontal or vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > this.minSwipeDistance) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > this.minSwipeDistance) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }
    }

    /**
     * Add pull-to-refresh support
     */
    addPullToRefresh(
      element: HTMLElement,
      onRefresh: () => Promise<void>,
      options: {
        threshold?: number;
        resistance?: number;
      } = {}
    ) {
      const { threshold = 80, resistance = 2.5 } = options;
      let startY = 0;
      let currentY = 0;
      let isRefreshing = false;
      let isPulling = false;

      const handleTouchStart = (e: TouchEvent) => {
        if (element.scrollTop === 0) {
          startY = e.touches[0].clientY;
          isPulling = true;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        currentY = e.touches[0].clientY;
        const pullDistance = (currentY - startY) / resistance;

        if (pullDistance > 0) {
          e.preventDefault();
          element.style.transform = `translateY(${Math.min(pullDistance, threshold)}px)`;

          if (pullDistance >= threshold) {
            element.classList.add('pull-to-refresh-ready');
          } else {
            element.classList.remove('pull-to-refresh-ready');
          }
        }
      };

      const handleTouchEnd = async () => {
        if (!isPulling || isRefreshing) return;

        const pullDistance = (currentY - startY) / resistance;

        if (pullDistance >= threshold) {
          isRefreshing = true;
          element.classList.add('pull-to-refresh-loading');

          try {
            await onRefresh();
          } finally {
            isRefreshing = false;
            element.classList.remove('pull-to-refresh-loading', 'pull-to-refresh-ready');
          }
        }

        element.style.transform = '';
        isPulling = false;
        startY = 0;
        currentY = 0;
      };

      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }

  /**
   * Optimize images for mobile devices
   */
  export class MobileImageOptimizer {
    /**
     * Create responsive image with multiple sources
     */
    createResponsiveImage(
      src: string,
      alt: string,
      options: {
        sizes?: string;
        loading?: 'lazy' | 'eager';
        className?: string;
      } = {}
    ): HTMLPictureElement {
      const { sizes = '100vw', loading = 'lazy', className = '' } = options;

      const picture = document.createElement('picture');

      // WebP source for modern browsers
      const webpSource = document.createElement('source');
      webpSource.srcset = this.generateSrcSet(src, 'webp');
      webpSource.type = 'image/webp';
      webpSource.sizes = sizes;

      // Fallback source
      const fallbackSource = document.createElement('source');
      fallbackSource.srcset = this.generateSrcSet(src, 'jpg');
      fallbackSource.sizes = sizes;

      // Image element
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.loading = loading;
      img.className = className;

      picture.appendChild(webpSource);
      picture.appendChild(fallbackSource);
      picture.appendChild(img);

      return picture;
    }

    private generateSrcSet(src: string, format: string): string {
      const baseName = src.replace(/\.[^/.]+$/, '');
      const sizes = [320, 640, 768, 1024, 1280, 1920];

      return sizes
        .map(size => `${baseName}-${size}w.${format} ${size}w`)
        .join(', ');
    }

    /**
     * Lazy load images with intersection observer
     */
    lazyLoadImages(selector: string = 'img[data-src]') {
      const images = document.querySelectorAll(selector);

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;

              if (src) {
                img.src = src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        images.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          const src = imgElement.dataset.src;
          if (src) {
            imgElement.src = src;
          }
        });
      }
    }
  }

  /**
   * Mobile performance optimization utilities
   */
  export class MobilePerformanceOptimizer {
    /**
     * Debounce function calls for better performance
     */
    debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: NodeJS.Timeout;

      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    /**
     * Throttle function calls for better performance
     */
    throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): (...args: Parameters<T>) => void {
      let inThrottle: boolean;

      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    /**
     * Optimize scroll performance
     */
    optimizeScrolling(element: HTMLElement, callback: () => void) {
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            callback();
            ticking = false;
          });
          ticking = true;
        }
      };

      element.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>) {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) {
          link.type = resource.type;
        }
        document.head.appendChild(link);
      });
    }
  }

  /**
   * Mobile accessibility enhancements
   */
  export class MobileAccessibilityEnhancer {
    /**
     * Enhance touch targets for better accessibility
     */
    enhanceTouchTargets(minSize: number = 44) {
      const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');

      touchTargets.forEach(target => {
        const element = target as HTMLElement;
        const rect = element.getBoundingClientRect();

        if (rect.width < minSize || rect.height < minSize) {
          element.style.minWidth = `${minSize}px`;
          element.style.minHeight = `${minSize}px`;
          element.style.display = 'inline-flex';
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
        }
      });
    }

    /**
     * Add mobile-specific ARIA labels
     */
    addMobileAriaLabels() {
      const { isTouchDevice } = getTouchInfo();

      if (isTouchDevice) {
        // Add touch-specific instructions
        const buttons = document.querySelectorAll('button[aria-label]');
        buttons.forEach(button => {
          const currentLabel = button.getAttribute('aria-label') || '';
          if (!currentLabel.includes('tap') && !currentLabel.includes('touch')) {
            button.setAttribute('aria-label', `${currentLabel} (tap to activate)`);
          }
        });
      }
    }

    /**
     * Improve focus management for mobile
     */
    improveMobileFocus() {
      const { isTouchDevice } = getTouchInfo();

      if (isTouchDevice) {
        // Remove focus outline on touch but keep for keyboard
        document.addEventListener('touchstart', () => {
          document.body.classList.add('using-touch');
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            document.body.classList.remove('using-touch');
          }
        });
      }
    }
  }

  /**
   * Initialize mobile optimizations
   */
  export function initializeMobileOptimizations() {
    const viewportInfo = getViewportInfo();
    const touchInfo = getTouchInfo();

    // Add mobile classes to body
    if (viewportInfo.isMobile) {
      document.body.classList.add('mobile');
    }
    if (viewportInfo.isTablet) {
      document.body.classList.add('tablet');
    }
    if (touchInfo.isTouchDevice) {
      document.body.classList.add('touch-device');
    }

    // Initialize mobile enhancements
    const accessibilityEnhancer = new MobileAccessibilityEnhancer();
    accessibilityEnhancer.enhanceTouchTargets();
    accessibilityEnhancer.addMobileAriaLabels();
    accessibilityEnhancer.improveMobileFocus();

    // Initialize image optimization
    const imageOptimizer = new MobileImageOptimizer();
    imageOptimizer.lazyLoadImages();

    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
      document.head.appendChild(viewport);
    }

    console.log('Mobile optimizations initialized', { viewportInfo, touchInfo });
  }
