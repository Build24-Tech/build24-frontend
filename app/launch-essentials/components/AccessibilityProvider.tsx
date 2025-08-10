"use client";

import { createContext, KeyboardEvent, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  handleKeyNavigation: (
    event: KeyboardEvent<HTMLElement>,
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onEnter?: () => void,
    onEscape?: () => void,
    onTab?: () => void,
    onShiftTab?: () => void
  ) => void;
  setFocusToElement: (selector: string) => void;
  announceToScreenReader: (message: string, politeness?: "polite" | "assertive") => void;
  trapFocus: (containerSelector: string) => () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  focusRing: string;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Initialize accessibility preferences
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReaderMode: false,
    keyboardNavigation: false,
  });

  // Detect system preferences on mount
  useEffect(() => {
    const detectSystemPreferences = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const largeText = window.matchMedia('(min-resolution: 120dpi)').matches;

      // Check for screen reader usage
      const screenReaderMode = window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis !== undefined;

      setPreferences(prev => ({
        ...prev,
        highContrast: highContrast || prev.highContrast,
        reducedMotion: reducedMotion || prev.reducedMotion,
        largeText: largeText || prev.largeText,
        screenReaderMode: screenReaderMode || prev.screenReaderMode,
      }));
    };

    detectSystemPreferences();

    // Listen for system preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    // Detect keyboard navigation usage
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // Apply accessibility classes to document
  useEffect(() => {
    const classes = [];
    if (preferences.highContrast) classes.push('high-contrast');
    if (preferences.reducedMotion) classes.push('reduced-motion');
    if (preferences.largeText) classes.push('large-text');
    if (preferences.screenReaderMode) classes.push('screen-reader-mode');
    if (preferences.keyboardNavigation) classes.push('keyboard-navigation');

    document.documentElement.className = document.documentElement.className
      .replace(/\b(high-contrast|reduced-motion|large-text|screen-reader-mode|keyboard-navigation)\b/g, '')
      .trim();

    if (classes.length > 0) {
      document.documentElement.className += ' ' + classes.join(' ');
    }
  }, [preferences]);

  // Enhanced keyboard navigation handler
  const handleKeyNavigation = useCallback((
    event: KeyboardEvent<HTMLElement>,
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onEnter?: () => void,
    onEscape?: () => void,
    onTab?: () => void,
    onShiftTab?: () => void
  ) => {
    switch (event.key) {
      case "ArrowUp":
        if (onUp) {
          event.preventDefault();
          onUp();
        }
        break;
      case "ArrowDown":
        if (onDown) {
          event.preventDefault();
          onDown();
        }
        break;
      case "ArrowLeft":
        if (onLeft) {
          event.preventDefault();
          onLeft();
        }
        break;
      case "ArrowRight":
        if (onRight) {
          event.preventDefault();
          onRight();
        }
        break;
      case "Enter":
      case " ": // Space key
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case "Escape":
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case "Tab":
        if (event.shiftKey && onShiftTab) {
          event.preventDefault();
          onShiftTab();
        } else if (!event.shiftKey && onTab) {
          event.preventDefault();
          onTab();
        }
        break;
      default:
        break;
    }
  }, []);

  // Helper to programmatically set focus to an element by selector
  const setFocusToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.focus) {
      // Add focus ring for keyboard users
      element.classList.add('focus-visible');
      element.focus();

      // Remove focus ring after a delay if not keyboard navigation
      if (!preferences.keyboardNavigation) {
        setTimeout(() => {
          element.classList.remove('focus-visible');
        }, 100);
      }
    }
  }, [preferences.keyboardNavigation]);

  // Helper to announce messages to screen readers
  const announceToScreenReader = useCallback((message: string, politeness: "polite" | "assertive" = "polite") => {
    // Create or get the announcement element
    let announcer = document.getElementById("screen-reader-announcer");

    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "screen-reader-announcer";
      announcer.setAttribute("aria-live", politeness);
      announcer.setAttribute("aria-atomic", "true");
      announcer.classList.add("sr-only"); // Screen reader only
      document.body.appendChild(announcer);
    } else {
      // Update politeness setting if needed
      announcer.setAttribute("aria-live", politeness);
    }

    // Set the message to be announced
    announcer.textContent = message;

    // Clear the announcer after a delay
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = "";
      }
    }, 3000);
  }, []);

  // Focus trap utility for modals and dialogs
  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return () => { };

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey as any);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey as any);
    };
  }, []);

  // Computed accessibility properties
  const isHighContrast = preferences.highContrast;
  const isReducedMotion = preferences.reducedMotion;
  const focusRing = preferences.keyboardNavigation
    ? 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none'
    : 'focus:outline-none';

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreferences,
        handleKeyNavigation,
        setFocusToElement,
        announceToScreenReader,
        trapFocus,
        isHighContrast,
        isReducedMotion,
        focusRing
      }}
    >
      {/* Add global accessibility styles */}
      <style jsx global>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* High contrast mode */
        .high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --primary: #ffff00;
          --secondary: #00ffff;
          --accent: #ff00ff;
          --muted: #808080;
          --border: #ffffff;
        }

        .high-contrast * {
          border-color: var(--border) !important;
        }

        .high-contrast .bg-white {
          background-color: var(--background) !important;
          color: var(--foreground) !important;
        }

        .high-contrast .text-gray-600,
        .high-contrast .text-gray-700,
        .high-contrast .text-gray-800,
        .high-contrast .text-gray-900 {
          color: var(--foreground) !important;
        }

        /* Reduced motion */
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        /* Large text */
        .large-text {
          font-size: 120% !important;
        }

        .large-text .text-xs { font-size: 0.875rem !important; }
        .large-text .text-sm { font-size: 1rem !important; }
        .large-text .text-base { font-size: 1.125rem !important; }
        .large-text .text-lg { font-size: 1.25rem !important; }
        .large-text .text-xl { font-size: 1.5rem !important; }
        .large-text .text-2xl { font-size: 1.875rem !important; }

        /* Keyboard navigation focus styles */
        .keyboard-navigation *:focus-visible {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          border-radius: 4px;
        }

        .keyboard-navigation button:focus-visible,
        .keyboard-navigation [role="button"]:focus-visible {
          box-shadow: 0 0 0 2px #3b82f6 !important;
        }

        /* Screen reader mode optimizations */
        .screen-reader-mode .sr-only {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: 0.25rem !important;
          margin: 0 !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: normal !important;
          border: 1px solid #ccc !important;
          background: #f9f9f9 !important;
          font-size: 0.875rem !important;
        }

        /* Skip links */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1000;
        }

        .skip-link:focus {
          top: 6px;
        }

        /* Focus management */
        .focus-trap {
          position: relative;
        }

        .focus-trap::before,
        .focus-trap::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        /* Touch targets for mobile accessibility */
        @media (max-width: 768px) {
          button,
          [role="button"],
          input,
          select,
          textarea {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }
      `}</style>

      {/* Skip navigation links */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
