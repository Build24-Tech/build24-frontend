import TemplateEditor from '@/app/launch-essentials/components/templates/TemplateEditor';
import TemplateManager from '@/app/launch-essentials/components/templates/TemplateManager';
import TemplateSelector from '@/app/launch-essentials/components/templates/TemplateSelector';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock template utilities
jest.mock('@/lib/template-utils', () => ({
  getTemplatesByCategory: jest.fn(() => [
    {
      id: 'template1',
      name: 'Market Research Template',
      category: 'validation',
      description: 'Template for market research',
      fields: [
        { id: 'field1', name: 'Market Size', type: 'text', required: true },
        { id: 'field2', name: 'Growth Rate', type: 'number', required: false }
      ]
    },
    {
      id: 'template2',
      name: 'Competitor Analysis Template',
      category: 'validation',
      description: 'Template for competitor analysis',
      fields: [
        { id: 'field3', name: 'Competitor Name', type: 'text', required: true },
        { id: 'field4', name: 'Strengths', type: 'textarea', required: true }
      ]
    }
  ]),
  saveTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  exportTemplate: jest.fn(),
  validateTemplateData: jest.fn(() => ({ isValid: true, errors: [] }))
}));

describe('TemplateSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render available templates', () => {
    render(<TemplateSelector category="validation" onSelect={mockOnSelect} />);

    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis Template')).toBeInTheDocument();
    expect(screen.getByText('Template for market research')).toBeInTheDocument();
  });

  it('should handle template selection', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector category="validation" onSelect={mockOnSelect} />);

    const template = screen.getByText('Market Research Template').closest('div');
    await user.click(template!);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'template1',
        name: 'Market Research Template',
        category: 'validation'
      })
    );
  });

  it('should filter templates by search', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector category="validation" onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'Market');

    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.queryByText('Competitor Analysis Template')).not.toBeInTheDocument();
  });

  it('should show empty state when no templates match', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector category="validation" onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'NonExistent');

    expect(screen.getByText('No templates found')).toBeInTheDocument();
  });
});

describe('TemplateEditor', () => {
  const mockTemplate = {
    id: 'template1',
    name: 'Market Research Template',
    category: 'validation',
    description: 'Template for market research',
    fields: [
      { id: 'field1', name: 'Market Size', type: 'text', required: true },
      { id: 'field2', name: 'Growth Rate', type: 'number', required: false }
    ]
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render template editor with fields', () => {
    render(<TemplateEditor template={mockTemplate} onSave={mockOnSave} />);

    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.getByLabelText(/Market Size/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Growth Rate/)).toBeInTheDocument();
  });

  it('should handle field value changes', async () => {
    const user = userEvent.setup();
    render(<TemplateEditor template={mockTemplate} onSave={mockOnSave} />);

    const marketSizeInput = screen.getByLabelText(/Market Size/);
    await user.type(marketSizeInput, 'Large market');

    expect(marketSizeInput).toHaveValue('Large market');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<TemplateEditor template={mockTemplate} onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Template');
    await user.click(saveButton);

    // Should show validation error for required field
    expect(screen.getByText('Market Size is required')).toBeInTheDocument();
  });

  it('should save template data when valid', async () => {
    const user = userEvent.setup();
    render(<TemplateEditor template={mockTemplate} onSave={mockOnSave} />);

    const marketSizeInput = screen.getByLabelText(/Market Size/);
    await user.type(marketSizeInput, 'Large market');

    const growthRateInput = screen.getByLabelText(/Growth Rate/);
    await user.type(growthRateInput, '15');

    const saveButton = screen.getByText('Save Template');
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      field1: 'Large market',
      field2: '15'
    });
  });

  it('should handle different field types', () => {
    const templateWithVariousFields = {
      ...mockTemplate,
      fields: [
        { id: 'text_field', name: 'Text Field', type: 'text', required: true },
        { id: 'number_field', name: 'Number Field', type: 'number', required: false },
        { id: 'textarea_field', name: 'Textarea Field', type: 'textarea', required: false },
        { id: 'select_field', name: 'Select Field', type: 'select', required: false, options: ['Option 1', 'Option 2'] },
        { id: 'checkbox_field', name: 'Checkbox Field', type: 'checkbox', required: false }
      ]
    };

    render(<TemplateEditor template={templateWithVariousFields} onSave={mockOnSave} />);

    expect(screen.getByLabelText(/Text Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Textarea Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Checkbox Field/)).toBeInTheDocument();
  });

  it('should handle initial data', () => {
    const initialData = {
      field1: 'Existing market size',
      field2: '10'
    };

    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue('Existing market size')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });
});

describe('TemplateManager', () => {
  const mockOnTemplateSelect = jest.fn();
  const mockOnTemplateDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render template management interface', () => {
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    expect(screen.getByText('Template Manager')).toBeInTheDocument();
    expect(screen.getByText('Create New Template')).toBeInTheDocument();
    expect(screen.getByText('Import Template')).toBeInTheDocument();
  });

  it('should show template list with actions', () => {
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis Template')).toBeInTheDocument();

    // Should show action buttons for each template
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    const exportButtons = screen.getAllByText('Export');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
    expect(exportButtons).toHaveLength(2);
  });

  it('should handle template editing', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(mockOnTemplateSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'template1',
        name: 'Market Research Template'
      })
    );
  });

  it('should handle template deletion with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(screen.getByText('Delete Template')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this template/)).toBeInTheDocument();

    // Find the delete button within the modal (should be the last one)
    const allDeleteButtons = screen.getAllByText('Delete');
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]; // Modal delete button is last
    await user.click(confirmButton);

    expect(mockOnTemplateDelete).toHaveBeenCalledWith('template1');
  });

  it('should handle template export', async () => {
    const user = userEvent.setup();
    const mockExportTemplate = require('@/lib/template-utils').exportTemplate;

    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const exportButtons = screen.getAllByText('Export');
    await user.click(exportButtons[0]);

    expect(mockExportTemplate).toHaveBeenCalledWith('template1', 'json');
  });

  it('should handle new template creation', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const createButton = screen.getByText('Create New Template');
    await user.click(createButton);

    // Should show template creation form
    expect(screen.getByRole('heading', { name: /Create Template/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Template Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it('should handle template import', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const importButton = screen.getByText('Import Template');
    await user.click(importButton);

    // Should show file input for template import
    expect(screen.getByRole('heading', { name: /Import Template/ })).toBeInTheDocument();
    expect(screen.getByText('Select template file to import')).toBeInTheDocument();
  });

  it('should filter templates by category', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const categoryFilter = screen.getByLabelText(/Filter by category/);
    await user.selectOptions(categoryFilter, 'validation');

    // Should show only validation templates
    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.getByText('Competitor Analysis Template')).toBeInTheDocument();
  });

  it('should handle search functionality', async () => {
    const user = userEvent.setup();
    render(
      <TemplateManager
        onTemplateSelect={mockOnTemplateSelect}
        onTemplateDelete={mockOnTemplateDelete}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'Market');

    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.queryByText('Competitor Analysis Template')).not.toBeInTheDocument();
  });
});
