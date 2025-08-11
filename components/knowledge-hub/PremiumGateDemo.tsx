'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumContent } from '@/types/knowledge-hub';
import { useState } from 'react';
import { PremiumContentPreview } from './PremiumContentPreview';
import { PremiumGate } from './PremiumGate';

export function PremiumGateDemo() {
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');

  // Mock premium content for demo
  const mockPremiumContent: PremiumContent = {
    extendedCaseStudies: 'This is an extended case study that demonstrates how the anchoring bias can be effectively implemented in product pricing strategies. The study includes detailed analysis of A/B tests conducted across multiple industries, showing conversion rate improvements of up to 23% when anchoring techniques are properly applied. We examine real-world examples from SaaS companies, e-commerce platforms, and subscription services.',
    downloadableResources: [
      {
        id: 'pricing-template',
        title: 'Pricing Strategy Template',
        description: 'A comprehensive template for implementing anchoring in your pricing',
        fileUrl: '/downloads/pricing-template.pdf',
        fileType: 'template',
        fileSize: 1024000
      },
      {
        id: 'ab-test-script',
        title: 'A/B Test Implementation Script',
        description: 'Ready-to-use JavaScript for testing anchoring effects',
        fileUrl: '/downloads/ab-test-script.js',
        fileType: 'script',
        fileSize: 512000
      },
      {
        id: 'conversion-checklist',
        title: 'Conversion Optimization Checklist',
        description: 'Step-by-step guide for maximizing anchoring effectiveness',
        fileUrl: '/downloads/conversion-checklist.pdf',
        fileType: 'checklist',
        fileSize: 256000
      }
    ],
    advancedApplications: 'Advanced anchoring techniques go beyond simple price positioning. This section covers sophisticated psychological triggers including decoy effects, bundling strategies, and temporal anchoring. Learn how to implement multi-layered anchoring systems that work across different customer segments and purchase contexts.'
  };

  // Mock auth context for demo
  const mockUserProfile = {
    uid: 'demo-user',
    email: 'demo@example.com',
    displayName: 'Demo User',
    status: 'active' as const,
    emailUpdates: false,
    language: 'en' as const,
    theme: 'dark' as const,
    subscription: {
      tier: userTier,
      subscriptionStatus: 'active' as const
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Premium Gate Demo</h1>
        <p className="text-muted-foreground">
          This demo shows how premium content access control works for different user tiers.
        </p>

        {/* User tier toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm font-medium">Current User Tier:</span>
          <Badge variant={userTier === 'premium' ? 'default' : 'secondary'}>
            {userTier === 'premium' ? 'Premium' : 'Free'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUserTier(userTier === 'free' ? 'premium' : 'free')}
          >
            Switch to {userTier === 'free' ? 'Premium' : 'Free'}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 max-w-4xl mx-auto">
        {/* Basic Premium Gate */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Premium Gate</CardTitle>
            <CardDescription>
              Simple premium content protection with upgrade prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumGate>
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  🎉 Premium Content Unlocked!
                </h3>
                <p className="text-sm text-muted-foreground">
                  This content is only visible to premium users. It contains advanced strategies,
                  detailed case studies, and exclusive resources.
                </p>
              </div>
            </PremiumGate>
          </CardContent>
        </Card>

        {/* Premium Gate with Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Gate with Content Preview</CardTitle>
            <CardDescription>
              Shows a preview of premium content to encourage upgrades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumGate
              showPreview={true}
              previewContent={<PremiumContentPreview premiumContent={mockPremiumContent} />}
              upgradePrompt={{
                title: 'Unlock Anchoring Bias Premium Content',
                description: 'Get access to advanced case studies, implementation templates, and expert insights.',
                features: [
                  'Extended case studies with real conversion data',
                  'Ready-to-use pricing templates and scripts',
                  'Advanced psychological trigger techniques',
                  'Industry-specific implementation guides',
                  'A/B testing frameworks and tools'
                ]
              }}
            >
              <div className="space-y-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">
                    Extended Case Studies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockPremiumContent.extendedCaseStudies}
                  </p>
                </div>

                <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Advanced Applications
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockPremiumContent.advancedApplications}
                  </p>
                </div>

                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">
                    Downloadable Resources
                  </h3>
                  <div className="grid gap-3">
                    {mockPremiumContent.downloadableResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                        <Button size="sm" disabled={userTier === 'free'}>
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumGate>
          </CardContent>
        </Card>

        {/* Premium Gate with Fallback */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Gate with Fallback Content</CardTitle>
            <CardDescription>
              Shows alternative content for free users instead of premium content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumGate
              showPreview={false}
              fallback={
                <div className="p-6 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Basic Implementation Guide
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Here's a basic overview of how to implement anchoring bias in your pricing.
                    For more detailed strategies and advanced techniques, consider upgrading to premium.
                  </p>
                  <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                    <li>• Set a high anchor price first</li>
                    <li>• Present your target price as a discount</li>
                    <li>• Use visual cues to emphasize value</li>
                  </ul>
                </div>
              }
            >
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Advanced Implementation Strategies
                </h3>
                <p className="text-sm text-muted-foreground">
                  Premium users get access to sophisticated anchoring techniques including
                  multi-tier pricing psychology, temporal anchoring effects, and industry-specific
                  optimization strategies with real conversion data.
                </p>
              </div>
            </PremiumGate>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
