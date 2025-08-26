'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Competitor, ValidationData } from '@/types/launch-essentials';
import { ExternalLink, Plus, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';

interface CompetitorAnalysisProps {
  data: ValidationData['competitorAnalysis'];
  onChange: (data: ValidationData['competitorAnalysis']) => void;
}

const COMPETITOR_ANALYSIS_FRAMEWORKS = [
  {
    id: 'direct-indirect',
    name: 'Direct vs Indirect Competitors',
    description: 'Categorize competitors by how directly they compete with your solution',
    categories: ['Direct Competitors', 'Indirect Competitors', 'Substitute Products']
  },
  {
    id: 'competitive-positioning',
    name: 'Competitive Positioning Map',
    description: 'Plot competitors on key dimensions like price vs features',
    dimensions: ['Price', 'Features', 'Quality', 'Market Share', 'Brand Recognition']
  },
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    factors: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats']
  }
];

const ANALYSIS_CRITERIA = [
  'Product Features',
  'Pricing Strategy',
  'Market Share',
  'Brand Recognition',
  'Customer Reviews',
  'Marketing Approach',
  'Technology Stack',
  'Team & Funding',
  'Geographic Presence',
  'Customer Support'
];

export function CompetitorAnalysis({ data, onChange }: CompetitorAnalysisProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    name: '',
    description: '',
    strengths: [],
    weaknesses: [],
    marketShare: 0,
    pricing: 0,
    url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addCompetitor = () => {
    if (newCompetitor.name && newCompetitor.description) {
      const competitor: Competitor = {
        name: newCompetitor.name,
        description: newCompetitor.description,
        strengths: newCompetitor.strengths || [],
        weaknesses: newCompetitor.weaknesses || [],
        marketShare: newCompetitor.marketShare || 0,
        pricing: newCompetitor.pricing || 0,
        url: newCompetitor.url || undefined
      };

      onChange({
        ...data,
        competitors: [...data.competitors, competitor]
      });

      setNewCompetitor({
        name: '',
        description: '',
        strengths: [],
        weaknesses: [],
        marketShare: 0,
        pricing: 0,
        url: ''
      });
      setShowAddForm(false);
    }
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = data.competitors.filter((_, i) => i !== index);
    onChange({ ...data, competitors: updatedCompetitors });
  };

  const updateCompetitor = (index: number, updates: Partial<Competitor>) => {
    const updatedCompetitors = data.competitors.map((competitor, i) =>
      i === index ? { ...competitor, ...updates } : competitor
    );
    onChange({ ...data, competitors: updatedCompetitors });
  };

  const addStrengthToCompetitor = (competitorIndex: number, strength: string) => {
    if (strength.trim()) {
      const competitor = data.competitors[competitorIndex];
      updateCompetitor(competitorIndex, {
        strengths: [...competitor.strengths, strength.trim()]
      });
    }
  };

  const addWeaknessToCompetitor = (competitorIndex: number, weakness: string) => {
    if (weakness.trim()) {
      const competitor = data.competitors[competitorIndex];
      updateCompetitor(competitorIndex, {
        weaknesses: [...competitor.weaknesses, weakness.trim()]
      });
    }
  };

  const removeStrengthFromCompetitor = (competitorIndex: number, strengthIndex: number) => {
    const competitor = data.competitors[competitorIndex];
    const updatedStrengths = competitor.strengths.filter((_, i) => i !== strengthIndex);
    updateCompetitor(competitorIndex, { strengths: updatedStrengths });
  };

  const removeWeaknessFromCompetitor = (competitorIndex: number, weaknessIndex: number) => {
    const competitor = data.competitors[competitorIndex];
    const updatedWeaknesses = competitor.weaknesses.filter((_, i) => i !== weaknessIndex);
    updateCompetitor(competitorIndex, { weaknesses: updatedWeaknesses });
  };

  return (
    <div className="space-y-6">
      {/* Analysis Frameworks */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Analysis Frameworks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMPETITOR_ANALYSIS_FRAMEWORKS.map((framework) => (
            <Card
              key={framework.id}
              className={`cursor-pointer transition-colors ${selectedFramework === framework.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'hover:border-gray-300'
                }`}
              onClick={() => setSelectedFramework(
                selectedFramework === framework.id ? null : framework.id
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{framework.name}</CardTitle>
                <CardDescription className="text-sm">
                  {framework.description}
                </CardDescription>
              </CardHeader>
              {selectedFramework === framework.id && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {framework.categories ? 'Categories:' :
                        framework.dimensions ? 'Dimensions:' : 'Factors:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(framework.categories || framework.dimensions || framework.factors || []).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Competitors List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Competitor Analysis
              </CardTitle>
              <CardDescription>
                Identify and analyze your key competitors
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Competitor Form */}
          {showAddForm && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Add New Competitor</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="competitor-name">Company Name *</Label>
                    <Input
                      id="competitor-name"
                      placeholder="e.g., Competitor Inc."
                      value={newCompetitor.name || ''}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitor-url">Website URL</Label>
                    <Input
                      id="competitor-url"
                      placeholder="https://competitor.com"
                      value={newCompetitor.url || ''}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="competitor-description">Description *</Label>
                  <Textarea
                    id="competitor-description"
                    placeholder="Brief description of the competitor and their product..."
                    value={newCompetitor.description || ''}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="competitor-market-share">Market Share (%)</Label>
                    <Input
                      id="competitor-market-share"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 15.5"
                      value={newCompetitor.marketShare || ''}
                      onChange={(e) => setNewCompetitor({
                        ...newCompetitor,
                        marketShare: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competitor-pricing">Starting Price (USD)</Label>
                    <Input
                      id="competitor-pricing"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 29.99"
                      value={newCompetitor.pricing || ''}
                      onChange={(e) => setNewCompetitor({
                        ...newCompetitor,
                        pricing: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addCompetitor}
                    disabled={!newCompetitor.name || !newCompetitor.description}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Add Competitor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitors List */}
          {data.competitors.length > 0 ? (
            <div className="space-y-4">
              {data.competitors.map((competitor, index) => (
                <CompetitorCard
                  key={index}
                  competitor={competitor}
                  onUpdate={(updates) => updateCompetitor(index, updates)}
                  onRemove={() => removeCompetitor(index)}
                  onAddStrength={(strength) => addStrengthToCompetitor(index, strength)}
                  onAddWeakness={(weakness) => addWeaknessToCompetitor(index, weakness)}
                  onRemoveStrength={(strengthIndex) => removeStrengthFromCompetitor(index, strengthIndex)}
                  onRemoveWeakness={(weaknessIndex) => removeWeaknessFromCompetitor(index, weaknessIndex)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No competitors added yet</p>
              <p className="text-sm">Add competitors to analyze the competitive landscape</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitive Advantage */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Advantage</CardTitle>
          <CardDescription>
            Define what makes your product unique and better than competitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="competitive-advantage">Your Competitive Advantage</Label>
            <Textarea
              id="competitive-advantage"
              placeholder="Describe what makes your product unique and better than competitors..."
              value={data.competitiveAdvantage}
              onChange={(e) => onChange({ ...data, competitiveAdvantage: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="market-gap">Market Gap</Label>
            <Textarea
              id="market-gap"
              placeholder="Describe the gap in the market that your product fills..."
              value={data.marketGap}
              onChange={(e) => onChange({ ...data, marketGap: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CompetitorCardProps {
  competitor: Competitor;
  onUpdate: (updates: Partial<Competitor>) => void;
  onRemove: () => void;
  onAddStrength: (strength: string) => void;
  onAddWeakness: (weakness: string) => void;
  onRemoveStrength: (index: number) => void;
  onRemoveWeakness: (index: number) => void;
}

function CompetitorCard({
  competitor,
  onUpdate,
  onRemove,
  onAddStrength,
  onAddWeakness,
  onRemoveStrength,
  onRemoveWeakness
}: CompetitorCardProps) {
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  const handleAddStrength = () => {
    if (newStrength.trim()) {
      onAddStrength(newStrength);
      setNewStrength('');
    }
  };

  const handleAddWeakness = () => {
    if (newWeakness.trim()) {
      onAddWeakness(newWeakness);
      setNewWeakness('');
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{competitor.name}</CardTitle>
              {competitor.url && (
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <CardDescription className="mt-1">
              {competitor.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Market Share</Label>
            <p className="text-lg font-semibold">{competitor.marketShare}%</p>
          </div>
          <div>
            <Label className="text-sm">Starting Price</Label>
            <p className="text-lg font-semibold">${competitor.pricing}</p>
          </div>
        </div>

        {/* Strengths */}
        <div>
          <Label className="text-sm font-medium">Strengths</Label>
          <div className="mt-2 space-y-2">
            {competitor.strengths.map((strength, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm text-green-800">{strength}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveStrength(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="Add strength..."
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStrength()}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddStrength}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <Label className="text-sm font-medium">Weaknesses</Label>
          <div className="mt-2 space-y-2">
            {competitor.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-red-800">{weakness}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveWeakness(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="Add weakness..."
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWeakness()}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddWeakness}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
