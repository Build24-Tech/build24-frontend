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
  | 'development'
  | 'testing'
  | 'launch'
  | 'growth';

export type StepStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed';

export interface StepProgress {
  stepId: string;
  status: StepStatus;
  data: Record<string, any>;
  completedAt?: Date;
  notes?: string;
}

export interface PhaseProgress {
  phase: LaunchPhase;
  steps: StepProgress[];
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface UserProgress {
  userId: string;
  projectId: string;
  currentPhase: LaunchPhase;
  phases: Record<LaunchPhase, PhaseProgress>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  targetMarket: string;
  stage: ProjectStage;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  phase: LaunchPhase;
  estimatedTime?: string;
  category: string;
}

export interface Risk {
  id: string;
  type: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner?: string;
  status: string;
  createdAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'guide' | 'template' | 'tool' | 'example';
  category: string;
  url?: string;
  relevanceScore: number;
}

export interface FinancialData {
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  periods: number;
  startingCash: number;
  revenue: number[];
  expenses: number[];
  growthRate?: number;
  churnRate?: number;
}

export interface FinancialProjection {
  revenue: number[];
  expenses: number[];
  profit: number[];
  cashFlow: number[];
  cumulativeCashFlow: number[];
  breakEvenMonth: number;
  roi: number;
  paybackPeriod: number;
}

export interface FundingRequirements {
  totalRequired: number;
  runway: number;
  milestones: Array<{
    month: number;
    amount: number;
    purpose: string;
  }>;
  fundingGap: number;
}

export interface BusinessModel {
  type: 'saas' | 'ecommerce' | 'marketplace' | 'service';
  revenueStreams: string[];
  costStructure: Record<string, number>;
  keyMetrics: string[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}
