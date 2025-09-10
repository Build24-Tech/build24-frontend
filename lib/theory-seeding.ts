import { DifficultyLevel, RelevanceType, TheoryCategory } from '@/types/knowledge-hub';
import { contentManagementSystem, TheoryTemplate } from './content-management';

// Theory seed data for all categories
export const theorySeeds: TheoryTemplate[] = [
  // Cognitive Biases
  {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: TheoryCategory.COGNITIVE_BIASES,
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.MARKETING, RelevanceType.UX],
    readTime: 3,
    tags: ['pricing', 'decision-making', 'first-impression'],
    isPremium: false,
    visualDiagram: '/images/theories/anchoring-bias-diagram.svg',
    relatedProjects: ['pricing-strategy-build', 'landing-page-optimization'],
    relatedBlogPosts: ['psychology-of-pricing', 'first-impressions-matter'],
    content: {
      description: 'Anchoring bias is a cognitive bias that describes the common human tendency to rely too heavily on the first piece of information encountered (the "anchor") when making decisions. This psychological phenomenon significantly influences how people process subsequent information and make judgments. In product development and marketing, understanding anchoring bias can help you strategically position your offerings and guide user decision-making processes. The bias occurs because our brains use the initial information as a reference point, and all subsequent evaluations are made relative to this anchor, even when the anchor is completely irrelevant to the decision at hand.',
      applicationGuide: 'When building products or marketing campaigns, you can leverage anchoring bias to influence user perceptions and decisions. Start by presenting a higher-priced option or premium feature set first, which serves as an anchor that makes your standard offering appear more reasonable and valuable. In pricing strategies, display your most expensive plan prominently before showing cheaper alternatives. For landing pages, lead with your strongest value proposition or most impressive statistic to anchor visitors\' expectations positively. In user interfaces, present the most important or desired action first to anchor user attention and increase conversion rates.',
      examples: [
        'Pricing Pages: Show premium plans first to make standard plans seem affordable',
        'Product Features: Highlight advanced capabilities before basic ones',
        'Landing Page Headlines: Lead with your strongest value proposition',
        'Negotiation: Start with higher initial offers in B2B sales',
        'User Onboarding: Present premium features first to anchor expectations'
      ],
      relatedConcepts: ['contrast effect', 'loss aversion', 'social proof']
    }
  },
  {
    id: 'scarcity-principle',
    title: 'Scarcity Principle',
    category: TheoryCategory.COGNITIVE_BIASES,
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
    readTime: 4,
    tags: ['urgency', 'limited-time', 'conversion'],
    isPremium: false,
    content: {
      description: 'The scarcity principle is a psychological bias where people place higher value on things that are rare or in limited supply. This cognitive shortcut evolved as a survival mechanism - scarce resources were often more valuable for survival. In modern contexts, scarcity creates urgency and can significantly increase perceived value and desirability. The principle works because scarcity triggers loss aversion, making people fear missing out on an opportunity. When something becomes less available, we tend to want it more, even if our actual need for it hasn\'t changed.',
      applicationGuide: 'Implement scarcity in your products through limited-time offers, exclusive access, or quantity limitations. Use countdown timers for sales or product launches to create urgency. Highlight when items are running low in stock or when spots are filling up for services. Create exclusive tiers or early access programs for loyal customers. However, use scarcity ethically - false scarcity can damage trust and brand reputation. Make sure your scarcity claims are genuine and transparent.',
      examples: [
        'Limited-time offers with countdown timers',
        'Early bird pricing for courses or events',
        'Exclusive beta access for new features',
        'Limited edition product releases',
        'Membership caps for premium communities'
      ],
      relatedConcepts: ['loss aversion', 'FOMO', 'social proof']
    }
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    category: TheoryCategory.COGNITIVE_BIASES,
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.MARKETING, RelevanceType.UX, RelevanceType.SALES],
    readTime: 4,
    tags: ['testimonials', 'reviews', 'trust'],
    isPremium: false,
    content: {
      description: 'Social proof is the psychological phenomenon where people look to the behavior and actions of others to guide their own decisions, especially in uncertain situations. This bias stems from our evolutionary need to fit in with the group for survival and safety. When we\'re unsure about what to do, we assume that others have more information than we do and follow their lead. Social proof is particularly powerful in digital environments where trust signals are crucial for conversion and engagement.',
      applicationGuide: 'Incorporate social proof throughout your user journey by displaying customer testimonials, user reviews, and usage statistics prominently. Show real-time activity like "X people are viewing this" or "Y customers bought this today." Feature case studies and success stories from recognizable customers. Use social media mentions and press coverage as credibility indicators. Display user-generated content and community activity to show engagement. Make sure social proof is visible at key decision points in your funnel.',
      examples: [
        'Customer testimonials on landing pages',
        'Review systems with star ratings',
        'User count displays ("Join 10,000+ users")',
        'Real-time activity notifications',
        'Press mentions and media coverage'
      ],
      relatedConcepts: ['authority bias', 'bandwagon effect', 'conformity']
    }
  },

  // Persuasion Principles
  {
    id: 'cialdini-reciprocity',
    title: 'Cialdini\'s Reciprocity Principle',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    difficulty: DifficultyLevel.INTERMEDIATE,
    relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
    readTime: 5,
    tags: ['reciprocity', 'free-value', 'relationship-building'],
    isPremium: false,
    content: {
      description: 'Reciprocity is one of Robert Cialdini\'s six principles of persuasion, based on the psychological rule that people feel obligated to return favors and repay debts. This principle is deeply ingrained in human psychology and social structures - when someone does something for us, we feel psychologically uncomfortable until we\'ve returned the favor. The reciprocity principle works even with small gestures and can create powerful motivation for action. It\'s particularly effective because it taps into our fundamental sense of fairness and social obligation.',
      applicationGuide: 'Provide genuine value before asking for anything in return. Offer free resources, tools, or content that genuinely help your audience solve problems. Create free trials, samples, or consultations that demonstrate your product\'s value. Share knowledge through blog posts, tutorials, or webinars without immediate sales pitches. Personalize your approach by offering specific help or insights relevant to individual prospects. The key is to give first and give genuinely - the reciprocity response should feel natural, not manipulative.',
      examples: [
        'Free tools or calculators that provide immediate value',
        'Educational content and tutorials',
        'Free consultations or audits',
        'Sample products or trial periods',
        'Personalized recommendations or insights'
      ],
      relatedConcepts: ['commitment and consistency', 'social proof', 'liking principle']
    }
  },
  {
    id: 'fogg-behavior-model',
    title: 'Fogg Behavior Model',
    category: TheoryCategory.PERSUASION_PRINCIPLES,
    difficulty: DifficultyLevel.ADVANCED,
    relevance: [RelevanceType.UX, RelevanceType.MARKETING],
    readTime: 6,
    tags: ['behavior-change', 'motivation', 'triggers'],
    isPremium: true,
    content: {
      description: 'The Fogg Behavior Model (B=MAT) states that behavior occurs when three elements converge: Motivation, Ability, and Trigger. Developed by Stanford\'s BJ Fogg, this model explains that for any behavior to happen, a person must have sufficient motivation, the ability to perform the behavior, and a trigger that prompts the action. When any of these elements is missing or insufficient, the behavior won\'t occur. This model is particularly powerful for designing user experiences and marketing campaigns that drive specific actions.',
      applicationGuide: 'Design your user experience by optimizing all three elements. Increase motivation through compelling value propositions, emotional appeals, or social pressure. Improve ability by simplifying processes, reducing friction, and providing clear instructions. Create effective triggers through timely notifications, prominent call-to-action buttons, or contextual prompts. Analyze failed conversions by identifying which element (motivation, ability, or trigger) is lacking. Use this framework to systematically improve user flows and increase desired behaviors.',
      examples: [
        'Onboarding flows that balance motivation and simplicity',
        'Push notifications timed for high-motivation moments',
        'Progressive disclosure to maintain ability while building motivation',
        'Social triggers that leverage peer influence',
        'Contextual prompts based on user behavior patterns'
      ],
      relatedConcepts: ['habit formation', 'user experience design', 'behavioral economics']
    }
  },

  // Behavioral Economics
  {
    id: 'loss-aversion',
    title: 'Loss Aversion',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    relevance: [RelevanceType.MARKETING, RelevanceType.UX, RelevanceType.SALES],
    readTime: 4,
    tags: ['loss-aversion', 'risk', 'decision-making'],
    isPremium: false,
    content: {
      description: 'Loss aversion is a cognitive bias where people feel the pain of losing something more acutely than the pleasure of gaining something of equal value. Research shows that losses are psychologically twice as powerful as gains. This bias influences decision-making across all areas of life and business. People will go to great lengths to avoid losses, even when the potential gains outweigh the risks. Understanding loss aversion helps explain why people stick with the status quo, resist change, and respond strongly to risk-framed messaging.',
      applicationGuide: 'Frame your value propositions in terms of what customers might lose by not taking action, rather than just what they\'ll gain. Highlight the cost of inaction or the risks of staying with current solutions. Use trial periods and money-back guarantees to reduce perceived risk. Emphasize what customers currently have that they could lose, then position your solution as protection. In pricing, show what users lose access to when downgrading plans. Create urgency by highlighting limited-time opportunities that will be lost.',
      examples: [
        'Risk-focused messaging ("Don\'t lose customers to competitors")',
        'Money-back guarantees to reduce perceived risk',
        'Free trials that create ownership before purchase',
        'Highlighting costs of current problems',
        'Limited-time offers that expire'
      ],
      relatedConcepts: ['endowment effect', 'status quo bias', 'prospect theory']
    }
  },
  {
    id: 'endowment-effect',
    title: 'Endowment Effect',
    category: TheoryCategory.BEHAVIORAL_ECONOMICS,
    difficulty: DifficultyLevel.INTERMEDIATE,
    relevance: [RelevanceType.UX, RelevanceType.MARKETING],
    readTime: 4,
    tags: ['ownership', 'value-perception', 'trials'],
    isPremium: false,
    content: {
      description: 'The endowment effect is a cognitive bias where people value things more highly simply because they own them. Once we possess something, we become emotionally attached to it and overvalue it compared to identical items we don\'t own. This effect is closely related to loss aversion - we don\'t want to give up what we already have. The endowment effect explains why free trials are so effective and why people resist switching from products they currently use, even when better alternatives exist.',
      applicationGuide: 'Create ownership experiences before asking for purchase decisions. Offer free trials that let users experience your product as if they own it. Use language that implies ownership ("your dashboard," "your data," "your results"). Allow customization and personalization to increase psychological ownership. Provide setup assistance to help users invest time and effort in your product. Once users have invested in setup and customization, they\'ll be more reluctant to switch to competitors.',
      examples: [
        'Free trials with full feature access',
        'Customizable dashboards and interfaces',
        'Onboarding that requires user input and setup',
        'Personalized recommendations and content',
        'User-generated content and profiles'
      ],
      relatedConcepts: ['loss aversion', 'sunk cost fallacy', 'psychological ownership']
    }
  },

  // UX Psychology
  {
    id: 'fitts-law',
    title: 'Fitts\' Law',
    category: TheoryCategory.UX_PSYCHOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    relevance: [RelevanceType.UX],
    readTime: 5,
    tags: ['interface-design', 'usability', 'interaction'],
    isPremium: false,
    content: {
      description: 'Fitts\' Law is a predictive model that describes the time required to rapidly move to a target area, such as clicking a button or selecting a menu item. The law states that the time to acquire a target is a function of the distance to the target and the size of the target. Larger targets that are closer to the user\'s current position can be acquired faster than smaller, more distant targets. This principle is fundamental to interface design and directly impacts user experience and conversion rates.',
      applicationGuide: 'Make important interactive elements larger and position them closer to where users are likely to be looking or clicking. Place primary call-to-action buttons prominently and make them sufficiently large for easy clicking. Position related actions near each other to reduce mouse travel time. Use the edges and corners of screens effectively, as they provide infinite width or height for targeting. Consider the user\'s likely path through your interface and optimize the placement of sequential actions.',
      examples: [
        'Large, prominent call-to-action buttons',
        'Navigation menus positioned at screen edges',
        'Related actions grouped together',
        'Mobile interfaces with thumb-friendly button placement',
        'Dropdown menus that appear near the trigger element'
      ],
      relatedConcepts: ['Hick\'s Law', 'visual hierarchy', 'user interface design']
    }
  },
  {
    id: 'hicks-law',
    title: 'Hick\'s Law',
    category: TheoryCategory.UX_PSYCHOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    relevance: [RelevanceType.UX],
    readTime: 4,
    tags: ['decision-making', 'choice-overload', 'simplicity'],
    isPremium: false,
    content: {
      description: 'Hick\'s Law states that the time it takes to make a decision increases logarithmically with the number of choices available. Also known as the Hick-Hyman Law, it describes the relationship between the number of options and the time required to choose among them. While having some choice is important for user satisfaction, too many options can lead to decision paralysis and decreased conversion rates. The law applies to both simple interface decisions and complex product choices.',
      applicationGuide: 'Reduce the number of choices presented to users at any given time. Use progressive disclosure to reveal options gradually rather than overwhelming users with everything at once. Group related options together to make choices feel more manageable. Implement smart defaults to reduce the cognitive load of decision-making. For complex products, use guided flows or wizards that break decisions into smaller, sequential steps. Consider using filters and search to help users narrow down options quickly.',
      examples: [
        'Simplified navigation menus with clear categories',
        'Progressive onboarding that reveals features gradually',
        'Product configurators with step-by-step choices',
        'Smart defaults in forms and settings',
        'Filtering systems for large product catalogs'
      ],
      relatedConcepts: ['choice overload', 'decision fatigue', 'progressive disclosure']
    }
  },

  // Emotional Triggers
  {
    id: 'fear-of-missing-out',
    title: 'Fear of Missing Out (FOMO)',
    category: TheoryCategory.EMOTIONAL_TRIGGERS,
    difficulty: DifficultyLevel.BEGINNER,
    relevance: [RelevanceType.MARKETING, RelevanceType.SALES],
    readTime: 4,
    tags: ['urgency', 'exclusivity', 'social-media'],
    isPremium: false,
    content: {
      description: 'Fear of Missing Out (FOMO) is the anxiety that others might be having rewarding experiences from which one is absent. This social anxiety is characterized by a desire to stay continually connected with what others are doing. FOMO is amplified by social media and digital connectivity, where we constantly see curated highlights of others\' experiences. In marketing and product design, FOMO can be a powerful motivator for action, driving urgency and engagement.',
      applicationGuide: 'Create genuine urgency through limited-time offers, exclusive access, or capacity constraints. Share real-time activity and social proof to show what others are experiencing. Use countdown timers and progress indicators to visualize scarcity. Highlight exclusive benefits for early adopters or premium members. Share success stories and user-generated content to show the experiences others are having. However, ensure your FOMO tactics are ethical and based on real limitations rather than artificial scarcity.',
      examples: [
        'Limited-time launch offers with countdown timers',
        'Exclusive early access for subscribers',
        'Real-time notifications of others\' activities',
        'Waitlists for popular products or services',
        'Social proof showing others\' positive experiences'
      ],
      relatedConcepts: ['scarcity principle', 'social proof', 'urgency']
    }
  },
  {
    id: 'emotional-contagion',
    title: 'Emotional Contagion',
    category: TheoryCategory.EMOTIONAL_TRIGGERS,
    difficulty: DifficultyLevel.ADVANCED,
    relevance: [RelevanceType.MARKETING, RelevanceType.UX],
    readTime: 5,
    tags: ['emotions', 'influence', 'social-psychology'],
    isPremium: true,
    content: {
      description: 'Emotional contagion is the phenomenon where people unconsciously mimic and synchronize with the emotions of others around them. This automatic process happens through facial expressions, vocal tones, postures, and movements. In digital environments, emotional contagion occurs through visual design, copy tone, user-generated content, and social interactions. Understanding emotional contagion helps create experiences that evoke desired emotional responses and build stronger connections with users.',
      applicationGuide: 'Design your brand voice and visual identity to convey the emotions you want users to feel. Use imagery, colors, and typography that evoke your desired emotional response. Craft copy with emotional language that resonates with your target audience\'s feelings and aspirations. Showcase authentic customer emotions through testimonials, reviews, and user-generated content. Train your team to embody your brand\'s emotional values in all customer interactions. Monitor and moderate community spaces to maintain positive emotional environments.',
      examples: [
        'Brand photography that conveys specific emotions',
        'Copy that uses emotionally resonant language',
        'Customer testimonials that show genuine emotion',
        'Community spaces that foster positive interactions',
        'Visual design that evokes desired feelings'
      ],
      relatedConcepts: ['mirror neurons', 'social influence', 'brand personality']
    }
  }
];

