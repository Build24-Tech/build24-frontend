import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'json' | 'pdf' | 'csv' | 'markdown';
  includeCharts?: boolean;
  stakeholderView?: boolean;
  sections?: string[];
}

export interface ExportResult {
  data: string | Blob;
  filename: string;
  mimeType: string;
}

export interface ReportData {
  project: ProjectData;
  progress: UserProgress;
  insights: ProjectInsights;
  recommendations: string[];
}

export interface ProjectInsights {
  completionRate: number;
  timeSpent: number;
  riskLevel: 'low' | 'medium' | 'high';
  readinessScore: number;
  keyFindings: string[];
  nextSteps: string[];
}

export class DataExporter {
  static async exportProject(
    projectData: ProjectData,
    progress: UserProgress,
    options: ExportOptions
  ): Promise<ExportResult> {
    const reportData: ReportData = {
      project: projectData,
      progress,
      insights: this.generateInsights(projectData, progress),
      recommendations: this.generateRecommendations(projectData, progress)
    };

    switch (options.format) {
      case 'json':
        return this.exportAsJSON(reportData, options);
      case 'pdf':
        return this.exportAsPDF(reportData, options);
      case 'csv':
        return this.exportAsCSV(reportData, options);
      case 'markdown':
        return this.exportAsMarkdown(reportData, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static generateInsights(
    project: ProjectData,
    progress: UserProgress
  ): ProjectInsights {
    const completionRate = this.calculateCompletionRate(progress);
    const riskLevel = this.assessRiskLevel(project);
    const readinessScore = this.calculateReadinessScore(project, progress);

    return {
      completionRate,
      timeSpent: this.calculateTimeSpent(progress),
      riskLevel,
      readinessScore,
      keyFindings: this.extractKeyFindings(project),
      nextSteps: this.generateNextSteps(project, progress)
    };
  }

  private static calculateCompletionRate(progress: UserProgress): number {
    const totalSteps = Object.values(progress.phases).reduce(
      (total, phase) => total + phase.steps.length,
      0
    );
    const completedSteps = Object.values(progress.phases).reduce(
      (total, phase) => total + phase.steps.filter(s => s.status === 'completed').length,
      0
    );
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  }

  private static assessRiskLevel(project: ProjectData): 'low' | 'medium' | 'high' {
    const risks = project.data.risks?.identifiedRisks || [];
    const highRisks = risks.filter(r => r.impact === 'high' && r.probability === 'high');

    if (highRisks.length > 2) return 'high';
    if (highRisks.length > 0 || risks.length > 5) return 'medium';
    return 'low';
  }

  private static calculateReadinessScore(
    project: ProjectData,
    progress: UserProgress
  ): number {
    let score = 0;
    const weights = {
      validation: 20,
      definition: 15,
      technical: 15,
      marketing: 15,
      operations: 15,
      financial: 10,
      risks: 10
    };

    Object.entries(weights).forEach(([phase, weight]) => {
      const phaseProgress = progress.phases[phase as LaunchPhase];
      if (phaseProgress) {
        score += (phaseProgress.completionPercentage / 100) * weight;
      }
    });

    return Math.round(score);
  }

  private static calculateTimeSpent(progress: UserProgress): number {
    const startDate = new Date(progress.createdAt);
    const endDate = progress.completedAt ? new Date(progress.completedAt) : new Date();
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static extractKeyFindings(project: ProjectData): string[] {
    const findings: string[] = [];

    if (project.data.validation?.marketSize) {
      findings.push(`Market size estimated at ${project.data.validation.marketSize}`);
    }

    if (project.data.financial?.projectedRevenue) {
      findings.push(`Projected first-year revenue: ${project.data.financial.projectedRevenue}`);
    }

    if (project.data.technical?.selectedStack) {
      findings.push(`Technology stack: ${project.data.technical.selectedStack.join(', ')}`);
    }

    return findings;
  }

  private static generateNextSteps(
    project: ProjectData,
    progress: UserProgress
  ): string[] {
    const nextSteps: string[] = [];

    Object.entries(progress.phases).forEach(([phase, phaseProgress]) => {
      if (phaseProgress.completionPercentage < 100) {
        const incompleteSteps = phaseProgress.steps.filter(s => s.status !== 'completed');
        if (incompleteSteps.length > 0) {
          nextSteps.push(`Complete ${phase} phase: ${incompleteSteps[0].stepId}`);
        }
      }
    });

    return nextSteps.slice(0, 5); // Top 5 next steps
  }

  private static generateRecommendations(
    project: ProjectData,
    progress: UserProgress
  ): string[] {
    const recommendations: string[] = [];
    const insights = this.generateInsights(project, progress);

    if (insights.completionRate < 50) {
      recommendations.push('Focus on completing core validation and definition phases before proceeding');
    }

    if (insights.riskLevel === 'high') {
      recommendations.push('Address high-priority risks before launch to avoid potential setbacks');
    }

    if (insights.readinessScore < 70) {
      recommendations.push('Consider extending timeline to improve launch readiness score');
    }

    return recommendations;
  }

  private static async exportAsJSON(
    data: ReportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData = options.stakeholderView
      ? this.filterForStakeholders(data)
      : data;

    return {
      data: JSON.stringify(exportData, null, 2),
      filename: `${data.project.name}-export-${Date.now()}.json`,
      mimeType: 'application/json'
    };
  }

  private static async exportAsPDF(
    data: ReportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(data.project.name, 20, yPosition);
    yPosition += 15;

    // Executive Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Completion Rate: ${data.insights.completionRate.toFixed(1)}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Readiness Score: ${data.insights.readinessScore}/100`, 20, yPosition);
    yPosition += 8;
    doc.text(`Risk Level: ${data.insights.riskLevel.toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Key Findings
    if (data.insights.keyFindings.length > 0) {
      doc.setFontSize(14);
      doc.text('Key Findings', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      data.insights.keyFindings.forEach(finding => {
        doc.text(`• ${finding}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Recommendations
    if (data.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.text('Recommendations', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      data.recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 25, yPosition);
        yPosition += 6;
      });
    }

    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });

    return {
      data: pdfBlob,
      filename: `${data.project.name}-report-${Date.now()}.pdf`,
      mimeType: 'application/pdf'
    };
  }

  private static async exportAsCSV(
    data: ReportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    const rows: string[] = [];

    // Header
    rows.push('Phase,Step,Status,Completion Date,Notes');

    // Progress data
    Object.entries(data.progress.phases).forEach(([phase, phaseData]) => {
      phaseData.steps.forEach(step => {
        const row = [
          phase,
          step.stepId,
          step.status,
          step.completedAt || '',
          step.notes || ''
        ].map(field => `"${field}"`).join(',');
        rows.push(row);
      });
    });

    return {
      data: rows.join('\n'),
      filename: `${data.project.name}-progress-${Date.now()}.csv`,
      mimeType: 'text/csv'
    };
  }

  private static async exportAsMarkdown(
    data: ReportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    const sections: string[] = [];

    sections.push(`# ${data.project.name} - Launch Readiness Report`);
    sections.push('');
    sections.push(`Generated on: ${new Date().toLocaleDateString()}`);
    sections.push('');

    // Executive Summary
    sections.push('## Executive Summary');
    sections.push('');
    sections.push(`- **Completion Rate**: ${data.insights.completionRate.toFixed(1)}%`);
    sections.push(`- **Readiness Score**: ${data.insights.readinessScore}/100`);
    sections.push(`- **Risk Level**: ${data.insights.riskLevel.toUpperCase()}`);
    sections.push(`- **Time Spent**: ${data.insights.timeSpent} days`);
    sections.push('');

    // Key Findings
    if (data.insights.keyFindings.length > 0) {
      sections.push('## Key Findings');
      sections.push('');
      data.insights.keyFindings.forEach(finding => {
        sections.push(`- ${finding}`);
      });
      sections.push('');
    }

    // Recommendations
    if (data.recommendations.length > 0) {
      sections.push('## Recommendations');
      sections.push('');
      data.recommendations.forEach(rec => {
        sections.push(`- ${rec}`);
      });
      sections.push('');
    }

    // Next Steps
    if (data.insights.nextSteps.length > 0) {
      sections.push('## Next Steps');
      sections.push('');
      data.insights.nextSteps.forEach(step => {
        sections.push(`- ${step}`);
      });
      sections.push('');
    }

    return {
      data: sections.join('\n'),
      filename: `${data.project.name}-report-${Date.now()}.md`,
      mimeType: 'text/markdown'
    };
  }

  private static filterForStakeholders(data: ReportData): Partial<ReportData> {
    return {
      project: {
        ...data.project,
        data: {
          validation: data.project.data.validation,
          definition: data.project.data.definition,
          marketing: data.project.data.marketing,
          financial: data.project.data.financial
        }
      },
      insights: data.insights,
      recommendations: data.recommendations
    };
  }
}
