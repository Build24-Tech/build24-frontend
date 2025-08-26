'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Edit, HeadphonesIcon, Mail, MessageSquare, Phone, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { SupportChannel } from '../OperationalReadiness';

export interface KnowledgeBaseStructure {
  categories: KnowledgeCategory[];
  articles: KnowledgeArticle[];
  searchEnabled: boolean;
  selfServiceEnabled: boolean;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  articleCount: number;
  priority: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  helpful: number;
  lastUpdated: string;
}

export interface SupportTeamStructure {
  tiers: SupportTier[];
  escalationMatrix: EscalationRule[];
  workingHours: WorkingHours;
  slaTargets: SLATarget[];
}

export interface SupportTier {
  id: string;
  name: string;
  level: number;
  responsibilities: string[];
  skills: string[];
  staffCount: number;
  maxCaseLoad: number;
}

export interface EscalationRule {
  id: string;
  trigger: string;
  fromTier: string;
  toTier: string;
  timeThreshold: string;
  conditions: string[];
}

export interface WorkingHours {
  timezone: string;
  schedule: DaySchedule[];
  holidays: string[];
  coverage: string;
}

export interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  staffing: number;
}

export interface SLATarget {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responseTime: string;
  resolutionTime: string;
  channel: string;
}

interface CustomerSupportPlanningProps {
  data: {
    channels: SupportChannel[];
    knowledgeBase: KnowledgeBaseStructure;
    supportTeam: SupportTeamStructure;
    completionPercentage: number;
  };
  onChange: (data: any) => void;
}

