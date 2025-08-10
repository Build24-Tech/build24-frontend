
import { z } from 'zod';

// Theory Category Enums
export enum TheoryCategory {
  COGNITIVE_BIASES = 'cognitive-biases',
  PERSUASION_PRINCIPLES = 'persuasion-principles',
  BEHAVIORAL_ECONOMICS = 'behavioral-economics',
  UX_PSYCHOLOGY = 'ux-psychology',
  EMOTIONAL_TRIGGERS = 'emotional-triggers'
}

// Difficulty Levels
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Relevance Types
export enum RelevanceType {
  MARKETING = 'marketing',
  UX = 'ux',
  SALES = 'sales'
}

// Interactive Example Types
export enum ExampleType {
  BEFORE_AFTER = 'before-after',
  INTERACTIVE_DEMO = 'interactive-demo',
  CASE_STUDY = 'case-study'
}

// User Access Levels
export enum AccessLevel {
  FREE = 'free',
  PREMIUM = 'premium'
}

// Badge Categories
export enum BadgeCategory {
  READING = 'reading',
  EXPLORATION = 'exploration',
  ENGAGEMENT = 'engagement',
  MASTERY = 'mastery'
}

// Filter Types
export interface FilterState {
  categories: TheoryCategory[];
  difficulty: DifficultyLevel[];
  relevance: RelevanceType[];
  searchQuery: string;
}

// Related Content Interface
export interface RelatedContent {
  id: string;
  title: string;
  type: 'blog-post' | 'project' | 'theory';
  url: string;
  description?: string;
}

// Downloadable Resource Interface
export interface DownloadableResource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'template' | 'script' | 'checklist';
  fileSize: number; // in bytes
}

// Interactive Example Interface
export interface InteractiveExample {
  id: string;
  type: ExampleType;
  title: string;
  description: string;
  beforeImage?: string;
  afterImage?: string;
  interactiveComponent?: string; // Component name for dynamic loading
  caseStudyContent?: string;
}

// Theory Metadata Interface
export interface TheoryMetadata {
  difficulty: DifficultyLevel;
  relevance: RelevanceType[];
  readTime: number; // minutes
  tags: string[];
}

// Theory Content Interface
export interface TheoryContent {
  description: string;
  visualDiagram?: string; // URL or embedded content
  applicationGuide: string;
  examples: InteractiveExample[];
  relatedContent: RelatedContent[];
}

// Premium Content Interface
export interface PremiumContent {
  extendedCaseStudies: string;
  downloadableResources: DownloadableResource[];
  advancedApplications: string;
}

// Main Theory Interface
export interface Theory {
  id: string;
  title: string;
  category: TheoryCategory;
  summary: string; // 50-80 words
  content: TheoryContent;
  metadata: TheoryMetadata;
  premiumContent?: PremiumContent;
  createdAt: Date;
  updatedAt: Date;
}

// Badge Interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl?: string;
  earnedAt: Date;
  requirements: {
    type: 'theories_read' | 'categories_explored' | 'time_spent' | 'bookmarks_created';
    threshold: number;
  };
}

// Quiz Result Interface
export interface QuizResult {
  theoryId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeSpent: number; // seconds
}

// User Statistics Interface
export interface UserStats {
  totalReadTime: number; // minutes
  theoriesRead: number;
  categoriesExplored: TheoryCategory[];
  lastActiveDate: Date;
  streakDays: number;
  averageSessionTime: number; // minutes
}

// User Progress Interface
export interface UserProgress {
  userId: string;
  readTheories: string[]; // theory IDs
  bookmarkedTheories: string[];
  badges: Badge[];
  stats: UserStats;
  quizResults: QuizResult[];
  preferences: {
    defaultCategory?: TheoryCategory;
    emailNotifications: boolean;
    progressReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Theory Analytics Interface
export interface TheoryAnalytics {
  theoryId: string;
  viewCount: number;
  averageReadTime: number; // minutes
  bookmarkCount: number;
  completionRate: number; // percentage
  userRatings: {
    userId: string;
    rating: number; // 1-5
    feedback?: string;
    createdAt: Date;
  }[];
  popularityScore: number; // Calculated field
  lastUpdated: Date;
}

// Search Result Interface
export interface SearchResult {
  theory: Theory;
  relevanceScore: number;
  matchedFields: ('title' | 'summary' | 'tags' | 'content')[];
}

// Theory List Response Interface
export interface TheoryListResponse {
  theories: Theory[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Zod Validation Schemas

// Theory Category Schema
export const theoryCategorySchema = z.nativeEnum(TheoryCategory);

// Difficulty Level Schema
export const difficultyLevelSchema = z.nativeEnum(DifficultyLevel);

// Relevance Type Schema
export const relevanceTypeSchema = z.nativeEnum(RelevanceType);

// Example Type Schema
export const exampleTypeSchema = z.nativeEnum(ExampleType);

// Access Level Schema
export const accessLevelSchema = z.nativeEnum(AccessLevel);

// Badge Category Schema
export const badgeCategorySchema = z.nativeEnum(BadgeCategory);

// Filter State Schema
export const filterStateSchema = z.object({
  categories: z.array(theoryCategorySchema),
  difficulty: z.array(difficultyLevelSchema),
  relevance: z.array(relevanceTypeSchema),
  searchQuery: z.string()
});

// Related Content Schema
export const relatedContentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['blog-post', 'project', 'theory']),
  url: z.string().url(),
  description: z.string().optional()
});

// Downloadable Resource Schema
export const downloadableResourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.enum(['pdf', 'template', 'script', 'checklist']),
  fileSize: z.number().positive()
});

