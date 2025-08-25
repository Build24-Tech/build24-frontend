import { DifficultyLevel, RelevanceType, TheoryCategory } from '@/types/knowledge-hub';
import matter from 'gray-matter';
import { z } from 'zod';

// Content validation schema
const theoryContentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.nativeEnum(TheoryCategory),
  difficulty: z.nativeEnum(DifficultyLevel),
  relevance: z.array(z.nativeEnum(RelevanceType)),
  readTime: z.number().min(1).max(30),
  tags: z.array(z.string()),
  isPremium: z.boolean().optional().default(false),
  visualDiagram: z.string().optional(),
  relatedProjects: z.array(z.string()).optional().default([]),
  relatedBlogPosts: z.array(z.string()).optional().default([]),
  content: z.string().min(100), // Minimum content length
});

// Theory template interface
export interface TheoryTemplate {
  id: string;
  title: string;
  category: TheoryCategory;
  difficulty: DifficultyLevel;
  relevance: RelevanceType[];
  readTime: number;
  tags: string[];
  isPremium?: boolean;
  visualDiagram?: string;
  relatedProjects?: string[];
  relatedBlogPosts?: string[];
  content: {
    description: string;
    applicationGuide: string;
    examples?: string[];
    relatedConcepts?: string[];
  };
}

// Content versioning interface
interface ContentVersion {
  version: string;
  timestamp: Date;
  author: string;
  changes: string[];
  content: string;
}

export class ContentManagementSystem {
  private contentVersions: Map<string, ContentVersion[]> = new Map();

  /**
   * Validate theory content structure and format
   */
  validateTheoryContent(theoryData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate basic structure
      theoryContentSchema.parse(theoryData);

      // Additional content validation
      const contentValidation = this.validateContentQuality(theoryData.content);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
      }

      // Validate frontmatter consistency
      const frontmatterValidation = this.validateFrontmatter(theoryData);
      if (!frontmatterValidation.isValid) {
        errors.push(...frontmatterValidation.errors);
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(`Validation error: ${error}`);
      }