export class TheorySeedingSystem {
  /**
   * Generate all theory content files
   */
  async generateAllTheoryContent(): Promise<{ success: string[]; errors: string[] }> {
    const success: string[] = [];
    const errors: string[] = [];

    for (const seed of theorySeeds) {
      try {
        const content = contentManagementSystem.generateTheoryFromTemplate(seed);

        // Validate the generated content
        const validation = contentManagementSystem.validateTheoryContent({
          ...seed,
          content: content
        });

        if (validation.isValid) {
          success.push(`Generated content for ${seed.id}`);

          // In a real implementation, you would write the file here
          // await fs.writeFile(`public/content/theories/${seed.id}.md`, content);
        } else {
          errors.push(`Validation failed for ${seed.id}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push(`Failed to generate ${seed.id}: ${error}`);
      }
    }

    return { success, errors };
  }

  /**
   * Get theory content by ID
   */
  getTheoryContent(theoryId: string): string | null {
    const seed = theorySeeds.find(s => s.id === theoryId);
    if (!seed) return null;

    return contentManagementSystem.generateTheoryFromTemplate(seed);
  }

  /**
   * Get all theory IDs by category
   */
  getTheoryIdsByCategory(category: TheoryCategory): string[] {
    return theorySeeds
      .filter(seed => seed.category === category)
      .map(seed => seed.id);
  }

  /**
   * Get theory statistics
   */
  getTheoryStatistics() {
    const stats = {
      total: theorySeeds.length,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      premiumCount: 0,
      averageReadTime: 0
    };

    theorySeeds.forEach(seed => {
      // Count by category
      const categoryKey = seed.category.toString();
      stats.byCategory[categoryKey] = (stats.byCategory[categoryKey] || 0) + 1;

      // Count by difficulty
      const difficultyKey = seed.difficulty.toString();
      stats.byDifficulty[difficultyKey] = (stats.byDifficulty[difficultyKey] || 0) + 1;

      // Count premium
      if (seed.isPremium) {
        stats.premiumCount++;
      }

      // Sum read time
      stats.averageReadTime += seed.readTime;
    });

    stats.averageReadTime = Math.round(stats.averageReadTime / theorySeeds.length);

    return stats;
  }

  /**
   * Validate all seeded content
   */
  validateAllContent(): { valid: string[]; invalid: { id: string; errors: string[] }[] } {
    const valid: string[] = [];
    const invalid: { id: string; errors: string[] }[] = [];

    theorySeeds.forEach(seed => {
      const content = contentManagementSystem.generateTheoryFromTemplate(seed);
      const validation = contentManagementSystem.validateTheoryContent({
        ...seed,
        content
      });

      if (validation.isValid) {
        valid.push(seed.id);
      } else {
        invalid.push({
          id: seed.id,
          errors: validation.errors
        });
      }
    });

    return { valid, invalid };
  }
}

// Singleton instance
export const theorySeedingSystem = new TheorySeedingSystem();

// Utility functions
export function generateAllTheoryContent() {
  return theorySeedingSystem.generateAllTheoryContent();
}

export function getTheoryContent(theoryId: string) {
  return theorySeedingSystem.getTheoryContent(theoryId);
}

export function getTheoryIdsByCategory(category: TheoryCategory) {
  return theorySeedingSystem.getTheoryIdsByCategory(category);
}

export function getTheoryStatistics() {
  return theorySeedingSystem.getTheoryStatistics();
}

export function validateAllContent() {
  return theorySeedingSystem.validateAllContent();
}
