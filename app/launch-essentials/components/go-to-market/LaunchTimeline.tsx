'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Milestone {
  name: string;
  date: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

interface Phase {
  name: string;
  duration: number;
  milestones: Milestone[];
}

interface TimelineData {
  phases: Phase[];
  launchDate: string;
  criticalPath: string[];
}

interface LaunchTimelineProps {
  data?: TimelineData;
  onDataChange?: (data: TimelineData) => void;
}

const PHASE_TEMPLATES = [
  {
    name: 'Pre-Launch Preparation',
    duration: 90,
    milestones: [
      { name: 'Product Development Complete', date: '', dependencies: [], status: 'pending' as const },
      { name: 'Beta Testing Complete', date: '', dependencies: ['Product Development Complete'], status: 'pending' as const },
      { name: 'Marketing Materials Ready', date: '', dependencies: [], status: 'pending' as const },
      { name: 'Launch Team Assembled', date: '', dependencies: [], status: 'pending' as const },
    ]
  },
  {
    name: 'Launch Phase',
    duration: 30,
    milestones: [
      { name: 'Product Launch', date: '', dependencies: ['Beta Testing Complete', 'Marketing Materials Ready'], status: 'pending' as const },
      { name: 'Press Release Distribution', date: '', dependencies: ['Product Launch'], status: 'pending' as const },
      { name: 'Marketing Campaign Launch', date: '', dependencies: ['Product Launch'], status: 'pending' as const },
      { name: 'Customer Support Ready', date: '', dependencies: ['Launch Team Assembled'], status: 'pending' as const },
    ]
  },
  {
    name: 'Post-Launch Growth',
    duration: 60,
    milestones: [
      { name: 'First Customer Feedback Analysis', date: '', dependencies: ['Product Launch'], status: 'pending' as const },
      { name: 'Performance Metrics Review', date: '', dependencies: ['Marketing Campaign Launch'], status: 'pending' as const },
      { name: 'Product Iteration Planning', date: '', dependencies: ['First Customer Feedback Analysis'], status: 'pending' as const },
      { name: 'Scale Marketing Efforts', date: '', dependencies: ['Performance Metrics Review'], status: 'pending' as const },
    ]
  }
];

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const STATUS_ICONS = {
  pending: Clock,
  'in-progress': AlertTriangle,
  completed: CheckCircle
};

