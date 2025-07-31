'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InterviewResult, UserPersona } from '@/types/launch-essentials';
import { Calendar, MessageCircle, Plus, Save, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface InterviewGuideProps {
  personas: UserPersona[];
  interviewResults: InterviewResult[];
  onChange: (results: InterviewResult[]) => void;
}

const INTERVIEW_TEMPLATES = [
  {
    id: 'problem-discovery',
    name: 'Problem Discovery',
    description: 'Understand user problems and pain points',
    questions: [
      'Can you walk me through your typical day/workflow?',
      'What are the biggest challenges you face in [relevant area]?',
      'How do you currently solve [specific problem]?',
      'What frustrates you most about current solutions?',
      'If you had a magic wand, what would you change?'
    ]
  },
  {
    id: 'solution-validation',
    name: 'Solution Validation',
    description: 'Test your proposed solution with users',
    questions: [
      'How would you describe this solution in your own words?',
      'What do you like most about this approach?',
      'What concerns do you have about this solution?',
      'How would this fit into your current workflow?',
      'What would convince you to try this solution?'
    ]
  },
  {
    id: 'feature-prioritization',
    name: 'Feature Prioritization',
    description: 'Understand which features matter most',
    questions: [
      'Which of these features would be most valuable to you?',
      'What features are absolutely essential vs nice-to-have?',
      'How would you prioritize these capabilities?',
      'What features are missing from this list?',
      'What would make you choose this over alternatives?'
    ]
  },
  {
    id: 'pricing-willingness',
    name: 'Pricing & Willingness to Pay',
    description: 'Understand pricing sensitivity and value perception',
    questions: [
      'How much do you currently spend on similar solutions?',
      'What would be a reasonable price for this solution?',
      'At what price point would this become too expensive?',
      'What would justify a premium price for you?',
      'How do you typically make purchasing decisions?'
    ]
  }
];

const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', color: 'text-green-600' },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-600' },
  { value: 'negative', label: 'Negative', color: 'text-red-600' }
] as const;

