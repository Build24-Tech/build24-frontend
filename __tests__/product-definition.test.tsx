import { ProductDefinition } from '@/app/launch-essentials/components/ProductDefinition';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService, UserProgressService } from '@/lib/launch-essentials-firestore';
import { ProjectData, UserProgress } from '@/types/launch-essentials';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/launch-essentials-firestore');
jest.mock('@/hooks/use-toast');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockProjectDataService = ProjectDataService as jest.Mocked<typeof ProjectDataService>;
const mockUserProgressService = UserProgressService as jest.Mocked<typeof UserProgressService>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('ProductDefinition', () => {
  const mockUser = { uid: 'test-user-id' };
  const mockProjectData: ProjectData = {
    id: 'test-project-id',
    userId: 'test-user-id',
    name: 'Test Project',
    description: 'Test Description',
    industry: 'Technology',
    targetMarket: 'B2B',
    stage: 'concept',
    data: {
      definition: {
        vision: {
          statement: 'Test vision statement',
          missionAlignment: 'Test mission alignment'
        },
        valueProposition: {
          canvas: {
            customerJobs: ['Job 1', 'Job 2'],
            painPoints: ['Pain 1', 'Pain 2'],
            gainCreators: ['Gain 1', 'Gain 2'],
            painRelievers: ['Relief 1', 'Relief 2'],
            productsServices: ['Product 1', 'Product 2']
          },
          uniqueValue: 'Test unique value proposition'
        },
        features: {
          coreFeatures: [
            {
              id: '1',
              name: 'Feature 1',
              description: 'Test feature 1',
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
        },
        metrics: {
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
        }
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockUserProgress: UserProgress = {
    userId: 'test-user-id',
    projectId: 'test-project-id',
    currentPhase: 'definition',
    phases: {
      validation: {
        phase: 'validation',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      definition: {
        phase: 'definition',
        steps: [
          {
            stepId: 'vision-mission',
            status: 'completed',
            data: {},
            completedAt: new Date()
          }
        ],
        completionPercentage: 25,
        startedAt: new Date()
      },
      technical: {
        phase: 'technical',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      marketing: {
        phase: 'marketing',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      operations: {
        phase: 'operations',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      financial: {
        phase: 'financial',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      risk: {
        phase: 'risk',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      },
      optimization: {
        phase: 'optimization',
        steps: [],
        completionPercentage: 0,
        startedAt: new Date()
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: mockUser } as any);
    mockProjectDataService.updateProjectPhaseData.mockResolvedValue(undefined);
    mockUserProgressService.updateStepProgress.mockResolvedValue(undefined);
    mockUserProgressService.getUserProgress.mockResolvedValue(mockUserProgress);
    mockToast.mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the product definition framework', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    expect(screen.getByText('Product Definition Framework')).toBeInTheDocument();
    expect(screen.getByText('Define what you\'re building and why it matters')).toBeInTheDocument();
  });

  it('displays all definition steps in navigation', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    expect(screen.getByText('Vision & Mission')).toBeInTheDocument();
    expect(screen.getByText('Value Proposition')).toBeInTheDocument();
    expect(screen.getByText('Feature Prioritization')).toBeInTheDocument();
    expect(screen.getByText('Success Metrics')).toBeInTheDocument();
  });

  it('shows completed status for completed steps', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Vision & Mission step should show as completed
    const visionMissionStep = screen.getByText('Vision & Mission').closest('button');
    expect(visionMissionStep).toHaveClass('border-green-200', 'bg-green-50');
  });

  it('allows navigation between steps', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Click on Value Proposition step
    fireEvent.click(screen.getByText('Value Proposition'));

    // Should show Value Proposition content
    expect(screen.getByText('Value Proposition Canvas')).toBeInTheDocument();
  });

  it('saves progress when save button is clicked', async () => {
    const onProgressUpdate = jest.fn();

    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
        onProgressUpdate={onProgressUpdate}
      />
    );

    // Click save button
    fireEvent.click(screen.getByText('Save Progress'));

    await waitFor(() => {
      expect(mockProjectDataService.updateProjectPhaseData).toHaveBeenCalledWith(
        'test-project-id',
        'definition',
        expect.any(Object)
      );
      expect(mockUserProgressService.updateStepProgress).toHaveBeenCalledWith(
        'test-user-id',
        'test-project-id',
        'definition',
        'vision-mission',
        'completed',
        expect.any(Object)
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Progress Saved',
        description: 'Your product definition progress has been saved successfully.'
      });
    });
  });

  it('shows unsaved changes indicator when data is modified', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Modify vision statement
    const visionTextarea = screen.getByPlaceholderText('Enter your product vision statement...');
    fireEvent.change(visionTextarea, { target: { value: 'Updated vision statement' } });

    // Should show unsaved changes indicator
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('handles save errors gracefully', async () => {
    mockProjectDataService.updateProjectPhaseData.mockRejectedValue(new Error('Save failed'));

    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Click save button
    fireEvent.click(screen.getByText('Save Progress'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Save Failed',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive'
      });
    });
  });

  it('loads existing definition data on mount', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Should display existing vision statement
    const visionTextarea = screen.getByPlaceholderText('Enter your product vision statement...');
    expect(visionTextarea).toHaveValue('Test vision statement');
  });

  it('shows step completion status correctly', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Vision & Mission should show as complete (has data)
    const visionMissionStep = screen.getByText('Vision & Mission').closest('button');
    expect(visionMissionStep).toHaveClass('border-green-200');

    // Navigate to Value Proposition
    fireEvent.click(screen.getByText('Value Proposition'));

    // Should show complete status indicator
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders step content based on current step', () => {
    render(
      <ProductDefinition
        projectData={mockProjectData}
        userProgress={mockUserProgress}
      />
    );

    // Default should show Vision & Mission
    expect(screen.getByText('Your Vision Statement')).toBeInTheDocument();

    // Navigate to Feature Prioritization
    fireEvent.click(screen.getByText('Feature Prioritization'));
    expect(screen.getByText('Prioritization Method')).toBeInTheDocument();

    // Navigate to Success Metrics
    fireEvent.click(screen.getByText('Success Metrics'));
    expect(screen.getByText('Key Performance Indicators (KPIs)')).toBeInTheDocument();
  });

  it('handles missing definition data gracefully', () => {
    const projectDataWithoutDefinition = {
      ...mockProjectData,
      data: {}
    };

    render(
      <ProductDefinition
        projectData={projectDataWithoutDefinition}
        userProgress={mockUserProgress}
      />
    );

    // Should render without errors and show empty form
    expect(screen.getByText('Product Definition Framework')).toBeInTheDocument();

    const visionTextarea = screen.getByPlaceholderText('Enter your product vision statement...');
    expect(visionTextarea).toHaveValue('');
  });
});
