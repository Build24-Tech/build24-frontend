import { LaunchPhase, ProjectData, ProjectStage, StepStatus, UserProgress } from '@/types/launch-essentials';

/**
 * Test data generators for consistent testing across the application
 */

export class TestDataGenerators {
  /**
   * Generate a realistic user progress object
   */
  static generateUserProgress(options: {
    userId?: string;
    projectId?: string;
    currentPhase?: LaunchPhase;
    completionLevel?: 'empty' | 'partial' | 'complete';
    customPhases?: Partial<Record<LaunchPhase, number>>; // completion percentages
  } = {}): UserProgress {
    const {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentPhase = 'validation',
      completionLevel = 'partial',
      customPhases = {}
    } = options;

    const phases: any = {};
    const phaseNames: LaunchPhase[] = [
      'validation', 'definition', 'technical', 'marketing',
      'operations', 'financial', 'risk', 'optimization'
    ];

    phaseNames.forEach((phase, index) => {
      let completionPercentage = 0;
      let steps: any[] = [];

      // Set completion based on level
      if (completionLevel === 'complete') {
        completionPercentage = 100;
      } else if (completionLevel === 'partial') {
        if (index === 0) completionPercentage = 100; // First phase complete
        else if (index === 1) completionPercentage = 50; // Second phase half
        else completionPercentage = 0; // Rest not started
      }

      // Override with custom completion if provided
      if (customPhases[phase] !== undefined) {
        completionPercentage = customPhases[phase]!;
      }

      // Generate steps based on completion
      const stepCount = this.getStepCountForPhase(phase);
      for (let i = 0; i < stepCount; i++) {
        let status: StepStatus = 'not_started';
        let data = {};

        if (completionPercentage === 100) {
          status = 'completed';
          data = this.generateStepData(phase, `step_${i}`);
        } else if (completionPercentage > 0 && i < Math.floor(stepCount * completionPercentage / 100)) {
          status = i === Math.floor(stepCount * completionPercentage / 100) - 1 ? 'in_progress' : 'completed';
          data = this.generateStepData(phase, `step_${i}`);
        }

        steps.push({
          stepId: `${phase}_step_${i}`,
          status,
          data,
          completedAt: status === 'completed' ? new Date() : undefined,
          notes: status !== 'not_started' ? `Test notes for ${phase} step ${i}` : undefined
        });
      }

      phases[phase] = {
        phase,
        steps,
        completionPercentage,
        startedAt: completionPercentage > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : new Date(),
        completedAt: completionPercentage === 100 ? new Date() : undefined
      };
    });

    return {
      userId,
      projectId,
      currentPhase,
      phases,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      updatedAt: new Date()
    };
  }

  /**
   * Generate a realistic project data object
   */
  static generateProjectData(options: {
    userId?: string;
    industry?: string;
    stage?: ProjectStage;
    complexity?: 'simple' | 'moderate' | 'complex';
    withData?: boolean;
  } = {}): ProjectData {
    const {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      industry = this.getRandomIndustry(),
      stage = 'concept',
      complexity = 'moderate',
      withData = true
    } = options;

    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectNames = this.getProjectNamesForIndustry(industry);
    const name = projectNames[Math.floor(Math.random() * projectNames.length)];

    const baseProject: ProjectData = {
      id: projectId,
      userId,
      name,
      description: this.generateProjectDescription(name, industry),
      industry,
      targetMarket: this.getTargetMarketForIndustry(industry),
      stage,
      data: {},
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
      updatedAt: new Date()
    };

    if (withData) {
      baseProject.data = this.generateProjectPhaseData(complexity);
    }

    return baseProject;
  }

  /**
   * Generate multiple related projects for a user
   */
  static generateUserPortfolio(userId: string, projectCount: number = 5): ProjectData[] {
    const projects: ProjectData[] = [];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce'];
    const stages: ProjectStage[] = ['concept', 'development', 'testing', 'launch', 'growth'];

    for (let i = 0; i < projectCount; i++) {
      const industry = industries[i % industries.length];
      const stage = stages[Math.floor(Math.random() * stages.length)];

      projects.push(this.generateProjectData({
        userId,
        industry,
        stage,
        complexity: i % 3 === 0 ? 'complex' : i % 2 === 0 ? 'moderate' : 'simple'
      }));
    }

    return projects;
  }

