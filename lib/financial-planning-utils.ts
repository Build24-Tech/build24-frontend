import { z } from 'zod';

// Financial data schemas
export const RevenueModelSchema = z.object({
  type: z.enum(['subscription', 'one-time', 'freemium', 'advertising', 'commission', 'licensing']),
  monthlyRecurring: z.number().min(0).optional(),
  oneTimeRevenue: z.number().min(0).optional(),
  conversionRate: z.number().min(0).max(1).optional(),
  averageOrderValue: z.number().min(0).optional(),
  customerLifetimeValue: z.number().min(0).optional(),
});

export const CostStructureSchema = z.object({
  fixedCosts: z.record(z.string(), z.number().min(0)),
  variableCosts: z.record(z.string(), z.number().min(0)),
  oneTimeCosts: z.record(z.string(), z.number().min(0)),
});

export const CashFlowProjectionSchema = z.object({
  timeframe: z.enum(['monthly', 'quarterly', 'yearly']),
  periods: z.number().min(1).max(60),
  startingCash: z.number().min(0),
  revenue: z.array(z.number()),
  expenses: z.array(z.number()),
});

export const BusinessModelSchema = z.object({
  type: z.enum(['B2B', 'B2C', 'B2B2C', 'marketplace', 'platform', 'saas', 'ecommerce']),
  revenueStreams: z.array(RevenueModelSchema),
  costStructure: CostStructureSchema,
  keyMetrics: z.record(z.string(), z.number()),
});

export const PricingStrategySchema = z.object({
  methodology: z.enum(['cost-plus', 'value-based', 'competitive', 'penetration', 'skimming']),
  basePrice: z.number().min(0),
  tiers: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    features: z.array(z.string()),
  })).optional(),
  discounts: z.array(z.object({
    type: z.string(),
    percentage: z.number().min(0).max(100),
    conditions: z.string(),
  })).optional(),
});

// Types
export type RevenueModel = z.infer<typeof RevenueModelSchema>;
export type CostStructure = z.infer<typeof CostStructureSchema>;
export type CashFlowProjection = z.infer<typeof CashFlowProjectionSchema>;
export type BusinessModel = z.infer<typeof BusinessModelSchema>;
export type PricingStrategy = z.infer<typeof PricingStrategySchema>;

export interface FinancialProjection {
  revenue: number[];
  expenses: number[];
  profit: number[];
  cashFlow: number[];
  cumulativeCashFlow: number[];
  breakEvenMonth?: number;
  roi: number;
  paybackPeriod?: number;
}

export interface FundingRequirement {
  totalRequired: number;
  runway: number; // months
  milestones: Array<{
    month: number;
    amount: number;
    purpose: string;
  }>;
  fundingGap?: number;
}

// Financial calculation functions
export function calculateFinancialProjection(
  businessModel: BusinessModel,
  cashFlowData: CashFlowProjection
): FinancialProjection {
  const { revenue, expenses } = cashFlowData;
  const profit = revenue.map((r, i) => r - expenses[i]);

  // Calculate cash flow (profit + depreciation - capex - working capital changes)
  const cashFlow = profit.map(p => p); // Simplified for now

  // Calculate cumulative cash flow
  const cumulativeCashFlow = cashFlow.reduce((acc, cf, i) => {
    const cumulative = i === 0 ? cashFlowData.startingCash + cf : acc[i - 1] + cf;
    acc.push(cumulative);
    return acc;
  }, [] as number[]);

  // Find break-even month
  const breakEvenMonth = cumulativeCashFlow.findIndex(cf => cf > 0);

  // Calculate ROI
  const totalInvestment = Math.abs(Math.min(...cumulativeCashFlow, 0));
  const totalReturn = Math.max(...cumulativeCashFlow);
  const roi = totalInvestment > 0 ? ((totalReturn - totalInvestment) / totalInvestment) * 100 : 0;

  // Calculate payback period
  const paybackPeriod = breakEvenMonth >= 0 ? breakEvenMonth + 1 : undefined;

  return {
    revenue,
    expenses,
    profit,
    cashFlow,
    cumulativeCashFlow,
    breakEvenMonth: breakEvenMonth >= 0 ? breakEvenMonth + 1 : undefined,
    roi,
    paybackPeriod,
  };
}

export function calculateFundingRequirements(
  projection: FinancialProjection,
  targetRunway: number = 18
): FundingRequirement {
  const minCashFlow = Math.min(...projection.cumulativeCashFlow);
  const totalRequired = Math.abs(minCashFlow) * 1.2; // 20% buffer

  // Calculate runway based on burn rate
  const monthlyBurn = projection.expenses.reduce((sum, exp) => sum + exp, 0) / projection.expenses.length;
  const runway = totalRequired / monthlyBurn;

  // Identify key funding milestones
  const milestones = [];
  const quarterlyNeeds = [];

  for (let i = 0; i < projection.cumulativeCashFlow.length; i += 3) {
    const quarterCash = projection.cumulativeCashFlow[i];
    if (quarterCash < 0) {
      quarterlyNeeds.push({
        month: i + 1,
        amount: Math.abs(quarterCash),
        purpose: `Quarter ${Math.floor(i / 3) + 1} operations`,
      });
    }
  }

  milestones.push(...quarterlyNeeds);

  const fundingGap = runway < targetRunway ? (targetRunway - runway) * monthlyBurn : undefined;

  return {
    totalRequired,
    runway,
    milestones,
    fundingGap,
  };
}

