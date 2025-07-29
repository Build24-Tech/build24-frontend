
import { z } from 'zod';

// Enums and Constants
export type LaunchPhase =
  | 'validation'
  | 'definition'
  | 'technical'
  | 'marketing'
  | 'operations'
  | 'financial'
  | 'risk'
  | 'optimization';

export type ProjectStage =
  | 'concept'
  | 'validation'
  | 'development'
  | 'testing'
  | 'launch'
  | 'growth';

export type StepStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export type FrameworkStepType =
  | 'input'
  | 'selection'
  | 'analysis'
  | 'template';

// Core Data Models
export interface UserProgress {
  userId: string;
  projectId: string;
  currentPhase: LaunchPhase;
  phases: Record<LaunchPhase, PhaseProgress>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PhaseProgress {
  phase: LaunchPhase;
  steps: StepProgress[];
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface StepProgress {
  stepId: string;
  status: StepStatus;
  data: any;
  completedAt?: Date;
  notes?: string;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  phase: LaunchPhase;
  steps: FrameworkStep[];
  templates: Template[];
  resources: Resource[];
}

export interface FrameworkStep {
  id: string;
  title: string;
  description: string;
  type: FrameworkStepType;
  required: boolean;
  validationSchema?: ValidationSchema;
  helpText?: string;
  examples?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'tool' | 'template' | 'video' | 'book';
  url?: string;
  tags: string[];
}

export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  targetMarket: string;
  stage: ProjectStage;
  data: {
    validation?: ValidationData;
    definition?: ProductDefinitionData;
    technical?: TechnicalData;
    marketing?: MarketingData;
    operations?: OperationsData;
    financial?: FinancialData;
    risks?: RiskData;
    optimization?: OptimizationData;
  };
  createdAt: Date;
  updatedAt: Date;
}
// Phase-specific Data Models
export interface ValidationData {
  marketResearch: {
    marketSize: number;
    growthRate: number;
    trends: string[];
    sources: string[];
  };
  competitorAnalysis: {
    competitors: Competitor[];
    competitiveAdvantage: string;
    marketGap: string;
  };
  targetAudience: {
    personas: UserPersona[];
    interviewResults: InterviewResult[];
    validationScore: number;
  };
  validationReport: {
    recommendation: 'go' | 'no-go' | 'pivot';
    reasoning: string;
    nextSteps: string[];
  };
}

export interface ProductDefinitionData {
  vision: {
    statement: string;
    missionAlignment: string;
  };
  valueProposition: {
    canvas: ValuePropositionCanvas;
    uniqueValue: string;
  };
  features: {
    coreFeatures: Feature[];
    prioritization: FeaturePrioritization;
  };
  metrics: {
    kpis: KPI[];
    successCriteria: string[];
  };
}

export interface TechnicalData {
  technologyStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
    reasoning: string;
  };
  architecture: {
    systemDesign: string;
    scalabilityPlan: string;
    performanceTargets: PerformanceTarget[];
  };
  integrations: {
    thirdPartyServices: ThirdPartyService[];
    apis: APIRequirement[];
  };
  security: {
    requirements: SecurityRequirement[];
    compliance: ComplianceRequirement[];
  };
}

export interface MarketingData {
  pricing: {
    strategy: 'cost-plus' | 'value-based' | 'competitive' | 'penetration' | 'skimming';
    tiers: PricingTier[];
    reasoning: string;
  };
  channels: {
    selectedChannels: MarketingChannel[];
    budgetAllocation: ChannelBudget[];
    expectedROI: number;
  };
  launch: {
    timeline: LaunchMilestone[];
    dependencies: string[];
    riskMitigation: string[];
  };
  metrics: {
    acquisitionMetrics: Metric[];
    activationMetrics: Metric[];
    retentionMetrics: Metric[];
    revenueMetrics: Metric[];
  };
}

export interface OperationsData {
  team: {
    structure: TeamRole[];
    hiringPlan: HiringPlan[];
    budget: number;
  };
  processes: {
    development: ProcessDefinition;
    testing: ProcessDefinition;
    deployment: ProcessDefinition;
    support: ProcessDefinition;
  };
  support: {
    channels: SupportChannel[];
    knowledgeBase: KnowledgeBaseItem[];
    slaTargets: SLATarget[];
  };
  legal: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    compliance: ComplianceItem[];
  };
}

