'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

interface NextStepsPanelProps {
  userProgress: UserProgress;
  projectData: ProjectData;
  onStepClick: (stepId: string) => void;
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

export function NextStepsPanel({
  userProgress,
  projectData,
  onStepClick,
  className
}: NextStepsPanelProps) {
  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    const phases = Object.values(userProgress.phases);
    if (phases.length === 0) return 0;

    const totalSteps = phases.reduce((sum, phase) => sum + phase.steps.length, 0);
    const completedSteps = phases.reduce(
      (sum, phase) => sum + phase.steps.filter(step => step.status === 'completed').length,
      0
    );

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  // Get next incomplete steps across all phases
  const getNextSteps = () => {
    const nextSteps: Array<{
      stepId: string;
      phase: LaunchPhase;
      status: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Current phase steps first
    const currentPhase = userProgress.phases[userProgress.currentPhase];
    if (currentPhase) {
      const incompleteSteps = currentPhase.steps.filter(
        step => step.status === 'not_started' || step.status === 'in_progress'
      );

      incompleteSteps.slice(0, 2).forEach(step => {
        nextSteps.push({
          stepId: step.stepId,
          phase: userProgress.currentPhase,
          status: step.status,
          priority: 'high'
        });
      });
    }

    // Add steps from other phases if we need more
    if (nextSteps.length < 3) {
      const phaseOrder: LaunchPhase[] = [
        'validation', 'definition', 'technical', 'marketing',
        'operations', 'financial', 'risk', 'optimization'
      ];

      for (const phase of phaseOrder) {
        if (phase === userProgress.currentPhase) continue;

        const phaseProgress = userProgress.phases[phase];
        if (phaseProgress) {
          const incompleteSteps = phaseProgress.steps.filter(
            step => step.status === 'not_started' || step.status === 'in_progress'
          );

          incompleteSteps.slice(0, 3 - nextSteps.length).forEach(step => {
            nextSteps.push({
              stepId: step.stepId,
              phase,
              status: step.status,
              priority: 'medium'
            });
          });

          if (nextSteps.length >= 3) break;
        }
      }
    }

    return nextSteps;
  };

  // Generate recommendations based on progress
  const getRecommendations = () => {
    const overallProgress = calculateOverallProgress();
    const recommendations: Array<{
      type: 'warning' | 'suggestion' | 'achievement';
      title: string;
      description: string;
      action?: string;
    }> = [];

    // Progress-based recommendations
    if (overallProgress < 25) {
      recommendations.push({
        type: 'suggestion',
        title: 'Focus on Validation',
        description: 'Complete market validation before moving to other phases',
        action: 'Start validation framework'
      });
    } else if (overallProgress < 50) {
      recommendations.push({
        type: 'suggestion',
        title: 'Define Your Product',
        description: 'Clearly define your product vision and core features',
        action: 'Continue product definition'
      });
    } else if (overallProgress < 75) {
      recommendations.push({
        type: 'suggestion',
        title: 'Plan Your Launch',
        description: 'Start planning your go-to-market strategy and operations',
        action: 'Begin marketing planning'
      });
    } else {
      recommendations.push({
        type: 'achievement',
        title: 'Almost Ready!',
        description: 'You\'re close to launch. Review all phases for completeness',
        action: 'Final review'
      });
    }

    // Phase-specific warnings
    const validationCompletion = userProgress.phases.validation?.completionPercentage || 0;
    if (validationCompletion < 80 && userProgress.currentPhase !== 'validation') {
      recommendations.push({
        type: 'warning',
        title: 'Validation Incomplete',
        description: 'Low market validation may lead to product-market fit issues',
        action: 'Complete validation'
      });
    }

    return recommendations.slice(0, 2); // Limit to 2 recommendations
  };

  const nextSteps = getNextSteps();
  const recommendations = getRecommendations();
  const overallProgress = calculateOverallProgress();

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Next Steps & Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Immediate Next Steps
          </h3>

          {nextSteps.length > 0 ? (
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div
                  key={`${step.phase}-${step.stepId}`}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onStepClick(step.stepId)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white',
                      step.priority === 'high' ? 'bg-red-500' :
                        step.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                    )}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {step.stepId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {phaseLabels[step.phase]}
                      </Badge>
                      {step.status === 'in_progress' && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Continue working on this step in the {phaseLabels[step.phase].toLowerCase()} phase
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">All Steps Complete!</p>
              <p className="text-xs text-muted-foreground">
                Great job! You've completed all current steps.
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
            </h3>

            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border-l-4',
                    rec.type === 'warning' ? 'bg-red-50 border-l-red-500' :
                      rec.type === 'achievement' ? 'bg-green-50 border-l-green-500' :
                        'bg-blue-50 border-l-blue-500'
                  )}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {rec.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : rec.type === 'achievement' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <h4 className="text-sm font-medium mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      {rec.action && (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          {rec.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
