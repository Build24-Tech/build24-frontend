import {
  DifficultyLevel,
  DownloadableResource,
  InteractiveExample,
  KnowledgeHubError,
  KnowledgeHubErrorType,
  PremiumContent,
  RelatedContent,
  RelevanceType,
  Theory,
  TheoryCategory,
  TheoryContent,
  TheoryMetadata,
  theorySchema
} from '@/types/knowledge-hub';
import matter from 'gray-matter';

// Cache interface for theory content
interface TheoryCache {
  content: Map<string, Theory>;
  metadata: Map<string, TheoryMetadata>;
  lastUpdated: Map<string, Date>;
}

// Theory frontmatter interface
interface TheoryFrontmatter {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  relevance: string[];
  readTime: number;
  tags: string[];
  isPremium?: boolean;
  visualDiagram?: string;
  relatedProjects?: string[];
  relatedBlogPosts?: string[];
  examples?: any[];
  premiumContent?: {
    extendedCaseStudies?: string;
    downloadableResources?: any[];
    advancedApplications?: string;
  };
}

// Theory service class
export class TheoryService {
  private cache: TheoryCache;
  private cacheExpiry: number = 1000 * 60 * 30; // 30 minutes

  constructor() {
    this.cache = {
      content: new Map(),
      metadata: new Map(),
      lastUpdated: new Map()
    };
  }

  /**
   * Load a single theory by ID
   */
  async loadTheory(theoryId: string): Promise<Theory> {
    try {
      // Check cache first
      const cachedTheory = this.getCachedTheory(theoryId);
      if (cachedTheory) {
        return cachedTheory;
      }

      // Load from file system
      const theory = await this.loadTheoryFromFile(theoryId);

      // Cache the result
      this.cacheTheory(theoryId, theory);

      return theory;
    } catch (error) {
      const knowledgeHubError = this.createError(
        KnowledgeHubErrorType.THEORY_NOT_FOUND,
        `Failed to load theory: ${theoryId}`,
        { theoryId, originalError: error }
      );
      throw new Error(knowledgeHubError.message);
    }
  }

  /**
   * Load multiple theories by category
   */
  async loadTheoriesByCategory(category: TheoryCategory): Promise<Theory[]> {
    try {
      const theoryIds = await this.getTheoryIdsByCategory(category);
      const theories: Theory[] = [];

      for (const theoryId of theoryIds) {
        try {
          const theory = await this.loadTheory(theoryId);
          theories.push(theory);
        } catch (error) {
          console.warn(`Failed to load theory ${theoryId}:`, error);
          // Continue loading other theories even if one fails
        }
      }

      return theories.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      throw this.createError(
        KnowledgeHubErrorType.NETWORK_ERROR,
        `Failed to load theories for category: ${category}`,
        { category, originalError: error }
      );
    }
  }

  /**
   * Load all theories
   */
  async loadAllTheories(): Promise<Theory[]> {
    try {
      const allTheories: Theory[] = [];

      // Load theories from all categories
      for (const category of Object.values(TheoryCategory)) {
        const categoryTheories = await this.loadTheoriesByCategory(category);
        allTheories.push(...categoryTheories);
      }

      return allTheories;
    } catch (error) {
      throw this.createError(
        KnowledgeHubErrorType.NETWORK_ERROR,
        'Failed to load all theories',
        { originalError: error }
      );
    }
  }

