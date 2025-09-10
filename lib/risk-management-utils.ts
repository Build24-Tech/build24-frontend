import { MitigationStrategy, MonitoringPlan, Risk, RiskAssessment } from '@/types/launch-essentials';

export interface RiskScore {
  probability: number;
  impact: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskMatrix {
  low: { low: number; medium: number; high: number };
  medium: { low: number; medium: number; high: number };
  high: { low: number; medium: number; high: number };
}

export interface RiskAlert {
  riskId: string;
  title: string;
  severity: 'warning' | 'critical';
  message: string;
  actionRequired: boolean;
  escalationLevel: number;
}

// Risk scoring and prioritization
export function calculateRiskScore(probability: 'low' | 'medium' | 'high', impact: 'low' | 'medium' | 'high'): RiskScore {
  const probabilityValues = { low: 1, medium: 2, high: 3 };
  const impactValues = { low: 1, medium: 2, high: 3 };

  const probValue = probabilityValues[probability];
  const impactValue = impactValues[impact];
  const score = probValue * impactValue;

  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score <= 2) level = 'low';
  else if (score <= 4) level = 'medium';
  else if (score <= 6) level = 'high';
  else level = 'critical';

  return {
    probability: probValue,
    impact: impactValue,
    score,
    level
  };
}

export function prioritizeRisks(risks: Risk[]): Risk[] {
  return risks
    .map(risk => ({
      ...risk,
      calculatedScore: calculateRiskScore(risk.probability, risk.impact)
    }))
    .sort((a, b) => {
      // Sort by calculated score first, then by priority
      if (b.calculatedScore.score !== a.calculatedScore.score) {
        return b.calculatedScore.score - a.calculatedScore.score;
      }
      return a.priority - b.priority;
    })
    .map(({ calculatedScore, ...risk }) => risk);
}

// Risk assessment calculations
export function calculateOverallRiskLevel(risks: Risk[]): 'low' | 'medium' | 'high' {
  if (risks.length === 0) return 'low';

  const criticalRisks = risks.filter(risk => {
    const score = calculateRiskScore(risk.probability, risk.impact);
    return score.level === 'critical' || score.level === 'high';
  });

  if (criticalRisks.length >= 3) return 'high';
  if (criticalRisks.length >= 1) return 'medium';
  return 'low';
}

export function generateRiskMatrix(risks: Risk[]): RiskMatrix {
  const matrix: RiskMatrix = {
    low: { low: 0, medium: 0, high: 0 },
    medium: { low: 0, medium: 0, high: 0 },
    high: { low: 0, medium: 0, high: 0 }
  };

  risks.forEach(risk => {
    matrix[risk.probability][risk.impact]++;
  });

  return matrix;
}

export function identifyCriticalRisks(risks: Risk[]): string[] {
  return risks
    .filter(risk => {
      const score = calculateRiskScore(risk.probability, risk.impact);
      return score.level === 'critical' || score.level === 'high';
    })
    .map(risk => risk.id);
}

// Mitigation strategy evaluation
export function evaluateMitigationEffectiveness(
  risk: Risk,
  strategy: MitigationStrategy
): { effectiveness: number; costBenefit: number; recommendation: string } {
  const riskScore = calculateRiskScore(risk.probability, risk.impact);

  // Simple effectiveness calculation based on strategy type
  const effectivenessMap = {
    avoid: 0.9,
    mitigate: 0.7,
    transfer: 0.6,
    accept: 0.1
  };

  const effectiveness = effectivenessMap[strategy.strategy];
  const potentialLoss = riskScore.score * 10000; // Arbitrary monetary value
  const costBenefit = (potentialLoss * effectiveness) / Math.max(strategy.cost, 1);

  let recommendation = '';
  if (costBenefit > 5) recommendation = 'Highly recommended - excellent cost-benefit ratio';
  else if (costBenefit > 2) recommendation = 'Recommended - good cost-benefit ratio';
  else if (costBenefit > 1) recommendation = 'Consider - moderate cost-benefit ratio';
  else recommendation = 'Not recommended - poor cost-benefit ratio';

  return { effectiveness, costBenefit, recommendation };
}

// Risk monitoring and alerts
export function generateRiskAlerts(
  risks: Risk[],
  monitoringPlans: MonitoringPlan[],
  currentMetrics: Record<string, number> = {}
): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  risks.forEach(risk => {
    const riskScore = calculateRiskScore(risk.probability, risk.impact);
    const monitoringPlan = monitoringPlans.find(plan => plan.riskId === risk.id);

    if (!monitoringPlan) return;

    // Check if any thresholds are exceeded
    const exceededThresholds = monitoringPlan.thresholds.filter(threshold => {
      const currentValue = currentMetrics[threshold.indicator] || 0;
      return currentValue >= threshold.threshold;
    });

    if (exceededThresholds.length > 0) {
      alerts.push({
        riskId: risk.id,
        title: risk.title,
        severity: riskScore.level === 'critical' || riskScore.level === 'high' ? 'critical' : 'warning',
        message: `Risk threshold exceeded for: ${exceededThresholds.map(t => t.indicator).join(', ')}`,
        actionRequired: true,
        escalationLevel: riskScore.level === 'critical' ? 3 : riskScore.level === 'high' ? 2 : 1
      });
    }

    // Generate alerts for high-priority risks without mitigation
    if (riskScore.level === 'critical' || riskScore.level === 'high') {
      alerts.push({
        riskId: risk.id,
        title: risk.title,
        severity: 'critical',
        message: `High-priority risk requires immediate attention`,
        actionRequired: true,
        escalationLevel: 3
      });
    }
  });

  return alerts;
}