// Interactive Example Schema
export const interactiveExampleSchema = z.object({
  id: z.string().min(1),
  type: exampleTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  beforeImage: z.string().url().optional(),
  afterImage: z.string().url().optional(),
  interactiveComponent: z.string().optional(),
  caseStudyContent: z.string().optional()
});

// Theory Metadata Schema
export const theoryMetadataSchema = z.object({
  difficulty: difficultyLevelSchema,
  relevance: z.array(relevanceTypeSchema).min(1),
  readTime: z.number().positive(),
  tags: z.array(z.string().min(1))
});

// Theory Content Schema
export const theoryContentSchema = z.object({
  description: z.string().min(1),
  visualDiagram: z.string().url().optional(),
  applicationGuide: z.string().min(1),
  examples: z.array(interactiveExampleSchema),
  relatedContent: z.array(relatedContentSchema)
});

// Premium Content Schema
export const premiumContentSchema = z.object({
  extendedCaseStudies: z.string().min(1),
  downloadableResources: z.array(downloadableResourceSchema),
  advancedApplications: z.string().min(1)
});

// Theory Schema
export const theorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: theoryCategorySchema,
  summary: z.string().min(1).refine(
    (val) => {
      const wordCount = val.trim().split(/\s+/).length;
      return wordCount >= 50 && wordCount <= 80;
    },
    { message: "Summary must be between 50-80 words" }
  ),
  content: theoryContentSchema,
  metadata: theoryMetadataSchema,
  premiumContent: premiumContentSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Badge Requirements Schema
export const badgeRequirementsSchema = z.object({
  type: z.enum(['theories_read', 'categories_explored', 'time_spent', 'bookmarks_created']),
  threshold: z.number().positive()
});

// Badge Schema
export const badgeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: badgeCategorySchema,
  iconUrl: z.string().url().optional(),
  earnedAt: z.date(),
  requirements: badgeRequirementsSchema
});

// Quiz Result Schema
export const quizResultSchema = z.object({
  theoryId: z.string().min(1),
  score: z.number().min(0),
  totalQuestions: z.number().positive(),
  completedAt: z.date(),
  timeSpent: z.number().positive()
});

// User Statistics Schema
export const userStatsSchema = z.object({
  totalReadTime: z.number().min(0),
  theoriesRead: z.number().min(0),
  categoriesExplored: z.array(theoryCategorySchema),
  lastActiveDate: z.date(),
  streakDays: z.number().min(0),
  averageSessionTime: z.number().min(0)
});

// User Progress Preferences Schema
export const userProgressPreferencesSchema = z.object({
  defaultCategory: theoryCategorySchema.optional(),
  emailNotifications: z.boolean(),
  progressReminders: z.boolean()
});

