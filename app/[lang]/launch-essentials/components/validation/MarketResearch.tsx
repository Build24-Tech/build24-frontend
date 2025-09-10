'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationData } from '@/types/launch-essentials';
import { Plus, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface MarketResearchProps {
  data: ValidationData['marketResearch'];
  onChange: (data: ValidationData['marketResearch']) => void;
}

const MARKET_RESEARCH_TEMPLATES = [
  {
    id: 'tam-sam-som',
    name: 'TAM/SAM/SOM Analysis',
    description: 'Total Addressable Market, Serviceable Addressable Market, and Serviceable Obtainable Market',
    questions: [
      'What is the total market size for your product category?',
      'What portion of this market can you realistically serve?',
      'What percentage of the serviceable market can you capture?'
    ]
  },
  {
    id: 'market-trends',
    name: 'Market Trends Analysis',
    description: 'Identify key trends affecting your market',
    questions: [
      'What are the major trends driving growth in your market?',
      'Are there any emerging technologies disrupting the space?',
      'How are customer behaviors and preferences changing?'
    ]
  },
  {
    id: 'market-segmentation',
    name: 'Market Segmentation',
    description: 'Break down your market into distinct segments',
    questions: [
      'What are the main customer segments in your market?',
      'Which segments are growing fastest?',
      'Which segments are underserved?'
    ]
  }
];

const RESEARCH_SOURCES = [
  'Industry reports (IBISWorld, Statista, etc.)',
  'Government data (Census, Bureau of Labor Statistics)',
  'Trade associations and publications',
  'Academic research and studies',
  'Competitor financial reports',
  'Survey data and primary research',
  'Expert interviews',
  'Online databases and tools'
];

export function MarketResearch({ data, onChange }: MarketResearchProps) {
  const [newTrend, setNewTrend] = useState('');
  const [newSource, setNewSource] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleMarketSizeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, marketSize: numValue });
  };

  const handleGrowthRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...data, growthRate: numValue });
  };

  const addTrend = () => {
    if (newTrend.trim()) {
      onChange({ ...data, trends: [...data.trends, newTrend.trim()] });
      setNewTrend('');
    }
  };

  const removeTrend = (index: number) => {
    const updatedTrends = data.trends.filter((_, i) => i !== index);
    onChange({ ...data, trends: updatedTrends });
  };

  const addSource = () => {
    if (newSource.trim()) {
      onChange({ ...data, sources: [...data.sources, newSource.trim()] });
      setNewSource('');
    }
  };

  const addPredefinedSource = (source: string) => {
    if (!data.sources.includes(source)) {
      onChange({ ...data, sources: [...data.sources, source] });
    }
  };

  const removeSource = (index: number) => {
    const updatedSources = data.sources.filter((_, i) => i !== index);
    onChange({ ...data, sources: updatedSources });
  };

  return (
    <div className="space-y-6">
      {/* Research Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Research Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MARKET_RESEARCH_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors ${selectedTemplate === template.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'hover:border-gray-300'
                }`}
              onClick={() => setSelectedTemplate(
                selectedTemplate === template.id ? null : template.id
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              {selectedTemplate === template.id && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Questions:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {template.questions.map((question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Market Size Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Market Size Analysis
          </CardTitle>
          <CardDescription>
            Quantify the market opportunity for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="market-size">Total Market Size (USD)</Label>
              <Input
                id="market-size"
                type="number"
                placeholder="e.g., 1000000000"
                value={data.marketSize || ''}
                onChange={(e) => handleMarketSizeChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the total addressable market size in USD
              </p>
            </div>
            <div>
              <Label htmlFor="growth-rate">Annual Growth Rate (%)</Label>
              <Input
                id="growth-rate"
                type="number"
                step="0.1"
                placeholder="e.g., 15.5"
                value={data.growthRate || ''}
                onChange={(e) => handleGrowthRateChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected annual growth rate of the market
              </p>
            </div>
          </div>

          {data.marketSize > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Market Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Market Size</p>
                  <p className="text-blue-900">
                    ${(data.marketSize / 1000000000).toFixed(1)}B
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Growth Rate</p>
                  <p className="text-blue-900">{data.growthRate}% annually</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">5-Year Projection</p>
                  <p className="text-blue-900">
                    ${((data.marketSize * Math.pow(1 + data.growthRate / 100, 5)) / 1000000000).toFixed(1)}B
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>
            Identify key trends that could impact your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter a market trend..."
              value={newTrend}
              onChange={(e) => setNewTrend(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTrend()}
            />
            <Button onClick={addTrend} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {data.trends.length > 0 && (
            <div className="space-y-2">
              {data.trends.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm">{trend}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrend(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {data.trends.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No trends added yet</p>
              <p className="text-sm">Add market trends that could impact your product</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Research Sources</CardTitle>
          <CardDescription>
            Document your research sources for credibility and future reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Sources */}
          <div>
            <Label className="text-sm font-medium">Common Sources</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {RESEARCH_SOURCES.map((source) => (
                <Button
                  key={source}
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedSource(source)}
                  disabled={data.sources.includes(source)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {source}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Source Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add custom research source..."
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSource()}
            />
            <Button onClick={addSource} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Sources List */}
          {data.sources.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Sources</Label>
              {data.sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm">{source}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSource(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
