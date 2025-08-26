'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, HeadphonesIcon, Scale, Settings, Target, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerSupportPlanning } from './operational/CustomerSupportPlanning';
import { LegalRequirementsChecklist } from './operational/LegalRequirementsChecklist';
import { OperationalGapAnalysis } from './operational/OperationalGapAnalysis';
import { ProcessSetupTemplates } from './operational/ProcessSetupTemplates';
import { TeamStructurePlanning } from './operational/TeamStructurePlanning';

export interface OperationalReadinessData {
  teamStructure: {
    roles: TeamRole[];
    orgChart: OrgStructure;
    hiringPlan: HiringPlan;
    completionPercentage: number;
  };
  processes: {
    development: ProcessTemplate[];
    testing: ProcessTemplate[];
    deployment: ProcessTemplate[];
    completionPercentage: number;
  };
  customerSupport: {
    channels: SupportChannel[];
    knowledgeBase: KnowledgeBaseStructure;
    supportTeam: SupportTeamStructure;
    completionPercentage: number;
  };
  legal: {
    requirements: LegalRequirement[];
    compliance: ComplianceItem[];
    policies: PolicyDocument[];
    completionPercentage: number;
  };
  gapAnalysis: {
    identifiedGaps: OperationalGap[];
    prioritizedActions: RemediationAction[];
    overallReadiness: number;
  };
}

export interface TeamRole {
  id: string;
  title: string;
  department: string;
  responsibilities: string[];
  requiredSkills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  priority: 'critical' | 'important' | 'nice-to-have';
  status: 'filled' | 'recruiting' | 'planned';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ProcessTemplate {
  id: string;
  name: string;
  category: 'development' | 'testing' | 'deployment';
  steps: ProcessStep[];
  tools: string[];
  responsibilities: string[];
  timeline: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface SupportChannel {
  id: string;
  type: 'email' | 'chat' | 'phone' | 'forum' | 'social';
  name: string;
  availability: string;
  responseTime: string;
  staffing: number;
  tools: string[];
  status: 'planned' | 'setup' | 'active';
}

export interface LegalRequirement {
  id: string;
  category: 'privacy' | 'terms' | 'compliance' | 'licensing';
  requirement: string;
  description: string;
  priority: 'critical' | 'important' | 'optional';
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  assignee?: string;
}

export interface OperationalGap {
  id: string;
  category: 'team' | 'process' | 'support' | 'legal' | 'infrastructure';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  status: 'identified' | 'planned' | 'in_progress' | 'resolved';
}

interface OperationalReadinessProps {
  data: OperationalReadinessData;
  onDataChange: (data: OperationalReadinessData) => void;
  onSave: () => void;
}

export function OperationalReadiness({ data, onDataChange, onSave }: OperationalReadinessProps) {
  const [activeTab, setActiveTab] = useState('team');
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    calculateOverallProgress();
  }, [data]);

  const calculateOverallProgress = () => {
    const sections = [
      data.teamStructure.completionPercentage,
      data.processes.completionPercentage,
      data.customerSupport.completionPercentage,
      data.legal.completionPercentage
    ];

    const average = sections.reduce((sum, percentage) => sum + percentage, 0) / sections.length;
    setOverallProgress(Math.round(average));
  };

  const getReadinessLevel = () => {
    if (overallProgress >= 90) return { level: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (overallProgress >= 70) return { level: 'Good', color: 'text-blue-600', icon: CheckCircle };
    if (overallProgress >= 50) return { level: 'Fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { level: 'Needs Work', color: 'text-red-600', icon: AlertTriangle };
  };

  const readiness = getReadinessLevel();
  const ReadinessIcon = readiness.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Operational Readiness</h2>
          <p className="text-muted-foreground">
            Ensure your organization is prepared to support and scale your product
          </p>
        </div>
        <Button onClick={onSave}>Save Progress</Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ReadinessIcon className={`h-5 w-5 ${readiness.color}`} />
              <CardTitle>Overall Readiness: {readiness.level}</CardTitle>
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
              <div className="text-2xl font-bold text-blue-600">{data.teamStructure.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Team Structure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.processes.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Processes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.customerSupport.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.legal.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Legal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Gaps Alert */}
      {data.gapAnalysis.identifiedGaps.filter(gap => gap.impact === 'high').length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {data.gapAnalysis.identifiedGaps.filter(gap => gap.impact === 'high').length} critical operational gaps that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Processes</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <HeadphonesIcon className="h-4 w-4" />
            <span>Support</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center space-x-2">
            <Scale className="h-4 w-4" />
            <span>Legal</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Gaps</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamStructurePlanning
            data={data.teamStructure}
            onChange={(teamStructure) => onDataChange({ ...data, teamStructure })}
          />
        </TabsContent>

        <TabsContent value="processes">
          <ProcessSetupTemplates
            data={data.processes}
            onChange={(processes) => onDataChange({ ...data, processes })}
          />
        </TabsContent>

        <TabsContent value="support">
          <CustomerSupportPlanning
            data={data.customerSupport}
            onChange={(customerSupport) => onDataChange({ ...data, customerSupport })}
          />
        </TabsContent>

        <TabsContent value="legal">
          <LegalRequirementsChecklist
            data={data.legal}
            onChange={(legal) => onDataChange({ ...data, legal })}
          />
        </TabsContent>

        <TabsContent value="gaps">
          <OperationalGapAnalysis
            data={data.gapAnalysis}
            teamData={data.teamStructure}
            processData={data.processes}
            supportData={data.customerSupport}
            legalData={data.legal}
            onChange={(gapAnalysis) => onDataChange({ ...data, gapAnalysis })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
