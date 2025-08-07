'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaunchPhase, Template } from '@/types/launch-essentials';
import {
  Copy,
  Download,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TemplateEditor from './TemplateEditor';
import TemplateExporter from './TemplateExporter';
import TemplateSelector from './TemplateSelector';

interface TemplateManagerProps {
  selectedPhase?: LaunchPhase;
  onTemplateSelect?: (template: Template) => void;
  className?: string;
}

type ViewMode = 'browse' | 'edit' | 'export' | 'create';

interface TemplateManagerState {
  viewMode: ViewMode;
  selectedTemplate: Template | null;
  templates: Template[];
  isLoading: boolean;
  searchQuery: string;
}

export default function TemplateManager({
  selectedPhase,
  onTemplateSelect,
  className
}: TemplateManagerProps) {
  const [state, setState] = useState<TemplateManagerState>({
    viewMode: 'browse',
    selectedTemplate: null,
    templates: [],
    isLoading: false,
    searchQuery: ''
  });

  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadTemplates();
    loadUserTemplates();
    loadRecentTemplates();
  }, []);

  const loadTemplates = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use the mock data from TemplateSelector
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to load templates:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserTemplates = async () => {
    try {
      // Load user's custom templates
      // This would typically fetch from a user-specific API endpoint
      const mockUserTemplates: Template[] = [
        {
          id: 'user-custom-1',
          name: 'My Custom Research Template',
          description: 'Customized market research template for my industry',
          category: 'Research',
          content: `# Custom Market Research\n\n## Industry-Specific Analysis\n{{industryAnalysis}}\n\n## Custom Metrics\n{{customMetrics}}`,
          variables: [
            { name: 'industryAnalysis', type: 'text', required: true },
            { name: 'customMetrics', type: 'text', required: false }
          ],
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25')
        }
      ];
      setUserTemplates(mockUserTemplates);
    } catch (error) {
      console.error('Failed to load user templates:', error);
    }
  };

  const loadRecentTemplates = async () => {
    try {
      // Load recently used templates
      // This would typically come from user activity data
      setRecentTemplates([]);
    } catch (error) {
      console.error('Failed to load recent templates:', error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      viewMode: 'edit'
    }));
  };

  const handleExportTemplate = (template: Template) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      viewMode: 'export'
    }));
  };

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      description: 'A new custom template',
      category: 'Custom',
      content: '# New Template\n\nStart writing your template content here...\n\n{{variable1}}',
      variables: [
        { name: 'variable1', type: 'text', required: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      selectedTemplate: newTemplate,
      viewMode: 'edit'
    }));
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      // In a real implementation, this would save to an API
      if (template.id.startsWith('template-')) {
        // New template
        setUserTemplates(prev => [template, ...prev]);
      } else {
        // Update existing template
        setUserTemplates(prev =>
          prev.map(t => t.id === template.id ? template : t)
        );
      }

      setState(prev => ({ ...prev, viewMode: 'browse' }));
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        setUserTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setState(prev => ({
      ...prev,
      selectedTemplate: duplicatedTemplate,
      viewMode: 'edit'
    }));
  };

  const resetView = () => {
    setState(prev => ({
      ...prev,
      viewMode: 'browse',
      selectedTemplate: null
    }));
  };

  // Render different views based on current mode
  if (state.viewMode === 'edit' && state.selectedTemplate) {
    return (
      <TemplateEditor
        template={state.selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={resetView}
        className={className}
      />
    );
  }

  if (state.viewMode === 'export' && state.selectedTemplate) {
    return (
      <TemplateExporter
        template={state.selectedTemplate}
        onClose={resetView}
        className={className}
      />
    );
  }

  // Main browse view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
          <p className="text-gray-600 mt-1">
            Manage and customize templates for your launch essentials
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Template Library</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            selectedPhase={selectedPhase}
          />
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">My Custom Templates</h3>
              <p className="text-gray-600 text-sm">
                Templates you've created or customized
              </p>
            </div>
            <Button onClick={handleCreateTemplate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          {userTemplates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No custom templates yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first custom template or duplicate an existing one
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated {template.updatedAt.toLocaleDateString()}</span>
                        <span>{template.variables.length} variables</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleTemplateSelect(template)}
                          size="sm"
                          className="flex-1"
                        >
                          Use
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportTemplate(template)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Recently Used</h3>
            <p className="text-gray-600 text-sm">
              Templates you've used recently
            </p>
          </div>

          {recentTemplates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recent templates
                </h3>
                <p className="text-gray-600">
                  Templates you use will appear here for quick access
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last used recently</span>
                        <span>{template.variables.length} variables</span>
                      </div>

                      <Button
                        onClick={() => handleTemplateSelect(template)}
                        size="sm"
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