      return { isValid: false, errors };
    }
  }

  /**
   * Generate theory content from template
   */
  generateTheoryFromTemplate(template: TheoryTemplate): string {
    const frontmatter: Record<string, any> = {
      id: template.id,
      title: template.title,
      category: this.categoryToString(template.category),
      difficulty: this.difficultyToString(template.difficulty),
      relevance: template.relevance.map(r => this.relevanceToString(r)),
      readTime: template.readTime,
      tags: template.tags,
      isPremium: template.isPremium || false
    };

    // Only add optional fields if they have values
    if (template.visualDiagram) {
      frontmatter.visualDiagram = template.visualDiagram;
    }

    if (template.relatedProjects && template.relatedProjects.length > 0) {
      frontmatter.relatedProjects = template.relatedProjects;
    }

    if (template.relatedBlogPosts && template.relatedBlogPosts.length > 0) {
      frontmatter.relatedBlogPosts = template.relatedBlogPosts;
    }

    const content = this.formatTheoryContent(template);

    return matter.stringify(content, frontmatter);
  }

  /**
   * Create content versioning entry
   */
  createContentVersion(
    theoryId: string,
    content: string,
    author: string,
    changes: string[]
  ): ContentVersion {
    const version: ContentVersion = {
      version: this.generateVersionNumber(theoryId),
      timestamp: new Date(),
      author,
      changes,
      content
    };

    // Store version
    const versions = this.contentVersions.get(theoryId) || [];
    versions.push(version);
    this.contentVersions.set(theoryId, versions);

    return version;
  }

  /**
   * Get content version history
   */
  getVersionHistory(theoryId: string): ContentVersion[] {
    return this.contentVersions.get(theoryId) || [];
  }

  /**
   * Format theory content for consistency
   */
  formatTheoryContent(template: TheoryTemplate): string {
    let content = `# ${template.title}\n\n`;

    // Add description
    content += `${template.content.description}\n\n`;

    // Add application guide
    content += `## How to Apply in Build24\n\n`;
    content += `${template.content.applicationGuide}\n\n`;

    // Add examples if provided
    if (template.content.examples && template.content.examples.length > 0) {
      content += `## Examples and Applications\n\n`;
      template.content.examples.forEach(example => {
        content += `- ${example}\n`;
      });
      content += '\n';
    }

    // Add related concepts if provided
    if (template.content.relatedConcepts && template.content.relatedConcepts.length > 0) {
      content += `## Related Concepts\n\n`;
      content += `This theory connects to other psychological principles like ${template.content.relatedConcepts.join(', ')}. Understanding how these concepts work together can create more effective user experiences and marketing strategies.\n\n`;
    }

    return content;
  }

  /**
   * Validate content quality and structure
   */
  private validateContentQuality(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check minimum content length
    if (content.length < 100) {
      errors.push('Content must be at least 100 characters long');
    }

    // Check for required sections
    if (!content.includes('# ')) {
      errors.push('Content must include a main heading');
    }

    if (!content.toLowerCase().includes('how to apply')) {
      errors.push('Content should include application guidance');
    }

    // Check word count for summary extraction
    const words = content.split(/\s+/).length;
    if (words < 50) {
      errors.push('Content should have at least 50 words for proper summary extraction');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate frontmatter consistency
   */
  private validateFrontmatter(theoryData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check ID format (kebab-case)
    if (!/^[a-z0-9-]+$/.test(theoryData.id)) {
      errors.push('ID must be in kebab-case format (lowercase letters, numbers, and hyphens only)');
    }

    // Check title format
    if (theoryData.title.length > 100) {
      errors.push('Title should be under 100 characters');
    }

    // Check read time reasonableness
    if (theoryData.readTime < 1 || theoryData.readTime > 30) {
      errors.push('Read time should be between 1 and 30 minutes');
    }

    // Check tags format
    if (theoryData.tags.some((tag: string) => tag.includes(' ') && !tag.includes('-'))) {
      errors.push('Multi-word tags should use hyphens instead of spaces');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Generate version number
   */
  private generateVersionNumber(theoryId: string): string {
    const versions = this.contentVersions.get(theoryId) || [];
    const majorVersion = Math.floor(versions.length / 10) + 1;
    const minorVersion = versions.length % 10;
    return `${majorVersion}.${minorVersion}`;
  }

  /**
   * Convert enum values to strings for frontmatter
   */
  private categoryToString(category: TheoryCategory): string {
    switch (category) {
      case TheoryCategory.COGNITIVE_BIASES:
        return 'cognitive-biases';
      case TheoryCategory.PERSUASION_PRINCIPLES:
        return 'persuasion-principles';
      case TheoryCategory.BEHAVIORAL_ECONOMICS:
        return 'behavioral-economics';
      case TheoryCategory.UX_PSYCHOLOGY:
        return 'ux-psychology';
      case TheoryCategory.EMOTIONAL_TRIGGERS:
        return 'emotional-triggers';
      default:
        return 'cognitive-biases';
    }
  }

  private difficultyToString(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'beginner';
      case DifficultyLevel.INTERMEDIATE:
        return 'intermediate';
      case DifficultyLevel.ADVANCED:
        return 'advanced';
      default:
        return 'beginner';
    }
  }

  private relevanceToString(relevance: RelevanceType): string {
    switch (relevance) {
      case RelevanceType.MARKETING:
        return 'marketing';
      case RelevanceType.UX:
        return 'ux';
      case RelevanceType.SALES:
        return 'sales';
      default:
        return 'ux';
    }
  }
}

// Singleton instance
export const contentManagementSystem = new ContentManagementSystem();

// Utility functions
export function validateTheoryContent(theoryData: any) {
  return contentManagementSystem.validateTheoryContent(theoryData);
}

export function generateTheoryFromTemplate(template: TheoryTemplate) {
  return contentManagementSystem.generateTheoryFromTemplate(template);
}

export function createContentVersion(
  theoryId: string,
  content: string,
  author: string,
  changes: string[]
) {
  return contentManagementSystem.createContentVersion(theoryId, content, author, changes);
}
