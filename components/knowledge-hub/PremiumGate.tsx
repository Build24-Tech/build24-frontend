'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserTier } from '@/types/user';
import { Lock, Star, Zap } from 'lucide-react';
import { ReactNode } from 'react';

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showPreview?: boolean;
  previewContent?: ReactNode;
  upgradePrompt?: {
    title?: string;
    description?: string;
    features?: string[];
  };
  className?: string;
}

export function PremiumGate({
  children,
  fallback,
  showPreview = true,
  previewContent,
  upgradePrompt,
  className = ''
}: PremiumGateProps) {
  const { userProfile } = useAuth();

  // Check if user has premium access
  const userTier: UserTier = userProfile?.subscription?.tier || 'free';
  const hasPremiumAccess = userTier === 'premium';

  // If user has premium access, render the content
  if (hasPremiumAccess) {
    return <div className={className}>{children}</div>;
  }

  // If fallback is provided and no preview is requested, show fallback
  if (fallback && !showPreview) {
    return <div className={className}>{fallback}</div>;
  }

  // Default upgrade prompt configuration
  const defaultUpgradePrompt = {
    title: 'Premium Content',
    description: 'Unlock advanced case studies, downloadable resources, and detailed implementation guides.',
    features: [
      'Extended case studies with real-world examples',
      'Downloadable templates and A/B test scripts',
      'Advanced implementation guides',
      'Priority access to new content',
      'Expert insights and best practices'
    ]
  };

  const prompt = { ...defaultUpgradePrompt, ...upgradePrompt };

  return (
    <div className={className}>
      {/* Preview content if provided */}
      {showPreview && previewContent && (
        <div className="relative mb-6">
          <div className="opacity-50 pointer-events-none">
            {previewContent}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}

      {/* Upgrade prompt */}
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <Lock className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {prompt.title}
            <Star className="h-5 w-5 text-yellow-500" />
          </CardTitle>
          <CardDescription className="text-base">
            {prompt.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Premium features list */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              What you'll get:
            </h4>
            <ul className="space-y-2">
              {prompt.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              onClick={() => handleUpgrade('monthly')}
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-yellow-500/20 hover:bg-yellow-500/10"
              onClick={() => handleUpgrade('yearly')}
            >
              <Badge variant="secondary" className="mr-2 bg-green-500/10 text-green-500 border-green-500/20">
                Save 20%
              </Badge>
              Yearly Plan
            </Button>
          </div>

          {/* Additional info */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>

      {/* Fallback content if provided */}
      {fallback && (
        <div className="mt-6 opacity-75">
          {fallback}
        </div>
      )}
    </div>
  );
}

// Helper function to handle upgrade actions
function handleUpgrade(plan: 'monthly' | 'yearly') {
  // This would integrate with your subscription system (Stripe, Gumroad, etc.)
  // For now, we'll redirect to a subscription page or open a modal

  const subscriptionUrl = plan === 'yearly'
    ? '/subscribe?plan=yearly&source=knowledge-hub'
    : '/subscribe?plan=monthly&source=knowledge-hub';

  window.open(subscriptionUrl, '_blank');
}

// Utility function to check if user has premium access
export function useHasPremiumAccess(): boolean {
  const { userProfile } = useAuth();
  return userProfile?.subscription?.tier === 'premium';
}

// Utility function to get user tier
export function useUserTier(): UserTier {
  const { userProfile } = useAuth();
  return userProfile?.subscription?.tier || 'free';
}
