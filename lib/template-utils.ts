import { Template, TemplateVariable } from '@/types/launch-essentials';

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateProcessingOptions {
  variableValues: Record<string, any>;
  includeMetadata?: boolean;
  format?: 'markdown' | 'html' | 'plain';
}

export interface TemplateExportOptions {
  format: 'pdf' | 'docx' | 'markdown' | 'json' | 'html';
  includeMetadata: boolean;
  includeVariables: boolean;
  customFilename?: string;
  includeTimestamp?: boolean;
}

export interface TemplateShareOptions {
  shareType: 'public' | 'private' | 'team';
  allowEditing: boolean;
  expiresAt?: Date;
  password?: string;
}

/**
 * Validates a template for completeness and correctness
 */
export function validateTemplate(template: Template): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!template.name?.trim()) {
    errors.push('Template name is required');
  }

  if (!template.description?.trim()) {
    errors.push('Template description is required');
  }

  if (!template.content?.trim()) {
    errors.push('Template content is required');
  }

  if (!template.category?.trim()) {
    errors.push('Template category is required');
  }

  // Variable validation
  const variableNames = new Set<string>();
  template.variables.forEach((variable, index) => {
    if (!variable.name?.trim()) {
      errors.push(`Variable ${index + 1} name is required`);
    } else {
      if (variableNames.has(variable.name)) {
        errors.push(`Duplicate variable name: ${variable.name}`);
      }
      variableNames.add(variable.name);
    }

    if (variable.type === 'select' && (!variable.options || variable.options.length === 0)) {
      errors.push(`Variable "${variable.name}" must have options for select type`);
    }

    // Check for invalid variable names (should be alphanumeric + underscore)
    if (variable.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
      warnings.push(`Variable "${variable.name}" should only contain letters, numbers, and underscores`);
    }
  });

  // Content validation
  if (template.content) {
    // Find all variables used in content
    const variablePattern = /\{\{(\w+)\}\}/g;
    const contentVariables = [...template.content.matchAll(variablePattern)].map(match => match[1]);
    const definedVariables = template.variables.map(v => v.name);

    // Check for undefined variables
    contentVariables.forEach(varName => {
      if (!definedVariables.includes(varName)) {
        errors.push(`Undefined variable in content: {{${varName}}}`);
      }
    });

    // Check for unused variables
    definedVariables.forEach(varName => {
      if (!contentVariables.includes(varName)) {
        warnings.push(`Variable "${varName}" is defined but not used in content`);
      }
    });

    // Check for malformed variable syntax
    const malformedPattern = /\{[^{]|\}[^}]|\{\{[^}]*\}[^}]|\{[^}]*\}\}/g;
    const malformedMatches = template.content.match(malformedPattern);
    if (malformedMatches) {
      warnings.push('Possible malformed variable syntax found in content');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Processes a template by replacing variables with actual values
 */
export function processTemplate(
  template: Template,
  options: TemplateProcessingOptions
): string {
  let content = template.content;
  const { variableValues, includeMetadata = false, format = 'markdown' } = options;

  // Replace template variables with actual values
  template.variables.forEach(variable => {
    const value = variableValues[variable.name] ?? variable.defaultValue ?? '';
    const placeholder = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    content = content.replace(placeholder, String(value));
  });

  // Add metadata if requested
  if (includeMetadata) {
    const metadata = generateMetadata(template, variableValues);
    content = `${metadata}\n\n${content}`;
  }

  // Format content based on requested format
  switch (format) {
    case 'html':
      return convertMarkdownToHtml(content);
    case 'plain':
      return stripMarkdown(content);
    case 'markdown':
    default:
      return content;
  }
}

/**
 * Generates metadata for a template
 */
export function generateMetadata(
  template: Template,
  variableValues: Record<string, any> = {}
): string {
  const metadata = {
    title: template.name,
    description: template.description,
    category: template.category,
    generated: new Date().toISOString(),
    variables: template.variables.map(v => ({
      name: v.name,
      type: v.type,
      required: v.required,
      value: variableValues[v.name] ?? v.defaultValue
    }))
  };

  return `---\n${Object.entries(metadata)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('\n')}\n---`;
}

/**
 * Converts markdown content to HTML
 */
export function convertMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p><h([1-6])>/g, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
}

/**
 * Strips markdown formatting from content
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

/**
 * Exports a template in the specified format
 */
export function exportTemplate(
  template: Template,
  variableValues: Record<string, any>,
  options: TemplateExportOptions
): { content: string; filename: string; mimeType: string } {
  const { format, includeMetadata, includeVariables, customFilename, includeTimestamp } = options;

  let content: string;
  let mimeType: string;
  let fileExtension: string;

  const processedContent = processTemplate(template, {
    variableValues,
    includeMetadata,
    format: format === 'html' ? 'html' : 'markdown'
  });

  switch (format) {
    case 'markdown':
      content = processedContent;
      if (includeVariables && template.variables.length > 0) {
        content += '\n\n## Template Variables\n\n';
        template.variables.forEach(variable => {
          const value = variableValues[variable.name] ?? variable.defaultValue ?? 'Not set';
          content += `- **${variable.name}**: ${value}\n`;
        });
      }
      mimeType = 'text/markdown';
      fileExtension = 'md';
      break;

    case 'json':
      const exportData = {
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          content: template.content,
          variables: template.variables
        },
        generatedContent: processedContent,
        variableValues,
        exportedAt: new Date().toISOString(),
        metadata: includeMetadata ? generateMetadata(template, variableValues) : undefined
      };
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
      break;

    case 'html':
      content = generateHtmlDocument(template, processedContent, includeVariables ? variableValues : undefined);
      mimeType = 'text/html';
      fileExtension = 'html';
      break;

    case 'pdf':
    case 'docx':
      // For PDF and DOCX, we'll export as HTML and let the user handle conversion
      content = generateHtmlDocument(template, processedContent, includeVariables ? variableValues : undefined);
      mimeType = 'text/html';
      fileExtension = 'html';
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  // Generate filename
  const baseFilename = customFilename || template.name.replace(/\s+/g, '-').toLowerCase();
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  const filename = `${baseFilename}${timestamp}.${fileExtension}`;

  return { content, filename, mimeType };
}

