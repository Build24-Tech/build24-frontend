import LaunchEssentialsDashboard from '@/app/launch-essentials/components/LaunchEssentialsDashboard';
import { AuthContext } from '@/contexts/AuthContext';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all the framework components
jest.mock('@/app/launch-essentials/components/ValidationFramework', () => {
  return function MockValidationFramework({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="validation-framework">
        <h2>Product Validation Framework</h2>
        <button onClick={() => onSave({ marketResearch: { completed: true } })}>
          Complete Validation
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/ProductDefinition', () => {
  return function MockProductDefinition({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="product-definition">
        <h2>Product Definition</h2>
        <button onClick={() => onSave({ vision: 'Test vision', mission: 'Test mission' })}>
          Complete Definition
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/TechnicalArchitecture', () => {
  return function MockTechnicalArchitecture({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="technical-architecture">
        <h2>Technical Architecture</h2>
        <button onClick={() => onSave({ stack: 'React/Node.js', infrastructure: 'AWS' })}>
          Complete Technical Planning
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/GoToMarketStrategy', () => {
  return function MockGoToMarketStrategy({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="go-to-market">
        <h2>Go-to-Market Strategy</h2>
        <button onClick={() => onSave({ pricing: '$99/month', channels: ['social', 'content'] })}>
          Complete Marketing Strategy
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/OperationalReadiness', () => {
  return function MockOperationalReadiness({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="operational-readiness">
        <h2>Operational Readiness</h2>
        <button onClick={() => onSave({ team: 'defined', processes: 'documented' })}>
          Complete Operations Planning
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/FinancialPlanning', () => {
  return function MockFinancialPlanning({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="financial-planning">
        <h2>Financial Planning</h2>
        <button onClick={() => onSave({ revenue: 100000, expenses: 80000 })}>
          Complete Financial Planning
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/RiskManagement', () => {
  return function MockRiskManagement({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="risk-management">
        <h2>Risk Management</h2>
        <button onClick={() => onSave({ risks: ['market', 'technical'], mitigation: 'planned' })}>
          Complete Risk Assessment
        </button>
      </div>
    );
  };
});

jest.mock('@/app/launch-essentials/components/PostLaunchOptimization', () => {
  return function MockPostLaunchOptimization({ onSave }: { onSave: (data: any) => void }) {
    return (
      <div data-testid="post-launch">
        <h2>Post-Launch Optimization</h2>
        <button onClick={() => onSave({ analytics: 'configured', feedback: 'collected' })}>
          Complete Optimization Planning
        </button>
      </div>
    );
  };
});

// Mock Firebase services
jest.mock('@/lib/launch-essentials-firestore', () => ({
  UserProgressService: {
    createUserProgress: jest.fn().mockResolvedValue({
      userId: 'test-user',
      projectId: 'test-project',
      currentPhase: 'validation',
      phases: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getUserProgress: jest.fn().mockResolvedValue({
      userId: 'test-user',
      projectId: 'test-project',
      currentPhase: 'validation',
      phases: {
        validation: { completionPercentage: 0, steps: [] },
        definition: { completionPercentage: 0, steps: [] },
        technical: { completionPercentage: 0, steps: [] },
        marketing: { completionPercentage: 0, steps: [] },
        operations: { completionPercentage: 0, steps: [] },
        financial: { completionPercentage: 0, steps: [] },
        risk: { completionPercentage: 0, steps: [] },
        optimization: { completionPercentage: 0, steps: [] }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    updateStepProgress: jest.fn().mockResolvedValue(undefined),
    subscribeToUserProgress: jest.fn().mockReturnValue(() => { })
  },
  ProjectDataService: {
    createProject: jest.fn().mockResolvedValue({
      id: 'test-project',
      userId: 'test-user',
      name: 'Test Project',
      description: 'E2E Test Project',
      industry: 'Technology',
      targetMarket: 'Developers',
      stage: 'concept',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getProject: jest.fn().mockResolvedValue({
      id: 'test-project',
      userId: 'test-user',
      name: 'Test Project',
      description: 'E2E Test Project',
      industry: 'Technology',
      targetMarket: 'Developers',
      stage: 'concept',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    updateProject: jest.fn().mockResolvedValue(undefined)
  },
  LaunchEssentialsUtils: {
    calculateOverallProgress: jest.fn().mockReturnValue(0),
    getNextRecommendedPhase: jest.fn().mockReturnValue('validation')
  }
}));

// Mock recommendation engine
jest.mock('@/lib/recommendation-engine', () => ({
  RecommendationEngine: {
    getNextSteps: jest.fn().mockReturnValue([
      {
        id: 'start-validation',
        title: 'Start Product Validation',
        description: 'Begin validating your product idea',
        priority: 'high',
        phase: 'validation'
      }
    ]),
    suggestResources: jest.fn().mockReturnValue([]),
    identifyRisks: jest.fn().mockReturnValue([])
  }
}));

const mockUser = {
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User'
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authValue = {
    user: mockUser,
    loading: false,
    signInWithGoogle: jest.fn(),
    signInWithGitHub: jest.fn(),
    signInWithApple: jest.fn(),
    signOut: jest.fn()
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Product Launch Journey', () => {
    it('should guide user through entire launch essentials workflow', async () => {
      const user = userEvent.setup();

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      // Phase 1: Product Validation
      expect(screen.getByTestId('validation-framework')).toBeInTheDocument();

      const completeValidationBtn = screen.getByText('Complete Validation');
      await user.click(completeValidationBtn);

      await waitFor(() => {
        expect(screen.getByText('Validation completed!')).toBeInTheDocument();
      });

      // Should automatically progress to next phase
      await waitFor(() => {
        expect(screen.getByTestId('product-definition')).toBeInTheDocument();
      });

      // Phase 2: Product Definition
      const completeDefinitionBtn = screen.getByText('Complete Definition');
      await user.click(completeDefinitionBtn);

      await waitFor(() => {
        expect(screen.getByText('Definition completed!')).toBeInTheDocument();
      });

      // Phase 3: Technical Architecture
      await waitFor(() => {
        expect(screen.getByTestId('technical-architecture')).toBeInTheDocument();
      });

      const completeTechnicalBtn = screen.getByText('Complete Technical Planning');
      await user.click(completeTechnicalBtn);

      // Phase 4: Go-to-Market Strategy
      await waitFor(() => {
        expect(screen.getByTestId('go-to-market')).toBeInTheDocument();
      });

      const completeMarketingBtn = screen.getByText('Complete Marketing Strategy');
      await user.click(completeMarketingBtn);

      // Phase 5: Operational Readiness
      await waitFor(() => {
        expect(screen.getByTestId('operational-readiness')).toBeInTheDocument();
      });

      const completeOperationsBtn = screen.getByText('Complete Operations Planning');
      await user.click(completeOperationsBtn);

      // Phase 6: Financial Planning
      await waitFor(() => {
        expect(screen.getByTestId('financial-planning')).toBeInTheDocument();
      });

      const completeFinancialBtn = screen.getByText('Complete Financial Planning');
      await user.click(completeFinancialBtn);

      // Phase 7: Risk Management
      await waitFor(() => {
        expect(screen.getByTestId('risk-management')).toBeInTheDocument();
      });

      const completeRiskBtn = screen.getByText('Complete Risk Assessment');
      await user.click(completeRiskBtn);

      // Phase 8: Post-Launch Optimization
      await waitFor(() => {
        expect(screen.getByTestId('post-launch')).toBeInTheDocument();
      });

      const completeOptimizationBtn = screen.getByText('Complete Optimization Planning');
      await user.click(completeOptimizationBtn);

      // Should show completion message
      await waitFor(() => {
        expect(screen.getByText('Congratulations! You have completed all launch essentials phases.')).toBeInTheDocument();
      });
    });

    it('should allow non-linear navigation between phases', async () => {
      const user = userEvent.setup();

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      // Should show phase navigation
      expect(screen.getByText('Validation')).toBeInTheDocument();
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();

      // Jump to financial planning phase
      const financialTab = screen.getByText('Financial');
      await user.click(financialTab);

      await waitFor(() => {
        expect(screen.getByTestId('financial-planning')).toBeInTheDocument();
      });

      // Jump back to validation
      const validationTab = screen.getByText('Validation');
      await user.click(validationTab);

      await waitFor(() => {
        expect(screen.getByTestId('validation-framework')).toBeInTheDocument();
      });
    });

    it('should persist progress across sessions', async () => {
      const user = userEvent.setup();

      // Mock existing progress
      const mockGetUserProgress = require('@/lib/launch-essentials-firestore').UserProgressService.getUserProgress;
      mockGetUserProgress.mockResolvedValue({
        userId: 'test-user',
        projectId: 'test-project',
        currentPhase: 'definition',
        phases: {
          validation: { completionPercentage: 100, steps: [] },
          definition: { completionPercentage: 50, steps: [] }
        }
      });

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      // Should resume from where user left off
      await waitFor(() => {
        expect(screen.getByTestId('product-definition')).toBeInTheDocument();
      });

      // Should show validation as completed
      expect(screen.getByText('✓ Validation')).toBeInTheDocument();

      // Should show definition as in progress
      expect(screen.getByText('50% Definition')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock network error
      const mockUpdateStepProgress = require('@/lib/launch-essentials-firestore').UserProgressService.updateStepProgress;
      mockUpdateStepProgress.mockRejectedValue(new Error('Network error'));

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validation-framework')).toBeInTheDocument();
      });

      const completeBtn = screen.getByText('Complete Validation');
      await user.click(completeBtn);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save progress. Please try again.')).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle offline scenarios', async () => {
      const user = userEvent.setup();

      // Mock offline scenario
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('You are currently offline')).toBeInTheDocument();
      });

      // Should still allow interaction but queue changes
      const completeBtn = screen.getByText('Complete Validation');
      await user.click(completeBtn);

      expect(screen.getByText('Changes saved locally. Will sync when online.')).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      const user = userEvent.setup();

      // Mock auth error
      const MockAuthProviderWithError = ({ children }: { children: React.ReactNode }) => {
        const authValue = {
          user: null,
          loading: false,
          signInWithGoogle: jest.fn(),
          signInWithGitHub: jest.fn(),
          signInWithApple: jest.fn(),
          signOut: jest.fn()
        };

        return (
          <AuthContext.Provider value={authValue}>
            {children}
          </AuthContext.Provider>
        );
      };

      render(
        <MockAuthProviderWithError>
          <LaunchEssentialsDashboard />
        </MockAuthProviderWithError>
      );

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
      });

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      // Tab through navigation
      await user.tab();
      expect(screen.getByText('Validation')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Definition')).toHaveFocus();

      // Enter to select
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('product-definition')).toBeInTheDocument();
      });
    });

    it('should provide proper ARIA labels and roles', async () => {
      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(8); // 8 phases

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should support screen readers', async () => {
      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      // Should have proper headings hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      // Should announce progress updates
      const progressRegion = screen.getByRole('region', { name: 'Progress updates' });
      expect(progressRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      // Should show mobile navigation
      expect(screen.getByRole('button', { name: 'Toggle navigation' })).toBeInTheDocument();

      // Phase content should be stacked vertically
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('mobile-layout');
    });

    it('should handle touch interactions', async () => {
      const user = userEvent.setup();

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validation-framework')).toBeInTheDocument();
      });

      // Should handle touch events
      const completeBtn = screen.getByText('Complete Validation');

      // Simulate touch
      await user.pointer({ keys: '[TouchA>]', target: completeBtn });
      await user.pointer({ keys: '[/TouchA]' });

      await waitFor(() => {
        expect(screen.getByText('Validation completed!')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during async operations', async () => {
      const user = userEvent.setup();

      // Mock slow async operation
      const mockUpdateStepProgress = require('@/lib/launch-essentials-firestore').UserProgressService.updateStepProgress;
      mockUpdateStepProgress.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validation-framework')).toBeInTheDocument();
      });

      const completeBtn = screen.getByText('Complete Validation');
      await user.click(completeBtn);

      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(completeBtn).toBeDisabled();
    });

    it('should handle large datasets efficiently', async () => {
      // Mock large project with lots of data
      const mockGetProject = require('@/lib/launch-essentials-firestore').ProjectDataService.getProject;
      mockGetProject.mockResolvedValue({
        id: 'large-project',
        data: {
          validation: { /* large validation data */ },
          definition: { /* large definition data */ },
          // ... more large data objects
        }
      });

      const startTime = performance.now();

      render(
        <MockAuthProvider>
          <LaunchEssentialsDashboard />
        </MockAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Launch Essentials Dashboard')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
