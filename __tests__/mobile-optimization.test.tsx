import {
  BREAKPOINTS,
  getAdaptiveComplexity,
  getResponsiveGridCols,
  getResponsiveSpacing,
  getResponsiveTextSize,
  useDeviceInfo,
  usePerformanceOptimization,
  usePWAFeatures,
  useTouchGestures
} from '@/lib/mobile-optimization';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Mock window properties for testing
const mockWindow = (width: number, height: number, touchSupported = false) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  if (touchSupported) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => { },
    });
  }
};

// Test component for hooks
function TestComponent({ onGesture }: { onGesture?: (gesture: string) => void }) {
  const deviceInfo = useDeviceInfo();
  const performance = usePerformanceOptimization();
  const pwa = usePWAFeatures();

  const touchGestures = useTouchGestures({
    onSwipeLeft: () => onGesture?.('swipeLeft'),
    onSwipeRight: () => onGesture?.('swipeRight'),
    onTap: () => onGesture?.('tap'),
    onLongPress: () => onGesture?.('longPress'),
  });

  return (
    <div
      data-testid="test-component"
      {...touchGestures}
      className={`
        ${getResponsiveGridCols(deviceInfo, { mobile: 1, tablet: 2, desktop: 3 })}
        ${getResponsiveTextSize(deviceInfo, 'lg')}
        ${getResponsiveSpacing(deviceInfo, 'md')}
      `}
    >
      <div data-testid="device-info">
        <span data-testid="is-mobile">{deviceInfo.isMobile.toString()}</span>
        <span data-testid="is-tablet">{deviceInfo.isTablet.toString()}</span>
        <span data-testid="is-desktop">{deviceInfo.isDesktop.toString()}</span>
        <span data-testid="screen-size">{deviceInfo.screenSize}</span>
        <span data-testid="touch-supported">{deviceInfo.touchSupported.toString()}</span>
        <span data-testid="orientation">{deviceInfo.orientation}</span>
      </div>

      <div data-testid="performance-info">
        <span data-testid="low-power">{performance.isLowPowerMode.toString()}</span>
        <span data-testid="reduce-animations">{performance.shouldReduceAnimations.toString()}</span>
      </div>

      <div data-testid="pwa-info">
        <span data-testid="installable">{pwa.isInstallable.toString()}</span>
        <span data-testid="offline">{pwa.isOffline.toString()}</span>
      </div>

      <div data-testid="adaptive-complexity">
        {getAdaptiveComplexity(deviceInfo)}
      </div>
    </div>
  );
}

