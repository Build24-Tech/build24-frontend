import { AccessibilityProvider, useAccessibility } from '@/app/launch-essentials/components/AccessibilityProvider';
import { AccessibilitySettings } from '@/app/launch-essentials/components/AccessibilitySettings';
import { LaunchEssentialsDashboard } from '@/app/launch-essentials/components/LaunchEssentialsDashboard';
import { ResponsiveNavigation } from '@/app/launch-essentials/components/ResponsiveNavigation';
import { AuthContext } from '@/contexts/AuthContext';
import { useFocusTrap, useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { AccessibilityMonitor, runAccessibilityAudit } from '@/lib/accessibility-testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/launch-essentials-firestore');
jest.mock('@/lib/progress-tracker');
jest.mock('@/hooks/use-error-handling');

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
};

// Test component for keyboard navigation
function TestKeyboardNavigation() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { handleKeyDown, focusFirst, focusLast } = useKeyboardNavigation(containerRef);

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} data-testid="keyboard-container">
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
      <button onClick={focusFirst}>Focus First</button>
      <button onClick={focusLast}>Focus Last</button>
    </div>
  );
}

// Test component for focus trap
function TestFocusTrap({ isActive }: { isActive: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(isActive, containerRef);

  return (
    <div ref={containerRef} data-testid="focus-trap-container">
      <button>First Button</button>
      <button>Second Button</button>
      <button>Last Button</button>
    </div>
  );
}

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

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

    it('should detect system preferences', async () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

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

      await waitFor(() => {
        expect(contextValue.preferences.highContrast).toBe(true);
      });
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

  describe('AccessibilitySettings', () => {
    it('should render accessibility settings dialog', async () => {
      const user = userEvent.setup();

      render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const trigger = screen.getByRole('button', { name: /accessibility/i });
      expect(trigger).toBeInTheDocument();

      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
    });

    it('should toggle accessibility preferences', async () => {
      const user = userEvent.setup();

      render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const trigger = screen.getByRole('button', { name: /accessibility/i });
      await user.click(trigger);

      const highContrastSwitch = screen.getByRole('switch', { name: /high contrast/i });
      expect(highContrastSwitch).not.toBeChecked();

      await user.click(highContrastSwitch);
      expect(highContrastSwitch).toBeChecked();
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityProvider>
          <AccessibilitySettings />
        </AccessibilityProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Hook', () => {
    it('should handle arrow key navigation', async () => {
      const user = userEvent.setup();

      render(<TestKeyboardNavigation />);

      const container = screen.getByTestId('keyboard-container');
      const buttons = screen.getAllByRole('button');

      // Focus first button
      buttons[0].focus();

      // Press arrow down to move to next button
      await user.keyboard('{ArrowDown}');
      expect(buttons[1]).toHaveFocus();

      // Press arrow up to move to previous button
      await user.keyboard('{ArrowUp}');
      expect(buttons[0]).toHaveFocus();
    });

    it('should handle home and end keys', async () => {
      const user = userEvent.setup();

      render(<TestKeyboardNavigation />);

      const buttons = screen.getAllByRole('button');

      // Focus middle button
      buttons[1].focus();

      // Press Home to go to first button
      await user.keyboard('{Home}');
      expect(buttons[0]).toHaveFocus();

      // Press End to go to last button
      await user.keyboard('{End}');
      expect(buttons[4]).toHaveFocus(); // Last button in the list
    });

    it('should activate elements with Enter and Space', async () => {
      const user = userEvent.setup();
      const mockClick = jest.fn();

      render(
        <div>
          <button onClick={mockClick}>Test Button</button>
        </div>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Focus Trap Hook', () => {
    it('should trap focus within container when active', async () => {
      const user = userEvent.setup();

      const { rerender } = render(<TestFocusTrap isActive={false} />);

      // Focus trap should not be active
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();

      // Activate focus trap
      rerender(<TestFocusTrap isActive={true} />);

      // Focus should be trapped - tabbing from last button should go to first
      buttons[2].focus();
      await user.tab();
      expect(buttons[0]).toHaveFocus();

      // Shift+Tab from first button should go to last
      await user.tab({ shift: true });
      expect(buttons[2]).toHaveFocus();
    });
  });

  describe('LaunchEssentialsDashboard Accessibility', () => {
    beforeEach(() => {
      // Mock the required hooks and services
      jest.mock('@/hooks/use-error-handling', () => ({
        useErrorHandling: () => ({
          executeWithErrorHandling: jest.fn(),
          isLoading: false,
          error: null,
          clearError: jest.fn(),
          isOnline: true,
          retry: jest.fn(),
          canRetry: false,
        })
      }));
    });

    it('should have proper ARIA labels and roles', () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <AccessibilityProvider>
            <LaunchEssentialsDashboard />
          </AccessibilityProvider>
        </AuthContext.Provider>
      );

      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check for proper headings
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AuthContext.Provider value={mockAuthContext}>
          <AccessibilityProvider>
            <LaunchEssentialsDashboard />
          </AccessibilityProvider>
        </AuthContext.Provider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <AccessibilityProvider>
            <LaunchEssentialsDashboard />
          </AccessibilityProvider>
        </AuthContext.Provider>
      );

      // Should be able to tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });

  describe('ResponsiveNavigation Accessibility', () => {
    const mockNavigationItems = [
      {
        id: 'item1',
        label: 'Item 1',
        href: '/item1',
        progress: 100
      },
      {
        id: 'item2',
        label: 'Item 2',
        href: '/item2',
        children: [
          {
            id: 'child1',
            label: 'Child 1',
            href: '/item2/child1',
            progress: 50
          }
        ]
      }
    ];

    it('should have proper navigation structure', () => {
      render(
        <AccessibilityProvider>
          <ResponsiveNavigation
            items={mockNavigationItems}
            title="Test Navigation"
          />
        </AccessibilityProvider>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Test Navigation')).toBeInTheDocument();
    });

    it('should handle expandable sections correctly', async () => {
      const user = userEvent.setup();

      render(
        <AccessibilityProvider>
          <ResponsiveNavigation
            items={mockNavigationItems}
            title="Test Navigation"
          />
        </AccessibilityProvider>
      );

      const expandButton = screen.getByRole('button', { name: /item 2/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityProvider>
          <ResponsiveNavigation
            items={mockNavigationItems}
            title="Test Navigation"
          />
        </AccessibilityProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
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

    it('should monitor accessibility changes', (done) => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      const monitor = new AccessibilityMonitor(testElement, (report) => {
        expect(report).toBeDefined();
        monitor.stop();
        done();
      });

      monitor.start();

      // Trigger a change
      setTimeout(() => {
        testElement.innerHTML = '<button>New Button</button>';
      }, 100);
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

  describe('Skip Links', () => {
    it('should provide skip navigation links', () => {
      render(
        <AccessibilityProvider>
          <div>Test Content</div>
        </AccessibilityProvider>
      );

      const skipLinks = screen.getAllByText(/skip to/i);
      expect(skipLinks.length).toBeGreaterThan(0);

      const skipToMain = screen.getByText('Skip to main content');
      expect(skipToMain).toHaveAttribute('href', '#main-content');
    });
  });
});
