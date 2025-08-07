import {
  analyzeFeedback,
  analyzeUserBehavior,
  calculateOptimizationMetrics,
  calculateROI,
  createABTest,
  generateSprintPlan,
  ImprovementItem,
  KPIMetric,
  OptimizationData,
  prioritizeImprovements,
  trackKPIs
} from '@/lib/post-launch-optimization-utils';

describe('Post-Launch Optimization Utils', () => {
  describe('calculateOptimizationMetrics', () => {
    const mockData: OptimizationData = {
      analytics: {
        setupComplete: true,
        tools: ['Google Analytics', 'Mixpanel'],
        kpis: [
          {
            id: '1',
            name: 'User Retention',
            description: 'Monthly user retention rate',
            currentValue: 75,
            targetValue: 80,
            unit: '%',
            trend: 'up',
            category: 'retention',
            lastUpdated: new Date()
          }
        ],
        dashboards: ['Main Dashboard']
      },
      feedback: {
        methods: ['survey', 'support'],
        responses: [
          {
            id: '1',
            content: 'Great product!',
            source: 'survey',
            timestamp: new Date(),
            sentiment: 'positive'
          },
          {
            id: '2',
            content: 'Could be better',
            source: 'support',
            timestamp: new Date(),
            sentiment: 'neutral'
          }
        ],
        sentiment: { positive: 60, neutral: 30, negative: 10 }
      },
      improvements: [
        {
          id: '1',
          title: 'Improve onboarding',
          description: 'Make onboarding smoother',
          impact: 'high',
          effort: 'medium',
          priority: 8,
          status: 'completed',
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Add dark mode',
          description: 'Implement dark mode theme',
          impact: 'medium',
          effort: 'low',
          priority: 7,
          status: 'backlog',
          createdAt: new Date()
        }
      ],
      sprints: [
        {
          id: '1',
          name: 'Sprint 1',
          duration: 2,
          startDate: new Date(),
          endDate: new Date(),
          status: 'completed',
          items: [],
          progress: 100,
          velocity: 8,
          burndownData: []
        }
      ],
      successMetrics: {
        kpis: [
          {
            id: '1',
            name: 'User Retention',
            description: 'Monthly user retention rate',
            currentValue: 75,
            targetValue: 80,
            unit: '%',
            trend: 'up',
            category: 'retention',
            lastUpdated: new Date()
          }
        ],
        targets: { retention: 80 },
        achievements: { retention: 75 }
      }
    };

    it('calculates overall health score correctly', () => {
      const metrics = calculateOptimizationMetrics(mockData);

      expect(metrics.overallHealth).toBeGreaterThan(0);
      expect(metrics.overallHealth).toBeLessThanOrEqual(100);
      expect(typeof metrics.overallHealth).toBe('number');
    });

    it('calculates analytics score based on setup', () => {
      const metrics = calculateOptimizationMetrics(mockData);

      expect(metrics.analyticsScore).toBeGreaterThan(0);
      expect(metrics.analyticsScore).toBeLessThanOrEqual(100);
    });

    it('calculates feedback score based on responses', () => {
      const metrics = calculateOptimizationMetrics(mockData);

      expect(metrics.feedbackScore).toBeGreaterThan(0);
      expect(metrics.feedbackScore).toBeLessThanOrEqual(100);
    });

    it('generates recommendations based on data', () => {
      const metrics = calculateOptimizationMetrics(mockData);

      expect(Array.isArray(metrics.recommendations)).toBe(true);
    });

    it('handles empty data gracefully', () => {
      const emptyData: OptimizationData = {
        analytics: { setupComplete: false, tools: [], kpis: [], dashboards: [] },
        feedback: { methods: [], responses: [], sentiment: { positive: 0, neutral: 0, negative: 0 } },
        improvements: [],
        sprints: [],
        successMetrics: { kpis: [], targets: {}, achievements: {} }
      };

      const metrics = calculateOptimizationMetrics(emptyData);

      expect(metrics.overallHealth).toBeGreaterThanOrEqual(0);
      expect(metrics.overallHealth).toBeLessThanOrEqual(100);
      expect(metrics.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeFeedback', () => {
    it('correctly identifies positive sentiment', () => {
      const result = analyzeFeedback('This product is amazing and excellent!');

      expect(result.sentiment).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('correctly identifies negative sentiment', () => {
      const result = analyzeFeedback('This is terrible and awful, I hate it!');

      expect(result.sentiment).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('correctly identifies neutral sentiment', () => {
      const result = analyzeFeedback('This is okay, nothing special.');

      expect(result.sentiment).toBe('neutral');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('categorizes feedback correctly', () => {
      const uiResult = analyzeFeedback('The interface design is confusing');
      expect(uiResult.category).toBe('UI/UX');

      const performanceResult = analyzeFeedback('The app is very slow');
      expect(performanceResult.category).toBe('Performance');

      const bugResult = analyzeFeedback('I found a bug in the system');
      expect(bugResult.category).toBe('Bug');
    });

    it('returns overall sentiment distribution', () => {
      const result = analyzeFeedback('Great product!');

      expect(result.overallSentiment.positive).toBeGreaterThanOrEqual(0);
      expect(result.overallSentiment.neutral).toBeGreaterThanOrEqual(0);
      expect(result.overallSentiment.negative).toBeGreaterThanOrEqual(0);
      expect(
        result.overallSentiment.positive +
        result.overallSentiment.neutral +
        result.overallSentiment.negative
      ).toBe(100);
    });

    it('handles empty feedback', () => {
      const result = analyzeFeedback('');

      expect(result.sentiment).toBe('neutral');
      expect(result.keywords).toEqual([]);
    });
  });

  describe('prioritizeImprovements', () => {
    const mockImprovements = [
      { title: 'High impact, low effort', impact: 'high' as const, effort: 'low' as const },
      { title: 'Low impact, high effort', impact: 'low' as const, effort: 'high' as const },
      { title: 'Medium impact, medium effort', impact: 'medium' as const, effort: 'medium' as const }
    ];

    it('assigns higher priority to high impact, low effort items', () => {
      const prioritized = prioritizeImprovements(mockImprovements);

      const highImpactLowEffort = prioritized.find(item => item.title === 'High impact, low effort');
      const lowImpactHighEffort = prioritized.find(item => item.title === 'Low impact, high effort');

      expect(highImpactLowEffort?.priority).toBeGreaterThan(lowImpactHighEffort?.priority || 0);
    });

    it('assigns priority values between 1 and 10', () => {
      const prioritized = prioritizeImprovements(mockImprovements);

      prioritized.forEach(item => {
        expect(item.priority).toBeGreaterThanOrEqual(1);
        expect(item.priority).toBeLessThanOrEqual(10);
      });
    });

    it('handles empty array', () => {
      const result = prioritizeImprovements([]);
      expect(result).toEqual([]);
    });
  });

  describe('generateSprintPlan', () => {
    const mockImprovements: ImprovementItem[] = [
      {
        id: '1',
        title: 'Improvement 1',
        description: 'Description 1',
        impact: 'high',
        effort: 'low',
        priority: 9,
        status: 'backlog',
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Improvement 2',
        description: 'Description 2',
        impact: 'medium',
        effort: 'medium',
        priority: 6,
        status: 'backlog',
        createdAt: new Date()
      }
    ];

    it('creates a sprint plan with correct structure', () => {
      const sprint = generateSprintPlan(mockImprovements, 2);

      expect(sprint.id).toBeDefined();
      expect(sprint.name).toBeDefined();
      expect(sprint.duration).toBe(2);
      expect(sprint.status).toBe('planned');
      expect(Array.isArray(sprint.items)).toBe(true);
      expect(sprint.progress).toBe(0);
      expect(sprint.velocity).toBeGreaterThan(0);
      expect(Array.isArray(sprint.burndownData)).toBe(true);
    });

    it('limits sprint items to maximum of 5', () => {
      const manyImprovements = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        title: `Improvement ${i}`,
        description: `Description ${i}`,
        impact: 'medium' as const,
        effort: 'medium' as const,
        priority: 5,
        status: 'backlog' as const,
        createdAt: new Date()
      }));

      const sprint = generateSprintPlan(manyImprovements, 2);
      expect(sprint.items.length).toBeLessThanOrEqual(5);
    });

    it('prioritizes items by priority score', () => {
      const sprint = generateSprintPlan(mockImprovements, 2);

      // Items should be sorted by priority (highest first)
      for (let i = 0; i < sprint.items.length - 1; i++) {
        expect(sprint.items[i].priority).toBeGreaterThanOrEqual(sprint.items[i + 1].priority);
      }
    });

    it('generates burndown data for the sprint duration', () => {
      const sprint = generateSprintPlan(mockImprovements, 2);

      expect(sprint.burndownData.length).toBeGreaterThan(0);
      expect(sprint.burndownData[0].remaining).toBeGreaterThanOrEqual(0);
      expect(sprint.burndownData[sprint.burndownData.length - 1].remaining).toBe(0);
    });
  });

  describe('trackKPIs', () => {
    const mockKPIs: KPIMetric[] = [
      {
        id: '1',
        name: 'User Retention',
        description: 'Monthly retention rate',
        currentValue: 90,
        targetValue: 80,
        unit: '%',
        trend: 'up',
        category: 'retention',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Customer Satisfaction',
        description: 'CSAT score',
        currentValue: 60,
        targetValue: 80,
        unit: 'score',
        trend: 'down',
        category: 'satisfaction',
        lastUpdated: new Date()
      }
    ];

    it('categorizes KPIs correctly', () => {
      const result = trackKPIs(mockKPIs);

      expect(result.summary.totalKPIs).toBe(2);
      expect(result.summary.onTrack).toBe(1); // 90/80 = 112.5% > 90%
      expect(result.summary.atRisk).toBe(1); // 60/80 = 75% >= 70% but < 90%
    });

    it('generates alerts for at-risk and critical KPIs', () => {
      const result = trackKPIs(mockKPIs);

      expect(result.alerts.length).toBeGreaterThan(0);
      expect(result.alerts.some(alert => alert.includes('Customer Satisfaction'))).toBe(true);
    });

    it('calculates average progress correctly', () => {
      const result = trackKPIs(mockKPIs);

      const expectedAverage = ((90 / 80 * 100) + (60 / 80 * 100)) / 2;
      expect(Math.round(result.summary.averageProgress)).toBe(Math.round(expectedAverage));
    });

    it('handles empty KPI array', () => {
      const result = trackKPIs([]);

      expect(result.summary.totalKPIs).toBe(0);
      expect(result.summary.averageProgress).toBe(0);
      expect(result.alerts).toEqual([]);
    });
  });

  describe('calculateROI', () => {
    const mockImprovement: ImprovementItem = {
      id: '1',
      title: 'Test Improvement',
      description: 'Test description',
      impact: 'high',
      effort: 'medium',
      priority: 8,
      status: 'backlog',
      createdAt: new Date()
    };

    it('calculates positive ROI correctly', () => {
      const roi = calculateROI(mockImprovement, 1000, 500);
      expect(roi).toBe(100); // (1000 - 500) / 500 * 100 = 100%
    });

    it('calculates negative ROI correctly', () => {
      const roi = calculateROI(mockImprovement, 300, 500);
      expect(roi).toBe(-40); // (300 - 500) / 500 * 100 = -40%
    });

    it('handles zero cost', () => {
      const roi = calculateROI(mockImprovement, 1000, 0);
      expect(roi).toBe(0);
    });

    it('handles zero benefit', () => {
      const roi = calculateROI(mockImprovement, 0, 500);
      expect(roi).toBe(-100);
    });
  });

  describe('createABTest', () => {
    it('creates A/B test with correct structure', () => {
      const test = createABTest(
        'Button Color Test',
        'Red buttons will increase conversion rate',
        [
          { name: 'Control', description: 'Blue button' },
          { name: 'Variant A', description: 'Red button' }
        ]
      );

      expect(test.id).toBeDefined();
      expect(test.name).toBe('Button Color Test');
      expect(test.hypothesis).toBe('Red buttons will increase conversion rate');
      expect(test.variants.length).toBe(2);
      expect(test.status).toBe('draft');
      expect(test.startDate).toBeInstanceOf(Date);
    });

    it('distributes traffic evenly among variants', () => {
      const test = createABTest(
        'Test',
        'Hypothesis',
        [
          { name: 'A', description: 'Variant A' },
          { name: 'B', description: 'Variant B' }
        ]
      );

      const totalTraffic = test.variants.reduce((sum, variant) => sum + variant.traffic, 0);
      expect(totalTraffic).toBe(100);
    });

    it('handles uneven traffic distribution for odd number of variants', () => {
      const test = createABTest(
        'Test',
        'Hypothesis',
        [
          { name: 'A', description: 'Variant A' },
          { name: 'B', description: 'Variant B' },
          { name: 'C', description: 'Variant C' }
        ]
      );

      const totalTraffic = test.variants.reduce((sum, variant) => sum + variant.traffic, 0);
      expect(totalTraffic).toBe(100);
    });
  });

  describe('analyzeUserBehavior', () => {
    it('returns array of insights', () => {
      const insights = analyzeUserBehavior({});

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('returns insights with correct structure', () => {
      const insights = analyzeUserBehavior({});

      insights.forEach(insight => {
        expect(insight.type).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(insight.impact);
        expect(typeof insight.actionable).toBe('boolean');
        expect(Array.isArray(insight.recommendedActions)).toBe(true);
      });
    });

    it('includes different types of insights', () => {
      const insights = analyzeUserBehavior({});

      const types = insights.map(insight => insight.type);
      expect(types.includes('drop_off_point')).toBe(true);
      expect(types.includes('feature_adoption')).toBe(true);
    });
  });
});
