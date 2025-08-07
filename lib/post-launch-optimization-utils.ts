// Post-Launch Optimization Utility Functions

export interface OptimizationData {
  analytics: {
    setupComplete: boolean;
    tools: string[];
    kpis: KPIMetric[];
    dashboards: string[];
  };
  feedback: {
    methods: string[];
    responses: FeedbackData[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  improvements: ImprovementItem[];
  sprints: SprintPlan[];
  successMetrics: {
    kpis: KPIMetric[];
    targets: Record<string, number>;
    achievements: Record<string, number>;
  };
}

export interface FeedbackData {
  id: string;
  content: string;
  source: 'manual' | 'survey' | 'support' | 'review';
  timestamp: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  category?: string;
  userId?: string;
}

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  status: 'backlog' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface SprintPlan {
  id: string;
  name: string;
  duration: number; // weeks
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  items: ImprovementItem[];
  progress: number;
  velocity: number;
  burndownData: { date: Date; remaining: number }[];
}

export interface KPIMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'engagement' | 'retention' | 'acquisition' | 'revenue' | 'satisfaction';
  lastUpdated: Date;
}

export interface OptimizationMetrics {
  overallHealth: number;
  analyticsScore: number;
  feedbackScore: number;
  improvementVelocity: number;
  kpiProgress: number;
  recommendations: string[];
}

export interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  category: string;
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Analytics Setup and Interpretation
export function calculateOptimizationMetrics(data: OptimizationData): OptimizationMetrics {
  const analyticsScore = calculateAnalyticsScore(data.analytics);
  const feedbackScore = calculateFeedbackScore(data.feedback);
  const improvementVelocity = calculateImprovementVelocity(data.improvements, data.sprints);
  const kpiProgress = calculateKPIProgress(data.successMetrics);

  const overallHealth = Math.round(
    (analyticsScore * 0.25 + feedbackScore * 0.25 + improvementVelocity * 0.25 + kpiProgress * 0.25)
  );

  const recommendations = generateRecommendations(data);

  return {
    overallHealth,
    analyticsScore,
    feedbackScore,
    improvementVelocity,
    kpiProgress,
    recommendations
  };
}

function calculateAnalyticsScore(analytics: OptimizationData['analytics']): number {
  let score = 0;

  // Tools setup (40 points)
  score += Math.min(analytics.tools.length * 10, 40);

  // KPIs defined (30 points)
  score += Math.min(analytics.kpis.length * 6, 30);

  // Dashboards created (20 points)
  score += Math.min(analytics.dashboards.length * 10, 20);

  // Setup completion (10 points)
  if (analytics.setupComplete) score += 10;

  return Math.min(score, 100);
}

function calculateFeedbackScore(feedback: OptimizationData['feedback']): number {
  let score = 0;

  // Feedback volume (40 points)
  score += Math.min(feedback.responses.length * 2, 40);

  // Collection methods (30 points)
  score += Math.min(feedback.methods.length * 10, 30);

  // Sentiment balance (30 points)
  const sentimentBalance = 100 - Math.abs(50 - feedback.sentiment.positive);
  score += (sentimentBalance / 100) * 30;

  return Math.min(score, 100);
}

function calculateImprovementVelocity(improvements: ImprovementItem[], sprints: SprintPlan[]): number {
  if (improvements.length === 0) return 0;

  const completedImprovements = improvements.filter(item => item.status === 'completed');
  const completionRate = (completedImprovements.length / improvements.length) * 100;

  // Factor in sprint velocity
  const avgVelocity = sprints.length > 0
    ? sprints.reduce((sum, sprint) => sum + sprint.velocity, 0) / sprints.length
    : 0;

  return Math.min(completionRate + (avgVelocity * 10), 100);
}

function calculateKPIProgress(metrics: OptimizationData['successMetrics']): number {
  if (metrics.kpis.length === 0) return 0;

  const progressScores = metrics.kpis.map(kpi => {
    const progress = (kpi.currentValue / kpi.targetValue) * 100;
    return Math.min(progress, 100);
  });

  return progressScores.reduce((sum, score) => sum + score, 0) / progressScores.length;
}

function generateRecommendations(data: OptimizationData): string[] {
  const recommendations: string[] = [];

  if (data.analytics.tools.length < 2) {
    recommendations.push('Set up additional analytics tools for comprehensive data collection');
  }

  if (data.feedback.responses.length < 10) {
    recommendations.push('Increase feedback collection to get better insights');
  }

  if (data.improvements.filter(i => i.status === 'completed').length === 0) {
    recommendations.push('Start implementing high-priority improvements');
  }

  if (data.sprints.length === 0) {
    recommendations.push('Create your first sprint to organize improvement work');
  }

  const highPriorityItems = data.improvements.filter(i => i.priority >= 8 && i.status === 'backlog');
  if (highPriorityItems.length > 0) {
    recommendations.push(`You have ${highPriorityItems.length} high-priority items ready for implementation`);
  }

  return recommendations;
}

// Feedback Collection and Analysis
export function analyzeFeedback(feedbackText: string): FeedbackAnalysis {
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic', 'wonderful'];
  const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'worst', 'bad', 'disappointing', 'frustrating'];
  const neutralWords = ['okay', 'fine', 'average', 'decent', 'acceptable'];