  /**
   * Generate realistic financial data
   */
  static generateFinancialData(options: {
    timeframe?: 'monthly' | 'quarterly' | 'yearly';
    periods?: number;
    businessModel?: 'saas' | 'ecommerce' | 'marketplace' | 'service';
    stage?: 'startup' | 'growth' | 'mature';
  } = {}) {
    const {
      timeframe = 'monthly',
      periods = 12,
      businessModel = 'saas',
      stage = 'startup'
    } = options;

    const baseRevenue = this.getBaseRevenueForModel(businessModel, stage);
    const growthRate = this.getGrowthRateForStage(stage);
    const churnRate = this.getChurnRateForModel(businessModel);

    const revenue: number[] = [];
    const expenses: number[] = [];

    for (let i = 0; i < periods; i++) {
      // Revenue with growth and some randomness
      const periodRevenue = baseRevenue * Math.pow(1 + growthRate, i) * (0.8 + Math.random() * 0.4);
      revenue.push(Math.round(periodRevenue));

      // Expenses as percentage of revenue with fixed costs
      const variableExpenses = periodRevenue * 0.6; // 60% of revenue
      const fixedExpenses = baseRevenue * 0.3; // 30% of base revenue
      const totalExpenses = variableExpenses + fixedExpenses;
      expenses.push(Math.round(totalExpenses));
    }

    return {
      timeframe,
      periods,
      startingCash: Math.round(baseRevenue * 6), // 6 months of revenue
      revenue,
      expenses,
      growthRate,
      churnRate,
      businessModel
    };
  }

