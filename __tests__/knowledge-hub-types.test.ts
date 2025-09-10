import {
  DEFAULT_FILTER_STATE,
  DIFFICULTY_LEVEL_LABELS,
  DifficultyLevel,
  difficultyLevelSchema,
  FilterState,
  filterStateSchema,
  RelevanceType,
  relevanceTypeSchema,
  Theory,
  THEORY_CATEGORY_LABELS,
  TheoryCategory,
  theoryCategorySchema,
  theorySchema,
  UserProgress
} from '../types/knowledge-hub';

describe('Knowledge Hub Types', () => {
  describe('Enums', () => {
    test('TheoryCategory enum has correct values', () => {
      expect(TheoryCategory.COGNITIVE_BIASES).toBe('cognitive-biases');
      expect(TheoryCategory.PERSUASION_PRINCIPLES).toBe('persuasion-principles');
      expect(TheoryCategory.BEHAVIORAL_ECONOMICS).toBe('behavioral-economics');
      expect(TheoryCategory.UX_PSYCHOLOGY).toBe('ux-psychology');
      expect(TheoryCategory.EMOTIONAL_TRIGGERS).toBe('emotional-triggers');
    });

    test('DifficultyLevel enum has correct values', () => {
      expect(DifficultyLevel.BEGINNER).toBe('beginner');
      expect(DifficultyLevel.INTERMEDIATE).toBe('intermediate');
      expect(DifficultyLevel.ADVANCED).toBe('advanced');
    });

    test('RelevanceType enum has correct values', () => {
      expect(RelevanceType.MARKETING).toBe('marketing');
      expect(RelevanceType.UX).toBe('ux');
      expect(RelevanceType.SALES).toBe('sales');
    });
  });

  describe('Zod Schemas', () => {
    test('theoryCategorySchema validates correctly', () => {
      expect(() => theoryCategorySchema.parse('cognitive-biases')).not.toThrow();
      expect(() => theoryCategorySchema.parse('invalid-category')).toThrow();
    });

    test('difficultyLevelSchema validates correctly', () => {
      expect(() => difficultyLevelSchema.parse('beginner')).not.toThrow();
      expect(() => difficultyLevelSchema.parse('expert')).toThrow();
    });

    test('relevanceTypeSchema validates correctly', () => {
      expect(() => relevanceTypeSchema.parse('marketing')).not.toThrow();
      expect(() => relevanceTypeSchema.parse('invalid-type')).toThrow();
    });

    test('filterStateSchema validates correctly', () => {
      const validFilter: FilterState = {
        categories: [TheoryCategory.COGNITIVE_BIASES],
        difficulty: [DifficultyLevel.BEGINNER],
        relevance: [RelevanceType.MARKETING],
        searchQuery: 'test'
      };

      expect(() => filterStateSchema.parse(validFilter)).not.toThrow();
    });

    test('theorySchema validates theory structure', () => {
      const validTheory: Theory = {
        id: 'test-theory',
        title: 'Test Theory',
        category: TheoryCategory.COGNITIVE_BIASES,
        summary: 'This is a comprehensive test theory summary that demonstrates the validation requirements for the Knowledge Hub system. It contains exactly the right number of words to meet the fifty to eighty word requirement specified in the design document. The summary provides enough detail to be meaningful while staying within the prescribed limits for optimal user experience and consistent content presentation across the platform.',
        content: {
          description: 'Detailed description',
          applicationGuide: 'How to apply this theory',
          examples: [],
          relatedContent: []
        },
        metadata: {
          difficulty: DifficultyLevel.BEGINNER,
          relevance: [RelevanceType.MARKETING],
          readTime: 5,
          tags: ['test', 'theory']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => theorySchema.parse(validTheory)).not.toThrow();
    });

    test('theorySchema rejects invalid summary length', () => {
      const invalidTheory = {
        id: 'test-theory',
        title: 'Test Theory',
        category: TheoryCategory.COGNITIVE_BIASES,
        summary: 'Too short', // Less than 50 characters
        content: {
          description: 'Detailed description',
          applicationGuide: 'How to apply this theory',
          examples: [],
          relatedContent: []
        },
        metadata: {
          difficulty: DifficultyLevel.BEGINNER,
          relevance: [RelevanceType.MARKETING],
          readTime: 5,
          tags: ['test', 'theory']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => theorySchema.parse(invalidTheory)).toThrow();
    });
  });

  describe('Constants and Labels', () => {
    test('THEORY_CATEGORY_LABELS has all categories', () => {
      expect(THEORY_CATEGORY_LABELS[TheoryCategory.COGNITIVE_BIASES]).toBe('Cognitive Biases');
      expect(THEORY_CATEGORY_LABELS[TheoryCategory.PERSUASION_PRINCIPLES]).toBe('Persuasion Principles');
      expect(THEORY_CATEGORY_LABELS[TheoryCategory.BEHAVIORAL_ECONOMICS]).toBe('Behavioral Economics');
      expect(THEORY_CATEGORY_LABELS[TheoryCategory.UX_PSYCHOLOGY]).toBe('UX Psychology');
      expect(THEORY_CATEGORY_LABELS[TheoryCategory.EMOTIONAL_TRIGGERS]).toBe('Emotional Triggers');
    });

    test('DIFFICULTY_LEVEL_LABELS has all levels', () => {
      expect(DIFFICULTY_LEVEL_LABELS[DifficultyLevel.BEGINNER]).toBe('Beginner');
      expect(DIFFICULTY_LEVEL_LABELS[DifficultyLevel.INTERMEDIATE]).toBe('Intermediate');
      expect(DIFFICULTY_LEVEL_LABELS[DifficultyLevel.ADVANCED]).toBe('Advanced');
    });

    test('DEFAULT_FILTER_STATE has correct structure', () => {
      expect(DEFAULT_FILTER_STATE).toEqual({
        categories: [],
        difficulty: [],
        relevance: [],
        searchQuery: ''
      });
    });
  });

  describe('Type Safety', () => {
    test('Theory interface enforces correct structure', () => {
      // This test ensures TypeScript compilation catches type errors
      const theory: Theory = {
        id: 'test-id',
        title: 'Test Title',
        category: TheoryCategory.COGNITIVE_BIASES,
        summary: 'This is a comprehensive valid summary that demonstrates proper word count validation for the Knowledge Hub theory system. It contains exactly the right number of words to meet the fifty to eighty word requirement specified in the design document. The summary provides enough detail to be meaningful while staying within the prescribed limits for optimal user experience and consistent content presentation.',
        content: {
          description: 'Test description',
          applicationGuide: 'Test application guide',
          examples: [],
          relatedContent: []
        },
        metadata: {
          difficulty: DifficultyLevel.BEGINNER,
          relevance: [RelevanceType.MARKETING],
          readTime: 5,
          tags: ['test']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(theory.id).toBe('test-id');
      expect(theory.category).toBe(TheoryCategory.COGNITIVE_BIASES);
    });

    test('UserProgress interface enforces correct structure', () => {
      const userProgress: UserProgress = {
        userId: 'test-user',
        readTheories: ['theory1', 'theory2'],
        bookmarkedTheories: ['theory1'],
        badges: [],
        stats: {
          totalReadTime: 120,
          theoriesRead: 2,
          categoriesExplored: [TheoryCategory.COGNITIVE_BIASES],
          lastActiveDate: new Date(),
          streakDays: 5,
          averageSessionTime: 30
        },
        quizResults: [],
        preferences: {
          emailNotifications: true,
          progressReminders: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userProgress.userId).toBe('test-user');
      expect(userProgress.readTheories).toHaveLength(2);
    });
  });
});
