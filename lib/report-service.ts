import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { ExportOptions, ProjectInsights } from './export-utils';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  targetAudience: 'internal' | 'stakeholder' | 'investor' | 'team';
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'progress' | 'insights' | 'recommendations' | 'charts' | 'detailed';
  required: boolean;
  stakeholderVisible: boolean;
}

export interface GeneratedReport {
  id: string;
  projectId: string;
  templateId: string;
  title: string;
  content: ReportContent;
  generatedAt: Date;
  format: string;
}

export interface ReportContent {
  executiveSummary: string;
  progressOverview: ProgressSummary;
  phaseAnalysis: PhaseAnalysis[];
  insights: ProjectInsights;
  recommendations: string[];
  charts?: ChartData[];
  appendices?: ReportAppendix[];
}

export interface ProgressSummary {
  overallCompletion: number;
  phasesCompleted: number;
  totalPhases: number;
  timeSpent: number;
  estimatedTimeRemaining: number;
}

export interface PhaseAnalysis {
  phase: LaunchPhase;
  completion: number;
  keyAchievements: string[];
  challenges: string[];
  nextSteps: string[];
  riskFactors: string[];
}

export interface ChartData {
  type: 'bar' | 'pie' | 'line' | 'radar';
  title: string;
  data: any;
  description: string;
}

export interface ReportAppendix {
  title: string;
  content: string;
  type: 'data' | 'methodology' | 'references';
}

