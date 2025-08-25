# Knowledge Hub: User Psychology Theories

## 1. Overview

The Knowledge Hub is an in-dashboard feature dedicated to presenting curated psychological theories and persuasion techniques relevant to indie makers, developers, and product builders. This hub will serve as a quick-reference library for applying behavioral science in product design, marketing, and community building.

## 2. User Stories

- As a user, I want to browse psychological theories by category so I can quickly find relevant concepts for my projects.
- As a user, I want to search for specific psychological principles so I can access them directly.
- As a user, I want to bookmark favorite theories so I can reference them later.
- As a user, I want to see practical examples of how to apply these theories in real products.
- As a user, I want to access basic theory summaries for free, with the option to unlock premium content.
- As a user, I want to earn badges for learning new concepts to make the experience engaging.

## 3. Technical Specifications

### 3.1 Architecture

- **Frontend**: React.js with Next.js App Router
- **Content Storage**: Markdown files for each theory (for easy updates and SEO)
- **Data Structure**: JSON metadata + Markdown content
- **State Management**: React Context for user preferences and bookmarks
- **Authentication**: Leverage existing Firebase Auth system
- **Database**: Firestore for user-specific data (bookmarks, progress)

### 3.2 Content Structure

Each theory will be stored as a markdown file with frontmatter metadata:

```markdown
---
title: "Anchoring Effect"
category: "Cognitive Biases"
difficulty: "Beginner"
relevance: ["Pricing", "UX", "Marketing"]
premium: false
---

Content of the theory...
```

### 3.3 Directory Structure

```
/app
  /dashboard
    /knowledge-hub
      /page.tsx             # Main Knowledge Hub page
      /[category]
        /page.tsx           # Category listing page
      /theory
        /[slug]
          /page.tsx         # Individual theory page
/components
  /knowledge-hub
    /CategoryNav.tsx        # Category navigation component
    /TheoryCard.tsx         # Theory card component
    /SearchFilter.tsx       # Search and filter component
    /BookmarkButton.tsx     # Bookmark functionality
    /PremiumBadge.tsx       # Premium content indicator
    /InteractiveExample.tsx # Before/After UI examples
/lib
  /knowledge-hub
    /api.ts                 # API functions for Knowledge Hub
    /types.ts               # TypeScript interfaces
/content
  /theories                 # Markdown files for theories
    /cognitive-biases
      /anchoring.md
      /scarcity.md
    /persuasion-principles
      /cialdini-reciprocity.md
      /cialdini-commitment.md
```

### 3.4 Data Models

#### Theory

```typescript
interface Theory {
  slug: string;              // URL-friendly identifier
  title: string;             // Display name
  category: TheoryCategory;  // Parent category
  summary: string;           // Short description (50-80 words)
  content: string;           // Full markdown content
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  relevance: string[];       // Tags like "Marketing", "UX", "Sales"
  visualPath?: string;       // Path to diagram/visual
  examples: Example[];       // Practical examples
  isPremium: boolean;        // Whether it's gated content
  relatedTheories: string[]; // Slugs of related theories
  relatedBlogPosts: string[]; // URLs to related blog posts
}

interface Example {
  title: string;
  description: string;
  beforeImagePath?: string;
  afterImagePath?: string;
  code?: string;
}

type TheoryCategory = 
  | 'Cognitive Biases'
  | 'Persuasion Principles'
  | 'Behavioral Economics'
  | 'UX Psychology'
  | 'Emotional Triggers';
```

#### User Preferences

```typescript
interface UserKnowledgePreferences {
  userId: string;
  bookmarkedTheories: string[];  // Array of theory slugs
  readTheories: string[];        // Tracking read status
  earnedBadges: Badge[];         // Achievements
  lastVisitedCategory?: string;  // For returning users
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: Timestamp;
}
```

## 4. UI/UX Design

### 4.1 Main Knowledge Hub Page

- Hero section with search bar
- Category cards with icons and counts
- "Recently Added" section
- "Your Bookmarks" section (for returning users)
- "Continue Learning" section (based on history)

### 4.2 Category Page

- Breadcrumb navigation
- Filter options (difficulty, relevance)
- Grid of theory cards with visual indicators
- Sorting options (alphabetical, popularity)

### 4.3 Theory Detail Page

- Theory title and metadata
- Visual diagram or example
- Summary section
- "How to Apply in Build24" section
- Interactive examples (Before/After)
- Related theories
- Bookmark button
- Premium content section (with upgrade CTA if needed)

### 4.4 Mobile Responsiveness

- Collapsible category navigation
- Stack cards vertically on small screens
- Touch-friendly interactive examples
- Simplified navigation for mobile users

## 5. Feature Implementation Plan

### 5.1 MVP (2-3 weeks)

- Basic Knowledge Hub UI with category navigation
- Theory detail page template
- Search functionality
- 10-15 seed theories with basic content
- Integration with dashboard sidebar

### 5.2 Phase 2

- Bookmark system
- User progress tracking
- Gamification (badges, progress indicators)
- Premium content gating
- Expand to 30+ theories
- Enhanced visual examples

### 5.3 Phase 3

- User-generated insights & discussion threads
- AI-powered recommendations
- Advanced analytics
- Integration with project tools

## 6. Analytics Requirements

Track the following metrics:

- Views per theory
- Search queries
- Time spent on theory pages
- Bookmark actions
- Category popularity
- Conversion rate to premium content

## 7. Accessibility Considerations

- All content must be screen reader friendly
- Color contrast ratios must meet WCAG AA standards
- Interactive elements must be keyboard navigable
- Alt text for all diagrams and visuals
- Proper heading hierarchy for screen readers

## 8. SEO Considerations

- Each theory page should have unique meta tags
- Structured data for knowledge articles
- Proper heading hierarchy
- Internal linking between related theories
- Sitemap inclusion for all theory pages

## 9. Testing Strategy

- Unit tests for components
- Integration tests for search and filter functionality
- User testing for navigation and content comprehension
- Performance testing for page load times
- A/B testing for premium conversion CTAs

## 10. Deployment Strategy

- Feature flag for gradual rollout
- Initial beta access for select users
- Monitoring plan for user engagement
- Feedback collection mechanism
