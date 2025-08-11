'use client';

import { ExampleType, InteractiveExample as InteractiveExampleType } from '@/types/knowledge-hub';
import InteractiveExample from './InteractiveExample';

// Sample interactive examples for demonstration
const sampleExamples: InteractiveExampleType[] = [
  {
    id: 'anchoring-bias-example',
    type: ExampleType.BEFORE_AFTER,
    title: 'Anchoring Bias in Pricing',
    description: 'See how initial price anchors influence user perception and decision-making',
    beforeImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&brightness=1.2'
  },
  {
    id: 'anchoring-bias-demo',
    type: ExampleType.INTERACTIVE_DEMO,
    title: 'Interactive Anchoring Demo',
    description: 'Experience how anchoring bias affects your own decision-making process',
    interactiveComponent: 'anchoring-bias-demo'
  },
  {
    id: 'anchoring-case-study',
    type: ExampleType.CASE_STUDY,
    title: 'Real-World Implementation',
    description: 'Learn how a SaaS company increased conversions by 23% using anchoring bias',
    caseStudyContent: `# Anchoring Bias Case Study: SaaS Pricing Success

## Background

A B2B SaaS company was struggling with low conversion rates on their pricing page. Users were consistently choosing the lowest-priced plan, resulting in lower average revenue per user (ARPU).

## The Problem

- 78% of users selected the basic $29/month plan
- Only 15% chose the professional $79/month plan  
- Premium $149/month plan had less than 7% adoption

## The Solution

The team implemented anchoring bias by introducing a "decoy" plan:

### Before
- **Basic**: $29/month
- **Professional**: $79/month  
- **Premium**: $149/month

### After
- **Basic**: $29/month
- **Professional**: $79/month
- **Business**: $129/month *(decoy plan)*
- **Enterprise**: $199/month

## Results

After implementing the anchoring strategy:

- Basic plan selection dropped to 45% (-33%)
- Professional plan increased to 38% (+23%)
- Business plan captured 12% of users
- Enterprise plan achieved 5% adoption

## Key Insights

1. **Anchoring Effect**: The higher-priced Enterprise plan made the Professional plan seem more reasonable
2. **Decoy Positioning**: The Business plan was intentionally less attractive than Professional
3. **Revenue Impact**: Average revenue per user increased by 23%

## Implementation Tips

- Position your target plan as the "middle" option
- Make the decoy plan slightly less attractive than your target
- Use visual cues to highlight the recommended plan
- Test different anchor points to find optimal positioning

This case study demonstrates how psychological principles can significantly impact business metrics when applied thoughtfully.`
  }
];

export default function InteractiveExampleDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-yellow-400">Interactive Examples Demo</h1>
        <p className="text-gray-400 text-lg">
          Explore different types of interactive examples that help users understand psychological theories
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Anchoring Bias Examples</h2>
          <InteractiveExample
            examples={sampleExamples}
            showNavigation={true}
            onExampleChange={(exampleId) => {
              console.log('Example changed to:', exampleId);
            }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Before/After View</h3>
            <InteractiveExample
              examples={[sampleExamples[0]]}
              showNavigation={false}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Interactive Demo</h3>
            <InteractiveExample
              examples={[sampleExamples[1]]}
              showNavigation={false}
              autoPlay={false}
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Case Study</h3>
          <InteractiveExample
            examples={[sampleExamples[2]]}
            showNavigation={false}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Features Demonstrated</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
            Before/After image comparisons with overlay toggle
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
            Interactive demonstrations with play/pause controls
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
            Rich case study content with markdown rendering
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
            Navigation controls for multiple examples
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            Fullscreen mode for detailed viewing
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
            Dynamic component loading for interactive demos
          </li>
        </ul>
      </div>
    </div>
  );
}