export function InterviewGuide({ personas, interviewResults, onChange }: InterviewGuideProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [newInterview, setNewInterview] = useState<Partial<InterviewResult>>({
    personaId: '',
    date: new Date(),
    responses: [],
    insights: [],
    validationScore: 0
  });
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateId: string) => {
    const template = INTERVIEW_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const responses = template.questions.map(question => ({
        question,
        answer: '',
        sentiment: 'neutral' as const
      }));
      setNewInterview({ ...newInterview, responses });
    }
  };

  const addInterviewResult = () => {
    if (newInterview.personaId && newInterview.responses && newInterview.responses.length > 0) {
      const interview: InterviewResult = {
        personaId: newInterview.personaId,
        date: newInterview.date || new Date(),
        responses: newInterview.responses,
        insights: newInterview.insights || [],
        validationScore: calculateInterviewScore(newInterview.responses)
      };

      onChange([...interviewResults, interview]);
      resetNewInterview();
      setShowAddInterview(false);
    }
  };

  const resetNewInterview = () => {
    setNewInterview({
      personaId: '',
      date: new Date(),
      responses: [],
      insights: [],
      validationScore: 0
    });
    setSelectedTemplate('');
    setCustomQuestions([]);
  };

  const removeInterviewResult = (index: number) => {
    const updatedResults = interviewResults.filter((_, i) => i !== index);
    onChange(updatedResults);
  };

  const calculateInterviewScore = (responses: InterviewResult['responses']): number => {
    if (responses.length === 0) return 0;

    const sentimentScores = {
      positive: 10,
      neutral: 5,
      negative: 2
    };

    const totalScore = responses.reduce((sum, response) => {
      const sentimentScore = sentimentScores[response.sentiment];
      const answerCompleteness = response.answer.length > 20 ? 1 : 0.5;
      return sum + (sentimentScore * answerCompleteness);
    }, 0);

    return Math.round((totalScore / (responses.length * 10)) * 100);
  };

  const updateInterviewResponse = (responseIndex: number, field: 'answer' | 'sentiment', value: string) => {
    const updatedResponses = [...(newInterview.responses || [])];
    updatedResponses[responseIndex] = {
      ...updatedResponses[responseIndex],
      [field]: value
    };
    setNewInterview({ ...newInterview, responses: updatedResponses });
  };

  const addInsight = (insight: string) => {
    if (insight.trim()) {
      setNewInterview({
        ...newInterview,
        insights: [...(newInterview.insights || []), insight.trim()]
      });
    }
  };

  const removeInsight = (index: number) => {
    const updatedInsights = (newInterview.insights || []).filter((_, i) => i !== index);
    setNewInterview({ ...newInterview, insights: updatedInsights });
  };

  const getPersonaName = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    return persona ? persona.name : 'Unknown Persona';
  };

  const getAverageValidationScore = () => {
    if (interviewResults.length === 0) return 0;
    const totalScore = interviewResults.reduce((sum, result) => sum + result.validationScore, 0);
    return Math.round(totalScore / interviewResults.length);
  };

  return (
    <div className="space-y-6">
      {/* Interview Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Interview Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTERVIEW_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors ${selectedTemplate === template.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'hover:border-gray-300'
                }`}
              onClick={() => {
                setSelectedTemplate(template.id);
                if (showAddInterview) {
                  applyTemplate(template.id);
                }
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500">
                  {template.questions.length} questions included
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interview Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Interview Results
              </CardTitle>
              <CardDescription>
                Record and analyze user interview findings
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddInterview(true)}
              disabled={personas.length === 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Interview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {personas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No personas available</p>
              <p className="text-sm">Create user personas first to conduct interviews</p>
            </div>
          )}

          {/* Add Interview Form */}
          {showAddInterview && personas.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Record Interview</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddInterview(false);
                      resetNewInterview();
                    }}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Interview Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Persona</Label>
                    <Select
                      value={newInterview.personaId || ''}
                      onValueChange={(value) => setNewInterview({ ...newInterview, personaId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select persona" />
                      </SelectTrigger>
                      <SelectContent>
                        {personas.map((persona) => (
                          <SelectItem key={persona.id} value={persona.id}>
                            {persona.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Interview Date</Label>
                    <Input
                      type="date"
                      value={newInterview.date?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setNewInterview({
                        ...newInterview,
                        date: new Date(e.target.value)
                      })}
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <Label>Use Template</Label>
                  <div className="flex space-x-2 mt-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose interview template" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
                      disabled={!selectedTemplate}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Custom Questions */}
                <div>
                  <Label>Custom Questions</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Add custom question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomQuestion()}
                    />
                    <Button onClick={addCustomQuestion}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {customQuestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {customQuestions.map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">{question}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomQuestion(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const responses = customQuestions.map(question => ({
                            question,
                            answer: '',
                            sentiment: 'neutral' as const
                          }));
                          setNewInterview({
                            ...newInterview,
                            responses: [...(newInterview.responses || []), ...responses]
                          });
                          setCustomQuestions([]);
                        }}
                      >
                        Add to Interview
                      </Button>
                    </div>
                  )}
                </div>

                {/* Interview Questions & Responses */}
                {newInterview.responses && newInterview.responses.length > 0 && (
                  <div>
                    <Label className="text-base font-medium">Interview Questions</Label>
                    <div className="mt-3 space-y-4">
                      {newInterview.responses.map((response, index) => (
                        <Card key={index} className="border-gray-200">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">
                                  Question {index + 1}
                                </Label>
                                <p className="text-sm text-gray-700 mt-1">
                                  {response.question}
                                </p>
                              </div>

                              <div>
                                <Label className="text-sm">Response</Label>
                                <Textarea
                                  placeholder="Record the interviewee's response..."
                                  value={response.answer}
                                  onChange={(e) => updateInterviewResponse(index, 'answer', e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label className="text-sm">Sentiment</Label>
                                <Select
                                  value={response.sentiment}
                                  onValueChange={(value: 'positive' | 'neutral' | 'negative') =>
                                    updateInterviewResponse(index, 'sentiment', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SENTIMENT_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <span className={option.color}>{option.label}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                <div>
                  <Label>Key Insights</Label>
                  <div className="mt-2 space-y-2">
                    {(newInterview.insights || []).map((insight, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{insight}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInsight(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add key insight..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addInsight((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addInsight(input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddInterview(false);
                    resetNewInterview();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addInterviewResult}
                    disabled={!newInterview.personaId || !newInterview.responses?.length}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Results List */}
          {interviewResults.length > 0 ? (
            <div className="space-y-4">
              {interviewResults.map((result, index) => (
                <Card key={index} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {getPersonaName(result.personaId)}
                        </CardTitle>
                        <CardDescription>
                          Interview conducted on {result.date.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${result.validationScore >= 80 ? 'bg-green-100 text-green-800' :
                            result.validationScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          Score: {result.validationScore}/100
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInterviewResult(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Response Summary */}
                      <div>
                        <Label className="text-sm font-medium">Response Summary</Label>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-green-600 font-semibold">
                              {result.responses.filter(r => r.sentiment === 'positive').length}
                            </div>
                            <div className="text-gray-500">Positive</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600 font-semibold">
                              {result.responses.filter(r => r.sentiment === 'neutral').length}
                            </div>
                            <div className="text-gray-500">Neutral</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-semibold">
                              {result.responses.filter(r => r.sentiment === 'negative').length}
                            </div>
                            <div className="text-gray-500">Negative</div>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      {result.insights.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Key Insights</Label>
                          <ul className="mt-2 space-y-1">
                            {result.insights.map((insight, insightIndex) => (
                              <li key={insightIndex} className="text-sm text-gray-700 flex items-start">
                                <span className="text-yellow-500 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : personas.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No interviews recorded yet</p>
              <p className="text-sm">Conduct user interviews to validate your personas and ideas</p>
            </div>
          )}

          {/* Overall Validation Score */}
          {interviewResults.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Overall Validation Score</CardTitle>
                <CardDescription>
                  Average score across all interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Validation Confidence</span>
                      <span>{getAverageValidationScore()}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getAverageValidationScore() >= 80 ? 'bg-green-500' :
                            getAverageValidationScore() >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                          }`}
                        style={{ width: `${getAverageValidationScore()}%` }}
                      />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${getAverageValidationScore() >= 80 ? 'text-green-600' :
                      getAverageValidationScore() >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {getAverageValidationScore() >= 80 ? '✓' :
                      getAverageValidationScore() >= 60 ? '⚠' : '✗'}
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <p><strong>Interviews Conducted:</strong> {interviewResults.length}</p>
                  <p><strong>Personas Validated:</strong> {new Set(interviewResults.map(r => r.personaId)).size}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
