'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Feature, ProductDefinitionData } from '@/types/launch-essentials';
import { Calculator, HelpCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface FeaturePrioritizationProps {
  data: ProductDefinitionData['features'];
  onChange: (data: ProductDefinitionData['features']) => void;
}

const PRIORITIZATION_METHODS = [
  {
    value: 'moscow',
    label: 'MoSCoW Method',
    description: 'Must have, Should have, Could have, Won\'t have'
  },
  {
    value: 'kano',
    label: 'Kano Model',
    description: 'Basic, Performance, Excitement features'
  },
  {
    value: 'rice',
    label: 'RICE Framework',
    description: 'Reach, Impact, Confidence, Effort scoring'
  },
  {
    value: 'value-effort',
    label: 'Value vs Effort',
    description: 'Simple value and effort matrix'
  }
];

const MOSCOW_PRIORITIES = [
  { value: 'must-have', label: 'Must Have', color: 'bg-red-100 text-red-800' },
  { value: 'should-have', label: 'Should Have', color: 'bg-orange-100 text-orange-800' },
  { value: 'could-have', label: 'Could Have', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'wont-have', label: 'Won\'t Have', color: 'bg-gray-100 text-gray-800' }
];

const EFFORT_LEVELS = [
  { value: 'low', label: 'Low', description: '1-2 weeks' },
  { value: 'medium', label: 'Medium', description: '1-2 months' },
  { value: 'high', label: 'High', description: '3+ months' }
];

const IMPACT_LEVELS = [
  { value: 'low', label: 'Low', description: 'Nice to have' },
  { value: 'medium', label: 'Medium', description: 'Valuable improvement' },
  { value: 'high', label: 'High', description: 'Game changer' }
];

export function FeaturePrioritization({ data, onChange }: FeaturePrioritizationProps) {
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [showMethodHelp, setShowMethodHelp] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({
    name: '',
    description: '',
    priority: 'must-have',
    effort: 'medium',
    impact: 'medium',
    dependencies: []
  });

  const handleMethodChange = (method: string) => {
    onChange({
      ...data,
      prioritization: {
        ...data.prioritization,
        method: method as any,
        results: [] // Reset results when method changes
      }
    });
  };

  const addFeature = () => {
    if (!newFeature.name || !newFeature.description) return;

    const feature: Feature = {
      id: Date.now().toString(),
      name: newFeature.name,
      description: newFeature.description,
      priority: newFeature.priority as any,
      effort: newFeature.effort as any,
      impact: newFeature.impact as any,
      dependencies: newFeature.dependencies || []
    };

    onChange({
      ...data,
      coreFeatures: [...data.coreFeatures, feature]
    });

    setNewFeature({
      name: '',
      description: '',
      priority: 'must-have',
      effort: 'medium',
      impact: 'medium',
      dependencies: []
    });
    setShowAddFeature(false);
  };

  const removeFeature = (id: string) => {
    onChange({
      ...data,
      coreFeatures: data.coreFeatures.filter(f => f.id !== id)
    });
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    onChange({
      ...data,
      coreFeatures: data.coreFeatures.map(f =>
        f.id === id ? { ...f, ...updates } : f
      )
    });
  };

  const calculatePrioritization = () => {
    const results = data.coreFeatures.map((feature, index) => {
      let score = 0;

      switch (data.prioritization.method) {
        case 'moscow':
          const priorityScores = { 'must-have': 4, 'should-have': 3, 'could-have': 2, 'wont-have': 1 };
          score = priorityScores[feature.priority];
          break;

        case 'value-effort':
          const impactScores = { high: 3, medium: 2, low: 1 };
          const effortScores = { low: 3, medium: 2, high: 1 }; // Inverse for effort
          score = impactScores[feature.impact] * effortScores[feature.effort];
          break;

        case 'rice':
          // Simplified RICE calculation
          const reach = 100; // Default reach
          const impact = { high: 3, medium: 2, low: 1 }[feature.impact];
          const confidence = 0.8; // Default confidence
          const effort = { low: 1, medium: 2, high: 3 }[feature.effort];
          score = (reach * impact * confidence) / effort;
          break;

        case 'kano':
          // Simplified Kano scoring based on impact
          score = { high: 3, medium: 2, low: 1 }[feature.impact];
          break;
      }

      return {
        featureId: feature.id,
        score,
        ranking: 0 // Will be set after sorting
      };
    });

    // Sort by score and assign rankings
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.ranking = index + 1;
    });

    onChange({
      ...data,
      prioritization: {
        ...data.prioritization,
        results
      }
    });
  };

  const getSortedFeatures = () => {
    if (data.prioritization.results.length === 0) {
      return data.coreFeatures;
    }

    return data.coreFeatures.sort((a, b) => {
      const aResult = data.prioritization.results.find(r => r.featureId === a.id);
      const bResult = data.prioritization.results.find(r => r.featureId === b.id);

      if (!aResult || !bResult) return 0;
      return aResult.ranking - bResult.ranking;
    });
  };

  return (
    <div className="space-y-6">
      {/* Prioritization Method Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Prioritization Method</CardTitle>
              <CardDescription>
                Choose a framework to prioritize your features
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMethodHelp(!showMethodHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showMethodHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Prioritization Methods</h4>
              <div className="space-y-2 text-sm text-blue-800">
                {PRIORITIZATION_METHODS.map((method) => (
                  <div key={method.value}>
                    <span className="font-medium">{method.label}:</span> {method.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIORITIZATION_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => handleMethodChange(method.value)}
                className={`text-left p-4 rounded-lg border transition-colors ${data.prioritization.method === method.value
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h4 className="font-medium text-gray-900">{method.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Core Features</CardTitle>
              <CardDescription>
                Define and prioritize your product's core features
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {data.coreFeatures.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calculatePrioritization}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Priority
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowAddFeature(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Feature Form */}
          {showAddFeature && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-base">Add New Feature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature-name">Feature Name</Label>
                    <Input
                      id="feature-name"
                      placeholder="e.g., User Authentication"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feature-priority">Priority</Label>
                    <Select
                      value={newFeature.priority}
                      onValueChange={(value) => setNewFeature({ ...newFeature, priority: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOSCOW_PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-description">Description</Label>
                  <Textarea
                    id="feature-description"
                    placeholder="Describe what this feature does and why it's important..."
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feature-effort">Development Effort</Label>
                    <Select
                      value={newFeature.effort}
                      onValueChange={(value) => setNewFeature({ ...newFeature, effort: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EFFORT_LEVELS.map((effort) => (
                          <SelectItem key={effort.value} value={effort.value}>
                            {effort.label} - {effort.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feature-impact">Business Impact</Label>
                    <Select
                      value={newFeature.impact}
                      onValueChange={(value) => setNewFeature({ ...newFeature, impact: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_LEVELS.map((impact) => (
                          <SelectItem key={impact.value} value={impact.value}>
                            {impact.label} - {impact.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddFeature(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addFeature}
                    disabled={!newFeature.name || !newFeature.description}
                  >
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features List */}
          <div className="space-y-3">
            {getSortedFeatures().map((feature, index) => {
              const result = data.prioritization.results.find(r => r.featureId === feature.id);
              const priorityConfig = MOSCOW_PRIORITIES.find(p => p.value === feature.priority);

              return (
                <Card key={feature.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {result && (
                            <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              {result.ranking}
                            </div>
                          )}
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig?.color}`}>
                            {priorityConfig?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Effort: {feature.effort}</span>
                          <span>Impact: {feature.impact}</span>
                          {result && (
                            <span>Score: {result.score.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data.coreFeatures.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No features added yet. Click "Add Feature" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prioritization Results */}
      {data.prioritization.results.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Prioritization Results</CardTitle>
            <CardDescription className="text-green-700">
              Features ranked by {PRIORITIZATION_METHODS.find(m => m.value === data.prioritization.method)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.prioritization.results
                .sort((a, b) => a.ranking - b.ranking)
                .map((result) => {
                  const feature = data.coreFeatures.find(f => f.id === result.featureId);
                  if (!feature) return null;

                  return (
                    <div key={result.featureId} className="flex items-center justify-between bg-white rounded p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {result.ranking}
                        </div>
                        <span className="font-medium text-green-900">{feature.name}</span>
                      </div>
                      <span className="text-sm text-green-700">Score: {result.score.toFixed(1)}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
