import { CrossLinkingService, getCrossLinkingService } from '@/lib/cross-linking-service';
import { DifficultyLevel, RelevanceType, Theory, TheoryCategory, UserProgress } from '@/types/knowledge-hub';

// Mock the recommendation engine
const mockGetRelatedTheories = jest.fn();
const mockGetContentRecommendations = jest.fn();
const mockUpdateTheories = jest.fn();
const mockUpdateBlogPosts = jest.fn();
const mockUpdateProjects = jest.fn();

jest.mock('@/lib/recommendation-engine', () => ({
  getRecommendationEngine: jest.fn(() => ({
    getRelatedTheories: mockGetRelatedTheories,
    getContentRecommendations: mockGetContentRecommendations,
    updateTheories: mockUpdateTheories,
    updateBlogPosts: mockUpdateBlogPosts,
    updateProjects: mockUpdateProjects
  }))
}));

const mockTheory: Theory = {
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
};

const mockUserProgress: UserProgress = {
  userId: 'test-user',
  readTheories: ['some-theory'],
  bookmarkedTheories: ['another-theory'],
  badges: [],
  stats: {
    totalReadTime: 30,
    theoriesRead: 2,
    categoriesExplored: [TheoryCategory.COGNITIVE_BIASES, TheoryCategory.PERSUASION_PRINCIPLES],
    lastActiveDate: new Date(),
    streakDays: 3,
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

const mockRelatedTheories: Theory[] = [
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
      relevance: [RelevanceType.MARKETING],
      readTime: 7,
      tags: ['scarcity', 'urgency']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('CrossLinkingService', () => {
  let service: CrossLinkingService;


  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set up default mock return values
    mockGetRelatedTheories.mockReturnValue(mockRelatedTheories);
    mockGetContentRecommendations.mockReturnValue([]);
    mockUpdateTheories.mockReturnValue(undefined);
    mockUpdateBlogPosts.mockReturnValue(undefined);
    mockUpdateProjects.mockReturnValue(undefined);

    service = new CrossLinkingService();
  });

  describe('getCrossLinksForTheory', () => {
    beforeEach(() => {
      mockGetRelatedTheories.mockReturnValue(mockRelatedTheories);
    });

    it('should generate cross-links for a theory', async () => {
      const crossLinks = await service.getCrossLinksForTheory(mockTheory);

      expect(crossLinks).toBeDefined();
      expect(Array.isArray(crossLinks)).toBe(true);
    });

    it('should include related theories in cross-links', async () => {
      const crossLinks = await service.getCrossLinksForTheory(mockTheory);

      const theoryLinks = crossLinks.filter(link => link.type === 'theory');
      expect(theoryLinks.length).toBeGreaterThan(0);

      theoryLinks.forEach(link => {
        expect(link.url).toMatch(/\/dashboard\/knowledge-hub\/theory\//);
        expect(link.title).toBeTruthy();
        expect(link.description).toBeTruthy();
      });
    });

    it('should include blog post links', async () => {
      const crossLinks = await service.getCrossLinksForTheory(mockTheory);

      const blogLinks = crossLinks.filter(link => link.type === 'blog-post');
      blogLinks.forEach(link => {
        expect(link.url).toMatch(/\/blog\//);
        expect(link.title).toBeTruthy();
      });
    });

    it('should include project links', async () => {
      const crossLinks = await service.getCrossLinksForTheory(mockTheory);

      const projectLinks = crossLinks.filter(link => link.type === 'project');
      projectLinks.forEach(link => {
        expect(link.url).toMatch(/\/projects/);
        expect(link.title).toBeTruthy();
      });
    });

    it('should respect maxItems limits', async () => {
      const options = {
        maxRelatedTheories: 1,
        maxBlogPosts: 1,
        maxProjects: 1
      };

      const crossLinks = await service.getCrossLinksForTheory(mockTheory, undefined, options);

      const theoryLinks = crossLinks.filter(link => link.type === 'theory');
      const blogLinks = crossLinks.filter(link => link.type === 'blog-post');
      const projectLinks = crossLinks.filter(link => link.type === 'project');

      expect(theoryLinks.length).toBeLessThanOrEqual(1);
      expect(blogLinks.length).toBeLessThanOrEqual(1);
      expect(projectLinks.length).toBeLessThanOrEqual(1);
    });

    it('should handle user progress when provided', async () => {
      await service.getCrossLinksForTheory(mockTheory, mockUserProgress);

      expect(mockGetRelatedTheories).toHaveBeenCalledWith(
        mockTheory,
        mockUserProgress,
        expect.any(Number)
      );
    });

    it('should handle errors gracefully', async () => {
      mockGetRelatedTheories.mockImplementation(() => {
        throw new Error('Test error');
      });

      const crossLinks = await service.getCrossLinksForTheory(mockTheory);

      expect(crossLinks).toEqual([]);
    });

    it('should truncate long descriptions', async () => {
      const longSummaryTheory = {
        ...mockRelatedTheories[0],
        summary: 'This is a very long summary that should be truncated because it exceeds the maximum length limit that we have set for descriptions in the cross-linking system to ensure good user experience.'
      };

      mockGetRelatedTheories.mockReturnValue([longSummaryTheory]);

      const crossLinks = await service.getCrossLinksForTheory(mockTheory);
      const theoryLink = crossLinks.find(link => link.type === 'theory');

      if (theoryLink && theoryLink.description) {
        expect(theoryLink.description.length).toBeLessThanOrEqual(103); // 100 + '...'
        if (theoryLink.description.length === 103) {
          expect(theoryLink.description).toEndWith('...');
        }
      }
    });
  });

  describe('getPersonalizedRecommendations', () => {
    beforeEach(() => {
      mockGetContentRecommendations.mockReturnValue([
        {
          theory: mockRelatedTheories[0],
          score: 0.8,
          type: 'theory'
        }
      ]);
    });

    it('should generate personalized recommendations', async () => {
      const recommendations = await service.getPersonalizedRecommendations(mockUserProgress);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(mockGetContentRecommendations).toHaveBeenCalled();
    });

    it('should analyze user preferences', async () => {
      await service.getPersonalizedRecommendations(mockUserProgress, 5);

      expect(mockGetContentRecommendations).toHaveBeenCalledWith(
        expect.arrayContaining([
          TheoryCategory.COGNITIVE_BIASES,
          TheoryCategory.PERSUASION_PRINCIPLES
        ]),
        mockUserProgress,
        5
      );
    });

    it('should handle errors gracefully', async () => {
      mockGetContentRecommendations.mockImplementation(() => {
        throw new Error('Test error');
      });

      const recommendations = await service.getPersonalizedRecommendations(mockUserProgress);

      expect(recommendations).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      await service.getPersonalizedRecommendations(mockUserProgress, 3);

      expect(mockGetContentRecommendations).toHaveBeenCalledWith(
        expect.any(Array),
        mockUserProgress,
        3
      );
    });
  });

  describe('getNavigationPaths', () => {
    it('should return navigation paths between theories', () => {
      const paths = service.getNavigationPaths('theory1', 'theory2');

      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);

      paths.forEach(path => {
        expect(path.from).toBeTruthy();
        expect(path.to).toBeTruthy();
        expect(path.type).toBeTruthy();
        expect(path.relationship).toBeTruthy();
      });
    });

    it('should include proper path structure', () => {
      const paths = service.getNavigationPaths('anchoring-bias', 'scarcity-principle');

      expect(paths[0]).toEqual({
        from: 'anchoring-bias',
        to: 'scarcity-principle',
        type: 'theory',
        relationship: 'related'
      });
    });
  });

  describe('getTrendingContent', () => {
    beforeEach(() => {
      mockGetContentRecommendations.mockReturnValue([
        {
          theory: mockRelatedTheories[0],
          score: 0.9,
          type: 'theory'
        }
      ]);
    });

    it('should get trending content', async () => {
      const trending = await service.getTrendingContent();

      expect(trending).toBeDefined();
      expect(Array.isArray(trending)).toBe(true);
      expect(mockGetContentRecommendations).toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      await service.getTrendingContent(3);

      expect(mockGetContentRecommendations).toHaveBeenCalledWith(
        expect.any(Array),
        undefined,
        3
      );
    });

    it('should handle errors gracefully', async () => {
      mockGetContentRecommendations.mockImplementation(() => {
        throw new Error('Test error');
      });

      const trending = await service.getTrendingContent();

      expect(trending).toEqual([]);
    });
  });

  describe('updateRecommendationData', () => {
    it('should update theories data', async () => {
      const theories = [mockTheory];
      await service.updateRecommendationData(theories);

      expect(mockUpdateTheories).toHaveBeenCalledWith(theories);
    });

    it('should update blog posts when provided', async () => {
      const theories = [mockTheory];
      const blogPosts = [{
        id: 'test-post',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        tags: ['test'],
        publishedAt: new Date(),
        readTime: 5
      }];

      await service.updateRecommendationData(theories, blogPosts);

      expect(mockUpdateBlogPosts).toHaveBeenCalledWith(blogPosts);
    });

    it('should update projects when provided', async () => {
      const theories = [mockTheory];
      const projects = [{
        id: 'test-project',
        title: 'Test Project',
        description: 'Test description',
        technologies: ['React'],
        category: 'test',
        completedAt: new Date()
      }];

      await service.updateRecommendationData(theories, undefined, projects);

      expect(mockUpdateProjects).toHaveBeenCalledWith(projects);
    });

    it('should handle errors gracefully', async () => {
      mockUpdateTheories.mockImplementation(() => {
        throw new Error('Test error');
      });

      // Should not throw
      await expect(service.updateRecommendationData([mockTheory])).resolves.toBeUndefined();
    });
  });
});

describe('getCrossLinkingService singleton', () => {
  it('should return the same instance', () => {
    const service1 = getCrossLinkingService();
    const service2 = getCrossLinkingService();

    expect(service1).toBe(service2);
  });

  it('should return a CrossLinkingService instance', () => {
    const service = getCrossLinkingService();

    expect(service).toBeInstanceOf(CrossLinkingService);
  });
});

describe('Category-related tag mapping', () => {
  let service: CrossLinkingService;

  beforeEach(() => {
    service = new CrossLinkingService();
  });

  it('should map cognitive biases to appropriate tags', async () => {
    const cognitiveTheory = {
      ...mockTheory,
      category: TheoryCategory.COGNITIVE_BIASES
    };

    mockGetRelatedTheories.mockReturnValue([]);

    await service.getCrossLinksForTheory(cognitiveTheory);

    // The service should internally use appropriate tags for cognitive biases
    // This is tested indirectly through the cross-links generation
    expect(mockGetRelatedTheories).toHaveBeenCalled();
  });

  it('should handle different theory categories', async () => {
    const categories = [
      TheoryCategory.PERSUASION_PRINCIPLES,
      TheoryCategory.BEHAVIORAL_ECONOMICS,
      TheoryCategory.UX_PSYCHOLOGY,
      TheoryCategory.EMOTIONAL_TRIGGERS
    ];

    for (const category of categories) {
      const theory = { ...mockTheory, category };
      mockGetRelatedTheories.mockReturnValue([]);

      await service.getCrossLinksForTheory(theory);

      expect(mockGetRelatedTheories).toHaveBeenCalled();
    }
  });
});

describe('User preference analysis', () => {
  let service: CrossLinkingService;

  beforeEach(() => {
    service = new CrossLinkingService();
    mockGetContentRecommendations.mockReturnValue([]);
  });

  it('should prioritize user explored categories', async () => {
    const userWithPreferences = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        categoriesExplored: [
          TheoryCategory.COGNITIVE_BIASES,
          TheoryCategory.UX_PSYCHOLOGY,
          TheoryCategory.PERSUASION_PRINCIPLES
        ]
      }
    };

    await service.getPersonalizedRecommendations(userWithPreferences);

    expect(mockGetContentRecommendations).toHaveBeenCalledWith(
      expect.arrayContaining([
        TheoryCategory.COGNITIVE_BIASES,
        TheoryCategory.UX_PSYCHOLOGY,
        TheoryCategory.PERSUASION_PRINCIPLES
      ]),
      userWithPreferences,
      expect.any(Number)
    );
  });

  it('should handle users with no category exploration', async () => {
    const newUser = {
      ...mockUserProgress,
      stats: {
        ...mockUserProgress.stats,
        categoriesExplored: []
      }
    };

    await service.getPersonalizedRecommendations(newUser);

    expect(mockGetContentRecommendations).toHaveBeenCalled();
  });
});
