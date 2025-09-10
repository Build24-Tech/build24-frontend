'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { KPI, ProductDefinitionData } from '@/types/launch-essentials';
import { HelpCircle, Plus, Target, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface MetricsDefinitionProps {
  data: ProductDefinitionData['metrics'];
  onChange: (data: ProductDefinitionData['metrics']) => void;
}

const KPI_CATEGORIES = [
  { value: 'acquisition', label: 'Acquisition', description: 'How you attract customers' },
  { value: 'activation', label: 'Activation', description: 'First positive experience' },
  { value: 'retention', label: 'Retention', description: 'Customers coming back' },
  { value: 'revenue', label: 'Revenue', description: 'Monetization metrics' },
  { value: 'referral', label: 'Referral', description: 'Word-of-mouth growth' }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const KPI_TEMPLATES = {
  acquisition: [
    { name: 'Website Traffic', unit: 'visitors', description: 'Unique visitors per period' },
    { name: 'Conversion Rate', unit: '%', description: 'Visitors who become customers' },
    { name: 'Cost Per Acquisition', unit: '$', description: 'Cost to acquire one customer' },
    { name: 'Lead Generation', unit: 'leads', description: 'Qualified leads generated' }
  ],
  activation: [
    { name: 'User Onboarding Completion', unit: '%', description: 'Users who complete setup' },
    { name: 'Time to First Value', unit: 'minutes', description: 'Time to achieve first success' },
    { name: 'Feature Adoption Rate', unit: '%', description: 'Users who use core features' },
    { name: 'Account Setup Rate', unit: '%', description: 'Users who complete profile' }
  ],
  retention: [
    { name: 'Monthly Active Users', unit: 'users', description: 'Users active in the last 30 days' },
    { name: 'Churn Rate', unit: '%', description: 'Customers who stop using product' },
    { name: 'Customer Lifetime Value', unit: '$', description: 'Total value from a customer' },
    { name: 'Engagement Score', unit: 'score', description: 'Composite engagement metric' }
  ],
  revenue: [
    { name: 'Monthly Recurring Revenue', unit: '$', description: 'Predictable monthly income' },
    { name: 'Average Revenue Per User', unit: '$', description: 'Revenue divided by users' },
    { name: 'Revenue Growth Rate', unit: '%', description: 'Month-over-month growth' },
    { name: 'Customer Acquisition Cost', unit: '$', description: 'Cost to acquire customers' }
  ],
  referral: [
    { name: 'Net Promoter Score', unit: 'score', description: 'Customer satisfaction metric' },
    { name: 'Referral Rate', unit: '%', description: 'Customers who refer others' },
    { name: 'Viral Coefficient', unit: 'ratio', description: 'New users from referrals' },
    { name: 'Social Shares', unit: 'shares', description: 'Content shared on social media' }
  ]
};

const SUCCESS_CRITERIA_TEMPLATES = [
  'Achieve product-market fit within 6 months',
  'Reach break-even point by month 12',
  'Maintain customer satisfaction score above 4.0/5.0',
  'Achieve 90% uptime and reliability',
  'Build a community of 1000+ active users',
  'Generate positive cash flow within 18 months',
  'Establish partnerships with 3+ key vendors',
  'Launch in 2+ geographic markets'
];

export function MetricsDefinition({ data, onChange }: MetricsDefinitionProps) {
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('acquisition');
  const [newKPI, setNewKPI] = useState<Partial<KPI>>({
    name: '',
    description: '',
    target: 0,
    unit: '',
    frequency: 'monthly',
    category: 'acquisition'
  });
  const [newCriteria, setNewCriteria] = useState('');

  const addKPI = () => {
    if (!newKPI.name || !newKPI.description || !newKPI.unit) return;

    const kpi: KPI = {
      id: Date.now().toString(),
      name: newKPI.name,
      description: newKPI.description,
      target: newKPI.target || 0,
      unit: newKPI.unit,
      frequency: newKPI.frequency as any,
      category: newKPI.category as any
    };

    onChange({
      ...data,
      kpis: [...data.kpis, kpi]
    });

    setNewKPI({
      name: '',
      description: '',
      target: 0,
      unit: '',
      frequency: 'monthly',
      category: 'acquisition'
    });
    setShowKPIForm(false);
  };

  const removeKPI = (id: string) => {
    onChange({
      ...data,
      kpis: data.kpis.filter(k => k.id !== id)
    });
  };

  const addSuccessCriteria = () => {
    if (!newCriteria.trim()) return;

    onChange({
      ...data,
      successCriteria: [...data.successCriteria, newCriteria.trim()]
    });
    setNewCriteria('');
  };

  const removeSuccessCriteria = (index: number) => {
    onChange({
      ...data,
      successCriteria: data.successCriteria.filter((_, i) => i !== index)
    });
  };

  const applyKPITemplate = (template: any) => {
    setNewKPI({
      ...newKPI,
      name: template.name,
      description: template.description,
      unit: template.unit,
      category: selectedCategory as any
    });
  };

  const applyCriteriaTemplate = (template: string) => {
    setNewCriteria(template);
  };

  const getKPIsByCategory = () => {
    const grouped = data.kpis.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    }, {} as Record<string, KPI[]>);

    return grouped;
  };

  return (
    <div className="space-y-6">
      {/* KPI Definition */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Key Performance Indicators (KPIs)</CardTitle>
              <CardDescription>
                Define measurable metrics to track your product's success
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Target className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                size="sm"
                onClick={() => setShowKPIForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Templates */}
          {showTemplates && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                {KPI_CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KPI_TEMPLATES[selectedCategory as keyof typeof KPI_TEMPLATES]?.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm text-gray-900">{template.name}</h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyKPITemplate(template)}
                      >
                        Use
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Unit: {template.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add KPI Form */}
          {showKPIForm && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-base">Add New KPI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kpi-name">KPI Name</Label>
                    <Input
                      id="kpi-name"
                      placeholder="e.g., Monthly Active Users"
                      value={newKPI.name}
                      onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kpi-category">Category</Label>
                    <Select
                      value={newKPI.category}
                      onValueChange={(value) => setNewKPI({ ...newKPI, category: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KPI_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpi-description">Description</Label>
                  <Textarea
                    id="kpi-description"
                    placeholder="Describe what this KPI measures and why it's important..."
                    value={newKPI.description}
                    onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kpi-target">Target Value</Label>
                    <Input
                      id="kpi-target"
                      type="number"
                      placeholder="1000"
                      value={newKPI.target}
                      onChange={(e) => setNewKPI({ ...newKPI, target: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kpi-unit">Unit</Label>
                    <Input
                      id="kpi-unit"
                      placeholder="users, %, $"
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kpi-frequency">Frequency</Label>
                    <Select
                      value={newKPI.frequency}
                      onValueChange={(value) => setNewKPI({ ...newKPI, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowKPIForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addKPI}
                    disabled={!newKPI.name || !newKPI.description || !newKPI.unit}
                  >
                    Add KPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPIs by Category */}
          <div className="space-y-4">
            {Object.entries(getKPIsByCategory()).map(([category, kpis]) => {
              const categoryConfig = KPI_CATEGORIES.find(c => c.value === category);

              return (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {categoryConfig?.label} ({kpis.length})
                  </h4>
                  <div className="space-y-2">
                    {kpis.map((kpi) => (
                      <Card key={kpi.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h5 className="font-medium text-gray-900">{kpi.name}</h5>
                                <span className="text-sm text-gray-500">
                                  Target: {kpi.target} {kpi.unit}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {kpi.frequency}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{kpi.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeKPI(kpi.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {data.kpis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No KPIs defined yet. Click "Add KPI" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Success Criteria</CardTitle>
              <CardDescription>
                Define qualitative and milestone-based success measures
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Examples
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showTemplates && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Success Criteria Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUCCESS_CRITERIA_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyCriteriaTemplate(template)}
                    className="text-left p-2 text-sm border border-gray-200 rounded hover:border-gray-300 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Input
              placeholder="Enter a success criteria..."
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSuccessCriteria()}
            />
            <Button
              onClick={addSuccessCriteria}
              disabled={!newCriteria.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {data.successCriteria.map((criteria, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded p-3"
              >
                <span className="text-sm text-gray-700 flex-1">{criteria}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSuccessCriteria(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {data.successCriteria.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>No success criteria defined yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      {(data.kpis.length > 0 || data.successCriteria.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.kpis.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Key Performance Indicators</h4>
                  <div className="space-y-1">
                    {data.kpis.map((kpi) => (
                      <div key={kpi.id} className="text-sm text-green-700">
                        • {kpi.name}: {kpi.target} {kpi.unit} ({kpi.frequency})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.successCriteria.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Success Criteria</h4>
                  <div className="space-y-1">
                    {data.successCriteria.map((criteria, index) => (
                      <div key={index} className="text-sm text-green-700">
                        • {criteria}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
