'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, MessageSquare, Plus, RefreshCw, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ContingencyPlan {
  scenario: string;
  trigger: string;
  action: string;
}

interface PostLaunchData {
  feedbackChannels: string[];
  iterationCycle: string;
  successCriteria: string[];
  contingencyPlans: ContingencyPlan[];
}

interface PostLaunchPlanningProps {
  data?: PostLaunchData;
  onDataChange?: (data: PostLaunchData) => void;
}

const FEEDBACK_CHANNELS = [
  { value: 'user-interviews', label: 'User Interviews', description: 'One-on-one conversations with customers' },
  { value: 'surveys', label: 'Customer Surveys', description: 'Structured questionnaires and feedback forms' },
  { value: 'analytics', label: 'Product Analytics', description: 'User behavior tracking and data analysis' },
  { value: 'support-tickets', label: 'Support Tickets', description: 'Customer service interactions and issues' },
  { value: 'social-media', label: 'Social Media Monitoring', description: 'Social platforms and community feedback' },
  { value: 'app-store-reviews', label: 'App Store Reviews', description: 'Reviews and ratings on app stores' },
  { value: 'nps-surveys', label: 'NPS Surveys', description: 'Net Promoter Score feedback collection' },
  { value: 'user-testing', label: 'User Testing Sessions', description: 'Moderated usability testing' },
  { value: 'community-forums', label: 'Community Forums', description: 'User community discussions and feedback' },
  { value: 'beta-feedback', label: 'Beta User Feedback', description: 'Feedback from beta testing programs' },
  { value: 'sales-feedback', label: 'Sales Team Feedback', description: 'Insights from customer-facing teams' },
  { value: 'competitor-analysis', label: 'Competitive Intelligence', description: 'Market and competitor monitoring' },
];

const ITERATION_CYCLES = [
  { value: 'weekly', label: 'Weekly Sprints', description: '1-week iteration cycles' },
  { value: 'bi-weekly', label: 'Bi-weekly Sprints', description: '2-week iteration cycles' },
  { value: 'monthly', label: 'Monthly Releases', description: '4-week iteration cycles' },
  { value: 'quarterly', label: 'Quarterly Updates', description: '12-week major releases' },
  { value: 'continuous', label: 'Continuous Deployment', description: 'Daily/continuous releases' },
  { value: 'milestone-based', label: 'Milestone-Based', description: 'Feature-driven release cycles' },
];

const SUCCESS_CRITERIA_TEMPLATES = [
  'Achieve target user acquisition numbers within first 3 months',
  'Maintain customer satisfaction score above 4.0/5.0',
  'Reach break-even point within 6 months',
  'Achieve product-market fit indicators',
  'Maintain monthly churn rate below 5%',
  'Generate positive customer feedback and testimonials',
  'Meet or exceed revenue projections',
  'Successfully onboard target number of customers',
  'Achieve planned market penetration goals',
  'Establish strong brand recognition in target market',
];

const CONTINGENCY_SCENARIOS = [
  {
    scenario: 'Low User Adoption',
    trigger: 'User acquisition below 50% of target after 30 days',
    action: 'Implement aggressive marketing campaign and user onboarding improvements'
  },
  {
    scenario: 'High Churn Rate',
    trigger: 'Monthly churn rate exceeds 10%',
    action: 'Conduct user interviews and implement retention strategies'
  },
  {
    scenario: 'Technical Issues',
    trigger: 'System downtime exceeds 1% monthly',
    action: 'Scale infrastructure and implement redundancy measures'
  },
  {
    scenario: 'Negative Feedback',
    trigger: 'Customer satisfaction drops below 3.0/5.0',
    action: 'Prioritize critical bug fixes and feature improvements'
  },
  {
    scenario: 'Revenue Shortfall',
    trigger: 'Revenue below 70% of projections for 2 consecutive months',
    action: 'Review pricing strategy and explore new revenue streams'
  },
  {
    scenario: 'Competitive Threat',
    trigger: 'Major competitor launches similar product',
    action: 'Accelerate unique feature development and strengthen positioning'
  },
];

