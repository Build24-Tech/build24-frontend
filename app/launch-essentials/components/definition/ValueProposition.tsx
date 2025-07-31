'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductDefinitionData } from '@/types/launch-essentials';
import { HelpCircle, Plus, Target, X } from 'lucide-react';
import { useState } from 'react';

interface ValuePropositionProps {
  data: ProductDefinitionData['valueProposition'];
  onChange: (data: ProductDefinitionData['valueProposition']) => void;
}

const CANVAS_SECTIONS = [
  {
    key: 'customerJobs' as const,
    title: 'Customer Jobs',
    description: 'What jobs is your customer trying to get done?',
    placeholder: 'e.g., Manage team communications, Track project progress',
    helpText: 'Think about functional, emotional, and social jobs customers are trying to accomplish'
  },
  {
    key: 'painPoints' as const,
    title: 'Pain Points',
    description: 'What pains do customers experience?',
    placeholder: 'e.g., Too many communication tools, Missing important updates',
    helpText: 'Consider undesired outcomes, obstacles, and risks customers face'
  },
  {
    key: 'gainCreators' as const,
    title: 'Gain Creators',
    description: 'How does your product create customer gains?',
    placeholder: 'e.g., Unified dashboard, Real-time notifications',
    helpText: 'Describe how your product creates benefits customers expect or desire'
  },
  {
    key: 'painRelievers' as const,
    title: 'Pain Relievers',
    description: 'How does your product relieve customer pains?',
    placeholder: 'e.g., Single communication hub, Automated status updates',
    helpText: 'Explain how your product eliminates or reduces customer pains'
  },
  {
    key: 'productsServices' as const,
    title: 'Products & Services',
    description: 'What products and services do you offer?',
    placeholder: 'e.g., Team collaboration platform, Mobile app, API integrations',
    helpText: 'List the bundle of products and services that create value'
  }
];

const VALUE_PROP_TEMPLATES = [
  {
    name: 'For [target customer] who [statement of need], our [product] is [product category] that [key benefit]. Unlike [primary competitive alternative], our product [primary differentiation].',
    example: 'For remote teams who struggle with communication, our platform is a collaboration tool that unifies all team interactions. Unlike Slack, our product provides visual project context with every message.'
  },
  {
    name: 'We help [target customer] achieve [desired outcome] by [unique approach] so they can [ultimate benefit].',
    example: 'We help small businesses achieve professional online presence by providing AI-powered website creation so they can compete with larger companies.'
  },
  {
    name: '[Product] is the only [category] that [unique capability] for [target customer] who want [desired outcome].',
    example: 'TaskFlow is the only project management tool that automatically prioritizes tasks based on team capacity for growing companies who want to scale without chaos.'
  }
];

export function ValueProposition({ data, onChange }: ValuePropositionProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCanvasHelp, setShowCanvasHelp] = useState(false);

  const handleCanvasChange = (key: keyof typeof data.canvas, items: string[]) => {
    onChange({
      ...data,
      canvas: {
        ...data.canvas,
        [key]: items
      }
    });
  };

  const addCanvasItem = (key: keyof typeof data.canvas, item: string) => {
    if (item.trim()) {
      const currentItems = data.canvas[key] as string[];
      handleCanvasChange(key, [...currentItems, item.trim()]);
    }
  };

  const removeCanvasItem = (key: keyof typeof data.canvas, index: number) => {
    const currentItems = data.canvas[key] as string[];
    handleCanvasChange(key, currentItems.filter((_, i) => i !== index));
  };

  const handleUniqueValueChange = (uniqueValue: string) => {
    onChange({
      ...data,
      uniqueValue
    });
  };

  const applyTemplate = (template: string) => {
    handleUniqueValueChange(template);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-6">
      {/* Value Proposition Canvas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Value Proposition Canvas</CardTitle>
              <CardDescription>
                Map your product's value to customer needs using the proven canvas framework
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCanvasHelp(!showCanvasHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showCanvasHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Value Proposition Canvas Guide</h4>
              <p className="text-sm text-blue-800 mb-3">
                The Value Proposition Canvas helps you design products and services customers actually want.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-medium mb-1">Customer Profile (Right Side)</h5>
                  <ul className="space-y-1">
                    <li>• Customer Jobs: What customers are trying to accomplish</li>
                    <li>• Pain Points: Bad outcomes, obstacles, and risks</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Value Map (Left Side)</h5>
                  <ul className="space-y-1">
                    <li>• Products & Services: What you offer</li>
                    <li>• Pain Relievers: How you solve problems</li>
                    <li>• Gain Creators: How you create benefits</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANVAS_SECTIONS.map((section) => (
              <CanvasSection
                key={section.key}
                title={section.title}
                description={section.description}
                placeholder={section.placeholder}
                helpText={section.helpText}
                items={data.canvas[section.key] as string[]}
                onAdd={(item) => addCanvasItem(section.key, item)}
                onRemove={(index) => removeCanvasItem(section.key, index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unique Value Proposition */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Unique Value Proposition</CardTitle>
              <CardDescription>
                Craft a clear, compelling statement of your unique value
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Target className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showTemplates && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Value Proposition Templates</h4>
              {VALUE_PROP_TEMPLATES.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">{template.name}</p>
                      <p className="text-xs text-gray-500 italic">{template.example}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template.name)}
                      className="ml-2 flex-shrink-0"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="unique-value">Your Unique Value Proposition</Label>
            <Textarea
              id="unique-value"
              placeholder="Enter your unique value proposition..."
              value={data.uniqueValue}
              onChange={(e) => handleUniqueValueChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Make it clear, specific, and focused on customer benefits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition Summary */}
      {data.uniqueValue && Object.values(data.canvas).some(arr => arr.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Value Proposition Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-800 mb-1">Unique Value Proposition</h4>
                <p className="text-sm text-green-700">{data.uniqueValue}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {CANVAS_SECTIONS.map((section) => {
                  const items = data.canvas[section.key] as string[];
                  if (items.length === 0) return null;

                  return (
                    <div key={section.key}>
                      <h5 className="font-medium text-green-800 mb-1">{section.title}</h5>
                      <ul className="text-green-700 space-y-1">
                        {items.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CanvasSectionProps {
  title: string;
  description: string;
  placeholder: string;
  helpText: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
}

function CanvasSection({
  title,
  description,
  placeholder,
  helpText,
  items,
  onAdd,
  onRemove
}: CanvasSectionProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex space-x-2">
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newItem.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded p-2"
            >
              <span className="text-sm text-gray-700 flex-1">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500">{helpText}</p>
      </CardContent>
    </Card>
  );
}
