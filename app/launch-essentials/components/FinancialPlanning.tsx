'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BusinessModel,
  CashFlowProjection,
  PricingStrategy,
  businessModelTemplates,
  calculateCompetitivePricing,
  calculateCostPlusPricing,
  calculateFinancialProjection,
  calculateFundingRequirements,
  calculateValueBasedPricing,
  optimizeFinancialModel,
} from '@/lib/financial-planning-utils';
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  Clock,
  DollarSign,
  PieChart,
  Target,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinancialPlanningProps {
  onSave?: (data: any) => void;
  initialData?: any;
}

export default function FinancialPlanning({ onSave, initialData }: FinancialPlanningProps) {
  const [activeTab, setActiveTab] = useState('business-model');
  const [businessModel, setBusinessModel] = useState<BusinessModel>(
    initialData?.businessModel || businessModelTemplates.saas
  );
  const [cashFlowData, setCashFlowData] = useState<CashFlowProjection>(
    initialData?.cashFlowData || {
      timeframe: 'monthly',
      periods: 24,
      startingCash: 50000,
      revenue: Array(24).fill(0),
      expenses: Array(24).fill(0),
    }
  );
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>(
    initialData?.pricingStrategy || {
      methodology: 'value-based',
      basePrice: 0,
    }
  );

  const [projection, setProjection] = useState<any>(null);
  const [fundingRequirements, setFundingRequirements] = useState<any>(null);
  const [optimizations, setOptimizations] = useState<any[]>([]);

  // Calculate projections when data changes
  useEffect(() => {
    if (businessModel && cashFlowData) {
      const proj = calculateFinancialProjection(businessModel, cashFlowData);
      setProjection(proj);

      const funding = calculateFundingRequirements(proj);
      setFundingRequirements(funding);

      const opts = optimizeFinancialModel(businessModel, proj);
      setOptimizations(opts);
    }
  }, [businessModel, cashFlowData]);

  const handleSave = () => {
    const data = {
      businessModel,
      cashFlowData,
      pricingStrategy,
      projection,
      fundingRequirements,
      optimizations,
      completedAt: new Date().toISOString(),
    };
    onSave?.(data);
  };

  const handleBusinessModelChange = (template: keyof typeof businessModelTemplates) => {
    setBusinessModel(businessModelTemplates[template]);
  };

  const updateRevenueProjection = (month: number, value: number) => {
    const newRevenue = [...cashFlowData.revenue];
    newRevenue[month] = value;
    setCashFlowData({ ...cashFlowData, revenue: newRevenue });
  };

  const updateExpenseProjection = (month: number, value: number) => {
    const newExpenses = [...cashFlowData.expenses];
    newExpenses[month] = value;
    setCashFlowData({ ...cashFlowData, expenses: newExpenses });
  };

  const generateRevenueProjection = () => {
    const baseRevenue = 1000;
    const growthRate = 0.15; // 15% monthly growth
    const newRevenue = Array.from({ length: cashFlowData.periods }, (_, i) =>
      Math.round(baseRevenue * Math.pow(1 + growthRate, i))
    );
    setCashFlowData({ ...cashFlowData, revenue: newRevenue });
  };

  const generateExpenseProjection = () => {
    const fixedCosts = Object.values(businessModel.costStructure.fixedCosts)
      .reduce((sum, cost) => sum + cost, 0);
    const newExpenses = Array(cashFlowData.periods).fill(fixedCosts);
    setCashFlowData({ ...cashFlowData, expenses: newExpenses });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Planning & Business Model</h2>
          <p className="text-muted-foreground">
            Model your revenue, costs, and funding requirements to ensure economic viability
          </p>
        </div>
        <Button onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          Save Progress
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business-model">Business Model</TabsTrigger>
          <TabsTrigger value="revenue-model">Revenue Model</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="business-model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Business Model Selection
              </CardTitle>
              <CardDescription>
                Choose a business model template that best fits your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(businessModelTemplates).map(([key, template]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-colors ${businessModel.type === template.type
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'hover:border-gray-300'
                      }`}
                    onClick={() => handleBusinessModelChange(key as keyof typeof businessModelTemplates)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold capitalize">{key}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {key === 'saas' && 'Subscription-based software service'}
                        {key === 'ecommerce' && 'Online retail and product sales'}
                        {key === 'marketplace' && 'Platform connecting buyers and sellers'}
                      </p>
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {template.revenueStreams[0].type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cost Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fixed Costs (Monthly)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(businessModel.costStructure.fixedCosts).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm">{key}</span>
                          <span className="font-medium">${value.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Variable Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(businessModel.costStructure.variableCosts).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm">{key}</span>
                          <span className="font-medium">
                            {value < 1 ? `${(value * 100).toFixed(1)}%` : `$${value}`}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue-model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Model Configuration
              </CardTitle>
              <CardDescription>
                Define your revenue streams and key metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Revenue Type</Label>
                  <Select
                    value={businessModel.revenueStreams[0]?.type || 'subscription'}
                    onValueChange={(value) => {
                      const newModel = { ...businessModel };
                      newModel.revenueStreams[0] = {
                        ...newModel.revenueStreams[0],
                        type: value as any,
                      };
                      setBusinessModel(newModel);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="one-time">One-time Purchase</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Monthly Recurring Revenue (if applicable)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={businessModel.revenueStreams[0]?.monthlyRecurring || ''}
                    onChange={(e) => {
                      const newModel = { ...businessModel };
                      newModel.revenueStreams[0] = {
                        ...newModel.revenueStreams[0],
                        monthlyRecurring: parseFloat(e.target.value) || 0,
                      };
                      setBusinessModel(newModel);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Conversion Rate (%)</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    step="0.1"
                    value={(businessModel.revenueStreams[0]?.conversionRate || 0) * 100}
                    onChange={(e) => {
                      const newModel = { ...businessModel };
                      newModel.revenueStreams[0] = {
                        ...newModel.revenueStreams[0],
                        conversionRate: parseFloat(e.target.value) / 100 || 0,
                      };
                      setBusinessModel(newModel);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Average Order Value</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={businessModel.revenueStreams[0]?.averageOrderValue || ''}
                    onChange={(e) => {
                      const newModel = { ...businessModel };
                      newModel.revenueStreams[0] = {
                        ...newModel.revenueStreams[0],
                        averageOrderValue: parseFloat(e.target.value) || 0,
                      };
                      setBusinessModel(newModel);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(businessModel.keyMetrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label>{key}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => {
                          const newModel = { ...businessModel };
                          newModel.keyMetrics[key] = parseFloat(e.target.value) || 0;
                          setBusinessModel(newModel);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Cash Flow Projections
              </CardTitle>
              <CardDescription>
                Model your revenue and expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Projection Period</Label>
                  <Select
                    value={cashFlowData.periods.toString()}
                    onValueChange={(value) =>
                      setCashFlowData({ ...cashFlowData, periods: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Starting Cash</Label>
                  <Input
                    type="number"
                    value={cashFlowData.startingCash}
                    onChange={(e) =>
                      setCashFlowData({
                        ...cashFlowData,
                        startingCash: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateRevenueProjection}
                    >
                      Generate Revenue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateExpenseProjection}
                    >
                      Generate Expenses
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Monthly Projections</h3>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2">
                    <div>Month</div>
                    <div>Revenue</div>
                    <div>Expenses</div>
                    <div>Net</div>
                  </div>
                  {Array.from({ length: Math.min(cashFlowData.periods, 12) }, (_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                      <div className="text-sm py-2">{i + 1}</div>
                      <Input
                        type="number"
                        size={10}
                        value={cashFlowData.revenue[i] || 0}
                        onChange={(e) => updateRevenueProjection(i, parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        size={10}
                        value={cashFlowData.expenses[i] || 0}
                        onChange={(e) => updateExpenseProjection(i, parseFloat(e.target.value) || 0)}
                      />
                      <div className="text-sm py-2 font-medium">
                        ${((cashFlowData.revenue[i] || 0) - (cashFlowData.expenses[i] || 0)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Strategy
              </CardTitle>
              <CardDescription>
                Determine optimal pricing using different methodologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Pricing Methodology</Label>
                <Select
                  value={pricingStrategy.methodology}
                  onValueChange={(value) =>
                    setPricingStrategy({
                      ...pricingStrategy,
                      methodology: value as any
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost-plus">Cost-Plus Pricing</SelectItem>
                    <SelectItem value="value-based">Value-Based Pricing</SelectItem>
                    <SelectItem value="competitive">Competitive Pricing</SelectItem>
                    <SelectItem value="penetration">Penetration Pricing</SelectItem>
                    <SelectItem value="skimming">Price Skimming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pricingStrategy.methodology === 'cost-plus' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Cost-Plus Pricing Calculator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cost per Unit</Label>
                      <Input type="number" placeholder="25" id="cost-per-unit" />
                    </div>
                    <div className="space-y-2">
                      <Label>Desired Margin (%)</Label>
                      <Input type="number" placeholder="40" id="desired-margin" />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const cost = parseFloat((document.getElementById('cost-per-unit') as HTMLInputElement)?.value || '0');
                      const margin = parseFloat((document.getElementById('desired-margin') as HTMLInputElement)?.value || '0') / 100;
                      const price = calculateCostPlusPricing(cost, margin);
                      setPricingStrategy({ ...pricingStrategy, basePrice: price });
                    }}
                  >
                    Calculate Price
                  </Button>
                  {pricingStrategy.basePrice > 0 && (
                    <Alert>
                      <AlertDescription>
                        Recommended price: <strong>${pricingStrategy.basePrice.toFixed(2)}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {pricingStrategy.methodology === 'value-based' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Value-Based Pricing Calculator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Value Created</Label>
                      <Input type="number" placeholder="1000" id="customer-value" />
                    </div>
                    <div className="space-y-2">
                      <Label>Value Capture Rate (%)</Label>
                      <Input type="number" placeholder="10" id="value-capture" />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const value = parseFloat((document.getElementById('customer-value') as HTMLInputElement)?.value || '0');
                      const capture = parseFloat((document.getElementById('value-capture') as HTMLInputElement)?.value || '0') / 100;
                      const price = calculateValueBasedPricing(value, capture);
                      setPricingStrategy({ ...pricingStrategy, basePrice: price });
                    }}
                  >
                    Calculate Price
                  </Button>
                  {pricingStrategy.basePrice > 0 && (
                    <Alert>
                      <AlertDescription>
                        Recommended price: <strong>${pricingStrategy.basePrice.toFixed(2)}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {pricingStrategy.methodology === 'competitive' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Competitive Pricing Calculator</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Competitor Prices (comma-separated)</Label>
                      <Input placeholder="29, 39, 49, 59" id="competitor-prices" />
                    </div>
                    <div className="space-y-2">
                      <Label>Strategy</Label>
                      <Select defaultValue="match">
                        <SelectTrigger id="pricing-strategy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium (20% above average)</SelectItem>
                          <SelectItem value="match">Match average</SelectItem>
                          <SelectItem value="undercut">Undercut (10% below average)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const pricesStr = (document.getElementById('competitor-prices') as HTMLInputElement)?.value || '';
                      const prices = pricesStr.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
                      const strategy = (document.getElementById('pricing-strategy') as HTMLSelectElement)?.value as 'premium' | 'match' | 'undercut';
                      if (prices.length > 0) {
                        const price = calculateCompetitivePricing(prices, strategy);
                        setPricingStrategy({ ...pricingStrategy, basePrice: price });
                      }
                    }}
                  >
                    Calculate Price
                  </Button>
                  {pricingStrategy.basePrice > 0 && (
                    <Alert>
                      <AlertDescription>
                        Recommended price: <strong>${pricingStrategy.basePrice.toFixed(2)}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {projection && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Break-even</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {projection.breakEvenMonth ? `Month ${projection.breakEvenMonth}` : 'Not reached'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">ROI</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {projection.roi.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Payback Period</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {projection.paybackPeriod ? `${projection.paybackPeriod} months` : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Peak Funding</span>
                    </div>
                    <div className="text-2xl font-bold">
                      ${Math.abs(Math.min(...projection.cumulativeCashFlow)).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {fundingRequirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Funding Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Total Funding Required</Label>
                        <div className="text-2xl font-bold text-blue-600">
                          ${fundingRequirements.totalRequired.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Label>Runway</Label>
                        <div className="text-2xl font-bold">
                          {fundingRequirements.runway.toFixed(1)} months
                        </div>
                      </div>
                    </div>

                    {fundingRequirements.fundingGap && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Additional ${fundingRequirements.fundingGap.toLocaleString()} needed to reach 18-month runway target
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label>Key Milestones</Label>
                      {fundingRequirements.milestones.map((milestone: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span>{milestone.purpose}</span>
                          <div className="text-right">
                            <div className="font-medium">${milestone.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Month {milestone.month}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {optimizations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                    <CardDescription>
                      Suggestions to improve your financial model
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {optimizations.map((opt, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={opt.impact === 'high' ? 'destructive' : opt.impact === 'medium' ? 'default' : 'secondary'}>
                            {opt.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {opt.effort} effort
                          </Badge>
                        </div>
                        <h4 className="font-semibold capitalize">{opt.type} Optimization</h4>
                        <p className="text-sm">{opt.suggestion}</p>
                        <p className="text-sm text-green-600 font-medium">
                          Expected: {opt.expectedImprovement}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
