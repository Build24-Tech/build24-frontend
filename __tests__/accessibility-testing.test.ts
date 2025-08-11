import { AccessibilityChecker, AccessibilityUtils } from '@/lib/accessibility-testing';

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    fontSize: '16px',
    fontWeight: 'normal',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    position: 'static',
    left: '0px',
    outline: '1px solid blue',
    boxShadow: 'none',
    border: 'none'
  })
});

describe('AccessibilityChecker', () => {
  let container: HTMLDivElement;
  let checker: AccessibilityChecker;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    checker = new AccessibilityChecker();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Image accessibility', () => {
    it('should detect images without alt text', () => {
      container.innerHTML = '<img src="test.jpg" />';
      const issues = checker.checkAccessibility(container);

      const imageIssues = issues.filter(issue => issue.message.includes('missing alt attribute'));
      expect(imageIssues).toHaveLength(1);
      expect(imageIssues[0].type).toBe('error');
      expect(imageIssues[0].message).toContain('missing alt attribute');
      expect(imageIssues[0].rule).toBe('WCAG 1.1.1');
    });

    it('should not flag images with proper alt text', () => {
      container.innerHTML = '<img src="test.jpg" alt="Test image" />';
      const issues = checker.checkAccessibility(container);

      const imageIssues = issues.filter(issue => issue.message.includes('alt'));
      expect(imageIssues).toHaveLength(0);
    });

    it('should warn about empty alt text on non-decorative images', () => {
      container.innerHTML = '<img src="test.jpg" alt="" />';
      const issues = checker.checkAccessibility(container);

      const altIssues = issues.filter(issue => issue.message.includes('empty alt'));
      expect(altIssues).toHaveLength(1);
      expect(altIssues[0].type).toBe('warning');
    });

    it('should not warn about empty alt text on decorative images', () => {
      container.innerHTML = '<img src="test.jpg" alt="" aria-hidden="true" />';
      const issues = checker.checkAccessibility(container);

      const altIssues = issues.filter(issue => issue.message.includes('empty alt'));
      expect(altIssues).toHaveLength(0);
    });
  });

  describe('Button accessibility', () => {
    it('should detect buttons without accessible names', () => {
      container.innerHTML = '<button></button>';
      const issues = checker.checkAccessibility(container);

      const buttonIssues = issues.filter(issue => issue.message.includes('Button missing'));
      expect(buttonIssues).toHaveLength(1);
      expect(buttonIssues[0].type).toBe('error');
    });

    it('should not flag buttons with text content', () => {
      container.innerHTML = '<button>Click me</button>';
      const issues = checker.checkAccessibility(container);

      const buttonIssues = issues.filter(issue => issue.message.includes('Button missing'));
      expect(buttonIssues).toHaveLength(0);
    });

    it('should not flag buttons with aria-label', () => {
      container.innerHTML = '<button aria-label="Close dialog"></button>';
      const issues = checker.checkAccessibility(container);

      const buttonIssues = issues.filter(issue => issue.message.includes('Button missing'));
      expect(buttonIssues).toHaveLength(0);
    });

    it('should detect custom buttons without tabindex', () => {
      container.innerHTML = '<div role="button">Custom button</div>';
      const issues = checker.checkAccessibility(container);

      const tabindexIssues = issues.filter(issue => issue.message.includes('missing tabindex'));
      expect(tabindexIssues).toHaveLength(1);
      expect(tabindexIssues[0].type).toBe('error');
    });
  });

  describe('Link accessibility', () => {
    it('should detect links without accessible names', () => {
      container.innerHTML = '<a href="/test"></a>';
      const issues = checker.checkAccessibility(container);

      const linkIssues = issues.filter(issue => issue.message.includes('Link missing'));
      expect(linkIssues).toHaveLength(1);
      expect(linkIssues[0].type).toBe('error');
    });

    it('should warn about vague link text', () => {
      container.innerHTML = '<a href="/test">click here</a>';
      const issues = checker.checkAccessibility(container);

      const vagueIssues = issues.filter(issue => issue.message.includes('not descriptive'));
      expect(vagueIssues).toHaveLength(1);
      expect(vagueIssues[0].type).toBe('warning');
    });

    it('should not flag descriptive links', () => {
      container.innerHTML = '<a href="/test">Read the full article about accessibility</a>';
      const issues = checker.checkAccessibility(container);

      const linkIssues = issues.filter(issue => issue.message.includes('Link'));
      expect(linkIssues).toHaveLength(0);
    });
  });

  describe('Form accessibility', () => {
    it('should detect form elements without labels', () => {
      container.innerHTML = '<input type="text" />';
      const issues = checker.checkAccessibility(container);

      const labelIssues = issues.filter(issue => issue.message.includes('missing label'));
      expect(labelIssues).toHaveLength(1);
      expect(labelIssues[0].type).toBe('error');
    });

    it('should not flag form elements with labels', () => {
      container.innerHTML = `
        <label for="test-input">Name</label>
        <input type="text" id="test-input" />
      `;
      const issues = checker.checkAccessibility(container);

      const labelIssues = issues.filter(issue => issue.message.includes('missing label'));
      expect(labelIssues).toHaveLength(0);
    });

    it('should not flag form elements with aria-label', () => {
      container.innerHTML = '<input type="text" aria-label="Enter your name" />';
      const issues = checker.checkAccessibility(container);

      const labelIssues = issues.filter(issue => issue.message.includes('missing label'));
      expect(labelIssues).toHaveLength(0);
    });
  });

  describe('Heading structure', () => {
    it('should detect skipped heading levels', () => {
      container.innerHTML = '<h1>Title</h1><h3>Subtitle</h3>';
      const issues = checker.checkAccessibility(container);

      const headingIssues = issues.filter(issue => issue.message.includes('skipped'));
      expect(headingIssues).toHaveLength(1);
      expect(headingIssues[0].type).toBe('warning');
    });

    it('should detect multiple h1 elements', () => {
      container.innerHTML = '<h1>First title</h1><h1>Second title</h1>';
      const issues = checker.checkAccessibility(container);

      const h1Issues = issues.filter(issue => issue.message.includes('Multiple h1'));
      expect(h1Issues).toHaveLength(1);
      expect(h1Issues[0].type).toBe('warning');
    });

    it('should not flag proper heading hierarchy', () => {
      container.innerHTML = '<h1>Title</h1><h2>Subtitle</h2><h3>Sub-subtitle</h3>';
      const issues = checker.checkAccessibility(container);

      const headingIssues = issues.filter(issue => issue.message.includes('Heading'));
      expect(headingIssues).toHaveLength(0);
    });
  });
});

