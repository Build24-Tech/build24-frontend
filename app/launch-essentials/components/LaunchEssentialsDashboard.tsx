'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService } from '@/lib/launch-essentials-firestore';
import { progressTracker } from '@/lib/progress-tracker';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your product launch dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Launch Essentials</CardTitle>
            <CardDescription>
              Get started by creating your first product launch project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateProject} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        <NetworkStatus isOnline={isOnline} />

        <LoadingOverlay isLoading={isLoading} text="Updating dashboard...">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {projectData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {projectData.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => retry(loadUserData)}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                Project Settings
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProject}
                disabled={isLoading || !isOnline}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load overview</p></Card>}>
              <OverviewCard
                title="Overall Progress"
                progress={progressTracker.calculateProgress(userProgress)}
                userProgress={userProgress}
                projectData={projectData}
              />
            </ErrorBoundary>
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load current phase</p></Card>}>
              <OverviewCard
                title="Current Phase"
                progress={progressTracker.calculateProgress(userProgress)}
                userProgress={userProgress}
                projectData={projectData}
                variant="current-phase"
              />
            </ErrorBoundary>
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load next steps</p></Card>}>
              <OverviewCard
                title="Next Steps"
                progress={progressTracker.calculateProgress(userProgress)}
                userProgress={userProgress}
                projectData={projectData}
                variant="next-steps"
              />
            </ErrorBoundary>
          </div>

          {/* Phase Progress Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load phase progress</p></Card>}>
              <PhaseProgress
                userProgress={userProgress}
                onPhaseClick={handlePhaseClick}
              />
            </ErrorBoundary>
            <ErrorBoundary fallback={<Card className="p-4"><p>Failed to load next steps panel</p></Card>}>
              <NextStepsPanel
                userProgress={userProgress}
                projectData={projectData}
                onStepClick={(stepId) => {
                  console.log('Navigate to step:', stepId);
                  // TODO: Implement navigation to specific step
                }}
              />
            </ErrorBoundary>
          </div>
        </LoadingOverlay>
      </div>
    </ErrorBoundary>
  );
}
