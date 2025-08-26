'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Clock, Edit, FileText, Plus, Scale, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { LegalRequirement } from '../OperationalReadiness';

export interface ComplianceItem {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  applicability: 'required' | 'recommended' | 'optional';
  status: 'not_assessed' | 'compliant' | 'non_compliant' | 'in_progress';
  evidence: string[];
  dueDate?: string;
  assignee?: string;
  notes?: string;
}

export interface PolicyDocument {
  id: string;
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'data_processing' | 'security_policy' | 'other';
  title: string;
  description: string;
  status: 'not_started' | 'draft' | 'review' | 'approved' | 'published';
  lastUpdated?: string;
  version: string;
  approver?: string;
  publishDate?: string;
  reviewDate?: string;
}

interface LegalRequirementsChecklistProps {
  data: {
    requirements: LegalRequirement[];
    compliance: ComplianceItem[];
    policies: PolicyDocument[];
    completionPercentage: number;
  };
  onChange: (data: any) => void;
}

export function LegalRequirementsChecklist({ data, onChange }: LegalRequirementsChecklistProps) {
  const [activeTab, setActiveTab] = useState('requirements');
  const [editingRequirement, setEditingRequirement] = useState<LegalRequirement | null>(null);
  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);

  const defaultRequirement: Omit<LegalRequirement, 'id'> = {
    category: 'privacy',
    requirement: '',
    description: '',
    priority: 'important',
    status: 'not_started'
  };

  const legalTemplates = {
    privacy: [
      {
        requirement: 'Privacy Policy Creation',
        description: 'Create comprehensive privacy policy covering data collection, use, and sharing practices',
        priority: 'critical'
      },
      {
        requirement: 'GDPR Compliance Assessment',
        description: 'Assess and implement GDPR requirements for EU users',
        priority: 'critical'
      },
      {
        requirement: 'CCPA Compliance',
        description: 'Implement California Consumer Privacy Act requirements',
        priority: 'important'
      },
      {
        requirement: 'Cookie Consent Management',
        description: 'Implement cookie consent mechanisms and management',
        priority: 'important'
      },
      {
        requirement: 'Data Processing Agreements',
        description: 'Establish DPAs with third-party processors',
        priority: 'important'
      }
    ],
    terms: [
      {
        requirement: 'Terms of Service',
        description: 'Create comprehensive terms of service agreement',
        priority: 'critical'
      },
      {
        requirement: 'User Agreement',
        description: 'Define user rights, responsibilities, and limitations',
        priority: 'critical'
      },
      {
        requirement: 'Acceptable Use Policy',
        description: 'Define acceptable and prohibited uses of the service',
        priority: 'important'
      },
      {
        requirement: 'Refund and Cancellation Policy',
        description: 'Define refund terms and cancellation procedures',
        priority: 'important'
      }
    ],
    compliance: [
      {
        requirement: 'Industry-Specific Compliance',
        description: 'Assess and implement industry-specific regulatory requirements',
        priority: 'critical'
      },
      {
        requirement: 'Accessibility Compliance',
        description: 'Ensure compliance with accessibility standards (WCAG, ADA)',
        priority: 'important'
      },
      {
        requirement: 'Security Standards Compliance',
        description: 'Implement required security standards and certifications',
        priority: 'critical'
      },
      {
        requirement: 'International Compliance',
        description: 'Assess compliance requirements for international markets',
        priority: 'important'
      }
    ],
    licensing: [
      {
        requirement: 'Software Licensing Audit',
        description: 'Audit all third-party software licenses and ensure compliance',
        priority: 'important'
      },
      {
        requirement: 'Open Source License Compliance',
        description: 'Review and comply with open source license requirements',
        priority: 'important'
      },
      {
        requirement: 'Business License Requirements',
        description: 'Obtain necessary business licenses and permits',
        priority: 'critical'
      },
      {
        requirement: 'Professional Licensing',
        description: 'Ensure team members have required professional licenses',
        priority: 'important'
      }
    ]
  };

  const addRequirement = (requirement: Omit<LegalRequirement, 'id'>) => {
    const newRequirement: LegalRequirement = {
      ...requirement,
      id: Date.now().toString()
    };

    const updatedData = {
      ...data,
      requirements: [...data.requirements, newRequirement]
    };

    updateCompletionPercentage(updatedData);
  };

  const updateRequirement = (requirementId: string, updates: Partial<LegalRequirement>) => {
    const updatedData = {
      ...data,
      requirements: data.requirements.map(req =>
        req.id === requirementId ? { ...req, ...updates } : req
      )
    };

    updateCompletionPercentage(updatedData);
  };

  const deleteRequirement = (requirementId: string) => {
    const updatedData = {
      ...data,
      requirements: data.requirements.filter(req => req.id !== requirementId)
    };

    updateCompletionPercentage(updatedData);
  };

  const updateCompletionPercentage = (updatedData: any) => {
    const totalItems = updatedData.requirements.length + updatedData.compliance.length + updatedData.policies.length;
    const completedRequirements = updatedData.requirements.filter((req: LegalRequirement) => req.status === 'completed').length;
    const compliantItems = updatedData.compliance.filter((item: ComplianceItem) => item.status === 'compliant').length;
    const publishedPolicies = updatedData.policies.filter((policy: PolicyDocument) => policy.status === 'published').length;

    const completedItems = completedRequirements + compliantItems + publishedPolicies;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    onChange({
      ...updatedData,
      completionPercentage: percentage
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'compliant':
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
      case 'draft':
      case 'review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'compliant':
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'draft':
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'optional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'privacy': return <Shield className="h-4 w-4" />;
      case 'terms': return <FileText className="h-4 w-4" />;
      case 'compliance': return <Scale className="h-4 w-4" />;
      case 'licensing': return <FileText className="h-4 w-4" />;
      default: return <Scale className="h-4 w-4" />;
    }
  };

  const addTemplateRequirements = (category: string) => {
    const templates = legalTemplates[category as keyof typeof legalTemplates] || [];
    const newRequirements = templates.map(template => ({
      ...template,
      id: Date.now().toString() + Math.random(),
      category: category as any,
      status: 'not_started' as const
    }));

    const updatedData = {
      ...data,
      requirements: [...data.requirements, ...newRequirements]
    };

    updateCompletionPercentage(updatedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Legal Requirements Checklist</h3>
          <p className="text-sm text-muted-foreground">
            Ensure compliance with legal and regulatory requirements
          </p>
        </div>
        <div className="flex space-x-2">
          <Select onValueChange={addTemplateRequirements}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="privacy">Privacy Templates</SelectItem>
              <SelectItem value="terms">Terms Templates</SelectItem>
              <SelectItem value="compliance">Compliance Templates</SelectItem>
              <SelectItem value="licensing">Licensing Templates</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isRequirementDialogOpen} onOpenChange={setIsRequirementDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRequirement(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRequirement ? 'Edit Legal Requirement' : 'Add Legal Requirement'}
                </DialogTitle>
              </DialogHeader>
              <RequirementForm
                requirement={editingRequirement || defaultRequirement}
                onSave={(requirement) => {
                  if (editingRequirement) {
                    updateRequirement(editingRequirement.id, requirement);
                  } else {
                    addRequirement(requirement);
                  }
                  setIsRequirementDialogOpen(false);
                  setEditingRequirement(null);
                }}
                onCancel={() => {
                  setIsRequirementDialogOpen(false);
                  setEditingRequirement(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requirements" className="flex items-center space-x-2">
            <Scale className="h-4 w-4" />
            <span>Requirements</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Policies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          {data.requirements.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No legal requirements defined yet. Add requirements or use templates to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {['privacy', 'terms', 'compliance', 'licensing'].map(category => {
                const categoryRequirements = data.requirements.filter(req => req.category === category);
                if (categoryRequirements.length === 0) return null;

                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">
                          {categoryRequirements.length} requirements
                        </Badge>
                        <Badge variant="outline">
                          {categoryRequirements.filter(req => req.status === 'completed').length} completed
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {categoryRequirements.map(requirement => (
                          <Card key={requirement.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {getStatusIcon(requirement.status)}
                                    <h4 className="font-medium">{requirement.requirement}</h4>
                                    <Badge className={getStatusColor(requirement.status)}>
                                      {requirement.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={getPriorityColor(requirement.priority)}>
                                      {requirement.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {requirement.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    {requirement.dueDate && (
                                      <span>Due: {requirement.dueDate}</span>
                                    )}
                                    {requirement.assignee && (
                                      <span>Assigned: {requirement.assignee}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingRequirement(requirement);
                                      setIsRequirementDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteRequirement(requirement.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Framework</CardTitle>
              <CardDescription>
                Track compliance with various regulatory frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.compliance.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.compliance.filter(item => item.status === 'compliant').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.compliance.filter(item => item.status === 'non_compliant').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Non-Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.compliance.filter(item => item.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </div>

                <div className="text-center text-muted-foreground py-4">
                  Compliance tracking interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policy Documents</CardTitle>
              <CardDescription>
                Manage legal policy documents and their approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.policies.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Policies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.policies.filter(policy => policy.status === 'published').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.policies.filter(policy => policy.status === 'draft' || policy.status === 'review').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {data.policies.filter(policy => policy.status === 'not_started').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Not Started</div>
                  </div>
                </div>

                <div className="text-center text-muted-foreground py-4">
                  Policy document management interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RequirementFormProps {
  requirement: Omit<LegalRequirement, 'id'> | LegalRequirement;
  onSave: (requirement: Omit<LegalRequirement, 'id'>) => void;
  onCancel: () => void;
}

function RequirementForm({ requirement, onSave, onCancel }: RequirementFormProps) {
  const [formData, setFormData] = useState(requirement);

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
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="terms">Terms</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="licensing">Licensing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="requirement">Requirement Title</Label>
        <Input
          id="requirement"
          value={formData.requirement}
          onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
          placeholder="e.g., Privacy Policy Creation"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the requirement..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="assignee">Assignee</Label>
          <Input
            id="assignee"
            value={formData.assignee || ''}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Person responsible"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Requirement</Button>
      </div>
    </div>
  );
}
