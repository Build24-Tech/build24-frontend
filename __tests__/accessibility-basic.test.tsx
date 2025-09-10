import { AccessibilityProvider, useAccessibility } from '@/app/launch-essentials/components/AccessibilityProvider';
import { runAccessibilityAudit } from '@/lib/accessibility-testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

describe('Accessibility Features', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('AccessibilityProvider', () => {
    it('should provide accessibility context', () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return <div>Test</div>;
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.preferences).toBeDefined();
      expect(contextValue.updatePreferences).toBeDefined();
      expect(contextValue.handleKeyNavigation).toBeDefined();
      expect(contextValue.announceToScreenReader).toBeDefined();
    });

    it('should update preferences', async () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <button onClick={() => contextValue.updatePreferences({ largeText: true })}>
            Update
          </button>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Update');
      fireEvent.click(button);

      await waitFor(() => {
        expect(contextValue.preferences.largeText).toBe(true);
      });
    });

    it('should announce to screen readers', () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <button onClick={() => contextValue.announceToScreenReader('Test message')}>
            Announce
          </button>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Announce');
      fireEvent.click(button);

      const announcer = document.getElementById('screen-reader-announcer');
      expect(announcer).toBeInTheDocument();
      expect(announcer).toHaveTextContent('Test message');
    });

    it('should apply accessibility classes to document', async () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <button onClick={() => contextValue.updatePreferences({
            highContrast: true,
            reducedMotion: true
          })}>
            Update
          </button>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Update');
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.className).toContain('high-contrast');
        expect(document.documentElement.className).toContain('reduced-motion');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard events', () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <div
            onKeyDown={(e) => contextValue.handleKeyNavigation(
              e,
              () => console.log('up'),
              () => console.log('down'),
              () => console.log('left'),
              () => console.log('right'),
              () => console.log('enter'),
              () => console.log('escape')
            )}
          >
            <button>Test Button</button>
          </div>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const div = screen.getByText('Test Button').parentElement;

      // Test arrow key handling
      fireEvent.keyDown(div!, { key: 'ArrowDown' });
      fireEvent.keyDown(div!, { key: 'ArrowUp' });
      fireEvent.keyDown(div!, { key: 'Enter' });
      fireEvent.keyDown(div!, { key: 'Escape' });

      // No errors should be thrown
      expect(div).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper screen reader announcements', async () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return <div>Test</div>;
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      contextValue.announceToScreenReader('Test announcement', 'assertive');

      const announcer = document.getElementById('screen-reader-announcer');
      expect(announcer).toHaveAttribute('aria-live', 'assertive');
      expect(announcer).toHaveTextContent('Test announcement');
    });

    it('should clear announcements after delay', async () => {
      jest.useFakeTimers();

      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return <div>Test</div>;
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      contextValue.announceToScreenReader('Test announcement');

      const announcer = document.getElementById('screen-reader-announcer');
      expect(announcer).toHaveTextContent('Test announcement');

      // Fast forward time
      jest.advanceTimersByTime(3000);

      expect(announcer).toHaveTextContent('');

      jest.useRealTimers();
    });
  });

  describe('Accessibility Testing Utilities', () => {
    it('should run accessibility audit', () => {
      const testElement = document.createElement('div');
      testElement.innerHTML = `
        <button>Test Button</button>
        <img src="test.jpg" alt="Test image" />
        <h1>Main Heading</h1>
        <h3>Skipped Heading Level</h3>
      `;

      const report = runAccessibilityAudit(testElement);

      expect(report.score).toBeDefined();
      expect(report.totalTests).toBeGreaterThan(0);
      expect(report.results).toBeInstanceOf(Array);
    });

    it('should detect ARIA label issues', () => {
      const testElement = document.createElement('div');
      testElement.innerHTML = `<button></button>`; // Button without accessible name

      const report = runAccessibilityAudit(testElement);

      const errors = report.results.filter(r => r.severity === 'error' && !r.passed);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('accessible name'))).toBe(true);
    });

    it('should detect semantic structure issues', () => {
      const testElement = document.createElement('div');
      testElement.innerHTML = `
        <h1>Main Heading</h1>
        <h3>Skipped Level</h3>
      `;

      const report = runAccessibilityAudit(testElement);

      const warnings = report.results.filter(r => r.severity === 'warning' && !r.passed);
      expect(warnings.some(w => w.message.includes('Heading level skipped'))).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should set focus to elements', () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <div>
            <button id="test-button">Test Button</button>
            <button onClick={() => contextValue.setFocusToElement('#test-button')}>
              Focus Test Button
            </button>
          </div>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const focusButton = screen.getByText('Focus Test Button');
      const testButton = screen.getByText('Test Button');

      fireEvent.click(focusButton);

      expect(testButton).toHaveFocus();
    });
  });

  describe('Skip Links', () => {
    it('should provide skip navigation links', () => {
      render(
        <AccessibilityProvider>
          <div>Test Content</div>
        </AccessibilityProvider>
      );

      const skipToMain = screen.getByText('Skip to main content');
      expect(skipToMain).toHaveAttribute('href', '#main-content');

      const skipToNav = screen.getByText('Skip to navigation');
      expect(skipToNav).toHaveAttribute('href', '#navigation');
    });
  });

  describe('High Contrast Mode', () => {
    it('should apply high contrast styles', async () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <button onClick={() => contextValue.updatePreferences({ highContrast: true })}>
            Enable High Contrast
          </button>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Enable High Contrast');
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.className).toContain('high-contrast');
      });
    });
  });

  describe('Reduced Motion', () => {
    it('should apply reduced motion styles', async () => {
      let contextValue: any;

      function TestComponent() {
        contextValue = useAccessibility();
        return (
          <button onClick={() => contextValue.updatePreferences({ reducedMotion: true })}>
            Enable Reduced Motion
          </button>
        );
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Enable Reduced Motion');
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.className).toContain('reduced-motion');
      });
    });
  });
});
