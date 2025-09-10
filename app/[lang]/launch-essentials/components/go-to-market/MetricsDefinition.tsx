'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Plus, Repeat, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Metric {
  metric: string;
  target: number;
  measurement: string;
}

interface MetricsData {
  acquisition: Metric[];
  activation: Metric[];
  retention: Metric[];
  revenue: Metric[];
}

interface MetricsDefinitionProps {
  data?: MetricsData;
  onDataChange?: (data: MetricsData) => void;
}

const METRIC_TEMPLATES = {
  acquisition: [
    { metric: 'Website Traffic', target: 10000, measurement: 'Monthly unique visitors' },
    { metric: 'Cost Per Acquisition (CPA)', target: 50, measurement: 'USD per new customer' },
    { metric: 'Conversion Rate', target: 2.5, measurement: 'Percentage of visitors who sign up' },
    { metric: 'Lead Generation', target: 500, measurement: 'Qualified leads per month' },
    { metric: 'Social Media Followers', target: 5000, measurement: 'Total followers across platforms' },
    { metric: 'Email Subscribers', target: 2000, measurement: 'Newsletter subscribers' },
    { metric: 'Organic Search Traffic', target: 3000, measurement: 'Monthly organic visitors' },
    { metric: 'Referral Traffic', target: 1000, measurement: 'Monthly referral visitors' },
  ],
  activation: [
    { metric: 'User Onboarding Completion', target: 80, measurement: 'Percentage completing onboarding' },
    { metric: 'Time to First Value', target: 5, measurement: 'Minutes to first meaningful action' },
    { metric: 'Feature Adoption Rate', target: 60, measurement: 'Percentage using core features' },
    { metric: 'Account Setup Completion', target: 90, measurement: 'Percentage completing profile setup' },
    { metric: 'First Purchase Rate', target: 15, measurement: 'Percentage making first purchase' },
    { metric: 'Trial to Paid Conversion', target: 25, measurement: 'Percentage converting from trial' },
    { metric: 'User Engagement Score', target: 7, measurement: 'Average engagement score (1-10)' },
    { metric: 'Support Ticket Volume', target: 5, measurement: 'Tickets per 100 new users' },
  ],
  retention: [
    { metric: 'Monthly Churn Rate', target: 5, measurement: 'Percentage of users churning monthly' },
    { metric: 'Customer Lifetime Value (CLV)', target: 500, measurement: 'USD average customer value' },
    { metric: 'Daily Active Users (DAU)', target: 1000, measurement: 'Users active daily' },
    { metric: 'Monthly Active Users (MAU)', target: 5000, measurement: 'Users active monthly' },
    { metric: 'Session Duration', target: 15, measurement: 'Average minutes per session' },
    { metric: 'Return User Rate', target: 40, measurement: 'Percentage returning within 30 days' },
    { metric: 'Net Promoter Score (NPS)', target: 50, measurement: 'NPS score (-100 to 100)' },
    { metric: 'Customer Satisfaction (CSAT)', target: 4.5, measurement: 'Average rating (1-5 scale)' },
  ],
  revenue: [
    { metric: 'Monthly Recurring Revenue (MRR)', target: 50000, measurement: 'USD monthly recurring revenue' },
    { metric: 'Average Revenue Per User (ARPU)', target: 25, measurement: 'USD per user per month' },
    { metric: 'Customer Acquisition Cost (CAC)', target: 100, measurement: 'USD to acquire one customer' },
    { metric: 'LTV:CAC Ratio', target: 3, measurement: 'Lifetime value to acquisition cost ratio' },
    { metric: 'Revenue Growth Rate', target: 20, measurement: 'Monthly revenue growth percentage' },
    { metric: 'Gross Margin', target: 80, measurement: 'Gross profit margin percentage' },
    { metric: 'Annual Contract Value (ACV)', target: 1200, measurement: 'USD average annual contract' },
    { metric: 'Upsell Revenue', target: 10000, measurement: 'USD monthly upsell revenue' },
  ]
};

const METRIC_CATEGORIES = [
  { key: 'acquisition', label: 'Acquisition', icon: Users, description: 'Metrics for attracting new customers' },
  { key: 'activation', label: 'Activation', icon: TrendingUp, description: 'Metrics for user onboarding and engagement' },
  { key: 'retention', label: 'Retention', icon: Repeat, description: 'Metrics for keeping customers engaged' },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, description: 'Metrics for financial performance' },
];

