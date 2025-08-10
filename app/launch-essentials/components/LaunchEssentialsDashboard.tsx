'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService } from '@/lib/launch-essentials-firestore';
import { progressTracker } from '@/lib/progress-tracker';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorDisplay } from './ErrorDisplay';
import { NextStepsPanel } from './NextStepsPanel';
import { OverviewCard } from './OverviewCard';
import { PhaseProgress } from './PhaseProgress';

interface LaunchEssentialsDashboardProps {
  className?: string;
}

export function LaunchEssentialsDashboard({ className }: LaunchEssentialsDashboardProps) {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  // Mobile optimization hooks
  const deviceInfo = useDeviceInfo();
  const performance = usePerformanceOptimization();
  const complexity = getAdaptiveComplexity(deviceInfo);

  const {
    executeWithErrorHandling,
    isLoading,
    error,
    clearError,
    isOnline,
    retry,
    canRetry,
    createPersistenceError,
    createNetworkError,
  } = useErrorHandling({
    onError: (error, errorId) => {
      console.error('Dashboard error:', error, errorId);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Data loaded successfully',
      });
    },
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    const result = await executeWithErrorHandling(async () => {
      // Check network connectivity
      if (!isOnline) {
        throw createNetworkError('You are currently offline. Please check your connection.', 0, false);
      }

      // Get user's projects
      const projects = await ProjectDataService.getUserProjects(user.uid);

      if (projects.length === 0) {
        // No projects yet - show empty state
        setUserProgress(null);
        setProjectData(null);
        return { projects: [], project: null, progress: null };
      } else {
        // Use the first project for now (in future, allow project selection)
        const project = projects[0];
        setProjectData(project);

        // Get progress for this project
        const progress = await progressTracker.getProgress(user.uid, project.id);
        setUserProgress(progress);

        return { projects, project, progress };
      }
    }, {
      userId: user.uid,
      operation: 'load_user_data',
    });

    return result;
  };

  const handleCreateProject = async () => {
    if (!user) return;

    const result = await executeWithErrorHandling(async () => {
      // Check network connectivity
      if (!isOnline) {
        throw createNetworkError('Cannot create project while offline. Please check your connection.', 0, false);
      }

      // Create a new project
      const newProject = await ProjectDataService.createProject({
        userId: user.uid,
        name: 'My Product Launch',
        description: 'A new product launch project',
        industry: 'Technology',
        targetMarket: 'Global',
        stage: 'concept',
        data: {},
      });

      // Initialize progress for the new project
      const progress = await progressTracker.initializeProgress(
        user.uid,
        newProject.id,
        'validation'
      );

      setProjectData(newProject);
      setUserProgress(progress);

      return { project: newProject, progress };
    }, {
      userId: user.uid,
      operation: 'create_project',
    });

    if (result) {
      toast({
        title: 'Project Created',
        description: 'Your new product launch project has been created!',
      });
    }
  };

  const handlePhaseClick = (phase: LaunchPhase) => {
    // Navigate to specific phase (implement routing logic)
    console.log('Navigate to phase:', phase);
    // TODO: Implement navigation to specific phase
  };

  if (!user) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="main"
        aria-label="Authentication required"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle id="auth-title">Sign In Required</CardTitle>
            <CardDescription id="auth-description">
              Please sign in to access your product launch dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="main"
        aria-live="polite"
        aria-label="Loading dashboard"
      >
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="main"
        aria-live="assertive"
        aria-label="Error occurred"
      >
        <div className="w-full max-w-lg">
          <ErrorDisplay
            error={error}
            onRetry={canRetry ? () => retry(loadUserData) : undefined}
            onDismiss={clearError}
          />
        </div>
      </div>
    );
  }

  if (!projectData || !userProgress) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="main"
        aria-label="Welcome to Launch Essentials"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle id="welcome-title">Welcome to Launch Essentials</CardTitle>
            <CardDescription id="welcome-description">
              Get started by creating your first product launch project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateProject}
              className="w-full"
              aria-describedby="welcome-description"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Touch gestures for mobile navigation
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (deviceInfo.isMobile) {
        // Navigate to next phase or section
        console.log('Swipe left - next section');
      }
    },
    onSwipeRight: () => {
      if (deviceInfo.isMobile) {
        // Navigate to previous phase or section
        console.log('Swipe right - previous section');
      }
    },
  });

  return (
    <ErrorBoundary>
      <div
        className={`${getResponsiveSpacing(deviceInfo, 'md')} space-y-4 md:space-y-6 ${className}`}
        {...(deviceInfo.touchSupported ? touchGestures : {})}
        role="main"
        aria-label="Product Launch Dashboard"
        id="main-content"
      >
        {/* Offline indicator for mobile */}
        {deviceInfo.isMobile && isOffline && (
          <div
            className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-sm text-amber-800"
            role="alert"
            aria-live="polite"
          >
            You're currently offline. Some features may be limited.
          </div>
        )}

        <LoadingStates.LoadingOverlay isLoading={isLoading} text="Updating dashboard...">
          {/* Header - Mobile optimized */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1
                className={`${getResponsiveTextSize(deviceInfo, '2xl')} font-bold text-gray-900 truncate`}
                id="project-title"
              >
                {projectData.name}
              </h1>
              <p
                className={`${getResponsiveTextSize(deviceInfo, 'sm')} text-gray-600 mt-1 ${deviceInfo.isMobile ? 'line-clamp-2' : ''}`}
                id="project-description"
              >
                {projectData.description}
              </p>
            </div>

            {/* Action buttons - Responsive layout */}
            <nav
              className={`flex ${deviceInfo.isMobile ? 'flex-col gap-2' : 'items-center space-x-2'}`}
              aria-label="Dashboard actions"
            >
              {!deviceInfo.isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retry(loadUserData)}
                  disabled={isLoading}
                  aria-label="Refresh dashboard data"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Refresh
                </Button>
              )}

              {complexity !== 'simple' && (
                <Button
                  variant="outline"
                  size={deviceInfo.isMobile ? 'default' : 'sm'}
                  aria-label="Open project settings"
                >
                  Project Settings
                </Button>
              )}

              <Button
                size={deviceInfo.isMobile ? 'default' : 'sm'}
                onClick={handleCreateProject}
                disabled={isLoading || !isOnline}
                className="w-full sm:w-auto"
                aria-label="Create a new product launch project"
                aria-describedby={!isOnline ? 'offline-warning' : undefined}
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                {deviceInfo.isMobile ? 'New Project' : 'New'}
              </Button>
            </nav>
          </header>

          {/* Overview Cards - Responsive grid */}
          <section
            className={`grid ${getResponsiveGridCols(deviceInfo, { mobile: 1, tablet: 2, desktop: 3 })} gap-4 md:gap-6`}
            aria-label="Project overview"
          >
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load overview</p></Card>}>
              <OverviewCard
                title="Overall Progress"
                progress={progressTracker.calculateProgress(userProgress)}
                userProgress={userProgress}
                projectData={projectData}
                deviceInfo={deviceInfo}
              />
            </ErrorBoundary>

            {complexity !== 'simple' && (
              <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load current phase</p></Card>}>
                <OverviewCard
                  title="Current Phase"
                  progress={progressTracker.calculateProgress(userProgress)}
                  userProgress={userProgress}
                  projectData={projectData}
                  variant="current-phase"
                  deviceInfo={deviceInfo}
                />
              </ErrorBoundary>
            )}

            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load next steps</p></Card>}>
              <OverviewCard
                title="Next Steps"
                progress={progressTracker.calculateProgress(userProgress)}
                userProgress={userProgress}
                projectData={projectData}
                variant="next-steps"
                deviceInfo={deviceInfo}
              />
            </ErrorBoundary>
          </section>

          {/* Phase Progress Grid - Responsive layout */}
          <section
            className={`grid ${deviceInfo.isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}
            aria-label="Phase progress and next steps"
          >
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load phase progress</p></Card>}>
              <PhaseProgress
                userProgress={userProgress}
                onPhaseClick={handlePhaseClick}
                deviceInfo={deviceInfo}
                complexity={complexity}
              />
            </ErrorBoundary>

            {complexity !== 'simple' && (
              <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load next steps panel</p></Card>}>
                <NextStepsPanel
                  userProgress={userProgress}
                  projectData={projectData}
                  onStepClick={(stepId) => {
                    console.log('Navigate to step:', stepId);
                    // TODO: Implement navigation to specific step
                  }}
                  deviceInfo={deviceInfo}
                />
              </ErrorBoundary>
            )}
          </section>

          {/* Mobile-specific quick actions */}
          {deviceInfo.isMobile && (
            <div className="fixed bottom-4 right-4 z-50">
              <Button
                size="sm"
                variant="outline"
                onClick={() => retry(loadUserData)}
                disabled={isLoading}
                className="rounded-full shadow-lg bg-white"
                aria-label="Refresh dashboard data"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          )}
        </LoadingStates.LoadingOverlay>
      </div>
    </ErrorBoundary>
  );
}