export function CustomerSupportPlanning({ data, onChange }: CustomerSupportPlanningProps) {
  const [activeTab, setActiveTab] = useState('channels');
  const [editingChannel, setEditingChannel] = useState<SupportChannel | null>(null);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);

  const defaultChannel: Omit<SupportChannel, 'id'> = {
    type: 'email',
    name: '',
    availability: '24/7',
    responseTime: '24 hours',
    staffing: 1,
    tools: [],
    status: 'planned'
  };

  const channelTemplates = {
    email: {
      name: 'Email Support',
      availability: 'Business Hours',
      responseTime: '24 hours',
      tools: ['Help Desk Software', 'Email Client', 'CRM'],
      staffing: 2
    },
    chat: {
      name: 'Live Chat',
      availability: 'Business Hours',
      responseTime: '5 minutes',
      tools: ['Chat Software', 'Knowledge Base', 'Screen Sharing'],
      staffing: 3
    },
    phone: {
      name: 'Phone Support',
      availability: 'Business Hours',
      responseTime: 'Immediate',
      tools: ['Phone System', 'Call Recording', 'CRM'],
      staffing: 4
    },
    forum: {
      name: 'Community Forum',
      availability: '24/7',
      responseTime: '48 hours',
      tools: ['Forum Software', 'Moderation Tools', 'Analytics'],
      staffing: 1
    },
    social: {
      name: 'Social Media Support',
      availability: 'Business Hours',
      responseTime: '4 hours',
      tools: ['Social Media Management', 'Monitoring Tools', 'Analytics'],
      staffing: 2
    }
  };

  const addChannel = (channel: Omit<SupportChannel, 'id'>) => {
    const newChannel: SupportChannel = {
      ...channel,
      id: Date.now().toString()
    };

    const updatedData = {
      ...data,
      channels: [...data.channels, newChannel]
    };

    updateCompletionPercentage(updatedData);
  };

  const updateChannel = (channelId: string, updates: Partial<SupportChannel>) => {
    const updatedData = {
      ...data,
      channels: data.channels.map(channel =>
        channel.id === channelId ? { ...channel, ...updates } : channel
      )
    };

    updateCompletionPercentage(updatedData);
  };

  const deleteChannel = (channelId: string) => {
    const updatedData = {
      ...data,
      channels: data.channels.filter(channel => channel.id !== channelId)
    };

    updateCompletionPercentage(updatedData);
  };

  const updateCompletionPercentage = (updatedData: any) => {
    const channelsSetup = updatedData.channels.filter((channel: SupportChannel) =>
      channel.status === 'active' || channel.status === 'setup'
    ).length;
    const totalChannels = updatedData.channels.length;
    const knowledgeBaseSetup = updatedData.knowledgeBase.categories.length > 0 ? 1 : 0;
    const supportTeamSetup = updatedData.supportTeam.tiers.length > 0 ? 1 : 0;

    const totalItems = Math.max(1, totalChannels + 2); // channels + KB + team
    const completedItems = channelsSetup + knowledgeBaseSetup + supportTeamSetup;

    const percentage = Math.round((completedItems / totalItems) * 100);

    onChange({
      ...updatedData,
      completionPercentage: percentage
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'forum': return <Users className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      default: return <HeadphonesIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'setup': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Support Planning</h3>
          <p className="text-sm text-muted-foreground">
            Set up support channels, knowledge base, and team structure
          </p>
        </div>
        <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingChannel(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingChannel ? 'Edit Support Channel' : 'Add Support Channel'}
              </DialogTitle>
            </DialogHeader>
            <ChannelForm
              channel={editingChannel || defaultChannel}
              templates={channelTemplates}
              onSave={(channel) => {
                if (editingChannel) {
                  updateChannel(editingChannel.id, channel);
                } else {
                  addChannel(channel);
                }
                setIsChannelDialogOpen(false);
                setEditingChannel(null);
              }}
              onCancel={() => {
                setIsChannelDialogOpen(false);
                setEditingChannel(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels" className="flex items-center space-x-2">
            <HeadphonesIcon className="h-4 w-4" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Knowledge Base</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Support Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          {data.channels.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No support channels configured yet. Add your first channel to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {data.channels.map(channel => (
                <Card key={channel.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel.type)}
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <Badge className={getStatusColor(channel.status)}>
                          {channel.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingChannel(channel);
                            setIsChannelDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteChannel(channel.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm font-medium">Availability</div>
                        <div className="text-sm text-muted-foreground">{channel.availability}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div className="text-sm text-muted-foreground">{channel.responseTime}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Staffing</div>
                        <div className="text-sm text-muted-foreground">{channel.staffing} agents</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Tools</div>
                        <div className="flex flex-wrap gap-1">
                          {channel.tools.slice(0, 2).map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                          {channel.tools.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{channel.tools.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Structure</CardTitle>
              <CardDescription>
                Organize self-service resources and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.knowledgeBase.categories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.knowledgeBase.articles.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.knowledgeBase.searchEnabled ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">Search Enabled</div>
                  </div>
                </div>

                <div className="text-center text-muted-foreground py-4">
                  Knowledge base configuration interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Support Team Structure</CardTitle>
              <CardDescription>
                Define support tiers, escalation rules, and SLA targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.supportTeam.tiers.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Support Tiers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.supportTeam.escalationMatrix.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Escalation Rules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.supportTeam.slaTargets.length}
                    </div>
                    <div className="text-sm text-muted-foreground">SLA Targets</div>
                  </div>
                </div>

                <div className="text-center text-muted-foreground py-4">
                  Support team configuration interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ChannelFormProps {
  channel: Omit<SupportChannel, 'id'> | SupportChannel;
  templates: any;
  onSave: (channel: Omit<SupportChannel, 'id'>) => void;
  onCancel: () => void;
}

function ChannelForm({ channel, templates, onSave, onCancel }: ChannelFormProps) {
  const [formData, setFormData] = useState(channel);
  const [newTool, setNewTool] = useState('');

  const applyTemplate = (type: string) => {
    const template = templates[type];
    if (template) {
      setFormData({
        ...formData,
        ...template,
        type: type as any
      });
    }
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Channel Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => {
              setFormData({ ...formData, type: value });
              applyTemplate(value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="chat">Live Chat</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="forum">Forum</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Channel Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Email Support"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Input
            id="availability"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            placeholder="e.g., Business Hours"
          />
        </div>
        <div>
          <Label htmlFor="responseTime">Response Time</Label>
          <Input
            id="responseTime"
            value={formData.responseTime}
            onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
            placeholder="e.g., 24 hours"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="staffing">Staffing (number of agents)</Label>
          <Input
            id="staffing"
            type="number"
            value={formData.staffing}
            onChange={(e) => setFormData({ ...formData, staffing: parseInt(e.target.value) || 1 })}
            min="1"
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
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="setup">In Setup</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tools & Software</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add a tool or software"
              onKeyPress={(e) => e.key === 'Enter' && addTool()}
            />
            <Button type="button" onClick={addTool}>Add</Button>
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

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>Save Channel</Button>
      </div>
    </div>
  );
}
