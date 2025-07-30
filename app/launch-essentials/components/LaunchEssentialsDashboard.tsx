'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService } from '@/lib/launch-essentials-firestore';
import { progressTracker } from '@/lib/progress-tracker';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import { Loader2, Plus } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's projects
      const projects = await ProjectDataService.getUserProjects(user.uid);

      if (projects.length === 0) {
        // No projects yet - show empty state
        setUserProgress(null);
        setProjectData(null);
      } else {
        // Use the first project for now (in future, allow project selection)
        const project = projects[0];
        setProjectData(project);

        // Get progress for this project
        const progress = await progressTracker.getProgress(user.uid, project.id);
        setUserProgress(progress);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load your progress. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) return;

    try {
      // Create a new project
      const newProject = await ProjectDataService.createProject(
        user.uid,
        'My Product Launch',
        'A new product launch project'
      );

      // Initialize progress for the new project
      const progress = await progressTracker.initializeProgress(
        user.uid,
        newProject.id,
        'validation'
      );

      setProjectData(newProject);
      setUserProgress(progress);

      toast({
        title: 'Project Created',
        description: 'Your new product launch project has been created!',
      });
    } catch (err) {
      console.error('Error creating project:', err);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadUserData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
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
    <div className={`space-y-6 ${className}`}>
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
          <Button variant="outline" size="sm">
            Project Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <OverviewCard
          title="Overall Progress"
          progress={progressTracker.calculateProgress(userProgress)}
          userProgress={userProgress}
          projectData={projectData}
        />
        <OverviewCard
          title="Current Phase"
          progress={progressTracker.calculateProgress(userProgress)}
          userProgress={userProgress}
          projectData={projectData}
          variant="current-phase"
        />
        <OverviewCard
          title="Next Steps"
          progress={progressTracker.calculateProgress(userProgress)}
          userProgress={userProgress}
          projectData={projectData}
          variant="next-steps"
        />
      </div>

      {/* Phase Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseProgress
          userProgress={userProgress}
          onPhaseClick={handlePhaseClick}
        />
        <NextStepsPanel
          userProgress={userProgress}
          projectData={projectData}
          onStepClick={(stepId) => {
            console.log('Navigate to step:', stepId);
            // TODO: Implement navigation to specific step
          }}
        />
      </div>
    </div>
  );
}
