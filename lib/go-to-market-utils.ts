interface MarketingChannel {
  channel: string;
  budget: number;
  expectedROI: number;
  timeline: string;
  metrics: string[];
  expectedCustomers?: number;
}

interface Timeline {
  phases: Array<{
    name: string;
    duration: number;
    milestones: Array<{
      name: string;
      date: string;
      dependencies: string[];
      status: 'pending' | 'in-progress' | 'completed';
    }>;
  }>;
  launchDate: string;
  criticalPath: string[];
}

interface PricingData {
  strategy: string;
  model: string;
  tiers: Array<{
    name: string;
    price: number;
    features: string[];
    target: string;
  }>;
  competitiveAnalysis: Array<{
    competitor: string;
    price: number;
    features: string[];
    positioning: string;
  }>;
}

export interface ROICalculation {
  totalInvestment: number;
  expectedReturn: number;
  overallROI: number;
  channelROI: Array<{
    channel: string;
    investment: number;
    return: number;
    roi: number;
  }>;
}

export interface BudgetAllocation {
  totalBudget: number;
  allocations: Array<{
    channel: string;
    budget: number;
    percentage: number;
  }>;
  risks: string[];
}

export interface TimelineDuration {
  totalDays: number;
  phases: Array<{
    name: string;
    duration: number;
    startDate: Date;
    endDate: Date;
  }>;
  completionPercentage: number;
  overdueMilestones: string[];
}

export interface CriticalPath {
  milestones: string[];
  totalDuration: number;
  bottlenecks: string[];
}

export interface PricingValidation {
  isValid: boolean;
  errors: string[];
  recommendations: string[];
  competitivePosition?: {
    positioning: string;
    priceRange: string;
  };
}

export interface MarketingEfficiency {
  mostEfficient: string;
  leastEfficient: string;
  averageROI: number;
  optimizations: string[];
  estimatedCPA?: number;
  totalExpectedCustomers?: number;
}

export function calculateROI(channels: MarketingChannel[]): ROICalculation {
  if (channels.length === 0) {
    return {
      totalInvestment: 0,
      expectedReturn: 0,
      overallROI: 0,
      channelROI: []
    };
  }

  const totalInvestment = channels.reduce((sum, channel) => sum + channel.budget, 0);
  const expectedReturn = channels.reduce((sum, channel) => sum + (channel.budget * (channel.expectedROI / 100)), 0);
  const overallROI = totalInvestment > 0 ? ((expectedReturn - totalInvestment) / totalInvestment) * 100 : 0;

  const channelROI = channels.map(channel => {
    const returnAmount = channel.budget * (channel.expectedROI / 100);
    return {
      channel: channel.channel,
      investment: channel.budget,
      return: returnAmount,
      roi: ((returnAmount - channel.budget) / channel.budget) * 100
    };
  });

  return {
    totalInvestment,
    expectedReturn,
    overallROI,
    channelROI
  };
}

export function calculateBudgetAllocation(channels: MarketingChannel[]): BudgetAllocation {
  const totalBudget = channels.reduce((sum, channel) => sum + channel.budget, 0);

  const allocations = channels.map(channel => ({
    channel: channel.channel,
    budget: channel.budget,
    percentage: totalBudget > 0 ? Math.round((channel.budget / totalBudget) * 10000) / 100 : 0
  }));

  const risks: string[] = [];

  // Identify budget concentration risks (>70% in single channel)
  allocations.forEach(allocation => {
    if (allocation.percentage > 70) {
      risks.push(`High budget concentration in ${allocation.channel} (${allocation.percentage}%)`);
    }
  });

  // Check for too many small allocations (<5%)
  const smallAllocations = allocations.filter(a => a.percentage < 5);
  if (smallAllocations.length > 2) {
    risks.push('Multiple channels with very small budget allocations may be inefficient');
  }

  return {
    totalBudget,
    allocations,
    risks
  };
}

export function calculateTimelineDuration(timeline: Timeline): TimelineDuration {
  const totalDays = timeline.phases.reduce((sum, phase) => sum + phase.duration, 0);

  let currentDate = new Date();
  const phases = timeline.phases.map(phase => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + phase.duration);
    currentDate = new Date(endDate);

    return {
      name: phase.name,
      duration: phase.duration,
      startDate,
      endDate
    };
  });

  // Calculate completion percentage
  const allMilestones = timeline.phases.flatMap(phase => phase.milestones);
  const completedMilestones = allMilestones.filter(m => m.status === 'completed');
  const completionPercentage = allMilestones.length > 0 ?
    (completedMilestones.length / allMilestones.length) * 100 : 0;

  // Identify overdue milestones
  const now = new Date();
  const overdueMilestones = allMilestones
    .filter(milestone => {
      const milestoneDate = new Date(milestone.date);
      return milestoneDate < now && milestone.status !== 'completed';
    })
    .map(milestone => milestone.name);

  return {
    totalDays,
    phases,
    completionPercentage,
    overdueMilestones
  };
}

export function identifyCriticalPath(timeline: Timeline): CriticalPath {
  const allMilestones = timeline.phases.flatMap(phase => phase.milestones);

  // Find milestones that have dependencies or are dependencies of others
  const criticalMilestones = allMilestones.filter(milestone =>
    milestone.dependencies.length > 0 ||
    allMilestones.some(m => m.dependencies.includes(milestone.name))
  );

  // Identify bottlenecks (milestones that are dependencies of others)
  const bottlenecks = allMilestones
    .filter(milestone => allMilestones.some(m => m.dependencies.includes(milestone.name)))
    .map(milestone => milestone.name);

  return {
    milestones: criticalMilestones.map(m => m.name),
    totalDuration: timeline.phases.reduce((sum, phase) => sum + phase.duration, 0),
    bottlenecks
  };
}

