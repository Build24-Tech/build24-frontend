import { RelatedContent, Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

// Recommendation types
export interface RecommendationScore {
  theoryId: string;
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationReason {
  type: 'category_match' | 'tag_similarity' | 'user_history' | 'popularity' | 'difficulty_progression';
  weight: number;
  description: string;
}

export interface ContentRecommendation {
  theory?: Theory;
  blogPost?: BlogPostReference;
  project?: ProjectReference;
  score: number;
  type: 'theory' | 'blog-post' | 'project';
}

export interface BlogPostReference {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  publishedAt: Date;
  readTime: number;
}

export interface ProjectReference {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  completedAt: Date;
  githubUrl?: string;
  liveUrl?: string;
}

// Recommendation weights
const RECOMMENDATION_WEIGHTS = {
  CATEGORY_MATCH: 0.3,
  TAG_SIMILARITY: 0.25,
  USER_HISTORY: 0.2,
  POPULARITY: 0.15,
  DIFFICULTY_PROGRESSION: 0.1
} as const;

export class RecommendationEngine {
  private theories: Theory[] = [];
  private blogPosts: BlogPostReference[] = [];
  private projects: ProjectReference[] = [];

  constructor(
    theories: Theory[] = [],
    blogPosts: BlogPostReference[] = [],
    projects: ProjectReference[] = []
  ) {
    this.theories = theories;
    this.blogPosts = blogPosts;
    this.projects = projects;
  }

  /**
   * Get related theories for a given theory
   */
  getRelatedTheories(
    currentTheory: Theory,
    userProgress?: UserProgress,
    limit: number = 5
  ): Theory[] {
    const scores = this.theories
      .filter(theory => theory.id !== currentTheory.id)
      .map(theory => ({
        theory,
        score: this.calculateTheoryRelatedness(currentTheory, theory, userProgress)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores.map(item => item.theory);
  }

  /**
   * Get content recommendations based on theory categories
   */
  getContentRecommendations(
    categories: TheoryCategory[],
    userProgress?: UserProgress,
    limit: number = 10
  ): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];

    // Get theory recommendations
    const theoryRecs = this.getTheoryRecommendationsByCategory(categories, userProgress, Math.ceil(limit * 0.4));
    recommendations.push(...theoryRecs);

    // Get blog post recommendations
    const blogRecs = this.getBlogPostRecommendations(categories, Math.ceil(limit * 0.4));
    recommendations.push(...blogRecs);

    // Get project recommendations
    const projectRecs = this.getProjectRecommendations(categories, Math.ceil(limit * 0.2));
    recommendations.push(...projectRecs);

    // Sort by score and return top results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get cross-links for a specific theory
   */
  getCrossLinks(theory: Theory, userProgress?: UserProgress): RelatedContent[] {
    const crossLinks: RelatedContent[] = [];

    // Add related theories
    const relatedTheories = this.getRelatedTheories(theory, userProgress, 3);
    relatedTheories.forEach(relatedTheory => {
      crossLinks.push({
        id: relatedTheory.id,
        title: relatedTheory.title,
        type: 'theory',
        url: `/dashboard/knowledge-hub/theory/${relatedTheory.id}`,
        description: relatedTheory.summary
      });
    });

    // Add related blog posts
    const relatedBlogPosts = this.getBlogPostsByTags(theory.metadata.tags, 2);
    relatedBlogPosts.forEach(blogPost => {
      crossLinks.push({
        id: blogPost.id,
        title: blogPost.title,
        type: 'blog-post',
        url: `/blog/${blogPost.slug}`,
        description: blogPost.excerpt
      });
    });

    // Add related projects
    const relatedProjects = this.getProjectsByCategory(theory.category, 2);
    relatedProjects.forEach(project => {
      crossLinks.push({
        id: project.id,
        title: project.title,
        type: 'project',
        url: `/projects#${project.id}`,
        description: project.description
      });
    });

    return crossLinks;
  }

  /**
   * Calculate relatedness score between two theories
   */
  private calculateTheoryRelatedness(
    theory1: Theory,
    theory2: Theory,
    userProgress?: UserProgress
  ): number {
    let score = 0;

    // Category match
    if (theory1.category === theory2.category) {
      score += RECOMMENDATION_WEIGHTS.CATEGORY_MATCH;
    }

    // Tag similarity
    const tagSimilarity = this.calculateTagSimilarity(
      theory1.metadata.tags,
      theory2.metadata.tags
    );
    score += tagSimilarity * RECOMMENDATION_WEIGHTS.TAG_SIMILARITY;

    // User history consideration
    if (userProgress) {
      const userHistoryScore = this.calculateUserHistoryScore(theory2, userProgress);
      score += userHistoryScore * RECOMMENDATION_WEIGHTS.USER_HISTORY;
    }

    // Difficulty progression
    const difficultyScore = this.calculateDifficultyProgression(theory1, theory2);
    score += difficultyScore * RECOMMENDATION_WEIGHTS.DIFFICULTY_PROGRESSION;

    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Calculate tag similarity between two sets of tags
   */
  private calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) return 0;

    const intersection = tags1.filter(tag => tags2.includes(tag));
    const union = [...new Set([...tags1, ...tags2])];

    return intersection.length / union.length;
  }

  /**
   * Calculate user history score for recommendations
   */
  private calculateUserHistoryScore(theory: Theory, userProgress: UserProgress): number {
    // Prefer theories in categories the user has explored
    const categoryExplored = userProgress.stats.categoriesExplored.includes(theory.category);
    if (categoryExplored) return 0.7;

    // Avoid theories the user has already read
    if (userProgress.readTheories.includes(theory.id)) return 0;

    return 0.5; // Neutral score for unexplored content
  }

  /**
   * Calculate difficulty progression score
   */
  private calculateDifficultyProgression(theory1: Theory, theory2: Theory): number {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const diff1 = difficultyOrder[theory1.metadata.difficulty];
    const diff2 = difficultyOrder[theory2.metadata.difficulty];

    // Prefer theories of similar or slightly higher difficulty
    const diffDelta = diff2 - diff1;
    if (diffDelta === 0) return 1; // Same difficulty
    if (diffDelta === 1) return 0.8; // One level higher
    if (diffDelta === -1) return 0.6; // One level lower
    return 0.3; // Significant difference
  }

  /**
   * Get theory recommendations by category
   */
  private getTheoryRecommendationsByCategory(
    categories: TheoryCategory[],
    userProgress?: UserProgress,
    limit: number = 5
  ): ContentRecommendation[] {
    const categoryTheories = this.theories.filter(theory =>
      categories.includes(theory.category) &&
      (!userProgress || !userProgress.readTheories.includes(theory.id))
    );

    return categoryTheories
      .slice(0, limit)
      .map(theory => ({
        theory,
        score: 0.8, // High base score for category matches
        type: 'theory' as const
      }));
  }

  /**
   * Get blog post recommendations based on categories
   */
  private getBlogPostRecommendations(
    categories: TheoryCategory[],
    limit: number = 3
  ): ContentRecommendation[] {
    // Map theory categories to blog post tags
    const categoryTagMap: Record<TheoryCategory, string[]> = {
      [TheoryCategory.COGNITIVE_BIASES]: ['psychology', 'decision-making', 'user-behavior'],
      [TheoryCategory.PERSUASION_PRINCIPLES]: ['marketing', 'conversion', 'persuasion'],
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: ['economics', 'pricing', 'user-behavior'],
      [TheoryCategory.UX_PSYCHOLOGY]: ['ux', 'design', 'user-experience'],
      [TheoryCategory.EMOTIONAL_TRIGGERS]: ['emotions', 'engagement', 'user-psychology']
    };

    const relevantTags = categories.flatMap(category => categoryTagMap[category] || []);

    const matchingBlogPosts = this.blogPosts.filter(post =>
      post.tags.some(tag => relevantTags.includes(tag))
    );

    return matchingBlogPosts
      .slice(0, limit)
      .map(blogPost => ({
        blogPost,
        score: 0.6,
        type: 'blog-post' as const
      }));
  }

  /**
   * Get project recommendations based on categories
   */
  private getProjectRecommendations(
    categories: TheoryCategory[],
    limit: number = 2
  ): ContentRecommendation[] {
    // Map theory categories to project categories
    const categoryProjectMap: Record<TheoryCategory, string[]> = {
      [TheoryCategory.COGNITIVE_BIASES]: ['marketing', 'analytics'],
      [TheoryCategory.PERSUASION_PRINCIPLES]: ['marketing', 'sales'],
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: ['fintech', 'ecommerce'],
      [TheoryCategory.UX_PSYCHOLOGY]: ['design', 'frontend'],
      [TheoryCategory.EMOTIONAL_TRIGGERS]: ['social', 'engagement']
    };

    const relevantProjectCategories = categories.flatMap(category =>
      categoryProjectMap[category] || []
    );

    const matchingProjects = this.projects.filter(project =>
      relevantProjectCategories.includes(project.category)
    );

    return matchingProjects
      .slice(0, limit)
      .map(project => ({
        project,
        score: 0.5,
        type: 'project' as const
      }));
  }

  /**
   * Get blog posts by tags
   */
  private getBlogPostsByTags(tags: string[], limit: number = 3): BlogPostReference[] {
    return this.blogPosts
      .filter(post => post.tags.some(tag => tags.includes(tag)))
      .slice(0, limit);
  }

  /**
   * Get projects by category mapping
   */
  private getProjectsByCategory(category: TheoryCategory, limit: number = 2): ProjectReference[] {
    const categoryProjectMap: Record<TheoryCategory, string[]> = {
      [TheoryCategory.COGNITIVE_BIASES]: ['marketing', 'analytics'],
      [TheoryCategory.PERSUASION_PRINCIPLES]: ['marketing', 'sales'],
      [TheoryCategory.BEHAVIORAL_ECONOMICS]: ['fintech', 'ecommerce'],
      [TheoryCategory.UX_PSYCHOLOGY]: ['design', 'frontend'],
      [TheoryCategory.EMOTIONAL_TRIGGERS]: ['social', 'engagement']
    };

    const relevantCategories = categoryProjectMap[category] || [];

    return this.projects
      .filter(project => relevantCategories.includes(project.category))
      .slice(0, limit);
  }

  /**
   * Update data sources
   */
  updateTheories(theories: Theory[]): void {
    this.theories = theories;
  }

  updateBlogPosts(blogPosts: BlogPostReference[]): void {
    this.blogPosts = blogPosts;
  }

  updateProjects(projects: ProjectReference[]): void {
    this.projects = projects;
  }
}

// Singleton instance
let recommendationEngineInstance: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngineInstance) {
    recommendationEngineInstance = new RecommendationEngine();
  }
  return recommendationEngineInstance;
}

// Helper functions for external use
export function initializeRecommendationEngine(
  theories: Theory[],
  blogPosts: BlogPostReference[] = [],
  projects: ProjectReference[] = []
): RecommendationEngine {
  recommendationEngineInstance = new RecommendationEngine(theories, blogPosts, projects);
  return recommendationEngineInstance;
}
