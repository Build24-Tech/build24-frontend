'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LaunchPhase, Template } from '@/types/launch-essentials';
import { Calendar, FileText, Search, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedPhase?: LaunchPhase;
  className?: string;
}

interface TemplateFilters {
  search: string;
  category: string;
  phase: LaunchPhase | 'all';
  sortBy: 'name' | 'created' | 'updated' | 'popular';
}

const mockTemplates: Template[] = [
  {
    id: 'market-research-template',
    name: 'Market Research Template',
    description: 'Comprehensive template for conducting market research and analysis',
    category: 'Research',
    content: `# Market Research Analysis

## Market Overview
- Market Size: {{marketSize}}
- Growth Rate: {{growthRate}}%
- Key Trends: {{trends}}

## Target Audience
- Primary Segment: {{primarySegment}}
- Demographics: {{demographics}}
- Pain Points: {{painPoints}}

## Competitive Landscape
- Direct Competitors: {{directCompetitors}}
- Indirect Competitors: {{indirectCompetitors}}
- Market Gap: {{marketGap}}

## Recommendations
{{recommendations}}`,
    variables: [
      { name: 'marketSize', type: 'text', required: true },
      { name: 'growthRate', type: 'number', required: true },
      { name: 'trends', type: 'text', required: false },
      { name: 'primarySegment', type: 'text', required: true },
      { name: 'demographics', type: 'text', required: false },
      { name: 'painPoints', type: 'text', required: false },
      { name: 'directCompetitors', type: 'text', required: false },
      { name: 'indirectCompetitors', type: 'text', required: false },
      { name: 'marketGap', type: 'text', required: false },
      { name: 'recommendations', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'value-proposition-canvas',
    name: 'Value Proposition Canvas',
    description: 'Strategic template for defining your product\'s value proposition',
    category: 'Strategy',
    content: `# Value Proposition Canvas

## Customer Profile
### Customer Jobs
- {{customerJobs}}

### Pain Points
- {{painPoints}}

### Gain Creators
- {{gainCreators}}

## Value Map
### Products & Services
- {{productsServices}}

### Pain Relievers
- {{painRelievers}}

### Gain Creators
- {{valueGainCreators}}

## Fit Analysis
{{fitAnalysis}}`,
    variables: [
      { name: 'customerJobs', type: 'text', required: true },
      { name: 'painPoints', type: 'text', required: true },
      { name: 'gainCreators', type: 'text', required: true },
      { name: 'productsServices', type: 'text', required: true },
      { name: 'painRelievers', type: 'text', required: true },
      { name: 'valueGainCreators', type: 'text', required: true },
      { name: 'fitAnalysis', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'technical-architecture-doc',
    name: 'Technical Architecture Document',
    description: 'Template for documenting technical architecture decisions',
    category: 'Technical',
    content: `# Technical Architecture Document

## System Overview
{{systemOverview}}

## Technology Stack
### Frontend
- {{frontendTech}}

### Backend
- {{backendTech}}

### Database
- {{databaseTech}}

### Infrastructure
- {{infrastructureTech}}

## Architecture Decisions
{{architectureDecisions}}

## Scalability Considerations
{{scalabilityConsiderations}}

## Security Requirements
{{securityRequirements}}`,
    variables: [
      { name: 'systemOverview', type: 'text', required: true },
      { name: 'frontendTech', type: 'text', required: true },
      { name: 'backendTech', type: 'text', required: true },
      { name: 'databaseTech', type: 'text', required: true },
      { name: 'infrastructureTech', type: 'text', required: true },
      { name: 'architectureDecisions', type: 'text', required: false },
      { name: 'scalabilityConsiderations', type: 'text', required: false },
      { name: 'securityRequirements', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'go-to-market-plan',
    name: 'Go-to-Market Plan',
    description: 'Comprehensive template for planning your product launch strategy',
    category: 'Marketing',
    content: `# Go-to-Market Plan

## Product Positioning
{{productPositioning}}

## Target Market
- Primary Market: {{primaryMarket}}
- Secondary Market: {{secondaryMarket}}

## Pricing Strategy
- Model: {{pricingModel}}
- Tiers: {{pricingTiers}}

## Marketing Channels
{{marketingChannels}}

## Launch Timeline
{{launchTimeline}}

## Success Metrics
{{successMetrics}}`,
    variables: [
      { name: 'productPositioning', type: 'text', required: true },
      { name: 'primaryMarket', type: 'text', required: true },
      { name: 'secondaryMarket', type: 'text', required: false },
      { name: 'pricingModel', type: 'select', required: true, options: ['Subscription', 'One-time', 'Freemium', 'Usage-based'] },
      { name: 'pricingTiers', type: 'text', required: false },
      { name: 'marketingChannels', type: 'text', required: true },
      { name: 'launchTimeline', type: 'text', required: true },
      { name: 'successMetrics', type: 'text', required: true }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'risk-assessment-matrix',
    name: 'Risk Assessment Matrix',
    description: 'Template for identifying and assessing project risks',
    category: 'Risk Management',
    content: `# Risk Assessment Matrix

## Risk Identification
{{riskIdentification}}

## Risk Analysis
| Risk | Probability | Impact | Priority | Mitigation |
|------|-------------|---------|----------|------------|
{{riskMatrix}}

## High Priority Risks
{{highPriorityRisks}}

## Mitigation Strategies
{{mitigationStrategies}}

## Monitoring Plan
{{monitoringPlan}}`,
    variables: [
      { name: 'riskIdentification', type: 'text', required: true },
      { name: 'riskMatrix', type: 'text', required: true },
      { name: 'highPriorityRisks', type: 'text', required: true },
      { name: 'mitigationStrategies', type: 'text', required: true },
      { name: 'monitoringPlan', type: 'text', required: false }
    ],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-24')
  }
];

const categories = ['All', 'Research', 'Strategy', 'Technical', 'Marketing', 'Risk Management', 'Financial', 'Operations'];
const phases: Array<LaunchPhase | 'all'> = ['all', 'validation', 'definition', 'technical', 'marketing', 'operations', 'financial', 'risk', 'optimization'];

export default function TemplateSelector({ onSelectTemplate, selectedPhase, className }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates);
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    category: 'All',
    phase: selectedPhase || 'all',
    sortBy: 'name'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPhase) {
      setFilters(prev => ({ ...prev, phase: selectedPhase }));
    }
  }, [selectedPhase]);

  useEffect(() => {
    filterAndSortTemplates();
  }, [filters, templates]);

  const filterAndSortTemplates = () => {
    let filtered = [...templates];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(template => template.category === filters.category);
    }

    // Apply phase filter (this would be based on template metadata in a real implementation)
    if (filters.phase !== 'all') {
      // For now, we'll use category mapping to phases
      const phaseCategories: Record<LaunchPhase, string[]> = {
        validation: ['Research'],
        definition: ['Strategy'],
        technical: ['Technical'],
        marketing: ['Marketing'],
        operations: ['Operations'],
        financial: ['Financial'],
        risk: ['Risk Management'],
        optimization: ['Analytics', 'Optimization']
      };

      if (phaseCategories[filters.phase as LaunchPhase]) {
        filtered = filtered.filter(template =>
          phaseCategories[filters.phase as LaunchPhase].includes(template.category)
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'popular':
          // Mock popularity sorting
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleFilterChange = (key: keyof TemplateFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'Research':
        return <Search className="h-4 w-4" />;
      case 'Strategy':
        return <Settings className="h-4 w-4" />;
      case 'Technical':
        return <FileText className="h-4 w-4" />;
      case 'Marketing':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
        <p className="text-gray-600 mt-1">
          Choose from our collection of proven templates to accelerate your project
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.phase} onValueChange={(value) => handleFilterChange('phase', value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {phases.slice(1).map(phase => (
              <SelectItem key={phase} value={phase}>
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value as any)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created Date</SelectItem>
            <SelectItem value="updated">Updated Date</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTemplateIcon(template.category)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Updated {formatDate(template.updatedAt)}
                    </span>
                    <span>{template.variables.length} variables</span>
                  </div>

                  <Button
                    onClick={() => onSelectTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
