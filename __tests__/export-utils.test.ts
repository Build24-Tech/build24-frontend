import { DataExporter, ExportOptions } from '@/lib/export-utils';
import { ProjectData, UserProgress } from '@/types/launch-essentials';

// Mock jsPDF
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    output: jest.fn().mockReturnValue('mock-pdf-data')
  }))
}));

describe('DataExporter', () => {
  const mockProjectData: ProjectData = {
    id: 'test-project',
    userId: 'test-user',
    name: 'Test Project',
    description: 'A test project',
    industry: 'Technology',
    targetMarket: 'Developers',
    stage: 'development',
    data: {
      validation: {
        marketSize: '$1B',
        competitorAnalysis: 'Completed'
      },
      financial: {
        projectedRevenue: '$100K',
        fundingNeeded: '$50K'
      },
      technical: {
        selectedStack: ['React', 'Node.js'],
        architecture: 'Microservices'
      },
      risks: {
        identifiedRisks: [
          {
            id: 'risk-1',
            description: 'Market competition',
            impact: 'high',
            probability: 'medium',
            category: 'market'
          }
        ]
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  const mockProgress: UserProgress = {
    userId: 'test-user',
    projectId: 'test-project',
    currentPhase: 'validation',
    phases: {
      validation: {
        phase: 'validation',
        steps: [
          { stepId: 'market-research', status: 'completed', data: {}, completedAt: new Date() },
          { stepId: 'competitor-analysis', status: 'completed', data: {}, completedAt: new Date() }
        ],
        completionPercentage: 100,
        startedAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10')
      },
      definition: {
        phase: 'definition',
        steps: [
          { stepId: 'vision-mission', status: 'in_progress', data: {} }
        ],
        completionPercentage: 50,
        startedAt: new Date('2024-01-11')
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  describe('exportProject', () => {
    it('should export project data as JSON', async () => {
      const options: ExportOptions = { format: 'json' };
      const result = await DataExporter.exportProject(mockProjectData, mockProgress, options);

      expect(result.mimeType).toBe('application/json');
      expect(result.filename).toContain('Test Project-export');
      expect(typeof result.data).toBe('string');

      const parsedData = JSON.parse(result.data as string);
      expect(parsedData.project).toBeDefined();
      expect(parsedData.progress).toBeDefined();
      expect(parsedData.insights).toBeDefined();
    });

    it('should export project data as PDF', async () => {
      const options: ExportOptions = { format: 'pdf' };
      const result = await DataExporter.exportProject(mockProjectData, mockProgress, options);

      expect(result.mimeType).toBe('application/pdf');
      expect(result.filename).toContain('Test Project-report');
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should export project data as CSV', async () => {
      const options: ExportOptions = { format: 'csv' };
      const result = await DataExporter.exportProject(mockProjectData, mockProgress, options);

      expect(result.mimeType).toBe('text/csv');
      expect(result.filename).toContain('Test Project-progress');
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('Phase,Step,Status,Completion Date,Notes');
    });

    it('should export project data as Markdown', async () => {
      const options: ExportOptions = { format: 'markdown' };
      const result = await DataExporter.exportProject(mockProjectData, mockProgress, options);

      expect(result.mimeType).toBe('text/markdown');
      expect(result.filename).toContain('Test Project-report');
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('# Test Project - Launch Readiness Report');
    });

    it('should filter data for stakeholder view', async () => {
      const options: ExportOptions = {
        format: 'json',
        stakeholderView: true
      };
      const result = await DataExporter.exportProject(mockProjectData, mockProgress, options);

      const parsedData = JSON.parse(result.data as string);
      expect(parsedData.project.data.validation).toBeDefined();
      expect(parsedData.project.data.financial).toBeDefined();
      // Note: definition and marketing might be undefined in stakeholder view if not present in original data
    });

    it('should throw error for unsupported format', async () => {
      const options: ExportOptions = { format: 'xml' as any };

      await expect(
        DataExporter.exportProject(mockProjectData, mockProgress, options)
      ).rejects.toThrow('Unsupported export format: xml');
    });
  });

  describe('generateInsights', () => {
    it('should calculate completion rate correctly', () => {
      const insights = (DataExporter as any).generateInsights(mockProjectData, mockProgress);

      // validation: 2/2 completed (100%), definition: 0/1 completed (0%)
      // Overall: 2/3 = 66.67%
      expect(insights.completionRate).toBeCloseTo(66.67, 1);
    });

    it('should assess risk level correctly', () => {
      const insights = (DataExporter as any).generateInsights(mockProjectData, mockProgress);

      // One medium-impact risk should result in low risk level
      expect(insights.riskLevel).toBe('low');
    });

    it('should calculate readiness score', () => {
      const insights = (DataExporter as any).generateInsights(mockProjectData, mockProgress);

      expect(insights.readinessScore).toBeGreaterThan(0);
      expect(insights.readinessScore).toBeLessThanOrEqual(100);
    });

    it('should extract key findings', () => {
      const insights = (DataExporter as any).generateInsights(mockProjectData, mockProgress);

      expect(insights.keyFindings).toContain('Market size estimated at $1B');
      expect(insights.keyFindings).toContain('Projected first-year revenue: $100K');
      expect(insights.keyFindings).toContain('Technology stack: React, Node.js');
    });

    it('should generate next steps', () => {
      const insights = (DataExporter as any).generateInsights(mockProjectData, mockProgress);

      expect(insights.nextSteps).toContain('Complete definition phase: vision-mission');
    });
  });

  describe('calculateTimeSpent', () => {
    it('should calculate time spent correctly', () => {
      const timeSpent = (DataExporter as any).calculateTimeSpent(mockProgress);

      // From 2024-01-01 to current date
      expect(timeSpent).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend completing core phases for low completion', () => {
      const lowCompletionProgress = {
        ...mockProgress,
        phases: {
          validation: {
            ...mockProgress.phases.validation,
            completionPercentage: 30
          }
        }
      };

      const recommendations = (DataExporter as any).generateRecommendations(
        mockProjectData,
        lowCompletionProgress
      );

      expect(recommendations).toContain(
        'Consider extending timeline to improve launch readiness score'
      );
    });

    it('should recommend addressing high risks', () => {
      const highRiskProject = {
        ...mockProjectData,
        data: {
          ...mockProjectData.data,
          risks: {
            identifiedRisks: [
              { id: '1', description: 'Risk 1', impact: 'high', probability: 'high' },
              { id: '2', description: 'Risk 2', impact: 'high', probability: 'high' },
              { id: '3', description: 'Risk 3', impact: 'high', probability: 'high' }
            ]
          }
        }
      };

      const recommendations = (DataExporter as any).generateRecommendations(
        highRiskProject,
        mockProgress
      );

      expect(recommendations).toContain(
        'Address high-priority risks before launch to avoid potential setbacks'
      );
    });
  });
});
