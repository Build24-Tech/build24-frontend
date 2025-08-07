import TemplateEditor from '@/app/launch-essentials/components/templates/TemplateEditor';
import TemplateExporter from '@/app/launch-essentials/components/templates/TemplateExporter';
import TemplateManager from '@/app/launch-essentials/components/templates/TemplateManager';
import TemplateSelector from '@/app/launch-essentials/components/templates/TemplateSelector';
import { Template } from '@/types/launch-essentials';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock template data
const mockTemplate: Template = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template for unit testing',
  category: 'Testing',
  content: '# Test Template\n\nThis is a test template with {{variable1}} and {{variable2}}.',
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
      options: ['Option A', 'Option B', 'Option C']
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
    content: '# Market Research\n\n{{marketSize}} and {{competitors}}',
    variables: [
      { name: 'marketSize', type: 'number', required: true },
      { name: 'competitors', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  }
];

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(''))
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('TemplateSelector', () => {
  const mockOnSelectTemplate = jest.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
  });

  it('renders template library correctly', () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    expect(screen.getByText('Template Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('filters templates by search query', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'market');

    // Should show filtered results
    await waitFor(() => {
      expect(screen.getByText(/template.*found/i)).toBeInTheDocument();
    });
  });

  it('filters templates by category', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Find and click category filter
    const categorySelect = screen.getByRole('combobox');
    await user.click(categorySelect);

    // Select a specific category
    const researchOption = screen.getByText('Research');
    await user.click(researchOption);

    await waitFor(() => {
      expect(screen.getByText(/template.*found/i)).toBeInTheDocument();
    });
  });

  it('calls onSelectTemplate when template is selected', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Find and click a "Use Template" button
    const useButtons = screen.getAllByText('Use Template');
    await user.click(useButtons[0]);

    expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
  });

  it('displays template information correctly', () => {
    render(<TemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Check if template cards show correct information
    expect(screen.getByText('Market Research Template')).toBeInTheDocument();
    expect(screen.getByText('Template for market research')).toBeInTheDocument();
  });
});

