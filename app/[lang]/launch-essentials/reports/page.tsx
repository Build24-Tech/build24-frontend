import { LaunchEssentialsLayout } from '../components/LaunchEssentialsLayout';
import { ReportingDashboard } from '../components/ReportingDashboard';

// Mock data for demonstration - in real app this would come from props or API
const mockProjectData = {
  id: 'project-1',
  userId: 'user-1',
  name: 'AI-Powered Task Manager',
  description: 'A smart task management application with AI-driven prioritization',
  industry: 'Productivity Software',
  targetMarket: 'Small to medium businesses',
  stage: 'development' as const,
  data: {
    validation: {
      marketSize: '$2.5B TAM',
      competitorAnalysis: 'Completed',
      userInterviews: '25 interviews conducted'
    },
    definition: {
      visionStatement: 'Revolutionize task management with AI',
      valueProposition: 'Save 2 hours daily through intelligent prioritization'
    },
    technical: {
      selectedStack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API'],
      architecture: 'Microservices'
    },
    marketing: {
      pricingStrategy: 'Freemium model',
      channels: ['Content marketing', 'Product Hunt', 'LinkedIn']
    },
    financial: {
      projectedRevenue: '$500K ARR by year 1',
      fundingNeeded: '$250K seed round'
    },
    risks: {
      identifiedRisks: [
        {
          id: 'risk-1',
          description: 'AI API costs may exceed budget',
          impact: 'high' as const,
          probability: 'medium' as const,
          category: 'technical'
        }
      ]
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

const mockProgress = {
  userId: 'user-1',
  projectId: 'project-1',
  currentPhase: 'technical' as const,
  phases: {
    validation: {
      phase: 'validation' as const,
      steps: [
        { stepId: 'market-research', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'competitor-analysis', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'user-interviews', status: 'completed' as const, data: {}, completedAt: new Date() }
      ],
      completionPercentage: 100,
      startedAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-15')
    },
    definition: {
      phase: 'definition' as const,
      steps: [
        { stepId: 'vision-mission', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'value-proposition', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'feature-prioritization', status: 'in_progress' as const, data: {} }
      ],
      completionPercentage: 67,
      startedAt: new Date('2024-01-16')
    },
    technical: {
      phase: 'technical' as const,
      steps: [
        { stepId: 'tech-stack', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'architecture', status: 'in_progress' as const, data: {} },
        { stepId: 'security', status: 'not_started' as const, data: {} }
      ],
      completionPercentage: 33,
      startedAt: new Date('2024-02-01')
    },
    marketing: {
      phase: 'marketing' as const,
      steps: [
        { stepId: 'pricing', status: 'completed' as const, data: {}, completedAt: new Date() },
        { stepId: 'channels', status: 'not_started' as const, data: {} }
      ],
      completionPercentage: 50,
      startedAt: new Date('2024-02-10')
    },
    operations: {
      phase: 'operations' as const,
      steps: [
        { stepId: 'team-structure', status: 'not_started' as const, data: {} }
      ],
      completionPercentage: 0,
      startedAt: new Date('2024-02-15')
    },
    financial: {
      phase: 'financial' as const,
      steps: [
        { stepId: 'revenue-model', status: 'completed' as const, data: {}, completedAt: new Date() }
      ],
      completionPercentage: 100,
      startedAt: new Date('2024-01-20'),
      completedAt: new Date('2024-01-25')
    },
    risks: {
      phase: 'risks' as const,
      steps: [
        { stepId: 'risk-assessment', status: 'in_progress' as const, data: {} }
      ],
      completionPercentage: 25,
      startedAt: new Date('2024-02-05')
    },
    optimization: {
      phase: 'optimization' as const,
      steps: [
        { stepId: 'analytics-setup', status: 'not_started' as const, data: {} }
      ],
      completionPercentage: 0,
      startedAt: new Date('2024-02-20')
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

export default function ReportsPage() {
  return (
    <LaunchEssentialsLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Project Reports</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis and insights for your launch readiness
          </p>
        </div>

        <ReportingDashboard
          projectData={mockProjectData}
          progress={mockProgress}
        />
      </div>
    </LaunchEssentialsLayout>
  );
}
