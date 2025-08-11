/**
 * Accessibility testing utilities for the Knowledge Hub
 * Provides functions to validate and improve accessibility compliance
 */

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element: Element;
  message: string;
  rule: string;
}

/**
 * Check for common accessibility issues in the Knowledge Hub
 */
export class AccessibilityChecker {
  private issues: AccessibilityIssue[] = [];

  /**
   * Run all accessibility checks on a container element
   */
  checkAccessibility(container: Element = document.body): AccessibilityIssue[] {
    this.issues = [];

    this.checkImages(container);
    this.checkButtons(container);
    this.checkLinks(container);
    this.checkForms(container);
    this.checkHeadings(container);
    this.checkLandmarks(container);
    this.checkColorContrast(container);
    this.checkFocusManagement(container);

    return this.issues;
  }

  /**
   * Check images for alt text
   */
  private checkImages(container: Element) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        this.addIssue('error', img, 'Image missing alt attribute', 'WCAG 1.1.1');
      } else if (img.getAttribute('alt') === '') {
        // Empty alt is okay for decorative images, but check if it should be decorative
        const isDecorative = img.hasAttribute('aria-hidden') ||
          img.closest('[aria-hidden="true"]') ||
          img.hasAttribute('role') && img.getAttribute('role') === 'presentation';

        if (!isDecorative) {
          this.addIssue('warning', img, 'Image has empty alt text - ensure it is decorative', 'WCAG 1.1.1');
        }
      }
    });
  }

  /**
   * Check buttons for accessibility
   */
  private checkButtons(container: Element) {
    const buttons = container.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      // Check for accessible name
      const hasAccessibleName = button.textContent?.trim() ||
        button.hasAttribute('aria-label') ||
        button.hasAttribute('aria-labelledby') ||
        button.querySelector('img[alt]');

      if (!hasAccessibleName) {
        this.addIssue('error', button, 'Button missing accessible name', 'WCAG 4.1.2');
      }

      // Check for keyboard accessibility
      if (button.hasAttribute('role') && button.getAttribute('role') === 'button') {
        if (!button.hasAttribute('tabindex')) {
          this.addIssue('error', button, 'Custom button missing tabindex', 'WCAG 2.1.1');
        }
      }
    });
  }

  /**
   * Check links for accessibility
   */
  private checkLinks(container: Element) {
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      // Check for accessible name
      const hasAccessibleName = link.textContent?.trim() ||
        link.hasAttribute('aria-label') ||
        link.hasAttribute('aria-labelledby') ||
        link.querySelector('img[alt]');

      if (!hasAccessibleName) {
        this.addIssue('error', link, 'Link missing accessible name', 'WCAG 2.4.4');
      }

      // Check for vague link text
      const linkText = link.textContent?.trim().toLowerCase();
      const vagueTexts = ['click here', 'read more', 'learn more', 'here', 'more'];
      if (linkText && vagueTexts.includes(linkText)) {
        this.addIssue('warning', link, 'Link text is not descriptive', 'WCAG 2.4.4');
      }
    });
  }

  /**
   * Check form elements for accessibility
   */
  private checkForms(container: Element) {
    const formElements = container.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
      // Check for labels
      const hasLabel = element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${element.id}"]`) ||
        element.closest('label');

      if (!hasLabel) {
        this.addIssue('error', element, 'Form element missing label', 'WCAG 3.3.2');
      }

      // Check for required field indication
      if (element.hasAttribute('required')) {
        const hasRequiredIndication = element.hasAttribute('aria-required') ||
          element.getAttribute('aria-label')?.includes('required') ||
          element.closest('label')?.textContent?.includes('*');

        if (!hasRequiredIndication) {
          this.addIssue('warning', element, 'Required field not clearly indicated', 'WCAG 3.3.2');
        }
      }
    });
  }

  /**
   * Check heading structure
   */
  private checkHeadings(container: Element) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));

      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        this.addIssue('warning', heading, `Heading level skipped (h${previousLevel} to h${level})`, 'WCAG 1.3.1');
      }

      previousLevel = level;
    });

    // Check for multiple h1s
    const h1s = container.querySelectorAll('h1');
    if (h1s.length > 1) {
      h1s.forEach((h1, index) => {
        if (index > 0) {
          this.addIssue('warning', h1, 'Multiple h1 elements found', 'WCAG 1.3.1');
        }
      });
    }
  }

  /**
   * Check for proper landmark usage
   */
  private checkLandmarks(container: Element) {
    const landmarks = container.querySelectorAll('main, nav, aside, header, footer, section, article');

    // Check for main landmark
    const mains = container.querySelectorAll('main, [role="main"]');
    if (mains.length === 0) {
      this.addIssue('warning', container, 'Page missing main landmark', 'WCAG 1.3.1');
    } else if (mains.length > 1) {
      mains.forEach((main, index) => {
        if (index > 0) {
          this.addIssue('warning', main, 'Multiple main landmarks found', 'WCAG 1.3.1');
        }
      });
    }

    // Check for navigation landmarks
    const navs = container.querySelectorAll('nav, [role="navigation"]');
    navs.forEach(nav => {
      if (!nav.hasAttribute('aria-label') && !nav.hasAttribute('aria-labelledby')) {
        this.addIssue('info', nav, 'Navigation landmark should have accessible name', 'WCAG 2.4.1');
      }
    });
  }

  /**
   * Basic color contrast check (simplified)
   */
  private checkColorContrast(container: Element) {
    const textElements = container.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;

      // This is a simplified check - in a real implementation, you'd calculate actual contrast ratios
      const textColor = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (textColor === backgroundColor) {
        this.addIssue('error', element, 'Text and background colors are the same', 'WCAG 1.4.3');
      }
    });
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(container: Element) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      // Check for focus indicators
      const styles = window.getComputedStyle(element, ':focus');
      if (styles.outline === 'none' && !styles.boxShadow && !styles.border) {
        this.addIssue('warning', element, 'Element may lack visible focus indicator', 'WCAG 2.4.7');
      }

      // Check for skip links
      if (element.textContent?.toLowerCase().includes('skip')) {
        const isVisible = styles.position !== 'absolute' || styles.left !== '-9999px';
        if (!isVisible) {
          this.addIssue('info', element, 'Skip link should be visible on focus', 'WCAG 2.4.1');
        }
      }
    });
  }

  /**
   * Add an accessibility issue to the list
   */
  private addIssue(type: AccessibilityIssue['type'], element: Element, message: string, rule: string) {
    this.issues.push({
      type,
      element,
      message,
      rule
    });
  }
}

