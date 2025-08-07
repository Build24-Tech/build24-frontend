import {
  calculateBudgetAllocation,
  calculateMarketingEfficiency,
  calculateROI,
  calculateTimelineDuration,
  generateTimelineRecommendations,
  identifyCriticalPath,
  validatePricingStrategy
} from '../lib/go-to-market-utils';

// Mock data for testing
const mockMarketingChannels = [
  { channel: 'social-media', budget: 5000, expectedROI: 200, timeline: 'launch', metrics: ['CPA', 'CTR'] },
  { channel: 'ppc', budget: 10000, expectedROI: 150, timeline: 'pre-launch', metrics: ['ROAS', 'Conversion Rate'] },
  { channel: 'content-marketing', budget: 3000, expectedROI: 300, timeline: 'ongoing', metrics: ['Engagement', 'Leads'] }
];

const mockTimeline = {
  phases: [
    {
      name: 'Pre-Launch',
      duration: 60,
      milestones: [
        { name: 'Product Ready', date: '2024-01-01', dependencies: [], status: 'completed' as const },
        { name: 'Marketing Ready', date: '2024-01-15', dependencies: ['Product Ready'], status: 'in-progress' as const }
      ]
    },
    {
      name: 'Launch',
      duration: 30,
      milestones: [
        { name: 'Go Live', date: '2024-02-01', dependencies: ['Marketing Ready'], status: 'pending' as const },
        { name: 'Press Release', date: '2024-02-05', dependencies: ['Go Live'], status: 'pending' as const }
      ]
    }
  ],
  launchDate: '2024-02-01',
  criticalPath: []
};

const mockPricingTiers = [
  { name: 'Basic', price: 29, features: ['Feature 1', 'Feature 2'], target: 'Small businesses' },
  { name: 'Pro', price: 99, features: ['Feature 1', 'Feature 2', 'Feature 3'], target: 'Medium businesses' },
  { name: 'Enterprise', price: 299, features: ['All features'], target: 'Large enterprises' }
];

