"use client";

import { createContext, KeyboardEvent, ReactNode, useCallback, useContext } from "react";

interface AccessibilityContextType {
  handleKeyNavigation: (
    event: KeyboardEvent<HTMLElement>,
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onEnter?: () => void,
    onEscape?: () => void
  ) => void;
  setFocusToElement: (selector: string) => void;
  announceToScreenReader: (message: string, politeness?: "polite" | "assertive") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Handle keyboard navigation events
  const handleKeyNavigation = useCallback((
    event: KeyboardEvent<HTMLElement>,
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void,
    onEnter?: () => void,
    onEscape?: () => void
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
      default:
        break;
    }
  }, []);

  // Helper to programmatically set focus to an element by selector
  const setFocusToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.focus) {
      element.focus();
    }
  }, []);

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

  return (
    <AccessibilityContext.Provider
      value={{
        handleKeyNavigation,
        setFocusToElement,
        announceToScreenReader
      }}
    >
      {/* Add global screen reader styles */}
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
      `}</style>
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
