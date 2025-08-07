'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { recommendationService } from '@/lib/recommendation-service';
import {
  LaunchPhase,
  Recommendation,
  Resource,
  Risk
} from '@/types/launch-essentials';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RecommendationPanelProps {
  userId: string;
  projectId: string;
  currentPhase?: LaunchPhase;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  onResourceClick?: (resource: Resource) => void;
}

interface RecommendationData {
  nextSteps: Recommendation[];
  resources: Resource[];
  risks: Risk[];
  personalizedRecommendations: Recommendation[];
}

interface ProgressInsights {
  progressSummary: {
    overallCompletion: number;
    currentPhase: LaunchPhase;
    completedPhases: number;
    stuckAreas: string[];
    momentum: 'high' | 'medium' | 'low';
  };
  insights: string[];
  recommendations: Recommendation[];
}

export function RecommendationPanel({
  userId,
  projectId,
  currentPhase,
  onRecommendationClick,
  onResourceClick
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [progressInsights, setProgressInsights] = useState<ProgressInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('next-steps');

  useEffect(() => {
    loadRecommendations();
  }, [userId, projectId, currentPhase]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recommendationData, insightsData] = await Promise.all([
        recommendationService.getRecommendations(userId, projectId),
        recommendationService.getProgressInsights(userId, projectId)
      ]);

      setRecommendations(recommendationData);
      setProgressInsights(insightsData);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (onRecommendationClick) {
      onRecommendationClick(recommendation);
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (onResourceClick) {
      onResourceClick(resource);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getMomentumIcon = (momentum: 'high' | 'medium' | 'low') => {
    switch (momentum) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered insights to help you succeed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadRecommendations} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered insights to help you succeed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Summary */}
        {progressInsights && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Progress Overview</h3>
              <div className="flex items-center gap-2">
                {getMomentumIcon(progressInsights.progressSummary.momentum)}
                <span className="text-sm text-gray-600 capitalize">
                  {progressInsights.progressSummary.momentum} momentum
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressInsights.progressSummary.overallCompletion}%
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressInsights.progressSummary.completedPhases}
                </div>
                <div className="text-xs text-gray-500">Phases Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {progressInsights.progressSummary.currentPhase}
                </div>
                <div className="text-xs text-gray-500">Current Phase</div>
              </div>
            </div>

            {/* Key Insights */}
            {progressInsights.insights.length > 0 && (
              <div className="space-y-2">
                {progressInsights.insights.slice(0, 2).map((insight, index) => (
                  <Alert key={index} className="py-2">
                    <Zap className="h-4 w-4" />
                    <AlertDescription className="text-sm">{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator className="mb-6" />

        {/* Recommendation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="next-steps" className="text-xs">
              Next Steps
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs">
              Resources
            </TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">
              Risks
            </TabsTrigger>
            <TabsTrigger value="personalized" className="text-xs">
              For You
            </TabsTrigger>
          </TabsList>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-3">
            {recommendations?.nextSteps.slice(0, 3).map((rec, index) => (
              <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecommendationClick(rec)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                  <div className="space-y-1">
                    {rec.actionItems.slice(0, 2).map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-3">
            {recommendations?.resources.slice(0, 4).map((resource, index) => (
              <Card key={resource.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleResourceClick(resource)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{resource.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-3">
            {recommendations?.risks.slice(0, 3).map((risk, index) => (
              <Card key={risk.id} className={`border ${getRiskColor(risk.impact)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{risk.title}</h4>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {risk.probability}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {risk.impact}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Category: {risk.category}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Personalized Tab */}
          <TabsContent value="personalized" className="space-y-3">
            {recommendations?.personalizedRecommendations.slice(0, 3).map((rec, index) => (
              <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecommendationClick(rec)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                  <div className="space-y-1">
                    {rec.actionItems.slice(0, 2).map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={loadRecommendations}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
