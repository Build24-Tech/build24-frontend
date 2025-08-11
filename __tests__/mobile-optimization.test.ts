import {
  getTouchInfo,
  getViewportInfo,
  MobileAccessibilityEnhancer,
  MobileEventHandler,
  MobilePerformanceOptimizer
} from '@/lib/mobile-optimization';

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  configurable: true,
  value: 0
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(hover: hover)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('getViewportInfo', () => {
  it('should detect desktop viewport', () => {
    (window as any).innerWidth = 1024;
    (window as any).innerHeight = 768;

    const info = getViewportInfo();

    expect(info.width).toBe(1024);
    expect(info.height).toBe(768);
    expect(info.isDesktop).toBe(true);
    expect(info.isMobile).toBe(false);
    expect(info.isTablet).toBe(false);
    expect(info.orientation).toBe('landscape');
  });

  it('should detect mobile viewport', () => {
    (window as any).innerWidth = 375;
    (window as any).innerHeight = 667;

    const info = getViewportInfo();

    expect(info.width).toBe(375);
    expect(info.height).toBe(667);
    expect(info.isMobile).toBe(true);
    expect(info.isTablet).toBe(false);
    expect(info.isDesktop).toBe(false);
    expect(info.orientation).toBe('portrait');
  });

  it('should detect tablet viewport', () => {
    (window as any).innerWidth = 768;
    (window as any).innerHeight = 1024;

    const info = getViewportInfo();

    expect(info.width).toBe(768);
    expect(info.height).toBe(1024);
    expect(info.isMobile).toBe(false);
    expect(info.isTablet).toBe(true);
    expect(info.isDesktop).toBe(false);
    expect(info.orientation).toBe('portrait');
  });
});

describe('getTouchInfo', () => {
  it('should detect non-touch device', () => {
    // Reset touch properties
    delete (window as any).ontouchstart;
    (navigator as any).maxTouchPoints = 0;

    const info = getTouchInfo();

    expect(info.isTouchDevice).toBe(false);
    expect(info.maxTouchPoints).toBe(0);
    expect(info.supportsHover).toBe(true);
  });

  it('should detect touch device', () => {
    (window as any).ontouchstart = {};
    (navigator as any).maxTouchPoints = 5;

    const info = getTouchInfo();

    expect(info.isTouchDevice).toBe(true);
    expect(info.maxTouchPoints).toBe(5);
  });
});

describe('MobileEventHandler', () => {
  let handler: MobileEventHandler;
  let element: HTMLDivElement;

  beforeEach(() => {
    handler = new MobileEventHandler();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('addSwipeSupport', () => {
    it('should add touch event listeners', () => {
      const addEventListenerSpy = jest.spyOn(element, 'addEventListener');

      const cleanup = handler.addSwipeSupport(element, {
        onSwipeLeft: jest.fn(),
        onSwipeRight: jest.fn()
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });

      cleanup();
    });

    it('should call swipe callbacks', () => {
      const onSwipeLeft = jest.fn();
      const onSwipeRight = jest.fn();

      const cleanup = handler.addSwipeSupport(element, {
        onSwipeLeft,
        onSwipeRight
      });

      // Simulate swipe right
      const touchStart = new TouchEvent('touchstart', {
        changedTouches: [{ screenX: 100, screenY: 100 } as Touch]
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ screenX: 200, screenY: 100 } as Touch]
      });

      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);

      expect(onSwipeRight).toHaveBeenCalled();
      expect(onSwipeLeft).not.toHaveBeenCalled();

      cleanup();
    });
  });
});

describe('MobilePerformanceOptimizer', () => {
  let optimizer: MobilePerformanceOptimizer;

  beforeEach(() => {
    optimizer = new MobilePerformanceOptimizer();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = optimizer.debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = optimizer.debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = optimizer.throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizeScrolling', () => {
    it('should optimize scroll event handling', () => {
      const element = document.createElement('div');
      const callback = jest.fn();
      const addEventListenerSpy = jest.spyOn(element, 'addEventListener');

      const cleanup = optimizer.optimizeScrolling(element, callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

      cleanup();
    });
  });
});

describe('MobileAccessibilityEnhancer', () => {
  let enhancer: MobileAccessibilityEnhancer;

  beforeEach(() => {
    enhancer = new MobileAccessibilityEnhancer();
    jest.clearAllMocks();
  });

  describe('enhanceTouchTargets', () => {
    it('should enhance small touch targets', () => {
      const button = document.createElement('button');
      button.textContent = 'X';
      button.style.width = '20px';
      button.style.height = '20px';
      document.body.appendChild(button);

      // Mock getBoundingClientRect
      jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 20,
        height: 20,
        top: 0,
        left: 0,
        bottom: 20,
        right: 20,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });

      enhancer.enhanceTouchTargets(44);

      expect(button.style.minWidth).toBe('44px');
      expect(button.style.minHeight).toBe('44px');
      expect(button.style.display).toBe('inline-flex');

      document.body.removeChild(button);
    });

    it('should not modify adequately sized touch targets', () => {
      const button = document.createElement('button');
      button.textContent = 'Large Button';
      document.body.appendChild(button);

      // Mock getBoundingClientRect
      jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      });

      const originalMinWidth = button.style.minWidth;
      const originalMinHeight = button.style.minHeight;

      enhancer.enhanceTouchTargets(44);

      expect(button.style.minWidth).toBe(originalMinWidth);
      expect(button.style.minHeight).toBe(originalMinHeight);

      document.body.removeChild(button);
    });
  });

  describe('addMobileAriaLabels', () => {
    it('should add touch instructions to buttons on touch devices', () => {
      // Mock touch device
      (window as any).ontouchstart = {};

      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close');
      document.body.appendChild(button);

      enhancer.addMobileAriaLabels();

      expect(button.getAttribute('aria-label')).toContain('tap to activate');

      document.body.removeChild(button);
    });

    it('should not modify labels on non-touch devices', () => {
      // Mock non-touch device
      delete (window as any).ontouchstart;
      (navigator as any).maxTouchPoints = 0;

      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close');
      document.body.appendChild(button);

      const originalLabel = button.getAttribute('aria-label');

      enhancer.addMobileAriaLabels();

      expect(button.getAttribute('aria-label')).toBe(originalLabel);

      document.body.removeChild(button);
    });
  });

  describe('improveMobileFocus', () => {
    it('should add touch and keyboard event listeners on touch devices', () => {
      // Mock touch device
      (window as any).ontouchstart = {};
      (navigator as any).maxTouchPoints = 5;

      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      enhancer.improveMobileFocus();

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not add event listeners on non-touch devices', () => {
      // Mock non-touch device
      delete (window as any).ontouchstart;
      (navigator as any).maxTouchPoints = 0;

      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      enhancer.improveMobileFocus();

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
