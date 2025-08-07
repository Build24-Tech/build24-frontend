'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  calculateOverallRiskLevel,
  generateRiskAlerts,
  generateRiskMatrix,
  identifyCriticalRisks,
  prioritizeRisks
} from '@/lib/risk-management-utils';
import { MitigationStrategy, MonitoringPlan, Risk, RiskAssessment } from '@/types/launch-essentials';
import { AlertTriangle, CheckCircle, Eye, Shield, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MitigationPlanning } from './risk/MitigationPlanning';
import { RiskAssessmentFramework } from './risk/RiskAssessmentFramework';
import { RiskEvaluation } from './risk/RiskEvaluation';
import { RiskMonitoring } from './risk/RiskMonitoring';
import { RiskReporting } from './risk/RiskReporting';

export interface RiskManagementData {
  risks: Risk[];
  assessment: RiskAssessment;
  mitigationStrategies: MitigationStrategy[];
  monitoringPlans: MonitoringPlan[];
  completionPercentage: number;
}

interface RiskManagementProps {
  data: RiskManagementData;
  onDataChange: (data: RiskManagementData) => void;
  onSave: () => void;
}

export function RiskManagement({ data, onDataChange, onSave }: RiskManagementProps) {
  const [activeTab, setActiveTab] = useState('assessment');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    updateRiskAssessment();
    generateAlerts();
  }, [data.risks, data.monitoringPlans]);

  const updateRiskAssessment = () => {
    const overallRiskLevel = calculateOverallRiskLevel(data.risks);
    const criticalRisks = identifyCriticalRisks(data.risks);
    const riskMatrix = generateRiskMatrix(data.risks);

    const updatedAssessment: RiskAssessment = {
      overallRiskLevel,
      criticalRisks,
      riskMatrix: Object.entries(riskMatrix).flatMap(([prob, impacts]) =>
        Object.entries(impacts).map(([impact, count]) => ({
          probability: prob,
          impact,
          count
        }))
      )
    };

    onDataChange({
      ...data,
      assessment: updatedAssessment
    });
  };

  const generateAlerts = () => {
    const riskAlerts = generateRiskAlerts(data.risks, data.monitoringPlans);
    setAlerts(riskAlerts);
  };

  const calculateCompletionPercentage = () => {
    const totalSteps = 5; // assessment, evaluation, mitigation, monitoring, reporting
    let completedSteps = 0;

    if (data.risks.length > 0) completedSteps++;
    if (data.assessment.overallRiskLevel) completedSteps++;
    if (data.mitigationStrategies.length > 0) completedSteps++;
    if (data.monitoringPlans.length > 0) completedSteps++;
    if (data.risks.length > 0 && data.mitigationStrategies.length > 0) completedSteps++;

    const percentage = Math.round((completedSteps / totalSteps) * 100);

    if (percentage !== data.completionPercentage) {
      onDataChange({ ...data, completionPercentage: percentage });
    }

    return percentage;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const overallProgress = calculateCompletionPercentage();
  const RiskIcon = getRiskLevelIcon(data.assessment.overallRiskLevel);
  const criticalRiskCount = data.assessment.criticalRisks.length;
  const prioritizedRisks = prioritizeRisks(data.risks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Management & Contingency Planning</h2>
          <p className="text-muted-foreground">
            Identify, assess, and mitigate potential risks to your product launch
          </p>
        </div>
        <Button onClick={onSave}>Save Progress</Button>
      </div>

      {/* Overall Risk Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RiskIcon className={`h-5 w-5 ${getRiskLevelColor(data.assessment.overallRiskLevel)}`} />
              <CardTitle>
                Overall Risk Level: {data.assessment.overallRiskLevel.charAt(0).toUpperCase() + data.assessment.overallRiskLevel.slice(1)}
              </CardTitle>
            </div>
            <Badge variant={overallProgress >= 70 ? 'default' : 'secondary'}>
              {overallProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.risks.length}</div>
              <div className="text-sm text-muted-foreground">Total Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalRiskCount}</div>
              <div className="text-sm text-muted-foreground">Critical Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.mitigationStrategies.length}</div>
              <div className="text-sm text-muted-foreground">Mitigation Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.monitoringPlans.length}</div>
              <div className="text-sm text-muted-foreground">Monitoring Plans</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Risk Alerts */}
      {alerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.length} risk alert{alerts.length > 1 ? 's' : ''} require{alerts.length === 1 ? 's' : ''} immediate attention.
            {alerts.filter(alert => alert.severity === 'critical').length > 0 &&
              ` ${alerts.filter(alert => alert.severity === 'critical').length} critical alert${alerts.filter(alert => alert.severity === 'critical').length > 1 ? 's' : ''} need escalation.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assessment" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Assessment</span>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Evaluation</span>
          </TabsTrigger>
          <TabsTrigger value="mitigation" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Mitigation</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Reporting</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <RiskAssessmentFramework
            risks={data.risks}
            onChange={(risks) => onDataChange({ ...data, risks })}
          />
        </TabsContent>

        <TabsContent value="evaluation">
          <RiskEvaluation
            risks={prioritizedRisks}
            assessment={data.assessment}
            onChange={(assessment) => onDataChange({ ...data, assessment })}
          />
        </TabsContent>

        <TabsContent value="mitigation">
          <MitigationPlanning
            risks={data.risks}
            strategies={data.mitigationStrategies}
            onChange={(mitigationStrategies) => onDataChange({ ...data, mitigationStrategies })}
          />
        </TabsContent>

        <TabsContent value="monitoring">
          <RiskMonitoring
            risks={data.risks}
            monitoringPlans={data.monitoringPlans}
            alerts={alerts}
            onChange={(monitoringPlans) => onDataChange({ ...data, monitoringPlans })}
          />
        </TabsContent>

        <TabsContent value="reporting">
          <RiskReporting
            risks={data.risks}
            assessment={data.assessment}
            mitigationStrategies={data.mitigationStrategies}
            monitoringPlans={data.monitoringPlans}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
