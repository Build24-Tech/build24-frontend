import { ReportService } from '@/lib/report-service';
import { ProjectData, UserProgress } from '@/types/launch-essentials';

describe('ReportService', () => {
  const mockProjectData: ProjectData = {
    id: 'test-project',
    userId: 'test-user',
    name: 'Test Project',
    description: 'A test project for reporting',
    industry: 'Technology',
    targetMarket: 'Small businesses',
    stage: 'development',
    data: {
      validation: {
        marketSize: '$2B TAM',
        competitorAnalysis: 'Completed',
        userInterviews: '15 interviews'
      },
      definition: {
        visionStatement: 'Transform business operations',
        valueProposition: 'Save 3 hours daily'
      },
      technical: {
        selectedStack: ['React', 'Node.js', 'PostgreSQL'],
        architecture: 'Microservices'
      },
      marketing: {
        pricingStrategy: 'Subscription model',
        channels: ['Content marketing', 'SEO']
      },
      financial: {
        projectedRevenue: '$250K ARR',
        fundingNeeded: '$100K'
      },
      risks: {
        identifiedRisks: [
          {
            id: 'risk-1',
            description: 'Technical complexity',
            impact: 'medium',
            probability: 'high',
            category: 'technical'
          },
          {
            id: 'risk-2',
            description: 'Market saturation',
            impact: 'high',
            probability: 'medium',
            category: 'market'
          }
        ]
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01')
  };

  const mockProgress: UserProgress = {
    userId: 'test-user',
    projectId: 'test-project',
    currentPhase: 'technical',
    phases: {
      validation: {
        phase: 'validation',
        steps: [
          { stepId: 'market-research', status: 'completed', data: {}, completedAt: new Date() },
          { stepId: 'competitor-analysis', status: 'completed', data: {}, completedAt: new Date() },
          { stepId: 'user-interviews', status: 'completed', data: {}, completedAt: new Date() }
        ],
        completionPercentage: 100,
        startedAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-15')
      },
      definition: {
        phase: 'definition',
        steps: [
          { stepId: 'vision-mission', status: 'completed', data: {}, completedAt: new Date() },
          { stepId: 'value-proposition', status: 'in_progress', data: {} }
        ],
        completionPercentage: 50,
        startedAt: new Date('2024-01-16')
      },
      technical: {
        phase: 'technical',
        steps: [
          { stepId: 'tech-stack', status: 'completed', data: {}, completedAt: new Date() },
          { stepId: 'architecture', status: 'in_progress', data: {} }
        ],
        completionPercentage: 50,
        startedAt: new Date('2024-01-20')
      },
      marketing: {
        phase: 'marketing',
        steps: [
          { stepId: 'pricing', status: 'not_started', data: {} }
        ],
        completionPercentage: 0,
        startedAt: new Date('2024-02-01')
      },
      operations: {
        phase: 'operations',
        steps: [
          { stepId: 'team-structure', status: 'not_started', data: {} }
        ],
        completionPercentage: 0,
        startedAt: new Date('2024-02-01')
      },
      financial: {
        phase: 'financial',
        steps: [
          { stepId: 'revenue-model', status: 'completed', data: {}, completedAt: new Date() }
        ],
        completionPercentage: 100,
        startedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12')
      },
      risks: {
        phase: 'risks',
        steps: [
          { stepId: 'risk-assessment', status: 'in_progress', data: {} }
        ],
        completionPercentage: 25,
        startedAt: new Date('2024-01-25')
      },
      optimization: {
        phase: 'optimization',
        steps: [
          { stepId: 'analytics-setup', status: 'not_started', data: {} }
        ],
        completionPercentage: 0,
        startedAt: new Date('2024-02-01')
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01')
  };

  describe('getTemplates', () => {
    it('should return all available templates', () => {
      const templates = ReportService.getTemplates();

      expect(templates).toHaveLength(3);
      expect(templates.map(t => t.id)).toContain('executive-summary');
      expect(templates.map(t => t.id)).toContain('detailed-analysis');
      expect(templates.map(t => t.id)).toContain('investor-pitch');
    });

    it('should have proper template structure', () => {
      const templates = ReportService.getTemplates();

      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('sections');
        expect(template).toHaveProperty('targetAudience');
        expect(Array.isArray(template.sections)).toBe(true);
      });
    });
  });

  describe('getTemplate', () => {
    it('should return specific template by id', () => {
      const template = ReportService.getTemplate('executive-summary');

      expect(template).toBeDefined();
      expect(template?.id).toBe('executive-summary');
      expect(template?.name).toBe('Executive Summary');
      expect(template?.targetAudience).toBe('stakeholder');
    });

    it('should return undefined for non-existent template', () => {
      const template = ReportService.getTemplate('non-existent');

      expect(template).toBeUndefined();
    });
  });

  describe('generateReport', () => {
    it('should generate executive summary report', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'executive-summary'
      );

      expect(report.id).toContain('report-');
      expect(report.projectId).toBe('test-project');
      expect(report.templateId).toBe('executive-summary');
      expect(report.title).toContain('Test Project');
      expect(report.content).toBeDefined();
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('should generate detailed analysis report', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      expect(report.templateId).toBe('detailed-analysis');
      expect(report.content.phaseAnalysis).toHaveLength(8); // All phases
      expect(report.content.charts).toBeDefined();
      expect(report.content.appendices).toBeDefined();
    });

    it('should generate investor pitch report', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'investor-pitch'
      );

      expect(report.templateId).toBe('investor-pitch');
      expect(report.content.charts).toBeDefined();
      expect(report.content.executiveSummary).toContain('investment');
    });

    it('should throw error for invalid template', async () => {
      await expect(
        ReportService.generateReport(
          mockProjectData,
          mockProgress,
          'invalid-template'
        )
      ).rejects.toThrow('Template not found: invalid-template');
    });

    it('should include charts when requested', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis',
        { includeCharts: true }
      );

      expect(report.content.charts).toBeDefined();
      expect(report.content.charts?.length).toBeGreaterThan(0);
    });

    it('should exclude charts when not requested', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'executive-summary',
        { includeCharts: false }
      );

      expect(report.content.charts).toBeUndefined();
    });
  });

  describe('report content generation', () => {
    it('should generate executive summary with project details', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'executive-summary'
      );

      const summary = report.content.executiveSummary;
      expect(summary).toContain('Test Project');
      expect(summary).toContain('Technology');
      expect(summary).toContain('Small businesses');
    });

    it('should generate progress overview with correct metrics', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      const overview = report.content.progressOverview;
      expect(overview.totalPhases).toBe(8);
      expect(overview.phasesCompleted).toBe(2); // validation and financial
      expect(overview.overallCompletion).toBeGreaterThan(0);
      expect(overview.timeSpent).toBeGreaterThan(0);
    });

    it('should generate phase analysis for all phases', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      const phaseAnalysis = report.content.phaseAnalysis;
      expect(phaseAnalysis).toHaveLength(8);

      const validationPhase = phaseAnalysis.find(p => p.phase === 'validation');
      expect(validationPhase?.completion).toBe(100);

      const definitionPhase = phaseAnalysis.find(p => p.phase === 'definition');
      expect(definitionPhase?.completion).toBe(50);
    });

    it('should generate insights with key findings', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      const insights = report.content.insights;
      expect(insights.completionRate).toBeGreaterThan(0);
      expect(insights.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(insights.readinessScore).toBeGreaterThan(0);
      expect(insights.keyFindings.length).toBeGreaterThan(0);
      expect(insights.nextSteps.length).toBeGreaterThan(0);
    });

    it('should generate appropriate recommendations for different audiences', async () => {
      const executiveReport = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'executive-summary'
      );

      const investorReport = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'investor-pitch'
      );

      expect(executiveReport.content.recommendations).toBeDefined();
      expect(investorReport.content.recommendations).toBeDefined();

      // Investor recommendations should be different from executive ones
      expect(investorReport.content.recommendations.join(' ')).toContain('investment');
    });

    it('should generate charts with proper structure', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      const charts = report.content.charts;
      expect(charts).toBeDefined();
      expect(charts?.length).toBeGreaterThan(0);

      charts?.forEach(chart => {
        expect(chart).toHaveProperty('type');
        expect(chart).toHaveProperty('title');
        expect(chart).toHaveProperty('data');
        expect(chart).toHaveProperty('description');
        expect(['bar', 'pie', 'line', 'radar']).toContain(chart.type);
      });
    });

    it('should generate appendices for internal reports', async () => {
      const report = await ReportService.generateReport(
        mockProjectData,
        mockProgress,
        'detailed-analysis'
      );

      const appendices = report.content.appendices;
      expect(appendices).toBeDefined();
      expect(appendices?.length).toBeGreaterThan(0);

      appendices?.forEach(appendix => {
        expect(appendix).toHaveProperty('title');
        expect(appendix).toHaveProperty('content');
        expect(appendix).toHaveProperty('type');
        expect(['data', 'methodology', 'references']).toContain(appendix.type);
      });
    });
  });

  describe('helper methods', () => {
    it('should calculate overall completion correctly', () => {
      const completion = (ReportService as any).calculateOverallCompletion(mockProgress);

      // Average of all phase completions: (100+50+50+0+0+100+25+0)/8 = 40.625
      expect(completion).toBeCloseTo(40.625, 1);
    });

    it('should assess risk level correctly', () => {
      const riskLevel = (ReportService as any).assessOverallRisk(mockProjectData);

      // One high-impact risk should result in medium risk level
      expect(riskLevel).toBe('medium');
    });

    it('should calculate launch readiness score', () => {
      const readinessScore = (ReportService as any).calculateLaunchReadiness(
        mockProjectData,
        mockProgress
      );

      expect(readinessScore).toBeGreaterThan(0);
      expect(readinessScore).toBeLessThanOrEqual(100);
    });

    it('should extract key findings from project data', () => {
      const findings = (ReportService as any).extractKeyFindings(mockProjectData);

      expect(findings).toContain('Market opportunity: $2B TAM');
      expect(findings).toContain('Revenue projection: $250K ARR');
    });

    it('should identify next steps from progress', () => {
      const nextSteps = (ReportService as any).identifyNextSteps(mockProgress);

      expect(nextSteps.length).toBeGreaterThan(0);
      expect(nextSteps).toContain('definition: value-proposition');
      expect(nextSteps).toContain('technical: architecture');
    });
  });
});
