import { BusinessModel, FinancialData, FinancialProjection, FundingRequirements } from '@/types/launch-essentials';

export const businessModelTemplates: Record<string, BusinessModel> = {
  saas: {
    type: 'saas',
    revenueStreams: ['Subscription fees', 'Premium features', 'Enterprise plans'],
    costStructure: {
      'Development Team': 15000,
      'Infrastructure': 2000,
      'Marketing': 5000,
      'Operations': 3000
    },
    keyMetrics: ['MRR', 'Churn Rate', 'LTV', 'CAC']
  },
  ecommerce: {
    type: 'ecommerce',
    revenueStreams: ['Product sales', 'Shipping fees', 'Premium memberships'],
    costStructure: {
      'Inventory': 20000,
      'Fulfillment': 5000,
      'Marketing': 8000,
      'Operations': 4000
    },
    keyMetrics: ['GMV', 'Conversion Rate', 'AOV', 'Customer Retention']
  },
  marketplace: {
    type: 'marketplace',
    revenueStreams: ['Transaction fees', 'Listing fees', 'Premium services'],
    costStructure: {
      'Platform Development': 12000,
      'Customer Support': 4000,
      'Marketing': 10000,
      'Operations': 3000
    },
    keyMetrics: ['GMV', 'Take Rate', 'Active Users', 'Liquidity']
  }
};

export function calculateFinancialProjection(data: FinancialData): FinancialProjection {
  const { periods, revenue, expenses, startingCash } = data;

  const profit = revenue.map((rev, i) => rev - expenses[i]);
  const cashFlow = profit.slice();
  const cumulativeCashFlow = [startingCash];

  for (let i = 0; i < periods; i++) {
    const prevCash = cumulativeCashFlow[i];
    cumulativeCashFlow.push(prevCash + cashFlow[i]);
  }

  // Find break-even month
  let breakEvenMonth = -1;
  for (let i = 0; i < profit.length; i++) {
    if (profit[i] > 0) {
      breakEvenMonth = i + 1;
      break;
    }
  }

  // Calculate ROI (simplified)
  const totalRevenue = revenue.reduce((sum, rev) => sum + rev, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp, 0);
  const roi = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

  // Calculate payback period (simplified)
  const paybackPeriod = breakEvenMonth > 0 ? breakEvenMonth : periods;

  return {
    revenue,
    expenses,
    profit,
    cashFlow,
    cumulativeCashFlow: cumulativeCashFlow.slice(1), // Remove starting cash
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : periods,
    roi: Math.round(roi * 10) / 10,
    paybackPeriod
  };
}

export function calculateFundingRequirements(data: FinancialData): FundingRequirements {
  const projection = calculateFinancialProjection(data);
  const minCash = Math.min(...projection.cumulativeCashFlow);
  const totalRequired = Math.max(0, Math.abs(minCash) + 10000); // Add buffer

  const runway = data.startingCash / (data.expenses.reduce((sum, exp) => sum + exp, 0) / data.periods);

  const milestones = [
    { month: 6, amount: totalRequired * 0.4, purpose: 'Initial operations' },
    { month: 12, amount: totalRequired * 0.6, purpose: 'Growth phase' }
  ];

  const fundingGap = Math.max(0, totalRequired - data.startingCash);

  return {
    totalRequired,
    runway,
    milestones,
    fundingGap
  };
}

export function optimizeFinancialModel(data: FinancialData): Array<{
  type: 'cost' | 'revenue';
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  expectedImprovement: string;
}> {
  const optimizations = [];

  const avgExpenses = data.expenses.reduce((sum, exp) => sum + exp, 0) / data.expenses.length;
  const avgRevenue = data.revenue.reduce((sum, rev) => sum + rev, 0) / data.revenue.length;

  if (avgExpenses > avgRevenue * 0.8) {
    optimizations.push({
      type: 'cost' as const,
      suggestion: 'Reduce fixed costs by 15-20%',
      impact: 'high' as const,
      effort: 'medium' as const,
      expectedImprovement: 'Extend runway by 3-6 months'
    });
  }

  if (avgRevenue < 50000) {
    optimizations.push({
      type: 'revenue' as const,
      suggestion: 'Implement aggressive customer acquisition',
      impact: 'high' as const,
      effort: 'high' as const,
      expectedImprovement: 'Increase revenue growth by 20-30%'
    });
  }

  return optimizations;
}
