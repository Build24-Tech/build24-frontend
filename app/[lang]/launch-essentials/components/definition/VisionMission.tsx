'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductDefinitionData } from '@/types/launch-essentials';
import { HelpCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface VisionMissionProps {
  data: ProductDefinitionData['vision'];
  onChange: (data: ProductDefinitionData['vision']) => void;
}

const VISION_TEMPLATES = [
  {
    name: 'Problem-Solution Vision',
    template: 'To solve [problem] for [target audience] by providing [solution] that [unique benefit].',
    example: 'To solve communication barriers for remote teams by providing an intuitive collaboration platform that makes distributed work feel seamless.'
  },
  {
    name: 'Aspirational Vision',
    template: 'A world where [desired outcome] through [your contribution].',
    example: 'A world where every small business can compete globally through accessible e-commerce technology.'
  },
  {
    name: 'Impact Vision',
    template: 'Empowering [target group] to [achieve goal] by [method/approach].',
    example: 'Empowering content creators to build sustainable businesses by democratizing audience monetization tools.'
  }
];

const MISSION_ALIGNMENT_QUESTIONS = [
  'How does this product align with your personal or company mission?',
  'What core values does this product embody?',
  'How will this product make a meaningful difference?',
  'What legacy do you want this product to create?',
  'How does this product fit into your broader vision for the future?'
];

export function VisionMission({ data, onChange }: VisionMissionProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const handleVisionChange = (statement: string) => {
    onChange({
      ...data,
      statement
    });
  };

  const handleMissionAlignmentChange = (missionAlignment: string) => {
    onChange({
      ...data,
      missionAlignment
    });
  };

  const applyTemplate = (template: string) => {
    handleVisionChange(template);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-6">
      {/* Vision Statement Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vision Statement</CardTitle>
              <CardDescription>
                Define what you want your product to achieve in the world
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuidance(!showGuidance)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Guidance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showGuidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Vision Statement Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep it concise but inspiring (1-2 sentences)</li>
                <li>• Focus on the impact you want to create</li>
                <li>• Make it memorable and motivating</li>
                <li>• Avoid technical jargon or implementation details</li>
                <li>• Think 5-10 years into the future</li>
              </ul>
            </div>
          )}

          {showTemplates && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Vision Statement Templates</h4>
              {VISION_TEMPLATES.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm text-gray-900">{template.name}</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template.template)}
                    >
                      Use Template
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.template}</p>
                  <p className="text-xs text-gray-500 italic">Example: {template.example}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vision-statement">Your Vision Statement</Label>
            <Textarea
              id="vision-statement"
              placeholder="Enter your product vision statement..."
              value={data.statement}
              onChange={(e) => handleVisionChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {data.statement.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mission Alignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mission Alignment</CardTitle>
          <CardDescription>
            Explain how this product aligns with your broader mission and values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Reflection Questions</h4>
            <ul className="space-y-2">
              {MISSION_ALIGNMENT_QUESTIONS.map((question, index) => (
                <li key={index} className="text-sm text-gray-700">
                  • {question}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission-alignment">Mission Alignment</Label>
            <Textarea
              id="mission-alignment"
              placeholder="Describe how this product aligns with your mission and values..."
              value={data.missionAlignment}
              onChange={(e) => handleMissionAlignmentChange(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Consider your personal values, company mission, and the impact you want to create
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {data.statement && data.missionAlignment && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Vision & Mission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-800 mb-1">Vision</h4>
                <p className="text-sm text-green-700">{data.statement}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Mission Alignment</h4>
                <p className="text-sm text-green-700">{data.missionAlignment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