export function PostLaunchPlanning({ data, onDataChange }: PostLaunchPlanningProps) {
  const [localData, setLocalData] = useState<PostLaunchData>(data || {
    feedbackChannels: [],
    iterationCycle: '',
    successCriteria: [],
    contingencyPlans: []
  });

  const updateData = (updates: Partial<PostLaunchData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const toggleFeedbackChannel = (channel: string) => {
    const isSelected = localData.feedbackChannels.includes(channel);
    const newChannels = isSelected
      ? localData.feedbackChannels.filter(c => c !== channel)
      : [...localData.feedbackChannels, channel];

    updateData({ feedbackChannels: newChannels });
  };

  const addSuccessCriteria = (criteria?: string) => {
    const newCriteria = criteria || '';
    updateData({ successCriteria: [...localData.successCriteria, newCriteria] });
  };

  const updateSuccessCriteria = (index: number, value: string) => {
    const newCriteria = [...localData.successCriteria];
    newCriteria[index] = value;
    updateData({ successCriteria: newCriteria });
  };

  const removeSuccessCriteria = (index: number) => {
    const newCriteria = localData.successCriteria.filter((_, i) => i !== index);
    updateData({ successCriteria: newCriteria });
  };

  const addContingencyPlan = (plan?: ContingencyPlan) => {
    const newPlan = plan || { scenario: '', trigger: '', action: '' };
    updateData({ contingencyPlans: [...localData.contingencyPlans, newPlan] });
  };

  const updateContingencyPlan = (index: number, updates: Partial<ContingencyPlan>) => {
    const newPlans = [...localData.contingencyPlans];
    newPlans[index] = { ...newPlans[index], ...updates };
    updateData({ contingencyPlans: newPlans });
  };

  const removeContingencyPlan = (index: number) => {
    const newPlans = localData.contingencyPlans.filter((_, i) => i !== index);
    updateData({ contingencyPlans: newPlans });
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (localData.feedbackChannels.length > 0) score += 25;
    if (localData.iterationCycle) score += 25;
    if (localData.successCriteria.length > 0) score += 25;
    if (localData.contingencyPlans.length > 0) score += 25;
    return score;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Post-Launch Planning & Optimization
          </CardTitle>
          <CardDescription>
            Plan for continuous improvement and optimization after your product launch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Feedback Channels</span>
              </div>
              <div className="text-2xl font-bold">{localData.feedbackChannels.length}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span className="font-medium">Iteration Cycle</span>
              </div>
              <div className="text-sm font-bold">
                {localData.iterationCycle ?
                  ITERATION_CYCLES.find(c => c.value === localData.iterationCycle)?.label || 'Set'
                  : 'Not Set'
                }
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Success Criteria</span>
              </div>
              <div className="text-2xl font-bold">{localData.successCriteria.length}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Contingency Plans</span>
              </div>
              <div className="text-2xl font-bold">{localData.contingencyPlans.length}</div>
            </Card>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Planning Completeness</span>
              <span>{calculateCompleteness()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateCompleteness()}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="iteration" className="flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Iteration</span>
          </TabsTrigger>
          <TabsTrigger value="success" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Success</span>
          </TabsTrigger>
          <TabsTrigger value="contingency" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Contingency</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Customer Feedback Collection
              </CardTitle>
              <CardDescription>
                Select channels for collecting customer feedback and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEEDBACK_CHANNELS.map((channel) => {
                  const isSelected = localData.feedbackChannels.includes(channel.value);

                  return (
                    <Card
                      key={channel.value}
                      className={`p-4 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                      onClick={() => toggleFeedbackChannel(channel.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{channel.label}</h4>
                            {isSelected && <Badge variant="default">Selected</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {localData.feedbackChannels.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Selected Feedback Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {localData.feedbackChannels.map((channelValue) => {
                      const channel = FEEDBACK_CHANNELS.find(c => c.value === channelValue);
                      return (
                        <Badge key={channelValue} variant="secondary">
                          {channel?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iteration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Iteration Cycle Planning
              </CardTitle>
              <CardDescription>
                Define your product iteration and release cycle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Iteration Cycle</Label>
                <Select
                  value={localData.iterationCycle}
                  onValueChange={(value) => updateData({ iterationCycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select iteration cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITERATION_CYCLES.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        <div>
                          <div className="font-medium">{cycle.label}</div>
                          <div className="text-sm text-muted-foreground">{cycle.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {localData.iterationCycle && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <RefreshCw className="w-4 h-4" />
                    <span className="font-medium">
                      Selected: {ITERATION_CYCLES.find(c => c.value === localData.iterationCycle)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {ITERATION_CYCLES.find(c => c.value === localData.iterationCycle)?.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Success Criteria
                </span>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => addSuccessCriteria(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add from template" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUCCESS_CRITERIA_TEMPLATES.filter(t => !localData.successCriteria.includes(t)).map((template) => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addSuccessCriteria()} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Custom
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Define what success looks like for your product launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData.successCriteria.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No success criteria defined. Add criteria from templates or create custom ones.
                </div>
              ) : (
                <div className="space-y-3">
                  {localData.successCriteria.map((criteria, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={criteria}
                          onChange={(e) => updateSuccessCriteria(index, e.target.value)}
                          placeholder="Define success criteria..."
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSuccessCriteria(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contingency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Contingency Plans
                </span>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => {
                    const template = CONTINGENCY_SCENARIOS.find(s => s.scenario === value);
                    if (template) addContingencyPlan(template);
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add from template" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINGENCY_SCENARIOS.filter(s => !localData.contingencyPlans.some(p => p.scenario === s.scenario)).map((scenario) => (
                        <SelectItem key={scenario.scenario} value={scenario.scenario}>
                          {scenario.scenario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addContingencyPlan()} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Custom
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Plan for potential challenges and how to address them
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData.contingencyPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No contingency plans defined. Add plans from templates or create custom ones.
                </div>
              ) : (
                <div className="space-y-4">
                  {localData.contingencyPlans.map((plan, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Scenario {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeContingencyPlan(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Scenario Description</Label>
                          <Input
                            value={plan.scenario}
                            onChange={(e) => updateContingencyPlan(index, { scenario: e.target.value })}
                            placeholder="What could go wrong?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Trigger Condition</Label>
                          <Input
                            value={plan.trigger}
                            onChange={(e) => updateContingencyPlan(index, { trigger: e.target.value })}
                            placeholder="When should this plan be activated?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Action Plan</Label>
                          <Textarea
                            value={plan.action}
                            onChange={(e) => updateContingencyPlan(index, { action: e.target.value })}
                            placeholder="What actions will you take?"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
