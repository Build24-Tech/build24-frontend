import { FieldConfig, LaunchEssentialsForm, ValidatedForm } from '@/app/launch-essentials/components/ValidatedForm';
import { commonValidationRules } from '@/hooks/use-error-handling';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';

// Mock the error handling hook
jest.mock('@/hooks/use-error-handling', () => ({
  useErrorHandling: () => ({
    executeWithErrorHandling: jest.fn((fn) => fn()),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
    isOnline: true,
    validateField: jest.fn((value, rules) => ({
      isValid: true,
      errors: [],
      suggestions: [],
    })),
  }),
  commonValidationRules: {
    required: (fieldName: string) => ({
      validate: (value: any) => ({
        isValid: value !== null && value !== undefined && value !== '',
        errors: value === null || value === undefined || value === ''
          ? [`${fieldName} is required`]
          : [],
        suggestions: value === null || value === undefined || value === ''
          ? [`Please provide a value for ${fieldName}`]
          : [],
      }),
    }),
    email: () => ({
      validate: (value: string) => ({
        isValid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        errors: value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ['Email must be a valid email address']
          : [],
        suggestions: value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ['Please enter a valid email address']
          : [],
      }),
    }),
  },
}));

// Test schema and fields
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18'),
  category: z.string().min(1, 'Category is required'),
  newsletter: z.boolean(),
  priority: z.string(),
  description: z.string().optional(),
});

type TestFormData = z.infer<typeof testSchema>;

const testFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your name',
    validation: [commonValidationRules.required('Name')],
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
    validation: [commonValidationRules.required('Email'), commonValidationRules.email()],
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'personal', label: 'Personal' },
      { value: 'business', label: 'Business' },
    ],
  },
  {
    name: 'newsletter',
    label: 'Subscribe to newsletter',
    type: 'checkbox',
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'radio',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Optional description',
  },
];

describe('ValidatedForm', () => {
  const defaultProps = {
    fields: testFields,
    schema: testSchema,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all field types correctly', () => {
    render(<ValidatedForm {...defaultProps} />);

    // Text input
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();

    // Email input
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();

    // Number input
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();

    // Select
    expect(screen.getByText('Category')).toBeInTheDocument();

    // Checkbox
    expect(screen.getByLabelText(/subscribe to newsletter/i)).toBeInTheDocument();

    // Radio buttons
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Low')).toBeInTheDocument();
    expect(screen.getByLabelText('Medium')).toBeInTheDocument();
    expect(screen.getByLabelText('High')).toBeInTheDocument();

    // Textarea
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional description')).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('shows required field indicators', () => {
    render(<ValidatedForm {...defaultProps} />);

    // Required fields should have asterisk
    const requiredLabels = screen.getAllByText('*');
    expect(requiredLabels.length).toBeGreaterThan(0);
  });

  test('renders with title and description', () => {
    render(
      <ValidatedForm
        {...defaultProps}
        title="Test Form"
        description="This is a test form"
      />
    );

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('This is a test form')).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ValidatedForm {...defaultProps} onSubmit={onSubmit} />);

    // Fill out required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/age/i), '25');

    // Select category
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Personal'));

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
          category: 'personal',
        })
      );
    });
  });

  test('handles checkbox and radio inputs', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ValidatedForm {...defaultProps} onSubmit={onSubmit} />);

    // Fill required fields first
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/age/i), '25');
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Personal'));

    // Check newsletter checkbox
    await user.click(screen.getByLabelText(/subscribe to newsletter/i));

    // Select radio button
    await user.click(screen.getByLabelText('High'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          newsletter: true,
          priority: 'high',
        })
      );
    });
  });

  test('handles textarea input', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ValidatedForm {...defaultProps} onSubmit={onSubmit} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/age/i), '25');
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Personal'));

    // Fill textarea
    await user.type(screen.getByLabelText(/description/i), 'This is a test description');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'This is a test description',
        })
      );
    });
  });

  test('shows field descriptions when provided', () => {
    const fieldsWithDescription = [
      {
        ...testFields[0],
        description: 'Enter your full legal name',
      },
    ];

    render(
      <ValidatedForm
        {...defaultProps}
        fields={fieldsWithDescription}
      />
    );

    expect(screen.getByText('Enter your full legal name')).toBeInTheDocument();
  });

  test('handles conditional fields', async () => {
    const user = userEvent.setup();
    const conditionalFields = [
      ...testFields,
      {
        name: 'businessName',
        label: 'Business Name',
        type: 'text' as const,
        conditional: (values: any) => values.category === 'business',
      },
    ];

    render(
      <ValidatedForm
        {...defaultProps}
        fields={conditionalFields}
      />
    );

    // Business name field should not be visible initially
    expect(screen.queryByLabelText(/business name/i)).not.toBeInTheDocument();

    // Select business category
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Business'));

    // Business name field should now be visible
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
  });

  test('handles disabled state', () => {
    render(<ValidatedForm {...defaultProps} disabled />);

    // All inputs should be disabled
    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  test('handles individual field disabled state', () => {
    const fieldsWithDisabled = [
      { ...testFields[0], disabled: true },
      ...testFields.slice(1),
    ];

    render(
      <ValidatedForm
        {...defaultProps}
        fields={fieldsWithDisabled}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).not.toBeDisabled();
  });

  test('shows custom submit label', () => {
    render(
      <ValidatedForm
        {...defaultProps}
        submitLabel="Save Changes"
      />
    );

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <ValidatedForm
        {...defaultProps}
        className="custom-form"
      />
    );

    expect(container.firstChild).toHaveClass('custom-form');
  });

  test('handles default values', () => {
    const defaultValues = {
      name: 'John Doe',
      email: 'john@example.com',
      newsletter: true,
    };

    render(
      <ValidatedForm
        {...defaultProps}
        defaultValues={defaultValues}
      />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/subscribe to newsletter/i)).toBeChecked();
  });
});