describe('Go-to-Market Calculations', () => {
  describe('calculateROI', () => {
    it('calculates ROI correctly for marketing channels', () => {
      const roi = calculateROI(mockMarketingChannels);

      expect(roi.totalInvestment).toBe(18000);
      expect(roi.expectedReturn).toBe(34000); // 5000*2 + 10000*1.5 + 3000*3
      expect(roi.overallROI).toBeCloseTo(88.89, 2); // ((34000 - 18000) / 18000) * 100
    });

    it('handles empty channels array', () => {
      const roi = calculateROI([]);

      expect(roi.totalInvestment).toBe(0);
      expect(roi.expectedReturn).toBe(0);
      expect(roi.overallROI).toBe(0);
    });

    it('calculates ROI for individual channels', () => {
      const roi = calculateROI(mockMarketingChannels);

      expect(roi.channelROI).toHaveLength(3);
      expect(roi.channelROI[0]).toEqual({
        channel: 'social-media',
        investment: 5000,
        return: 10000,
        roi: 100
      });
    });
  });

  describe('calculateBudgetAllocation', () => {
    it('calculates budget allocation percentages correctly', () => {
      const allocation = calculateBudgetAllocation(mockMarketingChannels);

      expect(allocation.totalBudget).toBe(18000);
      expect(allocation.allocations).toHaveLength(3);
      expect(allocation.allocations[0]).toEqual({
        channel: 'social-media',
        budget: 5000,
        percentage: 27.78
      });
      expect(allocation.allocations[1].percentage).toBeCloseTo(55.56, 2);
      expect(allocation.allocations[2].percentage).toBeCloseTo(16.67, 2);
    });

    it('handles single channel', () => {
      const singleChannel = [mockMarketingChannels[0]];
      const allocation = calculateBudgetAllocation(singleChannel);

      expect(allocation.allocations[0].percentage).toBe(100);
    });

    it('identifies budget concentration risks', () => {
      const concentratedChannels = [
        { channel: 'ppc', budget: 15000, expectedROI: 150, timeline: 'launch', metrics: [] },
        { channel: 'social-media', budget: 1000, expectedROI: 200, timeline: 'launch', metrics: [] }
      ];

      const allocation = calculateBudgetAllocation(concentratedChannels);

      expect(allocation.risks).toContain('High budget concentration in ppc (93.75%)');
    });
  });

  describe('calculateTimelineDuration', () => {
    it('calculates total timeline duration correctly', () => {
      const duration = calculateTimelineDuration(mockTimeline);

      expect(duration.totalDays).toBe(90);
      expect(duration.phases).toHaveLength(2);
      expect(duration.phases[0]).toEqual({
        name: 'Pre-Launch',
        duration: 60,
        startDate: expect.any(Date),
        endDate: expect.any(Date)
      });
    });

    it('calculates milestone completion percentage', () => {
      const duration = calculateTimelineDuration(mockTimeline);

      expect(duration.completionPercentage).toBe(25); // 1 out of 4 milestones completed
    });

    it('identifies overdue milestones', () => {
      const overdueTimeline = {
        ...mockTimeline,
        phases: [{
          ...mockTimeline.phases[0],
          milestones: [
            { name: 'Overdue Task', date: '2023-01-01', dependencies: [], status: 'pending' as const }
          ]
        }]
      };

      const duration = calculateTimelineDuration(overdueTimeline);

      expect(duration.overdueMilestones).toHaveLength(1);
      expect(duration.overdueMilestones[0]).toBe('Overdue Task');
    });
  });

  describe('identifyCriticalPath', () => {
    it('identifies critical path milestones correctly', () => {
      const criticalPath = identifyCriticalPath(mockTimeline);

      expect(criticalPath.milestones).toContain('Marketing Ready');
      expect(criticalPath.milestones).toContain('Go Live');
      expect(criticalPath.milestones).toContain('Press Release');
    });

    it('calculates critical path duration', () => {
      const criticalPath = identifyCriticalPath(mockTimeline);

      expect(criticalPath.totalDuration).toBe(90); // Full timeline duration
      expect(criticalPath.bottlenecks).toContain('Marketing Ready');
    });

    it('handles timeline with no dependencies', () => {
      const noDepsTimeline = {
        phases: [{
          name: 'Simple Phase',
          duration: 30,
          milestones: [
            { name: 'Task 1', date: '2024-01-01', dependencies: [], status: 'pending' as const },
            { name: 'Task 2', date: '2024-01-15', dependencies: [], status: 'pending' as const }
          ]
        }],
        launchDate: '2024-02-01',
        criticalPath: []
      };

      const criticalPath = identifyCriticalPath(noDepsTimeline);

      expect(criticalPath.milestones).toHaveLength(0);
      expect(criticalPath.bottlenecks).toHaveLength(0);
    });
  });

  describe('validatePricingStrategy', () => {
    it('validates pricing tier structure', () => {
      const validation = validatePricingStrategy({
        strategy: 'value-based',
        model: 'subscription',
        tiers: mockPricingTiers,
        competitiveAnalysis: []
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.recommendations).toContain('Good price progression across tiers');
    });

    it('identifies pricing issues', () => {
      const badPricing = {
        strategy: 'value-based',
        model: 'subscription',
        tiers: [
          { name: 'Basic', price: 100, features: ['Feature 1'], target: 'Small businesses' },
          { name: 'Pro', price: 50, features: ['Feature 1', 'Feature 2'], target: 'Medium businesses' }
        ],
        competitiveAnalysis: []
      };

      const validation = validatePricingStrategy(badPricing);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Price decreases from Basic to Pro tier');
    });

    it('validates competitive positioning', () => {
      const pricingWithCompetitors = {
        strategy: 'competitive',
        model: 'subscription',
        tiers: mockPricingTiers,
        competitiveAnalysis: [
          { competitor: 'Competitor A', price: 25, features: ['Basic features'], positioning: 'Budget option' },
          { competitor: 'Competitor B', price: 150, features: ['Premium features'], positioning: 'Premium option' }
        ]
      };

      const validation = validatePricingStrategy(pricingWithCompetitors);

      expect(validation.competitivePosition).toBeDefined();
      expect(validation.competitivePosition.positioning).toBe('mid-market');
    });
  });

  describe('calculateMarketingEfficiency', () => {
    it('calculates efficiency metrics for marketing channels', () => {
      const efficiency = calculateMarketingEfficiency(mockMarketingChannels);

      expect(efficiency.mostEfficient).toBe('content-marketing');
      expect(efficiency.leastEfficient).toBe('ppc');
      expect(efficiency.averageROI).toBeCloseTo(216.67, 2);
    });

    it('identifies optimization opportunities', () => {
      const efficiency = calculateMarketingEfficiency(mockMarketingChannels);

      expect(efficiency.optimizations).toContain('Consider increasing budget for content-marketing (highest ROI: 300%)');
      expect(efficiency.optimizations).toContain('Review ppc performance (lowest ROI: 150%)');
    });

    it('calculates cost per acquisition estimates', () => {
      const channelsWithTargets = mockMarketingChannels.map(channel => ({
        ...channel,
        expectedCustomers: channel.budget / 50 // Assume $50 CPA
      }));

      const efficiency = calculateMarketingEfficiency(channelsWithTargets);

      expect(efficiency.estimatedCPA).toBeDefined();
      expect(efficiency.totalExpectedCustomers).toBe(360); // 18000 / 50
    });
  });

  describe('generateTimelineRecommendations', () => {
    it('generates recommendations based on timeline analysis', () => {
      const recommendations = generateTimelineRecommendations(mockTimeline);

      expect(recommendations).toContain('Consider adding buffer time for critical milestones');
      expect(recommendations).toContain('Marketing Ready is on the critical path - monitor closely');
    });

    it('identifies resource allocation issues', () => {
      const busyTimeline = {
        ...mockTimeline,
        phases: [{
          name: 'Busy Phase',
          duration: 7,
          milestones: [
            { name: 'Task 1', date: '2024-01-01', dependencies: [], status: 'pending' as const },
            { name: 'Task 2', date: '2024-01-02', dependencies: [], status: 'pending' as const },
            { name: 'Task 3', date: '2024-01-03', dependencies: [], status: 'pending' as const },
            { name: 'Task 4', date: '2024-01-04', dependencies: [], status: 'pending' as const },
            { name: 'Task 5', date: '2024-01-05', dependencies: [], status: 'pending' as const }
          ]
        }]
      };

      const recommendations = generateTimelineRecommendations(busyTimeline);

      expect(recommendations).toContain('Busy Phase has high milestone density - consider extending duration');
    });

    it('suggests timeline optimizations', () => {
      const recommendations = generateTimelineRecommendations(mockTimeline);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('critical path'))).toBe(true);
    });
  });
});
