'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Monitor } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface DynamicComponentLoaderProps {
  componentName: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  props?: Record<string, any>;
}

interface InteractiveComponentProps {
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  [key: string]: any;
}

// Registry of available interactive components
const COMPONENT_REGISTRY: Record<string, React.ComponentType<InteractiveComponentProps>> = {
  'anchoring-bias-demo': AnchoringBiasDemo,
  'scarcity-principle-demo': ScarcityPrincipleDemo,
  'social-proof-demo': SocialProofDemo,
  'color-psychology-demo': ColorPsychologyDemo,
  'pricing-strategy-demo': PricingStrategyDemo,
};

// Example Interactive Components

// Anchoring Bias Demo Component
function AnchoringBiasDemo({ isPlaying, onTogglePlay }: InteractiveComponentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userChoice, setUserChoice] = useState<number | null>(null);

  const steps = [
    {
      title: "Initial Anchor",
      content: "A product is initially priced at $199",
      price: 199,
      action: "Set Anchor"
    },
    {
      title: "Price Adjustment",
      content: "The price is then reduced to $149",
      price: 149,
      action: "Show Discount"
    },
    {
      title: "User Perception",
      content: "Users perceive this as a great deal due to anchoring",
      price: 149,
      action: "Demonstrate Effect"
    }
  ];

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      onTogglePlay?.();
    }
  }, [isPlaying, currentStep, onTogglePlay]);

  const handleReset = () => {
    setCurrentStep(0);
    setUserChoice(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Anchoring Bias Demo</h3>
        <p className="text-sm text-gray-400">See how initial prices influence perception</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-white">
            ${steps[currentStep].price}
            {currentStep > 0 && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${steps[0].price}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-300">{steps[currentStep].title}</h4>
            <p className="text-sm text-gray-400">{steps[currentStep].content}</p>
          </div>

          {currentStep === steps.length - 1 && (
            <div className="space-y-3">
              <p className="text-sm text-yellow-400">How good does this deal feel?</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setUserChoice(rating)}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${userChoice === rating
                        ? 'border-yellow-400 bg-yellow-400 text-black'
                        : 'border-gray-600 text-gray-400 hover:border-yellow-400'
                      }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              {userChoice && (
                <p className="text-xs text-green-400">
                  The anchor of $199 made $149 feel like a great deal!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-gray-600 hover:border-yellow-400"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

// Scarcity Principle Demo Component
function ScarcityPrincipleDemo({ isPlaying }: InteractiveComponentProps) {
  const [itemsLeft, setItemsLeft] = useState(50);
  const [urgencyLevel, setUrgencyLevel] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setItemsLeft(prev => {
          const newCount = Math.max(0, prev - Math.floor(Math.random() * 3) - 1);
          if (newCount <= 10) setUrgencyLevel(2);
          else if (newCount <= 25) setUrgencyLevel(1);
          return newCount;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 2: return 'text-red-400 animate-pulse';
      case 1: return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Scarcity Principle</h3>
        <p className="text-sm text-gray-400">Watch urgency increase as stock decreases</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center space-y-4">
        <div className="text-3xl font-bold text-white">Premium Course</div>
        <div className="text-xl font-semibold text-gray-300">$99</div>

        <div className={`text-lg font-medium ${getUrgencyColor()}`}>
          {itemsLeft > 0 ? `Only ${itemsLeft} spots left!` : 'SOLD OUT'}
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${urgencyLevel === 2 ? 'bg-red-500' :
                urgencyLevel === 1 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            style={{ width: `${(itemsLeft / 50) * 100}%` }}
          />
        </div>

        <Button
          className={`w-full transition-all duration-300 ${itemsLeft === 0 ? 'bg-gray-600 cursor-not-allowed' :
              urgencyLevel === 2 ? 'bg-red-500 hover:bg-red-600 animate-pulse' :
                urgencyLevel === 1 ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-green-500 hover:bg-green-600'
            }`}
          disabled={itemsLeft === 0}
        >
          {itemsLeft === 0 ? 'Sold Out' : 'Enroll Now'}
        </Button>
      </div>
    </div>
  );
}

// Social Proof Demo Component
function SocialProofDemo({ isPlaying }: InteractiveComponentProps) {
  const [userCount, setUserCount] = useState(1247);
  const [recentSignups, setRecentSignups] = useState<string[]>([]);

  const sampleNames = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Kate'];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setUserCount(prev => prev + Math.floor(Math.random() * 3) + 1);

        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        setRecentSignups(prev => {
          const newSignups = [`${randomName} just joined`, ...prev.slice(0, 2)];
          return newSignups;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Social Proof</h3>
        <p className="text-sm text-gray-400">See how user activity influences decisions</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">Join Our Community</div>
          <div className="text-lg text-green-400 font-semibold">
            {userCount.toLocaleString()} developers already joined
          </div>
        </div>

        <div className="space-y-2">
          {recentSignups.map((signup, index) => (
            <div
              key={`${signup}-${index}`}
              className="text-sm text-gray-400 bg-gray-700 rounded px-3 py-2 animate-fade-in"
            >
              🎉 {signup}
            </div>
          ))}
        </div>

        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
          Join {userCount.toLocaleString()}+ Developers
        </Button>
      </div>
    </div>
  );
}

// Color Psychology Demo Component
function ColorPsychologyDemo({ isPlaying }: InteractiveComponentProps) {
  const [currentColor, setCurrentColor] = useState(0);

  const colorSchemes = [
    { name: 'Trust (Blue)', bg: 'bg-blue-600', text: 'Professional & Trustworthy' },
    { name: 'Urgency (Red)', bg: 'bg-red-600', text: 'Urgent & Action-Oriented' },
    { name: 'Success (Green)', bg: 'bg-green-600', text: 'Safe & Successful' },
    { name: 'Premium (Purple)', bg: 'bg-purple-600', text: 'Luxury & Premium' },
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentColor(prev => (prev + 1) % colorSchemes.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Color Psychology</h3>
        <p className="text-sm text-gray-400">See how colors affect perception</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-white">Premium Software</div>
          <div className="text-lg text-gray-300">$49/month</div>

          <Button
            className={`w-full transition-all duration-500 ${colorSchemes[currentColor].bg} hover:opacity-90`}
          >
            Get Started Now
          </Button>

          <div className="text-sm text-gray-400">
            <div className="font-medium text-yellow-400">{colorSchemes[currentColor].name}</div>
            <div>{colorSchemes[currentColor].text}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pricing Strategy Demo Component
function PricingStrategyDemo({ isPlaying }: InteractiveComponentProps) {
  const [currentStrategy, setCurrentStrategy] = useState(0);

  const strategies = [
    {
      name: 'Basic Pricing',
      plans: [
        { name: 'Basic', price: 10, features: ['Feature A', 'Feature B'] },
        { name: 'Pro', price: 20, features: ['Feature A', 'Feature B', 'Feature C'] },
      ]
    },
    {
      name: 'Decoy Effect',
      plans: [
        { name: 'Basic', price: 10, features: ['Feature A', 'Feature B'] },
        { name: 'Pro', price: 25, features: ['Feature A', 'Feature B', 'Feature C'] },
        { name: 'Premium', price: 30, features: ['Feature A', 'Feature B', 'Feature C', 'Feature D'] },
      ]
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStrategy(prev => (prev + 1) % strategies.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="w-full max-w-lg mx-auto p-6 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pricing Strategy</h3>
        <p className="text-sm text-gray-400">{strategies[currentStrategy].name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies[currentStrategy].plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`bg-gray-800 rounded-lg p-4 border transition-all duration-500 ${index === 1 ? 'border-yellow-400 scale-105' : 'border-gray-700'
              }`}
          >
            <div className="text-center space-y-3">
              <div className="font-semibold text-white">{plan.name}</div>
              <div className="text-2xl font-bold text-yellow-400">${plan.price}</div>
              <div className="space-y-1">
                {plan.features.map(feature => (
                  <div key={feature} className="text-sm text-gray-400">✓ {feature}</div>
                ))}
              </div>
              <Button
                size="sm"
                className={index === 1 ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-700 hover:bg-gray-600'}
              >
                Choose Plan
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dynamic Component Loader
export default function DynamicComponentLoader({
  componentName,
  isPlaying,
  onTogglePlay,
  props = {}
}: DynamicComponentLoaderProps) {
  const [error, setError] = useState<string | null>(null);

  const Component = useMemo(() => {
    try {
      const comp = COMPONENT_REGISTRY[componentName];
      if (!comp) {
        setError(`Component "${componentName}" not found`);
        return null;
      }
      setError(null);
      return comp;
    } catch (err) {
      setError(`Failed to load component: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [componentName]);

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-medium mb-2">Component Error</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center">
        <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading component...</p>
      </div>
    );
  }

  return (
    <Component
      isPlaying={isPlaying}
      onTogglePlay={onTogglePlay}
      {...props}
    />
  );
}

// Export the component registry for external use
export { COMPONENT_REGISTRY };
