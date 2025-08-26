'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { TeamRole } from '../OperationalReadiness';

export interface OrgStructure {
  departments: Department[];
  reportingLines: ReportingLine[];
}

export interface Department {
  id: string;
  name: string;
  head?: string;
  roles: string[];
}

export interface ReportingLine {
  managerId: string;
  reportIds: string[];
}

export interface HiringPlan {
  phases: HiringPhase[];
  budget: {
    total: number;
    allocated: number;
    currency: string;
  };
  timeline: string;
}

export interface HiringPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  roles: string[];
  priority: 'critical' | 'important' | 'nice-to-have';
}

interface TeamStructurePlanningProps {
  data: {
    roles: TeamRole[];
    orgChart: OrgStructure;
    hiringPlan: HiringPlan;
    completionPercentage: number;
  };
  onChange: (data: any) => void;
}

export function TeamStructurePlanning({ data, onChange }: TeamStructurePlanningProps) {
  const [activeTab, setActiveTab] = useState('roles');
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const defaultRole: Omit<TeamRole, 'id'> = {
    title: '',
    department: '',
    responsibilities: [],
    requiredSkills: [],
    experienceLevel: 'mid',
    priority: 'important',
    status: 'planned'
  };

  const addRole = (role: Omit<TeamRole, 'id'>) => {
    const newRole: TeamRole = {
      ...role,
      id: Date.now().toString()
    };

    const updatedData = {
      ...data,
      roles: [...data.roles, newRole]
    };

    updateCompletionPercentage(updatedData);
  };

  const updateRole = (roleId: string, updates: Partial<TeamRole>) => {
    const updatedData = {
      ...data,
      roles: data.roles.map(role =>
        role.id === roleId ? { ...role, ...updates } : role
      )
    };

    updateCompletionPercentage(updatedData);
  };

  const deleteRole = (roleId: string) => {
    const updatedData = {
      ...data,
      roles: data.roles.filter(role => role.id !== roleId)
    };

    updateCompletionPercentage(updatedData);
  };

  const updateCompletionPercentage = (updatedData: any) => {
    const totalRoles = updatedData.roles.length;
    const filledRoles = updatedData.roles.filter((role: TeamRole) => role.status === 'filled').length;
    const rolesWithDetails = updatedData.roles.filter((role: TeamRole) =>
      role.title && role.department && role.responsibilities.length > 0
    ).length;

    let percentage = 0;
    if (totalRoles > 0) {
      percentage = Math.round(((filledRoles * 0.6) + (rolesWithDetails * 0.4)) / totalRoles * 100);
    }

    onChange({
      ...updatedData,
      completionPercentage: percentage
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(data.roles.map(role => role.department).filter(Boolean))];
    return departments;
  };

  const getRolesByDepartment = (department: string) => {
    return data.roles.filter(role => role.department === department);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'recruiting': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'nice-to-have': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Structure Planning</h3>
          <p className="text-sm text-muted-foreground">
            Define roles, organizational structure, and hiring plans
          </p>
        </div>
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRole(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </DialogTitle>
            </DialogHeader>
            <RoleForm
              role={editingRole || defaultRole}
              onSave={(role) => {
                if (editingRole) {
                  updateRole(editingRole.id, role);
                } else {
                  addRole(role);
                }
                setIsRoleDialogOpen(false);
                setEditingRole(null);
              }}
              onCancel={() => {
                setIsRoleDialogOpen(false);
                setEditingRole(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Roles & Responsibilities</TabsTrigger>
          <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
          <TabsTrigger value="hiring">Hiring Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {getDepartments().length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No roles defined yet. Add your first role to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            getDepartments().map(department => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{department}</span>
                    <Badge variant="outline">
                      {getRolesByDepartment(department).length} roles
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {getRolesByDepartment(department).map(role => (
                      <div key={role.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{role.title}</h4>
                              <Badge className={getStatusColor(role.status)}>
                                {role.status}
                              </Badge>
                              <Badge className={getPriorityColor(role.priority)}>
                                {role.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {role.experienceLevel} level
                            </div>
                            {role.responsibilities.length > 0 && (
                              <div className="mb-2">
                                <div className="text-sm font-medium mb-1">Key Responsibilities:</div>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                  {role.responsibilities.slice(0, 3).map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                  ))}
                                  {role.responsibilities.length > 3 && (
                                    <li>+{role.responsibilities.length - 3} more...</li>
                                  )}
                                </ul>
                              </div>
                            )}
                            {role.salary && (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>
                                  {role.salary.currency} {role.salary.min.toLocaleString()} - {role.salary.max.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRole(role);
                                setIsRoleDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRole(role.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="org-chart">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Chart</CardTitle>
              <CardDescription>
                Visual representation of your team structure and reporting lines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Org chart visualization will be implemented based on defined roles and departments
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Plan</CardTitle>
              <CardDescription>
                Timeline and budget for building your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.roles.filter(role => role.priority === 'critical').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical Roles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.roles.filter(role => role.status === 'filled').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Filled Positions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {data.roles.filter(role => role.status === 'recruiting').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Recruiting</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RoleFormProps {
  role: Omit<TeamRole, 'id'> | TeamRole;
  onSave: (role: Omit<TeamRole, 'id'>) => void;
  onCancel: () => void;
}

function RoleForm({ role, onSave, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState(role);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');

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

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Role Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Senior Frontend Developer"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g., Engineering"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="experience">Experience Level</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value: any) => setFormData({ ...formData, experienceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
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
              <SelectItem value="nice-to-have">Nice to Have</SelectItem>
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
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <div>
        <Label>Required Skills</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a required skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button type="button" onClick={addSkill}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{skill}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeSkill(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Role</Button>
      </div>
    </div>
  );
}
