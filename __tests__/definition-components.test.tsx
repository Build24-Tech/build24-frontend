import { FeaturePrioritization } from '@/app/launch-essentials/components/definition/FeaturePrioritization';
import { MetricsDefinition } from '@/app/launch-essentials/components/definition/MetricsDefinition';
import { ValueProposition } from '@/app/launch-essentials/components/definition/ValueProposition';
import { VisionMission } from '@/app/launch-essentials/components/definition/VisionMission';
import { ProductDefinitionData } from '@/types/launch-essentials';
import { fireEvent, render, screen } from '@testing-library/react';

describe('Definition Components', () => {
  describe('VisionMission', () => {
    const mockVisionData: ProductDefinitionData['vision'] = {
      statement: 'Test vision statement',
      missionAlignment: 'Test mission alignment'
    };

    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('renders vision and mission sections', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      expect(screen.getByText('Vision Statement')).toBeInTheDocument();
      expect(screen.getAllByText('Mission Alignment')).toHaveLength(3); // Header, label, and summary
    });

    it('displays existing vision data', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      const visionTextarea = screen.getByDisplayValue('Test vision statement');
      const missionTextarea = screen.getByDisplayValue('Test mission alignment');

      expect(visionTextarea).toBeInTheDocument();
      expect(missionTextarea).toBeInTheDocument();
    });

    it('calls onChange when vision statement is updated', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      const visionTextarea = screen.getByDisplayValue('Test vision statement');
      fireEvent.change(visionTextarea, { target: { value: 'Updated vision' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockVisionData,
        statement: 'Updated vision'
      });
    });

    it('shows templates when template button is clicked', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Templates'));

      expect(screen.getByText('Vision Statement Templates')).toBeInTheDocument();
      expect(screen.getByText('Problem-Solution Vision')).toBeInTheDocument();
    });

    it('applies template when use template button is clicked', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Templates'));

      const useTemplateButtons = screen.getAllByText('Use Template');
      fireEvent.click(useTemplateButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockVisionData,
        statement: expect.stringContaining('[problem]')
      });
    });

    it('shows guidance when help button is clicked', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Guidance'));

      expect(screen.getByText('Vision Statement Guidelines')).toBeInTheDocument();
      expect(screen.getByText(/Keep it concise but inspiring/)).toBeInTheDocument();
    });

    it('shows summary when both fields are filled', () => {
      render(<VisionMission data={mockVisionData} onChange={mockOnChange} />);

      expect(screen.getByText('Vision & Mission Summary')).toBeInTheDocument();
    });
  });

  describe('ValueProposition', () => {
    const mockValuePropData: ProductDefinitionData['valueProposition'] = {
      canvas: {
        customerJobs: ['Job 1', 'Job 2'],
        painPoints: ['Pain 1'],
        gainCreators: ['Gain 1'],
        painRelievers: ['Relief 1'],
        productsServices: ['Product 1']
      },
      uniqueValue: 'Test unique value proposition'
    };

    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('renders value proposition canvas sections', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      expect(screen.getByText('Value Proposition Canvas')).toBeInTheDocument();
      expect(screen.getAllByText('Customer Jobs')).toHaveLength(2); // Section header and summary
      expect(screen.getAllByText('Pain Points')).toHaveLength(2); // Section header and summary
      expect(screen.getAllByText('Gain Creators')).toHaveLength(2); // Section header and summary
    });

    it('displays existing canvas data', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
      expect(screen.getByText('Pain 1')).toBeInTheDocument();
    });

    it('allows adding new canvas items', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      // Find customer jobs input and add button
      const customerJobsInput = screen.getByPlaceholderText(/Manage team communications/);
      const addButton = customerJobsInput.parentElement?.querySelector('button');

      fireEvent.change(customerJobsInput, { target: { value: 'New job' } });
      fireEvent.click(addButton!);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockValuePropData,
        canvas: {
          ...mockValuePropData.canvas,
          customerJobs: ['Job 1', 'Job 2', 'New job']
        }
      });
    });

    it('allows removing canvas items', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      // Find the first job item and its remove button
      const jobItem = screen.getByText('Job 1');
      const removeButton = jobItem.parentElement?.querySelector('button');

      if (removeButton) {
        fireEvent.click(removeButton);
      }

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('updates unique value proposition', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      const uniqueValueTextarea = screen.getByDisplayValue('Test unique value proposition');
      fireEvent.change(uniqueValueTextarea, { target: { value: 'Updated value prop' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockValuePropData,
        uniqueValue: 'Updated value prop'
      });
    });

    it('shows templates when template button is clicked', () => {
      render(<ValueProposition data={mockValuePropData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Templates'));

      expect(screen.getByText('Value Proposition Templates')).toBeInTheDocument();
    });
  });

  describe('FeaturePrioritization', () => {
    const mockFeaturesData: ProductDefinitionData['features'] = {
      coreFeatures: [
        {
          id: '1',
          name: 'User Authentication',
          description: 'Login and registration system',
          priority: 'must-have',
          effort: 'medium',
          impact: 'high',
          dependencies: []
        }
      ],
      prioritization: {
        method: 'moscow',
        results: [
          {
            featureId: '1',
            score: 4,
            ranking: 1
          }
        ]
      }
    };

    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('renders prioritization method selection', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      expect(screen.getByText('Prioritization Method')).toBeInTheDocument();
      expect(screen.getByText('MoSCoW Method')).toBeInTheDocument();
      expect(screen.getByText('Kano Model')).toBeInTheDocument();
    });

    it('displays existing features', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      expect(screen.getAllByText('User Authentication')[0]).toBeInTheDocument();
      expect(screen.getByText('Login and registration system')).toBeInTheDocument();
    });

    it('allows adding new features', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Add Feature'));

      expect(screen.getByText('Add New Feature')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., User Authentication')).toBeInTheDocument();
    });

    it('changes prioritization method', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Kano Model'));

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockFeaturesData,
        prioritization: {
          method: 'kano',
          results: []
        }
      });
    });

    it('calculates prioritization when button is clicked', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Calculate Priority'));

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockFeaturesData,
        prioritization: {
          ...mockFeaturesData.prioritization,
          results: expect.arrayContaining([
            expect.objectContaining({
              featureId: '1',
              score: expect.any(Number),
              ranking: expect.any(Number)
            })
          ])
        }
      });
    });

    it('shows prioritization results', () => {
      render(<FeaturePrioritization data={mockFeaturesData} onChange={mockOnChange} />);

      expect(screen.getByText('Prioritization Results')).toBeInTheDocument();
      expect(screen.getAllByText('1')).toHaveLength(2); // Ranking numbers appear in both sections
    });
  });

  describe('MetricsDefinition', () => {
    const mockMetricsData: ProductDefinitionData['metrics'] = {
      kpis: [
        {
          id: '1',
          name: 'Monthly Active Users',
          description: 'Users active in the last 30 days',
          target: 1000,
          unit: 'users',
          frequency: 'monthly',
          category: 'retention'
        }
      ],
      successCriteria: ['Achieve product-market fit within 6 months']
    };

    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('renders KPI and success criteria sections', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      expect(screen.getByText('Key Performance Indicators (KPIs)')).toBeInTheDocument();
      expect(screen.getAllByText('Success Criteria')).toHaveLength(2); // Appears in main section and summary
    });

    it('displays existing KPIs', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      expect(screen.getByText('Monthly Active Users')).toBeInTheDocument();
      expect(screen.getByText('Users active in the last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Target: 1000 users')).toBeInTheDocument();
    });

    it('displays existing success criteria', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      expect(screen.getByText('Achieve product-market fit within 6 months')).toBeInTheDocument();
    });

    it('allows adding new KPIs', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Add KPI'));

      expect(screen.getByText('Add New KPI')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Monthly Active Users')).toBeInTheDocument();
    });

    it('allows adding new success criteria', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      const criteriaInput = screen.getByPlaceholderText('Enter a success criteria...');
      const addButton = criteriaInput.nextElementSibling;

      fireEvent.change(criteriaInput, { target: { value: 'New success criteria' } });
      fireEvent.click(addButton!);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockMetricsData,
        successCriteria: ['Achieve product-market fit within 6 months', 'New success criteria']
      });
    });

    it('shows KPI templates when templates button is clicked', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Templates'));

      expect(screen.getByText('Website Traffic')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    });

    it('groups KPIs by category', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      expect(screen.getByText('Retention (1)')).toBeInTheDocument();
    });

    it('shows metrics summary when data exists', () => {
      render(<MetricsDefinition data={mockMetricsData} onChange={mockOnChange} />);

      expect(screen.getByText('Metrics Summary')).toBeInTheDocument();
    });
  });
});
