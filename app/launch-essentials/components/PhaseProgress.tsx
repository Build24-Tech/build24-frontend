'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LaunchPhase, UserProgress } from '@/types/launch-essentials';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  Target,
  TrendingUp
} from 'lucide-react';

interface PhaseProgressProps {
  userProgress: UserProgress;
  onPhaseClick: (phase: LaunchPhase) => void;
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

const phaseDescriptions: Record<LaunchPhase, string> = {
  validation: 'Validate your product idea with market research and user feedback',
  definition: 'Define your product vision, features, and success metrics',
  technical: 'Plan your technology stack, architecture, and infrastructure',
  marketing: 'Develop pricing strategy, marketing channels, and launch timeline',
  operations: 'Set up team structure, processes, and customer support',
  financial: 'Create financial projections and business model planning',
  risk: 'Identify and mitigate potential risks and challenges',
  optimization: 'Plan for post-launch analytics, feedback, and improvements'
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

const phaseOrder: LaunchPhase[] = [
  'validation',
  'definition',
  'technical',
  'marketing',
  'operations',
  'financial',
  'risk',
  'optimization'
];

export function PhaseProgress({ userProgress, onPhaseClick, className }: PhaseProgressProps) {
  const calculatePhaseCompletion = (phase: LaunchPhase): number => {
    const phaseProgress = userProgress.phases[phase];
    if (!phaseProgress || phaseProgress.steps.length === 0) return 0;

    const completedSteps = phaseProgress.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / phaseProgress.steps.length) * 100);
  };

  const getPhaseStatus = (phase: LaunchPhase): 'not-started' | 'in-progress' | 'completed' => {
    const completion = calculatePhaseCompletion(phase);
    if (completion === 0) return 'not-started';
    if (completion === 100) return 'completed';
    return 'in-progress';
  };

  const isPhaseAccessible = (phase: LaunchPhase): boolean => {
    const phaseIndex = phaseOrder.indexOf(phase);
    const currentPhaseIndex = phaseOrder.indexOf(userProgress.currentPhase);

    // Allow access to current phase and previous phases, plus one phase ahead
    return phaseIndex <= currentPhaseIndex + 1;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Phase Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phaseOrder.map((phase, index) => {
            const completion = calculatePhaseCompletion(phase);
            const status = getPhaseStatus(phase);
            const isAccessible = isPhaseAccessible(phase);
            const isCurrent = phase === userProgress.currentPhase;
            const phaseSteps = userProgress.phases[phase]?.steps || [];
            const completedSteps = phaseSteps.filter(s => s.status === 'completed').length;

            return (
              <div
                key={phase}
                className={cn(
                  'relative p-4 rounded-lg border transition-all duration-200',
                  isCurrent ? 'border-primary bg-primary/5' : 'border-gray-200',
                  isAccessible ? 'hover:shadow-sm cursor-pointer' : 'opacity-60 cursor-not-allowed'
                )}
                onClick={() => isAccessible && onPhaseClick(phase)}
              >
                {/* Phase indicator line */}
                {index < phaseOrder.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200" />
                )}

                <div className="flex items-start space-x-4">
                  {/* Phase icon/indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                        status === 'completed' ? 'bg-green-500' :
                          status === 'in-progress' ? phaseColors[phase] :
                            'bg-gray-300'
                      )}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : status === 'in-progress' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>

                  {/* Phase content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm">
                          {phaseLabels[phase]}
                        </h3>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {completion}%
                        </span>
                        {isAccessible && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {phaseDescriptions[phase]}
                    </p>

                    <div className="space-y-2">
                      <Progress value={completion} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {completedSteps} of {phaseSteps.length} steps completed
                        </span>
                        {status === 'not-started' && isAccessible && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPhaseClick(phase);
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {status === 'in-progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPhaseClick(phase);
                            }}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
