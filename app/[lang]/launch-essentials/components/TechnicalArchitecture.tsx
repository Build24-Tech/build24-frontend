'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PerformanceTarget, SecurityRequirement, TechnicalData, ThirdPartyService } from '@/types/launch-essentials';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  DollarSign,
  Server,
  Shield,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TechnicalArchitectureProps {
  data?: TechnicalData;
  onDataChange: (data: TechnicalData) => void;
  onSave: () => void;
  isLoading?: boolean;
}

interface TechnologyOption {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure';
  pros: string[];
  cons: string[];
  cost: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
  scalability: 'low' | 'medium' | 'high';
  popularity: number;
}

interface ConflictDetection {
  type: 'performance' | 'cost' | 'complexity' | 'timeline';
  severity: 'low' | 'medium' | 'high';
  description: string;
  alternatives: string[];
}

const TECHNOLOGY_OPTIONS: TechnologyOption[] = [
  // Frontend
  {
    name: 'React',
    category: 'frontend',
    pros: ['Large ecosystem', 'Component reusability', 'Strong community'],
    cons: ['Learning curve', 'Frequent updates'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 95
  },
  {
    name: 'Vue.js',
    category: 'frontend',
    pros: ['Easy to learn', 'Good documentation', 'Progressive adoption'],
    cons: ['Smaller ecosystem', 'Less job market'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 75
  },
  {
    name: 'Angular',
    category: 'frontend',
    pros: ['Full framework', 'TypeScript native', 'Enterprise ready'],
    cons: ['Steep learning curve', 'Verbose'],
    cost: 'low',
    complexity: 'high',
    scalability: 'high',
    popularity: 70
  },
  // Backend
  {
    name: 'Node.js',
    category: 'backend',
    pros: ['JavaScript everywhere', 'Fast development', 'Large package ecosystem'],
    cons: ['Single-threaded', 'Callback complexity'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'medium',
    popularity: 85
  },
  {
    name: 'Python/Django',
    category: 'backend',
    pros: ['Rapid development', 'Clean syntax', 'Great for MVPs'],
    cons: ['Performance limitations', 'GIL constraints'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 80
  },
  {
    name: 'Java/Spring',
    category: 'backend',
    pros: ['Enterprise grade', 'High performance', 'Strong typing'],
    cons: ['Verbose', 'Slower development'],
    cost: 'medium',
    complexity: 'high',
    scalability: 'high',
    popularity: 75
  },
  // Database
  {
    name: 'PostgreSQL',
    category: 'database',
    pros: ['ACID compliance', 'Advanced features', 'Open source'],
    cons: ['Complex configuration', 'Resource intensive'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 85
  },
  {
    name: 'MongoDB',
    category: 'database',
    pros: ['Flexible schema', 'Easy scaling', 'JSON-like documents'],
    cons: ['No ACID transactions', 'Memory usage'],
    cost: 'medium',
    complexity: 'low',
    scalability: 'high',
    popularity: 75
  },
  {
    name: 'MySQL',
    category: 'database',
    pros: ['Mature', 'Wide support', 'Good performance'],
    cons: ['Limited features', 'Licensing concerns'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 80
  },
  // Infrastructure
  {
    name: 'AWS',
    category: 'infrastructure',
    pros: ['Comprehensive services', 'Market leader', 'Global reach'],
    cons: ['Complex pricing', 'Vendor lock-in'],
    cost: 'medium',
    complexity: 'high',
    scalability: 'high',
    popularity: 90
  },
  {
    name: 'Vercel',
    category: 'infrastructure',
    pros: ['Easy deployment', 'Great DX', 'Edge functions'],
    cons: ['Limited backend', 'Pricing at scale'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 70
  },
  {
    name: 'Docker',
    category: 'infrastructure',
    pros: ['Containerization', 'Consistent environments', 'Easy scaling'],
    cons: ['Learning curve', 'Resource overhead'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 85
  }
];

const SECURITY_TEMPLATES = [
  {
    requirement: 'Authentication & Authorization',
    priority: 'critical' as const,
    implementation: 'Implement OAuth 2.0 with JWT tokens, role-based access control',
    compliance: ['GDPR', 'SOC 2']
  },
  {
    requirement: 'Data Encryption',
    priority: 'critical' as const,
    implementation: 'AES-256 encryption at rest, TLS 1.3 in transit',
    compliance: ['PCI DSS', 'HIPAA']
  },
  {
    requirement: 'Input Validation',
    priority: 'high' as const,
    implementation: 'Server-side validation, SQL injection prevention, XSS protection',
    compliance: ['OWASP Top 10']
  },
  {
    requirement: 'Audit Logging',
    priority: 'high' as const,
    implementation: 'Comprehensive logging of user actions and system events',
    compliance: ['SOX', 'GDPR']
  },
  {
    requirement: 'Rate Limiting',
    priority: 'medium' as const,
    implementation: 'API rate limiting, DDoS protection, throttling mechanisms',
    compliance: ['Security Best Practices']
  }
];

export default function TechnicalArchitecture({
  data,
  onDataChange,
  onSave,
  isLoading = false
}: TechnicalArchitectureProps) {
  const [technicalData, setTechnicalData] = useState<TechnicalData>(data || {
    technologyStack: {
      frontend: [],
      backend: [],
      database: [],
      infrastructure: [],
      reasoning: ''
    },
    architecture: {
      systemDesign: '',
      scalabilityPlan: '',
      performanceTargets: []
    },
    integrations: {
      thirdPartyServices: [],
      apis: []
    },
    security: {
      requirements: [],
      compliance: []
    }
  });

  const [conflicts, setConflicts] = useState<ConflictDetection[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [newService, setNewService] = useState<Partial<ThirdPartyService>>({});
  const [newPerformanceTarget, setNewPerformanceTarget] = useState<Partial<PerformanceTarget>>({});

  useEffect(() => {
    detectConflicts();
  }, [technicalData]);

  const detectConflicts = () => {
    const detectedConflicts: ConflictDetection[] = [];

    // Check for technology stack conflicts
    const { frontend, backend, database, infrastructure } = technicalData.technologyStack;

    // Performance vs Cost conflict
    if (frontend.includes('Angular') && backend.includes('Java/Spring') && infrastructure.includes('AWS')) {
      detectedConflicts.push({
        type: 'cost',
        severity: 'medium',
        description: 'High-complexity stack may increase development and infrastructure costs',
        alternatives: ['Consider React + Node.js for faster development', 'Use Vercel for simpler deployment']
      });
    }

    // Scalability vs Complexity conflict
    if (database.includes('MongoDB') && technicalData.architecture.performanceTargets.some(t => t.metric === 'ACID Compliance')) {
      detectedConflicts.push({
        type: 'performance',
        severity: 'high',
        description: 'MongoDB lacks ACID compliance which conflicts with performance requirements',
        alternatives: ['Use PostgreSQL for ACID compliance', 'Implement application-level transaction handling']
      });
    }

    // Timeline vs Technology choice conflict
    if (frontend.includes('Angular') && backend.includes('Java/Spring')) {
      detectedConflicts.push({
        type: 'timeline',
        severity: 'medium',
        description: 'Complex technology stack may extend development timeline',
        alternatives: ['Use React + Node.js for faster development', 'Consider low-code platforms for MVP']
      });
    }

    setConflicts(detectedConflicts);
  };

  const addTechnology = (category: keyof typeof technicalData.technologyStack, tech: string) => {
    if (tech && !technicalData.technologyStack[category].includes(tech)) {
      const updated = {
        ...technicalData,
        technologyStack: {
          ...technicalData.technologyStack,
          [category]: [...technicalData.technologyStack[category], tech]
        }
      };
      setTechnicalData(updated);
      onDataChange(updated);
    }
  };

  const removeTechnology = (category: keyof typeof technicalData.technologyStack, tech: string) => {
    const updated = {
      ...technicalData,
      technologyStack: {
        ...technicalData.technologyStack,
        [category]: technicalData.technologyStack[category].filter(t => t !== tech)
      }
    };
    setTechnicalData(updated);
    onDataChange(updated);
  };

  const addThirdPartyService = () => {
    if (newService.name && newService.purpose) {
      const service: ThirdPartyService = {
        name: newService.name,
        purpose: newService.purpose,
        cost: newService.cost || 0,
        alternatives: newService.alternatives || [],
        integrationComplexity: newService.integrationComplexity || 'medium'
      };

      const updated = {
        ...technicalData,
        integrations: {
          ...technicalData.integrations,
          thirdPartyServices: [...technicalData.integrations.thirdPartyServices, service]
        }
      };

      setTechnicalData(updated);
      onDataChange(updated);
      setNewService({});
    }
  };

  const addPerformanceTarget = () => {
    if (newPerformanceTarget.metric && newPerformanceTarget.target) {
      const target: PerformanceTarget = {
        metric: newPerformanceTarget.metric,
        target: newPerformanceTarget.target,
        unit: newPerformanceTarget.unit || '',
        priority: newPerformanceTarget.priority || 'important'
      };

      const updated = {
        ...technicalData,
        architecture: {
          ...technicalData.architecture,
          performanceTargets: [...technicalData.architecture.performanceTargets, target]
        }
      };

      setTechnicalData(updated);
      onDataChange(updated);
      setNewPerformanceTarget({});
    }
  };

  const addSecurityRequirement = (requirement: SecurityRequirement) => {
    const updated = {
      ...technicalData,
      security: {
        ...technicalData.security,
        requirements: [...technicalData.security.requirements, requirement]
      }
    };
    setTechnicalData(updated);
    onDataChange(updated);
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 8; // Total sections to complete

    if (technicalData.technologyStack.frontend.length > 0) completed++;
    if (technicalData.technologyStack.backend.length > 0) completed++;
    if (technicalData.technologyStack.database.length > 0) completed++;
    if (technicalData.technologyStack.infrastructure.length > 0) completed++;
    if (technicalData.architecture.systemDesign) completed++;
    if (technicalData.architecture.performanceTargets.length > 0) completed++;
    if (technicalData.integrations.thirdPartyServices.length > 0) completed++;
    if (technicalData.security.requirements.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const getTechOption = (name: string) => TECHNOLOGY_OPTIONS.find(opt => opt.name === name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Technical Architecture</h2>
          <p className="text-muted-foreground">
            Define your technology stack, architecture, and technical requirements
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Progress: {calculateProgress()}%
          </div>
          <Progress value={calculateProgress()} className="w-24" />
        </div>
      </div>

      {/* Conflict Detection Alert */}
      {conflicts.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-yellow-800">Potential conflicts detected:</p>
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm">
                  <p className="text-yellow-700">{conflict.description}</p>
                  <div className="mt-1">
                    <span className="text-xs text-yellow-600">Alternatives: </span>
                    {conflict.alternatives.map((alt, i) => (
                      <Badge key={i} variant="outline" className="mr-1 text-xs">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="stack" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stack">Technology Stack</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Technology Stack */}
        <TabsContent value="stack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Technology Stack Selection
              </CardTitle>
              <CardDescription>
                Choose technologies based on your project requirements, team expertise, and business goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technology Categories */}
              {(['frontend', 'backend', 'database', 'infrastructure'] as const).map(category => (
                <div key={category} className="space-y-3">
                  <Label className="text-base font-medium capitalize">{category}</Label>

                  {/* Selected Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {technicalData.technologyStack[category].map(tech => {
                      const option = getTechOption(tech);
                      return (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          {option && (
                            <div className="flex items-center gap-1 ml-2">
                              <DollarSign className={`h-3 w-3 ${option.cost === 'low' ? 'text-green-500' :
                                  option.cost === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                }`} />
                              <TrendingUp className={`h-3 w-3 ${option.scalability === 'high' ? 'text-green-500' :
                                  option.scalability === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                }`} />
                            </div>
                          )}
                          <button
                            onClick={() => removeTechnology(category, tech)}
                            className="ml-1 hover:text-red-500"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Add Technology */}
                  <div className="flex gap-2">
                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={`Select ${category}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {TECHNOLOGY_OPTIONS
                          .filter(opt => opt.category === category)
                          .map(option => (
                            <SelectItem key={option.name} value={option.name}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.name}</span>
                                <div className="flex items-center gap-1 ml-2">
                                  <Badge variant="outline" className="text-xs">
                                    {option.complexity}
                                  </Badge>
                                  <div className="flex items-center">
                                    <DollarSign className={`h-3 w-3 ${option.cost === 'low' ? 'text-green-500' :
                                        option.cost === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                      }`} />
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        if (selectedTech) {
                          addTechnology(category, selectedTech);
                          setSelectedTech('');
                        }
                      }}
                      disabled={!selectedTech}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Technology Details */}
                  {selectedTech && getTechOption(selectedTech)?.category === category && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        {(() => {
                          const option = getTechOption(selectedTech)!;
                          return (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-green-700 mb-2">Pros</h4>
                                <ul className="text-sm space-y-1">
                                  {option.pros.map((pro, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-red-700 mb-2">Cons</h4>
                                <ul className="text-sm space-y-1">
                                  {option.cons.map((con, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <XCircle className="h-3 w-3 text-red-500" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="col-span-2 flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Cost: {option.cost}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="h-4 w-4" />
                                  <span>Complexity: {option.complexity}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Scalability: {option.scalability}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Popularity: {option.popularity}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}

              <Separator />

              {/* Reasoning */}
              <div className="space-y-2">
                <Label htmlFor="reasoning">Technology Stack Reasoning</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Explain your technology choices and how they align with your project goals..."
                  value={technicalData.technologyStack.reasoning}
                  onChange={(e) => {
                    const updated = {
                      ...technicalData,
                      technologyStack: {
                        ...technicalData.technologyStack,
                        reasoning: e.target.value
                      }
                    };
                    setTechnicalData(updated);
                    onDataChange(updated);
                  }}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Architecture
              </CardTitle>
              <CardDescription>
                Define your system design, scalability plan, and performance targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Design */}
              <div className="space-y-2">
                <Label htmlFor="systemDesign">System Design Overview</Label>
                <Textarea
                  id="systemDesign"
                  placeholder="Describe your overall system architecture, components, and data flow..."
                  value={technicalData.architecture.systemDesign}
                  onChange={(e) => {
                    const updated = {
                      ...technicalData,
                      architecture: {
                        ...technicalData.architecture,
                        systemDesign: e.target.value
                      }
                    };
                    setTechnicalData(updated);
                    onDataChange(updated);
                  }}
                  rows={6}
                />
              </div>

              {/* Scalability Plan */}
              <div className="space-y-2">
                <Label htmlFor="scalabilityPlan">Scalability Plan</Label>
                <Textarea
                  id="scalabilityPlan"
                  placeholder="How will your system handle growth in users, data, and traffic?"
                  value={technicalData.architecture.scalabilityPlan}
                  onChange={(e) => {
                    const updated = {
                      ...technicalData,
                      architecture: {
                        ...technicalData.architecture,
                        scalabilityPlan: e.target.value
                      }
                    };
                    setTechnicalData(updated);
                    onDataChange(updated);
                  }}
                  rows={4}
                />
              </div>

              {/* Performance Targets */}
              <div className="space-y-4">
                <Label>Performance Targets</Label>

                {/* Existing Targets */}
                {technicalData.architecture.performanceTargets.map((target, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{target.metric}</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: {target.target} {target.unit}
                          </p>
                        </div>
                        <Badge variant={
                          target.priority === 'critical' ? 'destructive' :
                            target.priority === 'important' ? 'default' : 'secondary'
                        }>
                          {target.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Target */}
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newMetric">Metric</Label>
                        <Input
                          id="newMetric"
                          placeholder="e.g., Response Time"
                          value={newPerformanceTarget.metric || ''}
                          onChange={(e) => setNewPerformanceTarget({
                            ...newPerformanceTarget,
                            metric: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newTarget">Target Value</Label>
                        <Input
                          id="newTarget"
                          type="number"
                          placeholder="e.g., 200"
                          value={newPerformanceTarget.target || ''}
                          onChange={(e) => setNewPerformanceTarget({
                            ...newPerformanceTarget,
                            target: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUnit">Unit</Label>
                        <Input
                          id="newUnit"
                          placeholder="e.g., ms"
                          value={newPerformanceTarget.unit || ''}
                          onChange={(e) => setNewPerformanceTarget({
                            ...newPerformanceTarget,
                            unit: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPriority">Priority</Label>
                        <Select
                          value={newPerformanceTarget.priority || 'important'}
                          onValueChange={(value: 'critical' | 'important' | 'nice-to-have') =>
                            setNewPerformanceTarget({
                              ...newPerformanceTarget,
                              priority: value
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                            <SelectItem value="nice-to-have">Nice to Have</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={addPerformanceTarget}
                      className="mt-4"
                      disabled={!newPerformanceTarget.metric || !newPerformanceTarget.target}
                    >
                      Add Performance Target
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>
                Evaluate and plan your third-party service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Services */}
              {technicalData.integrations.thirdPartyServices.map((service, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.purpose}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${service.cost}/month</span>
                          </div>
                          <Badge variant={
                            service.integrationComplexity === 'low' ? 'secondary' :
                              service.integrationComplexity === 'medium' ? 'default' : 'destructive'
                          }>
                            {service.integrationComplexity} complexity
                          </Badge>
                        </div>
                        {service.alternatives.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Alternatives: </span>
                            {service.alternatives.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Service */}
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input
                        id="serviceName"
                        placeholder="e.g., Stripe"
                        value={newService.name || ''}
                        onChange={(e) => setNewService({
                          ...newService,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servicePurpose">Purpose</Label>
                      <Input
                        id="servicePurpose"
                        placeholder="e.g., Payment processing"
                        value={newService.purpose || ''}
                        onChange={(e) => setNewService({
                          ...newService,
                          purpose: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceCost">Monthly Cost ($)</Label>
                      <Input
                        id="serviceCost"
                        type="number"
                        placeholder="0"
                        value={newService.cost || ''}
                        onChange={(e) => setNewService({
                          ...newService,
                          cost: parseFloat(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceComplexity">Integration Complexity</Label>
                      <Select
                        value={newService.integrationComplexity || 'medium'}
                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                          setNewService({
                            ...newService,
                            integrationComplexity: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={addThirdPartyService}
                    className="mt-4"
                    disabled={!newService.name || !newService.purpose}
                  >
                    Add Service
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Requirements
              </CardTitle>
              <CardDescription>
                Define security requirements and compliance considerations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Templates */}
              <div className="space-y-4">
                <Label>Security Requirement Templates</Label>
                <div className="grid gap-3">
                  {SECURITY_TEMPLATES.map((template, index) => (
                    <Card key={index} className="border-dashed cursor-pointer hover:bg-muted/50"
                      onClick={() => addSecurityRequirement(template)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{template.requirement}</h4>
                            <p className="text-sm text-muted-foreground">{template.implementation}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                template.priority === 'critical' ? 'destructive' :
                                  template.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {template.priority}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {template.compliance.join(', ')}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Added Requirements */}
              {technicalData.security.requirements.length > 0 && (
                <div className="space-y-4">
                  <Label>Selected Security Requirements</Label>
                  {technicalData.security.requirements.map((req, index) => (
                    <Card key={index} className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-green-800">{req.requirement}</h4>
                            <p className="text-sm text-green-700">{req.implementation}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-green-300 text-green-700">
                                {req.priority}
                              </Badge>
                              <div className="text-xs text-green-600">
                                {req.compliance.join(', ')}
                              </div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </div>
          ) : (
            'Save Progress'
          )}
        </Button>
      </div>
    </div>
  );
}