export interface FinancialData {
  projections: {
    revenue: RevenueProjection[];
    costs: CostProjection[];
    cashFlow: CashFlowProjection[];
  };
  funding: {
    requirements: number;
    timeline: FundingMilestone[];
    sources: FundingSource[];
  };
  businessModel: {
    type: BusinessModelType;
    revenueStreams: RevenueStream[];
    costStructure: CostStructure[];
  };
  pricing: {
    methodology: PricingMethodology;
    analysis: PricingAnalysis;
  };
}

export interface RiskData {
  risks: Risk[];
  assessment: RiskAssessment;
  mitigation: MitigationStrategy[];
  monitoring: MonitoringPlan[];
}

export interface OptimizationData {
  analytics: {
    setup: AnalyticsSetup;
    kpis: KPI[];
    dashboards: Dashboard[];
  };
  feedback: {
    methods: FeedbackMethod[];
    analysis: FeedbackAnalysis;
  };
  improvements: {
    prioritization: ImprovementPrioritization;
    roadmap: ImprovementRoadmap[];
  };
  methodology: {
    framework: 'agile' | 'lean' | 'design-thinking' | 'custom';
    processes: OptimizationProcess[];
  };
}
// Supporting Interfaces
export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
  pricing: number;
  url?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  demographics: {
    age: string;
    location: string;
    occupation: string;
    income: string;
  };
  psychographics: {
    goals: string[];
    painPoints: string[];
    motivations: string[];
    behaviors: string[];
  };
  technographics: {
    devices: string[];
    platforms: string[];
    techSavviness: 'low' | 'medium' | 'high';
  };
}

