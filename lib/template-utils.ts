import { Template, ValidationResult } from '@/types/launch-essentials';

export function getTemplatesByCategory(category: string): Template[] {
  const templates: Template[] = [
    {
      id: 'market-research-template',
      name: 'Market Research Template',
      category: 'validation',
      description: 'Template for conducting market research',
      fields: [
        { id: 'market-size', name: 'Market Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
        { id: 'growth-rate', name: 'Growth Rate (%)', type: 'number', required: false },
        { id: 'trends', name: 'Market Trends', type: 'textarea', required: true }
      ]
    },
    {
      id: 'competitor-analysis-template',
      name: 'Competitor Analysis Template',
      category: 'validation',
      description: 'Template for analyzing competitors',
      fields: [
        { id: 'competitor-name', name: 'Competitor Name', type: 'text', required: true },
        { id: 'strengths', name: 'Strengths', type: 'textarea', required: true },
        { id: 'weaknesses', name: 'Weaknesses', type: 'textarea', required: true }
      ]
    }
  ];

  return templates.filter(template => template.category === category);
}

export async function saveTemplate(template: Template): Promise<void> {
  // Mock implementation
  return Promise.resolve();
}

export async function deleteTemplate(templateId: string): Promise<void> {
  // Mock implementation
  return Promise.resolve();
}

export async function exportTemplate(templateId: string, format: 'json' | 'csv'): Promise<string> {
  // Mock implementation
  return Promise.resolve('exported-data');
}

export function validateTemplateData(data: Record<string, any>): ValidationResult {
  const errors: string[] = [];

  // Basic validation - in real implementation, this would validate against template schema
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      errors.push(`${key} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
