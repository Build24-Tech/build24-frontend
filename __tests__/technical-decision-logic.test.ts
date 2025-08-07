import { PerformanceTarget, TechnicalData } from '@/types/launch-essentials';

// Technical Decision Logic Functions
export interface TechnologyOption {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure';
  pros: string[];
  cons: string[];
  cost: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
  scalability: 'low' | 'medium' | 'high';
  popularity: number;
}

export interface ConflictDetection {
  type: 'performance' | 'cost' | 'complexity' | 'timeline';
  severity: 'low' | 'medium' | 'high';
  description: string;
  alternatives: string[];
}

export interface TechnicalRecommendation {
  type: 'technology' | 'architecture' | 'performance' | 'security';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  alternatives: string[];
  estimatedImpact: {
    cost: number; // -100 to 100 (negative = cost reduction)
    timeline: number; // -100 to 100 (negative = time reduction)
    complexity: number; // -100 to 100 (negative = complexity reduction)
    performance: number; // -100 to 100 (positive = performance improvement)
  };
}

// Technology Options Database
export const TECHNOLOGY_OPTIONS: TechnologyOption[] = [
  // Frontend Technologies
  {
    name: 'React',
    category: 'frontend',
    pros: ['Large ecosystem', 'Component reusability', 'Strong community', 'Flexible'],
    cons: ['Learning curve', 'Frequent updates', 'Requires additional libraries'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 95
  },
  {
    name: 'Vue.js',
    category: 'frontend',
    pros: ['Easy to learn', 'Good documentation', 'Progressive adoption', 'Small bundle size'],
    cons: ['Smaller ecosystem', 'Less job market', 'Limited enterprise adoption'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 75
  },
  {
    name: 'Angular',
    category: 'frontend',
    pros: ['Full framework', 'TypeScript native', 'Enterprise ready', 'Comprehensive tooling'],
    cons: ['Steep learning curve', 'Verbose', 'Large bundle size', 'Complex setup'],
    cost: 'low',
    complexity: 'high',
    scalability: 'high',
    popularity: 70
  },
  {
    name: 'Svelte',
    category: 'frontend',
    pros: ['No virtual DOM', 'Small bundle size', 'Simple syntax', 'Fast performance'],
    cons: ['Small ecosystem', 'Limited tooling', 'Newer technology', 'Less community support'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 40
  },
  // Backend Technologies
  {
    name: 'Node.js',
    category: 'backend',
    pros: ['JavaScript everywhere', 'Fast development', 'Large package ecosystem', 'Good for real-time apps'],
    cons: ['Single-threaded', 'Callback complexity', 'Not ideal for CPU-intensive tasks'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'medium',
    popularity: 85
  },
  {
    name: 'Python/Django',
    category: 'backend',
    pros: ['Rapid development', 'Clean syntax', 'Great for MVPs', 'Rich libraries'],
    cons: ['Performance limitations', 'GIL constraints', 'Not ideal for real-time'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 80
  },
  {
    name: 'Java/Spring',
    category: 'backend',
    pros: ['Enterprise grade', 'High performance', 'Strong typing', 'Mature ecosystem'],
    cons: ['Verbose', 'Slower development', 'Complex configuration', 'Resource intensive'],
    cost: 'medium',
    complexity: 'high',
    scalability: 'high',
    popularity: 75
  },
  {
    name: 'Go',
    category: 'backend',
    pros: ['Fast compilation', 'Concurrent', 'Simple syntax', 'Good performance'],
    cons: ['Limited libraries', 'Verbose error handling', 'Less mature ecosystem'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 60
  },
  // Database Technologies
  {
    name: 'PostgreSQL',
    category: 'database',
    pros: ['ACID compliance', 'Advanced features', 'Open source', 'JSON support'],
    cons: ['Complex configuration', 'Resource intensive', 'Steeper learning curve'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 85
  },
  {
    name: 'MongoDB',
    category: 'database',
    pros: ['Flexible schema', 'Easy scaling', 'JSON-like documents', 'Good for rapid development'],
    cons: ['No ACID transactions', 'Memory usage', 'Eventual consistency issues'],
    cost: 'medium',
    complexity: 'low',
    scalability: 'high',
    popularity: 75
  },
  {
    name: 'MySQL',
    category: 'database',
    pros: ['Mature', 'Wide support', 'Good performance', 'Easy to use'],
    cons: ['Limited features', 'Licensing concerns', 'Less advanced than PostgreSQL'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 80
  },
  {
    name: 'Redis',
    category: 'database',
    pros: ['In-memory speed', 'Multiple data structures', 'Good for caching', 'Simple'],
    cons: ['Memory limitations', 'Data persistence complexity', 'Not suitable as primary DB'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 70
  },
  // Infrastructure Technologies
  {
    name: 'AWS',
    category: 'infrastructure',
    pros: ['Comprehensive services', 'Market leader', 'Global reach', 'Mature platform'],
    cons: ['Complex pricing', 'Vendor lock-in', 'Steep learning curve', 'Can be expensive'],
    cost: 'medium',
    complexity: 'high',
    scalability: 'high',
    popularity: 90
  },
  {
    name: 'Vercel',
    category: 'infrastructure',
    pros: ['Easy deployment', 'Great DX', 'Edge functions', 'Automatic scaling'],
    cons: ['Limited backend', 'Pricing at scale', 'Vendor lock-in', 'Less control'],
    cost: 'low',
    complexity: 'low',
    scalability: 'medium',
    popularity: 70
  },
  {
    name: 'Docker',
    category: 'infrastructure',
    pros: ['Containerization', 'Consistent environments', 'Easy scaling', 'Portable'],
    cons: ['Learning curve', 'Resource overhead', 'Complexity for simple apps'],
    cost: 'low',
    complexity: 'medium',
    scalability: 'high',
    popularity: 85
  },
  {
    name: 'Kubernetes',
    category: 'infrastructure',
    pros: ['Container orchestration', 'Auto-scaling', 'Self-healing', 'Cloud agnostic'],
    cons: ['Very complex', 'Overkill for small apps', 'Steep learning curve', 'Resource intensive'],
    cost: 'high',
    complexity: 'high',
    scalability: 'high',
    popularity: 65
  }
];

// Core Decision Logic Functions
export class TechnicalDecisionEngine {

  /**
   * Detects conflicts in the technical architecture
   */
  static detectConflicts(data: TechnicalData): ConflictDetection[] {
    const conflicts: ConflictDetection[] = [];
    const { technologyStack, architecture } = data;

    // Cost vs Complexity Analysis
    const costConflicts = this.analyzeCostComplexity(technologyStack);
    conflicts.push(...costConflicts);

    // Performance vs Technology Choice Analysis
    const performanceConflicts = this.analyzePerformanceConflicts(technologyStack, architecture.performanceTargets);
    conflicts.push(...performanceConflicts);

    // Timeline vs Complexity Analysis
    const timelineConflicts = this.analyzeTimelineComplexity(technologyStack);
    conflicts.push(...timelineConflicts);

    // Scalability vs Current Architecture
    const scalabilityConflicts = this.analyzeScalabilityConflicts(technologyStack, architecture);
    conflicts.push(...scalabilityConflicts);

    return conflicts;
  }

  /**
   * Generates technical recommendations based on current architecture
   */
  static generateRecommendations(data: TechnicalData, projectContext?: {
    budget: number;
    timeline: string;
    teamSize: number;
    experience: 'junior' | 'mid' | 'senior';
  }): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    // Technology Stack Recommendations
    recommendations.push(...this.getTechnologyRecommendations(data, projectContext));

    // Architecture Recommendations
    recommendations.push(...this.getArchitectureRecommendations(data, projectContext));

    // Performance Recommendations
    recommendations.push(...this.getPerformanceRecommendations(data, projectContext));

    // Security Recommendations
    recommendations.push(...this.getSecurityRecommendations(data, projectContext));

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aScore = priorityWeight[a.priority] + this.calculateOverallImpact(a.estimatedImpact);
      const bScore = priorityWeight[b.priority] + this.calculateOverallImpact(b.estimatedImpact);
      return bScore - aScore;
    });
  }

  /**
   * Calculates technology compatibility score
   */
  static calculateCompatibilityScore(technologies: string[]): number {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      'React': { 'Node.js': 0.9, 'Python/Django': 0.7, 'Java/Spring': 0.6, 'Go': 0.8 },
      'Vue.js': { 'Node.js': 0.8, 'Python/Django': 0.8, 'Java/Spring': 0.5, 'Go': 0.7 },
      'Angular': { 'Node.js': 0.8, 'Python/Django': 0.6, 'Java/Spring': 0.9, 'Go': 0.7 },
      'PostgreSQL': { 'Node.js': 0.9, 'Python/Django': 0.9, 'Java/Spring': 0.9, 'Go': 0.8 },
      'MongoDB': { 'Node.js': 0.9, 'Python/Django': 0.8, 'Java/Spring': 0.7, 'Go': 0.8 },
      'AWS': { 'Docker': 0.9, 'Kubernetes': 0.9, 'Vercel': 0.3 },
      'Vercel': { 'React': 0.9, 'Vue.js': 0.8, 'Angular': 0.7 }
    };

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < technologies.length; i++) {
      for (let j = i + 1; j < technologies.length; j++) {
        const tech1 = technologies[i];
        const tech2 = technologies[j];

        if (compatibilityMatrix[tech1]?.[tech2]) {
          totalScore += compatibilityMatrix[tech1][tech2];
          comparisons++;
        } else if (compatibilityMatrix[tech2]?.[tech1]) {
          totalScore += compatibilityMatrix[tech2][tech1];
          comparisons++;
        }
      }
    }

    return comparisons > 0 ? totalScore / comparisons : 0.5;
  }

  // Private helper methods
  private static analyzeCostComplexity(technologyStack: TechnicalData['technologyStack']): ConflictDetection[] {
    const conflicts: ConflictDetection[] = [];
    const allTechs = [
      ...technologyStack.frontend,
      ...technologyStack.backend,
      ...technologyStack.database,
      ...technologyStack.infrastructure
    ];

    const highComplexityTechs = allTechs.filter(tech => {
      const option = TECHNOLOGY_OPTIONS.find(opt => opt.name === tech);
      return option?.complexity === 'high';
    });

    const highCostTechs = allTechs.filter(tech => {
      const option = TECHNOLOGY_OPTIONS.find(opt => opt.name === tech);
      return option?.cost === 'high';
    });

    if (highComplexityTechs.length >= 2) {
      conflicts.push({
        type: 'complexity',
        severity: 'high',
        description: `Multiple high-complexity technologies (${highComplexityTechs.join(', ')}) may significantly increase development time and maintenance costs`,
        alternatives: [
          'Consider simpler alternatives for non-critical components',
          'Phase implementation to reduce initial complexity',
          'Ensure team has adequate expertise'
        ]
      });
    }

    if (highCostTechs.length >= 1 && highComplexityTechs.length >= 1) {
      conflicts.push({
        type: 'cost',
        severity: 'medium',
        description: 'High-cost and high-complexity stack may strain budget and timeline',
        alternatives: [
          'Use managed services to reduce operational complexity',
          'Consider open-source alternatives',
          'Implement MVP with simpler stack first'
        ]
      });
    }

    return conflicts;
  }

  private static analyzePerformanceConflicts(
    technologyStack: TechnicalData['technologyStack'],
    performanceTargets: PerformanceTarget[]
  ): ConflictDetection[] {
    const conflicts: ConflictDetection[] = [];

    // Check for ACID compliance requirements with MongoDB
    const hasACIDRequirement = performanceTargets.some(target =>
      target.metric.toLowerCase().includes('acid') ||
      target.metric.toLowerCase().includes('consistency')
    );

    if (hasACIDRequirement && technologyStack.database.includes('MongoDB')) {
      conflicts.push({
        type: 'performance',
        severity: 'high',
        description: 'MongoDB lacks full ACID compliance which conflicts with consistency requirements',
        alternatives: [
          'Use PostgreSQL for ACID compliance',
          'Implement application-level transaction handling',
          'Consider MongoDB transactions (limited scenarios)'
        ]
      });
    }

    // Check for high-performance requirements with interpreted languages
    const hasHighPerformanceReq = performanceTargets.some(target =>
      (target.metric.toLowerCase().includes('response') && target.target < 100) ||
      (target.metric.toLowerCase().includes('throughput') && target.target > 10000)
    );

    if (hasHighPerformanceReq && technologyStack.backend.includes('Python/Django')) {
      conflicts.push({
        type: 'performance',
        severity: 'medium',
        description: 'Python/Django may not meet aggressive performance targets due to GIL limitations',
        alternatives: [
          'Use Go or Java for high-performance requirements',
          'Implement caching strategies',
          'Consider async Python frameworks like FastAPI'
        ]
      });
    }

    return conflicts;
  }

  private static analyzeTimelineComplexity(technologyStack: TechnicalData['technologyStack']): ConflictDetection[] {
    const conflicts: ConflictDetection[] = [];
    const allTechs = [
      ...technologyStack.frontend,
      ...technologyStack.backend,
      ...technologyStack.database,
      ...technologyStack.infrastructure
    ];

    const complexTechs = allTechs.filter(tech => {
      const option = TECHNOLOGY_OPTIONS.find(opt => opt.name === tech);
      return option?.complexity === 'high';
    });

    if (complexTechs.length >= 2) {
      conflicts.push({
        type: 'timeline',
        severity: 'medium',
        description: `Complex technology stack (${complexTechs.join(', ')}) may extend development timeline significantly`,
        alternatives: [
          'Use React + Node.js for faster development',
          'Consider low-code platforms for MVP',
          'Implement in phases with simpler technologies first'
        ]
      });
    }

    // Check for specific problematic combinations
    if (technologyStack.frontend.includes('Angular') && technologyStack.backend.includes('Java/Spring')) {
      conflicts.push({
        type: 'timeline',
        severity: 'medium',
        description: 'Angular + Java/Spring combination requires significant setup and configuration time',
        alternatives: [
          'Use React + Node.js for faster development',
          'Consider Spring Boot for reduced configuration',
          'Use Angular CLI and Spring Boot starters'
        ]
      });
    }

    return conflicts;
  }

  private static analyzeScalabilityConflicts(
    technologyStack: TechnicalData['technologyStack'],
    architecture: TechnicalData['architecture']
  ): ConflictDetection[] {
    const conflicts: ConflictDetection[] = [];

    // Check if scalability plan mentions high scale but technologies don't support it
    const mentionsHighScale = architecture.scalabilityPlan.toLowerCase().includes('million') ||
      architecture.scalabilityPlan.toLowerCase().includes('scale') ||
      architecture.scalabilityPlan.toLowerCase().includes('load');

    if (mentionsHighScale) {
      const lowScalabilityTechs = [
        ...technologyStack.frontend,
        ...technologyStack.backend,
        ...technologyStack.database,
        ...technologyStack.infrastructure
      ].filter(tech => {
        const option = TECHNOLOGY_OPTIONS.find(opt => opt.name === tech);
        return option?.scalability === 'low';
      });

      if (lowScalabilityTechs.length > 0) {
        conflicts.push({
          type: 'performance',
          severity: 'high',
          description: `Scalability plan requires high scale but some technologies (${lowScalabilityTechs.join(', ')}) have limited scalability`,
          alternatives: [
            'Replace low-scalability technologies with alternatives',
            'Implement caching and CDN strategies',
            'Consider microservices architecture'
          ]
        });
      }
    }

    return conflicts;
  }

  private static getTechnologyRecommendations(
    data: TechnicalData,
    context?: any
  ): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    // Recommend based on missing technologies
    if (data.technologyStack.frontend.length === 0) {
      recommendations.push({
        type: 'technology',
        priority: 'high',
        title: 'Select Frontend Framework',
        description: 'Choose a frontend framework to build your user interface',
        reasoning: 'Frontend framework is essential for user interaction',
        alternatives: ['React (popular, flexible)', 'Vue.js (easy to learn)', 'Angular (enterprise-ready)'],
        estimatedImpact: {
          cost: 0,
          timeline: -30,
          complexity: 20,
          performance: 40
        }
      });
    }

    // Recommend technology upgrades
    if (data.technologyStack.database.includes('MySQL') &&
      data.architecture.performanceTargets.some(t => t.metric.includes('JSON'))) {
      recommendations.push({
        type: 'technology',
        priority: 'medium',
        title: 'Consider PostgreSQL for JSON Support',
        description: 'PostgreSQL offers better JSON support than MySQL',
        reasoning: 'Performance targets indicate need for advanced JSON operations',
        alternatives: ['PostgreSQL', 'MongoDB for document-based approach'],
        estimatedImpact: {
          cost: -10,
          timeline: 15,
          complexity: 10,
          performance: 30
        }
      });
    }

    return recommendations;
  }

  private static getArchitectureRecommendations(
    data: TechnicalData,
    context?: any
  ): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    if (!data.architecture.systemDesign) {
      recommendations.push({
        type: 'architecture',
        priority: 'high',
        title: 'Define System Architecture',
        description: 'Create a clear system design document',
        reasoning: 'System architecture is crucial for development planning',
        alternatives: ['Monolithic for simplicity', 'Microservices for scalability', 'Serverless for cost efficiency'],
        estimatedImpact: {
          cost: 0,
          timeline: -20,
          complexity: -30,
          performance: 20
        }
      });
    }

    if (data.architecture.performanceTargets.length === 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Set Performance Targets',
        description: 'Define specific performance goals for your application',
        reasoning: 'Performance targets guide technical decisions and optimization efforts',
        alternatives: ['Response time targets', 'Throughput requirements', 'Availability goals'],
        estimatedImpact: {
          cost: 0,
          timeline: -10,
          complexity: 5,
          performance: 50
        }
      });
    }

    return recommendations;
  }

  private static getPerformanceRecommendations(
    data: TechnicalData,
    context?: any
  ): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    // Check for caching recommendations
    if (data.technologyStack.database.length > 0 &&
      !data.technologyStack.database.includes('Redis')) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Consider Adding Redis for Caching',
        description: 'Redis can significantly improve application performance through caching',
        reasoning: 'Caching reduces database load and improves response times',
        alternatives: ['Redis', 'Memcached', 'Application-level caching'],
        estimatedImpact: {
          cost: 10,
          timeline: 10,
          complexity: 15,
          performance: 60
        }
      });
    }

    // CDN recommendations
    if (data.technologyStack.frontend.length > 0 &&
      !data.technologyStack.infrastructure.includes('CDN')) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Implement CDN for Static Assets',
        description: 'Content Delivery Network improves loading times globally',
        reasoning: 'CDN reduces latency and improves user experience',
        alternatives: ['CloudFlare', 'AWS CloudFront', 'Vercel Edge Network'],
        estimatedImpact: {
          cost: 15,
          timeline: 5,
          complexity: 10,
          performance: 40
        }
      });
    }

    return recommendations;
  }

  private static getSecurityRecommendations(
    data: TechnicalData,
    context?: any
  ): TechnicalRecommendation[] {
    const recommendations: TechnicalRecommendation[] = [];

    if (data.security.requirements.length === 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Define Security Requirements',
        description: 'Establish comprehensive security requirements for your application',
        reasoning: 'Security should be built in from the start, not added later',
        alternatives: ['Authentication & Authorization', 'Data Encryption', 'Input Validation'],
        estimatedImpact: {
          cost: 20,
          timeline: 15,
          complexity: 25,
          performance: -5
        }
      });
    }

    const hasAuthRequirement = data.security.requirements.some(req =>
      req.requirement.toLowerCase().includes('auth')
    );

    if (!hasAuthRequirement && data.technologyStack.backend.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Implement Authentication System',
        description: 'Add user authentication and authorization to your application',
        reasoning: 'Most applications require user management and access control',
        alternatives: ['OAuth 2.0', 'JWT tokens', 'Session-based auth'],
        estimatedImpact: {
          cost: 15,
          timeline: 20,
          complexity: 30,
          performance: -10
        }
      });
    }

    return recommendations;
  }

  private static calculateOverallImpact(impact: TechnicalRecommendation['estimatedImpact']): number {
    // Weighted calculation: performance and timeline are most important
    return (impact.performance * 0.3) +
      (Math.abs(impact.timeline) * 0.3) +
      (Math.abs(impact.cost) * 0.2) +
      (Math.abs(impact.complexity) * 0.2);
  }
}

