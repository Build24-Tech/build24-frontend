'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calendar, CheckCircle, DollarSign, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { LaunchTimeline } from './go-to-market/LaunchTimeline';
import { MarketingChannels } from './go-to-market/MarketingChannels';
import { MetricsDefinition } from './go-to-market/MetricsDefinition';
import { PostLaunchPlanning } from './go-to-market/PostLaunchPlanning';
import { PricingStrategy } from './go-to-market/PricingStrategy';

export interface GoToMarketData {
  pricing?: {
    strategy: string;
    model: string;
    tiers: Array<{
      name: string;
      price: number;
      features: string[];
      target: string;
    }>;
    competitiveAnalysis: Array<{
      competitor: string;
      price: number;
      features: string[];
      positioning: string;
    }>;
  };
  marketing?: {
    channels: Array<{
      channel: string;
      budget: number;
      expectedROI: number;
      timeline: string;
      metrics: string[];
    }>;
    totalBudget: number;
    primaryChannels: string[];
  };
  timeline?: {
    phases: Array<{
      name: string;
      duration: number;
      milestones: Array<{
        name: string;
        date: string;
        dependencies: string[];
        status: 'pending' | 'in-progress' | 'completed';
      }>;
    }>;
    launchDate: string;
    criticalPath: string[];
  };
  metrics?: {
    acquisition: Array<{
      metric: string;
      target: number;
      measurement: string;
    }>;
    activation: Array<{
      metric: string;
      target: number;
      measurement: string;
    }>;
    retention: Array<{
      metric: string;
      target: number;
      measurement: string;
    }>;
    revenue: Array<{
      metric: string;
      target: number;
      measurement: string;
    }>;
  };
  postLaunch?: {
    feedbackChannels: string[];
    iterationCycle: string;
    successCriteria: string[];
    contingencyPlans: Array<{
      scenario: string;
      trigger: string;
      action: string;
    }>;
  };
}

interface GoToMarketStrategyProps {
  data?: GoToMarketData;
  onDataChange?: (data: GoToMarketData) => void;
  onSave?: () => void;
}

export function GoToMarketStrategy({ data = {}, onDataChange, onSave }: GoToMarketStrategyProps) {
  const [activeTab, setActiveTab] = useState('pricing');
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});

  const handleDataUpdate = (section: keyof GoToMarketData, sectionData: any) => {
    const updatedData = { ...data, [section]: sectionData };
    onDataChange?.(updatedData);
  };

  const calculateProgress = () => {
    const sections = ['pricing', 'marketing', 'timeline', 'metrics', 'postLaunch'];
    const completed = sections.filter(section => {
      const sectionData = data[section as keyof GoToMarketData];
      return sectionData && Object.keys(sectionData).length > 0;
    });
    return (completed.length / sections.length) * 100;
  };

  const getCompletionBadge = (section: string) => {
    const sectionData = data[section as keyof GoToMarketData];
    const isComplete = sectionData && Object.keys(sectionData).length > 0;

    return isComplete ? (
      <Badge variant="default" className="ml-2">
        <CheckCircle className="w-3 h-3 mr-1" />
        Complete
      </Badge>
    ) : (
      <Badge variant="secondary" className="ml-2">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const tabs = [
    { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
    { id: 'marketing', label: 'Marketing Channels', icon: Target },
    { id: 'timeline', label: 'Launch Timeline', icon: Calendar },
    { id: 'metrics', label: 'Success Metrics', icon: TrendingUp },
    { id: 'postlaunch', label: 'Post-Launch', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Go-to-Market Strategy
          </CardTitle>
          <CardDescription>
            Develop a comprehensive strategy to successfully launch and promote your product in the market.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="w-full" />
            </div>

            {calculateProgress() < 100 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Complete all sections to finalize your go-to-market strategy. Each section builds upon the previous ones.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {getCompletionBadge(tab.id)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <PricingStrategy
            data={data.pricing}
            onDataChange={(data) => handleDataUpdate('pricing', data)}
          />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <MarketingChannels
            data={data.marketing}
            onDataChange={(data) => handleDataUpdate('marketing', data)}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <LaunchTimeline
            data={data.timeline}
            onDataChange={(data) => handleDataUpdate('timeline', data)}
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <MetricsDefinition
            data={data.metrics}
            onDataChange={(data) => handleDataUpdate('metrics', data)}
          />
        </TabsContent>

        <TabsContent value="postlaunch" className="space-y-4">
          <PostLaunchPlanning
            data={data.postLaunch}
            onDataChange={(data) => handleDataUpdate('postLaunch', data)}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button onClick={onSave} disabled={calculateProgress() < 100}>
          Save Strategy
        </Button>
      </div>
    </div>
  );
}
