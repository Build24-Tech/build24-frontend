/**
 * Setup script to initialize Launch Essentials data in Firestore
 * Run this script to populate frameworks and templates collections
 * 
 * Usage: yarn ts-node scripts/setup-launch-essentials-data.ts
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { Framework, Template } from '../types/launch-essentials';

// Initialize Firebase (use your config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample Frameworks Data
const sampleFrameworks: Omit<Framework, 'id'>[] = [
  {
    name: 'Product Validation Framework',
    description: 'Comprehensive framework for validating product ideas before development',
    phase: 'validation',
    steps: [
      {
        id: 'market-research',
        title: 'Market Research',
        description: 'Conduct thorough market research to understand market size, trends, and opportunities',
        type: 'analysis',
        required: true,
        helpText: 'Use both primary and secondary research methods to gather market data',
        examples: ['Industry reports', 'Market surveys', 'Competitor analysis']
      },
      {
        id: 'competitor-analysis',
        title: 'Competitor Analysis',
        description: 'Analyze direct and indirect competitors to identify market gaps',
        type: 'analysis',
        required: true,
        helpText: 'Focus on competitors\' strengths, weaknesses, and market positioning',
        examples: ['SWOT analysis', 'Feature comparison', 'Pricing analysis']
      },
      {
        id: 'target-audience',
        title: 'Target Audience Definition',
        description: 'Define and validate your target audience through personas and interviews',
        type: 'template',
        required: true,
        helpText: 'Create detailed user personas based on research and validation',
        examples: ['User personas', 'Customer interviews', 'Survey responses']
      },
      {
        id: 'validation-report',
        title: 'Validation Report',
        description: 'Compile findings into a comprehensive validation report with recommendations',
        type: 'template',
        required: true,
        helpText: 'Provide clear go/no-go recommendation based on validation results',
        examples: ['Executive summary', 'Risk assessment', 'Next steps']
      }
    ],
    templates: [],
    resources: [
      {
        id: 'lean-canvas',
        title: 'Lean Canvas Template',
        description: 'One-page business model canvas for rapid validation',
        type: 'template',
        url: 'https://leanstack.com/lean-canvas',
        tags: ['validation', 'business-model', 'canvas']
      },
      {
        id: 'customer-interview-guide',
        title: 'Customer Interview Guide',
        description: 'Structured guide for conducting effective customer interviews',
        type: 'article',
        url: 'https://www.ycombinator.com/library/6g-how-to-talk-to-users',
        tags: ['interviews', 'validation', 'customers']
      }
    ]
  },
  {
    name: 'Product Definition Framework',
    description: 'Framework for clearly defining your product vision, features, and success metrics',
    phase: 'definition',
    steps: [
      {
        id: 'vision-statement',
        title: 'Vision & Mission',
        description: 'Define clear product vision and mission statements',
        type: 'template',
        required: true,
        helpText: 'Create inspiring yet achievable vision that guides product decisions',
        examples: ['Vision statement', 'Mission statement', 'Core values']
      },
      {
        id: 'value-proposition',
        title: 'Value Proposition',
        description: 'Articulate your unique value proposition using proven frameworks',
        type: 'template',
        required: true,
        helpText: 'Use Value Proposition Canvas to map customer needs to product benefits',
        examples: ['Value proposition canvas', 'Unique selling points', 'Benefit statements']
      },
      {
        id: 'feature-prioritization',
        title: 'Feature Prioritization',
        description: 'Prioritize core features using structured methodologies',
        type: 'selection',
        required: true,
        helpText: 'Use MoSCoW, Kano model, or RICE framework for prioritization',
        examples: ['MoSCoW analysis', 'Kano model', 'RICE scoring']
      },
      {
        id: 'success-metrics',
        title: 'Success Metrics',
        description: 'Define key performance indicators and success criteria',
        type: 'selection',
        required: true,
        helpText: 'Choose measurable KPIs that align with business objectives',
        examples: ['KPI dashboard', 'Success criteria', 'Measurement plan']
      }
    ],
    templates: [],
    resources: [
      {
        id: 'value-prop-canvas',
        title: 'Value Proposition Canvas',
        description: 'Tool for designing compelling value propositions',
        type: 'tool',
        url: 'https://www.strategyzer.com/canvas/value-proposition-canvas',
        tags: ['value-proposition', 'canvas', 'design']
      }
    ]
  },
  {
    name: 'Technical Architecture Framework',
    description: 'Framework for making informed technical decisions and architecture planning',
    phase: 'technical',
    steps: [
      {
        id: 'tech-stack-selection',
        title: 'Technology Stack Selection',
        description: 'Choose appropriate technologies based on project requirements',
        type: 'selection',
        required: true,
        helpText: 'Consider scalability, team expertise, and long-term maintenance',
        examples: ['Frontend frameworks', 'Backend technologies', 'Database choices']
      },
      {
        id: 'architecture-design',
        title: 'System Architecture',
        description: 'Design scalable system architecture and infrastructure',
        type: 'template',
        required: true,
        helpText: 'Plan for current needs while considering future growth',
        examples: ['System diagrams', 'Infrastructure plan', 'Scalability strategy']
      },
      {
        id: 'integrations-planning',
        title: 'Third-party Integrations',
        description: 'Plan and evaluate necessary third-party services and APIs',
        type: 'analysis',
        required: false,
        helpText: 'Assess integration complexity, costs, and alternatives',
        examples: ['API documentation', 'Service comparison', 'Integration timeline']
      },
      {
        id: 'security-requirements',
        title: 'Security & Compliance',
        description: 'Define security requirements and compliance considerations',
        type: 'template',
        required: true,
        helpText: 'Address data protection, authentication, and regulatory requirements',
        examples: ['Security checklist', 'Compliance requirements', 'Data protection plan']
      }
    ],
    templates: [],
    resources: [
      {
        id: 'aws-architecture',
        title: 'AWS Architecture Center',
        description: 'Reference architectures and best practices for AWS',
        type: 'article',
        url: 'https://aws.amazon.com/architecture/',
        tags: ['architecture', 'aws', 'cloud']
      }
    ]
  }
];

// Sample Templates Data
const sampleTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'User Persona Template',
    description: 'Comprehensive template for creating detailed user personas',
    category: 'validation',
    content: `# User Persona: {{personaName}}

## Demographics
- **Age:** {{age}}
- **Location:** {{location}}
- **Occupation:** {{occupation}}
- **Income:** {{income}}

## Goals & Motivations
{{#each goals}}
- {{this}}
{{/each}}

## Pain Points & Challenges
{{#each painPoints}}
- {{this}}
{{/each}}

## Behaviors & Preferences
{{#each behaviors}}
- {{this}}
{{/each}}

## Technology Usage
- **Primary Devices:** {{devices}}
- **Preferred Platforms:** {{platforms}}
- **Tech Savviness:** {{techLevel}}

## How Our Product Helps
{{productValue}}`,
    variables: [
      { name: 'personaName', type: 'text', required: true },
      { name: 'age', type: 'text', required: true },
      { name: 'location', type: 'text', required: true },
      { name: 'occupation', type: 'text', required: true },
      { name: 'income', type: 'text', required: false },
      { name: 'goals', type: 'text', required: true },
      { name: 'painPoints', type: 'text', required: true },
      { name: 'behaviors', type: 'text', required: true },
      { name: 'devices', type: 'text', required: true },
      { name: 'platforms', type: 'text', required: true },
      { name: 'techLevel', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { name: 'productValue', type: 'text', required: true }
    ]
  },
  {
    name: 'Competitor Analysis Template',
    description: 'Structured template for analyzing competitors',
    category: 'validation',
    content: `# Competitor Analysis: {{competitorName}}

## Company Overview
- **Company:** {{competitorName}}
- **Website:** {{website}}
- **Founded:** {{founded}}
- **Size:** {{companySize}}

## Product/Service Analysis
- **Main Offering:** {{mainOffering}}
- **Target Market:** {{targetMarket}}
- **Pricing Model:** {{pricingModel}}
- **Key Features:** {{keyFeatures}}

## Strengths
{{#each strengths}}
- {{this}}
{{/each}}

## Weaknesses
{{#each weaknesses}}
- {{this}}
{{/each}}

## Market Position
- **Market Share:** {{marketShare}}%
- **Brand Recognition:** {{brandRecognition}}
- **Customer Satisfaction:** {{customerSatisfaction}}

## Opportunities for Differentiation
{{differentiation}}

## Threat Level
**Overall Threat:** {{threatLevel}}
**Reasoning:** {{threatReasoning}}`,
    variables: [
      { name: 'competitorName', type: 'text', required: true },
      { name: 'website', type: 'text', required: false },
      { name: 'founded', type: 'text', required: false },
      { name: 'companySize', type: 'text', required: false },
      { name: 'mainOffering', type: 'text', required: true },
      { name: 'targetMarket', type: 'text', required: true },
      { name: 'pricingModel', type: 'text', required: true },
      { name: 'keyFeatures', type: 'text', required: true },
      { name: 'strengths', type: 'text', required: true },
      { name: 'weaknesses', type: 'text', required: true },
      { name: 'marketShare', type: 'number', required: false },
      { name: 'brandRecognition', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { name: 'customerSatisfaction', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { name: 'differentiation', type: 'text', required: true },
      { name: 'threatLevel', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { name: 'threatReasoning', type: 'text', required: true }
    ]
  },
  {
    name: 'Product Vision Statement Template',
    description: 'Template for crafting compelling product vision statements',
    category: 'definition',
    content: `# Product Vision Statement

## Vision Statement
**For** {{targetCustomer}}
**Who** {{customerNeed}}
**The** {{productName}}
**Is a** {{productCategory}}
**That** {{keyBenefit}}
**Unlike** {{primaryCompetitor}}
**Our product** {{primaryDifferentiator}}

## Mission Statement
{{missionStatement}}

## Core Values
{{#each coreValues}}
- **{{name}}:** {{description}}
{{/each}}

## Success Vision (3-5 years)
{{longTermVision}}

## Key Principles
{{#each principles}}
- {{this}}
{{/each}}`,
    variables: [
      { name: 'targetCustomer', type: 'text', required: true },
      { name: 'customerNeed', type: 'text', required: true },
      { name: 'productName', type: 'text', required: true },
      { name: 'productCategory', type: 'text', required: true },
      { name: 'keyBenefit', type: 'text', required: true },
      { name: 'primaryCompetitor', type: 'text', required: true },
      { name: 'primaryDifferentiator', type: 'text', required: true },
      { name: 'missionStatement', type: 'text', required: true },
      { name: 'coreValues', type: 'text', required: true },
      { name: 'longTermVision', type: 'text', required: true },
      { name: 'principles', type: 'text', required: true }
    ]
  }
];

async function setupFrameworks() {
  console.log('Setting up frameworks...');

  for (const framework of sampleFrameworks) {
    const frameworkId = framework.name.toLowerCase().replace(/\s+/g, '-');
    const frameworkRef = doc(db, 'launch_essentials_frameworks', frameworkId);

    try {
      await setDoc(frameworkRef, framework);
      console.log(`✅ Created framework: ${framework.name}`);
    } catch (error) {
      console.error(`❌ Error creating framework ${framework.name}:`, error);
    }
  }
}

async function setupTemplates() {
  console.log('Setting up templates...');

  for (const template of sampleTemplates) {
    const templateId = template.name.toLowerCase().replace(/\s+/g, '-');
    const templateRef = doc(db, 'launch_essentials_templates', templateId);

    const templateWithTimestamps = {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(templateRef, templateWithTimestamps);
      console.log(`✅ Created template: ${template.name}`);
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting Launch Essentials data setup...');

  try {
    await setupFrameworks();
    await setupTemplates();

    console.log('✅ Launch Essentials data setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your Firestore security rules with the provided rules');
    console.log('2. Test the Firebase operations with your application');
    console.log('3. Add more frameworks and templates as needed');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the setup
if (require.main === module) {
  main();
}

export { setupFrameworks, setupTemplates };
