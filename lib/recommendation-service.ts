import {
  LaunchPhase,
  ProjectContext,
  ProjectData,
  Recommendation,
  Resource,
  Risk,
  UserProgress
} from '@/types/launch-essentials';
import { ProjectDataService } from './launch-essentials-firestore';
import { progressTracker } from './progress-tracker';
import { recommendationEngine } from './recommendation-engine';

/**
 * Service that integrates the recommendation engine with the launch essentials system
 * Provides high-level methods for getting recommendations, resources, and risk analysis
 */
export class RecommendationService {
  /**
   * Get comprehensive recommendations for a user's project
   */
  async getRecommendations(
    userId: string,
    projectId: string
  ): Promise<{
    nextSteps: Recommendation[];
    resources: Resource[];
    risks: Risk[];
    personalizedRecommendations: Recommendation[];
  }> {
    try {
      // Get current progress and project data
      const [progress, projectData] = await Promise.all([
        progressTracker.getProgress(userId, projectId),
        ProjectDataService.getProjectData(projectId)
      ]);

      if (!progress || !projectData) {
        throw new Error('Progress or project data not found');
      }

      // Generate recommendations
      const nextSteps = recommendationEngine.calculateNextSteps(progress, projectData);
      const risks = recommendationEngine.identifyRisks(projectData, progress);
      const personalizedRecommendations = recommendationEngine.generatePersonalizedRecommendations(
        userId,
        progress,
        projectData
      );

      // Create project context for resource suggestions
      const context: ProjectContext = {
        projectId,
        industry: projectData.industry,
        stage: projectData.stage,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        timeline: this.estimateTimeline(projectData)
      };

      const resources = recommendationEngine.suggestResources(context, progress);

      return {
        nextSteps,
        resources,
        risks,
        personalizedRecommendations
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Get phase-specific recommendations
   */
  async getPhaseRecommendations(
    userId: string,
    projectId: string,
    phase: LaunchPhase
  ): Promise<{
    recommendations: Recommendation[];
    resources: Resource[];
    contentSuggestions: {
      templateSuggestions: string[];
      frameworkAdjustments: string[];
      contentIdeas: string[];
    };
  }> {
    try {
      const [progress, projectData] = await Promise.all([
        progressTracker.getProgress(userId, projectId),
        ProjectDataService.getProjectData(projectId)
      ]);

      if (!progress || !projectData) {
        throw new Error('Progress or project data not found');
      }

      // Filter recommendations for specific phase
      const allRecommendations = recommendationEngine.calculateNextSteps(progress, projectData);
      const recommendations = allRecommendations.filter(rec => rec.category === phase);

      // Get phase-specific resources
      const context: ProjectContext = {
        projectId,
        industry: projectData.industry,
        stage: projectData.stage,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        timeline: this.estimateTimeline(projectData)
      };

      const allResources = recommendationEngine.suggestResources(context, progress);
      const resources = allResources.filter(resource => resource.tags.includes(phase));

      // Get content suggestions for the phase
      const phaseData = projectData.data[phase] || {};
      const contentSuggestions = recommendationEngine.suggestContent({
        currentPhase: phase,
        projectStage: projectData.stage,
        industry: projectData.industry,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        completedSteps: progress.phases[phase]?.steps
          .filter(step => step.status === 'completed')
          .map(step => step.stepId) || [],
        userInput: phaseData
      });

      return {
        recommendations,
        resources,
        contentSuggestions
      };
    } catch (error) {
      console.error('Error getting phase recommendations:', error);
      throw error;
    }
  }

  /**
   * Get risk analysis for a project
   */
  async getRiskAnalysis(
    userId: string,
    projectId: string
  ): Promise<{
    risks: Risk[];
    riskSummary: {
      totalRisks: number;
      highPriorityRisks: number;
      criticalCategories: string[];
      overallRiskLevel: 'low' | 'medium' | 'high';
    };
    mitigationRecommendations: Recommendation[];
  }> {
    try {
      const [progress, projectData] = await Promise.all([
        progressTracker.getProgress(userId, projectId),
        ProjectDataService.getProjectData(projectId)
      ]);

      if (!progress || !projectData) {
        throw new Error('Progress or project data not found');
      }

      const risks = recommendationEngine.identifyRisks(projectData, progress);

      // Calculate risk summary
      const highPriorityRisks = risks.filter(risk => risk.priority >= 3).length;
      const criticalCategories = [...new Set(
        risks
          .filter(risk => risk.priority >= 2)
          .map(risk => risk.category)
      )];

      const overallRiskLevel = this.calculateOverallRiskLevel(risks);

      // Generate mitigation recommendations
      const mitigationRecommendations = risks
        .filter(risk => risk.priority >= 2)
        .map(risk => ({
          id: `mitigation-${risk.id}`,
          type: 'risk' as const,
          title: `Mitigate ${risk.title}`,
          description: `Address the ${risk.category} risk: ${risk.description}`,
          priority: risk.priority >= 3 ? 'high' as const : 'medium' as const,
          category: risk.category,
          actionItems: this.getRiskMitigationActions(risk)
        }));

      return {
        risks,
        riskSummary: {
          totalRisks: risks.length,
          highPriorityRisks,
          criticalCategories,
          overallRiskLevel
        },
        mitigationRecommendations
      };
    } catch (error) {
      console.error('Error getting risk analysis:', error);
      throw error;
    }
  }

  /**
   * Update user behavior and get updated recommendations
   */
  async updateUserActivity(
    userId: string,
    projectId: string,
    completedStep?: string,
    timeSpent?: number
  ): Promise<Recommendation[]> {
    try {
      const progress = await progressTracker.getProgress(userId, projectId);
      if (!progress) {
        throw new Error('Progress not found');
      }

      // Update user behavior pattern
      recommendationEngine.updateUserBehaviorPattern(userId, progress, completedStep, timeSpent);

      // Get updated personalized recommendations
      const projectData = await ProjectDataService.getProjectData(projectId);
      if (!projectData) {
        throw new Error('Project data not found');
      }

      return recommendationEngine.generatePersonalizedRecommendations(userId, progress, projectData);
    } catch (error) {
      console.error('Error updating user activity:', error);
      throw error;
    }
  }

  /**
   * Get smart content suggestions based on user input
   */
  async getContentSuggestions(
    userId: string,
    projectId: string,
    phase: LaunchPhase,
    userInput: Record<string, any>
  ): Promise<{
    templateSuggestions: string[];
    frameworkAdjustments: string[];
    contentIdeas: string[];
    relatedResources: Resource[];
  }> {
    try {
      const [progress, projectData] = await Promise.all([
        progressTracker.getProgress(userId, projectId),
        ProjectDataService.getProjectData(projectId)
      ]);

      if (!progress || !projectData) {
        throw new Error('Progress or project data not found');
      }

      const contentSuggestions = recommendationEngine.suggestContent({
        currentPhase: phase,
        projectStage: projectData.stage,
        industry: projectData.industry,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        completedSteps: progress.phases[phase]?.steps
          .filter(step => step.status === 'completed')
          .map(step => step.stepId) || [],
        userInput
      });

      // Get related resources based on user input
      const context: ProjectContext = {
        projectId,
        industry: projectData.industry,
        stage: projectData.stage,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        timeline: this.estimateTimeline(projectData)
      };

      const allResources = recommendationEngine.suggestResources(context, progress);
      const relatedResources = allResources.filter(resource =>
        resource.tags.includes(phase) ||
        resource.tags.some(tag =>
          Object.keys(userInput).some(key =>
            key.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );

      return {
        ...contentSuggestions,
        relatedResources
      };
    } catch (error) {
      console.error('Error getting content suggestions:', error);
      throw error;
    }
  }

  /**
   * Get progress-based insights and recommendations
   */
  async getProgressInsights(
    userId: string,
    projectId: string
  ): Promise<{
    progressSummary: {
      overallCompletion: number;
      currentPhase: LaunchPhase;
      completedPhases: number;
      stuckAreas: string[];
      momentum: 'high' | 'medium' | 'low';
    };
    insights: string[];
    recommendations: Recommendation[];
  }> {
    try {
      const progress = await progressTracker.getProgress(userId, projectId);
      if (!progress) {
        throw new Error('Progress not found');
      }

      const progressCalculation = progressTracker.calculateProgress(progress);

      // Calculate momentum based on recent activity
      const daysSinceUpdate = (Date.now() - progress.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      const momentum = daysSinceUpdate < 3 ? 'high' : daysSinceUpdate < 7 ? 'medium' : 'low';

      // Identify stuck areas (phases with low completion relative to overall progress)
      const stuckAreas: string[] = [];
      const overallCompletion = progressCalculation.overallCompletion;

      Object.entries(progressCalculation.phaseCompletion).forEach(([phase, completion]) => {
        if (completion < overallCompletion - 20) { // 20% threshold
          stuckAreas.push(phase);
        }
      });

      // Generate insights
      const insights = this.generateProgressInsights(progress, progressCalculation);

      // Get targeted recommendations
      const projectData = await ProjectDataService.getProjectData(projectId);
      const recommendations = projectData
        ? recommendationEngine.calculateNextSteps(progress, projectData)
        : [];

      return {
        progressSummary: {
          overallCompletion: progressCalculation.overallCompletion,
          currentPhase: progress.currentPhase,
          completedPhases: Object.values(progressCalculation.phaseCompletion)
            .filter(completion => completion === 100).length,
          stuckAreas,
          momentum
        },
        insights,
        recommendations: recommendations.slice(0, 5) // Top 5 recommendations
      };
    } catch (error) {
      console.error('Error getting progress insights:', error);
      throw error;
    }
  }

  // Private helper methods

  private estimateTeamSize(projectData: ProjectData): number {
    // Estimate team size based on project data
    const operationsData = projectData.data.operations;
    if (operationsData?.team?.structure) {
      return operationsData.team.structure.length;
    }
    return 1; // Default to solo founder
  }

  private estimateBudget(projectData: ProjectData): number {
    // Estimate budget based on financial data
    const financialData = projectData.data.financial;
    if (financialData?.funding?.requirements) {
      return financialData.funding.requirements;
    }
    return 10000; // Default budget
  }

  private estimateTimeline(projectData: ProjectData): string {
    // Estimate timeline based on project stage and industry
    const stageTimelines = {
      concept: '1-2 months',
      validation: '2-3 months',
      development: '3-6 months',
      testing: '1-2 months',
      launch: '1 month',
      growth: 'ongoing'
    };
    return stageTimelines[projectData.stage] || '3-6 months';
  }

  private calculateOverallRiskLevel(risks: Risk[]): 'low' | 'medium' | 'high' {
    if (risks.length === 0) return 'low';

    const highPriorityRisks = risks.filter(risk => risk.priority >= 3).length;
    const mediumPriorityRisks = risks.filter(risk => risk.priority === 2).length;

    if (highPriorityRisks >= 2) return 'high';
    if (highPriorityRisks >= 1 || mediumPriorityRisks >= 3) return 'medium';
    return 'low';
  }

  private getRiskMitigationActions(risk: Risk): string[] {
    const categoryActions: Record<string, string[]> = {
      technical: [
        'Consult with technical experts',
        'Create detailed technical specifications',
        'Prototype critical components early'
      ],
      market: [
        'Conduct additional market research',
        'Validate assumptions with target customers',
        'Consider pivot strategies'
      ],
      financial: [
        'Review financial projections',
        'Explore additional funding sources',
        'Optimize cost structure'
      ],
      operational: [
        'Streamline processes',
        'Identify resource gaps',
        'Plan for scalability'
      ],
      timeline: [
        'Break down tasks into smaller steps',
        'Set regular milestones',
        'Increase work frequency'
      ]
    };

    return categoryActions[risk.category] || [
      'Assess the risk impact',
      'Develop mitigation strategies',
      'Monitor risk indicators'
    ];
  }

  private generateProgressInsights(
    progress: UserProgress,
    calculation: any
  ): string[] {
    const insights: string[] = [];

    // Overall progress insights
    if (calculation.overallCompletion < 25) {
      insights.push('You\'re in the early stages - focus on validation to build a strong foundation');
    } else if (calculation.overallCompletion < 50) {
      insights.push('Good progress! Make sure to define your product clearly before moving forward');
    } else if (calculation.overallCompletion < 75) {
      insights.push('You\'re making solid progress - start thinking about go-to-market strategy');
    } else {
      insights.push('Excellent progress! You\'re almost ready for launch');
    }

    // Phase-specific insights
    const currentPhaseCompletion = calculation.phaseCompletion[progress.currentPhase] || 0;
    if (currentPhaseCompletion < 50) {
      insights.push(`Focus on completing the ${progress.currentPhase} phase - it's critical for your success`);
    }

    // Momentum insights
    const daysSinceUpdate = (Date.now() - progress.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 7) {
      insights.push('Consider setting aside regular time for project work to maintain momentum');
    } else if (daysSinceUpdate < 2) {
      insights.push('Great momentum! Keep up the consistent progress');
    }

    return insights;
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