describe('AccessibilityUtils', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('getAccessibleName', () => {
    it('should return aria-label when present', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close dialog');
      button.textContent = 'X';

      const name = AccessibilityUtils.getAccessibleName(button);
      expect(name).toBe('Close dialog');
    });

    it('should return text content when no aria-label', () => {
      const button = document.createElement('button');
      button.textContent = 'Submit form';

      const name = AccessibilityUtils.getAccessibleName(button);
      expect(name).toBe('Submit form');
    });

    it('should return alt text for images', () => {
      const img = document.createElement('img');
      img.alt = 'Profile picture';

      const name = AccessibilityUtils.getAccessibleName(img);
      expect(name).toBe('Profile picture');
    });

    it('should return title attribute as fallback', () => {
      const div = document.createElement('div');
      div.title = 'Tooltip text';

      const name = AccessibilityUtils.getAccessibleName(div);
      expect(name).toBe('Tooltip text');
    });
  });

  describe('isVisibleToScreenReader', () => {
    it('should return false for aria-hidden elements', () => {
      const div = document.createElement('div');
      div.setAttribute('aria-hidden', 'true');

      const isVisible = AccessibilityUtils.isVisibleToScreenReader(div);
      expect(isVisible).toBe(false);
    });

    it('should return true for visible elements', () => {
      const div = document.createElement('div');
      div.textContent = 'Visible content';

      const isVisible = AccessibilityUtils.isVisibleToScreenReader(div);
      expect(isVisible).toBe(true);
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      const initialCount = document.querySelectorAll('[aria-live]').length;

      AccessibilityUtils.announceToScreenReader('Test announcement');

      const announcements = document.querySelectorAll('[aria-live]');
      expect(announcements.length).toBe(initialCount + 1);

      const announcement = announcements[announcements.length - 1];
      expect(announcement.textContent).toBe('Test announcement');
      expect(announcement.getAttribute('aria-live')).toBe('polite');
    });

    it('should use assertive priority when specified', () => {
      AccessibilityUtils.announceToScreenReader('Urgent message', 'assertive');

      const announcements = document.querySelectorAll('[aria-live="assertive"]');
      expect(announcements.length).toBeGreaterThan(0);

      const announcement = announcements[announcements.length - 1];
      expect(announcement.textContent).toBe('Urgent message');
    });
  });
});
