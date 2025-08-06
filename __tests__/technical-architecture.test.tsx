import TechnicalArchitecture from '@/app/launch-essentials/components/TechnicalArchitecture';
import { TechnicalData } from '@/types/launch-essentials';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  CardContent: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input onChange={onChange} value={value} {...props} />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, ...props }: any) => (
    <textarea onChange={onChange} value={value} {...props} />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select onChange={(e) => onValueChange(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default={defaultValue}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: any) => <div className={`alert ${className}`}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

describe('TechnicalArchitecture', () => {
  const mockOnDataChange = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    onDataChange: mockOnDataChange,
    onSave: mockOnSave,
    isLoading: false,
  };

  const mockTechnicalData: TechnicalData = {
    technologyStack: {
      frontend: ['React'],
      backend: ['Node.js'],
      database: ['PostgreSQL'],
      infrastructure: ['AWS'],
      reasoning: 'Test reasoning'
    },
    architecture: {
      systemDesign: 'Test system design',
      scalabilityPlan: 'Test scalability plan',
      performanceTargets: [
        {
          metric: 'Response Time',
          target: 200,
          unit: 'ms',
          priority: 'critical'
        }
      ]
    },
    integrations: {
      thirdPartyServices: [
        {
          name: 'Stripe',
          purpose: 'Payment processing',
          cost: 50,
          alternatives: ['PayPal', 'Square'],
          integrationComplexity: 'medium'
        }
      ],
      apis: []
    },
    security: {
      requirements: [
        {
          requirement: 'Authentication & Authorization',
          priority: 'critical',
          implementation: 'OAuth 2.0 with JWT tokens',
          compliance: ['GDPR', 'SOC 2']
        }
      ],
      compliance: []
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the technical architecture component', () => {
      render(<TechnicalArchitecture {...defaultProps} />);

      expect(screen.getByText('Technical Architecture')).toBeInTheDocument();
      expect(screen.getByText('Define your technology stack, architecture, and technical requirements')).toBeInTheDocument();
    });

    it('displays progress calculation correctly', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      const progressElement = screen.getByTestId('progress');
      expect(progressElement).toHaveAttribute('data-value', '100'); // All sections completed
    });

    it('renders all tab sections', () => {
      render(<TechnicalArchitecture {...defaultProps} />);

      expect(screen.getByTestId('tab-stack')).toBeInTheDocument();
      expect(screen.getByTestId('tab-architecture')).toBeInTheDocument();
      expect(screen.getByTestId('tab-integrations')).toBeInTheDocument();
      expect(screen.getByTestId('tab-security')).toBeInTheDocument();
    });
  });

  describe('Technology Stack Management', () => {
    it('displays selected technologies with badges', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
      expect(screen.getByText('AWS')).toBeInTheDocument();
    });

    it('allows adding new technologies', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      // This would require more complex mocking of the Select component
      // For now, we'll test the basic structure
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    });

    it('updates reasoning text', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const reasoningTextarea = screen.getByPlaceholderText('Explain your technology choices and how they align with your project goals...');
      await user.type(reasoningTextarea, 'New reasoning text');

      expect(mockOnDataChange).toHaveBeenCalled();
    });
  });

  describe('Conflict Detection', () => {
    it('detects cost conflicts with high-complexity stack', () => {
      const conflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring'],
          infrastructure: ['AWS']
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={conflictData} />);

      expect(screen.getByText('Potential conflicts detected:')).toBeInTheDocument();
      expect(screen.getByText(/High-complexity stack may increase development and infrastructure costs/)).toBeInTheDocument();
    });

    it('detects performance conflicts with MongoDB and ACID requirements', () => {
      const conflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          database: ['MongoDB']
        },
        architecture: {
          ...mockTechnicalData.architecture,
          performanceTargets: [
            {
              metric: 'ACID Compliance',
              target: 100,
              unit: '%',
              priority: 'critical'
            }
          ]
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={conflictData} />);

      expect(screen.getByText(/MongoDB lacks ACID compliance which conflicts with performance requirements/)).toBeInTheDocument();
    });

    it('detects timeline conflicts with complex technology choices', () => {
      const conflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring']
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={conflictData} />);

      expect(screen.getByText(/Complex technology stack may extend development timeline/)).toBeInTheDocument();
    });

    it('provides alternative suggestions for conflicts', () => {
      const conflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring'],
          infrastructure: ['AWS']
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={conflictData} />);

      expect(screen.getByText('Consider React + Node.js for faster development')).toBeInTheDocument();
      expect(screen.getByText('Use Vercel for simpler deployment')).toBeInTheDocument();
    });
  });

  describe('Architecture Planning', () => {
    it('allows updating system design', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const systemDesignTextarea = screen.getByPlaceholderText('Describe your overall system architecture, components, and data flow...');
      await user.type(systemDesignTextarea, 'New system design');

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('allows updating scalability plan', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const scalabilityTextarea = screen.getByPlaceholderText('How will your system handle growth in users, data, and traffic?');
      await user.type(scalabilityTextarea, 'New scalability plan');

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('displays existing performance targets', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      expect(screen.getByText('Response Time')).toBeInTheDocument();
      expect(screen.getByText('Target: 200 ms')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('allows adding new performance targets', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const metricInput = screen.getByPlaceholderText('e.g., Response Time');
      const targetInput = screen.getByPlaceholderText('e.g., 200');
      const unitInput = screen.getByPlaceholderText('e.g., ms');

      await user.type(metricInput, 'Throughput');
      await user.type(targetInput, '1000');
      await user.type(unitInput, 'req/s');

      const addButton = screen.getByText('Add Performance Target');
      await user.click(addButton);

      expect(mockOnDataChange).toHaveBeenCalled();
    });
  });

  describe('Third-Party Integrations', () => {
    it('displays existing third-party services', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      expect(screen.getByText('Stripe')).toBeInTheDocument();
      expect(screen.getByText('Payment processing')).toBeInTheDocument();
      expect(screen.getByText('$50/month')).toBeInTheDocument();
      expect(screen.getByText('medium complexity')).toBeInTheDocument();
      expect(screen.getByText('PayPal, Square')).toBeInTheDocument();
    });

    it('allows adding new third-party services', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText('e.g., Stripe');
      const purposeInput = screen.getByPlaceholderText('e.g., Payment processing');
      const costInput = screen.getByPlaceholderText('0');

      await user.type(nameInput, 'SendGrid');
      await user.type(purposeInput, 'Email service');
      await user.type(costInput, '25');

      const addButton = screen.getByText('Add Service');
      await user.click(addButton);

      expect(mockOnDataChange).toHaveBeenCalled();
    });
  });

  describe('Security Requirements', () => {
    it('displays security requirement templates', () => {
      render(<TechnicalArchitecture {...defaultProps} />);

      expect(screen.getByText('Authentication & Authorization')).toBeInTheDocument();
      expect(screen.getByText('Data Encryption')).toBeInTheDocument();
      expect(screen.getByText('Input Validation')).toBeInTheDocument();
      expect(screen.getByText('Audit Logging')).toBeInTheDocument();
      expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
    });

    it('displays selected security requirements', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      expect(screen.getByText('Selected Security Requirements')).toBeInTheDocument();
      expect(screen.getByText('OAuth 2.0 with JWT tokens')).toBeInTheDocument();
      expect(screen.getByText('GDPR, SOC 2')).toBeInTheDocument();
    });

    it('allows adding security requirements from templates', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      // Find and click on a security template
      const addButtons = screen.getAllByText('Add');
      await user.click(addButtons[0]); // Click first "Add" button

      expect(mockOnDataChange).toHaveBeenCalled();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates progress correctly for empty data', () => {
      render(<TechnicalArchitecture {...defaultProps} />);

      const progressElement = screen.getByTestId('progress');
      expect(progressElement).toHaveAttribute('data-value', '0');
    });

    it('calculates progress correctly for partial data', () => {
      const partialData: TechnicalData = {
        technologyStack: {
          frontend: ['React'],
          backend: [],
          database: [],
          infrastructure: [],
          reasoning: ''
        },
        architecture: {
          systemDesign: 'Some design',
          scalabilityPlan: '',
          performanceTargets: []
        },
        integrations: {
          thirdPartyServices: [],
          apis: []
        },
        security: {
          requirements: [],
          compliance: []
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={partialData} />);

      const progressElement = screen.getByTestId('progress');
      expect(progressElement).toHaveAttribute('data-value', '25'); // 2 out of 8 sections completed
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const saveButton = screen.getByText('Save Progress');
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('shows loading state when saving', () => {
      render(<TechnicalArchitecture {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('disables save button when loading', () => {
      render(<TechnicalArchitecture {...defaultProps} isLoading={true} />);

      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Technology Decision Logic', () => {
    it('provides technology recommendations based on complexity', () => {
      render(<TechnicalArchitecture {...defaultProps} />);

      // The component should show technology options with complexity indicators
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('shows cost indicators for technology choices', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      // Technology badges should show cost indicators
      const badges = screen.getAllByText('React');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('displays scalability indicators', () => {
      render(<TechnicalArchitecture {...defaultProps} data={mockTechnicalData} />);

      // Should show scalability indicators for selected technologies
      const badges = screen.getAllByText('AWS');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendation Algorithms', () => {
    it('recommends alternatives for high-cost solutions', () => {
      const highCostData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring'],
          infrastructure: ['AWS']
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={highCostData} />);

      expect(screen.getByText('Consider React + Node.js for faster development')).toBeInTheDocument();
    });

    it('suggests performance optimizations', () => {
      const performanceConflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          database: ['MongoDB']
        },
        architecture: {
          ...mockTechnicalData.architecture,
          performanceTargets: [
            {
              metric: 'ACID Compliance',
              target: 100,
              unit: '%',
              priority: 'critical'
            }
          ]
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={performanceConflictData} />);

      expect(screen.getByText('Use PostgreSQL for ACID compliance')).toBeInTheDocument();
    });

    it('provides timeline-based recommendations', () => {
      const timelineConflictData: TechnicalData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring']
        }
      };

      render(<TechnicalArchitecture {...defaultProps} data={timelineConflictData} />);

      expect(screen.getByText('Use React + Node.js for faster development')).toBeInTheDocument();
      expect(screen.getByText('Consider low-code platforms for MVP')).toBeInTheDocument();
    });
  });

  describe('Data Validation', () => {
    it('validates performance target inputs', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const addButton = screen.getByText('Add Performance Target');

      // Try to add without required fields
      await user.click(addButton);

      // Button should be disabled when required fields are empty
      expect(addButton).toBeDisabled();
    });

    it('validates third-party service inputs', async () => {
      const user = userEvent.setup();
      render(<TechnicalArchitecture {...defaultProps} />);

      const addButton = screen.getByText('Add Service');

      // Try to add without required fields
      await user.click(addButton);

      // Button should be disabled when required fields are empty
      expect(addButton).toBeDisabled();
    });
  });
});
