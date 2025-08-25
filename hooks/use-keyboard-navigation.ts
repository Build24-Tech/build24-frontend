'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface KeyboardNavigationOptions {
  enableArrowKeys?: boolean;
  enableTabNavigation?: boolean;
  enableEnterActivation?: boolean;
  enableEscapeClose?: boolean;
  enableHomeEnd?: boolean;
  enablePageUpDown?: boolean;
  wrapNavigation?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end') => void;
  onActivate?: (element: HTMLElement) => void;
  onEscape?: () => void;
}

interface KeyboardNavigationReturn {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  focusableElements: HTMLElement[];
  updateFocusableElements: () => void;
  focusElement: (index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
}

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationReturn {
  const {
    enableArrowKeys = true,
    enableTabNavigation = true,
    enableEnterActivation = true,
    enableEscapeClose = true,
    enableHomeEnd = true,
    enablePageUpDown = false,
    wrapNavigation = true,
    orientation = 'both',
    onNavigate,
    onActivate,
    onEscape,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Selector for focusable elements
  const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="option"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[role="checkbox"]:not([disabled])',
    '[role="radio"]:not([disabled])',
  ].join(', ');

  // Update focusable elements
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    // Filter out hidden elements
    const visibleElements = elements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetParent !== null
      );
    });

    setFocusableElements(visibleElements);

    // Update current index if the focused element changed
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && visibleElements.includes(activeElement)) {
      setCurrentIndex(visibleElements.indexOf(activeElement));
    }
  }, [containerRef, focusableSelector]);

  // Focus element by index
  const focusElement = useCallback((index: number) => {
    if (index < 0 || index >= focusableElements.length) return;

    const element = focusableElements[index];
    if (element) {
      element.focus();
      setCurrentIndex(index);
      lastFocusedElement.current = element;
    }
  }, [focusableElements]);

  // Navigation functions
  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    focusElement(focusableElements.length - 1);
  }, [focusElement, focusableElements.length]);

  const focusNext = useCallback(() => {
    let nextIndex = currentIndex + 1;

    if (nextIndex >= focusableElements.length) {
      nextIndex = wrapNavigation ? 0 : focusableElements.length - 1;
    }

    focusElement(nextIndex);
    onNavigate?.('down');
  }, [currentIndex, focusableElements.length, wrapNavigation, focusElement, onNavigate]);

  const focusPrevious = useCallback(() => {
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      prevIndex = wrapNavigation ? focusableElements.length - 1 : 0;
    }

    focusElement(prevIndex);
    onNavigate?.('up');
  }, [currentIndex, focusableElements.length, wrapNavigation, focusElement, onNavigate]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey } = event;

    // Don't handle if modifier keys are pressed (except Shift for Shift+Tab)
    if ((ctrlKey || metaKey) && key !== 'Tab') return;

    switch (key) {
      case 'ArrowDown':
        if (enableArrowKeys && (orientation === 'vertical' || orientation === 'both')) {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'ArrowUp':
        if (enableArrowKeys && (orientation === 'vertical' || orientation === 'both')) {
          event.preventDefault();
          focusPrevious();
        }
        break;

      case 'ArrowRight':
        if (enableArrowKeys && (orientation === 'horizontal' || orientation === 'both')) {
          event.preventDefault();
          focusNext();
          onNavigate?.('right');
        }
        break;

      case 'ArrowLeft':
        if (enableArrowKeys && (orientation === 'horizontal' || orientation === 'both')) {
          event.preventDefault();
          focusPrevious();
          onNavigate?.('left');
        }
        break;

      case 'Home':
        if (enableHomeEnd) {
          event.preventDefault();
          focusFirst();
          onNavigate?.('home');
        }
        break;

      case 'End':
        if (enableHomeEnd) {
          event.preventDefault();
          focusLast();
          onNavigate?.('end');
        }
        break;

      case 'PageUp':
        if (enablePageUpDown) {
          event.preventDefault();
          const pageSize = Math.max(1, Math.floor(focusableElements.length / 4));
          const newIndex = Math.max(0, currentIndex - pageSize);
          focusElement(newIndex);
        }
        break;

      case 'PageDown':
        if (enablePageUpDown) {
          event.preventDefault();
          const pageSize = Math.max(1, Math.floor(focusableElements.length / 4));
          const newIndex = Math.min(focusableElements.length - 1, currentIndex + pageSize);
          focusElement(newIndex);
        }
        break;

      case 'Tab':
        if (enableTabNavigation) {
          // Let default Tab behavior work, but update our tracking
          setTimeout(() => {
            updateFocusableElements();
          }, 0);
        }
        break;

      case 'Enter':
      case ' ':
        if (enableEnterActivation && currentIndex >= 0) {
          event.preventDefault();
          const element = focusableElements[currentIndex];
          if (element) {
            // Trigger click for buttons and links
            if (element.tagName === 'BUTTON' || element.tagName === 'A') {
              element.click();
            }
            onActivate?.(element);
          }
        }
        break;

      case 'Escape':
        if (enableEscapeClose) {
          event.preventDefault();
          onEscape?.();
        }
        break;

      default:
        break;
    }
  }, [
    enableArrowKeys,
    enableTabNavigation,
    enableEnterActivation,
    enableEscapeClose,
    enableHomeEnd,
    enablePageUpDown,
    orientation,
    currentIndex,
    focusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElement,
    updateFocusableElements,
    onNavigate,
    onActivate,
    onEscape,
  ]);

  // Update focusable elements when container changes
  useEffect(() => {
    updateFocusableElements();

    // Set up mutation observer to watch for DOM changes
    if (!containerRef.current) return;

    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden'],
    });

    return () => {
      observer.disconnect();
    };
  }, [containerRef, updateFocusableElements]);

  // Handle focus events to track current index
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (focusableElements.includes(target)) {
        setCurrentIndex(focusableElements.indexOf(target));
      }
    };

    const handleBlur = () => {
      // Small delay to check if focus moved outside the container
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (!containerRef.current?.contains(activeElement)) {
          setCurrentIndex(-1);
        }
      }, 0);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('focus', handleFocus, true);
      containerRef.current.addEventListener('blur', handleBlur, true);

      return () => {
        containerRef.current?.removeEventListener('focus', handleFocus, true);
        containerRef.current?.removeEventListener('blur', handleBlur, true);
      };
    }
  }, [containerRef, focusableElements]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
    focusableElements,
    updateFocusableElements,
    focusElement,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
  };
}

// Hook for managing focus traps in modals and dialogs
export function useFocusTrap(
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement>
) {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    lastFocusedElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Restore focus to the previously focused element
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
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
