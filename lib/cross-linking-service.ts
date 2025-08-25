import { RelatedContent, Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';
import {
  BlogPostReference,
  ContentRecommendation,
  getRecommendationEngine,
  ProjectReference,
  RecommendationEngine
} from './recommendation-engine';

export interface CrossLinkingOptions {
  maxRelatedTheories?: number;
  maxBlogPosts?: number;
  maxProjects?: number;
  includeUserHistory?: boolean;
}

export interface NavigationPath {
  from: string;
  to: string;
  type: 'theory' | 'blog-post' | 'project';
  relationship: 'related' | 'similar' | 'prerequisite' | 'advanced';
}

export class CrossLinkingService {
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.recommendationEngine = getRecommendationEngine();
  }

  /**
   * Get comprehensive cross-links for a theory
   */
  async getCrossLinksForTheory(
    theory: Theory,
    userProgress?: UserProgress,
    options: CrossLinkingOptions = {}
  ): Promise<RelatedContent[]> {
    const {
      maxRelatedTheories = 3,
      maxBlogPosts = 2,
      maxProjects = 2,
      includeUserHistory = true
    } = options;

    const crossLinks: RelatedContent[] = [];

    try {
      // Get related theories
      const relatedTheories = this.recommendationEngine.getRelatedTheories(
        theory,
        includeUserHistory ? userProgress : undefined,
        maxRelatedTheories
      );

      relatedTheories.forEach(relatedTheory => {
        crossLinks.push({
          id: relatedTheory.id,
          title: relatedTheory.title,
          type: 'theory',
          url: `/dashboard/knowledge-hub/theory/${relatedTheory.id}`,
          description: this.truncateDescription(relatedTheory.summary, 100)
        });
      });

      // Get related blog posts (mock data for now)
      const blogPosts = await this.getRelatedBlogPosts(theory, maxBlogPosts);
      blogPosts.forEach(blogPost => {
        crossLinks.push({
          id: blogPost.id,
          title: blogPost.title,
          type: 'blog-post',
          url: `/blog/${blogPost.slug}`,
          description: this.truncateDescription(blogPost.excerpt, 100)
        });
      });

      // Get related projects (mock data for now)
      const projects = await this.getRelatedProjects(theory, maxProjects);
      projects.forEach(project => {
        crossLinks.push({
          id: project.id,
          title: project.title,
          type: 'project',
          url: `/projects#${project.id}`,
          description: this.truncateDescription(project.description, 100)
        });
      });

      return crossLinks;
    } catch (error) {
      console.error('Error generating cross-links:', error);
      return [];
    }
  }

  /**
   * Get content recommendations based on user's reading history
   */
  async getPersonalizedRecommendations(
    userProgress: UserProgress,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      // Analyze user's preferred categories
      const preferredCategories = this.analyzeUserPreferences(userProgress);

      return this.recommendationEngine.getContentRecommendations(
        preferredCategories,
        userProgress,
        limit
      );
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Get navigation paths between related content
   */
  getNavigationPaths(fromTheoryId: string, toTheoryId: string): NavigationPath[] {
    // This would typically involve graph traversal algorithms
    // For now, return a simple direct path
    return [{
      from: fromTheoryId,
      to: toTheoryId,
      type: 'theory',
      relationship: 'related'
    }];
  }

  /**
   * Get trending content based on cross-link popularity
   */
  async getTrendingContent(limit: number = 5): Promise<ContentRecommendation[]> {
    try {
      // Mock implementation - in real app, this would query analytics
      const allCategories = Object.values(TheoryCategory);
      return this.recommendationEngine.getContentRecommendations(
        allCategories,
        undefined,
        limit
      );
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  /**
   * Update recommendation engine with fresh data
   */
  async updateRecommendationData(
    theories: Theory[],
    blogPosts?: BlogPostReference[],
    projects?: ProjectReference[]
  ): Promise<void> {
    try {
      this.recommendationEngine.updateTheories(theories);

      if (blogPosts) {
        this.recommendationEngine.updateBlogPosts(blogPosts);
      }

      if (projects) {
        this.recommendationEngine.updateProjects(projects);
      }
    } catch (error) {
      console.error('Error updating recommendation data:', error);
    }
  }

  /**
   * Get related blog posts for a theory
   */
  private async getRelatedBlogPosts(
    theory: Theory,
    limit: number
  ): Promise<BlogPostReference[]> {
    // Enhanced blog posts with Build24-specific content
    const mockBlogPosts: BlogPostReference[] = [
      {
        id: 'psychology-of-pricing',
        title: 'The Psychology of Pricing: How to Price Your Product',
        slug: 'psychology-of-pricing',
        excerpt: 'Understanding cognitive biases in pricing decisions can dramatically impact your product success. Learn from 24-hour build experiments.',
        tags: ['pricing', 'psychology', 'business', 'build24'],
        publishedAt: new Date('2024-01-15'),
        readTime: 8
      },
      {
        id: 'ux-persuasion-techniques',
        title: 'UX Persuasion Techniques That Actually Work',
        slug: 'ux-persuasion-techniques',
        excerpt: 'Learn how to apply persuasion principles in your user interface design during rapid prototyping sessions.',
        tags: ['ux', 'persuasion', 'design', 'rapid-prototyping'],
        publishedAt: new Date('2024-01-10'),
        readTime: 6
      },
      {
        id: 'behavioral-economics-startups',
        title: 'Behavioral Economics for Startups',
        slug: 'behavioral-economics-startups',
        excerpt: 'How understanding user behavior can give your startup a competitive edge in the first 24 hours.',
        tags: ['behavioral-economics', 'startups', 'user-behavior'],
        publishedAt: new Date('2024-01-05'),
        readTime: 10
      },
      {
        id: 'building-with-psychology',
        title: 'Building Products with Psychology in Mind',
        slug: 'building-with-psychology',
        excerpt: 'Real examples from Build24 projects showing how psychological principles shaped product decisions.',
        tags: ['psychology', 'product-development', 'build24', 'case-study'],
        publishedAt: new Date('2024-01-20'),
        readTime: 12
      },
      {
        id: 'rapid-user-research',
        title: 'Rapid User Research: Psychology Insights in 24 Hours',
        slug: 'rapid-user-research',
        excerpt: 'How to gather psychological insights about your users during time-constrained build sessions.',
        tags: ['user-research', 'psychology', 'rapid-prototyping', 'build24'],
        publishedAt: new Date('2024-01-12'),
        readTime: 7
      }
    ];

    // Filter based on theory tags and category
    const relevantPosts = mockBlogPosts.filter(post => {
      const hasMatchingTags = post.tags.some(tag =>
        theory.metadata.tags.some(theoryTag =>
          theoryTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(theoryTag.toLowerCase())
        )
      );

      const categoryMatch = this.getCategoryRelatedTags(theory.category)
        .some(categoryTag => post.tags.includes(categoryTag));

      return hasMatchingTags || categoryMatch;
    });

    return relevantPosts.slice(0, limit);
  }

  /**
   * Get related projects for a theory
   */
  private async getRelatedProjects(
    theory: Theory,
    limit: number
  ): Promise<ProjectReference[]> {
    // Enhanced Build24 projects with psychological principles integration
    const mockProjects: ProjectReference[] = [
      {
        id: 'pricing-optimizer',
        title: 'Pricing Optimizer Tool',
        description: 'A 24-hour build that uses psychological pricing principles like anchoring bias and loss aversion to optimize product pricing.',
        technologies: ['React', 'Node.js', 'Psychology APIs', 'Tailwind CSS'],
        category: 'marketing',
        completedAt: new Date('2024-01-20'),
        githubUrl: 'https://github.com/build24/pricing-optimizer',
        liveUrl: 'https://pricing-optimizer.build24.dev'
      },
      {
        id: 'persuasion-dashboard',
        title: 'Persuasion Analytics Dashboard',
        description: 'Built in 24 hours: Dashboard for tracking the effectiveness of persuasion techniques in web design using real user behavior data.',
        technologies: ['Next.js', 'D3.js', 'Analytics', 'Firebase'],
        category: 'analytics',
        completedAt: new Date('2024-01-15'),
        githubUrl: 'https://github.com/build24/persuasion-dashboard'
      },
      {
        id: 'behavioral-ab-testing',
        title: 'Behavioral A/B Testing Platform',
        description: 'A/B testing platform focused on behavioral economics principles, built during a 24-hour sprint with real-time psychological insights.',
        technologies: ['React', 'Python', 'Machine Learning', 'PostgreSQL'],
        category: 'analytics',
        completedAt: new Date('2024-01-10'),
        liveUrl: 'https://ab-testing.build24.dev'
      },
      {
        id: 'cognitive-bias-detector',
        title: 'Cognitive Bias Detector',
        description: 'A tool that analyzes user interfaces and detects potential cognitive biases in design decisions. Built in one intense 24-hour session.',
        technologies: ['Vue.js', 'TensorFlow.js', 'Computer Vision'],
        category: 'design-tools',
        completedAt: new Date('2024-01-25'),
        githubUrl: 'https://github.com/build24/cognitive-bias-detector',
        liveUrl: 'https://bias-detector.build24.dev'
      },
      {
        id: 'emotional-trigger-analyzer',
        title: 'Emotional Trigger Analyzer',
        description: 'Analyze marketing copy and website content for emotional triggers. A rapid prototype exploring the intersection of NLP and psychology.',
        technologies: ['Python', 'FastAPI', 'NLP', 'React'],
        category: 'marketing',
        completedAt: new Date('2024-01-18'),
        githubUrl: 'https://github.com/build24/emotional-trigger-analyzer'
      },
      {
        id: 'scarcity-timer-widget',
        title: 'Scarcity Timer Widget',
        description: 'A customizable widget that implements scarcity principle with ethical design patterns. Built and tested in 24 hours.',
        technologies: ['Vanilla JS', 'CSS3', 'Web Components'],
        category: 'widgets',
        completedAt: new Date('2024-01-08'),
        githubUrl: 'https://github.com/build24/scarcity-timer-widget',
        liveUrl: 'https://scarcity-widget.build24.dev'
      }
    ];

    // Filter based on theory category and tags
    const categoryTags = this.getCategoryRelatedTags(theory.category);
    const relevantProjects = mockProjects.filter(project => {
      const categoryMatch = categoryTags.some(tag =>
        project.category.includes(tag) ||
        project.technologies.some(tech => tech.toLowerCase().includes(tag))
      );

      const tagMatch = theory.metadata.tags.some(tag =>
        project.description.toLowerCase().includes(tag.toLowerCase()) ||
        project.title.toLowerCase().includes(tag.toLowerCase())
      );

      return categoryMatch || tagMatch;
    });

    return relevantProjects.slice(0, limit);
  }

  /**
   * Analyze user preferences based on reading history
   */
  private analyzeUserPreferences(userProgress: UserProgress): TheoryCategory[] {
    const categoryCount: Record<TheoryCategory, number> = {
      [TheoryCategory.COGNITIVE_BIASES]: 0,
      [TheoryCategory.PERSUASION_PRINCIPLES]: 0,
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: 0,
      [TheoryCategory.UX_PSYCHOLOGY]: 0,
      [TheoryCategory.EMOTIONAL_TRIGGERS]: 0
    };

    // Count categories from user's explored categories
    userProgress.stats.categoriesExplored.forEach(category => {
      categoryCount[category]++;
    });

    // Sort by preference and return top categories
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category as TheoryCategory);
  }

  /**
   * Get tags related to a theory category
   */
  private getCategoryRelatedTags(category: TheoryCategory): string[] {
    const categoryTagMap: Record<TheoryCategory, string[]> = {
      [TheoryCategory.COGNITIVE_BIASES]: ['psychology', 'decision-making', 'bias', 'thinking'],
      [TheoryCategory.PERSUASION_PRINCIPLES]: ['persuasion', 'influence', 'marketing', 'conversion'],
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: ['economics', 'behavior', 'pricing', 'incentives'],
      [TheoryCategory.UX_PSYCHOLOGY]: ['ux', 'design', 'user-experience', 'interface'],
      [TheoryCategory.EMOTIONAL_TRIGGERS]: ['emotions', 'engagement', 'motivation', 'psychology']
    };

    return categoryTagMap[category] || [];
  }

  /**
   * Truncate description to specified length
   */
  private truncateDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
  }
}

// Singleton instance
let crossLinkingServiceInstance: CrossLinkingService | null = null;

export function getCrossLinkingService(): CrossLinkingService {
  if (!crossLinkingServiceInstance) {
    crossLinkingServiceInstance = new CrossLinkingService();
  }
  return crossLinkingServiceInstance;
}
