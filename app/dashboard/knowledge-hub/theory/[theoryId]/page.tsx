'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bookmark, Clock, ExternalLink, Lightbulb, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// Mock data for individual theory - this will be replaced with actual data loading in future tasks
const mockTheoryData = {
  'anchoring-bias': {
    id: 'anchoring-bias',
    title: 'Anchoring Bias',
    category: 'cognitive-biases',
    categoryName: 'Cognitive Biases',
    summary: 'The tendency to rely heavily on the first piece of information encountered when making decisions.',
    difficulty: 'beginner',
    readTime: 3,
    relevance: ['marketing', 'ux'],
    isBookmarked: false,
    isPremium: false,
    content: {
      description: `Anchoring bias is a cognitive bias that describes the common human tendency to rely too heavily on the first piece of information offered (the "anchor") when making decisions. During decision making, anchoring occurs when individuals use an initial piece of information to make subsequent judgments.

Once an anchor is set, other judgments are made by adjusting away from that anchor, and there is a bias toward interpreting other information around the anchor. This bias occurs even when the anchor is completely irrelevant to the decision at hand.

The anchoring effect has been demonstrated in numerous studies and is considered one of the most robust cognitive biases. It affects professionals and experts just as much as it affects everyday decision-making.`,
      visualDiagram: '/images/theories/anchoring-bias-diagram.svg',
      applicationGuide: `## How to Apply Anchoring Bias in Build24 Projects

### 1. Pricing Strategy
- **Set High Initial Prices**: Start with premium pricing to anchor users' expectations, then offer "discounted" rates
- **Tiered Pricing**: Place your target tier in the middle, with a higher-priced option to anchor expectations
- **Free Trial Value**: Emphasize the full price value of what users get during free trials

### 2. Feature Presentation
- **Lead with Premium Features**: Show the most impressive capabilities first to set high expectations
- **Comparison Tables**: Place your product against higher-priced competitors to anchor value perception
- **Progress Indicators**: Start progress bars or completion percentages from a meaningful baseline

### 3. User Onboarding
- **Set Expectations Early**: Introduce users to the most powerful features first
- **Time Estimates**: Provide realistic time estimates for tasks, anchoring user expectations
- **Success Metrics**: Share impressive user success stories early in the onboarding process

### 4. Landing Page Optimization
- **Hero Section**: Lead with your strongest value proposition or most impressive metric
- **Social Proof**: Display your highest user counts, revenue figures, or satisfaction scores prominently
- **Feature Lists**: Start with your most compelling features to anchor the user's perception of value`,
      examples: [
        {
          id: 'pricing-example',
          type: 'before-after',
          title: 'SaaS Pricing Page Optimization',
          description: 'How anchoring bias can improve pricing page conversions',
          beforeImage: '/images/examples/pricing-before.png',
          afterImage: '/images/examples/pricing-after.png'
        }
      ],
      relatedContent: [
        {
          type: 'theory',
          title: 'Scarcity Principle',
          href: '/dashboard/knowledge-hub/theory/scarcity-principle'
        },
        {
          type: 'blog',
          title: 'Psychology of Pricing for Indie Makers',
          href: '/blog/psychology-of-pricing'
        }
      ]
    },
    tags: ['pricing', 'decision-making', 'first-impression'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
};

export default function TheoryPage() {
  const params = useParams();
  const theoryId = params?.theoryId as string;
  const [isBookmarked, setIsBookmarked] = useState(false);

  // In a real implementation, this would fetch data based on theoryId
  const theory = mockTheoryData[theoryId as keyof typeof mockTheoryData];

  if (!theory) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Theory Not Found</h1>
        <p className="text-gray-400 mb-6">The requested theory does not exist or has been moved.</p>
        <Button asChild>
          <Link href="/dashboard/knowledge-hub">
            Back to Knowledge Hub
          </Link>
        </Button>
      </div>
    );
  }

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // In a real implementation, this would update the user's bookmarks in the database
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-400 hover:text-white"
        >
          <Link href={`/dashboard/knowledge-hub/category/${theory.category}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {theory.categoryName}
          </Link>
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className={`${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>

          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Theory Header */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`${theory.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                  theory.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                }`}
            >
              {theory.difficulty}
            </Badge>
            {theory.isPremium && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">
                Premium
              </Badge>
            )}
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{theory.readTime} min read</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold">{theory.title}</h1>

          <p className="text-xl text-gray-400 leading-relaxed">
            {theory.summary}
          </p>

          <div className="flex space-x-2">
            {theory.relevance.map((tag) => (
              <Badge key={tag} variant="outline" className="border-gray-700 text-gray-400">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Theory Description */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Understanding the Theory</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {theory.content.description}
              </div>
            </CardContent>
          </Card>

          {/* Visual Diagram */}
          {theory.content.visualDiagram && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Visual Representation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Lightbulb className="w-12 h-12 mx-auto mb-2" />
                    Visual diagram will be displayed here
                  </div>
                  <p className="text-sm text-gray-500">
                    Interactive diagram showing {theory.title} in action
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Guide */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-yellow-400">How to Apply in Build24</CardTitle>
              <CardDescription>
                Practical ways to implement this theory in your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {theory.content.applicationGuide}
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          {theory.content.examples.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Interactive Examples</CardTitle>
                <CardDescription>
                  See this theory in action with real-world examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                {theory.content.examples.map((example) => (
                  <div key={example.id} className="space-y-4">
                    <h4 className="font-semibold text-yellow-400">{example.title}</h4>
                    <p className="text-gray-400 text-sm">{example.description}</p>
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                      <div className="text-gray-400 mb-4">
                        <ExternalLink className="w-8 h-8 mx-auto mb-2" />
                        Interactive example will be displayed here
                      </div>
                      <p className="text-sm text-gray-500">
                        Before/After comparison showing the impact of {theory.title}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Category</p>
                <Link
                  href={`/dashboard/knowledge-hub/category/${theory.category}`}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {theory.categoryName}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Difficulty</p>
                <p className="capitalize">{theory.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Read Time</p>
                <p>{theory.readTime} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Best For</p>
                <div className="flex flex-wrap gap-1">
                  {theory.relevance.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Content */}
          {theory.content.relatedContent.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Related Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {theory.content.relatedContent.map((item, index) => (
                  <div key={index}>
                    <Link
                      href={item.href}
                      className="block p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {theory.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-gray-700 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
