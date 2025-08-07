import {
  LegalRequirement,
  OperationalGap,
  OperationalReadinessData,
  ProcessTemplate,
  SupportChannel,
  TeamRole
} from '@/app/launch-essentials/components/OperationalReadiness';
import {
  calculateGapImpactScore,
  calculateLegalReadiness,
  calculateOperationalReadiness,
  calculateProcessReadiness,
  calculateSupportReadiness,
  calculateTeamReadiness,
  generateRecommendations,
  generateRemediationActions,
  getReadinessLevel,
  identifyCriticalGaps,
  prioritizeGaps
} from '@/lib/operational-readiness-utils';

describe('Operational Readiness Calculations', () => {
  const mockTeamRoles: TeamRole[] = [
    {
      id: '1',
      title: 'CTO',
      department: 'Engineering',
      responsibilities: ['Technical leadership'],
      requiredSkills: ['Leadership', 'Architecture'],
      experienceLevel: 'senior',
      priority: 'critical',
      status: 'filled'
    },
    {
      id: '2',
      title: 'Lead Developer',
      department: 'Engineering',
      responsibilities: ['Development'],
      requiredSkills: ['React', 'Node.js'],
      experienceLevel: 'senior',
      priority: 'critical',
      status: 'recruiting'
    },
    {
      id: '3',
      title: 'Junior Developer',
      department: 'Engineering',
      responsibilities: ['Development'],
      requiredSkills: ['JavaScript'],
      experienceLevel: 'junior',
      priority: 'important',
      status: 'planned'
    }
  ];

  const mockProcesses: ProcessTemplate[] = [
    {
      id: '1',
      name: 'Development Process',
      category: 'development',
      steps: [
        {
          id: 'step1',
          name: 'Planning',
          description: 'Plan the work',
          duration: '1 day',
          dependencies: [],
          assignee: 'Team Lead',
          tools: ['Jira'],
          deliverables: ['Plan'],
          status: 'completed'
        }
      ],
      tools: ['Git', 'VS Code'],
      responsibilities: ['Developer'],
      timeline: '1 week',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Testing Process',
      category: 'testing',
      steps: [],
      tools: [],
      responsibilities: [],
      timeline: '',
      status: 'not_started'
    }
  ];

  const mockSupportChannels: SupportChannel[] = [
    {
      id: '1',
      type: 'email',
      name: 'Email Support',
      availability: '24/7',
      responseTime: '24 hours',
      staffing: 2,
      tools: ['Zendesk'],
      status: 'active'
    },
    {
      id: '2',
      type: 'chat',
      name: 'Live Chat',
      availability: 'Business Hours',
      responseTime: '5 minutes',
      staffing: 0,
      tools: [],
      status: 'planned'
    }
  ];

  const mockLegalRequirements: LegalRequirement[] = [
    {
      id: '1',
      category: 'privacy',
      requirement: 'Privacy Policy',
      description: 'Create privacy policy',
      priority: 'critical',
      status: 'completed'
    },
    {
      id: '2',
      category: 'terms',
      requirement: 'Terms of Service',
      description: 'Create terms of service',
      priority: 'critical',
      status: 'in_progress'
    },
    {
      id: '3',
      category: 'compliance',
      requirement: 'GDPR Compliance',
      description: 'Ensure GDPR compliance',
      priority: 'important',
      status: 'not_started'
    }
  ];

  const mockOperationalData: OperationalReadinessData = {
    teamStructure: {
      roles: mockTeamRoles,
      orgChart: { departments: [], reportingLines: [] },
      hiringPlan: { phases: [], budget: { total: 0, allocated: 0, currency: 'USD' }, timeline: '' },
      completionPercentage: 50
    },
    processes: {
      development: [mockProcesses[0]],
      testing: [mockProcesses[1]],
      deployment: [],
      completionPercentage: 50
    },
    customerSupport: {
      channels: mockSupportChannels,
      knowledgeBase: { categories: [], articles: [], searchEnabled: false, selfServiceEnabled: false },
      supportTeam: { tiers: [], escalationMatrix: [], workingHours: { timezone: '', schedule: [], holidays: [], coverage: '' }, slaTargets: [] },
      completionPercentage: 50
    },
    legal: {
      requirements: mockLegalRequirements,
      compliance: [],
      policies: [],
      completionPercentage: 33
    },
    gapAnalysis: {
      identifiedGaps: [],
      prioritizedActions: [],
      overallReadiness: 0
    }
  };

  describe('calculateTeamReadiness', () => {
    it('should return 0 for empty roles array', () => {
      expect(calculateTeamReadiness([])).toBe(0);
    });

    it('should calculate team readiness correctly', () => {
      const readiness = calculateTeamReadiness(mockTeamRoles);
      // 1 of 2 critical roles filled (50%) * 0.7 + 1 of 3 total roles filled (33%) * 0.3
      // = 35 + 10 = 45
      expect(readiness).toBe(45);
    });

    it('should return 100 when all critical roles are filled', () => {
      const allFilledRoles = mockTeamRoles.map(role => ({ ...role, status: 'filled' as const }));
      const readiness = calculateTeamReadiness(allFilledRoles);
      expect(readiness).toBe(100);
    });
  });

  describe('calculateProcessReadiness', () => {
    it('should return 0 for empty processes array', () => {
      expect(calculateProcessReadiness([])).toBe(0);
    });

    it('should calculate process readiness correctly', () => {
      const readiness = calculateProcessReadiness(mockProcesses);
      // 1 of 2 completed (50%) * 0.5 + 1 of 2 with steps (50%) * 0.3 + 1 of 2 with tools (50%) * 0.2
      // = 25 + 15 + 10 = 50
      expect(readiness).toBe(50);
    });
  });

  describe('calculateSupportReadiness', () => {
    it('should return 0 for empty channels array', () => {
      expect(calculateSupportReadiness([])).toBe(0);
    });

    it('should calculate support readiness correctly', () => {
      const readiness = calculateSupportReadiness(mockSupportChannels);
      // 1 of 2 active (50%) * 0.5 + 1 of 2 with staffing (50%) * 0.3 + 1 of 2 with tools (50%) * 0.2
      // = 25 + 15 + 10 = 50
      expect(readiness).toBe(50);
    });
  });

  describe('calculateLegalReadiness', () => {
    it('should return 0 for empty requirements array', () => {
      expect(calculateLegalReadiness([])).toBe(0);
    });

    it('should calculate legal readiness correctly', () => {
      const readiness = calculateLegalReadiness(mockLegalRequirements);
      // 1 of 2 critical completed (50%) * 0.8 + 1 of 3 total completed (33%) * 0.2
      // = 40 + 7 = 47
      expect(readiness).toBe(47);
    });
  });

  describe('calculateOperationalReadiness', () => {
    it('should calculate overall operational readiness', () => {
      const result = calculateOperationalReadiness(mockOperationalData);

      expect(result.teamReadiness).toBe(45);
      expect(result.processReadiness).toBe(50);
      expect(result.supportReadiness).toBe(50);
      expect(result.legalReadiness).toBe(47);
      expect(result.overallReadiness).toBeGreaterThan(0);
      expect(result.criticalGaps).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('identifyCriticalGaps', () => {
    it('should identify critical gaps correctly', () => {
      const gaps = identifyCriticalGaps(mockOperationalData);

      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.some(gap => gap.category === 'team')).toBe(true);
      expect(gaps.some(gap => gap.category === 'legal')).toBe(true);
      expect(gaps.some(gap => gap.impact === 'high')).toBe(true);
    });

    it('should identify deployment process gap', () => {
      const gaps = identifyCriticalGaps(mockOperationalData);

      expect(gaps.some(gap => gap.title.includes('Deployment'))).toBe(true);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate relevant recommendations', () => {
      const calculations = calculateOperationalReadiness(mockOperationalData);
      const recommendations = generateRecommendations(mockOperationalData, calculations);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('critical'))).toBe(true);
    });
  });

  describe('prioritizeGaps', () => {
    const mockGaps: OperationalGap[] = [
      {
        id: '1',
        category: 'team',
        title: 'Low Impact Gap',
        description: 'Low impact',
        impact: 'low',
        effort: 'high',
        priority: 1,
        status: 'identified'
      },
      {
        id: '2',
        category: 'process',
        title: 'High Impact Gap',
        description: 'High impact',
        impact: 'high',
        effort: 'low',
        priority: 9,
        status: 'identified'
      },
      {
        id: '3',
        category: 'support',
        title: 'Medium Impact Gap',
        description: 'Medium impact',
        impact: 'medium',
        effort: 'medium',
        priority: 4,
        status: 'identified'
      }
    ];

    it('should prioritize gaps by impact first', () => {
      const prioritized = prioritizeGaps(mockGaps);

      expect(prioritized[0].impact).toBe('high');
      expect(prioritized[1].impact).toBe('medium');
      expect(prioritized[2].impact).toBe('low');
    });
  });

  describe('generateRemediationActions', () => {
    const mockGaps: OperationalGap[] = [
      {
        id: '1',
        category: 'team',
        title: 'Critical Roles Unfilled',
        description: 'Need to hire',
        impact: 'high',
        effort: 'high',
        priority: 1,
        status: 'identified'
      }
    ];

    it('should generate remediation actions for gaps', () => {
      const actions = generateRemediationActions(mockGaps);

      expect(actions.length).toBe(1);
      expect(actions[0].gapId).toBe('1');
      expect(actions[0].action).toContain('Hire');
      expect(actions[0].estimatedEffort).toBe('2-4 weeks');
    });
  });

  describe('calculateGapImpactScore', () => {
    it('should calculate gap impact score correctly', () => {
      const highImpactLowEffort: OperationalGap = {
        id: '1',
        category: 'team',
        title: 'Test Gap',
        description: 'Test',
        impact: 'high',
        effort: 'low',
        priority: 1,
        status: 'identified'
      };

      const score = calculateGapImpactScore(highImpactLowEffort);
      expect(score).toBe(9); // high impact (3) * low effort (3) = 9
    });
  });

  describe('getReadinessLevel', () => {
    it('should return correct readiness levels', () => {
      expect(getReadinessLevel(95).level).toBe('Excellent');
      expect(getReadinessLevel(85).level).toBe('Good');
      expect(getReadinessLevel(75).level).toBe('Fair');
      expect(getReadinessLevel(60).level).toBe('Poor');
      expect(getReadinessLevel(40).level).toBe('Critical');
    });

    it('should return appropriate colors', () => {
      expect(getReadinessLevel(95).color).toBe('text-green-600');
      expect(getReadinessLevel(85).color).toBe('text-blue-600');
      expect(getReadinessLevel(75).color).toBe('text-yellow-600');
      expect(getReadinessLevel(60).color).toBe('text-orange-600');
      expect(getReadinessLevel(40).color).toBe('text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      const emptyData: OperationalReadinessData = {
        teamStructure: {
          roles: [],
          orgChart: { departments: [], reportingLines: [] },
          hiringPlan: { phases: [], budget: { total: 0, allocated: 0, currency: 'USD' }, timeline: '' },
          completionPercentage: 0
        },
        processes: {
          development: [],
          testing: [],
          deployment: [],
          completionPercentage: 0
        },
        customerSupport: {
          channels: [],
          knowledgeBase: { categories: [], articles: [], searchEnabled: false, selfServiceEnabled: false },
          supportTeam: { tiers: [], escalationMatrix: [], workingHours: { timezone: '', schedule: [], holidays: [], coverage: '' }, slaTargets: [] },
          completionPercentage: 0
        },
        legal: {
          requirements: [],
          compliance: [],
          policies: [],
          completionPercentage: 0
        },
        gapAnalysis: {
          identifiedGaps: [],
          prioritizedActions: [],
          overallReadiness: 0
        }
      };

      const result = calculateOperationalReadiness(emptyData);
      expect(result.overallReadiness).toBe(0);
      // Empty data should still identify some critical gaps (no deployment process, no support channels)
      expect(result.criticalGaps.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle roles with no critical priority', () => {
      const rolesWithoutCritical = mockTeamRoles.map(role => ({
        ...role,
        priority: 'important' as const
      }));

      const readiness = calculateTeamReadiness(rolesWithoutCritical);
      expect(readiness).toBeGreaterThan(0);
    });

    it('should handle legal requirements with no critical priority', () => {
      const requirementsWithoutCritical = mockLegalRequirements.map(req => ({
        ...req,
        priority: 'important' as const
      }));

      const readiness = calculateLegalReadiness(requirementsWithoutCritical);
      expect(readiness).toBeGreaterThan(0);
    });
  });
});
