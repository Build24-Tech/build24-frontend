'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  HeadphonesIcon,
  Plus,
  Scale,
  Settings,
  Target,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { OperationalGap } from '../OperationalReadiness';

export interface RemediationAction {
  id: string;
  gapId: string;
  action: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  priority: number;
  estimatedEffort: string;
  dependencies: string[];
}

interface OperationalGapAnalysisProps {
  data: {
    identifiedGaps: OperationalGap[];
    prioritizedActions: RemediationAction[];
    overallReadiness: number;
  };
  teamData: any;
  processData: any;
  supportData: any;
  legalData: any;
  onChange: (data: any) => void;
}

export function OperationalGapAnalysis({
  data,
  teamData,
  processData,
  supportData,
  legalData,
  onChange
}: OperationalGapAnalysisProps) {
  const [activeTab, setActiveTab] = useState('gaps');
  const [editingGap, setEditingGap] = useState<OperationalGap | null>(null);
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false);
  const [autoAnalysisResults, setAutoAnalysisResults] = useState<OperationalGap[]>([]);

  useEffect(() => {
    performAutomaticGapAnalysis();
  }, [teamData, processData, supportData, legalData]);

  const performAutomaticGapAnalysis = () => {
    const gaps: OperationalGap[] = [];
    let gapId = 1;

    // Team Structure Gaps
    const criticalRoles = teamData.roles.filter((role: any) => role.priority === 'critical');
    const unfilledCriticalRoles = criticalRoles.filter((role: any) => role.status !== 'filled');

    if (unfilledCriticalRoles.length > 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'team',
        title: 'Critical Roles Unfilled',
        description: `${unfilledCriticalRoles.length} critical roles are not yet filled: ${unfilledCriticalRoles.map((r: any) => r.title).join(', ')}`,
        impact: 'high',
        effort: 'high',
        priority: 1,
        status: 'identified'
      });
    }

    // Process Gaps
    const incompleteProcesses = [
      ...processData.development,
      ...processData.testing,
      ...processData.deployment
    ].filter((process: any) => process.status !== 'completed');

    if (incompleteProcesses.length > 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'process',
        title: 'Incomplete Process Documentation',
        description: `${incompleteProcesses.length} processes are not fully documented or implemented`,
        impact: 'medium',
        effort: 'medium',
        priority: 2,
        status: 'identified'
      });
    }

    // Support Gaps
    const activeSupportChannels = supportData.channels.filter((channel: any) => channel.status === 'active');
    if (activeSupportChannels.length === 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'support',
        title: 'No Active Support Channels',
        description: 'No customer support channels are currently active',
        impact: 'high',
        effort: 'medium',
        priority: 1,
        status: 'identified'
      });
    }

    // Legal Gaps
    const criticalLegalRequirements = legalData.requirements.filter((req: any) => req.priority === 'critical');
    const incompleteCriticalLegal = criticalLegalRequirements.filter((req: any) => req.status !== 'completed');

    if (incompleteCriticalLegal.length > 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'legal',
        title: 'Critical Legal Requirements Incomplete',
        description: `${incompleteCriticalLegal.length} critical legal requirements are not completed`,
        impact: 'high',
        effort: 'medium',
        priority: 1,
        status: 'identified'
      });
    }

    // Infrastructure Gaps (basic assessment)
    if (processData.deployment.length === 0) {
      gaps.push({
        id: `gap-${gapId++}`,
        category: 'infrastructure',
        title: 'No Deployment Process Defined',
        description: 'No deployment processes have been defined, which may indicate infrastructure gaps',
        impact: 'high',
        effort: 'high',
        priority: 2,
        status: 'identified'
      });
    }

    setAutoAnalysisResults(gaps);
  };

  const calculateOverallReadiness = () => {
    const totalGaps = data.identifiedGaps.length;
    const resolvedGaps = data.identifiedGaps.filter(gap => gap.status === 'resolved').length;
    const highImpactGaps = data.identifiedGaps.filter(gap => gap.impact === 'high' && gap.status !== 'resolved').length;

    let readiness = 100;

    if (totalGaps > 0) {
      readiness = Math.max(0, 100 - (highImpactGaps * 20) - ((totalGaps - resolvedGaps - highImpactGaps) * 10));
    }

    return Math.round(readiness);
  };

  const addGap = (gap: Omit<OperationalGap, 'id'>) => {
    const newGap: OperationalGap = {
      ...gap,
      id: Date.now().toString(),
      priority: calculatePriority(gap.impact, gap.effort)
    };

    const updatedData = {
      ...data,
      identifiedGaps: [...data.identifiedGaps, newGap],
      overallReadiness: calculateOverallReadiness()
    };

    onChange(updatedData);
  };

  const updateGap = (gapId: string, updates: Partial<OperationalGap>) => {
    const updatedData = {
      ...data,
      identifiedGaps: data.identifiedGaps.map(gap =>
        gap.id === gapId ? {
          ...gap,
          ...updates,
          priority: updates.impact || updates.effort ?
            calculatePriority(updates.impact || gap.impact, updates.effort || gap.effort) :
            gap.priority
        } : gap
      ),
      overallReadiness: calculateOverallReadiness()
    };

    onChange(updatedData);
  };

  const deleteGap = (gapId: string) => {
    const updatedData = {
      ...data,
      identifiedGaps: data.identifiedGaps.filter(gap => gap.id !== gapId),
      prioritizedActions: data.prioritizedActions.filter(action => action.gapId !== gapId),
      overallReadiness: calculateOverallReadiness()
    };

    onChange(updatedData);
  };

  const calculatePriority = (impact: string, effort: string) => {
    const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    const effortScore = effort === 'high' ? 1 : effort === 'medium' ? 2 : 3;
    return impactScore * effortScore;
  };

  const importAutoAnalysisGaps = () => {
    const existingGapTitles = new Set(data.identifiedGaps.map(gap => gap.title));
    const newGaps = autoAnalysisResults.filter(gap => !existingGapTitles.has(gap.title));

    if (newGaps.length > 0) {
      const updatedData = {
        ...data,
        identifiedGaps: [...data.identifiedGaps, ...newGaps],
        overallReadiness: calculateOverallReadiness()
      };

      onChange(updatedData);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'planned': return <Target className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'team': return <Users className="h-4 w-4" />;
      case 'process': return <Settings className="h-4 w-4" />;
      case 'support': return <HeadphonesIcon className="h-4 w-4" />;
      case 'legal': return <Scale className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const overallReadiness = calculateOverallReadiness();
  const criticalGaps = data.identifiedGaps.filter(gap => gap.impact === 'high' && gap.status !== 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Operational Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Identify and prioritize operational gaps for remediation
          </p>
        </div>
        <Dialog open={isGapDialogOpen} onOpenChange={setIsGapDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGap(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Gap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGap ? 'Edit Operational Gap' : 'Add Operational Gap'}
              </DialogTitle>
            </DialogHeader>
            <GapForm
              gap={editingGap || {
                category: 'team',
                title: '',
                description: '',
                impact: 'medium',
                effort: 'medium',
                priority: 1,
                status: 'identified'
              }}
              onSave={(gap) => {
                if (editingGap) {
                  updateGap(editingGap.id, gap);
                } else {
                  addGap(gap);
                }
                setIsGapDialogOpen(false);
                setEditingGap(null);
              }}
              onCancel={() => {
                setIsGapDialogOpen(false);
                setEditingGap(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Readiness */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Overall Operational Readiness</span>
            </CardTitle>
            <Badge variant={overallReadiness >= 80 ? 'default' : overallReadiness >= 60 ? 'secondary' : 'destructive'}>
              {overallReadiness}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallReadiness} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalGaps.length}</div>
              <div className="text-sm text-muted-foreground">Critical Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.identifiedGaps.length}</div>
              <div className="text-sm text-muted-foreground">Total Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.identifiedGaps.filter(gap => gap.status === 'resolved').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.prioritizedActions.length}</div>
              <div className="text-sm text-muted-foreground">Actions Planned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Gaps Alert */}
      {criticalGaps.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {criticalGaps.length} critical operational gaps that require immediate attention before launch.
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-Analysis Results */}
      {autoAnalysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Automatic Gap Analysis</CardTitle>
              <Button size="sm" onClick={importAutoAnalysisGaps}>
                Import {autoAnalysisResults.filter(gap =>
                  !data.identifiedGaps.some(existing => existing.title === gap.title)
                ).length} New Gaps
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Based on your current configuration, we've identified {autoAnalysisResults.length} potential operational gaps.
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gaps">Identified Gaps</TabsTrigger>
          <TabsTrigger value="actions">Remediation Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          {data.identifiedGaps.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No operational gaps identified yet. Add gaps manually or run automatic analysis.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.identifiedGaps
                .sort((a, b) => b.priority - a.priority)
                .map(gap => (
                  <Card key={gap.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(gap.status)}
                            {getCategoryIcon(gap.category)}
                            <h4 className="font-medium">{gap.title}</h4>
                            <Badge className={getImpactColor(gap.impact)}>
                              {gap.impact} impact
                            </Badge>
                            <Badge className={getEffortColor(gap.effort)}>
                              {gap.effort} effort
                            </Badge>
                            <Badge variant="outline">
                              Priority {gap.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gap.description}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="capitalize">{gap.category}</span>
                            <span>•</span>
                            <span className="capitalize">{gap.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingGap(gap);
                              setIsGapDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteGap(gap.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Remediation Actions</CardTitle>
              <CardDescription>
                Planned actions to address identified operational gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Remediation action planning interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface GapFormProps {
  gap: Omit<OperationalGap, 'id'> | OperationalGap;
  onSave: (gap: Omit<OperationalGap, 'id'>) => void;
  onCancel: () => void;
}

function GapForm({ gap, onSave, onCancel }: GapFormProps) {
  const [formData, setFormData] = useState(gap);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="process">Process</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="identified">Identified</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Gap Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Critical Roles Unfilled"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the operational gap..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="impact">Impact</Label>
          <Select
            value={formData.impact}
            onValueChange={(value: any) => setFormData({ ...formData, impact: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="effort">Effort to Resolve</Label>
          <Select
            value={formData.effort}
            onValueChange={(value: any) => setFormData({ ...formData, effort: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Gap</Button>
      </div>
    </div>
  );
}