// Test the decision logic
describe('TechnicalDecisionEngine', () => {
  const mockTechnicalData: TechnicalData = {
    technologyStack: {
      frontend: ['React'],
      backend: ['Node.js'],
      database: ['PostgreSQL'],
      infrastructure: ['AWS'],
      reasoning: 'Modern, scalable stack'
    },
    architecture: {
      systemDesign: 'Microservices architecture',
      scalabilityPlan: 'Horizontal scaling with load balancers',
      performanceTargets: [
        {
          metric: 'Response Time',
          target: 200,
          unit: 'ms',
          priority: 'critical'
        }
      ]
    },
    integrations: {
      thirdPartyServices: [],
      apis: []
    },
    security: {
      requirements: [
        {
          requirement: 'Authentication & Authorization',
          priority: 'critical',
          implementation: 'OAuth 2.0',
          compliance: ['GDPR']
        }
      ],
      compliance: []
    }
  };

  describe('detectConflicts', () => {
    it('should detect no conflicts for a well-balanced stack', () => {
      const conflicts = TechnicalDecisionEngine.detectConflicts(mockTechnicalData);
      expect(conflicts).toHaveLength(0);
    });

    it('should detect cost conflicts with high-complexity technologies', () => {
      const highComplexityData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring'],
          infrastructure: ['Kubernetes']
        }
      };

      const conflicts = TechnicalDecisionEngine.detectConflicts(highComplexityData);
      expect(conflicts).toHaveLength(2); // complexity and timeline conflicts
      expect(conflicts[0].type).toBe('complexity');
      expect(conflicts[0].severity).toBe('high');
    });

    it('should detect performance conflicts with MongoDB and ACID requirements', () => {
      const acidConflictData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          database: ['MongoDB']
        },
        architecture: {
          ...mockTechnicalData.architecture,
          performanceTargets: [
            {
              metric: 'ACID Compliance',
              target: 100,
              unit: '%',
              priority: 'critical' as const
            }
          ]
        }
      };

      const conflicts = TechnicalDecisionEngine.detectConflicts(acidConflictData);
      expect(conflicts.some(c => c.type === 'performance')).toBe(true);
      expect(conflicts.find(c => c.type === 'performance')?.description).toContain('ACID compliance');
    });

    it('should detect timeline conflicts with complex technology combinations', () => {
      const timelineConflictData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          frontend: ['Angular'],
          backend: ['Java/Spring']
        }
      };

      const conflicts = TechnicalDecisionEngine.detectConflicts(timelineConflictData);
      expect(conflicts.some(c => c.type === 'timeline')).toBe(true);
    });

    it('should detect scalability conflicts', () => {
      const scalabilityConflictData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          database: ['MySQL'] // Lower scalability
        },
        architecture: {
          ...mockTechnicalData.architecture,
          scalabilityPlan: 'Need to handle millions of users with high load'
        }
      };

      const conflicts = TechnicalDecisionEngine.detectConflicts(scalabilityConflictData);
      expect(conflicts.some(c => c.description.includes('scalability'))).toBe(true);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for incomplete stack', () => {
      const incompleteData = {
        ...mockTechnicalData,
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
        security: {
          requirements: [],
          compliance: []
        }
      };

      const recommendations = TechnicalDecisionEngine.generateRecommendations(incompleteData);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.title.includes('Frontend Framework'))).toBe(true);
      expect(recommendations.some(r => r.title.includes('System Architecture'))).toBe(true);
    });

    it('should prioritize high-impact recommendations', () => {
      const recommendations = TechnicalDecisionEngine.generateRecommendations(mockTechnicalData);

      // High priority recommendations should come first
      const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
      const mediumPriorityRecs = recommendations.filter(r => r.priority === 'medium');

      if (highPriorityRecs.length > 0 && mediumPriorityRecs.length > 0) {
        const firstHighIndex = recommendations.findIndex(r => r.priority === 'high');
        const firstMediumIndex = recommendations.findIndex(r => r.priority === 'medium');
        expect(firstHighIndex).toBeLessThan(firstMediumIndex);
      }
    });

    it('should provide context-aware recommendations', () => {
      const context = {
        budget: 10000,
        timeline: '3 months',
        teamSize: 2,
        experience: 'junior' as const
      };

      const recommendations = TechnicalDecisionEngine.generateRecommendations(mockTechnicalData, context);
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should recommend performance improvements', () => {
      const noPerformanceData = {
        ...mockTechnicalData,
        technologyStack: {
          ...mockTechnicalData.technologyStack,
          database: ['PostgreSQL'] // No Redis
        }
      };

      const recommendations = TechnicalDecisionEngine.generateRecommendations(noPerformanceData);
      expect(recommendations.some(r => r.title.includes('Redis'))).toBe(true);
    });

    it('should recommend security improvements', () => {
      const noSecurityData = {
        ...mockTechnicalData,
        security: {
          requirements: [],
          compliance: []
        }
      };

      const recommendations = TechnicalDecisionEngine.generateRecommendations(noSecurityData);
      expect(recommendations.some(r => r.type === 'security')).toBe(true);
    });
  });

  describe('calculateCompatibilityScore', () => {
    it('should return high score for compatible technologies', () => {
      const compatibleTechs = ['React', 'Node.js', 'PostgreSQL'];
      const score = TechnicalDecisionEngine.calculateCompatibilityScore(compatibleTechs);
      expect(score).toBeGreaterThan(0.7);
    });

    it('should return lower score for less compatible technologies', () => {
      const incompatibleTechs = ['Angular', 'Python/Django', 'Vercel'];
      const score = TechnicalDecisionEngine.calculateCompatibilityScore(incompatibleTechs);
      expect(score).toBeLessThan(0.8);
    });

    it('should return default score for unknown technologies', () => {
      const unknownTechs = ['UnknownTech1', 'UnknownTech2'];
      const score = TechnicalDecisionEngine.calculateCompatibilityScore(unknownTechs);
      expect(score).toBe(0.5);
    });

    it('should handle single technology', () => {
      const singleTech = ['React'];
      const score = TechnicalDecisionEngine.calculateCompatibilityScore(singleTech);
      expect(score).toBe(0.5);
    });

    it('should handle empty array', () => {
      const noTechs: string[] = [];
      const score = TechnicalDecisionEngine.calculateCompatibilityScore(noTechs);
      expect(score).toBe(0.5);
    });
  });

  describe('Technology Options Database', () => {
    it('should have comprehensive technology options', () => {
      expect(TECHNOLOGY_OPTIONS.length).toBeGreaterThan(10);

      const categories = ['frontend', 'backend', 'database', 'infrastructure'];
      categories.forEach(category => {
        const categoryOptions = TECHNOLOGY_OPTIONS.filter(opt => opt.category === category);
        expect(categoryOptions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid data for all technology options', () => {
      TECHNOLOGY_OPTIONS.forEach(option => {
        expect(option.name).toBeDefined();
        expect(option.category).toBeDefined();
        expect(option.pros).toBeInstanceOf(Array);
        expect(option.cons).toBeInstanceOf(Array);
        expect(['low', 'medium', 'high']).toContain(option.cost);
        expect(['low', 'medium', 'high']).toContain(option.complexity);
        expect(['low', 'medium', 'high']).toContain(option.scalability);
        expect(option.popularity).toBeGreaterThanOrEqual(0);
        expect(option.popularity).toBeLessThanOrEqual(100);
      });
    });

    it('should provide balanced pros and cons', () => {
      TECHNOLOGY_OPTIONS.forEach(option => {
        expect(option.pros.length).toBeGreaterThan(0);
        expect(option.cons.length).toBeGreaterThan(0);
        expect(option.pros.length + option.cons.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('Recommendation Impact Calculation', () => {
    it('should calculate realistic impact estimates', () => {
      const recommendations = TechnicalDecisionEngine.generateRecommendations(mockTechnicalData);

      recommendations.forEach(rec => {
        expect(rec.estimatedImpact.cost).toBeGreaterThanOrEqual(-100);
        expect(rec.estimatedImpact.cost).toBeLessThanOrEqual(100);
        expect(rec.estimatedImpact.timeline).toBeGreaterThanOrEqual(-100);
        expect(rec.estimatedImpact.timeline).toBeLessThanOrEqual(100);
        expect(rec.estimatedImpact.complexity).toBeGreaterThanOrEqual(-100);
        expect(rec.estimatedImpact.complexity).toBeLessThanOrEqual(100);
        expect(rec.estimatedImpact.performance).toBeGreaterThanOrEqual(-100);
        expect(rec.estimatedImpact.performance).toBeLessThanOrEqual(100);
      });
    });

    it('should provide meaningful alternatives', () => {
      const recommendations = TechnicalDecisionEngine.generateRecommendations(mockTechnicalData);

      recommendations.forEach(rec => {
        expect(rec.alternatives).toBeInstanceOf(Array);
        expect(rec.alternatives.length).toBeGreaterThan(0);
        rec.alternatives.forEach(alt => {
          expect(typeof alt).toBe('string');
          expect(alt.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
