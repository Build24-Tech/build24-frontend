'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Target, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface MarketingChannel {
  channel: string;
  budget: number;
  expectedROI: number;
  timeline: string;
  metrics: string[];
}

interface MarketingData {
  channels: MarketingChannel[];
  totalBudget: number;
  primaryChannels: string[];
}

interface MarketingChannelsProps {
  data?: MarketingData;
  onDataChange?: (data: MarketingData) => void;
}

const MARKETING_CHANNELS = [
  { value: 'social-media', label: 'Social Media Marketing', description: 'Facebook, Instagram, Twitter, LinkedIn' },
  { value: 'content-marketing', label: 'Content Marketing', description: 'Blog posts, videos, podcasts' },
  { value: 'seo', label: 'Search Engine Optimization', description: 'Organic search traffic' },
  { value: 'ppc', label: 'Pay-Per-Click Advertising', description: 'Google Ads, Facebook Ads' },
  { value: 'email-marketing', label: 'Email Marketing', description: 'Newsletter, drip campaigns' },
  { value: 'influencer', label: 'Influencer Marketing', description: 'Partnerships with influencers' },
  { value: 'pr', label: 'Public Relations', description: 'Press releases, media coverage' },
  { value: 'events', label: 'Events & Conferences', description: 'Trade shows, webinars' },
  { value: 'partnerships', label: 'Strategic Partnerships', description: 'Channel partners, affiliates' },
  { value: 'referral', label: 'Referral Program', description: 'Customer referrals, word-of-mouth' },
  { value: 'direct-sales', label: 'Direct Sales', description: 'Sales team, cold outreach' },
  { value: 'marketplace', label: 'Online Marketplaces', description: 'Amazon, App Store, etc.' },
];

const TIMELINE_OPTIONS = [
  { value: 'pre-launch', label: 'Pre-Launch (3-6 months before)' },
  { value: 'launch', label: 'Launch Phase (0-3 months)' },
  { value: 'growth', label: 'Growth Phase (3-12 months)' },
  { value: 'ongoing', label: 'Ongoing' },
];

const COMMON_METRICS = [
  'Cost Per Acquisition (CPA)',
  'Return on Ad Spend (ROAS)',
  'Click-Through Rate (CTR)',
  'Conversion Rate',
  'Customer Lifetime Value (CLV)',
  'Brand Awareness',
  'Engagement Rate',
  'Lead Generation',
  'Website Traffic',
  'Social Media Followers',
  'Email Open Rate',
  'Email Click Rate',
];