// User Progress Schema
export const userProgressSchema = z.object({
  userId: z.string().min(1),
  readTheories: z.array(z.string().min(1)),
  bookmarkedTheories: z.array(z.string().min(1)),
  badges: z.array(badgeSchema),
  stats: userStatsSchema,
  quizResults: z.array(quizResultSchema),
  preferences: userProgressPreferencesSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// User Rating Schema
export const userRatingSchema = z.object({
  userId: z.string().min(1),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  createdAt: z.date()
});

// Theory Analytics Schema
export const theoryAnalyticsSchema = z.object({
  theoryId: z.string().min(1),
  viewCount: z.number().min(0),
  averageReadTime: z.number().min(0),
  bookmarkCount: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  userRatings: z.array(userRatingSchema),
  popularityScore: z.number().min(0),
  lastUpdated: z.date()
});

// Search Result Schema
export const searchResultSchema = z.object({
  theory: theorySchema,
  relevanceScore: z.number().min(0).max(1),
  matchedFields: z.array(z.enum(['title', 'summary', 'tags', 'content']))
});

// Theory List Response Schema
export const theoryListResponseSchema = z.object({
  theories: z.array(theorySchema),
  totalCount: z.number().min(0),
  hasMore: z.boolean(),
  nextCursor: z.string().optional()
});

// Type exports for runtime validation
export type FilterStateInput = z.infer<typeof filterStateSchema>;
export type TheoryInput = z.infer<typeof theorySchema>;
export type UserProgressInput = z.infer<typeof userProgressSchema>;
export type TheoryAnalyticsInput = z.infer<typeof theoryAnalyticsSchema>;
// Utility Types and Constants

// Theory Category Display Names
export const THEORY_CATEGORY_LABELS: Record<TheoryCategory, string> = {
  [TheoryCategory.COGNITIVE_BIASES]: 'Cognitive Biases',
  [TheoryCategory.PERSUASION_PRINCIPLES]: 'Persuasion Principles',
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: 'Behavioral Economics',
  [TheoryCategory.UX_PSYCHOLOGY]: 'UX Psychology',
  [TheoryCategory.EMOTIONAL_TRIGGERS]: 'Emotional Triggers'
};

// Difficulty Level Display Names
export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Beginner',
  [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
  [DifficultyLevel.ADVANCED]: 'Advanced'
};

// Relevance Type Display Names
export const RELEVANCE_TYPE_LABELS: Record<RelevanceType, string> = {
  [RelevanceType.MARKETING]: 'Marketing',
  [RelevanceType.UX]: 'User Experience',
  [RelevanceType.SALES]: 'Sales'
};

// Badge Category Display Names
export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  [BadgeCategory.READING]: 'Reading',
  [BadgeCategory.EXPLORATION]: 'Exploration',
  [BadgeCategory.ENGAGEMENT]: 'Engagement',
  [BadgeCategory.MASTERY]: 'Mastery'
};

// Default Filter State
export const DEFAULT_FILTER_STATE: FilterState = {
  categories: [],
  difficulty: [],
  relevance: [],
  searchQuery: ''
};

// Theory Category Colors (for UI styling)
export const THEORY_CATEGORY_COLORS: Record<TheoryCategory, string> = {
  [TheoryCategory.COGNITIVE_BIASES]: 'bg-blue-500',
  [TheoryCategory.PERSUASION_PRINCIPLES]: 'bg-green-500',
  [TheoryCategory.BEHAVIORAL_ECONOMICS]: 'bg-purple-500',
  [TheoryCategory.UX_PSYCHOLOGY]: 'bg-orange-500',
  [TheoryCategory.EMOTIONAL_TRIGGERS]: 'bg-red-500'
};

// Difficulty Level Colors
export const DIFFICULTY_LEVEL_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'bg-green-500',
  [DifficultyLevel.INTERMEDIATE]: 'bg-yellow-500',
  [DifficultyLevel.ADVANCED]: 'bg-red-500'
};

// Badge Requirements Thresholds
export const BADGE_THRESHOLDS = {
  FIRST_THEORY: 1,
  THEORY_EXPLORER: 5,
  THEORY_ENTHUSIAST: 15,
  THEORY_MASTER: 50,
  CATEGORY_EXPLORER: 3,
  CATEGORY_MASTER: 5,
  TIME_SPENT_HOUR: 60, // minutes
  TIME_SPENT_DAY: 480, // minutes (8 hours)
  BOOKMARK_COLLECTOR: 10,
  BOOKMARK_CURATOR: 25
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  SEARCH_DEBOUNCE_MS: 300
} as const;

// Content Validation Constants
export const CONTENT_VALIDATION = {
  SUMMARY_MIN_WORDS: 50,
  SUMMARY_MAX_WORDS: 80,
  TITLE_MAX_LENGTH: 100,
  TAG_MAX_LENGTH: 30,
  MAX_TAGS_PER_THEORY: 10,
  MAX_EXAMPLES_PER_THEORY: 5,
  MAX_RELATED_CONTENT: 10
} as const;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Error Types
export enum KnowledgeHubErrorType {
  THEORY_NOT_FOUND = 'THEORY_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface KnowledgeHubError {
  type: KnowledgeHubErrorType;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: KnowledgeHubError;
  lastUpdated?: Date;
}

// Component Props Types
export interface TheoryCardProps {
  theory: Theory;
  isBookmarked: boolean;
  onBookmarkToggle: (theoryId: string) => void;
  onTheoryClick: (theoryId: string) => void;
  showPremiumBadge?: boolean;
}

export interface CategoryNavigationProps {
  selectedCategory?: TheoryCategory;
  onCategoryChange: (category: TheoryCategory | undefined) => void;
  theoryCounts: Record<TheoryCategory, number>;
}

export interface SearchAndFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
  resultCount?: number;
}

export interface ProgressTrackerProps {
  userProgress: UserProgress;
  onBadgeClick?: (badge: Badge) => void;
  showDetailedStats?: boolean;
}
