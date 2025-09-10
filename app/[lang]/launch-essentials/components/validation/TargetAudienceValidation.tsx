'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPersona, ValidationData } from '@/types/launch-essentials';
import { Plus, Trash2, User, Users, X } from 'lucide-react';
import { useState } from 'react';

interface TargetAudienceValidationProps {
  data: ValidationData['targetAudience'];
  onChange: (data: ValidationData['targetAudience']) => void;
}

const PERSONA_TEMPLATES = [
  {
    id: 'b2b-decision-maker',
    name: 'B2B Decision Maker',
    description: 'Business professional who makes purchasing decisions',
    template: {
      demographics: {
        age: '35-50',
        location: 'Urban areas',
        occupation: 'Manager/Director',
        income: '$75,000-$150,000'
      },
      psychographics: {
        goals: ['Increase efficiency', 'Reduce costs', 'Improve team performance'],
        painPoints: ['Limited budget', 'Time constraints', 'Complex processes'],
        motivations: ['Career advancement', 'Team success', 'ROI'],
        behaviors: ['Research-driven', 'Risk-averse', 'Collaborative']
      },
      technographics: {
        devices: ['Laptop', 'Smartphone', 'Tablet'],
        platforms: ['LinkedIn', 'Email', 'Industry publications'],
        techSavviness: 'medium' as const
      }
    }
  },
  {
    id: 'consumer-early-adopter',
    name: 'Consumer Early Adopter',
    description: 'Tech-savvy consumer who tries new products first',
    template: {
      demographics: {
        age: '25-40',
        location: 'Urban/Suburban',
        occupation: 'Professional/Creative',
        income: '$50,000-$100,000'
      },
      psychographics: {
        goals: ['Stay ahead of trends', 'Optimize lifestyle', 'Share experiences'],
        painPoints: ['Information overload', 'Product reliability', 'Value for money'],
        motivations: ['Innovation', 'Status', 'Convenience'],
        behaviors: ['Active on social media', 'Reads reviews', 'Influences others']
      },
      technographics: {
        devices: ['Smartphone', 'Laptop', 'Smart home devices'],
        platforms: ['Twitter', 'Instagram', 'YouTube', 'Reddit'],
        techSavviness: 'high' as const
      }
    }
  },
  {
    id: 'small-business-owner',
    name: 'Small Business Owner',
    description: 'Entrepreneur running a small to medium business',
    template: {
      demographics: {
        age: '30-55',
        location: 'Various',
        occupation: 'Business Owner',
        income: '$40,000-$200,000'
      },
      psychographics: {
        goals: ['Grow business', 'Increase revenue', 'Improve operations'],
        painPoints: ['Limited resources', 'Wearing many hats', 'Competition'],
        motivations: ['Independence', 'Financial success', 'Customer satisfaction'],
        behaviors: ['Hands-on', 'Cost-conscious', 'Relationship-focused']
      },
      technographics: {
        devices: ['Smartphone', 'Laptop'],
        platforms: ['Facebook', 'Google', 'Industry forums'],
        techSavviness: 'medium' as const
      }
    }
  }
];

const VALIDATION_METHODS = [
  'User interviews',
  'Surveys and questionnaires',
  'Focus groups',
  'A/B testing',
  'Landing page validation',
  'Social media engagement',
  'Customer development interviews',
  'Prototype testing',
  'Market research studies',
  'Competitor analysis'
];