  /**
   * Generate realistic market research data
   */
  static generateMarketResearchData(industry: string) {
    const marketSizes = {
      'Technology': { size: 'large', value: 500000000, growth: 15 },
      'Healthcare': { size: 'large', value: 800000000, growth: 8 },
      'Finance': { size: 'medium', value: 200000000, growth: 12 },
      'Education': { size: 'medium', value: 150000000, growth: 10 },
      'E-commerce': { size: 'large', value: 600000000, growth: 20 }
    };

    const market = marketSizes[industry as keyof typeof marketSizes] || marketSizes['Technology'];

    return {
      marketSize: market.size,
      marketValue: market.value,
      growthRate: market.growth,
      trends: this.getIndustryTrends(industry),
      challenges: this.getIndustryChallenges(industry),
      opportunities: this.getIndustryOpportunities(industry),
      targetSegments: this.getTargetSegments(industry),
      competitorCount: Math.floor(Math.random() * 20) + 5,
      marketMaturity: ['emerging', 'growing', 'mature'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Generate competitor analysis data
   */
  static generateCompetitorData(industry: string, count: number = 5) {
    const competitors = [];
    const competitorNames = this.getCompetitorNamesForIndustry(industry);

    for (let i = 0; i < Math.min(count, competitorNames.length); i++) {
      competitors.push({
        id: `competitor_${i}`,
        name: competitorNames[i],
        marketShare: Math.random() * 30, // 0-30% market share
        strengths: this.getRandomStrengths(),
        weaknesses: this.getRandomWeaknesses(),
        pricing: this.generateCompetitorPricing(),
        fundingStage: ['seed', 'series-a', 'series-b', 'series-c', 'public'][Math.floor(Math.random() * 5)],
        employeeCount: Math.floor(Math.random() * 1000) + 10,
        founded: 2010 + Math.floor(Math.random() * 14) // 2010-2024
      });
    }

    return competitors;
  }

  /**
   * Generate risk assessment data
   */
  static generateRiskData(projectData: ProjectData) {
    const risks = [];
    const riskTypes = ['market', 'technical', 'financial', 'operational', 'competitive', 'regulatory'];

    riskTypes.forEach(type => {
      const riskCount = Math.floor(Math.random() * 3) + 1; // 1-3 risks per type

      for (let i = 0; i < riskCount; i++) {
        risks.push({
          id: `${type}_risk_${i}`,
          type,
          title: this.getRiskTitleForType(type),
          description: this.getRiskDescriptionForType(type),
          probability: Math.floor(Math.random() * 5) + 1, // 1-5 scale
          impact: Math.floor(Math.random() * 5) + 1, // 1-5 scale
          severity: this.calculateRiskSeverity(Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1),
          mitigation: this.getMitigationForRiskType(type),
          owner: 'Project Manager',
          status: ['identified', 'analyzing', 'mitigating', 'monitoring'][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    });

    return risks.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact));
  }

  /**
   * Generate performance test data
   */
  static generatePerformanceTestData(size: 'small' | 'medium' | 'large' | 'xlarge') {
    const sizes = {
      small: { users: 10, projects: 50, steps: 100 },
      medium: { users: 100, projects: 500, steps: 1000 },
      large: { users: 1000, projects: 5000, steps: 10000 },
      xlarge: { users: 10000, projects: 50000, steps: 100000 }
    };

    const config = sizes[size];
    const data = {
      users: [],
      projects: [],
      userProgress: []
    };

    // Generate users
    for (let i = 0; i < config.users; i++) {
      data.users.push({
        id: `perf_user_${i}`,
        email: `user${i}@test.com`,
        displayName: `Test User ${i}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }

    // Generate projects
    for (let i = 0; i < config.projects; i++) {
      const userId = data.users[Math.floor(Math.random() * data.users.length)].id;
      data.projects.push(this.generateProjectData({ userId }));
    }

    // Generate user progress
    data.projects.forEach(project => {
      data.userProgress.push(this.generateUserProgress({
        userId: project.userId,
        projectId: project.id,
        completionLevel: ['empty', 'partial', 'complete'][Math.floor(Math.random() * 3)] as any
      }));
    });

    return data;
  }

  // Helper methods
  private static getStepCountForPhase(phase: LaunchPhase): number {
    const stepCounts = {
      validation: 5,
      definition: 4,
      technical: 6,
      marketing: 5,
      operations: 4,
      financial: 5,
      risk: 4,
      optimization: 3
    };
    return stepCounts[phase] || 4;
  }

  private static generateStepData(phase: LaunchPhase, stepId: string): any {
    const stepData: any = {
      stepId,
      completedAt: new Date(),
      notes: `Completed ${phase} ${stepId}`
    };

    // Add phase-specific data
    switch (phase) {
      case 'validation':
        stepData.marketSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
        stepData.competitorCount = Math.floor(Math.random() * 20) + 1;
        break;
      case 'definition':
        stepData.vision = `Vision for ${stepId}`;
        stepData.features = [`Feature 1`, `Feature 2`, `Feature 3`];
        break;
      case 'technical':
        stepData.technology = ['React', 'Node.js', 'Python', 'Java'][Math.floor(Math.random() * 4)];
        stepData.complexity = Math.floor(Math.random() * 10) + 1;
        break;
      case 'financial':
        stepData.revenue = Math.floor(Math.random() * 100000) + 10000;
        stepData.expenses = Math.floor(Math.random() * 80000) + 5000;
        break;
    }

    return stepData;
  }

  private static generateProjectDescription(name: string, industry: string): string {
    const templates = {
      'Technology': `${name} is an innovative technology solution designed to revolutionize the ${industry.toLowerCase()} industry through cutting-edge software and user-centric design.`,
      'Healthcare': `${name} aims to improve patient outcomes and healthcare delivery through innovative medical technology and data-driven insights.`,
      'Finance': `${name} provides financial services and solutions that empower individuals and businesses to achieve their financial goals.`,
      'Education': `${name} transforms learning experiences through innovative educational technology and personalized learning approaches.`,
      'E-commerce': `${name} creates seamless online shopping experiences that connect buyers and sellers in meaningful ways.`
    };

    return templates[industry as keyof typeof templates] || templates['Technology'];
  }

  private static generateProjectPhaseData(complexity: 'simple' | 'moderate' | 'complex'): any {
    const data: any = {};

    if (complexity === 'simple') {
      data.validation = { marketResearch: { completed: true } };
      data.definition = { vision: 'Simple product vision' };
    } else if (complexity === 'moderate') {
      data.validation = this.generateMarketResearchData('Technology');
      data.definition = { vision: 'Moderate product vision', features: ['Feature 1', 'Feature 2'] };
      data.technical = { stack: 'React/Node.js', complexity: 5 };
    } else {
      // Complex project with full data
      data.validation = this.generateMarketResearchData('Technology');
      data.definition = {
        vision: 'Complex product vision',
        features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
        metrics: ['DAU', 'Revenue', 'Retention']
      };
      data.technical = {
        stack: 'React/Node.js/Python',
        complexity: 8,
        infrastructure: 'AWS',
        security: 'Enterprise-grade'
      };
      data.financial = this.generateFinancialData();
      data.risk = this.generateRiskData({} as ProjectData);
    }

    return data;
  }

  private static getRandomIndustry(): string {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Retail'];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  private static getProjectNamesForIndustry(industry: string): string[] {
    const names = {
      'Technology': ['TechFlow', 'DataSync', 'CloudBridge', 'DevTools Pro', 'AI Assistant'],
      'Healthcare': ['HealthTracker', 'MedConnect', 'PatientCare+', 'HealthAnalytics', 'MedFlow'],
      'Finance': ['FinanceFlow', 'InvestSmart', 'BudgetBuddy', 'CryptoTracker', 'PaymentPro'],
      'Education': ['LearnHub', 'EduConnect', 'SkillBuilder', 'StudyMate', 'CourseFlow'],
      'E-commerce': ['ShopEasy', 'MarketPlace Pro', 'RetailFlow', 'OrderSync', 'CustomerHub']
    };

    return names[industry as keyof typeof names] || names['Technology'];
  }

  private static getTargetMarketForIndustry(industry: string): string {
    const markets = {
      'Technology': 'Developers and Tech Companies',
      'Healthcare': 'Healthcare Providers and Patients',
      'Finance': 'Individual Investors and Financial Advisors',
      'Education': 'Students and Educational Institutions',
      'E-commerce': 'Online Retailers and Consumers'
    };

    return markets[industry as keyof typeof markets] || 'General Business Market';
  }

  private static getBaseRevenueForModel(businessModel: string, stage: string): number {
    const baseRevenues = {
      saas: { startup: 10000, growth: 50000, mature: 200000 },
      ecommerce: { startup: 25000, growth: 100000, mature: 500000 },
      marketplace: { startup: 15000, growth: 75000, mature: 300000 },
      service: { startup: 20000, growth: 80000, mature: 250000 }
    };

    return baseRevenues[businessModel as keyof typeof baseRevenues]?.[stage as keyof typeof baseRevenues.saas] || 10000;
  }

  private static getGrowthRateForStage(stage: string): number {
    const growthRates = { startup: 0.15, growth: 0.08, mature: 0.03 };
    return growthRates[stage as keyof typeof growthRates] || 0.08;
  }

  private static getChurnRateForModel(businessModel: string): number {
    const churnRates = { saas: 0.05, ecommerce: 0.15, marketplace: 0.08, service: 0.03 };
    return churnRates[businessModel as keyof typeof churnRates] || 0.05;
  }

  private static getIndustryTrends(industry: string): string[] {
    const trends = {
      'Technology': ['AI/ML adoption', 'Cloud migration', 'Remote work tools', 'Cybersecurity focus'],
      'Healthcare': ['Telemedicine growth', 'AI diagnostics', 'Personalized medicine', 'Digital health records'],
      'Finance': ['Digital banking', 'Cryptocurrency adoption', 'Robo-advisors', 'RegTech solutions'],
      'Education': ['Online learning', 'Personalized education', 'VR/AR in classrooms', 'Skill-based learning'],
      'E-commerce': ['Mobile commerce', 'Social commerce', 'Sustainable products', 'Same-day delivery']
    };

    return trends[industry as keyof typeof trends] || trends['Technology'];
  }

  private static getIndustryChallenges(industry: string): string[] {
    const challenges = {
      'Technology': ['Talent shortage', 'Rapid technology changes', 'Data privacy concerns', 'Market saturation'],
      'Healthcare': ['Regulatory compliance', 'Data security', 'Cost pressures', 'Aging population'],
      'Finance': ['Regulatory changes', 'Cybersecurity threats', 'Economic uncertainty', 'Competition from fintech'],
      'Education': ['Funding constraints', 'Technology adoption', 'Changing job market', 'Student debt crisis'],
      'E-commerce': ['Supply chain disruptions', 'Customer acquisition costs', 'Returns management', 'Competition']
    };

    return challenges[industry as keyof typeof challenges] || challenges['Technology'];
  }

  private static getIndustryOpportunities(industry: string): string[] {
    const opportunities = {
      'Technology': ['Emerging markets', 'IoT expansion', 'Edge computing', 'Quantum computing'],
      'Healthcare': ['Aging population', 'Preventive care', 'Mental health focus', 'Global health initiatives'],
      'Finance': ['Financial inclusion', 'ESG investing', 'DeFi innovation', 'Cross-border payments'],
      'Education': ['Lifelong learning', 'Corporate training', 'Micro-credentials', 'Global online education'],
      'E-commerce': ['Emerging markets', 'B2B e-commerce', 'Subscription models', 'Voice commerce']
    };

    return opportunities[industry as keyof typeof opportunities] || opportunities['Technology'];
  }

  private static getTargetSegments(industry: string): string[] {
    const segments = {
      'Technology': ['Enterprise', 'SMB', 'Developers', 'Consumers'],
      'Healthcare': ['Hospitals', 'Clinics', 'Patients', 'Insurance companies'],
      'Finance': ['Retail investors', 'Institutional investors', 'SMBs', 'Banks'],
      'Education': ['K-12 schools', 'Universities', 'Corporate training', 'Individual learners'],
      'E-commerce': ['B2C retailers', 'B2B buyers', 'Marketplaces', 'Direct-to-consumer brands']
    };

    return segments[industry as keyof typeof segments] || segments['Technology'];
  }

  private static getCompetitorNamesForIndustry(industry: string): string[] {
    const competitors = {
      'Technology': ['TechCorp', 'InnovateSoft', 'DataSystems Inc', 'CloudTech Solutions', 'NextGen Technologies'],
      'Healthcare': ['HealthTech Inc', 'MedSolutions', 'CareConnect', 'HealthFlow Systems', 'MedTech Innovations'],
      'Finance': ['FinTech Solutions', 'InvestCorp', 'PaymentSystems', 'WealthTech', 'CryptoFinance'],
      'Education': ['EduTech Inc', 'LearningFlow', 'SkillTech', 'EduSolutions', 'KnowledgeHub'],
      'E-commerce': ['ShopTech', 'RetailSolutions', 'CommerceFlow', 'MarketTech', 'OrderSystems']
    };

    return competitors[industry as keyof typeof competitors] || competitors['Technology'];
  }

  private static getRandomStrengths(): string[] {
    const strengths = [
      'Strong brand recognition', 'Advanced technology', 'Large user base', 'Strong funding',
      'Experienced team', 'Market leadership', 'Innovation capability', 'Strategic partnerships',
      'Cost efficiency', 'Customer loyalty', 'Global presence', 'Regulatory compliance'
    ];

    return this.getRandomItems(strengths, 2, 4);
  }

  private static getRandomWeaknesses(): string[] {
    const weaknesses = [
      'Limited market presence', 'High customer acquisition cost', 'Technical debt',
      'Slow innovation', 'Poor user experience', 'Limited funding', 'Regulatory challenges',
      'Talent shortage', 'Scalability issues', 'Customer churn', 'Competitive pressure'
    ];

    return this.getRandomItems(weaknesses, 1, 3);
  }

  private static generateCompetitorPricing(): any {
    const models = ['freemium', 'subscription', 'one-time', 'usage-based'];
    const model = models[Math.floor(Math.random() * models.length)];

    return {
      model,
      price: Math.floor(Math.random() * 200) + 10,
      currency: 'USD',
      billing: ['monthly', 'yearly'][Math.floor(Math.random() * 2)]
    };
  }

  private static getRiskTitleForType(type: string): string {
    const titles = {
      market: ['Market size overestimation', 'Competitive pressure', 'Economic downturn impact'],
      technical: ['Technology scalability', 'Security vulnerabilities', 'Integration complexity'],
      financial: ['Funding shortfall', 'Revenue projections', 'Cost overruns'],
      operational: ['Team capacity', 'Process inefficiencies', 'Vendor dependencies'],
      competitive: ['New market entrants', 'Price wars', 'Feature competition'],
      regulatory: ['Compliance changes', 'Data privacy laws', 'Industry regulations']
    };

    const typeRisks = titles[type as keyof typeof titles] || titles.market;
    return typeRisks[Math.floor(Math.random() * typeRisks.length)];
  }

  private static getRiskDescriptionForType(type: string): string {
    const descriptions = {
      market: 'Market conditions may not support projected growth and adoption rates.',
      technical: 'Technical challenges may impact development timeline and product quality.',
      financial: 'Financial constraints may limit ability to execute business plan effectively.',
      operational: 'Operational inefficiencies may impact product delivery and customer satisfaction.',
      competitive: 'Competitive pressures may impact market share and pricing strategy.',
      regulatory: 'Regulatory changes may require significant compliance investments.'
    };

    return descriptions[type as keyof typeof descriptions] || descriptions.market;
  }

  private static calculateRiskSeverity(probability: number, impact: number): 'low' | 'medium' | 'high' | 'critical' {
    const score = probability * impact;
    if (score >= 20) return 'critical';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  private static getMitigationForRiskType(type: string): string {
    const mitigations = {
      market: 'Conduct additional market research and adjust strategy based on findings.',
      technical: 'Implement robust testing procedures and maintain technical documentation.',
      financial: 'Develop contingency funding plans and monitor cash flow closely.',
      operational: 'Establish clear processes and invest in team training and development.',
      competitive: 'Monitor competitive landscape and maintain product differentiation.',
      regulatory: 'Stay informed of regulatory changes and maintain compliance procedures.'
    };

    return mitigations[type as keyof typeof mitigations] || mitigations.market;
  }

  private static getRandomItems<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
