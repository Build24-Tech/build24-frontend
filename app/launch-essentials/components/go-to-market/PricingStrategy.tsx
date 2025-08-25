'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Plus, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface PricingTier {
  name: string;
  price: number;
  features: string[];
  target: string;
}

interface Competitor {
  competitor: string;
  price: number;
  features: string[];
  positioning: string;
}

interface PricingData {
  strategy: string;
  model: string;
  tiers: PricingTier[];
  competitiveAnalysis: Competitor[];
}

interface PricingStrategyProps {
  data?: PricingData;
  onDataChange?: (data: PricingData) => void;
}

const PRICING_STRATEGIES = [
  { value: 'cost-plus', label: 'Cost-Plus Pricing', description: 'Add markup to production costs' },
  { value: 'value-based', label: 'Value-Based Pricing', description: 'Price based on customer value perception' },
  { value: 'competitive', label: 'Competitive Pricing', description: 'Price relative to competitors' },
  { value: 'penetration', label: 'Penetration Pricing', description: 'Low initial price to gain market share' },
  { value: 'skimming', label: 'Price Skimming', description: 'High initial price, then reduce over time' },
  { value: 'freemium', label: 'Freemium', description: 'Free basic version, paid premium features' },
];

const PRICING_MODELS = [
  { value: 'one-time', label: 'One-time Purchase' },
  { value: 'subscription', label: 'Subscription (Recurring)' },
  { value: 'usage-based', label: 'Usage-Based (Pay-per-use)' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'freemium', label: 'Freemium Model' },
  { value: 'marketplace', label: 'Marketplace Commission' },
];

export function PricingStrategy({ data, onDataChange }: PricingStrategyProps) {
  const [localData, setLocalData] = useState<PricingData>(data || {
    strategy: '',
    model: '',
    tiers: [],
    competitiveAnalysis: []
  });

  const updateData = (updates: Partial<PricingData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onDataChange?.(newData);
  };

  const addPricingTier = () => {
    const newTier: PricingTier = {
      name: '',
      price: 0,
      features: [''],
      target: ''
    };
    updateData({ tiers: [...localData.tiers, newTier] });
  };

  const updatePricingTier = (index: number, updates: Partial<PricingTier>) => {
    const newTiers = [...localData.tiers];
    newTiers[index] = { ...newTiers[index], ...updates };
    updateData({ tiers: newTiers });
  };

  const removePricingTier = (index: number) => {
    const newTiers = localData.tiers.filter((_, i) => i !== index);
    updateData({ tiers: newTiers });
  };

  const addFeatureToTier = (tierIndex: number) => {
    const newTiers = [...localData.tiers];
    newTiers[tierIndex].features.push('');
    updateData({ tiers: newTiers });
  };

  const updateTierFeature = (tierIndex: number, featureIndex: number, value: string) => {
    const newTiers = [...localData.tiers];
    newTiers[tierIndex].features[featureIndex] = value;
    updateData({ tiers: newTiers });
  };

  const removeFeatureFromTier = (tierIndex: number, featureIndex: number) => {
    const newTiers = [...localData.tiers];
    newTiers[tierIndex].features = newTiers[tierIndex].features.filter((_, i) => i !== featureIndex);
    updateData({ tiers: newTiers });
  };

  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      competitor: '',
      price: 0,
      features: [''],
      positioning: ''
    };
    updateData({ competitiveAnalysis: [...localData.competitiveAnalysis, newCompetitor] });
  };

  const updateCompetitor = (index: number, updates: Partial<Competitor>) => {
    const newCompetitors = [...localData.competitiveAnalysis];
    newCompetitors[index] = { ...newCompetitors[index], ...updates };
    updateData({ competitiveAnalysis: newCompetitors });
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = localData.competitiveAnalysis.filter((_, i) => i !== index);
    updateData({ competitiveAnalysis: newCompetitors });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Strategy
          </CardTitle>
          <CardDescription>
            Define your pricing approach and competitive positioning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricing-strategy">Pricing Strategy</Label>
              <Select
                value={localData.strategy}
                onValueChange={(value) => updateData({ strategy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing strategy" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      <div>
                        <div className="font-medium">{strategy.label}</div>
                        <div className="text-sm text-muted-foreground">{strategy.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing-model">Pricing Model</Label>
              <Select
                value={localData.model}
                onValueChange={(value) => updateData({ model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pricing Tiers
                </span>
                <Button onClick={addPricingTier} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </CardTitle>
              <CardDescription>
                Define different pricing tiers for your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData.tiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pricing tiers defined. Click "Add Tier" to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {localData.tiers.map((tier, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Tier {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePricingTier(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Tier Name</Label>
                            <Input
                              value={tier.name}
                              onChange={(e) => updatePricingTier(index, { name: e.target.value })}
                              placeholder="e.g., Basic, Pro, Enterprise"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={tier.price}
                              onChange={(e) => updatePricingTier(index, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Target Audience</Label>
                            <Input
                              value={tier.target}
                              onChange={(e) => updatePricingTier(index, { target: e.target.value })}
                              placeholder="e.g., Small businesses, Enterprises"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Features</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addFeatureToTier(index)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Feature
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {tier.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-2">
                                <Input
                                  value={feature}
                                  onChange={(e) => updateTierFeature(index, featureIndex, e.target.value)}
                                  placeholder="Feature description"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFeatureFromTier(index, featureIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Competitive Analysis
                </span>
                <Button onClick={addCompetitor} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Competitor
                </Button>
              </CardTitle>
              <CardDescription>
                Analyze competitor pricing and positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localData.competitiveAnalysis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No competitors analyzed. Click "Add Competitor" to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {localData.competitiveAnalysis.map((competitor, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Competitor {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCompetitor(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Competitor Name</Label>
                            <Input
                              value={competitor.competitor}
                              onChange={(e) => updateCompetitor(index, { competitor: e.target.value })}
                              placeholder="Competitor name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={competitor.price}
                              onChange={(e) => updateCompetitor(index, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Market Positioning</Label>
                          <Textarea
                            value={competitor.positioning}
                            onChange={(e) => updateCompetitor(index, { positioning: e.target.value })}
                            placeholder="How does this competitor position themselves in the market?"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Key Features</Label>
                          <Textarea
                            value={competitor.features.join('\n')}
                            onChange={(e) => updateCompetitor(index, { features: e.target.value.split('\n').filter(f => f.trim()) })}
                            placeholder="List key features (one per line)"
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
