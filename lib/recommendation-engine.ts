import { LaunchPhase, ProjectData, Recommendation, Resource, Risk, UserProgress } from '@/types/launch-essentials';

export class RecommendationEngine {
  static getNextSteps(userProgress: UserProgress): Recommendation[] {
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

  static identifyRisks(projectData: ProjectData, userProgress: UserProgress): Risk[] {
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
    userProgress: UserProgress,
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