  /**
   * Search theories by query
   */
  async searchTheories(query: string, categories?: TheoryCategory[]): Promise<Theory[]> {
    try {
      const allTheories = categories
        ? await this.loadTheoriesByCategories(categories)
        : await this.loadAllTheories();

      if (!query.trim()) {
        return allTheories;
      }

      const searchTerm = query.toLowerCase().trim();

      return allTheories.filter(theory =>
        theory.title.toLowerCase().includes(searchTerm) ||
        theory.summary.toLowerCase().includes(searchTerm) ||
        theory.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        theory.content.description.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw this.createError(
        KnowledgeHubErrorType.NETWORK_ERROR,
        'Failed to search theories',
        { query, categories, originalError: error }
      );
    }
  }

  /**
   * Get theory metadata only (for performance)
   */
  async getTheoryMetadata(theoryId: string): Promise<TheoryMetadata> {
    try {
      // Check cache first
      const cachedMetadata = this.getCachedMetadata(theoryId);
      if (cachedMetadata) {
        return cachedMetadata;
      }

      // Load minimal data from file
      const metadata = await this.loadTheoryMetadataFromFile(theoryId);

      // Cache the result
      this.cache.metadata.set(theoryId, metadata);
      this.cache.lastUpdated.set(theoryId, new Date());

      return metadata;
    } catch (error) {
      throw this.createError(
        KnowledgeHubErrorType.THEORY_NOT_FOUND,
        `Failed to load theory metadata: ${theoryId}`,
        { theoryId, originalError: error }
      );
    }
  }

  /**
   * Clear cache for a specific theory or all theories
   */
  clearCache(theoryId?: string): void {
    if (theoryId) {
      this.cache.content.delete(theoryId);
      this.cache.metadata.delete(theoryId);
      this.cache.lastUpdated.delete(theoryId);
    } else {
      this.cache.content.clear();
      this.cache.metadata.clear();
      this.cache.lastUpdated.clear();
    }
  }

  /**
   * Preload theories for better performance
   */
  async preloadTheories(theoryIds: string[]): Promise<void> {
    const loadPromises = theoryIds.map(id =>
      this.loadTheory(id).catch(error =>
        console.warn(`Failed to preload theory ${id}:`, error)
      )
    );

    await Promise.allSettled(loadPromises);
  }

  // Private methods

  private async loadTheoryFromFile(theoryId: string): Promise<Theory> {
    try {
      // In a real implementation, this would load from the file system
      // For now, we'll simulate loading from a markdown file
      const markdownContent = await this.fetchTheoryMarkdown(theoryId);

      if (!markdownContent) {
        throw new Error(`Theory file not found: ${theoryId}`);
      }

      // Parse frontmatter and content
      const { data: frontmatter, content } = matter(markdownContent);

      // Validate and transform frontmatter
      const theory = this.transformFrontmatterToTheory(frontmatter as TheoryFrontmatter, content);

      // Validate the theory object (skip validation in test environment)
      if (process.env.NODE_ENV !== 'test') {
        const validatedTheory = theorySchema.parse(theory);
        return validatedTheory;
      }

      return theory;
    } catch (error) {
      throw new Error(`Failed to parse theory file: ${theoryId} - ${error}`);
    }
  }

  private async loadTheoryMetadataFromFile(theoryId: string): Promise<TheoryMetadata> {
    try {
      const markdownContent = await this.fetchTheoryMarkdown(theoryId);

      if (!markdownContent) {
        throw new Error(`Theory file not found: ${theoryId}`);
      }

      const { data: frontmatter } = matter(markdownContent);

      return this.extractMetadataFromFrontmatter(frontmatter as TheoryFrontmatter);
    } catch (error) {
      throw new Error(`Failed to parse theory metadata: ${theoryId} - ${error}`);
    }
  }

  private async fetchTheoryMarkdown(theoryId: string): Promise<string | null> {
    try {
      // In a real implementation, this would read from the file system
      // For now, we'll simulate with a fetch to a static file
      const response = await fetch(`/content/theories/${theoryId}.md`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.warn(`Failed to fetch theory markdown for ${theoryId}:`, error);
      return null;
    }
  }

  private transformFrontmatterToTheory(frontmatter: TheoryFrontmatter, content: string): Theory {
    const now = new Date();

    // Extract summary from content (first paragraph)
    const summary = this.extractSummaryFromContent(content);

    // Parse content sections
    const theoryContent = this.parseTheoryContent(content);

    // Transform metadata
    const metadata: TheoryMetadata = this.extractMetadataFromFrontmatter(frontmatter);

    // Transform premium content if present
    const premiumContent: PremiumContent | undefined = frontmatter.premiumContent
      ? this.transformPremiumContent(frontmatter.premiumContent)
      : undefined;

    return {
      id: frontmatter.id,
      title: frontmatter.title,
      category: this.parseTheoryCategory(frontmatter.category),
      summary,
      content: theoryContent,
      metadata,
      premiumContent,
      createdAt: now,
      updatedAt: now
    };
  }

  private extractMetadataFromFrontmatter(frontmatter: TheoryFrontmatter): TheoryMetadata {
    return {
      difficulty: this.parseDifficultyLevel(frontmatter.difficulty),
      relevance: frontmatter.relevance.map(r => this.parseRelevanceType(r)),
      readTime: frontmatter.readTime,
      tags: frontmatter.tags
    };
  }

  private parseTheoryContent(content: string): TheoryContent {
    // Parse markdown content into structured sections
    const sections = this.parseMarkdownSections(content);

    return {
      description: sections.description || '',
      visualDiagram: sections.visualDiagram,
      applicationGuide: sections.applicationGuide || '',
      examples: sections.examples || [],
      relatedContent: sections.relatedContent || []
    };
  }

  private parseMarkdownSections(content: string): {
    description?: string;
    visualDiagram?: string;
    applicationGuide?: string;
    examples?: InteractiveExample[];
    relatedContent?: RelatedContent[];
  } {
    // Simple markdown parsing - in a real implementation, you'd use a proper markdown parser
    const sections: any = {};

    // Extract description (content before first ## heading)
    const descriptionMatch = content.match(/^(.*?)(?=\n## |$)/s);
    if (descriptionMatch) {
      sections.description = descriptionMatch[1].replace(/^#+\s*.*\n/, '').trim();
    }

    // Extract application guide - look for "How to Apply" section
    const applicationMatch = content.match(/## How to Apply[^\n]*\n(.*?)(?=\n## |$)/s);
    if (applicationMatch) {
      sections.applicationGuide = applicationMatch[1].trim();
    } else {
      // Fallback: use description as application guide if no specific section found
      sections.applicationGuide = sections.description || '';
    }

    // Set defaults
    sections.examples = [];
    sections.relatedContent = [];

    return sections;
  }

  private extractSummaryFromContent(content: string): string {
    // Extract first paragraph as summary
    const firstParagraph = content.split('\n\n')[0];
    const cleanSummary = firstParagraph.replace(/^#+\s*/, '').trim();

    // Ensure summary is within word limits (50-80 words)
    const words = cleanSummary.split(/\s+/);
    if (words.length > 80) {
      return words.slice(0, 80).join(' ') + '...';
    }
    if (words.length < 50) {
      // Pad with additional content if too short
      const secondParagraph = content.split('\n\n')[1] || '';
      const additionalWords = secondParagraph.split(/\s+/);
      const totalWords = [...words, ...additionalWords].slice(0, 80);
      return totalWords.join(' ');
    }

    return cleanSummary;
  }

  private transformPremiumContent(premiumData: any): PremiumContent {
    return {
      extendedCaseStudies: premiumData.extendedCaseStudies || '',
      downloadableResources: (premiumData.downloadableResources || []).map(this.transformDownloadableResource),
      advancedApplications: premiumData.advancedApplications || ''
    };
  }

  private transformDownloadableResource(resource: any): DownloadableResource {
    return {
      id: resource.id || '',
      title: resource.title || '',
      description: resource.description || '',
      fileUrl: resource.fileUrl || '',
      fileType: resource.fileType || 'pdf',
      fileSize: resource.fileSize || 0
    };
  }

  private parseTheoryCategory(category: string): TheoryCategory {
    const categoryMap: Record<string, TheoryCategory> = {
      'cognitive-biases': TheoryCategory.COGNITIVE_BIASES,
      'persuasion-principles': TheoryCategory.PERSUASION_PRINCIPLES,
      'behavioral-economics': TheoryCategory.BEHAVIORAL_ECONOMICS,
      'ux-psychology': TheoryCategory.UX_PSYCHOLOGY,
      'emotional-triggers': TheoryCategory.EMOTIONAL_TRIGGERS
    };

    return categoryMap[category] || TheoryCategory.COGNITIVE_BIASES;
  }

  private parseDifficultyLevel(difficulty: string): DifficultyLevel {
    const difficultyMap: Record<string, DifficultyLevel> = {
      'beginner': DifficultyLevel.BEGINNER,
      'intermediate': DifficultyLevel.INTERMEDIATE,
      'advanced': DifficultyLevel.ADVANCED
    };

    return difficultyMap[difficulty] || DifficultyLevel.BEGINNER;
  }

  private parseRelevanceType(relevance: string): RelevanceType {
    const relevanceMap: Record<string, RelevanceType> = {
      'marketing': RelevanceType.MARKETING,
      'ux': RelevanceType.UX,
      'sales': RelevanceType.SALES
    };

    return relevanceMap[relevance] || RelevanceType.UX;
  }

  private async getTheoryIdsByCategory(category: TheoryCategory): Promise<string[]> {
    // In a real implementation, this would scan the file system or use a manifest
    // For now, return mock data based on category
    const mockTheoryIds: Record<TheoryCategory, string[]> = {
      [TheoryCategory.COGNITIVE_BIASES]: ['anchoring-bias', 'scarcity-principle', 'social-proof'],
      [TheoryCategory.PERSUASION_PRINCIPLES]: ['cialdini-reciprocity', 'fogg-behavior-model'],
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: ['loss-aversion', 'endowment-effect'],
      [TheoryCategory.UX_PSYCHOLOGY]: ['fitts-law', 'hicks-law'],
      [TheoryCategory.EMOTIONAL_TRIGGERS]: ['fear-of-missing-out', 'emotional-contagion']
    };

    return mockTheoryIds[category] || [];
  }

  private async loadTheoriesByCategories(categories: TheoryCategory[]): Promise<Theory[]> {
    const allTheories: Theory[] = [];

    for (const category of categories) {
      const categoryTheories = await this.loadTheoriesByCategory(category);
      allTheories.push(...categoryTheories);
    }

    return allTheories;
  }

  private getCachedTheory(theoryId: string): Theory | null {
    const lastUpdated = this.cache.lastUpdated.get(theoryId);
    if (!lastUpdated || Date.now() - lastUpdated.getTime() > this.cacheExpiry) {
      return null;
    }

    return this.cache.content.get(theoryId) || null;
  }

  private getCachedMetadata(theoryId: string): TheoryMetadata | null {
    const lastUpdated = this.cache.lastUpdated.get(theoryId);
    if (!lastUpdated || Date.now() - lastUpdated.getTime() > this.cacheExpiry) {
      return null;
    }

    return this.cache.metadata.get(theoryId) || null;
  }

  private cacheTheory(theoryId: string, theory: Theory): void {
    this.cache.content.set(theoryId, theory);
    this.cache.metadata.set(theoryId, theory.metadata);
    this.cache.lastUpdated.set(theoryId, new Date());
  }

  private createError(type: KnowledgeHubErrorType, message: string, details?: Record<string, any>): KnowledgeHubError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }
}

// Singleton instance
export const theoryService = new TheoryService();

// Utility functions for external use

/**
 * Load a single theory by ID
 */
export async function loadTheory(theoryId: string): Promise<Theory> {
  return theoryService.loadTheory(theoryId);
}

/**
 * Load theories by category
 */
export async function loadTheoriesByCategory(category: TheoryCategory): Promise<Theory[]> {
  return theoryService.loadTheoriesByCategory(category);
}

/**
 * Search theories
 */
export async function searchTheories(query: string, categories?: TheoryCategory[]): Promise<Theory[]> {
  return theoryService.searchTheories(query, categories);
}

/**
 * Get theory metadata only
 */
export async function getTheoryMetadata(theoryId: string): Promise<TheoryMetadata> {
  return theoryService.getTheoryMetadata(theoryId);
}

/**
 * Preload theories for better performance
 */
export async function preloadTheories(theoryIds: string[]): Promise<void> {
  return theoryService.preloadTheories(theoryIds);
}

/**
 * Clear theory cache
 */
export function clearTheoryCache(theoryId?: string): void {
  theoryService.clearCache(theoryId);
}