describe('Mobile Optimization', () => {
  beforeEach(() => {
    // Reset window properties
    mockWindow(1024, 768);

    // Mock navigator properties
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('useDeviceInfo', () => {
    it('should detect mobile device correctly', async () => {
      mockWindow(375, 667, true); // iPhone dimensions

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
        expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
        expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');
        expect(screen.getByTestId('screen-size')).toHaveTextContent('xs');
        expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
      });
    });

    it('should detect tablet device correctly', async () => {
      mockWindow(768, 1024, true); // iPad dimensions

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
        expect(screen.getByTestId('is-tablet')).toHaveTextContent('true');
        expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');
        expect(screen.getByTestId('screen-size')).toHaveTextContent('md');
      });
    });

    it('should detect desktop device correctly', async () => {
      mockWindow(1440, 900); // Desktop dimensions

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
        expect(screen.getByTestId('is-tablet')).toHaveTextContent('false');
        expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
        expect(screen.getByTestId('screen-size')).toHaveTextContent('xl');
      });
    });

    it('should detect touch support', async () => {
      mockWindow(375, 667, true);

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('touch-supported')).toHaveTextContent('true');
      });
    });

    it('should update on window resize', async () => {
      mockWindow(375, 667, true); // Start mobile

      const { rerender } = render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      });

      // Resize to desktop
      act(() => {
        mockWindow(1440, 900);
        fireEvent(window, new Event('resize'));
      });

      rerender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
      });
    });
  });

  describe('useTouchGestures', () => {
    it('should detect tap gesture', async () => {
      const onGesture = jest.fn();
      mockWindow(375, 667, true);

      render(<TestComponent onGesture={onGesture} />);

      const component = screen.getByTestId('test-component');

      // Simulate tap
      fireEvent.touchStart(component, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      fireEvent.touchEnd(component, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });

      await waitFor(() => {
        expect(onGesture).toHaveBeenCalledWith('tap');
      });
    });

    it('should detect swipe left gesture', async () => {
      const onGesture = jest.fn();
      mockWindow(375, 667, true);

      render(<TestComponent onGesture={onGesture} />);

      const component = screen.getByTestId('test-component');

      // Simulate swipe left
      fireEvent.touchStart(component, {
        touches: [{ clientX: 200, clientY: 100 }],
      });

      fireEvent.touchEnd(component, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });

      await waitFor(() => {
        expect(onGesture).toHaveBeenCalledWith('swipeLeft');
      });
    });

    it('should detect swipe right gesture', async () => {
      const onGesture = jest.fn();
      mockWindow(375, 667, true);

      render(<TestComponent onGesture={onGesture} />);

      const component = screen.getByTestId('test-component');

      // Simulate swipe right
      fireEvent.touchStart(component, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      fireEvent.touchEnd(component, {
        changedTouches: [{ clientX: 200, clientY: 100 }],
      });

      await waitFor(() => {
        expect(onGesture).toHaveBeenCalledWith('swipeRight');
      });
    });

    it('should detect long press gesture', async () => {
      const onGesture = jest.fn();
      mockWindow(375, 667, true);

      render(<TestComponent onGesture={onGesture} />);

      const component = screen.getByTestId('test-component');

      // Simulate long press
      fireEvent.touchStart(component, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      // Wait for long press timeout
      await waitFor(() => {
        expect(onGesture).toHaveBeenCalledWith('longPress');
      }, { timeout: 600 });
    });
  });

  describe('Responsive utilities', () => {
    it('should return correct grid columns for mobile', () => {
      const deviceInfo = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'sm' as const,
        touchSupported: true,
        orientation: 'portrait' as const,
        connectionType: 'fast' as const,
      };

      const gridCols = getResponsiveGridCols(deviceInfo, {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      });

      expect(gridCols).toBe('grid-cols-1');
    });

    it('should return correct grid columns for tablet', () => {
      const deviceInfo = {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenSize: 'md' as const,
        touchSupported: true,
        orientation: 'landscape' as const,
        connectionType: 'fast' as const,
      };

      const gridCols = getResponsiveGridCols(deviceInfo, {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      });

      expect(gridCols).toBe('grid-cols-2');
    });

    it('should return correct grid columns for desktop', () => {
      const deviceInfo = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'lg' as const,
        touchSupported: false,
        orientation: 'landscape' as const,
        connectionType: 'fast' as const,
      };

      const gridCols = getResponsiveGridCols(deviceInfo, {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      });

      expect(gridCols).toBe('grid-cols-3');
    });

    it('should return correct adaptive complexity', () => {
      const mobileDevice = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'sm' as const,
        touchSupported: true,
        orientation: 'portrait' as const,
        connectionType: 'slow' as const,
      };

      const tabletDevice = {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenSize: 'md' as const,
        touchSupported: true,
        orientation: 'landscape' as const,
        connectionType: 'fast' as const,
      };

      const desktopDevice = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'lg' as const,
        touchSupported: false,
        orientation: 'landscape' as const,
        connectionType: 'fast' as const,
      };

      expect(getAdaptiveComplexity(mobileDevice)).toBe('simple');
      expect(getAdaptiveComplexity(tabletDevice)).toBe('standard');
      expect(getAdaptiveComplexity(desktopDevice)).toBe('complex');
    });

    it('should return correct responsive text sizes', () => {
      const mobileDevice = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'sm' as const,
        touchSupported: true,
        orientation: 'portrait' as const,
        connectionType: 'fast' as const,
      };

      expect(getResponsiveTextSize(mobileDevice, 'lg')).toBe('text-lg');
      expect(getResponsiveTextSize(mobileDevice, '2xl')).toBe('text-xl');
    });

    it('should return correct responsive spacing', () => {
      const mobileDevice = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'sm' as const,
        touchSupported: true,
        orientation: 'portrait' as const,
        connectionType: 'fast' as const,
      };

      expect(getResponsiveSpacing(mobileDevice, 'md')).toBe('p-4');
      expect(getResponsiveSpacing(mobileDevice, 'lg')).toBe('p-6');
    });
  });

  describe('Performance optimization', () => {
    it('should detect reduced motion preference', async () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('reduce-animations')).toHaveTextContent('true');
      });
    });
  });

  describe('PWA features', () => {
    it('should detect offline status', async () => {
      // Mock offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('offline')).toHaveTextContent('true');
      });
    });

    it('should handle online/offline events', async () => {
      render(<TestComponent />);

      // Initially online
      await waitFor(() => {
        expect(screen.getByTestId('offline')).toHaveTextContent('false');
      });

      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        fireEvent(window, new Event('offline'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('offline')).toHaveTextContent('true');
      });

      // Go back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        fireEvent(window, new Event('online'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('offline')).toHaveTextContent('false');
      });
    });
  });

  describe('Breakpoints', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.xs).toBe(0);
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });
  });
});

// Integration tests for mobile-optimized components
describe('Mobile-optimized components integration', () => {
  it('should apply mobile-first responsive classes', () => {
    mockWindow(375, 667, true);

    render(<TestComponent />);

    const component = screen.getByTestId('test-component');

    expect(component).toHaveClass('grid-cols-1'); // Mobile grid
    expect(component).toHaveClass('text-lg'); // Mobile text size
    expect(component).toHaveClass('p-4'); // Mobile padding
  });

  it('should show simple complexity for mobile', async () => {
    mockWindow(375, 667, true);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('adaptive-complexity')).toHaveTextContent('simple');
    });
  });

  it('should show standard complexity for tablet', async () => {
    mockWindow(768, 1024, true);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('adaptive-complexity')).toHaveTextContent('standard');
    });
  });

  it('should show complex complexity for desktop', async () => {
    mockWindow(1440, 900);

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('adaptive-complexity')).toHaveTextContent('complex');
    });
  });
});
