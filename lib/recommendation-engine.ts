import { LaunchPhase, ProjectData, Recommendation, Resource, Risk, UserProgress as LaunchUserProgress } from '@/types/launch-essentials';

export class RecommendationEngine {
  static getNextSteps(userProgress: LaunchUserProgress): Recommendation[] {
    if (!userProgress || !userProgress.phases) {
      return [{
        id: 'start-validation',
        title: 'Start Product Validation',
        description: 'Begin validating your product idea with market research',
        priority: 'high',
        phase: 'validation',
        estimatedTime: '1-2 hours',
        category: 'getting-started'
      }];
    }

    const recommendations: Recommendation[] = [];

    // Check current phase progress
    const currentPhase = userProgress.currentPhase;
    const currentPhaseProgress = userProgress.phases[currentPhase];

    if (currentPhaseProgress && currentPhaseProgress.completionPercentage < 100) {
      recommendations.push({
        id: `complete-${currentPhase}`,
        title: `Complete ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`,
        description: `Finish the ${currentPhase} phase to move forward`,
        priority: 'high',
        phase: currentPhase,
        estimatedTime: '2-4 hours',
        category: 'immediate'
      });
    }

    // Check for next phase
    const phaseOrder: LaunchPhase[] = [
      'validation', 'definition', 'technical', 'marketing',
      'operations', 'financial', 'risk', 'optimization'
    ];

    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex < phaseOrder.length - 1 && currentPhaseProgress?.completionPercentage === 100) {
      const nextPhase = phaseOrder[currentIndex + 1];
      recommendations.push({
        id: `start-${nextPhase}`,
        title: `Start ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)} Phase`,
        description: `Begin working on the ${nextPhase} phase`,
        priority: 'high',
        phase: nextPhase,
        estimatedTime: '3-5 hours',
        category: 'phase-transition'
      });
    }

    return recommendations;
  }

  static suggestResources(context: any, limit: number = 10): Resource[] {
    if (!context || !context.phase) {
      return [];
    }

    const resources: Resource[] = [
      {
        id: 'market-research-guide',
        title: 'Market Research for Tech Products',
        type: 'guide',
        category: 'validation',
        relevanceScore: 0.9
      },
      {
        id: 'developer-survey-tools',
        title: 'Developer Survey Tools',
        type: 'tool',
        category: 'validation',
        relevanceScore: 0.8
      }
    ];

    return resources
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  static identifyRisks(projectData: ProjectData, userProgress: LaunchUserProgress): Risk[] {
    if (!projectData || !userProgress) {
      return [];
    }

    const risks: Risk[] = [];

    // Check validation completion
    if (userProgress.phases?.validation?.completionPercentage < 100) {
      risks.push({
        id: 'incomplete-validation',
        title: 'Incomplete Market Validation',
        description: 'Validation phase is not complete, which may lead to building the wrong product',
        type: 'validation',
        severity: 'medium',
        category: 'validation',
        impact: 'Product-market fit issues',
        probability: 3,
        mitigation: 'Complete market validation before proceeding',
        status: 'identified',
        createdAt: new Date()
      });
    }

    // Check for technical complexity
    if (projectData.industry === 'Technology') {
      risks.push({
        id: 'technical-complexity',
        title: 'High Technical Complexity',
        description: 'Technology projects often face technical challenges',
        type: 'technical',
        severity: 'high',
        category: 'technical',
        impact: 'Delayed launch',
        probability: 4,
        mitigation: 'Plan for technical challenges and have contingencies',
        status: 'identified',
        createdAt: new Date()
      });
    }

    return risks.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact));
  }

  static getPersonalizedRecommendations(
    userProgress: LaunchUserProgress,
    projectData: ProjectData,
    userBehavior: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (userBehavior?.strugglingAreas?.includes('financial-planning')) {
      recommendations.push({
        id: 'financial-planning-help',
        title: 'Financial Planning Assistance',
        description: 'You seem to be struggling with financial planning. Here are some resources to help.',
        priority: 'medium',
        phase: 'financial',
        category: 'personalized'
      });
    }

    if (userBehavior?.averageTimePerStep > 240) { // 4 hours
      recommendations.push({
        id: 'time-management',
        title: 'Time Management Tips',
        description: 'Consider breaking down tasks into smaller chunks',
        priority: 'low',
        phase: userProgress.currentPhase,
        category: 'productivity'
      });
    }

    return recommendations;
  }

  static getContentSuggestions(context: any): Array<{ id: string; title: string; type: string; relevanceScore: number }> {
    if (!context.userInput) {
      return [];
    }

    const suggestions = [];

    if (context.userInput.includes('mobile app')) {
      suggestions.push({
        id: 'mobile-app-market-research',
        title: 'Mobile App Market Research Template',
        type: 'template',
        relevanceScore: 0.9
      });
    }

    if (context.userInput.includes('developers')) {
      suggestions.push({
        id: 'developer-tools-analysis',
        title: 'Developer Tools Market Analysis',
        type: 'example',
        relevanceScore: 0.8
      });
    }

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  static calculateRecommendationScore(recommendation: Recommendation, context: any): number {
    let score = 50; // Base score

    // Priority weighting
    if (recommendation.priority === 'high') score += 30;
    else if (recommendation.priority === 'medium') score += 15;

    // Phase relevance
    if (recommendation.phase === context.currentPhase) score += 20;

    // Urgency
    if (context.urgentAreas?.includes(recommendation.phase)) score += 25;

    return Math.min(score, 100);
  }
}

// Knowledge Hub Recommendation Engine
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

export class KnowledgeHubRecommendationEngine {
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
      .filter(theory => {
        // Exclude current theory
        if (theory.id === currentTheory.id) return false;

        // Exclude already read theories if user progress is available
        if (userProgress && userProgress.readTheories.includes(theory.id)) return false;

        return true;
      })
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
    const union = Array.from(new Set([...tags1, ...tags2]));

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
let knowledgeHubEngineInstance: KnowledgeHubRecommendationEngine | null = null;

export function getKnowledgeHubRecommendationEngine(): KnowledgeHubRecommendationEngine {
  if (!knowledgeHubEngineInstance) {
    knowledgeHubEngineInstance = new KnowledgeHubRecommendationEngine();
  }
  return knowledgeHubEngineInstance;
}

// Helper functions for external use
export function initializeKnowledgeHubRecommendationEngine(
  theories: Theory[],
  blogPosts: BlogPostReference[] = [],
  projects: ProjectReference[] = []
): KnowledgeHubRecommendationEngine {
  knowledgeHubEngineInstance = new KnowledgeHubRecommendationEngine(theories, blogPosts, projects);
  return knowledgeHubEngineInstance;
}