export function LaunchTimeline({ data, onDataChange }: LaunchTimelineProps) {
  const [localData, setLocalData] = useState<TimelineData>(data || {
    phases: [],
    launchDate: '',
    criticalPath: []
  });

  const updateData = (updates: Partial<TimelineData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const addPhaseFromTemplate = (template: typeof PHASE_TEMPLATES[0]) => {
    const newPhase: Phase = {
      ...template,
      milestones: template.milestones.map(m => ({ ...m }))
    };
    updateData({ phases: [...localData.phases, newPhase] });
  };

  const addCustomPhase = () => {
    const newPhase: Phase = {
      name: '',
      duration: 30,
      milestones: []
    };
    updateData({ phases: [...localData.phases, newPhase] });
  };

  const updatePhase = (index: number, updates: Partial<Phase>) => {
    const newPhases = [...localData.phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    updateData({ phases: newPhases });
  };

  const removePhase = (index: number) => {
    const newPhases = localData.phases.filter((_, i) => i !== index);
    updateData({ phases: newPhases });
  };

  const addMilestone = (phaseIndex: number) => {
    const newMilestone: Milestone = {
      name: '',
      date: '',
      dependencies: [],
      status: 'pending'
    };
    const newPhases = [...localData.phases];
    newPhases[phaseIndex].milestones.push(newMilestone);
    updateData({ phases: newPhases });
  };

  const updateMilestone = (phaseIndex: number, milestoneIndex: number, updates: Partial<Milestone>) => {
    const newPhases = [...localData.phases];
    newPhases[phaseIndex].milestones[milestoneIndex] = {
      ...newPhases[phaseIndex].milestones[milestoneIndex],
      ...updates
    };
    updateData({ phases: newPhases });
  };

  const removeMilestone = (phaseIndex: number, milestoneIndex: number) => {
    const newPhases = [...localData.phases];
    newPhases[phaseIndex].milestones = newPhases[phaseIndex].milestones.filter((_, i) => i !== milestoneIndex);
    updateData({ phases: newPhases });
  };

  const getAllMilestones = () => {
    return localData.phases.flatMap(phase => phase.milestones.map(m => m.name)).filter(name => name);
  };

  const addDependency = (phaseIndex: number, milestoneIndex: number, dependency: string) => {
    const milestone = localData.phases[phaseIndex].milestones[milestoneIndex];
    if (!milestone.dependencies.includes(dependency)) {
      updateMilestone(phaseIndex, milestoneIndex, {
        dependencies: [...milestone.dependencies, dependency]
      });
    }
  };

  const removeDependency = (phaseIndex: number, milestoneIndex: number, dependencyIndex: number) => {
    const milestone = localData.phases[phaseIndex].milestones[milestoneIndex];
    const newDependencies = milestone.dependencies.filter((_, i) => i !== dependencyIndex);
    updateMilestone(phaseIndex, milestoneIndex, { dependencies: newDependencies });
  };

  const calculateTotalDuration = () => {
    return localData.phases.reduce((total, phase) => total + phase.duration, 0);
  };

  const calculatePhaseProgress = (phase: Phase) => {
    if (phase.milestones.length === 0) return 0;
    const completed = phase.milestones.filter(m => m.status === 'completed').length;
    return (completed / phase.milestones.length) * 100;
  };

  const calculateOverallProgress = () => {
    if (localData.phases.length === 0) return 0;
    const totalMilestones = localData.phases.reduce((sum, phase) => sum + phase.milestones.length, 0);
    if (totalMilestones === 0) return 0;
    const completedMilestones = localData.phases.reduce(
      (sum, phase) => sum + phase.milestones.filter(m => m.status === 'completed').length,
      0
    );
    return (completedMilestones / totalMilestones) * 100;
  };

  const identifyCriticalPath = () => {
    // Simple critical path identification based on dependencies
    const allMilestones = localData.phases.flatMap(phase => phase.milestones);
    const criticalMilestones = allMilestones.filter(milestone =>
      milestone.dependencies.length > 0 ||
      allMilestones.some(m => m.dependencies.includes(milestone.name))
    );
    return criticalMilestones.map(m => m.name);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Launch Timeline Planning
          </CardTitle>
          <CardDescription>
            Create a detailed timeline with milestones and dependencies for your product launch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Total Duration</span>
              </div>
              <div className="text-2xl font-bold">{calculateTotalDuration()} days</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Overall Progress</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(calculateOverallProgress())}%</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Critical Items</span>
              </div>
              <div className="text-2xl font-bold">{identifyCriticalPath().length}</div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="launch-date">Target Launch Date</Label>
              <Input
                id="launch-date"
                type="date"
                value={localData.launchDate}
                onChange={(e) => updateData({ launchDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Timeline Phases</h3>
            <div className="flex gap-2">
              <Select onValueChange={(value) => {
                const template = PHASE_TEMPLATES.find(t => t.name === value);
                if (template) addPhaseFromTemplate(template);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add from template" />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_TEMPLATES.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addCustomPhase} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Custom Phase
              </Button>
            </div>
          </div>

          {localData.phases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No phases defined. Add a phase from templates or create a custom one.
            </div>
          ) : (
            <div className="space-y-6">
              {localData.phases.map((phase, phaseIndex) => {
                const phaseProgress = calculatePhaseProgress(phase);

                return (
                  <Card key={phaseIndex} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Input
                              value={phase.name}
                              onChange={(e) => updatePhase(phaseIndex, { name: e.target.value })}
                              placeholder="Phase name"
                              className="text-lg font-semibold border-none p-0 h-auto"
                            />
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Duration: {phase.duration} days</span>
                            <span>Progress: {Math.round(phaseProgress)}%</span>
                            <span>Milestones: {phase.milestones.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={phase.duration}
                            onChange={(e) => updatePhase(phaseIndex, { duration: parseInt(e.target.value) || 0 })}
                            className="w-20"
                            placeholder="Days"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePhase(phaseIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={phaseProgress} className="w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Milestones</h4>
                        <Button
                          size="sm"
                          onClick={() => addMilestone(phaseIndex)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Milestone
                        </Button>
                      </div>

                      {phase.milestones.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No milestones defined for this phase.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {phase.milestones.map((milestone, milestoneIndex) => {
                            const StatusIcon = STATUS_ICONS[milestone.status];
                            const availableDependencies = getAllMilestones().filter(
                              name => name !== milestone.name && !milestone.dependencies.includes(name)
                            );

                            return (
                              <Card key={milestoneIndex} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      <StatusIcon className="w-4 h-4" />
                                      <Input
                                        value={milestone.name}
                                        onChange={(e) => updateMilestone(phaseIndex, milestoneIndex, { name: e.target.value })}
                                        placeholder="Milestone name"
                                        className="flex-1"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={milestone.status}
                                        onValueChange={(value: 'pending' | 'in-progress' | 'completed') =>
                                          updateMilestone(phaseIndex, milestoneIndex, { status: value })
                                        }
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="in-progress">In Progress</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeMilestone(phaseIndex, milestoneIndex)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Target Date</Label>
                                      <Input
                                        type="date"
                                        value={milestone.date}
                                        onChange={(e) => updateMilestone(phaseIndex, milestoneIndex, { date: e.target.value })}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Dependencies</Label>
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {milestone.dependencies.map((dep, depIndex) => (
                                          <Badge key={depIndex} variant="secondary" className="flex items-center gap-1">
                                            {dep}
                                            <button
                                              onClick={() => removeDependency(phaseIndex, milestoneIndex, depIndex)}
                                              className="ml-1 hover:text-red-500"
                                            >
                                              ×
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                      {availableDependencies.length > 0 && (
                                        <Select
                                          onValueChange={(value) => addDependency(phaseIndex, milestoneIndex, value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Add dependency" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableDependencies.map((dep) => (
                                              <SelectItem key={dep} value={dep}>
                                                {dep}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {localData.phases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Critical Path Analysis</CardTitle>
                <CardDescription>
                  Milestones that are critical to your launch timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {identifyCriticalPath().length === 0 ? (
                    <div className="text-muted-foreground">No critical path items identified.</div>
                  ) : (
                    identifyCriticalPath().map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span>{item}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