  const text = feedbackText.toLowerCase();
  const words = text.split(/\s+/);

  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveScore++;
    if (negativeWords.some(nw => word.includes(nw))) negativeScore++;
    if (neutralWords.some(neu => word.includes(neu))) neutralScore++;
  });

  let sentiment: 'positive' | 'neutral' | 'negative';
  let confidence: number;

  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    sentiment = 'positive';
    confidence = Math.min((positiveScore / words.length) * 100, 95);
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    sentiment = 'negative';
    confidence = Math.min((negativeScore / words.length) * 100, 95);
  } else {
    sentiment = 'neutral';
    confidence = 60;
  }

  const keywords = words.filter(word =>
    positiveWords.some(pw => word.includes(pw)) ||
    negativeWords.some(nw => word.includes(nw)) ||
    neutralWords.some(neu => word.includes(neu))
  );

  const category = categorizeFeeback(text);

  // Calculate overall sentiment distribution (mock data for demo)
  const overallSentiment = {
    positive: Math.max(0, 60 + (positiveScore - negativeScore) * 5),
    negative: Math.max(0, 25 + (negativeScore - positiveScore) * 3),
    neutral: 15
  };

  // Normalize to 100%
  const total = overallSentiment.positive + overallSentiment.negative + overallSentiment.neutral;
  overallSentiment.positive = Math.round((overallSentiment.positive / total) * 100);
  overallSentiment.negative = Math.round((overallSentiment.negative / total) * 100);
  overallSentiment.neutral = 100 - overallSentiment.positive - overallSentiment.negative;

  return {
    sentiment,
    confidence,
    keywords,
    category,
    overallSentiment
  };
}

function categorizeFeeback(text: string): string {
  const categories = {
    'UI/UX': ['interface', 'design', 'layout', 'navigation', 'user experience', 'ui', 'ux'],
    'Performance': ['slow', 'fast', 'loading', 'speed', 'performance', 'lag', 'responsive'],
    'Features': ['feature', 'functionality', 'tool', 'option', 'capability'],
    'Bug': ['bug', 'error', 'issue', 'problem', 'broken', 'crash', 'glitch'],
    'Support': ['help', 'support', 'service', 'response', 'assistance']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return category;
    }
  }

  return 'General';
}

// Improvement Prioritization
export function prioritizeImprovements(improvements: Partial<ImprovementItem>[]): (Partial<ImprovementItem> & { priority: number })[] {
  return improvements.map(improvement => {
    const impactScore = getImpactScore(improvement.impact || 'medium');
    const effortScore = getEffortScore(improvement.effort || 'medium');

    // Priority calculation: Impact / Effort ratio, scaled to 1-10
    const priority = Math.round((impactScore / effortScore) * 3.33);

    return {
      ...improvement,
      priority: Math.min(Math.max(priority, 1), 10)
    };
  });
}

function getImpactScore(impact: 'low' | 'medium' | 'high'): number {
  switch (impact) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 2;
  }
}

function getEffortScore(effort: 'low' | 'medium' | 'high'): number {
  switch (effort) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 2;
  }
}