/**
 * Utility functions for improving accessibility
 */
export const AccessibilityUtils = {
  /**
   * Add screen reader only text
   */
  addScreenReaderText(element: Element, text: string) {
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = text;
    element.appendChild(srText);
  },

  /**
   * Announce content changes to screen readers
   */
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Set focus to an element with optional scroll behavior
   */
  setFocus(element: HTMLElement, options: { preventScroll?: boolean } = {}) {
    element.focus({ preventScroll: options.preventScroll });

    // Announce focus change to screen readers
    const label = element.getAttribute('aria-label') ||
      element.textContent ||
      element.getAttribute('title') ||
      'Element';

    this.announceToScreenReader(`Focused on ${label}`, 'assertive');
  },

  /**
   * Check if an element is visible to screen readers
   */
  isVisibleToScreenReader(element: Element): boolean {
    const styles = window.getComputedStyle(element);

    return !(
      element.hasAttribute('aria-hidden') ||
      styles.display === 'none' ||
      styles.visibility === 'hidden' ||
      styles.opacity === '0' ||
      (styles.position === 'absolute' && styles.left === '-9999px')
    );
  },

  /**
   * Get the accessible name of an element
   */
  getAccessibleName(element: Element): string {
    // Check aria-label first
    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label') || '';
    }

    // Check aria-labelledby
    if (element.hasAttribute('aria-labelledby')) {
      const labelIds = element.getAttribute('aria-labelledby')?.split(' ') || [];
      const labelTexts = labelIds.map(id => {
        const labelElement = document.getElementById(id);
        return labelElement?.textContent || '';
      });
      return labelTexts.join(' ').trim();
    }

    // Check associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent || '';
      }
    }

    // Check if element is inside a label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent || '';
    }

    // Check title attribute
    if (element.hasAttribute('title')) {
      return element.getAttribute('title') || '';
    }

    // For images, check alt text
    if (element.tagName === 'IMG') {
      return (element as HTMLImageElement).alt || '';
    }

    // Fall back to text content
    return element.textContent || '';
  }
};

/**
 * Development-only accessibility checker
 * Only runs in development mode to avoid performance impact in production
 */
export function runAccessibilityCheck() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const checker = new AccessibilityChecker();
  const issues = checker.checkAccessibility();

  if (issues.length > 0) {
    console.group('🔍 Accessibility Issues Found');

    const errors = issues.filter(issue => issue.type === 'error');
    const warnings = issues.filter(issue => issue.type === 'warning');
    const info = issues.filter(issue => issue.type === 'info');

    if (errors.length > 0) {
      console.group('❌ Errors');
      errors.forEach(issue => {
        console.error(`${issue.rule}: ${issue.message}`, issue.element);
      });
      console.groupEnd();
    }

    if (warnings.length > 0) {
      console.group('⚠️ Warnings');
      warnings.forEach(issue => {
        console.warn(`${issue.rule}: ${issue.message}`, issue.element);
      });
      console.groupEnd();
    }

    if (info.length > 0) {
      console.group('ℹ️ Info');
      info.forEach(issue => {
        console.info(`${issue.rule}: ${issue.message}`, issue.element);
      });
      console.groupEnd();
    }

    console.groupEnd();
  } else {
    console.log('✅ No accessibility issues found');
  }
}
