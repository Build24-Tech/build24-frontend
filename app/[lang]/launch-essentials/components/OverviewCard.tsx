'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface ProgressCalculation {
  phaseCompletion: Record<LaunchPhase, number>;
  overallCompletion: number;
  completedSteps: number;
  totalSteps: number;
  nextStep: any;
  nextPhase: LaunchPhase | null;
}

interface OverviewCardProps {
  title: string;
  progress: ProgressCalculation;
  userProgress: UserProgress;
  projectData: ProjectData;
  variant?: 'default' | 'current-phase' | 'next-steps';
  className?: string;
}

const phaseLabels: Record<LaunchPhase, string> = {
  validation: 'Product Validation',
  definition: 'Product Definition',
  technical: 'Technical Architecture',
  marketing: 'Go-to-Market Strategy',
  operations: 'Operational Readiness',
  financial: 'Financial Planning',
  risk: 'Risk Management',
  optimization: 'Post-Launch Optimization'
};

const phaseColors: Record<LaunchPhase, string> = {
  validation: 'bg-blue-500',
  definition: 'bg-green-500',
  technical: 'bg-purple-500',
  marketing: 'bg-orange-500',
  operations: 'bg-teal-500',
  financial: 'bg-yellow-500',
  risk: 'bg-red-500',
  optimization: 'bg-indigo-500'
};

export function OverviewCard({
  title,
  progress,
  userProgress,
  projectData,
  variant = 'default',
  className
}: OverviewCardProps) {
  const renderDefaultCard = () => (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {progress.overallCompletion}%
            </span>
            <Badge variant={progress.overallCompletion > 75 ? 'default' : 'secondary'}>
              {progress.completedSteps} of {progress.totalSteps} steps
            </Badge>
          </div>
          <Progress value={progress.overallCompletion} className="h-2" />
          <div className="flex items-center text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            {Object.values(progress.phaseCompletion).filter(p => p === 100).length} of 8 phases complete
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentPhaseCard = () => {
    const currentPhase = userProgress.currentPhase;
    const currentPhaseCompletion = progress.phaseCompletion[currentPhase] || 0;
    const currentPhaseSteps = userProgress.phases[currentPhase]?.steps || [];
    const completedStepsInPhase = currentPhaseSteps.filter(s => s.status === 'completed').length;

    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={cn('w-3 h-3 rounded-full', phaseColors[currentPhase])} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">
                {phaseLabels[currentPhase]}
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedStepsInPhase} of {currentPhaseSteps.length} steps completed
              </p>
            </div>
            <Progress value={currentPhaseCompletion} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {currentPhaseCompletion}% complete
              </span>
              {currentPhaseCompletion === 100 ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNextStepsCard = () => {
    const nextStep = progress.nextStep;
    const nextPhase = progress.nextPhase;
    const hasNextStep = nextStep !== null;
    const hasNextPhase = nextPhase !== null && nextPhase !== userProgress.currentPhase;

    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hasNextStep ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Next Step</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Complete: {nextStep.stepId.replace(/-/g, ' ')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">All Steps Complete!</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Great job! You've completed all current steps.
                </p>
              </div>
            )}

            {hasNextPhase && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <div className={cn('w-3 h-3 rounded-full', phaseColors[nextPhase])} />
                  <span className="font-medium text-sm">Recommended Phase</span>
                </div>
                <p className="text-sm text-muted-foreground pl-5">
                  {phaseLabels[nextPhase]}
                </p>
              </div>
            )}

            {progress.overallCompletion < 25 && (
              <div className="flex items-start space-x-2 pt-2 border-t">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700">
                    Focus on Validation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete market validation before moving forward
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (variant) {
    case 'current-phase':
      return renderCurrentPhaseCard();
    case 'next-steps':
      return renderNextStepsCard();
    default:
      return renderDefaultCard();
  }
}