export function TargetAudienceValidation({ data, onChange }: TargetAudienceValidationProps) {
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newPersona, setNewPersona] = useState<Partial<UserPersona>>({
    name: '',
    demographics: {
      age: '',
      location: '',
      occupation: '',
      income: ''
    },
    psychographics: {
      goals: [],
      painPoints: [],
      motivations: [],
      behaviors: []
    },
    technographics: {
      devices: [],
      platforms: [],
      techSavviness: 'medium'
    }
  });

  const addPersona = () => {
    if (newPersona.name) {
      const persona: UserPersona = {
        id: `persona-${Date.now()}`,
        name: newPersona.name,
        demographics: newPersona.demographics || {
          age: '',
          location: '',
          occupation: '',
          income: ''
        },
        psychographics: newPersona.psychographics || {
          goals: [],
          painPoints: [],
          motivations: [],
          behaviors: []
        },
        technographics: newPersona.technographics || {
          devices: [],
          platforms: [],
          techSavviness: 'medium'
        }
      };

      onChange({
        ...data,
        personas: [...data.personas, persona]
      });

      resetNewPersona();
      setShowAddPersona(false);
    }
  };

  const resetNewPersona = () => {
    setNewPersona({
      name: '',
      demographics: {
        age: '',
        location: '',
        occupation: '',
        income: ''
      },
      psychographics: {
        goals: [],
        painPoints: [],
        motivations: [],
        behaviors: []
      },
      technographics: {
        devices: [],
        platforms: [],
        techSavviness: 'medium'
      }
    });
    setSelectedTemplate('');
  };

  const removePersona = (index: number) => {
    const updatedPersonas = data.personas.filter((_, i) => i !== index);
    onChange({ ...data, personas: updatedPersonas });
  };

  const updatePersona = (index: number, updates: Partial<UserPersona>) => {
    const updatedPersonas = data.personas.map((persona, i) =>
      i === index ? { ...persona, ...updates } : persona
    );
    onChange({ ...data, personas: updatedPersonas });
  };

  const applyTemplate = (templateId: string) => {
    const template = PERSONA_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setNewPersona({
        ...newPersona,
        ...template.template
      });
    }
  };

  const addToPersonaArray = (
    personaIndex: number,
    field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms',
    value: string
  ) => {
    if (value.trim()) {
      const persona = data.personas[personaIndex];
      const section = field === 'devices' || field === 'platforms' ? 'technographics' : 'psychographics';
      const currentArray = persona[section][field] as string[];

      updatePersona(personaIndex, {
        [section]: {
          ...persona[section],
          [field]: [...currentArray, value.trim()]
        }
      });
    }
  };

  const removeFromPersonaArray = (
    personaIndex: number,
    field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms',
    itemIndex: number
  ) => {
    const persona = data.personas[personaIndex];
    const section = field === 'devices' || field === 'platforms' ? 'technographics' : 'psychographics';
    const currentArray = persona[section][field] as string[];

    updatePersona(personaIndex, {
      [section]: {
        ...persona[section],
        [field]: currentArray.filter((_, i) => i !== itemIndex)
      }
    });
  };

  const calculateValidationScore = () => {
    // Simple scoring based on completeness and validation methods
    let score = 0;

    // Personas completeness (40 points)
    if (data.personas.length > 0) {
      score += Math.min(data.personas.length * 10, 40);
    }

    // Interview results (40 points)
    if (data.interviewResults.length > 0) {
      score += Math.min(data.interviewResults.length * 8, 40);
    }

    // Persona detail completeness (20 points)
    const avgPersonaCompleteness = data.personas.reduce((acc, persona) => {
      let personaScore = 0;
      if (persona.demographics.age) personaScore += 2;
      if (persona.demographics.occupation) personaScore += 2;
      if (persona.psychographics.goals.length > 0) personaScore += 3;
      if (persona.psychographics.painPoints.length > 0) personaScore += 3;
      return acc + personaScore;
    }, 0) / Math.max(data.personas.length, 1);

    score += Math.min(avgPersonaCompleteness * 2, 20);

    return Math.round(score);
  };

  const validationScore = calculateValidationScore();

  return (
    <div className="space-y-6">
      {/* Persona Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Persona Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERSONA_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                setSelectedTemplate(template.id);
                setShowAddPersona(true);
                applyTemplate(template.id);
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* User Personas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Personas
              </CardTitle>
              <CardDescription>
                Define your target user segments with detailed personas
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddPersona(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Persona
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Persona Form */}
          {showAddPersona && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Create New Persona</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddPersona(false);
                      resetNewPersona();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div>
                  <Label>Use Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a persona template" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONA_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(selectedTemplate)}
                      className="mt-2"
                    >
                      Apply Template
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  <Label htmlFor="persona-name">Persona Name *</Label>
                  <Input
                    id="persona-name"
                    placeholder="e.g., Tech-Savvy Manager"
                    value={newPersona.name || ''}
                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                  />
                </div>

                {/* Demographics */}
                <div>
                  <Label className="text-sm font-medium">Demographics</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="persona-age" className="text-xs">Age Range</Label>
                      <Input
                        id="persona-age"
                        placeholder="e.g., 25-35"
                        value={newPersona.demographics?.age || ''}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          demographics: { ...newPersona.demographics!, age: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-location" className="text-xs">Location</Label>
                      <Input
                        id="persona-location"
                        placeholder="e.g., Urban areas"
                        value={newPersona.demographics?.location || ''}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          demographics: { ...newPersona.demographics!, location: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-occupation" className="text-xs">Occupation</Label>
                      <Input
                        id="persona-occupation"
                        placeholder="e.g., Software Engineer"
                        value={newPersona.demographics?.occupation || ''}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          demographics: { ...newPersona.demographics!, occupation: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona-income" className="text-xs">Income Range</Label>
                      <Input
                        id="persona-income"
                        placeholder="e.g., $50,000-$80,000"
                        value={newPersona.demographics?.income || ''}
                        onChange={(e) => setNewPersona({
                          ...newPersona,
                          demographics: { ...newPersona.demographics!, income: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Tech Savviness */}
                <div>
                  <Label>Tech Savviness</Label>
                  <Select
                    value={newPersona.technographics?.techSavviness || 'medium'}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setNewPersona({
                      ...newPersona,
                      technographics: { ...newPersona.technographics!, techSavviness: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Basic technology use</SelectItem>
                      <SelectItem value="medium">Medium - Comfortable with technology</SelectItem>
                      <SelectItem value="high">High - Early adopter, tech enthusiast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddPersona(false);
                    resetNewPersona();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addPersona}
                    disabled={!newPersona.name}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Create Persona
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personas List */}
          {data.personas.length > 0 ? (
            <div className="space-y-4">
              {data.personas.map((persona, index) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onUpdate={(updates) => updatePersona(index, updates)}
                  onRemove={() => removePersona(index)}
                  onAddToArray={(field, value) => addToPersonaArray(index, field, value)}
                  onRemoveFromArray={(field, itemIndex) => removeFromPersonaArray(index, field, itemIndex)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No personas created yet</p>
              <p className="text-sm">Create user personas to define your target audience</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Score */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Score</CardTitle>
          <CardDescription>
            Overall score based on persona completeness and validation activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Validation Progress</span>
                <span>{validationScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${validationScore >= 80 ? 'bg-green-500' :
                      validationScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`}
                  style={{ width: `${validationScore}%` }}
                />
              </div>
            </div>
            <div className={`text-2xl font-bold ${validationScore >= 80 ? 'text-green-600' :
                validationScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
              }`}>
              {validationScore >= 80 ? '✓' : validationScore >= 60 ? '⚠' : '✗'}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Recommendations:</p>
            <ul className="mt-2 space-y-1">
              {data.personas.length === 0 && (
                <li>• Create at least one detailed user persona</li>
              )}
              {data.personas.length > 0 && data.personas.length < 3 && (
                <li>• Consider creating 2-3 personas for better coverage</li>
              )}
              {data.interviewResults.length === 0 && (
                <li>• Conduct user interviews to validate your personas</li>
              )}
              {validationScore < 60 && (
                <li>• Add more detail to your personas (goals, pain points, etc.)</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PersonaCardProps {
  persona: UserPersona;
  onUpdate: (updates: Partial<UserPersona>) => void;
  onRemove: () => void;
  onAddToArray: (field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms', value: string) => void;
  onRemoveFromArray: (field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms', index: number) => void;
}

function PersonaCard({ persona, onUpdate, onRemove, onAddToArray, onRemoveFromArray }: PersonaCardProps) {
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  const handleAddToArray = (field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms') => {
    const value = newValues[field];
    if (value?.trim()) {
      onAddToArray(field, value);
      setNewValues({ ...newValues, [field]: '' });
    }
  };

  const ArraySection = ({
    title,
    field,
    items,
    placeholder,
    colorClass
  }: {
    title: string;
    field: 'goals' | 'painPoints' | 'motivations' | 'behaviors' | 'devices' | 'platforms';
    items: string[];
    placeholder: string;
    colorClass: string;
  }) => (
    <div>
      <Label className="text-sm font-medium">{title}</Label>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className={`flex items-center justify-between p-2 ${colorClass} rounded`}>
            <span className="text-sm">{item}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFromArray(field, index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex space-x-2">
          <Input
            placeholder={placeholder}
            value={newValues[field] || ''}
            onChange={(e) => setNewValues({ ...newValues, [field]: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleAddToArray(field)}
            className="text-sm"
          />
          <Button size="sm" onClick={() => handleAddToArray(field)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              {persona.name}
            </CardTitle>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Age:</span> {persona.demographics.age || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Location:</span> {persona.demographics.location || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Occupation:</span> {persona.demographics.occupation || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Income:</span> {persona.demographics.income || 'Not specified'}
              </div>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArraySection
            title="Goals"
            field="goals"
            items={persona.psychographics.goals}
            placeholder="Add goal..."
            colorClass="bg-blue-50"
          />
          <ArraySection
            title="Pain Points"
            field="painPoints"
            items={persona.psychographics.painPoints}
            placeholder="Add pain point..."
            colorClass="bg-red-50"
          />
          <ArraySection
            title="Motivations"
            field="motivations"
            items={persona.psychographics.motivations}
            placeholder="Add motivation..."
            colorClass="bg-green-50"
          />
          <ArraySection
            title="Behaviors"
            field="behaviors"
            items={persona.psychographics.behaviors}
            placeholder="Add behavior..."
            colorClass="bg-purple-50"
          />
          <ArraySection
            title="Devices"
            field="devices"
            items={persona.technographics.devices}
            placeholder="Add device..."
            colorClass="bg-gray-50"
          />
          <ArraySection
            title="Platforms"
            field="platforms"
            items={persona.technographics.platforms}
            placeholder="Add platform..."
            colorClass="bg-yellow-50"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Tech Savviness</Label>
          <Select
            value={persona.technographics.techSavviness}
            onValueChange={(value: 'low' | 'medium' | 'high') =>
              onUpdate({
                technographics: { ...persona.technographics, techSavviness: value }
              })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Basic technology use</SelectItem>
              <SelectItem value="medium">Medium - Comfortable with technology</SelectItem>
              <SelectItem value="high">High - Early adopter, tech enthusiast</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
