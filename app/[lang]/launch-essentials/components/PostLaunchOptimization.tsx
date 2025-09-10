'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  analyzeFeedback,
  calculateOptimizationMetrics,
  FeedbackData,
  generateSprintPlan,
  ImprovementItem,
  OptimizationData,
  prioritizeImprovements
} from '@/lib/post-launch-optimization-utils';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  MessageSquare,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PostLaunchOptimizationProps {
  projectId: string;
  onSave: (data: OptimizationData) => void;
  initialData?: OptimizationData;
}

export default function PostLaunchOptimization({
  projectId,
  onSave,
  initialData
}: PostLaunchOptimizationProps) {
  const [optimizationData, setOptimizationData] = useState<OptimizationData>(
    initialData || {
      analytics: {
        setupComplete: false,
        tools: [],
        kpis: [],
        dashboards: []
      },
      feedback: {
        methods: [],
        responses: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 }
      },
      improvements: [],
      sprints: [],
      successMetrics: {
        kpis: [],
        targets: {},
        achievements: {}
      }
    }
  );

  const [activeTab, setActiveTab] = useState('analytics');
  const [newFeedback, setNewFeedback] = useState('');
  const [newImprovement, setNewImprovement] = useState({
    title: '',
    description: '',
    impact: 'medium' as 'low' | 'medium' | 'high',
    effort: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    onSave(optimizationData);
  }, [optimizationData, onSave]);

  const handleAnalyticsSetup = (tool: string) => {
    setOptimizationData(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        tools: [...prev.analytics.tools, tool],
        setupComplete: prev.analytics.tools.length >= 2
      }
    }));
  };

  const handleAddFeedback = () => {
    if (!newFeedback.trim()) return;

    const feedback: FeedbackData = {
      id: Date.now().toString(),
      content: newFeedback,
      source: 'manual',
      timestamp: new Date(),
      sentiment: analyzeFeedback(newFeedback).sentiment
    };

    setOptimizationData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        responses: [...prev.feedback.responses, feedback],
        sentiment: analyzeFeedback(newFeedback).overallSentiment
      }
    }));

    setNewFeedback('');
  };

  const handleAddImprovement = () => {
    if (!newImprovement.title.trim()) return;

    const improvement: ImprovementItem = {
      id: Date.now().toString(),
      title: newImprovement.title,
      description: newImprovement.description,
      impact: newImprovement.impact,
      effort: newImprovement.effort,
      priority: prioritizeImprovements([newImprovement])[0].priority,
      status: 'backlog',
      createdAt: new Date()
    };

    setOptimizationData(prev => ({
      ...prev,
      improvements: [...prev.improvements, improvement]
    }));

    setNewImprovement({
      title: '',
      description: '',
      impact: 'medium',
      effort: 'medium'
    });
  };

  const generateNewSprint = () => {
    const availableImprovements = optimizationData.improvements.filter(
      item => item.status === 'backlog'
    );

    const sprintPlan = generateSprintPlan(availableImprovements, 2); // 2-week sprint

    setOptimizationData(prev => ({
      ...prev,
      sprints: [...prev.sprints, sprintPlan]
    }));
  };

  const metrics = calculateOptimizationMetrics(optimizationData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post-Launch Optimization</h2>
          <p className="text-muted-foreground">
            Continuously improve your product based on real-world data and user feedback
          </p>
        </div>
        <Badge variant={metrics.overallHealth > 70 ? 'default' : 'secondary'}>
          Health Score: {metrics.overallHealth}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Analytics Tools</p>
                <p className="text-2xl font-bold">{optimizationData.analytics.tools.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Feedback Items</p>
                <p className="text-2xl font-bold">{optimizationData.feedback.responses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Improvements</p>
                <p className="text-2xl font-bold">{optimizationData.improvements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Sprints</p>
                <p className="text-2xl font-bold">
                  {optimizationData.sprints.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics Setup</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Collection</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="sprints">Sprint Planning</TabsTrigger>
          <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics Setup & Interpretation</span>
              </CardTitle>
              <CardDescription>
                Set up analytics tools and learn how to interpret the data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Recommended Analytics Tools</h4>
                  {['Google Analytics', 'Mixpanel', 'Amplitude', 'Hotjar', 'PostHog'].map(tool => (
                    <div key={tool} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{tool}</span>
                      <Button
                        size="sm"
                        variant={optimizationData.analytics.tools.includes(tool) ? 'default' : 'outline'}
                        onClick={() => handleAnalyticsSetup(tool)}
                        disabled={optimizationData.analytics.tools.includes(tool)}
                      >
                        {optimizationData.analytics.tools.includes(tool) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Key Metrics to Track</h4>
                  <div className="space-y-2">
                    {[
                      'Daily/Monthly Active Users',
                      'User Retention Rate',
                      'Feature Adoption Rate',
                      'Customer Satisfaction Score',
                      'Revenue per User'
                    ].map(metric => (
                      <div key={metric} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!optimizationData.analytics.setupComplete && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Add at least 2 analytics tools to complete your setup and get comprehensive insights.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Feedback Collection & Analysis</span>
              </CardTitle>
              <CardDescription>
                Collect and analyze user feedback with sentiment tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {optimizationData.feedback.sentiment.positive}%
                      </div>
                      <div className="text-sm text-muted-foreground">Positive</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {optimizationData.feedback.sentiment.neutral}%
                      </div>
                      <div className="text-sm text-muted-foreground">Neutral</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {optimizationData.feedback.sentiment.negative}%
                      </div>
                      <div className="text-sm text-muted-foreground">Negative</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback">Add New Feedback</Label>
                <div className="flex space-x-2">
                  <Textarea
                    id="feedback"
                    placeholder="Enter user feedback or review..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                  />
                  <Button onClick={handleAddFeedback}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Feedback</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {optimizationData.feedback.responses.slice(-5).map(feedback => (
                    <div key={feedback.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          feedback.sentiment === 'positive' ? 'default' :
                            feedback.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {feedback.sentiment}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {feedback.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Improvement Prioritization</span>
              </CardTitle>
              <CardDescription>
                Prioritize improvements using impact vs effort analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Add New Improvement</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Improvement title"
                      value={newImprovement.title}
                      onChange={(e) => setNewImprovement(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newImprovement.description}
                      onChange={(e) => setNewImprovement(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={newImprovement.impact}
                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                          setNewImprovement(prev => ({ ...prev, impact: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Impact</SelectItem>
                          <SelectItem value="medium">Medium Impact</SelectItem>
                          <SelectItem value="high">High Impact</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={newImprovement.effort}
                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                          setNewImprovement(prev => ({ ...prev, effort: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Effort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Effort</SelectItem>
                          <SelectItem value="medium">Medium Effort</SelectItem>
                          <SelectItem value="high">High Effort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddImprovement} className="w-full">
                      Add Improvement
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Priority Matrix</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                      <div className="font-medium text-green-800">Quick Wins</div>
                      <div className="text-green-600">High Impact, Low Effort</div>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                      <div className="font-medium text-blue-800">Major Projects</div>
                      <div className="text-blue-600">High Impact, High Effort</div>
                    </div>
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                      <div className="font-medium text-yellow-800">Fill-ins</div>
                      <div className="text-yellow-600">Low Impact, Low Effort</div>
                    </div>
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
                      <div className="font-medium text-red-800">Thankless Tasks</div>
                      <div className="text-red-600">Low Impact, High Effort</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Improvement Backlog</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {optimizationData.improvements
                    .sort((a, b) => b.priority - a.priority)
                    .map(improvement => (
                      <div key={improvement.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{improvement.title}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              improvement.priority >= 8 ? 'default' :
                                improvement.priority >= 5 ? 'secondary' : 'outline'
                            }>
                              Priority: {improvement.priority}
                            </Badge>
                            <Badge variant="outline">{improvement.status}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{improvement.description}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="flex items-center space-x-1">
                            <ArrowUp className="h-3 w-3" />
                            <span>Impact: {improvement.impact}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Zap className="h-3 w-3" />
                            <span>Effort: {improvement.effort}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agile Sprint Planning</span>
              </CardTitle>
              <CardDescription>
                Plan and manage improvement sprints using agile methodology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Sprint Management</h4>
                <Button onClick={generateNewSprint}>
                  Create New Sprint
                </Button>
              </div>

              <div className="space-y-4">
                {optimizationData.sprints.map(sprint => (
                  <Card key={sprint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">{sprint.name}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            sprint.status === 'active' ? 'default' :
                              sprint.status === 'completed' ? 'secondary' : 'outline'
                          }>
                            {sprint.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {sprint.duration} weeks
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(sprint.progress)}%</span>
                        </div>
                        <Progress value={sprint.progress} />
                      </div>

                      <div className="mt-3">
                        <h6 className="text-sm font-medium mb-2">Sprint Items ({sprint.items.length})</h6>
                        <div className="space-y-1">
                          {sprint.items.slice(0, 3).map(item => (
                            <div key={item.id} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className={`h-3 w-3 ${item.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                                }`} />
                              <span className={item.status === 'completed' ? 'line-through' : ''}>
                                {item.title}
                              </span>
                            </div>
                          ))}
                          {sprint.items.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{sprint.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {optimizationData.sprints.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sprints created yet. Create your first sprint to start organizing improvements.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Success Measurement Dashboard</span>
              </CardTitle>
              <CardDescription>
                Track KPIs and measure the success of your optimization efforts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Key Performance Indicators</h4>
                  {[
                    { name: 'User Retention Rate', current: 75, target: 80, trend: 'up' },
                    { name: 'Feature Adoption', current: 45, target: 60, trend: 'up' },
                    { name: 'Customer Satisfaction', current: 4.2, target: 4.5, trend: 'stable' },
                    { name: 'Monthly Active Users', current: 1250, target: 1500, trend: 'up' }
                  ].map(kpi => (
                    <div key={kpi.name} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{kpi.name}</span>
                        <div className="flex items-center space-x-1">
                          {kpi.trend === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : kpi.trend === 'down' ? (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{kpi.current}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: {kpi.target}</span>
                          <span>
                            {Math.round((kpi.current / kpi.target) * 100)}% of target
                          </span>
                        </div>
                        <Progress value={(kpi.current / kpi.target) * 100} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Optimization Impact</h4>
                  <div className="space-y-2">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">+12%</div>
                          <div className="text-sm text-muted-foreground">User Engagement</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">-8%</div>
                          <div className="text-sm text-muted-foreground">Churn Rate</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">+25%</div>
                          <div className="text-sm text-muted-foreground">Feature Usage</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Your optimization efforts are showing positive results.
                      Continue focusing on user engagement improvements.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
