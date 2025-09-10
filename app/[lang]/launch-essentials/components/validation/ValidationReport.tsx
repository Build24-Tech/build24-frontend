'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidationData } from '@/types/launch-essentials';
import { AlertTriangle, CheckCircle, FileText, Plus, RotateCcw, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ValidationReportProps {
  validationData: ValidationData;
  onChange: (report: ValidationData['validationReport']) => void;
}

interface ValidationMetrics {
  marketScore: number;
  competitorScore: number;
  audienceScore: number;
  interviewScore: number;
  overallScore: number;
}

const RECOMMENDATION_CRITERIA = {
  go: {
    threshold: 75,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    title: 'GO - Proceed with Development',
    description: 'Strong validation signals support moving forward'
  },
  'no-go': {
    threshold: 40,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: X,
    title: 'NO-GO - Do Not Proceed',
    description: 'Insufficient validation, high risk of failure'
  },
  pivot: {
    threshold: 60,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: RotateCcw,
    title: 'PIVOT - Modify Approach',
    description: 'Some validation but significant concerns require changes'
  }
};

const NEXT_STEPS_TEMPLATES = {
  go: [
    'Begin MVP development with validated features',
    'Set up development team and infrastructure',
    'Create detailed product roadmap',
    'Establish key performance metrics',
    'Plan beta testing program'
  ],
  'no-go': [
    'Conduct additional market research',
    'Explore alternative problem spaces',
    'Consider different target markets',
    'Reassess business model viability',
    'Gather more user feedback'
  ],
  pivot: [
    'Refine value proposition based on feedback',
    'Adjust target audience focus',
    'Modify core features and functionality',
    'Conduct additional validation tests',
    'Reassess competitive positioning'
  ]
};

export function ValidationReport({ validationData, onChange }: ValidationReportProps) {
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    marketScore: 0,
    competitorScore: 0,
    audienceScore: 0,
    interviewScore: 0,
    overallScore: 0
  });
  const [autoRecommendation, setAutoRecommendation] = useState<'go' | 'no-go' | 'pivot'>('go');
  const [newNextStep, setNewNextStep] = useState('');

  useEffect(() => {
    const calculatedMetrics = calculateValidationMetrics();
    setMetrics(calculatedMetrics);

    const recommendation = generateRecommendation(calculatedMetrics.overallScore);
    setAutoRecommendation(recommendation);

    // Auto-update report if it's empty
    if (!validationData.validationReport.reasoning) {
      onChange({
        ...validationData.validationReport,
        recommendation,
        reasoning: generateRecommendationReasoning(calculatedMetrics, recommendation)
      });
    }
  }, [validationData]);

  const calculateValidationMetrics = (): ValidationMetrics => {
    // Market Research Score (25%)
    let marketScore = 0;
    if (validationData.marketResearch.marketSize > 0) marketScore += 40;
    if (validationData.marketResearch.growthRate > 0) marketScore += 30;
    if (validationData.marketResearch.trends.length > 0) marketScore += 20;
    if (validationData.marketResearch.sources.length > 0) marketScore += 10;

    // Competitor Analysis Score (25%)
    let competitorScore = 0;
    if (validationData.competitorAnalysis.competitors.length > 0) competitorScore += 40;
    if (validationData.competitorAnalysis.competitiveAdvantage.length > 0) competitorScore += 30;
    if (validationData.competitorAnalysis.marketGap.length > 0) competitorScore += 30;

    // Target Audience Score (25%)
    let audienceScore = 0;
    if (validationData.targetAudience.personas.length > 0) audienceScore += 50;
    if (validationData.targetAudience.personas.length >= 2) audienceScore += 20;
    if (validationData.targetAudience.validationScore > 0) audienceScore += 30;

    // Interview Score (25%)
    let interviewScore = 0;
    if (validationData.targetAudience.interviewResults.length > 0) {
      const avgInterviewScore = validationData.targetAudience.interviewResults.reduce(
        (sum, result) => sum + result.validationScore, 0
      ) / validationData.targetAudience.interviewResults.length;
      interviewScore = avgInterviewScore;
    }

    const overallScore = Math.round(
      (marketScore * 0.25) +
      (competitorScore * 0.25) +
      (audienceScore * 0.25) +
      (interviewScore * 0.25)
    );

    return {
      marketScore,
      competitorScore,
      audienceScore,
      interviewScore,
      overallScore
    };
  };

  const generateRecommendation = (overallScore: number): 'go' | 'no-go' | 'pivot' => {
    if (overallScore >= RECOMMENDATION_CRITERIA.go.threshold) return 'go';
    if (overallScore <= RECOMMENDATION_CRITERIA['no-go'].threshold) return 'no-go';
    return 'pivot';
  };

  const generateRecommendationReasoning = (
    metrics: ValidationMetrics,
    recommendation: 'go' | 'no-go' | 'pivot'
  ): string => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze each area
    if (metrics.marketScore >= 70) {
      strengths.push('Strong market opportunity with clear size and growth potential');
    } else if (metrics.marketScore <= 40) {
      weaknesses.push('Limited market research and unclear market opportunity');
    }

    if (metrics.competitorScore >= 70) {
      strengths.push('Clear competitive advantage and market positioning');
    } else if (metrics.competitorScore <= 40) {
      weaknesses.push('Insufficient competitive analysis and unclear differentiation');
    }

    if (metrics.audienceScore >= 70) {
      strengths.push('Well-defined target audience with detailed personas');
    } else if (metrics.audienceScore <= 40) {
      weaknesses.push('Unclear target audience and insufficient persona development');
    }

    if (metrics.interviewScore >= 70) {
      strengths.push('Strong user validation through interviews and feedback');
    } else if (metrics.interviewScore <= 40) {
      weaknesses.push('Limited user validation and interview feedback');
    }

    let reasoning = `Based on the validation analysis (Overall Score: ${metrics.overallScore}/100), `;

    switch (recommendation) {
      case 'go':
        reasoning += 'the data supports proceeding with development. ';
        if (strengths.length > 0) {
          reasoning += `Key strengths include: ${strengths.join(', ')}. `;
        }
        break;
      case 'no-go':
        reasoning += 'the data suggests significant risks that warrant not proceeding. ';
        if (weaknesses.length > 0) {
          reasoning += `Major concerns include: ${weaknesses.join(', ')}. `;
        }
        break;
      case 'pivot':
        reasoning += 'the data shows mixed signals requiring strategic adjustments. ';
        if (strengths.length > 0) {
          reasoning += `Positive aspects: ${strengths.join(', ')}. `;
        }
        if (weaknesses.length > 0) {
          reasoning += `Areas needing improvement: ${weaknesses.join(', ')}. `;
        }
        break;
    }

    return reasoning;
  };

  const addNextStep = () => {
    if (newNextStep.trim()) {
      const updatedNextSteps = [...validationData.validationReport.nextSteps, newNextStep.trim()];
      onChange({
        ...validationData.validationReport,
        nextSteps: updatedNextSteps
      });
      setNewNextStep('');
    }
  };

  const removeNextStep = (index: number) => {
    const updatedNextSteps = validationData.validationReport.nextSteps.filter((_, i) => i !== index);
    onChange({
      ...validationData.validationReport,
      nextSteps: updatedNextSteps
    });
  };

  const addTemplateNextSteps = () => {
    const templateSteps = NEXT_STEPS_TEMPLATES[validationData.validationReport.recommendation];
    const currentSteps = validationData.validationReport.nextSteps;
    const newSteps = templateSteps.filter(step => !currentSteps.includes(step));

    onChange({
      ...validationData.validationReport,
      nextSteps: [...currentSteps, ...newSteps]
    });
  };

  const criteria = RECOMMENDATION_CRITERIA[validationData.validationReport.recommendation || autoRecommendation];
  const Icon = criteria.icon;

  return (
    <div className="space-y-6">
      {/* Validation Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Validation Metrics
          </CardTitle>
          <CardDescription>
            Quantitative analysis of your validation efforts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.marketScore}</div>
              <div className="text-sm text-gray-500">Market Research</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.marketScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.competitorScore}</div>
              <div className="text-sm text-gray-500">Competitor Analysis</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.competitorScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.audienceScore}</div>
              <div className="text-sm text-gray-500">Target Audience</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.audienceScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.interviewScore}</div>
              <div className="text-sm text-gray-500">User Interviews</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.interviewScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">Overall Validation Score</h4>
                <p className="text-sm text-gray-600">Weighted average across all validation areas</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${metrics.overallScore >= 75 ? 'text-green-600' :
                    metrics.overallScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                  }`}>
                  {metrics.overallScore}
                </div>
                <div className="text-sm text-gray-500">out of 100</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${metrics.overallScore >= 75 ? 'bg-green-500' :
                    metrics.overallScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                  }`}
                style={{ width: `${metrics.overallScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className={`${criteria.borderColor} ${criteria.bgColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Validation Report
          </CardTitle>
          <CardDescription>
            Final recommendation based on validation analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommendation Selection */}
          <div>
            <Label>Recommendation</Label>
            <Select
              value={validationData.validationReport.recommendation}
              onValueChange={(value: 'go' | 'no-go' | 'pivot') =>
                onChange({ ...validationData.validationReport, recommendation: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="go">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    GO - Proceed with Development
                  </div>
                </SelectItem>
                <SelectItem value="pivot">
                  <div className="flex items-center">
                    <RotateCcw className="h-4 w-4 mr-2 text-yellow-600" />
                    PIVOT - Modify Approach
                  </div>
                </SelectItem>
                <SelectItem value="no-go">
                  <div className="flex items-center">
                    <X className="h-4 w-4 mr-2 text-red-600" />
                    NO-GO - Do Not Proceed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recommendation Display */}
          <div className={`p-4 rounded-lg border ${criteria.borderColor} ${criteria.bgColor}`}>
            <div className="flex items-center mb-2">
              <Icon className={`h-6 w-6 mr-2 ${criteria.color}`} />
              <h3 className={`text-lg font-semibold ${criteria.color}`}>
                {criteria.title}
              </h3>
            </div>
            <p className="text-sm text-gray-700">{criteria.description}</p>
          </div>

          {/* Auto-generated suggestion */}
          {autoRecommendation !== validationData.validationReport.recommendation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Suggested Recommendation</p>
                  <p className="text-blue-700">
                    Based on your validation score ({metrics.overallScore}/100),
                    we recommend: <strong>{RECOMMENDATION_CRITERIA[autoRecommendation].title}</strong>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({
                      ...validationData.validationReport,
                      recommendation: autoRecommendation
                    })}
                    className="mt-2"
                  >
                    Use Suggested Recommendation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div>
            <Label htmlFor="reasoning">Reasoning & Analysis</Label>
            <Textarea
              id="reasoning"
              placeholder="Explain the reasoning behind your recommendation..."
              value={validationData.validationReport.reasoning}
              onChange={(e) => onChange({
                ...validationData.validationReport,
                reasoning: e.target.value
              })}
              rows={6}
              className="mt-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({
                ...validationData.validationReport,
                reasoning: generateRecommendationReasoning(metrics, validationData.validationReport.recommendation)
              })}
              className="mt-2"
            >
              Generate Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Actionable steps based on your validation results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Next Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Suggested Next Steps</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addTemplateNextSteps}
              >
                Add Template Steps
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Based on your "{validationData.validationReport.recommendation}" recommendation
            </div>
          </div>

          {/* Custom Next Step Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add custom next step..."
              value={newNextStep}
              onChange={(e) => setNewNextStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNextStep()}
            />
            <Button onClick={addNextStep}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Next Steps List */}
          {validationData.validationReport.nextSteps.length > 0 ? (
            <div className="space-y-2">
              {validationData.validationReport.nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-sm">{step}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNextStep(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No next steps defined yet</p>
              <p className="text-sm">Add actionable next steps based on your validation results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
