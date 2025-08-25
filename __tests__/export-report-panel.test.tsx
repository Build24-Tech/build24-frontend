import { ExportReportPanel } from '@/app/launch-essentials/components/ExportReportPanel';
import { DataExporter } from '@/lib/export-utils';
import { ReportService } from '@/lib/report-service';
import { ProjectData, UserProgress } from '@/types/launch-essentials';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the dependencies
jest.mock('@/lib/export-utils');
jest.mock('@/lib/report-service');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and appendChild/removeChild
const mockLink = {
  href: '',
  download: '',
  click: jest.fn()
};
jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockLink as any;
  }
  return document.createElement(tagName);
});
jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

const mockProjectData: ProjectData = {
  id: 'test-project',
  userId: 'test-user',
  name: 'Test Project',
  description: 'A test project',
  industry: 'Technology',
  targetMarket: 'Developers',
  stage: 'development',
  data: {
    validation: { marketSize: '$1B' },
    financial: { projectedRevenue: '$100K' }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockProgress: UserProgress = {
  userId: 'test-user',
  projectId: 'test-project',
  currentPhase: 'validation',
  phases: {
    validation: {
      phase: 'validation',
      steps: [
        { stepId: 'market-research', status: 'completed', data: {}, completedAt: new Date() }
      ],
      completionPercentage: 100,
      startedAt: new Date()
    },
    definition: {
      phase: 'definition',
      steps: [
        { stepId: 'vision-mission', status: 'in_progress', data: {} }
      ],
      completionPercentage: 50,
      startedAt: new Date()
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockTemplates = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview',
    targetAudience: 'stakeholder',
    sections: [
      { id: 'summary', title: 'Summary', type: 'summary', required: true, stakeholderVisible: true }
    ]
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive analysis',
    targetAudience: 'internal',
    sections: [
      { id: 'detailed', title: 'Details', type: 'detailed', required: true, stakeholderVisible: false }
    ]
  }
];

describe('ExportReportPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ReportService.getTemplates as jest.Mock).mockReturnValue(mockTemplates);
  });

  it('should render export and report sections', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    expect(screen.getByText('Data Export')).toBeInTheDocument();
    expect(screen.getByText('Report Generation')).toBeInTheDocument();
    expect(screen.getByText('Export Summary')).toBeInTheDocument();
  });

  it('should display format options', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    fireEvent.click(screen.getByRole('combobox', { name: /export format/i }));

    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('MARKDOWN')).toBeInTheDocument();
  });

  it('should display template options', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    fireEvent.click(screen.getByRole('combobox', { name: /report template/i }));

    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
  });

  it('should handle export functionality', async () => {
    const mockExportResult = {
      data: 'mock-data',
      filename: 'test-export.json',
      mimeType: 'application/json'
    };

    (DataExporter.exportProject as jest.Mock).mockResolvedValue(mockExportResult);

    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const exportButton = screen.getByText('Export Project Data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(DataExporter.exportProject).toHaveBeenCalledWith(
        mockProjectData,
        mockProgress,
        expect.objectContaining({
          format: 'pdf', // default format
          includeCharts: true,
          stakeholderView: false
        })
      );
    });

    expect(mockLink.download).toBe('test-export.json');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should handle report generation', async () => {
    const mockReport = {
      id: 'report-1',
      projectId: 'test-project',
      templateId: 'executive-summary',
      title: 'Test Project - Executive Summary',
      content: {
        executiveSummary: 'Mock summary',
        progressOverview: {},
        phaseAnalysis: [],
        insights: {},
        recommendations: []
      },
      generatedAt: new Date(),
      format: 'json'
    };

    (ReportService.generateReport as jest.Mock).mockResolvedValue(mockReport);

    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(ReportService.generateReport).toHaveBeenCalledWith(
        mockProjectData,
        mockProgress,
        'executive-summary',
        expect.objectContaining({
          format: 'pdf',
          includeCharts: true,
          stakeholderView: false
        })
      );
    });

    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should update options when checkboxes are toggled', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const chartsCheckbox = screen.getByLabelText(/include charts/i);
    const stakeholderCheckbox = screen.getByLabelText(/stakeholder-friendly/i);

    expect(chartsCheckbox).toBeChecked();
    expect(stakeholderCheckbox).not.toBeChecked();

    fireEvent.click(chartsCheckbox);
    fireEvent.click(stakeholderCheckbox);

    expect(chartsCheckbox).not.toBeChecked();
    expect(stakeholderCheckbox).toBeChecked();
  });

  it('should display template details when template is selected', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    // Template details should be visible by default (executive-summary selected)
    expect(screen.getByText('Template Details')).toBeInTheDocument();
    expect(screen.getByText('stakeholder')).toBeInTheDocument();
    expect(screen.getByText('High-level overview')).toBeInTheDocument();
  });

  it('should show loading states during operations', async () => {
    (DataExporter.exportProject as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const exportButton = screen.getByText('Export Project Data');
    fireEvent.click(exportButton);

    expect(screen.getByText('Exporting...')).toBeInTheDocument();
    expect(exportButton).toBeDisabled();
  });

  it('should display project statistics', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    // Should show phase count
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 phases

    // Should show total steps
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 total steps

    // Should show completed steps
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 completed step

    // Should show overall progress percentage
    expect(screen.getByText('75%')).toBeInTheDocument(); // (100+50)/2 = 75%
  });

  it('should handle export errors gracefully', async () => {
    const mockToast = jest.fn();
    jest.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
      toast: mockToast
    });

    (DataExporter.exportProject as jest.Mock).mockRejectedValue(
      new Error('Export failed')
    );

    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const exportButton = screen.getByText('Export Project Data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export Failed',
        description: 'There was an error exporting your project data.',
        variant: 'destructive'
      });
    });
  });

  it('should handle report generation errors gracefully', async () => {
    const mockToast = jest.fn();
    jest.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({
      toast: mockToast
    });

    (ReportService.generateReport as jest.Mock).mockRejectedValue(
      new Error('Report generation failed')
    );

    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const generateButton = screen.getByText('Generate Report');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Report Generation Failed',
        description: 'There was an error generating your report.',
        variant: 'destructive'
      });
    });
  });

  it('should change format selection', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const formatSelect = screen.getByRole('combobox', { name: /export format/i });
    fireEvent.click(formatSelect);

    const jsonOption = screen.getByText('JSON');
    fireEvent.click(jsonOption);

    // The format should be updated (this would be reflected in the next export call)
    expect(formatSelect).toHaveTextContent('JSON');
  });

  it('should change template selection', () => {
    render(<ExportReportPanel projectData={mockProjectData} progress={mockProgress} />);

    const templateSelect = screen.getByRole('combobox', { name: /report template/i });
    fireEvent.click(templateSelect);

    const detailedOption = screen.getByText('Detailed Analysis');
    fireEvent.click(detailedOption);

    // Should show updated template details
    expect(screen.getByText('internal')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive analysis')).toBeInTheDocument();
  });
});
