import {
  LaunchPhase,
  ProjectContext,
  ProjectData,
  ProjectStage,
  Recommendation,
  Resource,
  Risk,
  UserProgress
} from '@/types/launch-essentials';
import {
  calculateOverallProgress,
  getIncompleteSteps,
  getNextStep
} from './launch-essentials-utils';

// Industry patterns and benchmarks
interface IndustryPattern {
  industry: string;
  commonChallenges: string[];
  recommendedResources: string[];
  criticalPhases: LaunchPhase[];
  timelineMultiplier: number;
}

// User behavior patterns
interface UserBehaviorPattern {
  userId: string;
  completionRate: number;
  averageTimePerPhase: Record<LaunchPhase, number>;
  commonStuckPoints: string[];
  preferredResourceTypes: string[];
  lastActiveDate: Date;
}

// Risk patterns based on project data
interface RiskPattern {
  condition: (project: ProjectData, progress: UserProgress) => boolean;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  category: 'technical' | 'market' | 'financial' | 'operational' | 'timeline';
  mitigation: string[];
}

// Content suggestion context
interface ContentSuggestionContext {
  currentPhase: LaunchPhase;
  projectStage: ProjectStage;
  industry: string;
  teamSize: number;
  budget: number;
  completedSteps: string[];
  userInput: Record<string, any>;
}

/**
 * Intelligent recommendation engine that provides personalized suggestions
 * based on user progress, project context, and industry patterns
 */
export class RecommendationEngine {
  private industryPatterns: Map<string, IndustryPattern> = new Map();
  private userBehaviorPatterns: Map<string, UserBehaviorPattern> = new Map();
  private riskPatterns: RiskPattern[] = [];

  constructor() {
    this.initializeIndustryPatterns();
    this.initializeRiskPatterns();
  }

  /**
   * Calculate next steps based on current progress
   */
  calculateNextSteps(progress: UserProgress, projectData?: ProjectData): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const overallCompletion = calculateOverallProgress(progress);
    const nextStep = getNextStep(progress);
    const incompleteSteps = getIncompleteSteps(progress);

    // Primary next step recommendation
    if (nextStep) {
      recommendations.push({
        id: `next-step-${nextStep.stepId}`,
        type: 'next-step',
        title: `Complete ${this.formatStepTitle(nextStep.stepId)}`,
        description: this.getStepDescription(nextStep.stepId, progress.currentPhase),
        priority: 'high',
        category: progress.currentPhase,
        actionItems: this.getStepActionItems(nextStep.stepId, progress.currentPhase)
      });
    }

    // Phase progression recommendations
    const phaseRecommendations = this.getPhaseProgressionRecommendations(progress);
    recommendations.push(...phaseRecommendations);

    // Critical path recommendations
    const criticalRecommendations = this.getCriticalPathRecommendations(progress, projectData);
    recommendations.push(...criticalRecommendations);

    // Completion milestone recommendations
    if (overallCompletion >= 25 && overallCompletion < 50) {
      recommendations.push({
        id: 'milestone-quarter',
        type: 'next-step',
        title: 'Quarter Milestone Reached',
        description: 'Review your progress and validate assumptions before proceeding',
        priority: 'medium',
        category: 'validation',
        actionItems: [
          'Review completed validation steps',
          'Gather feedback on initial findings',
          'Adjust approach based on learnings'
        ]
      });
    }