describe('TemplateEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders template editor with template data', () => {
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Template Editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument();
  });

  it('allows editing template name', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to settings tab
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    const nameInput = screen.getByDisplayValue('Test Template');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Template Name');

    expect(screen.getByDisplayValue('Updated Template Name')).toBeInTheDocument();
  });

  it('allows editing template content', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Should be on edit tab by default
    const contentTextarea = screen.getByDisplayValue(/This is a test template/);
    await user.clear(contentTextarea);
    await user.type(contentTextarea, 'Updated content with {{newVariable}}');

    expect(screen.getByDisplayValue('Updated content with {{newVariable}}')).toBeInTheDocument();
  });

  it('allows adding new variables', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to variables tab
    const variablesTab = screen.getByRole('tab', { name: /variables/i });
    await user.click(variablesTab);

    // Click add variable button
    const addButton = screen.getByText('Add Variable');
    await user.click(addButton);

    // Should show a new variable form
    expect(screen.getByText('Variable 3')).toBeInTheDocument();
  });

  it('validates template before saving', async () => {
    const user = userEvent.setup();
    const invalidTemplate = { ...mockTemplate, name: '' };

    render(
      <TemplateEditor
        template={invalidTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Should show validation errors
    expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows preview of template content', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to preview tab
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    await user.click(previewTab);

    // Should show processed content
    expect(screen.getByText('Template Preview')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked with valid template', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

describe('TemplateExporter', () => {
  const mockOnClose = jest.fn();
  const mockVariableValues = {
    variable1: 'Test Value 1',
    variable2: 'Option A'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders export options correctly', () => {
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Export Template')).toBeInTheDocument();
    expect(screen.getByText('Export Options')).toBeInTheDocument();
    expect(screen.getByText('Share Template')).toBeInTheDocument();
  });

  it('allows selecting different export formats', async () => {
    const user = userEvent.setup();
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    // Find format selector
    const formatSelect = screen.getByRole('combobox');
    await user.click(formatSelect);

    // Should show format options
    expect(screen.getByText('JSON (.json)')).toBeInTheDocument();
    expect(screen.getByText('HTML (.html)')).toBeInTheDocument();
  });

  it('shows export preview', () => {
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Export Preview')).toBeInTheDocument();
    // Should show processed content in preview
    expect(screen.getByText(/Test Value 1/)).toBeInTheDocument();
  });

  it('allows customizing filename', async () => {
    const user = userEvent.setup();
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    const filenameInput = screen.getByDisplayValue('test-template');
    await user.clear(filenameInput);
    await user.type(filenameInput, 'custom-filename');

    expect(screen.getByDisplayValue('custom-filename')).toBeInTheDocument();
  });

  it('creates shareable link', async () => {
    const user = userEvent.setup();
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    const shareButton = screen.getByText('Create Share Link');
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share URL')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateExporter
        template={mockTemplate}
        variableValues={mockVariableValues}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe('TemplateManager', () => {
  const mockOnTemplateSelect = jest.fn();

  beforeEach(() => {
    mockOnTemplateSelect.mockClear();
  });

  it('renders template manager with tabs', () => {
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    expect(screen.getByText('Template Manager')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /template library/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /my templates/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /recent/i })).toBeInTheDocument();
  });

  it('shows create template button', () => {
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    expect(screen.getByText('Create Template')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    // Click on My Templates tab
    const myTemplatesTab = screen.getByRole('tab', { name: /my templates/i });
    await user.click(myTemplatesTab);

    expect(screen.getByText('My Custom Templates')).toBeInTheDocument();
  });

  it('shows empty state for my templates', async () => {
    const user = userEvent.setup();
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    const myTemplatesTab = screen.getByRole('tab', { name: /my templates/i });
    await user.click(myTemplatesTab);

    expect(screen.getByText('No custom templates yet')).toBeInTheDocument();
  });

  it('shows empty state for recent templates', async () => {
    const user = userEvent.setup();
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    const recentTab = screen.getByRole('tab', { name: /recent/i });
    await user.click(recentTab);

    expect(screen.getByText('No recent templates')).toBeInTheDocument();
  });

  it('creates new template when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    const createButton = screen.getByText('Create Template');
    await user.click(createButton);

    // Should switch to editor mode
    expect(screen.getByText('Template Editor')).toBeInTheDocument();
  });
});

describe('Template Integration', () => {
  it('flows from selector to editor to exporter', async () => {
    const user = userEvent.setup();
    const mockOnTemplateSelect = jest.fn();

    // Start with template manager
    render(<TemplateManager onTemplateSelect={mockOnTemplateSelect} />);

    // Create a new template
    const createButton = screen.getByText('Create Template');
    await user.click(createButton);

    // Should be in editor mode
    expect(screen.getByText('Template Editor')).toBeInTheDocument();

    // Edit template name
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    const nameInput = screen.getByDisplayValue('New Template');
    await user.clear(nameInput);
    await user.type(nameInput, 'Integration Test Template');

    // Save template
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Should return to browse mode
    await waitFor(() => {
      expect(screen.getByText('Template Manager')).toBeInTheDocument();
    });
  });

  it('handles template validation errors gracefully', async () => {
    const user = userEvent.setup();
    const invalidTemplate = { ...mockTemplate, name: '', content: '' };

    render(
      <TemplateEditor
        template={invalidTemplate}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Should show multiple validation errors
    expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
    expect(screen.getByText(/template name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/template content is required/i)).toBeInTheDocument();
  });

  it('preserves variable values across editor tabs', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Go to variables tab and set a value
    const variablesTab = screen.getByRole('tab', { name: /variables/i });
    await user.click(variablesTab);

    const textInput = screen.getByPlaceholderText('Enter variable1');
    await user.type(textInput, 'Test Value');

    // Switch to preview tab
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    await user.click(previewTab);

    // Should show the value in preview
    expect(screen.getByText(/Test Value/)).toBeInTheDocument();
  });
});

// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