export function MarketingChannels({ data, onDataChange }: MarketingChannelsProps) {
  const [localData, setLocalData] = useState<MarketingData>(data || {
    channels: [],
    totalBudget: 0,
    primaryChannels: []
  });

  const updateData = (updates: Partial<MarketingData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const addChannel = () => {
    const newChannel: MarketingChannel = {
      channel: '',
      budget: 0,
      expectedROI: 0,
      timeline: '',
      metrics: []
    };
    updateData({ channels: [...localData.channels, newChannel] });
  };

  const updateChannel = (index: number, updates: Partial<MarketingChannel>) => {
    const newChannels = [...localData.channels];
    newChannels[index] = { ...newChannels[index], ...updates };
    updateData({ channels: newChannels });

    // Recalculate total budget
    const totalBudget = newChannels.reduce((sum, channel) => sum + channel.budget, 0);
    updateData({ channels: newChannels, totalBudget });
  };

  const removeChannel = (index: number) => {
    const newChannels = localData.channels.filter((_, i) => i !== index);
    const totalBudget = newChannels.reduce((sum, channel) => sum + channel.budget, 0);
    updateData({ channels: newChannels, totalBudget });
  };

  const togglePrimaryChannel = (channelName: string) => {
    const isPrimary = localData.primaryChannels.includes(channelName);
    const newPrimaryChannels = isPrimary
      ? localData.primaryChannels.filter(c => c !== channelName)
      : [...localData.primaryChannels, channelName];

    updateData({ primaryChannels: newPrimaryChannels });
  };

  const addMetricToChannel = (channelIndex: number, metric: string) => {
    const newChannels = [...localData.channels];
    if (!newChannels[channelIndex].metrics.includes(metric)) {
      newChannels[channelIndex].metrics.push(metric);
      updateData({ channels: newChannels });
    }
  };

  const removeMetricFromChannel = (channelIndex: number, metricIndex: number) => {
    const newChannels = [...localData.channels];
    newChannels[channelIndex].metrics = newChannels[channelIndex].metrics.filter((_, i) => i !== metricIndex);
    updateData({ channels: newChannels });
  };

  const calculateBudgetAllocation = (channelBudget: number) => {
    return localData.totalBudget > 0 ? (channelBudget / localData.totalBudget) * 100 : 0;
  };

  const calculateExpectedReturn = (channel: MarketingChannel) => {
    return channel.budget * (channel.expectedROI / 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Marketing Channels & Budget Allocation
          </CardTitle>
          <CardDescription>
            Select marketing channels and allocate budget with ROI projections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">Total Budget</span>
              </div>
              <div className="text-2xl font-bold">${localData.totalBudget.toLocaleString()}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Expected Return</span>
              </div>
              <div className="text-2xl font-bold">
                ${localData.channels.reduce((sum, channel) => sum + calculateExpectedReturn(channel), 0).toLocaleString()}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Active Channels</span>
              </div>
              <div className="text-2xl font-bold">{localData.channels.length}</div>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Marketing Channels</h3>
            <Button onClick={addChannel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>

          {localData.channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No marketing channels defined. Click "Add Channel" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {localData.channels.map((channel, index) => {
                const channelInfo = MARKETING_CHANNELS.find(c => c.value === channel.channel);
                const budgetPercentage = calculateBudgetAllocation(channel.budget);
                const expectedReturn = calculateExpectedReturn(channel);
                const isPrimary = localData.primaryChannels.includes(channel.channel);

                return (
                  <Card key={index} className={`border-l-4 ${isPrimary ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {channelInfo?.label || 'Unknown Channel'}
                          </CardTitle>
                          {isPrimary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={isPrimary ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePrimaryChannel(channel.channel)}
                          >
                            {isPrimary ? 'Primary' : 'Set Primary'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeChannel(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {channelInfo && (
                        <CardDescription>{channelInfo.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Channel Type</Label>
                          <Select
                            value={channel.channel}
                            onValueChange={(value) => updateChannel(index, { channel: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                              {MARKETING_CHANNELS.map((channelOption) => (
                                <SelectItem key={channelOption.value} value={channelOption.value}>
                                  <div>
                                    <div className="font-medium">{channelOption.label}</div>
                                    <div className="text-sm text-muted-foreground">{channelOption.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Budget ($)</Label>
                          <Input
                            type="number"
                            value={channel.budget}
                            onChange={(e) => updateChannel(index, { budget: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                          <div className="text-sm text-muted-foreground">
                            {budgetPercentage.toFixed(1)}% of total budget
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Expected ROI (%)</Label>
                          <Input
                            type="number"
                            value={channel.expectedROI}
                            onChange={(e) => updateChannel(index, { expectedROI: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                          <div className="text-sm text-muted-foreground">
                            ${expectedReturn.toLocaleString()} return
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Timeline</Label>
                          <Select
                            value={channel.timeline}
                            onValueChange={(value) => updateChannel(index, { timeline: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMELINE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Key Metrics to Track</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {channel.metrics.map((metric, metricIndex) => (
                            <Badge key={metricIndex} variant="secondary" className="flex items-center gap-1">
                              {metric}
                              <button
                                onClick={() => removeMetricFromChannel(index, metricIndex)}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select
                          onValueChange={(value) => addMetricToChannel(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add a metric to track" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_METRICS.filter(metric => !channel.metrics.includes(metric)).map((metric) => (
                              <SelectItem key={metric} value={metric}>
                                {metric}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {channel.budget > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Budget Allocation</span>
                            <span>{budgetPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={budgetPercentage} className="w-full" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {localData.channels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Channel Allocation</h4>
                      {localData.channels.map((channel, index) => {
                        const channelInfo = MARKETING_CHANNELS.find(c => c.value === channel.channel);
                        const percentage = calculateBudgetAllocation(channel.budget);
                        return (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-sm">{channelInfo?.label || 'Unknown'}</span>
                            <span className="text-sm font-medium">
                              ${channel.budget.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">ROI Projections</h4>
                      {localData.channels.map((channel, index) => {
                        const channelInfo = MARKETING_CHANNELS.find(c => c.value === channel.channel);
                        const expectedReturn = calculateExpectedReturn(channel);
                        return (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-sm">{channelInfo?.label || 'Unknown'}</span>
                            <span className="text-sm font-medium text-green-600">
                              ${expectedReturn.toLocaleString()} ({channel.expectedROI}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
