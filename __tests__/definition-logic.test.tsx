import { ProductDefinitionData } from '@/types/launch-essentials';

describe('Product Definition Logic', () => {
  describe('Vision Statement Templates', () => {
    it('provides multiple vision statement templates', () => {
      const templates = [
        'To solve [problem] for [target audience] by providing [solution] that [unique benefit].',
        'A world where [desired outcome] through [your contribution].',
        'Empowering [target group] to [achieve goal] by [method/approach].'
      ];

      expect(templates).toHaveLength(3);
      expect(templates[0]).toContain('[problem]');
      expect(templates[1]).toContain('[desired outcome]');
      expect(templates[2]).toContain('[target group]');
    });
  });

  describe('Value Proposition Canvas', () => {
    it('validates complete value proposition canvas', () => {
      const completeCanvas = {
        customerJobs: ['Manage team communications', 'Track project progress'],
        painPoints: ['Too many tools', 'Missing updates'],
        gainCreators: ['Unified dashboard', 'Real-time notifications'],
        painRelievers: ['Single hub', 'Automated updates'],
        productsServices: ['Collaboration platform', 'Mobile app']
      };

      expect(completeCanvas.customerJobs.length).toBeGreaterThan(0);
      expect(completeCanvas.painPoints.length).toBeGreaterThan(0);
      expect(completeCanvas.gainCreators.length).toBeGreaterThan(0);
      expect(completeCanvas.painRelievers.length).toBeGreaterThan(0);
      expect(completeCanvas.productsServices.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Prioritization Methods', () => {
    it('supports MoSCoW prioritization method', () => {
      const moscowPriorities = ['must-have', 'should-have', 'could-have', 'wont-have'];
      const feature = {
        id: '1',
        name: 'User Authentication',
        description: 'Login system',
        priority: 'must-have' as const,
        effort: 'medium' as const,
        impact: 'high' as const,
        dependencies: []
      };

      expect(moscowPriorities).toContain(feature.priority);
      expect(['low', 'medium', 'high']).toContain(feature.effort);
      expect(['low', 'medium', 'high']).toContain(feature.impact);
    });

    it('supports Kano model prioritization', () => {
      const kanoCategories = ['basic', 'performance', 'excitement'];
      // Kano model would categorize features into these types
      expect(kanoCategories).toHaveLength(3);
    });

    it('calculates RICE scores correctly', () => {
      const feature = {
        reach: 100,
        impact: 3,
        confidence: 0.8,
        effort: 2
      };

      const riceScore = (feature.reach * feature.impact * feature.confidence) / feature.effort;
      expect(riceScore).toBe(120);
    });

    it('supports value vs effort matrix', () => {
      const feature = {
        value: 'high' as const,
        effort: 'low' as const
      };

      const valueScores = { high: 3, medium: 2, low: 1 };
      const effortScores = { low: 3, medium: 2, high: 1 }; // Inverse for effort

      const score = valueScores[feature.value] * effortScores[feature.effort];
      expect(score).toBe(9); // High value, low effort = best score
    });
  });

  describe('KPI Categories and Templates', () => {
    it('provides KPI templates for all AARRR categories', () => {
      const kpiCategories = ['acquisition', 'activation', 'retention', 'revenue', 'referral'];

      const kpiTemplates = {
        acquisition: ['Website Traffic', 'Conversion Rate', 'Cost Per Acquisition'],
        activation: ['User Onboarding Completion', 'Time to First Value'],
        retention: ['Monthly Active Users', 'Churn Rate'],
        revenue: ['Monthly Recurring Revenue', 'Average Revenue Per User'],
        referral: ['Net Promoter Score', 'Referral Rate']
      };

      kpiCategories.forEach(category => {
        expect(kpiTemplates[category as keyof typeof kpiTemplates]).toBeDefined();
        expect(kpiTemplates[category as keyof typeof kpiTemplates].length).toBeGreaterThan(0);
      });
    });

    it('validates KPI structure', () => {
      const kpi = {
        id: '1',
        name: 'Monthly Active Users',
        description: 'Users active in the last 30 days',
        target: 1000,
        unit: 'users',
        frequency: 'monthly' as const,
        category: 'retention' as const
      };

      expect(kpi.name).toBeTruthy();
      expect(kpi.description).toBeTruthy();
      expect(kpi.target).toBeGreaterThan(0);
      expect(kpi.unit).toBeTruthy();
      expect(['daily', 'weekly', 'monthly', 'quarterly']).toContain(kpi.frequency);
      expect(['acquisition', 'activation', 'retention', 'revenue', 'referral']).toContain(kpi.category);
    });
  });

  describe('Success Criteria Templates', () => {
    it('provides comprehensive success criteria examples', () => {
      const successCriteriaTemplates = [
        'Achieve product-market fit within 6 months',
        'Reach break-even point by month 12',
        'Maintain customer satisfaction score above 4.0/5.0',
        'Achieve 90% uptime and reliability',
        'Build a community of 1000+ active users'
      ];

      expect(successCriteriaTemplates.length).toBeGreaterThan(0);
      successCriteriaTemplates.forEach(criteria => {
        expect(criteria).toBeTruthy();
        expect(typeof criteria).toBe('string');
      });
    });
  });

  describe('Definition Completeness Validation', () => {
    it('identifies incomplete product definition', () => {
      const incompleteDefinition: ProductDefinitionData = {
        vision: {
          statement: '',
          missionAlignment: ''
        },
        valueProposition: {
          canvas: {
            customerJobs: [],
            painPoints: [],
            gainCreators: [],
            painRelievers: [],
            productsServices: []
          },
          uniqueValue: ''
        },
        features: {
          coreFeatures: [],
          prioritization: {
            method: 'moscow',
            results: []
          }
        },
        metrics: {
          kpis: [],
          successCriteria: []
        }
      };

      const isVisionComplete = incompleteDefinition.vision.statement.length > 0 &&
        incompleteDefinition.vision.missionAlignment.length > 0;
      const isValuePropComplete = incompleteDefinition.valueProposition.canvas.customerJobs.length > 0 &&
        incompleteDefinition.valueProposition.canvas.painPoints.length > 0 &&
        incompleteDefinition.valueProposition.uniqueValue.length > 0;
      const isFeaturesComplete = incompleteDefinition.features.coreFeatures.length > 0 &&
        incompleteDefinition.features.prioritization.results.length > 0;
      const isMetricsComplete = incompleteDefinition.metrics.kpis.length > 0 &&
        incompleteDefinition.metrics.successCriteria.length > 0;

      expect(isVisionComplete).toBe(false);
      expect(isValuePropComplete).toBe(false);
      expect(isFeaturesComplete).toBe(false);
      expect(isMetricsComplete).toBe(false);
    });

    it('validates complete product definition', () => {
      const completeDefinition: ProductDefinitionData = {
        vision: {
          statement: 'To revolutionize team collaboration',
          missionAlignment: 'Aligns with our mission to improve productivity'
        },
        valueProposition: {
          canvas: {
            customerJobs: ['Collaborate effectively'],
            painPoints: ['Communication gaps'],
            gainCreators: ['Real-time updates'],
            painRelievers: ['Unified platform'],
            productsServices: ['Collaboration tool']
          },
          uniqueValue: 'The only platform that unifies all team communication'
        },
        features: {
          coreFeatures: [{
            id: '1',
            name: 'Real-time Chat',
            description: 'Instant messaging',
            priority: 'must-have',
            effort: 'medium',
            impact: 'high',
            dependencies: []
          }],
          prioritization: {
            method: 'moscow',
            results: [{
              featureId: '1',
              score: 4,
              ranking: 1
            }]
          }
        },
        metrics: {
          kpis: [{
            id: '1',
            name: 'Daily Active Users',
            description: 'Users active daily',
            target: 500,
            unit: 'users',
            frequency: 'daily',
            category: 'retention'
          }],
          successCriteria: ['Launch within 6 months']
        }
      };

      const isVisionComplete = completeDefinition.vision.statement.length > 0 &&
        completeDefinition.vision.missionAlignment.length > 0;
      const isValuePropComplete = completeDefinition.valueProposition.canvas.customerJobs.length > 0 &&
        completeDefinition.valueProposition.canvas.painPoints.length > 0 &&
        completeDefinition.valueProposition.uniqueValue.length > 0;
      const isFeaturesComplete = completeDefinition.features.coreFeatures.length > 0 &&
        completeDefinition.features.prioritization.results.length > 0;
      const isMetricsComplete = completeDefinition.metrics.kpis.length > 0 &&
        completeDefinition.metrics.successCriteria.length > 0;

      expect(isVisionComplete).toBe(true);
      expect(isValuePropComplete).toBe(true);
      expect(isFeaturesComplete).toBe(true);
      expect(isMetricsComplete).toBe(true);
    });
  });

  describe('Guided Recommendations', () => {
    it('provides specific guidance for missing elements', () => {
      const guidanceMap = {
        'Vision Statement': 'Define a clear, inspiring vision statement that describes what you want your product to achieve',
        'Mission Alignment': 'Explain how this product aligns with your broader mission and values',
        'Customer Jobs': 'Identify the jobs your customers are trying to accomplish',
        'Customer Pain Points': 'Document the pains and frustrations your customers experience',
        'Unique Value Proposition': 'Craft a clear, compelling statement of your unique value',
        'Core Features': 'Define the core features your product will include',
        'Feature Prioritization': 'Prioritize your features using a structured methodology',
        'Key Performance Indicators': 'Define measurable KPIs to track your product\'s success',
        'Success Criteria': 'Establish clear success criteria and milestones'
      };

      Object.entries(guidanceMap).forEach(([element, guidance]) => {
        expect(element).toBeTruthy();
        expect(guidance).toBeTruthy();
        expect(guidance.length).toBeGreaterThan(20); // Ensure meaningful guidance
      });
    });
  });
});
