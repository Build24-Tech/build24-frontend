'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Code, Edit, Plus, Rocket, Settings, TestTube, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProcessTemplate } from '../OperationalReadiness';

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  duration: string;
  dependencies: string[];
  assignee: string;
  tools: string[];
  deliverables: string[];
  status: 'not_started' | 'in_progress' | 'completed';
}

interface ProcessSetupTemplatesProps {
  data: {
    development: ProcessTemplate[];
    testing: ProcessTemplate[];
    deployment: ProcessTemplate[];
    completionPercentage: number;
  };
  onChange: (data: any) => void;
}

export function ProcessSetupTemplates({ data, onChange }: ProcessSetupTemplatesProps) {
  const [activeTab, setActiveTab] = useState('development');
  const [editingProcess, setEditingProcess] = useState<ProcessTemplate | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  const defaultProcess: Omit<ProcessTemplate, 'id'> = {
    name: '',
    category: 'development',
    steps: [],
    tools: [],
    responsibilities: [],
    timeline: '',
    status: 'not_started'
  };

  const processTemplates = {
    development: [
      {
        name: 'Feature Development Workflow',
        description: 'Standard process for developing new features',
        steps: [
          'Requirements Analysis',
          'Technical Design',
          'Implementation',
          'Code Review',
          'Integration',
          'Documentation'
        ]
      },
      {
        name: 'Bug Fix Process',
        description: 'Process for handling and fixing bugs',
        steps: [
          'Bug Triage',
          'Root Cause Analysis',
          'Fix Implementation',
          'Testing',
          'Deployment',
          'Verification'
        ]
      },
      {
        name: 'Code Review Process',
        description: 'Standardized code review workflow',
        steps: [
          'Pull Request Creation',
          'Automated Checks',
          'Peer Review',
          'Feedback Integration',
          'Approval',
          'Merge'
        ]
      }
    ],
    testing: [
      {
        name: 'Quality Assurance Process',
        description: 'Comprehensive testing workflow',
        steps: [
          'Test Planning',
          'Test Case Creation',
          'Test Execution',
          'Bug Reporting',
          'Regression Testing',
          'Sign-off'
        ]
      },
      {
        name: 'Automated Testing Pipeline',
        description: 'CI/CD testing automation',
        steps: [
          'Unit Tests',
          'Integration Tests',
          'End-to-End Tests',
          'Performance Tests',
          'Security Tests',
          'Report Generation'
        ]
      },
      {
        name: 'User Acceptance Testing',
        description: 'Process for UAT with stakeholders',
        steps: [
          'UAT Planning',
          'Environment Setup',
          'User Training',
          'Test Execution',
          'Feedback Collection',
          'Approval'
        ]
      }
    ],
    deployment: [
      {
        name: 'Production Deployment',
        description: 'Safe deployment to production',
        steps: [
          'Pre-deployment Checks',
          'Staging Deployment',
          'Smoke Testing',
          'Production Deployment',
          'Health Monitoring',
          'Rollback Plan'
        ]
      },
      {
        name: 'Hotfix Deployment',
        description: 'Emergency deployment process',
        steps: [
          'Issue Assessment',
          'Hotfix Development',
          'Emergency Testing',
          'Deployment',
          'Monitoring',
          'Post-mortem'
        ]
      },
      {
        name: 'Release Management',
        description: 'Coordinated release process',
        steps: [
          'Release Planning',
          'Feature Freeze',
          'Release Candidate',
          'Final Testing',
          'Go-Live',
          'Post-Release Review'
        ]
      }
    ]
  };

  const addProcess = (process: Omit<ProcessTemplate, 'id'>) => {
    const newProcess: ProcessTemplate = {
      ...process,
      id: Date.now().toString()
    };

    const updatedData = {
      ...data,
      [process.category]: [...data[process.category], newProcess]
    };

    updateCompletionPercentage(updatedData);
  };

  const updateProcess = (processId: string, updates: Partial<ProcessTemplate>) => {
    const category = updates.category || editingProcess?.category || 'development';
    const updatedData = {
      ...data,
      [category]: data[category as keyof typeof data].map((process: ProcessTemplate) =>
        process.id === processId ? { ...process, ...updates } : process
      )
    };

    updateCompletionPercentage(updatedData);
  };

  const deleteProcess = (processId: string, category: string) => {
    const updatedData = {
      ...data,
      [category]: data[category as keyof typeof data].filter((process: ProcessTemplate) => process.id !== processId)
    };

    updateCompletionPercentage(updatedData);
  };

  const updateCompletionPercentage = (updatedData: any) => {
    const allProcesses = [
      ...updatedData.development,
      ...updatedData.testing,
      ...updatedData.deployment
    ];

    const totalProcesses = allProcesses.length;
    const completedProcesses = allProcesses.filter((process: ProcessTemplate) =>
      process.status === 'completed'
    ).length;
    const processesWithSteps = allProcesses.filter((process: ProcessTemplate) =>
      process.steps.length > 0 && process.tools.length > 0
    ).length;

    let percentage = 0;
    if (totalProcesses > 0) {
      percentage = Math.round(((completedProcesses * 0.7) + (processesWithSteps * 0.3)) / totalProcesses * 100);
    }

    onChange({
      ...updatedData,
      completionPercentage: percentage
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return <Code className="h-5 w-5" />;
      case 'testing': return <TestTube className="h-5 w-5" />;
      case 'deployment': return <Rocket className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const renderProcessList = (processes: ProcessTemplate[], category: string) => (
    <div className="space-y-4">
      {processes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No {category} processes defined yet. Add a process or use a template to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        processes.map(process => (
          <Card key={process.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(process.status)}
                  <CardTitle className="text-lg">{process.name}</CardTitle>
                  <Badge className={getStatusColor(process.status)}>
                    {process.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProcess(process);
                      setIsProcessDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProcess(process.id, category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {process.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Process Steps ({process.steps.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {process.steps.slice(0, 6).map((step, index) => (
                        <div key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span>{typeof step === 'string' ? step : step.name}</span>
                        </div>
                      ))}
                      {process.steps.length > 6 && (
                        <div className="text-sm text-muted-foreground">
                          +{process.steps.length - 6} more steps...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {process.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tools</h4>
                      <div className="flex flex-wrap gap-1">
                        {process.tools.slice(0, 4).map((tool, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {process.tools.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{process.tools.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {process.timeline && (
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <div className="text-sm text-muted-foreground">{process.timeline}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Process Setup Templates</h3>
          <p className="text-sm text-muted-foreground">
            Define workflows for development, testing, and deployment
          </p>
        </div>
        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProcess(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Process
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProcess ? 'Edit Process' : 'Add New Process'}
              </DialogTitle>
            </DialogHeader>
            <ProcessForm
              process={editingProcess || defaultProcess}
              templates={processTemplates}
              onSave={(process) => {
                if (editingProcess) {
                  updateProcess(editingProcess.id, process);
                } else {
                  addProcess(process);
                }
                setIsProcessDialogOpen(false);
                setEditingProcess(null);
              }}
              onCancel={() => {
                setIsProcessDialogOpen(false);
                setEditingProcess(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="development" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Development</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Testing</span>
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center space-x-2">
            <Rocket className="h-4 w-4" />
            <span>Deployment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="development">
          {renderProcessList(data.development, 'development')}
        </TabsContent>

        <TabsContent value="testing">
          {renderProcessList(data.testing, 'testing')}
        </TabsContent>

        <TabsContent value="deployment">
          {renderProcessList(data.deployment, 'deployment')}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProcessFormProps {
  process: Omit<ProcessTemplate, 'id'> | ProcessTemplate;
  templates: any;
  onSave: (process: Omit<ProcessTemplate, 'id'>) => void;
  onCancel: () => void;
}

function ProcessForm({ process, templates, onSave, onCancel }: ProcessFormProps) {
  const [formData, setFormData] = useState(process);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newStep, setNewStep] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');

  const applyTemplate = (templateName: string) => {
    const template = templates[formData.category]?.find((t: any) => t.name === templateName);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        steps: template.steps.map((step: string, index: number) => ({
          id: `step-${index}`,
          name: step,
          description: '',
          duration: '',
          dependencies: [],
          assignee: '',
          tools: [],
          deliverables: [],
          status: 'not_started'
        }))
      });
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      const step: ProcessStep = {
        id: `step-${Date.now()}`,
        name: newStep.trim(),
        description: '',
        duration: '',
        dependencies: [],
        assignee: '',
        tools: [],
        deliverables: [],
        status: 'not_started'
      };
      setFormData({
        ...formData,
        steps: [...formData.steps, step]
      });
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const addTool = () => {
    if (newTool.trim()) {
      setFormData({
        ...formData,
        tools: [...formData.tools, newTool.trim()]
      });
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_, i) => i !== index)
    });
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Start with Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates[formData.category]?.map((template: any) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              Apply Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Process Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Feature Development Workflow"
          />
        </div>
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
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="deployment">Deployment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeline">Timeline</Label>
          <Input
            id="timeline"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            placeholder="e.g., 2-3 days"
          />
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
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Process Steps */}
      <div>
        <Label>Process Steps</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a process step"
              onKeyPress={(e) => e.key === 'Enter' && addStep()}
            />
            <Button type="button" onClick={addStep}>Add Step</Button>
          </div>
          <div className="space-y-1">
            {formData.steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">
                    {index + 1}
                  </div>
                  <span className="text-sm">{typeof step === 'string' ? step : step.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools */}
      <div>
        <Label>Tools & Technologies</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add a tool or technology"
              onKeyPress={(e) => e.key === 'Enter' && addTool()}
            />
            <Button type="button" onClick={addTool}>Add Tool</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tools.map((tool, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tool}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeTool(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <Label>Responsibilities</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Add a responsibility"
              onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
            />
            <Button type="button" onClick={addResponsibility}>Add</Button>
          </div>
          <div className="space-y-1">
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{resp}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResponsibility(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Process</Button>
      </div>
    </div>
  );
}
