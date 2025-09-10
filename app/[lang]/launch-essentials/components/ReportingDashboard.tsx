'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhaseAnalysis, ReportContent, ReportService } from '@/lib/report-service';
import { LaunchPhase, ProjectData, UserProgress } from '@/types/launch-essentials';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportReportPanel } from './ExportReportPanel';

interface ReportingDashboardProps {
  projectData: ProjectData;
  progress: UserProgress;
  className?: string;
}

interface ProgressMetrics {
  overallCompletion: number;
  phasesCompleted: number;
  totalPhases: number;
  timeSpent: number;
  riskLevel: 'low' | 'medium' | 'high';
  readinessScore: number;
}

export function ReportingDashboard({ projectData, progress, className }: ReportingDashboardProps) {
  const [reportContent, setReportContent] = useState<ReportContent | null>(null);
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [phaseAnalysis, setPhaseAnalysis] = useState<PhaseAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateReportData();
  }, [projectData, progress]);

  const generateReportData = async () => {
    setIsLoading(true);
    try {
      const report = await ReportService.generateReport(
        projectData,
        progress,
        'detailed-analysis'
      );

      setReportContent(report.content);
      setMetrics({
        overallCompletion: report.content.progressOverview.overallCompletion,
        phasesCompleted: report.content.progressOverview.phasesCompleted,
        totalPhases: report.content.progressOverview.totalPhases,
        timeSpent: report.content.progressOverview.timeSpent,
        riskLevel: report.content.insights.riskLevel,
        readinessScore: report.content.insights.readinessScore
      });
      setPhaseAnalysis(report.content.phaseAnalysis);
    } catch (error) {
      console.error('Failed to generate report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPhaseIcon = (phase: LaunchPhase) => {
    const icons = {
      validation: CheckCircle,
      definition: Target,
      technical: BarChart3,
      marketing: TrendingUp,
      operations: Clock,
      financial: TrendingUp,
      risks: AlertTriangle,
      optimization: Target
    };
    return icons[phase] || FileText;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{metrics?.overallCompletion.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <Progress value={metrics?.overallCompletion || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Readiness Score</p>
                <p className="text-2xl font-bold">{metrics?.readinessScore}/100</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <Progress value={metrics?.readinessScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Invested</p>
                <p className="text-2xl font-bold">{metrics?.timeSpent} days</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.phasesCompleted}/{metrics?.totalPhases} phases completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <Badge className={getRiskColor(metrics?.riskLevel || 'low')}>
                  {metrics?.riskLevel?.toUpperCase()}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Phase Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>High-level project overview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {reportContent?.executiveSummary}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
                <CardDescription>Priority actions for success</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportContent?.recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
              <CardDescription>Phase completion overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phaseAnalysis.map((phase) => {
                  const Icon = getPhaseIcon(phase.phase);
                  return (
                    <div key={phase.phase} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">
                            {phase.phase.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {phase.completion.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={phase.completion} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {phaseAnalysis.map((phase) => {
              const Icon = getPhaseIcon(phase.phase);
              return (
                <Card key={phase.phase}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="capitalize">
                        {phase.phase.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant="outline">{phase.completion.toFixed(1)}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {phase.keyAchievements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-2">
                          Key Achievements
                        </h4>
                        <ul className="text-sm space-y-1">
                          {phase.keyAchievements.map((achievement, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.challenges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-yellow-600 mb-2">
                          Challenges
                        </h4>
                        <ul className="text-sm space-y-1">
                          {phase.challenges.map((challenge, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.nextSteps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-600 mb-2">
                          Next Steps
                        </h4>
                        <ul className="text-sm space-y-1">
                          {phase.nextSteps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-blue-500" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
                <CardDescription>Important discoveries and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportContent?.insights.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-sm">{finding}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Priority Actions</CardTitle>
                <CardDescription>Immediate steps to maintain momentum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportContent?.insights.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Quantitative analysis of project health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {reportContent?.progressOverview.overallCompletion.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {reportContent?.progressOverview.timeSpent}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Invested</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {reportContent?.progressOverview.estimatedTimeRemaining}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {reportContent?.insights.readinessScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Readiness Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportReportPanel
            projectData={projectData}
            progress={progress}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
