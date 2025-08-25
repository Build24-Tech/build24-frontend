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
