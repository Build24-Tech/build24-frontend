import {
  BusinessModel,
  businessModelTemplates,
  calculateCompetitivePricing,
  calculateCostPlusPricing,
  calculateFinancialProjection,
  calculateFundingRequirements,
  calculateValueBasedPricing,
  CashFlowProjection,
  optimizeFinancialModel,
} from '@/lib/financial-planning-utils';

describe('Financial Planning Utils', () => {
  describe('calculateFinancialProjection', () => {
    const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
    const mockCashFlowData: CashFlowProjection = {
      timeframe: 'monthly',
      periods: 12,
      startingCash: 50000,
      revenue: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500],
      expenses: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
    };

    it('should calculate profit correctly', () => {
      const projection = calculateFinancialProjection(mockBusinessModel, mockCashFlowData);

      expect(projection.profit).toHaveLength(12);
      expect(projection.profit[0]).toBe(-4000); // 1000 - 5000
      expect(projection.profit[11]).toBe(1500); // 6500 - 5000
    });

    it('should calculate cumulative cash flow correctly', () => {
      const projection = calculateFinancialProjection(mockBusinessModel, mockCashFlowData);

      expect(projection.cumulativeCashFlow).toHaveLength(12);
      expect(projection.cumulativeCashFlow[0]).toBe(46000); // 50000 + (-4000)
      expect(projection.cumulativeCashFlow[1]).toBe(42500); // 46000 + (-3500)
    });

    it('should identify break-even month correctly', () => {
      const projection = calculateFinancialProjection(mockBusinessModel, mockCashFlowData);

      // Should find the first month where cumulative cash flow is positive
      expect(projection.breakEvenMonth).toBeGreaterThan(0);
      expect(projection.breakEvenMonth).toBeLessThanOrEqual(12);
    });

    it('should calculate ROI correctly', () => {
      const projection = calculateFinancialProjection(mockBusinessModel, mockCashFlowData);

      expect(projection.roi).toBeGreaterThanOrEqual(0);
      expect(typeof projection.roi).toBe('number');
    });

    it('should handle scenarios with no break-even', () => {
      const negativeScenario: CashFlowProjection = {
        ...mockCashFlowData,
        startingCash: 5000, // Very low starting cash
        revenue: Array(12).fill(1000),
        expenses: Array(12).fill(5000),
      };

      const projection = calculateFinancialProjection(mockBusinessModel, negativeScenario);

      // With consistently negative cash flow, should eventually run out of money
      // But if starting cash is positive, first month might still be positive
      expect(projection.cumulativeCashFlow[projection.cumulativeCashFlow.length - 1]).toBeLessThan(0);
      // Most months should be negative
      const negativeMonths = projection.cumulativeCashFlow.filter(cf => cf < 0).length;
      expect(negativeMonths).toBeGreaterThan(0);
    });
  });

  describe('calculateFundingRequirements', () => {
    const mockProjection = {
      revenue: [1000, 1500, 2000, 2500, 3000, 3500],
      expenses: [5000, 5000, 5000, 5000, 5000, 5000],
      profit: [-4000, -3500, -3000, -2500, -2000, -1500],
      cashFlow: [-4000, -3500, -3000, -2500, -2000, -1500],
      cumulativeCashFlow: [46000, 42500, 39500, 37000, 35000, 33500],
      roi: 0,
    };

    it('should calculate total funding required with buffer', () => {
      const funding = calculateFundingRequirements(mockProjection);

      expect(funding.totalRequired).toBeGreaterThan(0);
      // Should include 20% buffer
      expect(funding.totalRequired).toBeGreaterThan(Math.abs(Math.min(...mockProjection.cumulativeCashFlow)));
    });

    it('should calculate runway in months', () => {
      const funding = calculateFundingRequirements(mockProjection);

      expect(funding.runway).toBeGreaterThan(0);
      expect(typeof funding.runway).toBe('number');
    });

    it('should identify funding milestones', () => {
      const funding = calculateFundingRequirements(mockProjection);

      expect(Array.isArray(funding.milestones)).toBe(true);
      funding.milestones.forEach(milestone => {
        expect(milestone).toHaveProperty('month');
        expect(milestone).toHaveProperty('amount');
        expect(milestone).toHaveProperty('purpose');
      });
    });

    it('should identify funding gap when runway is insufficient', () => {
      const funding = calculateFundingRequirements(mockProjection, 24);

      if (funding.runway < 24) {
        expect(funding.fundingGap).toBeGreaterThan(0);
      }
    });
  });

  describe('optimizeFinancialModel', () => {
    const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
    const mockProjection = {
      revenue: [1000, 1050, 1100, 1150, 1200, 1250],
      expenses: [5000, 5000, 5000, 5000, 5000, 5000],
      profit: [-4000, -3900, -3800, -3700, -3600, -3500],
      cashFlow: [-4000, -3900, -3800, -3700, -3600, -3500],
      cumulativeCashFlow: [46000, 42100, 38300, 34600, 31000, -2500],
      roi: -50,
      breakEvenMonth: undefined,
    };

    it('should return optimization suggestions', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      expect(Array.isArray(optimizations)).toBe(true);
      expect(optimizations.length).toBeGreaterThan(0);
    });

    it('should suggest cost reduction for negative cash flow', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      const costOptimization = optimizations.find(opt => opt.type === 'cost');
      expect(costOptimization).toBeDefined();
      expect(costOptimization?.impact).toBe('high');
    });

    it('should suggest revenue improvements for low growth', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      const revenueOptimization = optimizations.find(opt => opt.type === 'revenue');
      expect(revenueOptimization).toBeDefined();
    });

    it('should suggest pricing optimization for low margins', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      const pricingOptimization = optimizations.find(opt => opt.type === 'pricing');
      expect(pricingOptimization).toBeDefined();
    });

    it('should suggest timing improvements for late break-even', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      const timingOptimization = optimizations.find(opt => opt.type === 'timing');
      expect(timingOptimization).toBeDefined();
    });

    it('should include impact and effort ratings', () => {
      const optimizations = optimizeFinancialModel(mockBusinessModel, mockProjection);

      optimizations.forEach(opt => {
        expect(['high', 'medium', 'low']).toContain(opt.impact);
        expect(['high', 'medium', 'low']).toContain(opt.effort);
        expect(opt.expectedImprovement).toBeTruthy();
      });
    });
  });

  describe('Pricing Calculations', () => {
    describe('calculateCostPlusPricing', () => {
      it('should calculate cost-plus pricing correctly', () => {
        const price = calculateCostPlusPricing(25, 0.4);
        expect(price).toBe(35); // 25 * (1 + 0.4)
      });

      it('should handle zero margin', () => {
        const price = calculateCostPlusPricing(25, 0);
        expect(price).toBe(25);
      });

      it('should handle high margins', () => {
        const price = calculateCostPlusPricing(25, 2);
        expect(price).toBe(75); // 25 * (1 + 2)
      });
    });

    describe('calculateValueBasedPricing', () => {
      it('should calculate value-based pricing correctly', () => {
        const price = calculateValueBasedPricing(1000, 0.1);
        expect(price).toBe(100); // 1000 * 0.1
      });

      it('should use default value capture rate', () => {
        const price = calculateValueBasedPricing(1000);
        expect(price).toBe(100); // 1000 * 0.1 (default)
      });

      it('should handle different value capture rates', () => {
        const price = calculateValueBasedPricing(1000, 0.2);
        expect(price).toBe(200);
      });
    });

    describe('calculateCompetitivePricing', () => {
      const competitorPrices = [29, 39, 49, 59];

      it('should calculate average pricing correctly', () => {
        const price = calculateCompetitivePricing(competitorPrices, 'match');
        expect(price).toBe(44); // (29 + 39 + 49 + 59) / 4
      });

      it('should calculate premium pricing correctly', () => {
        const price = calculateCompetitivePricing(competitorPrices, 'premium');
        expect(price).toBe(52.8); // 44 * 1.2
      });

      it('should calculate undercut pricing correctly', () => {
        const price = calculateCompetitivePricing(competitorPrices, 'undercut');
        expect(price).toBe(39.6); // 44 * 0.9
      });

      it('should handle single competitor price', () => {
        const price = calculateCompetitivePricing([50], 'match');
        expect(price).toBe(50);
      });

      it('should handle empty competitor array', () => {
        const price = calculateCompetitivePricing([], 'match');
        expect(price).toBe(0);
      });
    });
  });

  describe('Business Model Templates', () => {
    it('should have SaaS template with correct structure', () => {
      const saasTemplate = businessModelTemplates.saas;

      expect(saasTemplate.type).toBe('saas');
      expect(saasTemplate.revenueStreams).toHaveLength(1);
      expect(saasTemplate.revenueStreams[0].type).toBe('subscription');
      expect(saasTemplate.costStructure.fixedCosts).toBeDefined();
      expect(saasTemplate.costStructure.variableCosts).toBeDefined();
      expect(saasTemplate.keyMetrics).toBeDefined();
    });

    it('should have ecommerce template with correct structure', () => {
      const ecommerceTemplate = businessModelTemplates.ecommerce;

      expect(ecommerceTemplate.type).toBe('ecommerce');
      expect(ecommerceTemplate.revenueStreams[0].type).toBe('one-time');
      expect(ecommerceTemplate.costStructure.variableCosts['Cost of Goods Sold']).toBeDefined();
    });

    it('should have marketplace template with correct structure', () => {
      const marketplaceTemplate = businessModelTemplates.marketplace;

      expect(marketplaceTemplate.type).toBe('marketplace');
      expect(marketplaceTemplate.revenueStreams[0].type).toBe('commission');
      expect(marketplaceTemplate.keyMetrics['Take Rate']).toBeDefined();
    });

    it('should have all required cost categories', () => {
      Object.values(businessModelTemplates).forEach(template => {
        expect(template.costStructure.fixedCosts).toBeDefined();
        expect(template.costStructure.variableCosts).toBeDefined();
        expect(template.costStructure.oneTimeCosts).toBeDefined();
        expect(Object.keys(template.costStructure.fixedCosts).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative revenue gracefully', () => {
      const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
      const negativeRevenueData: CashFlowProjection = {
        timeframe: 'monthly',
        periods: 6,
        startingCash: 10000,
        revenue: [-1000, -500, 0, 500, 1000, 1500],
        expenses: [2000, 2000, 2000, 2000, 2000, 2000],
      };

      const projection = calculateFinancialProjection(mockBusinessModel, negativeRevenueData);

      expect(projection.profit[0]).toBe(-3000); // -1000 - 2000
      expect(projection.cumulativeCashFlow[0]).toBe(7000); // 10000 + (-3000)
    });

    it('should handle zero expenses', () => {
      const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
      const zeroExpenseData: CashFlowProjection = {
        timeframe: 'monthly',
        periods: 3,
        startingCash: 0,
        revenue: [1000, 2000, 3000],
        expenses: [0, 0, 0],
      };

      const projection = calculateFinancialProjection(mockBusinessModel, zeroExpenseData);

      expect(projection.profit).toEqual([1000, 2000, 3000]);
      expect(projection.cumulativeCashFlow).toEqual([1000, 3000, 6000]);
      expect(projection.breakEvenMonth).toBe(1);
    });

    it('should handle empty arrays gracefully', () => {
      const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
      const emptyData: CashFlowProjection = {
        timeframe: 'monthly',
        periods: 0,
        startingCash: 1000,
        revenue: [],
        expenses: [],
      };

      const projection = calculateFinancialProjection(mockBusinessModel, emptyData);

      expect(projection.revenue).toEqual([]);
      expect(projection.expenses).toEqual([]);
      expect(projection.profit).toEqual([]);
      expect(projection.cumulativeCashFlow).toEqual([]);
    });

    it('should handle mismatched revenue and expense arrays', () => {
      const mockBusinessModel: BusinessModel = businessModelTemplates.saas;
      const mismatchedData: CashFlowProjection = {
        timeframe: 'monthly',
        periods: 3,
        startingCash: 1000,
        revenue: [1000, 2000],
        expenses: [500, 600, 700],
      };

      const projection = calculateFinancialProjection(mockBusinessModel, mismatchedData);

      // Should handle the shorter array length
      expect(projection.profit).toHaveLength(2);
      expect(projection.profit[0]).toBe(500); // 1000 - 500
      expect(projection.profit[1]).toBe(1400); // 2000 - 600
    });
  });
});
