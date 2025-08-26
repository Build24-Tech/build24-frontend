'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Template } from '@/types/launch-essentials';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  File,
  FileText,
  Share2
} from 'lucide-react';
import { useState } from 'react';

interface TemplateExporterProps {
  template: Template;
  variableValues?: Record<string, any>;
  onClose: () => void;
  className?: string;
}

interface ExportOptions {
  format: 'pdf' | 'docx' | 'markdown' | 'json' | 'html';
  includeMetadata: boolean;
  includeVariables: boolean;
  customFilename: string;
  includeTimestamp: boolean;
}

interface SharingOptions {
  shareType: 'public' | 'private' | 'team';
  allowEditing: boolean;
  expiresAt?: Date;
  password?: string;
}

export default function TemplateExporter({
  template,
  variableValues = {},
  onClose,
  className
}: TemplateExporterProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeMetadata: true,
    includeVariables: true,
    customFilename: template.name.replace(/\s+/g, '-').toLowerCase(),
    includeTimestamp: false
  });

  const [sharingOptions, setSharingOptions] = useState<SharingOptions>({
    shareType: 'private',
    allowEditing: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState(false);

  const generateContent = (): string => {
    let content = template.content;

    // Replace template variables with actual values
    template.variables.forEach(variable => {
      const value = variableValues[variable.name] || variable.defaultValue || '';
      const placeholder = `{{${variable.name}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return content;
  };

  const generateMetadata = (): string => {
    const metadata = {
      templateName: template.name,
      description: template.description,
      category: template.category,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      variables: template.variables.map(v => ({
        name: v.name,
        type: v.type,
        required: v.required,
        value: variableValues[v.name] || v.defaultValue
      }))
    };

    return JSON.stringify(metadata, null, 2);
  };

  const exportAsMarkdown = (): string => {
    let output = '';

    if (exportOptions.includeMetadata) {
      output += `---\n`;
      output += `title: ${template.name}\n`;
      output += `description: ${template.description}\n`;
      output += `category: ${template.category}\n`;
      output += `generated: ${new Date().toISOString()}\n`;
      output += `---\n\n`;
    }

    output += generateContent();

    if (exportOptions.includeVariables && template.variables.length > 0) {
      output += `\n\n## Template Variables\n\n`;
      template.variables.forEach(variable => {
        const value = variableValues[variable.name] || variable.defaultValue || 'Not set';
        output += `- **${variable.name}**: ${value}\n`;
      });
    }

    return output;
  };

  const exportAsJSON = (): string => {
    const exportData = {
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        content: template.content,
        variables: template.variables
      },
      generatedContent: generateContent(),
      variableValues: variableValues,
      exportedAt: new Date().toISOString(),
      metadata: exportOptions.includeMetadata ? generateMetadata() : undefined
    };

    return JSON.stringify(exportData, null, 2);
  };

  const exportAsHTML = (): string => {
    const content = generateContent();
    const htmlContent = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .variables { margin-top: 30px; }
        .variable { margin-bottom: 10px; }
    </style>
</head>
<body>
    ${exportOptions.includeMetadata ? `
    <div class="metadata">
        <h2>${template.name}</h2>
        <p><strong>Description:</strong> ${template.description}</p>
        <p><strong>Category:</strong> ${template.category}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    ` : ''}
    
    <div class="content">
        ${htmlContent}
    </div>
    
    ${exportOptions.includeVariables && template.variables.length > 0 ? `
    <div class="variables">
        <h3>Template Variables</h3>
        ${template.variables.map(variable => {
      const value = variableValues[variable.name] || variable.defaultValue || 'Not set';
      return `<div class="variable"><strong>${variable.name}:</strong> ${value}</div>`;
    }).join('')}
    </div>
    ` : ''}
</body>
</html>`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      switch (exportOptions.format) {
        case 'markdown':
          content = exportAsMarkdown();
          mimeType = 'text/markdown';
          fileExtension = 'md';
          break;
        case 'json':
          content = exportAsJSON();
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'html':
          content = exportAsHTML();
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
        case 'pdf':
          // For PDF export, we would typically use a library like jsPDF or Puppeteer
          // For now, we'll export as HTML and suggest printing to PDF
          content = exportAsHTML();
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
        case 'docx':
          // For DOCX export, we would use a library like docx
          // For now, we'll export as HTML
          content = exportAsHTML();
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const timestamp = exportOptions.includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
      const filename = `${exportOptions.customFilename}${timestamp}.${fileExtension}`;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // In a real implementation, this would make an API call to create a shareable link
      const mockShareUrl = `https://build24.dev/templates/shared/${template.id}?token=${Math.random().toString(36).substr(2, 9)}`;
      setShareUrl(mockShareUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(mockShareUrl);
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatOptions = [
    { value: 'markdown', label: 'Markdown (.md)', icon: FileText, description: 'Plain text with formatting' },
    { value: 'json', label: 'JSON (.json)', icon: File, description: 'Structured data format' },
    { value: 'html', label: 'HTML (.html)', icon: FileText, description: 'Web page format' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: FileText, description: 'Portable document format' },
    { value: 'docx', label: 'Word (.docx)', icon: FileText, description: 'Microsoft Word document' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Template</h2>
          <p className="text-gray-600 mt-1">
            Export "{template.name}" in your preferred format
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Options
            </CardTitle>
            <CardDescription>
              Configure how you want to export your template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Selection */}
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Filename */}
            <div>
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={exportOptions.customFilename}
                onChange={(e) => setExportOptions(prev => ({ ...prev, customFilename: e.target.value }))}
                placeholder="Enter filename"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))}
                />
                <Label htmlFor="include-metadata">Include metadata</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-variables"
                  checked={exportOptions.includeVariables}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeVariables: !!checked }))}
                />
                <Label htmlFor="include-variables">Include variable values</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-timestamp"
                  checked={exportOptions.includeTimestamp}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTimestamp: !!checked }))}
                />
                <Label htmlFor="include-timestamp">Add timestamp to filename</Label>
              </div>
            </div>

            <Separator />

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Template
                </>
              )}
            </Button>

            {exportSuccess && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Template exported successfully!
              </div>
            )}

            {(exportOptions.format === 'pdf' || exportOptions.format === 'docx') && (
              <div className="flex items-center text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {exportOptions.format === 'pdf'
                  ? 'PDF export will open as HTML. Use your browser\'s print function to save as PDF.'
                  : 'DOCX export will open as HTML. Copy content to Word for proper formatting.'
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sharing Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Share Template
            </CardTitle>
            <CardDescription>
              Create a shareable link for collaboration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Share Type */}
            <div>
              <Label htmlFor="share-type">Sharing Level</Label>
              <Select
                value={sharingOptions.shareType}
                onValueChange={(value) => setSharingOptions(prev => ({ ...prev, shareType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private - Only you</SelectItem>
                  <SelectItem value="team">Team - Team members only</SelectItem>
                  <SelectItem value="public">Public - Anyone with link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-editing"
                  checked={sharingOptions.allowEditing}
                  onCheckedChange={(checked) => setSharingOptions(prev => ({ ...prev, allowEditing: !!checked }))}
                />
                <Label htmlFor="allow-editing">Allow editing</Label>
              </div>
            </div>

            {/* Expiration */}
            <div>
              <Label htmlFor="expires-at">Link Expires (Optional)</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                onChange={(e) => setSharingOptions(prev => ({
                  ...prev,
                  expiresAt: e.target.value ? new Date(e.target.value) : undefined
                }))}
              />
            </div>

            {/* Password Protection */}
            {sharingOptions.shareType === 'public' && (
              <div>
                <Label htmlFor="password">Password Protection (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  onChange={(e) => setSharingOptions(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            )}

            <Separator />

            {/* Share Button */}
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full"
              variant="outline"
            >
              {isSharing ? (
                <>Creating Link...</>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </>
              )}
            </Button>

            {/* Share URL */}
            {shareUrl && (
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Link copied to clipboard! Share this URL with others.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
          <CardDescription>
            Preview of what will be exported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {exportOptions.format === 'json' ? generateContent() : exportAsMarkdown()}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{template.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
            <div>
              <span className="text-gray-600">Variables:</span>
              <p className="font-medium">{template.variables.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Content Length:</span>
              <p className="font-medium">{template.content.length} chars</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
