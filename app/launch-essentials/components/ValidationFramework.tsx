'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService, UserProgressService } from '@/lib/launch-essentials-firestore';
import { ProjectData, UserProgress, ValidationData } from '@/types/launch-essentials';
import { AlertCircle, CheckCircle, Save, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompetitorAnalysis } from './validation/CompetitorAnalysis';
import { InterviewGuide } from './validation/InterviewGuide';
import { MarketResearch } from './validation/MarketResearch';
import { TargetAudienceValidation } from './validation/TargetAudienceValidation';
import { ValidationReport } from './validation/ValidationReport';

interface ValidationFrameworkProps {
  projectData: ProjectData;
  userProgress: UserProgress;
  onProgressUpdate?: (progress: UserProgress) => void;
}

type ValidationStep =
  | 'market-research'
  | 'competitor-analysis'
  | 'target-audience'
  | 'interview-guide'
  | 'validation-report';

interface ValidationStepConfig {
  id: ValidationStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}

const VALIDATION_STEPS: ValidationStepConfig[] = [
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Analyze market size, growth trends, and opportunities',
    icon: TrendingUp,
    required: true
  },
  {
    id: 'competitor-analysis',
    title: 'Competitor Analysis',
    description: 'Identify and analyze direct and indirect competitors',
    icon: Users,
    required: true
  },
  {
    id: 'target-audience',
    title: 'Target Audience',
    description: 'Define user personas and validate target segments',
    icon: Users,
    required: true
  },
  {
    id: 'interview-guide',
    title: 'User Interviews',
    description: 'Conduct structured interviews with potential users',
    icon: Users,
    required: false
  },
  {
    id: 'validation-report',
    title: 'Validation Report',
    description: 'Generate go/no-go recommendation based on findings',
    icon: CheckCircle,
    required: true
  }
];

export function ValidationFramework({
  projectData,
  userProgress,
  onProgressUpdate
}: ValidationFrameworkProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<ValidationStep>('market-research');
  const [validationData, setValidationData] = useState<ValidationData>(() => {
    return projectData.data.validation || {
      marketResearch: {
        marketSize: 0,
        growthRate: 0,
        trends: [],
        sources: []
      },
      competitorAnalysis: {
        competitors: [],
        competitiveAdvantage: '',
        marketGap: ''
      },
      targetAudience: {
        personas: [],
        interviewResults: [],
        validationScore: 0
      },
      validationReport: {
        recommendation: 'go',
        reasoning: '',
        nextSteps: []
      }
    };
  });
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load existing validation data if available
    if (projectData.data.validation) {
      setValidationData(projectData.data.validation);
    }
  }, [projectData]);

  const handleDataChange = (stepData: Partial<ValidationData>) => {
    setValidationData(prev => ({ ...prev, ...stepData }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update project data with validation data
      await ProjectDataService.updateProjectPhaseData(
        projectData.id,
        'validation',
        validationData
      );

      // Update step progress
      await UserProgressService.updateStepProgress(
        user.uid,
        projectData.id,
        'validation',
        currentStep,
        'completed',
        validationData
      );

      setHasUnsavedChanges(false);

      toast({
        title: 'Progress Saved',
        description: 'Your validation progress has been saved successfully.',
      });

      // Refresh progress if callback provided
      if (onProgressUpdate) {
        const updatedProgress = await UserProgressService.getUserProgress(user.uid, projectData.id);
        if (updatedProgress) {
          onProgressUpdate(updatedProgress);
        }
      }

    } catch (error) {
      console.error('Error saving validation data:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStepStatus = (stepId: ValidationStep): 'completed' | 'in-progress' | 'not-started' => {
    const validationPhase = userProgress.phases.validation;
    const step = validationPhase.steps.find(s => s.stepId === stepId);

    if (step?.status === 'completed') return 'completed';
    if (stepId === currentStep) return 'in-progress';
    return 'not-started';
  };

  const isStepComplete = (stepId: ValidationStep): boolean => {
    switch (stepId) {
      case 'market-research':
        return validationData.marketResearch.marketSize > 0 &&
          validationData.marketResearch.trends.length > 0;
      case 'competitor-analysis':
        return validationData.competitorAnalysis.competitors.length > 0 &&
          validationData.competitorAnalysis.competitiveAdvantage.length > 0;
      case 'target-audience':
        return validationData.targetAudience.personas.length > 0;
      case 'interview-guide':
        return validationData.targetAudience.interviewResults.length > 0;
      case 'validation-report':
        return validationData.validationReport.reasoning.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'market-research':
        return (
          <MarketResearch
            data={validationData.marketResearch}
            onChange={(marketResearch) => handleDataChange({ marketResearch })}
          />
        );
      case 'competitor-analysis':
        return (
          <CompetitorAnalysis
            data={validationData.competitorAnalysis}
            onChange={(competitorAnalysis) => handleDataChange({ competitorAnalysis })}
          />
        );
      case 'target-audience':
        return (
          <TargetAudienceValidation
            data={validationData.targetAudience}
            onChange={(targetAudience) => handleDataChange({ targetAudience })}
          />
        );
      case 'interview-guide':
        return (
          <InterviewGuide
            personas={validationData.targetAudience.personas}
            interviewResults={validationData.targetAudience.interviewResults}
            onChange={(interviewResults) =>
              handleDataChange({
                targetAudience: {
                  ...validationData.targetAudience,
                  interviewResults
                }
              })
            }
          />
        );
      case 'validation-report':
        return (
          <ValidationReport
            validationData={validationData}
            onChange={(validationReport) => handleDataChange({ validationReport })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Validation Framework
          </h1>
          <p className="text-gray-600 mt-1">
            Validate your product idea before investing in development
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Steps</CardTitle>
              <CardDescription>
                Complete each step to validate your product idea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {VALIDATION_STEPS.map((step) => {
                const status = getStepStatus(step.id);
                const isComplete = isStepComplete(step.id);
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${currentStep === step.id
                        ? 'border-yellow-500 bg-yellow-50'
                        : status === 'completed' || isComplete
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-1 rounded ${status === 'completed' || isComplete
                          ? 'bg-green-100 text-green-600'
                          : currentStep === step.id
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                        {status === 'completed' || isComplete ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${currentStep === step.id ? 'text-yellow-900' : 'text-gray-900'
                            }`}>
                            {step.title}
                          </p>
                          {step.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${currentStep === step.id ? 'text-yellow-700' : 'text-gray-500'
                          }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {VALIDATION_STEPS.find(s => s.id === currentStep)?.title}
                  </CardTitle>
                  <CardDescription>
                    {VALIDATION_STEPS.find(s => s.id === currentStep)?.description}
                  </CardDescription>
                </div>
                {isStepComplete(currentStep) && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
