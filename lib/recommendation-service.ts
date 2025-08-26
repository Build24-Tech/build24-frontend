import {
  LaunchPhase,
  ProjectData,
  Recommendation,
  Resource,
  Risk,
  UserProgress as LaunchUserProgress
} from '@/types/launch-essentials';
import { ProjectDataService } from './launch-essentials-firestore';
import { progressTracker } from './progress-tracker';
import { recommendationEngine } from './recommendation-engine';

// Define ProjectContext interface locally since it's not in types
interface ProjectContext {
  projectId: string;
  industry: string;
  stage: string;
  teamSize: number;
  budget: number;
  timeline: string;
}

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
      const nextSteps = recommendationEngine.calculateNextSteps(progress);
      const risks = recommendationEngine.identifyRisks(projectData, progress);
      const personalizedRecommendations = recommendationEngine.generatePersonalizedRecommendations(
        progress,
        projectData,
        {}
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

      const resources = recommendationEngine.suggestResources(context);

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
      const allRecommendations = recommendationEngine.calculateNextSteps(progress);
      const recommendations = allRecommendations.filter((rec: Recommendation) => rec.category === phase);

      // Get phase-specific resources
      const context: ProjectContext = {
        projectId,
        industry: projectData.industry,
        stage: projectData.stage,
        teamSize: this.estimateTeamSize(projectData),
        budget: this.estimateBudget(projectData),
        timeline: this.estimateTimeline(projectData)
      };

      const allResources = recommendationEngine.suggestResources(context);
      const resources = allResources.filter((resource: Resource) => 
        (resource as any).tags && (resource as any).tags.includes(phase)
      );

      // Get content suggestions for the phase
      const phaseData = projectData.data[phase] || {};
      const contentSuggestions = recommendationEngine.suggestContent({
        userInput: JSON.stringify(phaseData)
      });

      return {
        recommendations,
        resources,
        contentSuggestions: {
          templateSuggestions: contentSuggestions.templateSuggestions || [],
          frameworkAdjustments: contentSuggestions.frameworkAdjustments || [],
          contentIdeas: contentSuggestions.contentIdeas || []
        }
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
      const highPriorityRisks = risks.filter((risk: Risk) => risk.severity === 'high' || risk.severity === 'critical').length;
      const criticalCategories: string[] = Array.from(new Set(
        risks
          .filter((risk: Risk) => risk.severity === 'high' || risk.severity === 'critical')
          .map((risk: Risk) => risk.category)
      ));

      const overallRiskLevel = this.calculateOverallRiskLevel(risks);

      // Generate mitigation recommendations
      const mitigationRecommendations = risks
        .filter((risk: Risk) => risk.severity === 'medium' || risk.severity === 'high' || risk.severity === 'critical')
        .map((risk: Risk) => ({
          id: `mitigation-${risk.id}`,
          title: `Mitigate ${risk.title}`,
          description: `Address the ${risk.category} risk: ${risk.description}`,
          priority: (risk.severity === 'high' || risk.severity === 'critical') ? 'high' as const : 'medium' as const,
          phase: 'risk' as LaunchPhase,
          category: risk.category,
          estimatedTime: '2-4 hours',
          type: 'risk',
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

      // Get updated personalized recommendations
      const projectData = await ProjectDataService.getProjectData(projectId);
      if (!projectData) {
        throw new Error('Project data not found');
      }

      return recommendationEngine.generatePersonalizedRecommendations(progress, projectData, {});
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
        userInput: JSON.stringify(userInput)
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

      const allResources = recommendationEngine.suggestResources(context);
      const relatedResources = allResources.filter((resource: Resource) =>
        resource.category === phase ||
        Object.keys(userInput).some(key =>
          key.toLowerCase().includes(resource.category.toLowerCase())
        )
      );

      return {
        templateSuggestions: contentSuggestions.templateSuggestions || [],
        frameworkAdjustments: contentSuggestions.frameworkAdjustments || [],
        contentIdeas: contentSuggestions.contentIdeas || [],
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

      // Use progressTracker.calculateProgress if available, otherwise calculate manually
      let progressCalculation;
      try {
        progressCalculation = progressTracker.calculateProgress ? 
          progressTracker.calculateProgress(progress) : 
          this.calculateProgressManually(progress);
      } catch (error) {
        progressCalculation = this.calculateProgressManually(progress);
      }

      // Calculate momentum based on recent activity
      const daysSinceUpdate = (Date.now() - progress.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      const momentum = daysSinceUpdate < 3 ? 'high' : daysSinceUpdate < 7 ? 'medium' : 'low';

      // Identify stuck areas (phases with low completion relative to overall progress)
      const stuckAreas: string[] = [];
      const calculatedOverallCompletion = progressCalculation.overallCompletion;

      Object.entries(progressCalculation.phaseCompletion).forEach(([phase, completion]) => {
        // A phase is considered stuck if it's significantly behind the overall completion
        // and the overall completion is above 20% (meaning some progress has been made)
        if (typeof completion === 'number' && calculatedOverallCompletion > 20 && 
            completion < calculatedOverallCompletion - 20) { // 20% threshold
          stuckAreas.push(phase);
        }
      });

      // Generate insights
      const insights = this.generateProgressInsights(progress, progressCalculation);

      // Get targeted recommendations
      const projectData = await ProjectDataService.getProjectData(projectId);
      const recommendations = projectData
        ? recommendationEngine.calculateNextSteps(progress)
        : [];

      return {
        progressSummary: {
          overallCompletion: progressCalculation.overallCompletion,
          currentPhase: progress.currentPhase,
          completedPhases: Object.values(progressCalculation.phaseCompletion)
            .filter((completion: unknown) => typeof completion === 'number' && completion === 100).length,
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

    const highPriorityRisks = risks.filter(risk => risk.severity === 'high' || risk.severity === 'critical').length;
    const mediumPriorityRisks = risks.filter(risk => risk.severity === 'medium').length;

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

    return categoryActions[risk.type] || [
      'Assess the risk impact',
      'Develop mitigation strategies',
      'Monitor risk indicators'
    ];
  }

  private calculateProgressManually(progress: LaunchUserProgress): { overallCompletion: number; phaseCompletion: Record<string, number> } {
    const phaseCompletion: Record<string, number> = {};
    let totalCompletion = 0;
    const phases = Object.keys(progress.phases);

    phases.forEach(phase => {
      const phaseProgress = progress.phases[phase as LaunchPhase];
      phaseCompletion[phase] = phaseProgress?.completionPercentage || 0;
      totalCompletion += phaseProgress?.completionPercentage || 0;
    });

    const overallCompletion = phases.length > 0 ? totalCompletion / phases.length : 0;
    return { overallCompletion, phaseCompletion };
  }

  private generateProgressInsights(
    progress: LaunchUserProgress,
    calculation: { overallCompletion: number; phaseCompletion: Record<string, number> }
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
