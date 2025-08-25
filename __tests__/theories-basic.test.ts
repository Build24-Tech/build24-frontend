import { TheoryService } from '@/lib/theories';
import { DifficultyLevel, RelevanceType, TheoryCategory } from '@/types/knowledge-hub';

// Mock fetch for testing
global.fetch = jest.fn();

describe('TheoryService Basic Tests', () => {
  let theoryService: TheoryService;

  beforeEach(() => {
    theoryService = new TheoryService();
    jest.clearAllMocks();
  });

  it('should create a theory service instance', () => {
    expect(theoryService).toBeDefined();
    expect(theoryService).toBeInstanceOf(TheoryService);
  });

  it('should load and parse a theory from markdown', async () => {
    const mockMarkdown = `---
id: "test-theory"
title: "Test Theory"
category: "cognitive-biases"
difficulty: "beginner"
relevance: ["marketing", "ux"]
readTime: 5
tags: ["test", "example"]
isPremium: false
---

# Test Theory

This is a test theory that demonstrates how cognitive biases work in product development. It provides insights into user behavior and decision-making processes. The theory explains fundamental concepts that every product builder should understand. These principles can be applied to improve user experience and increase conversion rates. Understanding these psychological patterns helps create more effective products and marketing strategies. The application of these concepts can significantly impact business outcomes and user satisfaction.

## How to Apply in Build24

Use this theory to improve your product design and user experience. Apply the principles to your landing pages and user interfaces.`;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown)
    });

    const theory = await theoryService.loadTheory('test-theory');

    expect(theory).toBeDefined();
    expect(theory.id).toBe('test-theory');
    expect(theory.title).toBe('Test Theory');
    expect(theory.category).toBe(TheoryCategory.COGNITIVE_BIASES);
    expect(theory.metadata.difficulty).toBe(DifficultyLevel.BEGINNER);
    expect(theory.metadata.relevance).toContain(RelevanceType.MARKETING);
    expect(theory.metadata.relevance).toContain(RelevanceType.UX);
    expect(theory.metadata.readTime).toBe(5);
    expect(theory.metadata.tags).toContain('test');
    expect(theory.summary).toBeDefined();
    expect(theory.content.description).toBeDefined();
    expect(theory.content.applicationGuide).toBeDefined();
  });

  it('should handle 404 errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(theoryService.loadTheory('non-existent-theory'))
      .rejects
      .toThrow('Failed to load theory: non-existent-theory');
  });

  it('should cache theories correctly', async () => {
    const mockMarkdown = `---
id: "cached-theory"
title: "Cached Theory"
category: "cognitive-biases"
difficulty: "beginner"
relevance: ["marketing"]
readTime: 3
tags: ["cache"]
---

# Cached Theory

This theory tests caching functionality. It should only be fetched once from the server and then served from cache on subsequent requests. The caching mechanism improves performance by reducing network requests and file system operations. This is particularly important for frequently accessed theories in the Knowledge Hub.`;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown)
    });

    // First request - should fetch from server
    const theory1 = await theoryService.loadTheory('cached-theory');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second request - should use cache
    const theory2 = await theoryService.loadTheory('cached-theory');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(theory1).toEqual(theory2);
  });

  it('should clear cache correctly', async () => {
    const mockMarkdown = `---
id: "clear-cache-theory"
title: "Clear Cache Theory"
category: "ux-psychology"
difficulty: "beginner"
relevance: ["ux"]
readTime: 2
tags: ["cache", "clear"]
---

# Clear Cache Theory

This theory tests cache clearing functionality.`;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockMarkdown)
    });

    // Load theory to cache it
    await theoryService.loadTheory('clear-cache-theory');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Clear cache for this theory
    theoryService.clearCache('clear-cache-theory');

    // Load again - should fetch from server
    await theoryService.loadTheory('clear-cache-theory');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should load theory metadata only', async () => {
    const mockMarkdown = `---
id: "metadata-theory"
title: "Metadata Theory"
category: "behavioral-economics"
difficulty: "intermediate"
relevance: ["marketing", "ux", "sales"]
readTime: 7
tags: ["metadata", "performance"]
---

# Metadata Theory

This theory tests the metadata-only loading functionality for performance optimization.`;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown)
    });

    const metadata = await theoryService.getTheoryMetadata('metadata-theory');

    expect(metadata).toBeDefined();
    expect(metadata.difficulty).toBe(DifficultyLevel.INTERMEDIATE);
    expect(metadata.relevance).toHaveLength(3);
    expect(metadata.readTime).toBe(7);
    expect(metadata.tags).toContain('metadata');
    expect(metadata.tags).toContain('performance');
  });
});
