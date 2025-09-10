import {
  calculateTemplateStats,
  convertMarkdownToHtml,
  duplicateTemplate,
  exportTemplate,
  generateMetadata,
  mergeVariableValues,
  processTemplate,
  searchTemplates,
  stripMarkdown,
  validateTemplate
} from '@/lib/template-utils';
import { Template } from '@/types/launch-essentials';

// Mock template data
const mockTemplate: Template = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template for unit testing',
  category: 'Testing',
  content: '# Test Template\n\nThis is a test template with {{variable1}} and {{variable2}}.\n\n## Section\n\n**Bold text** and *italic text*.',
  variables: [
    {
      name: 'variable1',
      type: 'text',
      required: true,
      defaultValue: 'default value 1'
    },
    {
      name: 'variable2',
      type: 'select',
      required: false,
      options: ['Option A', 'Option B', 'Option C'],
      defaultValue: 'Option A'
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

const mockTemplates: Template[] = [
  mockTemplate,
  {
    id: 'template-2',
    name: 'Market Research Template',
    description: 'Template for market research',
    category: 'Research',
    content: '# Market Research\n\nMarket size: {{marketSize}}\nCompetitors: {{competitors}}',
    variables: [
      { name: 'marketSize', type: 'number', required: true },
      { name: 'competitors', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'template-3',
    name: 'Strategy Template',
    description: 'Strategic planning template',
    category: 'Strategy',
    content: '# Strategy\n\nGoals: {{goals}}\nObjectives: {{objectives}}',
    variables: [
      { name: 'goals', type: 'text', required: true },
      { name: 'objectives', type: 'text', required: true }
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22')
  }
];

describe('validateTemplate', () => {
  it('validates a correct template successfully', () => {
    const result = validateTemplate(mockTemplate);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing required fields', () => {
    const invalidTemplate = { ...mockTemplate, name: '', description: '' };
    const result = validateTemplate(invalidTemplate);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Template name is required');
    expect(result.errors).toContain('Template description is required');
  });

  it('detects undefined variables in content', () => {
    const templateWithUndefinedVar = {
      ...mockTemplate,
      content: 'Content with {{undefinedVariable}}'
    };
    const result = validateTemplate(templateWithUndefinedVar);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Undefined variable in content: {{undefinedVariable}}');
  });

  it('detects unused variables', () => {
    const templateWithUnusedVar = {
      ...mockTemplate,
      content: 'Content without variables',
      variables: [{ name: 'unusedVar', type: 'text', required: false }]
    };
    const result = validateTemplate(templateWithUnusedVar);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('Variable "unusedVar" is defined but not used in content');
  });

  it('validates select variables have options', () => {
    const templateWithInvalidSelect = {
      ...mockTemplate,
      variables: [
        { name: 'selectVar', type: 'select', required: false, options: [] }
      ]
    };
    const result = validateTemplate(templateWithInvalidSelect);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Variable "selectVar" must have options for select type');
  });

  it('detects duplicate variable names', () => {
    const templateWithDuplicates = {
      ...mockTemplate,
      variables: [
        { name: 'duplicate', type: 'text', required: false },
        { name: 'duplicate', type: 'text', required: false }
      ]
    };
    const result = validateTemplate(templateWithDuplicates);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate variable name: duplicate');
  });

  it('warns about invalid variable names', () => {
    const templateWithInvalidNames = {
      ...mockTemplate,
      variables: [
        { name: '123invalid', type: 'text', required: false },
        { name: 'invalid-name', type: 'text', required: false }
      ]
    };
    const result = validateTemplate(templateWithInvalidNames);

    expect(result.warnings).toContain('Variable "123invalid" should only contain letters, numbers, and underscores');
    expect(result.warnings).toContain('Variable "invalid-name" should only contain letters, numbers, and underscores');
  });
});

describe('processTemplate', () => {
  const variableValues = {
    variable1: 'Test Value 1',
    variable2: 'Option B'
  };

  it('replaces variables with provided values', () => {
    const result = processTemplate(mockTemplate, { variableValues });

    expect(result).toContain('Test Value 1');
    expect(result).toContain('Option B');
    expect(result).not.toContain('{{variable1}}');
    expect(result).not.toContain('{{variable2}}');
  });

  it('uses default values when no value provided', () => {
    const result = processTemplate(mockTemplate, { variableValues: {} });

    expect(result).toContain('default value 1');
    expect(result).toContain('Option A');
  });

  it('includes metadata when requested', () => {
    const result = processTemplate(mockTemplate, {
      variableValues,
      includeMetadata: true
    });

    expect(result).toContain('---');
    expect(result).toContain('title: Test Template');
    expect(result).toContain('category: Testing');
  });

  it('converts to HTML format when requested', () => {
    const result = processTemplate(mockTemplate, {
      variableValues,
      format: 'html'
    });

    expect(result).toContain('<h1>Test Template</h1>');
    expect(result).toContain('<strong>Bold text</strong>');
    expect(result).toContain('<em>italic text</em>');
  });

  it('strips markdown when plain format requested', () => {
    const result = processTemplate(mockTemplate, {
      variableValues,
      format: 'plain'
    });

    expect(result).not.toContain('#');
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    expect(result).toContain('Test Template');
    expect(result).toContain('Bold text');
  });
});

describe('generateMetadata', () => {
  it('generates correct metadata format', () => {
    const variableValues = { variable1: 'Test Value' };
    const result = generateMetadata(mockTemplate, variableValues);

    expect(result).toContain('---');
    expect(result).toContain('title: Test Template');
    expect(result).toContain('description: A test template for unit testing');
    expect(result).toContain('category: Testing');
    expect(result).toContain('generated:');
  });

  it('includes variable values in metadata', () => {
    const variableValues = { variable1: 'Test Value', variable2: 'Option C' };
    const result = generateMetadata(mockTemplate, variableValues);

    expect(result).toContain('"value":"Test Value"');
    expect(result).toContain('"value":"Option C"');
  });
});

describe('convertMarkdownToHtml', () => {
  it('converts headers correctly', () => {
    const markdown = '# Header 1\n## Header 2\n### Header 3';
    const result = convertMarkdownToHtml(markdown);

    expect(result).toContain('<h1>Header 1</h1>');
    expect(result).toContain('<h2>Header 2</h2>');
    expect(result).toContain('<h3>Header 3</h3>');
  });

  it('converts bold and italic text', () => {
    const markdown = '**bold text** and *italic text*';
    const result = convertMarkdownToHtml(markdown);

    expect(result).toContain('<strong>bold text</strong>');
    expect(result).toContain('<em>italic text</em>');
  });

  it('converts line breaks and paragraphs', () => {
    const markdown = 'Line 1\n\nLine 2\nLine 3';
    const result = convertMarkdownToHtml(markdown);

    expect(result).toContain('<p>');
    expect(result).toContain('</p>');
    expect(result).toContain('<br>');
  });
});

describe('stripMarkdown', () => {
  it('removes markdown formatting', () => {
    const markdown = '# Header\n**bold** and *italic* text';
    const result = stripMarkdown(markdown);

    expect(result).not.toContain('#');
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    expect(result).toContain('Header');
    expect(result).toContain('bold and italic text');
  });

  it('removes links but keeps text', () => {
    const markdown = '[Link text](https://example.com)';
    const result = stripMarkdown(markdown);

    expect(result).toBe('Link text');
  });

  it('removes code formatting', () => {
    const markdown = '`code snippet`';
    const result = stripMarkdown(markdown);

    expect(result).toBe('code snippet');
  });
});

describe('exportTemplate', () => {
  const variableValues = { variable1: 'Test Value', variable2: 'Option B' };
  const exportOptions = {
    format: 'markdown' as const,
    includeMetadata: true,
    includeVariables: true,
    customFilename: 'test-export',
    includeTimestamp: false
  };

  it('exports markdown format correctly', () => {
    const result = exportTemplate(mockTemplate, variableValues, exportOptions);

    expect(result.filename).toBe('test-export.md');
    expect(result.mimeType).toBe('text/markdown');
    expect(result.content).toContain('Test Value');
    expect(result.content).toContain('## Template Variables');
  });

  it('exports JSON format correctly', () => {
    const jsonOptions = { ...exportOptions, format: 'json' as const };
    const result = exportTemplate(mockTemplate, variableValues, jsonOptions);

    expect(result.filename).toBe('test-export.json');
    expect(result.mimeType).toBe('application/json');

    const parsed = JSON.parse(result.content);
    expect(parsed.template.name).toBe('Test Template');
    expect(parsed.variableValues.variable1).toBe('Test Value');
  });

  it('exports HTML format correctly', () => {
    const htmlOptions = { ...exportOptions, format: 'html' as const };
    const result = exportTemplate(mockTemplate, variableValues, htmlOptions);

    expect(result.filename).toBe('test-export.html');
    expect(result.mimeType).toBe('text/html');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<h1>Test Template</h1>');
  });

  it('includes timestamp in filename when requested', () => {
    const timestampOptions = { ...exportOptions, includeTimestamp: true };
    const result = exportTemplate(mockTemplate, variableValues, timestampOptions);

    expect(result.filename).toMatch(/test-export-\d{4}-\d{2}-\d{2}\.md/);
  });

  it('excludes metadata when not requested', () => {
    const noMetadataOptions = { ...exportOptions, includeMetadata: false };
    const result = exportTemplate(mockTemplate, variableValues, noMetadataOptions);

    expect(result.content).not.toContain('---');
    expect(result.content).not.toContain('title:');
  });

  it('excludes variables when not requested', () => {
    const noVariablesOptions = { ...exportOptions, includeVariables: false };
    const result = exportTemplate(mockTemplate, variableValues, noVariablesOptions);

    expect(result.content).not.toContain('## Template Variables');
  });
});

describe('duplicateTemplate', () => {
  it('creates a duplicate with new ID and name', () => {
    const duplicate = duplicateTemplate(mockTemplate);

    expect(duplicate.id).not.toBe(mockTemplate.id);
    expect(duplicate.name).toBe('Test Template (Copy)');
    expect(duplicate.content).toBe(mockTemplate.content);
    expect(duplicate.variables).toEqual(mockTemplate.variables);
  });

  it('allows custom name suffix', () => {
    const duplicate = duplicateTemplate(mockTemplate, ' - Version 2');

    expect(duplicate.name).toBe('Test Template - Version 2');
  });

  it('updates creation and modification dates', () => {
    const duplicate = duplicateTemplate(mockTemplate);

    expect(duplicate.createdAt.getTime()).toBeGreaterThan(mockTemplate.createdAt.getTime());
    expect(duplicate.updatedAt.getTime()).toBeGreaterThan(mockTemplate.updatedAt.getTime());
  });
});

describe('mergeVariableValues', () => {
  it('merges user values with defaults', () => {
    const userValues = { variable1: 'User Value' };
    const result = mergeVariableValues(mockTemplate, userValues);

    expect(result.variable1).toBe('User Value');
    expect(result.variable2).toBe('Option A'); // default value
  });

  it('uses type defaults when no default value provided', () => {
    const templateWithoutDefaults = {
      ...mockTemplate,
      variables: [
        { name: 'textVar', type: 'text' as const, required: false },
        { name: 'numberVar', type: 'number' as const, required: false },
        { name: 'boolVar', type: 'boolean' as const, required: false }
      ]
    };

    const result = mergeVariableValues(templateWithoutDefaults, {});

    expect(result.textVar).toBe('');
    expect(result.numberVar).toBe(0);
    expect(result.boolVar).toBe(false);
  });

  it('prioritizes user values over defaults', () => {
    const userValues = {
      variable1: 'User Override',
      variable2: 'Option C'
    };
    const result = mergeVariableValues(mockTemplate, userValues);

    expect(result.variable1).toBe('User Override');
    expect(result.variable2).toBe('Option C');
  });
});

describe('searchTemplates', () => {
  it('searches by template name', () => {
    const result = searchTemplates(mockTemplates, 'market');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Market Research Template');
  });

  it('searches by description', () => {
    const result = searchTemplates(mockTemplates, 'strategic');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Strategy Template');
  });

  it('searches by category', () => {
    const result = searchTemplates(mockTemplates, 'research');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Research');
  });

  it('searches by content', () => {
    const result = searchTemplates(mockTemplates, 'competitors');

    expect(result).toHaveLength(1);
    expect(result[0].content).toContain('competitors');
  });

  it('filters by category', () => {
    const result = searchTemplates(mockTemplates, '', { category: 'Research' });

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Research');
  });

  it('combines search and filters', () => {
    const result = searchTemplates(mockTemplates, 'template', { category: 'Strategy' });

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Strategy');
  });

  it('returns empty array when no matches', () => {
    const result = searchTemplates(mockTemplates, 'nonexistent');

    expect(result).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const result = searchTemplates(mockTemplates, 'MARKET');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Market Research Template');
  });
});

describe('calculateTemplateStats', () => {
  it('calculates basic statistics correctly', () => {
    const stats = calculateTemplateStats(mockTemplate);

    expect(stats.variableCount).toBe(2);
    expect(stats.contentLength).toBe(mockTemplate.content.length);
    expect(stats.requiredVariables).toBe(1);
    expect(stats.optionalVariables).toBe(1);
  });

  it('estimates completion time based on content and variables', () => {
    const stats = calculateTemplateStats(mockTemplate);

    expect(stats.estimatedCompletionTime).toBeGreaterThan(0);
    expect(typeof stats.estimatedCompletionTime).toBe('number');
  });

  it('has minimum completion time', () => {
    const shortTemplate = {
      ...mockTemplate,
      content: 'Short',
      variables: []
    };
    const stats = calculateTemplateStats(shortTemplate);

    expect(stats.estimatedCompletionTime).toBeGreaterThanOrEqual(5);
  });

  it('increases time estimate with more content and variables', () => {
    const longTemplate = {
      ...mockTemplate,
      content: 'Very long content '.repeat(100),
      variables: Array(10).fill(null).map((_, i) => ({
        name: `var${i}`,
        type: 'text' as const,
        required: false
      }))
    };
    const longStats = calculateTemplateStats(longTemplate);
    const shortStats = calculateTemplateStats(mockTemplate);

    expect(longStats.estimatedCompletionTime).toBeGreaterThan(shortStats.estimatedCompletionTime);
  });
});