export class ReportService {
  private static templates: ReportTemplate[] = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for stakeholders and executives',
      targetAudience: 'stakeholder',
      sections: [
        { id: 'summary', title: 'Executive Summary', type: 'summary', required: true, stakeholderVisible: true },
        { id: 'progress', title: 'Progress Overview', type: 'progress', required: true, stakeholderVisible: true },
        { id: 'insights', title: 'Key Insights', type: 'insights', required: true, stakeholderVisible: true },
        { id: 'recommendations', title: 'Recommendations', type: 'recommendations', required: true, stakeholderVisible: true }
      ]
    },
    {
      id: 'detailed-analysis',
      name: 'Detailed Analysis Report',
      description: 'Comprehensive analysis for internal teams',
      targetAudience: 'internal',
      sections: [
        { id: 'summary', title: 'Executive Summary', type: 'summary', required: true, stakeholderVisible: true },
        { id: 'progress', title: 'Detailed Progress', type: 'progress', required: true, stakeholderVisible: false },
        { id: 'insights', title: 'Deep Insights', type: 'insights', required: true, stakeholderVisible: false },
        { id: 'charts', title: 'Analytics Charts', type: 'charts', required: false, stakeholderVisible: false },
        { id: 'detailed', title: 'Phase-by-Phase Analysis', type: 'detailed', required: true, stakeholderVisible: false },
        { id: 'recommendations', title: 'Action Items', type: 'recommendations', required: true, stakeholderVisible: true }
      ]
    },
    {
      id: 'investor-pitch',
      name: 'Investor Presentation',
      description: 'Market-focused report for potential investors',
      targetAudience: 'investor',
      sections: [
        { id: 'summary', title: 'Investment Opportunity', type: 'summary', required: true, stakeholderVisible: true },
        { id: 'insights', title: 'Market Analysis', type: 'insights', required: true, stakeholderVisible: true },
        { id: 'charts', title: 'Financial Projections', type: 'charts', required: true, stakeholderVisible: true },
        { id: 'recommendations', title: 'Investment Thesis', type: 'recommendations', required: true, stakeholderVisible: true }
      ]
    }
  ];

  static async generateReport(
    projectData: ProjectData,
    progress: UserProgress,
    templateId: string,
    options: Partial<ExportOptions> = {}
  ): Promise<GeneratedReport> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const content = await this.buildReportContent(projectData, progress, template, options);

    return {
      id: `report-${Date.now()}`,
      projectId: projectData.id,
      templateId,
      title: `${projectData.name} - ${template.name}`,
      content,
      generatedAt: new Date(),
      format: options.format || 'json'
    };
  }

  static getTemplates(): ReportTemplate[] {
    return this.templates;
  }

  static getTemplate(id: string): ReportTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  private static async buildReportContent(
    projectData: ProjectData,
    progress: UserProgress,
    template: ReportTemplate,
    options: Partial<ExportOptions>
  ): Promise<ReportContent> {
    const insights = this.generateProjectInsights(projectData, progress);
    const progressSummary = this.generateProgressSummary(progress);
    const phaseAnalysis = this.generatePhaseAnalysis(projectData, progress);

    const content: ReportContent = {
      executiveSummary: this.generateExecutiveSummary(projectData, insights, template.targetAudience),
      progressOverview: progressSummary,
      phaseAnalysis,
      insights,
      recommendations: this.generateRecommendations(projectData, progress, template.targetAudience)
    };

    // Add charts if requested
    if (template.sections.some(s => s.type === 'charts') && options.includeCharts !== false) {
      content.charts = this.generateCharts(projectData, progress);
    }

    // Add appendices for detailed reports
    if (template.targetAudience === 'internal') {
      content.appendices = this.generateAppendices(projectData, progress);
    }

    return content;
  }

  private static generateProjectInsights(
    projectData: ProjectData,
    progress: UserProgress
  ): ProjectInsights {
    const completionRate = this.calculateOverallCompletion(progress);
    const riskLevel = this.assessOverallRisk(projectData);
    const readinessScore = this.calculateLaunchReadiness(projectData, progress);

    return {
      completionRate,
      timeSpent: this.calculateTimeSpent(progress),
      riskLevel,
      readinessScore,
      keyFindings: this.extractKeyFindings(projectData),
      nextSteps: this.identifyNextSteps(progress)
    };
  }

  private static generateProgressSummary(progress: UserProgress): ProgressSummary {
    const phases = Object.values(progress.phases);
    const completedPhases = phases.filter(p => p.completionPercentage === 100).length;
    const overallCompletion = this.calculateOverallCompletion(progress);

    return {
      overallCompletion,
      phasesCompleted: completedPhases,
      totalPhases: phases.length,
      timeSpent: this.calculateTimeSpent(progress),
      estimatedTimeRemaining: this.estimateTimeRemaining(progress)
    };
  }

  private static generatePhaseAnalysis(
    projectData: ProjectData,
    progress: UserProgress
  ): PhaseAnalysis[] {
    return Object.entries(progress.phases).map(([phase, phaseData]) => ({
      phase: phase as LaunchPhase,
      completion: phaseData.completionPercentage,
      keyAchievements: this.extractPhaseAchievements(phase as LaunchPhase, projectData),
      challenges: this.identifyPhaseChallenges(phase as LaunchPhase, phaseData),
      nextSteps: this.getPhaseNextSteps(phase as LaunchPhase, phaseData),
      riskFactors: this.identifyPhaseRisks(phase as LaunchPhase, projectData)
    }));
  }

  private static generateExecutiveSummary(
    projectData: ProjectData,
    insights: ProjectInsights,
    audience: string
  ): string {
    const sections = [];

    sections.push(`${projectData.name} is a ${projectData.industry} product targeting ${projectData.targetMarket}.`);

    if (audience === 'investor') {
      sections.push(`This investment opportunity shows ${insights.readinessScore}% launch readiness with ${insights.riskLevel} risk profile.`);
      if (projectData.data.financial?.projectedRevenue) {
        sections.push(`Financial projections indicate ${projectData.data.financial.projectedRevenue} in first-year revenue.`);
      }
    } else {
      sections.push(`Current completion rate is ${insights.completionRate.toFixed(1)}% with ${insights.timeSpent} days invested.`);
      sections.push(`The project maintains a ${insights.riskLevel} risk level and ${insights.readinessScore}% readiness score.`);
    }

    if (insights.keyFindings.length > 0) {
      sections.push(`Key findings include: ${insights.keyFindings.slice(0, 3).join(', ')}.`);
    }

    return sections.join(' ');
  }

  private static generateRecommendations(
    projectData: ProjectData,
    progress: UserProgress,
    audience: string
  ): string[] {
    const recommendations: string[] = [];
    const insights = this.generateProjectInsights(projectData, progress);

    if (audience === 'investor') {
      if (insights.readinessScore > 80) {
        recommendations.push('Strong investment opportunity with high launch readiness');
      }
      if (projectData.data.validation?.marketSize) {
        recommendations.push('Market validation supports investment scalability potential');
      }
    } else {
      if (insights.completionRate < 70) {
        recommendations.push('Focus on completing core phases before launch');
      }
      if (insights.riskLevel === 'high') {
        recommendations.push('Address high-priority risks immediately');
      }
      if (insights.nextSteps.length > 0) {
        recommendations.push(`Priority action: ${insights.nextSteps[0]}`);
      }
    }

    return recommendations;
  }

  private static generateCharts(
    projectData: ProjectData,
    progress: UserProgress
  ): ChartData[] {
    const charts: ChartData[] = [];

    // Progress by phase chart
    const phaseProgress = Object.entries(progress.phases).map(([phase, data]) => ({
      phase,
      completion: data.completionPercentage
    }));

    charts.push({
      type: 'bar',
      title: 'Progress by Phase',
      data: phaseProgress,
      description: 'Completion percentage for each launch phase'
    });

    // Risk distribution
    if (projectData.data.risks?.identifiedRisks) {
      const riskData = projectData.data.risks.identifiedRisks.reduce((acc, risk) => {
        acc[risk.impact] = (acc[risk.impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      charts.push({
        type: 'pie',
        title: 'Risk Distribution',
        data: riskData,
        description: 'Distribution of risks by impact level'
      });
    }

    return charts;
  }

  private static generateAppendices(
    projectData: ProjectData,
    progress: UserProgress
  ): ReportAppendix[] {
    const appendices: ReportAppendix[] = [];

    // Methodology appendix
    appendices.push({
      title: 'Methodology',
      content: 'This report was generated using the Build24 Launch Essentials framework, analyzing completion rates, risk factors, and readiness indicators across eight core phases.',
      type: 'methodology'
    });

    // Raw data appendix
    appendices.push({
      title: 'Progress Data',
      content: JSON.stringify(progress, null, 2),
      type: 'data'
    });

    return appendices;
  }

  // Helper methods
  private static calculateOverallCompletion(progress: UserProgress): number {
    const phases = Object.values(progress.phases);
    const totalCompletion = phases.reduce((sum, phase) => sum + phase.completionPercentage, 0);
    return phases.length > 0 ? totalCompletion / phases.length : 0;
  }

  private static calculateTimeSpent(progress: UserProgress): number {
    const start = new Date(progress.createdAt);
    const end = progress.completedAt ? new Date(progress.completedAt) : new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static estimateTimeRemaining(progress: UserProgress): number {
    const completion = this.calculateOverallCompletion(progress);
    const timeSpent = this.calculateTimeSpent(progress);

    if (completion === 0) return 0;
    const totalEstimated = (timeSpent / completion) * 100;
    return Math.max(0, totalEstimated - timeSpent);
  }

  private static assessOverallRisk(projectData: ProjectData): 'low' | 'medium' | 'high' {
    const risks = projectData.data.risks?.identifiedRisks || [];
    const highRisks = risks.filter(r => r.impact === 'high');

    if (highRisks.length > 2) return 'high';
    if (highRisks.length > 0 || risks.length > 5) return 'medium';
    return 'low';
  }

  private static calculateLaunchReadiness(
    projectData: ProjectData,
    progress: UserProgress
  ): number {
    const weights = {
      validation: 20,
      definition: 15,
      technical: 15,
      marketing: 15,
      operations: 15,
      financial: 10,
      risks: 10
    };

    let score = 0;
    Object.entries(weights).forEach(([phase, weight]) => {
      const phaseProgress = progress.phases[phase as LaunchPhase];
      if (phaseProgress) {
        score += (phaseProgress.completionPercentage / 100) * weight;
      }
    });

    return Math.round(score);
  }

  private static extractKeyFindings(projectData: ProjectData): string[] {
    const findings: string[] = [];

    if (projectData.data.validation?.marketSize) {
      findings.push(`Market opportunity: ${projectData.data.validation.marketSize}`);
    }

    if (projectData.data.financial?.projectedRevenue) {
      findings.push(`Revenue projection: ${projectData.data.financial.projectedRevenue}`);
    }

    return findings;
  }

  private static identifyNextSteps(progress: UserProgress): string[] {
    const nextSteps: string[] = [];

    Object.entries(progress.phases).forEach(([phase, phaseData]) => {
      const incompleteSteps = phaseData.steps.filter(s => s.status !== 'completed');
      if (incompleteSteps.length > 0) {
        nextSteps.push(`${phase}: ${incompleteSteps[0].stepId}`);
      }
    });

    return nextSteps.slice(0, 5);
  }

  private static extractPhaseAchievements(phase: LaunchPhase, projectData: ProjectData): string[] {
    const achievements: string[] = [];
    const phaseData = projectData.data[phase];

    if (phaseData) {
      // Extract meaningful achievements based on phase data
      Object.entries(phaseData).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.length > 0) {
          achievements.push(`Completed ${key}`);
        }
      });
    }

    return achievements.slice(0, 3);
  }

  private static identifyPhaseChallenges(phase: LaunchPhase, phaseData: any): string[] {
    const challenges: string[] = [];

    if (phaseData.completionPercentage < 50) {
      challenges.push('Low completion rate indicates potential blockers');
    }

    const stuckSteps = phaseData.steps.filter(s => s.status === 'in_progress');
    if (stuckSteps.length > 2) {
      challenges.push('Multiple steps in progress may indicate resource constraints');
    }

    return challenges;
  }

  private static getPhaseNextSteps(phase: LaunchPhase, phaseData: any): string[] {
    const nextSteps: string[] = [];
    const incompleteSteps = phaseData.steps.filter(s => s.status !== 'completed');

    incompleteSteps.slice(0, 3).forEach(step => {
      nextSteps.push(step.stepId);
    });

    return nextSteps;
  }

  private static identifyPhaseRisks(phase: LaunchPhase, projectData: ProjectData): string[] {
    const risks: string[] = [];

    if (projectData.data.risks?.identifiedRisks) {
      const phaseRisks = projectData.data.risks.identifiedRisks.filter(r =>
        r.category?.toLowerCase().includes(phase)
      );
      risks.push(...phaseRisks.map(r => r.description));
    }

    return risks.slice(0, 3);
  }
}