    return this.prioritizeRecommendations(recommendations);
  }

  /**
   * Suggest resources based on project context and industry patterns
   */
  suggestResources(context: ProjectContext, progress?: UserProgress): Resource[] {
    const resources: Resource[] = [];
    const industryPattern = this.industryPatterns.get(context.industry.toLowerCase());

    // Industry-specific resources
    if (industryPattern) {
      resources.push(...this.getIndustryResources(industryPattern, context));
    }

    // Stage-specific resources
    resources.push(...this.getStageResources(context.stage, context));

    // Phase-specific resources based on progress
    if (progress) {
      resources.push(...this.getPhaseResources(progress.currentPhase, context));
    }

    // Budget and team size specific resources
    resources.push(...this.getBudgetAppropriateResources(context.budget, context.teamSize));

    return this.deduplicateResources(resources);
  }

  /**
   * Identify risks using project data analysis and pattern recognition
   */
  identifyRisks(projectData: ProjectData, progress: UserProgress): Risk[] {
    const risks: Risk[] = [];

    // Apply risk patterns
    this.riskPatterns.forEach(pattern => {
      if (pattern.condition(projectData, progress)) {
        risks.push({
          id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${pattern.category.charAt(0).toUpperCase() + pattern.category.slice(1)} Risk`,
          description: pattern.description,
          category: pattern.category,
          probability: this.calculateRiskProbability(pattern, projectData, progress),
          impact: this.calculateRiskImpact(pattern, projectData, progress),
          priority: this.calculateRiskPriority(pattern.riskLevel),
          owner: 'Product Owner'
        });
      }
    });

    // Timeline-based risks
    risks.push(...this.identifyTimelineRisks(projectData, progress));

    // Resource-based risks
    risks.push(...this.identifyResourceRisks(projectData, progress));

    // Market-based risks
    risks.push(...this.identifyMarketRisks(projectData, progress));

    return this.prioritizeRisks(risks);
  }

  /**
   * Generate personalized recommendations based on user behavior patterns
   */
  generatePersonalizedRecommendations(
    userId: string,
    progress: UserProgress,
    projectData: ProjectData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const userPattern = this.userBehaviorPatterns.get(userId);

    if (!userPattern) {
      // First-time user recommendations
      return this.getFirstTimeUserRecommendations(progress, projectData);
    }

    // Behavior-based recommendations
    if (userPattern.completionRate < 0.5) {
      recommendations.push({
        id: 'completion-boost',
        type: 'optimization',
        title: 'Boost Your Completion Rate',
        description: 'Break down large tasks into smaller, manageable steps',
        priority: 'medium',
        category: 'productivity',
        actionItems: [
          'Set daily 15-minute work sessions',
          'Focus on one step at a time',
          'Celebrate small wins'
        ]
      });
    }

    // Stuck point recommendations
    if (userPattern.commonStuckPoints.length > 0) {
      const currentStuckPoint = userPattern.commonStuckPoints.find(point =>
        progress.phases[progress.currentPhase].steps.some(step =>
          step.stepId.includes(point) && step.status === 'in_progress'
        )
      );

      if (currentStuckPoint) {
        recommendations.push({
          id: 'stuck-point-help',
          type: 'resource',
          title: 'Overcome Common Challenge',
          description: `Get help with ${currentStuckPoint} - a common challenge area`,
          priority: 'high',
          category: progress.currentPhase,
          actionItems: this.getStuckPointSolutions(currentStuckPoint)
        });
      }
    }

    // Preferred resource type recommendations
    const resourceRecommendations = this.getPreferredResourceRecommendations(
      userPattern.preferredResourceTypes,
      progress.currentPhase
    );
    recommendations.push(...resourceRecommendations);

    return recommendations;
  }

  /**
   * Create intelligent content suggestions for templates and frameworks
   */
  suggestContent(context: ContentSuggestionContext): {
    templateSuggestions: string[];
    frameworkAdjustments: string[];
    contentIdeas: string[];
  } {
    const templateSuggestions: string[] = [];
    const frameworkAdjustments: string[] = [];
    const contentIdeas: string[] = [];

    // Phase-specific template suggestions
    templateSuggestions.push(...this.getPhaseTemplates(context.currentPhase, context.industry));

    // Industry-specific adjustments
    const industryPattern = this.industryPatterns.get(context.industry.toLowerCase());
    if (industryPattern) {
      frameworkAdjustments.push(...this.getIndustryFrameworkAdjustments(industryPattern, context));
    }

    // Budget and team size adjustments
    if (context.budget < 10000) {
      frameworkAdjustments.push('Focus on lean validation methods');
      frameworkAdjustments.push('Prioritize free and low-cost tools');
    }

    if (context.teamSize === 1) {
      frameworkAdjustments.push('Adapt processes for solo founder');
      frameworkAdjustments.push('Consider outsourcing non-core activities');
    }

    // User input-based content ideas
    contentIdeas.push(...this.generateContentFromUserInput(context.userInput, context.currentPhase));

    return {
      templateSuggestions,
      frameworkAdjustments,
      contentIdeas
    };
  }

  /**
   * Update user behavior patterns based on activity
   */
  updateUserBehaviorPattern(
    userId: string,
    progress: UserProgress,
    completedStep?: string,
    timeSpent?: number
  ): void {
    let pattern = this.userBehaviorPatterns.get(userId);

    if (!pattern) {
      pattern = {
        userId,
        completionRate: 0,
        averageTimePerPhase: {} as Record<LaunchPhase, number>,
        commonStuckPoints: [],
        preferredResourceTypes: [],
        lastActiveDate: new Date()
      };
    }

    // Update completion rate
    const totalSteps = Object.values(progress.phases).reduce((sum, phase) => sum + phase.steps.length, 0);
    const completedSteps = Object.values(progress.phases).reduce(
      (sum, phase) => sum + phase.steps.filter(step => step.status === 'completed').length,
      0
    );
    pattern.completionRate = totalSteps > 0 ? completedSteps / totalSteps : 0;

    // Update time tracking
    if (timeSpent && completedStep) {
      const phase = this.getPhaseForStep(completedStep, progress);
      if (phase) {
        pattern.averageTimePerPhase[phase] = (pattern.averageTimePerPhase[phase] || 0 + timeSpent) / 2;
      }
    }

    // Identify stuck points
    const inProgressSteps = Object.values(progress.phases).flatMap(phase =>
      phase.steps.filter(step => step.status === 'in_progress')
    );

    inProgressSteps.forEach(step => {
      const stepAge = Date.now() - (step.completedAt?.getTime() || Date.now());
      if (stepAge > 7 * 24 * 60 * 60 * 1000) { // Stuck for more than a week
        if (!pattern!.commonStuckPoints.includes(step.stepId)) {
          pattern!.commonStuckPoints.push(step.stepId);
        }
      }
    });

    pattern.lastActiveDate = new Date();
    this.userBehaviorPatterns.set(userId, pattern);
  }

  // Private helper methods

  private initializeIndustryPatterns(): void {
    const patterns: IndustryPattern[] = [
      {
        industry: 'saas',
        commonChallenges: ['user-onboarding', 'pricing-strategy', 'churn-reduction'],
        recommendedResources: ['analytics-tools', 'user-feedback-platforms', 'pricing-calculators'],
        criticalPhases: ['validation', 'technical', 'marketing'],
        timelineMultiplier: 1.2
      },
      {
        industry: 'ecommerce',
        commonChallenges: ['inventory-management', 'payment-processing', 'logistics'],
        recommendedResources: ['ecommerce-platforms', 'payment-gateways', 'shipping-solutions'],
        criticalPhases: ['validation', 'operations', 'marketing'],
        timelineMultiplier: 1.0
      },
      {
        industry: 'fintech',
        commonChallenges: ['regulatory-compliance', 'security', 'trust-building'],
        recommendedResources: ['compliance-guides', 'security-frameworks', 'trust-signals'],
        criticalPhases: ['validation', 'technical', 'risk'],
        timelineMultiplier: 1.5
      },
      {
        industry: 'healthcare',
        commonChallenges: ['hipaa-compliance', 'clinical-validation', 'regulatory-approval'],
        recommendedResources: ['hipaa-guides', 'clinical-trial-resources', 'fda-guidance'],
        criticalPhases: ['validation', 'risk', 'operations'],
        timelineMultiplier: 2.0
      },
      {
        industry: 'marketplace',
        commonChallenges: ['chicken-egg-problem', 'network-effects', 'trust-safety'],
        recommendedResources: ['marketplace-playbooks', 'growth-strategies', 'safety-frameworks'],
        criticalPhases: ['validation', 'marketing', 'operations'],
        timelineMultiplier: 1.3
      }
    ];

    patterns.forEach(pattern => {
      this.industryPatterns.set(pattern.industry, pattern);
    });
  }

  private initializeRiskPatterns(): void {
    this.riskPatterns = [
      {
        condition: (project, progress) => {
          const validationCompletion = progress.phases.validation?.completionPercentage || 0;
          return validationCompletion < 50 && progress.currentPhase !== 'validation';
        },
        riskLevel: 'high',
        description: 'Insufficient market validation may lead to building a product nobody wants',
        category: 'market',
        mitigation: [
          'Return to validation phase',
          'Conduct customer interviews',
          'Validate problem-solution fit'
        ]
      },
      {
        condition: (project, progress) => {
          const technicalCompletion = progress.phases.technical?.completionPercentage || 0;
          const overallCompletion = calculateOverallProgress(progress);
          return technicalCompletion < 40 && overallCompletion > 60;
        },
        riskLevel: 'medium',
        description: 'Technical planning is lagging behind other phases, may cause delays',
        category: 'technical',
        mitigation: [
          'Prioritize technical architecture planning',
          'Consult with technical experts',
          'Create detailed technical roadmap'
        ]
      },
      {
        condition: (project, progress) => {
          const financialCompletion = progress.phases.financial?.completionPercentage || 0;
          return financialCompletion < 30 && calculateOverallProgress(progress) > 50;
        },
        riskLevel: 'medium',
        description: 'Financial planning needs attention to ensure sustainable business model',
        category: 'financial',
        mitigation: [
          'Complete financial projections',
          'Validate pricing strategy',
          'Plan funding requirements'
        ]
      },
      {
        condition: (project, progress) => {
          const daysSinceUpdate = (Date.now() - progress.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceUpdate > 14;
        },
        riskLevel: 'low',
        description: 'Project momentum may be lost due to inactivity',
        category: 'timeline',
        mitigation: [
          'Set regular work sessions',
          'Break down tasks into smaller steps',
          'Find accountability partner'
        ]
      }
    ];
  }

  private formatStepTitle(stepId: string): string {
    return stepId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getStepDescription(stepId: string, phase: LaunchPhase): string {
    const descriptions: Record<string, string> = {
      'market-research': 'Analyze your target market size, trends, and opportunities',
      'competitor-analysis': 'Identify and analyze your main competitors',
      'target-audience': 'Define and validate your target customer segments',
      'value-proposition': 'Create a compelling value proposition for your product',
      'feature-prioritization': 'Prioritize features based on user needs and business value',
      'technical-stack': 'Choose the right technology stack for your product',
      'pricing-strategy': 'Develop a competitive and profitable pricing strategy',
      'marketing-channels': 'Select the most effective marketing channels for your audience',
      'team-structure': 'Plan your team structure and hiring needs',
      'financial-projections': 'Create realistic financial projections and budgets',
      'risk-assessment': 'Identify and assess potential risks to your project',
      'analytics-setup': 'Set up analytics to measure your product\'s success'
    };

    return descriptions[stepId] || `Complete the ${this.formatStepTitle(stepId)} step in the ${phase} phase`;
  }

  private getStepActionItems(stepId: string, phase: LaunchPhase): string[] {
    const actionItems: Record<string, string[]> = {
      'market-research': [
        'Research market size and growth trends',
        'Identify market segments and opportunities',
        'Gather data from reliable sources'
      ],
      'competitor-analysis': [
        'List direct and indirect competitors',
        'Analyze their strengths and weaknesses',
        'Identify competitive advantages'
      ],
      'target-audience': [
        'Create detailed user personas',
        'Conduct customer interviews',
        'Validate assumptions with data'
      ],
      'value-proposition': [
        'Define unique value proposition',
        'Test messaging with target audience',
        'Refine based on feedback'
      ]
    };

    return actionItems[stepId] || [
      `Research best practices for ${this.formatStepTitle(stepId)}`,
      `Complete the required information`,
      `Review and validate your inputs`
    ];
  }

  private getPhaseProgressionRecommendations(progress: UserProgress): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const currentPhaseCompletion = progress.phases[progress.currentPhase]?.completionPercentage || 0;

    // Suggest moving to next phase if current is mostly complete
    if (currentPhaseCompletion >= 80) {
      const nextPhase = this.getNextPhase(progress.currentPhase);
      if (nextPhase) {
        recommendations.push({
          id: `phase-progression-${nextPhase}`,
          type: 'next-step',
          title: `Ready for ${this.formatStepTitle(nextPhase)} Phase`,
          description: `You've made great progress on ${progress.currentPhase}. Consider moving to ${nextPhase}.`,
          priority: 'medium',
          category: nextPhase,
          actionItems: [
            `Review ${progress.currentPhase} phase completeness`,
            `Start planning ${nextPhase} activities`,
            `Set goals for the new phase`
          ]
        });
      }
    }

    return recommendations;
  }

  private getCriticalPathRecommendations(progress: UserProgress, projectData?: ProjectData): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Industry-specific critical path
    if (projectData) {
      const industryPattern = this.industryPatterns.get(projectData.industry.toLowerCase());
      if (industryPattern) {
        industryPattern.criticalPhases.forEach(phase => {
          const phaseCompletion = progress.phases[phase]?.completionPercentage || 0;
          if (phaseCompletion < 60) {
            recommendations.push({
              id: `critical-${phase}`,
              type: 'next-step',
              title: `Critical: Complete ${this.formatStepTitle(phase)} Phase`,
              description: `${this.formatStepTitle(phase)} is critical for ${projectData.industry} projects`,
              priority: 'high',
              category: phase,
              actionItems: [
                `Focus on ${phase} phase completion`,
                'Allocate more time to this critical area',
                'Consider getting expert help if needed'
              ]
            });
          }
        });
      }
    }

    return recommendations;
  }

  private getNextPhase(currentPhase: LaunchPhase): LaunchPhase | null {
    const phaseOrder: LaunchPhase[] = [
      'validation', 'definition', 'technical', 'marketing',
      'operations', 'financial', 'risk', 'optimization'
    ];

    const currentIndex = phaseOrder.indexOf(currentPhase);
    return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
  }

  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  private getIndustryResources(pattern: IndustryPattern, context: ProjectContext): Resource[] {
    return pattern.recommendedResources.map((resourceType, index) => ({
      id: `industry-${pattern.industry}-${index}`,
      title: this.formatStepTitle(resourceType),
      description: `${this.formatStepTitle(resourceType)} specifically for ${pattern.industry} projects`,
      type: 'tool' as const,
      tags: [pattern.industry, resourceType, context.stage]
    }));
  }

  private getStageResources(stage: ProjectStage, context: ProjectContext): Resource[] {
    const stageResources: Record<ProjectStage, Resource[]> = {
      concept: [
        {
          id: 'concept-validation-guide',
          title: 'Concept Validation Guide',
          description: 'Step-by-step guide to validate your initial concept',
          type: 'article',
          tags: ['concept', 'validation', 'guide']
        }
      ],
      validation: [
        {
          id: 'customer-interview-template',
          title: 'Customer Interview Template',
          description: 'Template for conducting effective customer interviews',
          type: 'template',
          tags: ['validation', 'interviews', 'customers']
        }
      ],
      development: [
        {
          id: 'mvp-development-guide',
          title: 'MVP Development Guide',
          description: 'Best practices for building your minimum viable product',
          type: 'article',
          tags: ['development', 'mvp', 'technical']
        }
      ],
      testing: [
        {
          id: 'testing-framework',
          title: 'Product Testing Framework',
          description: 'Comprehensive framework for testing your product',
          type: 'tool',
          tags: ['testing', 'quality', 'framework']
        }
      ],
      launch: [
        {
          id: 'launch-checklist',
          title: 'Product Launch Checklist',
          description: 'Complete checklist for a successful product launch',
          type: 'template',
          tags: ['launch', 'checklist', 'marketing']
        }
      ],
      growth: [
        {
          id: 'growth-strategies',
          title: 'Growth Strategy Playbook',
          description: 'Proven strategies for scaling your product',
          type: 'article',
          tags: ['growth', 'scaling', 'strategy']
        }
      ]
    };

    return stageResources[stage] || [];
  }

  private getPhaseResources(phase: LaunchPhase, context: ProjectContext): Resource[] {
    const phaseResources: Record<LaunchPhase, Resource[]> = {
      validation: [
        {
          id: 'market-research-tools',
          title: 'Market Research Tools',
          description: 'Collection of tools for market research and analysis',
          type: 'tool',
          tags: ['validation', 'market-research', 'tools']
        }
      ],
      definition: [
        {
          id: 'product-definition-canvas',
          title: 'Product Definition Canvas',
          description: 'Visual canvas for defining your product',
          type: 'template',
          tags: ['definition', 'canvas', 'product']
        }
      ],
      technical: [
        {
          id: 'tech-stack-selector',
          title: 'Technology Stack Selector',
          description: 'Tool to help choose the right technology stack',
          type: 'tool',
          tags: ['technical', 'technology', 'selection']
        }
      ],
      marketing: [
        {
          id: 'marketing-channel-guide',
          title: 'Marketing Channel Selection Guide',
          description: 'Guide to choosing the right marketing channels',
          type: 'article',
          tags: ['marketing', 'channels', 'guide']
        }
      ],
      operations: [
        {
          id: 'operations-playbook',
          title: 'Operations Playbook',
          description: 'Comprehensive guide to setting up operations',
          type: 'article',
          tags: ['operations', 'processes', 'playbook']
        }
      ],
      financial: [
        {
          id: 'financial-model-template',
          title: 'Financial Model Template',
          description: 'Excel template for financial modeling',
          type: 'template',
          tags: ['financial', 'modeling', 'template']
        }
      ],
      risk: [
        {
          id: 'risk-assessment-framework',
          title: 'Risk Assessment Framework',
          description: 'Framework for identifying and assessing risks',
          type: 'tool',
          tags: ['risk', 'assessment', 'framework']
        }
      ],
      optimization: [
        {
          id: 'analytics-setup-guide',
          title: 'Analytics Setup Guide',
          description: 'Guide to setting up product analytics',
          type: 'article',
          tags: ['optimization', 'analytics', 'guide']
        }
      ]
    };

    return phaseResources[phase] || [];
  }

  private getBudgetAppropriateResources(budget: number, teamSize: number): Resource[] {
    const resources: Resource[] = [];

    if (budget < 10000) {
      resources.push({
        id: 'lean-startup-resources',
        title: 'Lean Startup Resources',
        description: 'Free and low-cost resources for lean startups',
        type: 'article',
        tags: ['lean', 'budget', 'startup']
      });
    }

    if (teamSize === 1) {
      resources.push({
        id: 'solo-founder-guide',
        title: 'Solo Founder Guide',
        description: 'Resources and strategies for solo founders',
        type: 'article',
        tags: ['solo', 'founder', 'guide']
      });
    }

    return resources;
  }

  private deduplicateResources(resources: Resource[]): Resource[] {
    const seen = new Set<string>();
    return resources.filter(resource => {
      if (seen.has(resource.id)) {
        return false;
      }
      seen.add(resource.id);
      return true;
    });
  }

  private calculateRiskProbability(
    pattern: RiskPattern,
    projectData: ProjectData,
    progress: UserProgress
  ): 'low' | 'medium' | 'high' {
    // Simple probability calculation based on pattern and project characteristics
    let score = 0;

    // Base score from pattern
    const riskLevelScores = { low: 1, medium: 2, high: 3 };
    score += riskLevelScores[pattern.riskLevel];

    // Adjust based on project stage
    if (projectData.stage === 'concept' || projectData.stage === 'validation') {
      score += 1; // Higher risk in early stages
    }

    // Adjust based on progress
    const overallCompletion = calculateOverallProgress(progress);
    if (overallCompletion < 25) {
      score += 1;
    }

    return score <= 2 ? 'low' : score <= 4 ? 'medium' : 'high';
  }

  private calculateRiskImpact(
    pattern: RiskPattern,
    projectData: ProjectData,
    progress: UserProgress
  ): 'low' | 'medium' | 'high' {
    // Impact calculation based on project characteristics
    let score = 0;

    // Base score from pattern category
    const categoryImpacts = {
      technical: 2,
      market: 3,
      financial: 3,
      operational: 2,
      timeline: 1
    };
    score += categoryImpacts[pattern.category];

    // Adjust based on project stage
    if (projectData.stage === 'launch' || projectData.stage === 'growth') {
      score += 1; // Higher impact in later stages
    }

    return score <= 2 ? 'low' : score <= 4 ? 'medium' : 'high';
  }

  private calculateRiskPriority(riskLevel: 'low' | 'medium' | 'high'): number {
    const priorities = { low: 1, medium: 2, high: 3 };
    return priorities[riskLevel];
  }

  private identifyTimelineRisks(projectData: ProjectData, progress: UserProgress): Risk[] {
    const risks: Risk[] = [];
    const daysSinceUpdate = (Date.now() - progress.updatedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > 30) {
      risks.push({
        id: 'timeline-stagnation',
        title: 'Project Stagnation Risk',
        description: 'Project has been inactive for over 30 days, risking momentum loss',
        category: 'timeline',
        probability: 'high',
        impact: 'medium',
        priority: 2,
        owner: 'Product Owner'
      });
    }

    return risks;
  }

  private identifyResourceRisks(projectData: ProjectData, progress: UserProgress): Risk[] {
    const risks: Risk[] = [];

    // Check if financial planning is incomplete
    const financialCompletion = progress.phases.financial?.completionPercentage || 0;
    if (financialCompletion < 50 && calculateOverallProgress(progress) > 50) {
      risks.push({
        id: 'resource-financial',
        title: 'Financial Planning Risk',
        description: 'Insufficient financial planning may lead to resource constraints',
        category: 'financial',
        probability: 'medium',
        impact: 'high',
        priority: 3,
        owner: 'Product Owner'
      });
    }

    return risks;
  }

  private identifyMarketRisks(projectData: ProjectData, progress: UserProgress): Risk[] {
    const risks: Risk[] = [];

    // Check validation completeness
    const validationCompletion = progress.phases.validation?.completionPercentage || 0;
    if (validationCompletion < 70) {
      risks.push({
        id: 'market-validation',
        title: 'Market Validation Risk',
        description: 'Insufficient market validation increases risk of product-market fit failure',
        category: 'market',
        probability: 'high',
        impact: 'high',
        priority: 3,
        owner: 'Product Owner'
      });
    }

    return risks;
  }

  private prioritizeRisks(risks: Risk[]): Risk[] {
    return risks.sort((a, b) => b.priority - a.priority);
  }

  private getFirstTimeUserRecommendations(progress: UserProgress, projectData: ProjectData): Recommendation[] {
    return [
      {
        id: 'first-time-welcome',
        type: 'next-step',
        title: 'Welcome to Product Launch Essentials',
        description: 'Start with the validation phase to ensure you\'re building something people want',
        priority: 'high',
        category: 'validation',
        actionItems: [
          'Complete the market research step',
          'Identify your target audience',
          'Validate your problem hypothesis'
        ]
      },
      {
        id: 'first-time-resources',
        type: 'resource',
        title: 'Getting Started Resources',
        description: 'Essential resources for first-time product builders',
        priority: 'medium',
        category: 'general',
        actionItems: [
          'Read the product launch guide',
          'Watch introductory videos',
          'Join the community forum'
        ]
      }
    ];
  }

  private getStuckPointSolutions(stuckPoint: string): string[] {
    const solutions: Record<string, string[]> = {
      'market-research': [
        'Use free market research tools like Google Trends',
        'Conduct surveys with potential customers',
        'Analyze competitor websites and reviews'
      ],
      'pricing-strategy': [
        'Research competitor pricing',
        'Calculate your costs and desired margins',
        'Test different price points with potential customers'
      ],
      'technical-architecture': [
        'Consult with a technical advisor',
        'Start with a simple MVP architecture',
        'Use proven technology stacks'
      ]
    };

    return solutions[stuckPoint] || [
      'Break the task into smaller steps',
      'Seek help from experts or community',
      'Look for templates or examples'
    ];
  }

  private getPreferredResourceRecommendations(
    preferredTypes: string[],
    currentPhase: LaunchPhase
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    preferredTypes.forEach(type => {
      recommendations.push({
        id: `preferred-${type}-${currentPhase}`,
        type: 'resource',
        title: `${this.formatStepTitle(type)} for ${this.formatStepTitle(currentPhase)}`,
        description: `${this.formatStepTitle(type)} resources tailored for the ${currentPhase} phase`,
        priority: 'medium',
        category: currentPhase,
        actionItems: [
          `Explore ${type} resources`,
          'Apply learnings to current phase',
          'Share feedback on resource quality'
        ]
      });
    });

    return recommendations;
  }

  private getPhaseTemplates(phase: LaunchPhase, industry: string): string[] {
    const templates: Record<LaunchPhase, string[]> = {
      validation: [
        'Customer Interview Script',
        'Market Research Template',
        'Competitor Analysis Framework'
      ],
      definition: [
        'Product Vision Template',
        'Value Proposition Canvas',
        'Feature Prioritization Matrix'
      ],
      technical: [
        'Technical Requirements Document',
        'Architecture Decision Record',
        'Technology Evaluation Matrix'
      ],
      marketing: [
        'Go-to-Market Strategy Template',
        'Marketing Channel Plan',
        'Launch Timeline Template'
      ],
      operations: [
        'Process Documentation Template',
        'Team Structure Plan',
        'Support Playbook Template'
      ],
      financial: [
        'Financial Model Template',
        'Budget Planning Worksheet',
        'Funding Strategy Template'
      ],
      risk: [
        'Risk Register Template',
        'Risk Assessment Matrix',
        'Mitigation Plan Template'
      ],
      optimization: [
        'Analytics Setup Checklist',
        'A/B Testing Framework',
        'Performance Dashboard Template'
      ]
    };

    return templates[phase] || [];
  }

  private getIndustryFrameworkAdjustments(pattern: IndustryPattern, context: ContentSuggestionContext): string[] {
    const adjustments: string[] = [];

    // Add industry-specific considerations
    adjustments.push(`Focus on ${pattern.industry}-specific challenges`);
    adjustments.push(`Consider ${pattern.industry} regulatory requirements`);

    // Add timeline adjustments
    if (pattern.timelineMultiplier > 1.2) {
      adjustments.push('Allow extra time for industry-specific requirements');
    }

    // Add critical phase emphasis
    pattern.criticalPhases.forEach(phase => {
      if (phase === context.currentPhase) {
        adjustments.push(`This phase is critical for ${pattern.industry} success`);
      }
    });

    return adjustments;
  }

  private generateContentFromUserInput(userInput: Record<string, any>, currentPhase: LaunchPhase): string[] {
    const ideas: string[] = [];

    // Analyze user input for content opportunities
    Object.entries(userInput).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 10) {
        ideas.push(`Expand on "${key}" with specific examples`);
        ideas.push(`Consider alternative approaches to "${key}"`);
      }
    });

    // Phase-specific content ideas
    if (currentPhase === 'validation' && userInput.targetAudience) {
      ideas.push('Create detailed user personas based on your target audience');
      ideas.push('Develop interview questions for your target audience');
    }

    if (currentPhase === 'marketing' && userInput.channels) {
      ideas.push('Create content calendar for selected channels');
      ideas.push('Develop channel-specific messaging strategies');
    }

    return ideas.slice(0, 5); // Limit to top 5 ideas
  }

  private getPhaseForStep(stepId: string, progress: UserProgress): LaunchPhase | null {
    for (const [phase, phaseProgress] of Object.entries(progress.phases)) {
      if (phaseProgress.steps.some(step => step.stepId === stepId)) {
        return phase as LaunchPhase;
      }
    }
    return null;
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