export function MetricsDefinition({ data, onDataChange }: MetricsDefinitionProps) {
  const [localData, setLocalData] = useState<MetricsData>(data || {
    acquisition: [],
    activation: [],
    retention: [],
    revenue: []
  });

  const updateData = (updates: Partial<MetricsData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const addMetric = (category: keyof MetricsData, metric?: Metric) => {
    const newMetric = metric || { metric: '', target: 0, measurement: '' };
    const newCategoryData = [...localData[category], newMetric];
    updateData({ [category]: newCategoryData });
  };

  const updateMetric = (category: keyof MetricsData, index: number, updates: Partial<Metric>) => {
    const newCategoryData = [...localData[category]];
    newCategoryData[index] = { ...newCategoryData[index], ...updates };
    updateData({ [category]: newCategoryData });
  };

  const removeMetric = (category: keyof MetricsData, index: number) => {
    const newCategoryData = localData[category].filter((_, i) => i !== index);
    updateData({ [category]: newCategoryData });
  };

  const getTotalMetrics = () => {
    return Object.values(localData).reduce((sum, category) => sum + category.length, 0);
  };

  const getCategoryProgress = (category: keyof MetricsData) => {
    const metrics = localData[category];
    if (metrics.length === 0) return 0;
    const completed = metrics.filter(m => m.metric && m.target > 0 && m.measurement).length;
    return (completed / metrics.length) * 100;
  };

  const renderMetricCategory = (categoryKey: keyof MetricsData) => {
    const category = METRIC_CATEGORIES.find(c => c.key === categoryKey)!;
    const Icon = category.icon;
    const metrics = localData[categoryKey];
    const templates = METRIC_TEMPLATES[categoryKey];
    const progress = getCategoryProgress(categoryKey);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <div>
                <CardTitle>{category.label} Metrics</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{metrics.length} metrics</Badge>
              <Select onValueChange={(value) => {
                const template = templates.find(t => t.metric === value);
                if (template) addMetric(categoryKey, template);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add from template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => !metrics.some(m => m.metric === t.metric)).map((template) => (
                    <SelectItem key={template.metric} value={template.metric}>
                      {template.metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => addMetric(categoryKey)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Custom
              </Button>
            </div>
          </div>
          {metrics.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {category.label.toLowerCase()} metrics defined. Add metrics from templates or create custom ones.
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Metric {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMetric(categoryKey, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Metric Name</Label>
                        <Input
                          value={metric.metric}
                          onChange={(e) => updateMetric(categoryKey, index, { metric: e.target.value })}
                          placeholder="e.g., Monthly Active Users"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Target Value</Label>
                        <Input
                          type="number"
                          value={metric.target}
                          onChange={(e) => updateMetric(categoryKey, index, { target: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Measurement Method</Label>
                        <Input
                          value={metric.measurement}
                          onChange={(e) => updateMetric(categoryKey, index, { measurement: e.target.value })}
                          placeholder="How will you measure this?"
                        />
                      </div>
                    </div>

                    {metric.metric && metric.target > 0 && metric.measurement && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-800">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">
                            Target: {metric.target.toLocaleString()} {metric.measurement}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Success Metrics Definition
          </CardTitle>
          <CardDescription>
            Define key metrics across the customer lifecycle: Acquisition, Activation, Retention, and Revenue (AARR)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {METRIC_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = localData[category.key as keyof MetricsData].length;
              const progress = getCategoryProgress(category.key as keyof MetricsData);

              return (
                <Card key={category.key} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% complete
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="acquisition" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {METRIC_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.key} value={category.key} className="flex items-center gap-1">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {METRIC_CATEGORIES.map((category) => (
          <TabsContent key={category.key} value={category.key} className="space-y-4">
            {renderMetricCategory(category.key as keyof MetricsData)}
          </TabsContent>
        ))}
      </Tabs>

      {getTotalMetrics() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metrics Summary</CardTitle>
            <CardDescription>
              Overview of all defined success metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {METRIC_CATEGORIES.map((category) => {
                const metrics = localData[category.key as keyof MetricsData];
                if (metrics.length === 0) return null;

                const Icon = category.icon;
                return (
                  <div key={category.key} className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {category.label} ({metrics.length} metrics)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {metrics.map((metric, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">{metric.metric}</div>
                          <div className="text-muted-foreground">
                            Target: {metric.target.toLocaleString()} - {metric.measurement}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