export function validatePricingStrategy(pricing: PricingData): PricingValidation {
  const errors: string[] = [];
  const recommendations: string[] = [];

  // Validate tier pricing progression
  if (pricing.tiers.length > 1) {
    for (let i = 1; i < pricing.tiers.length; i++) {
      if (pricing.tiers[i].price <= pricing.tiers[i - 1].price) {
        errors.push(`Price decreases from ${pricing.tiers[i - 1].name} to ${pricing.tiers[i].name} tier`);
      }
    }

    if (errors.length === 0) {
      recommendations.push('Good price progression across tiers');
    }
  }

  // Validate feature progression
  if (pricing.tiers.length > 1) {
    for (let i = 1; i < pricing.tiers.length; i++) {
      if (pricing.tiers[i].features.length <= pricing.tiers[i - 1].features.length) {
        recommendations.push(`Consider adding more features to ${pricing.tiers[i].name} tier`);
      }
    }
  }

  // Analyze competitive positioning
  let competitivePosition;
  if (pricing.competitiveAnalysis.length > 0) {
    const competitorPrices = pricing.competitiveAnalysis.map(c => c.price);
    const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
    const ourAvgPrice = pricing.tiers.reduce((sum, tier) => sum + tier.price, 0) / pricing.tiers.length;

    let positioning = 'mid-market';
    if (ourAvgPrice < avgCompetitorPrice * 0.7) {
      positioning = 'budget';
    } else if (ourAvgPrice > avgCompetitorPrice * 1.8) {
      positioning = 'premium';
    }

    competitivePosition = {
      positioning,
      priceRange: `${Math.min(...pricing.tiers.map(t => t.price))} - ${Math.max(...pricing.tiers.map(t => t.price))}`
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    recommendations,
    competitivePosition
  };
}

export function calculateMarketingEfficiency(channels: MarketingChannel[]): MarketingEfficiency {
  if (channels.length === 0) {
    return {
      mostEfficient: '',
      leastEfficient: '',
      averageROI: 0,
      optimizations: []
    };
  }

  // Find most and least efficient channels
  const sortedByROI = [...channels].sort((a, b) => b.expectedROI - a.expectedROI);
  const mostEfficient = sortedByROI[0].channel;
  const leastEfficient = sortedByROI[sortedByROI.length - 1].channel;

  // Calculate average ROI
  const averageROI = channels.reduce((sum, channel) => sum + channel.expectedROI, 0) / channels.length;

  // Generate optimization recommendations
  const optimizations: string[] = [];

  if (sortedByROI[0].expectedROI > averageROI * 1.2) {
    optimizations.push(`Consider increasing budget for ${mostEfficient} (highest ROI: ${sortedByROI[0].expectedROI}%)`);
  }

  if (sortedByROI[sortedByROI.length - 1].expectedROI < averageROI * 0.7) {
    optimizations.push(`Review ${leastEfficient} performance (lowest ROI: ${sortedByROI[sortedByROI.length - 1].expectedROI}%)`);
  }

  // Calculate CPA and customer estimates if data available
  let estimatedCPA;
  let totalExpectedCustomers;

  if (channels.some(c => c.expectedCustomers)) {
    const totalBudget = channels.reduce((sum, c) => sum + c.budget, 0);
    totalExpectedCustomers = channels.reduce((sum, c) => sum + (c.expectedCustomers || 0), 0);
    estimatedCPA = totalExpectedCustomers > 0 ? totalBudget / totalExpectedCustomers : undefined;
  } else {
    // Estimate based on budget (assume $50 CPA)
    const totalBudget = channels.reduce((sum, c) => sum + c.budget, 0);
    totalExpectedCustomers = totalBudget / 50;
    estimatedCPA = 50;
  }

  return {
    mostEfficient,
    leastEfficient,
    averageROI,
    optimizations,
    estimatedCPA,
    totalExpectedCustomers
  };
}

export function generateTimelineRecommendations(timeline: Timeline): string[] {
  const recommendations: string[] = [];

  // Analyze critical path
  const criticalPath = identifyCriticalPath(timeline);
  if (criticalPath.milestones.length > 0) {
    recommendations.push('Consider adding buffer time for critical milestones');

    criticalPath.milestones.forEach(milestone => {
      recommendations.push(`${milestone} is on the critical path - monitor closely`);
    });
  }

  // Check for milestone density
  timeline.phases.forEach(phase => {
    const milestonePerDay = phase.milestones.length / phase.duration;
    if (milestonePerDay > 0.5) {
      recommendations.push(`${phase.name} has high milestone density - consider extending duration`);
    }
  });

  // Check for dependencies
  const allMilestones = timeline.phases.flatMap(phase => phase.milestones);
  const milestonesWithDeps = allMilestones.filter(m => m.dependencies.length > 0);

  if (milestonesWithDeps.length > allMilestones.length * 0.5) {
    recommendations.push('High number of dependencies detected - consider parallel execution where possible');
  }

  // Check for overdue items
  const duration = calculateTimelineDuration(timeline);
  if (duration.overdueMilestones.length > 0) {
    recommendations.push(`Address overdue milestones: ${duration.overdueMilestones.join(', ')}`);
  }

  return recommendations;
}