export interface InterviewResult {
  personaId: string;
  date: Date;
  responses: {
    question: string;
    answer: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  insights: string[];
  validationScore: number;
}

export interface ValuePropositionCanvas {
  customerJobs: string[];
  painPoints: string[];
  gainCreators: string[];
  painRelievers: string[];
  productsServices: string[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface FeaturePrioritization {
  method: 'moscow' | 'kano' | 'rice' | 'value-effort';
  results: {
    featureId: string;
    score: number;
    ranking: number;
  }[];
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  category: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral';
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  unit: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

export interface ThirdPartyService {
  name: string;
  purpose: string;
  cost: number;
  alternatives: string[];
  integrationComplexity: 'low' | 'medium' | 'high';
}

export interface APIRequirement {
  name: string;
  type: 'rest' | 'graphql' | 'websocket';
  endpoints: string[];
  authentication: string;
  rateLimit: number;
}

export interface SecurityRequirement {
  requirement: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation: string;
  compliance: string[];
}

export interface ComplianceRequirement {
  standard: string;
  requirements: string[];
  deadline: Date;
  responsible: string;
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limitations: string[];
  targetSegment: string;
}

export interface MarketingChannel {
  name: string;
  type: 'paid' | 'organic' | 'referral' | 'direct';
  cost: number;
  expectedReach: number;
  conversionRate: number;
}

export interface ChannelBudget {
  channel: string;
  budget: number;
  allocation: number; // percentage
  expectedROI: number;
}

export interface LaunchMilestone {
  name: string;
  date: Date;
  dependencies: string[];
  deliverables: string[];
  responsible: string;
}

export interface Metric {
  name: string;
  target: number;
  current?: number;
  unit: string;
  trackingMethod: string;
}

export interface TeamRole {
  title: string;
  responsibilities: string[];
  skills: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead';
  salary: number;
  startDate: Date;
}

export interface HiringPlan {
  role: string;
  priority: 'immediate' | 'short-term' | 'long-term';
  budget: number;
  timeline: string;
}

export interface ProcessDefinition {
  name: string;
  steps: ProcessStep[];
  tools: string[];
  responsible: string[];
  frequency: string;
}

export interface ProcessStep {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  duration: string;
}

export interface SupportChannel {
  type: 'email' | 'chat' | 'phone' | 'forum' | 'knowledge-base';
  availability: string;
  responseTime: string;
  staffing: number;
}

export interface KnowledgeBaseItem {
  title: string;
  category: string;
  content: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface SLATarget {
  metric: string;
  target: string;
  measurement: string;
  consequences: string;
}

export interface ComplianceItem {
  requirement: string;
  status: 'completed' | 'in-progress' | 'not-started';
  deadline: Date;
  responsible: string;
}

// Additional supporting interfaces for financial and risk data
export interface RevenueProjection {
  month: number;
  amount: number;
  source: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface CostProjection {
  month: number;
  category: string;
  amount: number;
  type: 'fixed' | 'variable';
}

export interface CashFlowProjection {
  month: number;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

export interface FundingMilestone {
  stage: string;
  amount: number;
  date: Date;
  requirements: string[];
}

export interface FundingSource {
  type: 'bootstrapping' | 'angel' | 'vc' | 'loan' | 'grant';
  amount: number;
  terms: string;
  probability: number;
}

export type BusinessModelType =
  | 'subscription'
  | 'freemium'
  | 'marketplace'
  | 'saas'
  | 'ecommerce'
  | 'advertising'
  | 'transaction'
  | 'licensing';

export interface RevenueStream {
  name: string;
  type: BusinessModelType;
  projectedRevenue: number;
  timeline: string;
}

export interface CostStructure {
  category: string;
  type: 'fixed' | 'variable';
  amount: number;
  scalability: 'linear' | 'economies-of-scale' | 'diseconomies-of-scale';
}

export interface PricingMethodology {
  primary: 'cost-plus' | 'value-based' | 'competitive';
  factors: string[];
  analysis: string;
}

export interface PricingAnalysis {
  competitorPricing: { competitor: string; price: number }[];
  valueMetrics: { metric: string; value: number }[];
  priceElasticity: number;
  recommendation: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'market' | 'financial' | 'operational' | 'legal';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  priority: number;
  owner: string;
}

export interface RiskAssessment {
  overallRiskLevel: 'low' | 'medium' | 'high';
  criticalRisks: string[];
  riskMatrix: { probability: string; impact: string; count: number }[];
}

export interface MitigationStrategy {
  riskId: string;
  strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  actions: string[];
  timeline: string;
  cost: number;
  responsible: string;
}

export interface MonitoringPlan {
  riskId: string;
  indicators: string[];
  frequency: string;
  thresholds: { indicator: string; threshold: number }[];
  escalation: string;
}

export interface AnalyticsSetup {
  tools: string[];
  events: AnalyticsEvent[];
  dashboards: string[];
  reporting: string;
}

export interface AnalyticsEvent {
  name: string;
  description: string;
  properties: { name: string; type: string }[];
  frequency: string;
}

export interface Dashboard {
  name: string;
  metrics: string[];
  audience: string;
  updateFrequency: string;
}

export interface FeedbackMethod {
  type: 'survey' | 'interview' | 'analytics' | 'support' | 'social';
  frequency: string;
  sampleSize: number;
  questions: string[];
}

export interface FeedbackAnalysis {
  themes: { theme: string; frequency: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  actionItems: string[];
}

export interface ImprovementPrioritization {
  method: 'impact-effort' | 'rice' | 'kano' | 'value-complexity';
  criteria: string[];
  results: { improvement: string; score: number; priority: number }[];
}

export interface ImprovementRoadmap {
  quarter: string;
  improvements: string[];
  resources: number;
  expectedImpact: string;
}

export interface OptimizationProcess {
  name: string;
  description: string;
  frequency: string;
  participants: string[];
  deliverables: string[];
}

// Utility and Service Interfaces
export interface ValidationSchema {
  type: string;
  rules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface Recommendation {
  id: string;
  type: 'next-step' | 'resource' | 'risk' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
}

export interface ProjectContext {
  projectId: string;
  industry: string;
  stage: ProjectStage;
  teamSize: number;
  budget: number;
  timeline: string;
}
// Zod Validation Schemas
export const LaunchPhaseSchema = z.enum([
  'validation',
  'definition',
  'technical',
  'marketing',
  'operations',
  'financial',
  'risk',
  'optimization'
]);

export const ProjectStageSchema = z.enum([
  'concept',
  'validation',
  'development',
  'testing',
  'launch',
  'growth'
]);

export const StepStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'skipped'
]);

export const FrameworkStepTypeSchema = z.enum([
  'input',
  'selection',
  'analysis',
  'template'
]);

export const StepProgressSchema = z.object({
  stepId: z.string(),
  status: StepStatusSchema,
  data: z.any(),
  completedAt: z.date().optional(),
  notes: z.string().optional()
});

export const PhaseProgressSchema = z.object({
  phase: LaunchPhaseSchema,
  steps: z.array(StepProgressSchema),
  completionPercentage: z.number().min(0).max(100),
  startedAt: z.date(),
  completedAt: z.date().optional()
});

export const UserProgressSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  currentPhase: LaunchPhaseSchema,
  phases: z.record(LaunchPhaseSchema, PhaseProgressSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional()
});

export const ValidationRuleSchema = z.object({
  field: z.string(),
  type: z.enum(['required', 'min', 'max', 'pattern', 'custom']),
  value: z.any().optional(),
  message: z.string()
});

export const ValidationSchemaSchema = z.object({
  type: z.string(),
  rules: z.array(ValidationRuleSchema)
});

export const FrameworkStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: FrameworkStepTypeSchema,
  required: z.boolean(),
  validationSchema: ValidationSchemaSchema.optional(),
  helpText: z.string().optional(),
  examples: z.array(z.string()).optional()
});

export const TemplateVariableSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional()
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  content: z.string(),
  variables: z.array(TemplateVariableSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['article', 'tool', 'template', 'video', 'book']),
  url: z.string().url().optional(),
  tags: z.array(z.string())
});

export const FrameworkSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  phase: LaunchPhaseSchema,
  steps: z.array(FrameworkStepSchema),
  templates: z.array(TemplateSchema),
  resources: z.array(ResourceSchema)
});