describe('LaunchEssentialsForm', () => {
  test('renders with default styling and auto-save delay', () => {
    const { container } = render(
      <LaunchEssentialsForm
        fields={testFields}
        schema={testSchema}
        onSubmit={jest.fn()}
      />
    );

    expect(container.firstChild).toHaveClass('max-w-2xl');
  });

  test('merges custom className with default', () => {
    const { container } = render(
      <LaunchEssentialsForm
        fields={testFields}
        schema={testSchema}
        onSubmit={jest.fn()}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('max-w-2xl', 'custom-class');
  });
});

describe('ValidatedForm Error Handling', () => {
  test('displays network status when offline', () => {
    // Mock offline state
    jest.mock('@/hooks/use-error-handling', () => ({
      useErrorHandling: () => ({
        executeWithErrorHandling: jest.fn(),
        isLoading: false,
        error: null,
        clearError: jest.fn(),
        isOnline: false, // Offline
        validateField: jest.fn(() => ({ isValid: true, errors: [], suggestions: [] })),
      }),
    }));

    render(<ValidatedForm {...defaultProps} />);

    expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument();
  });

  test('displays form errors', () => {
    // Mock error state
    jest.mock('@/hooks/use-error-handling', () => ({
      useErrorHandling: () => ({
        executeWithErrorHandling: jest.fn(),
        isLoading: false,
        error: new Error('Form submission failed'),
        clearError: jest.fn(),
        isOnline: true,
        validateField: jest.fn(() => ({ isValid: true, errors: [], suggestions: [] })),
      }),
    }));

    render(<ValidatedForm {...defaultProps} />);

    expect(screen.getByText('Form submission failed')).toBeInTheDocument();
  });

  test('shows loading state during submission', () => {
    // Mock loading state
    jest.mock('@/hooks/use-error-handling', () => ({
      useErrorHandling: () => ({
        executeWithErrorHandling: jest.fn(),
        isLoading: true,
        error: null,
        clearError: jest.fn(),
        isOnline: true,
        validateField: jest.fn(() => ({ isValid: true, errors: [], suggestions: [] })),
      }),
    }));

    render(<ValidatedForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});

describe('ValidatedForm Auto-save', () => {
  test('calls onAutoSave when provided', async () => {
    const user = userEvent.setup();
    const onAutoSave = jest.fn();

    render(
      <ValidatedForm
        {...defaultProps}
        onAutoSave={onAutoSave}
        autoSaveDelay={100}
      />
    );

    await user.type(screen.getByLabelText(/full name/i), 'John');

    // Wait for auto-save delay
    await waitFor(() => {
      expect(onAutoSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
        })
      );
    }, { timeout: 200 });
  });

  test('does not auto-save when offline', async () => {
    const user = userEvent.setup();
    const onAutoSave = jest.fn();

    // Mock offline state
    jest.mock('@/hooks/use-error-handling', () => ({
      useErrorHandling: () => ({
        executeWithErrorHandling: jest.fn(),
        isLoading: false,
        error: null,
        clearError: jest.fn(),
        isOnline: false,
        validateField: jest.fn(() => ({ isValid: true, errors: [], suggestions: [] })),
      }),
    }));

    render(
      <ValidatedForm
        {...defaultProps}
        onAutoSave={onAutoSave}
        autoSaveDelay={100}
      />
    );

    await user.type(screen.getByLabelText(/full name/i), 'John');

    // Wait longer than auto-save delay
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(onAutoSave).not.toHaveBeenCalled();
  });
});