// Risk template generators
export function generateRiskCategories(): { category: string; commonRisks: string[] }[] {
  return [
    {
      category: 'technical',
      commonRisks: [
        'Technology stack becomes obsolete',
        'Scalability issues under load',
        'Security vulnerabilities discovered',
        'Third-party service dependencies fail',
        'Data loss or corruption',
        'Integration complexity exceeds estimates'
      ]
    },
    {
      category: 'market',
      commonRisks: [
        'Market demand lower than expected',
        'Competitor launches similar product first',
        'Economic downturn affects target market',
        'Regulatory changes impact market',
        'Customer acquisition costs too high',
        'Market timing is wrong'
      ]
    },
    {
      category: 'financial',
      commonRisks: [
        'Funding runs out before profitability',
        'Revenue projections are overly optimistic',
        'Unexpected costs arise',
        'Currency fluctuations affect pricing',
        'Payment processing issues',
        'Cash flow problems'
      ]
    },
    {
      category: 'operational',
      commonRisks: [
        'Key team members leave',
        'Hiring takes longer than expected',
        'Process inefficiencies cause delays',
        'Vendor relationships deteriorate',
        'Quality control issues',
        'Communication breakdowns'
      ]
    },
    {
      category: 'legal',
      commonRisks: [
        'Intellectual property disputes',
        'Regulatory compliance violations',
        'Data privacy law changes',
        'Contract disputes with partners',
        'Employment law issues',
        'International trade restrictions'
      ]
    }
  ];
}

export function generateMitigationTemplates(): { strategy: MitigationStrategy['strategy']; templates: string[] }[] {
  return [
    {
      strategy: 'avoid',
      templates: [
        'Choose alternative technology stack',
        'Target different market segment',
        'Delay launch until conditions improve',
        'Pivot to different business model'
      ]
    },
    {
      strategy: 'mitigate',
      templates: [
        'Implement redundant systems',
        'Diversify supplier base',
        'Create detailed backup plans',
        'Invest in additional training',
        'Establish monitoring systems',
        'Build buffer time into schedules'
      ]
    },
    {
      strategy: 'transfer',
      templates: [
        'Purchase insurance coverage',
        'Outsource to specialized vendor',
        'Form strategic partnerships',
        'Use escrow services',
        'Implement service level agreements'
      ]
    },
    {
      strategy: 'accept',
      templates: [
        'Set aside contingency budget',
        'Document risk acceptance rationale',
        'Establish monitoring procedures',
        'Create communication plan for stakeholders'
      ]
    }
  ];
}

// Risk reporting
export function generateRiskReport(
  risks: Risk[],
  assessment: RiskAssessment,
  mitigationStrategies: MitigationStrategy[]
): {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  nextSteps: string[];
} {
  const criticalRisks = risks.filter(risk => {
    const score = calculateRiskScore(risk.probability, risk.impact);
    return score.level === 'critical';
  });

  const highRisks = risks.filter(risk => {
    const score = calculateRiskScore(risk.probability, risk.impact);
    return score.level === 'high';
  });

  const mitigatedRisks = risks.filter(risk =>
    mitigationStrategies.some(strategy => strategy.riskId === risk.id)
  );

  const summary = `Risk assessment identified ${risks.length} total risks, including ${criticalRisks.length} critical and ${highRisks.length} high-priority risks. ${mitigatedRisks.length} risks have mitigation strategies in place.`;

  const keyFindings = [
    `Overall risk level: ${assessment.overallRiskLevel}`,
    `${criticalRisks.length} critical risks require immediate attention`,
    `${risks.length - mitigatedRisks.length} risks lack mitigation strategies`,
    `Most common risk category: ${getMostCommonCategory(risks)}`
  ];

  const recommendations = [
    criticalRisks.length > 0 ? 'Address critical risks before proceeding with launch' : 'Continue with current risk management approach',
    mitigatedRisks.length < risks.length * 0.8 ? 'Develop mitigation strategies for remaining risks' : 'Review and update existing mitigation strategies',
    'Implement regular risk monitoring and review processes',
    'Establish clear escalation procedures for high-priority risks'
  ];

  const nextSteps = [
    'Review and approve risk mitigation strategies',
    'Assign risk owners and establish accountability',
    'Set up monitoring systems and alert mechanisms',
    'Schedule regular risk review meetings',
    'Update risk register based on project progress'
  ];

  return { summary, keyFindings, recommendations, nextSteps };
}

function getMostCommonCategory(risks: Risk[]): string {
  const categoryCounts = risks.reduce((acc, risk) => {
    acc[risk.category] = (acc[risk.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'technical';
}