/**
 * Generates a complete HTML document
 */
function generateHtmlDocument(
  template: Template,
  content: string,
  variableValues?: Record<string, any>
): string {
  const htmlContent = content.includes('<') ? content : convertMarkdownToHtml(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .metadata { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
            border-left: 4px solid #007bff;
        }
        .metadata h2 { margin-top: 0; color: #007bff; }
        .content { margin-bottom: 30px; }
        .variables { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #28a745;
        }
        .variables h3 { margin-top: 0; color: #28a745; }
        .variable { 
            margin-bottom: 12px; 
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .variable:last-child { border-bottom: none; }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        code { 
            background: #f1f3f4; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            overflow-x: auto;
            border-left: 4px solid #6c757d;
        }
        blockquote {
            border-left: 4px solid #dee2e6;
            margin: 0;
            padding-left: 20px;
            color: #6c757d;
            font-style: italic;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .metadata, .variables { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="metadata">
        <h2>${template.name}</h2>
        <p><strong>Description:</strong> ${template.description}</p>
        <p><strong>Category:</strong> ${template.category}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="content">
        ${htmlContent}
    </div>
    
    ${variableValues && template.variables.length > 0 ? `
    <div class="variables">
        <h3>Template Variables</h3>
        ${template.variables.map(variable => {
    const value = variableValues[variable.name] ?? variable.defaultValue ?? 'Not set';
    return `<div class="variable"><strong>${variable.name}:</strong> ${value}</div>`;
  }).join('')}
    </div>
    ` : ''}
</body>
</html>`;
}

/**
 * Creates a shareable link for a template
 */
export async function createShareLink(
  template: Template,
  options: TemplateShareOptions
): Promise<string> {
  // In a real implementation, this would make an API call to create a shareable link
  const shareData = {
    templateId: template.id,
    shareType: options.shareType,
    allowEditing: options.allowEditing,
    expiresAt: options.expiresAt?.toISOString(),
    password: options.password,
    createdAt: new Date().toISOString()
  };

  // Generate a mock share URL
  const token = btoa(JSON.stringify(shareData)).replace(/[+/=]/g, '');
  return `https://build24.dev/templates/shared/${template.id}?token=${token}`;
}

/**
 * Duplicates a template with a new ID and name
 */
export function duplicateTemplate(template: Template, nameSuffix = ' (Copy)'): Template {
  return {
    ...template,
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.name}${nameSuffix}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Merges template variables with user-provided values
 */
export function mergeVariableValues(
  template: Template,
  userValues: Record<string, any>
): Record<string, any> {
  const merged: Record<string, any> = {};

  template.variables.forEach(variable => {
    if (userValues.hasOwnProperty(variable.name)) {
      merged[variable.name] = userValues[variable.name];
    } else if (variable.defaultValue !== undefined) {
      merged[variable.name] = variable.defaultValue;
    } else {
      merged[variable.name] = getDefaultValueForType(variable.type);
    }
  });

  return merged;
}

/**
 * Gets the default value for a variable type
 */
function getDefaultValueForType(type: TemplateVariable['type']): any {
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
}

/**
 * Searches templates based on query and filters
 */
export function searchTemplates(
  templates: Template[],
  query: string,
  filters: {
    category?: string;
    phase?: string;
  } = {}
): Template[] {
  let filtered = [...templates];

  // Apply text search
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm) ||
      template.content.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (filters.category && filters.category !== 'All') {
    filtered = filtered.filter(template => template.category === filters.category);
  }

  // Apply phase filter (this would be based on template metadata in a real implementation)
  if (filters.phase && filters.phase !== 'all') {
    // For now, we'll use category mapping to phases
    const phaseCategories: Record<string, string[]> = {
      validation: ['Research'],
      definition: ['Strategy'],
      technical: ['Technical'],
      marketing: ['Marketing'],
      operations: ['Operations'],
      financial: ['Financial'],
      risk: ['Risk Management'],
      optimization: ['Analytics', 'Optimization']
    };

    if (phaseCategories[filters.phase]) {
      filtered = filtered.filter(template =>
        phaseCategories[filters.phase].includes(template.category)
      );
    }
  }

  return filtered;
}

/**
 * Calculates template usage statistics
 */
export function calculateTemplateStats(template: Template): {
  variableCount: number;
  contentLength: number;
  requiredVariables: number;
  optionalVariables: number;
  estimatedCompletionTime: number; // in minutes
} {
  const variableCount = template.variables.length;
  const contentLength = template.content.length;
  const requiredVariables = template.variables.filter(v => v.required).length;
  const optionalVariables = variableCount - requiredVariables;

  // Estimate completion time based on content length and variable count
  const baseTime = Math.ceil(contentLength / 500) * 2; // 2 minutes per 500 characters
  const variableTime = variableCount * 1; // 1 minute per variable
  const estimatedCompletionTime = Math.max(5, baseTime + variableTime); // minimum 5 minutes

  return {
    variableCount,
    contentLength,
    requiredVariables,
    optionalVariables,
    estimatedCompletionTime
  };
}