// Sprint Planning and Agile Methodology
export function generateSprintPlan(improvements: ImprovementItem[], durationWeeks: number = 2): SprintPlan {
  const sprintId = `sprint-${Date.now()}`;
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000));

  // Select improvements for sprint based on priority and effort
  const sortedImprovements = improvements
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.min(improvements.length, 5)); // Max 5 items per sprint

  const sprintItems = sortedImprovements.map(improvement => ({
    ...improvement,
    status: 'backlog' as const
  }));

  // Calculate initial velocity (mock calculation)
  const totalEffortPoints = sprintItems.reduce((sum, item) => {
    return sum + getEffortScore(item.effort);
  }, 0);

  const velocity = Math.round(totalEffortPoints / durationWeeks);

  return {
    id: sprintId,
    name: `Sprint ${new Date().toISOString().slice(0, 10)}`,
    duration: durationWeeks,
    startDate,
    endDate,
    status: 'planned',
    items: sprintItems,
    progress: 0,
    velocity,
    burndownData: generateBurndownData(startDate, endDate, totalEffortPoints)
  };
}

function generateBurndownData(startDate: Date, endDate: Date, totalPoints: number): { date: Date; remaining: number }[] {
  const data: { date: Date; remaining: number }[] = [];
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const remaining = Math.max(0, totalPoints - (totalPoints * (i / totalDays)));
    data.push({ date, remaining });
  }

  return data;
}

// Success Measurement and KPI Tracking
export function trackKPIs(kpis: KPIMetric[]): { summary: any; alerts: string[] } {
  const summary = {
    totalKPIs: kpis.length,
    onTrack: 0,
    atRisk: 0,
    critical: 0,
    averageProgress: 0
  };

  const alerts: string[] = [];
  let totalProgress = 0;

  kpis.forEach(kpi => {
    const progress = (kpi.currentValue / kpi.targetValue) * 100;
    totalProgress += progress;

    if (progress >= 90) {
      summary.onTrack++;
    } else if (progress >= 70) {
      summary.atRisk++;
      alerts.push(`${kpi.name} is at risk (${Math.round(progress)}% of target)`);
    } else {
      summary.critical++;
      alerts.push(`${kpi.name} is critical (${Math.round(progress)}% of target)`);
    }
  });

  summary.averageProgress = kpis.length > 0 ? totalProgress / kpis.length : 0;

  return { summary, alerts };
}

// ROI Calculation for Improvements
export function calculateROI(improvement: ImprovementItem, estimatedBenefit: number, estimatedCost: number): number {
  if (estimatedCost === 0) return 0;
  return ((estimatedBenefit - estimatedCost) / estimatedCost) * 100;
}

// A/B Testing Framework
export interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  variants: {
    name: string;
    description: string;
    traffic: number; // percentage
  }[];
  metrics: string[];
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  results?: {
    variant: string;
    conversionRate: number;
    significance: number;
  }[];
}

export function createABTest(
  name: string,
  hypothesis: string,
  variants: { name: string; description: string }[]
): ABTest {
  const trafficSplit = Math.floor(100 / variants.length);

  return {
    id: `test-${Date.now()}`,
    name,
    hypothesis,
    variants: variants.map((variant, index) => ({
      ...variant,
      traffic: index === variants.length - 1
        ? 100 - (trafficSplit * (variants.length - 1)) // Last variant gets remainder
        : trafficSplit
    })),
    metrics: ['conversion_rate', 'engagement_rate', 'retention_rate'],
    status: 'draft',
    startDate: new Date()
  };
}

// User Behavior Analysis
export interface UserBehaviorInsight {
  type: 'usage_pattern' | 'drop_off_point' | 'feature_adoption' | 'user_journey';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendedActions: string[];
}

export function analyzeUserBehavior(analyticsData: any): UserBehaviorInsight[] {
  // Mock implementation - in real scenario, this would analyze actual analytics data
  return [
    {
      type: 'drop_off_point',
      title: 'High Drop-off at Onboarding Step 3',
      description: '45% of users abandon the onboarding process at step 3',
      impact: 'high',
      actionable: true,
      recommendedActions: [
        'Simplify step 3 requirements',
        'Add progress indicator',
        'Provide help text or tutorial'
      ]
    },
    {
      type: 'feature_adoption',
      title: 'Low Adoption of Advanced Features',
      description: 'Only 12% of users utilize advanced features within first month',
      impact: 'medium',
      actionable: true,
      recommendedActions: [
        'Create feature discovery flow',
        'Add contextual tooltips',
        'Send educational email series'
      ]
    }
  ];
}