export function optimizeFinancialModel(
  businessModel: BusinessModel,
  projection: FinancialProjection
): Array<{
  type: 'revenue' | 'cost' | 'pricing' | 'timing';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  expectedImprovement: string;
}> {
  const suggestions = [];

  // Check for negative cash flow periods
  const negativeMonths = projection.cumulativeCashFlow.filter(cf => cf < 0).length;
  if (negativeMonths > 0) {
    suggestions.push({
      type: 'cost' as const,
      suggestion: 'Reduce fixed costs by 15-20% to improve cash flow runway',
      impact: 'high' as const,
      effort: 'medium' as const,
      expectedImprovement: 'Extend runway by 3-6 months',
    });
  }

  // Check revenue growth rate
  const revenueGrowth = projection.revenue.length > 1
    ? (projection.revenue[projection.revenue.length - 1] - projection.revenue[0]) / Math.max(projection.revenue[0], 1)
    : 0;

  if (revenueGrowth < 0.5) {
    suggestions.push({
      type: 'revenue' as const,
      suggestion: 'Implement aggressive customer acquisition strategy to increase monthly growth rate',
      impact: 'high' as const,
      effort: 'high' as const,
      expectedImprovement: 'Increase revenue growth by 20-30%',
    });
  }

  // Check pricing optimization
  const avgRevenue = projection.revenue.length > 0
    ? projection.revenue.reduce((sum, r) => sum + r, 0) / projection.revenue.length
    : 0;
  const avgExpenses = projection.expenses.length > 0
    ? projection.expenses.reduce((sum, e) => sum + e, 0) / projection.expenses.length
    : 0;
  const margin = avgRevenue > 0 ? (avgRevenue - avgExpenses) / avgRevenue : 0;

  if (margin < 0.2) {
    suggestions.push({
      type: 'pricing' as const,
      suggestion: 'Consider value-based pricing to improve margins by 10-15%',
      impact: 'medium' as const,
      effort: 'low' as const,
      expectedImprovement: 'Increase gross margin to 25-30%',
    });
  }

  // Check break-even timing
  if (!projection.breakEvenMonth || projection.breakEvenMonth > 24) {
    suggestions.push({
      type: 'timing' as const,
      suggestion: 'Accelerate product-market fit to reach break-even within 18 months',
      impact: 'high' as const,
      effort: 'high' as const,
      expectedImprovement: 'Reduce time to profitability by 6-12 months',
    });
  }

  return suggestions;
}

// Business model templates
export const businessModelTemplates = {
  saas: {
    type: 'saas' as const,
    revenueStreams: [
      {
        type: 'subscription' as const,
        monthlyRecurring: 0,
        conversionRate: 0.02,
        customerLifetimeValue: 0,
      },
    ],
    costStructure: {
      fixedCosts: {
        'Development Team': 15000,
        'Infrastructure': 2000,
        'Marketing': 5000,
        'Operations': 3000,
      },
      variableCosts: {
        'Customer Support': 50,
        'Payment Processing': 0.029,
        'Hosting per User': 2,
      },
      oneTimeCosts: {
        'Initial Development': 50000,
        'Legal Setup': 5000,
      },
    },
    keyMetrics: {
      'Monthly Churn Rate': 0.05,
      'Customer Acquisition Cost': 100,
      'Monthly Active Users': 0,
    },
  },
  ecommerce: {
    type: 'ecommerce' as const,
    revenueStreams: [
      {
        type: 'one-time' as const,
        averageOrderValue: 50,
        conversionRate: 0.02,
      },
    ],
    costStructure: {
      fixedCosts: {
        'Platform Fees': 500,
        'Marketing': 3000,
        'Operations': 2000,
      },
      variableCosts: {
        'Cost of Goods Sold': 0.4,
        'Shipping': 8,
        'Payment Processing': 0.029,
      },
      oneTimeCosts: {
        'Initial Inventory': 20000,
        'Website Development': 10000,
      },
    },
    keyMetrics: {
      'Return Rate': 0.1,
      'Repeat Purchase Rate': 0.3,
      'Inventory Turnover': 6,
    },
  },
  marketplace: {
    type: 'marketplace' as const,
    revenueStreams: [
      {
        type: 'commission' as const,
        conversionRate: 0.05,
      },
    ],
    costStructure: {
      fixedCosts: {
        'Development Team': 20000,
        'Marketing': 8000,
        'Operations': 5000,
      },
      variableCosts: {
        'Payment Processing': 0.029,
        'Customer Support': 25,
      },
      oneTimeCosts: {
        'Platform Development': 100000,
        'Legal Setup': 10000,
      },
    },
    keyMetrics: {
      'Take Rate': 0.15,
      'Seller Acquisition Cost': 200,
      'Buyer Acquisition Cost': 50,
    },
  },
};

// Pricing methodology helpers
export function calculateCostPlusPricing(
  costPerUnit: number,
  desiredMargin: number
): number {
  return costPerUnit * (1 + desiredMargin);
}

export function calculateValueBasedPricing(
  customerValue: number,
  valueCapture: number = 0.1
): number {
  return customerValue * valueCapture;
}

export function calculateCompetitivePricing(
  competitorPrices: number[],
  strategy: 'premium' | 'match' | 'undercut' = 'match'
): number {
  if (competitorPrices.length === 0) {
    return 0;
  }

  const avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;

  switch (strategy) {
    case 'premium':
      return avgPrice * 1.2;
    case 'undercut':
      return avgPrice * 0.9;
    default:
      return avgPrice;
  }
}
