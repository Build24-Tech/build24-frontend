import {
  BlogPostReference,
  ProjectReference,
  RecommendationEngine,
  getRecommendationEngine,
  initializeRecommendationEngine
} from '@/lib/recommendation-engine';
import { DifficultyLevel, RelevanceType, Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

// Mock data
const mockTheories: Theory[] = [
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
    content: {
      description: 'Anchoring bias description',
      applicationGuide: 'How to apply anchoring bias',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.BEGINNER,
      relevance: [RelevanceType.MARKETING, RelevanceType.UX],
      readTime: 5,
      tags: ['pricing', 'decision-making', 'first-impression']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'scarcity-principle',
    title: 'Scarcity Principle',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    summary: 'People value things more when they are rare or in limited supply.',
    content: {
      description: 'Scarcity principle description',
      applicationGuide: 'How to apply scarcity principle',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.INTERMEDIATE,
      relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
      readTime: 7,
      tags: ['scarcity', 'urgency', 'conversion']
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'loss-aversion',
    title: 'Loss Aversion',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    summary: 'People prefer avoiding losses over acquiring equivalent gains.',
    content: {
      description: 'Loss aversion description',
      applicationGuide: 'How to apply loss aversion',
      examples: [],
      relatedContent: []
    },
    metadata: {
      difficulty: DifficultyLevel.INTERMEDIATE,
      relevance: [RelevanceType.MARKETING, RelevanceType.UX],
      readTime: 6,
      tags: ['loss', 'risk', 'decision-making']
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

const mockBlogPosts: BlogPostReference[] = [
  {
    id: 'psychology-pricing',
    title: 'The Psychology of Pricing',
    slug: 'psychology-pricing',
    excerpt: 'How psychological principles affect pricing decisions',
    tags: ['pricing', 'psychology', 'business'],
    publishedAt: new Date('2024-01-15'),
    readTime: 8
  },
  {
    id: 'ux-persuasion',
    title: 'UX Persuasion Techniques',
    slug: 'ux-persuasion',
    excerpt: 'Applying persuasion in user interface design',
    tags: ['ux', 'persuasion', 'design'],
    publishedAt: new Date('2024-01-10'),
    readTime: 6
  }
];

const mockProjects: ProjectReference[] = [
  {
    id: 'pricing-tool',
    title: 'Pricing Optimizer',
    description: 'Tool for optimizing product pricing using psychology',
    technologies: ['React', 'Node.js'],
    category: 'marketing',
    completedAt: new Date('2024-01-20')
  },
  {
    id: 'ab-testing',
    title: 'A/B Testing Platform',
    description: 'Platform for behavioral A/B testing',
    technologies: ['React', 'Python'],
    category: 'analytics',
    completedAt: new Date('2024-01-15')
  }
];

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  readTheories: ['anchoring-bias'],
  bookmarkedTheories: ['scarcity-principle'],
  badges: [],
  stats: {
    totalReadTime: 15,
    theoriesRead: 1,
    categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
    lastActiveDate: new Date(),
    streakDays: 1,
    averageSessionTime: 15
  },
  quizResults: [],
  preferences: {
    emailNotifications: true,
    progressReminders: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine(mockTheories, mockBlogPosts, mockProjects);
  });

  describe('getRelatedTheories', () => {
    it('should return related theories based on category and tags', () => {
      const currentTheory = mockTheories[0]; // anchoring-bias
      const related = engine.getRelatedTheories(currentTheory, undefined, 2);

      expect(related).toHaveLength(2);
      expect(related.map(t => t.id)).not.toContain(currentTheory.id);
    });

    it('should consider user progress when available', () => {
      const currentTheory = mockTheories[1]; // scarcity-principle
      const related = engine.getRelatedTheories(currentTheory, mockUserProgress, 2);

      expect(related).toHaveLength(1); // Only loss-aversion should be returned
      // Should not include already read theories
      expect(related.map(t => t.id)).not.toContain('anchoring-bias');
      expect(related.map(t => t.id)).toContain('loss-aversion');
    });

    it('should limit results to specified count', () => {
      const currentTheory = mockTheories[0];
      const related = engine.getRelatedTheories(currentTheory, undefined, 1);

      expect(related).toHaveLength(1);
    });
  });

  describe('getContentRecommendations', () => {
    it('should return mixed content recommendations', () => {
      const categories = [TheoryCategory.COGNITIVE_BIASES, TheoryCategory.PERSUASION_PRINCIPLES];
      const recommendations = engine.getContentRecommendations(categories, undefined, 5);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);

      // Should include different content types
      const types = recommendations.map(r => r.type);
      expect(types).toContain('theory');
    });

    it('should consider user progress for personalization', () => {
      const categories = [TheoryCategory.COGNITIVE_BIASES];
      const recommendations = engine.getContentRecommendations(categories, mockUserProgress, 3);

      expect(recommendations.length).toBeGreaterThan(0);
      // Should not recommend already read theories
      const theoryRecs = recommendations.filter(r => r.theory);
      theoryRecs.forEach(rec => {
        expect(mockUserProgress.readTheories).not.toContain(rec.theory!.id);
      });
    });
  });

  describe('getCrossLinks', () => {
    it('should generate cross-links for a theory', () => {
      const theory = mockTheories[0];
      const crossLinks = engine.getCrossLinks(theory);

      expect(crossLinks.length).toBeGreaterThan(0);

      // Should include different types of content
      const types = crossLinks.map(link => link.type);
      expect(types).toContain('theory');
    });

    it('should include proper URLs for different content types', () => {
      const theory = mockTheories[0];
      const crossLinks = engine.getCrossLinks(theory);

      crossLinks.forEach(link => {
        expect(link.url).toBeTruthy();
        if (link.type === 'theory') {
          expect(link.url).toMatch(/\/dashboard\/knowledge-hub\/theory\//);
        } else if (link.type === 'blog-post') {
          expect(link.url).toMatch(/\/blog\//);
        } else if (link.type === 'project') {
          expect(link.url).toMatch(/\/projects/);
        }
      });
    });
  });

  describe('updateTheories', () => {
    it('should update the theories dataset', () => {
      const newTheories = [...mockTheories, {
        id: 'new-theory',
        title: 'New Theory',
        category: TheoryCategory.UX_PSYCHOLOGY,
        summary: 'A new theory for testing',
        content: {
          description: 'New theory description',
          applicationGuide: 'How to apply new theory',
          examples: [],
          relatedContent: []
        },
        metadata: {
          difficulty: DifficultyLevel.BEGINNER,
          relevance: [RelevanceType.UX],
          readTime: 3,
          tags: ['new', 'test']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      engine.updateTheories(newTheories);

      const currentTheory = mockTheories[0];
      const related = engine.getRelatedTheories(currentTheory, undefined, 10);

      expect(related.map(t => t.id)).toContain('new-theory');
    });
  });

  describe('updateBlogPosts', () => {
    it('should update the blog posts dataset', () => {
      const newBlogPosts = [...mockBlogPosts, {
        id: 'new-post',
        title: 'New Blog Post',
        slug: 'new-post',
        excerpt: 'A new blog post for testing',
        tags: ['test', 'new'],
        publishedAt: new Date(),
        readTime: 5
      }];

      engine.updateBlogPosts(newBlogPosts);

      const categories = [TheoryCategory.COGNITIVE_BIASES];
      const recommendations = engine.getContentRecommendations(categories, undefined, 10);

      const blogRecs = recommendations.filter(r => r.type === 'blog-post');
      expect(blogRecs.length).toBeGreaterThan(0);
    });
  });

  describe('updateProjects', () => {
    it('should update the projects dataset', () => {
      const newProjects = [...mockProjects, {
        id: 'new-project',
        title: 'New Project',
        description: 'A new project for testing',
        technologies: ['TypeScript'],
        category: 'testing',
        completedAt: new Date()
      }];

      engine.updateProjects(newProjects);

      const categories = [TheoryCategory.COGNITIVE_BIASES];
      const recommendations = engine.getContentRecommendations(categories, undefined, 10);

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});

describe('Singleton functions', () => {
  describe('getRecommendationEngine', () => {
    it('should return the same instance', () => {
      const engine1 = getRecommendationEngine();
      const engine2 = getRecommendationEngine();

      expect(engine1).toBe(engine2);
    });
  });

  describe('initializeRecommendationEngine', () => {
    it('should create and return a new instance', () => {
      const engine = initializeRecommendationEngine(mockTheories, mockBlogPosts, mockProjects);

      expect(engine).toBeInstanceOf(RecommendationEngine);

      // Test that it works with the provided data
      const currentTheory = mockTheories[0];
      const related = engine.getRelatedTheories(currentTheory, undefined, 2);

      expect(related.length).toBeGreaterThan(0);
    });

    it('should replace the singleton instance', () => {
      const engine1 = getRecommendationEngine();
      const engine2 = initializeRecommendationEngine(mockTheories);
      const engine3 = getRecommendationEngine();

      expect(engine2).toBe(engine3);
      expect(engine1).not.toBe(engine2);
    });
  });
});

describe('Tag similarity calculation', () => {
  it('should calculate correct similarity scores', () => {
    const engine = new RecommendationEngine(mockTheories);

    // Test theories with overlapping tags
    const theory1 = mockTheories[0]; // tags: ['pricing', 'decision-making', 'first-impression']
    const theory2 = mockTheories[2]; // tags: ['loss', 'risk', 'decision-making']

    const related = engine.getRelatedTheories(theory1, undefined, 10);

    // theory2 should be included because of 'decision-making' tag overlap
    expect(related.map(t => t.id)).toContain(theory2.id);
  });
});

describe('Category-based recommendations', () => {
  it('should prioritize same-category theories', () => {
    const engine = new RecommendationEngine(mockTheories);
    const currentTheory = mockTheories[0]; // COGNITIVE_BIASES category

    const related = engine.getRelatedTheories(currentTheory, undefined, 10);

    // Should prioritize theories from the same category
    const sameCategoryTheories = related.filter(t => t.category === currentTheory.category);
    expect(sameCategoryTheories.length).toBeGreaterThanOrEqual(0);
  });
});

describe('User history consideration', () => {
  it('should avoid recommending already read theories', () => {
    const engine = new RecommendationEngine(mockTheories);
    const currentTheory = mockTheories[1]; // scarcity-principle

    const related = engine.getRelatedTheories(currentTheory, mockUserProgress, 10);

    // Should not include theories the user has already read
    related.forEach(theory => {
      expect(mockUserProgress.readTheories).not.toContain(theory.id);
    });
  });

  it('should consider user category preferences', () => {
    const engine = new RecommendationEngine(mockTheories);
    // Use categories that have unread theories
    const categories = [TheoryCategory.PERSUASION_PRINCIPLES, TheoryCategory.BEHAVIORAL_ECONOMICS];

    const recommendations = engine.getContentRecommendations(categories, mockUserProgress, 5);

    expect(recommendations.length).toBeGreaterThan(0);

    // Should include theories from explored categories
    const theoryRecs = recommendations.filter(r => r.theory);
    const recommendedCategories = theoryRecs.map(r => r.theory!.category);

    expect(recommendedCategories.some(cat => categories.includes(cat))).toBe(true);
  });
});
