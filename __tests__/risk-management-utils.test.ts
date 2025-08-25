import {
  calculateOverallRiskLevel,
  calculateRiskScore,
  evaluateMitigationEffectiveness,
  generateMitigationTemplates,
  generateRiskAlerts,
  generateRiskCategories,
  generateRiskMatrix,
  generateRiskReport,
  identifyCriticalRisks,
  prioritizeRisks
} from '@/lib/risk-management-utils';
import { MitigationStrategy, MonitoringPlan, Risk, RiskAssessment } from '@/types/launch-essentials';

describe('Risk Management Utils', () => {
  const mockRisks: Risk[] = [
    {
      id: 'risk-1',
      title: 'High Impact Technical Risk',
      description: 'Critical system failure',
      category: 'technical',
      probability: 'high',
      impact: 'high',
      priority: 1,
      owner: 'Tech Lead'
    },
    {
      id: 'risk-2',
      title: 'Medium Market Risk',
      description: 'Market demand uncertainty',
      category: 'market',
      probability: 'medium',
      impact: 'medium',
      priority: 2,
      owner: 'Product Manager'
    },
    {
      id: 'risk-3',
      title: 'Low Financial Risk',
      description: 'Minor budget variance',
      category: 'financial',
      probability: 'low',
      impact: 'low',
      priority: 3,
      owner: 'Finance Manager'
    }
  ];

  const mockMitigationStrategies: MitigationStrategy[] = [
    {
      riskId: 'risk-1',
      strategy: 'mitigate',
      actions: ['Implement redundancy', 'Regular testing'],
      timeline: '2 weeks',
      cost: 5000,
      responsible: 'Tech Lead'
    }
  ];

  const mockMonitoringPlans: MonitoringPlan[] = [
    {
      riskId: 'risk-1',
      indicators: ['System uptime', 'Error rate'],
      frequency: 'daily',
      thresholds: [
        { indicator: 'System uptime', threshold: 99 },
        { indicator: 'Error rate', threshold: 5 }
      ],
      escalation: 'Contact CTO immediately'
    }
  ];

  describe('calculateRiskScore', () => {
    it('should calculate correct risk scores', () => {
      expect(calculateRiskScore('low', 'low')).toEqual({
        probability: 1,
        impact: 1,
        score: 1,
        level: 'low'
      });

      expect(calculateRiskScore('high', 'high')).toEqual({
        probability: 3,
        impact: 3,
        score: 9,
        level: 'critical'
      });

      expect(calculateRiskScore('medium', 'medium')).toEqual({
        probability: 2,
        impact: 2,
        score: 4,
        level: 'medium'
      });
    });

    it('should assign correct risk levels', () => {
      expect(calculateRiskScore('low', 'low').level).toBe('low');
      expect(calculateRiskScore('low', 'medium').level).toBe('low');
      expect(calculateRiskScore('medium', 'low').level).toBe('low');
      expect(calculateRiskScore('medium', 'medium').level).toBe('medium');
      expect(calculateRiskScore('high', 'low').level).toBe('medium');
      expect(calculateRiskScore('low', 'high').level).toBe('medium');
      expect(calculateRiskScore('medium', 'high').level).toBe('high');
      expect(calculateRiskScore('high', 'medium').level).toBe('high');
      expect(calculateRiskScore('high', 'high').level).toBe('critical');
    });
  });

  describe('prioritizeRisks', () => {
    it('should prioritize risks by score and priority', () => {
      const prioritized = prioritizeRisks(mockRisks);

      // High-high risk should be first
      expect(prioritized[0].id).toBe('risk-1');
      // Medium-medium risk should be second
      expect(prioritized[1].id).toBe('risk-2');
      // Low-low risk should be last
      expect(prioritized[2].id).toBe('risk-3');
    });

    it('should handle empty risk array', () => {
      expect(prioritizeRisks([])).toEqual([]);
    });
  });

  describe('calculateOverallRiskLevel', () => {
    it('should return low for no risks', () => {
      expect(calculateOverallRiskLevel([])).toBe('low');
    });

    it('should return high for multiple critical/high risks', () => {
      const highRisks = [
        ...mockRisks,
        { ...mockRisks[0], id: 'risk-4' },
        { ...mockRisks[0], id: 'risk-5' }
      ];
      expect(calculateOverallRiskLevel(highRisks)).toBe('high');
    });

    it('should return medium for some critical/high risks', () => {
      expect(calculateOverallRiskLevel(mockRisks)).toBe('medium');
    });

    it('should return low for only low risks', () => {
      const lowRisks = [mockRisks[2]];
      expect(calculateOverallRiskLevel(lowRisks)).toBe('low');
    });
  });

  describe('generateRiskMatrix', () => {
    it('should generate correct risk matrix', () => {
      const matrix = generateRiskMatrix(mockRisks);

      expect(matrix.high.high).toBe(1); // risk-1
      expect(matrix.medium.medium).toBe(1); // risk-2
      expect(matrix.low.low).toBe(1); // risk-3
      expect(matrix.low.medium).toBe(0);
    });

    it('should handle empty risks', () => {
      const matrix = generateRiskMatrix([]);
      expect(matrix.low.low).toBe(0);
      expect(matrix.high.high).toBe(0);
    });
  });

  describe('identifyCriticalRisks', () => {
    it('should identify critical and high risks', () => {
      const criticalRisks = identifyCriticalRisks(mockRisks);
      expect(criticalRisks).toContain('risk-1');
      expect(criticalRisks).not.toContain('risk-2');
      expect(criticalRisks).not.toContain('risk-3');
    });

    it('should return empty array for no critical risks', () => {
      const lowRisks = [mockRisks[2]];
      expect(identifyCriticalRisks(lowRisks)).toEqual([]);
    });
  });

  describe('evaluateMitigationEffectiveness', () => {
    it('should evaluate mitigation effectiveness', () => {
      const effectiveness = evaluateMitigationEffectiveness(
        mockRisks[0],
        mockMitigationStrategies[0]
      );

      expect(effectiveness.effectiveness).toBe(0.7); // mitigate strategy
      expect(effectiveness.costBenefit).toBeGreaterThan(0);
      expect(effectiveness.recommendation).toContain('cost-benefit');
    });

    it('should handle different strategy types', () => {
      const avoidStrategy: MitigationStrategy = {
        ...mockMitigationStrategies[0],
        strategy: 'avoid'
      };

      const effectiveness = evaluateMitigationEffectiveness(
        mockRisks[0],
        avoidStrategy
      );

      expect(effectiveness.effectiveness).toBe(0.9); // avoid strategy
    });
  });

  describe('generateRiskAlerts', () => {
    it('should generate alerts for high-priority risks', () => {
      const alerts = generateRiskAlerts(mockRisks, mockMonitoringPlans);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.riskId === 'risk-1')).toBe(true);
    });

    it('should generate threshold alerts', () => {
      const metrics = {
        'System uptime': 95, // Below threshold of 99
        'Error rate': 10 // Above threshold of 5
      };

      const alerts = generateRiskAlerts(mockRisks, mockMonitoringPlans, metrics);

      expect(alerts.some(alert =>
        alert.message.includes('threshold exceeded')
      )).toBe(true);
    });

    it('should handle empty inputs', () => {
      expect(generateRiskAlerts([], [])).toEqual([]);
    });
  });

  describe('generateRiskCategories', () => {
    it('should return risk categories with common risks', () => {
      const categories = generateRiskCategories();

      expect(categories).toHaveLength(5);
      expect(categories.map(c => c.category)).toEqual([
        'technical', 'market', 'financial', 'operational', 'legal'
      ]);

      categories.forEach(category => {
        expect(category.commonRisks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateMitigationTemplates', () => {
    it('should return mitigation templates for all strategies', () => {
      const templates = generateMitigationTemplates();

      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.strategy)).toEqual([
        'avoid', 'mitigate', 'transfer', 'accept'
      ]);

      templates.forEach(template => {
        expect(template.templates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateRiskReport', () => {
    const mockAssessment: RiskAssessment = {
      overallRiskLevel: 'medium',
      criticalRisks: ['risk-1'],
      riskMatrix: []
    };

    it('should generate comprehensive risk report', () => {
      const report = generateRiskReport(
        mockRisks,
        mockAssessment,
        mockMitigationStrategies
      );

      expect(report.summary).toContain('3 total risks');
      expect(report.summary).toContain('1 critical');
      expect(report.keyFindings).toHaveLength(4);
      expect(report.recommendations).toHaveLength(4);
      expect(report.nextSteps).toHaveLength(5);
    });

    it('should handle empty inputs', () => {
      const report = generateRiskReport([], mockAssessment, []);

      expect(report.summary).toContain('0 total risks');
      expect(report.keyFindings).toHaveLength(4);
    });

    it('should provide appropriate recommendations', () => {
      const report = generateRiskReport(
        mockRisks,
        mockAssessment,
        mockMitigationStrategies
      );

      expect(report.recommendations.some(rec =>
        rec.includes('critical risks')
      )).toBe(true);
    });
  });
});