export const CompetitorSchema = z.object({
  name: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  marketShare: z.number().min(0).max(100),
  pricing: z.number().min(0),
  url: z.string().url().optional()
});

export const UserPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  demographics: z.object({
    age: z.string(),
    location: z.string(),
    occupation: z.string(),
    income: z.string()
  }),
  psychographics: z.object({
    goals: z.array(z.string()),
    painPoints: z.array(z.string()),
    motivations: z.array(z.string()),
    behaviors: z.array(z.string())
  }),
  technographics: z.object({
    devices: z.array(z.string()),
    platforms: z.array(z.string()),
    techSavviness: z.enum(['low', 'medium', 'high'])
  })
});

export const ValidationDataSchema = z.object({
  marketResearch: z.object({
    marketSize: z.number().min(0),
    growthRate: z.number(),
    trends: z.array(z.string()),
    sources: z.array(z.string())
  }),
  competitorAnalysis: z.object({
    competitors: z.array(CompetitorSchema),
    competitiveAdvantage: z.string(),
    marketGap: z.string()
  }),
  targetAudience: z.object({
    personas: z.array(UserPersonaSchema),
    interviewResults: z.array(z.any()), // InterviewResult schema would be complex
    validationScore: z.number().min(0).max(100)
  }),
  validationReport: z.object({
    recommendation: z.enum(['go', 'no-go', 'pivot']),
    reasoning: z.string(),
    nextSteps: z.array(z.string())
  })
});

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priority: z.enum(['must-have', 'should-have', 'could-have', 'wont-have']),
  effort: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string())
});

export const KPISchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  target: z.number(),
  unit: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  category: z.enum(['acquisition', 'activation', 'retention', 'revenue', 'referral'])
});

export const RiskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['technical', 'market', 'financial', 'operational', 'legal']),
  probability: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  priority: z.number().min(1),
  owner: z.string()
});

export const ProjectDataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string(),
  industry: z.string(),
  targetMarket: z.string(),
  stage: ProjectStageSchema,
  data: z.object({
    validation: ValidationDataSchema.optional(),
    definition: z.any().optional(), // ProductDefinitionData schema
    technical: z.any().optional(), // TechnicalData schema
    marketing: z.any().optional(), // MarketingData schema
    operations: z.any().optional(), // OperationsData schema
    financial: z.any().optional(), // FinancialData schema
    risks: z.any().optional(), // RiskData schema
    optimization: z.any().optional() // OptimizationData schema
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string()
});

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema)
});

export const RecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(['next-step', 'resource', 'risk', 'optimization']),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  category: z.string(),
  actionItems: z.array(z.string())
});

export const ProjectContextSchema = z.object({
  projectId: z.string(),
  industry: z.string(),
  stage: ProjectStageSchema,
  teamSize: z.number().min(1),
  budget: z.number().min(0),
  timeline: z.string()
});
