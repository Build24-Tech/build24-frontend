'use client';

import { useCallback, useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  disabled?: boolean;
}

/**
 * Custom hook for handling keyboard navigation and accessibility
 * Provides consistent keyboard interaction patterns across components
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    disabled = false
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          event.preventDefault();
          onShiftTab();
        } else if (!event.shiftKey && onTab) {
          event.preventDefault();
          onTab();
        }
        break;
    }
  }, [
    disabled,
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab
  ]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  // Return helper functions for common patterns
  return {
    // Props for clickable elements that should respond to Enter/Space
    getClickableProps: () => ({
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onEnter) onEnter();
          else if (onSpace) onSpace();
        }
      },
      tabIndex: 0,
      role: 'button'
    }),

    // Props for navigation elements
    getNavigationProps: () => ({
      onKeyDown: (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            if (onArrowUp) onArrowUp();
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (onArrowDown) onArrowDown();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (onArrowLeft) onArrowLeft();
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (onArrowRight) onArrowRight();
            break;
        }
      }
    }),

    // Props for modal/dialog elements
    getModalProps: () => ({
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && onEscape) {
          e.preventDefault();
          onEscape();
        }
      }
    })
  };
}

/**
 * Hook for managing focus trap within a container
 * Useful for modals, dropdowns, and other overlay components
 */
export function useFocusTrap(isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
}

/**
 * Hook for announcing content changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}
