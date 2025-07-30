'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProjectDataService, UserProgressService } from '@/lib/launch-essentials-firestore';
import { ProjectData, UserProgress, ProductDefinitionData } from '@/types/launch-essentials';
import { AlertCircle, CheckCircle, Save, Target, Lightbulb, Star, BarChart3 } from 'lucide-react';
import t, useState } from 'react';
import { VisionMission } from './definition/VisionMission';
import { ValueProposition } from './definition/ValueProposition';
import { FeaturePrioritization } from './definition/FeaturePrioritization';
import { MetricsDefinition } from './definition/MetricsDefinition';

interface ProductDefinitionProps {
  projectData: ProjectData;
  userProgress: UserProgress;
  onProgressUpdate?: (progress: UserProgress) => void;
}

type DefinitionStep =
  | 'vision-mission'
  | 'value-proposition'
  | 'feature-prioritization'
  | 'metrics-definition';

interface DefinitionStepConfig {
  id: DefinitionStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}

const DEFINITION_STEPS: DefinitionStepConfig[] = [
  {
    id: 'vision-mission',
    title: 'Vision & Mission',
    description: 'Define your product vision and align with mission',
    icon: Target,
    required: true
  },
  {
    id: 'value-proposition',
    title: 'Value Proposition',
    description: 'Create compelling value proposition using proven frameworks',
    icon: Lightbulb,
    required: true
  },
  {
    id: 'feature-prioritization',
    title: 'Feature Prioritization',
    description: 'Prioritize features using MoSCoW and Kano methodologies',
    icon: Star,
    required: true
  },
  {
    id: 'metrics-definition',
    title: 'Success Metrics',
    description: 'Define KPIs and success criteria for measurement',
    icon: BarChart3,
    required: true
  }
];

export function ProductDefinition({
  projectData,
  userProgress,
  onProgressUpdate
}: ProductDefinitionProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<DefinitionStep>('vision-mission');
  const [definitionData, setDefinitionData] = useState<ProductDefinitionData>(() => {
    return projectData.data.definition || {
      vision: {
        statement: '',
        missionAlignment: ''
      },
      valueProposition: {
        canvas: {
          customerJobs: [],
          painPoints: [],
          gainCreators: [],
          painRelievers: [],
          productsServices: []
        },
        uniqueValue: ''
      },
      features: {
        coreFeatures: [],
        prioritization: {
          method: 'moscow',
          results: []
        }
      },
      metrics: {
        kpis: [],
        successCriteria: []
      }
    };
  });
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load existing definition data if available
    if (projectData.data.definition) {
      setDefinitionData(projectData.data.definition);
    }
  }, [projectData]);

  const handleDataChange = (stepData: Partial<ProductDefinitionData>) => {
    setDefinitionData(prev => ({ ...prev, ...stepData }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update project data with definition data
      await ProjectDataService.updateProjectPhaseData(
        projectData.id,
        'definition',
        definitionData
      );

      // Update step progress
      await UserProgressService.updateStepProgress(
        user.uid,
        projectData.id,
        'definition',
        currentStep,
        'completed',
        definitionData
      );

      setHasUnsavedChanges(false);

      toast({
        title: 'Progress Saved',
        description: 'Your product definition progress has been saved successfully.',
      });

      // Refresh progress if callback provided
      if (onProgressUpdate) {
        const updatedProgress = await UserProgressService.getUserProgress(user.uid, projectData.id);
        if (updatedProgress) {
          onProgressUpdate(updatedProgress);
        }
      }

    } catch (error) {
      console.error('Error saving definition data:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStepStatus = (stepId: DefinitionStep): 'completed' | 'in-progress' | 'not-started' => {
    const definitionPhase = userProgress.phases.definition;
    const step = definitionPhase.steps.find(s => s.stepId === stepId);

    if (step?.status === 'completed') return 'completed';
    if (stepId === currentStep) return 'in-progress';
    return 'not-started';
  };

  const isStepComplete = (stepId: DefinitionStep): boolean => {
    switch (stepId) {
      case 'vision-mission':
        return definitionData.vision.statement.length > 0 &&
          definitionData.vision.missionAlignment.length > 0;
      case 'value-proposition':
        return definitionData.valueProposition.canvas.customerJobs.length > 0 &&
          definitionData.valueProposition.canvas.painPoints.length > 0 &&
          definitionData.valueProposition.uniqueValue.length > 0;
      case 'feature-prioritization':
        return definitionData.features.coreFeatures.length > 0 &&
          definitionData.features.prioritization.results.length > 0;
      case 'metrics-definition':
        return definitionData.metrics.kpis.length > 0 &&
          definitionData.metrics.successCriteria.length > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'vision-mission':
        return (
          <VisionMission
            data={definitionData.vision}
            onChange={(vision) => handleDataChange({ vision })}
          />
        );
      case 'value-proposition':
        return (
          <ValueProposition
            data={definitionData.valueProposition}
            onChange={(valueProposition) => handleDataChange({ valueProposition })}
          />
        );
      case 'feature-prioritization':
        return (
          <FeaturePrioritization
            data={definitionData.features}
            onChange={(features) => handleDataChange({ features })}
          />
        );
      case 'metrics-definition':
        return (
          <MetricsDefinition
            data={definitionData.metrics}
            onChange={(metrics) => handleDataChange({ metrics })}
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
            Product Definition Framework
          </h1>
          <p className="text-gray-600 mt-1">
            Define what you're building and why it matters
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
              <CardTitle className="text-lg">Definition Steps</CardTitle>
              <CardDescription>
                Complete each step to define your product clearly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEFINITION_STEPS.map((step) => {
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
                    {DEFINITION_STEPS.find(s => s.id === currentStep)?.title}
                  </CardTitle>
                  <CardDescription>
                    {DEFINITION_STEPS.find(s => s.id === currentStep)?.description}
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
