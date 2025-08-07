'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Template, TemplateVariable } from '@/types/launch-essentials';
import {
  AlertCircle,
  Code,
  Download,
  Eye,
  History,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
  className?: string;
}

interface TemplateVersion {
  id: string;
  version: string;
  createdAt: Date;
  changes: string;
  template: Template;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function TemplateEditor({ template, onSave, onCancel, className }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewContent, setPreviewContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'variables' | 'settings'>('edit');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    // Initialize variable values with defaults
    const initialValues: Record<string, any> = {};
    editedTemplate.variables.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        initialValues[variable.name] = variable.defaultValue;
      } else {
        initialValues[variable.name] = getDefaultValueForType(variable.type);
      }
    });
    setVariableValues(initialValues);
  }, [editedTemplate.variables]);

  useEffect(() => {
    generatePreview();
  }, [editedTemplate.content, variableValues]);

  const getDefaultValueForType = (type: TemplateVariable['type']): any => {
    switch (type) {
      case 'text':
        return '';
      case 'number':
        return 0;
      case 'date':
        return new Date().toISOString().split('T')[0];
      case 'boolean':
        return false;
      case 'select':
        return '';
      default:
        return '';
    }
  };

  const generatePreview = useCallback(() => {
    let content = editedTemplate.content;

    // Replace template variables with actual values
    editedTemplate.variables.forEach(variable => {
      const value = variableValues[variable.name] || '';
      const placeholder = `{{${variable.name}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    setPreviewContent(content);
  }, [editedTemplate.content, variableValues, editedTemplate.variables]);

  const validateTemplate = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!editedTemplate.name.trim()) {
      errors.push({ field: 'name', message: 'Template name is required' });
    }

    if (!editedTemplate.description.trim()) {
      errors.push({ field: 'description', message: 'Template description is required' });
    }

    if (!editedTemplate.content.trim()) {
      errors.push({ field: 'content', message: 'Template content is required' });
    }

    if (!editedTemplate.category.trim()) {
      errors.push({ field: 'category', message: 'Template category is required' });
    }

    // Validate variables
    editedTemplate.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        errors.push({ field: `variable-${index}-name`, message: `Variable ${index + 1} name is required` });
      }

      if (variable.type === 'select' && (!variable.options || variable.options.length === 0)) {
        errors.push({ field: `variable-${index}-options`, message: `Variable ${index + 1} must have options for select type` });
      }
    });

    // Check for undefined variables in content
    const variablePattern = /\{\{(\w+)\}\}/g;
    const contentVariables = [...editedTemplate.content.matchAll(variablePattern)].map(match => match[1]);
    const definedVariables = editedTemplate.variables.map(v => v.name);

    contentVariables.forEach(varName => {
      if (!definedVariables.includes(varName)) {
        errors.push({ field: 'content', message: `Undefined variable: {{${varName}}}` });
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validateTemplate();
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedTemplate = {
        ...editedTemplate,
        updatedAt: new Date()
      };

      // Save version history
      const newVersion: TemplateVersion = {
        id: `v${Date.now()}`,
        version: `1.${versions.length + 1}`,
        createdAt: new Date(),
        changes: 'Template updated',
        template: { ...template }
      };
      setVersions(prev => [newVersion, ...prev]);

      await onSave(updatedTemplate);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateChange = (field: keyof Template, value: any) => {
    setEditedTemplate(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleVariableChange = (index: number, field: keyof TemplateVariable, value: any) => {
    const updatedVariables = [...editedTemplate.variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    handleTemplateChange('variables', updatedVariables);
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: `variable${editedTemplate.variables.length + 1}`,
      type: 'text',
      required: false
    };
    handleTemplateChange('variables', [...editedTemplate.variables, newVariable]);
  };

  const removeVariable = (index: number) => {
    const updatedVariables = editedTemplate.variables.filter((_, i) => i !== index);
    handleTemplateChange('variables', updatedVariables);
  };

  const handleVariableValueChange = (name: string, value: any) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
  };

  const exportTemplate = (format: 'json' | 'markdown') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(editedTemplate, null, 2);
      filename = `${editedTemplate.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      mimeType = 'application/json';
    } else {
      content = previewContent;
      filename = `${editedTemplate.name.replace(/\s+/g, '-').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variableValues[variable.name] || '';

    switch (variable.type) {
      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleVariableValueChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
            rows={3}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleVariableValueChange(variable.name, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${variable.name}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleVariableValueChange(variable.name, e.target.value)}
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleVariableValueChange(variable.name, checked)}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleVariableValueChange(variable.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${variable.name}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableValueChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
          />
        );
    }
  };

  const getErrorsForField = (field: string) => {
    return validationErrors.filter(error => error.field === field);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Editor</h2>
          <p className="text-gray-600 mt-1">
            Customize and preview your template
            {isDirty && <span className="text-yellow-600 ml-2">• Unsaved changes</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            size="sm"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant="outline"
            onClick={() => exportTemplate('json')}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <CardTitle className="text-red-800 text-sm">Validation Errors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="edit">
            <Code className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Plus className="h-4 w-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Use {`{{variableName}}`} syntax to insert variables into your template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedTemplate.content}
                onChange={(e) => handleTemplateChange('content', e.target.value)}
                placeholder="Enter your template content here..."
                rows={20}
                className={`font-mono ${getErrorsForField('content').length > 0 ? 'border-red-300' : ''}`}
              />
              {getErrorsForField('content').map((error, index) => (
                <p key={index} className="text-red-600 text-sm mt-1">{error.message}</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Template Variables</CardTitle>
                  <CardDescription>
                    Define variables that users can customize in this template
                  </CardDescription>
                </div>
                <Button onClick={addVariable} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {editedTemplate.variables.map((variable, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variable {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariable(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`var-name-${index}`}>Name</Label>
                        <Input
                          id={`var-name-${index}`}
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          placeholder="Variable name"
                          className={getErrorsForField(`variable-${index}-name`).length > 0 ? 'border-red-300' : ''}
                        />
                        {getErrorsForField(`variable-${index}-name`).map((error, errorIndex) => (
                          <p key={errorIndex} className="text-red-600 text-sm mt-1">{error.message}</p>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor={`var-type-${index}`}>Type</Label>
                        <Select
                          value={variable.type}
                          onValueChange={(value) => handleVariableChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {variable.type === 'select' && (
                      <div>
                        <Label htmlFor={`var-options-${index}`}>Options (comma-separated)</Label>
                        <Input
                          id={`var-options-${index}`}
                          value={variable.options?.join(', ') || ''}
                          onChange={(e) => handleVariableChange(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="Option 1, Option 2, Option 3"
                          className={getErrorsForField(`variable-${index}-options`).length > 0 ? 'border-red-300' : ''}
                        />
                        {getErrorsForField(`variable-${index}-options`).map((error, errorIndex) => (
                          <p key={errorIndex} className="text-red-600 text-sm mt-1">{error.message}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`var-required-${index}`}
                          checked={variable.required}
                          onCheckedChange={(checked) => handleVariableChange(index, 'required', checked)}
                        />
                        <Label htmlFor={`var-required-${index}`}>Required</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`var-default-${index}`}>Default Value</Label>
                      <Input
                        id={`var-default-${index}`}
                        value={variable.defaultValue || ''}
                        onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                        placeholder="Default value (optional)"
                      />
                    </div>
                  </div>
                ))}

                {editedTemplate.variables.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="mx-auto h-8 w-8 mb-2" />
                    <p>No variables defined yet</p>
                    <p className="text-sm">Add variables to make your template customizable</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variable Values for Preview */}
          {editedTemplate.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Values</CardTitle>
                <CardDescription>
                  Set values for variables to see how they appear in the preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editedTemplate.variables.map((variable) => (
                    <div key={variable.name}>
                      <Label htmlFor={`preview-${variable.name}`}>
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderVariableInput(variable)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Template Preview</CardTitle>
                  <CardDescription>
                    See how your template will look with the current variable values
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTemplate('markdown')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {previewContent || 'No content to preview'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>
                Configure basic template information and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={editedTemplate.name}
                  onChange={(e) => handleTemplateChange('name', e.target.value)}
                  placeholder="Enter template name"
                  className={getErrorsForField('name').length > 0 ? 'border-red-300' : ''}
                />
                {getErrorsForField('name').map((error, index) => (
                  <p key={index} className="text-red-600 text-sm mt-1">{error.message}</p>
                ))}
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={editedTemplate.description}
                  onChange={(e) => handleTemplateChange('description', e.target.value)}
                  placeholder="Describe what this template is for"
                  rows={3}
                  className={getErrorsForField('description').length > 0 ? 'border-red-300' : ''}
                />
                {getErrorsForField('description').map((error, index) => (
                  <p key={index} className="text-red-600 text-sm mt-1">{error.message}</p>
                ))}
              </div>

              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={editedTemplate.category}
                  onValueChange={(value) => handleTemplateChange('category', value)}
                >
                  <SelectTrigger className={getErrorsForField('category').length > 0 ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Strategy">Strategy</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Risk Management">Risk Management</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                {getErrorsForField('category').map((error, index) => (
                  <p key={index} className="text-red-600 text-sm mt-1">{error.message}</p>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Template Statistics</h4>
                  <p className="text-sm text-gray-600">Information about this template</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Variables:</span>
                  <span className="ml-2 font-medium">{editedTemplate.variables.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Content Length:</span>
                  <span className="ml-2 font-medium">{editedTemplate.content.length} chars</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">
                    {editedTemplate.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-2 font-medium">
                    {editedTemplate.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Sidebar */}
      {showVersionHistory && (
        <Card className="fixed right-4 top-4 bottom-4 w-80 z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Version History</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionHistory(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {versions.length === 0 ? (
                <p className="text-gray-500 text-sm">No version history available</p>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{version.version}</Badge>
                      <span className="text-xs text-gray-500">
                        {version.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{version.changes}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
